// ============================================================================
// STAGES — STRUKTUR TAB & SUB-TAB UNTUK USER PENCARI DANA (Refactor v13)
//
// PERUBAHAN BESAR (v13 "Single Persona"):
// Tidak ada lagi 3 jalur user (A/B/C). SEMUA user adalah PENCARI DANA.
// Yang membedakan hanyalah JENIS BISNIS yang dipilih di dasbor:
//
//   stage "baru"     → Bisnis Baru / Rintisan yang mencari pendanaan
//                      Fokus SKB: validasi ide, potensi pasar, kebutuhan
//                      modal awal (start-up requirements), proyeksi murni
//                      dari asumsi riset — TANPA data historis.
//
//   stage "lanjutan" → Bisnis Berjalan yang mencari dana pengembangan
//                      Fokus SKB: rekam jejak keuangan historis, utilisasi
//                      kapasitas & bottleneck, analisis inkremental
//                      (dengan vs tanpa proyek), konsolidasi baseline +
//                      proyeksi tambahan, kelengkapan legalitas eksisting.
//
// Kedua stage SAMA-SAMA membawa instrumen pendanaan (parameter pendanaan,
// use of funds, DSCR, mitigasi risiko, indikator bankable) karena semua
// user adalah pencari dana.
//
// API publik (getPathway, getTab, getSubtab, getDefaultRoute) dipertahankan
// agar komponen lain tidak perlu berubah banyak — hanya kode stage yang
// berubah dari "A"|"B"|"C" menjadi "baru"|"lanjutan".
// ============================================================================

// Mapping Bab → label pendek untuk badge di UI
export const BAB_LABELS = {
  "1": "Ringkasan Eksekutif",
  "2": "Peluang Bisnis",
  "3": "Eksekusi Strategi",
  "4": "Rekap Kelayakan 5 Aspek",
  "5": "Tim & Perusahaan",
  "6": "Rencana Keuangan",
  "7": "Permintaan Pendanaan",
  "8": "Pro Forma & Indikator",
  "9": "Lampiran Detail",
};

// ----- META PER STAGE -----
const META = {
  baru: {
    code: "baru",
    name: "Bisnis Baru / Rintisan",
    persona: "Pencari Dana",
    tagline: "Validasi ide & kebutuhan modal awal untuk meyakinkan pendana",
    accent: "#7DD3FC",
    accentBg: "#0D1828",
    accentBorder: "#1E3A5F",
    icon: "✦",
    reportTitle: "Proposal Pendanaan & Studi Kelayakan Bisnis",
    reportSubtitle: "Bisnis Baru / Rintisan",
  },
  lanjutan: {
    code: "lanjutan",
    name: "Bisnis Lanjutan / Berjalan",
    persona: "Pencari Dana",
    tagline: "Rekam jejak & proyeksi konsolidasi untuk dana pengembangan",
    accent: "#A3E635",
    accentBg: "#021810",
    accentBorder: "#064E3B",
    icon: "⇗",
    reportTitle: "Proposal Pendanaan & Studi Kelayakan Pengembangan Usaha",
    reportSubtitle: "Bisnis Berjalan / Pengembangan",
  },
};

// ============================================================================
// STRUKTUR TAB PER STAGE
// Sub-tab id dibuat SAMA di kedua stage sebisa mungkin, supaya saat user
// berganti jenis bisnis di dasbor, navigasi tetap valid dan data tidak hilang.
// Perbedaan id hanya di:
//   - "hukum" (baru) vs "keuangan_eksisting" (lanjutan) di Tab 1
//   - "bep" (baru) vs "payback" (lanjutan) di Tab 3
// ============================================================================

