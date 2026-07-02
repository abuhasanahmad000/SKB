import { useEffect, useMemo, useState } from "react";
import { useFormSection } from "../../../state/useFormSection.js";
import { useApp } from "../../../state/AppContext.jsx";
import Section from "../Section.jsx";
import RupiahInput from "../RupiahInput.jsx";
import NumberInput from "../NumberInput.jsx";
import SmartFundingBalance from "../SmartFundingBalance.jsx";
import { aiAutofill } from "../../../services/geminiService.js";
import { COLORS } from "../../primitives/styles.js";
import { formatRp, formatRpFull } from "../../../utils/format.js";
import {
  getInvestmentCategories,
  makeItem,
  itemTotal,
  sumByCategory,
  totalInvestmentItems,
  equipmentTotal,
  deriveAggregates,
  suggestInvestmentItems,
  buildAiInvestmentPrompt,
} from "../../../engines/investmentHelper.js";

// ============================================================================
// <InitialInvestmentForm /> — Tab Keuangan ▸ Initial Investment (v13.1)
//
// Menggantikan "Anggaran Modal Awal" + "Use of Funds" lama (keduanya hal yang
// sama). Rincian per item dengan kategori stage-aware, rekomendasi rule-based
// (harga pasar riil per sektor + UMK daerah) dan rekomendasi AI, lalu ditutup
// Smart Balance Check sumber dana (Bab 7.3).
//
// Agregat lama (expenses/assets) di-SYNC otomatis lewat useEffect supaya
// financialEngine, scoringEngine, dan narrativeEngine tetap akurat.
// ============================================================================

export default function InitialInvestmentForm({ stage = "baru" }) {
  const [f, setField] = useFormSection("modal");
  const { state } = useApp();
  const items = f.investmentItems || [];
  const categories = getInvestmentCategories(stage);

  const byCat = useMemo(() => sumByCategory(items), [items]);
  const eqTotal = equipmentTotal(state.forms);
  const grandTotal = totalInvestmentItems(items) + eqTotal;

  // ---- SYNC agregat lama (single source of truth = investmentItems) ----
  useEffect(() => {
    const agg = deriveAggregates(items);
    const cur = { e: f.expenses || {}, a: f.assets || {} };
    const changed =
      (cur.e.legal || 0) !== agg.expenses.legal ||
      (cur.e.renovasi || 0) !== agg.expenses.renovasi ||
      (cur.e.promo || 0) !== agg.expenses.promo ||
      (cur.e.lainnya || 0) !== agg.expenses.lainnya ||
      (cur.a.stok || 0) !== agg.assets.stok;
    if (items.length > 0 && changed) {
      setField("expenses", { ...cur.e, ...agg.expenses });
      setField("assets", { ...cur.a, ...agg.assets });
    }
  }, [items]); // eslint-disable-line

  const setItems = (next) => setField("investmentItems", next);
  const updateItem = (id, patch) =>
    setItems(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const removeItem = (id) => setItems(items.filter((it) => it.id !== id));
  const addItem = (category) => setItems([...items, makeItem(category, "", 1, 0)]);

  return (
    <>
      <Section
        icon="①"
        title={stage === "lanjutan" ? "Initial Investment — Modal Pengembangan (Bab 7.1–7.2)" : "Initial Investment — Modal Awal Bisnis Baru (Bab 7.1–7.2)"}
        desc={stage === "lanjutan"
          ? "Rincian kebutuhan dana TAMBAHAN untuk pengembangan — hanya yang baru, bukan yang sudah dimiliki bisnis. Rincian ini otomatis menjadi Use of Funds di laporan."
          : "Rincian lengkap kebutuhan dana sebelum bisnis buka. Setiap baris bisa diedit. Rincian ini otomatis menjadi Use of Funds yang dibaca bank/investor di laporan."}
      >
        <RecommendationBar stage={stage} forms={state.forms} apiKey={state.gateway?.gemini?.key} model={state.gateway?.gemini?.model} onApply={setItems} hasItems={items.length > 0} />

        {categories.map((cat) => (
          <CategoryBlock
            key={cat.id}
            cat={cat}
            items={items.filter((it) => it.category === cat.id)}
            subtotal={byCat[cat.id] || 0}
            onAdd={() => addItem(cat.id)}
            onUpdate={updateItem}
            onRemove={removeItem}
          />
        ))}

        {/* Peralatan: daftar terperinci read-only, otomatis dari Alat & Karyawan */}
        <EquipmentReadOnly equipment={state.forms?.alatSDM?.equipment || []} total={eqTotal} />

        {/* Grand total */}
        <div style={grandTotalStyle}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.18em", fontFamily: "monospace", fontWeight: 700, color: COLORS.accent }}>
              TOTAL INITIAL INVESTMENT
            </div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
              Rincian item + peralatan otomatis. Angka inilah kebutuhan dana di Bab 7 laporan.
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "monospace", color: COLORS.textHi }}>{formatRp(grandTotal)}</div>
            <div style={{ fontSize: 10.5, fontFamily: "monospace", color: COLORS.textMuted }}>{formatRpFull(grandTotal)}</div>
          </div>
        </div>
      </Section>

      <Section
        icon="②"
        title="Sumber Dana — Smart Balance Check (Bab 7.3)"
        desc={stage === "lanjutan"
          ? "Komposisi pendanaan pengembangan: kas internal bisnis + dana eksternal yang diajukan. Total sumber dana harus persis menutup Initial Investment di atas."
          : "Komposisi sumber dana: modal sendiri + pinjaman/investor yang diajukan. Porsi modal sendiri menunjukkan komitmen Anda di mata pendana."}
      >
        <SmartFundingBalance
          value={f.funding || {}}
          onChange={(v) => setField("funding", v)}
          totalNeeded={grandTotal}
        />
      </Section>
    </>
  );
}

