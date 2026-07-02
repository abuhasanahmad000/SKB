import { useFormSection } from "../../../state/useFormSection.js";
import { useApp } from "../../../state/AppContext.jsx";
import Section from "../Section.jsx";
import Field from "../Field.jsx";
import RupiahInput from "../RupiahInput.jsx";
import SmartFundingBalance from "../SmartFundingBalance.jsx";
import RuleBasedFillButton from "../RuleBasedFillButton.jsx";
import { COLORS } from "../../primitives/styles.js";
import { formatRp } from "../../../utils/format.js";
import {
  suggestStartupExpenses,
  suggestStokAwal,
} from "../../../engines/suggestionHelper.js";

// ============================================================================
// <ModalAwalForm /> — Bab 7 Pendanaan & Modal Awal
//
// Cover Bab 7.1 (Start-up Expenses), 7.2 (Start-up Assets), 7.3 (Funding Source).
//
// Mode mapping:
//   - "rintisan" (Jalur A → modal)             : modal awal bisnis baru
//   - "ekspansi" (Jalur B → modal_ekspansi)    : modal tambahan untuk ekspansi
//   - "pendanaan" (Jalur C → use_of_funds)     : alokasi dana yang diajukan
//
// CERDAS: Bab 7.2 nilai peralatan AUTO-DERIVE dari state.forms.alatSDM.equipment.
// User tidak perlu input ulang. Stok awal saja yang manual.
// ============================================================================

const MODE_TITLES = {
  baru: {
    main: "Anggaran Modal Awal (Start-up Requirements)",
    expensesDesc: "Biaya sekali bayar SEBELUM bisnis buka: legalitas, renovasi, promosi pembukaan. Ini sekaligus rincian Use of Funds yang dibaca pendana.",
    assetsDesc: "Modal aset & stok dagang awal. Nilai peralatan otomatis dari sub-tab Alat & Karyawan.",
    fundingDesc: "Komposisi sumber dana: modal sendiri + pinjaman/investor yang diajukan. Porsi modal sendiri menunjukkan komitmen Anda di mata pendana.",
  },
  lanjutan: {
    main: "Anggaran Modal Pengembangan",
    expensesDesc: "Biaya sekali bayar untuk pengembangan: renovasi unit baru, izin tambahan, promosi pembukaan unit. Ini rincian Use of Funds untuk pendana.",
    assetsDesc: "Stok awal tambahan untuk unit/produk baru. Peralatan otomatis dari sub-tab sebelumnya.",
    fundingDesc: "Komposisi modal pengembangan: kas internal bisnis + dana eksternal yang diajukan.",
  },
  rintisan: {
    main: "Modal Awal yang Dibutuhkan",
    expensesDesc: "Biaya sekali bayar yang harus dikeluarkan SEBELUM bisnis bisa buka.",
    assetsDesc: "Modal aset & stok dagang awal yang dibutuhkan.",
    fundingDesc: "Sumber dana yang akan menutup kebutuhan modal di atas.",
  },
};