const STAGE_BARU_TABS = [
  {
    id: "dasbor",
    label: "Dasbor & Target Pendanaan",
    icon: "◈",
    desc: "Pilih jenis bisnis, kunci profil pemohon, dan tetapkan parameter dana yang dicari.",
    subtabs: [
      {
        id: "jenis_bisnis",
        label: "Jenis Bisnis",
        babs: ["1.1"],
        desc: "Pilih: bisnis baru dari nol, atau bisnis yang sudah berjalan. Seluruh isian & laporan menyesuaikan.",
      },
      {
        id: "identitas",
        label: "Profil Bisnis & Pemohon",
        babs: ["1.1", "5.1"],
        desc: "Nama calon bisnis, sektor, skala, plus profil & kompetensi pemohon dana.",
      },
      {
        id: "hukum",
        label: "Bentuk Hukum & Tim Inti",
        babs: ["5.1", "5.2", "5.3"],
        desc: "Rencana badan hukum (PT Perorangan/CV/Perorangan), struktur organisasi inti, dan penasihat.",
      },
      {
        id: "parameter_pendanaan",
        label: "Parameter Pendanaan",
        babs: ["7.3"],
        desc: "Jenis pendanaan (KUR/Komersial/Investor/Hibah), jaminan, tenor, dan mitigasi risiko.",
      },
    ],
  },
  {
    id: "formulir",
    label: "Formulir Studi Kelayakan",
    icon: "⊞",
    desc: "Instrumen SKB bisnis baru: validasi ide, strategi, proyeksi dari asumsi riset, dan modal awal.",
    subtabs: [
      {
        id: "peluang",
        label: "Validasi Ide & Peluang Pasar",
        babs: ["2.1", "2.2", "2.3", "2.4"],
        desc: "Masalah pelanggan, solusi, segmen target, kompetisi, dan keunggulan unik (UVP).",
      },
      {
        id: "pemasaran",
        label: "Strategi Pemasaran & Tempat",
        babs: ["3.1", "3.2", "3.3"],
        desc: "Promosi peluncuran, kanal penjualan, dan status kepemilikan/sewa lokasi.",
      },
      {
        id: "alatsdm",
        label: "Kesiapan Alat & Karyawan",
        babs: ["3.4", "6.3"],
        desc: "Peralatan yang harus dibeli dari nol dan posisi karyawan yang akan direkrut.",
      },
      {
        id: "risiko",
        label: "Analisis & Mitigasi Risiko",
        babs: ["6.6"],
        desc: "5 kategori risiko + cara bertahan — bisa diisi otomatis oleh AI sesuai sektor & bisnis Anda.",
      },
      {
        id: "kuesioner",
        label: "Komitmen Lingkungan & Sosial",
        babs: ["4"],
        critical: true,
        desc: "Komitmen ramah lingkungan & sosial — memperkuat Aspek Lingkungan di mata pendana.",
      },
    ],
  },
  {
    id: "keuangan",
    label: "Keuangan",
    icon: "◎",
    desc: "Semua input keuangan: rincian initial investment + sumber dana, dan proyeksi pendapatan-biaya.",
    subtabs: [
      {
        id: "investasi_awal",
        label: "Initial Investment & Sumber Dana",
        babs: ["7.1", "7.2", "7.3"],
        desc: "Rincian kebutuhan dana awal per item (rekomendasi harga pasar riil + AI) plus Smart Balance Check sumber dana.",
      },
      {
        id: "proyeksi",
        label: "Proyeksi Pendapatan & Biaya",
        babs: ["6.1", "6.2", "6.4"],
        desc: "Produk + target penjualan harian, HPP, biaya operasional bulanan — murni dari asumsi riset.",
      },
    ],
  },
  {
    id: "hasil",
    label: "Metrik Finansial & Analisis Risiko",
    icon: "≣",
    desc: "Indikator yang dicari analis bank/investor: skor 5 aspek, BEP, pro forma, dan rasio bankable.",
    subtabs: [
      {
        id: "skor",
        label: "Skor Kelayakan 5 Aspek",
        babs: ["4"],
        desc: "Status LAYAK/CUKUP/TIDAK LAYAK — bobot khusus bisnis baru (pasar paling berat).",
      },
      {
        id: "grafik",
        label: "Grafik Proyeksi Keuangan",
        babs: ["8.1"],
        desc: "Penjualan, laba kotor, laba bersih Tahun 1–3 dari asumsi riset pasar.",
      },
      {
        id: "bep",
        label: "Kalkulator Break-even",
        babs: ["8.2"],
        desc: "Omset bulanan minimum agar tidak rugi — angka kritis untuk bisnis tanpa riwayat.",
      },
      {
        id: "payback",
        label: "Payback Period",
        babs: ["8.3"],
        desc: "Berapa lama modal awal kembali dari arus kas — pertanyaan pertama setiap pendana.",
      },
      {
        id: "pro_forma",
        label: "Laporan Pro Forma 3 Tahun",
        babs: ["8.1", "9"],
        desc: "Laba Rugi, Arus Kas, dan Neraca proyeksi yang siap diaudit pendana.",
      },
      {
        id: "bankable",
        label: "Indikator Investasi Bankable",
        babs: ["8.3"],
        desc: "NPV, IRR, Payback Period, dan DSCR dari proyeksi.",
      },
    ],
  },
  {
    id: "cetak",
    label: "Cetak Laporan Resmi",
    icon: "★",
    desc: "Finalisasi ringkasan eksekutif persuasif dan unduh proposal pendanaan.",
    highlight: true,
    subtabs: [
      {
        id: "finalisasi",
        label: "Finalisasi Ringkasan Eksekutif",
        babs: ["1"],
        desc: "Sistem menyusun ringkasan eksekutif persuasif untuk penyedia dana.",
      },
      {
        id: "unduh",
        label: "Unduh Proposal Pendanaan",
        babs: ["1-9"],
        desc: "Ekspor PDF/Word siap lampir untuk pengajuan kredit bank atau proposal investasi.",
      },
    ],
  },
];

