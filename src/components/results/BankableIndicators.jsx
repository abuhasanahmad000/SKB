import { useApp } from "../../state/AppContext.jsx";
import { useMemo } from "react";
import { computeFinancials } from "../../engines/financialEngine.js";
import { COLORS } from "../primitives/styles.js";
import { formatRp, formatPct } from "../../utils/format.js";

// ============================================================================
// <BankableIndicators /> — Indikator kelayakan untuk pendanaan
//
// Dipakai di sub-tab "bankable" (Jalur C).
// Menampilkan 5 indikator kunci yang bank/investor evaluasi:
//   1. NPV (Net Present Value) — harus positif
//   2. IRR (Internal Rate of Return) — harus > suku bunga acuan
//   3. Payback Period — semakin pendek semakin baik
//   4. DAR (Debt-to-Asset Ratio) — harus < 60% untuk aman
//   5. Profitability Index — > 1.0 berarti layak
// ============================================================================

export default function BankableIndicators() {
  const { state } = useApp();
  const provinceCode = state.forms?.identitas?.provinceCode || "";

  const fin = useMemo(() => {
    try {
      return computeFinancials(state.forms, provinceCode);
    } catch (e) {
      return null;
    }
  }, [state.forms, provinceCode]);

  if (!fin) return <EmptyState />;

  // DAR = Total Liability / Total Assets
  const totalAssets = fin.initialInvestment;
  const totalDebt = state.forms?.modal?.funding?.modalPinjaman || 0;
  const dar = totalAssets > 0 ? totalDebt / totalAssets : 0;
  // PI = (NPV + initial) / initial — kalau > 1 = layak
  const pi = fin.initialInvestment > 0 ? (fin.npv + fin.initialInvestment) / fin.initialInvestment : 0;

  // Bankability score sederhana: hitung berapa indikator yang "lolos"
  const checks = [
    { id: "npv", pass: fin.npv > 0 },
    { id: "irr", pass: fin.irr != null && fin.irr > fin.wacc },
    { id: "payback", pass: fin.paybackMonths != null && fin.paybackMonths <= 36 },
    { id: "dar", pass: dar < 0.6 },
    { id: "pi", pass: pi > 1.0 },
  ];
  const passed = checks.filter((c) => c.pass).length;
  const totalChecks = checks.length;
  const bankableLevel = passed >= 4 ? "tinggi" : passed >= 3 ? "sedang" : "rendah";
  const bankableColor = passed >= 4 ? COLORS.success : passed >= 3 ? COLORS.warn : COLORS.danger;

  return (
    <>
      {/* Overall bankability */}
      <div
        style={{
          padding: 22,
          marginBottom: 24,
          background: `${bankableColor}11`,
          border: `1px solid ${bankableColor}`,
          borderRadius: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.2em",
                color: bankableColor,
                fontFamily: "monospace",
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              ◆ TINGKAT BANKABILITAS
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.textHi, fontFamily: "monospace" }}>
              {bankableLevel.toUpperCase()}
            </div>
            <div style={{ fontSize: 12.5, color: COLORS.textSoft, marginTop: 4 }}>
              {passed}/{totalChecks} indikator kelayakan terpenuhi
            </div>
          </div>
          <div
            style={{
              padding: "10px 20px",
              background: bankableColor,
              color: COLORS.bg,
              borderRadius: 10,
              fontFamily: "monospace",
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: "0.1em",
            }}
          >
            {bankableLevel === "tinggi" ? "LAYAK DIAJUKAN" : bankableLevel === "sedang" ? "PERLU PENGUATAN" : "BELUM LAYAK"}
          </div>
        </div>
      </div>

      {/* 5 indikator grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
        <IndicatorCard
          label="Net Present Value (NPV)"
          value={formatRp(fin.npv)}
          target="Harus > Rp 0"
          pass={fin.npv > 0}
          desc={fin.npv > 0
            ? "Proyek menghasilkan nilai tambah positif setelah diskonto biaya modal."
            : "Proyek belum menghasilkan nilai tambah — perlu penyesuaian asumsi."}
        />
        <IndicatorCard
          label="Internal Rate of Return (IRR)"
          value={fin.irrPct != null ? `${fin.irrPct}%` : "—"}
          target={`Harus > ${formatPct(fin.wacc)} (biaya modal)`}
          pass={fin.irr != null && fin.irr > fin.wacc}
          desc={fin.irr != null && fin.irr > fin.wacc
            ? `IRR ${fin.irrPct}% di atas biaya modal ${formatPct(fin.wacc)} — investor mendapat return memadai.`
            : "IRR di bawah biaya modal — investor tidak akan tertarik mendanai."}
        />
        <IndicatorCard
          label="Payback Period"
          value={fin.paybackMonths != null ? `${fin.paybackMonths} bulan` : "> 36 bulan"}
          target="Idealnya < 36 bulan"
          pass={fin.paybackMonths != null && fin.paybackMonths <= 36}
          desc={fin.paybackMonths != null && fin.paybackMonths <= 36
            ? `Modal kembali dalam ${(fin.paybackMonths / 12).toFixed(1)} tahun — risiko likuiditas terkendali.`
            : "Modal belum kembali dalam horizon 3 tahun — risiko likuiditas tinggi."}
        />
        <IndicatorCard
          label="Debt-to-Asset Ratio (DAR)"
          value={`${(dar * 100).toFixed(0)}%`}
          target="Harus < 60%"
          pass={dar < 0.6}
          desc={dar < 0.6
            ? "Struktur keuangan sehat — sebagian besar didanai modal sendiri/mitra."
            : "Terlalu bergantung pada pinjaman — risiko gagal bayar meningkat."}
        />
        <IndicatorCard
          label="Profitability Index (PI)"
          value={pi.toFixed(2)}
          target="Harus > 1.00"
          pass={pi > 1.0}
          desc={pi > 1.0
            ? `Setiap Rp 1 modal menghasilkan nilai sekarang Rp ${pi.toFixed(2)} — investasi menguntungkan.`
            : `Setiap Rp 1 modal hanya menghasilkan Rp ${pi.toFixed(2)} — kurang menguntungkan.`}
          wide
        />
      </div>

      {/* Detail tambahan */}
      <div
        style={{
          padding: 16,
          background: COLORS.bgPanelDeep,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 10,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.2em",
            color: COLORS.textMuted,
            fontFamily: "monospace",
            fontWeight: 700,
            marginBottom: 10,
          }}
        >
          ◆ ASUMSI &amp; PARAMETER
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, fontSize: 11.5 }}>
          <Stat label="Modal Awal" value={formatRp(fin.initialInvestment)} />
          <Stat label="WACC (Diskon Rate)" value={formatPct(fin.wacc)} />
          <Stat label="Horizon Proyeksi" value="3 Tahun" />
        </div>
      </div>
    </>
  );
}

