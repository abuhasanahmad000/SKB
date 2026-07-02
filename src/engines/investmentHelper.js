import { DEFAULT_COSTS } from "../data/defaultCosts.js";
import { getSector } from "../data/sectors.js";
import { getMinWage, PROVINCES } from "../data/provinces.js";
import { getSkala } from "./suggestionHelper.js";

// ============================================================================
// INVESTMENT HELPER — Initial Investment terperinci (Refactor v13.1)
//
// SATU SUMBER KEBENARAN untuk seluruh kebutuhan dana:
//   forms.modal.investmentItems : Array<{id, category, name, qty, unitPrice}>
//
// Dari array ini di-derive:
//   - Agregat lama (expenses.legal/renovasi/promo, assets.stok) → engine
//     keuangan & skor lama tetap jalan tanpa diubah besar.
//   - Use of Funds (Bab 6.6 & Bab 7) → angka TIDAK pernah nol lagi selama
//     user mengisi rincian investasi.
//
// Kategori dibedakan per jenis bisnis:
//   - "baru"     : kebutuhan masif dari nol (legalitas, renovasi, deposit
//                  sewa, stok perdana, promosi pembukaan, modal kerja awal)
//   - "lanjutan" : kebutuhan inkremental pengembangan (izin tambahan,
//                  fit-out unit baru, stok tambahan, promosi unit baru,
//                  tambahan modal kerja)
// Peralatan/mesin TIDAK diinput di sini — otomatis diambil dari sub-tab
// "Alat & Karyawan" supaya tidak dobel hitung.
// ============================================================================

export const INVESTMENT_CATEGORIES = {
  baru: [
    { id: "legalitas",   label: "Legalitas & Perizinan",        icon: "📜", uof: "legal",
      hint: "NIB (gratis via OSS), akta notaris, PIRT/laik higiene, sertifikat halal." },
    { id: "renovasi",    label: "Renovasi & Setup Tempat",      icon: "🛠", uof: "renovasi",
      hint: "Renovasi sipil, interior, instalasi listrik/air, signage." },
    { id: "sewa_deposit",label: "Deposit & Sewa Tempat di Muka", icon: "🏠", uof: "renovasi",
      hint: "Umumnya pemilik minta sewa 6–12 bulan dibayar di muka." },
    { id: "stok",        label: "Stok Awal / Bahan Baku Perdana", icon: "📦", uof: "inventory",
      hint: "Belanja persediaan pertama sebelum buka. Usaha jasa boleh 0." },
    { id: "promosi",     label: "Promosi Pembukaan & Branding", icon: "📣", uof: "marketing",
      hint: "Logo, banner, kampanye grand opening, iklan digital awal." },
    { id: "modal_kerja", label: "Modal Kerja Awal (Kas Opex 3 Bulan)", icon: "💼", uof: "workingCapital",
      hint: "Bantalan kas gaji + sewa + listrik 3 bulan pertama sebelum omset stabil." },
    { id: "lainnya",     label: "Lain-lain / Cadangan Tak Terduga", icon: "🧰", uof: "other",
      hint: "Buffer 5–10% dari total untuk biaya tak terduga." },
  ],
  lanjutan: [
    { id: "legalitas",   label: "Izin Tambahan untuk Pengembangan", icon: "📜", uof: "legal",
      hint: "Izin cabang/unit baru, perpanjangan sertifikat, perubahan akta." },
    { id: "renovasi",    label: "Renovasi / Fit-out Unit Baru",  icon: "🛠", uof: "renovasi",
      hint: "Pembangunan atau penyesuaian ruang untuk kapasitas tambahan." },
    { id: "sewa_deposit",label: "Deposit & Sewa Lokasi Baru di Muka", icon: "🏠", uof: "renovasi",
      hint: "Hanya jika pengembangan membuka lokasi/cabang baru." },
    { id: "stok",        label: "Stok Tambahan untuk Unit/Produk Baru", icon: "📦", uof: "inventory",
      hint: "Persediaan inkremental — bukan stok rutin yang sudah berjalan." },
    { id: "promosi",     label: "Promosi Peluncuran Pengembangan", icon: "📣", uof: "marketing",
      hint: "Kampanye produk/unit baru, soft opening cabang." },
    { id: "modal_kerja", label: "Tambahan Modal Kerja (Opex Inkremental 3 Bulan)", icon: "💼", uof: "workingCapital",
      hint: "Kas untuk gaji & operasional TAMBAHAN sampai unit baru menghasilkan." },
    { id: "lainnya",     label: "Lain-lain / Cadangan Tak Terduga", icon: "🧰", uof: "other",
      hint: "Buffer biaya tak terduga selama masa transisi pengembangan." },
  ],
};

export function getInvestmentCategories(stage) {
  return INVESTMENT_CATEGORIES[stage] || INVESTMENT_CATEGORIES.baru;
}

