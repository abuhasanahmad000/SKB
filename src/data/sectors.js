// ============================================================================
// SEKTOR USAHA (KBLI) — 12 Sektor Populer untuk UMKM Indonesia
//
// Port dari prototype v4 (bizcast-final.jsx lines 54-67).
// KBLI = Klasifikasi Baku Lapangan Usaha Indonesia (kode 5 digit BPS).
//
// Atribut per sektor:
//   - name      : nama tampil
//   - group     : grup industri (untuk lookup ke BPS_BENCHMARK)
//   - beta      : koefisien risiko sistematis (untuk WACC CAPM)
//   - growth    : rata-rata pertumbuhan tahunan (proyeksi default)
//   - cogs      : rata-rata HPP sebagai % dari revenue
// ============================================================================

export const SECTORS = {
  "56304": { name: "Warung Kopi / Kafe",        group: "Makanan & Minuman",  beta: 0.85, growth: 0.10, cogs: 0.35 },
  "56101": { name: "Restoran / Rumah Makan",    group: "Makanan & Minuman",  beta: 0.85, growth: 0.08, cogs: 0.40 },
  "10710": { name: "Bakery / Roti & Kue",       group: "Makanan & Minuman",  beta: 0.85, growth: 0.07, cogs: 0.38 },
  "47711": { name: "Toko Pakaian",              group: "Perdagangan Eceran", beta: 0.95, growth: 0.06, cogs: 0.55 },
  "47111": { name: "Minimarket / Kelontong",    group: "Perdagangan Eceran", beta: 0.90, growth: 0.06, cogs: 0.75 },
  "96011": { name: "Laundry",                   group: "Jasa",               beta: 0.80, growth: 0.07, cogs: 0.25 },
  "96022": { name: "Salon Kecantikan",          group: "Jasa",               beta: 0.90, growth: 0.08, cogs: 0.30 },
  "45403": { name: "Bengkel Motor",             group: "Jasa",               beta: 0.90, growth: 0.06, cogs: 0.45 },
  "85495": { name: "Bimbingan Belajar",         group: "Pendidikan",         beta: 0.75, growth: 0.09, cogs: 0.20 },
  "62010": { name: "Software Development",      group: "Teknologi",          beta: 1.30, growth: 0.15, cogs: 0.20 },
  "14111": { name: "Konveksi / Garmen",         group: "Manufaktur",         beta: 0.95, growth: 0.05, cogs: 0.50 },
  "01131": { name: "Pertanian Sayuran",         group: "Pertanian",          beta: 0.70, growth: 0.04, cogs: 0.45 },
};

// ----- KATEGORI PILIHAN UMKM (untuk Bab 6 Tahap 1 sesuai Dokumen 3) -----
// User memilih dari kategori yang lebih awam, lalu sistem mapping ke KBLI.
export const UMKM_CATEGORIES = [
  {
    id: "kuliner",
    label: "Kuliner / Makanan & Minuman (F&B)",
    sectors: ["56304", "56101", "10710"],
    icon: "☕",
  },
  {
    id: "fashion",
    label: "Fashion / Toko Pakaian & Atribut",
    sectors: ["47711", "14111"],
    icon: "👕",
  },
  {
    id: "jasa",
    label: "Jasa (Kecantikan, Laundry, Servis, dll.)",
    sectors: ["96011", "96022", "45403", "85495"],
    icon: "🛠",
  },
  {
    id: "retail",
    label: "Toko Kelontong / Retail Dagang",
    sectors: ["47111"],
    icon: "🏪",
  },
  {
    id: "tek",
    label: "Teknologi / Software",
    sectors: ["62010"],
    icon: "💻",
  },
  {
    id: "tani",
    label: "Pertanian / Agribisnis",
    sectors: ["01131"],
    icon: "🌱",
  },
];

// ----- HELPERS -----

/** Ambil metadata sektor berdasarkan kode KBLI */
export function getSector(code) {
  return SECTORS[code] || null;
}

/** List semua sektor untuk dropdown */
export function listSectors() {
  return Object.entries(SECTORS).map(([code, s]) => ({ code, ...s }));
}

/** List sektor untuk kategori UMKM tertentu */
export function listSectorsByCategory(categoryId) {
  const cat = UMKM_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return [];
  return cat.sectors.map((code) => ({ code, ...SECTORS[code] }));
}