// ----------------------------------------------------------------------------
// Daftar Peralatan Kerja Utama — read-only, otomatis dari sub-tab Alat & Karyawan
// ----------------------------------------------------------------------------
function EquipmentReadOnly({ equipment, total }) {
  return (
    <div style={{ marginTop: 4, marginBottom: 14, border: `1px solid ${COLORS.infoBorder}`, borderRadius: 10, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: COLORS.bgPanelHi, borderLeft: `3px solid ${COLORS.info}` }}>
        <span style={{ fontSize: 16 }}>⚙️</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.12em", color: COLORS.info, fontFamily: "monospace", fontWeight: 700 }}>
            🔗 OTOMATIS DARI "KESIAPAN ALAT & KARYAWAN"
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.textHi }}>Daftar Peralatan Kerja Utama</div>
          <div style={{ fontSize: 10.5, color: COLORS.textSoft }}>Diisi di tab Formulir — di sini hanya ditampilkan agar tidak input dua kali.</div>
        </div>
        <div style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 800, color: total > 0 ? COLORS.successHi : COLORS.textMuted }}>
          {formatRp(total)}
        </div>
      </div>
      {equipment.length > 0 ? (
        <div style={{ padding: "8px 12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 150px 110px", gap: 8, fontSize: 9.5, color: COLORS.textMuted, fontFamily: "monospace", letterSpacing: "0.08em", padding: "0 2px 4px" }}>
            <span>NAMA PERALATAN</span><span>QTY</span><span>HARGA SATUAN</span><span style={{ textAlign: "right" }}>SUBTOTAL</span>
          </div>
          {equipment.map((e, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 70px 150px 110px", gap: 8, alignItems: "center", padding: "5px 2px", borderBottom: `1px dashed ${COLORS.border}` }}>
              <span style={{ fontSize: 12, color: COLORS.text }}>{e.name || `Peralatan ${i + 1}`}</span>
              <span style={{ fontSize: 12, fontFamily: "monospace", color: COLORS.textSoft }}>{e.qty || 0}×</span>
              <span style={{ fontSize: 12, fontFamily: "monospace", color: COLORS.textSoft }}>{formatRp(e.pricePerUnit || 0)}</span>
              <span style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: COLORS.textHi, textAlign: "right" }}>{formatRp((e.qty || 0) * (e.pricePerUnit || 0))}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: "10px 14px", fontSize: 11.5, color: COLORS.textMuted }}>
          ⓘ Belum ada peralatan. Isi di tab <strong>Formulir ▸ Kesiapan Alat &amp; Karyawan</strong> — daftarnya akan muncul di sini otomatis.
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Rekomendasi rule-based + AI
// ----------------------------------------------------------------------------
function RecommendationBar({ stage, forms, apiKey, model, onApply, hasItems }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const ready = !!(forms?.identitas?.sectorCode && forms?.identitas?.skalaBisnis);

  const applyRuleBased = () => {
    const res = suggestInvestmentItems(forms, stage);
    if (!res) {
      setMsg({ kind: "warn", text: "Isi dulu sektor & skala bisnis di sub-tab Profil Bisnis." });
      return;
    }
    onApply(res.items);
    setMsg({ kind: "ok", text: `✓ ${res.items.length} item rekomendasi sektor ${res.sectorName} diterapkan — harga pasar + UMK daerah Anda. Silakan sesuaikan.` });
  };

  const applyAi = async () => {
    if (!apiKey) { setMsg({ kind: "warn", text: "API key Gemini belum di-setup." }); return; }
    setBusy(true); setMsg(null);
    try {
      const result = await aiAutofill(apiKey, buildAiInvestmentPrompt(forms, stage), model, { json: true, maxTokens: 6000, temperature: 0.6 });
      if (!result.ok || !result.text) throw new Error(result.error || "AI tidak merespons.");
      const raw = result.text.replace(/```json|```/g, "").trim();
      const start = raw.indexOf("["); const end = raw.lastIndexOf("]");
      const arr = JSON.parse(raw.slice(start, end + 1));
      const validCats = new Set(getInvestmentCategories(stage).map((c) => c.id));
      const items = arr
        .filter((x) => x && validCats.has(x.category) && x.name)
        .map((x) => makeItem(x.category, String(x.name).slice(0, 90), Number(x.qty) || 1, Number(x.unitPrice) || 0));
      if (items.length === 0) throw new Error("AI tidak mengembalikan item valid.");
      onApply(items);
      setMsg({ kind: "ok", text: `✓ ${items.length} item rekomendasi AI (harga pasar riil sesuai sektor & daerah) diterapkan. Silakan periksa & sesuaikan.` });
    } catch (e) {
      setMsg({ kind: "warn", text: `Gagal memproses rekomendasi AI: ${e.message}` });
    }
    setBusy(false);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button type="button" onClick={applyRuleBased} disabled={!ready} style={recBtnStyle(ready)}>
          ✨ Rekomendasi Cepat (Data Pasar + UMK Daerah)
        </button>
        <button type="button" onClick={applyAi} disabled={busy || !ready} style={recBtnStyle(ready && !busy, true)}>
          {busy ? "⏳ AI sedang menyusun rincian..." : "🪄 Rekomendasi AI (Harga Riil Sesuai Sektor & Daerah)"}
        </button>
      </div>
      {hasItems && (
        <div style={{ fontSize: 10.5, color: COLORS.textMuted, marginTop: 6 }}>
          ⚠ Menerapkan rekomendasi akan menimpa rincian yang ada sekarang.
        </div>
      )}
      {msg && (
        <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 6, fontSize: 12, lineHeight: 1.5,
          background: msg.kind === "ok" ? `${COLORS.success}15` : `${COLORS.warn}15`,
          border: `1px solid ${msg.kind === "ok" ? COLORS.success : COLORS.warn}`,
          color: msg.kind === "ok" ? COLORS.successHi : COLORS.warnHi }}>
          {msg.text}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Blok kategori + tabel item
// ----------------------------------------------------------------------------
function CategoryBlock({ cat, items, subtotal, onAdd, onUpdate, onRemove }) {
  return (
    <div style={{ marginBottom: 14, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: COLORS.bgPanelDeep }}>
        <span style={{ fontSize: 16 }}>{cat.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.textHi }}>{cat.label}</div>
          <div style={{ fontSize: 10.5, color: COLORS.textSoft }}>{cat.hint}</div>
        </div>
        <div style={{ fontSize: 13, fontFamily: "monospace", fontWeight: 800, color: subtotal > 0 ? COLORS.successHi : COLORS.textMuted }}>
          {formatRp(subtotal)}
        </div>
        <button type="button" onClick={onAdd} style={addBtnStyle}>+ Baris</button>
      </div>

      {items.length > 0 && (
        <div style={{ padding: "8px 12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 150px 110px 28px", gap: 8, fontSize: 9.5, color: COLORS.textMuted, fontFamily: "monospace", letterSpacing: "0.08em", padding: "0 2px 4px" }}>
            <span>NAMA ITEM (BARANG/JASA)</span><span>QTY</span><span>HARGA SATUAN</span><span style={{ textAlign: "right" }}>SUBTOTAL</span><span />
          </div>
          {items.map((it) => (
            <div key={it.id} style={{ display: "grid", gridTemplateColumns: "1fr 80px 150px 110px 28px", gap: 8, alignItems: "center", marginBottom: 6 }}>
              <input
                value={it.name}
                onChange={(e) => onUpdate(it.id, { name: e.target.value })}
                placeholder="cth. Akta pendirian PT Perorangan (notaris)"
                style={itemInputStyle}
              />
              <NumberInput value={it.qty || 1} onChange={(v) => onUpdate(it.id, { qty: v })} min={1} max={9999} />
              <RupiahInput value={it.unitPrice || 0} onChange={(v) => onUpdate(it.id, { unitPrice: v })} />
              <div style={{ textAlign: "right", fontSize: 12, fontFamily: "monospace", fontWeight: 700, color: COLORS.text }}>{formatRp(itemTotal(it))}</div>
              <button type="button" onClick={() => onRemove(it.id)} title="Hapus baris" style={delBtnStyle}>✕</button>
            </div>
          ))}
          {items.some((it) => it.note) && (
            <div style={{ fontSize: 10.5, color: COLORS.textMuted, padding: "2px 2px 4px" }}>
              ⓘ {items.find((it) => it.note)?.note}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
const recBtnStyle = (enabled, accent = false) => ({
  padding: "9px 14px",
  background: accent ? COLORS.accentBg : "transparent",
  border: `1px solid ${enabled ? (accent ? COLORS.accent : COLORS.successHi) : COLORS.border}`,
  borderRadius: 7,
  fontSize: 12,
  fontWeight: 700,
  color: enabled ? (accent ? COLORS.accent : COLORS.successHi) : COLORS.textMuted,
  cursor: enabled ? "pointer" : "not-allowed",
});

const addBtnStyle = {
  padding: "5px 10px", background: "transparent", border: `1px solid ${COLORS.borderHi}`,
  borderRadius: 5, fontSize: 11, fontWeight: 700, color: COLORS.textSoft, cursor: "pointer",
};

const delBtnStyle = {
  width: 26, height: 26, background: "transparent", border: `1px solid ${COLORS.border}`,
  borderRadius: 5, fontSize: 11, color: COLORS.textMuted, cursor: "pointer",
};

// v13.4: input nama item dibuat GELAP agar teks terbaca (sebelumnya
// background putih dengan warna teks tema gelap → tidak terlihat).
const itemInputStyle = {
  width: "100%", padding: "7px 10px", background: COLORS.bgPanelDeep, border: `1px solid ${COLORS.borderHi}`,
  borderRadius: 5, fontSize: 12, color: COLORS.textHi, outline: "none", boxSizing: "border-box",
};

const grandTotalStyle = {
  marginTop: 14, padding: "14px 18px", background: COLORS.bgPanelDeep,
  border: `2px solid ${COLORS.accentBorder}`, borderLeft: `4px solid ${COLORS.accent}`,
  borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14,
};
