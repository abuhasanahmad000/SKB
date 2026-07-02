import { useState } from "react";
import { COLORS } from "../primitives/styles.js";
import { useApp } from "../../state/AppContext.jsx";
import { aiAutofill } from "../../services/geminiService.js";

// ============================================================================
// <AiAutofillButton /> — tombol bantuan AI di setiap kolom
//
// HOTFIX 6.1:
//   - Pakai model auto-detected dari state.gateway.gemini.model (bukan hardcode)
//   - Support parseAs: "text" (default) | "number" untuk field angka/rupiah
//   - Realistic prompting: AI diminta sebut konteks tahun + skala bisnis
//
// Props:
//   - buildPrompt : () => string — fungsi rangkai prompt dari state
//   - onResult    : (value) => void — callback isi field (string atau number)
//   - label       : teks tombol
//   - inline      : kecil
//   - parseAs     : "text" | "number" — kalau "number", parse angka dari teks AI
// ============================================================================

export default function AiAutofillButton({
  buildPrompt,
  onResult,
  label = "🪄 Bantu AI Tuliskan",
  inline = false,
  parseAs = "text",
}) {
  const { state } = useApp();
  const apiKey = state.gateway?.gemini?.key;
  const model = state.gateway?.gemini?.model;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    if (!apiKey) {
      setError("API key Gemini belum di-setup.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const prompt = buildPrompt();
      const result = await aiAutofill(apiKey, prompt, model);
      if (result.ok && result.text) {
        if (parseAs === "number") {
          // Strip semua karakter non-digit, parse jadi integer
          const digits = result.text.replace(/[^\d]/g, "");
          const n = parseInt(digits, 10);
          if (!isNaN(n) && n > 0) {
            onResult?.(n);
          } else {
            setError(`AI mengembalikan: "${result.text.slice(0, 60)}" — tidak bisa di-parse jadi angka.`);
          }
        } else {
          onResult?.(result.text);
        }
      } else {
        setError(result.error || "Gagal generate. Coba lagi nanti.");
      }
    } catch (e) {
      setError(e.message || "Terjadi kesalahan.");
    }
    setBusy(false);
  };

  return (
    <div style={{ marginTop: 6 }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: inline ? "4px 10px" : "6px 12px",
          background: busy ? COLORS.bgPanelDeep : "transparent",
          border: `1px solid ${busy ? COLORS.borderHi : COLORS.infoBorder}`,
          borderRadius: 5,
          color: busy ? COLORS.textMuted : COLORS.info,
          fontSize: inline ? 10.5 : 11.5,
          fontWeight: 600,
          cursor: busy ? "wait" : "pointer",
          fontFamily: "inherit",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!busy) {
            e.currentTarget.style.background = COLORS.infoBg;
            e.currentTarget.style.borderColor = COLORS.info;
          }
        }}
        onMouseLeave={(e) => {
          if (!busy) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = COLORS.infoBorder;
          }
        }}
      >
        <span>{busy ? "⏳" : "🪄"}</span>
        <span>{busy ? "AI menyusun…" : label}</span>
      </button>
      {error && (
        <div
          style={{
            marginTop: 6,
            padding: "6px 10px",
            background: COLORS.dangerBg,
            border: `1px solid ${COLORS.dangerBorder}`,
            borderRadius: 4,
            color: COLORS.dangerHi,
            fontSize: 10.5,
            lineHeight: 1.45,
          }}
        >
          ⚠ {error}
        </div>
      )}
    </div>
  );
}
