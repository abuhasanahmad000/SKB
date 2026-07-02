import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { SEASONALITY_FACTORS as SHARED_SEASONALITY } from "../../data/seasonality.js";

// ============================================================================
// StackedSalesCharts — Stacked per produk × bulan/tahun ala LivePlan
//
// 2 chart:
//   1. SalesMonthlyStackedChart — 12 bulan × N produk (stacked)
//   2. SalesYearlyStackedChart  — 3 tahun × N produk (stacked)
//
// LivePlan punya 3 segment: Clothing, Shoes, Products. Kita: produk dari user.
// ============================================================================

const SEASONALITY = SHARED_SEASONALITY;

// Palette tetap untuk produk (max 6 produk)
const PRODUCT_COLORS = [
  { light: "#0EA5E9", dark: "#0284C7" }, // sky
  { light: "#F59E0B", dark: "#D97706" }, // amber
  { light: "#10B981", dark: "#059669" }, // emerald
  { light: "#A78BFA", dark: "#7C3AED" }, // purple
  { light: "#EC4899", dark: "#DB2777" }, // pink
  { light: "#14B8A6", dark: "#0F766E" }, // teal
];

function gradientDefs(productCount) {
  return (
    <defs>
      {Array.from({ length: productCount }).map((_, i) => {
        const c = PRODUCT_COLORS[i % PRODUCT_COLORS.length];
        return (
          <linearGradient key={i} id={`gradProduct${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.light} stopOpacity={0.95} />
            <stop offset="100%" stopColor={c.dark} stopOpacity={1} />
          </linearGradient>
        );
      })}
    </defs>
  );
}

// ----------------------------------------------------------------------------
// SalesMonthlyStackedChart — 12 bulan stacked per produk
// ----------------------------------------------------------------------------
export function SalesMonthlyStackedChart({ forms }) {
  const products = forms?.keuangan?.products || [];
  if (products.length === 0) return null;

  const annualPerProduct = products.map((p) =>
    (parseInt(p.dailyTarget, 10) || 0) * (parseInt(p.price, 10) || 0) * 30 * 12
  );

  const data = SEASONALITY.map((factor, mIdx) => {
    const row = { bulan: `Bln ${mIdx + 1}` };
    products.forEach((p, pIdx) => {
      const name = p.name || `Produk ${pIdx + 1}`;
      row[name] = Math.round((annualPerProduct[pIdx] * factor) / 1e6);
    });
    return row;
  });

  return (
    <ChartCard title="Penjualan Bulanan per Produk (juta rupiah)" subtitle="12 bulan Tahun 1, stacked per kategori produk">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -8 }}>
          {gradientDefs(products.length)}
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="bulan" tick={{ fontSize: 10 }} stroke="#475569" />
          <YAxis tick={{ fontSize: 10 }} stroke="#475569" />
          <Tooltip formatter={(v) => `Rp ${v} jt`} cursor={{ fill: "rgba(14,165,233,0.08)" }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {products.map((p, pIdx) => (
            <Bar
              key={pIdx}
              dataKey={p.name || `Produk ${pIdx + 1}`}
              stackId="produk"
              fill={`url(#gradProduct${pIdx})`}
              style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.15))" }}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ----------------------------------------------------------------------------
// SalesYearlyStackedChart — 3 tahun stacked per produk
// ----------------------------------------------------------------------------
export function SalesYearlyStackedChart({ forms, fin }) {
  const products = forms?.keuangan?.products || [];
  if (products.length === 0 || !fin?.projection) return null;

  const annualPerProduct = products.map((p) =>
    (parseInt(p.dailyTarget, 10) || 0) * (parseInt(p.price, 10) || 0) * 30 * 12
  );

  // Total Y1 dari produk
  const totalY1 = annualPerProduct.reduce((s, v) => s + v, 0);

  const data = fin.projection.map((y) => {
    const row = { tahun: `Tahun ${y.year}` };
    const factor = totalY1 > 0 ? y.revenue / totalY1 : 1;
    products.forEach((p, pIdx) => {
      const name = p.name || `Produk ${pIdx + 1}`;
      row[name] = Math.round((annualPerProduct[pIdx] * factor) / 1e6);
    });
    return row;
  });

  return (
    <ChartCard title="Penjualan Tahunan per Produk (juta rupiah)" subtitle="Proyeksi 3 tahun, stacked per kategori produk">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -8 }}>
          {gradientDefs(products.length)}
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="tahun" tick={{ fontSize: 11 }} stroke="#475569" />
          <YAxis tick={{ fontSize: 10 }} stroke="#475569" />
          <Tooltip formatter={(v) => `Rp ${v} jt`} cursor={{ fill: "rgba(14,165,233,0.08)" }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {products.map((p, pIdx) => (
            <Bar
              key={pIdx}
              dataKey={p.name || `Produk ${pIdx + 1}`}
              stackId="produk"
              fill={`url(#gradProduct${pIdx})`}
              style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.15))" }}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div style={{ margin: "20px 0", padding: 16, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8 }}>
      <div style={{ marginBottom: 4, fontSize: 13, fontWeight: 700, color: "#0F172A", textAlign: "center" }}>{title}</div>
      {subtitle && (
        <div style={{ marginBottom: 12, fontSize: 11, color: "#64748B", textAlign: "center", fontStyle: "italic" }}>{subtitle}</div>
      )}
      {children}
    </div>
  );
}
