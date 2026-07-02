import { COLORS } from "../primitives/styles.js";

// ============================================================================
// <BpsDataBadge /> — Indikator status data BPS
//
// Menampilkan:
//   - Source: live (hijau), cache (biru), fallback (kuning)
//   - Timestamp data
//   - Tombol refresh manual (kalau ada handler)
//
// Dipakai di IdentitasForm di samping field sektor & provinsi.
// ============================================================================

const SOURCE_CONFIG = {
  live: {
    icon: "🟢",
    label: "Live dari BPS",
    color: COLORS.success,
    bg: `${COLORS.success}11`,
    border: COLORS.successBorder,
  },
  cache: {
    icon: "🔵",
    label: "Data BPS (Cache 24 jam)",
    color: COLORS.info,
    bg: COLORS.infoBg,
    border: COLORS.infoBorder,
  },
  fallback: {
    icon: "🟡",
    label: "Data BPS Q4 2024 (verified)",
    color: COLORS.warn,
    bg: COLORS.warnBg,
    border: COLORS.warnBorder,
  },
};

function formatAge(ms) {
  if (!ms) return "baru";
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec} detik lalu`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} menit lalu`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour} jam lalu`;
  return `${Math.floor(hour / 24)} hari lalu`;
}

export default function BpsDataBadge({ data, onRefresh, compact = false }) {
  if (!data) return null;
  const cfg = SOURCE_CONFIG[data.source] || SOURCE_CONFIG.fallback;
  const ageMs = data.refreshedAt ? Date.now() - data.refreshedAt : 0;

  if (compact) {
    return (
      <span
        title={`Data ${cfg.label} · diakses ${formatAge(ageMs)}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "1px 6px",
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          borderRadius: 3,
          fontSize: 9.5,
          color: cfg.color,
          fontFamily: "monospace",
          letterSpacing: "0.05em",
          fontWeight: 700,
        }}
      >
        <span style={{ fontSize: 8 }}>{cfg.icon}</span>
        BPS
      </span>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderLeft: `3px solid ${cfg.color}`,
        borderRadius: 5,
        fontSize: 10.5,
        marginTop: 4,
      }}
    >
      <span style={{ fontSize: 11 }}>{cfg.icon}</span>
      <span style={{ color: cfg.color, fontWeight: 700, fontFamily: "monospace" }}>
        {cfg.label}
      </span>
      <span style={{ color: COLORS.textMuted, marginLeft: "auto", fontFamily: "monospace" }}>
        {data.asOf} · {formatAge(ageMs)}
      </span>
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          title="Refresh data BPS"
          style={{
            padding: "2px 6px",
            background: "transparent",
            border: `1px solid ${cfg.border}`,
            borderRadius: 3,
            color: cfg.color,
            fontSize: 10,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          ↻
        </button>
      )}
    </div>
  );
}
