import { useEffect } from "react";
import { useFormSection } from "../../../state/useFormSection.js";
import { useApp } from "../../../state/AppContext.jsx";
import Section from "../Section.jsx";
import Field from "../Field.jsx";
import ChecklistMulti from "../ChecklistMulti.jsx";
import DropdownSingle from "../DropdownSingle.jsx";
import ProductTable from "../ProductTable.jsx";
import RupiahInput from "../RupiahInput.jsx";
import RuleBasedFillButton from "../RuleBasedFillButton.jsx";
import AiAutofillButton from "../AiAutofillButton.jsx";
import { COLORS } from "../../primitives/styles.js";
import { formatRp } from "../../../utils/format.js";
import {
  BAB_6_1_METODE_PENJUALAN,
  BAB_6_2_HPP,
  BAB_6_3_POSISI_SDM,
  BAB_6_3_TUNJANGAN,
} from "../../../data/babOptions.js";
import { getSector } from "../../../data/sectors.js";
import { getBenchmark } from "../../../data/bpsBenchmark.js";
import { monthlyRentFromInvestment } from "../../../engines/investmentHelper.js";
import {
  suggestOpex,
  suggestProducts,
  buildBusinessContext,
} from "../../../engines/suggestionHelper.js";

// ============================================================================
// <ProyeksiKeuanganForm /> — Tab 2 SUB-TAB BARU (hasil refactoring)
//
// HOTFIX 5.5: Growth rate sekarang BPS-AWARE
//   - Sistem ambil sectorCode dari identitas → lookup BPS_BENCHMARK
//   - Default growth = rata-rata BPS untuk sektor tsb
//   - User bisa pilih: "Mengikuti sektor", "Konservatif", atau "Agresif"
// ============================================================================

/** Bangun growth options dinamis dari sektor yang dipilih */
function buildGrowthOptions(sectorCode) {
  const sector = getSector(sectorCode);
  if (!sector) {
    // Fallback: pakai opsi statis lama jika sektor belum dipilih
    return [
      { id: "10", label: "10% — Konservatif", value: 0.10, fragment: "asumsi pertumbuhan konservatif sebesar 10% per tahun" },
      { id: "15", label: "15% — Moderat",     value: 0.15, fragment: "asumsi pertumbuhan moderat sebesar 15% per tahun" },
      { id: "25", label: "25% — Agresif",     value: 0.25, fragment: "asumsi pertumbuhan agresif sebesar 25% per tahun" },
    ];
  }

  const bps = getBenchmark(sector.group);
  const sectorGrowthPct = bps.sectorGrowth;
  const conservative = Math.max(0.02, sectorGrowthPct - 0.03);
  const aggressive = sectorGrowthPct + 0.05;

  return [
    {
      id: "konservatif",
      label: `${(conservative * 100).toFixed(1)}% — Konservatif (di bawah rata-rata sektor)`,
      value: conservative,
      fragment: `asumsi pertumbuhan konservatif sebesar ${(conservative * 100).toFixed(1)}% per tahun (di bawah rata-rata sektor ${sector.group})`,
    },
    {
      id: "sektor",
      label: `${(sectorGrowthPct * 100).toFixed(1)}% — Mengikuti rata-rata sektor ${sector.group} (BPS)`,
      value: sectorGrowthPct,
      fragment: `asumsi pertumbuhan ${(sectorGrowthPct * 100).toFixed(1)}% per tahun sesuai rata-rata sektor ${sector.group} berdasarkan data BPS`,
    },
    {
      id: "agresif",
      label: `${(aggressive * 100).toFixed(1)}% — Agresif (di atas rata-rata sektor)`,
      value: aggressive,
      fragment: `asumsi pertumbuhan agresif sebesar ${(aggressive * 100).toFixed(1)}% per tahun (di atas rata-rata sektor ${sector.group})`,
    },
  ];
}

