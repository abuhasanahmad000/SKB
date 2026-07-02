import { findValue, BAB_6_3_TUNJANGAN, BAB_6_2_HPP } from "../data/babOptions.js";
import { sumByCategory } from "./investmentHelper.js";
import { MACRO_INDICATORS } from "../data/bpsBenchmark.js";
import { getInflation } from "../data/provinces.js";
import { resolveGrowthRate } from "./growthHelper.js";

// ============================================================================
// FINANCIAL ENGINE
//
// Port + adaptasi dari prototype v4 (bizcast-final.jsx lines 71-86):
//   - personnelAnnual, personnelStartup
//   - triangulate (3-method revenue) → diadaptasi pakai ProductTable
//   - buildFCF (dengan PPh Final/PPh Badan auto switch)
//   - npvOf, irrOf, paybackOf
//   - monteCarlo (5000 skenario)
//
// API utama:
//   computeFinancials(forms, provinceCode) → semua angka 3-tahun
// ============================================================================

const DEFAULT_OPERATING_DAYS = 360;       // hari operasional setahun untuk UMKM
const DEFAULT_EQUIPMENT_LIFE = 5;          // umur ekonomis default (untuk penyusutan)
const PROJECTION_YEARS = 3;                // horizon proyeksi
const MONTE_CARLO_RUNS = 5000;

// ----- 1. REVENUE (dari ProductTable) -----

/**
 * Hitung pendapatan tahunan dari array produk.
 * Pertumbuhan diaplikasikan compounded per tahun.
 */
export function computeRevenueYear(products = [], growthPct = 0, year = 1, operatingDays = DEFAULT_OPERATING_DAYS) {
  const dailySum = products.reduce(
    (s, p) => s + (p.dailyTarget || 0) * (p.price || 0),
    0
  );
  const annualBase = dailySum * operatingDays;
  return annualBase * Math.pow(1 + growthPct, year - 1);
}

// ----- 2. HPP / COGS -----

/**
 * Hitung HPP tahunan = sum(produk × dailyTarget × hppPct × operatingDays × growth)
 */
export function computeHppYear(products = [], hppPerProduk = {}, growthPct = 0, year = 1, operatingDays = DEFAULT_OPERATING_DAYS) {
  const dailyHpp = products.reduce((s, p, idx) => {
    const hppId = hppPerProduk[idx];
    const hppPct = findValue(BAB_6_2_HPP, hppId) ?? 0.4; // default 40% jika belum dipilih
    const productHpp = (p.dailyTarget || 0) * (p.price || 0) * hppPct;
    return s + productHpp;
  }, 0);
  const annual = dailyHpp * operatingDays;
  return annual * Math.pow(1 + growthPct, year - 1);
}

// ----- 3. PERSONNEL / PAYROLL -----

/**
 * Hitung total payroll tahunan = sum posisi aktif × count × salary × 12 × (1+tunjangan).
 */
export function computePersonnelAnnual(personnel = {}, year = 1, inflation = 0.027) {
  const positions = personnel.positions || {};
  const baseMonth = Object.values(positions).reduce((s, p) => {
    if (!p?.active) return s;
    return s + (p.count || 0) * (p.salary || 0);
  }, 0);
  const allowancePct = findValue(BAB_6_3_TUNJANGAN, personnel.allowanceMode) ?? 0;
  const monthlyWithAllowance = baseMonth * (1 + allowancePct);
  // Eskalasi inflasi per tahun
  return monthlyWithAllowance * 12 * Math.pow(1 + inflation, year - 1);
}

// ----- 4. DEPRECIATION -----

/**
 * Penyusutan straight-line dari peralatan.
 * Default umur 5 tahun.
 */
export function computeDepreciation(equipment = [], life = DEFAULT_EQUIPMENT_LIFE) {
  const totalAsset = equipment.reduce(
    (s, e) => s + (e.qty || 0) * (e.pricePerUnit || 0),
    0
  );
  return { totalAsset, annual: totalAsset / life };
}

// ----- 4b. JADWAL HUTANG (v13.2 — satu sumber kebenaran beban bunga) -----

/**
 * Jadwal amortisasi anuitas pinjaman bank.
 * Dipakai oleh computeYearPnL (beban bunga di P&L), tabel Pro Forma, dan
 * analisis DSCR Bab 6.6 — supaya narasi & tabel TIDAK PERNAH beda angka lagi.
 */
