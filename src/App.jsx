import { AppProvider, useApp } from "./state/AppContext.jsx";
import GatewayFlow from "./components/gateway/GatewayFlow.jsx";
import AppShell from "./components/shell/AppShell.jsx";

// ============================================================================
// <App /> — root komponen BizCast v5
//
// Logic sederhana:
//   - Bungkus seluruh aplikasi dengan <AppProvider>
//   - Jika gateway belum "done" → render <GatewayFlow />
//   - Jika gateway sudah "done" → render <AppShell />
//
// AppShell (Tahap 3) menggantikan ShellPlaceholder yang dipakai di Tahap 1-2.
// ============================================================================

export default function App() {
  return (
    <AppProvider>
      <RootSwitch />
    </AppProvider>
  );
}

function RootSwitch() {
  const { state } = useApp();
  const isGatewayDone = state.gateway.step === "done";

  if (!isGatewayDone) return <GatewayFlow />;
  return <AppShell />;
}
