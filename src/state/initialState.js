// ============================================================================
// INITIAL STATE FACTORY
// Untuk Tahap 1: hanya state gateway. State untuk profile/aspek/finansial
// akan ditambahkan secara bertahap di Tahap 2 dst.
//
// Shape state dijaga agar mudah di-extend tanpa breaking change.
// ============================================================================

export function makeInitialState() {
  return {
    // ----- GATEWAY STATE -----
    gateway: {
      // step: "login" | "apikey" | "done"
      // (Refactor v13: step "pathway" DIHAPUS — semua user adalah pencari dana.
      //  Jenis bisnis dipilih di dasbor via app.businessStage.)
      step: "login",
      loggedIn: false,
      // user: {name, email, avatar} — sementara mock, nanti real Google OAuth
      user: null,
      // Gemini API key (BYOK)
      gemini: {
        // keyType: "free" | "paid" | null
        keyType: null,
        key: "",
        // validated: hasil cek koneksi terakhir
        validated: false,
        validationMsg: "",
        // ◆ HOTFIX 6.1: model name yang di-auto-pick saat verifikasi
        // (mis. "gemini-2.0-flash"). Dipakai di semua call ke Gemini.
        model: "",
      },
    },

    // ----- APP STATE (akan diisi di tahap berikutnya) -----
    // Untuk Tahap 1, struktur ini sengaja minimal. Saat Tahap 2 (Data Layer)
    // dijalankan, kita akan tambahkan: business, location, costs, revenue,
    // financing, params, swot, cover, owner, photos, dst.
    app: {
      // Refactor v13: jenis bisnis pencari dana — "baru" | "lanjutan".
      // Dipilih/diubah kapan saja dari dasbor (sub-tab "Jenis Bisnis").
      // Seluruh form, parameter kelayakan, keuangan, dan laporan mengikuti.
      businessStage: "baru",
    },

    // ----- FORMS STATE (Tahap 5) -----
    // Semua input user dari Tab 1 (Dasbor & Profil) dan Tab 2 (Formulir).
    // Struktur sengaja flat per section agar mudah di-update via patch().
    //
    // CATATAN: state shape SAMA untuk ketiga jalur (A/B/C). Field yang
    // hanya relevan untuk satu jalur akan diisi/dibaca selektif oleh
    // section component yang sesuai. Ini menghindari duplikasi.
    forms: {
      // === Identitas dasar (Tab 1.1) ===
      identitas: {
        namaBisnis: "",
        produkUtama: "",       // Hotfix 5.5: nama produk utama (dipakai di narasi)
        sectorCode: "",        // Hotfix 5.5: kode KBLI sektor (untuk BPS growth rate)
        skalaBisnis: "",       // ◆ Hotfix 6.2: mikro/kecil/menengah/besar — basis rule-based suggest
        tagline: "",
        deskripsi: "",
        alamat: "",
        provinceCode: "",
        cityCode: "",
        // Khusus Jalur B (eksisting)
        tahunBerdiri: "",
        // Khusus Jalur C (pemohon)
        namaPemohon: "",
        kompetensiPendiri: "",
        // Hotfix 5.5: status operasional (Jalur C ada user baru & sudah jalan)
        statusOperasional: "",
        // Hotfix 11.3: logo upload (base64 data URL) untuk sampul laporan
        logoUrl: "",
      },

      // === Hukum & Struktur Tim (Tab 1.2 Jalur A) ===
      // CATATAN: modalMode SENGAJA DIHAPUS — akan di-derive otomatis dari
      // forms.modal.funding di Bab 7. User tidak perlu jawab dua kali.
      hukum: {
        bentukHukum: "",
        struktur: [],           // array of id dari BAB_5_2_STRUKTUR
        penasihat: [],          // array of id dari BAB_5_3_PENASIHAT
      },

      // === Khusus Jalur B (catatan keuangan eksisting + kapasitas + legalitas) ===
      existingBusiness: {
        // Hotfix 12.0: EXPAND untuk diferensiasi laporan Jalur B
        tahunMulai: "",              // tahun bisnis dimulai (string)
        omsetBulanan: 0,             // rata-rata 3-6 bulan terakhir
        hppBulanan: 0,               // HPP rata-rata bulanan
        labaBulanan: 0,              // laba bersih rata-rata bulanan
        opexBerjalan: 0,             // total opex bulanan
        jumlahKaryawan: 0,
        // Kapasitas & bottleneck
        kapasitasUtilization: 0,     // % utilisasi kapasitas saat ini (0-100)
        bottleneck: [],              // array kendala: kapasitas_produksi, sdm, alat, modal, tempat, distribusi
        // Aset & hutang saat ini
        asetSaatIni: 0,              // total aset bersih
        hutangSaatIni: 0,            // total liabilitas
        // Legalitas eksisting (existing legal documents owned)
        legalitasOwned: [],          // array of: nib, pirt, halal, bpom, hki, npwp
        // Target ekspansi
        targetPertumbuhanRevenue: 0, // % target pertumbuhan revenue setelah ekspansi
        targetPayback: 0,            // bulan target payback period
        alasanEkspansi: "",          // ringkasan alasan kenapa ekspansi sekarang
      },

      // === Khusus Jalur C (target pendanaan + use of funds + mitigasi risiko) ===
      fundingTarget: {
        nominal: 0,
        jenisPendanaan: "",     // "kur" | "komersial" | "investor" | "hibah"
        jaminan: "",            // "tanah_bangunan" | "kendaraan" | "tabungan_deposito" | "tidak_ada"
        tenor: 36,              // bulan
        // Hotfix 12.0: Use of Funds breakdown per kategori
        useOfFunds: {
          renovasi: 0,           // renovasi tempat
          equipment: 0,          // alat & teknologi
          inventory: 0,          // stok awal
          marketing: 0,          // pemasaran & branding
          workingCapital: 0,     // modal kerja (cadangan opex)
          legal: 0,              // perizinan & legal
          other: 0,              // lain-lain
        },
        // Hotfix 12.0: Mitigasi risiko (5 risiko utama UMKM)
        risikoMitigasi: {
          pasar: "",             // risiko pasar (kompetitor, demand drop) + mitigasi
          operasional: "",       // risiko operasional (supplier, kualitas) + mitigasi
          keuangan: "",          // risiko keuangan (cash flow, hutang) + mitigasi
          sdm: "",               // risiko SDM (turnover, kualitas) + mitigasi
          regulasi: "",          // risiko regulasi (perizinan, pajak) + mitigasi
        },
        // Strategi exit untuk investor (kalau equity)
        exitStrategy: "",        // bagaimana investor exit (buyback, IPO, dst)
      },

      // === Bab 2: Peluang Bisnis ===
      peluang: {
        masalah: [],            // id list dari BAB_2_1_MASALAH
        solusi: [],
        jenisPelanggan: [],
        karakteristik: [],
        bentukKompetisi: [],
        keunggulan: [],
      },

      // === Bab 3: Strategi Eksekusi (kecuali 3.4) ===
      strategi: {
        pemasaran: [],          // id list dari BAB_3_1_PEMASARAN
        kanal: [],
        statusTempat: "",       // id dari BAB_3_3_STATUS_TEMPAT
        karakterLokasi: [],
      },

      // === Bab 3.4 + 6.3: Alat & SDM ===
      alatSDM: {
        teknologi: [],          // id list dari BAB_3_4_TEKNOLOGI
        equipment: [],          // [{name, qty, pricePerUnit}]
        personnel: {            // structure dari PersonnelTable
          positions: {},        // { manager: {active, count, salary}, ... }
          allowanceMode: "tidak",
        },
      },

      // === Bab 6.1, 6.2, 6.4: Proyeksi Keuangan ===
      keuangan: {
        metode: [],             // id list dari BAB_6_1_METODE_PENJUALAN
        products: [],           // [{name, dailyTarget, price}]
        growth: "15",           // id dari BAB_6_1_GROWTH
        hppPerProduk: {},       // { productIdx: "40" } — id dari BAB_6_2_HPP
        opex: {
          marketing: 0,
          utilities: 0,
          rent: 0,
          other: 0,
        },
      },

      // === Bab 7: Pendanaan & Modal ===
      modal: {
        expenses: {
          legal: 0,
          renovasi: 0,
          promo: 0,
        },
        assets: {
          stok: 0,
          // peralatan auto-derived dari alatSDM.equipment, tidak disimpan di sini
        },
        funding: {
          modalPribadi: 0,
          modalMitra: 0,
          modalPinjaman: 0,
        },
      },

      // === Bab 4: Kuesioner 5 Aspek SKB ===
      kuesioner: {
        pemasaran: {},          // { p1: 3, p2: 2, p3: 1 }
        teknis: {},
        manajemen: {},
        hukum: {},
        lingkungan: {},
      },

      // === Lingkungan & Sosial (Hotfix 7.1) ===
      lingkunganSosial: {
        praktikRamah: [],
        komitmenSosial: [],
      },

      // === Bab 1 Ringkasan Eksekutif (Tahap 9) ===
      bab1Summary: "",
      bab1SummaryAt: null,

      // === Lampiran Foto (Hotfix 11.1) ===
      // Array of { id, name, dataUrl, caption } — foto sudah compress di client
      lampiranFotos: [],

      // === Narasi AI Multi-Bab (Hotfix 11.1) ===
      // Hasil AI generation untuk Bab 2-8 yang lebih mengalir & sintetis
      babNarrationsAI: null,  // { bab2: "...", bab3: "...", ... }
      babNarrationsAIAt: null,
    },

    // ----- NAVIGATION STATE (Tahap 3) -----
    // Setelah gateway selesai, nav menentukan tab & sub-tab yang aktif.
    // Diinisialisasi otomatis ke first-tab/first-subtab dari pathway saat
    // user menyelesaikan gateway (lihat AppContext.advanceGateway).
    //
    // Shape: { tabId: string, subtabId: string } | null
    nav: null,

    // ----- SETTINGS (dapat diubah user lewat icon ⚙ di header nanti) -----
    settings: {
      // Mode tampilan: "production" | "demo"
      mode: "production",
      // Apakah panel debug ditampilkan
      debug: false,
    },
  };
}

/**
 * Helper untuk navigasi gateway step.
 * Mengembalikan step berikutnya berdasarkan state saat ini.
 */
export function nextGatewayStep(gateway) {
  if (!gateway.loggedIn) return "login";
  if (!gateway.gemini.validated) return "apikey";
  return "done";
}
