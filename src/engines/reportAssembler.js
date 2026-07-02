import { buildProForma } from "./proFormaBuilder.js";
import { buildAllNarratives } from "./narrativeEngine.js";
import { computeScoringResult, isReadyForReport } from "./scoringEngine.js";
import { getSector, SECTORS } from "../data/sectors.js";
import { getPathway } from "../data/pathways.js";
import { PROVINCES } from "../data/provinces.js";
import { KUESIONER, ASPECT_ORDER } from "../data/kuesioner.js";
import { paragraph } from "../data/narrativeTemplates.js";

// ============================================================================
// REPORT ASSEMBLER
//
// Compile semua output engine → struktur laporan 9-Bab lengkap.
// Output dipakai oleh:
//   - Tab 3 (Tahap 7) untuk render output read-only
//   - Tab 4 (Tahap 10) untuk export PDF/Word
//   - Gemini service (Tahap 9) untuk generate Bab 1 (Executive Summary)
//
// CATATAN PENTING:
// Bab 1 (Ringkasan Eksekutif) BELUM di-generate di sini — itu Tahap 9 (AI).
// Tetapi assembler menyiapkan KONTEKS yang nanti dimasukkan ke prompt AI.
// ============================================================================

export function buildBab4SKB(scoringResult) {
  // v13.1: Bab 4 bukan lagi daftar rangkuman satu baris — tiap paragraf
  // adalah sintesis yang saling terkait, menjelaskan MENGAPA bisnis ini
  // layak (atau belum) secara keseluruhan.
  const paragraphs = [];
  const a = scoringResult.aspects;
  const w = scoringResult.weights || {};

  paragraphs.push(
    "Bab ini merangkum hasil pengujian kelayakan berdasarkan 5 aspek inti Studi Kelayakan Bisnis: Pemasaran, Teknis, Manajemen, Hukum, serta Lingkungan & Sosial Ekonomi. Kelima aspek ini tidak berdiri sendiri — pasar yang kuat tidak ada artinya tanpa kemampuan teknis untuk melayaninya, kemampuan teknis butuh tim yang cakap untuk menjalankannya, dan semuanya harus berdiri di atas fondasi legal yang aman serta penerimaan lingkungan sekitar. Penilaian memakai bobot yang mencerminkan cara bank dan investor menilai pengajuan dana" +
    (w.pemasaran ? `: Pemasaran ${Math.round(w.pemasaran * 100)}%, Teknis ${Math.round((w.teknis || 0) * 100)}%, Manajemen ${Math.round((w.manajemen || 0) * 100)}%, Hukum ${Math.round((w.hukum || 0) * 100)}%, dan Lingkungan ${Math.round((w.lingkungan || 0) * 100)}%.` : ".")
  );

  for (const code of ASPECT_ORDER) {
    if (a[code]?.narasi) paragraphs.push(a[code].narasi);
  }

  // SINTESIS ANTAR-ASPEK: bagaimana kekuatan satu aspek menopang aspek lain
  if (scoringResult.totalScore > 0) {
    const layakList = ASPECT_ORDER.filter((c) => a[c].verdict === "layak").map((c) => a[c].meta.name);
    const lemahList = ASPECT_ORDER.filter((c) => a[c].verdict !== "layak").map((c) => a[c].meta.name);
    let sintesis = "Membaca kelima aspek secara bersama-sama, gambaran kelayakan bisnis ini menjadi lebih jelas. ";
    if (lemahList.length === 0) {
      sintesis += `Seluruh aspek sudah berstatus LAYAK dan saling menguatkan: pemahaman pasar (${a.pemasaran.score}%) memberi arah yang jelas bagi kesiapan teknis (${a.teknis.score}%), tim dan tata kelola (${a.manajemen.score}%) memastikan rencana itu benar-benar dieksekusi, sementara fondasi hukum (${a.hukum.score}%) dan penerimaan lingkungan (${a.lingkungan.score}%) menjaga bisnis dari risiko yang bisa menghentikan operasional. Rantai kelayakan ini utuh dari hulu ke hilir — tidak ada mata rantai lemah yang membuat pendana ragu.`;
    } else if (layakList.length >= 3) {
      sintesis += `Kekuatan utama ada pada ${layakList.join(", ")} yang sudah LAYAK dan menjadi tulang punggung proposal ini. Adapun ${lemahList.join(" dan ")} masih perlu dikejar — bukan sebagai penghalang, melainkan sebagai pekerjaan rumah yang jelas batasnya. Selama aspek yang kuat dipertahankan dan aspek yang tertinggal diperbaiki sesuai saran di atas, keseluruhan bangunan kelayakan bisnis ini tetap berdiri kokoh.`;
    } else {
      sintesis += `Saat ini baru ${layakList.length > 0 ? layakList.join(" dan ") + " yang" : "belum ada aspek yang"} berstatus LAYAK, sementara ${lemahList.join(", ")} masih di bawah ambang. Pola seperti ini mengirim sinyal kehati-hatian kepada pendana, karena kelemahan di satu aspek mudah menjalar ke aspek lain — misalnya tata kelola yang lemah akan memperlambat pengurusan legalitas dan eksekusi pemasaran. Prioritaskan perbaikan aspek berbobot terbesar terlebih dahulu agar dampaknya ke skor agregat paling terasa.`;
    }
    paragraphs.push(sintesis);
  }

  // Penutup agregat
  if (scoringResult.overallVerdict) {
    const v = scoringResult.overallVerdict;
    let penutup;
    if (v === "layak") {
      penutup = `Secara agregat, skor kelayakan mencapai ${scoringResult.totalScore}% dengan status LAYAK. Angka ini bukan sekadar rata-rata, melainkan hasil tertimbang dari lima aspek yang saling mengunci — artinya bisnis ini layak dijalankan sekaligus layak didanai. Catatan penting: sistem sengaja membatasi skor maksimum di 80% agregat, karena penilaian yang menyentuh angka sempurna justru mengundang kecurigaan analis kredit.`;
    } else if (v === "cukup") {
      penutup = `Secara agregat, skor kelayakan berada di ${scoringResult.totalScore}% dengan status CUKUP LAYAK. Bisnis ini punya fondasi yang bisa dikerjakan, tetapi beberapa aspek masih perlu penguatan sebelum proposal benar-benar siap bersaing di meja analis. Gunakan saran konkret pada tiap aspek di atas sebagai daftar prioritas perbaikan.`;
    } else {
      penutup = `Secara agregat, skor kelayakan berada di ${scoringResult.totalScore}% dengan status TIDAK LAYAK. Mengajukan pendanaan dalam kondisi ini berisiko ditolak dan meninggalkan jejak negatif. Lebih bijak menunda pengajuan, membereskan aspek-aspek yang tertinggal sesuai saran di atas, lalu menguji ulang kelayakan sebelum proposal dikirim.`;
    }
    paragraphs.push(penutup);

    if (scoringResult.criticalFailed.length > 0) {
      const failedNames = scoringResult.criticalFailed.map((c) => c.name).join(", ");
      paragraphs.push(
        `PERHATIAN KHUSUS: aspek kritikal yang belum memenuhi syarat — ${failedNames}. Untuk proposal pencarian dana, aspek kritikal wajib berstatus LAYAK tanpa toleransi, karena inilah hal pertama yang diperiksa analis sebelum membaca bagian lain. Bereskan aspek ini sebelum laporan diajukan ke pihak mana pun.`
      );
    }
  }

  return {
    title: "BAB 4 — Rekapitulasi Kelayakan 5 Aspek SKB",
    paragraphs: paragraphs.map((p) => paragraph([p])),
    scoring: scoringResult,
  };
}

