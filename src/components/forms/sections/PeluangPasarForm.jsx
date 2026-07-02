import { useFormSection } from "../../../state/useFormSection.js";
import Section from "../Section.jsx";
import Field from "../Field.jsx";
import ChecklistMulti from "../ChecklistMulti.jsx";
import {
  BAB_2_1_MASALAH,
  BAB_2_2_SOLUSI,
  BAB_2_3_JENIS_PELANGGAN,
  BAB_2_3_KARAKTERISTIK,
  BAB_2_4_BENTUK_KOMPETISI,
  BAB_2_4_KEUNGGULAN,
} from "../../../data/babOptions.js";

// ============================================================================
// <PeluangPasarForm /> — Bab 2 untuk semua jalur
//
// Mode mapping:
//   - "rintisan"  (Jalur A → peluang)              : analisis dari nol
//   - "ekspansi"  (Jalur B → pengembangan_pasar)   : pasar baru untuk ekspansi
//   - "pendanaan" (Jalur C → potensi_pasar)        : validasi omset untuk bank
// ============================================================================

const MODE_INTRO = {
  baru:
    "Validasi ide untuk meyakinkan pendana: buktikan ada masalah pelanggan yang riil, solusi konkret, segmen jelas, dan keunggulan yang sulit ditiru. Tanpa data historis, kekuatan validasi inilah yang dinilai analis.",
  lanjutan:
    "Identifikasi pasar/segmen baru sasaran pengembangan. Tunjukkan ke pendana bahwa permintaan tambahan ini nyata — bukan sekadar keinginan ekspansi.",
  rintisan:
    "Identifikasi masalah pelanggan dan solusi yang akan ditawarkan — narasi otomatis akan terbentuk di Bab 2 laporan.",
};

export default function PeluangPasarForm({ mode = "baru" }) {
  const [f, setField] = useFormSection("peluang");
  const intro = MODE_INTRO[mode] || MODE_INTRO.baru;

  return (
    <>
      <div
        style={{
          padding: "12px 14px",
          background: "rgba(125, 211, 252, 0.05)",
          border: "1px solid rgba(125, 211, 252, 0.15)",
          borderLeft: "3px solid #7DD3FC",
          borderRadius: 6,
          marginBottom: 24,
          fontSize: 12.5,
          color: "#CBD5E1",
          lineHeight: 1.55,
        }}
      >
        💡 {intro}
      </div>

      <Section
        icon="①"
        title="Masalah Pelanggan (Bab 2.1)"
        desc="Centang minimal 1 masalah yang akan diselesaikan oleh produk/jasa Anda."
      >
        <Field label="Apa masalah pelanggan yang Anda lihat di lapangan?">
          <ChecklistMulti
            options={BAB_2_1_MASALAH}
            value={f.masalah || []}
            onChange={(v) => setField("masalah", v)}
            previewPrefix="Beberapa permasalahan kunci yang teridentifikasi antara lain: "
            previewSuffix="."
          />
        </Field>
      </Section>

      <Section
        icon="②"
        title="Solusi Kami (Bab 2.2)"
        desc="Centang solusi yang akan Anda tawarkan terhadap masalah di atas."
      >
        <Field label="Solusi apa yang Anda hadirkan?">
          <ChecklistMulti
            options={BAB_2_2_SOLUSI}
            value={f.solusi || []}
            onChange={(v) => setField("solusi", v)}
            previewPrefix="Sebagai respons strategis, usaha ini hadir dengan "
            previewSuffix="."
          />
        </Field>
      </Section>

      <Section
        icon="③"
        title="Segmentasi Pasar (Bab 2.3)"
        desc="Definisikan target konsumen utama Anda — jenis dan karakteristiknya."
      >
        <Field label="Jenis pelanggan utama (boleh lebih dari satu)">
          <ChecklistMulti
            options={BAB_2_3_JENIS_PELANGGAN}
            value={f.jenisPelanggan || []}
            onChange={(v) => setField("jenisPelanggan", v)}
            previewPrefix="Target segmentasi pasar adalah "
            previewSuffix="."
          />
        </Field>

        <Field
          label="Karakteristik pelanggan tersebut"
          hint="Bagaimana mereka berperilaku saat membeli?"
        >
          <ChecklistMulti
            options={BAB_2_3_KARAKTERISTIK}
            value={f.karakteristik || []}
            onChange={(v) => setField("karakteristik", v)}
            previewPrefix="Karakteristik konsumen utama yaitu "
            previewSuffix="."
          />
        </Field>
      </Section>

      <Section
        icon="④"
        title="Analisis Pesaing (Bab 2.4)"
        desc="Petakan bentuk kompetisi & keunggulan komparatif Anda."
      >
        <Field label="Bentuk kompetisi di pasar ini">
          <ChecklistMulti
            options={BAB_2_4_BENTUK_KOMPETISI}
            value={f.bentukKompetisi || []}
            onChange={(v) => setField("bentukKompetisi", v)}
            previewPrefix="Dari sisi pemetaan kompetisi, "
            previewSuffix="."
          />
        </Field>

        <Field label="Keunggulan komparatif yang Anda miliki">
          <ChecklistMulti
            options={BAB_2_4_KEUNGGULAN}
            value={f.keunggulan || []}
            onChange={(v) => setField("keunggulan", v)}
            previewPrefix="Usaha ini memiliki keunggulan dalam hal "
            previewSuffix="."
          />
        </Field>
      </Section>
    </>
  );
}
