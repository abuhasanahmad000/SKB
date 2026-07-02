import { useFormSection } from "../../../state/useFormSection.js";
import Section from "../Section.jsx";
import Field from "../Field.jsx";
import ChecklistMulti from "../ChecklistMulti.jsx";
import EquipmentTable from "../EquipmentTable.jsx";
import PersonnelTable from "../PersonnelTable.jsx";
import RuleBasedFillButton from "../RuleBasedFillButton.jsx";
import { BAB_3_4_TEKNOLOGI } from "../../../data/babOptions.js";
import { suggestEquipment, suggestPersonnel } from "../../../engines/suggestionHelper.js";

// ============================================================================
// <AlatSDMForm /> — Bab 3.4 (Teknologi & Peralatan) + Bab 6.3 (SDM)
//
// Mode mapping:
//   - "rintisan"   (Jalur A → alatsdm)             : kebutuhan dasar dari nol
//   - "ekspansi"   (Jalur B → alatsdm_tambahan)    : peralatan & SDM TAMBAHAN saja
//   - "pendanaan"  (Jalur C → operasional_sdm)     : penekanan kontrol keuangan
// ============================================================================

const MODE_CONFIG = {
  baru: {
    teknologiDesc: "Sistem teknologi (POS/QRIS/pembukuan) yang menjamin transparansi keuangan bagi pendana — wajib untuk bisnis tanpa rekam jejak.",
    equipmentDesc: "Peralatan utama yang harus dibeli dari nol — sebagian dibiayai dari dana yang diajukan.",
    sdmDesc: "Posisi karyawan yang akan direkrut, gaji bulanan, dan tunjangan.",
  },
  lanjutan: {
    teknologiDesc: "Tambahan sistem teknologi untuk unit/cabang baru — perkuat auditabilitas keuangan di mata pendana.",
    equipmentDesc: "HANYA peralatan TAMBAHAN untuk pengembangan — yang sudah ada tidak perlu didaftar ulang.",
    sdmDesc: "HANYA posisi karyawan TAMBAHAN yang direkrut untuk pengembangan.",
  },
  rintisan: {
    teknologiDesc: "Pilih sistem teknologi untuk transaksi & pencatatan keuangan harian.",
    equipmentDesc: "Daftarkan peralatan utama yang harus dibeli sebelum mulai operasi.",
    sdmDesc: "Centang posisi karyawan yang akan direkrut, isi gaji bulanan dan tunjangan.",
  },
};

export default function AlatSDMForm({ mode = "baru" }) {
  const [f, setField] = useFormSection("alatSDM");
  const cfg = MODE_CONFIG[mode] || MODE_CONFIG.baru;

  return (
    <>
      <Section
        icon="①"
        title="Sistem Teknologi & Pembayaran (Bab 3.4)"
        desc={cfg.teknologiDesc}
      >
        <Field label="Sistem teknologi yang akan dipakai">
          <ChecklistMulti
            options={BAB_3_4_TEKNOLOGI}
            value={f.teknologi || []}
            onChange={(v) => setField("teknologi", v)}
            previewPrefix="Pada sisi teknologi operasional, sistem yang digunakan mencakup "
            previewSuffix="."
          />
        </Field>
      </Section>

      <Section
        icon="②"
        title="Daftar Peralatan Kerja Utama (Bab 3.4)"
        desc={cfg.equipmentDesc}
      >
        <Field label="Peralatan & investasi alat">
          <EquipmentTable
            value={f.equipment || []}
            onChange={(v) => setField("equipment", v)}
          />
          <RuleBasedFillButton
            getSuggestion={suggestEquipment}
            onResult={(items) => setField("equipment", items)}
            label="✨ Isi Otomatis Peralatan dari Data Pasar"
            hint="Harga akan disesuaikan dengan sektor dan skala bisnis Anda."
          />
        </Field>
      </Section>

      <Section
        icon="③"
        title="Sumber Daya Manusia (Bab 6.3)"
        desc={cfg.sdmDesc}
      >
        <Field label="Susunan SDM">
          <PersonnelTable
            value={f.personnel || { positions: {}, allowanceMode: "tidak" }}
            onChange={(v) => setField("personnel", v)}
          />
          <RuleBasedFillButton
            getSuggestion={suggestPersonnel}
            onResult={(v) => setField("personnel", v)}
            label="✨ Isi Otomatis Susunan SDM (sesuai UMR & skala)"
            hint="Jumlah dan gaji posisi disesuaikan dengan UMP provinsi serta skala bisnis."
          />
        </Field>
      </Section>
    </>
  );
}
