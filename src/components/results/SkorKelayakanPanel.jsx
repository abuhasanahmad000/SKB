import { useApp } from "../../state/AppContext.jsx";
import { useMemo } from "react";
import { computeScoringResult } from "../../engines/scoringEngine.js";
import { ASPECT_ORDER, VERDICT_COLORS } from "../../data/kuesioner.js";
import { COLORS } from "../primitives/styles.js";

// ============================================================================
// <SkorKelayakanPanel /> — visualisasi skor 5 aspek SKB + agregat + gate
//
// Dipakai di sub-tab:
//   - skor (Jalur A) — pengujian kelayakan standar
//   - skor_ekspansi (Jalur B) — pengujian kelayakan ekspansi
//   - skor_yuridis (Jalur C) — penekanan aspek Hukum & Lingkungan
//
// Props:
//   - mode : "rintisan" | "ekspansi" | "pendanaan"
//
// Hasil otomatis update real-time setiap user ubah jawaban kuesioner di Tab 2.
// ============================================================================

export default function SkorKelayakanPanel({ mode = "baru" }) {
  const { state } = useApp();
  const pathwayCode = state.app?.businessStage || "baru";

  const result = useMemo(
    () => computeScoringResult(state.forms, pathwayCode),
    [state.forms, pathwayCode]
  );

  // Hapus EmptyState check — selalu ada skor karena di-derive otomatis
  // dari forms data, bahkan kalau form kosong (skor akan rendah saja).

  return (
    <>
      <AggregateCard result={result} mode={mode} />

      {/* Cap info banner */}
      <CapInfoBanner capInfo={result.capInfo} />

      {/* 5 aspek bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {ASPECT_ORDER.map((code) => (
          <AspectRow key={code} aspect={result.aspects[code]} mode={mode} />
        ))}
      </div>

      {/* Critical gate warning */}
      {result.criticalFailed.length > 0 && (
        <CriticalGateBanner failed={result.criticalFailed} mode={mode} />
      )}

      {/* Narasi rekomendasi per aspek */}
      <NarasiList aspects={result.aspects} />
    </>
  );
}

// ----- Cap info banner -----
function CapInfoBanner({ capInfo }) {
  return (
    <div
      style={{
        padding: "10px 14px",
        marginBottom: 20,
        background: COLORS.infoBg,
        border: `1px solid ${COLORS.infoBorder}`,
        borderLeft: `3px solid ${COLORS.info}`,
        borderRadius: 6,
        fontSize: 11.5,
        color: COLORS.textSoft,
        lineHeight: 1.55,
      }}
    >
      <span style={{ color: COLORS.info, fontWeight: 700 }}>ⓘ Catatan:</span>{" "}
      Skor dihitung otomatis dari data yang Anda isi di tab lain. Maksimum {capInfo.maxAspectScore}% per aspek
      &amp; {capInfo.maxOverallScore}% agregat — untuk menjaga kredibilitas (skor 100% mengundang
      kecurigaan investor/pemberi dana).
    </div>
  );
}

// ----- Empty state -----
function EmptyState({ mode }) {
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
      <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.textHi, margin: "0 0 8px" }}>
        Skor Akan Tampil Setelah Anda Mengisi Kuesioner
      </h3>
      <p style={{ fontSize: 13, color: COLORS.textSoft, lineHeight: 1.6, maxWidth: 420, margin: "0 auto" }}>
        Silakan lengkapi sub-tab "Kuesioner Kelayakan 5 Aspek" terlebih dahulu — skor & verdict akan otomatis ter-update di sini.
      </p>
    </div>
  );
}

// ----- Agregat card besar -----
function AggregateCard({ result, mode }) {
  const verdict = result.overallVerdict;
  const color = verdict ? VERDICT_COLORS[verdict] : COLORS.textMuted;
  const isPendanaan = true; // v13: semua user adalah pencari dana

  return (
    <div
      style={{
        padding: 24,
        marginBottom: 28,
        background: verdict ? `${color}11` : COLORS.bgPanel,
        border: `1px solid ${verdict ? color : COLORS.border}`,
        borderRadius: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 14 }}>
        <div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.2em",
              color: verdict ? color : COLORS.textMuted,
              fontFamily: "monospace",
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            ◆ SKOR AGREGAT KELAYAKAN BISNIS
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 44, fontWeight: 800, color: COLORS.textHi, fontFamily: "monospace", lineHeight: 1 }}>
              {result.totalScore}
            </span>
            <span style={{ fontSize: 22, color: COLORS.textMuted, fontFamily: "monospace" }}>%</span>
          </div>
        </div>

        <div
          style={{
            padding: "12px 22px",
            background: verdict ? color : COLORS.bgPanelDeep,
            color: verdict ? COLORS.bg : COLORS.textMuted,
            borderRadius: 10,
            fontFamily: "monospace",
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: "0.08em",
          }}
        >
          {result.overallVerdictLabel || "BELUM LENGKAP"}
        </div>
      </div>

      {/* Completeness indicator (sekarang selalu 100% karena di-derive otomatis) */}
      <div style={{ fontSize: 11.5, color: COLORS.textSoft, marginBottom: 10 }}>
        Skor di-derive otomatis dari semua data yang Anda isi di tab/sub-tab lain.
      </div>

      {/* Threshold info */}
      <div
        style={{
          fontSize: 11,
          color: COLORS.textMuted,
          fontFamily: "monospace",
          letterSpacing: "0.03em",
        }}
      >
        Kriteria: ≥70% LAYAK · 45-69% CUKUP · &lt;45% TIDAK LAYAK
        {isPendanaan && " · Jalur C: Hukum & Lingkungan WAJIB LAYAK"}
      </div>
    </div>
  );
}

