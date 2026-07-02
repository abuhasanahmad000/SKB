import { COLORS } from "./styles.js";

// ============================================================================
// <Panel /> — kontainer dengan border & padding standar
// Props:
//   - title, subtitle (opsional)
//   - children
//   - style (override)
// ============================================================================

export default function Panel({ title, subtitle, children, style }) {
  return (
    <div
      style={{
        background: COLORS.bgPanel,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: 20,
        ...style,
      }}
    >
      {title && (
        <div style={{ marginBottom: subtitle ? 4 : 14 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 700,
              color: COLORS.textHi,
              letterSpacing: "0.02em",
            }}
          >
            {title}
          </h3>
        </div>
      )}
      {subtitle && (
        <div style={{ fontSize: 11.5, color: COLORS.textSoft, marginBottom: 14, lineHeight: 1.5 }}>
          {subtitle}
        </div>
      )}
      {children}
    </div>
  );
}
