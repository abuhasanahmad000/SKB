# BizCast v13.8 — Fix Duplikasi Stok & Renovasi di Daftar Peralatan

## Perubahan v13.8
- **Duplikasi biaya Stok Awal & Renovasi/Interior diperbaiki**: rekomendasi rule-based 'Daftar Peralatan Kerja Utama' di sub-tab Kesiapan Alat & Karyawan dulu ikut memunculkan 'Stok Awal (inventory)' dan 'Renovasi & Interior' karena keduanya tercampur di data aset sektor. Akibatnya nilai dobel di Initial Investment (peralatan otomatis mengalir ke sana, sementara Stok & Renovasi juga punya kategori sendiri). Kini rekomendasi peralatan HANYA berisi alat/mesin nyata; Stok Awal dan Renovasi cukup muncul di Initial Investment. Berlaku semua sektor, bisnis baru & lanjutan.

---

# BizCast v13.7 — Bab 7 Kembali ke Posisi Sebelum Bab 8

## Perubahan v13.7
- **Urutan bab laporan diperbaiki**: Bab 7 (Permintaan Pendanaan & Struktur Modal) dikembalikan ke posisi alaminya — setelah Bab 6.6 dan SEBELUM Bab 8 — menggantikan penempatan di akhir dokumen (v13.1) yang membuat alur janggal (Bab 8 → 9 → 7 → Lampiran). Susunan baru: …6.6 → 7 → 8 → 9 → Lampiran Bulanan. Hero 'angka dana yang diminta' dan badge 'INTI PROPOSAL' di Daftar Isi tetap dipertahankan. Berlaku di preview aplikasi, file unduhan, dan Daftar Isi.

---

# BizCast v13.6 — Fix "Rp 0 diajukan" di Bab 6.6

## Perubahan v13.6
- **Bab 6.6 (Struktur Pendanaan & Use of Funds)** dulu menulis 'Rp 0 diajukan sebagai pendanaan eksternal' padahal Bab 7 jelas menampilkan nominalnya. Penyebab: kalimat intro membaca `ft.nominal` yang tetap 0 jika user mengisi sumber dana lewat Smart Balance (tab Keuangan) tanpa membuka form Parameter Pendanaan. Kini angka dana eksternal dihitung dari `modal.funding` sesuai jenis pendanaan — KUR/komersial → Modal Pinjaman; investor/hibah → Modal Mitra — PERSIS seperti Bab 7. Berlaku untuk semua sektor & bisnis baru maupun lanjutan. Uji: skenario KUR pada laporan toko baju kini menampilkan Rp 133 jt (bukan Rp 0).

---

# BizCast v13.5 — Sinkronisasi Alat/SDM/Sewa & Harga Produk Titik-Tengah

## Perubahan v13.5
- **Peralatan muncul otomatis di Initial Investment**: 'Daftar Peralatan Kerja Utama' dari sub-tab Kesiapan Alat & Karyawan kini tampil sebagai daftar rincian read-only (nama, qty, harga satuan, subtotal) di tab Keuangan ▸ Initial Investment — bukan lagi satu baris ringkas. Tidak ada input ganda. Berlaku bisnis baru & lanjutan.
- **SDM muncul sebagai biaya bulanan di Proyeksi**: gaji karyawan (beserta tunjangan/BPJS) kini ditampilkan otomatis sebagai ringkasan biaya bulanan di tab Keuangan ▸ Proyeksi Pendapatan & Biaya, karena memang biaya rutin — bukan biaya investasi awal.
- **Sewa tempat sinkron**: rekomendasi rule-based 'Sewa Tempat di Muka' di Initial Investment kini selalu 1 tahun (12 bulan). Field 'Sewa Tempat Bulanan' di Proyeksi otomatis = sewa di muka ÷ 12 (terkunci & menjelaskan asalnya), jadi dua angka tidak pernah bentrok lagi.
- **Harga produk = titik tengah pasar (semua sektor)**: tiap produk default kini punya rentang harga pasar 2025 [termurah, termahal] dan harga yang dipakai = titik tengahnya (sebelumnya condong ke ujung murah → proyeksi rendah & indikator sering tidak bankable). Prompt AI produk juga diinstruksikan memakai harga tengah. Hasil uji: Warung Kopi NPV +476 jt, Toko Pakaian +851 jt, Salon +259 jt (semua LAYAK).

