// ============================================================================
// IMAGE UTILS — Compress & Resize Image untuk Upload Lampiran (Hotfix 11.1)
//
// Browser-side image compression menggunakan Canvas API:
//   1. Load image dari File object
//   2. Resize ke max 1200x900 (cukup untuk laporan, hemat storage)
//   3. Compress JPEG quality 0.75
//   4. Return base64 data URL siap embed ke <img src=...>
//
// Hasil: foto 5 MB → ~150-300 KB. Storage di localStorage masih reasonable.
// ============================================================================

const MAX_WIDTH = 1200;
const MAX_HEIGHT = 900;
const JPEG_QUALITY = 0.75;

/**
 * Compress + resize foto.
 * @param {File} file - File object dari <input type="file">
 * @returns {Promise<{dataUrl, name, size, width, height}>}
 */
export function compressImage(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith("image/")) {
      reject(new Error("File bukan gambar yang valid"));
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      reject(new Error("Ukuran file terlalu besar (max 20 MB)"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Hitung resize ratio
        let { width, height } = img;
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Render ke canvas
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff"; // white background untuk transparan PNG
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Export sebagai JPEG (kompresi lebih baik daripada PNG)
        const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
        const size = Math.round((dataUrl.length * 0.75) / 1024); // approx KB

        resolve({
          dataUrl,
          name: file.name,
          size,         // KB
          originalSize: Math.round(file.size / 1024),
          width,
          height,
        });
      };
      img.onerror = () => reject(new Error("Gagal load gambar"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Gagal baca file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Hitung total ukuran semua foto lampiran (untuk warning kalau localStorage penuh)
 */
export function totalLampiranSize(lampiranFotos = []) {
  return lampiranFotos.reduce((sum, f) => sum + (f.size || 0), 0);
}

/**
 * Generate unique ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
