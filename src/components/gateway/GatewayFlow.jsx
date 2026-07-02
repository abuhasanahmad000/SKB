import { useApp } from "../../state/AppContext.jsx";
import LoginGoogle from "./LoginGoogle.jsx";
import GeminiKeySetup from "./GeminiKeySetup.jsx";

// ============================================================================
// <GatewayFlow /> — orchestrator gateway (Refactor v13)
//
// Hanya 2 step: "login" → "apikey" → "done".
// Step "pathway" DIHAPUS — semua user adalah pencari dana; jenis bisnis
// (baru/lanjutan) dipilih di dasbor setelah masuk aplikasi.
// ============================================================================

export default function GatewayFlow() {
  const { state } = useApp();
  const step = state.gateway.step;

  switch (step) {
    case "login":
      return <LoginGoogle />;
    case "apikey":
      return <GeminiKeySetup />;
    default:
      return <LoginGoogle />;
  }
}
