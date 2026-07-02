import { COLORS } from "../primitives/styles.js";

// ============================================================================
// <NumberInput /> — input integer dengan validasi min/max + suffix opsional
//
// Berbeda dari <RupiahInput /> yang khusus mata uang. Komponen ini untuk
// jumlah unit, hari operasional, target harian, dll.
//
// Props:
//   - value, onChange
//   - min, max
//   - suffix : satuan ditampilkan di kanan, mis. "orang", "unit", "hari"
//   - placeholder
//   - disabled
// ============================================================================

export default function NumberInput({
  value,
  onChange,
  min,
  max,
  suffix,
  placeholder = "0",
  disabled = false,
  style,
}) {
  const handleChange = (e) => {
    const cleaned = e.target.value.replace(/[^\d]/g, "");
    const n = cleaned === "" ? 0 : parseInt(cleaned, 10);
    if (Number.isNaN(n)) return;
    if (min != null && n < min) return;
    if (max != null && n > max) return;
    onChange?.(n);
  };

  return (
    <div style={{ position: "relative", ...style }}>
      <input
        type="text"
        inputMode="numeric"
        value={value || ""}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: "100%",
          padding: "10px 12px",
          paddingRight: suffix ? 60 : 12,
          background: COLORS.bgPanelDeep,
          border: `1px solid ${COLORS.borderMid}`,
          borderRadius: 6,
          color: COLORS.textHi,
          fontSize: 13,
          fontFamily: "monospace",
          fontWeight: 600,
          outline: "none",
          boxSizing: "border-box",
          textAlign: "right",
          opacity: disabled ? 0.5 : 1,
        }}
      />
      {suffix && (
        <span
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: COLORS.textMuted,
            fontSize: 11,
            fontStyle: "italic",
            pointerEvents: "none",
          }}
        >
          {suffix}
        </span>
      )}
    </div>
  );
}
