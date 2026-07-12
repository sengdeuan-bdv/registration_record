"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/I18nContext";
import { GENDER_DEFS } from "@/lib/translations";
import { Button, Field, Modal, Select, TextInput } from "@/components/ui";

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  gender: "male",
  province_id: "",
  district_id: "",
  phone: "",
  position: "",
  office: "",
};

export default function PersonModal({ open, person, referenceData, onClose, onSave, saving }) {
  const { t, lang } = useI18n();
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;
    if (person) {
      setForm({
        first_name: person.first_name || "",
        last_name: person.last_name || "",
        gender: person.gender || "male",
        province_id: person.province_id || "",
        district_id: person.district_id || "",
        phone: person.phone || "",
        position: person.position || "",
        office: person.office || "",
      });
    } else {
      setForm({
        ...EMPTY_FORM,
        province_id: referenceData.provinces[0]?.id || "",
        district_id: referenceData.districtsFor(referenceData.provinces[0]?.id)[0]?.id || "",
      });
    }
  }, [open, person, referenceData]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const setProvince = (e) => {
    const province_id = e.target.value;
    const district_id = referenceData.districtsFor(province_id)[0]?.id || "";
    setForm((f) => ({ ...f, province_id, district_id }));
  };

  const handleSave = () => {
    if (!form.first_name.trim()) return;
    onSave({
      ...form,
      province_id: form.province_id || null,
      district_id: form.district_id || null,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title={person ? t("personModalTitleEdit") : t("personModalTitleNew")}
      footer={
        <>
          <Button variant="subtle" onClick={onClose}>
            {t("cancelBtn")}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t("saving") : t("saveBtn")}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label={t("fieldFirstName")}>
            <TextInput value={form.first_name} onChange={set("first_name")} autoFocus />
          </Field>
          <Field label={t("fieldLastName")}>
            <TextInput value={form.last_name} onChange={set("last_name")} />
          </Field>
        </div>
        <Field label={t("fieldGender")}>
          <Select value={form.gender} onChange={set("gender")} className="max-w-[200px]">
            {GENDER_DEFS.map((g) => (
              <option key={g.id} value={g.id}>
                {g[lang]}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t("fieldProvince")}>
            <Select value={form.province_id} onChange={setProvince}>
              {referenceData.provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("fieldDistrict")}>
            <Select value={form.district_id} onChange={set("district_id")}>
              {referenceData.districtsFor(form.province_id).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label={t("fieldPhone")}>
          <TextInput value={form.phone} onChange={set("phone")} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t("fieldPosition")}>
            <TextInput value={form.position} onChange={set("position")} />
          </Field>
          <Field label={t("fieldOffice")}>
            <TextInput value={form.office} onChange={set("office")} />
          </Field>
        </div>
      </div>
    </Modal>
  );
}
