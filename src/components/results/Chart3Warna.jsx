import { useApp } from "../../state/AppContext.jsx";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { computeFinancials } from "../../engines/financialEngine.js";
import { COLORS } from "../primitives/styles.js";
import { formatRp } from "../../utils/format.js";

// ============================================================================
// <Chart3Warna /> — Grafik 3 tahun, 3 warna utama
//
// Dipakai di sub-tab:
//   - grafik (Jalur A) — proyeksi standar
//   - grafik_lompatan (Jalur B) — perbandingan baseline vs proyeksi ekspansi
//
// 3 metrik per tahun:
//   - Penjualan / Revenue (biru)
//   - Laba Kotor / Gross Profit (hijau)
//   - Laba Bersih / Net Income (kuning/ungu)
// ============================================================================

const CHART_COLORS = {
  revenue: "#0EA5E9",      // sky blue
  grossProfit: "#10B981",  // emerald
  netIncome: "#A78BFA",    // purple
  baseline: "#94A3B8",     // slate (for Jalur B comparison)
};

export default function Chart3Warna({ mode = "baru" }) {
  const { state } = useApp();
  const provinceCode = state.forms?.identitas?.provinceCode || "";

  const fin = useMemo(() => {
    try {
      return computeFinancials(state.forms, provinceCode);
    } catch (e) {
      return null;
    }
  }, [state.forms, provinceCode]);

  // Empty state
  const products = state.forms?.keuangan?.products || [];
  const hasData = products.length > 0 && products.some((p) => p.dailyTarget > 0);

  if (!hasData || !fin) {
    return <EmptyState />;
  }

  // Data chart 3 tahun
  const data = fin.projection.map((y) => ({
    name: `Tahun ${y.year}`,
    Penjualan: Math.round(y.revenue),
    "Laba Kotor": Math.round(y.grossProfit),
    "Laba Bersih": Math.round(y.netIncome),
  }));

  // Baseline data (Jalur B): omset eksisting × 1.0 sebagai pembanding
  const baselineRevenue = state.forms?.existingBusiness?.omsetBulanan
    ? state.forms.existingBusiness.omsetBulanan * 12
    : 0;

  return (
    <>
      <SummaryTopBar fin={fin} />

      <div
        style={{
          background: COLORS.bgPanel,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 12,
          padding: 16,
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
          ◆ PROYEKSI KEUANGAN 3 TAHUN
        </div>

        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis
                dataKey="name"
                stroke={COLORS.textMuted}
                style={{ fontSize: 11, fontFamily: "monospace" }}
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
                formatter={(value) => formatRp(value)}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                iconType="circle"
              />
              <Bar dataKey="Penjualan" fill={CHART_COLORS.revenue} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Laba Kotor" fill={CHART_COLORS.grossProfit} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Laba Bersih" fill={CHART_COLORS.netIncome} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detail tabel */}
        <DetailTable fin={fin} mode={mode} baselineRevenue={baselineRevenue} />
      </div>

      {/* Jalur B: tampilkan "lompatan" */}
      {mode === "lanjutan" && baselineRevenue > 0 && (
        <LompatanCard
          baselineRevenue={baselineRevenue}
          projectedRevenue={fin.projection[2].revenue}
        />
      )}
    </>
  );
}

// ----- Summary top bar dengan 3 KPI besar -----
function SummaryTopBar({ fin }) {
  const y1 = fin.projection[0];
  const y3 = fin.projection[2];
  const growthRevenue = y1.revenue > 0 ? ((y3.revenue / y1.revenue - 1) * 100).toFixed(0) : "—";
  const growthNet =
    y1.netIncome > 0 ? ((y3.netIncome / y1.netIncome - 1) * 100).toFixed(0) : "—";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 12,
        marginBottom: 20,
      }}
    >
      <KpiCard
        label="Penjualan Tahun 1"
        value={formatRpCompact(y1.revenue)}
        sub={`→ ${formatRpCompact(y3.revenue)} di Tahun 3`}
        color={CHART_COLORS.revenue}
      />
      <KpiCard
        label="Pertumbuhan Penjualan"
        value={`+${growthRevenue}%`}
        sub="Tahun 1 → Tahun 3"
        color={CHART_COLORS.grossProfit}
      />
      <KpiCard
        label="Laba Bersih Tahun 1"
        value={formatRpCompact(y1.netIncome)}
        sub={y1.netIncome > 0 ? `Net margin ${(y1.netMargin * 100).toFixed(1)}%` : "Belum profitable"}
        color={CHART_COLORS.netIncome}
      />
    </div>
  );
}

function KpiCard({ label, value, sub, color }) {
  return (
    <div
      style={{
        padding: 14,
        background: COLORS.bgPanel,
        border: `1px solid ${COLORS.border}`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 8,
      }}
    >
      <div
        style={{
          fontSize: 9.5,
          letterSpacing: "0.15em",
          color: COLORS.textMuted,
          fontFamily: "monospace",
          marginBottom: 4,
          fontWeight: 700,
        }}
      >
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.textHi, fontFamily: "monospace" }}>
        {value}
      </div>
      <div style={{ fontSize: 10.5, color: COLORS.textMuted, marginTop: 3 }}>{sub}</div>
    </div>
  );
}