// ----- BAB 9: LAMPIRAN PRO FORMA -----

export function buildBab9Lampiran(proForma) {
  return {
    title: "BAB 9 — Lampiran: Detail Pro Forma 3 Tahun",
    paragraphs: [
      "Lampiran ini berisi rincian Laporan Laba Rugi (P&L), Laporan Arus Kas, dan Neraca pro forma per bulan untuk Tahun 1, 2, dan 3.",
    ],
    pnl: proForma.pnl,
    cashFlow: proForma.cashFlow,
    balanceSheet: proForma.balanceSheet,
  };
}

// ----- KONTEKS UNTUK AI BAB 1 -----

/**
 * Bangun konteks ringkas dari hasil rule-based untuk dipakai sebagai input
 * AI Gemini saat generate Bab 1 (Tahap 9).
 *
 * Format: blok teks terstruktur yang berisi semua angka & poin kunci.
 */
export function buildAiContext(forms, financials, scoringResult, pathwayCode) {
  const pathway = getPathway(pathwayCode);
  const identitas = forms?.identitas || {};
  const provinceName = PROVINCES[identitas.provinceCode]?.name || "Indonesia";

  const y1 = financials.projection[0];
  const y3 = financials.projection[2];

  const lines = [
    `=== IDENTITAS BISNIS ===`,
    `Nama: ${identitas.namaBisnis || "(belum diisi)"}`,
    `Persona: Pencari Dana — ${pathway.name}`,
    pathwayCode === "lanjutan"
      ? `Catatan jenis bisnis: bisnis SUDAH BERJALAN (ada rekam jejak: omset ${formatRp(forms?.existingBusiness?.omsetBulanan || 0)}/bulan, laba ${formatRp(forms?.existingBusiness?.labaBulanan || 0)}/bulan). Narasi harus menonjolkan track record, kapasitas, dan analisis inkremental.`
      : `Catatan jenis bisnis: bisnis BARU dari nol (tanpa data historis). Narasi harus menonjolkan validasi ide, potensi pasar, dan realisme asumsi.`,
    `Target pendanaan: ${formatRp(forms?.fundingTarget?.nominal || 0)} (${forms?.fundingTarget?.jenisPendanaan || "jenis belum dipilih"}, tenor ${forms?.fundingTarget?.tenor || "-"} bulan)`,
    `Lokasi: ${provinceName}`,
    `Tagline: ${identitas.tagline || "-"}`,
    `Deskripsi: ${identitas.deskripsi || "-"}`,
    ``,
    `=== PASAR & STRATEGI (BAB 2-3) ===`,
    `Masalah pelanggan dipilih: ${(forms?.peluang?.masalah || []).length} opsi`,
    `Solusi dirancang: ${(forms?.peluang?.solusi || []).length} opsi`,
    `Target segmentasi: ${(forms?.peluang?.jenisPelanggan || []).length} jenis`,
    `Strategi pemasaran: ${(forms?.strategi?.pemasaran || []).length} kanal`,
    `Kanal penjualan: ${(forms?.strategi?.kanal || []).length} jalur`,
    ``,
    `=== KEUANGAN (BAB 6-8) ===`,
    `Produk utama: ${(forms?.keuangan?.products || []).length} item`,
    `Pendapatan Tahun 1: ${formatRp(y1.revenue)} (proyeksi)`,
    `Pendapatan Tahun 3: ${formatRp(y3.revenue)}`,
    `Laba Bersih Tahun 1: ${formatRp(y1.netIncome)}`,
    `Laba Bersih Tahun 3: ${formatRp(y3.netIncome)}`,
    `Modal awal: ${formatRp(financials.initialInvestment)}`,
    `NPV: ${financials.npv != null ? formatRp(financials.npv) : "n/a"} (${financials.npvVerdict || "?"})`,
    `IRR: ${financials.irrPct != null ? `${financials.irrPct}%` : "n/a"}`,
    `Payback Period: ${financials.paybackMonths != null ? `${financials.paybackMonths} bulan` : "n/a"}`,
    `BEP omset/bulan: ${financials.bep.bepMonthlySales != null ? formatRp(financials.bep.bepMonthlySales) : "n/a"}`,
    ``,
    `=== KELAYAKAN 5 ASPEK SKB (BAB 4) ===`,
    `Skor agregat: ${scoringResult.totalScore}%`,
    `Verdict: ${scoringResult.overallVerdictLabel || "BELUM LENGKAP"}`,
    ...ASPECT_ORDER.map((code) => {
      const a = scoringResult.aspects[code];
      return `- ${a.meta.name}: ${a.pctPercent}% (${a.verdictLabel || "belum lengkap"})`;
    }),
  ];

  if (scoringResult.criticalFailed.length > 0) {
    lines.push("", "=== CATATAN PENTING ===");
    lines.push(
      `Aspek kritikal gagal: ${scoringResult.criticalFailed.map((c) => c.name).join(", ")}`
    );
  }

  return lines.join("\n");
}

