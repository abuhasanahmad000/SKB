import { useFormSection } from "../../../state/useFormSection.js";
import Section from "../Section.jsx";
import Field from "../Field.jsx";
import RupiahInput from "../RupiahInput.jsx";
import NumberInput from "../NumberInput.jsx";
import Input from "../../primitives/Input.jsx";
import { COLORS } from "../../primitives/styles.js";

// ============================================================================
// <ExistingBusinessForm /> — Tab 1.2 Jalur B (Hotfix 12.0 — EXPAND BESAR)
//
// Sub-tab "keuangan_eksisting" Jalur B. Data baseline bisnis saat ini untuk
// MERANGKUM DATA HISTORIS + KAPASITAS + LEGALITAS + TARGET EKSPANSI.
//
// 4 grup data:
//   ① Snapshot Keuangan Bulanan (omset, HPP, laba, opex, aset, hutang)
//   ② Kapasitas & Bottleneck (utilisasi, kendala)
//   ③ Legalitas Eksisting (NIB, PIRT, BPOM, Halal, HKI, NPWP)
//   ④ Target Ekspansi (alasan ekspansi, % pertumbuhan, payback)
// ============================================================================

const BOTTLENECK_OPTIONS = [
  { id: "kapasitas_produksi",  label: "Kapasitas Produksi Penuh" },
  { id: "sdm_kurang",           label: "Kurang SDM/Tenaga Kerja" },
  { id: "alat_terbatas",        label: "Alat/Peralatan Terbatas" },
  { id: "modal_kerja",          label: "Modal Kerja Tidak Cukup" },
  { id: "tempat_sempit",        label: "Tempat/Ruang Operasional Sempit" },
  { id: "distribusi",           label: "Jaringan Distribusi Terbatas" },
  { id: "pemasaran",            label: "Jangkauan Pemasaran Sempit" },
];

const LEGALITAS_OPTIONS = [
  { id: "nib",   label: "NIB (Nomor Induk Berusaha)" },
  { id: "npwp",  label: "NPWP Bisnis" },
  { id: "pirt",  label: "PIRT (untuk pangan olahan)" },
  { id: "bpom",  label: "Izin BPOM" },
  { id: "halal", label: "Sertifikat Halal MUI/BPJPH" },
  { id: "hki",   label: "HKI / Merek Dagang Terdaftar" },
  { id: "siup",  label: "SIUP / SIUI" },
];

