// ============================================================================
// IsoGraphics — ilustrasi SVG bergaya ISOMETRIK 3D (Refactor v13)
//
// Dipakai di:
//   - BusinessStageSelector (kartu pilihan jenis bisnis di dasbor)
//   - Laporan: header Bab 6.5 / 6.6 dan aksen sampul
//   - Ekspor HTML/Word via isoSvgString(type)
//
// Semua digambar manual dengan proyeksi isometrik standar (30°):
//   sumbu kanan: (+x, +0.5y) · sumbu kiri: (-x, +0.5y) · sumbu atas: (-y)
// Tiga bidang kubus diberi 3 tone warna agar efek 3D terasa.
// ============================================================================

// ----- util: kubus isometrik di posisi (cx, cy) ukuran s, tinggi h -----
function isoCube(cx, cy, s, h, [top, left, right]) {
  const x = cx, y = cy;
  return `
    <polygon points="${x},${y - h} ${x + s},${y - h + s / 2} ${x},${y - h + s} ${x - s},${y - h + s / 2}" fill="${top}"/>
    <polygon points="${x - s},${y - h + s / 2} ${x},${y - h + s} ${x},${y + s} ${x - s},${y + s / 2}" fill="${left}"/>
    <polygon points="${x + s},${y - h + s / 2} ${x},${y - h + s} ${x},${y + s} ${x + s},${y + s / 2}" fill="${right}"/>
  `;
}

// ----- 1. BISNIS BARU: roket isometrik lepas landas dari fondasi kubus -----
function svgNewBusiness(size = 120) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  ${isoCube(60, 88, 26, 8, ["#BAE6FD", "#7DD3FC", "#38BDF8"])}
  ${isoCube(60, 80, 18, 8, ["#E0F2FE", "#BAE6FD", "#7DD3FC"])}
  <!-- badan roket -->
  <polygon points="60,12 72,44 72,66 60,74 48,66 48,44" fill="#0EA5E9"/>
  <polygon points="60,12 72,44 72,66 60,74" fill="#0284C7"/>
  <!-- jendela -->
  <ellipse cx="60" cy="46" rx="7" ry="8" fill="#E0F2FE"/>
  <ellipse cx="62" cy="46" rx="3.5" ry="8" fill="#BAE6FD"/>
  <!-- sirip -->
  <polygon points="48,52 38,66 48,66" fill="#0369A1"/>
  <polygon points="72,52 82,66 72,66" fill="#075985"/>
  <!-- semburan -->
  <polygon points="54,72 60,86 66,72 60,78" fill="#FBBF24"/>
  <polygon points="57,74 60,82 63,74" fill="#F97316"/>
</svg>`;
}

// ----- 2. BISNIS LANJUTAN: bar chart isometrik menanjak + panah tumbuh -----
function svgExistingBusiness(size = 120) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  ${isoCube(30, 92, 13, 18, ["#D9F99D", "#A3E635", "#65A30D"])}
  ${isoCube(58, 84, 13, 34, ["#D9F99D", "#A3E635", "#65A30D"])}
  ${isoCube(86, 76, 13, 52, ["#ECFCCB", "#BEF264", "#84CC16"])}
  <!-- panah pertumbuhan -->
  <path d="M18 62 L52 44 L66 52 L96 26" stroke="#166534" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <polygon points="96,26 84,26 96,38" fill="#166534" transform="rotate(8 96 26)"/>
</svg>`;
}

// ----- 3. PENDANAAN: tumpukan koin isometrik + brankas kubus -----
function svgFunding(size = 120) {
  const coin = (cx, cy, fill, edge) => `
    <ellipse cx="${cx}" cy="${cy + 4}" rx="16" ry="8" fill="${edge}"/>
    <ellipse cx="${cx}" cy="${cy}" rx="16" ry="8" fill="${fill}"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  ${isoCube(78, 78, 24, 26, ["#FED7AA", "#FB923C", "#EA580C"])}
  <ellipse cx="78" cy="70" rx="8" ry="4.5" fill="#7C2D12"/>
  <ellipse cx="78" cy="69" rx="5" ry="2.8" fill="#FDBA74"/>
  ${coin(34, 88, "#FCD34D", "#D97706")}
  ${coin(34, 79, "#FDE68A", "#D97706")}
  ${coin(34, 70, "#FCD34D", "#D97706")}
  <text x="34" y="74" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="11" fill="#92400E">Rp</text>
</svg>`;
}

// ----- 4. AKSEN SAMPUL: klaster kubus kota isometrik -----
function svgCoverCluster(width = 280, height = 120) {
  return `<svg width="${width}" height="${height}" viewBox="0 0 280 120" xmlns="http://www.w3.org/2000/svg">
  ${isoCube(50, 95, 20, 30, ["#334155", "#1E293B", "#0F172A"])}
  ${isoCube(95, 100, 20, 56, ["#475569", "#334155", "#1E293B"])}
  ${isoCube(140, 92, 20, 40, ["#7DD3FC", "#38BDF8", "#0284C7"])}
  ${isoCube(185, 100, 20, 64, ["#FCD34D", "#F59E0B", "#B45309"])}
  ${isoCube(230, 94, 20, 34, ["#475569", "#334155", "#1E293B"])}
</svg>`;
}

const SVG_BUILDERS = {
  baru: svgNewBusiness,
  lanjutan: svgExistingBusiness,
  funding: svgFunding,
  cover: svgCoverCluster,
};

/** String SVG mentah — untuk disisipkan ke HTML ekspor (PDF/Word). */
export function isoSvgString(type, size) {
  const fn = SVG_BUILDERS[type];
  return fn ? fn(size) : "";
}

/** Komponen React — render SVG isometrik inline. */
export default function IsoGraphic({ type = "baru", size = 120, style }) {
  return (
    <span
      style={{ display: "inline-block", lineHeight: 0, ...style }}
      dangerouslySetInnerHTML={{ __html: isoSvgString(type, size) }}
    />
  );
}
