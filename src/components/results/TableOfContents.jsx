// ============================================================================
// TableOfContents (Hotfix 11.5+12.0) — Daftar Isi otomatis + Bab khusus per jalur
//
// Placement: setelah Cover Page, sebelum Bab 1.
// ============================================================================

// Refactor v13: dua bab khusus per stage — 6.5 (jenis bisnis) + 6.6 (pendanaan)
const STAGE_SPECIAL_BABS = {
  baru: [
    { num: "6.5", title: "Validasi Ide & Analisis Kompetitif", desc: "Validasi masalah-solusi, UVP, dan rincian kebutuhan modal awal masif (start-up requirements)" },
    { num: "6.6", title: "Struktur Pendanaan, Use of Funds & Mitigasi Risiko", desc: "Alokasi dana, repayment capacity, DSCR, dan matriks mitigasi 5 risiko" },
  ],
  lanjutan: [
    { num: "6.5", title: "Kinerja Historis & Proyeksi Konsolidasi", desc: "Snapshot baseline riil, kapasitas & bottleneck, komparasi sebelum vs setelah pengembangan" },
    { num: "6.6", title: "Struktur Pendanaan, Use of Funds & Mitigasi Risiko", desc: "Alokasi dana, DSCR diperkuat laba eksisting, dan matriks mitigasi 5 risiko" },
  ],
};

const BASE_TOC_ITEMS = [
  { num: "1", title: "Ringkasan Eksekutif", desc: "Sinopsis bisnis, peluang pasar, dan kelayakan finansial" },
  { num: "2", title: "Analisis Peluang Bisnis", desc: "Masalah pelanggan, solusi, dan segmentasi target" },
  { num: "3", title: "Strategi Eksekusi", desc: "Pemasaran, kanal penjualan, dan rencana operasional" },
  { num: "4", title: "Rekapitulasi Kelayakan 5 Aspek SKB", desc: "Penilaian Pemasaran, Teknis, Manajemen, Hukum, Lingkungan" },
  { num: "5", title: "Profil Tim & Perusahaan", desc: "Visi, misi, struktur organisasi, dan kompetensi pendiri" },
  { num: "6", title: "Rencana Keuangan", desc: "Proyeksi pendapatan, laba kotor, dan laba bersih 3 tahun" },
  // 6.5 & 6.6 di-insert per jalur
  // v13.7: Bab 7 kembali ke posisi alaminya — sebelum Bab 8 (urutan lebih rapi)
  { num: "7", title: "Permintaan Pendanaan & Struktur Modal", desc: "Angka dana yang diminta, rincian kebutuhan, dan sumber dananya — inti proposal ini", core: true },
  { num: "8", title: "Pro Forma & Indikator Kelayakan", desc: "NPV, IRR, Payback Period, BEP, dan Pro Forma P&L" },
  { num: "9", title: "Lampiran & Pro Forma Detail", desc: "Cash Flow, Neraca, Asumsi Umum" },
  { num: "A", title: "Lampiran Detail Bulanan", desc: "Proyeksi penjualan, HPP, SDM per bulan, dan foto pendukung", append: true },
];

function getTocItems(stage) {
  const specials = STAGE_SPECIAL_BABS[stage] || STAGE_SPECIAL_BABS.baru;
  const items = [...BASE_TOC_ITEMS];
  const idx = items.findIndex((it) => it.num === "6");
  specials.forEach((sp, i) => {
    items.splice(idx + 1 + i, 0, { ...sp, special: true });
  });
  return items;
}

