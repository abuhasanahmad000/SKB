import { useApp } from "../../state/AppContext.jsx";
import { useState, useMemo } from "react";
import { computeFinancials } from "../../engines/financialEngine.js";
import { computeScoringResult } from "../../engines/scoringEngine.js";
import { buildAiContext } from "../../engines/reportAssembler.js";
import { generateExecutiveSummary } from "../../services/geminiService.js";
import Button from "../primitives/Button.jsx";
import { COLORS } from "../primitives/styles.js";

// ============================================================================
// <ExecutiveSummaryPanel /> — Bab 1 AI-Generated (Tahap 9)
//
// Dipakai di sub-tab:
//   - preview (Jalur A & B) — pratinjau dokumen
//   - finalisasi (Jalur C) — proposal pendanaan
//
// Flow:
//   1. Tombol "Generate dengan AI" — tidak auto-trigger (hemat kuota)
//   2. AI baca context lengkap (identitas + pasar + keuangan + skor)
//   3. Output 3-5 paragraf disimpan di state.forms.bab1Summary
//   4. Render hasil + tombol "Regenerate" + "Edit Manual"
// ============================================================================

export default function ExecutiveSummaryPanel({ mode = "baru" }) {
  const { state, patch } = useApp();
  const apiKey = state.gateway?.gemini?.key;
  const model = state.gateway?.gemini?.model;
  const pathwayCode = state.app?.businessStage || "baru";
  const provinceCode = state.forms?.identitas?.provinceCode || "";

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");

  // Hitung context AI dari engines (memoized agar tidak re-compute)
  const aiContext = useMemo(() => {
    try {
      const fin = computeFinancials(state.forms, provinceCode);
      const scoring = computeScoringResult(state.forms, pathwayCode);
      return buildAiContext(state.forms, fin, scoring, pathwayCode);
    } catch (e) {
      return null;
    }
  }, [state.forms, provinceCode, pathwayCode]);

  const summary = state.forms?.bab1Summary;
  const generatedAt = state.forms?.bab1SummaryAt;

  const handleGenerate = async () => {
    if (!apiKey) {
      setError("API key Gemini belum di-setup. Cek menu setting.");
      return;
    }
    if (!aiContext) {
      setError("Data bisnis belum cukup lengkap untuk generate ringkasan.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    const result = await generateExecutiveSummary(apiKey, aiContext, model);
    setIsGenerating(false);

    if (result.ok && result.text) {
      patch("forms", { bab1Summary: result.text, bab1SummaryAt: Date.now() });
      setIsEditing(false);
    } else {
      setError(result.error || "Gagal generate. Coba lagi.");
    }
  };

  const handleSaveEdit = () => {
    patch("forms", { bab1Summary: editText, bab1SummaryAt: Date.now() });
    setIsEditing(false);
  };

  // Cek apakah cukup data untuk generate
  const hasMinData =
    state.forms?.identitas?.namaBisnis &&
    state.forms?.identitas?.produkUtama &&
    (state.forms?.keuangan?.products?.length || 0) > 0;

  if (!hasMinData) {
    return (
      <div
        style={{
          padding: 32,
          background: COLORS.bgPanel,
          border: `2px dashed ${COLORS.border}`,
          borderRadius: 12,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.textHi, margin: "0 0 8px" }}>
          Ringkasan Eksekutif Belum Bisa Dibuat
        </h3>
        <p style={{ fontSize: 13, color: COLORS.textSoft, lineHeight: 1.6, maxWidth: 480, margin: "0 auto" }}>
          Lengkapi minimal: <strong>Nama Bisnis</strong>, <strong>Produk Utama</strong>, dan{" "}
          <strong>setidaknya 1 produk</strong> di Tab "Kelayakan Investasi" → sub-tab "Proyeksi
          Pendapatan & Biaya".
        </p>
      </div>
    );
  }

  return (
    <>
      {/* HEADER */}
      <div
        style={{
          padding: 16,
          marginBottom: 18,
          background: COLORS.accentBg,
          border: `1px solid ${COLORS.accentBorder}`,
          borderLeft: `4px solid ${COLORS.accent}`,
          borderRadius: 10,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.2em",
            color: COLORS.accent,
            fontFamily: "monospace",
            fontWeight: 700,
            marginBottom: 4,
          }}
        >
          ◆ BAB 1 — RINGKASAN EKSEKUTIF
        </div>
        <p style={{ fontSize: 12.5, color: COLORS.textSoft, lineHeight: 1.55, margin: 0 }}>
          {mode === "lanjutan"
            ? "Pembuka proposal pendanaan pengembangan usaha — paragraf persuasif yang merangkum rekam jejak bisnis, rencana ekspansi, kelayakan keuangan, dan permintaan dana."
            : "Pembuka proposal pendanaan — paragraf persuasif yang merangkum bisnis, peluang pasar, kelayakan keuangan, dan permintaan dana."}
        </p>
      </div>

      {/* BUTTONS */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <Button
          variant="primary"
          onClick={handleGenerate}
          disabled={isGenerating}
          style={{ fontSize: 12 }}
        >
          {isGenerating ? "⏳ AI sedang menulis..." : summary ? "🔄 Generate Ulang" : "🪄 Generate dengan AI"}
        </Button>
        {summary && !isEditing && (
          <Button
            variant="ghost"
            onClick={() => {
              setEditText(summary);
              setIsEditing(true);
            }}
            style={{ fontSize: 12 }}
          >
            ✏ Edit Manual
          </Button>
        )}
      </div>

      {error && (
        <div
          style={{
            padding: "10px 14px",
            background: COLORS.dangerBg,
            border: `1px solid ${COLORS.dangerBorder}`,
            borderRadius: 6,
            color: COLORS.dangerHi,
            fontSize: 12.5,
            marginBottom: 14,
          }}
        >
          ⚠ {error}
        </div>
      )}

      {/* CONTENT */}
      {isEditing ? (
        <EditView
          text={editText}
          onChange={setEditText}
          onSave={handleSaveEdit}
          onCancel={() => setIsEditing(false)}
        />
      ) : summary ? (
        <SummaryView text={summary} generatedAt={generatedAt} />
      ) : (
        <PromptCard />
      )}
    </>
  );
}

// ----- Summary View (display generated text) -----
function SummaryView({ text, generatedAt }) {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim());
  const dateLabel = generatedAt
    ? `Dibuat ${new Date(generatedAt).toLocaleString("id-ID")}`
    : "";

  return (
    <div
      style={{
        padding: 22,
        background: COLORS.bgPanel,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
      }}
    >
      <div
        style={{
          fontSize: 9.5,
          letterSpacing: "0.15em",
          color: COLORS.textMuted,
          fontFamily: "monospace",
          marginBottom: 14,
          fontWeight: 700,
        }}
      >
        🤖 DIHASILKAN OLEH GEMINI AI · {dateLabel}
      </div>
      {paragraphs.map((p, idx) => (
        <p
          key={idx}
          style={{
            fontSize: 14,
            color: COLORS.text,
            lineHeight: 1.75,
            margin: idx === 0 ? "0 0 14px" : "0 0 14px",
            textAlign: "justify",
            textIndent: idx > 0 ? 22 : 0,
          }}
        >
          {p}
        </p>
      ))}
    </div>
  );
}

// ----- Edit View (textarea) -----
function EditView({ text, onChange, onSave, onCancel }) {
  return (
    <div
      style={{
        padding: 16,
        background: COLORS.bgPanel,
        border: `2px solid ${COLORS.accent}`,
        borderRadius: 10,
      }}
    >
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        rows={14}
        style={{
          width: "100%",
          padding: 14,
          background: COLORS.bgPanelDeep,
          border: `1px solid ${COLORS.borderMid}`,
          borderRadius: 6,
          color: COLORS.text,
          fontSize: 13,
          fontFamily: "inherit",
          lineHeight: 1.6,
          outline: "none",
          boxSizing: "border-box",
          resize: "vertical",
        }}
      />
      <div style={{ display: "flex", gap: 10, marginTop: 12, justifyContent: "flex-end" }}>
        <Button variant="ghost" onClick={onCancel} style={{ fontSize: 12 }}>
          Batal
        </Button>
        <Button variant="primary" onClick={onSave} style={{ fontSize: 12 }}>
          ✓ Simpan
        </Button>
      </div>
    </div>
  );
}

// ----- Prompt Card (empty state — invite to generate) -----
function PromptCard() {
  return (
    <div
      style={{
        padding: 32,
        background: COLORS.bgPanelDeep,
        border: `2px dashed ${COLORS.border}`,
        borderRadius: 12,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 12 }}>🪄</div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: COLORS.textHi, margin: "0 0 8px" }}>
        Ringkasan Eksekutif Belum Dibuat
      </h3>
      <p style={{ fontSize: 12.5, color: COLORS.textSoft, lineHeight: 1.6, maxWidth: 480, margin: "0 auto 4px" }}>
        Klik <strong>"🪄 Generate dengan AI"</strong> di atas untuk membuat ringkasan eksekutif otomatis
        dari Gemini AI berdasarkan semua data yang sudah Anda isi.
      </p>
      <p style={{ fontSize: 11, color: COLORS.textMuted, fontStyle: "italic", marginTop: 12 }}>
        Membutuhkan ±200 token Gemini · proses 5-15 detik · hasil bisa di-edit manual.
      </p>
    </div>
  );
}
