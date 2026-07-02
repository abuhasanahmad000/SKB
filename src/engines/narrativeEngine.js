import {
  TPL_BAB_2,
  TPL_BAB_3,
  TPL_BAB_5,
  TPL_BAB_6,
  TPL_BAB_7,
  TPL_BAB_8,
  render,
  paragraph,
} from "../data/narrativeTemplates.js";
import {
  BAB_2_1_MASALAH,
  BAB_2_2_SOLUSI,
  BAB_2_3_JENIS_PELANGGAN,
  BAB_2_3_KARAKTERISTIK,
  BAB_2_4_BENTUK_KOMPETISI,
  BAB_2_4_KEUNGGULAN,
  BAB_3_1_PEMASARAN,
  BAB_3_2_KANAL,
  BAB_3_3_STATUS_TEMPAT,
  BAB_3_3_KARAKTER_LOKASI,
  BAB_3_4_TEKNOLOGI,
  BAB_5_1_BENTUK_HUKUM,
  BAB_5_2_STRUKTUR,
  BAB_5_3_PENASIHAT,
  BAB_6_1_METODE_PENJUALAN,
  BAB_6_3_TUNJANGAN,
  buildFragmentNarrative,
  findValue,
} from "../data/babOptions.js";
import { PROVINCES } from "../data/provinces.js";
import { formatRp, formatPct } from "../utils/format.js";
import {
  resolveGrowthFragment,
  deriveModalModeFragment,
  applyProdukName,
} from "./growthHelper.js";

// ============================================================================
// NARRATIVE ENGINE — Rule-Based untuk Bab 2-7
//
// Inilah mesin "hemat kuota 90%": semua narasi Bab 2-7 dirangkai dari
// template string + fragment opsi tanpa memanggil AI.
//
// AI hanya dipakai untuk Bab 1 (Ringkasan Eksekutif) di Tahap 9.
//
// API:
//   buildBab2Narrative(forms, ctx) → { paragraphs: string[] }
//   buildBab3Narrative(...)
//   buildBab5Narrative(...)
//   buildBab6Narrative(forms, financials, ctx)
//   buildBab7Narrative(forms, financials, ctx)
//   buildBab8Narrative(financials, ctx)
//   buildAllNarratives(forms, financials, pathwayCode, scoringResult)
// ============================================================================

// ----- Helper: dapatkan nama provinsi dari kode -----
function provinceName(code) {
  return PROVINCES[code]?.name || "Indonesia";
}

// ----- BAB 2: PELUANG BISNIS -----

