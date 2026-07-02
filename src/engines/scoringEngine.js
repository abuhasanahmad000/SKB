import { KUESIONER, ASPECT_ORDER, VERDICT_COLORS } from "../data/kuesioner.js";
import { getSector } from "../data/sectors.js";
import { getSkala } from "./suggestionHelper.js";

// ============================================================================
// SCORING ENGINE v5 — Stage-Aware untuk Pencari Dana (Refactor v13)
//
// SEMUA user adalah PENCARI DANA, sehingga dimensi pendanaan (kompetensi
// pendiri, realisme parameter pendanaan) dan critical gate SELALU aktif.
// Yang membedakan adalah JENIS BISNIS (stage):
//
//   stage "baru"     → tanpa data historis. Dinilai dari kekuatan validasi
//                      pasar & asumsi. Bobot Aspek Pemasaran paling berat
//                      (riset menunjukkan kegagalan startup terbanyak karena
//                      "no market need").
//   stage "lanjutan" → punya rekam jejak. Tambahan dimensi: performa pasar
//                      eksisting, utilisasi kapasitas, rekam jejak & rasio
//                      keuangan (margin, DER), kelengkapan legalitas berjalan.
//                      Bobot Manajemen & Hukum lebih berat (bank menilai
//                      Capacity & Character dari riwayat — kerangka 5C).
//
// ATURAN ANTI-KECURIGAAN: max 85% per aspek, max 80% agregat
// ============================================================================

const ASPECTS_META = {};
for (const code of ASPECT_ORDER) {
  const k = KUESIONER[code];
  ASPECTS_META[code] = {
    code: k.code, letter: k.letter, name: k.name, icon: k.icon,
    criticalForAll: !!k.criticalForAll, criticalForC: !!k.criticalForC,
  };
}

const MAX_ASPECT_SCORE = 85;
const MAX_OVERALL_SCORE = 80;
const THRESHOLDS = { layak: 70, cukup: 45 };

function getVerdict(pct) {
  if (pct >= THRESHOLDS.layak) return "layak";
  if (pct >= THRESHOLDS.cukup) return "cukup";
  return "tidak";
}
function getVerdictLabel(v) {
  return v === "layak" ? "LAYAK" : v === "cukup" ? "CUKUP" : v === "tidak" ? "TIDAK LAYAK" : null;
}

function makeDimension(name, score, max = 100, notes = []) {
  const s = Math.max(0, Math.min(max, Math.round(score)));
  return {
    name, score: s, max, pct: s / max,
    status: s / max >= 0.7 ? "good" : s / max >= 0.45 ? "average" : "weak",
    notes,
  };
}

// ============================================================================
// DIMENSI BUILDER (per-jalur aware)
// ============================================================================

