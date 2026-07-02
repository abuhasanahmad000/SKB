// ============================================================================
// NARRATIVE TEMPLATES — Phrase Bank & Template String untuk Rule-Based Engine
//
// File ini adalah jantung mekanisme "hemat kuota 90%". Berisi template
// kalimat yang akan dirangkai dengan fragment opsi yang user pilih (dari
// babOptions.js), tanpa memanggil AI sama sekali.
//
// Strategi placeholder: gunakan {{token}} untuk variabel dinamis.
// Contoh:
//   "Bisnis {{namaBisnis}} berlokasi di {{provinsi}}."
//   → render dengan ctx = {namaBisnis: "Kopi Senja", provinsi: "Bandung"}
//   → hasil: "Bisnis Kopi Senja berlokasi di Bandung."
// ============================================================================

/**
 * Render template dengan context object.
 * Token {{x}} diganti dengan ctx[x]. Token tak dikenal jadi "".
 */
export function render(tpl, ctx = {}) {
  if (!tpl) return "";
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const v = ctx[key];
    return v == null ? "" : String(v);
  });
}

/**
 * Rangkai beberapa kalimat menjadi paragraf rapi.
 * Menghapus spasi ganda dan menambahkan spasi antar kalimat.
 */
export function paragraph(sentences) {
  return sentences
    .filter((s) => s && s.trim().length > 0)
    .map((s) => s.trim())
    .join(" ")
    .replace(/\s+/g, " ");
}

// ============================================================================
// BAB 2: PELUANG BISNIS (OPPORTUNITY)
// ============================================================================

export const TPL_BAB_2 = {
  // 2.1 Pembuka & masalah pelanggan
  pembuka:
    "Identifikasi peluang bisnis {{namaBisnis}} di wilayah {{provinsi}} didasarkan pada observasi langsung terhadap kebutuhan masyarakat lokal yang masih belum terpenuhi.",

  // Kalimat masalah — fragment dari user pilihan disambung di sini
  masalah:
    "Beberapa permasalahan kunci yang teridentifikasi antara lain: {{masalahFragments}}.",

  // 2.2 Solusi
  solusi:
    "Sebagai respons strategis terhadap permasalahan tersebut, {{namaBisnis}} hadir dengan menawarkan rangkaian solusi konkret, yaitu {{solusiFragments}}.",

  // 2.3 Segmentasi
  segmentasi:
    "Segmentasi pasar utama yang dibidik adalah {{jenisPelanggan}} dengan karakteristik yang {{karakter}}.",

  // 2.4 Pesaing
  pesaing:
    "Dari sisi pemetaan kompetisi, {{bentukKompetisi}}. Keunggulan komparatif {{namaBisnis}} dibanding pesaing terletak pada kemampuan {{keunggulan}}.",

  penutup:
    "Dengan kombinasi tersebut, peluang penetrasi pasar di wilayah operasional dinilai signifikan dan dapat diukur secara terstruktur pada bab-bab berikutnya.",
};

// ============================================================================
// BAB 3: EKSEKUSI STRATEGI (EXECUTION)
// ============================================================================

export const TPL_BAB_3 = {
  pembuka:
    "Strategi eksekusi {{namaBisnis}} disusun secara terintegrasi mencakup empat pilar utama: pemasaran, penjualan, lokasi/fasilitas, serta teknologi dan peralatan kerja.",

  // 3.1 Pemasaran
  pemasaran:
    "Pada pilar pemasaran, strategi yang dijalankan berfokus pada {{pemasaranFragments}}.",

  pemasaranKosong:
    "Pada pilar pemasaran, strategi belum didefinisikan dan disarankan untuk diisi di tahap berikutnya untuk mengukur efektivitas marketing budget.",

  // 3.2 Penjualan
  penjualan:
    "Kanal penjualan yang diaktifkan terdiri atas {{kanalFragments}}, sehingga jangkauan transaksi tidak hanya bergantung pada satu titik kontak konsumen.",

  // 3.3 Lokasi
  lokasi:
    "Untuk aspek lokasi dan fasilitas fisik, {{namaBisnis}} {{statusFragment}}, dengan karakteristik bahwa {{karakterFragments}}.",

  // 3.4 Teknologi
  teknologi:
    "Pada sisi teknologi operasional, sistem yang digunakan mencakup {{teknologiFragments}}, memastikan transaksi tercatat rapi dan pengelolaan kas lebih akuntabel.",

  teknologiKosong:
    "Pada sisi teknologi operasional, sistem belum didefinisikan; sangat disarankan untuk minimal menyiapkan kasir digital dan QRIS agar transaksi terdokumentasi otomatis.",

  // Tabel peralatan (dirender terpisah, ini hanya kalimat pengantar)
  peralatan:
    "Adapun peralatan kerja utama yang diadakan sebagai modal aset tetap dirinci pada tabel berikut.",

  penutup:
    "Konfigurasi strategi eksekusi ini dirancang agar dapat berjalan dengan efisien dalam skala UMKM tanpa membebani biaya tetap secara berlebihan.",
};