export function buildBab2Narrative(forms, financials) {
  const peluang = forms?.peluang || {};
  const identitas = forms?.identitas || {};
  const ctx = {
    namaBisnis: identitas.namaBisnis || "Bisnis Anda",
    provinsi: provinceName(identitas.provinceCode),
  };

  const nMasalah = (peluang.masalah || []).length;
  const nSolusi = (peluang.solusi || []).length;
  const nSegmen = (peluang.jenisPelanggan || []).length;
  const nKeunggulan = (peluang.keunggulan || []).length;

  const masalahFragments = buildFragmentNarrative(BAB_2_1_MASALAH, peluang.masalah || []);
  const solusiFragments = buildFragmentNarrative(BAB_2_2_SOLUSI, peluang.solusi || []);
  const jenisPelanggan = buildFragmentNarrative(BAB_2_3_JENIS_PELANGGAN, peluang.jenisPelanggan || []);
  const karakter = buildFragmentNarrative(BAB_2_3_KARAKTERISTIK, peluang.karakteristik || []);
  const bentukKompetisi = buildFragmentNarrative(BAB_2_4_BENTUK_KOMPETISI, peluang.bentukKompetisi || []);
  const keunggulan = buildFragmentNarrative(BAB_2_4_KEUNGGULAN, peluang.keunggulan || []);

  // --- Paragraf 1: masalah pasar (akar peluang) ---
  const p1 = [
    render(TPL_BAB_2.pembuka, ctx),
    "Sebuah bisnis hanya layak didanai jika ia menjawab masalah yang nyata — bukan sekadar ide yang menarik di atas kertas.",
    masalahFragments
      ? render(TPL_BAB_2.masalah, { masalahFragments }) +
        ` Masalah-masalah ini bukan asumsi kosong: ${nMasalah >= 3 ? "ketiganya (atau lebih) saling berkaitan dan" : "masing-masing"} dialami calon pelanggan dalam keseharian, sehingga kebutuhan akan solusinya bersifat berulang, bukan musiman.`
      : "Identifikasi masalah pasar masih perlu dipertajam pada tahap berikutnya agar fondasi peluang semakin kuat.",
  ];

  // --- Paragraf 2: solusi & kecocokan masalah-solusi ---
  const p2 = [
    solusiFragments
      ? render(TPL_BAB_2.solusi, { ...ctx, solusiFragments })
      : null,
    nSolusi > 0 && nMasalah > 0
      ? `Yang membuat posisi ${ctx.namaBisnis} kuat adalah kecocokan antara masalah dan solusi (problem-solution fit): ${nSolusi} solusi yang dirancang menjawab langsung ${nMasalah} masalah yang teridentifikasi, bukan sekadar menambah fitur yang tidak diminta pasar.`
      : null,
    "Kecocokan ini penting bagi pendana karena bisnis yang lahir dari masalah nyata cenderung tidak perlu 'mengedukasi pasar' dari nol — permintaannya sudah ada, tinggal dilayani dengan benar.",
  ];

  // --- Paragraf 3: segmentasi & ukuran permintaan ---
  const y1Rev = financials?.projection?.[0]?.revenue;
  const p3 = [
    jenisPelanggan
      ? render(TPL_BAB_2.segmentasi, { jenisPelanggan, karakter: karakter || "beragam" })
      : "Segmentasi pelanggan masih bisa dipertajam agar strategi pemasaran lebih terarah.",
    nSegmen >= 2
      ? `Dengan ${nSegmen} segmen yang dibidik sekaligus, bisnis tidak menggantungkan nasib pada satu kelompok pembeli — jika satu segmen melemah, segmen lain tetap menopang arus kas.`
      : null,
    y1Rev > 0
      ? `Berdasarkan segmen tersebut dan target penjualan harian yang ditetapkan pada bab keuangan, permintaan yang berhasil ditangkap diperkirakan menghasilkan pendapatan sekitar ${formatRp(y1Rev)} pada tahun pertama — angka yang menjadi tolok ukur seberapa besar peluang ini benar-benar dimonetisasi.`
      : null,
  ];

  // --- Paragraf 4: kompetisi, keunggulan & penutup ---
  const p4 = [
    bentukKompetisi
      ? render(TPL_BAB_2.pesaing, { ...ctx, bentukKompetisi, keunggulan: keunggulan || "produk unggulan" })
      : "Pemetaan kompetisi masih perlu dilengkapi untuk mengukur posisi tawar bisnis.",
    nKeunggulan >= 2
      ? `Keunggulan ini bersifat berlapis (${nKeunggulan} lapis), sehingga pesaing yang ingin meniru harus mengejar di beberapa front sekaligus — bukan cukup menyamai satu hal saja.`
      : null,
    "Persaingan yang ada justru menjadi bukti bahwa pasarnya hidup; tugas bisnis ini bukan menghindari persaingan, melainkan memenangkannya lewat keunggulan yang sulit ditiru.",
    render(TPL_BAB_2.penutup, ctx),
  ];

  return {
    title: "BAB 2 — Analisis Peluang Bisnis",
    paragraphs: [paragraph(p1), paragraph(p2), paragraph(p3), paragraph(p4)],
  };
}

// ----- BAB 3: EKSEKUSI STRATEGI -----

