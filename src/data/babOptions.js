// ============================================================================
// BAB OPTIONS — Pilihan Klik (Multi-Select & Dropdown) untuk Form Input
//
// Sumber: Dokumen 3 "Penyesuaian Inputan dengan Hasil Laporan Rencana Bisnis"
//
// Struktur tiap opsi:
//   - id        : kunci untuk simpan di state
//   - label     : teks yang ditampilkan di checkbox/dropdown
//   - fragment  : kalimat narasi yang akan disambung ke laporan (rule-based)
//
// Field `fragment` adalah bagian inti — saat user mencentang opsi, sistem
// akan mengambil fragment dan menggabungkannya menjadi paragraf narasi
// tanpa memanggil AI. Inilah jantung mekanisme "hemat kuota 90%".
// ============================================================================

// ============================================================================
// BAB 2: PELUANG BISNIS (OPPORTUNITY)
// ============================================================================

// ----- 2.1 MASALAH PELANGGAN (multi-select) -----
export const BAB_2_1_MASALAH = [
  {
    id: "lokasi_kosong",
    label: "Lokasi sekitar belum ada yang menjual produk/jasa sejenis.",
    fragment:
      "lokasi operasional belum memiliki kompetitor langsung yang menyediakan produk/jasa sejenis, sehingga terbuka peluang menjadi pelopor di area tersebut",
  },
  {
    id: "harga_kompetitor_mahal",
    label: "Harga kompetitor yang ada terlalu mahal bagi masyarakat lokal.",
    fragment:
      "harga produk yang ditawarkan kompetitor saat ini dirasa kurang terjangkau bagi daya beli masyarakat lokal",
  },
  {
    id: "kualitas_kurang",
    label: "Kualitas produk/jasa yang ada di pasar kurang memuaskan.",
    fragment:
      "kualitas produk/jasa yang tersedia di pasar saat ini masih di bawah ekspektasi konsumen dan menyisakan ruang untuk perbaikan signifikan",
  },
  {
    id: "pelayanan_lambat",
    label: "Proses pelayanan kompetitor lambat atau kurang ramah.",
    fragment:
      "proses pelayanan yang ditawarkan kompetitor sering dikeluhkan karena lambat atau kurang ramah, sehingga pengalaman pelanggan menurun",
  },
  {
    id: "tren_belum_masuk",
    label: "Produk sejenis yang tren di kota besar belum masuk ke wilayah ini.",
    fragment:
      "tren produk/jasa yang telah populer di kota-kota besar belum tersedia di wilayah ini, sehingga ada permintaan yang belum terpenuhi",
  },
];

// ----- 2.2 SOLUSI KAMI (multi-select) -----
export const BAB_2_2_SOLUSI = [
  {
    id: "kualitas_harga",
    label: "Menyediakan produk berkualitas tinggi dengan harga yang tetap terjangkau.",
    fragment:
      "menghadirkan produk berkualitas tinggi dengan harga yang tetap terjangkau bagi pasar lokal",
  },
  {
    id: "variasi_unik",
    label: "Menghadirkan variasi produk unik yang belum pernah ada di lokasi sekitar.",
    fragment:
      "memperkenalkan variasi produk unik yang belum tersedia di sekitar lokasi operasional",
  },
  {
    id: "layanan_unggul",
    label: "Memberikan layanan pelanggan yang unggul, ramah, dan cepat.",
    fragment:
      "menerapkan standar layanan pelanggan yang unggul, ramah, dan cepat sebagai diferensiator utama",
  },
  {
    id: "konsep_modern",
    label: "Menggunakan konsep tempat/kemasan yang modern dan menarik perhatian.",
    fragment:
      "merancang konsep tempat dan kemasan modern yang menarik perhatian segmen target",
  },
  {
    id: "akses_mudah",
    label: "Membuka akses pembelian yang lebih mudah (Bisa pesan online/delivery).",
    fragment:
      "membuka akses pembelian yang lebih mudah melalui sistem pesan online maupun layanan pengantaran",
  },
];

