import { useFormSection } from "../../../state/useFormSection.js";
import { useApp } from "../../../state/AppContext.jsx";
import { useMemo, useEffect } from "react";
import Section from "../Section.jsx";
import Field from "../Field.jsx";
import RupiahInput from "../RupiahInput.jsx";
import DropdownSingle from "../DropdownSingle.jsx";
import NumberInput from "../NumberInput.jsx";
import { COLORS } from "../../primitives/styles.js";
import { formatRp, formatRpFull } from "../../../utils/format.js";
import { deriveUseOfFunds, totalInitialInvestment } from "../../../engines/investmentHelper.js";

// ============================================================================
// <FundingTargetForm /> — Tab 1.2 Jalur C (Hotfix 11.1)
//
// PERUBAHAN: Total Pendanaan TIDAK LAGI di-input manual oleh user. Angkanya
// di-DERIVE OTOMATIS dari:
//   - Total kebutuhan dana = expenses + assets + equipment + opex (3 bulan)
//   - Sesuai jenis pendanaan:
//     • KUR / Kredit Komersial → tampilkan kebutuhan PINJAMAN
//     • Investor / Hibah       → tampilkan kebutuhan DARI MITRA
// ============================================================================

const JENIS_PENDANAAN = [
  { id: "kur",         label: "Pinjaman Bank — KUR (Kredit Usaha Rakyat)", kategori: "hutang",
    fragment: "menggunakan skema pinjaman bank melalui program Kredit Usaha Rakyat (KUR) dengan bunga subsidi pemerintah" },
  { id: "komersial",   label: "Pinjaman Bank — Kredit Komersial Reguler", kategori: "hutang",
    fragment: "menggunakan skema pinjaman bank komersial reguler dengan bunga pasar" },
  { id: "investor",    label: "Modal Investor / Equity Partnership", kategori: "ekuitas",
    fragment: "membuka pintu kemitraan modal (equity) dengan investor strategis dalam bentuk pembagian saham bisnis" },
  { id: "hibah",       label: "Hibah / Program Pemerintah / CSR", kategori: "ekuitas",
    fragment: "mengajukan program hibah atau pendanaan CSR dari pemerintah/lembaga sosial" },
];

const JAMINAN = [
  { id: "tanah_bangunan",    label: "Sertifikat Tanah / Bangunan" },
  { id: "kendaraan",         label: "BPKB Kendaraan (Motor/Mobil)" },
  { id: "tabungan_deposito", label: "Tabungan / Deposito" },
  { id: "tidak_ada",         label: "Tidak Ada Agunan (KUR Mikro / Kemitraan Saham)" },
];

