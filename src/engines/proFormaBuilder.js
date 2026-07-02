import {
  computeYearPnL,
  computeFinancials,
} from "./financialEngine.js";

// ============================================================================
// PRO FORMA BUILDER
//
// Membangun 3 statement keuangan resmi:
//   1. Laporan Laba Rugi (P&L) — 12 bulan per tahun, 3 tahun
//   2. Laporan Arus Kas — 12 bulan per tahun, 3 tahun
//   3. Neraca (Balance Sheet) — posisi tahunan
//
// Konsumsi: forms state lengkap + provinceCode.
// Output: struktur tabular siap dirender di Tab 3 (Jalur C) atau Bab 9.
// ============================================================================

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// ----- 1. PRO FORMA P&L 12 BULAN PER TAHUN -----

/**
 * Bangun P&L 12 bulan untuk satu tahun proyeksi.
 * Asumsi: distribusi merata 12 bulan + slight seasonality opsional.
 */
export function buildMonthlyPnL(forms, year, provinceCode) {
  const annual = computeYearPnL(forms, year, provinceCode);
  // Distribusi 12 bulan — UMKM kuliner punya seasonality (Ramadan/akhir tahun lebih tinggi),
  // tapi untuk Tahap 6 kita pakai rata-rata dulu. Bisa di-enhance nanti.
  const months = MONTHS.map((m, i) => ({
    month: m,
    monthIdx: i,
    revenue: annual.revenue / 12,
    hpp: annual.hpp / 12,
    grossProfit: annual.grossProfit / 12,
    personnel: annual.operatingExpenses.personnel / 12,
    opex: annual.operatingExpenses.opex / 12,
    depreciation: annual.operatingExpenses.depreciation / 12,
    ebit: annual.ebit / 12,
    tax: annual.tax.amount / 12,
    netIncome: annual.netIncome / 12,
  }));
  return { year, months, annual };
}

/**
 * Bangun P&L 3 tahun (3 × 12 bulan).
 */
export function buildPnL3Years(forms, provinceCode) {
  return [1, 2, 3].map((y) => buildMonthlyPnL(forms, y, provinceCode));
}

// ----- 2. CASH FLOW STATEMENT -----

/**
 * Pro Forma Cash Flow untuk satu tahun, dibagi per bulan.
 * Struktur 3 bagian: Operating, Investing, Financing.
 */
export function buildMonthlyCashFlow(forms, year, provinceCode) {
  const pnl = buildMonthlyPnL(forms, year, provinceCode);

  // Investing activity: hanya di Year 1 bulan 1 (initial CapEx)
  const initialCapEx = year === 1
    ? (forms?.alatSDM?.equipment || []).reduce(
        (s, e) => s + (e.qty || 0) * (e.pricePerUnit || 0),
        0
      ) +
      (forms?.modal?.expenses?.legal || 0) +
      (forms?.modal?.expenses?.renovasi || 0) +
      (forms?.modal?.expenses?.promo || 0) +
      (forms?.modal?.assets?.stok || 0)
    : 0;

  // Financing: hanya di Year 1 bulan 1 (initial funding inflow)
  const initialFunding = year === 1
    ? (forms?.modal?.funding?.modalPribadi || 0) +
      (forms?.modal?.funding?.modalMitra || 0) +
      (forms?.modal?.funding?.modalPinjaman || 0)
    : 0;

  const months = pnl.months.map((m, i) => {
    // Operating: net income + depreciation (non-cash) - working capital change (≈0 untuk UMKM)
    const operating = m.netIncome + m.depreciation;
    const investing = i === 0 ? -initialCapEx : 0;
    const financing = i === 0 ? initialFunding : 0;
    const netCash = operating + investing + financing;
    return {
      ...m,
      operating,
      investing,
      financing,
      netCash,
    };
  });

  // Cumulative cash balance running
  let balance = 0;
  for (const m of months) {
    balance += m.netCash;
    m.cashBalance = balance;
  }

  const totalAnnual = months.reduce(
    (acc, m) => ({
      operating: acc.operating + m.operating,
      investing: acc.investing + m.investing,
      financing: acc.financing + m.financing,
      netCash: acc.netCash + m.netCash,
    }),
    { operating: 0, investing: 0, financing: 0, netCash: 0 }
  );

  return {
    year,
    months,
    annual: totalAnnual,
    endingCash: balance,
  };
}

export function buildCashFlow3Years(forms, provinceCode) {
  return [1, 2, 3].map((y) => buildMonthlyCashFlow(forms, y, provinceCode));
}

// ----- 3. NERACA (BALANCE SHEET) -----

