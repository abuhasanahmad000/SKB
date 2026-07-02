import { useState } from "react";
import { useApp } from "../../state/AppContext.jsx";
import { COLORS } from "../primitives/styles.js";
import Button from "../primitives/Button.jsx";
import Input from "../primitives/Input.jsx";
import GatewayShell from "./GatewayShell.jsx";

// ============================================================================
// <LoginGoogle /> — Step 1 Gateway (MOCK/STUB)
//
// Sesuai keputusan: tombol "Lanjut dengan Google" langsung lanjut.
// User cukup isi nama + email (opsional, untuk dipersonalisasi di laporan),
// lalu klik tombol → state.gateway.loggedIn = true.
//
// Production: ganti handleLogin dengan Google Identity Services / Firebase Auth.
// ============================================================================

export default function LoginGoogle() {
  const { state, patch, advanceGateway } = useApp();
  const [name, setName] = useState(state.gateway.user?.name || "");
  const [email, setEmail] = useState(state.gateway.user?.email || "");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = () => {
    setSubmitting(true);
    // Mock delay supaya terasa seperti autentikasi asli
    setTimeout(() => {
      patch("gateway", {
        loggedIn: true,
        user: {
          name: name.trim() || "Pengguna BizCast",
          email: email.trim() || "guest@bizcast.local",
          avatar: null,
        },
      });
      advanceGateway();
    }, 400);
  };

  return (
    <GatewayShell step={0}>
      {/* Logo & Tagline */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.3em",
            color: COLORS.textDim,
            fontFamily: "monospace",
            marginBottom: 8,
          }}
        >
          STUDI KELAYAKAN BISNIS &amp; RENCANA BISNIS
        </div>
        <div
          style={{
            fontSize: 42,
            fontWeight: 900,
            color: COLORS.accent,
            letterSpacing: "-1.5px",
            lineHeight: 1,
          }}
        >
          BizCast
        </div>
        <div
          style={{
            fontSize: 13,
            color: COLORS.textSoft,
            marginTop: 12,
            lineHeight: 1.6,
            maxWidth: 380,
            margin: "12px auto 0",
          }}
        >
          Platform cerdas untuk merancang Studi Kelayakan Bisnis &amp; Rencana Bisnis UMKM Indonesia.
        </div>
      </div>

      {/* Form sederhana */}
      <div style={{ marginBottom: 18 }}>
        <Label>Nama Lengkap</Label>
        <Input value={name} onChange={setName} placeholder="cth. Abu Hasan Ahmad" autoFocus />
      </div>
      <div style={{ marginBottom: 28 }}>
        <Label>
          Email <span style={{ color: COLORS.textMuted, fontWeight: 400 }}>(opsional)</span>
        </Label>
        <Input value={email} onChange={setEmail} type="email" placeholder="email@gmail.com" />
      </div>

      {/* Tombol Google Login (mock) */}
      <Button
        variant="primary"
        onClick={handleLogin}
        disabled={submitting}
        style={{
          width: "100%",
          padding: "14px 24px",
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <GoogleIcon />
        <span>{submitting ? "Menghubungkan…" : "Lanjut dengan Google"}</span>
      </Button>

      {/* Footer note */}
      <div
        style={{
          marginTop: 24,
          padding: "10px 14px",
          background: COLORS.warnBg,
          border: `1px solid ${COLORS.warnBorder}`,
          borderRadius: 6,
          fontSize: 11,
          color: COLORS.warnHi,
          lineHeight: 1.5,
        }}
      >
        ⓘ Mode Pengembangan: login Google adalah <strong>mock</strong>. Tombol di atas hanya
        menyimpan nama &amp; email yang Anda isi — tidak ada autentikasi nyata. Akan diganti OAuth
        Google di tahap produksi.
      </div>
    </GatewayShell>
  );
}

// ----- Helpers internal -----
function Label({ children }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: 12,
        color: COLORS.textMid,
        fontWeight: 600,
        marginBottom: 6,
      }}
    >
      {children}
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
      />
    </svg>
  );
}