export function computeDebtSchedule(forms, horizonYears = 3) {
  const principal = forms?.modal?.funding?.modalPinjaman || 0;
  const tenor = forms?.fundingTarget?.tenor || 36;
  const annualRate = 0.115;
  const r = annualRate / 12;
  if (principal <= 0 || tenor <= 0) {
    return {
      principal: 0, tenor, annualRate, monthlyPayment: 0, annualDebtService: 0,
      interestByYear: Array(horizonYears).fill(0),
      principalByYear: Array(horizonYears).fill(0),
      totalInterest: 0,
    };
  }
  const monthlyPayment = (principal * r * Math.pow(1 + r, tenor)) / (Math.pow(1 + r, tenor) - 1);
  const interestByYear = Array(horizonYears).fill(0);
  const principalByYear = Array(horizonYears).fill(0);
  let balance = principal;
  let totalInterest = 0;
  for (let m = 0; m < tenor && m < horizonYears * 12; m++) {
    const interest = balance * r;
    const pokok = monthlyPayment - interest;
    const yIdx = Math.floor(m / 12);
    interestByYear[yIdx] += interest;
    principalByYear[yIdx] += pokok;
    totalInterest += interest;
    balance -= pokok;
  }
  return {
    principal,
    tenor,
    annualRate,
    monthlyPayment: Math.round(monthlyPayment),
    annualDebtService: Math.round(monthlyPayment * 12),
    interestByYear: interestByYear.map((v) => Math.round(v)),
    principalByYear: principalByYear.map((v) => Math.round(v)),
    totalInterest: Math.round(totalInterest),
  };
}

// ----- 5. OPEX (selain personnel & depreciation) -----

/**
 * Total opex bulanan dari form keuangan.opex.
 */
export function computeMonthlyOpex(opex = {}) {
  return (
    (opex.marketing || 0) +
    (opex.utilities || 0) +
    (opex.rent || 0) +
    (opex.other || 0)
  );
}

export function computeAnnualOpex(opex = {}, year = 1, inflation = 0.027) {
  return computeMonthlyOpex(opex) * 12 * Math.pow(1 + inflation, year - 1);
}

// ----- 6. TAX -----

/**
 * Pajak penghasilan otomatis:
 *   - Omzet ≤ Rp 4,8 M/tahun → PPh Final UMKM 0,5% × omzet (PP 23/2018)
 *   - Omzet > Rp 4,8 M       → PPh Badan 22% × laba bersih sebelum pajak (EBT)
 */
export function computeTax(revenueAnnual, ebt) {
  if (revenueAnnual <= MACRO_INDICATORS.pphFinalThreshold) {
    return {
      method: "final",
      rate: MACRO_INDICATORS.pphFinalUmkmRate,
      amount: revenueAnnual * MACRO_INDICATORS.pphFinalUmkmRate,
    };
  }
  return {
    method: "badan",
    rate: MACRO_INDICATORS.pphBadanRate,
    amount: Math.max(0, ebt) * MACRO_INDICATORS.pphBadanRate,
  };
}

// ----- 7. ANNUAL P&L PER YEAR -----

/**
 * Hitung satu tahun P&L lengkap.
 */
