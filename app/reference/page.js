"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/I18nContext";
import { useReferenceData } from "@/lib/useReferenceData";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import {
  createCluster,
  createDistrict,
  createMainType,
  createProvince,
  createSubType,
  deleteCluster,
  deleteDistrict,
  deleteMainType,
  deleteProvince,
  deleteSubType,
} from "@/lib/api";
import { Card, ErrorState, LoadingState, PageHeader, SupabaseSetupNotice } from "@/components/ui";
import { ChildRefList, SimpleRefList } from "@/components/RefList";

export default function ReferencePage() {
  const { t } = useI18n();
  const ref = useReferenceData();
  const [tab, setTab] = useState("location");
  const [error, setError] = useState(null);
  const [districtParent, setDistrictParent] = useState("");
  const [clusterParent, setClusterParent] = useState("");
  const [subTypeParent, setSubTypeParent] = useState("");

  useEffect(() => {
    if (!districtParent && ref.provinces[0]) setDistrictParent(ref.provinces[0].id);
    if (!clusterParent && ref.districts[0]) setClusterParent(ref.districts[0].id);
    if (!subTypeParent && ref.mainTypes[0]) setSubTypeParent(ref.mainTypes[0].id);
  }, [ref.provinces, ref.districts, ref.mainTypes, districtParent, clusterParent, subTypeParent]);

  const guard = (fn) => async (...args) => {
    try {
      await fn(...args);
      await ref.reload();
    } catch (err) {
      setError(err.message || String(err));
    }
  };

  const tabs = [
    { id: "location", label: t("tabLocation") },
    { id: "types", label: t("tabTypes") },
  ];

  return (
    <div>
      <PageHeader title={t("pageTitleReference")} />
      <SupabaseSetupNotice />

      {!isSupabaseConfigured ? null : ref.loading ? (
        <LoadingState />
      ) : error || ref.error ? (
        <ErrorState message={error || ref.error} />
      ) : (
        <>
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-5 w-fit">
            {tabs.map((tb) => (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id)}
                className={`px-4 py-1.5 rounded-md text-[12.5px] font-semibold cursor-pointer transition-colors ${
                  tab === tb.id ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-muted)]"
                }`}
              >
                {tb.label}
              </button>
            ))}
          </div>

          {tab === "location" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <Card className="p-5">
                <SimpleRefList
                  title={t("provincesTitle")}
                  items={ref.provinces}
                  placeholder={t("newProvincePlaceholder")}
                  deleteLabel={t("deleteBtn")}
                  onAdd={guard((name) => createProvince(name))}
                  onDelete={guard((id) => deleteProvince(id))}
                />
              </Card>
              <Card className="p-5">
                <ChildRefList
                  title={t("districtsTitle")}
                  items={ref.districts}
                  parents={ref.provinces}
                  parentLabelFor={(item) => ref.provinceName(item.province_id)}
                  placeholder={t("newDistrictPlaceholder")}
                  deleteLabel={t("deleteBtn")}
                  selectedParentId={districtParent}
                  onSelectedParentChange={setDistrictParent}
                  onAdd={guard((provinceId, name) => createDistrict(provinceId, name))}
                  onDelete={guard((id) => deleteDistrict(id))}
                />
              </Card>
              <Card className="p-5">
                <ChildRefList
                  title={t("clustersTitle")}
                  items={ref.clusters}
                  parents={ref.districts}
                  parentLabelFor={(item) => ref.districtName(item.district_id)}
                  placeholder={t("newClusterPlaceholder")}
                  deleteLabel={t("deleteBtn")}
                  selectedParentId={clusterParent}
                  onSelectedParentChange={setClusterParent}
                  onAdd={guard((districtId, name) => createCluster(districtId, name))}
                  onDelete={guard((id) => deleteCluster(id))}
                />
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card className="p-5">
                <SimpleRefList
                  title={t("mainTypesTitle")}
                  items={ref.mainTypes}
                  placeholder={t("newMainTypePlaceholder")}
                  deleteLabel={t("deleteBtn")}
                  onAdd={guard((name) => createMainType(name))}
                  onDelete={guard((id) => deleteMainType(id))}
                />
              </Card>
              <Card className="p-5">
                <ChildRefList
                  title={t("subTypesTitle")}
                  items={ref.subTypes}
                  parents={ref.mainTypes}
                  parentLabelFor={(item) => ref.mainTypeName(item.main_id)}
                  placeholder={t("newSubTypePlaceholder")}
                  deleteLabel={t("deleteBtn")}
                  selectedParentId={subTypeParent}
                  onSelectedParentChange={setSubTypeParent}
                  onAdd={guard((mainId, name) => createSubType(mainId, name))}
                  onDelete={guard((id) => deleteSubType(id))}
                />
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
