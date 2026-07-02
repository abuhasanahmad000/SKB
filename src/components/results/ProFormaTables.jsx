import { useApp } from "../../state/AppContext.jsx";
import { useMemo, useState } from "react";
import { buildProForma } from "../../engines/proFormaBuilder.js";
import { COLORS } from "../primitives/styles.js";
import { formatRp } from "../../utils/format.js";

// ============================================================================
// <ProFormaTables /> — Tabel P&L + Cash Flow + Neraca (Jalur C)
//
// Tab di dalam komponen: P&L | Cash Flow | Neraca
// Sub-tab year: Tahun 1 | Tahun 2 | Tahun 3 (untuk P&L & CF)
// ============================================================================

export default function ProFormaTables() {
  const { state } = useApp();
  const provinceCode = state.forms?.identitas?.provinceCode || "";

  const pro = useMemo(() => {
    try {
      return buildProForma(state.forms, provinceCode);
    } catch (e) {
      return null;
    }
  }, [state.forms, provinceCode]);

  const [activeTab, setActiveTab] = useState("pnl");
  const [activeYear, setActiveYear] = useState(0); // index 0..2

  if (!pro) return <EmptyState />;

  const tabs = [
    { id: "pnl", label: "Laba Rugi (P&L)" },
    { id: "cf", label: "Arus Kas" },
    { id: "ns", label: "Neraca" },
  ];

  return (
    <>
      {/* Tab selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
        {tabs.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "10px 16px",
                background: "transparent",
                border: "none",
                borderBottom: `2px solid ${active ? COLORS.accent : "transparent"}`,
                cursor: "pointer",
                color: active ? COLORS.accent : COLORS.textMid,
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                fontFamily: "inherit",
                marginBottom: -1,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Year selector (untuk P&L dan CF) */}
      {activeTab !== "ns" && (
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {[0, 1, 2].map((y) => {
            const active = activeYear === y;
            return (
              <button
                key={y}
                onClick={() => setActiveYear(y)}
                style={{
                  padding: "5px 12px",
                  background: active ? COLORS.accent : COLORS.bgPanel,
                  border: `1px solid ${active ? COLORS.accent : COLORS.border}`,
                  borderRadius: 4,
                  cursor: "pointer",
                  color: active ? COLORS.bg : COLORS.textMid,
                  fontSize: 11,
                  fontFamily: "monospace",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                }}
              >
                TAHUN {y + 1}
              </button>
            );
          })}
        </div>
      )}

      {activeTab === "pnl" && <PnLTable data={pro.pnl[activeYear]} />}
      {activeTab === "cf" && <CashFlowTable data={pro.cashFlow[activeYear]} />}
      {activeTab === "ns" && <NeracaTable data={pro.balanceSheet} />}
    </>
  );
}

// ----- P&L Table per year (12 bulan) -----
function PnLTable({ data }) {
  const sumRow = (key) => data.months.reduce((s, m) => s + (m[key] || 0), 0);
  return (
    <div style={tableWrapperStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStickyStyle}>Komponen</th>
            {data.months.map((m, i) => (
              <th key={i} style={thStyle}>{m.month}</th>
            ))}
            <th style={thTotalStyle}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          <Row label="Penjualan" months={data.months} field="revenue" bold />
          <Row label="(-) HPP" months={data.months} field="hpp" muted />
          <Row label="Laba Kotor" months={data.months} field="grossProfit" highlight />
          <Row label="(-) Gaji" months={data.months} field="personnel" muted />
          <Row label="(-) Opex" months={data.months} field="opex" muted />
          <Row label="(-) Penyusutan" months={data.months} field="depreciation" muted />
          <Row label="Laba Operasi" months={data.months} field="ebit" bold />
          <Row label="(-) Pajak" months={data.months} field="tax" muted />
          <Row label="LABA BERSIH" months={data.months} field="netIncome" highlight bold />
        </tbody>
      </table>
    </div>
  );
}

// ----- Cash Flow per year -----
function CashFlowTable({ data }) {
  return (
    <div style={tableWrapperStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStickyStyle}>Komponen</th>
            {data.months.map((m, i) => (
              <th key={i} style={thStyle}>{m.month}</th>
            ))}
            <th style={thTotalStyle}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          <Row label="Arus Kas Operasi" months={data.months} field="operating" bold />
          <Row label="Arus Kas Investasi" months={data.months} field="investing" muted />
          <Row label="Arus Kas Pendanaan" months={data.months} field="financing" muted />
          <Row label="Arus Kas Bersih" months={data.months} field="netCash" highlight bold />
          <Row label="SALDO KAS AKHIR" months={data.months} field="cashBalance" highlight bold noTotal />
        </tbody>
      </table>
    </div>
  );
}

