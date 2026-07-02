import { formatRp } from "../../utils/format.js";
import { sumByCategory, equipmentTotal } from "../../engines/investmentHelper.js";
import { getSector } from "../../data/sectors.js";
import { PROVINCES } from "../../data/provinces.js";
import IsoGraphic, { isoSvgString } from "../primitives/IsoGraphics.jsx";

// ============================================================================
// LivePlan-Style Components
// 1. ConfidentialCoverPage — halaman pembuka resmi
// 2. ProTipBox — annotation hijau ala konsultan
// 3. StartupRequirementsTable — tabel breakdown modal awal
// ============================================================================

// ----------------------------------------------------------------------------
// COMPONENT: ConfidentialCoverPage (Hotfix 11.3 — LivePlan-style redesign)
// ----------------------------------------------------------------------------
function getSectorDisplay(sectorCode) {
  if (!sectorCode) return null;
  const sector = getSector(sectorCode);
  if (!sector) return `KBLI ${sectorCode}`;
  return `${sector.group || ""} — ${sector.name || ""} (KBLI ${sectorCode})`.trim();
}

function getProvinceDisplay(provinceCode) {
  if (!provinceCode) return null;
  return PROVINCES[provinceCode]?.name || `Provinsi ${provinceCode}`;
}

export function ConfidentialCoverPage({ identitas, mode, namaPemohon }) {
  const subtitle =
    mode === "lanjutan" ? "Proposal Pendanaan & Studi Kelayakan Pengembangan Usaha"
      : mode === "baru" ? "Proposal Pendanaan & Studi Kelayakan Bisnis"
      : "Studi Kelayakan & Rencana Bisnis";

  const sectorDisplay = getSectorDisplay(identitas.sectorCode);
  const provinceDisplay = getProvinceDisplay(identitas.provinceCode);

  return (
    <div className="report-bab bab-major" style={coverWrapStyle}>
      {/* Badge Confidential */}
      <div style={confidentialBadgeStyle}>CONFIDENTIAL</div>

      {/* Geometric design accent - top left */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 180, height: 180, background: "linear-gradient(135deg, #0EA5E9 0%, #0EA5E920 100%)", clipPath: "polygon(0 0, 100% 0, 0 100%)", opacity: 0.85 }} />

      {/* Geometric accent - bottom right */}
      <div style={{ position: "absolute", bottom: 0, right: 0, width: 220, height: 220, background: "linear-gradient(315deg, #0F172A 0%, #1E293B 100%)", clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }} />

      <div style={coverContentStyle}>
        {/* Logo area */}
        {identitas.logoUrl ? (
          <div style={{ marginBottom: 30, padding: 16, background: "#fff", border: `2px solid #0F172A`, borderRadius: 12, display: "inline-block", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
            <img src={identitas.logoUrl} alt={identitas.namaBisnis} style={{ maxWidth: 180, maxHeight: 120, objectFit: "contain", display: "block" }} />
          </div>
        ) : (
          <div style={{ marginBottom: 30, width: 80, height: 80, margin: "0 auto 30px", background: "linear-gradient(135deg, #0EA5E9 0%, #0F172A 100%)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 36, fontWeight: 900, letterSpacing: "-1px" }}>
            {(identitas.namaBisnis || "B").charAt(0).toUpperCase()}
          </div>
        )}

        {/* Subtitle */}
        <div style={{ fontSize: 11, color: "#0EA5E9", fontFamily: "monospace", letterSpacing: "0.3em", marginBottom: 16, fontWeight: 700, textAlign: "center" }}>
          ◆ {subtitle.toUpperCase()}
        </div>

        {/* Nama Bisnis — HUGE */}
        <h1 style={{ fontSize: 52, fontWeight: 900, color: "#0F172A", margin: "0 0 14px", lineHeight: 1.05, letterSpacing: "-1px", textAlign: "center" }}>
          {identitas.namaBisnis || "Nama Bisnis"}
        </h1>

        {/* Tagline */}
        {identitas.tagline && (
          <p style={{ fontSize: 17, color: "#475569", fontStyle: "italic", margin: "0 0 36px", textAlign: "center", fontWeight: 400, maxWidth: 520 }}>
            "{identitas.tagline}"
          </p>
        )}

        {/* Separator */}
        <div style={{ width: 80, height: 4, background: "linear-gradient(90deg, #0EA5E9 0%, #0F172A 100%)", margin: "0 auto 24px", borderRadius: 2 }} />

        {/* Aksen isometrik 3D */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <IsoGraphic type="cover" size={300} />
        </div>

        {/* Info Card */}
        <div style={infoCardStyle}>
          <InfoRow icon="👤" label="Pemohon" value={namaPemohon} />
          <InfoRow icon="🏷️" label="Sektor Usaha" value={sectorDisplay} />
          <InfoRow icon="📍" label="Lokasi" value={identitas.alamat || provinceDisplay} />
          <InfoRow icon="📐" label="Skala Bisnis" value={identitas.skalaBisnis} capitalize />
          <InfoRow icon="📅" label="Tanggal Disusun" value={new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} />
        </div>
      </div>

      {/* Footer Cover */}
      <div style={coverFooterStyle}>
        <div style={{ fontFamily: "monospace", letterSpacing: "0.15em", color: "#64748B", fontWeight: 600 }}>
          DOKUMEN RAHASIA — UNTUK KEPENTINGAN INTERNAL & PEMOHONAN PENDANAAN
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, capitalize }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #E2E8F0" }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontSize: 11, color: "#64748B", fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.05em", minWidth: 100 }}>{label.toUpperCase()}</span>
      <span style={{ fontSize: 13, color: "#0F172A", fontWeight: 500, textTransform: capitalize ? "capitalize" : "none", flex: 1, textAlign: "right" }}>{value}</span>
    </div>
  );
}

export function buildConfidentialCoverHtml(identitas, mode, namaPemohon) {
  const subtitle =
    mode === "lanjutan" ? "Proposal Pendanaan & Studi Kelayakan Pengembangan Usaha"
      : mode === "baru" ? "Proposal Pendanaan & Studi Kelayakan Bisnis"
      : "Studi Kelayakan & Rencana Bisnis";

  const sectorDisplay = getSectorDisplay(identitas.sectorCode);
  const provinceDisplay = getProvinceDisplay(identitas.provinceCode);

  const infoRow = (icon, label, value, capitalize) => {
    if (!value) return "";
    return `<div style="display:flex; align-items:center; gap:12px; padding:8px 0; border-bottom:1px solid #E2E8F0;">
      <span style="font-size:18px;">${icon}</span>
      <span style="font-size:11px; color:#64748B; font-weight:700; font-family:monospace; letter-spacing:0.05em; min-width:100px;">${label.toUpperCase()}</span>
      <span style="font-size:13px; color:#0F172A; font-weight:500; ${capitalize ? "text-transform:capitalize;" : ""} flex:1; text-align:right;">${value}</span>
    </div>`;
  };

  const logoSection = identitas.logoUrl
    ? `<div style="margin-bottom:30px; padding:16px; background:#fff; border:2px solid #0F172A; border-radius:12px; display:inline-block; box-shadow:0 4px 16px rgba(0,0,0,0.08);">
        <img src="${identitas.logoUrl}" alt="Logo" style="max-width:180px; max-height:120px; object-fit:contain; display:block;" />
      </div>`
    : `<div style="margin:0 auto 30px; width:80px; height:80px; background:linear-gradient(135deg, #0EA5E9 0%, #0F172A 100%); border-radius:16px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:36px; font-weight:900; letter-spacing:-1px;">
        ${(identitas.namaBisnis || "B").charAt(0).toUpperCase()}
      </div>`;

  return `<div style="position:relative; min-height:780px; padding:60px 30px; page-break-after:always; overflow:hidden;">
    <div style="position:absolute; top:20px; right:20px; padding:4px 12px; background:#DC2626; color:#fff; font-family:monospace; font-size:10px; font-weight:700; letter-spacing:0.15em; border-radius:3px; z-index:10;">CONFIDENTIAL</div>

    <!-- Top-left geometric accent -->
    <div style="position:absolute; top:0; left:0; width:180px; height:180px; background:linear-gradient(135deg, #0EA5E9 0%, rgba(14,165,233,0.1) 100%); clip-path:polygon(0 0, 100% 0, 0 100%); opacity:0.85;"></div>
    <!-- Bottom-right geometric accent -->
    <div style="position:absolute; bottom:0; right:0; width:220px; height:220px; background:linear-gradient(315deg, #0F172A 0%, #1E293B 100%); clip-path:polygon(100% 0, 100% 100%, 0 100%);"></div>

    <div style="position:relative; z-index:5; text-align:center; padding:60px 20px;">
      ${logoSection}

      <div style="font-size:11px; color:#0EA5E9; font-family:monospace; letter-spacing:0.3em; margin-bottom:16px; font-weight:700;">
        ◆ ${subtitle.toUpperCase()}
      </div>

      <h1 style="font-size:52px; font-weight:900; color:#0F172A; margin:0 0 14px; line-height:1.05; letter-spacing:-1px;">
        ${identitas.namaBisnis || "Nama Bisnis"}
      </h1>

      ${identitas.tagline ? `<p style="font-size:17px; color:#475569; font-style:italic; margin:0 auto 36px; font-weight:400; max-width:520px;">"${identitas.tagline}"</p>` : ""}

      <div style="width:80px; height:4px; background:linear-gradient(90deg, #0EA5E9 0%, #0F172A 100%); margin:0 auto 24px; border-radius:2px;"></div>

      <div style="text-align:center; margin-bottom:28px;">${isoSvgString("cover", 300)}</div>

      <div style="max-width:520px; margin:0 auto; padding:24px 28px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; text-align:left;">
        ${infoRow("👤", "Pemohon", namaPemohon)}
        ${infoRow("🏷️", "Sektor Usaha", sectorDisplay)}
        ${infoRow("📍", "Lokasi", identitas.alamat || provinceDisplay)}
        ${infoRow("📐", "Skala Bisnis", identitas.skalaBisnis, true)}
        ${infoRow("📅", "Tanggal Disusun", new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }))}
      </div>
    </div>

    <div style="position:absolute; bottom:60px; left:0; right:0; text-align:center; font-family:monospace; font-size:10px; letter-spacing:0.15em; color:#64748B; font-weight:600; z-index:5;">
      DOKUMEN RAHASIA — UNTUK KEPENTINGAN INTERNAL & PEMOHONAN PENDANAAN
    </div>
  </div>`;
}

// ----------------------------------------------------------------------------
// COMPONENT: ProTipBox — annotation konsultan ala LivePlan
// ----------------------------------------------------------------------------
export function ProTipBox({ children }) {
  return (
    <div style={{
      margin: "14px 0",
      padding: "12px 16px",
      background: "#ECFDF5",
      borderLeft: "4px solid #10B981",
      borderRadius: "0 6px 6px 0",
      fontSize: 12.5,
      color: "#065F46",
      lineHeight: 1.55,
    }}>
      <span style={{ fontWeight: 700, color: "#047857" }}>⭐ Pro Tip:</span> {children}
    </div>
  );
}

export function buildProTipHtml(text) {
  return `<div style="margin:14px 0; padding:12px 16px; background:#ECFDF5; border-left:4px solid #10B981; border-radius:0 6px 6px 0; font-size:12.5px; color:#065F46; line-height:1.55;">
    <span style="font-weight:700; color:#047857;">⭐ Pro Tip:</span> ${text}
  </div>`;
}


// v13.2: SATU basis kebutuhan dana untuk seluruh laporan = TOTAL INITIAL
// INVESTMENT (rincian item + peralatan). Versi lama hanya menjumlah
// legal+renovasi+promo+stok (Rp 138,5 jt pada contoh) sementara Use of Funds
// menulis Rp 293,1 jt — kontradiksi yang juga memunculkan "surplus" semu.
function buildStartupRows(forms) {
  const m = forms?.modal || {};
  const exp = m.expenses || {};
  const ast = m.assets || {};
  const cats = sumByCategory(m.investmentItems || []);
  const hasItems = (m.investmentItems || []).length > 0;
  const eqTotal = equipmentTotal(forms);

  const expenses = (hasItems
    ? [
        { label: "Biaya Legalitas & Perizinan", value: cats.legalitas || 0 },
        { label: "Renovasi & Setup Tempat", value: cats.renovasi || 0 },
        { label: "Deposit & Sewa Dibayar di Muka", value: cats.sewa_deposit || 0 },
        { label: "Promosi Pembukaan", value: cats.promosi || 0 },
        { label: "Modal Kerja Awal (Kas Opex)", value: cats.modal_kerja || 0 },
        { label: "Cadangan Tak Terduga", value: cats.lainnya || 0 },
      ]
    : [
        { label: "Biaya Legalitas & Perizinan", value: exp.legal || 0 },
        { label: "Renovasi & Setup Tempat", value: exp.renovasi || 0 },
        { label: "Promosi Pembukaan", value: exp.promo || 0 },
        { label: "Modal Kerja & Lain-lain", value: exp.lainnya || exp.other || 0 },
      ]
  ).filter((r) => r.value > 0);

  const assets = [
    { label: "Peralatan & Mesin (dari Alat & Karyawan)", value: eqTotal },
    { label: "Stok Awal", value: ast.stok || 0 },
    { label: "Aset Operasional Lainnya", value: ast.other || 0 },
  ].filter((r) => r.value > 0);

  return { expenses, assets };
}

// ----------------------------------------------------------------------------
// COMPONENT: StartupRequirementsTable — breakdown modal awal ala LivePlan
// ----------------------------------------------------------------------------
export function StartupRequirementsTable({ forms }) {
  const m = forms?.modal || {};
  const fnd = m.funding || {};
  const { expenses, assets } = buildStartupRows(forms);
  const totalExpenses = expenses.reduce((s, r) => s + r.value, 0);
  const totalAssets = assets.reduce((s, r) => s + r.value, 0);

  const funding = [
    { label: "Modal Pribadi", value: fnd.modalPribadi || 0, color: "#0EA5E9" },
    { label: "Modal Mitra/Investor", value: fnd.modalMitra || 0, color: "#10B981" },
    { label: "Modal Pinjaman Bank", value: fnd.modalPinjaman || 0, color: "#F59E0B" },
  ].filter((r) => r.value > 0);
  const totalFunding = funding.reduce((s, r) => s + r.value, 0);

  const totalRequired = totalExpenses + totalAssets;

  if (totalRequired === 0 && totalFunding === 0) return null;

  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Kolom Kiri: Kebutuhan */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>① KEBUTUHAN MODAL AWAL</div>
          <div style={cardBodyStyle}>
            <div style={subHeaderStyle}>Biaya Start-up</div>
            {expenses.map((r) => (
              <div key={r.label} style={rowStyle}>
                <span>{r.label}</span><span style={numStyle}>{formatRp(r.value)}</span>
              </div>
            ))}
            <div style={subtotalStyle}>
              <span>Subtotal Biaya</span><span style={numStyle}>{formatRp(totalExpenses)}</span>
            </div>
            <div style={{ ...subHeaderStyle, marginTop: 12 }}>Aset Operasional</div>
            {assets.map((r) => (
              <div key={r.label} style={rowStyle}>
                <span>{r.label}</span><span style={numStyle}>{formatRp(r.value)}</span>
              </div>
            ))}
            <div style={subtotalStyle}>
              <span>Subtotal Aset</span><span style={numStyle}>{formatRp(totalAssets)}</span>
            </div>
            <div style={totalStyle}>
              <span>TOTAL KEBUTUHAN</span><span style={numStyle}>{formatRp(totalRequired)}</span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Sumber Dana */}
        <div style={cardStyle}>
          <div style={{ ...cardHeaderStyle, background: "#10B981" }}>② SUMBER PENDANAAN</div>
          <div style={cardBodyStyle}>
            {funding.map((r) => {
              const pct = totalFunding > 0 ? (r.value / totalFunding) * 100 : 0;
              return (
                <div key={r.label} style={{ marginBottom: 14 }}>
                  <div style={{ ...rowStyle, marginBottom: 4 }}>
                    <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: r.color, marginRight: 6 }}></span>{r.label}</span>
                    <span style={numStyle}>{formatRp(r.value)} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div style={{ height: 6, background: "#E2E8F0", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: r.color }} />
                  </div>
                </div>
              );
            })}
            <div style={{ ...totalStyle, marginTop: 18 }}>
              <span>TOTAL SUMBER DANA</span><span style={numStyle}>{formatRp(totalFunding)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selisih */}
      {Math.abs(totalRequired - totalFunding) > 1000 && (
        <div style={{
          marginTop: 14, padding: "10px 14px",
          background: totalRequired > totalFunding ? "#FEE2E2" : "#FEF3C7",
          borderLeft: `3px solid ${totalRequired > totalFunding ? "#DC2626" : "#F59E0B"}`,
          borderRadius: 6, fontSize: 12,
          color: totalRequired > totalFunding ? "#991B1B" : "#92400E",
        }}>
          {totalRequired > totalFunding
            ? `⚠ Defisit pendanaan: ${formatRp(totalRequired - totalFunding)}. Kebutuhan lebih besar dari sumber dana yang tersedia.`
            : `ℹ Surplus pendanaan: ${formatRp(totalFunding - totalRequired)}. Sumber dana melebihi kebutuhan.`
          }
        </div>
      )}
    </div>
  );
}

