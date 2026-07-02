import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { makeInitialState, nextGatewayStep } from "./initialState.js";
import { getDefaultRoute, getPathway, remapRouteForStage } from "../data/pathways.js";

// ============================================================================
// APP CONTEXT
// Single source of truth untuk seluruh state aplikasi.
//
// Pola sama dengan prototype lama (createContext + useContext + structuredClone
// untuk immutability), tapi dipecah ke modul tersendiri.
// ============================================================================

const Ctx = createContext(null);

/** Hook utama untuk mengakses state & setter dari komponen mana pun */
export const useApp = () => {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useApp() harus dipanggil di dalam <AppProvider>.");
  }
  return ctx;
};

/**
 * Provider — bungkus root aplikasi dengan ini.
 *
 * API yang di-expose:
 *   - state              : seluruh state
 *   - update(path, val)  : update nested path dengan string dotted
 *                          contoh: update("gateway.loggedIn", true)
 *   - patch(path, obj)   : merge object ke nested path
 *                          contoh: patch("gateway.gemini", {key: "xxx..."})
 *   - resetGateway()     : kembali ke step login (juga reset nav)
 *   - advanceGateway()   : pindah ke step berikutnya berdasarkan state.
 *                          Saat masuk "done", nav auto-set ke defaultRoute.
 *   - navigate(tabId, subtabId?) : pindah tab/sub-tab. Jika subtabId tidak
 *                                  diberikan, otomatis ambil sub-tab pertama.
 */
export function AppProvider({ children }) {
  const [state, setState] = useState(makeInitialState);

  // ----- Update generik dengan dotted path -----
  const update = useCallback((path, val) => {
    setState((prev) => {
      const next = structuredClone(prev);
      const keys = path.split(".");
      let cursor = next;
      for (let i = 0; i < keys.length - 1; i++) {
        if (cursor[keys[i]] == null) cursor[keys[i]] = {};
        cursor = cursor[keys[i]];
      }
      cursor[keys[keys.length - 1]] = val;
      return next;
    });
  }, []);

  // ----- Patch object ke nested path -----
  const patch = useCallback((path, obj) => {
    setState((prev) => {
      const next = structuredClone(prev);
      const keys = path.split(".");
      let cursor = next;
      for (let i = 0; i < keys.length - 1; i++) {
        if (cursor[keys[i]] == null) cursor[keys[i]] = {};
        cursor = cursor[keys[i]];
      }
      const last = keys[keys.length - 1];
      cursor[last] = { ...(cursor[last] || {}), ...obj };
      return next;
    });
  }, []);

  // ----- Gateway helpers -----
  const resetGateway = useCallback(() => {
    setState((prev) => ({
      ...prev,
      gateway: makeInitialState().gateway,
      nav: null,
    }));
  }, []);

  const advanceGateway = useCallback(() => {
    setState((prev) => {
      const nextStep = nextGatewayStep(prev.gateway);
      let nav = prev.nav;
      // Auto-init nav saat gateway selesai → langsung punya tab default
      if (nextStep === "done" && !nav) {
        nav = getDefaultRoute(prev.app?.businessStage || "baru");
      }
      return {
        ...prev,
        gateway: { ...prev.gateway, step: nextStep },
        nav,
      };
    });
  }, []);

  // ----- Refactor v13: ganti jenis bisnis (baru ↔ lanjutan) dari dasbor -----
  // Mengganti stage TIDAK menghapus data form — user bebas bolak-balik.
  // Nav otomatis di-remap agar tetap valid pada struktur tab stage baru.
  const setBusinessStage = useCallback((stage) => {
    setState((prev) => {
      if (stage !== "baru" && stage !== "lanjutan") return prev;
      if (prev.app?.businessStage === stage) return prev;
      return {
        ...prev,
        app: { ...prev.app, businessStage: stage },
        nav: remapRouteForStage(stage, prev.nav),
      };
    });
  }, []);

  // ----- Navigation helper -----
  const navigate = useCallback((tabId, subtabId) => {
    setState((prev) => {
      const pathway = getPathway(prev.app?.businessStage || "baru");
      const tab = pathway.tabs.find((t) => t.id === tabId);
      if (!tab) return prev;
      // Jika subtabId tidak diberikan → ambil sub-tab pertama dari tab tsb
      const finalSubtabId = subtabId || tab.subtabs[0]?.id;
      return { ...prev, nav: { tabId, subtabId: finalSubtabId } };
    });
  }, []);

  const value = useMemo(
    () => ({ state, update, patch, resetGateway, advanceGateway, navigate, setBusinessStage }),
    [state, update, patch, resetGateway, advanceGateway, navigate, setBusinessStage]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