let _idSeq = 1;
export function makeItem(category, name, qty = 1, unitPrice = 0, note = "") {
  return { id: `inv_${Date.now()}_${_idSeq++}`, category, name, qty, unitPrice, note };
}

export function itemTotal(it) {
  return (Number(it?.qty) || 0) * (Number(it?.unitPrice) || 0);
}

export function sumByCategory(items = []) {
  const out = {};
  for (const it of items) {
    out[it.category] = (out[it.category] || 0) + itemTotal(it);
  }
  return out;
}

export function totalInvestmentItems(items = []) {
  return items.reduce((s, it) => s + itemTotal(it), 0);
}

/** Total peralatan dari sub-tab Alat & Karyawan (auto, tidak diinput ulang). */
export function equipmentTotal(forms) {
  return (forms?.alatSDM?.equipment || []).reduce(
    (s, e) => s + (e.qty || 0) * (e.pricePerUnit || 0), 0
  );
}

/**
 * Sewa bulanan yang KONSISTEN dengan "Sewa Tempat di Muka" pada Initial
 * Investment: total kategori sewa_deposit dibagi 12 bulan. Dipakai untuk
 * menyinkronkan field "Sewa Tempat Bulanan" di tab Proyeksi. Mengembalikan
 * null jika user belum mengisi sewa di muka (biar logika lama tetap jalan).
 */
export function monthlyRentFromInvestment(forms) {
  const items = forms?.modal?.investmentItems || [];
  const sewaTotal = items
    .filter((it) => it.category === "sewa_deposit")
    .reduce((s, it) => s + itemTotal(it), 0);
  if (sewaTotal <= 0) return null;
  return Math.round(sewaTotal / 12);
}

/**
 * TOTAL INITIAL INVESTMENT = rincian item + peralatan auto.
 * Inilah angka kebutuhan dana yang dipakai di Smart Balance, Bab 6.6 & Bab 7.
 */
export function totalInitialInvestment(forms) {
  return totalInvestmentItems(forms?.modal?.investmentItems || []) + equipmentTotal(forms);
}

/**
 * Derive agregat lama dari rincian item — dipanggil InitialInvestmentForm
 * lewat useEffect supaya financialEngine & scoringEngine lama tetap akurat.
 * Mapping (v13.2):
 *   legalitas                            → expenses.legal
 *   renovasi                             → expenses.renovasi (basis DEPRESIASI — murni capex)
 *   promosi                              → expenses.promo
 *   sewa_deposit + modal_kerja + lainnya → expenses.lainnya (kas non-depresiasi;
 *                                          deposit & modal kerja DIPULIHKAN di akhir horizon NPV)
 *   stok                                 → assets.stok
 */
export function deriveAggregates(items = []) {
  const c = sumByCategory(items);
  return {
    expenses: {
      legal: c.legalitas || 0,
      renovasi: c.renovasi || 0,
      promo: c.promosi || 0,
      lainnya: (c.sewa_deposit || 0) + (c.modal_kerja || 0) + (c.lainnya || 0),
    },
    assets: { stok: c.stok || 0 },
  };
}

/**
 * USE OF FUNDS untuk laporan (Bab 6.6 & 7) — derive dari rincian investasi +
 * peralatan auto. TIDAK lagi bergantung pada input manual fundingTarget.useOfFunds
 * (sumber angka nol di versi lama).
 */
export function deriveUseOfFunds(forms, stage = "baru") {
  const items = forms?.modal?.investmentItems || [];
  const cats = getInvestmentCategories(stage);
  const byCat = sumByCategory(items);
  const uof = { renovasi: 0, equipment: 0, inventory: 0, marketing: 0, workingCapital: 0, legal: 0, other: 0 };
  for (const cat of cats) {
    uof[cat.uof] = (uof[cat.uof] || 0) + (byCat[cat.id] || 0);
  }
  uof.equipment += equipmentTotal(forms);

  // Fallback ke skema lama (kalau user lama belum migrasi ke rincian item):
  const legacyTotal = Object.values(uof).reduce((s, v) => s + v, 0);
  if (legacyTotal === 0) {
    const old = forms?.fundingTarget?.useOfFunds || {};
    const oldTotal = Object.values(old).reduce((s, v) => s + (v || 0), 0);
    if (oldTotal > 0) return { ...uof, ...old };
    // Fallback terakhir: agregat expenses/assets lama
    const e = forms?.modal?.expenses || {};
    const a = forms?.modal?.assets || {};
    return {
      legal: e.legal || 0,
      renovasi: e.renovasi || 0,
      marketing: e.promo || 0,
      inventory: a.stok || 0,
      workingCapital: e.lainnya || 0,
      equipment: equipmentTotal(forms),
      other: 0,
    };
  }
  return uof;
}

