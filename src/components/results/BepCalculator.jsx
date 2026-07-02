import { useApp } from "../../state/AppContext.jsx";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  CartesianGrid,
} from "recharts";
import { computeFinancials } from "../../engines/financialEngine.js";
import { COLORS } from "../primitives/styles.js";
import { formatRp } from "../../utils/format.js";

// ============================================================================
// <BreakevenChart /> — visualisasi titik impas (BEP)
//
// Dipakai di sub-tab "bep" (Jalur A).
// Menunjukkan:
//   - Garis BEP minimum (omset/bulan supaya tidak rugi)
//   - Bar omset bulanan proyeksi (Year 1)
//   - Gap antara aktual vs BEP
// ============================================================================

export default function BreakevenChart() {
  const { state } = useApp();
  const provinceCode = state.forms?.identitas?.provinceCode || "";

  const fin = useMemo(() => {
    try {
      return computeFinancials(state.forms, provinceCode);
    } catch (e) {
      return null;
    }
  }, [state.forms, provinceCode]);

  // v13.1 FIX: dulu guard `!fin.bep.bepMonthlySales` membuat kalkulator
  // TIDAK PERNAH muncul ketika nilainya 0 (mis. biaya tetap belum diisi) —
  // 0 dianggap falsy. Sekarang hanya sembunyikan bila benar-benar tidak bisa
  // dihitung (null = margin kotor ≤ 0 atau data produk belum ada).
  const bepValue = fin?.bep?.bepMonthlySales;
  const hasProducts = (state.forms?.keuangan?.products || []).length > 0;
  if (!fin || !hasProducts || bepValue == null) {
    return <EmptyState hasProducts={hasProducts} marginNonPositive={!!fin && hasProducts && bepValue == null} />;
  }

  const bep = fin.bep.bepMonthlySales;
  const monthlyRevenueY1 = fin.projection[0].revenue / 12;
  const gap = monthlyRevenueY1 - bep;
  const aboveBep = gap > 0;
  const surplusPct = bep > 0 ? (gap / bep) * 100 : 0;

  // Data: comparison bar chart
  const data = [
    { name: "BEP Minimum", value: Math.round(bep), kind: "bep" },
    { name: "Omset Proyeksi", value: Math.round(monthlyRevenueY1), kind: "actual" },
  ];

  return (
    <>
      {/* Status summary */}
      <div
        style={{
          padding: 20,
          marginBottom: 20,
          background: aboveBep ? `${COLORS.success}11` : `${COLORS.danger}11`,
          border: `1px solid ${aboveBep ? COLORS.success : COLORS.danger}`,
          borderRadius: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.2em",
                color: aboveBep ? COLORS.successHi : COLORS.dangerHi,
                fontFamily: "monospace",
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              ◆ STATUS BREAK-EVEN POINT
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.textHi, marginBottom: 4 }}>
              {aboveBep
                ? `Omset proyeksi DI ATAS BEP — surplus ${surplusPct.toFixed(0)}%`
                : `Omset proyeksi MASIH DI BAWAH BEP — kekurangan ${Math.abs(surplusPct).toFixed(0)}%`}
            </div>
            <div style={{ fontSize: 12, color: COLORS.textSoft, lineHeight: 1.5 }}>
              {aboveBep
                ? "Setiap bulan ada margin laba bersih setelah biaya tetap tertutup."
                : "Perlu naikkan target jualan, naikkan harga, atau turunkan biaya tetap supaya tidak rugi."}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <KpiMini
          label="BEP Omset Bulanan"
          value={formatRp(bep)}
          sub="Minimum supaya tidak rugi"
          color={COLORS.danger}
        />
        <KpiMini
          label="Omset Proyeksi Bulanan (Y1)"
          value={formatRp(monthlyRevenueY1)}
          sub={`${aboveBep ? "Surplus" : "Selisih"} ${formatRp(Math.abs(gap))}`}
          color={aboveBep ? COLORS.success : COLORS.danger}
        />
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
          ◆ PERBANDINGAN OMSET BULANAN vs BEP
        </div>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 10, right: 20, left: 8, bottom: 0 }}>
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
              <ReferenceLine
                y={bep}
                stroke={COLORS.danger}
                strokeDasharray="4 4"
                label={{
                  value: "BEP",
                  position: "right",
                  fill: COLORS.danger,
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {data.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={entry.kind === "bep" ? COLORS.danger : aboveBep ? COLORS.success : COLORS.warn}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detail formula */}
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
        <strong style={{ color: COLORS.textHi }}>Cara baca:</strong> Bisnis Anda mencapai titik impas (Break-even Point) ketika berhasil menyentuh omset penjualan minimal{" "}
        <strong style={{ color: COLORS.dangerHi, fontFamily: "monospace" }}>{formatRp(bep)}/bulan</strong>{" "}
        atau setara{" "}
        <strong style={{ color: COLORS.dangerHi, fontFamily: "monospace" }}>{formatRp(fin.bep.bepDailySales)}/hari</strong>.
        Penjualan di atas angka tersebut akan dihitung sebagai keuntungan bersih.
      </div>
    </>
  );
}

function KpiMini({ label, value, sub, color }) {
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

function EmptyState({ hasProducts, marginNonPositive }) {
  return (
    <div style={{ padding: 32, background: COLORS.bgPanel, border: `2px dashed ${COLORS.border}`, borderRadius: 12, textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⚖️</div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.textHi, margin: "0 0 8px" }}>
        {marginNonPositive ? "Margin Kotor Masih ≤ 0 — BEP Tidak Terdefinisi" : "BEP Akan Dihitung Setelah Data Keuangan Terisi"}
      </h3>
      <p style={{ fontSize: 13, color: COLORS.textSoft, lineHeight: 1.6, maxWidth: 460, margin: "0 auto" }}>
        {marginNonPositive ? (
          <>HPP produk Anda sama atau lebih besar dari harga jual, sehingga titik impas tidak akan pernah tercapai. Turunkan persentase HPP atau naikkan harga jual di <strong>tab Keuangan ▸ Proyeksi Pendapatan & Biaya</strong>.</>
        ) : !hasProducts ? (
          <>Isi dulu <strong>daftar produk + target jual harian</strong> di <strong>tab Keuangan ▸ Proyeksi Pendapatan & Biaya</strong> — setelah itu kalkulator break-even otomatis muncul di sini.</>
        ) : (
          <>Lengkapi HPP per produk dan biaya operasional bulanan di <strong>tab Keuangan ▸ Proyeksi Pendapatan & Biaya</strong> supaya sistem bisa menghitung titik impas.</>
        )}
      </p>
    </div>
  );
}

function formatRpCompact(v) {
  if (v == null || isNaN(v)) return "Rp 0";
  const a = Math.abs(v);
  if (a >= 1e9) return `Rp ${(v / 1e9).toFixed(2)} M`;
  if (a >= 1e6) return `Rp ${(v / 1e6).toFixed(1)} jt`;
  if (a >= 1e3) return `Rp ${(v / 1e3).toFixed(0)} rb`;
  return `Rp ${(v || 0).toFixed(0)}`;
}