export default function ExistingBusinessForm() {
  const [f, setField] = useFormSection("existingBusiness");

  const toggleArr = (key, id) => {
    const cur = f[key] || [];
    setField(key, cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  };

  // Derived: laba kotor & margin
  const grossMargin = f.omsetBulanan && f.hppBulanan ? ((f.omsetBulanan - f.hppBulanan) / f.omsetBulanan) * 100 : null;
  const netMargin = f.omsetBulanan && f.labaBulanan ? (f.labaBulanan / f.omsetBulanan) * 100 : null;

  return (
    <>
      {/* GRUP 1: SNAPSHOT KEUANGAN */}
      <Section
        icon="①"
        title="Snapshot Keuangan Bulanan Saat Ini"
        desc="Rata-rata 3-6 bulan terakhir lebih akurat dibanding 1 bulan. Data ini jadi BASELINE untuk konsolidasi proyeksi ekspansi."
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Tahun Bisnis Mulai Beroperasi" required>
            <Input
              value={f.tahunMulai}
              onChange={(v) => setField("tahunMulai", v)}
              placeholder="cth. 2022"
            />
          </Field>
          <Field label="Jumlah Karyawan Aktif Saat Ini" hint="Termasuk pemilik bila ikut operasi.">
            <NumberInput
              value={f.jumlahKaryawan}
              onChange={(v) => setField("jumlahKaryawan", v)}
              min={0} max={500} suffix="orang"
            />
          </Field>
        </div>

        <Field label="Rata-rata Omset Bulanan" required hint="Total uang masuk dari penjualan dalam satu bulan rata-rata.">
          <RupiahInput
            value={f.omsetBulanan}
            onChange={(v) => setField("omsetBulanan", v)}
            hint="UMKM mikro: 5-50 jt/bulan · kecil: 50-500 jt/bulan"
          />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="HPP / Biaya Bahan Bulanan" hint="Modal pokok produk yang terjual.">
            <RupiahInput
              value={f.hppBulanan}
              onChange={(v) => setField("hppBulanan", v)}
            />
          </Field>
          <Field label="Total Opex Bulanan" hint="Gaji + sewa + utilitas + lain-lain (selain HPP).">
            <RupiahInput
              value={f.opexBerjalan}
              onChange={(v) => setField("opexBerjalan", v)}
            />
          </Field>
        </div>

        <Field label="Laba Bersih Bulanan (Estimasi)" hint="Bisa otomatis: Omset - HPP - Opex.">
          <RupiahInput
            value={f.labaBulanan}
            onChange={(v) => setField("labaBulanan", v)}
          />
        </Field>

        {/* Derived margin display */}
        {(grossMargin !== null || netMargin !== null) && (
          <div style={{ marginTop: 6, padding: "10px 12px", background: COLORS.bgPanel, borderLeft: `3px solid ${COLORS.accent}`, borderRadius: 4, fontSize: 12, color: COLORS.textSoft }}>
            <strong>Insight margin saat ini:</strong>
            {grossMargin !== null && <> Gross margin <strong style={{ color: COLORS.text }}>{grossMargin.toFixed(1)}%</strong></>}
            {netMargin !== null && <> · Net margin <strong style={{ color: COLORS.text }}>{netMargin.toFixed(1)}%</strong></>}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 10 }}>
          <Field label="Total Aset Saat Ini" hint="Kas + persediaan + alat + bangunan/tempat.">
            <RupiahInput
              value={f.asetSaatIni}
              onChange={(v) => setField("asetSaatIni", v)}
            />
          </Field>
          <Field label="Total Hutang Saat Ini" hint="Hutang bank + supplier + lain-lain.">
            <RupiahInput
              value={f.hutangSaatIni}
              onChange={(v) => setField("hutangSaatIni", v)}
            />
          </Field>
        </div>
      </Section>

      {/* GRUP 2: KAPASITAS & BOTTLENECK */}
      <Section
        icon="②"
        title="Kapasitas Operasional & Kendala Saat Ini"
        desc="Inilah RAISON D'ÊTRE ekspansi — kapasitas penuh atau ada bottleneck yang mau diselesaikan."
      >
        <Field
          label="Tingkat Utilisasi Kapasitas Saat Ini"
          required
          hint="Berapa persen kapasitas penuh yang sudah terpakai? Misal: 80% berarti bisnis Anda sudah hampir penuh."
        >
          <NumberInput
            value={f.kapasitasUtilization}
            onChange={(v) => setField("kapasitasUtilization", v)}
            min={0} max={100} suffix="%"
          />
        </Field>

        <Field label="Kendala / Bottleneck Operasional Saat Ini (pilih semua yang berlaku)">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {BOTTLENECK_OPTIONS.map((opt) => {
              const active = (f.bottleneck || []).includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleArr("bottleneck", opt.id)}
                  style={{
                    padding: "8px 10px", background: active ? COLORS.accent : COLORS.bgPanel,
                    border: `1px solid ${active ? COLORS.accent : COLORS.border}`,
                    borderRadius: 5, fontSize: 11.5, textAlign: "left",
                    color: active ? "#fff" : COLORS.text, cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  {active ? "✓ " : ""}{opt.label}
                </button>
              );
            })}
          </div>
        </Field>
      </Section>

      {/* GRUP 3: LEGALITAS EKSISTING */}
      <Section
        icon="③"
        title="Dokumen Legalitas yang Sudah Dimiliki"
        desc="Sebutkan dokumen legal eksisting — sebagai dasar kepatuhan dan modal kepercayaan untuk ekspansi."
      >
        <Field label="Pilih semua dokumen yang sudah dimiliki">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {LEGALITAS_OPTIONS.map((opt) => {
              const active = (f.legalitasOwned || []).includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleArr("legalitasOwned", opt.id)}
                  style={{
                    padding: "8px 10px", background: active ? "#10B981" : COLORS.bgPanel,
                    border: `1px solid ${active ? "#10B981" : COLORS.border}`,
                    borderRadius: 5, fontSize: 11.5, textAlign: "left",
                    color: active ? "#fff" : COLORS.text, cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  {active ? "✓ " : ""}{opt.label}
                </button>
              );
            })}
          </div>
        </Field>
      </Section>

      {/* GRUP 4: TARGET EKSPANSI */}
      <Section
        icon="④"
        title="Target & Justifikasi Ekspansi"
        desc="Apa yang ingin Anda capai dengan ekspansi ini? Angka-angka target jadi pembanding utama di laporan."
      >
        <Field
          label="Target Pertumbuhan Revenue Setelah Ekspansi"
          hint="Berapa % kenaikan omset bulanan yang Anda harapkan dari ekspansi ini?"
        >
          <NumberInput
            value={f.targetPertumbuhanRevenue}
            onChange={(v) => setField("targetPertumbuhanRevenue", v)}
            min={0} max={500} suffix="%"
          />
        </Field>

        <Field
          label="Target Payback Period (bulan)"
          hint="Berapa bulan modal ekspansi diharapkan kembali dari tambahan laba?"
        >
          <NumberInput
            value={f.targetPayback}
            onChange={(v) => setField("targetPayback", v)}
            min={0} max={120} suffix="bulan"
          />
        </Field>

        <Field
          label="Alasan & Justifikasi Ekspansi"
          hint="Kenapa SEKARANG waktu yang tepat untuk ekspansi? (1-3 kalimat)"
        >
          <textarea
            value={f.alasanEkspansi || ""}
            onChange={(e) => setField("alasanEkspansi", e.target.value)}
            placeholder="cth. Permintaan sudah melampaui kapasitas selama 6 bulan terakhir, sering reject order. Buka outlet ke-2 di area kampus untuk tangkap segmen yang belum terlayani."
            rows={3}
            style={{
              width: "100%", padding: "8px 10px", background: "#fff",
              border: `1px solid ${COLORS.border}`, borderRadius: 5,
              fontSize: 12.5, fontFamily: "inherit", color: COLORS.text,
              resize: "vertical", lineHeight: 1.5, outline: "none", boxSizing: "border-box",
            }}
          />
        </Field>
      </Section>
    </>
  );
}
