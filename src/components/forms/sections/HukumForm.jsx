import { useFormSection } from "../../../state/useFormSection.js";
import Section from "../Section.jsx";
import Field from "../Field.jsx";
import DropdownSingle from "../DropdownSingle.jsx";
import ChecklistMulti from "../ChecklistMulti.jsx";
import { COLORS } from "../../primitives/styles.js";
import {
  BAB_5_1_BENTUK_HUKUM,
  BAB_5_2_STRUKTUR,
  BAB_5_3_PENASIHAT,
} from "../../../data/babOptions.js";

// ============================================================================
// <HukumForm /> — Tab 1.2 Jalur A: Bentuk Hukum & Struktur Tim
//
// Cover Bab 5.1 (bentuk hukum), 5.2 (struktur tim), 5.3 (penasihat).
//
// HOTFIX 5.5: Pertanyaan "Status Kepemilikan Modal" DIHAPUS dari sini.
// Alasannya: untuk bisnis baru/rintisan, modal belum ada — sehingga
// pertanyaan tsb membingungkan. Status modal akan di-DERIVE OTOMATIS dari
// jawaban di Bab 7 (sumber dana). Mis. kalau modalMitra > 0 → kemitraan,
// kalau hanya modalPribadi → mandiri, kalau ada pinjaman → eksternal.
// ============================================================================

export default function HukumForm() {
  const [f, setField] = useFormSection("hukum");

  return (
    <>
      <Section
        icon="①"
        title="Bentuk Hukum Usaha (Bab 5.1)"
        desc="Pilih badan hukum yang akan dipakai — sangat dianjurkan PT Perorangan atau Perorangan untuk UMKM mikro."
      >
        <Field label="Bentuk Hukum" required>
          <DropdownSingle
            options={BAB_5_1_BENTUK_HUKUM}
            value={f.bentukHukum}
            onChange={(v) => setField("bentukHukum", v)}
            showFragment
          />
        </Field>

        <div
          style={{
            padding: "10px 14px",
            background: COLORS.infoBg,
            border: `1px solid ${COLORS.infoBorder}`,
            borderLeft: `3px solid ${COLORS.info}`,
            borderRadius: 6,
            fontSize: 11.5,
            color: COLORS.info,
            lineHeight: 1.55,
            marginTop: 8,
          }}
        >
          ⓘ <strong>Catatan:</strong> Status kepemilikan modal (mandiri/kemitraan/pinjaman) <em>tidak ditanyakan di sini</em> karena akan ditentukan otomatis berdasarkan sumber dana yang Anda isi di <strong>tab Keuangan ▸ "Initial Investment &amp; Sumber Dana" (Bab 7.3)</strong>.
        </div>
      </Section>

      <Section
        icon="②"
        title="Struktur Organisasi (Bab 5.2)"
        desc="Centang posisi yang akan ada di tim usaha Anda. Untuk UMKM kecil, satu orang bisa merangkap beberapa peran."
      >
        <Field label="Posisi yang Akan Ada">
          <ChecklistMulti
            options={BAB_5_2_STRUKTUR}
            value={f.struktur || []}
            onChange={(v) => setField("struktur", v)}
            previewPrefix="Struktur organisasi awal terdiri atas "
            previewSuffix="."
          />
        </Field>
      </Section>

      <Section
        icon="③"
        title="Dewan Penasihat / Mentor (Bab 5.3 — Opsional)"
        desc="Centang dukungan eksternal yang Anda miliki. Bagian ini opsional namun memperkuat kredibilitas laporan."
      >
        <Field label="Pendamping/Penasihat">
          <ChecklistMulti
            options={BAB_5_3_PENASIHAT}
            value={f.penasihat || []}
            onChange={(v) => setField("penasihat", v)}
            previewPrefix="Usaha ini "
            previewSuffix="."
          />
        </Field>
      </Section>
    </>
  );
}