/**
 * Pro Forma Neraca akhir tiap tahun.
 *
 * ASET:
 *   - Aset Lancar: Kas, Persediaan (stok)
 *   - Aset Tetap: Peralatan (net = gross - akumulasi penyusutan)
 *
 * KEWAJIBAN & EKUITAS:
 *   - Kewajiban: Pinjaman (outstanding balance, untuk Tahap 6 dianggap belum dicicil/sederhana)
 *   - Ekuitas: Modal Pribadi + Mitra + Saldo Laba kumulatif
 *
 * Sederhana untuk UMKM — belum ada hutang lancar, piutang, dll.
 */
export function buildBalanceSheet(forms, provinceCode) {
  const cf3 = buildCashFlow3Years(forms, provinceCode);
  const pnl3 = buildPnL3Years(forms, provinceCode);

  const equipment = forms?.alatSDM?.equipment || [];
  const grossEquipment = equipment.reduce(
    (s, e) => s + (e.qty || 0) * (e.pricePerUnit || 0),
    0
  );
  const annualDep = grossEquipment / 5;

  const modalPribadi = forms?.modal?.funding?.modalPribadi || 0;
  const modalMitra = forms?.modal?.funding?.modalMitra || 0;
  const modalPinjaman = forms?.modal?.funding?.modalPinjaman || 0;
  const stokAwal = forms?.modal?.assets?.stok || 0;

  // Year 0 (posisi awal)
  const year0 = {
    year: 0,
    label: "Awal (Year 0)",
    assets: {
      cash: 0, // sementara, akan diisi setelah kalkulasi
      inventory: stokAwal,
      equipmentGross: grossEquipment,
      accumulatedDep: 0,
      equipmentNet: grossEquipment,
      totalAssets: 0,
    },
    liabilities: {
      loans: modalPinjaman,
    },
    equity: {
      paidInCapital: modalPribadi + modalMitra,
      retainedEarnings: 0,
    },
    totalLiabEquity: 0,
  };

  // Cash awal = total funding - initial CapEx - inventory
  const initialFunding = modalPribadi + modalMitra + modalPinjaman;
  const initialCapEx =
    grossEquipment +
    (forms?.modal?.expenses?.legal || 0) +
    (forms?.modal?.expenses?.renovasi || 0) +
    (forms?.modal?.expenses?.promo || 0);
  year0.assets.cash = Math.max(0, initialFunding - initialCapEx - stokAwal);
  year0.assets.totalAssets =
    year0.assets.cash +
    year0.assets.inventory +
    year0.assets.equipmentNet;
  year0.totalLiabEquity =
    year0.liabilities.loans +
    year0.equity.paidInCapital +
    year0.equity.retainedEarnings;

  // Year 1, 2, 3
  const balances = [year0];
  let cumulativeRetained = 0;
  let cumulativeDep = 0;

  for (let y = 1; y <= 3; y++) {
    const cfYear = cf3[y - 1];
    const pnlYear = pnl3[y - 1].annual;
    cumulativeRetained += pnlYear.netIncome;
    cumulativeDep += annualDep;

    const cashEnd = y === 1
      ? year0.assets.cash + cfYear.annual.operating + cfYear.annual.investing + cfYear.annual.financing
      : balances[y - 1].assets.cash + cfYear.annual.operating + cfYear.annual.investing + cfYear.annual.financing;

    const equipNet = Math.max(0, grossEquipment - cumulativeDep);

    const yEntry = {
      year: y,
      label: `Akhir Tahun ${y}`,
      assets: {
        cash: cashEnd,
        inventory: stokAwal, // sederhana — anggap stok konstan, di production bisa di-restock
        equipmentGross: grossEquipment,
        accumulatedDep: cumulativeDep,
        equipmentNet: equipNet,
        totalAssets: cashEnd + stokAwal + equipNet,
      },
      liabilities: {
        loans: modalPinjaman, // Tahap 6: belum ada amortisasi cicilan (bisa di-enhance)
      },
      equity: {
        paidInCapital: modalPribadi + modalMitra,
        retainedEarnings: cumulativeRetained,
      },
      totalLiabEquity: modalPinjaman + (modalPribadi + modalMitra) + cumulativeRetained,
    };
    balances.push(yEntry);
  }

  return balances;
}

// ----- 4. ONE-SHOT: PRO FORMA LENGKAP -----

/**
 * Bangun semua pro forma + indikator finansial dalam satu pemanggilan.
 * Output siap dipakai reportAssembler & Tab 3.
 */
export function buildProForma(forms, provinceCode, sectorBeta = 1.0) {
  const financials = computeFinancials(forms, provinceCode, sectorBeta);
  const pnl = buildPnL3Years(forms, provinceCode);
  const cashFlow = buildCashFlow3Years(forms, provinceCode);
  const balanceSheet = buildBalanceSheet(forms, provinceCode);
  return {
    financials,
    pnl,
    cashFlow,
    balanceSheet,
  };
}
