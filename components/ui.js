"use client";

import { useI18n } from "@/lib/I18nContext";
import { isSupabaseConfigured } from "@/lib/supabaseClient";

export function PageHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h1 className="text-[19px] font-semibold text-[var(--color-text)]">{title}</h1>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function Button({ variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]",
    subtle: "bg-slate-100 text-slate-600 hover:bg-slate-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
  };
  return (
    <button
      type="button"
      className={`px-4 py-2 rounded-lg text-[13px] font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function TextInput({ className = "", ...props }) {
  return (
    <input
      className={`w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 ${className}`}
      {...props}
    />
  );
}

export function Select({ className = "", children, ...props }) {
  return (
    <select
      className={`w-full px-3 py-2.5 border border-[var(--color-border)] rounded-lg text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Field({ label, children }) {
  return (
    <div>
      <div className="text-[11.5px] text-[var(--color-text-muted)] mb-1">{label}</div>
      {children}
    </div>
  );
}

export function Modal({ open, title, onClose, children, footer, wide = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className={`bg-white rounded-xl shadow-xl w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[90vh] overflow-y-auto`}
      >
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-[var(--color-border)] flex justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function SupabaseSetupNotice() {
  const { t } = useI18n();
  if (isSupabaseConfigured) return null;
  return (
    <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
      <div className="font-semibold">{t("noSupabaseTitle")}</div>
      <div className="mt-0.5">{t("noSupabaseBody")}</div>
    </div>
  );
}

export function LoadingState() {
  const { t } = useI18n();
  return <div className="py-16 text-center text-[13px] text-[var(--color-text-muted)]">{t("loadingText")}</div>;
}

export function ErrorState({ message }) {
  const { t } = useI18n();
  return (
    <div className="py-16 text-center text-[13px] text-red-600">
      {t("errorText")}
      {message ? `: ${message}` : ""}
    </div>
  );
}
