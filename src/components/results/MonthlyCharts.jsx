import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, ComposedChart, Line, Legend } from "recharts";
import { SEASONALITY_FACTORS } from "../../data/seasonality.js";

// ============================================================================
// MonthlyCharts (Hotfix 11.3) — chart 12 bulan ala LivePlan
//
// 3 chart utama:
//   1. ProfitMonthlyChart    — laba/rugi per bulan (dengan bar negatif)
//   2. GrossMarginMonthlyChart — gross margin 12 bulan
//   3. CashMonthlyChart      — cash flow + cash balance overlay
//
// Style: 3D-like dengan gradient + shadow + perspective hover
// ============================================================================

// v13.2: pola seasonality SATU sumber (src/data/seasonality.js) — ramp-up
// halus + puncak Desember, tanpa anjlok janggal di akhir tahun.
const SEASONALITY = SEASONALITY_FACTORS;

/**
 * Laba bersih per bulan KONSISTEN dengan angka tahunan:
 * laba_bulan = (labaKotor × faktor seasonality) − (biaya tetap + bunga + pajak)/12.
 * Jumlah 12 bulan = laba bersih tahunan persis — bulan awal otomatis rugi
 * (omset belum menutup biaya tetap), tanpa faktor karangan.
 */
function monthlyProfitSeries(y1) {
  const fixedMonthly = ((y1.operatingExpenses?.total || 0) + (y1.interest || 0) + (y1.tax?.amount || 0)) / 12;
  return SEASONALITY.map((f) => (y1.grossProfit || 0) * f - fixedMonthly);
}

const COLORS3D = {
  primary: "#0EA5E9", primaryDark: "#0284C7",
  success: "#10B981", successDark: "#059669",
  danger: "#EF4444", dangerDark: "#DC2626",
  warning: "#F59E0B", warningDark: "#D97706",
  purple: "#A78BFA", purpleDark: "#7C3AED",
  text: "#475569", grid: "#E2E8F0",
};

function gradientDef(id, color, colorDark) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity={0.95} />
        <stop offset="100%" stopColor={colorDark} stopOpacity={1} />
      </linearGradient>
    </defs>
  );
}

// ----------------------------------------------------------------------------
// 1. ProfitMonthlyChart — Laba per bulan dengan negatif (rugi awal)
// ----------------------------------------------------------------------------
export function ProfitMonthlyChart({ fin }) {
  if (!fin?.projection?.[0]) return null;
  const series = monthlyProfitSeries(fin.projection[0]);
  const data = series.map((v, i) => ({
    bulan: `B${i + 1}`,
    laba: Math.round(v / 1e6),
  }));

  return (
    <ChartCard title="Laba Bersih Bulanan (juta rupiah)" subtitle="Tahun 1 — bulan awal biasanya rugi akibat start-up cost">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -8 }}>
          {gradientDef("gradProfit", COLORS3D.primary, COLORS3D.primaryDark)}
          {gradientDef("gradLoss", COLORS3D.danger, COLORS3D.dangerDark)}
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS3D.grid} />
          <XAxis dataKey="bulan" tick={{ fontSize: 10 }} stroke={COLORS3D.text} />
          <YAxis tick={{ fontSize: 10 }} stroke={COLORS3D.text} />
          <Tooltip formatter={(v) => `Rp ${v} jt`} cursor={{ fill: "rgba(14,165,233,0.08)" }} />
          <ReferenceLine y={0} stroke={COLORS3D.text} strokeWidth={1.5} />
          <Bar dataKey="laba" radius={[4, 4, 0, 0]} style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.15))" }}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.laba >= 0 ? "url(#gradProfit)" : "url(#gradLoss)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ----------------------------------------------------------------------------
// 2. GrossMarginMonthlyChart
// ----------------------------------------------------------------------------
export function GrossMarginMonthlyChart({ fin }) {
  if (!fin?.projection?.[0]) return null;
  const yearGross = fin.projection[0].grossProfit || 0;
  const data = SEASONALITY.map((factor, i) => ({
    bulan: `B${i + 1}`,
    gross: Math.round((yearGross * factor) / 1e6),
  }));

  return (
    <ChartCard title="Laba Kotor Bulanan (juta rupiah)" subtitle="Mengikuti pola seasonality penjualan">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -8 }}>
          {gradientDef("gradGross", COLORS3D.success, COLORS3D.successDark)}
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS3D.grid} />
          <XAxis dataKey="bulan" tick={{ fontSize: 10 }} stroke={COLORS3D.text} />
          <YAxis tick={{ fontSize: 10 }} stroke={COLORS3D.text} />
          <Tooltip formatter={(v) => `Rp ${v} jt`} cursor={{ fill: "rgba(16,185,129,0.08)" }} />
          <Bar dataKey="gross" fill="url(#gradGross)" radius={[4, 4, 0, 0]} style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.15))" }} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ----------------------------------------------------------------------------
