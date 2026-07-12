"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/I18nContext";
import { useReferenceData } from "@/lib/useReferenceData";
import { genderLabel } from "@/lib/translations";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { createPerson, deletePerson, fetchPeople, updatePerson } from "@/lib/api";
import {
  Button,
  Card,
  ErrorState,
  LoadingState,
  PageHeader,
  SupabaseSetupNotice,
  TextInput,
} from "@/components/ui";
import PersonModal from "@/components/PersonModal";

export default function PeoplePage() {
  const { t, lang } = useI18n();
  const ref = useReferenceData();
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    setError(null);
    try {
      setPeople(await fetchPeople());
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

  const filtered = people.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const hay = `${p.first_name} ${p.last_name} ${p.office} ${p.position} ${p.phone}`.toLowerCase();
    return hay.includes(q);
  });

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editingPerson) {
        await updatePerson(editingPerson.id, form);
      } else {
        await createPerson(form);
      }
      setModalOpen(false);
      setEditingPerson(null);
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
      await deletePerson(id);
      await load();
    } catch (err) {
      setError(err.message || String(err));
    }
  };

  return (
    <div>
      <PageHeader
        title={t("pageTitlePeople")}
        action={
          isSupabaseConfigured && (
            <Button
              onClick={() => {
                setEditingPerson(null);
                setModalOpen(true);
              }}
            >
              {t("newPersonBtn")}
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
              placeholder={t("searchPeoplePlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-[11.5px] text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                    <th className="px-5 py-2.5 font-medium">{t("colFullName")}</th>
                    <th className="px-5 py-2.5 font-medium">{t("colGender")}</th>
                    <th className="px-5 py-2.5 font-medium">{t("colPosition")}</th>
                    <th className="px-5 py-2.5 font-medium">{t("colOffice")}</th>
                    <th className="px-5 py-2.5 font-medium">{t("colProvinceDistrict")}</th>
                    <th className="px-5 py-2.5 font-medium">{t("colPhone")}</th>
                    <th className="px-5 py-2.5 font-medium">{t("colActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-[var(--color-text-muted)]">
                        {t("noMatchingPeople")}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p) => (
                      <tr key={p.id} className="border-b border-[var(--color-border)] last:border-0">
                        <td className="px-5 py-2.5">
                          {p.first_name} {p.last_name}
                        </td>
                        <td className="px-5 py-2.5">{genderLabel(p.gender, lang)}</td>
                        <td className="px-5 py-2.5">{p.position}</td>
                        <td className="px-5 py-2.5">{p.office}</td>
                        <td className="px-5 py-2.5">
                          {ref.provinceName(p.province_id)} / {ref.districtName(p.district_id)}
                        </td>
                        <td className="px-5 py-2.5">{p.phone}</td>
                        <td className="px-5 py-2.5">
                          <div className="flex gap-2">
                            <button
                              className="text-[var(--color-primary)] hover:underline cursor-pointer"
                              onClick={() => {
                                setEditingPerson(p);
                                setModalOpen(true);
                              }}
                            >
                              {t("editBtn")}
                            </button>
                            <button
                              className="text-red-600 hover:underline cursor-pointer"
                              onClick={() => handleDelete(p.id)}
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

      <PersonModal
        open={modalOpen}
        person={editingPerson}
        referenceData={ref}
        saving={saving}
        onClose={() => {
          setModalOpen(false);
          setEditingPerson(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
