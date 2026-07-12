"use client";

import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured } from "./supabaseClient";
import {
  fetchClusters,
  fetchDistricts,
  fetchMainTypes,
  fetchProvinces,
  fetchSubTypes,
} from "./api";

const EMPTY = { provinces: [], districts: [], clusters: [], mainTypes: [], subTypes: [] };

export function useReferenceData() {
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [provinces, districts, clusters, mainTypes, subTypes] = await Promise.all([
        fetchProvinces(),
        fetchDistricts(),
        fetchClusters(),
        fetchMainTypes(),
        fetchSubTypes(),
      ]);
      setData({ provinces, districts, clusters, mainTypes, subTypes });
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const provinceName = (id) => data.provinces.find((p) => p.id === id)?.name || "";
  const districtName = (id) => data.districts.find((d) => d.id === id)?.name || "";
  const clusterName = (id) => data.clusters.find((c) => c.id === id)?.name || "";
  const mainTypeName = (id) => data.mainTypes.find((m) => m.id === id)?.name || "";
  const subTypeName = (id) => data.subTypes.find((s) => s.id === id)?.name || "";
  const districtsFor = (provinceId) => data.districts.filter((d) => d.province_id === provinceId);
  const subTypesFor = (mainId) => data.subTypes.filter((s) => s.main_id === mainId);

  return {
    ...data,
    loading,
    error,
    reload,
    provinceName,
    districtName,
    clusterName,
    mainTypeName,
    subTypeName,
    districtsFor,
    subTypesFor,
  };
}
