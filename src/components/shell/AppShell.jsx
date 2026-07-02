import { useApp } from "../../state/AppContext.jsx";
import { COLORS } from "../primitives/styles.js";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import SubtabBar from "./SubtabBar.jsx";
import SubtabContent from "./SubtabContent.jsx";

// ============================================================================
// <AppShell /> — main layout setelah gateway selesai
//
// Layout:
//   ┌─────────────────────────────────────────────┐
//   │  Header (logo · jalur badge · user · ⚙)      │
//   ├─────────┬───────────────────────────────────┤
//   │         │  SubtabBar (sticky)               │
//   │ Sidebar ├───────────────────────────────────┤
//   │  (4 tab)│  SubtabContent                    │
//   │         │  (placeholder per sub-tab)        │
//   │         │                                   │
//   └─────────┴───────────────────────────────────┘
//
// Render terjadi hanya jika gateway.step === "done" DAN state.nav sudah terisi
// (di-set otomatis oleh AppContext saat advanceGateway() ke "done").
// ============================================================================

export default function AppShell() {
  const { state } = useApp();

  // Defensif: kalau nav belum siap (race condition), tampilkan loading dulu.
  if (!state.nav) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: COLORS.textSoft,
          fontSize: 13,
        }}
      >
        Menyiapkan dasbor…
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <Sidebar />
        <main
          style={{
            flex: 1,
            overflow: "auto",
            background: COLORS.bg,
          }}
        >
          <SubtabBar />
          <SubtabContent />
        </main>
      </div>
    </div>
  );
}