export function buildBab3Narrative(forms, financials) {
  const strategi = forms?.strategi || {};
  const alatSDM = forms?.alatSDM || {};
  const identitas = forms?.identitas || {};
  const ctx = { namaBisnis: identitas.namaBisnis || "Bisnis Anda" };

  const nPemasaran = (strategi.pemasaran || []).length;
  const nKanal = (strategi.kanal || []).length;
  const nTeknologi = (alatSDM.teknologi || []).length;
  const nEquipment = (alatSDM.equipment || []).length;

  const pemasaran = buildFragmentNarrative(BAB_3_1_PEMASARAN, strategi.pemasaran || []);
  const kanal = buildFragmentNarrative(BAB_3_2_KANAL, strategi.kanal || []);
  const statusFragment =
    BAB_3_3_STATUS_TEMPAT.find((s) => s.id === strategi.statusTempat)?.fragment ||
    "menjalankan usaha pada lokasi yang sudah disiapkan";
  const karakter = buildFragmentNarrative(BAB_3_3_KARAKTER_LOKASI, strategi.karakterLokasi || []);
  const teknologi = buildFragmentNarrative(BAB_3_4_TEKNOLOGI, alatSDM.teknologi || []);

  // --- Paragraf 1: pemasaran & penjualan (mesin pendapatan) ---
  const p1 = [
    render(TPL_BAB_3.pembuka, ctx),
    "Peluang pasar yang dipetakan pada Bab 2 tidak akan menjadi pendapatan tanpa mesin eksekusi yang jelas — bab ini menjelaskan mesin tersebut.",
    pemasaran ? render(TPL_BAB_3.pemasaran, { pemasaranFragments: pemasaran }) : TPL_BAB_3.pemasaranKosong,
    kanal ? render(TPL_BAB_3.penjualan, { kanalFragments: kanal }) : null,
    nPemasaran + nKanal >= 4
      ? `Kombinasi ${nPemasaran} jalur promosi dan ${nKanal} kanal penjualan menciptakan corong yang lengkap: promosi mendatangkan calon pembeli, kanal menutup transaksinya. Jika satu jalur melemah, jalur lain mengambil alih — risiko ketergantungan pada satu pintu pendapatan ditekan sejak hari pertama.`
      : nPemasaran + nKanal >= 2
        ? "Corong pemasaran-penjualan ini masih bisa diperluas, namun fondasinya sudah cukup untuk memulai dan diukur efektivitasnya bulan demi bulan."
        : null,
  ];

  // --- Paragraf 2: lokasi (aset strategis) ---
  const p2 = [
    render(TPL_BAB_3.lokasi, { ...ctx, statusFragment, karakterFragments: karakter || "lokasi sesuai target pasar" }),
    strategi.statusTempat === "milik"
      ? "Status tempat milik sendiri adalah nilai tambah ganda: biaya tetap bulanan lebih ringan, dan aset ini sekaligus memperkuat profil jaminan di mata bank."
      : strategi.statusTempat === "sewa_tahunan"
        ? "Sewa tahunan memberi kepastian operasional minimal satu siklus penuh — cukup untuk membuktikan model bisnis sebelum komitmen yang lebih besar."
        : strategi.statusTempat === "belum_ada"
          ? "Lokasi yang belum terkunci adalah pekerjaan rumah paling mendesak, karena hampir semua komponen biaya dan proyeksi penjualan bergantung pada titik ini."
          : null,
    "Pemilihan lokasi di sini bukan keputusan estetika, melainkan keputusan ekonomi: lokasi menentukan lalu lintas pelanggan, struktur sewa, sekaligus persepsi kredibilitas usaha.",
  ];

  // --- Paragraf 3: teknologi & peralatan (tulang punggung operasional) ---
  const p3 = [
    teknologi ? render(TPL_BAB_3.teknologi, { teknologiFragments: teknologi }) : TPL_BAB_3.teknologiKosong,
    nTeknologi >= 1
      ? "Bagi pendana, sistem pencatatan digital bukan kemewahan — inilah yang membuat laporan keuangan bisa diaudit dan angka penjualan bisa diverifikasi, bukan sekadar diingat-ingat."
      : null,
    nEquipment > 0
      ? `${TPL_BAB_3.peralatan} Total ${nEquipment} item peralatan ini sekaligus menjadi komponen aset tetap pada perhitungan kebutuhan dana di bab akhir laporan.`
      : null,
    render(TPL_BAB_3.penutup, ctx),
    "Pada akhirnya, strategi eksekusi yang baik adalah yang setiap komponennya saling mengunci: pemasaran mengisi kanal, kanal memanfaatkan lokasi, dan teknologi memastikan semuanya tercatat rapi.",
  ];

  return {
    title: "BAB 3 — Strategi Eksekusi",
    paragraphs: [paragraph(p1), paragraph(p2), paragraph(p3)],
    table: alatSDM.equipment || [],
  };
}

// ----- BAB 4: SKB SCORING NARASI (sudah ada di scoringEngine) -----
// → digabung di reportAssembler dengan hasil scoringEngine

// ----- BAB 5: TIM & PERUSAHAAN -----

