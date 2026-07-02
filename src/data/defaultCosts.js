// ============================================================================
// BIAYA DEFAULT 12 SEKTOR
//
// Port verbatim dari prototype v4 (bizcast-final.jsx lines 622-1053).
// Auto-fill biaya untuk semua sektor — user tidak perlu input dari nol.
//
// Struktur per sektor:
//   - assets[]   : aset tetap (mesin, peralatan, renovasi) + life (umur ekonomis)
//   - opex[]     : biaya operasional bulanan tetap
//   - legal[]    : biaya legalitas & perizinan (sekali bayar)
//   - marketing[]: biaya marketing setup awal
//   - marketingMonthly : anggaran marketing bulanan rutin
//   - personnel[]: posisi SDM standar dengan gaji + bonus + recruit/training
//   - revenue{}  : parameter pendapatan baseline (capacity, price, etc.)
//
// Field `sk` = search keyword untuk tombol "Cari di Google" (fitur prototype v4).
// Field `life` = umur ekonomis aset untuk perhitungan penyusutan.
// ============================================================================

const DEFAULT_COSTS = {
  "56304": {
    assets: [
      { name: "Mesin Espresso 2-Group", value: 25000000, life: 7, sk: "harga mesin espresso 2 group" },
      { name: "Coffee Grinder Komersial", value: 8000000, life: 5, sk: "harga coffee grinder komersial" },
      { name: "Refrigerator / Chiller", value: 8000000, life: 8, sk: "harga chiller minuman" },
      { name: "POS System & Kasir", value: 7000000, life: 5, sk: "harga mesin kasir POS kafe" },
      { name: "Meja & Kursi (set)", value: 15000000, life: 5, sk: "harga set meja kursi kafe" },
      { name: "Renovasi & Interior", value: 60000000, life: 10, sk: "biaya renovasi interior kafe per meter" },
      { name: "Signage & Branding Fisik", value: 8000000, life: 5, sk: "harga neon box signage" },
      { name: "AC & Pendukung", value: 9000000, life: 8, sk: "harga AC 1 PK" },
    ],
    opex: [
      { name: "Sewa Tempat", value: 8000000, sk: "harga sewa ruko per bulan" },
      { name: "Listrik + Air", value: 2500000, sk: "tarif listrik bisnis PLN" },
      { name: "Internet", value: 800000, sk: "harga internet bisnis dedicated" },
      { name: "Software POS langganan", value: 500000, sk: "harga langganan aplikasi POS kafe" },
      { name: "Maintenance & Supplies", value: 1500000, sk: "" },
    ],
    legal: [
      { name: "NIB (OSS)", value: 0, sk: "cara buat NIB OSS gratis" },
      { name: "Akta Pendirian CV", value: 5000000, sk: "biaya akta pendirian CV notaris" },
      { name: "Sertifikat Laik Higiene", value: 500000, sk: "biaya sertifikat laik higiene sanitasi" },
      { name: "Sertifikat Halal (SEHATI)", value: 0, sk: "cara daftar sertifikat halal gratis SEHATI" },
    ],
    marketing: [
      { name: "Branding & Logo", value: 5000000, sk: "harga jasa desain logo brand" },
      { name: "Grand Opening Campaign", value: 8000000, sk: "biaya grand opening kafe" },
    ],
    marketingMonthly: 5000000,
    personnel: [
      { position: "Owner / Manajer", count: 1, salary: 8000000, allowance: 1000000, bonus: 0, recruit: 0, training: 0, sk: "gaji manajer kafe" },
      { position: "Head Barista", count: 1, salary: 6000000, allowance: 1000000, bonus: 1, recruit: 500000, training: 2000000, sk: "gaji head barista" },
      { position: "Barista", count: 2, salary: 5000000, allowance: 800000, bonus: 1, recruit: 500000, training: 1500000, sk: "standar gaji barista" },
      { position: "Kasir", count: 1, salary: 4800000, allowance: 700000, bonus: 0.5, recruit: 300000, training: 500000, sk: "gaji kasir" },
    ],
    revenue: { capacityPerDay: 180, utilization: 0.72, price: 30000, operatingDays: 360, benchmarkMonthly: 115000000, som: 1800000000, somCapture: 0.75, unit: "cup" },
  },

  // ===== 56101 RESTORAN / RUMAH MAKAN =====
  "56101": {
    assets: [
      { name: "Peralatan Dapur (kompor, oven, hood)", value: 80000000, life: 8, sk: "harga peralatan dapur restoran" },
      { name: "Chiller & Freezer", value: 25000000, life: 8, sk: "harga freezer restoran" },
      { name: "Peralatan Makan (set)", value: 20000000, life: 3, sk: "harga peralatan makan restoran grosir" },
      { name: "POS Multi-Station", value: 15000000, life: 5, sk: "harga sistem POS restoran" },
      { name: "Meja Kursi & Furnitur", value: 35000000, life: 5, sk: "harga meja kursi restoran" },
      { name: "Renovasi & Interior", value: 120000000, life: 10, sk: "biaya renovasi restoran" },
      { name: "AC & Ventilasi", value: 18000000, life: 8, sk: "harga AC restoran" },
    ],
    opex: [
      { name: "Sewa Tempat", value: 15000000, sk: "harga sewa ruko restoran" },
      { name: "Listrik + Air + Gas", value: 6000000, sk: "tarif listrik gas restoran" },
      { name: "Internet", value: 800000, sk: "harga internet bisnis" },
      { name: "Maintenance & Supplies", value: 3000000, sk: "" },
    ],
    legal: [
      { name: "NIB (OSS)", value: 0, sk: "cara buat NIB OSS" },
      { name: "Akta Pendirian CV/PT", value: 6000000, sk: "biaya akta pendirian usaha" },
      { name: "Sertifikat Laik Higiene", value: 800000, sk: "sertifikat laik higiene restoran" },
      { name: "Sertifikat Halal (SEHATI)", value: 0, sk: "daftar sertifikat halal gratis" },
      { name: "Izin TDUP (jika perlu)", value: 1000000, sk: "izin TDUP restoran" },
    ],
    marketing: [
      { name: "Branding & Menu Design", value: 8000000, sk: "harga desain menu restoran" },
      { name: "Grand Opening & Influencer", value: 15000000, sk: "biaya promosi pembukaan restoran" },
    ],
    marketingMonthly: 8000000,
    personnel: [
      { position: "Owner / Manajer", count: 1, salary: 9000000, allowance: 1500000, bonus: 0, recruit: 0, training: 0, sk: "gaji manajer restoran" },
      { position: "Head Chef", count: 1, salary: 8000000, allowance: 1500000, bonus: 1, recruit: 1000000, training: 3000000, sk: "gaji head chef restoran" },
      { position: "Cook / Juru Masak", count: 3, salary: 4500000, allowance: 700000, bonus: 1, recruit: 500000, training: 1500000, sk: "standar gaji juru masak" },
      { position: "Pelayan / Waiter", count: 4, salary: 3500000, allowance: 600000, bonus: 0.5, recruit: 300000, training: 500000, sk: "gaji pelayan restoran" },
      { position: "Kasir", count: 1, salary: 4000000, allowance: 600000, bonus: 0.5, recruit: 300000, training: 500000, sk: "gaji kasir" },
    ],
    revenue: { capacityPerDay: 120, utilization: 0.65, price: 65000, operatingDays: 360, benchmarkMonthly: 320000000, som: 5000000000, somCapture: 0.65, unit: "porsi" },
  },

  // ===== 10710 BAKERY / ROTI & KUE =====
  "10710": {
    assets: [
      { name: "Oven Deck Komersial", value: 45000000, life: 8, sk: "harga oven roti komersial" },
      { name: "Mixer Spiral & Planetary", value: 25000000, life: 7, sk: "harga mixer roti komersial" },
      { name: "Proofer / Fermentasi", value: 15000000, life: 8, sk: "harga mesin proofer roti" },
      { name: "Display Case & Chiller", value: 18000000, life: 8, sk: "harga display case kue" },
      { name: "Loyang & Peralatan", value: 8000000, life: 3, sk: "harga loyang peralatan bakery" },
      { name: "POS & Kasir", value: 6000000, life: 5, sk: "harga mesin kasir POS" },
      { name: "Renovasi & Interior", value: 50000000, life: 10, sk: "biaya renovasi toko roti" },
    ],
    opex: [
      { name: "Sewa Tempat", value: 7000000, sk: "harga sewa ruko" },
      { name: "Listrik + Air + Gas", value: 4000000, sk: "tarif listrik gas bakery" },
      { name: "Internet", value: 600000, sk: "harga internet bisnis" },
      { name: "Maintenance & Supplies", value: 2000000, sk: "" },
    ],
    legal: [
      { name: "NIB (OSS)", value: 0, sk: "cara buat NIB OSS" },
      { name: "Akta Pendirian", value: 5000000, sk: "biaya akta pendirian usaha" },
      { name: "PIRT / BPOM", value: 500000, sk: "biaya izin PIRT" },
      { name: "Sertifikat Halal (SEHATI)", value: 0, sk: "daftar sertifikat halal gratis" },
    ],
    marketing: [
      { name: "Branding & Kemasan", value: 7000000, sk: "harga desain kemasan roti" },
      { name: "Grand Opening Campaign", value: 6000000, sk: "biaya promosi pembukaan toko" },
    ],
    marketingMonthly: 4000000,
    personnel: [
      { position: "Owner / Manajer", count: 1, salary: 8000000, allowance: 1000000, bonus: 0, recruit: 0, training: 0, sk: "gaji manajer bakery" },
      { position: "Head Baker", count: 1, salary: 6500000, allowance: 1000000, bonus: 1, recruit: 700000, training: 2500000, sk: "gaji baker roti" },
      { position: "Baker / Pastry", count: 1, salary: 4500000, allowance: 700000, bonus: 1, recruit: 400000, training: 1500000, sk: "standar gaji pastry chef" },
      { position: "Pramuniaga & Kasir", count: 2, salary: 3800000, allowance: 600000, bonus: 0.5, recruit: 300000, training: 500000, sk: "gaji pramuniaga toko" },
    ],
    revenue: { capacityPerDay: 280, utilization: 0.72, price: 18000, operatingDays: 360, benchmarkMonthly: 120000000, som: 1700000000, somCapture: 0.72, unit: "pcs" },
  },

  // ===== 47711 TOKO PAKAIAN =====
  "47711": {
    assets: [
      { name: "Rak & Display Pakaian", value: 25000000, life: 7, sk: "harga rak display toko baju" },
      { name: "Manekin & Fitting Room", value: 12000000, life: 7, sk: "harga manekin toko baju" },
      { name: "POS & Barcode System", value: 8000000, life: 5, sk: "harga sistem POS toko retail" },
      { name: "Stok Awal (inventory)", value: 80000000, life: 1, sk: "modal stok awal toko pakaian" },
      { name: "Renovasi & Interior", value: 45000000, life: 10, sk: "biaya renovasi toko pakaian" },
      { name: "AC & Lighting", value: 12000000, life: 8, sk: "harga AC dan lighting toko" },
    ],
    opex: [
      { name: "Sewa Tempat", value: 10000000, sk: "harga sewa ruko mall" },
      { name: "Listrik + Air", value: 2500000, sk: "tarif listrik toko retail" },
      { name: "Internet", value: 600000, sk: "harga internet bisnis" },
      { name: "Maintenance", value: 1000000, sk: "" },
    ],
    legal: [
      { name: "NIB (OSS)", value: 0, sk: "cara buat NIB OSS" },
      { name: "Akta Pendirian", value: 5000000, sk: "biaya akta pendirian usaha" },
      { name: "Merek Dagang (HKI)", value: 2000000, sk: "biaya daftar merek dagang HKI" },
    ],
    marketing: [
      { name: "Branding & Visual Merchandising", value: 8000000, sk: "harga jasa visual merchandising" },
      { name: "Launch & Social Ads", value: 12000000, sk: "biaya iklan instagram toko baju" },
    ],
    marketingMonthly: 6000000,
    personnel: [
      { position: "Owner / Store Manager", count: 1, salary: 7000000, allowance: 1000000, bonus: 0, recruit: 0, training: 0, sk: "gaji store manager" },
      { position: "Sales Associate", count: 3, salary: 3800000, allowance: 600000, bonus: 1, recruit: 300000, training: 800000, sk: "gaji sales toko baju" },
      { position: "Kasir & Admin", count: 1, salary: 4000000, allowance: 600000, bonus: 0.5, recruit: 300000, training: 500000, sk: "gaji kasir toko" },
    ],
    revenue: { capacityPerDay: 40, utilization: 0.55, price: 250000, operatingDays: 360, benchmarkMonthly: 165000000, som: 2200000000, somCapture: 0.70, unit: "pcs" },
  },

  // ===== 47111 MINIMARKET / KELONTONG =====
  "47111": {
    assets: [
      { name: "Rak Gondola & Display", value: 35000000, life: 8, sk: "harga rak gondola minimarket" },
      { name: "Chiller & Freezer Showcase", value: 30000000, life: 8, sk: "harga chiller showcase minimarket" },
      { name: "POS & Barcode Scanner", value: 12000000, life: 5, sk: "harga sistem POS minimarket" },
      { name: "CCTV & Security", value: 8000000, life: 5, sk: "harga cctv toko" },
      { name: "Renovasi & Interior", value: 40000000, life: 10, sk: "biaya renovasi minimarket" },
    ],
    opex: [
      { name: "Sewa Tempat", value: 9000000, sk: "harga sewa ruko minimarket" },
      { name: "Listrik + Air", value: 4500000, sk: "tarif listrik minimarket" },
      { name: "Internet", value: 600000, sk: "harga internet bisnis" },
      { name: "Maintenance", value: 1500000, sk: "" },
    ],
    legal: [
      { name: "NIB (OSS)", value: 0, sk: "cara buat NIB OSS" },
      { name: "Akta Pendirian", value: 5000000, sk: "biaya akta pendirian usaha" },
      { name: "Izin Usaha Toko Swalayan", value: 1500000, sk: "izin usaha toko swalayan IUTS" },
    ],
    marketing: [
      { name: "Branding & Signage", value: 6000000, sk: "harga signage minimarket" },
      { name: "Promo Pembukaan", value: 7000000, sk: "biaya promo pembukaan minimarket" },
    ],
    marketingMonthly: 3000000,
    personnel: [
      { position: "Owner / Manajer", count: 1, salary: 6500000, allowance: 1000000, bonus: 0, recruit: 0, training: 0, sk: "gaji manajer minimarket" },
      { position: "Kasir", count: 2, salary: 3800000, allowance: 500000, bonus: 0.5, recruit: 300000, training: 600000, sk: "gaji kasir minimarket" },
      { position: "Pramuniaga / Stocker", count: 1, salary: 3500000, allowance: 500000, bonus: 0.5, recruit: 300000, training: 400000, sk: "gaji pramuniaga minimarket" },
    ],
    revenue: { capacityPerDay: 220, utilization: 0.72, price: 48000, operatingDays: 360, benchmarkMonthly: 310000000, som: 4200000000, somCapture: 0.68, unit: "transaksi" },
  },

  // ===== 96011 LAUNDRY =====
  "96011": {
    assets: [
      { name: "Mesin Cuci Industrial (x3)", value: 45000000, life: 6, sk: "harga mesin cuci laundry industrial" },
      { name: "Pengering Industrial (x2)", value: 30000000, life: 6, sk: "harga mesin pengering laundry" },
      { name: "Setrika Uap & Boiler", value: 8000000, life: 5, sk: "harga setrika uap boiler laundry" },
      { name: "Meja Lipat & Rak", value: 6000000, life: 7, sk: "harga rak laundry" },
      { name: "POS & Sistem Antrian", value: 5000000, life: 5, sk: "harga aplikasi kasir laundry" },
      { name: "Renovasi & Instalasi Air", value: 25000000, life: 10, sk: "biaya renovasi outlet laundry" },
    ],
    opex: [
      { name: "Sewa Tempat", value: 5000000, sk: "harga sewa ruko laundry" },
      { name: "Listrik + Air", value: 4000000, sk: "tarif listrik air laundry" },
      { name: "Deterjen & Bahan", value: 3000000, sk: "harga deterjen laundry grosir" },
      { name: "Internet", value: 500000, sk: "harga internet bisnis" },
      { name: "Maintenance", value: 1000000, sk: "" },
    ],
    legal: [
      { name: "NIB (OSS)", value: 0, sk: "cara buat NIB OSS" },
      { name: "Akta Pendirian", value: 5000000, sk: "biaya akta pendirian usaha" },
      { name: "SPPL (Lingkungan)", value: 500000, sk: "biaya SPPL usaha laundry" },
    ],
    marketing: [
      { name: "Branding & Signage", value: 5000000, sk: "harga signage laundry" },
      { name: "Promo & Member Card", value: 5000000, sk: "biaya promo laundry" },
    ],
    marketingMonthly: 2500000,
    personnel: [
      { position: "Owner / Manajer", count: 1, salary: 6000000, allowance: 800000, bonus: 0, recruit: 0, training: 0, sk: "gaji manajer laundry" },
      { position: "Operator Mesin", count: 2, salary: 3500000, allowance: 500000, bonus: 0.5, recruit: 300000, training: 700000, sk: "gaji operator laundry" },
      { position: "Kasir & Admin", count: 1, salary: 3800000, allowance: 500000, bonus: 0.5, recruit: 200000, training: 400000, sk: "gaji kasir" },
    ],
    revenue: { capacityPerDay: 200, utilization: 0.70, price: 12000, operatingDays: 360, benchmarkMonthly: 62000000, som: 900000000, somCapture: 0.72, unit: "kg" },
  },

  // ===== 96022 SALON KECANTIKAN =====
  "96022": {
    assets: [
      { name: "Kursi & Cermin Salon (set)", value: 20000000, life: 5, sk: "harga set kursi cermin salon" },
      { name: "Hair Washing Station", value: 12000000, life: 8, sk: "harga kursi keramas salon" },
      { name: "Alat Treatment (dryer, catok)", value: 15000000, life: 3, sk: "harga alat salon profesional" },
      { name: "Display Produk & Reception", value: 8000000, life: 7, sk: "harga meja reception salon" },
      { name: "POS & Booking System", value: 6000000, life: 5, sk: "harga aplikasi booking salon" },
      { name: "Renovasi & Interior", value: 50000000, life: 10, sk: "biaya renovasi salon" },
      { name: "AC & Lighting", value: 10000000, life: 8, sk: "harga AC salon" },
    ],
    opex: [
      { name: "Sewa Tempat", value: 7000000, sk: "harga sewa ruko salon" },
      { name: "Listrik + Air", value: 2000000, sk: "tarif listrik salon" },
      { name: "Produk & Bahan Habis Pakai", value: 4000000, sk: "harga produk salon grosir" },
      { name: "Internet", value: 600000, sk: "harga internet bisnis" },
      { name: "Maintenance", value: 1000000, sk: "" },
    ],
    legal: [
      { name: "NIB (OSS)", value: 0, sk: "cara buat NIB OSS" },
      { name: "Akta Pendirian", value: 5000000, sk: "biaya akta pendirian usaha" },
      { name: "Sertifikat Kompetensi", value: 1000000, sk: "biaya sertifikat kompetensi salon" },
    ],
    marketing: [
      { name: "Branding & Interior Styling", value: 8000000, sk: "harga jasa branding salon" },
      { name: "Launch & Influencer", value: 10000000, sk: "biaya influencer kecantikan" },
    ],
    marketingMonthly: 4000000,
    personnel: [
      { position: "Owner / Manajer", count: 1, salary: 7000000, allowance: 1000000, bonus: 0, recruit: 0, training: 0, sk: "gaji manajer salon" },
      { position: "Senior Hair Stylist", count: 2, salary: 5000000, allowance: 1000000, bonus: 1, recruit: 700000, training: 2000000, sk: "gaji hair stylist senior" },
      { position: "Junior Stylist / Terapis", count: 2, salary: 3500000, allowance: 600000, bonus: 0.5, recruit: 400000, training: 1500000, sk: "gaji terapis kecantikan" },
      { position: "Receptionist & Kasir", count: 1, salary: 3800000, allowance: 500000, bonus: 0.5, recruit: 300000, training: 500000, sk: "gaji resepsionis salon" },
    ],
    revenue: { capacityPerDay: 25, utilization: 0.62, price: 150000, operatingDays: 348, benchmarkMonthly: 95000000, som: 1300000000, somCapture: 0.70, unit: "treatment" },
  },

  // ===== 45403 BENGKEL MOTOR =====
  "45403": {
    assets: [
      { name: "Peralatan Servis & Kompresor", value: 40000000, life: 8, sk: "harga peralatan bengkel motor" },
      { name: "Lift / Hidrolik Motor", value: 15000000, life: 8, sk: "harga lift hidrolik motor" },
      { name: "Tools & Diagnostic Set", value: 20000000, life: 5, sk: "harga tools bengkel lengkap" },
      { name: "Stok Sparepart Awal", value: 50000000, life: 1, sk: "modal stok sparepart motor" },
      { name: "POS & Sistem", value: 5000000, life: 5, sk: "harga aplikasi kasir bengkel" },
      { name: "Renovasi & Workshop", value: 35000000, life: 10, sk: "biaya renovasi bengkel motor" },
    ],
    opex: [
      { name: "Sewa Tempat", value: 6000000, sk: "harga sewa ruko bengkel" },
      { name: "Listrik + Air", value: 2000000, sk: "tarif listrik bengkel" },
      { name: "Bahan Habis Pakai (oli, dll)", value: 2500000, sk: "harga oli grosir bengkel" },
      { name: "Internet", value: 500000, sk: "harga internet bisnis" },
      { name: "Maintenance", value: 1000000, sk: "" },
    ],
    legal: [
      { name: "NIB (OSS)", value: 0, sk: "cara buat NIB OSS" },
      { name: "Akta Pendirian", value: 5000000, sk: "biaya akta pendirian usaha" },
      { name: "SPPL (Lingkungan)", value: 500000, sk: "biaya SPPL bengkel" },
    ],
    marketing: [
      { name: "Branding & Signage", value: 5000000, sk: "harga signage bengkel" },
      { name: "Promo Pembukaan", value: 5000000, sk: "biaya promo bengkel motor" },
    ],
    marketingMonthly: 2500000,
    personnel: [
      { position: "Owner / Kepala Bengkel", count: 1, salary: 7000000, allowance: 1000000, bonus: 0, recruit: 0, training: 0, sk: "gaji kepala bengkel" },
      { position: "Mekanik Senior", count: 1, salary: 4500000, allowance: 800000, bonus: 1, recruit: 500000, training: 1500000, sk: "gaji mekanik motor senior" },
      { position: "Mekanik Junior", count: 1, salary: 3500000, allowance: 600000, bonus: 0.5, recruit: 300000, training: 1000000, sk: "gaji mekanik motor" },
      { position: "Kasir & Admin Sparepart", count: 1, salary: 3800000, allowance: 500000, bonus: 0.5, recruit: 200000, training: 400000, sk: "gaji admin bengkel" },
    ],
    revenue: { capacityPerDay: 25, utilization: 0.65, price: 150000, operatingDays: 360, benchmarkMonthly: 95000000, som: 1300000000, somCapture: 0.68, unit: "servis" },
  },

  // ===== 85495 BIMBINGAN BELAJAR =====
  "85495": {
    assets: [
      { name: "Meja Kursi Belajar (set)", value: 25000000, life: 7, sk: "harga meja kursi belajar bimbel" },
      { name: "Whiteboard & Proyektor", value: 15000000, life: 5, sk: "harga proyektor kelas" },
      { name: "Komputer & Perangkat", value: 30000000, life: 4, sk: "harga komputer kelas" },
      { name: "AC & Sound System", value: 12000000, life: 8, sk: "harga AC sound system kelas" },
      { name: "Sistem LMS & Software", value: 10000000, life: 5, sk: "harga sistem LMS bimbel" },
      { name: "Renovasi & Interior", value: 40000000, life: 10, sk: "biaya renovasi ruang kelas" },
    ],
    opex: [
      { name: "Sewa Tempat", value: 6000000, sk: "harga sewa ruko bimbel" },
      { name: "Listrik + Air", value: 2500000, sk: "tarif listrik kantor" },
      { name: "Internet (cepat)", value: 1500000, sk: "harga internet fiber bisnis" },
      { name: "Modul & Bahan Ajar", value: 2000000, sk: "harga cetak modul bimbel" },
      { name: "Maintenance", value: 800000, sk: "" },
    ],
    legal: [
      { name: "NIB (OSS)", value: 0, sk: "cara buat NIB OSS" },
      { name: "Akta Pendirian", value: 5000000, sk: "biaya akta pendirian usaha" },
      { name: "Izin Operasional PKBM/Kursus", value: 2000000, sk: "izin operasional lembaga kursus" },
    ],
    marketing: [
      { name: "Branding & Website", value: 10000000, sk: "harga jasa pembuatan website bimbel" },
      { name: "Open House & Ads", value: 12000000, sk: "biaya promosi bimbel" },
    ],
    marketingMonthly: 3000000,
    personnel: [
      { position: "Owner / Direktur", count: 1, salary: 8000000, allowance: 1200000, bonus: 0, recruit: 0, training: 0, sk: "gaji direktur bimbel" },
      { position: "Tutor Senior", count: 2, salary: 5000000, allowance: 800000, bonus: 1, recruit: 500000, training: 1500000, sk: "gaji tutor bimbel" },
      { position: "Tutor Paruh Waktu", count: 2, salary: 3000000, allowance: 0, bonus: 0, recruit: 200000, training: 800000, sk: "gaji tutor part time" },
      { position: "Admin & CS", count: 1, salary: 3800000, allowance: 500000, bonus: 0.5, recruit: 300000, training: 500000, sk: "gaji admin" },
    ],
    revenue: { capacityPerDay: 110, utilization: 0.60, price: 950000, operatingDays: 12, benchmarkMonthly: 105000000, som: 1500000000, somCapture: 0.65, unit: "siswa/bulan" },
  },

  // ===== 62010 SOFTWARE DEVELOPMENT =====
  "62010": {
    assets: [
      { name: "Laptop Developer (x5)", value: 100000000, life: 4, sk: "harga laptop developer" },
      { name: "Server / Cloud Setup Awal", value: 30000000, life: 5, sk: "biaya setup server cloud" },
      { name: "Office Furniture", value: 25000000, life: 5, sk: "harga furniture kantor" },
      { name: "Meeting & Networking Equipment", value: 15000000, life: 5, sk: "harga peralatan meeting room" },
      { name: "Software Lisensi Awal", value: 20000000, life: 3, sk: "harga lisensi software development" },
    ],
    opex: [
      { name: "Sewa Kantor / Coworking", value: 10000000, sk: "harga sewa coworking space" },
      { name: "Listrik + Internet (fiber)", value: 3000000, sk: "harga internet fiber bisnis" },
      { name: "Cloud & SaaS Tools", value: 5000000, sk: "biaya cloud AWS bulanan" },
      { name: "Maintenance", value: 1000000, sk: "" },
    ],
    legal: [
      { name: "NIB (OSS)", value: 0, sk: "cara buat NIB OSS" },
      { name: "Akta Pendirian PT", value: 8000000, sk: "biaya akta pendirian PT" },
      { name: "PSE Kominfo", value: 0, sk: "cara daftar PSE Kominfo" },
      { name: "Merek Dagang (HKI)", value: 2000000, sk: "biaya daftar merek dagang" },
    ],
    marketing: [
      { name: "Branding & Website", value: 15000000, sk: "harga jasa branding startup" },
      { name: "Digital Marketing Launch", value: 20000000, sk: "biaya digital marketing B2B" },
    ],
    marketingMonthly: 8000000,
    personnel: [
      { position: "Founder / CEO", count: 1, salary: 12000000, allowance: 2000000, bonus: 0, recruit: 0, training: 0, sk: "gaji CEO startup" },
      { position: "Senior Developer", count: 2, salary: 12000000, allowance: 2000000, bonus: 1, recruit: 2000000, training: 3000000, sk: "gaji senior software engineer" },
      { position: "Junior Developer", count: 2, salary: 7000000, allowance: 1000000, bonus: 0.5, recruit: 1000000, training: 2000000, sk: "gaji junior developer" },
      { position: "UI/UX Designer", count: 1, salary: 8000000, allowance: 1000000, bonus: 0.5, recruit: 1000000, training: 1500000, sk: "gaji UI UX designer" },
    ],
    revenue: { capacityPerDay: 3, utilization: 0.70, price: 80000000, operatingDays: 12, benchmarkMonthly: 180000000, som: 3000000000, somCapture: 0.60, unit: "proyek/bulan" },
  },

  // ===== 14111 KONVEKSI / GARMEN =====
  "14111": {
    assets: [
      { name: "Mesin Jahit Industrial (x10)", value: 60000000, life: 8, sk: "harga mesin jahit industrial" },
      { name: "Mesin Obras & Overdeck", value: 25000000, life: 8, sk: "harga mesin obras industrial" },
      { name: "Mesin Potong & Sablon", value: 30000000, life: 7, sk: "harga mesin potong kain" },
      { name: "Meja Potong & Setrika", value: 12000000, life: 7, sk: "harga meja potong konveksi" },
      { name: "Stok Bahan Awal", value: 40000000, life: 1, sk: "harga kain grosir konveksi" },
      { name: "Renovasi & Workshop", value: 35000000, life: 10, sk: "biaya renovasi workshop konveksi" },
    ],
    opex: [
      { name: "Sewa Tempat", value: 7000000, sk: "harga sewa workshop konveksi" },
      { name: "Listrik + Air", value: 4000000, sk: "tarif listrik konveksi" },
      { name: "Benang & Aksesoris", value: 3000000, sk: "harga benang grosir konveksi" },
      { name: "Internet", value: 500000, sk: "harga internet bisnis" },
      { name: "Maintenance", value: 1500000, sk: "" },
    ],
    legal: [
      { name: "NIB (OSS)", value: 0, sk: "cara buat NIB OSS" },
      { name: "Akta Pendirian", value: 5000000, sk: "biaya akta pendirian usaha" },
      { name: "SPPL (Lingkungan)", value: 500000, sk: "biaya SPPL konveksi" },
    ],
    marketing: [
      { name: "Branding & Katalog", value: 6000000, sk: "harga desain katalog produk" },
      { name: "B2B Marketing & Sample", value: 10000000, sk: "biaya marketing B2B konveksi" },
    ],
    marketingMonthly: 4000000,
    personnel: [
      { position: "Owner / Manajer Produksi", count: 1, salary: 8000000, allowance: 1000000, bonus: 0, recruit: 0, training: 0, sk: "gaji manajer produksi" },
      { position: "Penjahit", count: 8, salary: 3500000, allowance: 500000, bonus: 1, recruit: 300000, training: 1000000, sk: "gaji penjahit konveksi" },
      { position: "Tukang Potong & QC", count: 2, salary: 4000000, allowance: 600000, bonus: 0.5, recruit: 300000, training: 800000, sk: "gaji tukang potong kain" },
      { position: "Admin & Marketing", count: 1, salary: 4500000, allowance: 600000, bonus: 0.5, recruit: 400000, training: 500000, sk: "gaji admin marketing" },
    ],
    revenue: { capacityPerDay: 200, utilization: 0.70, price: 65000, operatingDays: 300, benchmarkMonthly: 240000000, som: 3500000000, somCapture: 0.62, unit: "pcs" },
  },

  // ===== 01131 PERTANIAN SAYURAN =====
  "01131": {
    assets: [
      { name: "Greenhouse / Lahan Siap", value: 80000000, life: 10, sk: "biaya bangun greenhouse" },
      { name: "Sistem Irigasi & Pompa", value: 25000000, life: 8, sk: "harga sistem irigasi tetes" },
      { name: "Peralatan Tani & Traktor Mini", value: 30000000, life: 8, sk: "harga traktor mini pertanian" },
      { name: "Bibit & Pupuk Awal", value: 15000000, life: 1, sk: "harga bibit sayuran berkualitas" },
      { name: "Gudang & Cold Storage", value: 35000000, life: 10, sk: "harga cold storage sayuran" },
    ],
    opex: [
      { name: "Sewa Lahan", value: 3000000, sk: "harga sewa lahan pertanian" },
      { name: "Pupuk & Pestisida", value: 4000000, sk: "harga pupuk pertanian" },
      { name: "Listrik + Air", value: 2000000, sk: "tarif listrik air pertanian" },
      { name: "Transport & Logistik", value: 3000000, sk: "biaya logistik sayuran" },
      { name: "Maintenance", value: 1000000, sk: "" },
    ],
    legal: [
      { name: "NIB (OSS)", value: 0, sk: "cara buat NIB OSS" },
      { name: "Akta Pendirian", value: 5000000, sk: "biaya akta pendirian usaha" },
      { name: "Sertifikat Prima/Organik", value: 3000000, sk: "biaya sertifikat organik pertanian" },
    ],
    marketing: [
      { name: "Branding & Kemasan", value: 5000000, sk: "harga desain kemasan sayuran" },
      { name: "Kontrak Offtaker", value: 5000000, sk: "cara mencari offtaker sayuran" },
    ],
    marketingMonthly: 2000000,
    personnel: [
      { position: "Owner / Manajer Kebun", count: 1, salary: 6000000, allowance: 800000, bonus: 0, recruit: 0, training: 0, sk: "gaji manajer kebun" },
      { position: "Petani / Pekerja Lapangan", count: 2, salary: 3000000, allowance: 400000, bonus: 0.5, recruit: 200000, training: 500000, sk: "upah pekerja tani" },
      { position: "Admin & Penjualan", count: 1, salary: 3800000, allowance: 500000, bonus: 0.5, recruit: 300000, training: 400000, sk: "gaji admin penjualan" },
    ],
    revenue: { capacityPerDay: 350, utilization: 0.72, price: 16000, operatingDays: 300, benchmarkMonthly: 82000000, som: 1100000000, somCapture: 0.68, unit: "kg" },
  },
};

