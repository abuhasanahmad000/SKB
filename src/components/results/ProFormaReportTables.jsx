import { formatRp } from "../../utils/format.js";

// ============================================================================
// ProFormaReportTables — Tabel pro forma lengkap ala LivePlan
//
// 4 tabel:
//   1. ProFormaPLTable      — P&L 3 tahun (Sales, COGS, Gross Margin, Expenses detail, EBIT, EBITDA, Tax, Net)
//   2. ProFormaCashFlow     — Cash Received, Expenditures, Net Cash Flow, Cash Balance
//   3. ProFormaBalanceSheet — Assets, Liabilities & Capital
//   4. GeneralAssumptions   — Interest Rate, Tax Rate
//
// Format mengikuti LivePlan: header gelap + total row bold + indent untuk sub-items
// ============================================================================

const TH = { padding: "10px 12px", fontSize: 10, fontFamily: "monospace", color: "#475569", letterSpacing: "0.1em", fontWeight: 700, textAlign: "left", background: "#F1F5F9", borderBottom: "2px solid #CBD5E1" };
const TH_R = { ...TH, textAlign: "right" };
const TD = { padding: "7px 12px", fontSize: 11.5, color: "#1e293b", borderBottom: "1px solid #E2E8F0" };
const TD_R = { ...TD, textAlign: "right", fontFamily: "monospace" };
const TD_INDENT = { ...TD, paddingLeft: 28 };
const TD_INDENT_R = { ...TD_R, paddingLeft: 28 };
const TD_LABEL = { ...TD, fontWeight: 600 };
const TABLE = { width: "100%", borderCollapse: "collapse", fontSize: 11.5 };
const SECTION_BG = "#F1F5F9";

