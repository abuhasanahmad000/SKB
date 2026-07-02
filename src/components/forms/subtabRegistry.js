import { lazy } from "react";
import IdentitasForm from "./sections/IdentitasForm.jsx";
import HukumForm from "./sections/HukumForm.jsx";
import ExistingBusinessForm from "./sections/ExistingBusinessForm.jsx";
import FundingTargetForm from "./sections/FundingTargetForm.jsx";
import PeluangPasarForm from "./sections/PeluangPasarForm.jsx";
import StrategiPemasaranForm from "./sections/StrategiPemasaranForm.jsx";
import AlatSDMForm from "./sections/AlatSDMForm.jsx";
import ProyeksiKeuanganForm from "./sections/ProyeksiKeuanganForm.jsx";
import InitialInvestmentForm from "./sections/InitialInvestmentForm.jsx";
import RisikoMitigasiForm from "./sections/RisikoMitigasiForm.jsx";
import LingkunganSosialForm from "./sections/LingkunganSosialForm.jsx";
import BusinessStageSelector from "../dashboard/BusinessStageSelector.jsx";

// Lazy-load komponen Tab 3 & 4 (Recharts berat ~250KB)
const SkorKelayakanPanel = lazy(() => import("../results/SkorKelayakanPanel.jsx"));
const Chart3Warna = lazy(() => import("../results/Chart3Warna.jsx"));
const BreakevenChart = lazy(() => import("../results/BepCalculator.jsx"));
const PaybackChart = lazy(() => import("../results/PaybackChart.jsx"));
const ProFormaTables = lazy(() => import("../results/ProFormaTables.jsx"));
const BankableIndicators = lazy(() => import("../results/BankableIndicators.jsx"));
const ExecutiveSummaryPanel = lazy(() => import("../results/ExecutiveSummaryPanel.jsx"));
const ReportExportPanel = lazy(() => import("../results/ReportExportPanel.jsx"));

// ============================================================================
// SUBTAB REGISTRY (Refactor v13 — Single Persona)
//
// Satu set sub-tab id untuk SEMUA user (pencari dana). Komponen menerima prop
// `stage` ("baru"|"lanjutan") yang di-inject otomatis oleh SubtabContent,
// sehingga registry tidak perlu lagi menduplikasi entry per jalur.
// ============================================================================

export const SUBTAB_REGISTRY = {
  // ===== Tab 1: Dasbor & Target Pendanaan =====
  jenis_bisnis: { Component: BusinessStageSelector, props: {} },
  identitas: { Component: IdentitasForm, props: {} },
  hukum: { Component: HukumForm, props: {} },                       // stage "baru"
  keuangan_eksisting: { Component: ExistingBusinessForm, props: {} }, // stage "lanjutan"
  parameter_pendanaan: { Component: FundingTargetForm, props: {} },

  // ===== Tab 2: Formulir Studi Kelayakan =====
  peluang: { Component: PeluangPasarForm, props: {} },
  pemasaran: { Component: StrategiPemasaranForm, props: {} },
  alatsdm: { Component: AlatSDMForm, props: {} },
  risiko: { Component: RisikoMitigasiForm, props: {} },
  kuesioner: { Component: LingkunganSosialForm, props: {} },

  // ===== Tab 3: Keuangan (v13.1 — semua input keuangan di sini) =====
  investasi_awal: { Component: InitialInvestmentForm, props: {} },
  proyeksi: { Component: ProyeksiKeuanganForm, props: {} },

  // ===== Tab 3: Hasil, Metrik & Analisis =====
  skor: { Component: SkorKelayakanPanel, props: {} },
  grafik: { Component: Chart3Warna, props: {} },
  bep: { Component: BreakevenChart, props: {} },        // stage "baru"
  payback: { Component: PaybackChart, props: {} },      // stage "lanjutan"
  pro_forma: { Component: ProFormaTables, props: {} },
  bankable: { Component: BankableIndicators, props: {} },

  // ===== Tab 4: Cetak Laporan =====
  finalisasi: { Component: ExecutiveSummaryPanel, props: {} },
  unduh: { Component: ReportExportPanel, props: {} },
};

/** Ambil entry registry untuk subtab tertentu, atau null bila belum di-wire. */
export function getSubtabComponent(subtabId) {
  return SUBTAB_REGISTRY[subtabId] || null;
}
