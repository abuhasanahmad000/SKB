import { useApp } from "../../state/AppContext.jsx";
import { useState, useMemo } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { assembleReport } from "../../engines/reportAssembler.js";
import { generateMultiBabNarration } from "../../services/geminiService.js";
import { compressImage, generateId, totalLampiranSize } from "../../utils/imageUtils.js";
import { formatRp, formatRpFull } from "../../utils/format.js";
import BusinessRatiosTable, { buildBusinessRatiosHtml } from "./BusinessRatiosTable.jsx";
import AppendixMonthly, { buildAppendixMonthlyHtml } from "./AppendixMonthly.jsx";
import {
  ConfidentialCoverPage, buildConfidentialCoverHtml,
  StartupRequirementsTable, buildStartupRequirementsHtml,
} from "./LivePlanComponents.jsx";
import { ProfitMonthlyChart, GrossMarginMonthlyChart, CashMonthlyChart } from "./MonthlyCharts.jsx";
import { SalesMonthlyStackedChart, SalesYearlyStackedChart } from "./StackedSalesCharts.jsx";
import {
  ProFormaPLTable, buildProFormaPLHtml,
  ProFormaCashFlowTable, buildProFormaCashFlowHtml,
  ProFormaBalanceSheetTable, buildProFormaBalanceSheetHtml,
  GeneralAssumptionsTable, buildGeneralAssumptionsHtml,
} from "./ProFormaReportTables.jsx";
import HighlightsChart from "./HighlightsChart.jsx";
import BepReportChart from "./BepReportChart.jsx";
import TableOfContents, { buildTableOfContentsHtml } from "./TableOfContents.jsx";
import RadarSkb, { radarSvgString } from "./RadarSkb.jsx";
import {
  Bab2Visual, Bab3Visual, Bab5Visual, FundingAskHero,
  buildBab2VisualHtml, buildBab3VisualHtml, buildBab5VisualHtml, buildFundingAskHeroHtml,
} from "./ChapterVisuals.jsx";
import {
  JalurAValidationSection,
  JalurBHistoricalSection,
  JalurCFundingSection,
  buildPathwaySpecificHtml,
} from "./PathwaySpecificSections.jsx";
import Button from "../primitives/Button.jsx";
import { COLORS } from "../primitives/styles.js";

// ============================================================================
// <ReportExportPanel /> — Hotfix 11.1: Polish Berat
//
// Yang baru:
//   1. Font sans-serif profesional (Inter / system-ui) bukan Times New Roman
//   2. AI multi-bab generation (Bab 2-8 sintesis mengalir)
//   3. Radar chart 5 aspek SKB
//   4. Pie chart komposisi sumber dana
//   5. Bar chart proyeksi 3 tahun
//   6. Upload foto lampiran dengan kompresi otomatis
//   7. Layout responsif untuk halaman print
// ============================================================================

const FONT_STACK = `"Inter", "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif`;

// Palette untuk visual
const PALETTE = {
  primary: "#0EA5E9",   // sky blue
  success: "#10B981",   // emerald
  warning: "#F59E0B",   // amber
  danger: "#EF4444",    // red
  purple: "#A78BFA",
  pink: "#EC4899",
  teal: "#14B8A6",
  indigo: "#6366F1",
};

// v13.2: bersihkan output AI — model kerap menambahkan judul sendiri
// ("Bab 2: Analisis Peluang Bisnis") sehingga setiap bab punya judul DOBEL
// (judul besar sistem + teks kecil dari AI). Baris judul semacam itu dibuang.
function sanitizeAiParagraphs(text) {
  return String(text || "")
    .split(/\n\n+/)
    .map((p) => p.trim())
    // buang heading: "Bab 2: ...", "BAB 6 — ...", "Ringkasan Eksekutif", "## ..."
    .filter((p) => p &&
      !/^#{1,4}\s/.test(p) &&
      !(/^bab\s*\d+(\.\d+)?\s*[:—–-]/i.test(p) && p.length < 90) &&
      !(/^ringkasan eksekutif$/i.test(p)))
    // kalau judul menempel di awal paragraf panjang, potong judulnya saja
    .map((p) => p.replace(/^bab\s*\d+(\.\d+)?\s*[:—–-]\s*[^\n.]{3,60}\n+/i, "").trim())
    .filter(Boolean);
}