export default function ProyeksiKeuanganForm({ mode = "baru" }) {
  const [f, setField] = useFormSection("keuangan");
  const { state } = useApp();
  const sectorCode = state.forms?.identitas?.sectorCode;
  const products = f.products || [];

  // v13.5: sinkronisasi sewa bulanan dengan "Sewa Tempat di Muka" pada Initial
  // Investment (total / 12). Bila user sudah mengisi sewa di muka, field sewa
  // bulanan di sini menjadi turunan otomatis supaya kedua angka tidak bentrok.
  const rentSynced = monthlyRentFromInvestment(state.forms);
  useEffect(() => {
    if (rentSynced != null && (f.opex?.rent || 0) !== rentSynced) {
      setField("opex", { ...(f.opex || {}), rent: rentSynced });
    }
  }, [rentSynced]); // eslint-disable-line

  // Ringkasan biaya SDM bulanan (auto dari sub-tab Kesiapan Alat & Karyawan)
  const personnelData = state.forms?.alatSDM?.personnel || {};
  const allowancePct = BAB_6_3_TUNJANGAN.find((t) => t.id === personnelData.allowanceMode)?.value ?? 0;
  const sdmPositions = BAB_6_3_POSISI_SDM
    .map((p) => ({ ...p, data: personnelData.positions?.[p.id] }))
    .filter((p) => p.data?.active);
  const sdmBasePayroll = sdmPositions.reduce((s, p) => s + (p.data.salary || 0) * (p.data.count || 0), 0);
  const sdmMonthly = Math.round(sdmBasePayroll * (1 + allowancePct));

  // Build dynamic growth options based on sector
  const growthOptions = buildGrowthOptions(sectorCode);

  // Update HPP per produk
  const setHpp = (idx, hppId) => {
    const next = { ...(f.hppPerProduk || {}), [idx]: hppId };
    setField("hppPerProduk", next);
  };

  return (
    <>
      {/* ============= TAHAP 1: METODE & PRODUK ============= */}
      <Section
        icon="①"
        title="Metode Penjualan (Bab 6.1)"
        desc="Bagaimana cara Anda menjual? Boleh pilih lebih dari satu."
      >
        <Field label="Metode penjualan yang dijalankan">
          <ChecklistMulti
            options={BAB_6_1_METODE_PENJUALAN}
            value={f.metode || []}
            onChange={(v) => setField("metode", v)}
            previewPrefix="Model penjualan menggunakan "
            previewSuffix="."
          />
        </Field>
      </Section>

      <Section
        icon="②"
        title={mode === "lanjutan" ? "Produk Baru yang Akan Ditambahkan" : "Daftar Produk Utama (Bab 6.1)"}
        desc={
          mode === "lanjutan"
            ? "Hanya isi produk BARU yang ditambah dalam rencana ekspansi. Produk lama dianggap tetap berjalan."
            : "Masukkan produk/jasa utama dengan target penjualan harian dan harga jualnya."
        }
      >
        <Field label="Produk & target jual harian">
          <ProductTable
            value={products}
            onChange={(v) => setField("products", v)}
          />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
            <RuleBasedFillButton
              getSuggestion={suggestProducts}
              onResult={(items) => setField("products", items)}
              label="✨ Isi Otomatis Produk dari Data Pasar"
              hint="Daftar produk umum + harga rata-rata pasar untuk sektor Anda."
            />
            <AiAutofillButton
              label="🪄 Bantu AI Sarankan Produk"
              buildPrompt={() => {
                const ctx = buildBusinessContext(state.forms);
                return `Anda konsultan UMKM Indonesia. Profil bisnis: ${ctx.summary}. Sektor: ${ctx.sektor}. UMR daerah: ${ctx.umr}.

Sarankan 3 produk/jasa utama yang paling realistis untuk sektor "${ctx.sektor}" (bukan sektor lain), lengkap dengan:
- Nama produk (singkat, 2-5 kata)
- Estimasi target penjualan PER HARI (angka realistis sesuai skala bisnis)
- Harga jual per unit: gunakan TITIK TENGAH antara harga pasar PALING MURAH dan PALING MAHAL untuk produk itu di Indonesia 2025 (jangan ambil harga termurah — harga tengah agar proyeksi keuangan sehat dan layak).

Output HARUS dalam format JSON array (tanpa markdown, tanpa kutip pengantar):
[{"name":"...","dailyTarget":15,"price":20000},{"name":"...","dailyTarget":10,"price":31000},{"name":"...","dailyTarget":20,"price":19000}]`;
              }}
              onResult={(text) => {
                try {
                  // Bersihkan markdown code fence jika ada
                  const cleaned = text.replace(/```json\s*|\s*```/g, "").trim();
                  const arr = JSON.parse(cleaned);
                  if (Array.isArray(arr) && arr.length > 0) {
                    setField("products", arr.slice(0, 5).map((p) => ({
                      name: String(p.name || "").slice(0, 80),
                      dailyTarget: Math.max(0.1, Number(p.dailyTarget) || 1),
                      price: Math.max(100, Math.round(Number(p.price) || 10000)),
                    })));
                  }
                } catch (e) {
                  console.error("Gagal parse AI products:", e);
                }
              }}
              inline
            />
          </div>
        </Field>

        {!sectorCode && (
          <div
            style={{
              padding: "10px 14px",
              background: COLORS.warnBg,
              border: `1px solid ${COLORS.warnBorder}`,
              borderLeft: `3px solid ${COLORS.warn}`,
              borderRadius: 6,
              fontSize: 11.5,
              color: COLORS.warnHi,
              lineHeight: 1.55,
              marginBottom: 14,
            }}
          >
            ⚠ <strong>Sektor usaha belum dipilih.</strong> Silakan kembali ke Tab 1 "Identitas Bisnis" untuk memilih sektor usaha — angka pertumbuhan akan menyesuaikan otomatis dengan data BPS.
          </div>
        )}

        <Field
          label="Asumsi Pertumbuhan Tahunan"
          hint={
            sectorCode
              ? "Angka di bawah dihitung otomatis dari rata-rata sektor BPS yang Anda pilih di Identitas Bisnis."
              : "Sistem akan memakai angka ini untuk proyeksi tahun ke-2 dan ke-3."
          }
        >
          <DropdownSingle
            options={growthOptions}
            value={f.growth}
            onChange={(v) => setField("growth", v)}
            compact
          />
        </Field>
      </Section>

      {/* ============= TAHAP 2: HPP PER PRODUK ============= */}
      <Section
        icon="③"
        title="Harga Pokok Penjualan / HPP (Bab 6.2)"
        desc="Pilih estimasi HPP untuk setiap produk. Jika belum tahu, pilih yang paling mendekati."
      >
        {products.length === 0 ? (
          <div
            style={{
              padding: 14,
              background: COLORS.bgPanelDeep,
              border: `1px dashed ${COLORS.border}`,
              borderRadius: 8,
              fontSize: 12,
              color: COLORS.textMuted,
              fontStyle: "italic",
              textAlign: "center",
            }}
          >
            Isi dulu daftar produk di section ② di atas, lalu pilih HPP untuk masing-masing.
          </div>
        ) : (
          products.map((p, idx) => (
            <Field
              key={idx}
              label={`Produk ${idx + 1}: ${p.name || "(belum diisi)"}`}
            >
              <DropdownSingle
                options={BAB_6_2_HPP}
                value={(f.hppPerProduk || {})[idx]}
                onChange={(v) => setHpp(idx, v)}
                compact
              />
            </Field>
          ))
        )}
      </Section>

      {/* ============= TAHAP 4: BIAYA OPERASIONAL ============= */}
      <Section
        icon="④"
        title="Biaya Operasional Bulanan (Bab 6.4)"
        desc="Pengeluaran tetap setiap bulan SELAIN gaji karyawan (ditampilkan otomatis di bawah) dan penyusutan (auto-derived dari peralatan)."
      >
        {/* Ringkasan gaji SDM bulanan — otomatis dari Kesiapan Alat & Karyawan */}
        <div style={{ marginBottom: 14, border: `1px solid ${COLORS.infoBorder}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: COLORS.bgPanelHi, borderLeft: `3px solid ${COLORS.info}` }}>
            <span style={{ fontSize: 16 }}>👥</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.12em", color: COLORS.info, fontFamily: "monospace", fontWeight: 700 }}>
                🔗 OTOMATIS DARI "KESIAPAN ALAT & KARYAWAN"
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.textHi }}>Biaya Gaji Karyawan (SDM) per Bulan</div>
              <div style={{ fontSize: 10.5, color: COLORS.textSoft }}>Gaji adalah biaya bulanan — sudah ikut dihitung dalam proyeksi laba-rugi.</div>
            </div>
            <div style={{ fontSize: 14, fontFamily: "monospace", fontWeight: 800, color: sdmMonthly > 0 ? COLORS.successHi : COLORS.textMuted }}>
              {formatRp(sdmMonthly)}
            </div>
          </div>
          {sdmPositions.length > 0 ? (
            <div style={{ padding: "8px 12px" }}>
              {sdmPositions.map((p) => (
                <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1fr 70px 150px 120px", gap: 8, alignItems: "center", padding: "5px 2px", borderBottom: `1px dashed ${COLORS.border}` }}>
                  <span style={{ fontSize: 12, color: COLORS.text }}>{p.fragment}</span>
                  <span style={{ fontSize: 12, fontFamily: "monospace", color: COLORS.textSoft }}>{p.data.count || 0} org</span>
                  <span style={{ fontSize: 12, fontFamily: "monospace", color: COLORS.textSoft }}>{formatRp(p.data.salary || 0)}/org</span>
                  <span style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: COLORS.textHi, textAlign: "right" }}>{formatRp((p.data.salary || 0) * (p.data.count || 0))}</span>
                </div>
              ))}
              {allowancePct > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 2px 0", fontSize: 11, color: COLORS.textSoft }}>
                  <span>+ Tunjangan & BPJS ({(allowancePct * 100).toFixed(0)}%)</span>
                  <span style={{ fontFamily: "monospace" }}>{formatRp(Math.round(sdmBasePayroll * allowancePct))}</span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: "10px 14px", fontSize: 11.5, color: COLORS.textMuted }}>
              ⓘ Belum ada karyawan. Isi di tab <strong>Formulir ▸ Kesiapan Alat &amp; Karyawan</strong> bagian Sumber Daya Manusia.
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field
            label="Anggaran Pemasaran Bulanan"
            hint="Iklan, voucher, biaya konten."
          >
            <RupiahInput
              value={f.opex?.marketing || 0}
              onChange={(v) => setField("opex", { ...(f.opex || {}), marketing: v })}
            />
          </Field>
          <Field
            label="Utilitas (Listrik, Air, Internet)"
            hint="Per bulan, fix cost."
          >
            <RupiahInput
              value={f.opex?.utilities || 0}
              onChange={(v) => setField("opex", { ...(f.opex || {}), utilities: v })}
            />
          </Field>
          <Field
            label="Sewa Tempat Bulanan"
            hint={rentSynced != null
              ? "🔗 Otomatis = Sewa Tempat di Muka (Initial Investment) ÷ 12 bulan. Ubah angka sewa di muka untuk menyesuaikan."
              : "Kosongkan kalau usaha dari rumah."}
          >
            <RupiahInput
              value={rentSynced != null ? rentSynced : (f.opex?.rent || 0)}
              onChange={(v) => setField("opex", { ...(f.opex || {}), rent: v })}
              disabled={rentSynced != null}
            />
          </Field>
          <Field
            label="Cadangan / Lain-lain"
            hint="Maintenance, asuransi, ongkos kirim, dll."
          >
            <RupiahInput
              value={f.opex?.other || 0}
              onChange={(v) => setField("opex", { ...(f.opex || {}), other: v })}
            />
          </Field>
        </div>

        <RuleBasedFillButton
          getSuggestion={suggestOpex}
          onResult={(opex) => setField("opex", opex)}
          label="✨ Isi Otomatis Biaya Operasional dari Data Pasar"
          hint="Angka disesuaikan dengan sektor, skala, dan tarif standar lokasi Anda."
        />

        <div
          style={{
            marginTop: 14,
            padding: "10px 14px",
            background: COLORS.bgPanelDeep,
            border: `1px dashed ${COLORS.border}`,
            borderRadius: 6,
            fontSize: 11.5,
            color: COLORS.textMuted,
            lineHeight: 1.5,
          }}
        >
          ⓘ <strong>Catatan:</strong> Penyusutan peralatan dihitung otomatis oleh sistem dari daftar
          peralatan di sub-tab "Kesiapan Alat & Karyawan" — Anda tidak perlu input manual.
          Pajak penghasilan juga di-handle otomatis (PPh Final UMKM 0,5% kalau omzet ≤ Rp 4,8 M/thn).
        </div>
      </Section>
    </>
  );
}