// ----- PEMASARAN dimensions: common + per-jalur additions -----
function getPemasaranDimensions(forms, pathwayCode) {
  const p = forms?.peluang || {};
  const s = forms?.strategi || {};
  const i = forms?.identitas || {};
  const eb = forms?.existingBusiness || {};

  const common = [
    makeDimension("Identifikasi Masalah Pasar",
      Math.min(85, (p.masalah?.length || 0) * 28), 100,
      (p.masalah?.length || 0) >= 2 ? ["Masalah pasar terdefinisi cukup baik"] : ["Identifikasi masalah pasar masih dangkal"]),
    makeDimension("Solusi & Value Proposition",
      Math.min(85, (p.solusi?.length || 0) * 30 + ((p.solusi?.length || 0) > 0 ? 10 : 0)), 100,
      (p.solusi?.length || 0) >= 2 ? ["Solusi yang ditawarkan jelas & memadai"] : ["Perjelas value proposition"]),
    makeDimension("Pemahaman Target Pasar",
      Math.min(85, ((p.jenisPelanggan?.length || 0) + (p.karakteristik?.length || 0)) * 20), 100,
      (p.jenisPelanggan?.length || 0) > 0 && (p.karakteristik?.length || 0) > 0
        ? ["Segmen pasar & karakteristik teridentifikasi"] : ["Pertajam segmentasi pelanggan"]),
    makeDimension("Analisis Kompetisi & Keunggulan",
      Math.min(85, ((p.bentukKompetisi?.length || 0) + (p.keunggulan?.length || 0)) * 22), 100,
      (p.keunggulan?.length || 0) >= 2 ? ["Keunggulan kompetitif terdefinisi"] : ["Perkuat positioning vs kompetitor"]),
    makeDimension("Strategi & Kanal Pemasaran",
      Math.min(85, ((s.pemasaran?.length || 0) * 18) + ((s.kanal?.length || 0) * 15)), 100,
      (s.pemasaran?.length || 0) + (s.kanal?.length || 0) >= 3
        ? ["Multi-channel pemasaran"] : ["Pertimbangkan ekspansi kanal pemasaran"]),
    makeDimension("Identitas & Diferensiasi Merek",
      computeBrandingScore(i), 100,
      computeBrandingScore(i) >= 70
        ? ["Identitas brand kuat (nama, tagline, deskripsi)"] : ["Perkuat tagline & deskripsi brand"]),
  ];

  // Stage "lanjutan": tambah "Performa Pasar Saat Ini" dari omset eksisting.
  // FIX v13.1: ambang omset disesuaikan SKALA bisnis — sebelumnya ambang
  // tunggal Rp 50 jt/bln membuat usaha mikro yang sehat selalu dinilai jelek.
  if (pathwayCode === "lanjutan") {
    const omset = eb.omsetBulanan || 0;
    const tahunBerdiri = parseInt(eb.tahunMulai || i.tahunBerdiri || "0", 10);
    const currentYear = new Date().getFullYear();
    const usiaBisnis = tahunBerdiri > 0 ? currentYear - tahunBerdiri : 0;
    // Ambang per skala (omset bulanan wajar): mikro s.d. ~Rp 167 jt/bln (2M/thn)
    const skalaId = i.skalaBisnis || "mikro";
    const T = {
      mikro:    { kuat: 15e6,  sehat: 8e6,   tumbuh: 4e6 },
      kecil:    { kuat: 60e6,  sehat: 30e6,  tumbuh: 15e6 },
      menengah: { kuat: 250e6, sehat: 120e6, tumbuh: 50e6 },
      besar:    { kuat: 800e6, sehat: 400e6, tumbuh: 150e6 },
    }[skalaId] || { kuat: 15e6, sehat: 8e6, tumbuh: 4e6 };
    let score = 30;
    if (omset >= T.kuat) score = 78;
    else if (omset >= T.sehat) score = 68;
    else if (omset >= T.tumbuh) score = 56;
    else if (omset > 0) score = 45;
    if (usiaBisnis >= 3) score = Math.min(82, score + 5);
    else if (usiaBisnis >= 1) score = Math.min(82, score + 2);
    const labaPositif = (eb.labaBulanan || 0) > 0;
    if (labaPositif) score = Math.min(82, score + 3);
    common.push(makeDimension("Performa Pasar Saat Ini",
      score, 100,
      omset > 0
        ? [`Omset Rp ${(omset/1e6).toFixed(1)} jt/bln (skala ${skalaId})${usiaBisnis > 0 ? `, usia bisnis ${usiaBisnis} tahun` : ""}${labaPositif ? ", laba positif" : ""}`]
        : ["Isi omset bulanan di sub-tab Kinerja & Legalitas Berjalan"]));
  }

  return common;
}

function computeBrandingScore(i) {
  let score = 25;
  if (i?.namaBisnis) score += 12;
  if ((i?.produkUtama?.length || 0) >= 3) score += 12;
  if ((i?.tagline?.length || 0) >= 5) score += 13;
  if ((i?.deskripsi?.length || 0) >= 50) score += 18;
  if (i?.sectorCode) score += 8;
  if (i?.skalaBisnis) score += 7;
  return Math.min(82, score);
}

