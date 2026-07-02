import { COLORS } from "../primitives/styles.js";

// ============================================================================
// <NativeSelect /> — dropdown HTML native dengan styling konsisten
//
// Berbeda dari <DropdownSingle /> (radio cards), komponen ini compact:
// hanya satu baris yang ketika diklik membuka pilihan.
//
// Cocok untuk daftar panjang seperti 38 provinsi atau kota-kota dalam
// provinsi, di mana radio cards akan terlalu memakan ruang vertikal.
//
// Props:
//   - value, onChange
//   - options : Array<{value, label}>
//   - placeholder : opsional, default "Pilih..."
//   - disabled
// ============================================================================

export default function NativeSelect({
  value,
  onChange,
  options = [],
  placeholder = "Pilih...",
  disabled = false,
  style,
}) {
  return (
    <div style={{ position: "relative", ...style }}>
      <select
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        style={{
          width: "100%",
          padding: "10px 36px 10px 12px",
          background: COLORS.bgPanelDeep,
          border: `1px solid ${COLORS.borderMid}`,
          borderRadius: 6,
          color: value ? COLORS.text : COLORS.textMuted,
          fontSize: 12.5,
          fontFamily: "inherit",
          outline: "none",
          boxSizing: "border-box",
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <option value="" style={{ color: COLORS.textMuted, background: COLORS.bgPanelDeep }}>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            style={{ background: COLORS.bgPanelDeep, color: COLORS.text }}
          >
            {opt.label}
          </option>
        ))}
      </select>

      {/* Caret kustom (karena native select susah di-style) */}
      <div
        style={{
          position: "absolute",
          right: 12,
          top: "50%",
          transform: "translateY(-50%)",
          color: COLORS.textMuted,
          fontSize: 9,
          pointerEvents: "none",
        }}
      >
        ▾
      </div>
    </div>
  );
}
