import { useState } from "react";
import { useApp } from "../../state/AppContext.jsx";
import { COLORS } from "../primitives/styles.js";
import Button from "../primitives/Button.jsx";
import Input from "../primitives/Input.jsx";
import GatewayShell from "./GatewayShell.jsx";
import { testGeminiKey, GEMINI_LINKS } from "../../services/geminiService.js";
import { openExternal } from "../../utils/format.js";

// ============================================================================
// <GeminiKeySetup /> — Step 3 Gateway
//
// Implementasi penuh sesuai Dokumen 1 "Alur Pengambilan API Key":
//   - 2 pilihan: API Key GRATIS / BERBAYAR
//   - Setiap pilihan: "Punya key?" (paste & test) atau "Buat baru" (panduan)
//   - GRATIS: buka https://aistudio.google.com/app/apikey + popup 3-langkah
//   - BERBAYAR: buka https://console.cloud.google.com/billing + panduan step
//
// Setelah key tervalidasi → state.gateway.gemini.validated = true
// → advanceGateway() → step "done" → masuk shell.
// ============================================================================

// 3 sub-mode internal komponen ini:
//   "choose"   = pilih GRATIS vs BERBAYAR
//   "free"     = mode GRATIS: paste key atau buat baru
//   "paid"     = mode BERBAYAR: paste key atau buat baru (panduan billing)
const MODES = { CHOOSE: "choose", FREE: "free", PAID: "paid" };