export default function FundingTargetForm({ stage = "baru" }) {
  const [f, setField] = useFormSection("fundingTarget");
  const { state } = useApp();

  // Derive total kebutuhan dana dari Initial Investment (tab Keuangan)
  const derivedFunding = useMemo(() => {
    const m = state.forms?.modal || {};
    const funding = m.funding || {};
    return {
      modalPinjaman: funding.modalPinjaman || 0,
      modalMitra: funding.modalMitra || 0,
      modalPribadi: funding.modalPribadi || 0,
    };
  }, [state.forms?.modal]);

  // Pilih kategori jenis pendanaan
  const jenisDetail = JENIS_PENDANAAN.find((j) => j.id === f.jenisPendanaan);
  const isHutang = jenisDetail?.kategori === "hutang";
  const isEkuitas = jenisDetail?.kategori === "ekuitas";

  // Nominal otomatis tergantung jenis pendanaan
  const nominalAuto = isHutang ? derivedFunding.modalPinjaman
    : isEkuitas ? derivedFunding.modalMitra
    : 0;

  // Sync ke state setiap kali derived change (supaya reportAssembler bisa baca)
  useEffect(() => {
    if (nominalAuto !== f.nominal) {
      setField("nominal", nominalAuto);
    }
  }, [nominalAuto]); // eslint-disable-line

  const isFundingFilled = derivedFunding.modalPinjaman > 0 || derivedFunding.modalMitra > 0;

  return (
    <>
      {/* Section 1: PILIH JENIS DULU (urutan dibalik) */}
      <Section
        icon="①"
        title="Jenis Pendanaan yang Diajukan"
        desc="Pilih skema. Sistem akan otomatis menghitung nominal sesuai jenis dan rincian Initial Investment di tab Keuangan."
      >
        <Field label="Skema yang Diajukan" required>
          <DropdownSingle
            options={JENIS_PENDANAAN}
            value={f.jenisPendanaan}
            onChange={(v) => setField("jenisPendanaan", v)}
            showFragment
          />
        </Field>
      </Section>

      {/* Section 2: Total auto-derived */}
      <Section
        icon="②"
        title="Total Pendanaan yang Diajukan (Otomatis)"
        desc="Nominal dihitung otomatis dari sumber dana pada Smart Balance Check di tab Keuangan ▸ Initial Investment."
      >
        {!f.jenisPendanaan ? (
          <div style={infoBoxStyle("info")}>
            ⓘ Pilih jenis pendanaan di section ① supaya sistem tahu nominal apa yang ditampilkan.
          </div>
        ) : !isFundingFilled ? (
          <div style={infoBoxStyle("warn")}>
            ⚠ Anda belum mengisi <strong>sumber dana</strong> di tab <strong>Keuangan ▸ Initial Investment &amp; Sumber Dana</strong>.
            Silakan lengkapi dulu — total pendanaan akan otomatis muncul di sini.
          </div>
        ) : (
          <div style={autoDerivedCardStyle}>
            <div style={{ fontSize: 10.5, color: COLORS.textMuted, fontFamily: "monospace", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 6 }}>
              {isHutang ? "◆ TOTAL PINJAMAN YANG DIAJUKAN" : "◆ TOTAL DANA DARI MITRA/HIBAH"}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.textHi, fontFamily: "monospace", lineHeight: 1.1 }}>
              {formatRp(nominalAuto)}
            </div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "monospace", marginTop: 4 }}>
              ({formatRpFull(nominalAuto)})
            </div>
            <div style={{ fontSize: 11.5, color: COLORS.textSoft, lineHeight: 1.55, marginTop: 14, paddingTop: 12, borderTop: `1px dashed ${COLORS.border}` }}>
              {isHutang
                ? "Angka ini adalah nominal pinjaman yang akan diajukan ke bank — dihitung dari kolom 'Pinjaman Bank' pada Smart Balance Check (tab Keuangan)."
                : "Angka ini adalah dana dari mitra/investor/hibah — dihitung dari kolom 'Dana dari Mitra/Investor' pada Smart Balance Check (tab Keuangan)."}
              {" "}Untuk mengubahnya, edit sumber dana di sub-tab tersebut.
            </div>
          </div>
        )}
      </Section>

      {/* Section 3: Tenor (untuk hutang saja) */}
      {isHutang && (
        <Section
          icon="③"
          title="Tenor Pinjaman"
          desc="Jangka waktu pengembalian pinjaman dalam bulan."
        >
          <Field label="Tenor (bulan)" hint="Idealnya 24-60 bulan untuk UMKM. KUR umumnya 36-60 bulan.">
            <NumberInput
              value={f.tenor || 36}
              onChange={(v) => setField("tenor", v)}
              min={6}
              max={120}
            />
          </Field>
        </Section>
      )}

      {/* Section 4: Agunan — hanya untuk hutang */}
      {isHutang && (
        <Section
          icon="④"
          title="Agunan / Jaminan"
          desc="Untuk skema bank komersial — jaminan akan dilampirkan di bagian profil pemohon."
        >
          <Field label="Status Agunan">
            <DropdownSingle
              options={JAMINAN}
              value={f.jaminan}
              onChange={(v) => setField("jaminan", v)}
            />
          </Field>
          <Field label="Tenor Pinjaman (Bulan)" hint="Berapa lama jangka pinjaman? Standar KUR: 36 bulan; Komersial: 36-60 bulan.">
            <NumberInput
              value={f.tenor || 36}
              onChange={(v) => setField("tenor", v)}
              min={6} max={120} suffix="bulan"
            />
          </Field>
        </Section>
      )}

      {/* ⑤ Ringkasan Use of Funds — read-only (v13.1: input pindah ke tab Keuangan) */}
      <Section
        icon="⑤"
        title="Ringkasan Use of Funds (Otomatis)"
        desc="Alokasi penggunaan dana di-derive otomatis dari rincian Initial Investment di tab Keuangan — tidak perlu input dua kali."
      >
        <UseOfFundsReadOnly forms={state.forms} stage={stage} />
      </Section>

      {/* ⑥ Exit Strategy (hanya untuk equity) */}
      {isEkuitas && (
        <Section
          icon="⑥"
          title="Exit Strategy untuk Investor"
          desc="Untuk pendanaan equity — jelaskan bagaimana investor akan mendapatkan pengembalian (buyback, dividen, IPO, akuisisi)."
        >
          <Field label="Skenario Exit Strategy">
            <textarea
              value={f.exitStrategy || ""}
              onChange={(e) => setField("exitStrategy", e.target.value)}
              placeholder="cth. Tahun 3 manajemen membeli kembali saham investor (buyback) dengan valuasi 3x dari modal awal yang disetorkan, atau opsi pembagian dividen tahunan 8% dari laba bersih."
              rows={4}
              style={{
                width: "100%", padding: "10px 12px", background: "#fff",
                border: `1px solid ${COLORS.border}`, borderRadius: 6,
                fontSize: 12.5, fontFamily: "inherit", color: COLORS.text,
                resize: "vertical", lineHeight: 1.5, outline: "none", boxSizing: "border-box",
              }}
            />
          </Field>
        </Section>
      )}
    </>
  );
}

