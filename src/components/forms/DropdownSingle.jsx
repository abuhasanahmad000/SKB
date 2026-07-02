import { COLORS } from "../primitives/styles.js";

// ============================================================================
// <DropdownSingle /> — single-select dengan visual radio cards
//
// Berbeda dari <select> HTML — komponen ini menampilkan tiap opsi sebagai
// card yang bisa diklik, lebih ramah mobile dan accessible.
//
// Dipakai di:
//   - Bab 3.3 Status Kepemilikan Tempat   (4 opsi)
//   - Bab 5.1 Bentuk Hukum                 (5 opsi)
//   - Bab 5.1 Modal (Mandiri/Kemitraan)    (2 opsi)
//   - Bab 6.1 Pertumbuhan Tahunan         (3 opsi)
//   - Bab 6.2 HPP per Produk               (4 opsi)
//   - Bab 6.3 Tunjangan Payroll            (3 opsi)
//
// Props:
//   - options   : Array<{id, label, fragment?, value?}>
//   - value     : string (id terpilih)
//   - onChange  : (newId) => void
//   - compact   : tampilan lebih kecil (untuk dropdown HPP per produk, dll)
// ============================================================================

export default function DropdownSingle({
  options = [],
  value,
  onChange,
  compact = false,
  showFragment = false, // tampilkan fragment di bawah label
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 6 : 8 }}>
      {options.map((opt) => {
        const isSelected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange?.(opt.id)}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: compact ? 10 : 12,
              padding: compact ? "8px 12px" : "12px 14px",
              background: isSelected ? COLORS.bgPanelHi : COLORS.bgPanelDeep,
              border: `1px solid ${isSelected ? COLORS.accent : COLORS.border}`,
              borderRadius: 8,
              cursor: "pointer",
              textAlign: "left",
              fontFamily: "inherit",
              color: COLORS.text,
              fontSize: compact ? 12 : 12.5,
              lineHeight: 1.5,
              transition: "all 0.12s",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.borderColor = COLORS.borderHi;
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.borderColor = COLORS.border;
            }}
          >
            {/* Radio visual */}
            <span
              style={{
                flexShrink: 0,
                width: compact ? 14 : 18,
                height: compact ? 14 : 18,
                borderRadius: "50%",
                border: `2px solid ${isSelected ? COLORS.accent : COLORS.borderHi}`,
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: compact ? 1 : 2,
              }}
            >
              {isSelected && (
                <span
                  style={{
                    width: compact ? 6 : 8,
                    height: compact ? 6 : 8,
                    borderRadius: "50%",
                    background: COLORS.accent,
                  }}
                />
              )}
            </span>
            <span style={{ flex: 1 }}>
              <span>{opt.label}</span>
              {showFragment && opt.fragment && (
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    color: COLORS.textMuted,
                    marginTop: 4,
                    fontStyle: "italic",
                    lineHeight: 1.5,
                  }}
                >
                  → "{opt.fragment}"
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