---

# BizCast v13.4 — Risiko AI Sadar-Sektor & Kolom Initial Investment Gelap

## Perubahan v13.4
- **Risiko AI selalu 'warung kopi' — AKAR DITEMUKAN & DIPERBAIKI**: prompt menyisipkan `${buildBusinessContext(forms)}` padahal fungsi itu mengembalikan OBJEK, sehingga yang terkirim ke AI hanyalah string `[object Object]` — AI tak pernah tahu sektor user dan jatuh ke contoh generik/F&B. Kini konteks dirangkai eksplisit (nama, **sektor**, produk, skala, lokasi) dan prompt menegaskan jawaban harus khas sektor yang dipilih. Berlaku untuk tombol 'Isi Semua 5 Risiko' maupun 'Bantu AI Tuliskan' per kolom.
- Bonus: KBLI yang tampil sebagai 'undefined' pada konteks kini benar (mis. 47711 untuk Toko Pakaian).
- **Kolom Initial Investment & Sumber Dana putih**: field nama item masih background putih dengan teks terang sehingga tak terbaca — kini gelap (`bgPanelDeep`, teks `textHi`), konsisten dengan kolom angka.

---

# BizCast v13.3 — Hotfix Tampilan Risiko, Tombol AI, BEP & Konsistensi Angka

## Perubahan v13.3
- **Kolom Analisis & Mitigasi Risiko gelap**: field sebelumnya putih dengan teks terang sehingga tak terbaca.
- **Tombol 'Isi Semua 5 Risiko dengan AI' diperbaiki**: respons Gemini bisa terpecah ke beberapa `parts` — kini semua parts digabung; permintaan JSON memakai `responseMimeType: application/json` (juga untuk rekomendasi AI Initial Investment); pesan error lebih jelas.
- **Kalkulator Break-even — akar masalah ditemukan**: ada dua file kembar `BreakEvenChart.jsx` & `BreakevenChart.jsx` (beda kapital saja). Di sistem file case-insensitive (HP/Windows) keduanya saling menimpa saat ekstrak ZIP/upload, sehingga sub-tab kalkulator hilang. Keduanya di-rename permanen: `BepCalculator.jsx` (sub-tab) & `BepReportChart.jsx` (chart laporan Bab 8). **PENTING: hapus file lama `BreakEvenChart.jsx` dan `BreakevenChart.jsx` dari repo GitHub.**
- **Temuan C (BEP 38 vs 37,5 vs 34,8)**: chart Analisis Titik Impas di laporan kini membaca `fin.bep` dari engine (sebelumnya menghitung sendiri tanpa depresiasi & tunjangan) — satu angka BEP di Bab 1, KPI Bab 8, dan grafik.
- **Temuan B (540 vs 548 & laba)**: prompt AI Bab 1 & narasi bab kini WAJIB memakai angka persis dari konteks engine; seluruh tabel sudah membaca engine sejak v13.2 — setelah redeploy penuh dan regenerate narasi, angka identik.
- **Temuan E (risiko tertukar)**: prompt AI risiko kini punya definisi tegas per kategori (operasional = internal: mesin/supplier; keuangan = arus kas berjalan; DILARANG menulis 'gagal mendapat pendanaan' di kedua kategori itu) + larangan duplikasi tema antar kategori.
- **Temuan D (lonjakan Espresso B2)**: kode lampiran bulanan saat ini murni `pendapatan tahunan × faktor seasonality` yang menanjak mulus (puncak Desember) — lonjakan di laporan lama berasal dari deployment campuran file lama/baru. Setelah upload ulang penuh, pola dijamin berjenjang.

---

# BizCast v13.2 — Sinkronisasi Finansial Total & Perbaikan Laporan

## Perubahan v13.2 (di atas v13.1)

