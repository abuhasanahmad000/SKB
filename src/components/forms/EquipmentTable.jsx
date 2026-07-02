import { COLORS } from "../primitives/styles.js";
import RupiahInput from "./RupiahInput.jsx";
import NumberInput from "./NumberInput.jsx";
import Input from "../primitives/Input.jsx";
import { formatRp } from "../../utils/format.js";

// ============================================================================
// <EquipmentTable /> — tabel peralatan utama untuk Bab 3.4
//
// Format value:
//   [
//     { name: "Etalase Toko", qty: 2, pricePerUnit: 1500000 },
//     { name: "Mesin Kasir POS", qty: 1, pricePerUnit: 3500000 },
//   ]
//
// Sistem auto-calculate total nilai per baris (qty × pricePerUnit) dan
// grand total — yang nantinya jadi input ke Bab 7.2 (Start-up Assets).
//
// Penyusutan dihitung otomatis di Bab 6 Tahap 4 (sistem) — tidak di sini.
// ============================================================================

const MAX_ROWS = 10;

export default function EquipmentTable({ value = [], onChange }) {
  const rows = value.length > 0 ? value : [{ name: "", qty: 0, pricePerUnit: 0 }];

  const updateRow = (idx, field, v) => {
    const next = [...rows];
    next[idx] = { ...next[idx], [field]: v };
    onChange?.(next);
  };

  const addRow = () => {
    if (rows.length >= MAX_ROWS) return;
    onChange?.([...rows, { name: "", qty: 0, pricePerUnit: 0 }]);
  };

  const removeRow = (idx) => {
    if (rows.length === 1) return;
    onChange?.(rows.filter((_, i) => i !== idx));
  };

  const grandTotal = rows.reduce(
    (s, r) => s + (r.qty || 0) * (r.pricePerUnit || 0),
    0
  );

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
            gridTemplateColumns: "auto 2fr 0.8fr 1.2fr 1fr auto",
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
          <span style={{ paddingLeft: 8 }}>NAMA PERALATAN</span>
          <span style={{ textAlign: "right" }}>JUMLAH</span>
          <span style={{ textAlign: "right" }}>HARGA/UNIT</span>
          <span style={{ textAlign: "right", paddingRight: 8 }}>SUBTOTAL</span>
          <span style={{ width: 28 }}></span>
        </div>

        {/* Rows */}
        {rows.map((row, idx) => {
          const subtotal = (row.qty || 0) * (row.pricePerUnit || 0);
          return (
            <div
              key={idx}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 2fr 0.8fr 1.2fr 1fr auto",
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
                placeholder={idx === 0 ? "cth. Etalase Toko" : "Peralatan lain..."}
                style={{ padding: "8px 10px", fontSize: 12 }}
              />
              <NumberInput
                value={row.qty}
                onChange={(v) => updateRow(idx, "qty", v)}
                min={0}
                max={999}
                suffix="unit"
              />
              <RupiahInput
                value={row.pricePerUnit}
                onChange={(v) => updateRow(idx, "pricePerUnit", v)}
              />
              <div
                style={{
                  textAlign: "right",
                  paddingRight: 8,
                  fontSize: 12,
                  fontFamily: "monospace",
                  fontWeight: 600,
                  color: subtotal > 0 ? COLORS.successHi : COLORS.textDim,
                }}
              >
                {formatRp(subtotal)}
              </div>
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
              >
                ✕
              </button>
            </div>
          );
        })}

        {/* Add row */}
        {rows.length < MAX_ROWS && (
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
            >
              + Tambah peralatan ({rows.length}/{MAX_ROWS})
            </button>
          </div>
        )}

        {/* Total footer */}
        <div
          style={{
            padding: "12px 14px",
            background: COLORS.bgPanelDeep,
            borderTop: `2px solid ${COLORS.success}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: COLORS.textMuted,
              fontFamily: "monospace",
              letterSpacing: "0.1em",
              fontWeight: 700,
            }}
          >
            TOTAL NILAI PERALATAN (→ Bab 7.2 Modal Aset)
          </span>
          <span
            style={{
              fontSize: 16,
              fontFamily: "monospace",
              fontWeight: 800,
              color: COLORS.successHi,
            }}
          >
            {formatRp(grandTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