export function computeYearPnL(forms, year, provinceCode) {
  const growthPct = resolveGrowthRate(forms);
  const inflation = getInflation(provinceCode);
  const operatingDays = DEFAULT_OPERATING_DAYS;

  const revenue = computeRevenueYear(
    forms?.keuangan?.products || [],
    growthPct,
    year,
    operatingDays
  );
  const hpp = computeHppYear(
    forms?.keuangan?.products || [],
    forms?.keuangan?.hppPerProduk || {},
    growthPct,
    year,
    operatingDays
  );
  const grossProfit = revenue - hpp;

  const personnel = computePersonnelAnnual(forms?.alatSDM?.personnel || {}, year, inflation);
  const opex = computeAnnualOpex(forms?.keuangan?.opex || {}, year, inflation);
  const dep = computeDepreciation(forms?.alatSDM?.equipment || []);
  // v13.2: depresiasi renovasi (straight-line 5 thn) ikut dihitung —
  // sebelumnya hanya tabel Pro Forma yang menghitungnya sehingga laba bersih
  // di narasi vs tabel BEDA (kontradiksi fatal di mata analis).
  const renovasiDep = (forms?.modal?.expenses?.renovasi || 0) / 5;
  const totalDepreciation = dep.annual + renovasiDep;

  const totalOpex = personnel + opex + totalDepreciation;
  const ebit = grossProfit - totalOpex;
  // v13.2: beban bunga pinjaman (anuitas riil) ikut di P&L — sumber yang sama
  // dengan tabel Pro Forma & DSCR.
  const debtSchedule = computeDebtSchedule(forms);
  const interest = debtSchedule.interestByYear[year - 1] || 0;
  const ebt = ebit - interest;
  const tax = computeTax(revenue, ebt);
  const netIncome = ebt - tax.amount;

  // Breakdown opex bulanan-dasar untuk tabel Pro Forma (sumber tunggal)
  const monthlyOpexForm = forms?.keuangan?.opex || {};
  const opexFactor = Math.pow(1 + inflation, year - 1);

  return {
    year,
    revenue,
    hpp,
    grossProfit,
    grossMargin: revenue > 0 ? grossProfit / revenue : 0,
    operatingExpenses: {
      personnel,
      opex,
      depreciation: totalDepreciation,
      total: totalOpex,
      // rincian untuk tabel (konsisten dengan `opex` agregat)
      breakdown: {
        marketing: Math.round((monthlyOpexForm.marketing || 0) * 12 * opexFactor),
        utilities: Math.round((monthlyOpexForm.utilities || 0) * 12 * opexFactor),
        rent: Math.round((monthlyOpexForm.rent || 0) * 12 * opexFactor),
        other: Math.round((monthlyOpexForm.other || 0) * 12 * opexFactor),
      },
    },
    interest,
    ebit,
    ebt,
    tax,
    netIncome,
    netMargin: revenue > 0 ? netIncome / revenue : 0,
  };
}

// ----- 8. PROJECTION 3-YEAR -----

export function computeProjection(forms, provinceCode, years = PROJECTION_YEARS) {
  const result = [];
  for (let y = 1; y <= years; y++) {
    result.push(computeYearPnL(forms, y, provinceCode));
  }
  return result;
}

// ----- 9. FREE CASH FLOW -----

/**
 * Free Cash Flow = NetIncome + Depreciation - WorkingCapitalChange
 * Untuk UMKM, WC change diabaikan (kecil). Year 0 = -InitialInvestment.
 */
export function computeFCF(forms, provinceCode) {
  const projection = computeProjection(forms, provinceCode);
  const initialInvestment =
    (forms?.modal?.expenses?.legal || 0) +
    (forms?.modal?.expenses?.renovasi || 0) +
    (forms?.modal?.expenses?.promo || 0) +
    (forms?.modal?.expenses?.lainnya || 0) + // v13.1: modal kerja & cadangan dari rincian Initial Investment
    (forms?.modal?.assets?.stok || 0) +
    (forms?.alatSDM?.equipment || []).reduce(
      (s, e) => s + (e.qty || 0) * (e.pricePerUnit || 0),
      0
    );

  // v13.2: komponen DAPAT KEMBALI (recoverable) di akhir horizon proyeksi —
  // deposit sewa dikembalikan pemilik tempat, modal kerja & stok kembali
  // menjadi kas saat siklus operasional berputar. Tanpa ini, NPV/IRR proyek
  // mikro selalu negatif semu karena kas yang tidak hilang dihitung hangus.
  const cats = sumByCategory(forms?.modal?.investmentItems || []);
  const recoverable =
    (cats.sewa_deposit || 0) +
    (cats.modal_kerja || 0) +
    (forms?.modal?.assets?.stok || 0);

  const fcf = [-initialInvestment]; // Year 0
  projection.forEach((y, i) => {
    // FCF proyek (unlevered): laba bersih + depresiasi + bunga (dikembalikan,
    // karena biaya modal sudah tercermin di tingkat diskonto WACC).
    let flow = y.netIncome + y.operatingExpenses.depreciation + (y.interest || 0);
    if (i === projection.length - 1) flow += recoverable; // terminal recovery
    fcf.push(flow);
  });
  return { fcf, initialInvestment, projection };
}

// ----- 10. NPV -----

/**
 * Net Present Value dari array CF.
 * cf[0] = Year 0, cf[1] = Year 1, dst.
 */
export function npvOf(cf, rate) {
  return cf.reduce((sum, c, t) => sum + c / Math.pow(1 + rate, t), 0);
}

