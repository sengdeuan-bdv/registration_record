"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/I18nContext";
import { useReferenceData } from "@/lib/useReferenceData";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { fetchActivities, fetchParticipationCounts, fetchPeople } from "@/lib/api";
import { Card, ErrorState, LoadingState, PageHeader, SupabaseSetupNotice } from "@/components/ui";

function StatCard({ label, value }) {
  return (
    <Card className="p-5">
      <div className="text-[12px] text-[var(--color-text-muted)]">{label}</div>
      <div className="mt-1.5 text-[26px] font-semibold text-[var(--color-text)]">{value}</div>
    </Card>
  );
}

export default function DashboardPage() {
  const { t, lang } = useI18n();
  const ref = useReferenceData();
  const [activities, setActivities] = useState([]);
  const [peopleCount, setPeopleCount] = useState(0);
  const [participantCounts, setParticipantCounts] = useState({});
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [acts, people, counts] = await Promise.all([
          fetchActivities(),
          fetchPeople(),
          fetchParticipationCounts(),
        ]);
        if (cancelled) return;
        setActivities(acts);
        setPeopleCount(people.length);
        setParticipantCounts(counts);
      } catch (err) {
        if (!cancelled) setError(err.message || String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalParticipants = Object.values(participantCounts).reduce((a, b) => a + b, 0);
  const recent = [...activities]
    .sort((a, b) => (b.activity_date || "").localeCompare(a.activity_date || ""))
    .slice(0, 5);

  const fmtDate = (iso) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div>
      <PageHeader title={t("pageTitleDashboard")} />
      <SupabaseSetupNotice />

      {!isSupabaseConfigured ? null : loading || ref.loading ? (
        <LoadingState />
      ) : error || ref.error ? (
        <ErrorState message={error || ref.error} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label={t("statTotalActivitiesLabel")} value={activities.length} />
            <StatCard label={t("statTotalParticipantsLabel")} value={totalParticipants} />
            <StatCard label={t("statTotalPeopleLabel")} value={peopleCount} />
            <StatCard label={t("statProvincesLabel")} value={ref.provinces.length} />
          </div>

          <Card className="mt-6">
            <div className="px-5 py-4 border-b border-[var(--color-border)] text-[14px] font-semibold">
              {t("recentActivitiesTitle")}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-[11.5px] text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                    <th className="px-5 py-2.5 font-medium">{t("colCode")}</th>
                    <th className="px-5 py-2.5 font-medium">{t("colActivityName")}</th>
                    <th className="px-5 py-2.5 font-medium">{t("colDate")}</th>
                    <th className="px-5 py-2.5 font-medium">{t("colParticipants")}</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-[var(--color-text-muted)]">
                        {t("noParticipantsYet")}
                      </td>
                    </tr>
                  ) : (
                    recent.map((a) => (
                      <tr key={a.id} className="border-b border-[var(--color-border)] last:border-0">
                        <td className="px-5 py-2.5 font-mono text-[12px]">
                          <Link href={`/activities/${a.id}`} className="text-[var(--color-primary)] hover:underline">
                            {a.code}
                          </Link>
                        </td>
                        <td className="px-5 py-2.5">{a.name}</td>
                        <td className="px-5 py-2.5">{fmtDate(a.activity_date)}</td>
                        <td className="px-5 py-2.5">{participantCounts[a.id] || 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
