import { COLORS } from "../primitives/styles.js";

// ============================================================================
// <Section /> — section divider untuk mengelompokkan field
//
// Dipakai di sub-tab yang punya banyak field — memisahkan section secara
// visual dengan icon, judul, dan deskripsi opsional.
// ============================================================================

export default function Section({ icon, title, desc, children, style }) {
  return (
    <section
      style={{
        marginBottom: 32,
        paddingBottom: 24,
        borderBottom: `1px dashed ${COLORS.border}`,
        ...style,
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          {icon && (
            <span
              style={{
                fontSize: 14,
                color: COLORS.accent,
                fontWeight: 700,
              }}
            >
              {icon}
            </span>
          )}
          <h3
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 700,
              color: COLORS.textHi,
              letterSpacing: "0.01em",
            }}
          >
            {title}
          </h3>
        </div>
        {desc && (
          <p
            style={{
              fontSize: 12,
              color: COLORS.textSoft,
              margin: 0,
              lineHeight: 1.55,
              maxWidth: 680,
            }}
          >
            {desc}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
