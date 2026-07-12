"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/I18nContext";

const NAV_ITEMS = [
  { href: "/", key: "navDashboard", icon: "📊" },
  { href: "/activities", key: "navActivities", icon: "📅" },
  { href: "/people", key: "navPeople", icon: "👥" },
  { href: "/reference", key: "navReference", icon: "🗂️" },
];

export default function AppShell({ children }) {
  const { t, lang, setLang } = useI18n();
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full">
      <aside className="w-64 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col">
        <div className="px-5 py-6 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-sm">
              ກຈ
            </div>
            <div className="leading-tight">
              <div className="text-[13px] font-semibold text-[var(--color-text)]">
                {t("appTagline")}
              </div>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-[var(--color-text-muted)]">{t("sourceNote")}</div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-colors ${
                  active
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-[var(--color-text-muted)] hover:bg-slate-100"
                }`}
              >
                <span aria-hidden>{item.icon}</span>
                <span>{t(item.key)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-[var(--color-border)] text-[12px] text-[var(--color-text-muted)]">
          {t("adminName")}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between px-6">
          <div className="text-[15px] font-semibold text-[var(--color-text)]">{t("appTitle")}</div>
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setLang("lo")}
              className={`px-3 py-1.5 rounded-md text-[12.5px] font-semibold transition-colors ${
                lang === "lo" ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-muted)]"
              }`}
            >
              ລາວ
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-3 py-1.5 rounded-md text-[12.5px] font-semibold transition-colors ${
                lang === "en" ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-muted)]"
              }`}
            >
              EN
            </button>
          </div>
        </header>

        <main className="flex-1 min-w-0 p-6">{children}</main>
      </div>
    </div>
  );
}
