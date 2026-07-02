import { useState, Suspense } from "react";
import { useApp } from "../../state/AppContext.jsx";
import { getPathway, getSubtab, BAB_LABELS } from "../../data/pathways.js";
import { COLORS } from "../primitives/styles.js";
import Button from "../primitives/Button.jsx";
import FormPrimitivesDemo from "./FormPrimitivesDemo.jsx";
import { getSubtabComponent } from "../forms/subtabRegistry.js";

// ============================================================================
// <SubtabContent /> — area konten utama untuk sub-tab aktif
//
// Untuk Tahap 3: render placeholder yang memperlihatkan apa yang akan diisi
// di sub-tab ini (label, bab referensi, deskripsi). Tahap 4-5 akan mengganti
// placeholder ini dengan form input nyata.
//
// Struktur konten direncanakan dipindah ke registry mapping subtab → komponen
// di Tahap 4, sehingga komponen ini tetap kecil sebagai router internal.
// ============================================================================

// ----- Mapping rough: tahap mana sub-tab ini akan terisi -----
const FUTURE_TAHAP = {
  // Sub-tab di Tab 1 (Dasbor/Profil) — sebagian besar terisi di Tahap 4
  identitas: 4,
  hukum: 4,
  profil: 4,
  keuangan_eksisting: 4,
  profil_pemohon: 4,
  parameter_pendanaan: 4,
  // Sub-tab di Tab 2 (Formulir) — terisi di Tahap 5
  peluang: 5,
  pemasaran: 5,
  alatsdm: 5,
  proyeksi: 5,
  modal: 5,
  kuesioner: 5,
  pengembangan_pasar: 5,
  pemasaran_baru: 5,
  alatsdm_tambahan: 5,
  proyeksi_ekspansi: 5,
  modal_ekspansi: 5,
  kuesioner_ekspansi: 5,
  potensi_pasar: 5,
  use_of_funds: 5,
  operasional_sdm: 5,
  proyeksi_proforma: 5,
  kuesioner_skb: 5,
  // Sub-tab di Tab 3 (Hasil) — terisi di Tahap 7
  skor: 7,
  grafik: 7,
  bep: 7,
  skor_ekspansi: 7,
  grafik_lompatan: 7,
  payback_baru: 7,
  skor_yuridis: 7,
  pro_forma: 7,
  bankable: 7,
  // Sub-tab di Tab 4 (Cetak) — terisi di Tahap 10
  preview: 10,
  unduh: 10,
  finalisasi: 10,
};

export default function SubtabContent() {
  const { state } = useApp();
  const [showDemo, setShowDemo] = useState(false);

  const stage = state.app?.businessStage || "baru";
  if (!state.nav) return null;

  const pathway = getPathway(stage);
  const tab = pathway.tabs.find((t) => t.id === state.nav.tabId);
  const subtab = getSubtab(stage, state.nav.tabId, state.nav.subtabId);
  if (!tab || !subtab) return <NotFound />;

  // Mode Demo (Tahap 4 showcase) — bisa diakses dari tombol di placeholder.
  if (showDemo) {
    return (
      <div style={{ padding: "0 28px", maxWidth: 1000 }}>
        <FormPrimitivesDemo onClose={() => setShowDemo(false)} />
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 28px", maxWidth: 1000 }}>
      {/* Title */}
      <h1
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: COLORS.textHi,
          margin: "0 0 8px",
          letterSpacing: "-0.3px",
          lineHeight: 1.2,
        }}
      >
        {subtab.label}
      </h1>

      {/* Description */}
      {subtab.desc && (
        <p style={{ fontSize: 13.5, color: COLORS.textSoft, lineHeight: 1.6, marginBottom: 28, maxWidth: 720 }}>
          {subtab.desc}
        </p>
      )}

      {/* CONTENT — render form dari registry kalau sudah di-wire, atau placeholder kalau belum */}
      {(() => {
        const entry = getSubtabComponent(subtab.id);
        if (entry) {
          const { Component, props } = entry;
          // Refactor v13: inject stage ("baru"|"lanjutan") sebagai prop `mode`
          // agar semua section component menyesuaikan jenis bisnis aktif.
          return (
            <Suspense fallback={<LazyLoadingFallback />}>
              <Component {...props} mode={stage} stage={stage} />
            </Suspense>
          );
        }
        return (
          <Placeholder
            subtabId={subtab.id}
            pathway={pathway}
            onShowDemo={() => setShowDemo(true)}
          />
        );
      })()}
    </div>
  );
}

function Caret() {
  return <span style={{ color: COLORS.textDim, margin: "0 6px" }}>›</span>;
}

function Placeholder({ subtabId, pathway, onShowDemo }) {
  const futureTahap = FUTURE_TAHAP[subtabId] || "?";
  return (
    <div
      style={{
        background: COLORS.bgPanel,
        border: `2px dashed ${COLORS.border}`,
        borderRadius: 12,
        padding: 40,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 14 }}>📋</div>
      <h3
        style={{
          fontSize: 17,
          fontWeight: 700,
          color: COLORS.textHi,
          margin: "0 0 8px",
        }}
      >
        Bagian ini akan segera tersedia
      </h3>
      <p
        style={{
          fontSize: 13,
          color: COLORS.textSoft,
          lineHeight: 1.6,
          margin: "0 auto 20px",
          maxWidth: 480,
        }}
      >
        Silakan lanjutkan mengisi bagian lain terlebih dahulu — bagian ini akan terhubung otomatis setelah semua data terkumpul.
      </p>
    </div>
  );
}

// ============================================================================
// <LazyLoadingFallback /> — placeholder saat lazy chunk loading
// ============================================================================

function LazyLoadingFallback() {
  return (
    <div
      style={{
        padding: 40,
        textAlign: "center",
        color: COLORS.textMuted,
        fontSize: 13,
      }}
    >
      <div
        style={{
          display: "inline-block",
          width: 24,
          height: 24,
          border: `2px solid ${COLORS.border}`,
          borderTopColor: COLORS.accent,
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          marginBottom: 10,
        }}
      />
      <div>Memuat komponen…</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function NotFound() {
  const { navigate, state } = useApp();
  const pathway = getPathway(state.app?.businessStage || "baru");
  return (
    <div style={{ padding: 32, textAlign: "center" }}>
      <p style={{ color: COLORS.textSoft }}>Sub-tab tidak ditemukan.</p>
      <Button onClick={() => navigate(pathway.tabs[0].id)}>Kembali ke Tab 1</Button>
    </div>
  );
}
