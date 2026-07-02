import { useApp } from "../../state/AppContext.jsx";
import { getPathway } from "../../data/pathways.js";
import { COLORS } from "../primitives/styles.js";

// ============================================================================
// <Sidebar /> — left vertical tab navigation
//
// Menampilkan 4 Tab Utama dari pathway aktif. Klik tab → navigate ke tab
// tersebut (otomatis ke sub-tab pertamanya, dilakukan oleh AppContext).
//
// Width tetap 260px untuk konsistensi visual.
// ============================================================================

const SIDEBAR_WIDTH = 260;

export default function Sidebar() {
  const { state, navigate } = useApp();
  const pathway = getPathway(state.app?.businessStage || "baru");
  if (!pathway || !state.nav) return null;

  const activeTabId = state.nav.tabId;

  return (
    <aside
      style={{
        width: SIDEBAR_WIDTH,
        minWidth: SIDEBAR_WIDTH,
        background: COLORS.bgPanelDeep,
        borderRight: `1px solid ${COLORS.border}`,
        padding: "20px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        overflowY: "auto",
      }}
    >
      {/* Section label */}
      <div
        style={{
          padding: "0 12px 8px",
          fontSize: 11,
          color: COLORS.textMuted,
          fontWeight: 600,
        }}
      >
        Menu Utama
      </div>

      {pathway.tabs.map((tab, idx) => {
        const active = activeTabId === tab.id;
        const subtabCount = tab.subtabs.length;
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.id)}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "12px 14px",
              background: active
                ? tab.highlight
                  ? pathway.accentBg
                  : COLORS.bgPanel
                : "transparent",
              border: `1px solid ${active ? (tab.highlight ? pathway.accent : COLORS.borderHi) : "transparent"}`,
              borderRadius: 10,
              cursor: "pointer",
              textAlign: "left",
              fontFamily: "inherit",
              color: COLORS.text,
              transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.background = COLORS.bgPanel;
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.background = "transparent";
            }}
          >
            <div
              style={{
                flexShrink: 0,
                width: 32,
                height: 32,
                borderRadius: 8,
                background: active
                  ? tab.highlight
                    ? pathway.accent
                    : COLORS.bgPanelDeep
                  : COLORS.bgPanelDeep,
                color: active
                  ? tab.highlight
                    ? COLORS.bg
                    : pathway.accent
                  : COLORS.textMid,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {tab.icon || idx + 1}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: active ? COLORS.textHi : COLORS.textMid,
                  lineHeight: 1.35,
                }}
              >
                {tab.label}
              </div>
              {tab.desc && (
                <div
                  style={{
                    fontSize: 10.5,
                    color: COLORS.textMuted,
                    marginTop: 3,
                    lineHeight: 1.4,
                  }}
                >
                  {tab.desc}
                </div>
              )}
            </div>
          </button>
        );
      })}

      {/* Footer note */}
      <div style={{ flex: 1 }} />
      <div
        style={{
          padding: "12px 14px",
          marginTop: 12,
          background: COLORS.bgPanel,
          border: `1px dashed ${COLORS.border}`,
          borderRadius: 8,
          fontSize: 10.5,
          color: COLORS.textMuted,
          lineHeight: 1.55,
        }}
      >
        💡 Klik tab untuk pindah area, lalu pilih sub-tab di bagian atas konten.
      </div>
    </aside>
  );
}