// ----- Neraca (Balance Sheet) per posisi -----
function NeracaTable({ data }) {
  return (
    <div style={{ ...tableWrapperStyle, overflowX: "auto" }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStickyStyle}>Akun</th>
            {data.map((d, i) => (
              <th key={i} style={thStyle}>{d.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <SectionHeaderRow label="ASET" cols={data.length} />
          <BSRow label="Kas" data={data} accessor={(d) => d.assets.cash} />
          <BSRow label="Persediaan" data={data} accessor={(d) => d.assets.inventory} />
          <BSRow label="Peralatan (gross)" data={data} accessor={(d) => d.assets.equipmentGross} muted />
          <BSRow label="(-) Akumulasi Penyusutan" data={data} accessor={(d) => -d.assets.accumulatedDep} muted />
          <BSRow label="Peralatan (net)" data={data} accessor={(d) => d.assets.equipmentNet} />
          <BSRow label="TOTAL ASET" data={data} accessor={(d) => d.assets.totalAssets} bold highlight />

          <SectionHeaderRow label="KEWAJIBAN & EKUITAS" cols={data.length} />
          <BSRow label="Pinjaman" data={data} accessor={(d) => d.liabilities.loans} />
          <BSRow label="Modal Pribadi/Mitra" data={data} accessor={(d) => d.equity.paidInCapital} />
          <BSRow label="Saldo Laba Kumulatif" data={data} accessor={(d) => d.equity.retainedEarnings} />
          <BSRow label="TOTAL KEWAJIBAN + EKUITAS" data={data} accessor={(d) => d.totalLiabEquity} bold highlight />
        </tbody>
      </table>
    </div>
  );
}

// ----- Row Helpers -----

function Row({ label, months, field, bold, muted, highlight, noTotal }) {
  const sum = months.reduce((s, m) => s + (m[field] || 0), 0);
  return (
    <tr style={{ background: highlight ? COLORS.bgPanelDeep : "transparent" }}>
      <td style={{ ...tdLabelStyle, fontWeight: bold ? 700 : 400, color: muted ? COLORS.textMuted : COLORS.textHi }}>{label}</td>
      {months.map((m, i) => (
        <td key={i} style={{ ...tdValueStyle, color: muted ? COLORS.textMuted : COLORS.text, fontWeight: bold ? 700 : 400 }}>
          {formatRpCompact(m[field])}
        </td>
      ))}
      <td style={{ ...tdTotalStyle, fontWeight: 800, color: highlight ? COLORS.successHi : COLORS.textHi }}>
        {noTotal ? "—" : formatRpCompact(sum)}
      </td>
    </tr>
  );
}

function BSRow({ label, data, accessor, bold, muted, highlight }) {
  return (
    <tr style={{ background: highlight ? COLORS.bgPanelDeep : "transparent" }}>
      <td style={{ ...tdLabelStyle, fontWeight: bold ? 700 : 400, color: muted ? COLORS.textMuted : COLORS.textHi }}>{label}</td>
      {data.map((d, i) => (
        <td key={i} style={{ ...tdValueStyle, color: muted ? COLORS.textMuted : COLORS.text, fontWeight: bold ? 700 : 400 }}>
          {formatRpCompact(accessor(d))}
        </td>
      ))}
    </tr>
  );
}

function SectionHeaderRow({ label, cols }) {
  return (
    <tr>
      <td colSpan={cols + 1} style={{
        padding: "10px 8px",
        background: COLORS.accentBg,
        color: COLORS.accent,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.15em",
        fontFamily: "monospace",
        borderTop: `2px solid ${COLORS.accent}`,
      }}>
        ◆ {label}
      </td>
    </tr>
  );
}

// ----- Empty state -----
function EmptyState() {
  return (
    <div style={{ padding: 32, background: COLORS.bgPanel, border: `2px dashed ${COLORS.border}`, borderRadius: 12, textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.textHi, margin: "0 0 8px" }}>
        Pro Forma Akan Tampil Setelah Data Keuangan Lengkap
      </h3>
      <p style={{ fontSize: 13, color: COLORS.textSoft, lineHeight: 1.6, maxWidth: 420, margin: "0 auto" }}>
        Lengkapi: produk, peralatan, SDM, opex, dan sumber dana untuk lihat P&L, Arus Kas, dan Neraca.
      </p>
    </div>
  );
}

// ----- Styles & format helpers -----

const tableWrapperStyle = {
  background: COLORS.bgPanel,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 10,
  overflowX: "auto",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 10.5,
  minWidth: 800,
};

const thStyle = {
  padding: "8px 6px",
  textAlign: "right",
  fontSize: 9.5,
  fontFamily: "monospace",
  color: COLORS.textMuted,
  letterSpacing: "0.08em",
  fontWeight: 700,
  background: COLORS.bgPanelDeep,
  borderBottom: `1px solid ${COLORS.border}`,
};
const thStickyStyle = {
  ...thStyle,
  textAlign: "left",
  position: "sticky",
  left: 0,
  background: COLORS.bgPanelDeep,
  zIndex: 1,
  padding: "8px 12px",
  minWidth: 160,
};
const thTotalStyle = {
  ...thStyle,
  background: COLORS.accentBg,
  color: COLORS.accent,
};

const tdLabelStyle = {
  padding: "7px 12px",
  position: "sticky",
  left: 0,
  background: COLORS.bgPanel,
  zIndex: 1,
  fontSize: 11.5,
  borderBottom: `1px solid ${COLORS.border}`,
};

const tdValueStyle = {
  padding: "7px 6px",
  textAlign: "right",
  fontFamily: "monospace",
  fontSize: 10,
  borderBottom: `1px solid ${COLORS.border}`,
};

const tdTotalStyle = {
  ...tdValueStyle,
  background: COLORS.bgPanelDeep,
  borderLeft: `2px solid ${COLORS.accent}`,
  fontSize: 11,
};

function formatRpCompact(v) {
  if (v == null || isNaN(v) || v === 0) return "—";
  const a = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (a >= 1e9) return `${sign}${(a / 1e9).toFixed(1)}M`;
  if (a >= 1e6) return `${sign}${(a / 1e6).toFixed(1)}jt`;
  if (a >= 1e3) return `${sign}${(a / 1e3).toFixed(0)}rb`;
  return `${sign}${a.toFixed(0)}`;
}
