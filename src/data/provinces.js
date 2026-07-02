// ============================================================================
// PROVINSI & UMP/UMK INDONESIA
//
// Port dari prototype v4 (bizcast-final.jsx lines 27-52).
// Data UMP 2025 + UMK kota-kota utama untuk provinsi yang relevan.
// Inflasi: rata-rata historis per provinsi (BPS 3-tahun terakhir).
//
// Di Tahap 8, data ini akan di-augment dengan API BPS untuk angka live.
// Untuk sekarang: pakai data statis sebagai baseline.
// ============================================================================

export const PROVINCES = {
  "11": { name: "Aceh", ump: 3685615, inflation: 0.028 },
  "12": { name: "Sumatera Utara", ump: 2992599, inflation: 0.027 },
  "13": { name: "Sumatera Barat", ump: 2994193, inflation: 0.028 },
  "14": { name: "Riau", ump: 3508776, inflation: 0.026 },
  "15": { name: "Jambi", ump: 3234535, inflation: 0.027 },
  "16": { name: "Sumatera Selatan", ump: 3681571, inflation: 0.027 },
  "17": { name: "Bengkulu", ump: 2670039, inflation: 0.029 },
  "18": { name: "Lampung", ump: 2893070, inflation: 0.028 },
  "19": { name: "Kep. Bangka Belitung", ump: 3876600, inflation: 0.026 },
  "21": { name: "Kepulauan Riau", ump: 3623624, inflation: 0.026 },
  "31": {
    name: "DKI Jakarta",
    ump: 5396761,
    inflation: 0.025,
    cities: [
      { code: "3171", name: "Jakarta Pusat", umk: 5396761 },
      { code: "3174", name: "Jakarta Selatan", umk: 5396761 },
      { code: "3173", name: "Jakarta Barat", umk: 5396761 },
      { code: "3172", name: "Jakarta Utara", umk: 5396761 },
      { code: "3175", name: "Jakarta Timur", umk: 5396761 },
    ],
  },
  "32": {
    name: "Jawa Barat",
    ump: 2191232,
    inflation: 0.028,
    cities: [
      { code: "3275", name: "Kota Bekasi", umk: 5690753 },
      { code: "3216", name: "Kab. Bekasi", umk: 5558515 },
      { code: "3215", name: "Kab. Karawang", umk: 5599593 },
      { code: "3276", name: "Kota Depok", umk: 5195721 },
      { code: "3271", name: "Kota Bogor", umk: 5126897 },
      { code: "3273", name: "Kota Bandung", umk: 4482914 },
      { code: "3204", name: "Kab. Bandung", umk: 3757285 },
      { code: "3279", name: "Kota Banjar", umk: 2204754 },
    ],
  },
  "33": {
    name: "Jawa Tengah",
    ump: 2169349,
    inflation: 0.026,
    cities: [
      { code: "3374", name: "Kota Semarang", umk: 3454827 },
      { code: "3322", name: "Kab. Demak", umk: 2940716 },
      { code: "3324", name: "Kab. Kendal", umk: 2783455 },
      { code: "3372", name: "Kota Surakarta", umk: 2416560 },
      { code: "3371", name: "Kota Magelang", umk: 2281230 },
      { code: "3303", name: "Kab. Banjarnegara", umk: 2170475 },
    ],
  },
  "34": {
    name: "DI Yogyakarta",
    ump: 2264080,
    inflation: 0.030,
    cities: [
      { code: "3471", name: "Kota Yogyakarta", umk: 2655041 },
      { code: "3404", name: "Kab. Sleman", umk: 2466514 },
      { code: "3402", name: "Kab. Bantul", umk: 2360533 },
    ],
  },
  "35": {
    name: "Jawa Timur",
    ump: 2305985,
    inflation: 0.027,
    cities: [
      { code: "3578", name: "Kota Surabaya", umk: 5288796 },
      { code: "3525", name: "Kab. Gresik", umk: 5050000 },
      { code: "3515", name: "Kab. Sidoarjo", umk: 5030000 },
      { code: "3573", name: "Kota Malang", umk: 3500000 },
      { code: "3571", name: "Kota Kediri", umk: 2492811 },
    ],
  },
  "36": {
    name: "Banten",
    ump: 2905199,
    inflation: 0.026,
    cities: [
      { code: "3672", name: "Kota Cilegon", umk: 5128084 },
      { code: "3671", name: "Kota Tangerang", umk: 4900000 },
      { code: "3673", name: "Kota Serang", umk: 4418261 },
    ],
  },
  "51": {
    name: "Bali",
    ump: 2996560,
    inflation: 0.029,
    cities: [
      { code: "5103", name: "Kab. Badung", umk: 3548530 },
      { code: "5171", name: "Kota Denpasar", umk: 3300000 },
    ],
  },
  "52": { name: "Nusa Tenggara Barat", ump: 2602931, inflation: 0.030 },
  "53": { name: "Nusa Tenggara Timur", ump: 2328969, inflation: 0.031 },
  "61": { name: "Kalimantan Barat", ump: 2878286, inflation: 0.028 },
  "62": { name: "Kalimantan Tengah", ump: 3473621, inflation: 0.027 },
  "63": { name: "Kalimantan Selatan", ump: 3496150, inflation: 0.027 },
  "64": { name: "Kalimantan Timur", ump: 3579313, inflation: 0.026 },
  "65": { name: "Kalimantan Utara", ump: 3580160, inflation: 0.027 },
  "71": { name: "Sulawesi Utara", ump: 3775425, inflation: 0.028 },
  "72": { name: "Sulawesi Tengah", ump: 2915000, inflation: 0.029 },
  "73": { name: "Sulawesi Selatan", ump: 3657527, inflation: 0.027 },
  "74": { name: "Sulawesi Tenggara", ump: 3073551, inflation: 0.029 },
  "75": { name: "Gorontalo", ump: 3221731, inflation: 0.030 },
  "76": { name: "Sulawesi Barat", ump: 3104430, inflation: 0.030 },
  "81": { name: "Maluku", ump: 3141700, inflation: 0.031 },
  "82": { name: "Maluku Utara", ump: 3408000, inflation: 0.031 },
  "91": { name: "Papua", ump: 4285850, inflation: 0.033 },
  "92": { name: "Papua Barat", ump: 3615000, inflation: 0.033 },
  "93": { name: "Papua Tengah", ump: 4285848, inflation: 0.034 },
  "94": { name: "Papua Pegunungan", ump: 4024270, inflation: 0.035 },
  "95": { name: "Papua Selatan", ump: 4285847, inflation: 0.034 },
  "96": { name: "Papua Barat Daya", ump: 3614000, inflation: 0.033 },
};

// ----- HELPERS -----

/** Ambil UMP (provinsi) atau UMK (kota) yang relevan. */
export function getMinWage(provinceCode, cityCode) {
  const p = PROVINCES[provinceCode];
  if (!p) return 0;
  if (p.cities && cityCode) {
    const c = p.cities.find((x) => x.code === cityCode);
    if (c) return c.umk;
  }
  return p.ump;
}

/** List provinsi untuk dropdown UI */
export function listProvinces() {
  return Object.entries(PROVINCES).map(([code, p]) => ({
    code,
    name: p.name,
    ump: p.ump,
    hasCities: !!p.cities,
  }));
}

/** List kota dari provinsi tertentu (kalau ada) */
export function listCities(provinceCode) {
  const p = PROVINCES[provinceCode];
  return p?.cities || [];
}

/** Ambil inflasi provinsi (untuk perhitungan proyeksi opex) */
export function getInflation(provinceCode) {
  return PROVINCES[provinceCode]?.inflation ?? 0.027; // rata-rata nasional fallback
}