export function buildBab5Narrative(forms) {
  const hukum = forms?.hukum || {};
  const identitas = forms?.identitas || {};
  const alatSDM = forms?.alatSDM || {};
  const namaBisnis = identitas.namaBisnis || "Bisnis Anda";
  const bentukHukumFragment =
    BAB_5_1_BENTUK_HUKUM.find((b) => b.id === hukum.bentukHukum)?.fragment ||
    "perusahaan berbentuk usaha rintisan yang sedang dalam tahap formalisasi";
  // HOTFIX 5.5: Modal mode di-DERIVE dari forms.modal.funding (bukan ditanyakan ke user)
  const modalFragment = deriveModalModeFragment(forms);

  const struktur = buildFragmentNarrative(BAB_5_2_STRUKTUR, hukum.struktur || []);
  const penasihat = buildFragmentNarrative(BAB_5_3_PENASIHAT, hukum.penasihat || []);
  const nStruktur = (hukum.struktur || []).length;
  const kompetensi = (identitas.kompetensiPendiri || "").trim();
  const positions = alatSDM.personnel?.positions || {};
  const activePos = Object.values(positions).filter((p) => p?.active);
  const totalKaryawan = activePos.reduce((s, p) => s + (p.count || 0), 0);

  // --- Paragraf 1: badan hukum & modal ---
  const p1 = [
    "Bank dan investor pada akhirnya tidak mendanai ide — mereka mendanai orang dan badan usaha yang menjalankan ide itu. Bab ini memperkenalkan keduanya.",
    render(TPL_BAB_5.hukumModal, { bentukHukumFragment, modalFragment }),
    ["pt_perorangan", "pt_umum", "cv"].includes(hukum.bentukHukum)
      ? "Pilihan badan hukum formal ini memberi dua keuntungan sekaligus: pemisahan harta pribadi dari harta usaha, dan akses ke produk pembiayaan yang umumnya mensyaratkan legalitas badan usaha."
      : "Formalisasi badan hukum sebaiknya dijadwalkan sejak awal, karena hampir semua skema pembiayaan formal mensyaratkannya.",
  ];

  // --- Paragraf 2: pendiri (unsur Character dalam 5C) ---
  const p2 = [
    kompetensi.length > 30
      ? `Di balik badan usaha ini berdiri pemohon dengan latar belakang yang relevan: ${kompetensi}`
      : "Profil kompetensi pendiri perlu dilengkapi pada formulir — bagi analis kredit, ini adalah unsur Character yang dibaca paling awal.",
    kompetensi.length > 30
      ? "Latar belakang ini penting bukan untuk gengsi, melainkan karena pengalaman pendiri adalah jaminan tak tertulis bahwa dana yang dipercayakan dikelola oleh tangan yang paham medannya."
      : null,
  ];

  // --- Paragraf 3: struktur tim & penyerapan kerja ---
  const p3 = [
    struktur ? render(TPL_BAB_5.tim, { strukturFragments: struktur }) : TPL_BAB_5.timRamping,
    nStruktur >= 2
      ? "Pembagian peran sejak awal mencegah masalah klasik usaha kecil: semua keputusan menumpuk di satu kepala hingga bisnis tidak bisa tumbuh melampaui kapasitas pemiliknya."
      : null,
    totalKaryawan > 0
      ? `Pada lapis operasional, bisnis merekrut ${totalKaryawan} karyawan${activePos.length > 1 ? ` dalam ${activePos.length} posisi berbeda` : ""} — selain menggerakkan roda usaha, penyerapan tenaga kerja ini menjadi nilai sosial yang dihargai program pembiayaan UMKM pemerintah.`
      : null,
    penasihat ? render(TPL_BAB_5.penasihat, { penasihatFragments: penasihat }) : TPL_BAB_5.penasihatKosong,
    `Dengan susunan ini, ${namaBisnis} bukan usaha satu orang yang rapuh, melainkan organisasi kecil yang tahu siapa mengerjakan apa — fondasi yang membuat seluruh rencana pada bab-bab sebelumnya bisa benar-benar dieksekusi.`,
  ];

  return {
    title: "BAB 5 — Profil Tim & Perusahaan",
    paragraphs: [paragraph(p1), paragraph(p2), paragraph(p3)],
  };
}

// ----- BAB 6: RENCANA KEUANGAN -----

