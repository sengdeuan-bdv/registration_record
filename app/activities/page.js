"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/I18nContext";
import { useReferenceData } from "@/lib/useReferenceData";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import {
  createActivity,
  deleteActivity,
  fetchActivities,
  fetchParticipationCounts,
  updateActivity,
} from "@/lib/api";
import {
  Button,
  Card,
  ErrorState,
  LoadingState,
  PageHeader,
  SupabaseSetupNotice,
  TextInput,
} from "@/components/ui";
import ActivityModal from "@/components/ActivityModal";

export default function ActivitiesPage() {
  const { t } = useI18n();
  const ref = useReferenceData();
  const [activities, setActivities] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    setError(null);
    try {
      const [acts, cnt] = await Promise.all([fetchActivities(), fetchParticipationCounts()]);
      setActivities(acts);
      setCounts(cnt);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fmtDate = (iso) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };

  const filtered = activities.filter((a) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (a.code || "").toLowerCase().includes(q) || (a.name || "").toLowerCase().includes(q);
  });

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editingActivity) {
        await updateActivity(editingActivity.id, form);
      } else {
        await createActivity(form);
      }
      setModalOpen(false);
      setEditingActivity(null);
      await load();
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t("deleteBtn") + "?")) return;
    try {
      await deleteActivity(id);
      await load();
    } catch (err) {
      setError(err.message || String(err));
    }
  };

  return (
    <div>
      <PageHeader
        title={t("pageTitleActivities")}
        action={
          isSupabaseConfigured && (
            <Button
              onClick={() => {
                setEditingActivity(null);
                setModalOpen(true);
              }}
            >
              {t("newActivityBtn")}
            </Button>
          )
        }
      />
      <SupabaseSetupNotice />

      {!isSupabaseConfigured ? null : loading || ref.loading ? (
        <LoadingState />
      ) : error || ref.error ? (
        <ErrorState message={error || ref.error} />
      ) : (
        <>
          <div className="mb-4 max-w-sm">
            <TextInput
              placeholder={t("searchActivitiesPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-[11.5px] text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                    <th className="px-5 py-2.5 font-medium">{t("colCode")}</th>
                    <th className="px-5 py-2.5 font-medium">{t("colActivityName")}</th>
                    <th className="px-5 py-2.5 font-medium">{t("colType")}</th>
                    <th className="px-5 py-2.5 font-medium">{t("colVenue")}</th>
                    <th className="px-5 py-2.5 font-medium">{t("colDate")}</th>
                    <th className="px-5 py-2.5 font-medium">{t("colParticipants")}</th>
                    <th className="px-5 py-2.5 font-medium">{t("colActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-[var(--color-text-muted)]">
                        {t("noParticipantsYet")}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((a) => (
                      <tr key={a.id} className="border-b border-[var(--color-border)] last:border-0">
                        <td className="px-5 py-2.5 font-mono text-[12px]">
                          <Link href={`/activities/${a.id}`} className="text-[var(--color-primary)] hover:underline">
                            {a.code}
                          </Link>
                        </td>
                        <td className="px-5 py-2.5">{a.name}</td>
                        <td className="px-5 py-2.5">{ref.mainTypeName(a.main_id)}</td>
                        <td className="px-5 py-2.5">{a.location}</td>
                        <td className="px-5 py-2.5">{fmtDate(a.activity_date)}</td>
                        <td className="px-5 py-2.5">{counts[a.id] || 0}</td>
                        <td className="px-5 py-2.5">
                          <div className="flex gap-2">
                            <button
                              className="text-[var(--color-primary)] hover:underline cursor-pointer"
                              onClick={() => {
                                setEditingActivity(a);
                                setModalOpen(true);
                              }}
                            >
                              {t("editBtn")}
                            </button>
                            <button
                              className="text-red-600 hover:underline cursor-pointer"
                              onClick={() => handleDelete(a.id)}
                            >
                              {t("deleteBtn")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      <ActivityModal
        open={modalOpen}
        activity={editingActivity}
        referenceData={ref}
        saving={saving}
        onClose={() => {
          setModalOpen(false);
          setEditingActivity(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
