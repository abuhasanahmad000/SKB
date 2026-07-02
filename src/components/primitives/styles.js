// ============================================================================
// SHARED INLINE STYLES & DESIGN TOKENS
// Dipertahankan model inline-style ala prototype lama agar tidak ada
// dependency CSS framework. Token warna di-extract sebagai konstanta agar
// mudah dirawat.
// ============================================================================

// ----- COLOR PALETTE (dark theme) -----
export const COLORS = {
  // Background
  bg: "#0A0E1A",
  bgPanel: "#0D1120",
  bgPanelDeep: "#070A14",
  bgPanelHi: "#141B2D",

  // Text
  textHi: "#F1F5F9",
  text: "#E2E8F0",
  textMid: "#CBD5E1",
  textSoft: "#94A3B8",
  textMuted: "#64748B",
  textDim: "#475569",

  // Borders
  border: "#1A1F30",
  borderMid: "#1E2640",
  borderHi: "#2D3656",

  // Accent
  accent: "#FB923C", // orange — primary CTA
  accentDeep: "#451A03",
  accentBg: "#2A1408",

  // Status
  success: "#22C55E",
  successHi: "#A3E635",
  successBg: "#021810",
  successBorder: "#064E3B",

  info: "#7DD3FC",
  infoBg: "#0D1828",
  infoBorder: "#1E3A5F",

  warn: "#F59E0B",
  warnHi: "#FCD34D",
  warnBg: "#1C1203",
  warnBorder: "#451A03",

  danger: "#EF4444",
  dangerHi: "#FCA5A5",
  dangerBg: "#1C0505",
  dangerBorder: "#451818",
};

// ----- INPUT STYLE (port dari prototype lama line 2809) -----
export const inpStyle = {
  width: "100%",
  padding: "10px 12px",
  background: COLORS.bgPanelDeep,
  border: `1px solid ${COLORS.borderMid}`,
  borderRadius: 6,
  color: COLORS.text,
  fontSize: 12.5,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

// ----- BUTTON STYLES -----
export const btnPrimary = {
  padding: "12px 24px",
  background: COLORS.accentBg,
  color: COLORS.accent,
  border: `1px solid ${COLORS.accent}`,
  borderRadius: 8,
  fontSize: 13.5,
  fontWeight: 700,
  cursor: "pointer",
  letterSpacing: "0.02em",
  transition: "background 0.15s",
};

export const btnSecondary = {
  padding: "10px 18px",
  background: COLORS.bgPanelHi,
  color: COLORS.info,
  border: `1px solid ${COLORS.infoBorder}`,
  borderRadius: 6,
  fontSize: 12.5,
  cursor: "pointer",
  fontWeight: 600,
};

export const btnGhost = {
  padding: "10px 18px",
  background: "transparent",
  color: COLORS.textSoft,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 6,
  fontSize: 12.5,
  cursor: "pointer",
  fontWeight: 600,
};

export const btnSuccess = {
  padding: "10px 18px",
  background: "#1E3A2F",
  color: COLORS.successHi,
  border: `1px solid ${COLORS.successBorder}`,
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

// ----- STATUS PILL -----
export const pillStyle = (kind = "info") => {
  const map = {
    success: { bg: COLORS.successBg, color: COLORS.successHi, border: COLORS.successBorder },
    info: { bg: COLORS.infoBg, color: COLORS.info, border: COLORS.infoBorder },
    warn: { bg: COLORS.warnBg, color: COLORS.warnHi, border: COLORS.warnBorder },
    danger: { bg: COLORS.dangerBg, color: COLORS.dangerHi, border: COLORS.dangerBorder },
  };
  const c = map[kind] || map.info;
  return {
    display: "inline-block",
    padding: "4px 10px",
    background: c.bg,
    color: c.color,
    border: `1px solid ${c.border}`,
    borderRadius: 4,
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: "0.05em",
  };
};