// ============================================================================
// 1. PRO FORMA PROFIT & LOSS — Pro Forma P&L 3 Tahun
// ============================================================================
export function ProFormaPLTable({ fin, forms }) {
  if (!fin?.projection?.length) return null;
  const proj = fin.projection;

  // v13.2 SINKRONISASI: SEMUA angka diambil langsung dari financialEngine —
  // tabel ini dulu menghitung opex/bunga/laba sendiri sehingga laba bersih di
  // tabel BERBEDA dari narasi Bab 6/8 (kontradiksi fatal di mata analis).
  const opexByYear = proj.map((y) => ({
    personnel: Math.round(y.operatingExpenses.personnel),
    marketing: y.operatingExpenses.breakdown?.marketing || 0,
    utilities: y.operatingExpenses.breakdown?.utilities || 0,
    rent: y.operatingExpenses.breakdown?.rent || 0,
    other: y.operatingExpenses.breakdown?.other || 0,
    depreciation: Math.round(y.operatingExpenses.depreciation),
  }));
  const totalOpex = proj.map((y) => Math.round(y.operatingExpenses.total));
  const ebit = proj.map((y) => Math.round(y.ebit));
  const ebitda = proj.map((y) => Math.round(y.ebit + y.operatingExpenses.depreciation));
  const interestByYear = proj.map((y) => Math.round(y.interest || 0));
  const taxes = proj.map((y) => Math.round(y.tax?.amount || 0));
  const netProfit = proj.map((y) => Math.round(y.netIncome));
  const netMargin = proj.map((y) => (y.revenue > 0 ? (y.netIncome / y.revenue) * 100 : 0));
  const grossMarginPct = proj.map((y) => (y.revenue > 0 ? (y.grossProfit / y.revenue) * 100 : 0));

  const row = (label, values, opts = {}) => (
    <tr style={opts.bg ? { background: opts.bg } : null}>
      <td style={opts.indent ? TD_INDENT : (opts.bold ? { ...TD_LABEL, fontWeight: 800 } : TD_LABEL)}>{label}</td>
      {values.map((v, i) => (
        <td key={i} style={opts.indent ? TD_INDENT_R : { ...TD_R, fontWeight: opts.bold ? 800 : 400, color: opts.muted ? "#64748B" : "#1e293b" }}>
          {opts.pct ? `${v.toFixed(2)}%` : formatRp(v)}
        </td>
      ))}
    </tr>
  );

  return (
    <div style={{ marginTop: 18, border: "1px solid #E2E8F0", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", background: "#0F172A", color: "#fff", fontFamily: "monospace", fontSize: 10, letterSpacing: "0.1em", fontWeight: 700 }}>
        ◆ PRO FORMA PROFIT & LOSS (3 TAHUN)
      </div>
      <table style={TABLE}>
        <thead>
          <tr>
            <th style={TH}>KOMPONEN</th>
            {proj.map((y) => <th key={y.year} style={TH_R}>TAHUN {y.year}</th>)}
          </tr>
        </thead>
        <tbody>
          {row("Penjualan (Revenue)", proj.map((y) => y.revenue), { bold: true })}
          {row("(-) Harga Pokok Penjualan (HPP)", proj.map((y) => y.hpp), { indent: true, muted: true })}
          {row("Laba Kotor (Gross Margin)", proj.map((y) => y.grossProfit), { bold: true, bg: SECTION_BG })}
          {row("Gross Margin %", grossMarginPct, { pct: true, indent: true, muted: true })}

          <tr><td colSpan={proj.length + 1} style={{ padding: "10px 12px", background: "#E2E8F0", fontFamily: "monospace", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em" }}>BIAYA OPERASIONAL</td></tr>
          {row("Gaji & Tunjangan (Payroll)", opexByYear.map((o) => o.personnel), { indent: true })}
          {row("Pemasaran & Promosi", opexByYear.map((o) => o.marketing), { indent: true })}
          {row("Utilitas (Listrik, Air, Internet)", opexByYear.map((o) => o.utilities), { indent: true })}
          {row("Sewa Tempat", opexByYear.map((o) => o.rent), { indent: true })}
          {row("Depresiasi (Aset & Renovasi)", opexByYear.map((o) => o.depreciation), { indent: true, muted: true })}
          {row("Lain-lain", opexByYear.map((o) => o.other), { indent: true })}
          {row("Total Biaya Operasional", totalOpex, { bold: true, bg: SECTION_BG })}

          {row("EBIT (Laba Sebelum Bunga & Pajak)", ebit, { bold: true })}
          {row("EBITDA (EBIT + Depresiasi)", ebitda, { bold: true, muted: true })}
          {row("(-) Beban Bunga", interestByYear, { indent: true, muted: true })}
          {row("(-) Pajak (PPh Final 0,5%)", taxes, { indent: true, muted: true })}

          <tr style={{ background: "#0F172A", color: "#fff" }}>
            <td style={{ padding: "10px 12px", fontWeight: 800, color: "#fff" }}>LABA BERSIH (NET PROFIT)</td>
            {netProfit.map((v, i) => (
              <td key={i} style={{ padding: "10px 12px", textAlign: "right", fontFamily: "monospace", fontWeight: 800, color: "#fff" }}>{formatRp(v)}</td>
            ))}
          </tr>
          <tr style={{ background: "#FEF3C7" }}>
            <td style={{ padding: "8px 12px", fontWeight: 700, color: "#92400E" }}>Net Profit Margin (%)</td>
            {netMargin.map((v, i) => (
              <td key={i} style={{ padding: "8px 12px", textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: "#92400E" }}>{v.toFixed(2)}%</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function buildProFormaPLHtml(fin, forms) {
  if (!fin?.projection?.length) return "";
  const proj = fin.projection;

  // v13.2 SINKRONISASI: angka identik dengan financialEngine & narasi (lihat
  // catatan pada ProFormaPLTable di atas).
  const opexByYear = proj.map((y) => ({
    personnel: Math.round(y.operatingExpenses.personnel),
    marketing: y.operatingExpenses.breakdown?.marketing || 0,
    utilities: y.operatingExpenses.breakdown?.utilities || 0,
    rent: y.operatingExpenses.breakdown?.rent || 0,
    other: y.operatingExpenses.breakdown?.other || 0,
    depreciation: Math.round(y.operatingExpenses.depreciation),
  }));
  const totalOpex = proj.map((y) => Math.round(y.operatingExpenses.total));
  const ebit = proj.map((y) => Math.round(y.ebit));
  const ebitda = proj.map((y) => Math.round(y.ebit + y.operatingExpenses.depreciation));
  const interestByYear = proj.map((y) => Math.round(y.interest || 0));
  const taxes = proj.map((y) => Math.round(y.tax?.amount || 0));
  const netProfit = proj.map((y) => Math.round(y.netIncome));
  const netMargin = proj.map((y) => (y.revenue > 0 ? (y.netIncome / y.revenue) * 100 : 0));
  const grossMarginPct = proj.map((y) => (y.revenue > 0 ? (y.grossProfit / y.revenue) * 100 : 0));

  const rowHtml = (label, values, opts = {}) => {
    const tdStyle = opts.indent ? `padding:7px 12px 7px 28px; font-size:11.5px; border-bottom:1px solid #E2E8F0; ${opts.muted ? "color:#64748B;" : ""}` : `padding:7px 12px; font-size:11.5px; color:#1e293b; border-bottom:1px solid #E2E8F0; ${opts.bold ? "font-weight:800;" : "font-weight:600;"}`;
    const tdRStyle = (opts.indent ? `padding:7px 12px 7px 28px;` : `padding:7px 12px;`) + ` font-size:11.5px; text-align:right; font-family:monospace; border-bottom:1px solid #E2E8F0; ${opts.bold ? "font-weight:800;" : ""} ${opts.muted ? "color:#64748B;" : "color:#1e293b;"}`;
    const trStyle = opts.bg ? `background:${opts.bg};` : "";
    return `<tr style="${trStyle}">
      <td style="${tdStyle}">${label}</td>
      ${values.map((v) => `<td style="${tdRStyle}">${opts.pct ? v.toFixed(2) + "%" : formatRp(v)}</td>`).join("")}
    </tr>`;
  };

  const headerCells = proj.map((y) => `<th style="padding:10px 12px; text-align:right; font-size:10px; font-family:monospace; color:#475569; letter-spacing:0.1em; font-weight:700; background:#F1F5F9; border-bottom:2px solid #CBD5E1;">TAHUN ${y.year}</th>`).join("");

  return `<div style="margin-top:18px; border:1px solid #E2E8F0; border-radius:8px; overflow:hidden;">
    <div style="padding:10px 14px; background:#0F172A; color:#fff; font-family:monospace; font-size:10px; letter-spacing:0.1em; font-weight:700;">◆ PRO FORMA PROFIT & LOSS (3 TAHUN)</div>
    <table style="width:100%; border-collapse:collapse; font-size:11.5px;">
      <thead><tr>
        <th style="padding:10px 12px; text-align:left; font-size:10px; font-family:monospace; color:#475569; letter-spacing:0.1em; font-weight:700; background:#F1F5F9; border-bottom:2px solid #CBD5E1;">KOMPONEN</th>
        ${headerCells}
      </tr></thead>
      <tbody>
        ${rowHtml("Penjualan (Revenue)", proj.map((y) => y.revenue), { bold: true })}
        ${rowHtml("(-) Harga Pokok Penjualan (HPP)", proj.map((y) => y.hpp), { indent: true, muted: true })}
        ${rowHtml("Laba Kotor (Gross Margin)", proj.map((y) => y.grossProfit), { bold: true, bg: SECTION_BG })}
        ${rowHtml("Gross Margin %", grossMarginPct, { pct: true, indent: true, muted: true })}
        <tr><td colspan="${proj.length + 1}" style="padding:10px 12px; background:#E2E8F0; font-family:monospace; font-size:10px; font-weight:800; letter-spacing:0.1em;">BIAYA OPERASIONAL</td></tr>
        ${rowHtml("Gaji & Tunjangan (Payroll)", opexByYear.map((o) => o.personnel), { indent: true })}
        ${rowHtml("Pemasaran & Promosi", opexByYear.map((o) => o.marketing), { indent: true })}
        ${rowHtml("Utilitas (Listrik, Air, Internet)", opexByYear.map((o) => o.utilities), { indent: true })}
        ${rowHtml("Sewa Tempat", opexByYear.map((o) => o.rent), { indent: true })}
        ${rowHtml("Depresiasi (Aset & Renovasi)", opexByYear.map((o) => o.depreciation), { indent: true, muted: true })}
        ${rowHtml("Lain-lain", opexByYear.map((o) => o.other), { indent: true })}
        ${rowHtml("Total Biaya Operasional", totalOpex, { bold: true, bg: SECTION_BG })}
        ${rowHtml("EBIT (Laba Sebelum Bunga & Pajak)", ebit, { bold: true })}
        ${rowHtml("EBITDA (EBIT + Depresiasi)", ebitda, { bold: true, muted: true })}
        ${rowHtml("(-) Beban Bunga", interestByYear, { indent: true, muted: true })}
        ${rowHtml("(-) Pajak (PPh Final 0,5%)", taxes, { indent: true, muted: true })}
        <tr style="background:#0F172A; color:#fff;">
          <td style="padding:10px 12px; font-weight:800; color:#fff;">LABA BERSIH (NET PROFIT)</td>
          ${netProfit.map((v) => `<td style="padding:10px 12px; text-align:right; font-family:monospace; font-weight:800; color:#fff;">${formatRp(v)}</td>`).join("")}
        </tr>
        <tr style="background:#FEF3C7;">
          <td style="padding:8px 12px; font-weight:700; color:#92400E;">Net Profit Margin (%)</td>
          ${netMargin.map((v) => `<td style="padding:8px 12px; text-align:right; font-family:monospace; font-weight:700; color:#92400E;">${v.toFixed(2)}%</td>`).join("")}
        </tr>
      </tbody>
    </table>
  </div>`;
}

// ============================================================================
// 2. PRO FORMA CASH FLOW
// ============================================================================
export function ProFormaCashFlowTable({ fin, forms }) {
  if (!fin?.projection?.length) return null;
  const proj = fin.projection;
  const m = forms?.modal || {};

  // v13.2: cicilan pokok dari jadwal anuitas riil; kas operasional =
  // laba bersih + seluruh depresiasi (non-kas) — konsisten dengan engine.
  const principalRepay = proj.map((y, i) => fin.debtSchedule?.principalByYear?.[i] || 0);
  const cashFromOps = proj.map((y) => Math.round(y.netIncome + y.operatingExpenses.depreciation));
  const totalCashSpent = proj.map((y, i) => cashFromOps[i] - principalRepay[i]);

  // Saldo kas awal = seluruh sumber dana − seluruh pengeluaran investasi non-kas-di-tangan;
  // modal kerja & deposit (expenses.lainnya) TETAP berupa kas sehingga tidak dikurangkan.
  let cumCash = (m.funding?.modalPribadi || 0) + (m.funding?.modalMitra || 0) + (m.funding?.modalPinjaman || 0)
    - (m.expenses?.legal || 0) - (m.expenses?.renovasi || 0) - (m.expenses?.promo || 0) - (m.assets?.stok || 0)
    - (forms?.alatSDM?.equipment || []).reduce((s2, e) => s2 + (e.qty || 0) * (e.pricePerUnit || 0), 0);
  const cashBalance = totalCashSpent.map((flow) => {
    cumCash += flow;
    return Math.round(cumCash);
  });

  const row = (label, values, opts = {}) => (
    <tr style={opts.bg ? { background: opts.bg } : null}>
      <td style={opts.indent ? TD_INDENT : (opts.bold ? { ...TD_LABEL, fontWeight: 800 } : TD_LABEL)}>{label}</td>
      {values.map((v, i) => (
        <td key={i} style={opts.indent ? TD_INDENT_R : { ...TD_R, fontWeight: opts.bold ? 800 : 400 }}>{formatRp(v)}</td>
      ))}
    </tr>
  );

  return (
    <div style={{ marginTop: 18, border: "1px solid #E2E8F0", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", background: "#0F172A", color: "#fff", fontFamily: "monospace", fontSize: 10, letterSpacing: "0.1em", fontWeight: 700 }}>
        ◆ PRO FORMA CASH FLOW (3 TAHUN)
      </div>
      <table style={TABLE}>
        <thead>
          <tr>
            <th style={TH}>KOMPONEN</th>
            {proj.map((y) => <th key={y.year} style={TH_R}>TAHUN {y.year}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr><td colSpan={proj.length + 1} style={{ padding: "10px 12px", background: "#E2E8F0", fontFamily: "monospace", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em" }}>KAS MASUK (CASH INFLOW)</td></tr>
          {row("Kas dari Operasional", cashFromOps, { indent: true })}
          {row("Subtotal Kas Masuk", cashFromOps, { bold: true, bg: SECTION_BG })}

          <tr><td colSpan={proj.length + 1} style={{ padding: "10px 12px", background: "#E2E8F0", fontFamily: "monospace", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em" }}>KAS KELUAR (CASH OUTFLOW)</td></tr>
          {row("Cicilan Pokok Pinjaman", principalRepay, { indent: true, muted: true })}
          {row("Subtotal Kas Keluar", principalRepay, { bold: true, bg: SECTION_BG })}

          {row("Net Cash Flow", totalCashSpent, { bold: true })}
          <tr style={{ background: "#0F172A", color: "#fff" }}>
            <td style={{ padding: "10px 12px", fontWeight: 800, color: "#fff" }}>SALDO KAS AKHIR TAHUN</td>
            {cashBalance.map((v, i) => (
              <td key={i} style={{ padding: "10px 12px", textAlign: "right", fontFamily: "monospace", fontWeight: 800, color: "#fff" }}>{formatRp(v)}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function buildProFormaCashFlowHtml(fin, forms) {
  if (!fin?.projection?.length) return "";
  const proj = fin.projection;
  const m = forms?.modal || {};
  // v13.2: cicilan pokok dari jadwal anuitas riil; kas operasional =
  // laba bersih + seluruh depresiasi (non-kas) — konsisten dengan engine.
  const principalRepay = proj.map((y, i) => fin.debtSchedule?.principalByYear?.[i] || 0);
  const cashFromOps = proj.map((y) => Math.round(y.netIncome + y.operatingExpenses.depreciation));
  const totalCashSpent = proj.map((y, i) => cashFromOps[i] - principalRepay[i]);

  // Saldo kas awal = seluruh sumber dana − seluruh pengeluaran investasi non-kas-di-tangan;
  // modal kerja & deposit (expenses.lainnya) TETAP berupa kas sehingga tidak dikurangkan.
  let cumCash = (m.funding?.modalPribadi || 0) + (m.funding?.modalMitra || 0) + (m.funding?.modalPinjaman || 0)
    - (m.expenses?.legal || 0) - (m.expenses?.renovasi || 0) - (m.expenses?.promo || 0) - (m.assets?.stok || 0)
    - (forms?.alatSDM?.equipment || []).reduce((s2, e) => s2 + (e.qty || 0) * (e.pricePerUnit || 0), 0);
  const cashBalance = totalCashSpent.map((flow) => { cumCash += flow; return Math.round(cumCash); });

  const rowHtml = (label, values, opts = {}) => {
    const tdStyle = opts.indent ? `padding:7px 12px 7px 28px; font-size:11.5px; ${opts.muted ? "color:#64748B;" : ""} border-bottom:1px solid #E2E8F0;` : `padding:7px 12px; font-size:11.5px; ${opts.bold ? "font-weight:800;" : "font-weight:600;"} border-bottom:1px solid #E2E8F0;`;
    const tdRStyle = (opts.indent ? `padding:7px 12px 7px 28px;` : `padding:7px 12px;`) + ` font-size:11.5px; text-align:right; font-family:monospace; border-bottom:1px solid #E2E8F0; ${opts.bold ? "font-weight:800;" : ""}`;
    const trStyle = opts.bg ? `background:${opts.bg};` : "";
    return `<tr style="${trStyle}"><td style="${tdStyle}">${label}</td>${values.map((v) => `<td style="${tdRStyle}">${formatRp(v)}</td>`).join("")}</tr>`;
  };

  const headerCells = proj.map((y) => `<th style="padding:10px 12px; text-align:right; font-size:10px; font-family:monospace; color:#475569; letter-spacing:0.1em; font-weight:700; background:#F1F5F9;">TAHUN ${y.year}</th>`).join("");

  return `<div style="margin-top:18px; border:1px solid #E2E8F0; border-radius:8px; overflow:hidden;">
    <div style="padding:10px 14px; background:#0F172A; color:#fff; font-family:monospace; font-size:10px; letter-spacing:0.1em; font-weight:700;">◆ PRO FORMA CASH FLOW (3 TAHUN)</div>
    <table style="width:100%; border-collapse:collapse; font-size:11.5px;">
      <thead><tr><th style="padding:10px 12px; text-align:left; font-size:10px; font-family:monospace; color:#475569; letter-spacing:0.1em; font-weight:700; background:#F1F5F9;">KOMPONEN</th>${headerCells}</tr></thead>
      <tbody>
        <tr><td colspan="${proj.length + 1}" style="padding:10px 12px; background:#E2E8F0; font-family:monospace; font-size:10px; font-weight:800; letter-spacing:0.1em;">KAS MASUK</td></tr>
        ${rowHtml("Kas dari Operasional", cashFromOps, { indent: true })}
        ${rowHtml("Subtotal Kas Masuk", cashFromOps, { bold: true, bg: SECTION_BG })}
        <tr><td colspan="${proj.length + 1}" style="padding:10px 12px; background:#E2E8F0; font-family:monospace; font-size:10px; font-weight:800; letter-spacing:0.1em;">KAS KELUAR</td></tr>
        ${rowHtml("Cicilan Pokok Pinjaman", principalRepay, { indent: true, muted: true })}
        ${rowHtml("Subtotal Kas Keluar", principalRepay, { bold: true, bg: SECTION_BG })}
        ${rowHtml("Net Cash Flow", totalCashSpent, { bold: true })}
        <tr style="background:#0F172A; color:#fff;">
          <td style="padding:10px 12px; font-weight:800; color:#fff;">SALDO KAS AKHIR TAHUN</td>
          ${cashBalance.map((v) => `<td style="padding:10px 12px; text-align:right; font-family:monospace; font-weight:800; color:#fff;">${formatRp(v)}</td>`).join("")}
        </tr>
      </tbody>
    </table>
  </div>`;
}

// ============================================================================
// 3. PRO FORMA BALANCE SHEET
// ============================================================================
export function ProFormaBalanceSheetTable({ fin, forms }) {
  if (!fin?.projection?.length) return null;
  const proj = fin.projection;
  const m = forms?.modal || {};
  const totalFunding = (m.funding?.modalPribadi || 0) + (m.funding?.modalMitra || 0) + (m.funding?.modalPinjaman || 0);

  const cash = proj.map((y, i) => {
    const cumNet = proj.slice(0, i + 1).reduce((s, p) => s + p.netIncome, 0);
    return Math.round(totalFunding * 0.2 + cumNet * 0.7);
  });
  const inventory = proj.map((y) => Math.round((m.assets?.stok || 5_000_000) * Math.pow(1.1, y.year - 1)));
  const longTermAssets = proj.map((y) => Math.round((m.expenses?.renovasi || 0) * (1 - 0.2 * y.year)));
  const totalAssets = proj.map((y, i) => cash[i] + inventory[i] + longTermAssets[i]);

  const longTermLiab = proj.map((y, i) => Math.max(0, Math.round((m.funding?.modalPinjaman || 0) * (1 - 0.15 * y.year))));
  const accountsPayable = proj.map((y) => Math.round(y.hpp / 12));
  const totalLiab = proj.map((y, i) => longTermLiab[i] + accountsPayable[i]);

  const paidInCapital = (m.funding?.modalPribadi || 0) + (m.funding?.modalMitra || 0);
  const retainedEarnings = proj.map((y, i) => proj.slice(0, i + 1).reduce((s, p) => s + p.netIncome, 0));
  const totalCapital = retainedEarnings.map((r) => r + paidInCapital);

  const row = (label, values, opts = {}) => (
    <tr style={opts.bg ? { background: opts.bg } : null}>
      <td style={opts.indent ? TD_INDENT : (opts.bold ? { ...TD_LABEL, fontWeight: 800 } : TD_LABEL)}>{label}</td>
      {values.map((v, i) => (
        <td key={i} style={opts.indent ? TD_INDENT_R : { ...TD_R, fontWeight: opts.bold ? 800 : 400 }}>{formatRp(v)}</td>
      ))}
    </tr>
  );

  return (
    <div style={{ marginTop: 18, border: "1px solid #E2E8F0", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", background: "#0F172A", color: "#fff", fontFamily: "monospace", fontSize: 10, letterSpacing: "0.1em", fontWeight: 700 }}>
        ◆ PRO FORMA NERACA (BALANCE SHEET 3 TAHUN)
      </div>
      <table style={TABLE}>
        <thead>
          <tr>
            <th style={TH}>KOMPONEN</th>
            {proj.map((y) => <th key={y.year} style={TH_R}>TAHUN {y.year}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr><td colSpan={proj.length + 1} style={{ padding: "10px 12px", background: "#E2E8F0", fontFamily: "monospace", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em" }}>ASET (ASSETS)</td></tr>
          {row("Kas & Setara Kas", cash, { indent: true })}
          {row("Persediaan (Inventory)", inventory, { indent: true })}
          {row("Aset Tetap (net)", longTermAssets, { indent: true })}
          {row("Total Aset", totalAssets, { bold: true, bg: SECTION_BG })}

          <tr><td colSpan={proj.length + 1} style={{ padding: "10px 12px", background: "#E2E8F0", fontFamily: "monospace", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em" }}>KEWAJIBAN (LIABILITIES)</td></tr>
          {row("Hutang Jangka Panjang", longTermLiab, { indent: true })}
          {row("Hutang Usaha (Accounts Payable)", accountsPayable, { indent: true })}
          {row("Total Kewajiban", totalLiab, { bold: true, bg: SECTION_BG })}

          <tr><td colSpan={proj.length + 1} style={{ padding: "10px 12px", background: "#E2E8F0", fontFamily: "monospace", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em" }}>MODAL (CAPITAL / EQUITY)</td></tr>
          {row("Modal Disetor", proj.map(() => paidInCapital), { indent: true })}
          {row("Saldo Laba Ditahan (Retained Earnings)", retainedEarnings, { indent: true })}
          {row("Total Modal (Net Worth)", totalCapital, { bold: true, bg: SECTION_BG })}

          <tr style={{ background: "#0F172A", color: "#fff" }}>
            <td style={{ padding: "10px 12px", fontWeight: 800, color: "#fff" }}>TOTAL KEWAJIBAN + MODAL</td>
            {totalLiab.map((v, i) => (
              <td key={i} style={{ padding: "10px 12px", textAlign: "right", fontFamily: "monospace", fontWeight: 800, color: "#fff" }}>{formatRp(v + totalCapital[i])}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function buildProFormaBalanceSheetHtml(fin, forms) {
  if (!fin?.projection?.length) return "";
  const proj = fin.projection;
  const m = forms?.modal || {};
  const totalFunding = (m.funding?.modalPribadi || 0) + (m.funding?.modalMitra || 0) + (m.funding?.modalPinjaman || 0);
  const cash = proj.map((y, i) => {
    const cumNet = proj.slice(0, i + 1).reduce((s, p) => s + p.netIncome, 0);
    return Math.round(totalFunding * 0.2 + cumNet * 0.7);
  });
  const inventory = proj.map((y) => Math.round((m.assets?.stok || 5_000_000) * Math.pow(1.1, y.year - 1)));
  const longTermAssets = proj.map((y) => Math.round((m.expenses?.renovasi || 0) * (1 - 0.2 * y.year)));
  const totalAssets = proj.map((y, i) => cash[i] + inventory[i] + longTermAssets[i]);
  const longTermLiab = proj.map((y, i) => Math.max(0, Math.round((m.funding?.modalPinjaman || 0) * (1 - 0.15 * y.year))));
  const accountsPayable = proj.map((y) => Math.round(y.hpp / 12));
  const totalLiab = proj.map((y, i) => longTermLiab[i] + accountsPayable[i]);
  const paidInCapital = (m.funding?.modalPribadi || 0) + (m.funding?.modalMitra || 0);
  const retainedEarnings = proj.map((y, i) => proj.slice(0, i + 1).reduce((s, p) => s + p.netIncome, 0));
  const totalCapital = retainedEarnings.map((r) => r + paidInCapital);

  const rowHtml = (label, values, opts = {}) => {
    const tdStyle = opts.indent ? `padding:7px 12px 7px 28px; font-size:11.5px; border-bottom:1px solid #E2E8F0;` : `padding:7px 12px; font-size:11.5px; ${opts.bold ? "font-weight:800;" : "font-weight:600;"} border-bottom:1px solid #E2E8F0;`;
    const tdRStyle = (opts.indent ? `padding:7px 12px 7px 28px;` : `padding:7px 12px;`) + ` font-size:11.5px; text-align:right; font-family:monospace; border-bottom:1px solid #E2E8F0; ${opts.bold ? "font-weight:800;" : ""}`;
    const trStyle = opts.bg ? `background:${opts.bg};` : "";
    return `<tr style="${trStyle}"><td style="${tdStyle}">${label}</td>${values.map((v) => `<td style="${tdRStyle}">${formatRp(v)}</td>`).join("")}</tr>`;
  };

  const headerCells = proj.map((y) => `<th style="padding:10px 12px; text-align:right; font-size:10px; font-family:monospace; color:#475569; letter-spacing:0.1em; font-weight:700; background:#F1F5F9;">TAHUN ${y.year}</th>`).join("");

  return `<div style="margin-top:18px; border:1px solid #E2E8F0; border-radius:8px; overflow:hidden;">
    <div style="padding:10px 14px; background:#0F172A; color:#fff; font-family:monospace; font-size:10px; letter-spacing:0.1em; font-weight:700;">◆ PRO FORMA NERACA (BALANCE SHEET 3 TAHUN)</div>
    <table style="width:100%; border-collapse:collapse; font-size:11.5px;">
      <thead><tr><th style="padding:10px 12px; text-align:left; font-size:10px; font-family:monospace; color:#475569; letter-spacing:0.1em; font-weight:700; background:#F1F5F9;">KOMPONEN</th>${headerCells}</tr></thead>
      <tbody>
        <tr><td colspan="${proj.length + 1}" style="padding:10px 12px; background:#E2E8F0; font-family:monospace; font-size:10px; font-weight:800; letter-spacing:0.1em;">ASET</td></tr>
        ${rowHtml("Kas & Setara Kas", cash, { indent: true })}
        ${rowHtml("Persediaan", inventory, { indent: true })}
        ${rowHtml("Aset Tetap (net)", longTermAssets, { indent: true })}
        ${rowHtml("Total Aset", totalAssets, { bold: true, bg: SECTION_BG })}
        <tr><td colspan="${proj.length + 1}" style="padding:10px 12px; background:#E2E8F0; font-family:monospace; font-size:10px; font-weight:800; letter-spacing:0.1em;">KEWAJIBAN</td></tr>
        ${rowHtml("Hutang Jangka Panjang", longTermLiab, { indent: true })}
        ${rowHtml("Hutang Usaha", accountsPayable, { indent: true })}
        ${rowHtml("Total Kewajiban", totalLiab, { bold: true, bg: SECTION_BG })}
        <tr><td colspan="${proj.length + 1}" style="padding:10px 12px; background:#E2E8F0; font-family:monospace; font-size:10px; font-weight:800; letter-spacing:0.1em;">MODAL</td></tr>
        ${rowHtml("Modal Disetor", proj.map(() => paidInCapital), { indent: true })}
        ${rowHtml("Saldo Laba Ditahan", retainedEarnings, { indent: true })}
        ${rowHtml("Total Modal", totalCapital, { bold: true, bg: SECTION_BG })}
        <tr style="background:#0F172A; color:#fff;">
          <td style="padding:10px 12px; font-weight:800; color:#fff;">TOTAL KEWAJIBAN + MODAL</td>
          ${totalLiab.map((v, i) => `<td style="padding:10px 12px; text-align:right; font-family:monospace; font-weight:800; color:#fff;">${formatRp(v + totalCapital[i])}</td>`).join("")}
        </tr>
      </tbody>
    </table>
  </div>`;
}

// ============================================================================
// 4. GENERAL ASSUMPTIONS
// ============================================================================
export function GeneralAssumptionsTable({ fin, forms }) {
  if (!fin?.projection?.length) return null;
  const proj = fin.projection;
  const ft = forms?.fundingTarget || {};

  return (
    <div style={{ marginTop: 18, border: "1px solid #E2E8F0", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", background: "#475569", color: "#fff", fontFamily: "monospace", fontSize: 10, letterSpacing: "0.1em", fontWeight: 700 }}>
        ◆ ASUMSI UMUM (GENERAL ASSUMPTIONS)
      </div>
      <table style={TABLE}>
        <thead>
          <tr>
            <th style={TH}>ASUMSI</th>
            {proj.map((y) => <th key={y.year} style={TH_R}>TAHUN {y.year}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={TD_LABEL}>Suku Bunga Pinjaman</td>
            {proj.map((y) => <td key={y.year} style={TD_R}>11.50%</td>)}
          </tr>
          <tr>
            <td style={TD_LABEL}>Tarif Pajak (PPh Final UMKM)</td>
            {proj.map((y) => <td key={y.year} style={TD_R}>0.50%</td>)}
          </tr>
          <tr>
            <td style={TD_LABEL}>Pertumbuhan Pendapatan</td>
            {proj.map((y, i) => {
              const growth = i === 0 ? "—" : `${(((proj[i].revenue / proj[i - 1].revenue) - 1) * 100).toFixed(2)}%`;
              return <td key={y.year} style={TD_R}>{growth}</td>;
            })}
          </tr>
          <tr>
            <td style={TD_LABEL}>Inflasi Biaya Personel</td>
            {proj.map((y) => <td key={y.year} style={TD_R}>8.00%</td>)}
          </tr>
          {ft.tenor && (
            <tr>
              <td style={TD_LABEL}>Tenor Pinjaman</td>
              {proj.map((y) => <td key={y.year} style={TD_R}>{ft.tenor} bulan</td>)}
            </tr>
          )}
          <tr>
            <td style={TD_LABEL}>Depresiasi Aset</td>
            {proj.map((y) => <td key={y.year} style={TD_R}>Straight-line 4-5 thn</td>)}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function buildGeneralAssumptionsHtml(fin, forms) {
  if (!fin?.projection?.length) return "";
  const proj = fin.projection;
  const ft = forms?.fundingTarget || {};

  const headerCells = proj.map((y) => `<th style="padding:10px 12px; text-align:right; font-size:10px; font-family:monospace; color:#475569; letter-spacing:0.1em; font-weight:700; background:#F1F5F9;">TAHUN ${y.year}</th>`).join("");

  return `<div style="margin-top:18px; border:1px solid #E2E8F0; border-radius:8px; overflow:hidden;">
    <div style="padding:10px 14px; background:#475569; color:#fff; font-family:monospace; font-size:10px; letter-spacing:0.1em; font-weight:700;">◆ ASUMSI UMUM (GENERAL ASSUMPTIONS)</div>
    <table style="width:100%; border-collapse:collapse; font-size:11.5px;">
      <thead><tr><th style="padding:10px 12px; text-align:left; font-size:10px; font-family:monospace; color:#475569; letter-spacing:0.1em; font-weight:700; background:#F1F5F9;">ASUMSI</th>${headerCells}</tr></thead>
      <tbody>
        <tr><td style="padding:7px 12px; font-weight:600; border-bottom:1px solid #E2E8F0;">Suku Bunga Pinjaman</td>${proj.map(() => `<td style="padding:7px 12px; text-align:right; font-family:monospace; border-bottom:1px solid #E2E8F0;">11.50%</td>`).join("")}</tr>
        <tr><td style="padding:7px 12px; font-weight:600; border-bottom:1px solid #E2E8F0;">Tarif Pajak (PPh Final UMKM)</td>${proj.map(() => `<td style="padding:7px 12px; text-align:right; font-family:monospace; border-bottom:1px solid #E2E8F0;">0.50%</td>`).join("")}</tr>
        <tr><td style="padding:7px 12px; font-weight:600; border-bottom:1px solid #E2E8F0;">Pertumbuhan Pendapatan</td>${proj.map((y, i) => {
          const growth = i === 0 ? "—" : `${(((proj[i].revenue / proj[i - 1].revenue) - 1) * 100).toFixed(2)}%`;
          return `<td style="padding:7px 12px; text-align:right; font-family:monospace; border-bottom:1px solid #E2E8F0;">${growth}</td>`;
        }).join("")}</tr>
        <tr><td style="padding:7px 12px; font-weight:600; border-bottom:1px solid #E2E8F0;">Inflasi Biaya Personel</td>${proj.map(() => `<td style="padding:7px 12px; text-align:right; font-family:monospace; border-bottom:1px solid #E2E8F0;">8.00%</td>`).join("")}</tr>
        ${ft.tenor ? `<tr><td style="padding:7px 12px; font-weight:600; border-bottom:1px solid #E2E8F0;">Tenor Pinjaman</td>${proj.map(() => `<td style="padding:7px 12px; text-align:right; font-family:monospace; border-bottom:1px solid #E2E8F0;">${ft.tenor} bulan</td>`).join("")}</tr>` : ""}
        <tr><td style="padding:7px 12px; font-weight:600; border-bottom:1px solid #E2E8F0;">Depresiasi Aset</td>${proj.map(() => `<td style="padding:7px 12px; text-align:right; font-family:monospace; border-bottom:1px solid #E2E8F0;">Straight-line 4-5 thn</td>`).join("")}</tr>
      </tbody>
    </table>
  </div>`;
}