export default function ModalAwalForm({ mode = "baru" }) {
  const [f, setField] = useFormSection("modal");
  const { state } = useApp();
  const cfg = MODE_TITLES[mode] || MODE_TITLES.baru;

  // === Derive: total peralatan dari state.forms.alatSDM.equipment ===
  const equipment = state.forms?.alatSDM?.equipment || [];
  const totalPeralatan = equipment.reduce(
    (s, e) => s + (e.qty || 0) * (e.pricePerUnit || 0),
    0
  );

  // === Total kebutuhan = expenses + assets ===
  const totalExpenses =
    (f.expenses?.legal || 0) +
    (f.expenses?.renovasi || 0) +
    (f.expenses?.promo || 0);
  const stokAwal = f.assets?.stok || 0;
  const totalAssets = stokAwal + totalPeralatan;
  const totalNeeded = totalExpenses + totalAssets;

  return (
    <>
      <Section
        icon="①"
        title="Biaya Start-up — Sekali Bayar (Bab 7.1)"
        desc={cfg.expensesDesc}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <Field label="Legalitas & Perizinan">
            <RupiahInput
              value={f.expenses?.legal || 0}
              onChange={(v) => setField("expenses", { ...(f.expenses || {}), legal: v })}
              hint="NIB, SIUP, izin lingkungan, dll."
            />
          </Field>
          <Field label="Renovasi & Dekorasi">
            <RupiahInput
              value={f.expenses?.renovasi || 0}
              onChange={(v) => setField("expenses", { ...(f.expenses || {}), renovasi: v })}
              hint="Pengecatan, pemasangan kitchen set, signage."
            />
          </Field>
          <Field label="Promosi Pembukaan">
            <RupiahInput
              value={f.expenses?.promo || 0}
              onChange={(v) => setField("expenses", { ...(f.expenses || {}), promo: v })}
              hint="Banner, voucher diskon grand opening."
            />
          </Field>
        </div>

        <RuleBasedFillButton
          getSuggestion={suggestStartupExpenses}
          onResult={(expenses) => setField("expenses", expenses)}
          label="✨ Isi Otomatis Biaya Start-up dari Data Pasar"
          hint="Angka legalitas, renovasi, dan promo disesuaikan dengan sektor & skala bisnis."
        />

        <SummaryRow label="Total Biaya Start-up" value={totalExpenses} />
      </Section>

      <Section
        icon="②"
        title="Modal Aset & Stok (Bab 7.2)"
        desc={cfg.assetsDesc}
      >
        <Field
          label="Modal Belanja Stok Awal / Bahan Baku Pertama"
          hint="Untuk usaha jasa, isi 0. Untuk kuliner/retail, isi modal pembelian bahan baku/dagangan pertama."
        >
          <RupiahInput
            value={f.assets?.stok || 0}
            onChange={(v) => setField("assets", { ...(f.assets || {}), stok: v })}
          />
          <RuleBasedFillButton
            getSuggestion={suggestStokAwal}
            onResult={(v) => setField("assets", { ...(f.assets || {}), stok: v })}
            label="✨ Suggest Stok Awal dari Data Pasar"
          />
        </Field>

        {/* Auto-derive peralatan */}
        <div
          style={{
            padding: "12px 14px",
            background: COLORS.bgPanelHi,
            border: `1px solid ${COLORS.infoBorder}`,
            borderLeft: `3px solid ${COLORS.info}`,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.15em",
                color: COLORS.info,
                fontFamily: "monospace",
                marginBottom: 4,
                fontWeight: 700,
              }}
            >
              🔗 AUTO DARI SUB-TAB SEBELUMNYA
            </div>
            <div style={{ fontSize: 12.5, color: COLORS.text, lineHeight: 1.5 }}>
              Total nilai peralatan dari Bab 3.4 ({equipment.length} item terdaftar)
            </div>
          </div>
          <div
            style={{
              fontSize: 16,
              fontFamily: "monospace",
              fontWeight: 800,
              color: COLORS.info,
            }}
          >
            {formatRp(totalPeralatan)}
          </div>
        </div>

        <SummaryRow label="Total Modal Aset & Stok" value={totalAssets} />
      </Section>

      <Section
        icon="③"
        title="Sumber Dana — Smart Balance Check (Bab 7.3)"
        desc={cfg.fundingDesc}
      >
        <SmartFundingBalance
          value={f.funding || {}}
          onChange={(v) => setField("funding", v)}
          totalNeeded={totalNeeded}
        />
      </Section>
    </>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div
      style={{
        marginTop: 14,
        padding: "10px 14px",
        background: COLORS.bgPanelDeep,
        borderRadius: 6,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderLeft: `3px solid ${COLORS.success}`,
      }}
    >
      <span
        style={{
          fontSize: 11,
          color: COLORS.textMuted,
          fontFamily: "monospace",
          letterSpacing: "0.1em",
          fontWeight: 700,
        }}
      >
        {label.toUpperCase()}
      </span>
      <span
        style={{
          fontSize: 15,
          fontFamily: "monospace",
          fontWeight: 800,
          color: COLORS.successHi,
        }}
      >
        {formatRp(value)}
      </span>
    </div>
  );
}
