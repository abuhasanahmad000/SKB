import { COLORS } from "../primitives/styles.js";
import {
  SCORE_VALUES,
  calcAspectScore,
  verdictFor,
  VERDICT_LABELS,
  VERDICT_COLORS,
  getNarasi,
} from "../../data/kuesioner.js";

// ============================================================================
// <KuisionerYRT /> — Kuesioner SKB Ya/Ragu/Tidak (Bab 4)
//
// Untuk 5 aspek SKB:
//   A. Pemasaran (3 pertanyaan)
//   B. Teknis (3)
//   C. Manajemen (2)
//   D. Hukum (2)
//   E. Lingkungan (2)
//
// Threshold proporsional:
//   ≥ 85% LAYAK / 50-84% CUKUP / < 50% TIDAK LAYAK
//
// Props:
//   - aspectCode : kode aspek dari KUESIONER (pemasaran|teknis|manajemen|hukum|lingkungan)
//   - aspect     : object aspek (alternatif aspectCode kalau sudah ada datanya)
//   - value      : { questionId: score } — score adalah 1|2|3
//   - onChange   : (newAnswers) => void
//   - showNarasi : tampilkan preview narasi otomatis (default: true)
// ============================================================================

const SCORE_OPTIONS = [
  { score: SCORE_VALUES.ya, label: "Ya", short: "Ya", color: COLORS.success },
  { score: SCORE_VALUES.ragu, label: "Ragu-ragu", short: "Ragu", color: COLORS.warn },
  { score: SCORE_VALUES.tidak, label: "Tidak", short: "Tidak", color: COLORS.danger },
];

export default function KuisionerYRT({ aspect, value = {}, onChange, showNarasi = true }) {
  if (!aspect) return null;

  const setAnswer = (qId, score) => {
    onChange?.({ ...value, [qId]: score });
  };

  const result = calcAspectScore(aspect.code, value);
  const verdict = verdictFor(aspect.code, value);
  const narasi = verdict ? getNarasi(aspect.code, verdict) : null;

  return (
    <div>
      {/* Daftar pertanyaan */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
        {aspect.questions.map((q, idx) => {
          const userScore = value[q.id];
          return (
            <div
              key={q.id}
              style={{
                background: COLORS.bgPanelDeep,
                border: `1px solid ${userScore ? COLORS.borderHi : COLORS.border}`,
                borderRadius: 10,
                padding: 16,
              }}
            >
              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <span
                  style={{
                    flexShrink: 0,
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: userScore ? COLORS.accentBg : COLORS.bgPanel,
                    color: userScore ? COLORS.accent : COLORS.textMuted,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "monospace",
                  }}
                >
                  {idx + 1}
                </span>
                <div style={{ flex: 1, fontSize: 13, color: COLORS.textHi, lineHeight: 1.55 }}>
                  {q.text}
                </div>
              </div>

              {/* 3 tombol Ya/Ragu/Tidak */}
              <div style={{ display: "flex", gap: 8, paddingLeft: 36 }}>
                {SCORE_OPTIONS.map((opt) => {
                  const isSelected = userScore === opt.score;
                  return (
                    <button
                      key={opt.score}
                      type="button"
                      onClick={() => setAnswer(q.id, opt.score)}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        background: isSelected ? `${opt.color}22` : COLORS.bgPanel,
                        border: `1px solid ${isSelected ? opt.color : COLORS.border}`,
                        borderRadius: 6,
                        cursor: "pointer",
                        color: isSelected ? opt.color : COLORS.textMid,
                        fontSize: 12,
                        fontWeight: isSelected ? 700 : 500,
                        fontFamily: "inherit",
                        transition: "all 0.12s",
                      }}
                    >
                      {opt.label} <span style={{ opacity: 0.6, fontFamily: "monospace" }}>({opt.score})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Score panel */}
      <ScorePanel result={result} verdict={verdict} aspect={aspect} />

      {/* Narasi otomatis */}
      {showNarasi && narasi && (
        <div
          style={{
            marginTop: 14,
            padding: "14px 16px",
            background: COLORS.bgPanelDeep,
            border: `1px solid ${VERDICT_COLORS[verdict]}33`,
            borderLeft: `3px solid ${VERDICT_COLORS[verdict]}`,
            borderRadius: 6,
          }}
        >
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.15em",
              color: VERDICT_COLORS[verdict],
              fontFamily: "monospace",
              marginBottom: 8,
              fontWeight: 700,
            }}
          >
            ◆ NARASI OTOMATIS (RULE-BASED, TANPA AI)
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: COLORS.text,
              lineHeight: 1.65,
              fontStyle: "italic",
            }}
          >
            "{narasi}"
          </div>
        </div>
      )}
    </div>
  );
}

function ScorePanel({ result, verdict, aspect }) {
  const pct = Math.round(result.pct * 100);
  const verdictColor = verdict ? VERDICT_COLORS[verdict] : COLORS.textMuted;

  return (
    <div
      style={{
        background: COLORS.bgPanel,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
        padding: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.15em",
              color: COLORS.textMuted,
              fontFamily: "monospace",
              marginBottom: 4,
            }}
          >
            SKOR {aspect.name.toUpperCase()}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: COLORS.textHi, fontFamily: "monospace" }}>
              {result.score}
            </span>
            <span style={{ fontSize: 13, color: COLORS.textMuted }}>
              / {result.max} ({pct}%)
            </span>
          </div>
        </div>
        <div
          style={{
            padding: "6px 14px",
            background: verdict ? `${verdictColor}22` : COLORS.bgPanelDeep,
            border: `1px solid ${verdict ? verdictColor : COLORS.border}`,
            borderRadius: 6,
            color: verdict ? verdictColor : COLORS.textMuted,
            fontFamily: "monospace",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
          }}
        >
          {verdict ? VERDICT_LABELS[verdict] : "BELUM LENGKAP"}
        </div>
      </div>

      {/* Progress bar visual */}
      <div
        style={{
          height: 6,
          background: COLORS.bgPanelDeep,
          borderRadius: 3,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${pct}%`,
            background: verdictColor,
            transition: "width 0.3s, background 0.3s",
          }}
        />
        {/* Threshold markers */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "50%",
            width: 1,
            background: `${COLORS.textDim}AA`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "85%",
            width: 1,
            background: `${COLORS.textDim}AA`,
          }}
        />
      </div>

      {/* Threshold legend */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 9,
          color: COLORS.textMuted,
          fontFamily: "monospace",
          marginTop: 6,
          letterSpacing: "0.05em",
        }}
      >
        <span>0%</span>
        <span style={{ color: COLORS.danger }}>← TIDAK · 50% · CUKUP →</span>
        <span style={{ color: COLORS.success }}>85% · LAYAK →</span>
      </div>
    </div>
  );
}
