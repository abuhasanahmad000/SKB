import { COLORS } from "../primitives/styles.js";
import RupiahInput from "./RupiahInput.jsx";
import NumberInput from "./NumberInput.jsx";
import { BAB_6_3_POSISI_SDM, BAB_6_3_TUNJANGAN } from "../../data/babOptions.js";
import { formatRp } from "../../utils/format.js";

// ============================================================================
// <PersonnelTable /> — input SDM untuk Bab 6.3
//
// Layout: 3 posisi standar (Manager/Cashier/Produksi) sebagai checkbox.
// Setiap posisi yang dicentang membuka input jumlah + gaji.
// Tunjangan dipilih sekali untuk seluruh tim.
//
// Format value:
//   {
//     positions: {
//       manager:  { active: true, count: 1, salary: 3000000 },
//       cashier:  { active: true, count: 2, salary: 2000000 },
//       produksi: { active: false }
//     },
//     allowanceMode: "mikro" | "profesional" | "tidak"
//   }
//
// Props:
//   - value, onChange
// ============================================================================

export default function PersonnelTable({ value = {}, onChange }) {
  const positions = value.positions || {};
  const allowanceMode = value.allowanceMode || "tidak";

  const togglePosition = (id) => {
    const current = positions[id];
    const next = {
      ...positions,
      [id]: current?.active
        ? { ...current, active: false }
        : { active: true, count: current?.count || 1, salary: current?.salary || 0 },
    };
    onChange?.({ ...value, positions: next });
  };

  const updatePosition = (id, field, val) => {
    const next = {
      ...positions,
      [id]: { ...positions[id], active: true, [field]: val },
    };
    onChange?.({ ...value, positions: next });
  };

  const setAllowanceMode = (mode) => {
    onChange?.({ ...value, allowanceMode: mode });
  };

  // Hitung total
  const allowancePct =
    BAB_6_3_TUNJANGAN.find((t) => t.id === allowanceMode)?.value ?? 0;
  const totalBasePayroll = BAB_6_3_POSISI_SDM.reduce((sum, p) => {
    const data = positions[p.id];
    if (!data?.active) return sum;
    return sum + (data.count || 0) * (data.salary || 0);
  }, 0);
  const totalAllowance = totalBasePayroll * allowancePct;
  const totalPayroll = totalBasePayroll + totalAllowance;

  return (
    <div>
      {/* List posisi */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
        {BAB_6_3_POSISI_SDM.map((p) => {
          const data = positions[p.id];
          const active = data?.active;
          const subtotal = active ? (data.count || 0) * (data.salary || 0) : 0;
          return (
            <div
              key={p.id}
              style={{
                background: active ? COLORS.bgPanelHi : COLORS.bgPanelDeep,
                border: `1px solid ${active ? COLORS.borderHi : COLORS.border}`,
                borderRadius: 10,
                padding: 14,
              }}
            >
              {/* Toggle */}
              <button
                type="button"
                onClick={() => togglePosition(p.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  width: "100%",
                  textAlign: "left",
                  fontFamily: "inherit",
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    border: `2px solid ${active ? COLORS.accent : COLORS.borderHi}`,
                    background: active ? COLORS.accent : "transparent",
                    color: COLORS.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  {active ? "✓" : ""}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.textHi, flex: 1 }}>
                  {p.label}
                </span>
                {active && (
                  <span
                    style={{
                      fontSize: 11,
                      color: COLORS.successHi,
                      fontFamily: "monospace",
                      fontWeight: 700,
                    }}
                  >
                    {formatRp(subtotal)}/bln
                  </span>
                )}
              </button>

              {/* Detail input — tampil jika checked */}
              {active && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr",
                    gap: 10,
                    marginTop: 12,
                    paddingLeft: 28,
                  }}
                >
                  <div>
                    <Label>Jumlah orang</Label>
                    <NumberInput
                      value={data.count}
                      onChange={(v) => updatePosition(p.id, "count", v)}
                      min={1}
                      max={99}
                      suffix="orang"
                    />
                  </div>
                  <div>
                    <Label>Gaji bulanan per orang</Label>
                    <RupiahInput
                      value={data.salary}
                      onChange={(v) => updatePosition(p.id, "salary", v)}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tunjangan & pajak payroll */}
      <div
        style={{
          background: COLORS.bgPanelDeep,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 10,
          padding: 14,
          marginBottom: 14,
        }}
      >
        <Label>Tunjangan & Pajak Payroll</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
          {BAB_6_3_TUNJANGAN.map((t) => {
            const active = allowanceMode === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setAllowanceMode(t.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  background: active ? COLORS.bgPanelHi : "transparent",
                  border: `1px solid ${active ? COLORS.accent : COLORS.border}`,
                  borderRadius: 6,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 12,
                  color: COLORS.text,
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    border: `2px solid ${active ? COLORS.accent : COLORS.borderHi}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {active && (
                    <span
                      style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.accent }}
                    />
                  )}
                </span>
                <span style={{ flex: 1 }}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Total panel */}
      <div
        style={{
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
        <SumCell label="Gaji Pokok" value={formatRp(totalBasePayroll)} />
        <SumCell label={`Tunjangan (+${(allowancePct * 100).toFixed(0)}%)`} value={formatRp(totalAllowance)} />
        <SumCell label="Total Payroll/Bulan" value={formatRp(totalPayroll)} highlight />
      </div>
    </div>
  );
}

function Label({ children }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: 11,
        color: COLORS.textMid,
        fontWeight: 600,
        marginBottom: 4,
      }}
    >
      {children}
    </label>
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