// ----- FALLBACK untuk sektor yang tidak terdaftar -----
const FALLBACK_COSTS = {
  assets: [
    { name: "Peralatan Utama", value: 50000000, life: 5, sk: "harga peralatan usaha" },
    { name: "Furniture & Fixtures", value: 15000000, life: 5, sk: "harga furniture usaha" },
    { name: "Renovasi", value: 40000000, life: 10, sk: "biaya renovasi tempat usaha" },
    { name: "POS / Sistem", value: 5000000, life: 5, sk: "harga mesin kasir" },
  ],
  opex: [
    { name: "Sewa Tempat", value: 6000000, sk: "harga sewa ruko" },
    { name: "Listrik + Air", value: 2000000, sk: "tarif listrik bisnis" },
    { name: "Internet", value: 800000, sk: "harga internet bisnis" },
    { name: "Maintenance", value: 1000000, sk: "" },
  ],
  legal: [
    { name: "NIB (OSS)", value: 0, sk: "cara buat NIB OSS" },
    { name: "Akta Pendirian", value: 5000000, sk: "biaya akta pendirian usaha" },
  ],
  marketing: [
    { name: "Branding & Logo", value: 5000000, sk: "harga jasa desain logo" },
    { name: "Launch Campaign", value: 8000000, sk: "biaya promosi pembukaan usaha" },
  ],
  marketingMonthly: 3000000,
  personnel: [
    { position: "Owner / Manajer", count: 1, salary: 6000000, allowance: 500000, bonus: 0, recruit: 0, training: 0, sk: "gaji manajer usaha" },
    { position: "Staf Operasional", count: 2, salary: 3500000, allowance: 500000, bonus: 0.5, recruit: 300000, training: 500000, sk: "gaji staf operasional" },
  ],
  revenue: { capacityPerDay: 100, utilization: 0.6, price: 50000, operatingDays: 360, benchmarkMonthly: 60000000, som: 800000000, somCapture: 0.7, unit: "unit" },
};

// ----- EXPORT -----

/**
 * Ambil deep-copy default costs untuk sektor tertentu.
 * Deep copy supaya tiap instansi state berdiri sendiri (tidak share reference).
 */
export function getDefaultCosts(code) {
  const src = DEFAULT_COSTS[code] || FALLBACK_COSTS;
  return JSON.parse(JSON.stringify(src));
}

export { DEFAULT_COSTS, FALLBACK_COSTS };