const STAGE_LANJUTAN_TABS = [
  {
    id: "dasbor",
    label: "Dasbor & Target Pendanaan",
    icon: "◈",
    desc: "Pilih jenis bisnis, kunci profil bisnis berjalan + kinerja historis, dan parameter dana.",
    subtabs: [
      {
        id: "jenis_bisnis",
        label: "Jenis Bisnis",
        babs: ["1.1"],
        desc: "Pilih: bisnis baru dari nol, atau bisnis yang sudah berjalan. Seluruh isian & laporan menyesuaikan.",
      },
      {
        id: "identitas",
        label: "Profil Bisnis Berjalan",
        babs: ["1.1", "5.1"],
        desc: "Nama bisnis, tahun berdiri, sektor, plus profil & kompetensi pemohon dana.",
      },
      {
        id: "keuangan_eksisting",
        label: "Kinerja & Legalitas Berjalan",
        babs: ["6.0", "5.1"],
        desc: "Omset/HPP/laba bulanan riil, aset & hutang, utilisasi kapasitas, bottleneck, legalitas yang sudah dimiliki.",
      },
      {
        id: "parameter_pendanaan",
        label: "Parameter Pendanaan",
        babs: ["7.3"],
        desc: "Jenis pendanaan (KUR/Komersial/Investor/Hibah), jaminan, tenor, dan mitigasi risiko.",
      },
    ],
  },
  {
    id: "formulir",
    label: "Formulir Studi Kelayakan",
    icon: "⊞",
    desc: "Instrumen SKB pengembangan: analisis inkremental — apa yang AKAN ditambah dari baseline berjalan.",
    subtabs: [
      {
        id: "peluang",
        label: "Rencana Pengembangan Pasar",
        babs: ["2.1", "2.2", "2.3", "2.4"],
        desc: "Pasar/segmen baru sasaran pengembangan, justifikasi ekspansi, dan keunggulan yang dipertahankan.",
      },
      {
        id: "pemasaran",
        label: "Strategi Pemasaran Pengembangan",
        babs: ["3.1", "3.2", "3.3"],
        desc: "Promosi tambahan, kanal baru, dan status lokasi cabang/perluasan.",
      },
      {
        id: "alatsdm",
        label: "Tambahan Alat & Karyawan",
        babs: ["3.4", "6.3"],
        desc: "Hanya peralatan & posisi TAMBAHAN untuk pengembangan — bukan yang sudah ada.",
      },
      {
        id: "risiko",
        label: "Analisis & Mitigasi Risiko",
        babs: ["6.6"],
        desc: "5 kategori risiko pengembangan + cara bertahan — bisa diisi otomatis oleh AI sesuai sektor & bisnis Anda.",
      },
      {
        id: "kuesioner",
        label: "Komitmen Lingkungan & Sosial",
        babs: ["4"],
        critical: true,
        desc: "Komitmen ramah lingkungan & sosial — memperkuat Aspek Lingkungan di mata pendana.",
      },
    ],
  },
  {
    id: "keuangan",
    label: "Keuangan",
    icon: "◎",
    desc: "Semua input keuangan pengembangan: rincian initial investment + sumber dana, dan proyeksi pendapatan tambahan.",
    subtabs: [
      {
        id: "investasi_awal",
        label: "Initial Investment & Sumber Dana",
        babs: ["7.1", "7.2", "7.3"],
        desc: "Rincian kebutuhan dana pengembangan per item (rekomendasi harga pasar riil + AI) plus Smart Balance Check sumber dana.",
      },
      {
        id: "proyeksi",
        label: "Proyeksi Pendapatan Tambahan & Biaya",
        babs: ["6.1", "6.2", "6.4"],
        desc: "Pendapatan inkremental dari unit/produk baru, HPP, dan biaya operasional tambahan.",
      },
    ],
  },
  {
    id: "hasil",
    label: "Metrik Finansial & Analisis Risiko",
    icon: "≣",
    desc: "Skor kelayakan dengan bobot rekam jejak, konsolidasi baseline + ekspansi, dan rasio bankable.",
    subtabs: [
      {
        id: "skor",
        label: "Skor Kelayakan 5 Aspek",
        babs: ["4"],
        desc: "Status LAYAK/CUKUP/TIDAK LAYAK — bobot khusus bisnis berjalan (rekam jejak & legalitas berat).",
      },
      {
        id: "grafik",
        label: "Grafik Proyeksi Konsolidasi",
        babs: ["8.1"],
        desc: "Baseline bisnis berjalan + lompatan dari pengembangan, Tahun 1–3.",
      },
      {
        id: "payback",
        label: "Payback Modal Pengembangan",
        babs: ["8.3"],
        desc: "Berapa lama modal tambahan kembali dari laba inkremental.",
      },
      {
        id: "pro_forma",
        label: "Laporan Pro Forma 3 Tahun",
        babs: ["8.1", "9"],
        desc: "Laba Rugi, Arus Kas, dan Neraca proyeksi yang siap diaudit pendana.",
      },
      {
        id: "bankable",
        label: "Indikator Investasi Bankable",
        babs: ["8.3"],
        desc: "NPV, IRR, Payback Period, dan DSCR — diperkuat arus kas bisnis berjalan.",
      },
    ],
  },
  {
    id: "cetak",
    label: "Cetak Laporan Resmi",
    icon: "★",
    desc: "Finalisasi ringkasan eksekutif persuasif dan unduh proposal pendanaan.",
    highlight: true,
    subtabs: [
      {
        id: "finalisasi",
        label: "Finalisasi Ringkasan Eksekutif",
        babs: ["1"],
        desc: "Sistem menyusun ringkasan eksekutif persuasif untuk penyedia dana.",
      },
      {
        id: "unduh",
        label: "Unduh Proposal Pendanaan",
        babs: ["1-9"],
        desc: "Ekspor PDF/Word siap lampir untuk pengajuan kredit bank atau proposal investasi.",
      },
    ],
  },
];

