import { useFormSection } from "../../../state/useFormSection.js";
import Section from "../Section.jsx";
import Field from "../Field.jsx";
import ChecklistMulti from "../ChecklistMulti.jsx";
import { COLORS } from "../../primitives/styles.js";

// ============================================================================
// <LingkunganSosialForm /> — Form ringkas untuk Aspek Lingkungan & Sosial
//
// MENGGANTIKAN KuesionerSKBForm (Hotfix 7.1) — skor 5 aspek SKB sekarang
// DI-DERIVE OTOMATIS dari semua form data, sehingga kuesioner manual tidak
// diperlukan lagi. Form ini hanya menampung 2 dimensi yang tidak bisa
// di-derive dari form lain: praktik ramah lingkungan + komitmen sosial.
//
// User tetap bisa skip — skor lingkungan akan minimum 50% dari sektor
// inherent + digital tech, jadi tidak nol.
// ============================================================================

const PRAKTIK_RAMAH_LINGKUNGAN = [
  { id: "kurangi_plastik", label: "Mengurangi penggunaan plastik sekali pakai (kemasan/sedotan/wadah)" },
  { id: "hemat_energi",    label: "Menggunakan peralatan hemat energi (LED, peralatan ber-bintang energi)" },
  { id: "kelola_limbah",   label: "Memiliki sistem pengelolaan limbah yang terorganisir" },
  { id: "bahan_lokal",     label: "Mengutamakan bahan baku dari pemasok lokal/dalam negeri" },
  { id: "daur_ulang",      label: "Menerapkan praktik daur ulang atau reuse di operasional" },
  { id: "hemat_air",       label: "Menerapkan praktik hemat & efisien penggunaan air" },
  { id: "ramah_lingkungan_supplier", label: "Memilih pemasok yang menerapkan praktik ramah lingkungan" },
];

const KOMITMEN_SOSIAL = [
  { id: "pemberdayaan_lokal", label: "Memberdayakan tenaga kerja dari masyarakat sekitar" },
  { id: "umkm_partnership",   label: "Bermitra dengan UMKM/komunitas lokal sebagai pemasok" },
  { id: "gaji_layak",         label: "Berkomitmen memberi gaji di atas UMR & kepastian kerja" },
  { id: "pelatihan_karyawan", label: "Menyediakan pelatihan & pengembangan untuk karyawan" },
  { id: "donasi_komunitas",   label: "Menyisihkan sebagian keuntungan untuk donasi/CSR komunitas" },
  { id: "inklusi_disabilitas", label: "Membuka peluang kerja inklusif (disabilitas/lansia/dll)" },
];

export default function LingkunganSosialForm({ mode = "baru" }) {
  const [f, setField] = useFormSection("lingkunganSosial");

  return (
    <>
      <div
        style={{
          padding: "12px 16px",
          background: `${COLORS.success}11`,
          border: `1px solid ${COLORS.successBorder}`,
          borderLeft: `3px solid ${COLORS.success}`,
          borderRadius: 6,
          marginBottom: 24,
          fontSize: 12.5,
          color: COLORS.textSoft,
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: COLORS.textHi }}>ⓘ Info Penting:</strong> Aspek Kelayakan SKB
        (Pemasaran, Teknis, Manajemen, Hukum) sekarang dinilai <strong style={{ color: COLORS.successHi }}>otomatis</strong>{" "}
        berdasarkan data yang Anda isi di tab/sub-tab lain. Bagian ini hanya menampung
        komitmen lingkungan & sosial yang akan menjadi bobot Aspek Lingkungan dalam laporan SKB.
        Bagian ini opsional namun memperkuat kredibilitas untuk pendanaan dan sertifikasi.
      </div>

      <Section
        icon="🌱"
        title="Praktik Ramah Lingkungan"
        desc="Centang praktik operasional yang akan/sudah Anda jalankan. Investor dan lembaga pemberi dana semakin memperhatikan jejak lingkungan bisnis."
      >
        <Field label="Praktik yang dijalankan/akan dijalankan">
          <ChecklistMulti
            options={PRAKTIK_RAMAH_LINGKUNGAN}
            value={f.praktikRamah || []}
            onChange={(v) => setField("praktikRamah", v)}
          />
        </Field>
      </Section>

      <Section
        icon="🤝"
        title="Komitmen Sosial & Pemberdayaan"
        desc="Centang komitmen sosial bisnis Anda terhadap karyawan, mitra, dan komunitas sekitar."
      >
        <Field label="Komitmen sosial bisnis">
          <ChecklistMulti
            options={KOMITMEN_SOSIAL}
            value={f.komitmenSosial || []}
            onChange={(v) => setField("komitmenSosial", v)}
          />
        </Field>
      </Section>
    </>
  );
}