// ----- Detail tabel di bawah chart -----
function DetailTable({ fin, mode }) {
  return (
    <div
      style={{
        marginTop: 16,
        padding: 12,
        background: COLORS.bgPanelDeep,
        borderRadius: 8,
        overflowX: "auto",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
            <th style={thStyle}>Komponen</th>
            <th style={thStyleRight}>Tahun 1</th>
            <th style={thStyleRight}>Tahun 2</th>
            <th style={thStyleRight}>Tahun 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdStyle}>Penjualan</td>
            {fin.projection.map((y) => (
              <td key={y.year} style={tdStyleRight}>{formatRp(y.revenue)}</td>
            ))}
          </tr>
          <tr>
            <td style={{ ...tdStyle, color: COLORS.textMuted }}>(–) HPP</td>
            {fin.projection.map((y) => (
              <td key={y.year} style={{ ...tdStyleRight, color: COLORS.textMuted }}>({formatRp(y.hpp)})</td>
            ))}
          </tr>
          <tr style={{ background: COLORS.bgPanel }}>
            <td style={{ ...tdStyle, fontWeight: 700 }}>Laba Kotor</td>
            {fin.projection.map((y) => (
              <td key={y.year} style={{ ...tdStyleRight, fontWeight: 700, color: CHART_COLORS.grossProfit }}>{formatRp(y.grossProfit)}</td>
            ))}
          </tr>
          <tr>
            <td style={{ ...tdStyle, color: COLORS.textMuted }}>(–) Biaya Ops</td>
            {fin.projection.map((y) => (
              <td key={y.year} style={{ ...tdStyleRight, color: COLORS.textMuted }}>({formatRp(y.operatingExpenses.total)})</td>
            ))}
          </tr>
          <tr>
            <td style={{ ...tdStyle, color: COLORS.textMuted }}>(–) Pajak</td>
            {fin.projection.map((y) => (
              <td key={y.year} style={{ ...tdStyleRight, color: COLORS.textMuted }}>({formatRp(y.tax.amount)})</td>
            ))}
          </tr>
          <tr style={{ background: COLORS.bgPanel, borderTop: `2px solid ${CHART_COLORS.netIncome}` }}>
            <td style={{ ...tdStyle, fontWeight: 800 }}>LABA BERSIH</td>
            {fin.projection.map((y) => (
              <td key={y.year} style={{ ...tdStyleRight, fontWeight: 800, color: CHART_COLORS.netIncome }}>{formatRp(y.netIncome)}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ----- Lompatan Card (Jalur B) -----
function LompatanCard({ baselineRevenue, projectedRevenue }) {
  const lompatan = projectedRevenue - baselineRevenue;
  const lompatanPct = baselineRevenue > 0 ? (lompatan / baselineRevenue) * 100 : 0;
  return (
    <div
      style={{
        padding: 16,
        background: `${CHART_COLORS.grossProfit}11`,
        border: `1px solid ${CHART_COLORS.grossProfit}`,
        borderRadius: 10,
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.2em",
          color: CHART_COLORS.grossProfit,
          fontFamily: "monospace",
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        ◆ LOMPATAN PROYEKSI EKSPANSI
      </div>
      <div style={{ display: "flex", gap: 18, alignItems: "baseline" }}>
        <div>
          <div style={{ fontSize: 11, color: COLORS.textMuted }}>Baseline (saat ini)</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.textMid, fontFamily: "monospace" }}>
            {formatRp(baselineRevenue)}/thn
          </div>
        </div>
        <div style={{ fontSize: 20, color: COLORS.textMuted }}>→</div>
        <div>
          <div style={{ fontSize: 11, color: COLORS.textMuted }}>Proyeksi Tahun 3 (ekspansi)</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: CHART_COLORS.grossProfit, fontFamily: "monospace" }}>
            {formatRp(projectedRevenue)}/thn
          </div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: 11, color: COLORS.textMuted }}>Lompatan</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: CHART_COLORS.grossProfit, fontFamily: "monospace" }}>
            +{lompatanPct.toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
}

// ----- Empty state -----
function EmptyState() {
  return (
    <div
      style={{
        padding: 32,
        background: COLORS.bgPanel,
        border: `2px dashed ${COLORS.border}`,
        borderRadius: 12,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 40, marginBottom: 12 }}>📈</div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.textHi, margin: "0 0 8px" }}>
        Grafik Akan Tampil Setelah Anda Mengisi Produk & Harga
      </h3>
      <p style={{ fontSize: 13, color: COLORS.textSoft, lineHeight: 1.6, maxWidth: 420, margin: "0 auto" }}>
        Silakan isi minimal 1 produk dengan target harian dan harga di sub-tab "Proyeksi Pendapatan & Biaya".
      </p>
    </div>
  );
}

// ----- Helpers -----
function formatRpCompact(v) {
  if (v == null || isNaN(v)) return "Rp 0";
  const a = Math.abs(v);
  let s;
  if (a >= 1e9) s = `${(v / 1e9).toFixed(2)} M`;
  else if (a >= 1e6) s = `${(v / 1e6).toFixed(1)} jt`;
  else if (a >= 1e3) s = `${(v / 1e3).toFixed(0)} rb`;
  else s = (v || 0).toFixed(0);
  return `Rp ${s}`;
}

const thStyle = {
  padding: "8px 10px",
  textAlign: "left",
  fontSize: 10,
  fontFamily: "monospace",
  color: COLORS.textMuted,
  letterSpacing: "0.1em",
  fontWeight: 700,
};
const thStyleRight = { ...thStyle, textAlign: "right" };
const tdStyle = {
  padding: "8px 10px",
  fontSize: 11.5,
  color: COLORS.text,
};
const tdStyleRight = { ...tdStyle, textAlign: "right", fontFamily: "monospace" };