export default function GeminiKeySetup() {
  const { state, patch, advanceGateway } = useApp();
  const [mode, setMode] = useState(MODES.CHOOSE);
  const [key, setKey] = useState(state.gateway.gemini.key || "");
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);
  const [showGuide, setShowGuide] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    setResult(null);
    const res = await testGeminiKey(key);
    setResult(res);
    setTesting(false);

    if (res.ok) {
      // Simpan ke state
      patch("gateway.gemini", {
        key: key.trim(),
        keyType: mode === MODES.FREE ? "free" : "paid",
        validated: true,
        validationMsg: res.msg,
        model: res.model || "",  // ◆ HOTFIX 6.1: simpan model auto-detected
      });
    }
  };

  const handleContinue = () => {
    if (!state.gateway.gemini.validated) return;
    advanceGateway();
  };

  return (
    <GatewayShell step={1} maxWidth={620}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.3em",
            color: COLORS.accent,
            fontFamily: "monospace",
            marginBottom: 10,
          }}
        >
          ATUR KUNCI AI ANDA (BRING YOUR OWN KEY)
        </div>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: COLORS.textHi,
            margin: 0,
            letterSpacing: "-0.3px",
            lineHeight: 1.25,
          }}
        >
          Hubungkan Fitur AI dengan Akun Google Anda
        </h1>
        <p
          style={{
            fontSize: 13,
            color: COLORS.textSoft,
            marginTop: 12,
            lineHeight: 1.6,
            maxWidth: 460,
            margin: "12px auto 0",
          }}
        >
          Agar Anda bisa menikmati pembuatan laporan tanpa batasan kuota secara gratis atau sesuai
          pemakaian sendiri, silakan hubungkan API Key Gemini Anda.
        </p>
      </div>

      {/* ========== MODE: CHOOSE (pilihan gratis/berbayar) ========== */}
      {mode === MODES.CHOOSE && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            <KeyTypeCard
              label="Gunakan API Key GRATIS"
              tagline="Sangat cocok untuk pemula"
              desc="Batas limit 15 laporan per menit. Tanpa biaya, tanpa kartu kredit."
              badge="GRATIS"
              badgeColor={COLORS.successHi}
              badgeBg={COLORS.successBorder}
              onClick={() => setMode(MODES.FREE)}
            />
            <KeyTypeCard
              label="Gunakan API Key BERBAYAR"
              tagline="Cocok untuk penggunaan skala besar"
              desc="Tanpa hambatan kuota. Bayar sesuai jumlah karakter teks yang dipakai (pay-as-you-go)."
              badge="BERBAYAR"
              badgeColor={COLORS.accent}
              badgeBg={COLORS.accentDeep}
              onClick={() => setMode(MODES.PAID)}
            />
          </div>

          <InfoBox>
            ⓘ Bingung pilih yang mana? Pilih <strong>GRATIS</strong> dulu — cukup untuk sebagian
            besar UMKM (15 laporan/menit sudah lebih dari cukup). Anda bisa upgrade ke berbayar
            kapan saja lewat menu Setting.
          </InfoBox>
        </>
      )}

      {/* ========== MODE: FREE (API Key Gratis) ========== */}
      {mode === MODES.FREE && (
        <>
          <BackButton onClick={() => { setMode(MODES.CHOOSE); setResult(null); }} />

          <SectionTitle color={COLORS.successHi}>API Key GRATIS — Google AI Studio</SectionTitle>

          {/* Punya key? */}
          <Panel title="Sudah punya API key gratis?">
            <Input
              value={key}
              onChange={setKey}
              placeholder="Tempel API key Anda di sini"
            />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <Button
                variant="success"
                onClick={handleTest}
                disabled={testing || !key.trim()}
                style={{ flex: 1 }}
              >
                {testing ? "Mengecek koneksi…" : "Cek API Key"}
              </Button>
            </div>
            {result && <ResultBanner result={result} />}
          </Panel>

          {/* Buat key baru */}
          <Panel title="Belum punya? Buat sekarang" style={{ marginTop: 14 }}>
            <Button
              variant="secondary"
              onClick={() => {
                openExternal(GEMINI_LINKS.freeKey);
                setShowGuide(true);
              }}
              style={{ width: "100%" }}
            >
              Buka Google AI Studio →
            </Button>
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 8, lineHeight: 1.5 }}>
              Tombol akan membuka <strong>aistudio.google.com/app/apikey</strong> di tab baru. Ikuti
              panduan 3 langkah yang muncul setelah Anda klik.
            </div>
          </Panel>

          {showGuide && (
            <GuidePopup
              title="Panduan 3 Langkah Membuat API Key Gratis"
              steps={[
                'Klik tombol "Create API Key" di layar kanan atas akun Google Anda.',
                'Pilih proyek (atau buat baru), lalu klik "Copy" pada kode kunci yang muncul.',
                'Kembali ke BizCast, lalu tempel (paste) kode tersebut di kolom di atas.',
              ]}
              onClose={() => setShowGuide(false)}
            />
          )}
        </>
      )}

      {/* ========== MODE: PAID (API Key Berbayar) ========== */}
      {mode === MODES.PAID && (
        <>
          <BackButton onClick={() => { setMode(MODES.CHOOSE); setResult(null); }} />

          <SectionTitle color={COLORS.accent}>API Key BERBAYAR — Pay-as-you-go</SectionTitle>

          {/* Punya key? */}
          <Panel title="Sudah punya API key berbayar?">
            <Input
              value={key}
              onChange={setKey}
              placeholder="Tempel API key berbayar di sini"
            />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <Button
                variant="success"
                onClick={handleTest}
                disabled={testing || !key.trim()}
                style={{ flex: 1 }}
              >
                {testing ? "Mengecek koneksi…" : "Cek API Key"}
              </Button>
            </div>
            {result && <ResultBanner result={result} />}
          </Panel>

          {/* Buat key berbayar — 3 langkah */}
          <Panel title="Belum punya? Ikuti 3 langkah" style={{ marginTop: 14 }}>
            <StepRow
              n={1}
              title="Aktivasi Google Cloud Billing"
              desc="Klik tombol di bawah → klik 'Add Billing Account' di halaman yang muncul → pilih Indonesia → masukkan kartu debit/kredit. Google hanya memotong sekitar Rp15.000 untuk verifikasi dan akan dikembalikan."
              cta="Buka Google Cloud Billing"
              onClick={() => openExternal(GEMINI_LINKS.paidBilling)}
            />
            <StepRow
              n={2}
              title="Buat API Key Berbayar"
              desc="Setelah billing aktif, kembali ke Google AI Studio. API key yang Anda buat di sana akan otomatis terhubung dengan akun penagihan."
              cta="Buka Google AI Studio"
              onClick={() => openExternal(GEMINI_LINKS.freeKey)}
            />
            <StepRow
              n={3}
              title="Tempel di BizCast"
              desc="Copy API key dari Google AI Studio, lalu tempel di kolom di atas. Klik 'Cek API Key' untuk verifikasi."
              cta={null}
            />
          </Panel>
        </>
      )}

      {/* Continue button — muncul setelah key tervalidasi */}
      {state.gateway.gemini.validated && (
        <Button
          variant="primary"
          onClick={handleContinue}
          style={{
            width: "100%",
            padding: "14px 24px",
            fontSize: 14,
            marginTop: 20,
          }}
        >
          Lanjut ke Dasbor Utama →
        </Button>
      )}
    </GatewayShell>
  );
}

