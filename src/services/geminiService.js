// ============================================================================
// GEMINI AI SERVICE
//
// HOTFIX 6.1: Auto-detect model terbaik dari endpoint /models setiap kali
// user verifikasi API key. Tidak ada lagi hardcoded model name yang bisa
// jadi obsolete (404 error pada gemini-1.5-flash-latest yang sudah dideprekasi).
//
// User membawa kunci sendiri (BYOK).
// Endpoint dokumentasi: https://ai.google.dev/gemini-api/docs
// ============================================================================

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

// Fallback model — dipakai HANYA jika /models endpoint gagal di-query
// (sangat jarang). Pilih yang paling stabil & ringan.
const FALLBACK_MODEL = "gemini-1.5-flash";

export function validateGeminiKeyFormat(key) {
  if (!key || typeof key !== "string" || key.trim().length === 0) {
    return { ok: false, msg: "API key tidak boleh kosong." };
  }
  return { ok: true, msg: "Siap diuji koneksi." };
}

/**
 * Skor preferensi model untuk auto-pick.
 * Lebih tinggi = lebih disukai.
 *
 * Strategi:
 *   - Prefer "flash" (gratis & cepat) di atas "pro" (berbayar di sebagian besar tier)
 *   - Prefer versi 2.x > 1.5
 *   - Hindari "-exp" (experimental, suka mati mendadak)
 *   - Hindari "-latest" (alias yang sering 404 saat Google rotasi versi)
 *   - Hindari "lite" hanya kalau tidak ada alternatif
 *   - Pastikan support generateContent (filter dulu di luar fn ini)
 */
function scoreModel(modelName) {
  const n = modelName.toLowerCase();
  let s = 0;

  // Tipe
  if (n.includes("flash-lite")) s += 80;
  else if (n.includes("flash")) s += 100;
  else if (n.includes("pro")) s += 40;

  // Versi
  if (n.match(/2[.-]5/)) s += 35;
  else if (n.match(/2[.-]0/)) s += 25;
  else if (n.match(/1[.-]5/)) s += 15;

  // Penalti untuk variant yang riskan
  if (n.includes("-exp")) s -= 8;
  if (n.endsWith("-latest")) s -= 6;          // sering 404
  if (n.includes("preview")) s -= 4;
  if (n.includes("vision")) s -= 20;          // bukan untuk teks
  if (n.includes("embedding")) s = -100;      // bukan generation
  if (n.includes("aqa")) s = -100;            // question-answering only

  return s;
}

/**
 * Query /models endpoint dan pick model terbaik untuk text generation.
 * Return string nama model (tanpa prefix "models/").
 *
 * @returns {Promise<{ok: boolean, model?: string, allModels?: string[], error?: string}>}
 */