// ============================================================================
// RULE-BASED ITEMIZER — rekomendasi rincian dari data harga riil pasar
// (DEFAULT_COSTS per sektor KBLI + UMP/UMK provinsi 2025 + biaya legal resmi)
// ============================================================================

const round100k = (n) => Math.round(n / 100_000) * 100_000;
const round50k = (n) => Math.round(n / 50_000) * 50_000;

/**
 * Estimasi opex bulanan (sewa + utilitas + gaji UMK) — basis modal kerja 3 bulan.
 */
function estimateMonthlyOpex(forms) {
  const sectorCode = forms?.identitas?.sectorCode;
  const skala = getSkala(forms?.identitas?.skalaBisnis) || { id: "mikro", scaleFactor: 1 };
  const cost = DEFAULT_COSTS[sectorCode];
  const sqrtScale = Math.sqrt(skala.scaleFactor);

  let opexBase = 0;
  if (cost?.opex) opexBase = cost.opex.reduce((s, o) => s + (o.value || 0), 0);
  else opexBase = 6_000_000;

  // Gaji dari UMK riil provinsi/kota
  const umk = getMinWage(forms?.identitas?.provinceCode, forms?.identitas?.cityCode) || 3_000_000;
  const headcount = { mikro: 2, kecil: 4, menengah: 7, besar: 12 }[skala.id] || 2;
  const payroll = umk * 1.15 * headcount; // 1.15 = rata-rata di atas UMK + BPJS

  return round50k(opexBase * sqrtScale + payroll);
}

/**
 * suggestInvestmentItems(forms, stage) → Array item rekomendasi rule-based.
 * Mengambil rincian per-item dari DEFAULT_COSTS (harga riil pasar Indonesia)
 * dan menyesuaikan dengan skala + UMK daerah. Untuk stage "lanjutan",
 * porsi dikecilkan (inkremental) dan item legalitas dasar dianggap sudah ada.
 */
export function suggestInvestmentItems(forms, stage = "baru") {
  const sectorCode = forms?.identitas?.sectorCode;
  const skala = getSkala(forms?.identitas?.skalaBisnis);
  if (!sectorCode || !skala) return null;

  const cost = DEFAULT_COSTS[sectorCode] || {};
  const sector = getSector(sectorCode);
  const sqrtScale = Math.sqrt(skala.scaleFactor);
  const incr = stage === "lanjutan" ? 0.6 : 1.0; // faktor inkremental
  // v13.2: dampener capex per skala — DEFAULT_COSTS dikalibrasi untuk usaha
  // kecil "standar"; untuk MIKRO, renovasi/interior penuh (mis. Rp 60 jt)
  // membuat NPV proyek negatif semu. Mikro memakai versi hemat yang realistis.
  const capexDamp = { mikro: 0.5, kecil: 0.85, menengah: 1.0, besar: 1.0 }[skala.id] || 1.0;
  // v13.5: Deposit/sewa di muka DISERAGAMKAN 12 bulan (1 tahun) — banyak
  // pemilik ruko meminta bayar setahun di depan, dan ini menyederhanakan
  // sinkronisasi "sewa bulanan" di tab Proyeksi (= total / 12).
  const depositMonths = 12;
  const items = [];

  // --- 1. LEGALITAS (per-item riil dari DEFAULT_COSTS.legal) ---
  const legalItems = cost.legal || [
    { name: "NIB (OSS) — gratis", value: 0 },
    { name: "Akta & Notaris", value: 2_500_000 },
  ];
  for (const l of legalItems) {
    // Bisnis lanjutan: legalitas dasar (NIB, akta) dianggap sudah dimiliki
    if (stage === "lanjutan" && /nib|akta/i.test(l.name || "")) continue;
    items.push(makeItem("legalitas",
      stage === "lanjutan" ? `${l.name} (unit/izin tambahan)` : l.name,
      1, round50k((l.value || 0) * sqrtScale)));
  }

  // --- 2. RENOVASI (dari assets bertipe renovasi/interior/signage) ---
  const renoAssets = (cost.assets || []).filter((a) =>
    /renovasi|interior|signage|branding fisik|instalasi/i.test(a.name || ""));
  if (renoAssets.length > 0) {
    for (const r of renoAssets) {
      items.push(makeItem("renovasi",
        stage === "lanjutan" ? `${r.name} — unit pengembangan` : (skala.id === "mikro" ? `${r.name} (versi hemat skala mikro)` : r.name),
        1, round100k((r.value || 0) * sqrtScale * incr * capexDamp)));
    }
  } else {
    items.push(makeItem("renovasi",
      stage === "lanjutan" ? "Fit-out ruang unit baru" : "Renovasi & penyesuaian ruang",
      1, round100k(15_000_000 * sqrtScale * incr * capexDamp)));
  }

  // --- 3. DEPOSIT SEWA (sewa bulanan × bulan di muka, sesuai skala) ---
  const sewaMonthly = (cost.opex || []).filter((o) => /sewa/i.test(o.name || ""))
    .reduce((s, o) => s + (o.value || 0), 0) || 4_000_000;
  items.push(makeItem("sewa_deposit",
    stage === "lanjutan" ? `Sewa lokasi baru dibayar 1 tahun di muka` : `Sewa tempat dibayar 1 tahun di muka (12 bulan)`,
    depositMonths, round50k(sewaMonthly * sqrtScale * capexDamp)));

  // --- 4. STOK AWAL ---
  const baseStok = cost.stokAwal || (sectorCode.startsWith("56") ? 4_000_000
    : sectorCode.startsWith("47") ? 25_000_000 : 5_000_000);
  items.push(makeItem("stok",
    stage === "lanjutan" ? "Stok tambahan unit/produk baru" : "Belanja stok & bahan baku perdana",
    1, round100k(baseStok * skala.scaleFactor * incr)));

  // --- 5. PROMOSI (per-item riil dari DEFAULT_COSTS.marketing) ---
  const mktItems = cost.marketing || [{ name: "Kampanye pembukaan", value: 4_000_000 }];
  for (const m of mktItems) {
    if (stage === "lanjutan" && /logo|branding/i.test(m.name || "")) continue; // brand sudah ada
    items.push(makeItem("promosi", m.name, 1, round50k((m.value || 0) * sqrtScale * incr * capexDamp)));
  }

  // --- 6. MODAL KERJA (opex riil + gaji UMK daerah × 3 bulan) ---
  const monthlyOpex = estimateMonthlyOpex(forms);
  items.push(makeItem("modal_kerja",
    stage === "lanjutan"
      ? "Kas opex & gaji tambahan (3 bulan transisi)"
      : "Kas operasional & gaji 3 bulan pertama",
    3, round100k(monthlyOpex * incr),
    `Estimasi gaji memakai UMK ${PROVINCES[forms?.identitas?.provinceCode]?.name || "daerah Anda"} 2025`));

  // --- 7. BUFFER 5% ---
  const subtotal = totalInvestmentItems(items);
  items.push(makeItem("lainnya", "Cadangan biaya tak terduga (±5%)", 1, round100k(subtotal * 0.05)));

  return { items, sectorName: sector?.name || sectorCode, monthlyOpex };
}

