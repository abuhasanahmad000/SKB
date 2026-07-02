import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Konfigurasi Vite dengan code-splitting strategis (Tahap 11)
// Tujuan: pisahkan vendor library besar dari main bundle supaya:
//   1. First-paint lebih cepat (load main bundle dulu, vendor parallel)
//   2. Browser cache vendor terpisah (kalau code app update, vendor tidak re-download)
//   3. Mobile network friendly — vendor chunks bisa skipped kalau tidak dibutuhkan
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Recharts (largest dep) — only loaded saat user buka Tab 3 chart
          "vendor-charts": ["recharts"],
          // React core — stable across versions, baik untuk caching
          "vendor-react": ["react", "react-dom"],
        },
      },
    },
    // Naikkan threshold warning supaya tidak spam (kita sudah split)
    chunkSizeWarningLimit: 600,
  },
});
