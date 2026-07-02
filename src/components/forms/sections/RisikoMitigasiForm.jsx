import { useState } from "react";
import { useFormSection } from "../../../state/useFormSection.js";
import { useApp } from "../../../state/AppContext.jsx";
import Section from "../Section.jsx";
import Field from "../Field.jsx";
import AiAutofillButton from "../AiAutofillButton.jsx";
import { aiAutofill } from "../../../services/geminiService.js";
import { buildBusinessContext } from "../../../engines/suggestionHelper.js";
import { COLORS } from "../../primitives/styles.js";

// ============================================================================
// <RisikoMitigasiForm /> — Formulir Studi Kelayakan ▸ Analisis & Mitigasi Risiko
//
// Dipindahkan dari Parameter Pendanaan (v13.1). Storage tetap di
// forms.fundingTarget.risikoMitigasi supaya laporan (Bab 6.6) tidak berubah.
// Tambahan: AI autofill per-risiko + "Isi Semua dengan AI" sekaligus.
// ============================================================================

const RISK_FIELDS = [
  { key: "pasar", label: "Risiko Pasar", icon: "📉",
    hint: "Permintaan turun, kompetitor agresif, perubahan tren konsumen.",
    placeholder: "cth. Risiko: kompetitor besar buka di radius 500m. Mitigasi: fokus keunggulan unik yang tidak mereka tawarkan + program loyalitas pelanggan." },
  { key: "operasional", label: "Risiko Operasional", icon: "⚙️",
    hint: "Supplier bermasalah, kualitas tidak konsisten, alat rusak.",
    placeholder: "cth. Risiko: supplier utama telat kirim. Mitigasi: kontrak 2 supplier cadangan + stok buffer 2 minggu." },
  { key: "keuangan", label: "Risiko Keuangan", icon: "💸",
    hint: "Arus kas meleset dari proyeksi, cicilan terasa berat.",
    placeholder: "cth. Risiko: omset 3 bulan pertama di bawah titik impas. Mitigasi: cadangan kas opex 3 bulan + opsi renegosiasi tenor." },
  { key: "sdm", label: "Risiko SDM", icon: "👥",
    hint: "Karyawan kunci resign, kualitas kerja tidak konsisten.",
    placeholder: "cth. Risiko: staf terlatih pindah kerja. Mitigasi: SOP terdokumentasi + pelatihan berkala + insentif kinerja." },
  { key: "regulasi", label: "Risiko Regulasi", icon: "📋",
    hint: "Perubahan pajak, persyaratan halal/izin, aturan daerah.",
    placeholder: "cth. Risiko: perubahan tarif pajak UMKM. Mitigasi: konsultasi pajak rutin + pemantauan regulasi tiap triwulan." },
];

export default function RisikoMitigasiForm({ stage = "baru" }) {
  const [f, setField] = useFormSection("fundingTarget");
  const { state } = useApp();
  const rm = f.risikoMitigasi || {};
  const filled = RISK_FIELDS.filter((r) => (rm[r.key] || "").trim()).length;

  const setRisk = (key, v) => setField("risikoMitigasi", { ...rm, [key]: v });

  return (
    <Section
      icon="⚠"
      title="Analisis & Mitigasi Risiko"
      desc={`Bank/investor ingin yakin Anda sudah memikirkan: kalau hal buruk terjadi, bagaimana bisnis bertahan? Isi minimal 3 dari 5 kategori — saat ini terisi ${filled}/5. Hasilnya tampil di Bab 6.6 laporan.`}
    >
      <FillAllAiButton forms={state.forms} stage={stage} apiKey={state.gateway?.gemini?.key} model={state.gateway?.gemini?.model} onResult={(obj) => setField("risikoMitigasi", { ...rm, ...obj })} />

      {RISK_FIELDS.map((r) => (
        <Field key={r.key} label={`${r.icon} ${r.label}`} hint={r.hint}>
          <textarea
            value={rm[r.key] || ""}
            onChange={(e) => setRisk(r.key, e.target.value)}
            placeholder={r.placeholder}
            rows={2}
            style={taStyle}
          />
          <AiAutofillButton
            inline
            label={`🪄 Bantu AI Tuliskan ${r.label}`}
            buildPrompt={() => buildRiskPrompt(state.forms, stage, r)}
            onResult={(text) => setRisk(r.key, text.trim())}
          />
        </Field>
      ))}
    </Section>
  );
}

// v13.3: definisi tegas per kategori — tanpa ini AI kerap menulis "gagal
// mendapatkan pendanaan" di kategori Operasional DAN Keuangan sekaligus
// (temuan reviewer: deskripsi risiko tertukar/duplikat antar kategori).
const RISK_DEFINITIONS = {
  pasar: "risiko dari SISI PASAR: permintaan turun, perubahan tren konsumen, kompetitor baru/agresif, perang harga",
  operasional: "risiko INTERNAL OPERASIONAL sehari-hari: kerusakan mesin/peralatan utama, gangguan pasokan bahan baku dari supplier, kualitas produk tidak konsisten, jam operasional terganggu. JANGAN menulis soal pendanaan/modal — itu bukan kategori ini",
  keuangan: "risiko ARUS KAS SAAT BISNIS SUDAH BERJALAN: omset beberapa bulan di bawah titik impas, kenaikan harga bahan baku menggerus margin, beban cicilan terasa berat saat low season. JANGAN menulis soal gagal mendapatkan pendanaan awal — pendanaan dibahas di bab lain",
  sdm: "risiko TENAGA KERJA: karyawan kunci resign, sulit merekrut, kualitas kerja tidak konsisten, ketergantungan pada satu orang",
  regulasi: "risiko ATURAN/PEMERINTAH: perubahan pajak UMKM, persyaratan izin/halal/laik higiene, aturan daerah soal lokasi usaha",
};

