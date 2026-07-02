import { COLORS } from "../primitives/styles.js";
import RupiahInput from "./RupiahInput.jsx";
import { formatRp, formatRpFull } from "../../utils/format.js";

// ============================================================================
// <SmartFundingBalance /> — Bab 7.3 dengan auto-balance & cash surplus logic
//
// Fitur cerdas sesuai Dokumen 3:
//   - Total kebutuhan dihitung otomatis dari Bab 7.1 + 7.2
//   - User isi sumber dana (Pribadi / Mitra / Pinjaman)
//   - Sistem cek selisih:
//       * Kurang  → peringatan merah "Tambahkan di pribadi/pinjaman"
//       * Pas     → "Neraca seimbang"
//       * Lebih   → "Kelebihan otomatis jadi Kas Cadangan"
//
// Format value:
//   {
//     modalPribadi: number,
//     modalMitra:   number,
//     modalPinjaman: number,
//   }
//
// Props:
//   - value, onChange
//   - totalNeeded : number — total kebutuhan modal dari Bab 7.1 + 7.2
// ============================================================================

export default function SmartFundingBalance({ value = {}, onChange, totalNeeded = 0 }) {
  const { modalPribadi = 0, modalMitra = 0, modalPinjaman = 0 } = value;
  const totalFunding = modalPribadi + modalMitra + modalPinjaman;
  const diff = totalFunding - totalNeeded;

  const update = (field, v) => {
    onChange?.({ ...value, [field]: v });
  };

  // Status balance — perhitungan EKSAK (v13.1).
  // Dulu ada toleransi Rp 1 juta yang membuat tampilan rancu: angka ringkas
  // "Rp 139,5 jt" terlihat sama tetapi status bilang kurang/seimbang secara
  // tidak konsisten. Sekarang: selisih dihitung rupiah-per-rupiah dan SELALU
  // ditampilkan dalam angka penuh, plus tombol penyeimbang otomatis.
  let status;
  if (totalFunding === 0 && totalNeeded > 0) {
    status = { kind: "empty", label: "Belum diisi", color: COLORS.textMuted };
  } else if (diff === 0) {
    status = { kind: "pas", label: "Neraca Seimbang", color: COLORS.success };
  } else if (diff < 0) {
    status = { kind: "kurang", label: "Dana Kurang", color: COLORS.danger };
  } else {
    status = { kind: "surplus", label: "Ada Kelebihan", color: COLORS.warn };
  }

  // Penyeimbang otomatis: selisih kekurangan ditambahkan ke Modal Pribadi
  // (atau jika ada pinjaman, ke pinjaman) sampai persis seimbang.
  const autoBalance = () => {
    if (diff >= 0) return;
    const shortfall = -diff;
    if (modalPinjaman > 0) onChange?.({ ...value, modalPinjaman: modalPinjaman + shortfall });
    else onChange?.({ ...value, modalPribadi: modalPribadi + shortfall });
  };

  return (
    <div>
      {/* Total kebutuhan indicator */}
      <div
        style={{
          background: COLORS.bgPanelHi,
          border: `1px solid ${COLORS.accent}`,
          borderRadius: 10,
          padding: 16,
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            flexShrink: 0,
            width: 36,
            height: 36,
            borderRadius: 8,
            background: COLORS.accentBg,
            color: COLORS.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
          }}
        >
          ◆
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.15em",
              color: COLORS.accent,
              fontFamily: "monospace",
              fontWeight: 700,
              marginBottom: 2,
            }}
          >
            TOTAL MODAL YANG ANDA BUTUHKAN (BAB 7.1 + 7.2)
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              fontFamily: "monospace",
              color: COLORS.textHi,
            }}
          >
            {formatRp(totalNeeded)}
          </div>
          <div
            style={{
              fontSize: 10,
              fontFamily: "monospace",
              color: COLORS.textMuted,
              marginTop: 2,
            }}
          >
            ({formatRpFull(totalNeeded)})
          </div>
        </div>
      </div>

      {/* 3 sumber dana */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
        <FundingRow
          icon="👤"
          label="Modal Pribadi Anda"
          desc="Uang dari kantong sendiri yang dimasukkan ke bisnis"
          value={modalPribadi}
          onChange={(v) => update("modalPribadi", v)}
        />
        <FundingRow
          icon="🤝"
          label="Dana dari Mitra/Investor"
          desc="Titipan modal dari keluarga atau teman selaku mitra bisnis"
          value={modalMitra}
          onChange={(v) => update("modalMitra", v)}
        />
        <FundingRow
          icon="🏦"
          label="Pinjaman Bank / Pihak Lain"
          desc="Dana pinjaman atau KUR untuk tambahan modal"
          value={modalPinjaman}
          onChange={(v) => update("modalPinjaman", v)}
        />
      </div>

      {/* Balance summary */}
      <BalanceSummary
        totalFunding={totalFunding}
        totalNeeded={totalNeeded}
        diff={diff}
        status={status}
        onAutoBalance={autoBalance}
      />
    </div>
  );
}

