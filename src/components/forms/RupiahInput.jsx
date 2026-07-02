import { useState, useEffect } from "react";
import { COLORS } from "../primitives/styles.js";

// ============================================================================
// <RupiahInput /> — input mata uang Rupiah dengan auto-format ribuan
//
// User mengetik angka, sistem format dengan titik (1.000.000) saat tidak focus.
// Saat focus, tampilan kembali ke angka mentah untuk memudahkan edit.
//
// Props:
//   - value      : number (nilai aktual, bilangan murni)
//   - onChange   : (newValue: number) => void
//   - placeholder : string
//   - min, max   : batas opsional
//   - disabled
//   - style
//   - hint        : pesan rekomendasi (mis. "Rp 200.000 - 500.000")
// ============================================================================

export default function RupiahInput({
  value,
  onChange,
  placeholder = "0",
  min,
  max,
  disabled = false,
  style,
  hint,
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(value?.toString() || "");

  // Sinkron draft dengan value dari props bila berubah dari luar
  useEffect(() => {
    if (!focused) setDraft(value?.toString() || "");
  }, [value, focused]);

  const handleChange = (e) => {
    // Strip non-digit
    const cleaned = e.target.value.replace(/[^\d]/g, "");
    setDraft(cleaned);
    const n = cleaned === "" ? 0 : parseInt(cleaned, 10);
    if (Number.isNaN(n)) return;
    if (min != null && n < min) return;
    if (max != null && n > max) return;
    onChange?.(n);
  };

  const display = focused
    ? draft
    : value
      ? Number(value).toLocaleString("id-ID")
      : "";

  return (
    <div>
      <div style={{ position: "relative", ...style }}>
        <span
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: COLORS.textSoft,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "monospace",
            pointerEvents: "none",
            letterSpacing: "0.05em",
          }}
        >
          Rp
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={display}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: "100%",
            padding: "10px 12px 10px 36px",
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
            letterSpacing: "0.02em",
            opacity: disabled ? 0.5 : 1,
          }}
        />
      </div>
      {hint && (
        <div
          style={{
            fontSize: 10.5,
            color: COLORS.textMuted,
            marginTop: 4,
            fontStyle: "italic",
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
