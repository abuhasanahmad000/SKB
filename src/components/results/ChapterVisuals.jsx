import {
  BAB_2_1_MASALAH,
  BAB_2_2_SOLUSI,
  BAB_2_3_JENIS_PELANGGAN,
  BAB_2_4_KEUNGGULAN,
  BAB_3_1_PEMASARAN,
  BAB_3_2_KANAL,
  BAB_3_3_STATUS_TEMPAT,
  BAB_3_4_TEKNOLOGI,
  BAB_5_1_BENTUK_HUKUM,
  BAB_5_2_STRUKTUR,
  BAB_5_3_PENASIHAT,
} from "../../data/babOptions.js";
import { formatRpFull } from "../../utils/format.js";

// ============================================================================
// CHAPTER VISUALS (v13.1) — visual pendukung Bab 2, 3, 5 + Hero Bab 7
//
// Dibangun sebagai HTML-string builder + wrapper React (dangerouslySetInnerHTML)
// supaya tampilan preview aplikasi = tampilan file laporan yang diunduh.
// ============================================================================

const esc = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const labelsOf = (options, ids = []) =>
  (ids || []).map((id) => options.find((o) => o.id === id)?.label).filter(Boolean);

const chip = (text, color = "#0EA5E9", bg = "#F0F9FF") =>
  `<span style="display:inline-block; margin:3px 4px 3px 0; padding:4px 10px; background:${bg}; border:1px solid ${color}; border-radius:14px; font-size:10.5px; color:#0F172A; line-height:1.3;">${esc(text)}</span>`;

const cardHead = (icon, title, count, color) =>
  `<div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
    <span style="font-size:16px;">${icon}</span>
    <span style="font-size:11px; font-weight:800; letter-spacing:0.06em; color:#0F172A;">${esc(title)}</span>
    <span style="margin-left:auto; min-width:24px; text-align:center; padding:2px 7px; background:${color}; color:#fff; border-radius:10px; font-size:11px; font-weight:800; font-family:monospace;">${count}</span>
  </div>`;

// ============================================================================
// BAB 2 — PETA PELUANG: Masalah → Solusi → Segmen + Keunggulan
// ============================================================================
export function buildBab2VisualHtml(forms) {
  const p = forms?.peluang || {};
  const masalah = labelsOf(BAB_2_1_MASALAH, p.masalah);
  const solusi = labelsOf(BAB_2_2_SOLUSI, p.solusi);
  const segmen = labelsOf(BAB_2_3_JENIS_PELANGGAN, p.jenisPelanggan);
  const keunggulan = labelsOf(BAB_2_4_KEUNGGULAN, p.keunggulan);
  if (masalah.length + solusi.length + segmen.length === 0) return "";

  const col = (icon, title, list, color, bg) => `
    <td style="width:31%; vertical-align:top; padding:12px; background:${bg}; border:1px solid ${color}; border-top:3px solid ${color}; border-radius:8px;">
      ${cardHead(icon, title, list.length, color)}
      ${list.slice(0, 5).map((t) => `<div style="font-size:10.5px; color:#334155; line-height:1.45; padding:3px 0; border-bottom:1px dashed #E2E8F0;">• ${esc(t)}</div>`).join("")}
      ${list.length > 5 ? `<div style="font-size:10px; color:#94A3B8; padding-top:4px;">+${list.length - 5} lainnya</div>` : ""}
    </td>`;
  const arrow = `<td style="width:3.5%; text-align:center; font-size:20px; color:#0EA5E9; font-weight:800;">→</td>`;

  return `<div style="margin:18px 0; page-break-inside:avoid;">
    <div style="font-size:12px; font-weight:800; color:#0F172A; margin-bottom:10px; text-align:center; letter-spacing:0.04em;">PETA PELUANG: DARI MASALAH MENJADI PASAR</div>
    <table style="width:100%; border-collapse:separate; border-spacing:0;"><tr>
      ${col("⚠️", "MASALAH PASAR", masalah, "#DC2626", "#FEF2F2")}
      ${arrow}
      ${col("💡", "SOLUSI BISNIS", solusi, "#0EA5E9", "#F0F9FF")}
      ${arrow}
      ${col("🎯", "SEGMEN DIBIDIK", segmen, "#10B981", "#ECFDF5")}
    </tr></table>
    ${keunggulan.length > 0 ? `
    <div style="margin-top:12px; padding:12px 14px; background:#FFFBEB; border:1px solid #F59E0B; border-radius:8px;">
      <div style="font-size:10.5px; font-weight:800; letter-spacing:0.08em; color:#92400E; margin-bottom:6px;">🏆 LAPISAN KEUNGGULAN VS PESAING (${keunggulan.length})</div>
      ${keunggulan.map((k) => chip(k, "#F59E0B", "#FEF3C7")).join("")}
    </div>` : ""}
  </div>`;
}

