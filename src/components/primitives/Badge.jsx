import { pillStyle } from "./styles.js";

// ============================================================================
// <Badge /> — pill kecil untuk status/label
// Props:
//   - kind: "info" (default) | "success" | "warn" | "danger"
//   - children
// ============================================================================

export default function Badge({ kind = "info", children, style }) {
  return <span style={{ ...pillStyle(kind), ...style }}>{children}</span>;
}