// ----- 2.3 SEGMENTASI PASAR -----
export const BAB_2_3_JENIS_PELANGGAN = [
  { id: "anak_remaja", label: "Anak-anak & Remaja (Generasi Z/Alpha).", fragment: "anak-anak dan remaja dari Generasi Z/Alpha" },
  { id: "mahasiswa",   label: "Mahasiswa & Pelajar.", fragment: "mahasiswa dan pelajar di area sekitar institusi pendidikan" },
  { id: "karyawan",    label: "Karyawan Kantoran / Pekerja Sibuk.", fragment: "karyawan kantoran dan pekerja sibuk yang mengutamakan efisiensi" },
  { id: "ibu_keluarga", label: "Ibu Rumah Tangga & Keluarga Muda.", fragment: "ibu rumah tangga dan keluarga muda di kawasan pemukiman" },
  { id: "komunitas",   label: "Komunitas Hobis / Spesifik (Contoh: Skateboarder, Pecinta Kuliner).", fragment: "komunitas hobi atau minat spesifik yang loyal terhadap niche tertentu" },
];

export const BAB_2_3_KARAKTERISTIK = [
  { id: "harga_murah",       label: "Mencari harga murah dan promo ekonomis.",                    fragment: "mengutamakan harga murah dan responsif terhadap promo ekonomis" },
  { id: "kualitas_gengsi",   label: "Mengutamakan kualitas, estetika, dan gengsi (mengikuti tren).", fragment: "mengutamakan kualitas, estetika, serta gengsi sebagai bagian dari gaya hidup" },
  { id: "kecepatan_praktis", label: "Mengutamakan kecepatan dan kepraktisan.",                    fragment: "menempatkan kecepatan dan kepraktisan layanan sebagai prioritas utama" },
];

// ----- 2.4 ANALISIS PESAING -----
export const BAB_2_4_BENTUK_KOMPETISI = [
  { id: "tradisional_lokal",  label: "Toko/Bisnis Tradisional lokal yang sudah lama berdiri namun belum modern.", fragment: "kompetisi terbesar berasal dari toko/bisnis tradisional lokal yang telah lama berdiri namun belum mengadopsi pendekatan modern" },
  { id: "waralaba_besar",     label: "Bisnis Waralaba (Franchise) besar yang sudah memiliki nama.",                fragment: "kompetisi berasal dari bisnis waralaba besar yang sudah memiliki brand recognition" },
  { id: "belum_ada_pesaing",  label: "Belum ada pesaing langsung di radius lokasi operasional.",                  fragment: "tidak ditemukan pesaing langsung di radius lokasi operasional, sehingga usaha berpeluang menjadi pemimpin pasar lokal" },
];

export const BAB_2_4_KEUNGGULAN = [
  { id: "variasi_tren",   label: "Produk kita lebih bervariasi dan selalu mengikuti tren terbaru.", fragment: "memiliki variasi produk yang lebih kaya dan responsif terhadap tren terbaru" },
  { id: "harga_bersahabat", label: "Harga kita lebih bersahabat untuk kantong masyarakat sekitar.", fragment: "menawarkan harga yang lebih bersahabat bagi daya beli masyarakat sekitar" },
  { id: "pelayanan_personal", label: "Pelayanan kita lebih personal dan mengutamakan kenyamanan konsumen.", fragment: "menyediakan pelayanan yang lebih personal dan mengutamakan kenyamanan konsumen" },
];

// ============================================================================
// BAB 3: EKSEKUSI STRATEGI (EXECUTION)
// ============================================================================

// ----- 3.1 STRATEGI PEMASARAN (multi-select) -----
export const BAB_3_1_PEMASARAN = [
  { id: "medsos_konten",     label: "Media Sosial & Konten — Konten aktif di TikTok, Instagram, atau Facebook.",         fragment: "membangun kehadiran organik di TikTok, Instagram, dan Facebook melalui konten berkala" },
  { id: "komunitas_event",   label: "Pemasaran Berbasis Komunitas/Event — Sponsor kegiatan lokal/arisan/kompetisi.",      fragment: "mensponsori kegiatan komunitas lokal, arisan, atau kompetisi sebagai pintu masuk brand ke pasar sekitar" },
  { id: "cetak_tradisional", label: "Promo Cetak Tradisional — Brosur, spanduk/banner, stiker promosi.",                  fragment: "menjalankan promosi tradisional dalam bentuk brosur, spanduk, dan stiker untuk meraih segmen non-digital" },
  { id: "iklan_digital",     label: "Iklan Berbayar Digital — Instagram Ads atau Facebook Ads radius lokal.",            fragment: "memanfaatkan iklan berbayar digital (Instagram Ads/Facebook Ads) dengan targeting radius lokasi" },
  { id: "grand_opening",     label: "Promosi Pembukaan (Grand Opening) — Diskon, Buy 1 Get 1, voucher gratis.",           fragment: "menyiapkan kampanye Grand Opening berisi diskon pembuka, promo Buy 1 Get 1, dan voucher gratis untuk menarik trial pertama" },
];

