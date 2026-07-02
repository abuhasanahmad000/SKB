import { inpStyle } from "./styles.js";

// ============================================================================
// <Input /> — primitive input text/number/email/password
// Props:
//   - value, onChange, placeholder, type, autoFocus, disabled, style, ...rest
// ============================================================================

export default function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  autoFocus = false,
  style,
  ...rest
}) {
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      autoFocus={autoFocus}
      style={{ ...inpStyle, opacity: disabled ? 0.6 : 1, ...style }}
      {...rest}
    />
  );
}
