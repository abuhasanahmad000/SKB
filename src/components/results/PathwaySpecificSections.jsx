import { formatRp } from "../../utils/format.js";
import IsoGraphic, { isoSvgString } from "../primitives/IsoGraphics.jsx";
import { deriveUseOfFunds, sumByCategory, equipmentTotal, totalInitialInvestment } from "../../engines/investmentHelper.js";
import { computeDebtSchedule } from "../../engines/financialEngine.js";

// ============================================================================
// PathwaySpecificSections (Refactor v13) — Bab khusus per JENIS BISNIS
//
// Semua user adalah PENCARI DANA, sehingga setiap laporan memuat DUA bab khusus:
//   Bab 6.5 — bergantung jenis bisnis:
//     • stage "baru"     → JalurAValidationSection (Validasi Ide & Start-up Req)
//     • stage "lanjutan" → JalurBHistoricalSection (Kinerja Historis & Konsolidasi)
//   Bab 6.6 — SELALU tampil (instrumen pendanaan):
//     • JalurCFundingSection (Use of Funds, DSCR, Mitigasi Risiko) — DSCR
//       sadar-stage: untuk bisnis lanjutan, laba eksisting ikut memperkuat NOI.
//
// Disisipkan SETELAH Bab 6 (Rencana Keuangan), SEBELUM Bab 7.
// ============================================================================

const TABLE = { width: "100%", borderCollapse: "collapse", fontSize: 12 };
const TH = { padding: "10px 12px", fontSize: 10, fontFamily: "monospace", color: "#475569", letterSpacing: "0.1em", fontWeight: 700, textAlign: "left", background: "#F1F5F9", borderBottom: "2px solid #CBD5E1" };
const TH_R = { ...TH, textAlign: "right" };
const TD = { padding: "8px 12px", fontSize: 12, color: "#1e293b", borderBottom: "1px solid #E2E8F0" };
const TD_R = { ...TD, textAlign: "right", fontFamily: "monospace" };

// ============================================================================
// JALUR A — VALIDATION & COMPETITIVE ANALYSIS SECTION
// ============================================================================
export function JalurAValidationSection({ forms, financials }) {
  const peluang = forms?.peluang || {};
  const strategi = forms?.strategi || {};
  const modal = forms?.modal || {};
  const identitas = forms?.identitas || {};

  const masalahCount = peluang.masalah?.length || 0;
  const solusiCount = peluang.solusi?.length || 0;
  const segmenCount = peluang.jenisPelanggan?.length || 0;
  const keunggulan = peluang.keunggulan || [];

  // Hitung start-up requirements masif
  const exp = modal.expenses || {};
  const ast = modal.assets || {};
  // v13.2: basis SAMA dengan Use of Funds & Bab 7 — total initial investment
  // (rincian item + peralatan), bukan subset lama yang membuat angka laporan
  // saling bertentangan (138,5 jt vs 293,1 jt pada contoh).
  const cats = sumByCategory(forms?.modal?.investmentItems || []);
  const eqTotal = equipmentTotal(forms);
  const totalStartup = totalInitialInvestment(forms) ||
    ((exp.legal || 0) + (exp.renovasi || 0) + (exp.promo || 0) + (exp.lainnya || 0) + (ast.stok || 0) + eqTotal);

  return (
    <div className="report-bab bab-major" style={babStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <IsoGraphic type="baru" size={84} />
        <h2 style={{ ...babTitleStyle, marginBottom: 0 }}>Bab 6.5 — Validasi Ide & Analisis Kompetitif</h2>
      </div>

      <p style={paragraphStyle}>
        Sebagai bisnis yang merintis dari nol, validasi ide dan pembuktian potensi pasar menjadi tulang punggung kelayakan
        {identitas.namaBisnis ? ` ${identitas.namaBisnis}` : ""}. Berbeda dengan bisnis yang sudah berjalan, rintisan
        menuntut analisis mendalam terhadap <strong>masalah pelanggan</strong>, <strong>diferensiasi produk</strong>,
        dan <strong>kesiapan modal awal yang masif</strong> sebelum bisnis beroperasi.
      </p>

      {/* Validation Metrics Card */}
      <div style={cardGridStyle}>
        <ValidationCard label="MASALAH DIIDENTIFIKASI" value={masalahCount} unit="masalah" color="#0EA5E9" subtitle="dari riset awal pelanggan" />
        <ValidationCard label="SOLUSI DIRANCANG" value={solusiCount} unit="solusi" color="#10B981" subtitle="untuk masalah teridentifikasi" />
        <ValidationCard label="SEGMEN TARGET" value={segmenCount} unit="segmen" color="#F59E0B" subtitle="pelanggan utama" />
      </div>

      {/* Unique Value Proposition */}
      <h3 style={subtitleStyle}>Diferensiasi & Keunggulan Kompetitif</h3>
      <p style={paragraphStyle}>
        Untuk bersaing dengan pemain lama di pasar, {identitas.namaBisnis || "bisnis ini"} mengandalkan
        kombinasi {keunggulan.length} keunggulan utama yang menjadi <strong>Unique Value Proposition (UVP)</strong>.
        Keunggulan ini di-set sebagai diferensiator yang sulit ditiru kompetitor incumbent.
      </p>
      {keunggulan.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <UVPList items={keunggulan} />
        </div>
      )}

      {/* Start-up Requirements Detail Table — UNIK Jalur A */}
      <h3 style={subtitleStyle}>Rincian Kebutuhan Modal Awal (Start-up Requirements)</h3>
      <p style={paragraphStyle}>
        Sebagai bisnis baru, kebutuhan modal awal jauh lebih besar dibanding bisnis yang sudah berjalan — karena
        seluruh infrastruktur harus dibangun dari nol. Total kebutuhan investasi awal: <strong>{formatRp(totalStartup)}</strong>.
      </p>
      <div style={{ marginTop: 12, border: "1px solid #E2E8F0", borderRadius: 8, overflow: "hidden" }}>
        <table style={TABLE}>
          <thead>
            <tr>
              <th style={TH}>KOMPONEN START-UP</th>
              <th style={TH_R}>NOMINAL</th>
              <th style={TH_R}>% TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <StartupRow label="Biaya Legalitas & Perizinan" value={exp.legal} total={totalStartup} note="NIB, NPWP, PIRT/BPOM/Halal, notaris" />
            <StartupRow label="Renovasi & Setup Tempat" value={exp.renovasi} total={totalStartup} note="Interior, instalasi listrik/plumbing" />
            <StartupRow label="Deposit & Sewa Dibayar di Muka" value={cats.sewa_deposit || 0} total={totalStartup} note="Sewa tempat dibayar di muka (dikembalikan saat kontrak usai)" />
            <StartupRow label="Peralatan & Mesin" value={eqTotal} total={totalStartup} note="Otomatis dari sub-tab Alat & Karyawan" />
            <StartupRow label="Promosi Pembukaan (Grand Opening)" value={exp.promo} total={totalStartup} note="Iklan, signage, opening event" />
            <StartupRow label="Stok Awal / Bahan Baku" value={ast.stok} total={totalStartup} note="Persediaan awal untuk operasional 1-2 bulan" />
            <StartupRow label="Modal Kerja Awal (Kas Opex 3 Bulan)" value={cats.modal_kerja || 0} total={totalStartup} note="Bantalan kas gaji & operasional sebelum omset stabil" />
            <StartupRow label="Cadangan Tak Terduga" value={cats.lainnya || (exp.other || 0) + (ast.other || 0)} total={totalStartup} note="Buffer biaya tak terduga" />
            <tr style={{ background: "#0F172A", color: "#fff" }}>
              <td style={{ ...TD, fontWeight: 800, color: "#fff" }}>TOTAL KEBUTUHAN MODAL AWAL</td>
              <td style={{ ...TD_R, fontWeight: 800, color: "#fff" }}>{formatRp(totalStartup)}</td>
              <td style={{ ...TD_R, fontWeight: 800, color: "#fff" }}>100%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 14, padding: "10px 14px", background: "#EFF6FF", borderLeft: "3px solid #3B82F6", borderRadius: 4, fontSize: 12, color: "#1E40AF" }}>
        ℹ <strong>Catatan Validasi:</strong> Proyeksi keuangan {identitas.namaBisnis || "bisnis ini"} dimulai dari Bulan 1 berdasarkan
        asumsi riset pasar eksternal — bukan data historis. Akurasi proyeksi sangat bergantung pada validitas
        asumsi awal: traffic harian, conversion rate, dan repeat purchase yang dirumuskan dari benchmark sektor.
      </div>
    </div>
  );
}