// ============================================================================
// EXPORT UTAMA
// ============================================================================
export const STAGE_CODES = ["baru", "lanjutan"];

export const PATHWAY_CONFIGS = {
  baru: { ...META.baru, tabs: STAGE_BARU_TABS },
  lanjutan: { ...META.lanjutan, tabs: STAGE_LANJUTAN_TABS },
};

// ----- HELPERS (nama dipertahankan demi kompatibilitas komponen lama) -----

/** Ambil config stage berdasarkan kode "baru"|"lanjutan". */
export function getPathway(code) {
  const p = PATHWAY_CONFIGS[code];
  if (!p) throw new Error(`Stage "${code}" tidak ditemukan. Valid: baru, lanjutan.`);
  return p;
}

export function getTab(stageCode, tabId) {
  const p = getPathway(stageCode);
  return p.tabs.find((t) => t.id === tabId) || null;
}

export function getSubtab(stageCode, tabId, subtabId) {
  const t = getTab(stageCode, tabId);
  return t?.subtabs.find((s) => s.id === subtabId) || null;
}

/** Sub-tab pertama dari tab pertama — untuk default routing */
export function getDefaultRoute(stageCode) {
  const p = getPathway(stageCode);
  const firstTab = p.tabs[0];
  return { tabId: firstTab.id, subtabId: firstTab.subtabs[0].id };
}

/**
 * Saat user berganti jenis bisnis di dasbor, pastikan rute navigasi
 * tetap valid pada stage baru. Jika sub-tab aktif tidak ada di stage baru
 * (mis. "hukum" → "lanjutan"), jatuhkan ke sub-tab pertama tab tersebut.
 */
export function remapRouteForStage(stageCode, nav) {
  if (!nav) return getDefaultRoute(stageCode);
  const tab = getTab(stageCode, nav.tabId);
  if (!tab) return getDefaultRoute(stageCode);
  const sub = tab.subtabs.find((s) => s.id === nav.subtabId);
  return { tabId: tab.id, subtabId: sub ? sub.id : tab.subtabs[0].id };
}