// ============================================================================
// BAB 5: TIM & PERUSAHAAN (COMPANY & TEAM)
// ============================================================================

export const TPL_BAB_5 = {
  // 5.1 Bentuk hukum + modal
  hukumModal:
    "Secara hukum, {{bentukHukumFragment}}. {{modalFragment}}.",

  // 5.2 Struktur tim
  tim:
    "Pada masa awal pertumbuhan, struktur organisasi dirancang seefisien mungkin dan terdiri atas {{strukturFragments}}.",

  timRamping:
    "Pada masa awal pertumbuhan, struktur organisasi dirancang sangat ramping di mana pemilik bertindak langsung sebagai pimpinan manajemen sekaligus mengawasi rantai operasional harian guna menekan biaya pengeluaran tetap.",

  // 5.3 Penasihat
  penasihat:
    "Sebagai pendukung eksternal, usaha ini {{penasihatFragments}}.",

  penasihatKosong:
    "Belum terdapat penasihat eksternal formal. Disarankan untuk mengikuti minimal satu komunitas usaha atau program pendampingan dinas UMKM lokal sebagai dukungan strategis.",
};

// ============================================================================
// BAB 6: RENCANA KEUANGAN
// ============================================================================

export const TPL_BAB_6 = {
  pembuka:
    "Rencana keuangan {{namaBisnis}} disusun berdasarkan asumsi pendapatan harian per produk, pertumbuhan tahunan, struktur HPP, anggaran SDM, dan biaya operasional tetap.",

  // Tahap 1: Revenue
  revenue:
    "Dari sisi pendapatan, {{namaBisnis}} memiliki {{jumlahProduk}} produk utama dengan total proyeksi pendapatan tahun pertama sebesar {{revenueY1}}. Model penjualan menggunakan {{metodeFragments}}, dan {{growthFragment}}.",

  // Tahap 2: HPP
  hpp:
    "Struktur HPP rata-rata bisnis ini berada pada level {{hppPct}} dari harga jual, menghasilkan marjin kotor (gross margin) sekitar {{gmPct}} yang {{gmKategori}}.",

  gmKategori: {
    tinggi: "tergolong tinggi dan memberi ruang fleksibilitas untuk biaya operasional",
    sehat: "tergolong sehat untuk skala UMKM",
    tipis: "tergolong tipis sehingga efisiensi biaya operasional menjadi sangat kritis",
  },

  // Tahap 3: SDM
  sdm:
    "Anggaran SDM mencakup {{jumlahPosisi}} posisi dengan total beban personalia bulanan sebesar {{totalGajiBulanan}}, sudah memperhitungkan {{tunjanganFragment}}.",

  sdmKosong:
    "Pada tahap awal, operasional dijalankan langsung oleh pemilik tanpa karyawan tambahan untuk menekan beban tetap.",

  // Tahap 4: Opex
  opex:
    "Biaya operasional tetap bulanan diperkirakan sebesar {{totalOpexBulanan}}, mencakup pemasaran ({{marketingBulanan}}), utilitas ({{utilitasBulanan}}), sewa tempat ({{sewaBulanan}}), serta biaya cadangan/asuransi ({{cadanganBulanan}}). Penyusutan aset tetap juga dihitung otomatis dari peralatan kerja yang telah didaftarkan di Bab 3.",

  penutup:
    "Detail proyeksi 12 bulan, Laporan Laba Rugi, dan Arus Kas disajikan pada Bab 8 dan Lampiran Bab 9.",
};

// ============================================================================
// BAB 7: PENDANAAN (FUNDING & MODAL)
// ============================================================================

export const TPL_BAB_7 = {
  pembuka:
    "Struktur kebutuhan modal awal {{namaBisnis}} dirinci ke dalam dua kategori utama: biaya start-up yang habis sekali pakai dan modal aset/stok awal.",

  expenses:
    "Biaya buka pertama (start-up expenses) mencakup legalitas ({{legalAmount}}), renovasi & dekorasi ({{renovasiAmount}}), serta promosi pembukaan ({{promoAmount}}), dengan total {{totalExpenses}}.",

  assets:
    "Modal aset & stok awal terdiri dari belanja stok dagang/bahan baku awal ({{stokAmount}}) dan peralatan kerja utama ({{peralatanAmount}} — otomatis dari Bab 3), dengan total {{totalAssets}}.",

  totalKebutuhan:
    "Total kebutuhan modal awal yang harus disiapkan adalah {{totalModal}}.",

  // Sumber dana
  funding:
    "Sumber pendanaan terdiri dari modal pribadi ({{modalPribadi}}), kontribusi mitra/investor ({{modalMitra}}), serta pinjaman bank/pihak ketiga ({{modalPinjaman}}).",

  balance: {
    pas:
      "Total pendanaan tepat menutupi kebutuhan modal, sehingga neraca awal langsung seimbang tanpa kas cadangan tambahan.",
    surplus:
      "Total pendanaan melebihi kebutuhan modal sebesar {{surplus}}, dan kelebihan ini otomatis dicatat sebagai Kas Cadangan (Cash Required) di neraca awal untuk menjaga keseimbangan.",
    kurang:
      "PERHATIAN: Total pendanaan masih kurang sebesar {{kurang}} dari kebutuhan modal. Sebaiknya tambahkan pada kolom Modal Pribadi atau Pinjaman sebelum melanjutkan ke laporan.",
  },
};

