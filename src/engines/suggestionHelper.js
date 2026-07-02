import { DEFAULT_COSTS } from "../data/defaultCosts.js";
import { getSector } from "../data/sectors.js";
import { PROVINCES, getMinWage, listCities } from "../data/provinces.js";

// ============================================================================
// SUGGESTION HELPER — Rule-Based Auto-Fill (Hotfix 6.2)
//
// Saat user pilih sektor + skala + lokasi, sistem suggest nilai realistis
// untuk equipment, gaji, opex, biaya start-up, stok. User bisa override.
//
// Sumber data: DEFAULT_COSTS (per KBLI sektor, port dari v4) + UMP provinsi.
// ============================================================================

// ----- SKALA BISNIS (Kemenkop UKM PP 7/2021) -----
export const SKALA_OPTIONS = [
  {
    id: "mikro",
    label: "Mikro — modal s.d. Rp 1 M, omzet s.d. Rp 2 M/tahun",
    fragment: "skala usaha mikro",
    scaleFactor: 1.0,
  },
  {
    id: "kecil",
    label: "Kecil — modal Rp 1 – 5 M, omzet Rp 2 – 15 M/tahun",
    fragment: "skala usaha kecil",
    scaleFactor: 2.5,
  },
  {
    id: "menengah",
    label: "Menengah — modal Rp 5 – 10 M, omzet Rp 15 – 50 M/tahun",
    fragment: "skala usaha menengah",
    scaleFactor: 6.0,
  },
  {
    id: "besar",
    label: "Besar — modal > Rp 10 M, omzet > Rp 50 M/tahun",
    fragment: "skala usaha besar",
    scaleFactor: 15.0,
  },
];

export function getSkala(id) {
  return SKALA_OPTIONS.find((s) => s.id === id);
}

/** Cek minimal data untuk rule-based suggest tersedia. */
export function canSuggest(forms) {
  return !!(forms?.identitas?.sectorCode && forms?.identitas?.skalaBisnis);
}

// ============================================================================
// SUGGESTION GENERATORS
// ============================================================================

// ----- 1. EQUIPMENT TABLE -----

/**
 * Suggest peralatan dari DEFAULT_COSTS[sectorCode].assets, scaled by skala.
 * Format DEFAULT_COSTS.assets: Array<{name, value, life, sk}>
 * Output: Array<{name, qty, pricePerUnit}>
 */
export function suggestEquipment(forms) {
  const sectorCode = forms?.identitas?.sectorCode;
  const skala = getSkala(forms?.identitas?.skalaBisnis);
  if (!sectorCode || !skala) return [];

  const cost = DEFAULT_COSTS[sectorCode];
  if (!cost?.assets) return [];

  // v13.8: BUANG item yang BUKAN peralatan dari rekomendasi.
  // DEFAULT_COSTS.assets mencampur peralatan/mesin dengan stok & renovasi —
  // padahal Stok Awal dan Renovasi/Interior sudah punya kategori sendiri di
  // tab Keuangan ▸ Initial Investment. Kalau ikut di daftar peralatan, nilainya
  // dobel (peralatan auto-mengalir ke Initial Investment + kategori stok/renovasi).
  // Daftar peralatan kini HANYA berisi alat/mesin nyata. Berlaku semua sektor
  // & bisnis baru maupun lanjutan.
  const NON_EQUIPMENT = /stok|inventory|persediaan|bahan baku|renovasi|interior|signage|instalasi|deposit|sewa/i;
  const realEquipment = cost.assets.filter((a) => !NON_EQUIPMENT.test(a.name || ""));

  // Mikro: ambil 4-5 asset utama saja; Kecil-Menengah ke atas: ambil semua
  const limit = skala.id === "mikro" ? 5 : realEquipment.length;
  return realEquipment.slice(0, limit).map((a) => ({
    name: a.name,
    qty: skala.id === "besar" ? 2 : 1,
    pricePerUnit: Math.round((a.value || 0) * Math.sqrt(skala.scaleFactor) / 100000) * 100000,
  }));
}

// ----- 2. PERSONNEL SALARIES (UMR-aware) -----

/**
 * Suggest susunan personil sesuai UMR provinsi & skala bisnis.
 */
