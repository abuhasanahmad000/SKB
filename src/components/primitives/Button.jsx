import { btnPrimary, btnSecondary, btnGhost, btnSuccess } from "./styles.js";

// ============================================================================
// <Button /> — primitive tombol
// Props:
//   - variant: "primary" (default) | "secondary" | "ghost" | "success"
//   - disabled: boolean
//   - children, onClick, style (override), ...rest
// ============================================================================

const VARIANTS = {
  primary: btnPrimary,
  secondary: btnSecondary,
  ghost: btnGhost,
  success: btnSuccess,
};

export default function Button({
  variant = "primary",
  disabled = false,
  children,
  onClick,
  style,
  type = "button",
  ...rest
}) {
  const base = VARIANTS[variant] || btnPrimary;
  const finalStyle = {
    ...base,
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
    ...style,
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick} style={finalStyle} {...rest}>
      {children}
    </button>
  );
}