// ----- 3.2 KANAL PENJUALAN (multi-select) -----
export const BAB_3_2_KANAL = [
  { id: "walk_in",  label: "Penjualan Langsung di Toko (Walk-in).",                                        fragment: "mengandalkan penjualan langsung di outlet fisik (walk-in)" },
  { id: "delivery", label: "Layanan Pesan Antar Online (GoFood, GrabFood, ShopeeFood, WhatsApp Business).", fragment: "membuka layanan pesan antar melalui platform delivery seperti GoFood, GrabFood, dan ShopeeFood serta WhatsApp Business" },
  { id: "marketplace", label: "E-commerce & Marketplace (Shopee, Tokopedia, Lazada, TikTok Shop).",          fragment: "menghadirkan toko di marketplace Shopee, Tokopedia, Lazada, dan TikTok Shop untuk jangkauan nasional" },
];

// ----- 3.3 STATUS KEPEMILIKAN TEMPAT (dropdown single) -----
export const BAB_3_3_STATUS_TEMPAT = [
  { id: "sewa_bulanan", label: "Sewa Bulanan",       fragment: "menyewa tempat usaha dengan skema sewa bulanan" },
  { id: "sewa_tahunan", label: "Sewa Tahunan",       fragment: "menyewa tempat usaha dengan skema kontrak tahunan" },
  { id: "milik_sendiri", label: "Milik Sendiri",     fragment: "menggunakan tempat usaha berstatus milik sendiri sehingga tidak ada beban sewa" },
  { id: "dari_rumah",   label: "Usaha dari Rumah",   fragment: "menjalankan usaha langsung dari rumah pribadi untuk menekan biaya operasional" },
];

// ----- 3.3 KARAKTERISTIK LOKASI (multi-select) -----
export const BAB_3_3_KARAKTER_LOKASI = [
  { id: "pinggir_jalan",  label: "Terletak di pinggir jalan raya utama yang ramai dilewati kendaraan.",      fragment: "lokasi berada di pinggir jalan raya utama dengan kepadatan lalu lintas tinggi" },
  { id: "pusat_belanja",  label: "Berada di kawasan pusat perbelanjaan, mal, atau pasar retail.",            fragment: "lokasi berada di kawasan pusat perbelanjaan/mal/pasar retail dengan traffic pengunjung organik" },
  { id: "dekat_sekolah",  label: "Dekat dengan area sekolah, kampus, atau pusat perkantoran.",                fragment: "lokasi dekat dengan area sekolah, kampus, atau pusat perkantoran sehingga akses ke target pasar relevan" },
  { id: "pemukiman_padat", label: "Berada di dalam area pemukiman padat penduduk / perumahan warga.",         fragment: "lokasi berada di tengah area pemukiman padat penduduk dengan basis konsumen rumah tangga" },
];

// ----- 3.4 SISTEM TEKNOLOGI (multi-select) -----
export const BAB_3_4_TEKNOLOGI = [
  { id: "pos_digital", label: "Aplikasi Kasir Digital / POS (Moka, Majoo, Olsera).",      fragment: "mengadopsi aplikasi kasir digital (POS) seperti Moka, Majoo, atau Olsera untuk transparansi transaksi" },
  { id: "edc",         label: "Mesin EDC untuk pembayaran non-tunai (Debit/Kredit).",     fragment: "menyediakan mesin EDC untuk pembayaran non-tunai (debit/kredit)" },
  { id: "qris",        label: "Sistem pembayaran QRIS otomatis untuk e-wallet.",          fragment: "mengaktifkan sistem QRIS otomatis untuk menerima pembayaran dari berbagai e-wallet (GoPay, OVO, Dana, ShopeePay)" },
];

// ============================================================================
// BAB 5: TIM & PERUSAHAAN
// ============================================================================

