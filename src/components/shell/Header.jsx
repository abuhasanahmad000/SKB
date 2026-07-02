import { useState } from "react";
import { useApp } from "../../state/AppContext.jsx";
import { getPathway } from "../../data/pathways.js";
import { COLORS } from "../primitives/styles.js";
import Button from "../primitives/Button.jsx";

// ============================================================================
// <Header /> — top bar untuk AppShell
//
// Berisi:
//   - Logo BizCast (kiri)
//   - Badge Jalur aktif (tengah)
//   - User pill + dropdown menu (kanan)
//   - Icon ⚙ Setting (membuka modal sederhana untuk ganti API key / reset)
// ============================================================================

export default function Header() {
  const { state, resetGateway } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathway = getPathway(state.app?.businessStage || "baru");
  const user = state.gateway.user;

  return (
    <header
      style={{
        height: 56,
        padding: "0 24px",
        background: COLORS.bgPanelDeep,
        borderBottom: `1px solid ${COLORS.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      {/* ----- LEFT: Logo + Pathway Badge ----- */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div>
          <div
            style={{
              fontSize: 9,
              letterSpacing: "0.25em",
              color: COLORS.textDim,
              fontFamily: "monospace",
              lineHeight: 1,
            }}
          >
            STUDI KELAYAKAN BISNIS
          </div>
          <div
            style={{
              fontSize: 19,
              fontWeight: 900,
              color: COLORS.accent,
              letterSpacing: "-0.5px",
              lineHeight: 1.1,
            }}
          >
            BizCast
          </div>
        </div>

        {pathway && (
          <>
            <div style={{ width: 1, height: 28, background: COLORS.border }} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 12px",
                background: pathway.accentBg,
                border: `1px solid ${pathway.accentBorder}`,
                borderRadius: 6,
              }}
            >
              <span style={{ fontSize: 14, color: pathway.accent }}>{pathway.icon}</span>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: pathway.accent,
                  letterSpacing: "0.1em",
                  fontWeight: 700,
                }}
              >
                PENCARI DANA
              </span>
              <span style={{ color: COLORS.textMuted, fontSize: 11 }}>·</span>
              <span style={{ fontSize: 11.5, color: COLORS.textMid }}>{pathway.name}</span>
            </div>
          </>
        )}
      </div>

      {/* ----- RIGHT: User + Settings ----- */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
        {/* User pill */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 12px 6px 6px",
            background: COLORS.bgPanel,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 20,
            cursor: "pointer",
            fontFamily: "inherit",
            color: COLORS.text,
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: COLORS.accentBg,
              color: COLORS.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            {(user?.name || "?").trim()[0].toUpperCase()}
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>{user?.name || "Pengguna"}</span>
          <span style={{ fontSize: 9, color: COLORS.textMuted }}>▾</span>
        </button>

        {/* Settings icon */}
        <button
          onClick={() => alert("Setting (ganti API key, ganti jalur, dll) — placeholder Tahap 3.\n\nUntuk sementara, gunakan tombol 'Reset Sesi' di menu user pojok kanan atas untuk kembali ke gateway.")}
          aria-label="Pengaturan"
          style={{
            width: 36,
            height: 36,
            background: COLORS.bgPanel,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 8,
            cursor: "pointer",
            color: COLORS.textSoft,
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ⚙
        </button>

        {/* Dropdown menu */}
        {menuOpen && (
          <>
            <div
              onClick={() => setMenuOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 40 }}
            />
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                minWidth: 220,
                background: COLORS.bgPanel,
                border: `1px solid ${COLORS.borderHi}`,
                borderRadius: 10,
                padding: 8,
                zIndex: 50,
                boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
              }}
            >
              <div style={{ padding: "8px 12px", fontSize: 11, color: COLORS.textMuted, fontFamily: "monospace", letterSpacing: "0.1em" }}>
                {user?.email}
              </div>
              <div style={{ height: 1, background: COLORS.border, margin: "4px 0" }} />
              <MenuItem onClick={() => { setMenuOpen(false); resetGateway(); }}>
                ↺ Reset Sesi (kembali ke Login)
              </MenuItem>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

function MenuItem({ children, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "10px 12px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        color: danger ? COLORS.dangerHi : COLORS.text,
        fontSize: 12.5,
        borderRadius: 6,
        fontFamily: "inherit",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.bgPanelDeep)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </button>
  );
}
