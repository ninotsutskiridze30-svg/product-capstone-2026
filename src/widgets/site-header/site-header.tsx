import { getTranslations } from "next-intl/server";

import { LocaleSwitcher } from "@/features/locale-switcher";
import { ThemeSwitcher } from "@/features/theme-switcher";
import { Link } from "@/shared/i18n/navigation";
import { HeaderAuth } from "@/widgets/site-header/header-auth";

export async function SiteHeader() {
  const t = await getTranslations("navigation");

  return (
    <header className="border-border-subtle bg-surface-0/75 supports-backdrop-filter:bg-surface-0/65 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
        <nav className="flex items-center gap-7">
          <Link href="/" className="font-display text-text-strong text-lg font-bold tracking-tight">
            {t("brand")}
          </Link>
          <Link
            href="/tutors"
            className="text-text-muted hover:text-brand-primary text-sm font-medium transition-colors"
          >
            {t("tutors")}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <LocaleSwitcher />
          <HeaderAuth />
        </div>
      </div>
    </header>
  );
}
