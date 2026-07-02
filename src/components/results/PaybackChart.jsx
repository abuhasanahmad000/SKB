import { useApp } from "../../state/AppContext.jsx";
import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { computeFinancials } from "../../engines/financialEngine.js";
import { COLORS } from "../primitives/styles.js";
import { formatRp } from "../../utils/format.js";

// ============================================================================
// <PaybackChart /> — kurva cumulative cash recovery
//
// Dipakai di sub-tab:
//   - payback_baru (Jalur B) — periode pengembalian modal ekspansi
//
// Menampilkan:
//   - Kurva area cumulative cash flow
//   - Garis referensi 0 (titik balik modal)
//   - Anotasi bulan di mana garis melewati 0
// ============================================================================

export default function PaybackChart() {
  const { state } = useApp();
  const provinceCode = state.forms?.identitas?.provinceCode || "";

  const fin = useMemo(() => {
    try {
      return computeFinancials(state.forms, provinceCode);
    } catch (e) {
      return null;
    }
  }, [state.forms, provinceCode]);

  if (!fin) return <EmptyState />;

  // Bangun cumulative cash flow per bulan (36 bulan = 3 tahun)
  const monthlyCF = [];
  let cumulative = -fin.initialInvestment;
  monthlyCF.push({ month: 0, label: "Awal", cumulative: cumulative });

  for (let year = 0; year < 3; year++) {
    const y = fin.projection[year];
    const monthlyOperatingCash = (y.netIncome + y.operatingExpenses.depreciation) / 12;
    for (let m = 1; m <= 12; m++) {
      const totalMonth = year * 12 + m;
      cumulative += monthlyOperatingCash;
      monthlyCF.push({
        month: totalMonth,
        label: `M${totalMonth}`,
        cumulative: Math.round(cumulative),
      });
    }
  }

  const paybackMonth = fin.paybackMonths;
  const paid = paybackMonth != null && paybackMonth <= 36;

  return (
    <>
      {/* Status banner */}
      <div
        style={{
          padding: 20,
          marginBottom: 20,
          background: paid ? `${COLORS.success}11` : `${COLORS.warn}11`,
          border: `1px solid ${paid ? COLORS.success : COLORS.warn}`,
          borderRadius: 12,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.2em",
            color: paid ? COLORS.successHi : COLORS.warnHi,
            fontFamily: "monospace",
            fontWeight: 700,
            marginBottom: 4,
          }}
        >
          ◆ PAYBACK PERIOD (PERIODE PENGEMBALIAN MODAL)
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.textHi, fontFamily: "monospace", marginBottom: 4 }}>
          {paid
            ? `≈ ${paybackMonth} bulan (${(paybackMonth / 12).toFixed(1)} tahun)`
            : "BELUM KEMBALI dalam horizon 3 tahun"}
        </div>
        <div style={{ fontSize: 12, color: COLORS.textSoft, lineHeight: 1.55 }}>
          Modal awal:{" "}
          <strong style={{ color: COLORS.textHi, fontFamily: "monospace" }}>{formatRp(fin.initialInvestment)}</strong>
          {paid
            ? ` akan tertutup oleh laba operasional pada bulan ke-${paybackMonth}.`
            : ` belum tertutup sepenuhnya dalam 36 bulan — pertimbangkan tingkatkan revenue atau turunkan biaya tetap.`}
        </div>
      </div>

      {/* Chart */}
      <div
        style={{
          padding: 16,
          background: COLORS.bgPanel,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.2em",
            color: COLORS.accent,
            fontFamily: "monospace",
            fontWeight: 700,
            marginBottom: 14,
          }}
        >
          ◆ KURVA PENGEMBALIAN MODAL (36 BULAN)
        </div>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <AreaChart data={monthlyCF} margin={{ top: 10, right: 12, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="paybackGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.success} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={COLORS.success} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.danger} stopOpacity={0.05} />
                  <stop offset="100%" stopColor={COLORS.danger} stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis
                dataKey="month"
                stroke={COLORS.textMuted}
                style={{ fontSize: 10, fontFamily: "monospace" }}
                tickFormatter={(v) => `Bln ${v}`}
                interval={5}
              />
              <YAxis
                stroke={COLORS.textMuted}
                style={{ fontSize: 10, fontFamily: "monospace" }}
                tickFormatter={(v) => formatRpCompact(v)}
              />
              <Tooltip
                contentStyle={{
                  background: COLORS.bgPanelDeep,
                  border: `1px solid ${COLORS.borderHi}`,
                  borderRadius: 6,
                  color: COLORS.textHi,
                  fontSize: 12,
                }}
                formatter={(value) => [formatRp(value), "Kumulatif Kas"]}
                labelFormatter={(label) => `Bulan ke-${label}`}
              />
              <ReferenceLine
                y={0}
                stroke={COLORS.textMid}
                strokeDasharray="3 3"
                label={{
                  value: "Titik Balik Modal",
                  position: "insideTopRight",
                  fill: COLORS.textMid,
                  fontSize: 10,
                }}
              />
              {paid && paybackMonth != null && (
                <ReferenceLine
                  x={paybackMonth}
                  stroke={COLORS.success}
                  strokeDasharray="3 3"
                  label={{
                    value: `Bulan ${paybackMonth}`,
                    position: "top",
                    fill: COLORS.success,
                    fontSize: 11,
                    fontFamily: "monospace",
                    fontWeight: 700,
                  }}
                />
              )}
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke={paid ? COLORS.success : COLORS.warn}
                strokeWidth={2}
                fill="url(#paybackGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div
        style={{
          padding: 14,
          background: COLORS.bgPanelDeep,
          border: `1px dashed ${COLORS.border}`,
          borderRadius: 8,
          fontSize: 12,
          color: COLORS.textSoft,
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: COLORS.textHi }}>Cara baca grafik:</strong> Sumbu Y menunjukkan kas kumulatif. Awalnya negatif sebesar modal awal, lalu naik tiap bulan dari laba operasional + penyusutan. Garis horizontal Rp 0 adalah titik balik modal — semakin cepat garis kurva memotong, semakin cepat investasi kembali.
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div style={{ padding: 32, background: COLORS.bgPanel, border: `2px dashed ${COLORS.border}`, borderRadius: 12, textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⏱️</div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.textHi, margin: "0 0 8px" }}>
        Payback Akan Dihitung Setelah Data Keuangan Terisi
      </h3>
      <p style={{ fontSize: 13, color: COLORS.textSoft, lineHeight: 1.6, maxWidth: 420, margin: "0 auto" }}>
        Lengkapi: produk, biaya operasional, dan modal awal — sistem akan hitung kapan modal kembali.
      </p>
    </div>
  );
}

function formatRpCompact(v) {
  if (v == null || isNaN(v)) return "Rp 0";
  const a = Math.abs(v);
  if (a >= 1e9) return `${v < 0 ? "-" : ""}Rp ${(Math.abs(v) / 1e9).toFixed(1)}M`;
  if (a >= 1e6) return `${v < 0 ? "-" : ""}Rp ${(Math.abs(v) / 1e6).toFixed(0)}jt`;
  if (a >= 1e3) return `Rp ${(v / 1e3).toFixed(0)}rb`;
  return `Rp ${(v || 0).toFixed(0)}`;
}