// ----- Indikator card individu -----
function IndicatorCard({ label, value, target, pass, desc, wide }) {
  return (
    <div
      style={{
        padding: 16,
        background: COLORS.bgPanel,
        border: `1px solid ${pass ? COLORS.successBorder : COLORS.dangerBorder}`,
        borderLeft: `4px solid ${pass ? COLORS.success : COLORS.danger}`,
        borderRadius: 10,
        gridColumn: wide ? "span 2" : "auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div
          style={{
            fontSize: 11,
            color: COLORS.textMuted,
            fontWeight: 700,
          }}
        >
          {label}
        </div>
        <div
          style={{
            padding: "2px 8px",
            background: pass ? `${COLORS.success}22` : `${COLORS.danger}22`,
            color: pass ? COLORS.successHi : COLORS.dangerHi,
            borderRadius: 4,
            fontSize: 9.5,
            fontFamily: "monospace",
            fontWeight: 700,
            letterSpacing: "0.1em",
          }}
        >
          {pass ? "✓ LOLOS" : "✗ TIDAK LOLOS"}
        </div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.textHi, fontFamily: "monospace", marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 10.5, color: COLORS.textMuted, fontStyle: "italic", marginBottom: 8 }}>
        Target: {target}
      </div>
      <div style={{ fontSize: 12, color: COLORS.textSoft, lineHeight: 1.5 }}>
        {desc}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 9.5, color: COLORS.textMuted, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 2 }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize: 13, color: COLORS.textHi, fontFamily: "monospace", fontWeight: 700 }}>
        {value}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ padding: 32, background: COLORS.bgPanel, border: `2px dashed ${COLORS.border}`, borderRadius: 12, textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🏦</div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.textHi, margin: "0 0 8px" }}>
        Indikator Bankabilitas Akan Tampil Setelah Data Lengkap
      </h3>
      <p style={{ fontSize: 13, color: COLORS.textSoft, lineHeight: 1.6, maxWidth: 420, margin: "0 auto" }}>
        Lengkapi: produk, biaya operasional, dan sumber dana untuk lihat NPV, IRR, Payback, DAR, dan PI.
      </p>
    </div>
  );
}
