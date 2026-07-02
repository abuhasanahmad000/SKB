import { COLORS } from "../primitives/styles.js";
import RupiahInput from "./RupiahInput.jsx";
import NumberInput from "./NumberInput.jsx";
import Button from "../primitives/Button.jsx";
import Input from "../primitives/Input.jsx";
import { formatRp } from "../../utils/format.js";

// ============================================================================
// <ProductTable /> — input multi-produk untuk Bab 6.1 (Revenue per produk)
//
// User input maks 5 produk dengan: nama, target harian, harga per unit.
// Sistem auto-calculate proyeksi pendapatan harian/bulanan/tahunan.
//
// Format value:
//   [
//     { name: "Baju/Kaos", dailyTarget: 5, price: 100000 },
//     { name: "Sepatu",    dailyTarget: 2, price: 250000 },
//   ]
//
// Props:
//   - value     : Array<{name, dailyTarget, price}>
//   - onChange  : (newArray) => void
//   - operatingDays : default 30 (untuk proyeksi bulanan)
//   - maxRows   : default 5
// ============================================================================

export default function ProductTable({
  value = [],
  onChange,
  operatingDays = 30,
  maxRows = 5,
}) {
  // Pastikan minimal 1 baris
  const rows = value.length > 0 ? value : [{ name: "", dailyTarget: 0, price: 0 }];

  const updateRow = (idx, field, val) => {
    const next = [...rows];
    next[idx] = { ...next[idx], [field]: val };
    onChange?.(next);
  };

  const addRow = () => {
    if (rows.length >= maxRows) return;
    onChange?.([...rows, { name: "", dailyTarget: 0, price: 0 }]);
  };

  const removeRow = (idx) => {
    if (rows.length === 1) return; // keep at least 1
    onChange?.(rows.filter((_, i) => i !== idx));
  };

  // Hitung total daily/monthly/yearly
  const totalDaily = rows.reduce((s, r) => s + (r.dailyTarget || 0) * (r.price || 0), 0);
  const totalMonthly = totalDaily * operatingDays;
  const totalYearly = totalMonthly * 12;

  return (
    <div>
      <div
        style={{
          background: COLORS.bgPanel,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1.5fr 1fr 1.2fr auto",
            gap: 0,
            padding: "10px 14px",
            background: COLORS.bgPanelDeep,
            borderBottom: `1px solid ${COLORS.border}`,
            fontSize: 10,
            color: COLORS.textMuted,
            fontFamily: "monospace",
            letterSpacing: "0.1em",
            fontWeight: 700,
          }}
        >
          <span style={{ width: 22 }}>#</span>
          <span style={{ paddingLeft: 8 }}>NAMA PRODUK/JASA</span>
          <span style={{ textAlign: "right", paddingRight: 8 }}>TARGET/HARI</span>
          <span style={{ textAlign: "right" }}>HARGA/UNIT</span>
          <span style={{ width: 28 }}></span>
        </div>

        {/* Rows */}
        {rows.map((row, idx) => (
          <div
            key={idx}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1.5fr 1fr 1.2fr auto",
              gap: 8,
              padding: "10px 14px",
              alignItems: "center",
              borderBottom: idx < rows.length - 1 ? `1px dashed ${COLORS.border}` : "none",
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: COLORS.bgPanelDeep,
                color: COLORS.textMuted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontFamily: "monospace",
                fontWeight: 700,
              }}
            >
              {idx + 1}
            </span>
            <Input
              value={row.name}
              onChange={(v) => updateRow(idx, "name", v)}
              placeholder={idx === 0 ? "cth. Baju/Kaos" : "Produk berikutnya..."}
              style={{ padding: "8px 10px", fontSize: 12 }}
            />
            <NumberInput
              value={row.dailyTarget}
              onChange={(v) => updateRow(idx, "dailyTarget", v)}
              min={0}
              max={9999}
              suffix="pcs"
            />
            <RupiahInput
              value={row.price}
              onChange={(v) => updateRow(idx, "price", v)}
              placeholder="0"
            />
            <button
              type="button"
              onClick={() => removeRow(idx)}
              disabled={rows.length === 1}
              aria-label="Hapus baris"
              style={{
                width: 28,
                height: 28,
                background: "transparent",
                border: "none",
                color: rows.length === 1 ? COLORS.textDim : COLORS.dangerHi,
                cursor: rows.length === 1 ? "not-allowed" : "pointer",
                fontSize: 14,
                fontWeight: 700,
                borderRadius: 4,
              }}
              title={rows.length === 1 ? "Minimal 1 produk" : "Hapus baris"}
            >
              ✕
            </button>
          </div>
        ))}

        {/* Add row */}
        {rows.length < maxRows && (
          <div style={{ padding: 10, borderTop: `1px dashed ${COLORS.border}` }}>
            <button
              type="button"
              onClick={addRow}
              style={{
                width: "100%",
                padding: "8px 14px",
                background: "transparent",
                border: `1px dashed ${COLORS.borderHi}`,
                borderRadius: 6,
                color: COLORS.textSoft,
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = COLORS.accent, e.currentTarget.style.color = COLORS.accent)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = COLORS.borderHi, e.currentTarget.style.color = COLORS.textSoft)}
            >
              + Tambah produk ({rows.length}/{maxRows})
            </button>
          </div>
        )}
      </div>

      {/* Summary panel */}
      <SummaryPanel totalDaily={totalDaily} totalMonthly={totalMonthly} totalYearly={totalYearly} operatingDays={operatingDays} />
    </div>
  );
}

function SummaryPanel({ totalDaily, totalMonthly, totalYearly, operatingDays }) {
  return (
    <div
      style={{
        marginTop: 12,
        padding: "12px 14px",
        background: COLORS.bgPanelDeep,
        border: `1px solid ${COLORS.successBorder}`,
        borderLeft: `3px solid ${COLORS.success}`,
        borderRadius: 6,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 16,
      }}
    >
      <SumCell label="Per Hari" value={formatRp(totalDaily)} />
      <SumCell label={`Per Bulan (${operatingDays} hari ops)`} value={formatRp(totalMonthly)} highlight />
      <SumCell label="Per Tahun (proyeksi)" value={formatRp(totalYearly)} />
    </div>
  );
}

function SumCell({ label, value, highlight }) {
  return (
    <div>
      <div
        style={{
          fontSize: 9.5,
          letterSpacing: "0.1em",
          color: COLORS.textMuted,
          fontFamily: "monospace",
          marginBottom: 4,
        }}
      >
        {label.toUpperCase()}
      </div>
      <div
        style={{
          fontSize: highlight ? 16 : 13,
          fontFamily: "monospace",
          fontWeight: 700,
          color: highlight ? COLORS.successHi : COLORS.textHi,
        }}
      >
        {value}
      </div>
    </div>
  );
}
