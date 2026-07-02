import { formatRp } from "../../utils/format.js";
import { SEASONALITY_FACTORS as SHARED_SEASONALITY } from "../../data/seasonality.js";

// ============================================================================
// AppendixMonthly — Monthly Breakdown ala LivePlan Appendix
//
// Tampilkan:
//   1. Sales Forecast per produk × 12 bulan (Tahun 1)
//   2. Direct Cost (HPP) per produk × 12 bulan
//   3. Personnel Plan per posisi × 12 bulan
//
// Distribusi seasonality realistic: ramp-up bulan 1-3 (warm-up), peak
// bulan 4-10, drop bulan 11-12 (low season).
// ============================================================================

// Seasonality factor untuk distribusi revenue tidak flat
const SEASONALITY_FACTORS = SHARED_SEASONALITY;

function computeMonthlySales(forms) {
  const products = forms?.keuangan?.products || [];
  if (products.length === 0) return null;

  // Annual revenue per produk
  const annualPerProduk = products.map((p) => {
    const dailyTarget = parseInt(p.dailyTarget, 10) || 0;
    const price = parseInt(p.price, 10) || 0;
    return dailyTarget * price * 30 * 12; // 30 hari × 12 bulan
  });
  const totalAnnual = annualPerProduk.reduce((s, v) => s + v, 0);

  // HPP rate dari forms (default 40% kalau tidak ada)
  const hppPerProduk = forms?.keuangan?.hppPerProduk || {};

  // Distribusi seasonality
  const monthly = SEASONALITY_FACTORS.map((factor, mIdx) => {
    const month = mIdx + 1;
    const perProduk = annualPerProduk.map((annual, pIdx) => {
      const sales = Math.round(annual * factor);
      const hppRate = (parseInt(hppPerProduk[pIdx], 10) || 40) / 100;
      const hpp = Math.round(sales * hppRate);
      return { name: products[pIdx].name || `Produk ${pIdx + 1}`, sales, hpp };
    });
    const totalSales = perProduk.reduce((s, p) => s + p.sales, 0);
    const totalHpp = perProduk.reduce((s, p) => s + p.hpp, 0);
    return { month, perProduk, totalSales, totalHpp };
  });

  return { monthly, products: products.map((p) => p.name || "Produk"), totalAnnual };
}

function computeMonthlyPersonnel(forms) {
  const positions = forms?.alatSDM?.personnel?.positions || {};
  const active = Object.entries(positions).filter(([, v]) => v?.active);
  if (active.length === 0) return null;

  const totalMonthly = active.reduce((sum, [, v]) => sum + (v.salary || 0) * (v.count || 0), 0);
  return { positions: active, totalMonthly };
}

