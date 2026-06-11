"use client";

import { useLocale, useTranslations } from "next-intl";

import { routing } from "@/shared/i18n/routing";
import { usePathname, useRouter } from "@/shared/i18n/navigation";

const localeLabels: Record<string, string> = {
  en: "EN",
  ka: "ქა",
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("localeSwitcher");

  function switchLocale(next: string) {
    router.replace(pathname, { locale: next });
  }

  return (
    <div className="locale-switcher flex gap-1">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchLocale(l)}
          aria-pressed={l === locale}
          aria-label={l === "en" ? t("switchToEnglish") : t("switchToGeorgian")}
          className={`locale-btn rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
            l === locale
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground hover:text-foreground border-border"
          }`}
        >
          {localeLabels[l]}
        </button>
      ))}
    </div>
  );
}
