// ============================================================================
// SEASONALITY (v13.2) — SATU sumber pola distribusi penjualan bulanan Tahun 1
//
// Mengganti tiga array duplikat lama yang anjlok ekstrem di Bulan 11-12
// (0.060 / 0.030) — pola yang janggal karena akhir tahun justru high season
// (libur Natal-Tahun Baru) untuk F&B/retail di kota besar Indonesia.
//
// Pola baru: ramp-up bertahap bulan 1-6 (fase perkenalan bisnis baru),
// stabil bulan 7-11, dan PUNCAK di Desember (high season akhir tahun).
// Jumlah faktor TEPAT = 1.000 sehingga total bulanan = angka tahunan.
// ============================================================================

export const SEASONALITY_FACTORS = [
  0.052, // B1  — bulan perkenalan
  0.062, // B2
  0.071, // B3
  0.079, // B4
  0.084, // B5
  0.087, // B6
  0.089, // B7
  0.090, // B8
  0.091, // B9
  0.093, // B10
  0.095, // B11 — menjelang high season
  0.107, // B12 — puncak libur akhir tahun
];

/** Distribusi nilai tahunan → 12 bulan mengikuti pola seasonality. */
export function distributeMonthly(annualValue) {
  return SEASONALITY_FACTORS.map((f) => annualValue * f);
}
