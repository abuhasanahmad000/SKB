import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// ============================================================================
// HighlightsChart (Hotfix 11.5) — 3D-style bar chart "Highlights" ala LivePlan
//
// LivePlan punya chart ini di Executive Summary (Bab 1) — chart pertama yang
// dilihat investor. 3 series: Sales, Gross Margin, Net Profit × 3 tahun.
// ============================================================================

export default function HighlightsChart({ fin }) {
  if (!fin?.projection?.length) return null;

  const data = fin.projection.map((y) => ({
    tahun: `Tahun ${y.year}`,
    "Penjualan": Math.round(y.revenue / 1e6),
    "Laba Kotor": Math.round(y.grossProfit / 1e6),
    "Laba Bersih": Math.round(y.netIncome / 1e6),
  }));

  return (
    <div style={{
      margin: "20px 0",
      padding: 18,
      background: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
      border: "1px solid #E2E8F0",
      borderRadius: 10,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div style={{ marginBottom: 4, fontSize: 14, fontWeight: 800, color: "#0F172A", textAlign: "center", letterSpacing: "-0.2px" }}>
        Highlights — Proyeksi Kinerja 3 Tahun
      </div>
      <div style={{ marginBottom: 14, fontSize: 11, color: "#64748B", textAlign: "center", fontStyle: "italic" }}>
        Penjualan · Laba Kotor · Laba Bersih (dalam juta rupiah)
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -8 }}>
          <defs>
            <linearGradient id="gradSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
              <stop offset="100%" stopColor="#1D4ED8" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="gradGross" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity={1} />
              <stop offset="100%" stopColor="#B91C1C" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="gradNet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14B8A6" stopOpacity={1} />
              <stop offset="100%" stopColor="#0F766E" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="tahun" tick={{ fontSize: 11, fontWeight: 600 }} stroke="#475569" />
          <YAxis tick={{ fontSize: 10 }} stroke="#475569" tickFormatter={(v) => `${v}jt`} />
          <Tooltip
            formatter={(v) => `Rp ${v} juta`}
            cursor={{ fill: "rgba(59,130,246,0.06)" }}
            contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E2E8F0" }}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="rect" />
          <Bar dataKey="Penjualan" fill="url(#gradSales)" radius={[4, 4, 0, 0]} style={{ filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.18))" }} />
          <Bar dataKey="Laba Kotor" fill="url(#gradGross)" radius={[4, 4, 0, 0]} style={{ filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.18))" }} />
          <Bar dataKey="Laba Bersih" fill="url(#gradNet)" radius={[4, 4, 0, 0]} style={{ filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.18))" }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