export default function ReportExportPanel({ mode = "baru" }) {
  const { state, patch } = useApp();
  const pathwayCode = state.app?.businessStage || "baru";
  const apiKey = state.gateway?.gemini?.key;
  const model = state.gateway?.gemini?.model;

  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const report = useMemo(() => {
    try {
      const r = assembleReport(state.forms, pathwayCode);
      // Inject Bab 1 dari state
      if (state.forms?.bab1Summary) {
        r.bab1 = {
          title: "BAB 1 — Ringkasan Eksekutif",
          paragraphs: sanitizeAiParagraphs(state.forms.bab1Summary),
        };
      }
      // Override Bab 2-8 dengan AI narrasi (kalau ada)
      const aiNar = state.forms?.babNarrationsAI;
      if (aiNar) {
        for (const code of ["bab2", "bab3", "bab5", "bab6", "bab7", "bab8"]) {
          if (aiNar[code]) {
            r[code] = {
              ...r[code],
              paragraphs: sanitizeAiParagraphs(aiNar[code]),
            };
          }
        }
      }
      return r;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [state.forms, pathwayCode]);

  const handleGenerateAllAI = async () => {
    if (!apiKey) {
      setAiError("API key Gemini belum di-setup");
      return;
    }
    if (!report?.aiContext) {
      setAiError("Data belum cukup");
      return;
    }
    setIsAiGenerating(true);
    setAiError(null);
    const result = await generateMultiBabNarration(apiKey, report.aiContext, model);
    setIsAiGenerating(false);
    if (result.ok) {
      patch("forms", { babNarrationsAI: result.narrations, babNarrationsAIAt: Date.now() });
    } else {
      setAiError(result.error || "Gagal generate");
    }
  };

  const handleUploadFoto = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploading(true);
    const existing = state.forms?.lampiranFotos || [];
    const newFotos = [];
    for (const file of files) {
      try {
        const compressed = await compressImage(file);
        newFotos.push({
          id: generateId(),
          name: compressed.name,
          dataUrl: compressed.dataUrl,
          size: compressed.size,
          width: compressed.width,
          height: compressed.height,
          caption: "",
        });
      } catch (err) {
        console.error("Gagal compress:", err);
      }
    }
    patch("forms", { lampiranFotos: [...existing, ...newFotos] });
    setIsUploading(false);
    e.target.value = "";
  };

  const handleRemoveFoto = (id) => {
    const existing = state.forms?.lampiranFotos || [];
    patch("forms", { lampiranFotos: existing.filter((f) => f.id !== id) });
  };

  const handleUpdateCaption = (id, caption) => {
    const existing = state.forms?.lampiranFotos || [];
    patch("forms", {
      lampiranFotos: existing.map((f) => f.id === id ? { ...f, caption } : f),
    });
  };

  if (!report) {
    return <EmptyState />;
  }

  // Filename builder
  const namaBisnis = state.forms?.identitas?.namaBisnis || "BizCast";
  const safeName = namaBisnis.replace(/[^a-zA-Z0-9]+/g, "_");
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const baseName = `SKB_${safeName}_${dateStr}`;

  const handlePrint = () => window.print();

  const handleDownloadHTML = () => {
    const html = buildStandaloneHtml(report, mode, state.forms?.lampiranFotos || [], state.forms, state.forms?.identitas?.namaPemohon, pathwayCode);
    downloadBlob(html, `${baseName}.html`, "text/html");
  };

  const handleDownloadWord = () => {
    const html = buildWordHtml(report, mode, state.forms?.lampiranFotos || [], state.forms, state.forms?.identitas?.namaPemohon, pathwayCode);
    downloadBlob(html, `${baseName}.doc`, "application/msword");
  };

  const totalLampiranKb = totalLampiranSize(state.forms?.lampiranFotos || []);
  const hasAINarration = !!state.forms?.babNarrationsAI;
  const aiTimestamp = state.forms?.babNarrationsAIAt;

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .report-preview, .report-preview * { visibility: visible; }
          .report-preview {
            position: absolute;
            top: 0; left: 0; width: 100%;
            color: #000 !important;
            background: #fff !important;
            font-family: ${FONT_STACK};
          }
          .report-preview h1, .report-preview h2, .report-preview h3, .report-preview p, .report-preview td, .report-preview th {
            color: #000 !important;
          }
          .no-print { display: none !important; }
          .report-bab { page-break-inside: avoid; page-break-before: auto; }
          .report-bab.bab-major { page-break-before: always; }
          .lampiran-foto img { max-width: 100% !important; height: auto !important; }
          @page { margin: 2cm 2cm 2cm 2.5cm; size: A4; }
        }
      `}</style>

      {/* === ACTION BUTTONS (hidden in print) === */}
      <div className="no-print" style={{ marginBottom: 20 }}>
        {/* AI Multi-Bab Generation */}
        <div style={{
          padding: 16,
          background: COLORS.accentBg,
          border: `1px solid ${COLORS.accentBorder}`,
          borderLeft: `4px solid ${COLORS.accent}`,
          borderRadius: 10,
          marginBottom: 14,
        }}>
          <div style={sectionTitleStyle}>◆ AI NARASI MULTI-BAB</div>
          <p style={{ fontSize: 12.5, color: COLORS.textSoft, lineHeight: 1.55, margin: "0 0 12px" }}>
            Buat narasi Bab 2-8 yang lebih mengalir & saling tersambung menggunakan AI. Sangat
            direkomendasikan untuk hasil laporan yang profesional. (membutuhkan ~8000 token, ±15-25 detik)
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Button variant="primary" onClick={handleGenerateAllAI} disabled={isAiGenerating} style={{ fontSize: 12 }}>
              {isAiGenerating ? "⏳ AI menulis Bab 2-8..." : hasAINarration ? "🔄 Regenerate Semua Bab" : "🪄 Generate Bab 2-8 dengan AI"}
            </Button>
            {hasAINarration && aiTimestamp && (
              <span style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "monospace" }}>
                ✓ Generated {new Date(aiTimestamp).toLocaleString("id-ID")}
              </span>
            )}
          </div>
          {aiError && (
            <div style={{ marginTop: 10, padding: "8px 12px", background: COLORS.dangerBg, border: `1px solid ${COLORS.dangerBorder}`, borderRadius: 4, color: COLORS.dangerHi, fontSize: 11.5 }}>
              ⚠ {aiError}
            </div>
          )}
        </div>

        {/* Upload Foto Lampiran */}
        <div style={{
          padding: 16,
          background: COLORS.bgPanel,
          border: `1px solid ${COLORS.border}`,
          borderLeft: `4px solid ${PALETTE.teal}`,
          borderRadius: 10,
          marginBottom: 14,
        }}>
          <div style={sectionTitleStyle}>◆ LAMPIRAN FOTO (OPSIONAL)</div>
          <p style={{ fontSize: 12.5, color: COLORS.textSoft, lineHeight: 1.55, margin: "0 0 12px" }}>
            Upload foto produk, lokasi usaha, peralatan, dll. Foto otomatis dikompres (max 1200×900, JPEG quality 75%) dan akan muncul di Bab 9 Lampiran.
          </p>
          <label style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            background: PALETTE.teal,
            color: "#fff",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "inherit",
          }}>
            {isUploading ? "⏳ Mengompres..." : "📷 Pilih Foto"}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUploadFoto}
              style={{ display: "none" }}
            />
          </label>
          <span style={{ marginLeft: 10, fontSize: 11, color: COLORS.textMuted, fontFamily: "monospace" }}>
            {(state.forms?.lampiranFotos || []).length} foto · {totalLampiranKb} KB total
          </span>

          {/* Grid preview foto */}
          {(state.forms?.lampiranFotos || []).length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, marginTop: 14 }}>
              {(state.forms?.lampiranFotos || []).map((foto) => (
                <div key={foto.id} style={{ position: "relative", background: COLORS.bgPanelDeep, borderRadius: 6, overflow: "hidden" }}>
                  <img src={foto.dataUrl} alt={foto.name} style={{ width: "100%", height: 90, objectFit: "cover", display: "block" }} />
                  <input
                    type="text"
                    placeholder="Caption..."
                    value={foto.caption}
                    onChange={(e) => handleUpdateCaption(foto.id, e.target.value)}
                    style={{ width: "100%", padding: "4px 6px", border: "none", borderTop: `1px solid ${COLORS.border}`, background: COLORS.bgPanelDeep, color: COLORS.text, fontSize: 10.5, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                  />
                  <button
                    onClick={() => handleRemoveFoto(foto.id)}
                    title="Hapus"
                    style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: 10, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", cursor: "pointer", fontSize: 12, lineHeight: 1, padding: 0 }}
                  >×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Export Buttons */}
        <div style={{
          padding: 16,
          background: COLORS.accentBg,
          border: `1px solid ${COLORS.accentBorder}`,
          borderLeft: `4px solid ${COLORS.accent}`,
          borderRadius: 10,
        }}>
          <div style={sectionTitleStyle}>◆ EKSPOR LAPORAN</div>
          <p style={{ fontSize: 12.5, color: COLORS.textSoft, lineHeight: 1.55, margin: "0 0 12px" }}>
            Pilih format. Untuk PDF, gunakan <strong>Cetak / Save PDF</strong> di dialog browser.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button variant="primary" onClick={handlePrint} style={{ fontSize: 13 }}>🖨️ Cetak / Save PDF</Button>
            <Button variant="ghost" onClick={handleDownloadHTML} style={{ fontSize: 13 }}>📥 Unduh .HTML</Button>
            <Button variant="ghost" onClick={handleDownloadWord} style={{ fontSize: 13 }}>📄 Unduh .DOC (Word)</Button>
          </div>
        </div>
      </div>

      {/* === REPORT PREVIEW (visible & dicetak) === */}
      <div className="report-preview" style={{ ...previewStyle, fontFamily: FONT_STACK }}>
        <ConfidentialCoverPage
          identitas={report.identitas}
          mode={mode}
          namaPemohon={state.forms?.identitas?.namaPemohon}
        />
        <TableOfContents pathwayCode={pathwayCode} />
        {report.bab1 && (
          <BabSection bab={report.bab1}>
            <HighlightsChart fin={report.financials} />
          </BabSection>
        )}
        <BabSection bab={report.bab2} extra={<Bab2Visual forms={state.forms} />} />
        <BabSection bab={report.bab3} extra={<Bab3Visual forms={state.forms} />} />
        <BabSection
          bab={report.bab4}
          extra={
            <>
              <RadarSkb scoring={report.scoring} />
              <ScoringTable scoring={report.scoring} />
            </>
          }
        />
        <BabSection bab={report.bab5} extra={<Bab5Visual forms={state.forms} />} />
        <BabSection
          bab={report.bab6}
          extra={
            <>
              <SalesYearlyStackedChart forms={state.forms} fin={report.financials} />
              <SalesMonthlyStackedChart forms={state.forms} />
              <ProfitMonthlyChart fin={report.financials} />
              <GrossMarginMonthlyChart fin={report.financials} />
            </>
          }
        />

        {/* ============ BAB KHUSUS 6.5 & 6.6 — DIFERENSIASI PER JENIS BISNIS ============ */}
        {pathwayCode === "lanjutan"
          ? <JalurBHistoricalSection forms={state.forms} financials={report.financials} />
          : <JalurAValidationSection forms={state.forms} financials={report.financials} />}
        <JalurCFundingSection forms={state.forms} financials={report.financials} stage={pathwayCode} />

        {/* === BAB 7 — PERMINTAAN PENDANAAN (kembali ke posisi sebelum Bab 8, v13.7) === */}
        <BabSection
          bab={report.bab7}
          lead={<FundingAskHero fundingAsk={report.bab7?.fundingAsk} />}
          extra={
            <>
              <StartupRequirementsTable forms={state.forms} />
              <FundingPieChart forms={state.forms} />
            </>
          }
        />

        <BabSection
          bab={report.bab8}
          extra={
            <>
              <KpiSummaryGrid fin={report.financials} scoring={report.scoring} />
              <BepReportChart fin={report.financials} />
              <ProFormaPLTable fin={report.financials} forms={state.forms} />
              <BusinessRatiosTable fin={report.financials} forms={state.forms} />
              <CashMonthlyChart fin={report.financials} forms={state.forms} />
            </>
          }
        />
        <BabSection
          bab={report.bab9}
          extra={
            <>
              <ProFormaCashFlowTable fin={report.financials} forms={state.forms} />
              <ProFormaBalanceSheetTable fin={report.financials} forms={state.forms} />
              <GeneralAssumptionsTable fin={report.financials} forms={state.forms} />
              <LampiranFotos fotos={state.forms?.lampiranFotos || []} />
            </>
          }
        />
        <AppendixMonthly forms={state.forms} />
        <ReportFooter />
      </div>
    </>
  );
}

// ============================================================================
// COMPONENTS PREVIEW
// ============================================================================

function ReportHeader({ report, mode }) {
  const i = report.identitas;
  const subtitle =
    mode === "lanjutan" ? "Proposal Pendanaan & Studi Kelayakan Pengembangan Usaha"
      : "Proposal Pendanaan & Studi Kelayakan Bisnis";

  return (
    <div className="report-bab" style={headerStyle}>
      <div style={{ fontSize: 11, color: PALETTE.primary, fontFamily: "monospace", letterSpacing: "0.2em", marginBottom: 10, fontWeight: 600 }}>
        ◆ {subtitle.toUpperCase()}
      </div>
      <h1 style={{ fontSize: 34, fontWeight: 800, color: "#0F172A", margin: "0 0 10px", lineHeight: 1.15, letterSpacing: "-0.5px" }}>
        {i.namaBisnis || "Bisnis"}
      </h1>
      {i.tagline && (
        <p style={{ fontSize: 15, color: "#475569", fontStyle: "italic", margin: "0 0 18px", fontWeight: 400 }}>
          "{i.tagline}"
        </p>
      )}
      <div style={{ display: "inline-block", padding: "12px 24px", background: "#F1F5F9", borderRadius: 8, marginTop: 8 }}>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 16px", fontSize: 13, color: "#334155" }}>
          {i.sectorCode && <><strong>Sektor</strong><span>KBLI {i.sectorCode}</span></>}
          {(i.alamat || i.provinceCode) && <><strong>Lokasi</strong><span>{i.alamat || `Provinsi ${i.provinceCode}`}</span></>}
          {i.skalaBisnis && <><strong>Skala</strong><span style={{ textTransform: "capitalize" }}>{i.skalaBisnis}</span></>}
          <strong>Tanggal</strong><span>{new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
      </div>
    </div>
  );
}

function BabSection({ bab, lead, extra, children }) {
  if (!bab) return null;
  return (
    <div className="report-bab bab-major" style={babSectionStyle}>
      <h2 style={babTitleStyle}>{bab.title}</h2>
      {lead}
      {bab.paragraphs?.map((p, idx) => (
        <p key={idx} style={paragraphStyle}>{p}</p>
      ))}
      {extra}
      {children}
    </div>
  );
}

// Visual: Radar Chart 5 Aspek SKB
function RadarAspekChart({ scoring }) {
  if (!scoring?.aspects) return null;
  const data = Object.values(scoring.aspects).map((a) => ({
    aspek: a.meta.name.replace("Aspek Kelayakan ", "").split(" & ")[0],
    skor: a.pctPercent,
  }));
  return (
    <div style={{ margin: "20px 0", padding: 16, background: "#F8FAFC", borderRadius: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 12, textAlign: "center" }}>
        Profil Kelayakan 5 Aspek SKB
      </div>
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <RadarChart data={data}>
            <PolarGrid stroke="#CBD5E1" />
            <PolarAngleAxis dataKey="aspek" tick={{ fontSize: 11, fill: "#475569" }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: "#94A3B8" }} />
            <Radar name="Skor" dataKey="skor" stroke={PALETTE.primary} fill={PALETTE.primary} fillOpacity={0.35} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ScoringTable({ scoring }) {
  if (!scoring?.aspects) return null;
  return (
    <div style={{ marginTop: 16, overflow: "hidden", borderRadius: 8, border: `1px solid #E2E8F0` }}>
      <table style={tableStyle}>
        <thead>
          <tr style={{ background: "#F1F5F9" }}>
            <th style={thStyle}>ASPEK</th>
            <th style={{ ...thStyle, textAlign: "right" }}>SKOR</th>
            <th style={{ ...thStyle, textAlign: "right" }}>VERDICT</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(scoring.aspects).map((a) => (
            <tr key={a.meta.code} style={{ borderTop: `1px solid #E2E8F0` }}>
              <td style={tdStyle}>{a.meta.name}</td>
              <td style={{ ...tdStyle, textAlign: "right", fontFamily: "monospace" }}>{a.pctPercent}%</td>
              <td style={{ ...tdStyle, textAlign: "right", fontFamily: "monospace", fontWeight: 700 }}>{a.verdictLabel}</td>
            </tr>
          ))}
          <tr style={{ background: "#0F172A", color: "#fff" }}>
            <td style={{ ...tdStyle, fontWeight: 800 }}>AGREGAT</td>
            <td style={{ ...tdStyle, textAlign: "right", fontFamily: "monospace", fontWeight: 800 }}>{scoring.totalScore}%</td>
            <td style={{ ...tdStyle, textAlign: "right", fontFamily: "monospace", fontWeight: 800 }}>{scoring.overallVerdictLabel}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function RevenueBarChart({ fin }) {
  if (!fin?.projection) return null;
  const data = fin.projection.map((y) => ({
    name: `Tahun ${y.year}`,
    Penjualan: Math.round(y.revenue / 1e6),
    "Laba Kotor": Math.round(y.grossProfit / 1e6),
    "Laba Bersih": Math.round(y.netIncome / 1e6),
  }));
  return (
    <div style={{ margin: "20px 0", padding: 16, background: "#F8FAFC", borderRadius: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 12, textAlign: "center" }}>
        Proyeksi Penjualan & Laba 3 Tahun (juta rupiah)
      </div>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#475569" />
            <YAxis tick={{ fontSize: 10 }} stroke="#475569" />
            <Tooltip formatter={(v) => `Rp ${v} jt`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Penjualan" fill={PALETTE.primary} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Laba Kotor" fill={PALETTE.success} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Laba Bersih" fill={PALETTE.purple} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function FundingPieChart({ forms }) {
  const f = forms?.modal?.funding || {};
  const data = [
    { name: "Modal Pribadi", value: f.modalPribadi || 0, color: PALETTE.primary },
    { name: "Modal Mitra", value: f.modalMitra || 0, color: PALETTE.success },
    { name: "Modal Pinjaman", value: f.modalPinjaman || 0, color: PALETTE.warning },
  ].filter((d) => d.value > 0);
  if (data.length === 0) return null;
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div style={{ margin: "20px 0", padding: 16, background: "#F8FAFC", borderRadius: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 12, textAlign: "center" }}>
        Komposisi Sumber Dana — Total {formatRp(total)}
      </div>
      <div style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={(d) => `${d.name}: ${((d.value/total)*100).toFixed(0)}%`}>
              {data.map((d) => <Cell key={d.name} fill={d.color} />)}
            </Pie>
            <Tooltip formatter={(v) => formatRp(v)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function KpiSummaryGrid({ fin, scoring }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, margin: "20px 0" }}>
      <KpiCard label="NPV" value={formatRp(fin.npv)} verdict={fin.npv > 0 ? "good" : "bad"} />
      <KpiCard label="IRR" value={fin.irrPct != null ? `${fin.irrPct}%` : "—"} verdict={fin.irr > fin.wacc ? "good" : "bad"} />
      <KpiCard label="Payback" value={fin.paybackMonths ? `${fin.paybackMonths} bln` : "> 36 bln"} verdict={fin.paybackMonths <= 36 ? "good" : "bad"} />
      <KpiCard label="BEP/bulan" value={formatRp(fin.bep?.bepMonthlySales || 0)} verdict="neutral" />
      <KpiCard label="Skor SKB" value={`${scoring.totalScore}%`} verdict={scoring.totalScore >= 70 ? "good" : scoring.totalScore >= 45 ? "neutral" : "bad"} />
    </div>
  );
}

function KpiCard({ label, value, verdict }) {
  const color = verdict === "good" ? PALETTE.success : verdict === "bad" ? PALETTE.danger : PALETTE.primary;
  return (
    <div style={{ padding: 12, background: "#F8FAFC", borderLeft: `3px solid ${color}`, borderRadius: 6 }}>
      <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700, letterSpacing: "0.1em" }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", marginTop: 2, fontFamily: "monospace" }}>{value}</div>
    </div>
  );
}

