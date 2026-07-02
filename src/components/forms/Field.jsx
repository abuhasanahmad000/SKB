import { COLORS } from "../primitives/styles.js";

// ============================================================================
// <Field /> — wrapper standar untuk satu kolom input form
//
// Memberi konsistensi visual: label di atas, input di tengah, helper di bawah.
// Mendukung state: error (merah), success (hijau), required (asterisk).
//
// Props:
//   - label       : string (label utama, ditampilkan tebal di atas)
//   - required    : tampilkan asterisk merah
//   - hint        : helper text di atas input (penjelasan singkat)
//   - error       : pesan error (warna merah, di bawah input)
//   - success     : pesan sukses (warna hijau)
//   - helper      : helper text netral (di bawah input)
//   - children    : input/komponen apapun
// ============================================================================

export default function Field({
  label,
  required,
  hint,
  error,
  success,
  helper,
  children,
  style,
}) {
  return (
    <div style={{ marginBottom: 20, ...style }}>
      {label && (
        <div style={{ marginBottom: hint ? 4 : 8 }}>
          <label
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: COLORS.textHi,
              letterSpacing: "0.01em",
            }}
          >
            {label}
            {required && (
              <span style={{ color: COLORS.dangerHi, marginLeft: 4 }}>*</span>
            )}
          </label>
        </div>
      )}
      {hint && (
        <div
          style={{
            fontSize: 11.5,
            color: COLORS.textSoft,
            marginBottom: 8,
            lineHeight: 1.5,
          }}
        >
          {hint}
        </div>
      )}
      {children}
      {error && <HelperLine kind="error">{error}</HelperLine>}
      {success && <HelperLine kind="success">{success}</HelperLine>}
      {helper && !error && !success && <HelperLine kind="neutral">{helper}</HelperLine>}
    </div>
  );
}

function HelperLine({ kind, children }) {
  const color =
    kind === "error" ? COLORS.dangerHi : kind === "success" ? COLORS.successHi : COLORS.textMuted;
  const icon = kind === "error" ? "⚠ " : kind === "success" ? "✓ " : "";
  return (
    <div style={{ fontSize: 11, color, marginTop: 6, lineHeight: 1.5 }}>
      {icon}
      {children}
    </div>
  );
}