// ----- TEKNIS dimensions: common + per-jalur additions -----
function getTeknisDimensions(forms, pathwayCode) {
  const a = forms?.alatSDM || {};
  const s = forms?.strategi || {};
  const k = forms?.keuangan || {};
  const equipmentCount = a.equipment?.length || 0;
  const teknologiCount = a.teknologi?.length || 0;
  const metodeCount = k.metode?.length || 0;

  // FIX v13.1 "Metode & Proses Operasional Penjualan":
  // Dulu HANYA membaca forms.keuangan.metode (checklist di sub-tab Proyeksi) —
  // banyak user belum sampai ke sana sehingga skor selalu jelek. Sekarang
  // sumbernya digabung: metode penjualan + kanal penjualan (sub-tab Strategi
  // Pemasaran) + teknologi operasional, dengan kurva yang adil.
  const kanalCount = s.kanal?.length || 0;
  const prosesSignals = metodeCount + kanalCount;
  let prosesScore;
  if (prosesSignals >= 4) prosesScore = 80;
  else if (prosesSignals >= 3) prosesScore = 74;
  else if (prosesSignals >= 2) prosesScore = 66;
  else if (prosesSignals >= 1) prosesScore = 55;
  else prosesScore = 20;
  if (teknologiCount >= 1 && prosesSignals >= 1) prosesScore = Math.min(82, prosesScore + 4);

  const dims = [
    makeDimension("Kesiapan Peralatan & Aset Produksi",
      equipmentCount >= 5 ? 80 : equipmentCount >= 3 ? 65 : equipmentCount >= 1 ? 45 : 15,
      100, [`${equipmentCount} item peralatan & aset teridentifikasi`]),
    makeDimension("Adopsi Teknologi & Sistem Operasional",
      Math.min(82, teknologiCount * 20 + (teknologiCount > 0 ? 12 : 0)), 100,
      teknologiCount >= 2 ? ["Adopsi teknologi memadai"] : ["Tambah teknologi (POS, QRIS) untuk efisiensi"]),
    makeDimension("Lokasi & Infrastruktur Operasional",
      computeLokasiScore(s), 100,
      s.statusTempat ? ["Status & karakter lokasi terdefinisi"] : ["Pilih status kepemilikan tempat"]),
    makeDimension("Metode & Proses Operasional Penjualan",
      prosesScore, 100,
      prosesSignals >= 3 ? [`${metodeCount} metode + ${kanalCount} kanal penjualan — proses multi-jalur`]
        : prosesSignals >= 1 ? [`${metodeCount} metode & ${kanalCount} kanal terdefinisi — Tambah kanal/metode untuk memperkuat`]
        : ["Pilih metode penjualan (tab Keuangan ▸ Proyeksi) atau kanal penjualan (Strategi Pemasaran)"]),
  ];

  // Stage "lanjutan": justifikasi teknis ekspansi — utilisasi kapasitas tinggi
  // dan bottleneck teridentifikasi adalah bukti kuat bahwa modal tambahan
  // memang dibutuhkan (bukan sekadar keinginan).
  if (pathwayCode === "lanjutan") {
    const eb = forms?.existingBusiness || {};
    const util = eb.kapasitasUtilization || 0;
    const bn = (eb.bottleneck || []).length;
    let score = 25;
    if (util >= 85) score = 80;
    else if (util >= 70) score = 68;
    else if (util >= 50) score = 52;
    else if (util > 0) score = 38;
    if (bn >= 1) score = Math.min(82, score + 5);
    dims.push(makeDimension("Justifikasi Kapasitas & Bottleneck",
      score, 100,
      util > 0
        ? [`Utilisasi kapasitas ${util}%${bn > 0 ? `, ${bn} bottleneck teridentifikasi` : ""}`]
        : ["Isi utilisasi kapasitas saat ini untuk memperkuat justifikasi ekspansi"]));
  }

  return dims;
}

function computeLokasiScore(strategi) {
  const map = { milik: 75, sewa_tahunan: 65, sewa_bulanan: 55, belum_ada: 20 };
  let score = map[strategi?.statusTempat] || 30;
  score += Math.min(15, (strategi?.karakterLokasi?.length || 0) * 8);
  return Math.min(82, score);
}