export default function TableOfContents({ pathwayCode }) {
  const TOC_ITEMS = getTocItems(pathwayCode);
  return (
    <div className="report-bab bab-major" style={tocWrapStyle}>
      {/* Header */}
      <div style={{ textAlign: "center", paddingBottom: 24, marginBottom: 28, borderBottom: "2px solid #0F172A" }}>
        <div style={{ fontSize: 10, color: "#0EA5E9", fontFamily: "monospace", letterSpacing: "0.3em", marginBottom: 8, fontWeight: 700 }}>
          ◆ NAVIGASI DOKUMEN
        </div>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
          Daftar Isi
        </h2>
      </div>

      {/* TOC List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {TOC_ITEMS.map((item) => (
          <div key={item.num} style={{ ...tocRowStyle, ...(item.special ? { background: "#FEF3C7", borderColor: "#F59E0B" } : {}), ...(item.core ? { background: "#EFF6FF", borderColor: "#0EA5E9" } : {}) }}>
            <div style={{ ...tocNumberStyle, ...(item.special ? { background: "#F59E0B" } : {}), ...(item.core ? { background: "#0EA5E9" } : {}) }}>
              {item.append ? "App." : `Bab ${item.num}`}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", lineHeight: 1.3 }}>
                {item.title}
                {item.special && <span style={{ marginLeft: 8, padding: "2px 6px", background: "#F59E0B", color: "#fff", fontSize: 9, fontFamily: "monospace", fontWeight: 700, borderRadius: 3, letterSpacing: "0.1em", verticalAlign: "middle" }}>KHUSUS</span>}
                {item.core && <span style={{ marginLeft: 8, padding: "2px 6px", background: "#0EA5E9", color: "#fff", fontSize: 9, fontFamily: "monospace", fontWeight: 700, borderRadius: 3, letterSpacing: "0.1em", verticalAlign: "middle" }}>INTI PROPOSAL</span>}
              </div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 2, lineHeight: 1.4 }}>
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div style={{ marginTop: 30, padding: "12px 14px", background: "#F1F5F9", borderRadius: 6, fontSize: 11, color: "#475569", textAlign: "center", fontStyle: "italic" }}>
        Dokumen ini disusun dengan kerangka <strong>Studi Kelayakan Bisnis (SKB)</strong> yang mengevaluasi 5 aspek fundamental: Pemasaran, Teknis, Manajemen, Hukum, dan Lingkungan & Sosial Ekonomi.
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// HTML Builder for Export
// ----------------------------------------------------------------------------
export function buildTableOfContentsHtml(pathwayCode) {
  const TOC_ITEMS = getTocItems(pathwayCode);
  const rows = TOC_ITEMS.map((item) => {
    const rowStyle = item.special
      ? "background:#FEF3C7; border:1px solid #F59E0B;"
      : item.core
        ? "background:#EFF6FF; border:1px solid #0EA5E9;"
        : "background:#F8FAFC; border:1px solid #E2E8F0;";
    const numBg = item.special ? "#F59E0B" : item.core ? "#0EA5E9" : "#0F172A";
    const badge = item.special
      ? `<span style="margin-left:8px; padding:2px 6px; background:#F59E0B; color:#fff; font-size:9px; font-family:monospace; font-weight:700; border-radius:3px; letter-spacing:0.1em;">KHUSUS</span>`
      : item.core
        ? `<span style="margin-left:8px; padding:2px 6px; background:#0EA5E9; color:#fff; font-size:9px; font-family:monospace; font-weight:700; border-radius:3px; letter-spacing:0.1em;">INTI PROPOSAL</span>`
        : "";
    return `
    <div style="display:flex; align-items:flex-start; gap:16px; padding:12px 14px; ${rowStyle} border-radius:8px; margin-bottom:10px;">
      <div style="min-width:80px; padding:6px 10px; background:${numBg}; color:#fff; font-family:monospace; font-size:11px; font-weight:700; letter-spacing:0.05em; border-radius:4px; text-align:center;">
        ${item.append ? "App." : `Bab ${item.num}`}
      </div>
      <div style="flex:1;">
        <div style="font-size:14px; font-weight:700; color:#0F172A; line-height:1.3;">${item.title}${badge}</div>
        <div style="font-size:11px; color:#64748B; margin-top:2px; line-height:1.4;">${item.desc}</div>
      </div>
    </div>
  `;
  }).join("");

  return `<div style="padding:40px 30px; page-break-after:always;">
    <div style="text-align:center; padding-bottom:24px; margin-bottom:28px; border-bottom:2px solid #0F172A;">
      <div style="font-size:10px; color:#0EA5E9; font-family:monospace; letter-spacing:0.3em; margin-bottom:8px; font-weight:700;">◆ NAVIGASI DOKUMEN</div>
      <h2 style="font-size:30px; font-weight:800; color:#0F172A; margin:0; letter-spacing:-0.5px;">Daftar Isi</h2>
    </div>
    ${rows}
    <div style="margin-top:30px; padding:12px 14px; background:#F1F5F9; border-radius:6px; font-size:11px; color:#475569; text-align:center; font-style:italic;">
      Dokumen ini disusun dengan kerangka <strong>Studi Kelayakan Bisnis (SKB)</strong> yang mengevaluasi 5 aspek fundamental: Pemasaran, Teknis, Manajemen, Hukum, dan Lingkungan & Sosial Ekonomi.
    </div>
  </div>`;
}

// ============================================================================
// STYLES
// ============================================================================
const tocWrapStyle = { padding: "40px 30px", pageBreakAfter: "always" };
const tocRowStyle = { display: "flex", alignItems: "flex-start", gap: 16, padding: "12px 14px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8 };
const tocNumberStyle = { minWidth: 80, padding: "6px 10px", background: "#0F172A", color: "#fff", fontFamily: "monospace", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", borderRadius: 4, textAlign: "center" };
