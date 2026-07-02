import { COLORS } from "./styles.js";

// ============================================================================
// <PageHeader /> — judul halaman besar + deskripsi opsional
// ============================================================================

export default function PageHeader({ title, desc, align = "left" }) {
  return (
    <div style={{ marginBottom: 32, textAlign: align }}>
      <h2
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: COLORS.textHi,
          margin: "0 0 10px",
          letterSpacing: "-0.5px",
          lineHeight: 1.2,
        }}
      >
        {title}
      </h2>
      {desc && (
        <p
          style={{
            fontSize: 14,
            color: COLORS.textSoft,
            margin: 0,
            lineHeight: 1.6,
            maxWidth: 720,
            marginLeft: align === "center" ? "auto" : 0,
            marginRight: align === "center" ? "auto" : 0,
          }}
        >
          {desc}
        </p>
      )}
    </div>
  );
}