// ----- MANAJEMEN dimensions: per-jalur (Jalur C butuh kompetensi pendiri lebih) -----
function getManajemenDimensions(forms, pathwayCode) {
  const h = forms?.hukum || {};
  const a = forms?.alatSDM || {};
  const i = forms?.identitas || {};
  const strukturCount = h.struktur?.length || 0;
  const penasihatCount = h.penasihat?.length || 0;
  const kompetensiLength = (i.kompetensiPendiri || "").trim().length;
  const personnelActiveCount = Object.values(a.personnel?.positions || {}).filter((p) => p?.active).length;

  const common = [
    makeDimension("Struktur Organisasi & Tata Kelola",
      strukturCount >= 4 ? 80 : strukturCount >= 2 ? 65 : strukturCount >= 1 ? 45 : 20, 100,
      strukturCount >= 2 ? [`${strukturCount} posisi inti organisasi`] : ["Definisikan minimal 2-3 posisi inti"]),
    makeDimension("Struktur Tim Operasional & Karyawan",
      personnelActiveCount >= 3 ? 78 : personnelActiveCount >= 2 ? 65 : personnelActiveCount >= 1 ? 50 : 22, 100,
      [`${personnelActiveCount} posisi karyawan operasional`]),
    makeDimension("Dukungan Penasihat / Mentor Eksternal",
      penasihatCount >= 2 ? 80 : penasihatCount >= 1 ? 65 : 35, 100,
      penasihatCount >= 1 ? ["Ada dukungan eksternal"] : ["Tambah mentor/penasihat"]),
  ];

  // Pencari dana: kompetensi pendiri SELALU dinilai — elemen "Character"
  // dalam kerangka 5C penilaian kredit.
  common.push(makeDimension("Kompetensi & Latar Belakang Pendiri",
    kompetensiLength >= 200 ? 80 : kompetensiLength >= 100 ? 65 : kompetensiLength >= 30 ? 50 : 30, 100,
    kompetensiLength >= 100 ? ["Profil pendiri terdokumentasi"] : ["Lengkapi profil pendiri (WAJIB untuk pendanaan)"]));

  // Stage "lanjutan": rekam jejak & kesehatan keuangan dari data riil —
  // usia bisnis, net margin, dan Debt-to-Asset Ratio.
  if (pathwayCode === "lanjutan") {
    const eb = forms?.existingBusiness || {};
    const tahunMulai = parseInt(eb.tahunMulai || i.tahunBerdiri || "0", 10);
    const usia = tahunMulai > 0 ? new Date().getFullYear() - tahunMulai : 0;
    const netMargin = eb.omsetBulanan > 0 ? (eb.labaBulanan || 0) / eb.omsetBulanan : null;
    const der = eb.asetSaatIni > 0 ? (eb.hutangSaatIni || 0) / eb.asetSaatIni : null;
    let score = 25;
    if (usia >= 3) score += 18; else if (usia >= 1) score += 10;
    if (netMargin !== null) {
      if (netMargin >= 0.15) score += 25;
      else if (netMargin >= 0.08) score += 18;
      else if (netMargin > 0) score += 8;
    }
    if (der !== null) {
      if (der <= 0.4) score += 18;
      else if (der <= 0.6) score += 10;
      else score += 2;
    }
    score = Math.min(82, score);
    const notes = [];
    if (usia > 0) notes.push(`Usia bisnis ${usia} tahun`);
    if (netMargin !== null) notes.push(`Net margin ${(netMargin * 100).toFixed(1)}%`);
    if (der !== null) notes.push(`Debt-to-Asset ${(der * 100).toFixed(0)}%`);
    if (notes.length === 0) notes.push("Isi snapshot keuangan berjalan untuk menilai rekam jejak");
    common.push(makeDimension("Rekam Jejak & Kesehatan Keuangan", score, 100, notes));
  }

  return common;
}

