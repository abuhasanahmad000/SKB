import { useState } from "react";
import { COLORS } from "../primitives/styles.js";
import Button from "../primitives/Button.jsx";
import Input from "../primitives/Input.jsx";

import Field from "../forms/Field.jsx";
import Section from "../forms/Section.jsx";
import ChecklistMulti from "../forms/ChecklistMulti.jsx";
import DropdownSingle from "../forms/DropdownSingle.jsx";
import KuisionerYRT from "../forms/KuisionerYRT.jsx";
import RupiahInput from "../forms/RupiahInput.jsx";
import NumberInput from "../forms/NumberInput.jsx";
import ProductTable from "../forms/ProductTable.jsx";
import PersonnelTable from "../forms/PersonnelTable.jsx";
import EquipmentTable from "../forms/EquipmentTable.jsx";
import SmartFundingBalance from "../forms/SmartFundingBalance.jsx";

import {
  BAB_2_1_MASALAH,
  BAB_2_2_SOLUSI,
  BAB_3_3_STATUS_TEMPAT,
  BAB_5_1_BENTUK_HUKUM,
  BAB_6_2_HPP,
} from "../../data/babOptions.js";
import { KUESIONER } from "../../data/kuesioner.js";

// ============================================================================
// <FormPrimitivesDemo /> — showcase semua 9 form primitives
//
// Komponen showcase dengan live state untuk verifikasi Tahap 4. Setiap section
// memperagakan satu primitive dengan data dummy dari babOptions / kuesioner.
//
// Akan dipakai di SubtabContent placeholder lewat tombol "🎨 Demo Komponen Form".
// Tidak digunakan di production setelah Tahap 5 selesai mewireing semua sub-tab.
//
// Props:
//   - onClose : callback untuk tutup demo
// ============================================================================

