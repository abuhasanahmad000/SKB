import { ASPECT_ORDER } from "../../data/kuesioner.js";

// ============================================================================
// RadarSkb — Radar Profil Kelayakan 5 Aspek (v13.1)
//
// Pengganti radar recharts lama yang terlihat datar dan angkanya bertumpuk.
// Dibangun sebagai SVG murni (string) supaya:
//   1. Tampilan preview di aplikasi = tampilan di file laporan (HTML/Word)
//   2. Efek "3D" bisa dikontrol penuh: lapisan extrude di bawah poligon nilai,
//      gradasi cahaya dari atas, bayangan lembut.
//   3. Label & badge nilai ditempatkan DI LUAR pentagon dengan anchor per
//      sudut — tidak ada lagi angka yang saling menimpa.
// ============================================================================

const SHORT_LABELS = {
  pemasaran: "Pemasaran",
  teknis: "Teknis",
  manajemen: "Manajemen",
  hukum: "Hukum",
  lingkungan: "Lingkungan & Sosial",
};

const VERDICT_FILL = { layak: "#10B981", cukup: "#F59E0B", tidak: "#DC2626" };

function polar(cx, cy, r, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180; // mulai dari atas
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function ringPath(cx, cy, r, n = 5) {
  const pts = [];
  for (let i = 0; i < n; i++) pts.push(polar(cx, cy, r, (360 / n) * i).join(","));
  return pts.join(" ");
}

/**
 * radarSvgString(scoring, size) → string SVG lengkap.
 * scoring = hasil computeScoringResult (punya aspects[code].score 0-100).
 */
export function radarSvgString(scoring, size = 520) {
  const W = size;
  const H = Math.round(size * 0.82);
  const cx = W / 2;
  const cy = H / 2 + 8;
  const R = Math.min(W, H) * 0.30; // radius 100%
  const n = ASPECT_ORDER.length;
  const DEPTH = 9; // tebal extrude "3D"

  const aspects = ASPECT_ORDER.map((code, i) => {
    const a = scoring?.aspects?.[code];
    return {
      code,
      label: SHORT_LABELS[code] || a?.meta?.name || code,
      icon: a?.meta?.icon || "",
      score: Math.max(0, Math.min(100, a?.score ?? 0)),
      verdict: a?.verdict || "tidak",
      angle: (360 / n) * i,
    };
  });

  // Poligon nilai
  const valuePts = aspects.map((a) => polar(cx, cy, (a.score / 100) * R, a.angle));
  const valuePoly = valuePts.map((p) => p.join(",")).join(" ");
  const valuePolyDepth = valuePts.map(([x, y]) => `${x},${y + DEPTH}`).join(" ");

  // Grid rings 20..100
  const rings = [20, 40, 60, 80, 100]
    .map((pct) => {
      const r = (pct / 100) * R;
      const isLayak = pct === 70;
      return `<polygon points="${ringPath(cx, cy, r, n)}" fill="none"
        stroke="${pct === 100 ? "#94A3B8" : "#CBD5E1"}" stroke-width="${pct === 100 ? 1.4 : 1}"
        ${pct % 40 === 0 ? "" : 'stroke-dasharray="3 3"'} />`;
    })
    .join("");
  // Garis ambang LAYAK 70%
  const layakRing = `<polygon points="${ringPath(cx, cy, 0.7 * R, n)}" fill="none"
    stroke="#10B981" stroke-width="1.4" stroke-dasharray="6 4" opacity="0.8" />`;

  // Spokes + label + badge
  let spokes = "";
  let labels = "";
  for (const a of aspects) {
    const [ex, ey] = polar(cx, cy, R, a.angle);
    spokes += `<line x1="${cx}" y1="${cy}" x2="${ex}" y2="${ey}" stroke="#E2E8F0" stroke-width="1"/>`;

    // Posisi label DI LUAR (radius 1.22R) dengan anchor cerdas per sudut
    const [lx, ly] = polar(cx, cy, R * 1.24, a.angle);
    const cosA = Math.cos(((a.angle - 90) * Math.PI) / 180);
    const anchor = Math.abs(cosA) < 0.25 ? "middle" : cosA > 0 ? "start" : "end";
    const dyName = a.angle === 0 ? -16 : 0;

    const color = VERDICT_FILL[a.verdict] || "#64748B";
    const badgeW = 52;
    const bx = anchor === "middle" ? lx - badgeW / 2 : anchor === "start" ? lx : lx - badgeW;
    labels += `
      <text x="${lx}" y="${ly + dyName}" text-anchor="${anchor}"
        font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#1E293B">${a.label}</text>
      <g>
        <rect x="${bx}" y="${ly + dyName + 7}" width="${badgeW}" height="22" rx="11" fill="${color}" opacity="0.14"/>
        <rect x="${bx}" y="${ly + dyName + 7}" width="${badgeW}" height="22" rx="11" fill="none" stroke="${color}" stroke-width="1.2"/>
        <text x="${bx + badgeW / 2}" y="${ly + dyName + 22.5}" text-anchor="middle"
          font-family="monospace" font-size="12.5" font-weight="800" fill="${color}">${a.score}%</text>
      </g>`;

    // Titik vertex pada poligon nilai
    const [vx, vy] = polar(cx, cy, (a.score / 100) * R, a.angle);
    labels += `
      <circle cx="${vx}" cy="${vy + DEPTH}" r="4.5" fill="#0B3B66" opacity="0.55"/>
      <circle cx="${vx}" cy="${vy}" r="5" fill="#FFFFFF" stroke="${color}" stroke-width="2.6"/>`;
  }

  const overall = Math.max(0, Math.min(100, scoring?.totalScore ?? 0));
  const overallColor = VERDICT_FILL[scoring?.overallVerdict] || "#64748B";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Radar kelayakan 5 aspek">
  <defs>
    <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.85"/>
      <stop offset="55%" stop-color="#0EA5E9" stop-opacity="0.62"/>
      <stop offset="100%" stop-color="#0B5394" stop-opacity="0.72"/>
    </linearGradient>
    <linearGradient id="radarDepth" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0B3B66" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#062542" stop-opacity="0.95"/>
    </linearGradient>
    <radialGradient id="bgGlow" cx="50%" cy="42%" r="65%">
      <stop offset="0%" stop-color="#F0F9FF"/>
      <stop offset="100%" stop-color="#FFFFFF"/>
    </radialGradient>
    <filter id="softShadow" x="-30%" y="-30%" width="160%" height="170%">
      <feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#0F172A" flood-opacity="0.22"/>
    </filter>
  </defs>

  <rect x="0" y="0" width="${W}" height="${H}" fill="url(#bgGlow)" rx="14"/>
  ${rings}
  ${layakRing}
  ${spokes}

  <!-- Lapisan extrude (efek 3D): poligon gelap di bawah poligon nilai -->
  <g filter="url(#softShadow)">
    <polygon points="${valuePolyDepth}" fill="url(#radarDepth)"/>
    <polygon points="${valuePoly}" fill="url(#radarFill)" stroke="#0284C7" stroke-width="2.2" stroke-linejoin="round"/>
  </g>

  ${labels}

  <!-- Skor agregat di pusat -->
  <g>
    <circle cx="${cx}" cy="${cy}" r="33" fill="#FFFFFF" stroke="${overallColor}" stroke-width="2.4" filter="url(#softShadow)"/>
    <text x="${cx}" y="${cy - 1}" text-anchor="middle" font-family="monospace" font-size="19" font-weight="800" fill="${overallColor}">${overall}%</text>
    <text x="${cx}" y="${cy + 14}" text-anchor="middle" font-family="Arial, sans-serif" font-size="8.5" letter-spacing="1.5" fill="#64748B">AGREGAT</text>
  </g>

  <!-- Legenda ambang -->
  <g font-family="Arial, sans-serif" font-size="10.5" fill="#475569">
    <line x1="${W - 168}" y1="${H - 18}" x2="${W - 146}" y2="${H - 18}" stroke="#10B981" stroke-width="1.6" stroke-dasharray="6 4"/>
    <text x="${W - 140}" y="${H - 14}">Garis ambang LAYAK (70%)</text>
  </g>
</svg>`;
}

/** Komponen React — render SVG yang sama persis dengan versi laporan. */
export default function RadarSkb({ scoring, size = 520 }) {
  return (
    <div
      style={{ maxWidth: size, margin: "0 auto" }}
      dangerouslySetInnerHTML={{ __html: radarSvgString(scoring, size) }}
    />
  );
}