// ----- HUKUM dimensions: per-jalur (Jalur C ada parameter pendanaan tambahan) -----
function getHukumDimensions(forms, pathwayCode) {
  const h = forms?.hukum || {};
  const m = forms?.modal || {};
  const s = forms?.strategi || {};
  const ft = forms?.fundingTarget || {};

  const bentukScores = { pt_perorangan: 78, pt_umum: 82, cv: 70, ud: 60, perorangan: 45 };
  const bentukScore = bentukScores[h.bentukHukum] || 15;

  const legalBudget = m.expenses?.legal || 0;
  const legalScore = legalBudget >= 3_000_000 ? 80 : legalBudget >= 1_500_000 ? 65 : legalBudget >= 500_000 ? 50 : 25;

  const statusTempatMap = { milik: 80, sewa_tahunan: 72, sewa_bulanan: 55, belum_ada: 20 };
  const statusTempatLegal = statusTempatMap[s?.statusTempat] || 25;

  // FIX v13.1 "Komitmen Tata Kelola & Compliance":
  // Dulu baseline 30 + sangat bergantung pada penasihat (yang jarang diisi
  // user) sehingga nilainya selalu jelek. Sekarang dinilai dari sinyal yang
  // memang tersedia di formulir: badan hukum formal, struktur organisasi,
  // anggaran legalitas, identitas lengkap — penasihat hanya bonus.
  const strukturForGov = h.struktur?.length || 0;
  const penasihatCount = h.penasihat?.length || 0;
  const isFormalEntity = ["pt_perorangan", "pt_umum", "cv"].includes(h.bentukHukum);
  const hasIdentity = !!(forms?.identitas?.namaBisnis && forms?.identitas?.deskripsi?.length > 30);
  let tataKelolaScore = 18;
  if (isFormalEntity) tataKelolaScore += 26;
  else if (h.bentukHukum) tataKelolaScore += 12; // UD/perorangan tetap dihargai
  if (strukturForGov >= 2) tataKelolaScore += 14;
  else if (strukturForGov >= 1) tataKelolaScore += 8;
  if ((m.expenses?.legal || 0) > 0) tataKelolaScore += 10;
  if (hasIdentity) tataKelolaScore += 8;
  if (penasihatCount >= 1) tataKelolaScore += 8; // bonus, bukan syarat
  tataKelolaScore = Math.min(82, tataKelolaScore);

  const common = [
    makeDimension("Bentuk Badan Hukum", bentukScore, 100,
      [h.bentukHukum ? `Berbentuk ${h.bentukHukum.replace("_", " ").toUpperCase()}` : "Belum memilih bentuk hukum"]),
    makeDimension("Anggaran Perizinan & Legalitas", legalScore, 100,
      [legalBudget > 0 ? `Anggaran Rp ${(legalBudget/1e6).toFixed(1)} jt` : "Belum ada anggaran legalitas"]),
    makeDimension("Status Legal Tempat Operasional", statusTempatLegal, 100,
      [s.statusTempat ? `Status: ${s.statusTempat.replace("_", " ")}` : "Status tempat belum ditentukan"]),
    makeDimension("Komitmen Tata Kelola & Compliance", tataKelolaScore, 100,
      [isFormalEntity && penasihatCount >= 1
        ? "Tata kelola didukung penasihat & badan hukum formal"
        : "Perkuat tata kelola: badan hukum formal + penasihat"]),
  ];

  // Pencari dana: "Realisme Parameter Pendanaan" SELALU dinilai.
  {
    const tenor = ft.tenor || 0;
    const jenisDana = ft.jenisPendanaan || ft.jenisDana;
    let score = 30;
    if (tenor >= 24 && tenor <= 60) score = 78; // tenor 2-5 tahun wajar
    else if (tenor >= 12 && tenor < 24) score = 65;
    else if (tenor > 0) score = 50;
    if (jenisDana) score = Math.min(82, score + 5);
    common.push(makeDimension("Realisme Parameter Pendanaan",
      score, 100,
      tenor > 0 ? [`Tenor ${tenor} bulan, jenis dana: ${jenisDana || "?"}`] : ["Belum tentukan parameter pendanaan"]));
  }

  // Stage "lanjutan": kelengkapan legalitas yang SUDAH dimiliki — bukti
  // compliance berjalan, bukan sekadar rencana mengurus izin.
  if (pathwayCode === "lanjutan") {
    const eb = forms?.existingBusiness || {};
    const owned = (eb.legalitasOwned || []).length;
    const score = owned >= 5 ? 82 : owned >= 3 ? 70 : owned >= 2 ? 58 : owned >= 1 ? 45 : 20;
    common.push(makeDimension("Kelengkapan Legalitas Berjalan",
      score, 100,
      owned > 0 ? [`${owned} dokumen legalitas sudah dimiliki`] : ["Centang legalitas yang sudah dimiliki (NIB, NPWP, dll)"]));
  }

  return common;
}