export default function FormPrimitivesDemo({ onClose }) {
  // State untuk demo
  const [businessName, setBusinessName] = useState("Kopi Senja Bandung");
  const [masalah, setMasalah] = useState(["lokasi_kosong", "kualitas_kurang"]);
  const [solusi, setSolusi] = useState(["kualitas_harga"]);
  const [statusTempat, setStatusTempat] = useState("sewa_bulanan");
  const [bentukHukum, setBentukHukum] = useState("pt_perorangan");
  const [hppProduk1, setHppProduk1] = useState("40");
  const [kuisionerPemasaran, setKuisionerPemasaran] = useState({ p1: 3, p2: 2 });
  const [rupiah, setRupiah] = useState(15000000);
  const [jumlah, setJumlah] = useState(3);
  const [products, setProducts] = useState([
    { name: "Espresso", dailyTarget: 30, price: 25000 },
    { name: "Latte", dailyTarget: 25, price: 30000 },
  ]);
  const [personnel, setPersonnel] = useState({
    positions: {
      manager: { active: true, count: 1, salary: 4000000 },
      cashier: { active: true, count: 2, salary: 2800000 },
    },
    allowanceMode: "mikro",
  });
  const [equipment, setEquipment] = useState([
    { name: "Mesin Espresso 2-Group", qty: 1, pricePerUnit: 25000000 },
    { name: "Coffee Grinder", qty: 1, pricePerUnit: 8000000 },
  ]);
  const [funding, setFunding] = useState({
    modalPribadi: 30000000,
    modalMitra: 0,
    modalPinjaman: 0,
  });

  const totalEquipment = equipment.reduce(
    (s, e) => s + (e.qty || 0) * (e.pricePerUnit || 0),
    0
  );
  // Asumsi total kebutuhan = peralatan + 50jt biaya start-up
  const totalNeeded = totalEquipment + 50_000_000;

  return (
    <div style={{ padding: "0 0 60px" }}>
      {/* Sticky header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: COLORS.bg,
          padding: "20px 0 16px",
          borderBottom: `1px solid ${COLORS.border}`,
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <span
            style={{
              padding: "4px 10px",
              background: COLORS.accentBg,
              color: COLORS.accent,
              border: `1px solid ${COLORS.accent}`,
              borderRadius: 4,
              fontSize: 10,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: "0.1em",
            }}
          >
            🎨 DEMO TAHAP 4
          </span>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: COLORS.textHi }}>
            Showcase Form Primitives
          </h1>
          <span style={{ flex: 1 }} />
          <Button variant="ghost" onClick={onClose}>
            ✕ Tutup Demo
          </Button>
        </div>
        <p style={{ fontSize: 13, color: COLORS.textSoft, margin: 0, maxWidth: 720 }}>
          Semua 9 form primitives Tahap 4 ditampilkan di sini dengan state interaktif.
          Coba klik/edit field — primitive sudah siap di-wire ke sub-tab di Tahap 5.
        </p>
      </div>

      {/* === 1. <Field /> + <Input /> + simple text === */}
      <Section
        icon="①"
        title="<Field /> + <Input />"
        desc="Wrapper standar untuk satu field form: label di atas, input di tengah, helper text di bawah."
      >
        <Field
          label="Nama Bisnis"
          required
          hint="Nama yang akan tampil di sampul laporan."
          helper="Tip: gunakan nama unik yang mudah diingat warga lokal."
        >
          <Input value={businessName} onChange={setBusinessName} placeholder="cth. Kopi Senja" />
        </Field>

        <Field
          label="Email Kontak (contoh state error)"
          error="Format email tidak valid — gunakan format nama@domain.com"
        >
          <Input value="email-tanpa-at" onChange={() => {}} />
        </Field>

        <Field
          label="NPWP (contoh state sukses)"
          success="Format NPWP valid dan terverifikasi"
        >
          <Input value="01.234.567.8-901.000" onChange={() => {}} />
        </Field>
      </Section>

      {/* === 2. <RupiahInput /> & <NumberInput /> === */}
      <Section
        icon="②"
        title="<RupiahInput /> & <NumberInput />"
        desc="Input khusus mata uang Rupiah (auto-format ribuan) dan integer dengan suffix satuan."
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Modal Awal" hint={`Tersimpan sebagai number: ${rupiah}`}>
            <RupiahInput value={rupiah} onChange={setRupiah} hint="Rekomendasi pemula: Rp 30-60 juta" />
          </Field>
          <Field label="Jumlah Karyawan" hint={`Tersimpan sebagai number: ${jumlah}`}>
            <NumberInput value={jumlah} onChange={setJumlah} suffix="orang" min={0} max={50} />
          </Field>
        </div>
      </Section>

      {/* === 3. <ChecklistMulti /> === */}
      <Section
        icon="③"
        title="<ChecklistMulti /> — dengan Live Preview Narasi"
        desc="Multi-select checkbox yang langsung men-generate preview kalimat narasi laporan dari fragment opsi yang dipilih. JANTUNG rule-based engine — tanpa AI."
      >
        <Field label="Bab 2.1 — Masalah Pelanggan yang Akan Diselesaikan">
          <ChecklistMulti
            options={BAB_2_1_MASALAH}
            value={masalah}
            onChange={setMasalah}
            previewPrefix="Beberapa permasalahan kunci yang teridentifikasi antara lain: "
            previewSuffix="."
          />
        </Field>

        <Field label="Bab 2.2 — Solusi yang Kami Tawarkan (dengan batas max 3)">
          <ChecklistMulti
            options={BAB_2_2_SOLUSI}
            value={solusi}
            onChange={setSolusi}
            max={3}
            previewPrefix="Sebagai respons, usaha ini hadir dengan "
            previewSuffix="."
          />
        </Field>
      </Section>

      {/* === 4. <DropdownSingle /> === */}
      <Section
        icon="④"
        title="<DropdownSingle /> — Radio Cards (Single Select)"
        desc="Single-select dengan visual card yang clickable. Lebih ramah dan accessible dibanding <select> HTML."
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignItems: "start" }}>
          <Field label="Bab 3.3 — Status Kepemilikan Tempat">
            <DropdownSingle
              options={BAB_3_3_STATUS_TEMPAT}
              value={statusTempat}
              onChange={setStatusTempat}
            />
          </Field>
          <Field label="Bab 5.1 — Bentuk Hukum (dengan preview fragment)">
            <DropdownSingle
              options={BAB_5_1_BENTUK_HUKUM}
              value={bentukHukum}
              onChange={setBentukHukum}
              showFragment
            />
          </Field>
        </div>

        <Field label="Bab 6.2 — HPP Produk 1 (mode compact)">
          <DropdownSingle
            options={BAB_6_2_HPP}
            value={hppProduk1}
            onChange={setHppProduk1}
            compact
          />
        </Field>
      </Section>

      {/* === 5. <KuisionerYRT /> === */}
      <Section
        icon="⑤"
        title="<KuisionerYRT /> — Bab 4 dengan Scoring Real-Time"
        desc="Kuesioner Ya/Ragu/Tidak dengan visual scoring proporsional + narasi otomatis muncul saat semua pertanyaan terjawab."
      >
        <KuisionerYRT
          aspect={KUESIONER.pemasaran}
          value={kuisionerPemasaran}
          onChange={setKuisionerPemasaran}
        />
      </Section>

      {/* === 6. <ProductTable /> === */}
      <Section
        icon="⑥"
        title="<ProductTable /> — Bab 6.1 Revenue Input"
        desc="Tabel input produk dengan auto-projection harian/bulanan/tahunan. Bisa tambah/hapus baris."
      >
        <ProductTable value={products} onChange={setProducts} />
      </Section>

      {/* === 7. <PersonnelTable /> === */}
      <Section
        icon="⑦"
        title="<PersonnelTable /> — Bab 6.3 SDM"
        desc="3 posisi standar (Manager/Kasir/Produksi) sebagai checkbox + input gaji + dropdown tunjangan."
      >
        <PersonnelTable value={personnel} onChange={setPersonnel} />
      </Section>

      {/* === 8. <EquipmentTable /> === */}
      <Section
        icon="⑧"
        title="<EquipmentTable /> — Bab 3.4 Peralatan"
        desc="Tabel peralatan sederhana yang grand-totalnya otomatis menjadi input ke Bab 7.2 Modal Aset."
      >
        <EquipmentTable value={equipment} onChange={setEquipment} />
        <div
          style={{
            marginTop: 12,
            padding: "8px 12px",
            background: COLORS.infoBg,
            border: `1px solid ${COLORS.infoBorder}`,
            borderRadius: 6,
            fontSize: 11.5,
            color: COLORS.info,
          }}
        >
          ↓ Total peralatan di atas akan otomatis muncul sebagai bagian dari Total Kebutuhan di komponen berikutnya
        </div>
      </Section>

      {/* === 9. <SmartFundingBalance /> === */}
      <Section
        icon="⑨"
        title="<SmartFundingBalance /> — Bab 7.3 Smart Balance"
        desc="Komponen paling cerdas: total kebutuhan dihitung otomatis. Sistem cek selisih dana → 'Kurang' merah / 'Pas' hijau / 'Surplus' kuning (auto-jadi Kas Cadangan)."
      >
        <SmartFundingBalance value={funding} onChange={setFunding} totalNeeded={totalNeeded} />
        <div
          style={{
            marginTop: 12,
            padding: "8px 12px",
            background: COLORS.bgPanelDeep,
            border: `1px dashed ${COLORS.border}`,
            borderRadius: 6,
            fontSize: 11,
            color: COLORS.textMuted,
            lineHeight: 1.5,
            fontFamily: "monospace",
          }}
        >
          DEMO: total kebutuhan ={" "}
          <strong style={{ color: COLORS.text }}>peralatan ({equipment.length} item)</strong> +{" "}
          <strong style={{ color: COLORS.text }}>asumsi Rp 50 juta biaya start-up</strong>.
          Coba isi sumber dana berbeda untuk lihat status berubah.
        </div>
      </Section>
    </div>
  );
}