// ----- 11. IRR -----

/**
 * Internal Rate of Return via Newton-Raphson + bisection fallback.
 * Port logic dari prototype v4.
 */
export function irrOf(cf, guess = 0.1) {
  if (!cf || cf.length < 2) return null;
  // Bisection sebagai fallback yang stabil
  let low = -0.99;
  let high = 5.0;
  let mid = guess;
  for (let i = 0; i < 200; i++) {
    mid = (low + high) / 2;
    const v = npvOf(cf, mid);
    if (Math.abs(v) < 0.01) return mid;
    const vLow = npvOf(cf, low);
    if ((vLow < 0 && v < 0) || (vLow > 0 && v > 0)) low = mid;
    else high = mid;
  }
  return mid;
}

// ----- 12. PAYBACK PERIOD -----

/**
 * Payback Period dalam tahun (bisa pecahan).
 * Return null kalau modal tidak balik dalam horizon.
 */
export function paybackOf(cf) {
  if (!cf || cf.length < 2) return null;
  let cumulative = cf[0]; // negatif
  for (let t = 1; t < cf.length; t++) {
    const prev = cumulative;
    cumulative += cf[t];
    if (cumulative >= 0 && cf[t] > 0) {
      // Interpolasi linear
      const fraction = -prev / cf[t];
      return t - 1 + fraction;
    }
  }
  return null; // modal belum balik dalam horizon
}

// ----- 13. BREAK-EVEN POINT (Bab 8.2) -----

/**
 * BEP omset bulanan minimum.
 * Formula: BEP = FixedCost / (1 - HPP%)
 * Pakai Year 1 sebagai baseline.
 */
export function computeBEP(forms, provinceCode) {
  const y1 = computeYearPnL(forms, 1, provinceCode);
  const fixedCostMonthly = (y1.operatingExpenses.total) / 12;
  const grossMarginPct = y1.grossMargin;
  const bepMonthlySales = grossMarginPct > 0 ? fixedCostMonthly / grossMarginPct : null;
  return {
    fixedCostMonthly,
    grossMarginPct,
    bepMonthlySales,
    bepDailySales: bepMonthlySales ? bepMonthlySales / 30 : null,
  };
}

// ----- 14. WACC (Weighted Average Cost of Capital) -----

/**
 * WACC sederhana untuk diskonto NPV.
 * Pakai default CAPM dengan beta sektor (kalau ada di SECTORS).
 */
export function computeWACC(forms, sectorBeta = 1.0) {
  const totalFunding =
    (forms?.modal?.funding?.modalPribadi || 0) +
    (forms?.modal?.funding?.modalMitra || 0) +
    (forms?.modal?.funding?.modalPinjaman || 0);

  if (totalFunding <= 0) return MACRO_INDICATORS.riskFreeRate + 0.05; // fallback

  const debtRatio = (forms?.modal?.funding?.modalPinjaman || 0) / totalFunding;
  const equityRatio = 1 - debtRatio;

  // Cost of equity (CAPM)
  const costOfEquity =
    MACRO_INDICATORS.riskFreeRate + sectorBeta * MACRO_INDICATORS.marketRiskPremium;
  // Cost of debt after tax
  const costOfDebt = MACRO_INDICATORS.defaultLoanRate * (1 - MACRO_INDICATORS.pphBadanRate);

  return equityRatio * costOfEquity + debtRatio * costOfDebt;
}

// ----- 15. MONTE CARLO -----

/**
 * Simulasi Monte Carlo untuk distribusi NPV.
 * Varies: revenue ±15%, opex ±10%, growth ±20%.
 * Port dari v4 (5000 skenario).
 */