function ValidationCard({ label, value, unit, color, subtitle }) {
  return (
    <div style={{ padding: 14, background: "#F8FAFC", border: `1px solid ${color}30`, borderTop: `3px solid ${color}`, borderRadius: 8 }}>
      <div style={{ fontSize: 9, color: "#64748B", fontFamily: "monospace", letterSpacing: "0.1em", fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 28, color, fontWeight: 800, marginTop: 4, fontFamily: "monospace" }}>{value}</div>
      <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>{unit} · {subtitle}</div>
    </div>
  );
}

function UVPList({ items }) {
  return (
    <ul style={{ margin: "8px 0", paddingLeft: 0, listStyle: "none" }}>
      {items.map((id, idx) => (
        <li key={id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "6px 0", borderBottom: "1px solid #E2E8F0", fontSize: 12.5 }}>
          <span style={{ minWidth: 24, height: 24, background: "#0EA5E9", color: "#fff", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{idx + 1}</span>
          <span>{id.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</span>
        </li>
      ))}
    </ul>
  );
}

function StartupRow({ label, value, total, note }) {
  if (!value) return null;
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  return (
    <tr>
      <td style={TD}>
        <div style={{ fontWeight: 600 }}>{label}</div>
        {note && <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{note}</div>}
      </td>
      <td style={TD_R}>{formatRp(value)}</td>
      <td style={{ ...TD_R, color: "#0EA5E9", fontWeight: 600 }}>{pct}%</td>
    </tr>
  );
}

// ============================================================================
// JALUR B — HISTORICAL PERFORMANCE & CONSOLIDATION SECTION
// ============================================================================
export function JalurBHistoricalSection({ forms, financials }) {
  const eb = forms?.existingBusiness || {};
  const identitas = forms?.identitas || {};

  // Hitung baseline metrics
  const tahunBerjalan = eb.tahunMulai ? (new Date().getFullYear() - parseInt(eb.tahunMulai, 10)) : 0;
  const grossMargin = eb.omsetBulanan && eb.hppBulanan ? (((eb.omsetBulanan - eb.hppBulanan) / eb.omsetBulanan) * 100) : null;
  const netMargin = eb.omsetBulanan && eb.labaBulanan ? ((eb.labaBulanan / eb.omsetBulanan) * 100) : null;
  const omsetTahunan = eb.omsetBulanan ? eb.omsetBulanan * 12 : 0;
  const labaTahunan = eb.labaBulanan ? eb.labaBulanan * 12 : 0;

  // Proyeksi setelah ekspansi
  const targetGrowth = (eb.targetPertumbuhanRevenue || 0) / 100;
  const omsetTahunanSetelah = omsetTahunan * (1 + targetGrowth);
  const labaTahunanSetelah = labaTahunan * (1 + targetGrowth * 1.2); // efisiensi skala

  return (
    <div className="report-bab bab-major" style={babStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <IsoGraphic type="lanjutan" size={84} />
        <h2 style={{ ...babTitleStyle, marginBottom: 0 }}>Bab 6.5 — Kinerja Historis & Proyeksi Konsolidasi</h2>
      </div>

      <p style={paragraphStyle}>
        Sebagai bisnis yang sudah berjalan {tahunBerjalan > 0 ? `selama ${tahunBerjalan} tahun ` : ""}sejak {eb.tahunMulai || "—"},
        {identitas.namaBisnis ? ` ${identitas.namaBisnis} ` : " "}memiliki <strong>data historis riil</strong> sebagai dasar
        proyeksi ekspansi — bukan asumsi semata. Analisis kelayakan ekspansi berfokus pada tiga elemen kunci:
        kinerja saat ini, kapasitas yang tersedia, dan return on investment dari penambahan modal.
      </p>

      {/* Snapshot Keuangan Eksisting */}
      <h3 style={subtitleStyle}>① Snapshot Kinerja Bisnis Saat Ini (Baseline)</h3>
      <div style={{ marginTop: 10, border: "1px solid #E2E8F0", borderRadius: 8, overflow: "hidden" }}>
        <table style={TABLE}>
          <thead>
            <tr>
              <th style={TH}>INDIKATOR KINERJA SAAT INI</th>
              <th style={TH_R}>BULANAN</th>
              <th style={TH_R}>TAHUNAN (×12)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={TD}>Omset / Pendapatan</td><td style={TD_R}>{formatRp(eb.omsetBulanan)}</td><td style={TD_R}>{formatRp(omsetTahunan)}</td></tr>
            <tr><td style={TD}>Harga Pokok Penjualan (HPP)</td><td style={TD_R}>{formatRp(eb.hppBulanan)}</td><td style={TD_R}>{formatRp(eb.hppBulanan * 12)}</td></tr>
            <tr><td style={TD}>Total Biaya Operasional</td><td style={TD_R}>{formatRp(eb.opexBerjalan)}</td><td style={TD_R}>{formatRp(eb.opexBerjalan * 12)}</td></tr>
            <tr style={{ background: "#F1F5F9" }}>
              <td style={{ ...TD, fontWeight: 700 }}>Laba Bersih</td>
              <td style={{ ...TD_R, fontWeight: 700, color: "#059669" }}>{formatRp(eb.labaBulanan)}</td>
              <td style={{ ...TD_R, fontWeight: 700, color: "#059669" }}>{formatRp(labaTahunan)}</td>
            </tr>
            {grossMargin !== null && (
              <tr><td style={TD}>Gross Margin %</td><td style={TD_R}>{grossMargin.toFixed(1)}%</td><td style={TD_R}>{grossMargin.toFixed(1)}%</td></tr>
            )}
            {netMargin !== null && (
              <tr><td style={TD}>Net Margin %</td><td style={TD_R}>{netMargin.toFixed(1)}%</td><td style={TD_R}>{netMargin.toFixed(1)}%</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Kapasitas */}
      <h3 style={subtitleStyle}>② Analisis Kapasitas & Bottleneck</h3>
      <div style={cardGridStyle}>
        <ValidationCard
          label="UTILISASI KAPASITAS"
          value={`${eb.kapasitasUtilization || 0}%`}
          unit=""
          color={eb.kapasitasUtilization > 80 ? "#DC2626" : "#10B981"}
          subtitle={eb.kapasitasUtilization > 80 ? "Hampir penuh — ekspansi urgent" : "Masih ada ruang"}
        />
        <ValidationCard
          label="KENDALA OPERASIONAL"
          value={(eb.bottleneck || []).length}
          unit="bottleneck"
          color="#F59E0B"
          subtitle="kendala teridentifikasi"
        />
        <ValidationCard
          label="JUMLAH KARYAWAN"
          value={eb.jumlahKaryawan || 0}
          unit="orang"
          color="#0EA5E9"
          subtitle="termasuk pemilik"
        />
      </div>

      {(eb.bottleneck || []).length > 0 && (
        <div style={{ marginTop: 12, padding: "10px 14px", background: "#FEF3C7", borderLeft: "3px solid #F59E0B", borderRadius: 4, fontSize: 12, color: "#92400E" }}>
          <strong>Bottleneck yang akan diselesaikan via ekspansi:</strong> {(eb.bottleneck || []).map((b) => b.replace(/_/g, " ")).join(", ")}.
        </div>
      )}

      {/* Konsolidasi Sebelum vs Sesudah */}
      <h3 style={subtitleStyle}>③ Konsolidasi Proyeksi — Sebelum vs Setelah Ekspansi</h3>
      <p style={paragraphStyle}>
        Proyeksi keuangan menggabungkan kinerja bisnis eksisting (baseline) dengan proyeksi unit baru hasil ekspansi.
        Target pertumbuhan revenue: <strong>{eb.targetPertumbuhanRevenue || 0}%</strong>.
        Target payback period modal ekspansi: <strong>{eb.targetPayback || 0} bulan</strong>.
      </p>

      <div style={{ marginTop: 12, border: "1px solid #E2E8F0", borderRadius: 8, overflow: "hidden" }}>
        <table style={TABLE}>
          <thead>
            <tr>
              <th style={TH}>METRIK TAHUNAN</th>
              <th style={TH_R}>SAAT INI (BASELINE)</th>
              <th style={TH_R}>SETELAH EKSPANSI</th>
              <th style={TH_R}>Δ KENAIKAN</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={TD}>Omset Tahunan</td>
              <td style={TD_R}>{formatRp(omsetTahunan)}</td>
              <td style={{ ...TD_R, fontWeight: 700, color: "#0EA5E9" }}>{formatRp(omsetTahunanSetelah)}</td>
              <td style={{ ...TD_R, color: "#059669", fontWeight: 700 }}>+{formatRp(omsetTahunanSetelah - omsetTahunan)}</td>
            </tr>
            <tr>
              <td style={TD}>Laba Tahunan</td>
              <td style={TD_R}>{formatRp(labaTahunan)}</td>
              <td style={{ ...TD_R, fontWeight: 700, color: "#0EA5E9" }}>{formatRp(labaTahunanSetelah)}</td>
              <td style={{ ...TD_R, color: "#059669", fontWeight: 700 }}>+{formatRp(labaTahunanSetelah - labaTahunan)}</td>
            </tr>
            <tr>
              <td style={TD}>Aset Total</td>
              <td style={TD_R}>{formatRp(eb.asetSaatIni || 0)}</td>
              <td style={TD_R}>{formatRp((eb.asetSaatIni || 0) + (omsetTahunanSetelah - omsetTahunan) * 0.3)}</td>
              <td style={{ ...TD_R, color: "#059669" }}>+{formatRp((omsetTahunanSetelah - omsetTahunan) * 0.3)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Justifikasi Ekspansi */}
      {eb.alasanEkspansi && (
        <>
          <h3 style={subtitleStyle}>④ Justifikasi & Timing Ekspansi</h3>
          <div style={{ padding: 14, background: "#ECFDF5", borderLeft: "4px solid #10B981", borderRadius: 6, fontSize: 13, color: "#065F46", lineHeight: 1.6 }}>
            "{eb.alasanEkspansi}"
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// JALUR C — FUNDING STRUCTURE & RISK MITIGATION SECTION
// ============================================================================
export function JalurCFundingSection({ forms, financials, stage = "baru" }) {
  const ft = forms?.fundingTarget || {};
  const identitas = forms?.identitas || {};
  // v13.1: Use of Funds DI-DERIVE dari rincian Initial Investment (tab
  // Keuangan) — bukan input manual yang dulu sering kosong (angka nol semua).
  const uof = deriveUseOfFunds(forms, stage);
  const rm = ft.risikoMitigasi || {};
  const proj = financials?.projection || [];

  const totalUseOfFunds = (uof.renovasi || 0) + (uof.equipment || 0) + (uof.inventory || 0) + (uof.marketing || 0) + (uof.workingCapital || 0) + (uof.legal || 0) + (uof.other || 0);

  // v13.6 FIX: dana eksternal yang DIAJUKAN dibaca dari modal.funding sesuai
  // jenis pendanaan — SAMA dengan Bab 7. Sebelumnya memakai ft.nominal yang
  // masih 0 kalau user mengisi sumber dana lewat Smart Balance (tab Keuangan)
  // tanpa membuka form Parameter Pendanaan → muncul "Rp 0" yang membingungkan.
  const fundingExternal = (() => {
    const fnd = forms?.modal?.funding || {};
    const isEquity = ["investor", "hibah"].includes(ft.jenisPendanaan);
    const amt = isEquity ? (fnd.modalMitra || 0) : (fnd.modalPinjaman || 0);
    return amt || fnd.modalPinjaman || fnd.modalMitra || 0;
  })();

  // v13.2: jadwal anuitas dari financialEngine — angka cicilan & bunga
  // IDENTIK dengan P&L dan narasi (satu sumber kebenaran).
  const schedule = computeDebtSchedule(forms);
  const principal = schedule.principal || ft.nominal || 0;
  const tenor = schedule.tenor;
  const monthlyPayment = schedule.monthlyPayment;
  const annualDebtService = schedule.annualDebtService;
  const totalInterest = schedule.totalInterest;

  // DSCR per tahun = EBITDA / Debt Service (basis standar analis kredit).
  // Stage "lanjutan": laba tahunan bisnis BERJALAN ikut menambah kemampuan bayar.
  const existingAnnualProfit = stage === "lanjutan"
    ? ((forms?.existingBusiness?.labaBulanan || 0) * 12)
    : 0;
  const noiOf = (y) => y.ebit + y.operatingExpenses.depreciation + existingAnnualProfit;
  const dscrByYear = proj.map((y) => (annualDebtService > 0 ? noiOf(y) / annualDebtService : 0));

  // Mitigasi diisi (minimal 3 dari 5)
  const mitigasiFilled = ["pasar", "operasional", "keuangan", "sdm", "regulasi"].filter((k) => rm[k]?.trim());

  return (
    <div className="report-bab bab-major" style={babStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <IsoGraphic type="funding" size={84} />
        <h2 style={{ ...babTitleStyle, marginBottom: 0 }}>Bab 6.6 — Struktur Pendanaan, Use of Funds & Mitigasi Risiko</h2>
      </div>

      <p style={paragraphStyle}>
        Sebagai proposal pencarian dana, kelayakan {identitas.namaBisnis || "bisnis ini"} dievaluasi oleh investor/bank dari empat
        sisi: <strong>kemampuan pengembalian dana (repayment capacity)</strong>, <strong>transparansi alokasi modal (use of funds)</strong>,
        <strong> jaminan keamanan dana (collateral)</strong>, dan <strong>kesiapan menghadapi risiko</strong>. Bab ini menjawab keempatnya
        secara terstruktur agar dokumen siap dievaluasi untuk pengajuan kredit/investasi.
      </p>

      {/* Use of Funds Breakdown */}
      <h3 style={subtitleStyle}>① Use of Funds — Alokasi Penggunaan Dana</h3>
      <p style={paragraphStyle}>
        Total kebutuhan dana (initial investment): <strong>{formatRp(totalUseOfFunds)}</strong> — persentase di tabel dihitung
        terhadap angka ini. Dari total tersebut, <strong>{formatRp(fundingExternal)}</strong> diajukan sebagai pendanaan eksternal,
        sisanya ditutup modal sendiri/mitra (rincian sumber dana di Bab 7). Berikut transparansi alokasinya:
      </p>
      <div style={{ marginTop: 12, border: "1px solid #E2E8F0", borderRadius: 8, overflow: "hidden" }}>
        <table style={TABLE}>
          <thead>
            <tr>
              <th style={TH}>KATEGORI ALOKASI</th>
              <th style={TH_R}>NOMINAL</th>
              <th style={TH_R}>% TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <UseOfFundsRow label="Renovasi, Setup & Deposit Sewa" value={uof.renovasi} total={totalUseOfFunds} />
            <UseOfFundsRow label="Alat & Peralatan Produksi" value={uof.equipment} total={totalUseOfFunds} />
            <UseOfFundsRow label="Inventory / Stok Awal" value={uof.inventory} total={totalUseOfFunds} />
            <UseOfFundsRow label="Marketing & Branding" value={uof.marketing} total={totalUseOfFunds} />
            <UseOfFundsRow label="Modal Kerja (Cadangan Opex 3 bulan)" value={uof.workingCapital} total={totalUseOfFunds} />
            <UseOfFundsRow label="Legalitas & Perizinan" value={uof.legal} total={totalUseOfFunds} />
            <UseOfFundsRow label="Buffer / Cadangan Lain-lain" value={uof.other} total={totalUseOfFunds} />
            <tr style={{ background: "#0F172A", color: "#fff" }}>
              <td style={{ ...TD, fontWeight: 800, color: "#fff" }}>TOTAL USE OF FUNDS</td>
              <td style={{ ...TD_R, fontWeight: 800, color: "#fff" }}>{formatRp(totalUseOfFunds)}</td>
              <td style={{ ...TD_R, fontWeight: 800, color: "#fff" }}>100%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Repayment Schedule */}
      <h3 style={subtitleStyle}>② Analisis Repayment Capacity</h3>
      <p style={paragraphStyle}>
        Skenario pinjaman: <strong>{formatRp(principal)}</strong> dengan tenor <strong>{tenor} bulan</strong> dan
        bunga efektif 11,5% per tahun. Cicilan bulanan tetap: <strong>{formatRp(monthlyPayment)}</strong>.
      </p>

      <div style={cardGridStyle}>
        <ValidationCard label="CICILAN BULANAN" value={formatRpShort(monthlyPayment)} unit="" color="#0EA5E9" subtitle={`× ${tenor} bulan`} />
        <ValidationCard label="TOTAL BUNGA" value={formatRpShort(totalInterest)} unit="" color="#F59E0B" subtitle={`selama ${tenor} bulan`} />
        <ValidationCard label="DEBT SERVICE/TAHUN" value={formatRpShort(annualDebtService)} unit="" color="#7C3AED" subtitle="cicilan tahunan" />
      </div>

      {/* DSCR Table */}
      {dscrByYear.length > 0 && (
        <>
          <h3 style={subtitleStyle}>③ Debt Service Coverage Ratio (DSCR) per Tahun</h3>
          <p style={paragraphStyle}>
            DSCR mengukur kemampuan bisnis menutup beban pinjaman dari laba operasional. <strong>Standar bank: DSCR ≥ 1.25x</strong> untuk persetujuan kredit.
          </p>
          <div style={{ marginTop: 12, border: "1px solid #E2E8F0", borderRadius: 8, overflow: "hidden" }}>
            <table style={TABLE}>
              <thead>
                <tr>
                  <th style={TH}>TAHUN</th>
                  <th style={TH_R}>NET OPERATING INCOME</th>
                  <th style={TH_R}>ANNUAL DEBT SERVICE</th>
                  <th style={TH_R}>DSCR</th>
                  <th style={TH_R}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {dscrByYear.map((dscr, idx) => {
                  const y = proj[idx];
                  const noi = noiOf(y);
                  const ok = dscr >= 1.25;
                  return (
                    <tr key={idx}>
                      <td style={TD}>Tahun {y.year}</td>
                      <td style={TD_R}>{formatRp(noi)}</td>
                      <td style={TD_R}>{formatRp(annualDebtService)}</td>
                      <td style={{ ...TD_R, fontWeight: 800, color: ok ? "#059669" : "#DC2626", fontSize: 14 }}>
                        {dscr.toFixed(2)}x
                      </td>
                      <td style={{ ...TD_R, color: ok ? "#059669" : "#DC2626", fontWeight: 700 }}>
                        {ok ? "✓ BANKABLE" : "⚠ TIGHT"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Mitigasi Risiko Matrix */}
      <h3 style={subtitleStyle}>④ Matriks Analisis & Mitigasi Risiko</h3>
      <p style={paragraphStyle}>
        Dari 5 kategori risiko utama UMKM, manajemen telah merumuskan strategi mitigasi untuk <strong>{mitigasiFilled.length} dari 5</strong> kategori.
      </p>

      {mitigasiFilled.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          {mitigasiFilled.map((key) => (
            <RiskMitigationCard
              key={key}
              category={key}
              content={rm[key]}
            />
          ))}
        </div>
      )}

      {ft.exitStrategy && (
        <>
          <h3 style={subtitleStyle}>⑤ Exit Strategy untuk Investor</h3>
          <div style={{ padding: 14, background: "#F0F9FF", borderLeft: "4px solid #0EA5E9", borderRadius: 6, fontSize: 13, color: "#0C4A6E", lineHeight: 1.6 }}>
            {ft.exitStrategy}
          </div>
        </>
      )}
    </div>
  );
}

function UseOfFundsRow({ label, value, total }) {
  if (!value) return null;
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  return (
    <tr>
      <td style={TD}>{label}</td>
      <td style={TD_R}>{formatRp(value)}</td>
      <td style={{ ...TD_R, color: "#0EA5E9", fontWeight: 600 }}>{pct}%</td>
    </tr>
  );
}

function RiskMitigationCard({ category, content }) {
  const CATEGORY_META = {
    pasar:        { label: "Risiko Pasar",        icon: "📊", color: "#3B82F6" },
    operasional:  { label: "Risiko Operasional",  icon: "⚙️", color: "#F59E0B" },
    keuangan:     { label: "Risiko Keuangan",     icon: "💰", color: "#DC2626" },
    sdm:          { label: "Risiko SDM",          icon: "👥", color: "#7C3AED" },
    regulasi:     { label: "Risiko Regulasi",     icon: "⚖️", color: "#475569" },
  };
  const meta = CATEGORY_META[category];
  return (
    <div style={{ padding: 12, background: "#fff", border: `1px solid #E2E8F0`, borderLeft: `4px solid ${meta.color}`, borderRadius: 6 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: meta.color, marginBottom: 4 }}>
        {meta.icon} {meta.label}
      </div>
      <div style={{ fontSize: 12, color: "#1e293b", lineHeight: 1.5 }}>
        {content}
      </div>
    </div>
  );
}

function formatRpShort(n) {
  if (!n) return "Rp 0";
  if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(1)} M`;
  if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(0)} jt`;
  return `Rp ${(n / 1e3).toFixed(0)} rb`;
}

// ============================================================================
// HTML EXPORT BUILDERS
// ============================================================================
export function buildPathwaySpecificHtml(stage, forms, financials) {
  // Refactor v13: setiap laporan pencari dana memuat DUA bab khusus.
  const bab65 = stage === "lanjutan" ? buildJalurBHtml(forms) : buildJalurAHtml(forms);
  const bab66 = buildJalurCHtml(forms, financials, stage);
  return bab65 + bab66;
}

const H_BAB = `font-size:22px; font-weight:800; color:#0F172A; margin-bottom:18px; letter-spacing:-0.3px;`;
const H_SUB = `font-size:14px; font-weight:700; color:#334155; margin-top:20px; margin-bottom:8px;`;
const H_P = `font-size:13px; color:#1e293b; line-height:1.65; margin-bottom:12px;`;
const H_WRAP = `margin-top:30px; padding-top:24px; border-top:3px solid #0F172A; page-break-before:always;`;

function buildJalurAHtml(forms) {
  const peluang = forms?.peluang || {};
  const modal = forms?.modal || {};
  const identitas = forms?.identitas || {};
  const exp = modal.expenses || {};
  const ast = modal.assets || {};
  // v13.2: basis SAMA dengan Use of Funds & Bab 7 — total initial investment
  // (rincian item + peralatan), bukan subset lama yang membuat angka laporan
  // saling bertentangan (138,5 jt vs 293,1 jt pada contoh).
  const cats = sumByCategory(forms?.modal?.investmentItems || []);
  const eqTotal = equipmentTotal(forms);
  const totalStartup = totalInitialInvestment(forms) ||
    ((exp.legal || 0) + (exp.renovasi || 0) + (exp.promo || 0) + (exp.lainnya || 0) + (ast.stok || 0) + eqTotal);

  const startupRow = (label, value, note) => {
    if (!value) return "";
    const pct = totalStartup > 0 ? ((value / totalStartup) * 100).toFixed(1) : 0;
    return `<tr>
      <td style="padding:8px 12px; font-size:12px; border-bottom:1px solid #E2E8F0;">
        <div style="font-weight:600;">${label}</div>
        ${note ? `<div style="font-size:11px; color:#64748B; margin-top:2px;">${note}</div>` : ""}
      </td>
      <td style="padding:8px 12px; font-size:12px; text-align:right; font-family:monospace; border-bottom:1px solid #E2E8F0;">${formatRp(value)}</td>
      <td style="padding:8px 12px; font-size:12px; text-align:right; font-family:monospace; color:#0EA5E9; font-weight:600; border-bottom:1px solid #E2E8F0;">${pct}%</td>
    </tr>`;
  };

  return `<div style="${H_WRAP}">
    <div style="display:flex; align-items:center; gap:16px; margin-bottom:18px;">
      ${isoSvgString("baru", 84)}
      <h2 style="${H_BAB} margin-bottom:0;">Bab 6.5 — Validasi Ide & Analisis Kompetitif</h2>
    </div>
    <p style="${H_P}">Sebagai bisnis yang merintis dari nol, validasi ide dan pembuktian potensi pasar menjadi tulang punggung kelayakan${identitas.namaBisnis ? ` ${identitas.namaBisnis}` : ""}. Berbeda dengan bisnis yang sudah berjalan, rintisan menuntut analisis mendalam terhadap <strong>masalah pelanggan</strong>, <strong>diferensiasi produk</strong>, dan <strong>kesiapan modal awal yang masif</strong> sebelum bisnis beroperasi.</p>

    <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:12px;">
      <div style="padding:14px; background:#F8FAFC; border:1px solid #0EA5E930; border-top:3px solid #0EA5E9; border-radius:8px;">
        <div style="font-size:9px; color:#64748B; font-family:monospace; letter-spacing:0.1em; font-weight:700;">MASALAH DIIDENTIFIKASI</div>
        <div style="font-size:28px; color:#0EA5E9; font-weight:800; margin-top:4px; font-family:monospace;">${peluang.masalah?.length || 0}</div>
        <div style="font-size:10px; color:#64748B; margin-top:2px;">dari riset awal pelanggan</div>
      </div>
      <div style="padding:14px; background:#F8FAFC; border:1px solid #10B98130; border-top:3px solid #10B981; border-radius:8px;">
        <div style="font-size:9px; color:#64748B; font-family:monospace; letter-spacing:0.1em; font-weight:700;">SOLUSI DIRANCANG</div>
        <div style="font-size:28px; color:#10B981; font-weight:800; margin-top:4px; font-family:monospace;">${peluang.solusi?.length || 0}</div>
        <div style="font-size:10px; color:#64748B; margin-top:2px;">untuk masalah teridentifikasi</div>
      </div>
      <div style="padding:14px; background:#F8FAFC; border:1px solid #F59E0B30; border-top:3px solid #F59E0B; border-radius:8px;">
        <div style="font-size:9px; color:#64748B; font-family:monospace; letter-spacing:0.1em; font-weight:700;">SEGMEN TARGET</div>
        <div style="font-size:28px; color:#F59E0B; font-weight:800; margin-top:4px; font-family:monospace;">${peluang.jenisPelanggan?.length || 0}</div>
        <div style="font-size:10px; color:#64748B; margin-top:2px;">pelanggan utama</div>
      </div>
    </div>

    <h3 style="${H_SUB}">Rincian Kebutuhan Modal Awal (Start-up Requirements)</h3>
    <p style="${H_P}">Sebagai bisnis baru, kebutuhan modal awal jauh lebih besar dibanding bisnis yang sudah berjalan — karena seluruh infrastruktur harus dibangun dari nol. Total kebutuhan investasi awal: <strong>${formatRp(totalStartup)}</strong>.</p>

    <div style="margin-top:12px; border:1px solid #E2E8F0; border-radius:8px; overflow:hidden;">
      <table style="width:100%; border-collapse:collapse;">
        <thead><tr>
          <th style="padding:10px 12px; text-align:left; font-size:10px; font-family:monospace; color:#475569; letter-spacing:0.1em; font-weight:700; background:#F1F5F9;">KOMPONEN START-UP</th>
          <th style="padding:10px 12px; text-align:right; font-size:10px; font-family:monospace; color:#475569; letter-spacing:0.1em; font-weight:700; background:#F1F5F9;">NOMINAL</th>
          <th style="padding:10px 12px; text-align:right; font-size:10px; font-family:monospace; color:#475569; letter-spacing:0.1em; font-weight:700; background:#F1F5F9;">% TOTAL</th>
        </tr></thead>
        <tbody>
          ${startupRow("Biaya Legalitas & Perizinan", exp.legal, "NIB, NPWP, PIRT/BPOM/Halal, notaris")}
          ${startupRow("Renovasi & Setup Tempat", exp.renovasi, "Interior, instalasi listrik/plumbing")}
          ${startupRow("Deposit & Sewa Dibayar di Muka", cats.sewa_deposit || 0, "Sewa tempat dibayar di muka (dikembalikan saat kontrak usai)")}
          ${startupRow("Peralatan & Mesin", eqTotal, "Otomatis dari sub-tab Alat & Karyawan")}
          ${startupRow("Promosi Pembukaan", exp.promo, "Iklan, signage, opening event")}
          ${startupRow("Stok Awal / Bahan Baku", ast.stok, "Persediaan awal untuk operasional 1-2 bulan")}
          ${startupRow("Modal Kerja Awal (Kas Opex 3 Bulan)", cats.modal_kerja || 0, "Bantalan kas gaji & operasional sebelum omset stabil")}
          ${startupRow("Cadangan Tak Terduga", cats.lainnya || (exp.other || 0) + (ast.other || 0), "Buffer biaya tak terduga")}
          <tr style="background:#0F172A; color:#fff;">
            <td style="padding:8px 12px; font-weight:800; color:#fff;">TOTAL KEBUTUHAN MODAL AWAL</td>
            <td style="padding:8px 12px; text-align:right; font-family:monospace; font-weight:800; color:#fff;">${formatRp(totalStartup)}</td>
            <td style="padding:8px 12px; text-align:right; font-family:monospace; font-weight:800; color:#fff;">100%</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div style="margin-top:14px; padding:10px 14px; background:#EFF6FF; border-left:3px solid #3B82F6; border-radius:4px; font-size:12px; color:#1E40AF;">
      ℹ <strong>Catatan Validasi:</strong> Proyeksi keuangan dimulai dari Bulan 1 berdasarkan asumsi riset pasar eksternal — bukan data historis. Akurasi proyeksi sangat bergantung pada validitas asumsi awal: traffic harian, conversion rate, dan repeat purchase yang dirumuskan dari benchmark sektor.
    </div>
  </div>`;
}

function buildJalurBHtml(forms) {
  const eb = forms?.existingBusiness || {};
  const identitas = forms?.identitas || {};
  const tahunBerjalan = eb.tahunMulai ? (new Date().getFullYear() - parseInt(eb.tahunMulai, 10)) : 0;
  const grossMargin = eb.omsetBulanan && eb.hppBulanan ? (((eb.omsetBulanan - eb.hppBulanan) / eb.omsetBulanan) * 100) : null;
  const netMargin = eb.omsetBulanan && eb.labaBulanan ? ((eb.labaBulanan / eb.omsetBulanan) * 100) : null;
  const omsetTahunan = eb.omsetBulanan ? eb.omsetBulanan * 12 : 0;
  const labaTahunan = eb.labaBulanan ? eb.labaBulanan * 12 : 0;
  const targetGrowth = (eb.targetPertumbuhanRevenue || 0) / 100;
  const omsetTahunanSetelah = omsetTahunan * (1 + targetGrowth);
  const labaTahunanSetelah = labaTahunan * (1 + targetGrowth * 1.2);

  return `<div style="${H_WRAP}">
    <div style="display:flex; align-items:center; gap:16px; margin-bottom:18px;">
      ${isoSvgString("lanjutan", 84)}
      <h2 style="${H_BAB} margin-bottom:0;">Bab 6.5 — Kinerja Historis & Proyeksi Konsolidasi</h2>
    </div>
    <p style="${H_P}">Sebagai bisnis yang sudah berjalan ${tahunBerjalan > 0 ? `selama ${tahunBerjalan} tahun ` : ""}sejak ${eb.tahunMulai || "—"},${identitas.namaBisnis ? ` ${identitas.namaBisnis} ` : " "}memiliki <strong>data historis riil</strong> sebagai dasar proyeksi ekspansi — bukan asumsi semata.</p>

    <h3 style="${H_SUB}">① Snapshot Kinerja Bisnis Saat Ini (Baseline)</h3>
    <div style="margin-top:10px; border:1px solid #E2E8F0; border-radius:8px; overflow:hidden;">
      <table style="width:100%; border-collapse:collapse; font-size:12px;">
        <thead><tr>
          <th style="padding:10px 12px; text-align:left; font-size:10px; font-family:monospace; color:#475569; letter-spacing:0.1em; font-weight:700; background:#F1F5F9;">INDIKATOR KINERJA</th>
          <th style="padding:10px 12px; text-align:right; font-size:10px; font-family:monospace; color:#475569; letter-spacing:0.1em; font-weight:700; background:#F1F5F9;">BULANAN</th>
          <th style="padding:10px 12px; text-align:right; font-size:10px; font-family:monospace; color:#475569; letter-spacing:0.1em; font-weight:700; background:#F1F5F9;">TAHUNAN (×12)</th>
        </tr></thead>
        <tbody>
          <tr><td style="padding:8px 12px; border-bottom:1px solid #E2E8F0;">Omset / Pendapatan</td><td style="padding:8px 12px; text-align:right; font-family:monospace; border-bottom:1px solid #E2E8F0;">${formatRp(eb.omsetBulanan)}</td><td style="padding:8px 12px; text-align:right; font-family:monospace; border-bottom:1px solid #E2E8F0;">${formatRp(omsetTahunan)}</td></tr>
          <tr><td style="padding:8px 12px; border-bottom:1px solid #E2E8F0;">HPP</td><td style="padding:8px 12px; text-align:right; font-family:monospace; border-bottom:1px solid #E2E8F0;">${formatRp(eb.hppBulanan)}</td><td style="padding:8px 12px; text-align:right; font-family:monospace; border-bottom:1px solid #E2E8F0;">${formatRp(eb.hppBulanan * 12)}</td></tr>
          <tr><td style="padding:8px 12px; border-bottom:1px solid #E2E8F0;">Total Biaya Operasional</td><td style="padding:8px 12px; text-align:right; font-family:monospace; border-bottom:1px solid #E2E8F0;">${formatRp(eb.opexBerjalan)}</td><td style="padding:8px 12px; text-align:right; font-family:monospace; border-bottom:1px solid #E2E8F0;">${formatRp(eb.opexBerjalan * 12)}</td></tr>
          <tr style="background:#F1F5F9;">
            <td style="padding:8px 12px; font-weight:700;">Laba Bersih</td>
            <td style="padding:8px 12px; text-align:right; font-family:monospace; font-weight:700; color:#059669;">${formatRp(eb.labaBulanan)}</td>
            <td style="padding:8px 12px; text-align:right; font-family:monospace; font-weight:700; color:#059669;">${formatRp(labaTahunan)}</td>
          </tr>
          ${grossMargin !== null ? `<tr><td style="padding:8px 12px; border-bottom:1px solid #E2E8F0;">Gross Margin %</td><td style="padding:8px 12px; text-align:right; font-family:monospace; border-bottom:1px solid #E2E8F0;">${grossMargin.toFixed(1)}%</td><td style="padding:8px 12px; text-align:right; font-family:monospace; border-bottom:1px solid #E2E8F0;">${grossMargin.toFixed(1)}%</td></tr>` : ""}
          ${netMargin !== null ? `<tr><td style="padding:8px 12px;">Net Margin %</td><td style="padding:8px 12px; text-align:right; font-family:monospace;">${netMargin.toFixed(1)}%</td><td style="padding:8px 12px; text-align:right; font-family:monospace;">${netMargin.toFixed(1)}%</td></tr>` : ""}
        </tbody>
      </table>
    </div>

    <h3 style="${H_SUB}">③ Konsolidasi — Sebelum vs Setelah Ekspansi</h3>
    <p style="${H_P}">Target pertumbuhan revenue: <strong>${eb.targetPertumbuhanRevenue || 0}%</strong>. Target payback ekspansi: <strong>${eb.targetPayback || 0} bulan</strong>.</p>
    <div style="margin-top:12px; border:1px solid #E2E8F0; border-radius:8px; overflow:hidden;">
      <table style="width:100%; border-collapse:collapse; font-size:12px;">
        <thead><tr>
          <th style="padding:10px 12px; text-align:left; font-size:10px; font-family:monospace; color:#475569; letter-spacing:0.1em; font-weight:700; background:#F1F5F9;">METRIK TAHUNAN</th>
          <th style="padding:10px 12px; text-align:right; font-size:10px; font-family:monospace; color:#475569; letter-spacing:0.1em; font-weight:700; background:#F1F5F9;">BASELINE</th>
          <th style="padding:10px 12px; text-align:right; font-size:10px; font-family:monospace; color:#475569; letter-spacing:0.1em; font-weight:700; background:#F1F5F9;">SETELAH EKSPANSI</th>
          <th style="padding:10px 12px; text-align:right; font-size:10px; font-family:monospace; color:#475569; letter-spacing:0.1em; font-weight:700; background:#F1F5F9;">Δ KENAIKAN</th>
        </tr></thead>
        <tbody>
          <tr>
            <td style="padding:8px 12px; border-bottom:1px solid #E2E8F0;">Omset Tahunan</td>
            <td style="padding:8px 12px; text-align:right; font-family:monospace; border-bottom:1px solid #E2E8F0;">${formatRp(omsetTahunan)}</td>
            <td style="padding:8px 12px; text-align:right; font-family:monospace; font-weight:700; color:#0EA5E9; border-bottom:1px solid #E2E8F0;">${formatRp(omsetTahunanSetelah)}</td>
            <td style="padding:8px 12px; text-align:right; font-family:monospace; color:#059669; font-weight:700; border-bottom:1px solid #E2E8F0;">+${formatRp(omsetTahunanSetelah - omsetTahunan)}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px; border-bottom:1px solid #E2E8F0;">Laba Tahunan</td>
            <td style="padding:8px 12px; text-align:right; font-family:monospace; border-bottom:1px solid #E2E8F0;">${formatRp(labaTahunan)}</td>
            <td style="padding:8px 12px; text-align:right; font-family:monospace; font-weight:700; color:#0EA5E9; border-bottom:1px solid #E2E8F0;">${formatRp(labaTahunanSetelah)}</td>
            <td style="padding:8px 12px; text-align:right; font-family:monospace; color:#059669; font-weight:700; border-bottom:1px solid #E2E8F0;">+${formatRp(labaTahunanSetelah - labaTahunan)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    ${eb.alasanEkspansi ? `<h3 style="${H_SUB}">④ Justifikasi & Timing Ekspansi</h3>
    <div style="padding:14px; background:#ECFDF5; border-left:4px solid #10B981; border-radius:6px; font-size:13px; color:#065F46; line-height:1.6;">"${eb.alasanEkspansi}"</div>` : ""}
  </div>`;
}

function buildJalurCHtml(forms, financials, stage = "baru") {
  const ft = forms?.fundingTarget || {};
  const identitas = forms?.identitas || {};
  // v13.1: derive otomatis dari rincian Initial Investment — fix angka nol
  const uof = deriveUseOfFunds(forms, stage);
  const rm = ft.risikoMitigasi || {};
  const proj = financials?.projection || [];
  const totalUseOfFunds = (uof.renovasi || 0) + (uof.equipment || 0) + (uof.inventory || 0) + (uof.marketing || 0) + (uof.workingCapital || 0) + (uof.legal || 0) + (uof.other || 0);

  // v13.6 FIX: dana eksternal diajukan dibaca dari modal.funding (sama Bab 7)
  const fundingExternal = (() => {
    const fnd = forms?.modal?.funding || {};
    const isEquity = ["investor", "hibah"].includes(ft.jenisPendanaan);
    const amt = isEquity ? (fnd.modalMitra || 0) : (fnd.modalPinjaman || 0);
    return amt || fnd.modalPinjaman || fnd.modalMitra || 0;
  })();

  const schedule = computeDebtSchedule(forms);
  const principal = schedule.principal || ft.nominal || 0;
  const tenor = schedule.tenor;
  const monthlyPayment = schedule.monthlyPayment;
  const annualDebtService = schedule.annualDebtService;
  const existingAnnualProfit = stage === "lanjutan" ? ((forms?.existingBusiness?.labaBulanan || 0) * 12) : 0;

  const uofRow = (label, value) => {
    if (!value) return "";
    const pct = totalUseOfFunds > 0 ? ((value / totalUseOfFunds) * 100).toFixed(1) : 0;
    return `<tr>
      <td style="padding:8px 12px; font-size:12px; border-bottom:1px solid #E2E8F0;">${label}</td>
      <td style="padding:8px 12px; font-size:12px; text-align:right; font-family:monospace; border-bottom:1px solid #E2E8F0;">${formatRp(value)}</td>
      <td style="padding:8px 12px; font-size:12px; text-align:right; font-family:monospace; color:#0EA5E9; font-weight:600; border-bottom:1px solid #E2E8F0;">${pct}%</td>
    </tr>`;
  };

  const dscrRows = proj.map((y) => {
    const noi = y.ebit + y.operatingExpenses.depreciation + existingAnnualProfit; // EBITDA basis
    const dscr = annualDebtService > 0 ? (noi / annualDebtService) : 0;
    const ok = dscr >= 1.25;
    return `<tr>
      <td style="padding:8px 12px; font-size:12px; border-bottom:1px solid #E2E8F0;">Tahun ${y.year}</td>
      <td style="padding:8px 12px; font-size:12px; text-align:right; font-family:monospace; border-bottom:1px solid #E2E8F0;">${formatRp(noi)}</td>
      <td style="padding:8px 12px; font-size:12px; text-align:right; font-family:monospace; border-bottom:1px solid #E2E8F0;">${formatRp(annualDebtService)}</td>
      <td style="padding:8px 12px; font-size:14px; text-align:right; font-family:monospace; font-weight:800; color:${ok ? "#059669" : "#DC2626"}; border-bottom:1px solid #E2E8F0;">${dscr.toFixed(2)}x</td>
      <td style="padding:8px 12px; font-size:12px; text-align:right; font-family:monospace; font-weight:700; color:${ok ? "#059669" : "#DC2626"}; border-bottom:1px solid #E2E8F0;">${ok ? "✓ BANKABLE" : "⚠ TIGHT"}</td>
    </tr>`;
  }).join("");

  const CATEGORY_META = {
    pasar:        { label: "Risiko Pasar",        icon: "📊", color: "#3B82F6" },
    operasional:  { label: "Risiko Operasional",  icon: "⚙️", color: "#F59E0B" },
    keuangan:     { label: "Risiko Keuangan",     icon: "💰", color: "#DC2626" },
    sdm:          { label: "Risiko SDM",          icon: "👥", color: "#7C3AED" },
    regulasi:     { label: "Risiko Regulasi",     icon: "⚖️", color: "#475569" },
  };
  const mitigasiFilled = ["pasar", "operasional", "keuangan", "sdm", "regulasi"].filter((k) => rm[k]?.trim());
  const risikoCards = mitigasiFilled.map((key) => {
    const meta = CATEGORY_META[key];
    return `<div style="padding:12px; background:#fff; border:1px solid #E2E8F0; border-left:4px solid ${meta.color}; border-radius:6px; margin-bottom:10px;">
      <div style="font-size:12px; font-weight:700; color:${meta.color}; margin-bottom:4px;">${meta.icon} ${meta.label}</div>
      <div style="font-size:12px; color:#1e293b; line-height:1.5;">${rm[key]}</div>
    </div>`;
  }).join("");

  return `<div style="${H_WRAP}">
    <div style="display:flex; align-items:center; gap:16px; margin-bottom:18px;">
      ${isoSvgString("funding", 84)}
      <h2 style="${H_BAB} margin-bottom:0;">Bab 6.6 — Struktur Pendanaan, Use of Funds & Mitigasi Risiko</h2>
    </div>
    <p style="${H_P}">Sebagai proposal pencarian dana, kelayakan${identitas.namaBisnis ? ` ${identitas.namaBisnis}` : " bisnis ini"} dievaluasi oleh investor/bank dari empat sisi: <strong>kemampuan pengembalian dana</strong>, <strong>transparansi alokasi modal</strong>, <strong>jaminan keamanan dana</strong>, dan <strong>kesiapan menghadapi risiko</strong>.</p>

    <h3 style="${H_SUB}">① Use of Funds — Alokasi Penggunaan Dana</h3>
    <p style="${H_P}">Total kebutuhan dana (initial investment): <strong>${formatRp(totalUseOfFunds)}</strong> — persentase di tabel dihitung terhadap angka ini. Dari total tersebut, <strong>${formatRp(fundingExternal)}</strong> diajukan sebagai pendanaan eksternal, sisanya ditutup modal sendiri/mitra (rincian sumber dana di Bab 7). Rincian transparansi alokasi:</p>
    <div style="margin-top:12px; border:1px solid #E2E8F0; border-radius:8px; overflow:hidden;">
      <table style="width:100%; border-collapse:collapse;">
        <thead><tr>
          <th style="padding:10px 12px; text-align:left; font-size:10px; font-family:monospace; color:#475569; letter-spacing:0.1em; font-weight:700; background:#F1F5F9;">KATEGORI ALOKASI</th>
          <th style="padding:10px 12px; text-align:right; font-size:10px; font-family:monospace; color:#475569; letter-spacing:0.1em; font-weight:700; background:#F1F5F9;">NOMINAL</th>
          <th style="padding:10px 12px; text-align:right; font-size:10px; font-family:monospace; color:#475569; letter-spacing:0.1em; font-weight:700; background:#F1F5F9;">% TOTAL</th>
        </tr></thead>
        <tbody>
          ${uofRow("Renovasi, Setup & Deposit Sewa", uof.renovasi)}
          ${uofRow("Alat & Peralatan Produksi", uof.equipment)}
          ${uofRow("Inventory / Stok Awal", uof.inventory)}
          ${uofRow("Marketing & Branding", uof.marketing)}
          ${uofRow("Modal Kerja (Cadangan Opex 3 bulan)", uof.workingCapital)}
          ${uofRow("Legalitas & Perizinan", uof.legal)}
          ${uofRow("Buffer / Cadangan", uof.other)}
          <tr style="background:#0F172A; color:#fff;">
            <td style="padding:8px 12px; font-weight:800; color:#fff;">TOTAL USE OF FUNDS</td>
            <td style="padding:8px 12px; text-align:right; font-family:monospace; font-weight:800; color:#fff;">${formatRp(totalUseOfFunds)}</td>
            <td style="padding:8px 12px; text-align:right; font-family:monospace; font-weight:800; color:#fff;">100%</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3 style="${H_SUB}">② Analisis Repayment Capacity</h3>
    <p style="${H_P}">Skenario pinjaman: <strong>${formatRp(principal)}</strong> dengan tenor <strong>${tenor} bulan</strong> dan bunga efektif 11,5% per tahun. Cicilan bulanan tetap: <strong>${formatRp(monthlyPayment)}</strong>.</p>

    ${proj.length > 0 ? `<h3 style="${H_SUB}">③ Debt Service Coverage Ratio (DSCR)</h3>
    <p style="${H_P}">DSCR mengukur kemampuan bisnis menutup beban pinjaman dari laba operasional. <strong>Standar bank: DSCR ≥ 1.25x</strong>.${stage === "lanjutan" && existingAnnualProfit > 0 ? ` Karena bisnis sudah berjalan, NOI di bawah ini <strong>sudah termasuk laba tahunan bisnis eksisting sebesar ${formatRp(existingAnnualProfit)}</strong> — memperkuat kemampuan bayar dibanding bisnis tanpa riwayat.` : ""}${stage === "baru" ? " Catatan untuk bisnis baru: NOI berasal sepenuhnya dari proyeksi asumsi riset, sehingga analis menerapkan margin kehati-hatian lebih besar." : ""}</p>
    <div style="margin-top:12px; border:1px solid #E2E8F0; border-radius:8px; overflow:hidden;">
      <table style="width:100%; border-collapse:collapse;">
        <thead><tr>
          <th style="padding:10px 12px; text-align:left; font-size:10px; font-family:monospace; color:#475569; letter-spacing:0.1em; font-weight:700; background:#F1F5F9;">TAHUN</th>
          <th style="padding:10px 12px; text-align:right; font-size:10px; font-family:monospace; color:#475569; letter-spacing:0.1em; font-weight:700; background:#F1F5F9;">NOI</th>
          <th style="padding:10px 12px; text-align:right; font-size:10px; font-family:monospace; color:#475569; letter-spacing:0.1em; font-weight:700; background:#F1F5F9;">DEBT SERVICE</th>
          <th style="padding:10px 12px; text-align:right; font-size:10px; font-family:monospace; color:#475569; letter-spacing:0.1em; font-weight:700; background:#F1F5F9;">DSCR</th>
          <th style="padding:10px 12px; text-align:right; font-size:10px; font-family:monospace; color:#475569; letter-spacing:0.1em; font-weight:700; background:#F1F5F9;">STATUS</th>
        </tr></thead>
        <tbody>${dscrRows}</tbody>
      </table>
    </div>` : ""}

    ${mitigasiFilled.length > 0 ? `<h3 style="${H_SUB}">④ Matriks Analisis & Mitigasi Risiko</h3>
    <p style="${H_P}">Dari 5 kategori risiko utama UMKM, manajemen telah merumuskan mitigasi untuk <strong>${mitigasiFilled.length} dari 5</strong> kategori.</p>
    ${risikoCards}` : ""}

    ${ft.exitStrategy ? `<h3 style="${H_SUB}">⑤ Exit Strategy untuk Investor</h3>
    <div style="padding:14px; background:#F0F9FF; border-left:4px solid #0EA5E9; border-radius:6px; font-size:13px; color:#0C4A6E; line-height:1.6;">${ft.exitStrategy}</div>` : ""}
  </div>`;
}

// ============================================================================
// SHARED STYLES
// ============================================================================
const babStyle = {
  marginTop: 30,
  paddingTop: 24,
  borderTop: "3px solid #0F172A",
  pageBreakBefore: "always",
};
const babTitleStyle = {
  fontSize: 22, fontWeight: 800, color: "#0F172A", marginBottom: 18,
  letterSpacing: "-0.3px",
};
const subtitleStyle = {
  fontSize: 14, fontWeight: 700, color: "#334155", marginTop: 20, marginBottom: 8,
};
const paragraphStyle = {
  fontSize: 13, color: "#1e293b", lineHeight: 1.65, marginBottom: 12,
};
const cardGridStyle = {
  display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 12,
};
