import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
import { formatRp } from "../../utils/format.js";

// ============================================================================
// BepReportChart (v13.3) — Visualisasi titik impas (BEP) ala LivePlan untuk
// LAPORAN (Bab 8). File di-RENAME dari "BreakEvenChart.jsx" karena namanya
// hanya beda kapital dengan "BreakevenChart.jsx" (sub-tab kalkulator) —
// di sistem file case-insensitive (HP/Windows) keduanya saling MENIMPA saat
// ekstrak ZIP/upload GitHub, yang membuat kalkulator break-even hilang.
//
// v13.3: SELURUH angka (BEP, fixed cost, variable cost) kini diambil dari
// financialEngine (fin.bep) — sebelumnya chart ini menghitung sendiri tanpa
// depresiasi & tunjangan sehingga angkanya (34,8 jt) bertentangan dengan
// KPI Bab 8 (37,5 jt) dan narasi Bab 1 (38 jt). Sekarang SATU angka di mana pun.
// ============================================================================

export default function BepReportChart({ fin }) {
  if (!fin?.projection?.[0] || fin?.bep?.bepMonthlySales == null) return null;

  // SATU sumber kebenaran: financialEngine.computeBEP
  const monthlyFixedCost = fin.bep.fixedCostMonthly || 0;
  const variableCostRate = 1 - (fin.bep.grossMarginPct || 0);
  const bepRevenue = fin.bep.bepMonthlySales;

  // Generate 12 data points dari 0 → 1.5× BEP
  const maxRevenue = bepRevenue * 1.8;
  const step = maxRevenue / 11;
  const data = Array.from({ length: 12 }).map((_, i) => {
    const revenue = i * step;
    const variableCost = revenue * variableCostRate;
    const totalCost = monthlyFixedCost + variableCost;
    const profit = revenue - totalCost;
    return {
      revenue: Math.round(revenue / 1e6),
      "Laba/Rugi": Math.round(profit / 1e6),
    };
  });

  return (
    <div style={{
      margin: "20px 0",
      padding: 18,
      background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
      border: "1px solid #E2E8F0",
      borderRadius: 10,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div style={{ marginBottom: 4, fontSize: 13, fontWeight: 800, color: "#0F172A", textAlign: "center" }}>
        Analisis Titik Impas (Break-even Analysis)
      </div>
      <div style={{ marginBottom: 14, fontSize: 11, color: "#64748B", textAlign: "center", fontStyle: "italic" }}>
        Hubungan omset bulanan (juta Rp) ↔ laba/rugi bulanan (juta Rp)
      </div>

      {/* BEP Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
        <SummaryCard label="BEP / Bulan" value={formatRp(bepRevenue)} color="#3B82F6" />
        <SummaryCard label="Variable Cost %" value={`${(variableCostRate * 100).toFixed(1)}%`} color="#F59E0B" />
        <SummaryCard label="Fixed Cost / Bulan" value={formatRp(monthlyFixedCost)} color="#10B981" />
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 8, right: 20, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            dataKey="revenue"
            tick={{ fontSize: 10 }}
            stroke="#475569"
            label={{ value: "Omset Bulanan (juta Rp)", position: "insideBottom", offset: -2, style: { fontSize: 10, fill: "#64748B" } }}
          />
          <YAxis tick={{ fontSize: 10 }} stroke="#475569" tickFormatter={(v) => `${v}jt`} />
          <Tooltip
            formatter={(v) => `Rp ${v} juta`}
            labelFormatter={(label) => `Omset: Rp ${label} juta`}
            contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E2E8F0" }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <ReferenceLine
            y={0}
            stroke="#64748B"
            strokeDasharray="3 3"
            strokeWidth={1.5}
            label={{ value: "BREAK-EVEN", position: "right", style: { fontSize: 10, fontWeight: 700, fill: "#0F172A" } }}
          />
          <ReferenceLine
            x={Math.round(bepRevenue / 1e6)}
            stroke="#DC2626"
            strokeDasharray="5 5"
            strokeWidth={1.5}
            label={{ value: "BEP", position: "top", style: { fontSize: 10, fontWeight: 700, fill: "#DC2626" } }}
          />
          <Line
            type="monotone"
            dataKey="Laba/Rugi"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={{ fill: "#1D4ED8", r: 4 }}
            activeDot={{ r: 6 }}
            style={{ filter: "drop-shadow(0 2px 3px rgba(59,130,246,0.3))" }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div style={{ marginTop: 12, padding: "10px 12px", background: "#EFF6FF", borderLeft: "3px solid #3B82F6", borderRadius: 4, fontSize: 11, color: "#1E40AF" }}>
        ℹ Bisnis mencapai titik impas saat omset bulanan = <strong>{formatRp(bepRevenue)}</strong>. Di bawah angka ini bisnis merugi; di atas mulai menghasilkan keuntungan.
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div style={{ padding: "10px 12px", background: "#fff", border: `1px solid ${color}30`, borderLeft: `3px solid ${color}`, borderRadius: 6 }}>
      <div style={{ fontSize: 9, color: "#64748B", fontFamily: "monospace", letterSpacing: "0.1em", fontWeight: 700 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 14, color: color, fontWeight: 800, marginTop: 2, fontFamily: "monospace" }}>{value}</div>
    </div>
  );
}