/**
 * Prompt untuk rekomendasi AI — minta JSON rincian dengan harga pasar riil
 * sesuai sektor, daerah, skala, dan jenis bisnis.
 */
export function buildAiInvestmentPrompt(forms, stage) {
  const i = forms?.identitas || {};
  const sector = getSector(i.sectorCode);
  const prov = PROVINCES[i.provinceCode];
  const umk = getMinWage(i.provinceCode, i.cityCode);
  const skala = getSkala(i.skalaBisnis);
  const catList = getInvestmentCategories(stage).map((c) => c.id).join(", ");

  return `Anda adalah konsultan studi kelayakan bisnis UMKM Indonesia. Susun rincian INITIAL INVESTMENT (kebutuhan dana awal) yang realistis dengan HARGA PASAR RIIL Indonesia tahun 2025-2026.

KONTEKS BISNIS:
- Nama: ${i.namaBisnis || "(belum diisi)"}
- Jenis: ${stage === "lanjutan" ? "BISNIS BERJALAN yang mencari dana PENGEMBANGAN (hanya kebutuhan TAMBAHAN/inkremental, legalitas dasar & brand sudah ada)" : "BISNIS BARU dari nol (kebutuhan lengkap start-up)"}
- Sektor: ${sector ? `${sector.name} (KBLI ${i.sectorCode}, ${sector.group})` : "(belum dipilih)"}
- Lokasi: ${prov?.name || "Indonesia"}${umk ? ` — UMK/UMP 2025 sekitar Rp ${umk.toLocaleString("id-ID")}/bulan, gunakan ini untuk komponen gaji` : ""}
- Skala: ${skala?.label || "mikro"}
- Deskripsi: ${i.deskripsi || "-"}

ATURAN:
1. Gunakan harga riil pasar Indonesia saat ini untuk barang, jasa, sewa, dan gaji (gaji mengacu UMK daerah di atas).
2. Kategori yang valid HANYA: ${catList}.
3. 8-14 baris item, masing-masing spesifik (sebut nama barang/jasa nyata, bukan generik).
4. NIB via OSS gratis; sertifikat halal jalur SEHATI gratis — jangan kasih harga mahal untuk itu.
5. Modal kerja = (opex + gaji) sekitar 3 bulan.

JAWAB HANYA JSON ARRAY VALID tanpa teks lain, format:
[{"category":"legalitas","name":"...","qty":1,"unitPrice":2500000}]`;
}