// ============================================================================
// SUB-COMPONENTS internal — hanya dipakai di file ini
// ============================================================================

function KeyTypeCard({ label, tagline, desc, badge, badgeColor, badgeBg, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: "left",
        padding: "18px 20px",
        background: COLORS.bgPanelDeep,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = badgeColor;
        e.currentTarget.style.background = COLORS.bgPanel;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = COLORS.border;
        e.currentTarget.style.background = COLORS.bgPanelDeep;
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 10,
            padding: "3px 8px",
            background: badgeBg,
            color: badgeColor,
            borderRadius: 3,
            letterSpacing: "0.1em",
            fontWeight: 700,
          }}
        >
          {badge}
        </span>
        <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: COLORS.textHi }}>
          {label}
        </h3>
      </div>
      <div style={{ fontSize: 12, color: badgeColor, marginBottom: 4, fontStyle: "italic" }}>
        {tagline}
      </div>
      <div style={{ fontSize: 12, color: COLORS.textSoft, lineHeight: 1.5 }}>{desc}</div>
    </button>
  );
}

function Panel({ title, children, style }) {
  return (
    <div
      style={{
        background: COLORS.bgPanelDeep,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
        padding: 16,
        ...style,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: COLORS.textHi,
          marginBottom: 12,
          letterSpacing: "0.02em",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function SectionTitle({ children, color }) {
  return (
    <div
      style={{
        fontSize: 11,
        letterSpacing: "0.2em",
        color: color || COLORS.accent,
        fontFamily: "monospace",
        marginBottom: 14,
        fontWeight: 700,
      }}
    >
      ◆ {children}
    </div>
  );
}

function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "transparent",
        border: "none",
        color: COLORS.textSoft,
        fontSize: 12,
        cursor: "pointer",
        padding: 0,
        marginBottom: 14,
        fontFamily: "inherit",
      }}
    >
      ← Kembali pilih jenis key
    </button>
  );
}

function InfoBox({ children }) {
  return (
    <div
      style={{
        padding: "12px 14px",
        background: COLORS.infoBg,
        border: `1px solid ${COLORS.infoBorder}`,
        borderRadius: 8,
        fontSize: 12,
        color: COLORS.info,
        lineHeight: 1.55,
      }}
    >
      {children}
    </div>
  );
}

function ResultBanner({ result }) {
  const ok = result.ok;
  return (
    <div
      style={{
        marginTop: 10,
        padding: "10px 12px",
        borderRadius: 6,
        background: ok ? COLORS.successBg : COLORS.dangerBg,
        color: ok ? COLORS.successHi : COLORS.dangerHi,
        border: `1px solid ${ok ? COLORS.successBorder : COLORS.dangerBorder}`,
        fontSize: 11.5,
        lineHeight: 1.5,
      }}
    >
      {ok ? "✓ " : "✗ "}
      {result.msg || result.error}
    </div>
  );
}

function StepRow({ n, title, desc, cta, onClick }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        padding: "12px 0",
        borderBottom: `1px dashed ${COLORS.border}`,
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: COLORS.accentBg,
          color: COLORS.accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
          fontWeight: 700,
          fontSize: 13,
        }}
      >
        {n}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.textHi, marginBottom: 4 }}>
          {title}
        </div>
        <div style={{ fontSize: 11.5, color: COLORS.textSoft, lineHeight: 1.55, marginBottom: cta ? 8 : 0 }}>
          {desc}
        </div>
        {cta && (
          <Button variant="secondary" onClick={onClick} style={{ fontSize: 11.5, padding: "7px 14px" }}>
            {cta} →
          </Button>
        )}
      </div>
    </div>
  );
}

function GuidePopup({ title, steps, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.bgPanel,
          border: `1px solid ${COLORS.borderHi}`,
          borderRadius: 12,
          padding: 28,
          maxWidth: 440,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700, color: COLORS.textHi }}>
          {title}
        </h3>
        <ol style={{ margin: 0, padding: "0 0 0 22px", fontSize: 13, color: COLORS.text, lineHeight: 1.7 }}>
          {steps.map((s, i) => (
            <li key={i} style={{ marginBottom: 10 }}>
              {s}
            </li>
          ))}
        </ol>
        <Button variant="ghost" onClick={onClose} style={{ marginTop: 18, width: "100%" }}>
          Sudah paham, tutup
        </Button>
      </div>
    </div>
  );
}
