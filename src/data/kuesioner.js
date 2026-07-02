// ============================================================================
// KUESIONER KELAYAKAN 5 ASPEK SKB (BAB 4)
//
// Sumber: Dokumen 3 Bab 4 (4.1 Pemasaran, 4.2 Teknis, 4.3 Manajemen,
// 4.4 Hukum, 4.5 Lingkungan).
//
// Skor per pertanyaan:
//   Ya       → 3
//   Ragu-ragu → 2
//   Tidak    → 1
//
// CATATAN DESAIN THRESHOLD:
// Dokumen 3 menulis "≥8 LAYAK / 5-7 CUKUP / ≤4 TIDAK" — namun threshold
// absolut ini hanya valid untuk aspek dengan 3 pertanyaan (max 9).
// Aspek Manajemen/Hukum/Lingkungan hanya 2 pertanyaan (max 6) sehingga
// "≥8" tidak mungkin tercapai.
//
// SOLUSI: gunakan threshold PROPORSIONAL (% dari skor maksimum):
//   LAYAK         : ≥ 85% (mis. 8/9 = 89% atau 5/6 = 83%)
//   CUKUP LAYAK   : 50-84%
//   TIDAK LAYAK   : < 50%
//
// Ini menjaga SEMANGAT Dokumen 3 (≥8/9 ≈ 89% LAYAK) dan konsisten lintas aspek.
//
// CRITICAL ASPECTS untuk Jalur C (Pendanaan):
// Aspek Hukum & Lingkungan diberi pengetatan ambang —
// LAYAK jika 100%, tidak ada toleransi karena ditujukan ke bank/investor.
// Lihat field `criticalForC` di tiap aspek.
// ============================================================================

export const SCORE_VALUES = {
  ya: 3,
  ragu: 2,
  tidak: 1,
};

export const SCORE_LABELS = {
  3: "Ya",
  2: "Ragu-ragu",
  1: "Tidak",
};

// ----- KUESIONER PER ASPEK -----

