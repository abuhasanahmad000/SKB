// ============================================================================
// FORMAT UTILITIES
// Port dari prototype lama (bizcast-final.jsx lines 92-93) — dijaga konsisten
// untuk continuity tampilan angka di seluruh aplikasi.
// ============================================================================

/**
 * Format angka jadi Rupiah ringkas.
 * Contoh: 1500000 → "Rp 2 jt", 1500000000 → "Rp 1,50 M"
 *
 * Catatan: rentang 1-10 miliar SENGAJA ditampilkan "jt" (bukan "M") dengan
 * pemisah ribuan, agar dua angka berbeda (mis. 1.379 jt vs 1.380 jt) tidak
 * terbaca identik karena pembulatan ke "1,4 M".
 */
/**
 * Format angka mata uang Rupiah dengan kompak.
 * Aturan: presisi 1 desimal supaya selisih ratusan ribu tidak hilang
 * (mis. 139,5 jt vs 140 jt — penting di Smart Balance Check).
 *
 *   Rp 1.500.000.000  → "Rp 1,5 M"
 *   Rp 139.500.000    → "Rp 139,5 jt"
 *   Rp 140.000.000    → "Rp 140 jt"
 *   Rp 500.000        → "Rp 500 rb"
 */
export function formatRp(v) {
  if (v == null || isNaN(v)) return "Rp 0";
  const a = Math.abs(v);
  let s;
  if (a >= 1e12) {
    s = `${(v / 1e12).toFixed(2)} T`;
  } else if (a >= 1e9) {
    // M dengan 1-2 desimal — sembunyikan desimal kalau bulat
    const val = v / 1e9;
    s = `${Number.isInteger(val) ? val.toString() : val.toFixed(2).replace(".", ",")} M`;
  } else if (a >= 1e6) {
    // jt dengan 1 desimal — sembunyikan kalau bulat
    const val = v / 1e6;
    s = `${Number.isInteger(val) ? val.toString() : val.toFixed(1).replace(".", ",")} jt`;
  } else if (a >= 1e3) {
    s = `${(v / 1e3).toFixed(0)} rb`;
  } else {
    s = (v || 0).toFixed(0);
  }
  return `Rp ${s}`;
}

/** Format angka mata uang lengkap dengan separator titik (untuk laporan formal). */
export function formatRpFull(v) {
  if (v == null || isNaN(v)) return "Rp 0";
  return `Rp ${Math.round(v).toLocaleString("id-ID")}`;
}

/** Format desimal jadi persentase. 0.125 → "12.5%" */
export function formatPct(v) {
  return v == null ? "-" : `${(v * 100).toFixed(1)}%`;
}

/** Format angka biasa dengan pemisah ribuan (id-ID locale) */
export function formatNum(v) {
  if (v == null || isNaN(v)) return "0";
  return Math.round(v).toLocaleString("id-ID");
}

/** Buka URL di tab baru — digunakan untuk link panduan API key */
export function openExternal(url) {
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