export function buildBab6Narrative(forms, financials) {
  const keuangan = forms?.keuangan || {};
  const identitas = forms?.identitas || {};
  const ctx = { namaBisnis: identitas.namaBisnis || "Bisnis Anda" };

  const products = keuangan.products || [];
  const metode = buildFragmentNarrative(BAB_6_1_METODE_PENJUALAN, keuangan.metode || []);
  // HOTFIX 5.5: growth fragment kini BPS-aware (resolve dari sectorCode)
  const growthFragment = resolveGrowthFragment(forms);

  const revenueY1 = financials?.projection?.[0]?.revenue || 0;
  const hppY1 = financials?.projection?.[0]?.hpp || 0;
  const gmPct = revenueY1 > 0 ? (revenueY1 - hppY1) / revenueY1 : 0;
  const hppPct = revenueY1 > 0 ? hppY1 / revenueY1 : 0;

  let gmKategori;
  if (gmPct >= 0.6) gmKategori = TPL_BAB_6.gmKategori.tinggi;
  else if (gmPct >= 0.35) gmKategori = TPL_BAB_6.gmKategori.sehat;
  else gmKategori = TPL_BAB_6.gmKategori.tipis;

  // SDM
  const personnel = forms?.alatSDM?.personnel || {};
  const positions = personnel.positions || {};
  const aktifPositions = Object.values(positions).filter((p) => p?.active);
  const totalGajiBulananBase = aktifPositions.reduce(
    (s, p) => s + (p.count || 0) * (p.salary || 0),
    0
  );
  const tunjPct = findValue(BAB_6_3_TUNJANGAN, personnel.allowanceMode) || 0;
  const totalGajiBulanan = totalGajiBulananBase * (1 + tunjPct);
  const tunjanganFragment =
    BAB_6_3_TUNJANGAN.find((t) => t.id === personnel.allowanceMode)?.fragment ||
    "tanpa komponen tunjangan";

  // Opex
  const opex = keuangan.opex || {};
  const totalOpexBulanan =
    (opex.marketing || 0) + (opex.utilities || 0) + (opex.rent || 0) + (opex.other || 0);

  const sentences = [
    render(TPL_BAB_6.pembuka, ctx),
    products.length > 0
      ? render(TPL_BAB_6.revenue, {
          ...ctx,
          jumlahProduk: products.length,
          revenueY1: formatRp(revenueY1),
          metodeFragments: metode || "model penjualan eceran langsung",
          growthFragment,
        })
      : null,
    products.length > 0
      ? render(TPL_BAB_6.hpp, {
          hppPct: formatPct(hppPct),
          gmPct: formatPct(gmPct),
          gmKategori,
        })
      : null,
    aktifPositions.length > 0
      ? render(TPL_BAB_6.sdm, {
          jumlahPosisi: aktifPositions.length,
          totalGajiBulanan: formatRp(totalGajiBulanan),
          tunjanganFragment,
        })
      : TPL_BAB_6.sdmKosong,
    totalOpexBulanan > 0
      ? render(TPL_BAB_6.opex, {
          totalOpexBulanan: formatRp(totalOpexBulanan),
          marketingBulanan: formatRp(opex.marketing || 0),
          utilitasBulanan: formatRp(opex.utilities || 0),
          sewaBulanan: formatRp(opex.rent || 0),
          cadanganBulanan: formatRp(opex.other || 0),
        })
      : null,
    TPL_BAB_6.penutup,
  ];

  return {
    title: "BAB 6 — Rencana Keuangan",
    paragraphs: [paragraph(sentences)],
    products,
    totalRevenueY1: revenueY1,
    gmPct,
  };
}

// ----- BAB 7: PENDANAAN (v13.1 — BAB PENUTUP/KLIMAKS PROPOSAL) -----

const JENIS_LABELS = {
  kur: { label: "Pinjaman KUR yang Diajukan", kategori: "hutang", narasi: "skema Kredit Usaha Rakyat (KUR) dengan bunga subsidi pemerintah" },
  komersial: { label: "Pinjaman Bank yang Diajukan", kategori: "hutang", narasi: "kredit komersial bank dengan bunga pasar" },
  investor: { label: "Modal Investor yang Dibutuhkan", kategori: "ekuitas", narasi: "kemitraan modal (equity) dengan investor strategis" },
  hibah: { label: "Dana Hibah yang Diajukan", kategori: "ekuitas", narasi: "program hibah/pendanaan CSR pemerintah atau lembaga sosial" },
};

