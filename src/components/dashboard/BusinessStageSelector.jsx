import { useApp } from "../../state/AppContext.jsx";
import { COLORS } from "../primitives/styles.js";
import IsoGraphic from "../primitives/IsoGraphics.jsx";

// ============================================================================
// <BusinessStageSelector /> — sub-tab "Jenis Bisnis" di Tab 1 Dasbor
// (Refactor v13 — Single Persona: Pencari Dana)
//
// User memilih jenis bisnis: BARU atau LANJUTAN. Pilihan ini mengubah:
//   • Sub-tab yang tampil di seluruh aplikasi
//   • Isian profil bisnis (pemohon vs bisnis berjalan)
//   • Parameter & bobot kelayakan 5 aspek
//   • Struktur keuangan (asumsi murni vs konsolidasi baseline)
//   • Bab khusus dan judul laporan akhir
//
// Data form TIDAK dihapus saat berpindah — user bebas bolak-balik.
// ============================================================================

const STAGES = [
  {
    code: "baru",
    iso: "baru",
    label: "Bisnis Baru / Rintisan",
    tagline: "Saya merintis dari nol dan mencari pendanaan",
    accent: "#7DD3FC",
    accentBg: "#0D1828",
    accentBorder: "#1E3A5F",
    points: [
      "Validasi ide: masalah → solusi → segmen → keunggulan unik",
      "Rincian modal awal masif (start-up requirements) dari nol",
      "Proyeksi keuangan murni dari asumsi riset pasar + analisis BEP",
      "Skor kelayakan menimbang Aspek Pasar paling berat",
    ],
    reportNote: "Laporan: Proposal Pendanaan & SKB Bisnis Baru — Bab khusus Validasi Ide & Start-up Requirements.",
  },
  {
    code: "lanjutan",
    iso: "lanjutan",
    label: "Bisnis Lanjutan / Berjalan",
    tagline: "Bisnis sudah jalan, saya mencari dana pengembangan",
    accent: "#A3E635",
    accentBg: "#021810",
    accentBorder: "#064E3B",
    points: [
      "Snapshot kinerja riil: omset, margin, aset, hutang (rekam jejak)",
      "Analisis kapasitas, bottleneck, dan legalitas yang sudah dimiliki",
      "Keuangan konsolidasi: baseline berjalan + proyeksi pengembangan",
      "DSCR diperkuat arus kas eksisting — lebih meyakinkan bank",
    ],
    reportNote: "Laporan: Proposal Pendanaan & SKB Pengembangan Usaha — Bab khusus Kinerja Historis & Konsolidasi.",
  },
];

export default function BusinessStageSelector() {
  const { state, setBusinessStage } = useApp();
  const active = state.app?.businessStage || "baru";

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.25em", color: COLORS.accent, fontFamily: "monospace", fontWeight: 700, marginBottom: 6 }}>
          ◆ PENCARI DANA — TENTUKAN JENIS BISNIS ANDA
        </div>
        <p style={{ fontSize: 13, color: COLORS.textMid, lineHeight: 1.6, margin: 0, maxWidth: 640 }}>
          Seluruh isian profil, parameter kelayakan, rekap 5 aspek, struktur keuangan, hingga laporan akhir
          akan otomatis menyesuaikan pilihan ini. Data yang sudah diisi <strong style={{ color: COLORS.text }}>tidak hilang</strong> saat
          berpindah — Anda bebas membandingkan keduanya.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        {STAGES.map((s) => {
          const isActive = s.code === active;
          return (
            <button
              key={s.code}
              onClick={() => setBusinessStage(s.code)}
              style={{
                textAlign: "left",
                cursor: "pointer",
                padding: "20px 20px 16px",
                borderRadius: 12,
                background: isActive ? s.accentBg : COLORS.panel,
                border: `2px solid ${isActive ? s.accent : COLORS.border}`,
                boxShadow: isActive ? `0 0 0 4px ${s.accentBorder}55, 0 12px 28px -14px ${s.accent}66` : "none",
                transition: "all 0.18s ease",
                position: "relative",
              }}
            >
              {isActive && (
                <span style={{ position: "absolute", top: 14, right: 14, fontSize: 9, fontFamily: "monospace", fontWeight: 800, letterSpacing: "0.15em", color: "#0F172A", background: s.accent, padding: "3px 8px", borderRadius: 4 }}>
                  ✓ AKTIF
                </span>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                <IsoGraphic type={s.iso} size={72} />
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: isActive ? s.accent : COLORS.text, lineHeight: 1.2 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 11.5, color: COLORS.textMid, marginTop: 4 }}>{s.tagline}</div>
                </div>
              </div>

              <ul style={{ margin: "0 0 12px", paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                {s.points.map((pt) => (
                  <li key={pt} style={{ fontSize: 11.5, color: COLORS.textMid, lineHeight: 1.45, display: "flex", gap: 8 }}>
                    <span style={{ color: isActive ? s.accent : COLORS.textMuted, fontWeight: 700 }}>▸</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>

              <div style={{ fontSize: 10.5, color: isActive ? s.accent : COLORS.textMuted, fontFamily: "monospace", lineHeight: 1.5, borderTop: `1px dashed ${isActive ? s.accentBorder : COLORS.border}`, paddingTop: 10 }}>
                {s.reportNote}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 16, padding: "12px 16px", background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 11.5, color: COLORS.textMid, lineHeight: 1.6 }}>
        💡 <strong style={{ color: COLORS.text }}>Kenapa dibedakan?</strong> Standar studi kelayakan dan penilaian kredit menilai keduanya berbeda:
        bisnis baru dinilai dari <em>kekuatan asumsi & validasi pasar</em> (belum punya riwayat), sedangkan bisnis berjalan dinilai dari{" "}
        <em>rekam jejak keuangan & kemampuan bayar dari arus kas eksisting</em>. Memakai kerangka yang salah membuat proposal terlihat tidak kredibel di mata analis.
      </div>
    </div>
  );
}