function LampiranFotos({ fotos }) {
  if (!fotos || fotos.length === 0) return null;
  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 14, paddingBottom: 6, borderBottom: `1px solid #E2E8F0` }}>
        Dokumentasi Visual
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {fotos.map((foto, idx) => (
          <div key={foto.id} className="lampiran-foto" style={{ border: `1px solid #E2E8F0`, borderRadius: 6, overflow: "hidden", background: "#fff" }}>
            <img src={foto.dataUrl} alt={foto.caption || foto.name} style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
            <div style={{ padding: 10, fontSize: 11.5, color: "#475569", lineHeight: 1.5 }}>
              <strong>Gambar {idx + 1}.</strong> {foto.caption || foto.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportFooter() {
  return (
    <div style={{ marginTop: 40, paddingTop: 16, borderTop: `1px solid #E2E8F0`, fontSize: 11, color: "#64748B", textAlign: "center", fontFamily: "monospace" }}>
      Dokumen ini disusun otomatis oleh <strong>BizCast v5</strong> · Platform Studi Kelayakan Bisnis · {new Date().getFullYear()}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ padding: 32, background: COLORS.bgPanel, border: `2px dashed ${COLORS.border}`, borderRadius: 12, textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.textHi, margin: "0 0 8px" }}>Belum Bisa Generate Laporan</h3>
      <p style={{ fontSize: 13, color: COLORS.textSoft, maxWidth: 460, margin: "0 auto" }}>
        Lengkapi data di Tab 1 & Tab 2 supaya sistem bisa menyusun laporan 9 bab.
      </p>
    </div>
  );
}

// ============================================================================
// EXPORT BUILDERS — Standalone HTML & Word dengan visual embed
// ============================================================================

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

function buildBabHtml(bab, leadHtml = "") {
  if (!bab) return "";
  const paras = (bab.paragraphs || [])
    .map((p) => `<p style="text-align:justify; text-indent:24px; margin:0 0 12px; line-height:1.75;">${escapeHtml(p)}</p>`)
    .join("\n");
  return `<section style="page-break-before:always; padding-top:14px;">
    <h2 style="font-size:18px; font-weight:700; color:#0F172A; border-bottom:2px solid #0F172A; padding-bottom:8px; margin:0 0 18px;">${escapeHtml(bab.title)}</h2>
    ${leadHtml}
    ${paras}
  </section>`;
}

function buildScoringHtml(scoring) {
  if (!scoring?.aspects) return "";
  const radar = `<div style="margin:18px auto 6px; max-width:560px; page-break-inside:avoid;">${radarSvgString(scoring, 560)}</div>`;
  const rows = Object.values(scoring.aspects).map((a) => `
    <tr style="border-top:1px solid #E2E8F0;">
      <td style="padding:8px 12px;">${escapeHtml(a.meta.name)}</td>
      <td style="padding:8px 12px; text-align:right; font-family:monospace;">${a.pctPercent}%</td>
      <td style="padding:8px 12px; text-align:right; font-family:monospace; font-weight:700;">${escapeHtml(a.verdictLabel || "")}</td>
    </tr>`).join("");
  return `${radar}<table style="width:100%; border-collapse:collapse; margin-top:14px; font-size:12px; border:1px solid #E2E8F0;">
    <thead><tr style="background:#F1F5F9;">
      <th style="padding:8px 12px; text-align:left; font-size:10px; letter-spacing:0.08em;">ASPEK</th>
      <th style="padding:8px 12px; text-align:right; font-size:10px; letter-spacing:0.08em;">SKOR</th>
      <th style="padding:8px 12px; text-align:right; font-size:10px; letter-spacing:0.08em;">VERDICT</th>
    </tr></thead>
    <tbody>${rows}
      <tr style="background:#0F172A; color:#fff;">
        <td style="padding:10px 12px; font-weight:800;">AGREGAT</td>
        <td style="padding:10px 12px; text-align:right; font-family:monospace; font-weight:800;">${scoring.totalScore}%</td>
        <td style="padding:10px 12px; text-align:right; font-family:monospace; font-weight:800;">${escapeHtml(scoring.overallVerdictLabel || "")}</td>
      </tr>
    </tbody>
  </table>`;
}

function buildLampiranHtml(fotos) {
  if (!fotos || fotos.length === 0) return "";
  const cards = fotos.map((foto, idx) => `
    <div style="border:1px solid #E2E8F0; border-radius:6px; overflow:hidden; background:#fff; page-break-inside:avoid;">
      <img src="${foto.dataUrl}" alt="" style="width:100%; height:auto; max-height:300px; object-fit:cover; display:block;" />
      <div style="padding:10px 12px; font-size:11.5px; color:#475569;">
        <strong>Gambar ${idx + 1}.</strong> ${escapeHtml(foto.caption || foto.name)}
      </div>
    </div>`).join("");
  return `<div style="margin-top:24px;">
    <h3 style="font-size:14px; font-weight:700; color:#0F172A; margin-bottom:14px; padding-bottom:6px; border-bottom:1px solid #E2E8F0;">
      Dokumentasi Visual
    </h3>
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px;">
      ${cards}
    </div>
  </div>`;
}

function buildBodyHtml(report, mode, fotos, forms, namaPemohon, pathwayCode) {
  return `
    ${buildConfidentialCoverHtml(report.identitas, mode, namaPemohon)}
    ${buildTableOfContentsHtml(pathwayCode)}
    ${buildBabHtml(report.bab1)}
    ${buildBabHtml(report.bab2)}
    ${buildBab2VisualHtml(forms)}
    ${buildBabHtml(report.bab3)}
    ${buildBab3VisualHtml(forms)}
    ${buildBabHtml(report.bab4)}
    ${buildScoringHtml(report.scoring)}
    ${buildBabHtml(report.bab5)}
    ${buildBab5VisualHtml(forms)}
    ${buildBabHtml(report.bab6)}
    ${buildPathwaySpecificHtml(pathwayCode, forms, report.financials)}
    <!-- BAB 7: permintaan pendanaan — kembali ke posisi sebelum Bab 8 (v13.7) -->
    ${buildBabHtml(report.bab7, buildFundingAskHeroHtml(report.bab7?.fundingAsk))}
    ${buildStartupRequirementsHtml(forms)}
    ${buildBabHtml(report.bab8)}
    ${buildProFormaPLHtml(report.financials, forms)}
    ${buildBusinessRatiosHtml(report.financials, forms)}
    ${buildBabHtml(report.bab9)}
    ${buildProFormaCashFlowHtml(report.financials, forms)}
    ${buildProFormaBalanceSheetHtml(report.financials, forms)}
    ${buildGeneralAssumptionsHtml(report.financials, forms)}
    ${buildLampiranHtml(fotos)}
    ${buildAppendixMonthlyHtml(forms)}
    <div style="margin-top:40px; padding-top:14px; border-top:1px solid #E2E8F0; font-size:11px; color:#64748B; text-align:center; font-family:monospace;">
      Dokumen ini disusun otomatis oleh <strong>BizCast v5</strong> · Platform Studi Kelayakan Bisnis · ${new Date().getFullYear()}
    </div>
  `;
}

function buildStandaloneHtml(report, mode, fotos, forms, namaPemohon, pathwayCode) {
  const body = buildBodyHtml(report, mode, fotos, forms, namaPemohon, pathwayCode);
  return `<!DOCTYPE html>
<html lang="id"><head>
<meta charset="UTF-8">
<title>${escapeHtml((report.identitas.namaBisnis || "Bisnis") + " — SKB")}</title>
<style>
  body { font-family: ${FONT_STACK}; max-width: 780px; margin: 30px auto; padding: 0 24px; color: #1e293b; line-height: 1.65; }
  @media print { body { margin: 0; } @page { margin: 2cm 2cm 2cm 2.5cm; size: A4; } }
</style>
</head><body>${body}</body></html>`;
}

function buildWordHtml(report, mode, fotos, forms, namaPemohon, pathwayCode) {
  const body = buildBodyHtml(report, mode, fotos, forms, namaPemohon, pathwayCode);
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"><meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>${escapeHtml((report.identitas.namaBisnis || "Bisnis") + " — SKB")}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->
<style>
  @page { size: A4; margin: 2cm 2cm 2cm 2.5cm; }
  body { font-family: ${FONT_STACK}; font-size: 11pt; line-height: 1.6; color: #1e293b; }
</style>
</head><body>${body}</body></html>`;
}

function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ============================================================================
// STYLES
// ============================================================================
const previewStyle = {
  padding: 28, background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 10,
  lineHeight: 1.65, color: "#1e293b",
};
const headerStyle = { textAlign: "center", padding: "30px 0 32px", borderBottom: `3px solid #0F172A`, marginBottom: 24 };
const babSectionStyle = { marginTop: 30, paddingTop: 16 };
const babTitleStyle = { fontSize: 19, fontWeight: 700, color: "#0F172A", borderBottom: `2px solid #0F172A`, paddingBottom: 8, marginTop: 0, marginBottom: 16, letterSpacing: "-0.2px" };
const paragraphStyle = { fontSize: 14, color: "#1e293b", textAlign: "justify", textIndent: 24, margin: "0 0 12px", lineHeight: 1.75 };
const sectionTitleStyle = { fontSize: 10, letterSpacing: "0.2em", color: COLORS.accent, fontFamily: "monospace", fontWeight: 700, marginBottom: 6 };
const tableStyle = { width: "100%", borderCollapse: "collapse", fontSize: 12.5 };
const thStyle = { padding: "10px 12px", textAlign: "left", fontSize: 10, fontFamily: "monospace", color: "#475569", letterSpacing: "0.1em", fontWeight: 700 };
const tdStyle = { padding: "9px 12px", fontSize: 12.5, color: "#1e293b" };