### Konsistensi data finansial (temuan kritis A & B — FIXED)
- **Satu sumber kebenaran P&L**: `financialEngine.computeYearPnL` kini menghitung depresiasi renovasi (5 thn) + **beban bunga anuitas riil** (`computeDebtSchedule`, 11,5%, tenor sesuai input). Tabel Pro Forma P&L/Cash Flow (JSX & HTML) tidak lagi menghitung sendiri — laba bersih di narasi Bab 6/8, tabel, KPI, dan DSCR kini SELALU identik.
- **Satu basis kebutuhan dana**: tabel Start-up Requirements (Bab 6.5 & Bab 7) kini memakai TOTAL initial investment (rincian item + peralatan) — sama dengan Use of Funds. "Surplus pendanaan" semu Rp 154,6 jt hilang; persentase bobot UoF kini konsisten dengan halaman lain. Intro Bab 6.6 menjelaskan total kebutuhan vs nominal yang diajukan.
- DSCR kini berbasis **EBITDA / debt service** dengan cicilan dari jadwal anuitas yang sama.

### NPV/IRR negatif semu (temuan C — FIXED)
- FCF unlevered (bunga dikembalikan; biaya modal ada di WACC) + **pemulihan terminal**: deposit sewa, modal kerja, dan stok dikembalikan di tahun akhir horizon — kas yang tidak hangus tidak lagi dihitung hangus.
- Rule-based itemizer dikalibrasi per skala: capex dampener (mikro 0.5, kecil 0.85), deposit sewa 3 bulan untuk mikro/kecil, buffer 5%. Mapping agregat: deposit & modal kerja → `expenses.lainnya` (non-depresiasi) sehingga depresiasi tidak menggelembung.
- Hasil uji skenario warung kopi mikro Surabaya: total investasi 186,7 jt; NPV **+Rp 90,3 jt (LAYAK)**, IRR 31,4%, payback 26 bulan.

### Seasonality (temuan D — FIXED)
- Pola bulanan satu sumber (`src/data/seasonality.js`): ramp-up halus + puncak Desember (high season akhir tahun), jumlah faktor = 1.000. Tidak ada lagi anjlok 70% di B11-B12. Dipakai AppendixMonthly, StackedSalesCharts, MonthlyCharts.
- Laba bersih bulanan kini diturunkan dari rumus (laba kotor × faktor − biaya tetap/12) sehingga **jumlah 12 bulan = laba tahunan persis** (bulan awal otomatis rugi secara alami).

### Perbaikan UI/laporan lain
- **Payback Period kini tampil juga untuk bisnis baru** (sub-tab baru di tab Hasil).
- **Ringkasan Eksekutif terpotong — FIXED**: model Gemini 2.5 menghabiskan token output untuk "thinking"; kini `thinkingBudget: 0` untuk autofill + token dinaikkan (Bab 1: 6.000, multi-bab: 16.000) + retry otomatis bila model tak mendukung field.
- **Judul dobel di tiap bab — FIXED**: `sanitizeAiParagraphs` membuang heading "Bab N: ..." yang ditulis AI; prompt juga melarangnya.
- **Chart Cash Flow Bulanan flat — FIXED**: bug campuran satuan (saldo rupiah vs arus juta). Kini net cash flow bergelombang sesuai seasonality (batang) + saldo kas kumulatif (garis), sumbu berformat juta.

---

# BizCast v13.1 — Tab Keuangan, Initial Investment Terperinci & Bab 7 Klimaks

## Perubahan v13.1 (di atas v13 Single Persona)

