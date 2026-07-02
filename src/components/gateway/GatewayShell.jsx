import { COLORS } from "../primitives/styles.js";

// ============================================================================
// <GatewayShell /> — layout bersama untuk 3 step gateway
// Menjaga konsistensi visual: background radial, card terpusat, progress dots
//
// Props:
//   - step: 0 | 1 | 2 (untuk highlight di progress dots)
//   - children: konten card
//   - maxWidth: width card (default 460)
//   - footer: konten tambahan setelah card (opsional)
// ============================================================================

export default function GatewayShell({ step, children, maxWidth = 460, footer }) {
  return (
    <div style={pageStyle}>
      <div style={{ ...cardStyle, maxWidth }}>{children}</div>
      <ProgressDots active={step} />
      {footer}
    </div>
  );
}

// ----- Progress dots: indikator 3 langkah gateway -----
function ProgressDots({ active }) {
  const dots = ["Login", "API Key"];
  return (
    <div style={{ display: "flex", gap: 12, marginTop: 28, alignItems: "center" }}>
      {dots.map((label, i) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background:
                  i === active ? COLORS.accent : i < active ? COLORS.successHi : COLORS.borderHi,
                boxShadow: i === active ? `0 0 0 4px ${COLORS.accentBg}` : "none",
                transition: "all 0.2s",
              }}
            />
            <div
              style={{
                fontSize: 9,
                color: i === active ? COLORS.accent : i < active ? COLORS.successHi : COLORS.textMuted,
                fontFamily: "monospace",
                letterSpacing: "0.05em",
              }}
            >
              {label.toUpperCase()}
            </div>
          </div>
          {i < dots.length - 1 && (
            <div
              style={{
                width: 30,
                height: 1,
                background: i < active ? COLORS.successHi : COLORS.border,
                marginBottom: 14,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px 20px",
  background: "radial-gradient(ellipse at top, #0F1424 0%, #0A0E1A 70%)",
};

const cardStyle = {
  width: "100%",
  background: COLORS.bgPanel,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 16,
  padding: "44px 40px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
};