export function buildBab7Narrative(forms) {
  const modal = forms?.modal || {};
  const ft = forms?.fundingTarget || {};
  const equipment = forms?.alatSDM?.equipment || [];
  const identitas = forms?.identitas || {};
  const ctx = { namaBisnis: identitas.namaBisnis || "Bisnis Anda" };

  const expenses = modal.expenses || {};
  const assets = modal.assets || {};
  const funding = modal.funding || {};
  const totalPeralatan = equipment.reduce(
    (s, e) => s + (e.qty || 0) * (e.pricePerUnit || 0),
    0
  );

  const totalExpenses = (expenses.legal || 0) + (expenses.renovasi || 0) + (expenses.promo || 0) + (expenses.lainnya || 0);
  const totalAssets = (assets.stok || 0) + totalPeralatan;
  const totalModal = totalExpenses + totalAssets;
  const totalFunding =
    (funding.modalPribadi || 0) + (funding.modalMitra || 0) + (funding.modalPinjaman || 0);
  const diff = totalFunding - totalModal;

  // ---- ANGKA YANG DIMINTA (inti laporan) ----
  const jenis = JENIS_LABELS[ft.jenisPendanaan] || null;
  const askAmount = jenis
    ? (jenis.kategori === "hutang" ? (funding.modalPinjaman || 0) : (funding.modalMitra || 0))
    : (funding.modalPinjaman || funding.modalMitra || 0);
  const selfPct = totalFunding > 0 ? Math.round(((funding.modalPribadi || 0) / totalFunding) * 100) : 0;
  const askPct = totalFunding > 0 ? Math.round((askAmount / totalFunding) * 100) : 0;

  let balanceKey, balanceVal;
  if (diff === 0 && totalFunding > 0) {
    balanceKey = "pas";
    balanceVal = TPL_BAB_7.balance.pas;
  } else if (diff > 0) {
    balanceKey = "surplus";
    balanceVal = render(TPL_BAB_7.balance.surplus, { surplus: formatRp(diff) });
  } else {
    balanceKey = "kurang";
    balanceVal = render(TPL_BAB_7.balance.kurang, { kurang: formatRp(-diff) });
  }

  // --- Paragraf 1: inti permintaan (langsung ke angka) ---
  const p1 = [
    `Seluruh analisis pada bab-bab sebelumnya — peluang pasar, strategi eksekusi, kelayakan 5 aspek, dan proyeksi keuangan — bermuara pada satu permintaan konkret di bab penutup ini.`,
    jenis && askAmount > 0
      ? `${ctx.namaBisnis} mengajukan ${jenis.label.toLowerCase()} sebesar ${formatRp(askAmount)} melalui ${jenis.narasi}${jenis.kategori === "hutang" && ft.tenor ? `, dengan tenor ${ft.tenor} bulan` : ""}.`
      : `${ctx.namaBisnis} membutuhkan pendanaan eksternal sebesar ${formatRp(askAmount)} — jenis skema pendanaan sebaiknya segera ditetapkan pada formulir Parameter Pendanaan.`,
    askAmount > 0 && totalModal > 0
      ? `Angka ini bukan tebakan: ia adalah ${askPct}% dari total kebutuhan dana ${formatRp(totalModal)} yang dirinci item per item pada tabel di bawah, sementara ${selfPct}% sisanya ditanggung sendiri oleh pemohon${(funding.modalMitra || 0) > 0 && jenis?.kategori === "hutang" ? " dan mitra" : ""} sebagai bukti komitmen.`
      : null,
  ];

  // --- Paragraf 2: rincian kebutuhan ---
  const p2 = [
    render(TPL_BAB_7.expenses, {
      legalAmount: formatRp(expenses.legal || 0),
      renovasiAmount: formatRp(expenses.renovasi || 0),
      promoAmount: formatRp(expenses.promo || 0),
      totalExpenses: formatRp(totalExpenses),
    }),
    (expenses.lainnya || 0) > 0
      ? `Di dalamnya sudah termasuk modal kerja dan cadangan tak terduga sebesar ${formatRp(expenses.lainnya)} — bantalan kas yang menjaga operasional tetap berjalan pada bulan-bulan awal sebelum omset stabil.`
      : null,
    render(TPL_BAB_7.assets, {
      stokAmount: formatRp(assets.stok || 0),
      peralatanAmount: formatRp(totalPeralatan),
      totalAssets: formatRp(totalAssets),
    }),
    render(TPL_BAB_7.totalKebutuhan, { totalModal: formatRp(totalModal) }),
  ];

  // --- Paragraf 3: struktur sumber dana & keseimbangan ---
  const p3 = [
    render(TPL_BAB_7.funding, {
      modalPribadi: formatRp(funding.modalPribadi || 0),
      modalMitra: formatRp(funding.modalMitra || 0),
      modalPinjaman: formatRp(funding.modalPinjaman || 0),
    }),
    selfPct >= 30
      ? `Porsi modal sendiri sebesar ${selfPct}% berada di atas ekspektasi umum lembaga pembiayaan (20-30%), menandakan pemohon menanggung risiko bersama pendana — bukan memindahkan seluruh risiko kepada orang lain.`
      : selfPct > 0
        ? `Porsi modal sendiri ${selfPct}% menunjukkan keterlibatan finansial pemohon; memperbesarnya akan semakin memperkuat posisi tawar di mata pendana.`
        : null,
    balanceVal,
    `Dengan struktur ini, dana yang diminta jelas jumlahnya, jelas peruntukannya (Use of Funds pada Bab 6.6), dan jelas jalan pengembaliannya (analisis DSCR pada bab yang sama) — tiga hal yang menentukan diterima atau tidaknya sebuah proposal pendanaan.`,
  ];

  return {
    title: "BAB 7 — Permintaan Pendanaan & Struktur Modal",
    paragraphs: [paragraph(p1), paragraph(p2), paragraph(p3)],
    balanceStatus: balanceKey,
    totalModal,
    totalFunding,
    // Data untuk hero "angka yang diminta" di laporan
    fundingAsk: {
      amount: askAmount,
      label: jenis?.label || "Dana Eksternal yang Dibutuhkan",
      jenisId: ft.jenisPendanaan || null,
      kategori: jenis?.kategori || null,
      tenor: ft.tenor || null,
      selfPct,
      askPct,
      totalModal,
    },
  };
}