// ----- Per aspek row -----
function AspectRow({ aspect, mode }) {
  const v = aspect.verdict;
  const color = v ? VERDICT_COLORS[v] : COLORS.textMuted;
  const isCritical =
    aspect.meta.criticalForAll || aspect.meta.criticalForC; // v13: critical gate pendanaan selalu aktif

  return (
    <div
      style={{
        padding: 14,
        background: COLORS.bgPanel,
        border: `1px solid ${v ? `${color}55` : COLORS.border}`,
        borderRadius: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: v ? `${color}22` : COLORS.bgPanelDeep,
            color: v ? color : COLORS.textMuted,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 800,
            fontFamily: "monospace",
          }}
        >
          {aspect.meta.letter}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.textHi }}>
              {aspect.meta.name}
            </span>
            {isCritical && (
              <span
                style={{
                  fontSize: 9,
                  padding: "1px 6px",
                  background: COLORS.dangerBg,
                  color: COLORS.dangerHi,
                  borderRadius: 3,
                  fontFamily: "monospace",
                  fontWeight: 700,
                }}
              >
                KRITIKAL
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2, fontFamily: "monospace" }}>
            {aspect.score}/{aspect.max} ({aspect.pctPercent}%)
          </div>
        </div>
        <div
          style={{
            padding: "4px 12px",
            background: v ? `${color}22` : COLORS.bgPanelDeep,
            color: v ? color : COLORS.textMuted,
            border: `1px solid ${v ? color : COLORS.border}`,
            borderRadius: 5,
            fontFamily: "monospace",
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: "0.08em",
          }}
        >
          {aspect.verdictLabel || "BELUM"}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: COLORS.bgPanelDeep, borderRadius: 3, overflow: "hidden", position: "relative" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${aspect.pctPercent}%`,
            background: color,
            transition: "width 0.3s, background 0.3s",
          }}
        />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: "45%", width: 1, background: `${COLORS.textDim}88` }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: "70%", width: 1, background: `${COLORS.textDim}88` }} />
      </div>

      {/* Dimensions breakdown */}
      {aspect.dimensions && aspect.dimensions.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          {aspect.dimensions.map((dim, idx) => {
            const dimColor =
              dim.status === "good" ? COLORS.success :
              dim.status === "average" ? COLORS.warn :
              COLORS.danger;
            return (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 60px 4fr",
                  gap: 10,
                  alignItems: "center",
                  fontSize: 11,
                  padding: "4px 0",
                  borderBottom: idx < aspect.dimensions.length - 1 ? `1px dashed ${COLORS.borderMid}33` : "none",
                }}
              >
                <span style={{ color: COLORS.textMid, fontWeight: 500 }}>{dim.name}</span>
                <span
                  style={{
                    fontFamily: "monospace",
                    color: dimColor,
                    fontWeight: 700,
                    textAlign: "right",
                    fontSize: 11,
                  }}
                >
                  {dim.score}%
                </span>
                <div style={{ height: 4, background: COLORS.bgPanelDeep, borderRadius: 2, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${dim.score}%`,
                      background: dimColor,
                      transition: "width 0.3s",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ----- Critical gate banner -----
function CriticalGateBanner({ failed, mode }) {
  const isPendanaan = true; // v13: semua user adalah pencari dana
  return (
    <div
      style={{
        marginTop: 24,
        padding: 16,
        background: COLORS.dangerBg,
        border: `1px solid ${COLORS.dangerBorder}`,
        borderLeft: `4px solid ${COLORS.danger}`,
        borderRadius: 10,
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.2em",
          color: COLORS.dangerHi,
          fontFamily: "monospace",
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        ⚠ CRITICAL GATE TIDAK LOLOS
      </div>
      <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.55 }}>
        Aspek kritikal berikut belum memenuhi syarat:{" "}
        <strong style={{ color: COLORS.dangerHi }}>
          {failed.map((c) => c.name).join(", ")}
        </strong>
        .{" "}
        {isPendanaan
          ? "Untuk pengajuan pendanaan ke bank/investor, aspek ini WAJIB berstatus LAYAK. Tinjau ulang sebelum proposal disubmit."
          : "Disarankan tinjau ulang aspek-aspek ini sebelum laporan diajukan ke pihak ketiga."}
      </div>
    </div>
  );
}

// ----- Narasi rekomendasi per aspek -----
function NarasiList({ aspects }) {
  return (
    <div style={{ marginTop: 28 }}>
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.2em",
          color: COLORS.accent,
          fontFamily: "monospace",
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        ◆ NARASI REKOMENDASI PER ASPEK (otomatis, rule-based)
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {ASPECT_ORDER.map((code) => {
          const a = aspects[code];
          if (!a.narasi) return null;
          const color = VERDICT_COLORS[a.verdict];
          return (
            <div
              key={code}
              style={{
                padding: 12,
                background: COLORS.bgPanelDeep,
                borderLeft: `3px solid ${color}`,
                borderRadius: 5,
                fontSize: 12.5,
                color: COLORS.text,
                lineHeight: 1.55,
              }}
            >
              <span style={{ color, fontWeight: 700 }}>{a.meta.letter}. {a.meta.name}:</span>{" "}
              {a.narasi}
            </div>
          );
        })}
      </div>
    </div>
  );
}