// 3. CashMonthlyChart
// ----------------------------------------------------------------------------
export function CashMonthlyChart({ fin, forms }) {
  if (!fin?.projection?.[0]) return null;
  const y1 = fin.projection[0];

  // v13.2 FIX "chart flat": versi lama mencampur satuan — saldo awal dalam
  // RUPIAH penuh, arus kas bulanan dalam JUTA, sehingga semua bar terlihat
  // sama tinggi (~Rp 87 jt) dan sumbu memakai angka mentah. Sekarang semua
  // dalam juta, net cash flow mengikuti seasonality riil (bergelombang),
  // dan saldo kumulatif digambar sebagai GARIS terpisah.
  const profitSeries = monthlyProfitSeries(y1); // rupiah
  const depMonthly = (y1.operatingExpenses?.depreciation || 0) / 12; // non-kas
  const principalY1 = (fin.debtSchedule?.principalByYear?.[0] || 0) / 12; // cicilan pokok
  const initialCash =
    (forms?.modal?.expenses?.lainnya || 0) * 0.6; // kas awal ≈ modal kerja yang disisihkan

  let cumulative = initialCash / 1e6;
  const data = profitSeries.map((p, i) => {
    const netFlow = (p + depMonthly - principalY1) / 1e6;
    cumulative += netFlow;
    return {
      bulan: `B${i + 1}`,
      "Net Cash": Math.round(netFlow * 10) / 10,
      "Saldo Kas": Math.round(cumulative * 10) / 10,
    };
  });

  return (
    <ChartCard title="Cash Flow Bulanan (juta rupiah)" subtitle="Net cash flow per bulan (batang) + saldo kas kumulatif (garis)">
      <ResponsiveContainer width="100%" height={250}>
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -8 }}>
          {gradientDef("gradNetCash", COLORS3D.primary, COLORS3D.primaryDark)}
          {gradientDef("gradNetCashNeg", COLORS3D.danger, COLORS3D.dangerDark)}
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS3D.grid} />
          <XAxis dataKey="bulan" tick={{ fontSize: 10 }} stroke={COLORS3D.text} />
          <YAxis tick={{ fontSize: 10 }} stroke={COLORS3D.text} tickFormatter={(v) => `${v}jt`} />
          <Tooltip formatter={(v) => `Rp ${v} jt`} cursor={{ fill: "rgba(14,165,233,0.08)" }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <ReferenceLine y={0} stroke={COLORS3D.text} strokeWidth={1.2} />
          <Bar dataKey="Net Cash" radius={[4, 4, 0, 0]} style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.15))" }}>
            {data.map((d, i) => (
              <Cell key={i} fill={d["Net Cash"] >= 0 ? "url(#gradNetCash)" : "url(#gradNetCashNeg)"} />
            ))}
          </Bar>
          <Line type="monotone" dataKey="Saldo Kas" stroke={COLORS3D.warningDark} strokeWidth={2.5} dot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ----------------------------------------------------------------------------
// ChartCard wrapper
// ----------------------------------------------------------------------------
function ChartCard({ title, subtitle, children }) {
  return (
    <div style={{ margin: "20px 0", padding: 16, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8 }}>
      <div style={{ marginBottom: 4, fontSize: 13, fontWeight: 700, color: "#0F172A", textAlign: "center" }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ marginBottom: 12, fontSize: 11, color: "#64748B", textAlign: "center", fontStyle: "italic" }}>
          {subtitle}
        </div>
      )}
      {children}
    </div>
  );
}