### 1. Tab KEUANGAN baru (kedua jenis bisnis)
- Semua input keuangan kini terpusat: **Initial Investment & Sumber Dana** + **Proyeksi Pendapatan & Biaya** (dipindah dari Formulir).
- Sub-tab "Anggaran Modal Awal" lama & "Use of Funds" lama (yang sebenarnya sama) DILEBUR menjadi **Initial Investment terperinci**:
  - Rincian per item (nama, qty, harga satuan) dalam 7 kategori; kategori berbeda untuk bisnis baru vs lanjutan (inkremental).
  - **✨ Rekomendasi rule-based**: harga riil pasar per sektor KBLI + UMK/UMP daerah 2025 (gaji, sewa, legalitas, dst).
  - **🪄 Rekomendasi AI**: prompt menyertakan sektor, daerah, UMK, skala → JSON item harga riil.
  - Peralatan otomatis dari sub-tab Alat & Karyawan (tidak dobel input).
  - **Smart Balance Check (Bab 7.3)** ikut di sini — perhitungan kini EKSAK rupiah-per-rupiah (toleransi 1 jt yang bikin rancu dihapus), tampilan angka penuh, plus tombol **⚖ Seimbangkan Otomatis**.
- Agregat lama (expenses/assets) tersinkron otomatis → seluruh engine lama tetap akurat.

### 2. Mitigasi Risiko pindah ke Formulir Studi Kelayakan
- Sub-tab baru **Analisis & Mitigasi Risiko** dengan AI autofill per-risiko + tombol **Isi Semua 5 Risiko dengan AI**.

### 3. Perbaikan skor yang "selalu jelek" (akar masalah: sumber input & kurva)
- **Metode & Proses Operasional Penjualan**: kini membaca metode + kanal penjualan + teknologi (dulu hanya 1 field yang sering kosong).
- **Komitmen Tata Kelola & Compliance**: penasihat jadi bonus, bukan syarat dominan; badan hukum, struktur, anggaran legal & identitas kini dihitung.
- **Karakter Sektor Usaha**: baseline per grup direvisi realistis, grup "Manufaktur" kini ter-match, dan praktik ramah lingkungan MEMITIGASI dampak inherent.
- **Performa Pasar Saat Ini** (bisnis berjalan): ambang omset kini per SKALA usaha (mikro 15 jt ≠ menengah 250 jt) + bonus usia & laba positif.

### 4. Kalkulator Break-even bisnis baru
- Bug guard `0 = falsy` diperbaiki; empty-state kini menjelaskan langkah persis yang harus diisi.

### 5. Laporan
- **Bab 2, 3, 5**: narasi multi-paragraf komprehensif (sintesis, tetap lugas) + VISUAL baru: Peta Peluang (masalah→solusi→segmen), Matriks Eksekusi 4 Pilar, Bagan Organisasi.
- **Bab 4**: tiap aspek kini 4-5 kalimat (kekuatan + kelemahan + saran + makna bagi pendana) + paragraf sintesis antar-aspek.
- **Radar 5 Aspek**: SVG baru efek 3D (extrude + gradasi + bayangan), label & badge nilai DI LUAR pentagon (tidak bertumpuk), garis ambang LAYAK 70%, skor agregat di pusat. Tampil di preview & file unduhan.
- **Bab 6.6 angka nol** diperbaiki: Use of Funds kini DI-DERIVE otomatis dari rincian Initial Investment (+peralatan), bukan input manual yang kosong.
- **Bab 7 menjadi BAB TERAKHIR (klimaks)** berjudul "Permintaan Pendanaan & Struktur Modal", dibuka **hero angka dana yang diminta** sesuai jenis pilihan user (KUR/komersial → angka pinjaman; investor/hibah → angka dana mitra), lengkap tenor & komposisi modal sendiri. Daftar Isi ikut disesuaikan (badge INTI PROPOSAL).

### File baru
- `src/engines/investmentHelper.js` — kategori, derive agregat & Use of Funds, rule-based itemizer, prompt AI.
- `src/components/forms/sections/InitialInvestmentForm.jsx`
- `src/components/forms/sections/RisikoMitigasiForm.jsx`
- `src/components/results/RadarSkb.jsx` — radar SVG (preview = ekspor).
- `src/components/results/ChapterVisuals.jsx` — visual Bab 2/3/5 + FundingAskHero.

---

# BizCast v13 — Single Persona: Pencari Dana

> **Status: Refactor v13 selesai.** BizCast kini melayani **satu persona: Pencari Dana**.
> Tidak ada lagi pemilihan Jalur A/B/C di gateway. Sebagai gantinya, di dasbor user memilih
> **jenis bisnis**: **Bisnis Baru** atau **Bisnis Lanjutan** — dan seluruh isian, parameter
> kelayakan, rekap skor, keuangan, hingga laporan menyesuaikan otomatis.

