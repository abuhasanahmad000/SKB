import { useState } from "react";
import { COLORS } from "../primitives/styles.js";
import { useApp } from "../../state/AppContext.jsx";
import { canSuggest, buildBusinessContext } from "../../engines/suggestionHelper.js";

// ============================================================================
// <RuleBasedFillButton /> — tombol "Isi Otomatis dari Data Pasar"
//
// HOTFIX 6.2: Saat user sudah pilih sektor + skala + lokasi, klik tombol ini
// untuk auto-fill field dengan nilai realistis dari:
//   - DEFAULT_COSTS (port v4) untuk peralatan & opex
//   - UMP provinsi untuk gaji
//   - Skala factor untuk multiplier
//
// Berbeda dari AiAutofillButton:
//   - ✨ Rule-Based: gratis, instan, deterministic (dari data tabel)
//   - 🪄 AI: pakai kuota Gemini, lebih kontekstual untuk text
//
// Props:
//   - getSuggestion : (forms) => suggested value (object/array/number)
//   - onResult      : (value) => void
//   - label         : default "✨ Isi Otomatis dari Data Pasar"
//   - requireContext: kalau true, disable kalau canSuggest() false
// ============================================================================

export default function RuleBasedFillButton({
  getSuggestion,
  onResult,
  label = "✨ Isi Otomatis dari Data Pasar",
  requireContext = true,
  hint,
}) {
  const { state } = useApp();
  const [showInfo, setShowInfo] = useState(false);
  const ready = !requireContext || canSuggest(state.forms);

  const handleClick = () => {
    const value = getSuggestion(state.forms);
    if (value != null) {
      onResult?.(value);
      setShowInfo(true);
      setTimeout(() => setShowInfo(false), 3000);
    }
  };

  if (!ready) {
    const ctx = buildBusinessContext(state.forms);
    const missing = [];
    if (!state.forms?.identitas?.sectorCode) missing.push("Sektor Usaha");
    if (!state.forms?.identitas?.skalaBisnis) missing.push("Skala Bisnis");
    if (!state.forms?.identitas?.provinceCode) missing.push("Provinsi");

    return (
      <div
        style={{
          marginTop: 6,
          padding: "6px 10px",
          background: COLORS.bgPanelDeep,
          border: `1px dashed ${COLORS.border}`,
          borderRadius: 5,
          fontSize: 10.5,
          color: COLORS.textMuted,
          lineHeight: 1.45,
        }}
      >
        ⓘ <strong>Tip:</strong> Isi dulu {missing.join(", ")} di <em>Identitas Bisnis</em> agar sistem bisa suggest nilai realistis di sini.
      </div>
    );
  }

  return (
    <div style={{ marginTop: 6 }}>
      <button
        type="button"
        onClick={handleClick}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 12px",
          background: "transparent",
          border: `1px solid ${COLORS.successBorder}`,
          borderRadius: 5,
          color: COLORS.success,
          fontSize: 11.5,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `${COLORS.success}11`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        <span>✨</span>
        <span>{label}</span>
      </button>
      {hint && !showInfo && (
        <div
          style={{
            marginTop: 4,
            fontSize: 10.5,
            color: COLORS.textMuted,
            fontStyle: "italic",
          }}
        >
          {hint}
        </div>
      )}
      {showInfo && (
        <div
          style={{
            marginTop: 6,
            padding: "6px 10px",
            background: `${COLORS.success}11`,
            border: `1px solid ${COLORS.successBorder}`,
            borderRadius: 4,
            color: COLORS.successHi,
            fontSize: 10.5,
          }}
        >
          ✓ Terisi otomatis — silakan edit jika perlu disesuaikan dengan kondisi Anda.
        </div>
      )}
    </div>
  );
}