export function suggestPersonnel(forms) {
  const provinceCode = forms?.identitas?.provinceCode;
  const skala = getSkala(forms?.identitas?.skalaBisnis);
  if (!skala) return null;

  const umr = getMinWage(provinceCode) || 3_000_000;
  const salaryFactor = { mikro: 1.0, kecil: 1.3, menengah: 1.6, besar: 2.0 }[skala.id] || 1.0;

  // Bulatkan ke ratus ribuan
  const round = (n) => Math.round(n / 100_000) * 100_000;
  const managerSalary = round(umr * 1.8 * salaryFactor);
  const cashierSalary = round(umr * 1.0 * salaryFactor);
  const produksiSalary = round(umr * 1.1 * salaryFactor);

  const headcount = {
    mikro: { manager: 1, cashier: 1, produksi: 0 },
    kecil: { manager: 1, cashier: 2, produksi: 1 },
    menengah: { manager: 2, cashier: 3, produksi: 2 },
    besar: { manager: 3, cashier: 5, produksi: 4 },
  }[skala.id] || { manager: 1, cashier: 1, produksi: 0 };

  const positions = {};
  if (headcount.manager > 0)
    positions.manager = { active: true, count: headcount.manager, salary: managerSalary };
  if (headcount.cashier > 0)
    positions.cashier = { active: true, count: headcount.cashier, salary: cashierSalary };
  if (headcount.produksi > 0)
    positions.produksi = { active: true, count: headcount.produksi, salary: produksiSalary };

  const allowanceMode = skala.id === "mikro" ? "tidak"
    : skala.id === "kecil" ? "mikro"
    : "profesional";

  return { positions, allowanceMode };
}

// ----- 3. OPEX BULANAN -----

/**
 * Suggest biaya operasional bulanan dari DEFAULT_COSTS.opex.
 * Format opex: Array<{name, value, sk}>
 */
export function suggestOpex(forms) {
  const sectorCode = forms?.identitas?.sectorCode;
  const skala = getSkala(forms?.identitas?.skalaBisnis);
  if (!sectorCode || !skala) return null;

  const cost = DEFAULT_COSTS[sectorCode];
  if (!cost?.opex) return null;

  const round = (n) => Math.round(n / 50_000) * 50_000;
  const scaleAmt = (base) => round(base * Math.sqrt(skala.scaleFactor));

  // Mapping nama opex DEFAULT_COSTS → field form
  let rent = 0, utilities = 0, marketing = 0, other = 0;
  for (const item of cost.opex) {
    const name = (item.name || "").toLowerCase();
    const v = item.value || 0;
    if (name.includes("sewa")) rent += v;
    else if (name.includes("listrik") || name.includes("air") || name.includes("internet"))
      utilities += v;
    else if (name.includes("iklan") || name.includes("marketing") || name.includes("media"))
      marketing += v;
    else other += v;
  }

  // Marketing dari section marketing (kalau ada)
  if (cost.marketing) {
    // marketing array berisi item satu kali (branding, dll) — anggap per bulan = 1/12 dari total
    const mktTotal = cost.marketing.reduce((s, m) => s + (m.value || 0), 0);
    marketing = Math.max(marketing, Math.round(mktTotal / 12));
  }

  // v13.5: kalau user sudah mengisi "Sewa Tempat di Muka" di Initial
  // Investment, sewa bulanan WAJIB konsisten = total sewa di muka / 12.
  const sewaDimukaTotal = (forms?.modal?.investmentItems || [])
    .filter((it) => it.category === "sewa_deposit")
    .reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0);
  const rentSynced = sewaDimukaTotal > 0 ? Math.round(sewaDimukaTotal / 12) : null;

  return {
    marketing: scaleAmt(marketing || 500_000),
    utilities: scaleAmt(utilities || 800_000),
    rent: rentSynced != null ? rentSynced : scaleAmt(rent || 3_000_000),
    other: scaleAmt(other || 500_000),
  };
}

// ----- 4. BIAYA START-UP -----

export function suggestStartupExpenses(forms) {
  const sectorCode = forms?.identitas?.sectorCode;
  const skala = getSkala(forms?.identitas?.skalaBisnis);
  if (!skala) return null;

  const cost = DEFAULT_COSTS[sectorCode];
  const round = (n) => Math.round(n / 100_000) * 100_000;

  // Legal: jumlah biaya legal dari array
  const legalTotal = cost?.legal
    ? cost.legal.reduce((s, l) => s + (l.value || 0), 0)
    : 2_000_000;

  // Renovasi: ambil dari assets yang mengandung "renovasi"
  let renovasiBase = 15_000_000;
  if (cost?.assets) {
    const renoItem = cost.assets.find((a) =>
      (a.name || "").toLowerCase().includes("renovasi")
    );
    if (renoItem) renovasiBase = renoItem.value;
  }

  // Promo: dari marketing
  let promoBase = 3_000_000;
  if (cost?.marketing) {
    promoBase = cost.marketing
      .filter((m) => (m.name || "").toLowerCase().includes("opening") || (m.name || "").toLowerCase().includes("grand"))
      .reduce((s, m) => s + (m.value || 0), 0);
    if (promoBase === 0) {
      // fallback: ambil 30% total marketing
      const mktTotal = cost.marketing.reduce((s, m) => s + (m.value || 0), 0);
      promoBase = Math.round(mktTotal * 0.3);
    }
  }

  return {
    legal: round(legalTotal * Math.sqrt(skala.scaleFactor)),
    renovasi: round(renovasiBase * Math.sqrt(skala.scaleFactor)),
    promo: round(promoBase * Math.sqrt(skala.scaleFactor)),
  };
}