export async function pickBestModel(key) {
  try {
    const res = await fetch(
      `${GEMINI_BASE}/models?key=${encodeURIComponent(key.trim())}`
    );
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status} saat list model.` };
    }
    const data = await res.json();
    const models = Array.isArray(data?.models) ? data.models : [];

    // Filter: hanya yang support generateContent
    const usable = models.filter((m) =>
      (m.supportedGenerationMethods || []).includes("generateContent")
    );

    if (usable.length === 0) {
      return { ok: false, error: "Tidak ada model yang mendukung generateContent untuk key ini." };
    }

    // Sort by score (desc), tie-break by name length asc (prefer shorter)
    usable.sort((a, b) => {
      const sa = scoreModel(a.name);
      const sb = scoreModel(b.name);
      if (sb !== sa) return sb - sa;
      return a.name.length - b.name.length;
    });

    const best = usable[0].name.replace(/^models\//, "");
    return {
      ok: true,
      model: best,
      allModels: usable.map((m) => m.name.replace(/^models\//, "")),
    };
  } catch (err) {
    return { ok: false, error: `Gagal koneksi: ${err.message}` };
  }
}

/**
 * Verifikasi API key + sekaligus pick model terbaik.
 * Dipanggil saat user klik "Cek API Key".
 *
 * Return:
 *   { ok: true, msg, model: "gemini-2.0-flash" }
 *   { ok: false, msg }
 */
export async function testGeminiKey(key) {
  const fmt = validateGeminiKeyFormat(key);
  if (!fmt.ok) return fmt;

  // Pakai pickBestModel sekalian — kalau key invalid, akan ketahuan di sini
  try {
    const res = await fetch(
      `${GEMINI_BASE}/models?key=${encodeURIComponent(key.trim())}`
    );
    if (res.status === 400 || res.status === 403) {
      return {
        ok: false,
        msg: "API key ditolak Google (key tidak valid atau dinonaktifkan).",
      };
    }
    if (res.status === 429) {
      return {
        ok: false,
        msg: "Kuota harian habis. Coba lagi nanti atau pakai key BERBAYAR.",
      };
    }
    if (!res.ok) {
      return {
        ok: false,
        msg: `Gagal terhubung (HTTP ${res.status}). Cek koneksi internet.`,
      };
    }

    // OK, key valid. Sekarang pick best model
    const pick = await pickBestModel(key);
    if (!pick.ok) {
      return {
        ok: false,
        msg: pick.error || "Tidak bisa memilih model. Coba lagi nanti.",
      };
    }

    return {
      ok: true,
      msg: `Berhasil terhubung. Model aktif: ${pick.model}`,
      model: pick.model,
      allModels: pick.allModels,
    };
  } catch (err) {
    return { ok: false, msg: `Error jaringan: ${err.message}` };
  }
}

export const GEMINI_LINKS = {
  freeKey: "https://aistudio.google.com/app/apikey",
  paidBilling: "https://console.cloud.google.com/billing",
};

/**
 * Generate konten singkat AI untuk autofill field tertentu.
 * HOTFIX 6.1: terima `model` param eksplisit — di-resolve dari state.gateway.gemini.model
 *
 * @param {string} key - API key user
 * @param {string} prompt - Prompt singkat
 * @param {string} model - Nama model (mis. "gemini-2.0-flash"). Fallback ke FALLBACK_MODEL.
 * @param {object} opts - { maxTokens, temperature }
 */
export async function aiAutofill(key, prompt, model, opts = {}) {
  const fmt = validateGeminiKeyFormat(key);
  if (!fmt.ok) return { ok: false, error: fmt.msg };

  const activeModel = model || FALLBACK_MODEL;
  const url = `${GEMINI_BASE}/models/${activeModel}:generateContent?key=${encodeURIComponent(key.trim())}`;
  const generationConfig = {
    temperature: opts.temperature ?? 0.7,
    // v13.2: 2048 → 4096 default. Model Gemini 2.5 menghabiskan kuota output
    // untuk "thinking" sehingga teks terlihat TERPOTONG pendek (akar bug
    // Ringkasan Eksekutif terpotong) — matikan thinking untuk autofill.
    maxOutputTokens: opts.maxTokens ?? 4096,
  };
  // v13.3: mode JSON — Gemini dipaksa mengembalikan JSON murni (tanpa teks
  // pembuka/penutup) untuk tombol "Isi Semua Risiko" & rekomendasi investasi.
  if (opts.json) {
    generationConfig.responseMimeType = "application/json";
  }
  if (/2\.5/.test(activeModel)) {
    generationConfig.thinkingConfig = { thinkingBudget: 0 };
  }
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig,
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.status === 400 && generationConfig.thinkingConfig) {
      // Model tidak mendukung thinkingConfig → ulangi tanpa field itu
      delete generationConfig.thinkingConfig;
      const retry = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig }),
      });
      if (retry.ok) {
        const dataR = await retry.json();
        const candR = dataR?.candidates?.[0];
        const textR = (candR?.content?.parts || []).map((pt) => pt?.text || "").join("");
        return { ok: true, text: textR.trim().replace(/^["']|["']$/g, "").trim(), truncated: candR?.finishReason === "MAX_TOKENS" };
      }
    }
    if (!res.ok) {
      const errText = await res.text();
      if (res.status === 404) {
        return {
          ok: false,
          error: `Model "${activeModel}" tidak tersedia. Cek ulang API key — sistem akan auto-pilih model baru.`,
        };
      }
      if (res.status === 429) {
        return { ok: false, error: "Kuota AI hari ini habis. Coba lagi besok atau gunakan key BERBAYAR." };
      }
      if (res.status === 403) {
        return { ok: false, error: "API key tidak valid lagi. Cek di Setting." };
      }
      return { ok: false, error: `HTTP ${res.status}: ${errText.slice(0, 120)}` };
    }
    const data = await res.json();
    const candidate = data?.candidates?.[0];
    // v13.3: respons Gemini bisa terpecah jadi BEBERAPA parts — versi lama
    // hanya membaca parts[0] sehingga teks/JSON terpotong (akar error tombol
    // "Isi Semua 5 Risiko dengan AI" dan Ringkasan Eksekutif terpotong).
    const text = (candidate?.content?.parts || []).map((pt) => pt?.text || "").join("");
    const finishReason = candidate?.finishReason;
    // Hotfix 11.1: detect truncation
    if (finishReason === "MAX_TOKENS" && text.length < 100) {
      return { ok: false, error: "Respons AI terpotong di awal — coba prompt lebih singkat." };
    }
    const cleaned = text.trim().replace(/^["']|["']$/g, "").trim();
    return { ok: true, text: cleaned, truncated: finishReason === "MAX_TOKENS" };
  } catch (err) {
    return { ok: false, error: `Error jaringan: ${err.message}` };
  }
}

/**
 * Generate Bab 1 (Ringkasan Eksekutif) — untuk Tahap 9.
 * Wrapper di atas aiAutofill dengan max token lebih besar.
 */
export async function generateExecutiveSummary(key, contextBlock, model) {
  const prompt = `Anda adalah konsultan UMKM Indonesia. Tulis Ringkasan Eksekutif untuk Studi Kelayakan Bisnis ini dalam 4-6 paragraf Bahasa Indonesia formal-natural berdasarkan data berikut:

${contextBlock}

Aturan:
- Tulis SATU narasi mengalir (bukan bullet/poin).
- 4-6 paragraf, masing-masing 4-6 kalimat substansial.
- Sebut nama bisnis di paragraf pertama dan penutup.
- Sintesakan: identitas, pasar, kelayakan keuangan, kelayakan 5 aspek, rekomendasi.
- Bahasa formal namun lugas, hindari klise korporat ("dengan demikian", "perlu dicatat", dll).
- WAJIB memakai angka PERSIS seperti tertulis di data konteks (pendapatan, laba, BEP, NPV, IRR) — dilarang membulatkan ke angka lain atau mengarang angka sendiri, supaya narasi tidak bertentangan dengan tabel keuangan di laporan.
- Output HANYA naskahnya — TANPA judul, TANPA baris "Bab 1: ..." atau "Ringkasan Eksekutif", langsung paragraf pertama.`;

  return aiAutofill(key, prompt, model, { maxTokens: 6000, temperature: 0.6 });
}

/**
 * Generate narasi lengkap untuk Bab 2-8 dalam SATU panggilan (Hotfix 11.1).
 * Hemat kuota dengan menggabungkan semua bab + sintesis flow antar-bab.
 *
 * @returns Promise<{ok, narrations?: {bab2, bab3, bab5, bab6, bab7, bab8}, error?}>
 */
export async function generateMultiBabNarration(key, contextBlock, model) {
  const prompt = `Anda adalah konsultan UMKM Indonesia senior yang menulis Studi Kelayakan Bisnis profesional. Tulis NARASI untuk BAB 2 hingga BAB 8 dokumen SKB berdasarkan data berikut:

${contextBlock}

ATURAN PENULISAN:
- Setiap bab: 3-5 paragraf, masing-masing 4-7 kalimat substansial.
- Bahasa Indonesia formal namun mengalir lugas, hindari klise korporat.
- Sintesis: tiap bab harus terhubung — pasar (Bab 2) → strategi (Bab 3) → tim (Bab 5) → keuangan (Bab 6) → modal (Bab 7) → kelayakan (Bab 8).
- Sebut nama bisnis secara konsisten.
- Gunakan angka spesifik dari data (revenue, NPV, IRR, skor) untuk credibility.
- Hindari pengulangan kalimat antar-bab.
- DILARANG menulis judul/heading di dalam nilai JSON (jangan awali dengan "Bab 2: ..." dsb) — judul sudah dirender sistem; langsung kalimat pertama paragraf.
- WAJIB memakai angka PERSIS seperti tertulis di data konteks — dilarang membulatkan ke angka lain, supaya narasi tidak bertentangan dengan tabel keuangan.

OUTPUT: HARUS dalam format JSON berikut (tanpa markdown code fence, tanpa pengantar):
{
  "bab2": "narasi 3-5 paragraf untuk Bab 2 Analisis Peluang Bisnis...",
  "bab3": "narasi 3-5 paragraf untuk Bab 3 Strategi Eksekusi...",
  "bab5": "narasi 3-5 paragraf untuk Bab 5 Profil Tim & Perusahaan...",
  "bab6": "narasi 3-5 paragraf untuk Bab 6 Rencana Keuangan...",
  "bab7": "narasi 3-5 paragraf untuk Bab 7 Kebutuhan Pendanaan & Modal...",
  "bab8": "narasi 3-5 paragraf untuk Bab 8 Pro Forma & Indikator Kelayakan..."
}

Output HANYA JSON object, tanpa kata lain.`;

  const result = await aiAutofill(key, prompt, model, { maxTokens: 16000, temperature: 0.65 });
  if (!result.ok) return result;

  try {
    // Bersihkan markdown fence kalau ada
    const cleaned = result.text.replace(/```json\s*|\s*```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (typeof parsed !== "object" || !parsed.bab2) {
      throw new Error("Format JSON tidak sesuai");
    }
    return { ok: true, narrations: parsed };
  } catch (err) {
    return { ok: false, error: "AI mengembalikan format yang tidak bisa di-parse: " + err.message };
  }
}