---

## 🎯 Konsep Inti v13

Semua user BizCast adalah pencari dana (bank/KUR, investor, atau hibah). Yang membedakan
hanyalah **tahap bisnisnya**:

| | 🚀 Bisnis Baru | 📈 Bisnis Lanjutan |
|---|---|---|
| Basis proyeksi | Murni asumsi riset pasar | Baseline historis (omset, HPP, laba riil) |
| Fokus kelayakan | Validasi ide: masalah–solusi–segmen–UVP | Rekam jejak, utilisasi kapasitas & bottleneck |
| Modal | Start-up requirements masif (renovasi, legalitas, stok awal, promosi pembukaan) | Anggaran pengembangan inkremental |
| Aspek hukum | Rencana perizinan dari nol | Kelengkapan legalitas berjalan (NIB, NPWP, dst.) |
| DSCR | Murni dari proyeksi (margin kehati-hatian lebih tebal) | Diperkuat laba bisnis eksisting (kerangka 5C: Capacity) |
| Bab khusus 6.5 | Validasi Ide & Analisis Kompetitif | Kinerja Historis & Analisis Inkremental |
| Bab khusus 6.6 | Struktur Pendanaan, Use of Funds & Mitigasi Risiko | Sama — dengan DSCR sadar-stage |
| Bobot skor | Pemasaran .30 · Teknis .20 · Manajemen .20 · Hukum .20 · Lingkungan .10 | Pemasaran .20 · Teknis .20 · Manajemen .25 · Hukum .25 · Lingkungan .10 |

**Selalu aktif untuk kedua jenis** (standar pencari dana):
- Dimensi "Kompetensi & Latar Belakang Pendiri" (Character — 5C bank)
- Dimensi "Realisme Parameter Pendanaan" (nominal, jenis dana, tenor, jaminan)
- Critical gate ketat: aspek kritikal (termasuk hukum) wajib **LAYAK**, tanpa toleransi
- Bab 6.6: Use of Funds + DSCR + Mitigasi Risiko 5 kategori + Indikator Bankable

## 🏗️ Perubahan Arsitektur

- `state.app.businessStage` ("baru" | "lanjutan", default "baru") menggantikan `gateway.pathway`
- Gateway kini hanya 2 langkah: Login → API Key (PathwaySelector dihapus)
- `src/data/pathways.js` → STAGE_CONFIGS keyed `baru`/`lanjutan` + `remapRouteForStage()`
- Subtab baru **"Jenis Bisnis"** (Tab 1) → `BusinessStageSelector.jsx` dengan kartu isometrik
- `scoringEngine.js` v5 stage-aware: dimensi tambahan untuk bisnis lanjutan
  (Justifikasi Kapasitas & Bottleneck, Rekam Jejak & Kesehatan Keuangan, Kelengkapan Legalitas)
- `PathwaySpecificSections.jsx`: setiap laporan memuat **dua** bab khusus (6.5 per stage + 6.6 selalu)
- DSCR sadar-stage: NOI bisnis lanjutan = laba proyeksi + laba eksisting tahunan
- Grafik isometrik SVG baru (`IsoGraphics.jsx`): roket (baru), bar chart menanjak (lanjutan),
  koin+brankas (pendanaan), kluster cover — tampil di selector, bab khusus, dan cover laporan
- Judul laporan: "Proposal Pendanaan & Studi Kelayakan Bisnis" (baru) /
  "…Pengembangan Usaha" (lanjutan)

## 🚀 Menjalankan

```bash
npm install
npm run dev      # development
npx vite build   # production → dist/
```

Konstanta penting: ambang LAYAK ≥ 70%, cap per aspek 85%, cap agregat 80%,
bunga efektif DSCR 11,5%/tahun anuitas, standar bank DSCR ≥ 1,25x.

> Riwayat versi sebelumnya: lihat `README-hotfix12.md`.