// ----- 5. STOK AWAL -----

export function suggestStokAwal(forms) {
  const sectorCode = forms?.identitas?.sectorCode;
  const skala = getSkala(forms?.identitas?.skalaBisnis);
  if (!skala) return 0;

  const cost = DEFAULT_COSTS[sectorCode];
  // Untuk jasa biasanya 0; untuk kuliner/retail ada baseStok
  const baseStok = cost?.stokAwal || (sectorCode?.startsWith("56") ? 3_000_000 : 5_000_000);
  return Math.round(baseStok * skala.scaleFactor / 500_000) * 500_000;
}

// ============================================================================
// DEFAULT PRODUCTS per Sektor (v13.5 — harga = TITIK TENGAH pasar)
//
// Tiap produk kini punya rentang harga pasar Indonesia 2025 [min, max].
// Harga yang dipakai = titik tengah (min+max)/2, dibulatkan ke ribuan.
// Alasan: harga lama condong ke ujung MURAH sehingga proyeksi pendapatan
// rendah dan indikator (NPV/IRR/DSCR) sering "tidak bankable". Titik tengah
// mencerminkan harga jual realistis yang membuat kelayakan masuk akal.
// ============================================================================

const midPrice = (min, max) => Math.round((min + max) / 2 / 1000) * 1000;

const RAW_PRODUCTS = {
  // Warung Kopi
  "56304": [
    { name: "Espresso/Americano", dailyTarget: 25, priceRange: [15000, 30000] },
    { name: "Latte/Cappuccino", dailyTarget: 30, priceRange: [22000, 42000] },
    { name: "Roti/Pastry", dailyTarget: 20, priceRange: [12000, 28000] },
  ],
  // Rumah Makan
  "56101": [
    { name: "Paket Nasi Utama", dailyTarget: 60, priceRange: [18000, 38000] },
    { name: "Lauk Tambahan", dailyTarget: 80, priceRange: [7000, 18000] },
    { name: "Minuman", dailyTarget: 70, priceRange: [5000, 15000] },
  ],
  // Industri roti & kue
  "10710": [
    { name: "Roti Tawar/Manis", dailyTarget: 100, priceRange: [6000, 16000] },
    { name: "Kue Pesanan Khusus", dailyTarget: 8, priceRange: [120000, 350000] },
    { name: "Snack Kemasan", dailyTarget: 50, priceRange: [4000, 12000] },
  ],
  // Toko Baju/Fashion
  "47711": [
    { name: "Atasan Reguler", dailyTarget: 5, priceRange: [80000, 250000] },
    { name: "Bawahan Reguler", dailyTarget: 4, priceRange: [100000, 300000] },
    { name: "Aksesoris", dailyTarget: 10, priceRange: [25000, 90000] },
  ],
  // Minimarket
  "47111": [
    { name: "Sembako (paket transaksi)", dailyTarget: 80, priceRange: [20000, 55000] },
    { name: "Snack/Minuman", dailyTarget: 60, priceRange: [6000, 20000] },
    { name: "Toiletries/Kebutuhan Harian", dailyTarget: 30, priceRange: [12000, 40000] },
  ],
  // Laundry
  "96011": [
    { name: "Cuci Kering Lipat (per kg)", dailyTarget: 25, priceRange: [6000, 14000] },
    { name: "Cuci Setrika (per kg)", dailyTarget: 15, priceRange: [9000, 20000] },
    { name: "Cuci Khusus (boneka/sepatu)", dailyTarget: 4, priceRange: [25000, 75000] },
  ],
  // Salon Kecantikan
  "96022": [
    { name: "Potong Rambut", dailyTarget: 8, priceRange: [35000, 90000] },
    { name: "Creambath/Hair Spa", dailyTarget: 5, priceRange: [60000, 150000] },
    { name: "Pewarnaan", dailyTarget: 2, priceRange: [150000, 500000] },
  ],
  // Bengkel Motor
  "45403": [
    { name: "Servis Rutin", dailyTarget: 6, priceRange: [50000, 130000] },
    { name: "Servis Berat", dailyTarget: 2, priceRange: [250000, 700000] },
    { name: "Penjualan Sparepart", dailyTarget: 4, priceRange: [80000, 250000] },
  ],
  // Bimbel/Kursus
  "85495": [
    { name: "Paket Bimbel Bulanan (per siswa)", dailyTarget: 2, priceRange: [300000, 700000] },
    { name: "Privat 1-on-1 (per sesi)", dailyTarget: 3, priceRange: [120000, 300000] },
    { name: "Try Out/Workshop", dailyTarget: 1, priceRange: [50000, 150000] },
  ],
  // IT/Software
  "62010": [
    { name: "Website Custom (per proyek)", dailyTarget: 0.1, priceRange: [6000000, 25000000] },
    { name: "Maintenance Bulanan", dailyTarget: 0.5, priceRange: [1500000, 5000000] },
    { name: "Konsultasi (per jam)", dailyTarget: 2, priceRange: [300000, 900000] },
  ],
  // Konveksi
  "14111": [
    { name: "Seragam/Kaos (per pcs)", dailyTarget: 30, priceRange: [55000, 150000] },
    { name: "Jas/Pakaian Formal (per pcs)", dailyTarget: 3, priceRange: [300000, 800000] },
    { name: "Custom Pesanan", dailyTarget: 5, priceRange: [150000, 450000] },
  ],
  // Pertanian/Tanaman Hias
  "01131": [
    { name: "Tanaman Hias Pot Kecil", dailyTarget: 15, priceRange: [25000, 80000] },
    { name: "Tanaman Hias Pot Besar", dailyTarget: 4, priceRange: [150000, 500000] },
    { name: "Pupuk/Aksesori", dailyTarget: 10, priceRange: [20000, 60000] },
  ],
};