// ----------------------------------------------------------------------------
// Helper: UseOfFundsReadOnly — tampilan alokasi dana hasil derive otomatis
// ----------------------------------------------------------------------------
const UOF_LABELS = [
  ["legal", "Legalitas & Perizinan"],
  ["renovasi", "Renovasi, Setup & Sewa di Muka"],
  ["equipment", "Alat & Peralatan"],
  ["inventory", "Inventory / Stok"],
  ["marketing", "Marketing & Branding"],
  ["workingCapital", "Modal Kerja"],
  ["other", "Lain-lain / Cadangan"],
];

function UseOfFundsReadOnly({ forms, stage }) {
  const uof = deriveUseOfFunds(forms, stage);
  const total = totalInitialInvestment(forms);
  if (total === 0) {
    return (
      <div style={infoBoxStyle("info")}>
        ⓘ Belum ada rincian. Isi <strong>Initial Investment</strong> di tab <strong>Keuangan</strong> — ringkasan alokasi akan otomatis muncul di sini dan di Bab 6.6 laporan.
      </div>
    );
  }
  return (
    <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 8, overflow: "hidden" }}>
      {UOF_LABELS.filter(([k]) => (uof[k] || 0) > 0).map(([k, label]) => {
        const v = uof[k] || 0;
        const pct = total > 0 ? Math.round((v / total) * 100) : 0;
        return (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderBottom: `1px solid ${COLORS.border}` }}>
            <span style={{ flex: 1, fontSize: 12, color: COLORS.text }}>{label}</span>
            <span style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "monospace" }}>{pct}%</span>
            <span style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: COLORS.textHi, minWidth: 110, textAlign: "right" }}>{formatRp(v)}</span>
          </div>
        );
      })}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: COLORS.bgPanelDeep }}>
        <span style={{ flex: 1, fontSize: 11, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.08em", color: COLORS.textMuted }}>TOTAL</span>
        <span style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 800, color: COLORS.successHi }}>{formatRpFull(total)}</span>
      </div>
    </div>
  );
}

// ============================================================================

function infoBoxStyle(kind) {
  const cfg = kind === "warn"
    ? { bg: COLORS.warnBg, border: COLORS.warnBorder, color: COLORS.warnHi, leftBorder: COLORS.warn }
    : { bg: COLORS.infoBg, border: COLORS.infoBorder, color: COLORS.info, leftBorder: COLORS.info };
  return {
    padding: "12px 16px",
    background: cfg.bg,
    border: `1px solid ${cfg.border}`,
    borderLeft: `3px solid ${cfg.leftBorder}`,
    borderRadius: 6,
    fontSize: 12.5,
    color: cfg.color,
    lineHeight: 1.55,
  };
}

const autoDerivedCardStyle = {
  padding: 18,
  background: COLORS.bgPanelDeep,
  border: `2px solid ${COLORS.accentBorder}`,
  borderLeft: `4px solid ${COLORS.accent}`,
  borderRadius: 10,
};
