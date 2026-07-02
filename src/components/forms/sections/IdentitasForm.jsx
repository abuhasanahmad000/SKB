import { useFormSection } from "../../../state/useFormSection.js";
import { useBpsData } from "../../../state/useBpsData.js";
import { useState, useEffect } from "react";
import { compressImage } from "../../../utils/imageUtils.js";
import Section from "../Section.jsx";
import Field from "../Field.jsx";
import Input from "../../primitives/Input.jsx";
import NativeSelect from "../NativeSelect.jsx";
import AiAutofillButton from "../AiAutofillButton.jsx";
import BpsDataBadge from "../../primitives/BpsDataBadge.jsx";
import DropdownSingle from "../DropdownSingle.jsx";
import { listProvinces, listCities, PROVINCES } from "../../../data/provinces.js";
import { listSectors } from "../../../data/sectors.js";
import { SKALA_OPTIONS } from "../../../engines/suggestionHelper.js";
import { COLORS } from "../../primitives/styles.js";

// ============================================================================
// <IdentitasForm /> — Tab 1.1 untuk SEMUA jalur dengan mode-aware
//
// HOTFIX 5.5:
//   - ◆ Tambah field "Sektor Usaha" (untuk BPS growth rate)
//   - ◆ Tambah field "Produk Utama" (untuk narasi)
//   - ◆ Provinsi & Kota pakai <NativeSelect> (compact, tidak memakan ruang)
//   - ◆ Tombol 🪄 AI Autofill di semua kolom text
//   - ◆ Jalur C: tambah radio status operasional (baru / sudah jalan)
// ============================================================================

const MODE_HINTS = {
  // Refactor v13 — semua user pencari dana; varian per jenis bisnis:
  baru: {
    namaLabel: "Nama Calon Bisnis",
    namaHint: "Nama bisnis baru yang akan diajukan dalam proposal pendanaan.",
    deskripsiHint: "1-3 kalimat tentang produk/jasa utama — ini muncul di halaman pembuka proposal.",
  },
  lanjutan: {
    namaLabel: "Nama Bisnis Saat Ini",
    namaHint: "Nama bisnis yang sudah berjalan dan diajukan untuk dana pengembangan.",
    deskripsiHint: "1-3 kalimat tentang produk/jasa eksisting yang dijalankan saat ini.",
  },
  // fallback lama (kompatibilitas)
  rintisan: {
    namaLabel: "Nama Calon Bisnis",
    namaHint: "Nama yang akan tampil di sampul laporan SKB & rencana bisnis.",
    deskripsiHint: "1-3 kalimat tentang produk/jasa utama yang akan ditawarkan.",
  },
};

const STATUS_OPERASIONAL = [
  {
    id: "baru",
    label: "Bisnis Baru — Belum Dimulai",
    fragment: "bisnis ini berada pada tahap pra-operasional, belum memulai aktivitas penjualan",
  },
  {
    id: "sudahJalan",
    label: "Sudah Beroperasi — Mencari Modal Pengembangan",
    fragment: "bisnis ini sudah berjalan dan saat ini mencari modal tambahan untuk pengembangan",
  },
];