// ----- LINGKUNGAN dimensions -----
function getLingkunganDimensions(forms, pathwayCode) {
  const l = forms?.lingkunganSosial || {};
  const i = forms?.identitas || {};
  const a = forms?.alatSDM || {};
  const sector = getSector(i.sectorCode);
  const skala = getSkala(i.skalaBisnis);

  // FIX v13.1 "Karakter Sektor Usaha (Dampak Inherent)":
  // Dulu skornya 45-70 (selalu di bawah ambang LAYAK 70) dan grup "Manufaktur"
  // tidak cocok dengan kata kunci "Industri" sehingga jatuh ke default —
  // dimensi ini SELALU terlihat jelek padahal bukan kesalahan user. Sekarang:
  // baseline per grup sektor lebih realistis, dan praktik ramah lingkungan
  // yang dicentang user MENGURANGI dampak inherent (mitigasi dihargai).
  const sektorInherent = (() => {
    const grp = sector?.group || "";
    let base;
    if (!sector) base = 45;
    else if (/Jasa|Teknologi|Pendidikan/i.test(grp)) base = 78;
    else if (/Perdagangan/i.test(grp)) base = 72;
    else if (/Makanan|Pertanian/i.test(grp)) base = 68;
    else if (/Manufaktur|Industri|Konstruksi/i.test(grp)) base = 58;
    else base = 66;
    // Mitigasi: tiap praktik ramah lingkungan menurunkan dampak inherent
    const mitigasi = Math.min(10, (l.praktikRamah?.length || 0) * 3);
    return Math.min(82, base + mitigasi);
  })();

  const praktikCount = l.praktikRamah?.length || 0;
  const praktikScore = praktikCount >= 4 ? 82 : praktikCount >= 2 ? 65 : praktikCount >= 1 ? 50 : 25;

  const sosialCount = l.komitmenSosial?.length || 0;
  const sosialScore = sosialCount >= 3 ? 80 : sosialCount >= 1 ? 60 : 35;

  const personnelTotal = Object.values(a.personnel?.positions || {})
    .filter((p) => p?.active).reduce((sum, p) => sum + (p.count || 0), 0);
  const skalaTargets = { mikro: 1, kecil: 3, menengah: 6, besar: 11 };
  const target = skalaTargets[skala?.id] || 1;
  let tkLokalScore;
  if (personnelTotal === 0) tkLokalScore = 20;
  else if (personnelTotal >= target * 2) tkLokalScore = 82;
  else if (personnelTotal >= target) tkLokalScore = 70;
  else tkLokalScore = 50;

  return [
    makeDimension("Karakter Sektor Usaha (Dampak Inherent)", sektorInherent, 100,
      [sector
        ? `Sektor ${sector.group}${(l.praktikRamah?.length || 0) > 0 ? ` — dampak inherent dimitigasi ${l.praktikRamah.length} praktik ramah lingkungan` : ""}`
        : "Pilih sektor usaha di Profil Bisnis"]),
    makeDimension("Praktik Ramah Lingkungan", praktikScore, 100,
      [praktikCount > 0 ? `${praktikCount} praktik dicentang` : "Belum mencentang praktik ramah lingkungan"]),
    makeDimension("Komitmen Sosial & Komunitas", sosialScore, 100,
      [sosialCount > 0 ? `${sosialCount} komitmen sosial terdefinisi` : "Belum mendefinisikan komitmen sosial"]),
    makeDimension("Penyerapan Tenaga Kerja Lokal", tkLokalScore, 100,
      [personnelTotal > 0 ? `${personnelTotal} orang direkrut (target ${skala?.id || "?"}: ${target}+)` : "Belum ada penyerapan TK"]),
  ];
}

// ----- SCORING PER ASPEK (panggil dimension builder lalu compute avg) -----
function scoreAspek(code, forms, pathwayCode) {
  const dimensionBuilders = {
    pemasaran: getPemasaranDimensions,
    teknis: getTeknisDimensions,
    manajemen: getManajemenDimensions,
    hukum: getHukumDimensions,
    lingkungan: getLingkunganDimensions,
  };
  const dimensions = dimensionBuilders[code](forms, pathwayCode);
  const avg = dimensions.reduce((sum, d) => sum + d.pct * 100, 0) / dimensions.length;
  return buildAspectResult(code, Math.min(MAX_ASPECT_SCORE, avg), dimensions);
}