export function buildStartupRequirementsHtml(forms) {
  const m = forms?.modal || {};
  const fnd = m.funding || {};
  const { expenses, assets } = buildStartupRows(forms);
  const totalExpenses = expenses.reduce((s, r) => s + r.value, 0);
  const totalAssets = assets.reduce((s, r) => s + r.value, 0);

  const funding = [
    { label: "Modal Pribadi", value: fnd.modalPribadi || 0, color: "#0EA5E9" },
    { label: "Modal Mitra/Investor", value: fnd.modalMitra || 0, color: "#10B981" },
    { label: "Modal Pinjaman Bank", value: fnd.modalPinjaman || 0, color: "#F59E0B" },
  ].filter((r) => r.value > 0);
  const totalFunding = funding.reduce((s, r) => s + r.value, 0);
  const totalRequired = totalExpenses + totalAssets;

  if (totalRequired === 0 && totalFunding === 0) return "";

  const TD = `padding:6px 10px; font-size:11.5px; border-bottom:1px solid #E2E8F0;`;
  const TD_R = `${TD} text-align:right; font-family:monospace;`;

  const expRows = expenses.map((r) => `<tr><td style="${TD}">${r.label}</td><td style="${TD_R}">${formatRp(r.value)}</td></tr>`).join("");
  const astRows = assets.map((r) => `<tr><td style="${TD}">${r.label}</td><td style="${TD_R}">${formatRp(r.value)}</td></tr>`).join("");
  const fndRows = funding.map((r) => {
    const pct = totalFunding > 0 ? (r.value / totalFunding) * 100 : 0;
    return `<tr><td style="${TD}"><span style="display:inline-block; width:8px; height:8px; border-radius:2px; background:${r.color}; margin-right:6px;"></span>${r.label}</td><td style="${TD_R}">${formatRp(r.value)} (${pct.toFixed(0)}%)</td></tr>`;
  }).join("");

  return `<div style="margin-top:18px;">
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
      <div style="border:1px solid #E2E8F0; border-radius:8px; overflow:hidden;">
        <div style="padding:8px 12px; background:#0EA5E9; color:#fff; font-family:monospace; font-size:10px; letter-spacing:0.1em; font-weight:700;">① KEBUTUHAN MODAL AWAL</div>
        <table style="width:100%; border-collapse:collapse;">
          <tr><td colspan="2" style="padding:8px 10px; font-family:monospace; font-size:10px; font-weight:700; color:#64748B; background:#F8FAFC; letter-spacing:0.1em;">Biaya Start-up</td></tr>
          ${expRows}
          <tr style="background:#F1F5F9;"><td style="${TD} font-weight:700;">Subtotal Biaya</td><td style="${TD_R} font-weight:700;">${formatRp(totalExpenses)}</td></tr>
          <tr><td colspan="2" style="padding:8px 10px; font-family:monospace; font-size:10px; font-weight:700; color:#64748B; background:#F8FAFC; letter-spacing:0.1em;">Aset Operasional</td></tr>
          ${astRows}
          <tr style="background:#F1F5F9;"><td style="${TD} font-weight:700;">Subtotal Aset</td><td style="${TD_R} font-weight:700;">${formatRp(totalAssets)}</td></tr>
          <tr style="background:#0F172A; color:#fff;"><td style="${TD} font-weight:800; color:#fff;">TOTAL KEBUTUHAN</td><td style="${TD_R} font-weight:800; color:#fff;">${formatRp(totalRequired)}</td></tr>
        </table>
      </div>
      <div style="border:1px solid #E2E8F0; border-radius:8px; overflow:hidden;">
        <div style="padding:8px 12px; background:#10B981; color:#fff; font-family:monospace; font-size:10px; letter-spacing:0.1em; font-weight:700;">② SUMBER PENDANAAN</div>
        <table style="width:100%; border-collapse:collapse;">
          ${fndRows}
          <tr style="background:#0F172A; color:#fff;"><td style="${TD} font-weight:800; color:#fff;">TOTAL SUMBER DANA</td><td style="${TD_R} font-weight:800; color:#fff;">${formatRp(totalFunding)}</td></tr>
        </table>
      </div>
    </div>
  </div>`;
}

