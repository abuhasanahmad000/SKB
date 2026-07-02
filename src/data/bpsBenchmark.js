// ============================================================================
// BPS BENCHMARK — Data Fallback Sektor Industri
//
// Port dari prototype v4 (bizcast-final.jsx lines 1113-1196).
//
// FUNGSI: dipakai sebagai data hardcoded fallback bila BPS API tidak bisa
// dijangkau (offline / kuota habis / endpoint mati).
//
// Di Tahap 8 (BPS integration), services/bpsService.js akan COBA fetch
// data live terlebih dahulu. Jika gagal → fallback ke data di sini.
//
// Data ini diperbarui manual berdasarkan rilis tahunan BPS, BI, dan
// asosiasi industri.
// ============================================================================

export const BPS_BENCHMARK = {
  "Makanan & Minuman": {
    sectorGrowth: 0.082,
    growthLabel: "Industri Makanan & Minuman tumbuh rata-rata 8,2%/tahun (BPS, 3 tahun terakhir)",
    marketGrowth: "tinggi",
    consumptionShare: "Makanan & minuman menyerap ±35% pengeluaran rumah tangga (BPS Susenas)",
    competitionLevel: "tinggi",
    competitionNote: "Sektor padat pemain; diferensiasi menentukan keberhasilan",
    seasonality: "Permintaan naik pada akhir pekan, libur, dan Ramadan/hari besar",
    avgMargin: 0.20,
  },
  "Perdagangan Eceran": {
    sectorGrowth: 0.055,
    growthLabel: "Perdagangan eceran tumbuh rata-rata 5,5%/tahun (BPS)",
    marketGrowth: "sedang",
    consumptionShare: "Ditopang pertumbuhan konsumsi rumah tangga ±5%/tahun (BPS)",
    competitionLevel: "tinggi",
    competitionNote: "Kompetisi ketat dengan ritel modern & e-commerce",
    seasonality: "Puncak pada musim liburan & tahun ajaran baru",
    avgMargin: 0.15,
  },
  "Jasa": {
    sectorGrowth: 0.072,
    growthLabel: "Sektor jasa tumbuh rata-rata 7,2%/tahun (BPS)",
    marketGrowth: "tinggi",
    consumptionShare: "Permintaan jasa personal meningkat seiring urbanisasi",
    competitionLevel: "sedang",
    competitionNote: "Diferensiasi kualitas & lokasi menjadi kunci",
    seasonality: "Relatif stabil sepanjang tahun",
    avgMargin: 0.35,
  },
  "Pendidikan": {
    sectorGrowth: 0.090,
    growthLabel: "Jasa pendidikan tumbuh rata-rata 9,0%/tahun (BPS)",
    marketGrowth: "tinggi",
    consumptionShare: "Pengeluaran pendidikan ±6% dari konsumsi rumah tangga (BPS)",
    competitionLevel: "sedang",
    competitionNote: "Reputasi & hasil belajar menentukan daya saing",
    seasonality: "Puncak pendaftaran menjelang tahun ajaran baru",
    avgMargin: 0.40,
  },
  "Teknologi": {
    sectorGrowth: 0.150,
    growthLabel: "Ekonomi digital tumbuh rata-rata 15%/tahun (BI/BPS)",
    marketGrowth: "sangat tinggi",
    consumptionShare: "Adopsi digital meluas di seluruh sektor usaha",
    competitionLevel: "tinggi",
    competitionNote: "Persaingan talenta & kecepatan inovasi tinggi",
    seasonality: "Tergantung siklus proyek/klien",
    avgMargin: 0.38,
  },
  "Manufaktur": {
    sectorGrowth: 0.048,
    growthLabel: "Industri pengolahan tumbuh rata-rata 4,8%/tahun (BPS)",
    marketGrowth: "sedang",
    consumptionShare: "Bergantung permintaan domestik & ekspor",
    competitionLevel: "tinggi",
    competitionNote: "Efisiensi biaya & skala menentukan margin",
    seasonality: "Mengikuti siklus pesanan/musim",
    avgMargin: 0.22,
  },
  "Pertanian": {
    sectorGrowth: 0.038,
    growthLabel: "Sektor pertanian tumbuh rata-rata 3,8%/tahun (BPS)",
    marketGrowth: "rendah-sedang",
    consumptionShare: "Permintaan pangan stabil & inelastis",
    competitionLevel: "sedang",
    competitionNote: "Kualitas, kontinuitas pasokan, dan akses offtaker penting",
    seasonality: "Sangat dipengaruhi musim tanam & panen",
    avgMargin: 0.20,
  },
};

// ----- KONSTANTA EKONOMI MAKRO INDONESIA (untuk perhitungan WACC) -----
export const MACRO_INDICATORS = {
  riskFreeRate: 0.065,        // SBN 10Y rata-rata
  marketRiskPremium: 0.055,   // ERP Indonesia
  defaultLoanRate: 0.115,     // bunga KUR/komersial UMKM rata-rata
  perpetualGrowth: 0.03,      // pertumbuhan jangka panjang (proxy inflasi inti)
  pphFinalUmkmRate: 0.005,    // PPh Final UMKM PP 23/2018 (0,5%)
  pphBadanRate: 0.22,         // PPh Badan
  pphFinalThreshold: 4_800_000_000, // omzet ≤ Rp4,8M boleh pakai PPh Final UMKM
};

// ----- HELPERS -----

/** Ambil benchmark grup industri. Fallback ke "Jasa" jika grup tidak ada. */
export function getBenchmark(group) {
  return BPS_BENCHMARK[group] || BPS_BENCHMARK["Jasa"];
}

/**
 * Proyeksi deret pertumbuhan sektor untuk grafik perbandingan.
 * Port dari v4 line 1189.
 *
 * @param {number} sectorGrowth - Pertumbuhan sektor (mis. 0.08)
 * @param {string} userStance - 'exceed' | 'match' | 'below' | 'unsure'
 * @param {number} years - Jumlah tahun proyeksi
 */
export function growthSeries(sectorGrowth, userStance, years = 5) {
  const mult = { exceed: 1.4, match: 1.0, below: 0.6, unsure: 0.85 }[userStance] ?? 1.0;
  const g = sectorGrowth * mult;
  const out = [];
  for (let t = 0; t <= years; t++) {
    out.push({
      tahun: `Th-${t}`,
      sektor: +(100 * (1 + sectorGrowth) ** t).toFixed(1),
      usaha: +(100 * (1 + g) ** t).toFixed(1),
    });
  }
  return { series: out, userGrowth: g, sectorG: sectorGrowth };
}