export const KUESIONER = {
  pemasaran: {
    code: "pemasaran",
    letter: "A",
    name: "Aspek Kelayakan Pemasaran",
    icon: "📊",
    questions: [
      {
        id: "p1",
        text: "Apakah jumlah calon pembeli di lokasi usaha diperkirakan cukup ramai?",
      },
      {
        id: "p2",
        text: "Apakah harga jual produk Anda bisa bersaing dengan kompetitor sekitar?",
      },
      {
        id: "p3",
        text: "Apakah produk Anda memiliki keunikan yang tidak dimiliki kompetitor lain?",
      },
    ],
    narasi: {
      layak:
        "Berdasarkan hasil uji parameter pasar, aspek pemasaran dinyatakan LAYAK. Bisnis memiliki basis calon konsumen potensial yang kuat di lokasi terpilih, serta didukung oleh keunggulan produk yang kompetitif dan strategi penetapan harga yang masuk akal bagi target pasar lokal.",
      cukup:
        "Aspek pemasaran dinyatakan CUKUP LAYAK. Potensi pasar tersedia, namun beberapa indikator masih bersifat marjinal — baik dari sisi keramaian pengunjung, daya saing harga, atau keunikan produk. Penguatan diferensiasi dan riset pasar lanjutan disarankan sebelum eksekusi penuh.",
      tidak:
        "Aspek pemasaran dinyatakan TIDAK LAYAK pada konfigurasi saat ini. Kombinasi minim keramaian lokasi, daya saing harga, dan/atau keunikan produk membuat probabilitas penetrasi pasar rendah. Disarankan meninjau ulang lokasi, segmentasi target, atau penawaran produk sebelum melanjutkan rencana usaha.",
    },
    // Aspek ini KRITIKAL untuk semua jalur (lihat criticalGate prototype lama)
    criticalForAll: true,
  },

  teknis: {
    code: "teknis",
    letter: "B",
    name: "Aspek Kelayakan Teknis & Operasional",
    icon: "🛠",
    questions: [
      {
        id: "t1",
        text: "Apakah bahan baku atau stok barang dagangan mudah didapatkan dari penyuplai (supplier)?",
      },
      {
        id: "t2",
        text: "Apakah lokasi usaha mudah diakses oleh konsumen dan memiliki fasilitas dasar (listrik/air/internet) yang stabil?",
      },
      {
        id: "t3",
        text: "Apakah Anda sudah memiliki atau mengetahui cara kerja peralatan utama untuk memproduksi/menjual produk tersebut?",
      },
    ],
    narasi: {
      layak:
        "Dari sisi teknis, proyek bisnis ini dinyatakan LAYAK untuk dijalankan. Lokasi operasional memenuhi standar kebutuhan dasar usaha, rantai pasok bahan baku terjamin kelancarannya, dan proses produksi dapat didukung oleh kesiapan peralatan kerja yang memadai.",
      cukup:
        "Aspek teknis dinyatakan CUKUP LAYAK. Sebagian besar prasyarat operasional sudah terpenuhi, namun masih ada celah pada rantai pasok, infrastruktur lokasi, atau penguasaan alat kerja yang perlu diantisipasi melalui kontrak supplier cadangan dan pelatihan operator.",
      tidak:
        "Aspek teknis dinyatakan TIDAK LAYAK. Ada hambatan signifikan pada salah satu fondasi operasional — supply chain, utilitas dasar, atau kapabilitas teknis. Investasi tambahan untuk mengatasi gap ini diperlukan sebelum operasional dimulai.",
    },
  },

  manajemen: {
    code: "manajemen",
    letter: "C",
    name: "Aspek Kelayakan Manajemen & Organisasi",
    icon: "👥",
    questions: [
      {
        id: "m1",
        text: "Apakah pembagian tugas kerja (siapa yang menjaga toko, yang belanja, yang mencatat keuangan) sudah jelas?",
      },
      {
        id: "m2",
        text: "Apakah Anda atau tim pengelola memiliki pengalaman dasar/minat yang kuat di bidang usaha ini?",
      },
    ],
    narasi: {
      layak:
        "Evaluasi pada struktur pengelola menunjukkan bahwa aspek manajemen dinyatakan LAYAK. Struktur organisasi dirancang secara ringkas dan efisien sesuai skala UMKM, dengan kejelasan pembagian peran kerja yang meminimalkan risiko tumpang tindih operasional.",
      cukup:
        "Aspek manajemen dinyatakan CUKUP LAYAK. Pengelola memiliki minat di bidang usaha, namun struktur tugas atau pengalaman teknisnya masih perlu pemantapan — sebaiknya didampingi mentor atau bergabung dengan komunitas usaha sejenis pada tahap awal.",
      tidak:
        "Aspek manajemen dinyatakan TIDAK LAYAK. Kombinasi minim pengalaman dan struktur tugas yang belum jelas berisiko menimbulkan kekacauan operasional di tahap awal. Disarankan pelatihan dasar dan rekrutmen mitra/mentor sebelum eksekusi.",
    },
  },

  hukum: {
    code: "hukum",
    letter: "D",
    name: "Aspek Kelayakan Hukum & Legalitas",
    icon: "⚖",
    questions: [
      {
        id: "h1",
        text: "Apakah usaha Anda sudah atau berkomitmen untuk mengurus perizinan dasar (seperti NIB/Nomor Induk Berusaha melalui OSS)?",
      },
      {
        id: "h2",
        text: "Apakah lokasi usaha bebas dari sengketa hukum dan tidak melanggar aturan zonasi wilayah setempat?",
      },
    ],
    narasi: {
      layak:
        "Ditinjau dari koridor hukum di Indonesia, aspek legalitas dinyatakan LAYAK. Usaha ini berkomitmen mematuhi regulasi pemerintah dengan kepemilikan izin dasar (NIB), serta beroperasi di wilayah yang sah secara hukum pertanahan dan tata ruang.",
      cukup:
        "Aspek hukum dinyatakan CUKUP LAYAK. Niat compliance sudah ada, namun status perizinan atau zonasi masih perlu finalisasi sebelum operasional resmi dimulai — sebaiknya konsultasi langsung dengan Dinas Penanaman Modal & PTSP setempat.",
      tidak:
        "Aspek hukum dinyatakan TIDAK LAYAK. Risiko penolakan perizinan atau pelanggaran zonasi sangat tinggi pada konfigurasi saat ini. Pengurusan NIB melalui OSS dan verifikasi zonasi WAJIB diselesaikan sebelum operasional dimulai.",
    },
    // KRITIKAL untuk Jalur C — bank/investor wajib lihat legalitas bersih
    criticalForC: true,
  },

  lingkungan: {
    code: "lingkungan",
    letter: "E",
    name: "Aspek Kelayakan Lingkungan & Sosial Ekonomi",
    icon: "🌿",
    questions: [
      {
        id: "l1",
        text: "Apakah operasional usaha Anda aman dari keluhan warga sekitar (tidak bising, tidak bau, atau limbah mudah dibuang dengan aman)?",
      },
      {
        id: "l2",
        text: "Apakah kehadiran bisnis Anda berpotensi membantu ekonomi sekitar (misal: membuka lowongan kerja atau meramaikan lingkungan)?",
      },
    ],
    narasi: {
      layak:
        "Pada aspek lingkungan dan sosial, bisnis dinyatakan LAYAK. Operasional usaha dipastikan ramah lingkungan tanpa menghasilkan limbah berbahaya yang mengganggu ketertiban warga, sekaligus memberikan dampak sosial-ekonomi yang positif bagi komunitas sekitar.",
      cukup:
        "Aspek lingkungan dinyatakan CUKUP LAYAK. Risiko gangguan terhadap warga sekitar masih dalam batas wajar, namun strategi mitigasi limbah/kebisingan/bau perlu dirancang sejak awal untuk mencegah konflik di kemudian hari.",
      tidak:
        "Aspek lingkungan dinyatakan TIDAK LAYAK. Potensi gangguan terhadap warga sekitar (limbah, kebisingan, bau) atau minimnya kontribusi sosial-ekonomi berisiko menimbulkan konflik. Diperlukan rancangan mitigasi formal sebelum beroperasi.",
    },
    // KRITIKAL untuk semua jalur (sesuai prototype v4)
    criticalForAll: true,
  },
};