export function monteCarloNPV(forms, provinceCode, sectorBeta = 1.0, runs = MONTE_CARLO_RUNS) {
  const wacc = computeWACC(forms, sectorBeta);
  const baseGrowth = resolveGrowthRate(forms);
  const baseProducts = forms?.keuangan?.products || [];
  const baseOpex = forms?.keuangan?.opex || {};

  const results = [];

  for (let i = 0; i < runs; i++) {
    // Variasi random
    const revFactor = 0.85 + Math.random() * 0.30;   // ±15%
    const opexFactor = 0.90 + Math.random() * 0.20;  // ±10%
    const growthFactor = 0.80 + Math.random() * 0.40; // ±20%

    // Clone forms dengan modifikasi
    const variedProducts = baseProducts.map((p) => ({
      ...p,
      dailyTarget: (p.dailyTarget || 0) * revFactor,
    }));
    const variedOpex = {
      marketing: (baseOpex.marketing || 0) * opexFactor,
      utilities: (baseOpex.utilities || 0) * opexFactor,
      rent: (baseOpex.rent || 0) * opexFactor,
      other: (baseOpex.other || 0) * opexFactor,
    };
    const variedForms = {
      ...forms,
      keuangan: {
        ...forms.keuangan,
        products: variedProducts,
        opex: variedOpex,
      },
    };
    // Adjust growth dengan factor
    const variedGrowthRaw = baseGrowth * growthFactor;
    // (Karena growth pakai id dropdown, kita override langsung di compute)

    const { fcf } = computeFCF(variedForms, provinceCode);
    // Override growth manual untuk Monte Carlo
    // Simplify: pakai struktur asli, hanya scale fcf
    const scaledFcf = fcf.map((c, t) =>
      t === 0 ? c : c * Math.pow(1 + variedGrowthRaw, t - 1) / Math.pow(1 + baseGrowth, t - 1)
    );
    const npv = npvOf(scaledFcf, wacc);
    results.push(npv);
  }

  results.sort((a, b) => a - b);
  const mean = results.reduce((s, v) => s + v, 0) / results.length;
  const median = results[Math.floor(results.length / 2)];
  const p5 = results[Math.floor(results.length * 0.05)];
  const p95 = results[Math.floor(results.length * 0.95)];
  const positiveCount = results.filter((v) => v > 0).length;
  const probPositive = positiveCount / results.length;

  return {
    runs,
    wacc,
    mean,
    median,
    p5,
    p95,
    probPositive,
    distribution: results,
  };
}

// ----- 16. SUMMARY: One-Shot Financial Result -----

/**
 * Compute SEMUA angka finansial dalam satu pemanggilan.
 * Hasil siap dipakai untuk render Tab 3 + reportAssembler.
 */
export function computeFinancials(forms, provinceCode, sectorBeta = 1.0) {
  // Tahap 11: Edge case guard — return safe defaults kalau data minimum belum ada
  const hasMinData = forms?.identitas?.namaBisnis &&
    (forms?.keuangan?.products?.length || 0) > 0;

  if (!hasMinData) {
    const emptyProj = [1, 2, 3].map((year) => ({
      year, revenue: 0, hpp: 0, grossProfit: 0,
      operatingExpenses: { personnel: 0, opex: 0, depreciation: 0, total: 0 },
      ebit: 0, tax: { amount: 0, rate: 0, mode: "n/a" }, netIncome: 0,
      netMargin: 0, grossMargin: 0,
    }));
    return {
      initialInvestment: 0, projection: emptyProj, fcf: [0, 0, 0, 0],
      wacc: 0.115, npv: 0, npvVerdict: "tidak", irr: null, irrPct: null,
      irrKategori: null, paybackMonths: null,
      bep: { bepMonthlySales: 0, bepDailySales: 0 },
      debtSchedule: computeDebtSchedule(forms),
    };
  }

  const projection = computeProjection(forms, provinceCode);
  const { fcf, initialInvestment } = computeFCF(forms, provinceCode);
  const debtSchedule = computeDebtSchedule(forms); // v13.2: satu sumber bunga/cicilan
  const wacc = computeWACC(forms, sectorBeta);
  const npv = npvOf(fcf, wacc);
  const irr = irrOf(fcf);
  const payback = paybackOf(fcf);
  const bep = computeBEP(forms, provinceCode);

  // Verdict NPV
  const npvVerdict = npv > 0 ? "layak" : "tidak";

  // Verdict IRR (vs benchmark suku bunga)
  let irrKategori = null;
  if (irr != null) {
    if (irr > wacc + 0.10) irrKategori = "tinggi";
    else if (irr > wacc) irrKategori = "cukup";
    else if (irr > wacc - 0.03) irrKategori = "setara";
    else irrKategori = "rendah";
  }

  return {
    initialInvestment,
    projection,
    fcf,
    debtSchedule,
    wacc,
    npv,
    npvVerdict,
    irr,
    irrPct: irr != null ? Math.round(irr * 1000) / 10 : null, // 1 desimal
    irrKategori,
    payback,
    paybackMonths: payback != null ? Math.round(payback * 12) : null,
    bep,
  };
}
