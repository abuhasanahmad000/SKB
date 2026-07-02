import { useFormSection } from "../../../state/useFormSection.js";
import Section from "../Section.jsx";
import Field from "../Field.jsx";
import ChecklistMulti from "../ChecklistMulti.jsx";
import DropdownSingle from "../DropdownSingle.jsx";
import {
  BAB_3_1_PEMASARAN,
  BAB_3_2_KANAL,
  BAB_3_3_STATUS_TEMPAT,
  BAB_3_3_KARAKTER_LOKASI,
} from "../../../data/babOptions.js";

// ============================================================================
// <StrategiPemasaranForm /> — Bab 3.1, 3.2, 3.3
//
// Mode mapping:
//   - "rintisan" (Jalur A → pemasaran)        : strategi pertama kali launching
//   - "ekspansi" (Jalur B → pemasaran_baru)   : strategi tambahan untuk cabang/produk baru
// ============================================================================

const MODE_LABELS = {
  baru: {
    pemasaran: "Strategi promosi peluncuran yang akan dijalankan",
    kanal: "Kanal penjualan yang akan dibuka",
    tempat: "Status kepemilikan lokasi usaha",
  },
  lanjutan: {
    pemasaran: "Strategi promosi tambahan untuk pengembangan/cabang/produk baru",
    kanal: "Kanal penjualan baru yang akan diaktifkan",
    tempat: "Status kepemilikan lokasi cabang/perluasan",
  },
  rintisan: {
    pemasaran: "Strategi promosi yang akan dijalankan",
    kanal: "Kanal penjualan yang akan dibuka",
    tempat: "Status kepemilikan lokasi usaha",
  },
};

export default function StrategiPemasaranForm({ mode = "baru" }) {
  const [f, setField] = useFormSection("strategi");
  const labels = MODE_LABELS[mode] || MODE_LABELS.baru;

  return (
    <>
      <Section
        icon="①"
        title="Strategi Pemasaran (Bab 3.1)"
        desc="Pilih beberapa strategi promosi yang realistis untuk skala usaha Anda."
      >
        <Field label={labels.pemasaran}>
          <ChecklistMulti
            options={BAB_3_1_PEMASARAN}
            value={f.pemasaran || []}
            onChange={(v) => setField("pemasaran", v)}
            previewPrefix="Pada pilar pemasaran, strategi yang dijalankan berfokus pada "
            previewSuffix="."
          />
        </Field>
      </Section>

      <Section
        icon="②"
        title="Kanal Penjualan (Bab 3.2)"
        desc="Pilih kanal distribusi yang akan diaktifkan."
      >
        <Field label={labels.kanal}>
          <ChecklistMulti
            options={BAB_3_2_KANAL}
            value={f.kanal || []}
            onChange={(v) => setField("kanal", v)}
            previewPrefix="Kanal penjualan yang diaktifkan terdiri atas "
            previewSuffix="."
          />
        </Field>
      </Section>

      <Section
        icon="③"
        title="Lokasi & Tempat Usaha (Bab 3.3)"
        desc="Status kepemilikan + karakteristik lokasi — keduanya mempengaruhi biaya operasional tetap."
      >
        <Field label={labels.tempat} required>
          <DropdownSingle
            options={BAB_3_3_STATUS_TEMPAT}
            value={f.statusTempat}
            onChange={(v) => setField("statusTempat", v)}
            showFragment
          />
        </Field>

        <Field
          label="Karakteristik lokasi (boleh pilih beberapa)"
          hint="Karakteristik ini akan muncul di Bab 3 laporan."
        >
          <ChecklistMulti
            options={BAB_3_3_KARAKTER_LOKASI}
            value={f.karakterLokasi || []}
            onChange={(v) => setField("karakterLokasi", v)}
            previewPrefix="Untuk aspek lokasi, "
            previewSuffix="."
          />
        </Field>
      </Section>
    </>
  );
}