export default function IdentitasForm({ mode = "baru" }) {
  const [f, setField] = useFormSection("identitas");
  const hint = MODE_HINTS[mode] || MODE_HINTS.baru;

  // Sinkronkan status operasional dengan jenis bisnis aktif (dasbor)
  useEffect(() => {
    const want = mode === "lanjutan" ? "sudahJalan" : "baru";
    if (f.statusOperasional !== want) setField("statusOperasional", want);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);
  const provinces = listProvinces();
  const cities = listCities(f.provinceCode);
  const sectors = listSectors();

  // Tahap 8: BPS data — auto-fetch saat sektor/provinsi berubah
  const { sectorData, provinceData, refresh: refreshBps } = useBpsData(
    f.sectorCode,
    f.provinceCode
  );

  // Province dropdown options (untuk NativeSelect)
  const provinceOptions = provinces.map((p) => ({ value: p.code, label: p.name }));
  const cityOptions = cities.map((c) => ({ value: c.code, label: c.name }));
  const sectorOptions = sectors.map((s) => ({
    value: s.code,
    label: `${s.name} (${s.group})`,
  }));

  // === AI Autofill prompt builders ===
  const buildPromptTagline = () => `Anda adalah konsultan UMKM Indonesia.

Profil bisnis:
- Nama: ${f.namaBisnis || "(belum diisi)"}
- Produk utama: ${f.produkUtama || "(belum diisi)"}
- Lokasi: ${PROVINCES[f.provinceCode]?.name || "(belum diisi)"}
- Deskripsi: ${f.deskripsi || "(belum diisi)"}

Saran SATU tagline pendek (3-7 kata, Bahasa Indonesia, catchy, tidak alay) untuk bisnis ini. Output HANYA tagline-nya saja, tanpa kutip, tanpa penjelasan.`;

  const buildPromptDeskripsi = () => `Anda adalah konsultan UMKM Indonesia berpengalaman.

Profil bisnis:
- Nama: ${f.namaBisnis || "(belum diisi)"}
- Produk utama: ${f.produkUtama || "(belum diisi)"}
- Lokasi: ${PROVINCES[f.provinceCode]?.name || "(belum diisi)"}
- Tagline: ${f.tagline || "(belum diisi)"}

Tulis satu paragraf padat (4-6 kalimat, 80-120 kata) yang mendeskripsikan bisnis ini dalam Bahasa Indonesia formal yang lugas dan mengalir. Cakup: produk yang ditawarkan, target pasar utama, lokasi/jangkauan, dan keunikan/positioning yang membedakan dari kompetitor. Jangan pakai kalimat klise korporat ("dengan demikian", "perlu dicatat", "dapat disimpulkan"). Output HANYA paragrafnya, tanpa judul atau pengantar.`;

  const buildPromptProdukUtama = () => `Anda adalah konsultan UMKM Indonesia.

Profil bisnis:
- Nama: ${f.namaBisnis || "(belum diisi)"}
- Deskripsi: ${f.deskripsi || "(belum diisi)"}

Apa PRODUK UTAMA bisnis ini? Jawab dalam Bahasa Indonesia, 2-5 kata saja (contoh: "kopi specialty", "jasa laundry kiloan", "baju anak"). Output HANYA nama produknya, tanpa kutip, tanpa penjelasan.`;

  const buildPromptKompetensi = () => `Anda adalah konsultan UMKM Indonesia berpengalaman menyusun proposal pendanaan.

Profil:
- Nama pemohon: ${f.namaPemohon || "(belum diisi)"}
- Nama bisnis: ${f.namaBisnis || "(belum diisi)"}
- Produk utama: ${f.produkUtama || "(belum diisi)"}
- Lokasi: ${PROVINCES[f.provinceCode]?.name || "(belum diisi)"}

Tulis profil kompetensi & latar belakang pendiri dalam satu paragraf padat (5-7 kalimat, 100-150 kata) menggunakan Bahasa Indonesia formal yang cocok untuk proposal pendanaan ke bank/investor. Cakup: latar belakang pendidikan/pengalaman, kompetensi teknis relevan dengan bisnis, pencapaian profesional yang mendukung, dan komitmen menjalankan bisnis. Buat narasi mengalir yang meyakinkan tanpa terkesan berlebihan. Output HANYA paragrafnya, tanpa judul.`;

  return (
    <>
      {/* ============= SECTION 1: Profil Bisnis ============= */}
      <Section
        icon="①"
        title="Profil Bisnis"
        desc={mode === "lanjutan"
          ? "Data dasar bisnis yang sudah berjalan — jadi pijakan rencana pengembangan dan proposal pendanaan."
          : "Identitas resmi bisnis baru yang akan tampil di halaman pembuka proposal pendanaan."}
      >
        <Field label={hint.namaLabel} required hint={hint.namaHint}>
          <Input
            value={f.namaBisnis}
            onChange={(v) => setField("namaBisnis", v)}
            placeholder="cth. Kopi Senja Bandung"
          />
        </Field>

        <Field
          label="Produk Utama"
          required
          hint="Nama produk inti yang dijual — akan dipakai di narasi laporan (mis. 'kopi specialty', 'jasa laundry kiloan', 'baju anak')."
        >
          <Input
            value={f.produkUtama}
            onChange={(v) => setField("produkUtama", v)}
            placeholder="cth. kopi specialty & roti"
          />
          <AiAutofillButton
            label="🪄 Bantu AI Suggest Produk"
            buildPrompt={buildPromptProdukUtama}
            onResult={(text) => setField("produkUtama", text)}
            inline
          />
        </Field>

        <Field label="Tagline (opsional)" hint="Slogan singkat 3-7 kata.">
          <Input
            value={f.tagline}
            onChange={(v) => setField("tagline", v)}
            placeholder="cth. Rasakan ngopi di kampung sendiri."
          />
          <AiAutofillButton
            label="🪄 Bantu AI Suggest Tagline"
            buildPrompt={buildPromptTagline}
            onResult={(text) => setField("tagline", text)}
            inline
          />
        </Field>

        {/* Hotfix 11.3: Logo upload untuk sampul laporan */}
        <Field label="Logo Bisnis (opsional)" hint="Upload logo bisnis Anda — akan muncul di sampul laporan. Format: JPG/PNG, max 5 MB (auto-compress).">
          <LogoUploader
            value={f.logoUrl}
            onChange={(url) => setField("logoUrl", url)}
          />
        </Field>

        <Field label="Deskripsi Singkat" hint={hint.deskripsiHint}>
          <textarea
            value={f.deskripsi || ""}
            onChange={(e) => setField("deskripsi", e.target.value)}
            placeholder="cth. Warung kopi modern dengan kualitas barista profesional di harga terjangkau."
            rows={3}
            style={textareaStyle}
          />
          <AiAutofillButton
            label="🪄 Bantu AI Tulis Deskripsi"
            buildPrompt={buildPromptDeskripsi}
            onResult={(text) => setField("deskripsi", text)}
            inline
          />
        </Field>

        <Field
          label="Sektor Usaha (KBLI)"
          required
          hint="Pilih sektor — angka pertumbuhan tahunan akan otomatis disesuaikan dengan rata-rata BPS untuk sektor ini."
        >
          <NativeSelect
            value={f.sectorCode}
            onChange={(v) => setField("sectorCode", v)}
            options={sectorOptions}
            placeholder="Pilih sektor usaha..."
          />
          {sectorData && (
            <BpsDataBadge data={sectorData} onRefresh={refreshBps} />
          )}
        </Field>

        <Field
          label="Skala Bisnis yang Akan Dibangun"
          required
          hint="Pilih skala — sistem akan menyesuaikan saran peralatan, gaji, dan biaya operasional sesuai standar pasar."
        >
          <DropdownSingle
            options={SKALA_OPTIONS}
            value={f.skalaBisnis}
            onChange={(v) => setField("skalaBisnis", v)}
          />
        </Field>

        {mode === "lanjutan" && (
          <Field
            label="Tahun Bisnis Mulai Berdiri"
            hint="Membantu sistem menghitung umur bisnis berjalan."
          >
            <Input
              value={f.tahunBerdiri}
              onChange={(v) => setField("tahunBerdiri", v.replace(/\D/g, "").slice(0, 4))}
              placeholder="cth. 2020"
            />
          </Field>
        )}

        {/* Refactor v13: status operasional otomatis mengikuti Jenis Bisnis
            yang dipilih di dasbor — tidak perlu ditanya dua kali. */}
        {true && (
          <>
            <Field
              label="Nama Pengaju Proposal"
              required
              hint="Nama lengkap orang yang bertindak sebagai pemohon pendanaan."
            >
              <Input
                value={f.namaPemohon}
                onChange={(v) => setField("namaPemohon", v)}
                placeholder="cth. Budi Santoso"
              />
            </Field>

            <Field
              label="Kompetensi & Riwayat Pendiri"
              hint="2-3 kalimat singkat tentang latar belakang teknis/pengalaman terkait bisnis."
            >
              <textarea
                value={f.kompetensiPendiri || ""}
                onChange={(e) => setField("kompetensiPendiri", e.target.value)}
                placeholder="cth. Pendiri memiliki 5 tahun pengalaman di industri F&B sebagai barista profesional."
                rows={3}
                style={textareaStyle}
              />
              <AiAutofillButton
                label="🪄 Bantu AI Tulis Kompetensi"
                buildPrompt={buildPromptKompetensi}
                onResult={(text) => setField("kompetensiPendiri", text)}
                inline
              />
            </Field>
          </>
        )}
      </Section>

      {/* ============= SECTION 2: Lokasi (NativeSelect compact) ============= */}
      <Section
        icon="②"
        title="Lokasi Operasional"
        desc="Alamat lokasi usaha — provinsi & kota dipakai untuk benchmark UMK/UMP dan inflasi otomatis."
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Provinsi" required>
            <NativeSelect
              value={f.provinceCode}
              onChange={(v) => {
                setField("provinceCode", v);
                setField("cityCode", "");
              }}
              options={provinceOptions}
              placeholder="Pilih provinsi..."
            />
            {provinceData && (
              <BpsDataBadge data={provinceData} onRefresh={refreshBps} />
            )}
          </Field>
          {cities.length > 0 && (
            <Field label="Kota/Kabupaten">
              <NativeSelect
                value={f.cityCode}
                onChange={(v) => setField("cityCode", v)}
                options={cityOptions}
                placeholder="Pilih kota/kab..."
              />
            </Field>
          )}
        </div>
        <Field label="Alamat Lengkap (opsional)">
          <Input
            value={f.alamat}
            onChange={(v) => setField("alamat", v)}
            placeholder="cth. Jl. Asia Afrika No. 123, Bandung"
          />
        </Field>
      </Section>
    </>
  );
}

const textareaStyle = {
  width: "100%",
  padding: "10px 12px",
  background: COLORS.bgPanelDeep,
  border: `1px solid ${COLORS.borderMid}`,
  borderRadius: 6,
  color: COLORS.text,
  fontSize: 12.5,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
  resize: "vertical",
  lineHeight: 1.6,
};

// ============================================================================
// LogoUploader (Hotfix 11.3) — Upload + compress logo bisnis untuk sampul laporan
// ============================================================================
function LogoUploader({ value, onChange }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setIsUploading(true);
    try {
      const compressed = await compressImage(file);
      onChange(compressed.dataUrl);
    } catch (err) {
      setError(err.message);
    }
    setIsUploading(false);
    e.target.value = "";
  };

  if (value) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ position: "relative", padding: 8, background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 6 }}>
          <img src={value} alt="Logo" style={{ maxWidth: 120, maxHeight: 80, objectFit: "contain", display: "block" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ display: "inline-block", padding: "6px 12px", background: COLORS.bgPanel, border: `1px solid ${COLORS.border}`, borderRadius: 5, fontSize: 11, color: COLORS.textSoft, cursor: "pointer" }}>
            🔄 Ganti Logo
            <input type="file" accept="image/*" onChange={handleUpload} style={{ display: "none" }} />
          </label>
          <button
            type="button"
            onClick={() => onChange("")}
            style={{ padding: "6px 12px", background: "transparent", border: `1px solid ${COLORS.dangerBorder}`, borderRadius: 5, fontSize: 11, color: COLORS.dangerHi, cursor: "pointer", fontFamily: "inherit" }}
          >
            🗑 Hapus
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <label style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 16px",
        background: COLORS.accent,
        color: "#fff",
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
        fontFamily: "inherit",
      }}>
        {isUploading ? "⏳ Mengompres..." : "📷 Pilih File Logo"}
        <input type="file" accept="image/*" onChange={handleUpload} style={{ display: "none" }} />
      </label>
      {error && (
        <div style={{ marginTop: 8, padding: "6px 10px", background: COLORS.dangerBg, border: `1px solid ${COLORS.dangerBorder}`, borderRadius: 4, color: COLORS.dangerHi, fontSize: 11 }}>
          ⚠ {error}
        </div>
      )}
    </>
  );
}