function buildAspectResult(code, scorePct, dimensions) {
  const score = Math.round(scorePct);
  const verdict = getVerdict(score);
  return {
    meta: ASPECTS_META[code], score, max: 100, pct: score / 100,
    pctPercent: score, verdict, verdictLabel: getVerdictLabel(verdict),
    dimensions, narasi: buildNarasi(code, score, dimensions, verdict),
  };
}

function buildNarasi(code, score, dimensions, verdict) {
  const aspectName = ASPECTS_META[code].name;
  const sorted = [...dimensions].sort((a, b) => b.pct - a.pct);
  const strongest = sorted.filter((d) => d.pct >= 0.7).slice(0, 2);
  const weakest = [...dimensions].sort((a, b) => a.pct - b.pct).slice(0, 2).filter((d) => d.pct < 0.7);

  // Kalimat 1: verdict
  let leadIn;
  if (verdict === "layak") leadIn = `${aspectName} dinilai LAYAK dengan skor ${score}%.`;
  else if (verdict === "cukup") leadIn = `${aspectName} berada pada level CUKUP dengan skor ${score}% — sudah memadai, tetapi masih ada ruang yang perlu diperkuat sebelum benar-benar meyakinkan pendana.`;
  else leadIn = `${aspectName} masih TIDAK LAYAK dengan skor ${score}% — ada pekerjaan rumah yang harus dibereskan sebelum proposal diajukan.`;

  // Kalimat 2: dari mana skor itu datang (dimensi terkuat + buktinya)
  let kekuatan = "";
  if (strongest.length > 0) {
    const bukti = strongest
      .map((d) => {
        const note = (d.notes || []).find((n) => !/Pertimbangkan|Perjelas|Pertajam|Perkuat|Definisikan|Lengkapi|Pilih|Tambah|Isi /.test(n));
        return note ? `${d.name.toLowerCase()} (${note.charAt(0).toLowerCase()}${note.slice(1)})` : d.name.toLowerCase();
      })
      .join(" serta ");
    kekuatan = ` Penilaian ini ditopang terutama oleh ${bukti}.`;
  }

  // Kalimat 3: titik lemah yang menahan skor
  let kelemahan = "";
  if (weakest.length > 0) {
    kelemahan = ` Yang menahan skor saat ini adalah ${weakest.map((d) => d.name.toLowerCase()).join(" dan ")}.`;
  } else if (verdict === "layak") {
    kelemahan = ` Seluruh dimensi penilaian pada aspek ini sudah berada di zona sehat tanpa titik lemah yang berarti.`;
  }

  // Kalimat 4: saran konkret
  let recommendations = "";
  if (weakest.length > 0) {
    const notes = weakest.flatMap((d) => d.notes).filter((n) =>
      /Pertimbangkan|Perjelas|Pertajam|Perkuat|Definisikan|Lengkapi|Pilih|Tambah|Isi /.test(n));
    if (notes.length > 0) recommendations = ` Langkah perbaikannya jelas: ${notes.slice(0, 2).join("; ").toLowerCase()}.`;
  }

  // Kalimat 5: makna bagi pendana
  const maknaMap = {
    pemasaran: " Bagi pendana, aspek ini menjawab pertanyaan paling mendasar: apakah ada pasar nyata yang mau membayar.",
    teknis: " Bagi pendana, aspek ini menunjukkan bisnis mampu memproduksi dan melayani dengan andal begitu dana cair.",
    manajemen: " Bagi pendana, aspek ini adalah cermin unsur Character dan Capacity dalam penilaian kredit — siapa yang menjalankan uang mereka.",
    hukum: " Bagi pendana, aspek ini memastikan tidak ada hambatan legal yang bisa menghentikan operasional di tengah jalan.",
    lingkungan: " Bagi pendana, aspek ini menunjukkan bisnis diterima lingkungan sekitarnya dan minim risiko penolakan sosial.",
  };

  return leadIn + kekuatan + kelemahan + recommendations + (maknaMap[code] || "");
}