// v13.4: bangun blok konteks bisnis EKSPLISIT. Bug sebelumnya:
// `${buildBusinessContext(forms)}` menyisipkan objek → menjadi string
// "[object Object]", sehingga AI tidak pernah tahu sektor user dan jatuh ke
// contoh generik/warung kopi. Sekarang sektor, produk, skala, lokasi
// dirangkai jadi teks yang benar-benar dibaca model.
function riskContextBlock(forms) {
  const ctx = buildBusinessContext(forms);
  return `PROFIL BISNIS (WAJIB jadi acuan, jangan pakai contoh bisnis lain):
- Nama: ${ctx.namaBisnis}
- Sektor usaha: ${ctx.sektor}
- Produk/jasa utama: ${ctx.produkUtama}
- Skala: ${ctx.skala}
- Lokasi: ${ctx.lokasi}
Ringkasan: ${ctx.summary}`;
}

function buildRiskPrompt(forms, stage, risk) {
  const ctx = buildBusinessContext(forms);
  return `Anda konsultan studi kelayakan UMKM Indonesia.
${riskContextBlock(forms)}
Jenis bisnis: ${stage === "lanjutan" ? "bisnis berjalan yang mencari dana pengembangan" : "bisnis baru yang mencari pendanaan"}.

Definisi kategori: ${risk.label} = ${RISK_DEFINITIONS[risk.key]}.

Tuliskan SATU ${risk.label.toLowerCase()} yang BENAR-BENAR khas sektor "${ctx.sektor}" (bukan sektor lain, bukan warung kopi/F&B kecuali memang sektornya itu) BESERTA mitigasinya, dalam format persis: "Risiko: [risiko spesifik sektor ini]. Mitigasi: [langkah konkret & realistis]." Maksimal 2 kalimat, bahasa lugas tanpa jargon, langsung jawabannya saja tanpa pembuka.`;
}

// ----------------------------------------------------------------------------
function FillAllAiButton({ forms, stage, apiKey, model, onResult }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const run = async () => {
    if (!apiKey) { setErr("API key Gemini belum di-setup."); return; }
    setBusy(true); setErr(null);
    try {
      const ctx = buildBusinessContext(forms);
      const prompt = `Anda konsultan studi kelayakan UMKM Indonesia.
${riskContextBlock(forms)}
Jenis bisnis: ${stage === "lanjutan" ? "bisnis berjalan yang mencari dana pengembangan" : "bisnis baru yang mencari pendanaan"}.

Susun analisis 5 kategori risiko untuk proposal pendanaan, SEMUA khas sektor "${ctx.sektor}" (jangan memakai contoh dari sektor lain). Definisi WAJIB tiap kategori:
- pasar: ${RISK_DEFINITIONS.pasar}
- operasional: ${RISK_DEFINITIONS.operasional}
- keuangan: ${RISK_DEFINITIONS.keuangan}
- sdm: ${RISK_DEFINITIONS.sdm}
- regulasi: ${RISK_DEFINITIONS.regulasi}

Untuk SETIAP kategori tuliskan 1-2 kalimat format "Risiko: ... Mitigasi: ..." yang spesifik untuk sektor & bisnis ini. Kelima risiko harus BERBEDA satu sama lain — dilarang mengulang tema yang sama di dua kategori.

JAWAB HANYA JSON VALID tanpa teks lain:
{"pasar":"...","operasional":"...","keuangan":"...","sdm":"...","regulasi":"..."}`;
      const result = await aiAutofill(apiKey, prompt, model, { json: true, maxTokens: 4096, temperature: 0.6 });
      if (!result.ok || !result.text) throw new Error(result.error || "AI tidak merespons.");
      const raw = result.text.replace(/```json|```/g, "").trim();
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start === -1 || end === -1) throw new Error("AI tidak mengembalikan JSON. Coba sekali lagi.");
      const obj = JSON.parse(raw.slice(start, end + 1));
      const clean = {};
      for (const k of ["pasar", "operasional", "keuangan", "sdm", "regulasi"]) {
        if (typeof obj[k] === "string" && obj[k].trim()) clean[k] = obj[k].trim();
      }
      if (Object.keys(clean).length === 0) throw new Error("AI tidak mengembalikan format valid.");
      onResult(clean);
    } catch (e) {
      setErr(`Gagal: ${e.message}`);
    }
    setBusy(false);
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <button type="button" onClick={run} disabled={busy} style={{
        padding: "9px 14px", background: COLORS.accentBg, border: `1px solid ${COLORS.accent}`,
        borderRadius: 7, fontSize: 12, fontWeight: 700, color: COLORS.accent,
        cursor: busy ? "wait" : "pointer",
      }}>
        {busy ? "⏳ AI sedang menyusun 5 risiko..." : "🪄 Isi Semua 5 Risiko dengan AI (Sesuai Sektor & Bisnis Anda)"}
      </button>
      {err && <div style={{ marginTop: 6, fontSize: 11.5, color: COLORS.dangerHi }}>{err}</div>}
    </div>
  );
}

// v13.3: kolom dibuat GELAP — versi lama background putih dengan warna teks
// terang tema gelap sehingga isi field tidak terbaca.
const taStyle = {
  width: "100%", padding: "8px 10px", background: COLORS.bgPanelDeep,
  border: `1px solid ${COLORS.borderHi}`, borderRadius: 5,
  fontSize: 12, fontFamily: "inherit", color: COLORS.textHi,
  resize: "vertical", lineHeight: 1.5, outline: "none", boxSizing: "border-box",
};