// ----- MAIN: BUILD FULL REPORT -----

/**
 * Compile laporan 9-Bab lengkap dari forms state.
 *
 * @param {object} forms - state.forms lengkap
 * @param {string} pathwayCode - "baru" | "lanjutan" (jenis bisnis pencari dana)
 * @returns {object} laporan terstruktur
 */
export function assembleReport(forms, pathwayCode) {
  const identitas = forms?.identitas || {};
  const provinceCode = identitas.provinceCode || "";

  // Beta default kalau sektor tidak tersedia (Tahap 6 belum punya sektor di forms)
  const sectorBeta = 0.9;

  // === Build semua komponen ===
  // Hotfix 11.3: kirim forms LENGKAP, bukan forms.kuesioner (deprecated sejak
  // Hotfix 7.1 — scoring sekarang derive dari semua form data, bukan kuesioner manual)
  const scoringResult = computeScoringResult(forms, pathwayCode);
  const proForma = buildProForma(forms, provinceCode, sectorBeta);
  const narratives = buildAllNarratives(forms, proForma.financials);
  const bab4 = buildBab4SKB(scoringResult);
  const bab9 = buildBab9Lampiran(proForma);

  // === Konteks untuk AI Bab 1 (siap dipakai Tahap 9) ===
  const aiContext = buildAiContext(forms, proForma.financials, scoringResult, pathwayCode);

  // === Status kesiapan ===
  const readyForReport = isReadyForReport(scoringResult, pathwayCode);
  const readyForAi = scoringResult.summary.completeness > 0.6; // minimal 60% terisi

  return {
    pathway: getPathway(pathwayCode),
    identitas,
    bab1: null, // BAB 1 (AI) — akan diisi di Tahap 9
    bab2: narratives.bab2,
    bab3: narratives.bab3,
    bab4,
    bab5: narratives.bab5,
    bab6: narratives.bab6,
    bab7: narratives.bab7,
    bab8: narratives.bab8,
    bab9,
    scoring: scoringResult,
    financials: proForma.financials,
    proForma,
    aiContext,
    readyForReport,
    readyForAi,
  };
}

// ----- Helper untuk format Rp internal -----
function formatRp(v) {
  if (v == null || isNaN(v)) return "Rp 0";
  const a = Math.abs(v);
  let s;
  if (a >= 1e12) s = `${(v / 1e12).toFixed(2)} T`;
  else if (a >= 10e9) s = `${(v / 1e9).toFixed(2)} M`;
  else if (a >= 1e6) s = `${Math.round(v / 1e6).toLocaleString("id-ID")} jt`;
  else if (a >= 1e3) s = `${(v / 1e3).toFixed(0)} rb`;
  else s = (v || 0).toFixed(0);
  return `Rp ${s}`;
}
