# Panduan Deploy BizCast ke GitHub + Vercel

Dokumen ini menjelaskan cara mengunggah proyek BizCast ke GitHub lalu men-deploy-nya ke Vercel. Aplikasi ini adalah SPA (Single Page Application) statis berbasis Vite + React, sehingga tidak memerlukan server backend maupun kunci rahasia (secret) di sisi server.

## Catatan Penting Sebelum Deploy

Aplikasi ini memakai dua layanan eksternal, keduanya dipanggil langsung dari browser pengguna (client side), bukan dari server:

1. Google Login masih berupa mock (tiruan). Tombol "Lanjut dengan Google" hanya menyimpan nama dan email yang diisi pengguna, tanpa autentikasi nyata. Ini aman untuk demo dan produksi awal. Bila nanti ingin autentikasi asli, ganti komponen di `src/components/gateway/LoginGoogle.jsx` dengan Google Identity Services atau Firebase Auth.

2. Gemini AI memakai skema BYOK (Bring Your Own Key). Setiap pengguna memasukkan API key Gemini miliknya sendiri lewat layar setup, dan key itu disimpan di localStorage browser masing masing. Jadi Anda sebagai pemilik deployment tidak perlu menaruh API key apa pun di Vercel.

Kesimpulannya, tidak ada Environment Variable rahasia yang wajib diisi di Vercel. Deploy bisa langsung jalan.

## Prasyarat

1. Akun GitHub (gratis) di https://github.com
2. Akun Vercel (gratis) di https://vercel.com, sebaiknya daftar memakai akun GitHub agar terhubung otomatis
3. Git terpasang di komputer, atau cukup pakai antarmuka web GitHub untuk unggah manual

## Langkah 1: Unggah ke GitHub

### Opsi A: Lewat Git di terminal (disarankan)

Buka terminal di dalam folder proyek ini, lalu jalankan:

```bash
git init
git add .
git commit -m "Initial commit: BizCast studi kelayakan bisnis"
git branch -M main
```

Buat repository baru dan kosong di GitHub (jangan centang "Add README"), lalu salin URL-nya dan jalankan:

```bash
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```

Ganti `USERNAME` dan `NAMA-REPO` sesuai milik Anda.

### Opsi B: Lewat web GitHub (tanpa Git)

1. Buat repository baru dan kosong di GitHub
2. Klik "uploading an existing file"
3. Seret semua isi folder proyek ini ke halaman unggah. Jangan sertakan folder `node_modules` maupun `dist` bila ada, karena keduanya akan dibuat ulang otomatis
4. Klik "Commit changes"

## Langkah 2: Deploy di Vercel

1. Masuk ke https://vercel.com dan login dengan akun GitHub
2. Klik "Add New" lalu "Project"
3. Pilih repository BizCast yang tadi Anda unggah, klik "Import"
4. Vercel akan mendeteksi otomatis bahwa ini proyek Vite. Pengaturan berikut biasanya sudah terisi sendiri:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Bagian Environment Variables bisa dikosongkan
6. Klik "Deploy" dan tunggu proses selesai (sekitar satu sampai dua menit)

Setelah selesai, Vercel memberikan URL publik, misalnya `https://nama-repo.vercel.app`. Aplikasi Anda sudah live.

## Update Selanjutnya

Setiap kali Anda melakukan `git push` ke branch `main`, Vercel otomatis mem-build ulang dan mem-publish versi terbaru. Tidak perlu deploy manual lagi.

## Menjalankan Secara Lokal (Opsional)

Untuk mengembangkan di komputer sendiri:

```bash
npm install
npm run dev
```

Server pengembangan akan berjalan di http://localhost:5173

Untuk menguji hasil build produksi secara lokal:

```bash
npm run build
npm run preview
```

## Isi Berkas Konfigurasi yang Ditambahkan

1. `.gitignore` mencegah folder `node_modules`, `dist`, dan berkas lingkungan ikut terunggah ke GitHub
2. `vercel.json` memberi tahu Vercel bahwa ini proyek Vite dan mengarahkan semua rute ke `index.html` (rewrite SPA), sehingga refresh halaman tidak menghasilkan error 404
3. Kolom `engines` di `package.json` memastikan Vercel memakai Node.js versi 18 ke atas
