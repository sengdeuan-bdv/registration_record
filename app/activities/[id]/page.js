"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useI18n } from "@/lib/I18nContext";
import { useReferenceData } from "@/lib/useReferenceData";
import { genderLabel, roleLabel, ROLE_DEFS } from "@/lib/translations";
import {
  addParticipant,
  fetchActivity,
  fetchParticipants,
  fetchPeople,
  removeParticipant,
  updateParticipantRole,
} from "@/lib/api";
import { Button, Card, ErrorState, LoadingState, PageHeader, Select, TextInput } from "@/components/ui";

export default function ActivityDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t, lang } = useI18n();
  const ref = useReferenceData();

  const [activity, setActivity] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [allPeople, setAllPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participantQuery, setParticipantQuery] = useState("");
  const [pendingRoles, setPendingRoles] = useState({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [act, parts, people] = await Promise.all([
        fetchActivity(id),
        fetchParticipants(id),
        fetchPeople(),
      ]);
      setActivity(act);
      setParticipants(parts);
      setAllPeople(people);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fmtDate = (iso) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };

  const participantIds = useMemo(() => new Set(participants.map((p) => p.person_id)), [participants]);

  const candidates = useMemo(() => {
    const q = participantQuery.trim().toLowerCase();
    return allPeople
      .filter((p) => !participantIds.has(p.id))
      .filter((p) => {
        if (!q) return true;
        const hay = `${p.first_name} ${p.last_name} ${p.position} ${p.office} ${p.phone}`.toLowerCase();
        return hay.includes(q);
      });
  }, [allPeople, participantIds, participantQuery]);

  const handleAdd = async (personId) => {
    const role = pendingRoles[personId] || ROLE_DEFS[0].id;
    try {
      await addParticipant(id, personId, role);
      await load();
    } catch (err) {
      setError(err.message || String(err));
    }
  };

  const handleRemove = async (personId) => {
    try {
      await removeParticipant(id, personId);
      await load();
    } catch (err) {
      setError(err.message || String(err));
    }
  };

  const handleRoleChange = async (personId, role) => {
    try {
      await updateParticipantRole(id, personId, role);
      await load();
    } catch (err) {
      setError(err.message || String(err));
    }
  };

  const exportCSV = () => {
    if (!activity) return;
    const header =
      lang === "lo"
        ? ["ລະຫັດ", "ຊື່", "ນາມສະກຸນ", "ເພດ", "ບົດບາດໃນກິດຈະກຳ", "ແຂວງ", "ເມືອງ", "ເບີໂທ", "ຕຳແໜ່ງ", "ຫ້ອງການ"]
        : ["Code", "First Name", "Last Name", "Gender", "Role", "Province", "District", "Phone", "Position", "Office"];
    const esc = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
    const lines = [header.map(esc).join(",")];
    participants.forEach((row) => {
      const p = row.people;
      if (!p) return;
      lines.push(
        [
          p.code,
          p.first_name,
          p.last_name,
          genderLabel(p.gender, lang),
          roleLabel(row.role, lang),
          ref.provinceName(p.province_id),
          ref.districtName(p.district_id),
          p.phone,
          p.position,
          p.office,
        ]
          .map(esc)
          .join(",")
      );
    });
    const csv = "﻿" + lines.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activity.code}_participants.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (loading || ref.loading) return <LoadingState />;
  if (error || ref.error) return <ErrorState message={error || ref.error} />;
  if (!activity) return null;

  return (
    <div>
      <button
        onClick={() => router.push("/activities")}
        className="text-[13px] text-[var(--color-primary)] hover:underline mb-4 cursor-pointer"
      >
        {t("backToActivities")}
      </button>

      <PageHeader title={activity.name} />

      <Card className="p-5 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[13px]">
          <div>
            <div className="text-[11.5px] text-[var(--color-text-muted)]">{t("fieldActivityCode")}</div>
            <div className="font-mono mt-0.5">{activity.code}</div>
          </div>
          <div>
            <div className="text-[11.5px] text-[var(--color-text-muted)]">{t("fieldType")}</div>
            <div className="mt-0.5">{ref.mainTypeName(activity.main_id)}</div>
          </div>
          <div>
            <div className="text-[11.5px] text-[var(--color-text-muted)]">{t("fieldVenue")}</div>
            <div className="mt-0.5">{activity.location}</div>
          </div>
          <div>
            <div className="text-[11.5px] text-[var(--color-text-muted)]">{t("fieldDate")}</div>
            <div className="mt-0.5">{fmtDate(activity.activity_date)}</div>
          </div>
          <div>
            <div className="text-[11.5px] text-[var(--color-text-muted)]">{t("fieldProvinceDistrict")}</div>
            <div className="mt-0.5">
              {ref.provinceName(activity.province_id)} / {ref.districtName(activity.district_id)}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-5 mb-6">
        <div className="text-[14px] font-semibold mb-3">{t("findParticipantsTitle")}</div>
        <TextInput
          placeholder={t("searchParticipantsPlaceholder")}
          value={participantQuery}
          onChange={(e) => setParticipantQuery(e.target.value)}
          className="mb-3"
        />
        {candidates.length === 0 ? (
          <div className="text-[13px] text-[var(--color-text-muted)] py-4 text-center">
            {t("noMatchingPeople")}
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {candidates.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 px-3 py-2 border border-[var(--color-border)] rounded-lg"
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-medium truncate">
                    {p.first_name} {p.last_name}
                  </div>
                  <div className="text-[11.5px] text-[var(--color-text-muted)] truncate">
                    {p.position} · {p.office}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Select
                    className="w-40"
                    value={pendingRoles[p.id] || ROLE_DEFS[0].id}
                    onChange={(e) => setPendingRoles((s) => ({ ...s, [p.id]: e.target.value }))}
                  >
                    {ROLE_DEFS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r[lang]}
                      </option>
                    ))}
                  </Select>
                  <Button onClick={() => handleAdd(p.id)}>{t("addBtn")}</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <div className="text-[14px] font-semibold">{t("participantsListTitle")}</div>
          <Button variant="subtle" onClick={exportCSV} disabled={participants.length === 0}>
            {t("exportBtn")}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                <th className="px-5 py-2.5 font-medium">{t("colFullName")}</th>
                <th className="px-5 py-2.5 font-medium">{t("colGender")}</th>
                <th className="px-5 py-2.5 font-medium">{t("colRole")}</th>
                <th className="px-5 py-2.5 font-medium">{t("colOffice")}</th>
                <th className="px-5 py-2.5 font-medium">{t("colPhone")}</th>
                <th className="px-5 py-2.5 font-medium">{t("colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {participants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[var(--color-text-muted)]">
                    {t("noParticipantsYet")}
                  </td>
                </tr>
              ) : (
                participants.map((row) => {
                  const p = row.people;
                  if (!p) return null;
                  return (
                    <tr key={p.id} className="border-b border-[var(--color-border)] last:border-0">
                      <td className="px-5 py-2.5">
                        {p.first_name} {p.last_name}
                      </td>
                      <td className="px-5 py-2.5">{genderLabel(p.gender, lang)}</td>
                      <td className="px-5 py-2.5">
                        <Select
                          className="w-40"
                          value={row.role}
                          onChange={(e) => handleRoleChange(p.id, e.target.value)}
                        >
                          {ROLE_DEFS.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r[lang]}
                            </option>
                          ))}
                        </Select>
                      </td>
                      <td className="px-5 py-2.5">{p.office}</td>
                      <td className="px-5 py-2.5">{p.phone}</td>
                      <td className="px-5 py-2.5">
                        <button
                          className="text-red-600 hover:underline cursor-pointer"
                          onClick={() => handleRemove(p.id)}
                        >
                          {t("deleteBtn")}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