// ============================================================================
// BAB 3 — MATRIKS EKSEKUSI: Promosi / Kanal / Lokasi / Teknologi
// ============================================================================
export function buildBab3VisualHtml(forms) {
  const s = forms?.strategi || {};
  const a = forms?.alatSDM || {};
  const promosi = labelsOf(BAB_3_1_PEMASARAN, s.pemasaran);
  const kanal = labelsOf(BAB_3_2_KANAL, s.kanal);
  const teknologi = labelsOf(BAB_3_4_TEKNOLOGI, a.teknologi);
  const statusLabel = BAB_3_3_STATUS_TEMPAT.find((o) => o.id === s.statusTempat)?.label || "Belum ditentukan";
  const nEquip = (a.equipment || []).length;
  if (promosi.length + kanal.length + teknologi.length === 0 && !s.statusTempat) return "";

  const quad = (icon, title, count, color, bg, body) => `
    <td style="width:50%; vertical-align:top; padding:12px; background:${bg}; border:1px solid ${color}; border-radius:8px;">
      ${cardHead(icon, title, count, color)}
      ${body}
    </td>`;
  const chips = (list, color, bg) =>
    list.length > 0
      ? list.map((t) => chip(t, color, bg)).join("")
      : `<span style="font-size:10.5px; color:#94A3B8; font-style:italic;">Belum diisi</span>`;

  return `<div style="margin:18px 0; page-break-inside:avoid;">
    <div style="font-size:12px; font-weight:800; color:#0F172A; margin-bottom:10px; text-align:center; letter-spacing:0.04em;">MATRIKS EKSEKUSI 4 PILAR</div>
    <table style="width:100%; border-collapse:separate; border-spacing:6px;">
      <tr>
        ${quad("📣", "PROMOSI & PEMASARAN", promosi.length, "#0EA5E9", "#F0F9FF", chips(promosi, "#0EA5E9", "#E0F2FE"))}
        ${quad("🛒", "KANAL PENJUALAN", kanal.length, "#10B981", "#ECFDF5", chips(kanal, "#10B981", "#D1FAE5"))}
      </tr>
      <tr>
        ${quad("📍", "LOKASI & FASILITAS", s.karakterLokasi?.length || 0, "#F59E0B", "#FFFBEB",
          `<div style="font-size:11px; color:#334155; line-height:1.5;"><strong>Status:</strong> ${esc(statusLabel)}</div>
           <div style="font-size:10.5px; color:#64748B; margin-top:3px;">${(s.karakterLokasi || []).length} karakter lokasi pendukung dipetakan</div>`)}
        ${quad("💻", "TEKNOLOGI & PERALATAN", teknologi.length + nEquip, "#8B5CF6", "#F5F3FF",
          `${chips(teknologi, "#8B5CF6", "#EDE9FE")}
           <div style="font-size:10.5px; color:#64748B; margin-top:6px;">⚙️ ${nEquip} item peralatan kerja terdaftar sebagai aset tetap</div>`)}
      </tr>
    </table>
  </div>`;
}

// ============================================================================
// BAB 5 — BAGAN ORGANISASI MINI + ringkasan tim
// ============================================================================
export function buildBab5VisualHtml(forms) {
  const h = forms?.hukum || {};
  const i = forms?.identitas || {};
  const a = forms?.alatSDM || {};
  const struktur = labelsOf(BAB_5_2_STRUKTUR, h.struktur);
  const penasihat = labelsOf(BAB_5_3_PENASIHAT, h.penasihat);
  const bentuk = BAB_5_1_BENTUK_HUKUM.find((o) => o.id === h.bentukHukum)?.label || "Badan hukum dalam proses";
  const positions = Object.values(a.personnel?.positions || {}).filter((p) => p?.active);
  const totalKaryawan = positions.reduce((s2, p) => s2 + (p.count || 0), 0);
  if (struktur.length === 0 && totalKaryawan === 0 && !h.bentukHukum) return "";

  const box = (text, sub, color, bg, w = "auto") =>
    `<div style="display:inline-block; min-width:120px; width:${w}; margin:4px; padding:10px 14px; background:${bg}; border:1.5px solid ${color}; border-radius:8px; text-align:center; vertical-align:top;">
      <div style="font-size:11px; font-weight:800; color:#0F172A; line-height:1.3;">${esc(text)}</div>
      ${sub ? `<div style="font-size:9.5px; color:#64748B; margin-top:2px;">${esc(sub)}</div>` : ""}
    </div>`;

  return `<div style="margin:18px 0; page-break-inside:avoid; text-align:center;">
    <div style="font-size:12px; font-weight:800; color:#0F172A; margin-bottom:10px; letter-spacing:0.04em;">BAGAN ORGANISASI & KOMPOSISI TIM</div>
    <div style="padding:16px 12px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px;">
      ${box(i.namaPemohon || "Pemilik / Pendiri", bentuk, "#0F172A", "#E2E8F0", "240px")}
      <div style="height:14px; border-left:2px solid #94A3B8; width:0; margin:0 auto;"></div>
      <div>${struktur.length > 0
        ? struktur.map((st) => box(st, "Posisi inti", "#0EA5E9", "#F0F9FF")).join("")
        : box("Pemilik merangkap manajemen", "Struktur ramping", "#0EA5E9", "#F0F9FF")}</div>
      <div style="height:14px; border-left:2px dashed #CBD5E1; width:0; margin:0 auto;"></div>
      <div>${box(`${totalKaryawan} Karyawan Operasional`, `${positions.length} posisi berbeda`, "#10B981", "#ECFDF5", "200px")}</div>
      ${penasihat.length > 0 ? `
      <div style="margin-top:10px; padding-top:10px; border-top:1px dashed #CBD5E1;">
        <span style="font-size:9.5px; letter-spacing:0.1em; color:#64748B; font-weight:700;">DUKUNGAN EKSTERNAL: </span>
        ${penasihat.map((pn) => chip(pn, "#8B5CF6", "#F5F3FF")).join("")}
      </div>` : ""}
    </div>
  </div>`;
}