// ----- BAB 8: PRO FORMA & INDIKATOR -----

export function buildBab8Narrative(financials) {
  if (!financials) return null;
  const { projection, bep, npv, npvVerdict, wacc, irr, irrPct, irrKategori, paybackMonths } =
    financials;

  const y1 = projection[0];
  const y3 = projection[2];

  const sentences = [
    TPL_BAB_8.pembuka,
    render(TPL_BAB_8.highlights, {
      salesY1: formatRp(y1.revenue),
      salesY3: formatRp(y3.revenue),
      gmY1: formatRp(y1.grossProfit),
      gmY3: formatRp(y3.grossProfit),
      netY1: formatRp(y1.netIncome),
      netY3: formatRp(y3.netIncome),
    }),
    bep.bepMonthlySales != null
      ? render(TPL_BAB_8.bep, {
          fixedCost: formatRp(bep.fixedCostMonthly),
          bepOmset: formatRp(bep.bepMonthlySales),
        })
      : null,
    paybackMonths != null
      ? render(TPL_BAB_8.pbp, { pbpBulan: paybackMonths })
      : TPL_BAB_8.pbpFail,
    npv != null
      ? render(TPL_BAB_8.npv[npvVerdict], {
          npvValue: formatRp(npv),
          discountRate: formatPct(wacc),
        })
      : null,
    irr != null && irrKategori
      ? render(TPL_BAB_8.irr, {
          irrPct: `${irrPct}%`,
          irrKategori: TPL_BAB_8.irrKategori[irrKategori],
          benchmark: formatPct(wacc),
        })
      : null,
  ];

  return {
    title: "BAB 8 — Pro Forma & Indikator Kelayakan",
    paragraphs: [paragraph(sentences)],
  };
}

// ----- ONE-SHOT: COMPILE SEMUA BAB NARASI -----

export function buildAllNarratives(forms, financials) {
  // HOTFIX 5.5: Ambil nama produk utama untuk substitusi "produk/jasa" → produkUtama
  const produkUtama = forms?.identitas?.produkUtama;

  const raw = {
    bab2: buildBab2Narrative(forms, financials),
    bab3: buildBab3Narrative(forms, financials),
    bab5: buildBab5Narrative(forms),
    bab6: buildBab6Narrative(forms, financials),
    bab7: buildBab7Narrative(forms),
    bab8: buildBab8Narrative(financials),
  };

  // Post-process: ganti "produk/jasa" → produkUtama di seluruh paragraf
  if (produkUtama) {
    for (const key of Object.keys(raw)) {
      const bab = raw[key];
      if (bab?.paragraphs) {
        bab.paragraphs = bab.paragraphs.map((p) => applyProdukName(p, produkUtama));
      }
    }
  }

  return raw;
}