// ----- 5.1 BENTUK HUKUM (dropdown single) -----
export const BAB_5_1_BENTUK_HUKUM = [
  { id: "perorangan",   label: "Perorangan (Belum Berbadan Hukum)",            fragment: "perusahaan ini berbentuk usaha perorangan yang belum berbadan hukum formal, cocok untuk skala awal mikro" },
  { id: "pt_perorangan", label: "PT Perorangan (Sangat cocok untuk UMKM baru)", fragment: "perusahaan ini terdaftar sebagai PT Perorangan, bentuk badan hukum modern yang ramah bagi pelaku UMKM di Indonesia" },
  { id: "cv",           label: "Persekutuan Komanditer (CV)",                  fragment: "perusahaan ini berbentuk Persekutuan Komanditer (CV) dengan struktur sekutu aktif dan pasif" },
  { id: "pt_umum",      label: "Perseroan Terbatas (PT Umum)",                 fragment: "perusahaan ini berbentuk Perseroan Terbatas (PT) dengan modal yang dipisah dari kekayaan pribadi pendiri" },
  { id: "ud_firma",     label: "Usaha Dagang (UD) / Firma",                    fragment: "perusahaan ini berbentuk Usaha Dagang (UD) / Firma dengan tanggung jawab tidak terbatas" },
];

// ----- 5.1 KEPEMILIKAN MODAL (radio single) -----
export const BAB_5_1_MODAL = [
  { id: "mandiri",  label: "Modal Mandiri — 100% didanai dan dimiliki oleh pendiri tunggal.",                                fragment: "struktur kepemilikan modal bersifat tunggal di mana pendiri mengendalikan 100% hak suara dan keputusan bisnis" },
  { id: "kemitraan", label: "Modal Bersama/Kemitraan — Dimiliki bersama beberapa orang/mitra dengan kesepakatan tertulis.", fragment: "modal usaha dimiliki bersama oleh beberapa mitra dengan pembagian berdasarkan kesepakatan tertulis yang sah" },
];

// ----- 5.2 STRUKTUR ORGANISASI (multi-select) -----
export const BAB_5_2_STRUKTUR = [
  { id: "owner",       label: "Pendiri/Pemilik (Owner) — Modal, arah bisnis, keputusan tertinggi.",          fragment: "Pendiri/Pemilik (Owner) yang bertanggung jawab atas modal, arah strategis, dan keputusan tertinggi" },
  { id: "operasional", label: "Bagian Operasional/Produksi — Membuat produk atau melayani jasa harian.",     fragment: "Bagian Operasional/Produksi yang membuat produk atau melayani jasa harian" },
  { id: "pemasaran",   label: "Bagian Pemasaran & Penjualan — Pelanggan, medsos, kasir.",                    fragment: "Bagian Pemasaran & Penjualan yang menangani akuisisi pelanggan, media sosial, dan layanan kasir" },
  { id: "keuangan",    label: "Bagian Keuangan/Admin — Pemasukan, pengeluaran, stok.",                       fragment: "Bagian Keuangan/Admin yang mencatat pemasukan, pengeluaran, serta mengelola stok barang dagang" },
];

// ----- 5.3 PENASIHAT (multi-select, optional) -----
export const BAB_5_3_PENASIHAT = [
  { id: "mentor",     label: "Mentor/Konsultan Bisnis — Praktisi, inkubator kampus, dinas UMKM.",        fragment: "didampingi oleh mentor atau konsultan bisnis dari praktisi berpengalaman, inkubator kampus, atau dinas UMKM setempat" },
  { id: "komunitas",  label: "Komunitas Usaha — Asosiasi pengusaha lokal/komunitas bisnis sejenis.",      fragment: "tergabung dalam komunitas usaha atau asosiasi pengusaha lokal untuk pertukaran informasi pasar" },
  { id: "keluarga",   label: "Keluarga & Kerabat — Pengawasan moral dan bantuan pemikiran strategis.",   fragment: "memperoleh dukungan moral dan strategis dari lingkaran keluarga dan kerabat dekat" },
];

// ============================================================================
// BAB 6: RENCANA KEUANGAN
// ============================================================================

// ----- 6.1 METODE PENJUALAN (multi-select) -----
export const BAB_6_1_METODE_PENJUALAN = [
  { id: "eceran",       label: "Penjualan Satuan / Eceran (Retail).",                       fragment: "model penjualan eceran/satuan langsung ke konsumen akhir" },
  { id: "grosir",       label: "Penjualan Grosir / Paket Bisnis.",                          fragment: "model penjualan grosir dalam paket besar dengan margin per unit lebih tipis namun volume tinggi" },
  { id: "subscription", label: "Sistem Berlangganan (Subscription / Jasa Bulanan).",        fragment: "model berlangganan/subscription untuk pendapatan berulang setiap bulan" },
];