// ============================================================================
// HERO BAB 7 — ANGKA DANA YANG DIMINTA (inti laporan)
// ============================================================================
export function buildFundingAskHeroHtml(fundingAsk) {
  if (!fundingAsk) return "";
  const { amount, label, kategori, tenor, selfPct, askPct, totalModal } = fundingAsk;
  const isHutang = kategori === "hutang";
  const accent = isHutang ? "#0EA5E9" : "#10B981";

  return `<div style="margin:6px 0 22px; padding:26px 24px; background:linear-gradient(135deg,#0F172A 0%,#1E3A5F 100%); border-radius:14px; text-align:center; page-break-inside:avoid;">
    <div style="font-size:10px; letter-spacing:0.3em; color:${accent}; font-family:monospace; font-weight:700; margin-bottom:10px;">◆ INTI PROPOSAL INI ◆</div>
    <div style="font-size:13px; color:#CBD5E1; font-weight:700; letter-spacing:0.05em; margin-bottom:8px;">${esc((label || "DANA YANG DIBUTUHKAN").toUpperCase())}</div>
    <div style="font-size:38px; font-weight:800; color:#FFFFFF; font-family:monospace; line-height:1.1; margin-bottom:14px;">${esc(formatRpFull(amount || 0))}</div>
    <table style="width:100%; max-width:480px; margin:0 auto; border-collapse:collapse;"><tr>
      ${isHutang && tenor ? `<td style="padding:8px; border:1px solid #334155; border-radius:6px;"><div style="font-size:9px; letter-spacing:0.12em; color:#94A3B8;">TENOR</div><div style="font-size:14px; font-weight:800; color:#fff; font-family:monospace;">${tenor} bulan</div></td>` : ""}
      <td style="padding:8px; border:1px solid #334155;"><div style="font-size:9px; letter-spacing:0.12em; color:#94A3B8;">PORSI DANA EKSTERNAL</div><div style="font-size:14px; font-weight:800; color:${accent}; font-family:monospace;">${askPct || 0}%</div></td>
      <td style="padding:8px; border:1px solid #334155;"><div style="font-size:9px; letter-spacing:0.12em; color:#94A3B8;">MODAL SENDIRI</div><div style="font-size:14px; font-weight:800; color:#34D399; font-family:monospace;">${selfPct || 0}%</div></td>
      <td style="padding:8px; border:1px solid #334155;"><div style="font-size:9px; letter-spacing:0.12em; color:#94A3B8;">TOTAL KEBUTUHAN</div><div style="font-size:13px; font-weight:800; color:#fff; font-family:monospace;">${esc(formatRpFull(totalModal || 0))}</div></td>
    </tr></table>
  </div>`;
}

// ============================================================================
// REACT WRAPPERS — preview = export
// ============================================================================
export function Bab2Visual({ forms }) {
  const html = buildBab2VisualHtml(forms);
  return html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : null;
}
export function Bab3Visual({ forms }) {
  const html = buildBab3VisualHtml(forms);
  return html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : null;
}
export function Bab5Visual({ forms }) {
  const html = buildBab5VisualHtml(forms);
  return html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : null;
}
export function FundingAskHero({ fundingAsk }) {
  const html = buildFundingAskHeroHtml(fundingAsk);
  return html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : null;
}