// ============================================================================
// STYLES
// ============================================================================
const coverWrapStyle = { position: "relative", padding: "40px 30px", minHeight: 780, marginBottom: 30, pageBreakAfter: "always", overflow: "hidden" };
const confidentialBadgeStyle = { position: "absolute", top: 20, right: 20, padding: "4px 12px", background: "#DC2626", color: "#fff", fontFamily: "monospace", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", borderRadius: 3, zIndex: 10 };
const coverContentStyle = { position: "relative", zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px 80px" };
const infoCardStyle = { maxWidth: 520, width: "100%", margin: "0 auto", padding: "24px 28px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 12, textAlign: "left" };
const coverFooterStyle = { position: "absolute", bottom: 60, left: 0, right: 0, textAlign: "center", fontSize: 10, zIndex: 5 };
const cardStyle = { border: "1px solid #E2E8F0", borderRadius: 8, overflow: "hidden" };
const cardHeaderStyle = { padding: "8px 12px", background: "#0EA5E9", color: "#fff", fontFamily: "monospace", fontSize: 10, letterSpacing: "0.1em", fontWeight: 700 };
const cardBodyStyle = { padding: 12 };
const subHeaderStyle = { fontFamily: "monospace", fontSize: 10, fontWeight: 700, color: "#64748B", letterSpacing: "0.1em", marginBottom: 6, paddingBottom: 4, borderBottom: "1px solid #E2E8F0" };
const rowStyle = { display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 11.5, color: "#1e293b" };
const numStyle = { fontFamily: "monospace", fontWeight: 600 };
const subtotalStyle = { display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 11.5, fontWeight: 700, color: "#334155", borderTop: "1px solid #E2E8F0", marginTop: 4 };
const totalStyle = { display: "flex", justifyContent: "space-between", padding: "10px 8px", margin: "10px -12px -12px", background: "#0F172A", color: "#fff", fontSize: 12, fontWeight: 800, fontFamily: "monospace" };
