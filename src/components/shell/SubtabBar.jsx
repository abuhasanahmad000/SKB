import { useApp } from "../../state/AppContext.jsx";
import { getPathway } from "../../data/pathways.js";
import { COLORS } from "../primitives/styles.js";

// ============================================================================
// <SubtabBar /> — horizontal nav untuk sub-tab dalam tab aktif
//
// Sticky di top content area. Scrollable horizontal kalau sub-tab banyak.
// Setiap pill menampilkan label + badge (BARU / KRITIKAL).
// ============================================================================

export default function SubtabBar() {
  const { state, navigate } = useApp();
  const pathway = getPathway(state.app?.businessStage || "baru");
  if (!state.nav) return null;

  const activeTab = pathway.tabs.find((t) => t.id === state.nav.tabId);
  if (!activeTab) return null;

  const activeSubtabId = state.nav.subtabId;

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: COLORS.bg,
        borderBottom: `1px solid ${COLORS.border}`,
      }}
    >
      {/* Tab header — judul tab + deskripsi */}
      <div style={{ padding: "20px 28px 14px" }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: COLORS.textHi,
            marginBottom: activeTab.desc ? 4 : 0,
            letterSpacing: "-0.2px",
          }}
        >
          {activeTab.icon} {activeTab.label}
        </div>
        {activeTab.desc && (
          <div style={{ fontSize: 12.5, color: COLORS.textSoft, maxWidth: 720, lineHeight: 1.5 }}>
            {activeTab.desc}
          </div>
        )}
      </div>

      {/* Sub-tab pills */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "0 28px 14px",
          overflowX: "auto",
          scrollbarWidth: "thin",
        }}
      >
        {activeTab.subtabs.map((sub, idx) => {
          const active = activeSubtabId === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => navigate(activeTab.id, sub.id)}
              style={{
                flexShrink: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                background: active ? pathway.accentBg : COLORS.bgPanel,
                border: `1px solid ${active ? pathway.accent : COLORS.border}`,
                borderRadius: 8,
                cursor: "pointer",
                color: active ? pathway.accent : COLORS.textMid,
                fontFamily: "inherit",
                fontSize: 12,
                fontWeight: active ? 700 : 500,
                whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.borderColor = COLORS.borderHi;
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.borderColor = COLORS.border;
              }}
            >
              <span>{sub.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