// ----- 6.1 TARGET PERTUMBUHAN TAHUNAN (dropdown) -----
export const BAB_6_1_GROWTH = [
  { id: "10", label: "10% — Konservatif",            value: 0.10, fragment: "asumsi pertumbuhan konservatif sebesar 10% per tahun" },
  { id: "15", label: "15% — Moderat",                value: 0.15, fragment: "asumsi pertumbuhan moderat sebesar 15% per tahun" },
  { id: "25", label: "25% — Agresif",                value: 0.25, fragment: "asumsi pertumbuhan agresif sebesar 25% per tahun mengikuti tren ekspansi" },
];

// ----- 6.2 HPP / COGS (dropdown per produk) -----
export const BAB_6_2_HPP = [
  { id: "25", label: "25% dari Harga Jual — Jasa atau produk margin sangat tinggi", value: 0.25 },
  { id: "40", label: "40% dari Harga Jual — Standar kuliner/makanan olahan sendiri", value: 0.40 },
  { id: "60", label: "60% dari Harga Jual — Standar toko baju, retail, atau reseller", value: 0.60 },
  { id: "75", label: "75% dari Harga Jual — Agen besar / barang grosir margin tipis", value: 0.75 },
];

// ----- 6.3 POSISI SDM (multi-select dengan input angka) -----
export const BAB_6_3_POSISI_SDM = [
  { id: "manager",   label: "Pemilik / Manajer Toko (Manager)",                  fragment: "Pemilik/Manajer Toko" },
  { id: "cashier",   label: "Staf Penjualan / Kasir (Cashier/Clerk)",             fragment: "Staf Penjualan/Kasir" },
  { id: "produksi",  label: "Staf Produksi / Kurir / Serabutan",                 fragment: "Staf Produksi/Kurir/Serabutan" },
];

// ----- 6.3 TUNJANGAN & PAJAK PAYROLL (dropdown single) -----
export const BAB_6_3_TUNJANGAN = [
  { id: "tidak",        label: "Tidak Ada — Hanya gaji pokok bersih.",                                                value: 0,    fragment: "tanpa komponen tunjangan tambahan, hanya gaji pokok bersih" },
  { id: "mikro",        label: "Ada — Standar Mikro (+10% untuk THR/tunjangan harian).",                              value: 0.10, fragment: "tambahan 10% untuk cadangan THR dan tunjangan harian sesuai standar UMKM mikro" },
  { id: "profesional",  label: "Ada — Standar Profesional (+15% untuk pajak payroll & BPJS).",                        value: 0.15, fragment: "tambahan 15% untuk pajak payroll dan BPJS sesuai standar laporan keuangan profesional" },
];

// ============================================================================
// HELPER: gabung fragment dari array opsi yang DIPILIH user
// ============================================================================

/**
 * Build narasi dari opsi yang user pilih.
 *
 * @param {Array} optionList   - Daftar opsi (mis. BAB_2_1_MASALAH)
 * @param {Array<string>} selectedIds - ID opsi yang dicentang user
 * @param {Object} opts        - Opsi tambahan
 *   - opts.connector : kata sambung antar fragment (default: ", ")
 *   - opts.lastConnector : kata sambung sebelum item terakhir (default: ", serta ")
 *   - opts.prefix : awalan kalimat
 *   - opts.suffix : akhiran kalimat
 *
 * @returns {string} Rangkaian narasi atau string kosong.
 */
export function buildFragmentNarrative(optionList, selectedIds, opts = {}) {
  const {
    connector = ", ",
    lastConnector = ", serta ",
    prefix = "",
    suffix = "",
  } = opts;

  if (!Array.isArray(selectedIds) || selectedIds.length === 0) return "";

  const fragments = selectedIds
    .map((id) => optionList.find((o) => o.id === id)?.fragment)
    .filter(Boolean);

  if (fragments.length === 0) return "";
  if (fragments.length === 1) return `${prefix}${fragments[0]}${suffix}`;

  const head = fragments.slice(0, -1).join(connector);
  const tail = fragments.at(-1);
  return `${prefix}${head}${lastConnector}${tail}${suffix}`;
}

/** Cari label opsi berdasarkan id (untuk display) */
export function findLabel(optionList, id) {
  return optionList.find((o) => o.id === id)?.label || "";
}

/** Cari value numerik (untuk dropdown growth/HPP/tunjangan) */
export function findValue(optionList, id) {
  return optionList.find((o) => o.id === id)?.value;
}
