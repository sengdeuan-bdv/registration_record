"use client";

import { useState } from "react";
import { Button, Select, TextInput } from "@/components/ui";

export function SimpleRefList({ title, items, placeholder, onAdd, onDelete, deleteLabel }) {
  const [name, setName] = useState("");

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await onAdd(trimmed);
    setName("");
  };

  return (
    <div>
      <div className="text-[13.5px] font-semibold mb-2.5">{title}</div>
      <div className="flex gap-2 mb-3">
        <TextInput
          placeholder={placeholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <Button onClick={submit} className="shrink-0">
          +
        </Button>
      </div>
      <div className="space-y-1.5 max-h-56 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between px-3 py-2 border border-[var(--color-border)] rounded-lg text-[13px]"
          >
            <span>{item.name}</span>
            <button
              className="text-red-500 hover:underline text-[12px] cursor-pointer shrink-0"
              onClick={() => onDelete(item.id)}
            >
              {deleteLabel}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChildRefList({
  title,
  items,
  parents,
  parentLabelFor,
  placeholder,
  selectedParentId,
  onSelectedParentChange,
  onAdd,
  onDelete,
  deleteLabel,
}) {
  const [name, setName] = useState("");

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed || !selectedParentId) return;
    await onAdd(selectedParentId, trimmed);
    setName("");
  };

  return (
    <div>
      <div className="text-[13.5px] font-semibold mb-2.5">{title}</div>
      <div className="flex gap-2 mb-3">
        <Select
          className="max-w-[200px] shrink-0"
          value={selectedParentId}
          onChange={(e) => onSelectedParentChange(e.target.value)}
        >
          {parents.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
        <TextInput
          placeholder={placeholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <Button onClick={submit} className="shrink-0">
          +
        </Button>
      </div>
      <div className="space-y-1.5 max-h-56 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between px-3 py-2 border border-[var(--color-border)] rounded-lg text-[13px]"
          >
            <span>
              {item.name}{" "}
              <span className="text-[var(--color-text-muted)]">— {parentLabelFor(item)}</span>
            </span>
            <button
              className="text-red-500 hover:underline text-[12px] cursor-pointer shrink-0"
              onClick={() => onDelete(item.id)}
            >
              {deleteLabel}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
