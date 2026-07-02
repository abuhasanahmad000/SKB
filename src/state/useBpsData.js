import { useState, useEffect } from "react";
import { fetchSectorGrowth, fetchProvinceData } from "../services/bpsService.js";
import { getSector } from "../data/sectors.js";

// ============================================================================
// useBpsData — Hook untuk consume BPS data dengan caching otomatis
//
// Auto-fetch saat sectorCode atau provinceCode berubah.
// Mengembalikan: { sectorData, provinceData, isLoading, refresh }
//
// Untuk consume di IdentitasForm (badge data source), atau engine yang
// butuh BPS data terbaru.
// ============================================================================

export function useBpsData(sectorCode, provinceCode) {
  const [sectorData, setSectorData] = useState(null);
  const [provinceData, setProvinceData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function loadSector() {
      if (!sectorCode) {
        setSectorData(null);
        return;
      }
      const sector = getSector(sectorCode);
      if (!sector) return;
      setIsLoading(true);
      const data = await fetchSectorGrowth(sector.group);
      if (!cancelled) {
        setSectorData(data);
        setIsLoading(false);
      }
    }
    loadSector();
    return () => { cancelled = true; };
  }, [sectorCode, refreshTick]);

  useEffect(() => {
    let cancelled = false;
    async function loadProvince() {
      if (!provinceCode) {
        setProvinceData(null);
        return;
      }
      const data = await fetchProvinceData(provinceCode);
      if (!cancelled) setProvinceData(data);
    }
    loadProvince();
    return () => { cancelled = true; };
  }, [provinceCode, refreshTick]);

  const refresh = () => setRefreshTick((t) => t + 1);

  return { sectorData, provinceData, isLoading, refresh };
}