// =========== MAIN ENTRY ===========
export function computeScoringResult(formsOrKuesioner, pathwayCode) {
  let forms = formsOrKuesioner;
  if (formsOrKuesioner && !formsOrKuesioner.identitas && (formsOrKuesioner.pemasaran || formsOrKuesioner.teknis)) {
    forms = {};
  }
  // Edge case guard
  if (!forms?.identitas?.namaBisnis) {
    return makeEmptyScoringResult(pathwayCode);
  }

  const aspects = {
    pemasaran: scoreAspek("pemasaran", forms, pathwayCode),
    teknis: scoreAspek("teknis", forms, pathwayCode),
    manajemen: scoreAspek("manajemen", forms, pathwayCode),
    hukum: scoreAspek("hukum", forms, pathwayCode),
    lingkungan: scoreAspek("lingkungan", forms, pathwayCode),
  };

  // Bobot stage-aware (semua user pencari dana):
  //  - baru     : Pasar terberat (validasi ide adalah segalanya tanpa riwayat),
  //               Manajemen & Hukum tetap signifikan karena dinilai pendana.
  //  - lanjutan : Manajemen (rekam jejak/Capacity) & Hukum (legalitas/Character
  //               & compliance) terberat — pola penilaian kredit bank.
  const weights = pathwayCode === "lanjutan"
    ? { pemasaran: 0.20, teknis: 0.20, manajemen: 0.25, hukum: 0.25, lingkungan: 0.10 }
    : { pemasaran: 0.30, teknis: 0.20, manajemen: 0.20, hukum: 0.20, lingkungan: 0.10 };

  let totalScore = 0;
  for (const code of ASPECT_ORDER) totalScore += aspects[code].pctPercent * weights[code];
  totalScore = Math.round(Math.min(MAX_OVERALL_SCORE, totalScore));

  const overallVerdict = getVerdict(totalScore);
  const overallVerdictLabel = getVerdictLabel(overallVerdict);

  const criticalFailed = [];
  for (const code of ASPECT_ORDER) {
    const a = aspects[code];
    // Pencari dana: aspek kritikal pendanaan SELALU berlaku
    const isCritical = a.meta.criticalForAll || a.meta.criticalForC;
    if (isCritical && a.verdict !== "layak") {
      criticalFailed.push({ code, name: a.meta.name, verdict: a.verdict });
    }
  }

  return {
    aspects, totalScore, overallVerdict, overallVerdictLabel, criticalFailed, weights,
    summary: { totalAspects: ASPECT_ORDER.length, countedAspects: ASPECT_ORDER.length, completeness: 1, completenessPercent: 100 },
    capInfo: {
      maxAspectScore: MAX_ASPECT_SCORE, maxOverallScore: MAX_OVERALL_SCORE,
      reason: "Skor maksimum 85% per aspek & 80% agregat — menjaga realisme; skor 100% mengundang kecurigaan investor.",
    },
  };
}

function makeEmptyScoringResult(pathwayCode) {
  const emptyAspects = {};
  for (const code of ASPECT_ORDER) {
    emptyAspects[code] = {
      meta: ASPECTS_META[code], score: 0, max: 100, pct: 0, pctPercent: 0,
      verdict: "tidak", verdictLabel: "TIDAK LAYAK",
      dimensions: [], narasi: "Belum ada data — silakan lengkapi form di tab lain.",
    };
  }
  return {
    aspects: emptyAspects, totalScore: 0,
    overallVerdict: "tidak", overallVerdictLabel: "TIDAK LAYAK",
    criticalFailed: [], weights: {},
    summary: { totalAspects: 5, countedAspects: 0, completeness: 0, completenessPercent: 0 },
    capInfo: { maxAspectScore: MAX_ASPECT_SCORE, maxOverallScore: MAX_OVERALL_SCORE, reason: "" },
  };
}

export function isReadyForReport(scoringResult, pathwayCode) {
  if (scoringResult.criticalFailed.length > 0) {
    return { ready: false, reason: `Aspek kritikal belum LAYAK: ${scoringResult.criticalFailed.map((c) => c.name).join(", ")}` };
  }
  if (scoringResult.totalScore < THRESHOLDS.cukup) {
    return { ready: false, reason: `Skor agregat ${scoringResult.totalScore}% di bawah ambang batas minimum 45%` };
  }
  return { ready: true };
}

export { VERDICT_COLORS };
