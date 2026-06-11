import { Link } from "@/shared/i18n/navigation";
import { useTranslations } from "next-intl";

export function HomeFooter() {
  const t = useTranslations("home");

  return (
    <footer className="border-t border-[#2D5A3D]/10 bg-white/70">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-[#1e3a2d]">
          <div className="h-6 w-6 rounded-md bg-[#2D5A3D]" />
          <span className="font-semibold">{t("footerBrand")}</span>
        </div>

        <p>{t("footerCopyright")}</p>

        <div className="flex items-center gap-5">
          <Link href="/">{t("footerAbout")}</Link>
          <Link href="/tutors">{t("footerTutors")}</Link>
          <Link href="/register">{t("footerPricing")}</Link>
          <Link href="/login">{t("footerContact")}</Link>
        </div>
      </div>
    </footer>
  );
}
