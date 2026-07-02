import { useMemo } from "react";
import { COLORS } from "../primitives/styles.js";
import { buildFragmentNarrative } from "../../data/babOptions.js";
import { useApp } from "../../state/AppContext.jsx";
import { applyProdukName } from "../../engines/growthHelper.js";

// ============================================================================
// <ChecklistMulti /> — multi-select checkbox dengan live preview narasi
//
// Komponen paling banyak dipakai di BizCast v5:
//   - Bab 2.1 Masalah Pelanggan       (5 opsi)
//   - Bab 2.2 Solusi Kami             (5 opsi)
//   - Bab 2.3 Jenis Pelanggan & Karakteristik
//   - Bab 2.4 Bentuk Kompetisi & Keunggulan
//   - Bab 3.1 Strategi Pemasaran       (5 opsi)
//   - Bab 3.2 Kanal Penjualan          (3 opsi)
//   - Bab 3.3 Karakteristik Lokasi    (4 opsi)
//   - Bab 3.4 Sistem Teknologi        (3 opsi)
//   - Bab 5.2 Struktur Organisasi      (4 opsi)
//   - Bab 5.3 Penasihat                (3 opsi)
//   - Bab 6.1 Metode Penjualan         (3 opsi)
//
// Props:
//   - options      : Array<{id, label, fragment?}>
//   - value        : Array<string> (ids yang dicentang)
//   - onChange     : (newIds[]) => void
//   - showPreview  : tampilkan preview narasi (default: true bila ada fragment)
//   - previewPrefix: kata pembuka preview, mis. "Identifikasi masalah: "
//   - max          : batas jumlah pilihan (opsional)
//   - layout       : "grid" | "list" (default: "list")
// ============================================================================

export default function ChecklistMulti({
  options = [],
  value = [],
  onChange,
  showPreview = true,
  previewPrefix = "",
  previewSuffix = "",
  max,
  layout = "list",
}) {
  const { state } = useApp();
  const produkUtama = state.forms?.identitas?.produkUtama;
  const selected = new Set(value);
  const hasFragment = options.some((o) => o.fragment);

  const toggle = (id) => {
    if (selected.has(id)) {
      onChange?.(value.filter((x) => x !== id));
    } else {
      if (max && value.length >= max) return; // capped
      onChange?.([...value, id]);
    }
  };

  // Live narrative preview — apply produkUtama replacement otomatis
  const preview = useMemo(() => {
    if (!showPreview || !hasFragment) return "";
    const raw = buildFragmentNarrative(options, value, {
      prefix: previewPrefix,
      suffix: previewSuffix,
    });
    return applyProdukName(raw, produkUtama);
  }, [options, value, showPreview, hasFragment, previewPrefix, previewSuffix, produkUtama]);

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: layout === "grid" ? "1fr 1fr" : "1fr",
          gap: 8,
        }}
      >
        {options.map((opt) => {
          const isSelected = selected.has(opt.id);
          const isDisabled = max && !isSelected && value.length >= max;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
              disabled={isDisabled}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "12px 14px",
                background: isSelected ? COLORS.bgPanelHi : COLORS.bgPanelDeep,
                border: `1px solid ${isSelected ? COLORS.accent : COLORS.border}`,
                borderRadius: 8,
                cursor: isDisabled ? "not-allowed" : "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                color: COLORS.text,
                fontSize: 12.5,
                lineHeight: 1.5,
                opacity: isDisabled ? 0.4 : 1,
                transition: "all 0.12s",
              }}
              onMouseEnter={(e) => {
                if (!isSelected && !isDisabled)
                  e.currentTarget.style.borderColor = COLORS.borderHi;
              }}
              onMouseLeave={(e) => {
                if (!isSelected && !isDisabled)
                  e.currentTarget.style.borderColor = COLORS.border;
              }}
            >
              {/* Checkbox visual */}
              <span
                style={{
                  flexShrink: 0,
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  border: `2px solid ${isSelected ? COLORS.accent : COLORS.borderHi}`,
                  background: isSelected ? COLORS.accent : "transparent",
                  color: COLORS.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 900,
                  marginTop: 1,
                }}
              >
                {isSelected ? "✓" : ""}
              </span>
              <span style={{ flex: 1 }}>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Limit info */}
      {max && (
        <div
          style={{
            marginTop: 8,
            fontSize: 10.5,
            color: COLORS.textMuted,
            fontFamily: "monospace",
            textAlign: "right",
          }}
        >
          {value.length} / {max} dipilih
        </div>
      )}

      {/* Live preview narasi */}
      {showPreview && hasFragment && value.length > 0 && (
        <div
          style={{
            marginTop: 14,
            padding: "12px 14px",
            background: COLORS.bgPanelDeep,
            border: `1px solid ${COLORS.successBorder}`,
            borderLeft: `3px solid ${COLORS.success}`,
            borderRadius: 6,
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.15em",
              color: COLORS.success,
              fontFamily: "monospace",
              marginBottom: 6,
              fontWeight: 700,
            }}
          >
            ◆ PREVIEW NARASI LAPORAN (RULE-BASED, TANPA AI)
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: COLORS.text,
              lineHeight: 1.65,
              fontStyle: "italic",
            }}
          >
            "{preview}"
          </div>
        </div>
      )}
    </div>
  );
}