function FundingRow({ icon, label, desc, value, onChange }) {
  return (
    <div
      style={{
        background: COLORS.bgPanelDeep,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
        padding: 14,
        display: "grid",
        gridTemplateColumns: "auto 1fr 1.2fr",
        gap: 14,
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: COLORS.bgPanel,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textHi }}>{label}</div>
        <div style={{ fontSize: 11, color: COLORS.textSoft, marginTop: 2 }}>{desc}</div>
      </div>
      <RupiahInput value={value} onChange={onChange} />
    </div>
  );
}

function BalanceSummary({ totalFunding, totalNeeded, diff, status, onAutoBalance }) {
  const surplus = Math.max(diff, 0);
  const shortage = Math.max(-diff, 0);
  const pctFilled = totalNeeded > 0 ? Math.min(totalFunding / totalNeeded, 1) : 0;

  return (
    <div
      style={{
        background: `${status.color}11`,
        border: `1px solid ${status.color}`,
        borderRadius: 10,
        padding: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <span
          style={{
            padding: "4px 10px",
            background: status.color,
            color: COLORS.bg,
            borderRadius: 4,
            fontSize: 10,
            fontFamily: "monospace",
            fontWeight: 700,
            letterSpacing: "0.1em",
          }}
        >
          {status.label.toUpperCase()}
        </span>
        <span style={{ flex: 1 }} />
        <span
          style={{
            fontSize: 11,
            color: COLORS.textMuted,
            fontFamily: "monospace",
          }}
        >
          {formatRpFull(totalFunding)} / {formatRpFull(totalNeeded)}
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 8,
          background: COLORS.bgPanelDeep,
          borderRadius: 4,
          overflow: "hidden",
          marginBottom: 12,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${pctFilled * 100}%`,
            background: status.color,
            transition: "all 0.3s",
          }}
        />
      </div>

      {/* Message per status */}
      {status.kind === "kurang" && (
        <div>
          <p style={{ fontSize: 12.5, color: COLORS.dangerHi, lineHeight: 1.6, margin: "0 0 8px" }}>
            ⚠ Dana Anda <strong>kurang persis {formatRpFull(shortage)}</strong>. Tambahkan pada kolom Modal Pribadi atau Pinjaman Bank — atau klik tombol di bawah.
          </p>
          <button type="button" onClick={onAutoBalance} style={{
            padding: "7px 12px", background: "transparent", border: `1px solid ${COLORS.danger}`,
            borderRadius: 6, fontSize: 11.5, fontWeight: 700, color: COLORS.dangerHi, cursor: "pointer",
          }}>
            ⚖ Seimbangkan Otomatis (+{formatRpFull(shortage)})
          </button>
        </div>
      )}
      {status.kind === "surplus" && (
        <p style={{ fontSize: 12.5, color: COLORS.warnHi, lineHeight: 1.6, margin: 0 }}>
          💰 Ada kelebihan persis <strong>{formatRpFull(surplus)}</strong> yang otomatis dicatat sebagai <strong>Kas Cadangan (Cash Required)</strong> di rekening bisnis — neraca awal langsung seimbang.
        </p>
      )}
      {status.kind === "pas" && (
        <p style={{ fontSize: 12.5, color: COLORS.successHi, lineHeight: 1.6, margin: 0 }}>
          ✓ Total pendanaan tepat menutupi kebutuhan modal. Neraca awal langsung seimbang tanpa kas cadangan tambahan.
        </p>
      )}
      {status.kind === "empty" && (
        <p style={{ fontSize: 12.5, color: COLORS.textSoft, lineHeight: 1.6, margin: 0 }}>
          Mulai isi salah satu sumber dana di atas. Sistem akan menghitung selisihnya otomatis.
        </p>
      )}
    </div>
  );
}