// Bangun DEFAULT_PRODUCTS final dengan harga = titik tengah rentang pasar.
const DEFAULT_PRODUCTS = Object.fromEntries(
  Object.entries(RAW_PRODUCTS).map(([code, list]) => [
    code,
    list.map((p) => ({
      name: p.name,
      dailyTarget: p.dailyTarget,
      price: midPrice(p.priceRange[0], p.priceRange[1]),
      priceRange: p.priceRange,
    })),
  ])
);

/**
 * Suggest 2-3 produk default sesuai sektor + skala bisnis.
 * Skala mempengaruhi target jualan (mikro: 1x; besar: ~3x baseline).
 */
export function suggestProducts(forms) {
  const sectorCode = forms?.identitas?.sectorCode;
  const skala = getSkala(forms?.identitas?.skalaBisnis);
  if (!sectorCode) return [];

  const baseline = DEFAULT_PRODUCTS[sectorCode];
  if (!baseline) return [];

  // Faktor target untuk skala (mikro 1x, kecil 1.6x, menengah 2.4x, besar 3.5x)
  const targetFactor = skala
    ? { mikro: 1.0, kecil: 1.6, menengah: 2.4, besar: 3.5 }[skala.id] || 1.0
    : 1.0;

  return baseline.map((p) => ({
    name: p.name,
    dailyTarget: Math.max(1, Math.round(p.dailyTarget * targetFactor * 10) / 10),
    price: p.price,
  }));
}



export function buildBusinessContext(forms) {
  const identitas = forms?.identitas || {};
  const sector = getSector(identitas.sectorCode);
  const skala = getSkala(identitas.skalaBisnis);
  const province = PROVINCES[identitas.provinceCode];
  const cities = listCities(identitas.provinceCode);
  const city = cities.find((c) => c.code === identitas.cityCode);
  const umr = getMinWage(identitas.provinceCode);

  return {
    namaBisnis: identitas.namaBisnis || "(belum diisi)",
    produkUtama: identitas.produkUtama || "(belum diisi)",
    sektor: sector ? `${sector.name} (${sector.group}, KBLI ${identitas.sectorCode})` : "(belum dipilih)",
    skala: skala ? skala.label : "(belum dipilih)",
    lokasi: city ? `${city.name}, ${province?.name}` : province?.name || "(belum dipilih)",
    umr: umr ? `Rp ${umr.toLocaleString("id-ID")}/bulan` : "(tidak tersedia)",
    summary: `${identitas.namaBisnis || "Bisnis"} (${identitas.produkUtama || "produk"}) — ${skala?.label || "skala belum dipilih"} di ${city?.name || province?.name || "lokasi belum dipilih"}, sektor ${sector?.name || "belum dipilih"}.`,
  };
}