// ----- KONSTANTA URUTAN ASPEK -----
export const ASPECT_ORDER = ["pemasaran", "teknis", "manajemen", "hukum", "lingkungan"];

// ----- THRESHOLD PROPORSIONAL -----
export const THRESHOLDS = {
  LAYAK_MIN_PCT: 0.85,    // ≥ 85% dari skor maksimum
  CUKUP_MIN_PCT: 0.50,    // ≥ 50% (tapi < 85%)
  // < 50% → TIDAK LAYAK
};

// ----- HELPERS -----

/** Hitung skor maksimum untuk satu aspek (jumlah pertanyaan × 3) */
export function maxScoreFor(aspectCode) {
  const a = KUESIONER[aspectCode];
  return a ? a.questions.length * SCORE_VALUES.ya : 0;
}

/** Hitung skor total dari jawaban user untuk aspek tertentu.
 *  answers = { p1: 3, p2: 2, p3: 1 }   (id → skor)
 */
export function calcAspectScore(aspectCode, answers) {
  const a = KUESIONER[aspectCode];
  if (!a) return { score: 0, max: 0, pct: 0, allAnswered: false };

  const max = maxScoreFor(aspectCode);
  let score = 0;
  let answered = 0;
  a.questions.forEach((q) => {
    const v = answers?.[q.id];
    if (v != null) {
      score += v;
      answered++;
    }
  });

  return {
    score,
    max,
    pct: max > 0 ? score / max : 0,
    allAnswered: answered === a.questions.length,
  };
}

/** Tentukan verdict berdasarkan skor proporsional. Return: 'layak'|'cukup'|'tidak'|null */
export function verdictFor(aspectCode, answers) {
  const r = calcAspectScore(aspectCode, answers);
  if (!r.allAnswered) return null; // belum lengkap
  if (r.pct >= THRESHOLDS.LAYAK_MIN_PCT) return "layak";
  if (r.pct >= THRESHOLDS.CUKUP_MIN_PCT) return "cukup";
  return "tidak";
}

/** Label tampilan verdict */
export const VERDICT_LABELS = {
  layak: "LAYAK",
  cukup: "CUKUP LAYAK",
  tidak: "TIDAK LAYAK",
};

/** Warna verdict untuk UI */
export const VERDICT_COLORS = {
  layak: "#22C55E",   // green
  cukup: "#F59E0B",   // amber
  tidak: "#EF4444",   // red
};

/** Ambil narasi rule-based otomatis untuk aspek + verdict */
export function getNarasi(aspectCode, verdict) {
  if (!verdict) return null;
  return KUESIONER[aspectCode]?.narasi?.[verdict] || null;
}

/** Hitung skor agregat semua aspek (rata-rata persentase) */
export function aggregateScore(answersAll) {
  // answersAll = { pemasaran: {...}, teknis: {...}, ... }
  let totalPct = 0;
  let counted = 0;
  ASPECT_ORDER.forEach((code) => {
    const r = calcAspectScore(code, answersAll[code] || {});
    if (r.allAnswered) {
      totalPct += r.pct;
      counted++;
    }
  });
  return counted > 0 ? Math.round((totalPct / counted) * 100) : null;
}

/** Critical Gate v13: semua user adalah pencari dana, jadi standar ketat
 *  pendanaan SELALU berlaku — aspek criticalForAll dan criticalForC
 *  (hukum) wajib berstatus LAYAK tanpa toleransi.
 *  Return: array aspek yang gagal critical. Kosong = lolos.
 */
export function criticalGate(answersAll, pathwayCode = "baru") {
  const failed = [];
  ASPECT_ORDER.forEach((code) => {
    const meta = KUESIONER[code];
    const isCritical = meta.criticalForAll || meta.criticalForC;
    if (!isCritical) return;
    const v = verdictFor(code, answersAll[code] || {});
    // Standar pendanaan: aspek kritikal HARUS layak (tidak ada toleransi)
    if (v !== "layak") failed.push({ code, verdict: v });
  });
  return failed;
}