// ============================================================================
// BAB 8: PRO FORMA & INDIKATOR (FINANCIAL HIGHLIGHTS)
// ============================================================================

export const TPL_BAB_8 = {
  pembuka:
    "Berdasarkan input parameter di bab-bab sebelumnya, sistem menyajikan rangkuman kinerja keuangan tiga tahun ke depan sebagai berikut.",

  highlights:
    "Total penjualan diproyeksikan tumbuh dari {{salesY1}} pada Tahun 1 menjadi {{salesY3}} pada Tahun 3. Laba kotor naik dari {{gmY1}} menjadi {{gmY3}}, sedangkan laba bersih dari {{netY1}} menjadi {{netY3}}.",

  // Break-even
  bep:
    "Berdasarkan total biaya operasional tetap sebesar {{fixedCost}} per bulan dan rata-rata marjin keuntungan produk Anda, bisnis ini akan mencapai titik impas (Break-even Point) ketika berhasil menyentuh omset penjualan minimal {{bepOmset}} per bulan. Penjualan di atas angka tersebut akan dihitung sebagai keuntungan bersih bisnis.",

  // Indikator finansial
  pbp:
    "Payback Period (PBP) modal awal diestimasikan sekitar {{pbpBulan}} bulan.",
  pbpFail:
    "Berdasarkan proyeksi kas, modal awal belum dapat kembali utuh dalam horizon proyeksi 3 tahun. Disarankan meninjau ulang asumsi pendapatan atau struktur biaya.",

  npv: {
    layak:
      "Nilai NPV proyeksi positif sebesar {{npvValue}} pada tingkat diskonto {{discountRate}}, sehingga status finansial dinyatakan LAYAK.",
    tidak:
      "Nilai NPV proyeksi negatif sebesar {{npvValue}} pada tingkat diskonto {{discountRate}}, sehingga status finansial dinyatakan TIDAK LAYAK pada konfigurasi saat ini.",
  },

  irr:
    "Internal Rate of Return (IRR) berada di angka {{irrPct}}, {{irrKategori}} dibandingkan tingkat suku bunga acuan {{benchmark}}.",

  irrKategori: {
    tinggi: "jauh di atas",
    cukup: "di atas",
    setara: "setara dengan",
    rendah: "di bawah",
  },
};

// ============================================================================
// BAB 1: RINGKASAN EKSEKUTIF (AI ONLY)
//
// CATATAN PENTING: Bab 1 di-generate AI, BUKAN rule-based. Template di sini
// adalah PROMPT untuk Gemini, BUKAN narrative output.
// AI hanya dipanggil 1x setelah semua data Bab 2-8 selesai → hemat kuota.
// ============================================================================

export const PROMPT_BAB_1 = `Kamu adalah konsultan bisnis profesional UMKM Indonesia. Tugasmu adalah menulis Ringkasan Eksekutif (Executive Summary) untuk dokumen Studi Kelayakan Bisnis berdasarkan data yang sudah dikumpulkan.

Aturan output:
- Tulis SATU narasi mengalir berbentuk 3-5 paragraf (BUKAN bullet, BUKAN daftar)
- Bahasa Indonesia formal-natural, persuasif tapi tetap faktual
- Mengalir dari: Konteks Bisnis → Masalah & Solusi → Target Pasar & Pesaing → Tim & Legalitas → Ekspektasi Finansial → Kesimpulan
- JANGAN gunakan kata "kami" untuk menyebut platform — narasi ditulis dari sudut pandang pemilik bisnis
- Total maksimal 350 kata
- Sebut nama bisnis di paragraf pertama dan paragraf penutup

Data yang sudah dikumpulkan:

{{KONTEKS_DATA}}

Mulai langsung dengan judul ringkasan dan teks narasinya.`;

// ============================================================================
// FRAGMENT JEMBATAN — kata sambung antar kalimat untuk fleksibilitas
// ============================================================================

export const CONNECTORS = {
  AND: ", serta ",
  COMMA: ", ",
  THEREFORE: ". Oleh karena itu, ",
  HOWEVER: ". Namun demikian, ",
  ADDITIONALLY: ". Selain itu, ",
  IN_LINE: ". Selaras dengan hal tersebut, ",
};
