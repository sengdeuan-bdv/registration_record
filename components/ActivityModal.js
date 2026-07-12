"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/I18nContext";
import { Button, Field, Modal, Select, TextInput } from "@/components/ui";

const EMPTY_FORM = {
  name: "",
  location: "",
  province_id: "",
  district_id: "",
  main_id: "",
  sub_id: "",
  activity_date: "",
};

export default function ActivityModal({ open, activity, referenceData, onClose, onSave, saving }) {
  const { t } = useI18n();
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;
    if (activity) {
      setForm({
        name: activity.name || "",
        location: activity.location || "",
        province_id: activity.province_id || "",
        district_id: activity.district_id || "",
        main_id: activity.main_id || "",
        sub_id: activity.sub_id || "",
        activity_date: activity.activity_date || "",
      });
    } else {
      setForm({
        ...EMPTY_FORM,
        province_id: referenceData.provinces[0]?.id || "",
        district_id: referenceData.districtsFor(referenceData.provinces[0]?.id)[0]?.id || "",
        main_id: referenceData.mainTypes[0]?.id || "",
        sub_id: referenceData.subTypesFor(referenceData.mainTypes[0]?.id)[0]?.id || "",
      });
    }
  }, [open, activity, referenceData]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const setProvince = (e) => {
    const province_id = e.target.value;
    const district_id = referenceData.districtsFor(province_id)[0]?.id || "";
    setForm((f) => ({ ...f, province_id, district_id }));
  };
  const setMainType = (e) => {
    const main_id = e.target.value;
    const sub_id = referenceData.subTypesFor(main_id)[0]?.id || "";
    setForm((f) => ({ ...f, main_id, sub_id }));
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave({
      ...form,
      province_id: form.province_id || null,
      district_id: form.district_id || null,
      main_id: form.main_id || null,
      sub_id: form.sub_id || null,
      activity_date: form.activity_date || null,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title={activity ? t("activityModalTitleEdit") : t("activityModalTitleNew")}
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
        <Field label={t("fieldActivityName")}>
          <TextInput value={form.name} onChange={set("name")} autoFocus />
        </Field>
        <Field label={t("fieldVenue")}>
          <TextInput value={form.location} onChange={set("location")} />
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
        <div className="grid grid-cols-2 gap-4">
          <Field label={t("fieldMainType")}>
            <Select value={form.main_id} onChange={setMainType}>
              {referenceData.mainTypes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("fieldSubType")}>
            <Select value={form.sub_id} onChange={set("sub_id")}>
              {referenceData.subTypesFor(form.main_id).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label={t("fieldDate")}>
          <TextInput type="date" value={form.activity_date} onChange={set("activity_date")} />
        </Field>
      </div>
    </Modal>
  );
}
