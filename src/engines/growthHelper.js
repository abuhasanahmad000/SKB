import { getSector } from "../data/sectors.js";
import { getBenchmark } from "../data/bpsBenchmark.js";
import { findValue, BAB_6_1_GROWTH } from "../data/babOptions.js";

// ============================================================================
// GROWTH HELPER — BPS-Aware Growth Rate Resolver
//
// HOTFIX 5.5: Growth rate sekarang menyesuaikan sektor usaha yang dipilih
// user di Identitas Bisnis. Daripada hardcode 10%/15%/25%, sistem ambil
// rata-rata sektor BPS lalu user pilih: konservatif / sektor / agresif.
//
// Fungsi ini dipakai oleh:
//   - financialEngine (untuk perhitungan proyeksi)
//   - proFormaBuilder (untuk P&L 3 tahun)
//   - narrativeEngine (untuk fragment "asumsi pertumbuhan")
//   - ProyeksiKeuanganForm UI (untuk dropdown dinamis)
// ============================================================================

/** Resolve angka growth rate (desimal, mis. 0.082) dari forms state. */
export function resolveGrowthRate(forms) {
  const sectorCode = forms?.identitas?.sectorCode;
  const growthChoice = forms?.keuangan?.growth;
  const sector = getSector(sectorCode);

  // === BPS-aware mode (sektor sudah dipilih) ===
  if (sector) {
    const bps = getBenchmark(sector.group);
    const sectorGrowth = bps.sectorGrowth;

    if (growthChoice === "konservatif") {
      return Math.max(0.02, sectorGrowth - 0.03);
    }
    if (growthChoice === "agresif") {
      return sectorGrowth + 0.05;
    }
    // "sektor" atau belum dipilih → pakai rata-rata BPS
    return sectorGrowth;
  }

  // === Fallback: static lookup (backward compat untuk forms lama) ===
  const staticValue = findValue(BAB_6_1_GROWTH, growthChoice);
  return staticValue ?? 0.15;
}

/** Build kalimat fragment untuk dipakai di narasi Bab 6. */
export function resolveGrowthFragment(forms) {
  const sectorCode = forms?.identitas?.sectorCode;
  const growthChoice = forms?.keuangan?.growth;
  const sector = getSector(sectorCode);

  const fmtPct = (v) => `${(v * 100).toFixed(1)}%`;

  if (sector) {
    const bps = getBenchmark(sector.group);
    const sectorGrowth = bps.sectorGrowth;

    if (growthChoice === "konservatif") {
      const rate = Math.max(0.02, sectorGrowth - 0.03);
      return `asumsi pertumbuhan konservatif sebesar ${fmtPct(rate)} per tahun (di bawah rata-rata sektor ${sector.group})`;
    }
    if (growthChoice === "agresif") {
      const rate = sectorGrowth + 0.05;
      return `asumsi pertumbuhan agresif sebesar ${fmtPct(rate)} per tahun (di atas rata-rata sektor ${sector.group})`;
    }
    return `asumsi pertumbuhan ${fmtPct(sectorGrowth)} per tahun sesuai rata-rata sektor ${sector.group} berdasarkan data BPS`;
  }

  // Fallback
  return (
    BAB_6_1_GROWTH.find((g) => g.id === growthChoice)?.fragment ||
    "asumsi pertumbuhan moderat sebesar 15% per tahun"
  );
}

// ============================================================================
// MODAL MODE DERIVATION (koreksi 4)
//
// Daripada user jawab "mandiri/kemitraan" terpisah di HukumForm, sistem
// derive otomatis dari komposisi sumber dana di Bab 7 (modal.funding).
// ============================================================================

export function deriveModalModeFragment(forms) {
  const funding = forms?.modal?.funding || {};
  const pribadi = funding.modalPribadi || 0;
  const mitra = funding.modalMitra || 0;
  const pinjaman = funding.modalPinjaman || 0;
  const total = pribadi + mitra + pinjaman;

  let frag;
  if (total === 0) {
    frag = "struktur kepemilikan modal akan ditentukan secara formal pada tahap eksekusi";
  } else if (mitra > 0 && pinjaman > 0) {
    frag = "modal usaha berasal dari kombinasi modal pribadi, kontribusi mitra, dan pinjaman eksternal dengan pembagian sesuai kesepakatan tertulis";
  } else if (mitra > 0) {
    frag = "modal usaha dimiliki bersama oleh beberapa mitra dengan pembagian berdasarkan kesepakatan tertulis yang sah";
  } else if (pinjaman > 0 && pribadi > 0) {
    frag = "modal usaha dipenuhi dari kombinasi modal pribadi pendiri dan pinjaman eksternal melalui lembaga keuangan";
  } else if (pinjaman > 0) {
    frag = "modal usaha sepenuhnya berasal dari pendanaan eksternal melalui skema pinjaman lembaga keuangan";
  } else {
    frag = "struktur kepemilikan modal bersifat tunggal di mana pendiri mengendalikan 100% hak suara dan keputusan bisnis";
  }

  // Capitalize huruf pertama karena fragment dipasang setelah titik di TPL_BAB_5.hukumModal
  return frag.charAt(0).toUpperCase() + frag.slice(1);
}

// ============================================================================
// PRODUK MENTION REPLACER (koreksi 5)
//
// Replace frase "produk/jasa" (generic) dengan nama produk utama bisnis
// di-input user di Identitas. Membuat narasi terasa lebih personal.
// ============================================================================

export function applyProdukName(text, produkUtama) {
  if (!produkUtama || !text || typeof text !== "string") return text;

  const cleaned = produkUtama.trim();
  if (cleaned.length === 0) return text;

  // Lowercase variant
  let out = text.replace(/produk\/jasa/g, cleaned);
  // Capitalized variant
  out = out.replace(/Produk\/jasa/g, cleaned.charAt(0).toUpperCase() + cleaned.slice(1));
  return out;
}