export default function AppendixMonthly({ forms }) {
  const sales = computeMonthlySales(forms);
  const personnel = computeMonthlyPersonnel(forms);
  if (!sales && !personnel) return null;

  return (
    <div style={{ marginTop: 30, pageBreakBefore: "always" }}>
      <h2 style={titleStyle}>LAMPIRAN — Detail Bulanan Tahun 1</h2>

      {/* Sales Monthly */}
      {sales && (
        <div style={{ marginTop: 18 }}>
          <h3 style={subtitleStyle}>A. Proyeksi Penjualan per Produk × 12 Bulan</h3>
          <div style={{ overflow: "auto", marginTop: 10 }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>BULAN</th>
                  {sales.products.map((name, idx) => (
                    <th key={idx} style={thRStyle}>{name.toUpperCase()}</th>
                  ))}
                  <th style={{ ...thRStyle, background: "#0F172A", color: "#fff" }}>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {sales.monthly.map((m) => (
                  <tr key={m.month}>
                    <td style={tdStyle}>Bulan {m.month}</td>
                    {m.perProduk.map((p, idx) => (
                      <td key={idx} style={tdRStyle}>{formatRp(p.sales)}</td>
                    ))}
                    <td style={{ ...tdRStyle, fontWeight: 700, color: "#0F172A" }}>{formatRp(m.totalSales)}</td>
                  </tr>
                ))}
                <tr style={{ background: "#F1F5F9", fontWeight: 800 }}>
                  <td style={{ ...tdStyle, fontWeight: 800 }}>TOTAL TAHUN 1</td>
                  {sales.products.map((_, idx) => {
                    const sum = sales.monthly.reduce((s, m) => s + m.perProduk[idx].sales, 0);
                    return <td key={idx} style={{ ...tdRStyle, fontWeight: 800 }}>{formatRp(sum)}</td>;
                  })}
                  <td style={{ ...tdRStyle, fontWeight: 800, color: "#0F172A" }}>{formatRp(sales.totalAnnual)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* HPP Monthly */}
      {sales && (
        <div style={{ marginTop: 24 }}>
          <h3 style={subtitleStyle}>B. Harga Pokok Penjualan (HPP) per Produk × 12 Bulan</h3>
          <div style={{ overflow: "auto", marginTop: 10 }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>BULAN</th>
                  {sales.products.map((name, idx) => (
                    <th key={idx} style={thRStyle}>{name.toUpperCase()}</th>
                  ))}
                  <th style={{ ...thRStyle, background: "#0F172A", color: "#fff" }}>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {sales.monthly.map((m) => (
                  <tr key={m.month}>
                    <td style={tdStyle}>Bulan {m.month}</td>
                    {m.perProduk.map((p, idx) => (
                      <td key={idx} style={tdRStyle}>{formatRp(p.hpp)}</td>
                    ))}
                    <td style={{ ...tdRStyle, fontWeight: 700, color: "#0F172A" }}>{formatRp(m.totalHpp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Personnel Monthly */}
      {personnel && (
        <div style={{ marginTop: 24 }}>
          <h3 style={subtitleStyle}>C. Rencana SDM & Gaji per Bulan</h3>
          <div style={{ overflow: "auto", marginTop: 10 }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>POSISI</th>
                  <th style={thRStyle}>JUMLAH</th>
                  <th style={thRStyle}>GAJI/ORANG</th>
                  <th style={{ ...thRStyle, background: "#0F172A", color: "#fff" }}>TOTAL/BULAN</th>
                </tr>
              </thead>
              <tbody>
                {personnel.positions.map(([key, pos]) => (
                  <tr key={key}>
                    <td style={tdStyle}>{key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ")}</td>
                    <td style={tdRStyle}>{pos.count} orang</td>
                    <td style={tdRStyle}>{formatRp(pos.salary)}</td>
                    <td style={{ ...tdRStyle, fontWeight: 700 }}>{formatRp((pos.count || 0) * (pos.salary || 0))}</td>
                  </tr>
                ))}
                <tr style={{ background: "#F1F5F9", fontWeight: 800 }}>
                  <td style={{ ...tdStyle, fontWeight: 800 }} colSpan={3}>TOTAL PAYROLL BULANAN</td>
                  <td style={{ ...tdRStyle, fontWeight: 800, color: "#0F172A" }}>{formatRp(personnel.totalMonthly)}</td>
                </tr>
                <tr style={{ background: "#FEF3C7" }}>
                  <td style={{ ...tdStyle, fontWeight: 700 }} colSpan={3}>TOTAL PAYROLL TAHUNAN (×12)</td>
                  <td style={{ ...tdRStyle, fontWeight: 800, color: "#92400E" }}>{formatRp(personnel.totalMonthly * 12)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HTML Builder for Export
// ============================================================================
export function buildAppendixMonthlyHtml(forms) {
  const sales = computeMonthlySales(forms);
  const personnel = computeMonthlyPersonnel(forms);
  if (!sales && !personnel) return "";

  const TH = `padding:8px 10px; text-align:left; font-family:monospace; font-size:10px; letter-spacing:0.1em; font-weight:700; color:#475569; background:#F1F5F9; border-bottom:2px solid #CBD5E1;`;
  const TH_R = `${TH} text-align:right;`;
  const TD = `padding:7px 10px; font-size:11px; color:#1e293b; border-bottom:1px solid #E2E8F0;`;
  const TD_R = `${TD} text-align:right; font-family:monospace;`;

  let html = `<div style="margin-top:30px; page-break-before:always;">
    <h2 style="font-size:19px; font-weight:700; color:#0F172A; border-bottom:2px solid #0F172A; padding-bottom:8px; margin:0 0 18px;">LAMPIRAN — Detail Bulanan Tahun 1</h2>`;

  if (sales) {
    html += `<h3 style="font-size:13px; font-weight:700; color:#334155; margin:18px 0 10px;">A. Proyeksi Penjualan per Produk × 12 Bulan</h3>
    <table style="width:100%; border-collapse:collapse; font-size:11px; margin-bottom:18px;">
      <thead><tr>
        <th style="${TH}">BULAN</th>
        ${sales.products.map((n) => `<th style="${TH_R}">${n.toUpperCase()}</th>`).join("")}
        <th style="${TH_R} background:#0F172A; color:#fff;">TOTAL</th>
      </tr></thead>
      <tbody>
        ${sales.monthly.map((m) => `<tr>
          <td style="${TD}">Bulan ${m.month}</td>
          ${m.perProduk.map((p) => `<td style="${TD_R}">${formatRp(p.sales)}</td>`).join("")}
          <td style="${TD_R} font-weight:700; color:#0F172A;">${formatRp(m.totalSales)}</td>
        </tr>`).join("")}
        <tr style="background:#F1F5F9;">
          <td style="${TD} font-weight:800;">TOTAL TAHUN 1</td>
          ${sales.products.map((_, idx) => {
            const sum = sales.monthly.reduce((s, m) => s + m.perProduk[idx].sales, 0);
            return `<td style="${TD_R} font-weight:800;">${formatRp(sum)}</td>`;
          }).join("")}
          <td style="${TD_R} font-weight:800; color:#0F172A;">${formatRp(sales.totalAnnual)}</td>
        </tr>
      </tbody>
    </table>`;

    html += `<h3 style="font-size:13px; font-weight:700; color:#334155; margin:18px 0 10px;">B. Harga Pokok Penjualan (HPP) per Produk × 12 Bulan</h3>
    <table style="width:100%; border-collapse:collapse; font-size:11px; margin-bottom:18px;">
      <thead><tr>
        <th style="${TH}">BULAN</th>
        ${sales.products.map((n) => `<th style="${TH_R}">${n.toUpperCase()}</th>`).join("")}
        <th style="${TH_R} background:#0F172A; color:#fff;">TOTAL</th>
      </tr></thead>
      <tbody>${sales.monthly.map((m) => `<tr>
        <td style="${TD}">Bulan ${m.month}</td>
        ${m.perProduk.map((p) => `<td style="${TD_R}">${formatRp(p.hpp)}</td>`).join("")}
        <td style="${TD_R} font-weight:700;">${formatRp(m.totalHpp)}</td>
      </tr>`).join("")}</tbody>
    </table>`;
  }

  if (personnel) {
    html += `<h3 style="font-size:13px; font-weight:700; color:#334155; margin:18px 0 10px;">C. Rencana SDM & Gaji per Bulan</h3>
    <table style="width:100%; border-collapse:collapse; font-size:11px;">
      <thead><tr>
        <th style="${TH}">POSISI</th>
        <th style="${TH_R}">JUMLAH</th>
        <th style="${TH_R}">GAJI/ORANG</th>
        <th style="${TH_R} background:#0F172A; color:#fff;">TOTAL/BULAN</th>
      </tr></thead>
      <tbody>${personnel.positions.map(([key, pos]) => `<tr>
        <td style="${TD}">${key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ")}</td>
        <td style="${TD_R}">${pos.count} orang</td>
        <td style="${TD_R}">${formatRp(pos.salary)}</td>
        <td style="${TD_R} font-weight:700;">${formatRp((pos.count || 0) * (pos.salary || 0))}</td>
      </tr>`).join("")}
        <tr style="background:#F1F5F9;">
          <td style="${TD} font-weight:800;" colspan="3">TOTAL PAYROLL BULANAN</td>
          <td style="${TD_R} font-weight:800;">${formatRp(personnel.totalMonthly)}</td>
        </tr>
        <tr style="background:#FEF3C7;">
          <td style="${TD} font-weight:700;" colspan="3">TOTAL PAYROLL TAHUNAN (×12)</td>
          <td style="${TD_R} font-weight:800; color:#92400E;">${formatRp(personnel.totalMonthly * 12)}</td>
        </tr>
      </tbody>
    </table>`;
  }
  html += `</div>`;
  return html;
}

// ============================================================================
// STYLES
// ============================================================================
const titleStyle = { fontSize: 19, fontWeight: 700, color: "#0F172A", borderBottom: "2px solid #0F172A", paddingBottom: 8, margin: "0 0 18px" };
const subtitleStyle = { fontSize: 13, fontWeight: 700, color: "#334155", margin: "18px 0 10px" };
const tableStyle = { width: "100%", borderCollapse: "collapse", fontSize: 11 };
const thStyle = { padding: "8px 10px", textAlign: "left", fontFamily: "monospace", fontSize: 10, letterSpacing: "0.1em", fontWeight: 700, color: "#475569", background: "#F1F5F9", borderBottom: "2px solid #CBD5E1" };
const thRStyle = { ...thStyle, textAlign: "right" };
const tdStyle = { padding: "7px 10px", fontSize: 11, color: "#1e293b", borderBottom: "1px solid #E2E8F0" };
const tdRStyle = { ...tdStyle, textAlign: "right", fontFamily: "monospace" };
