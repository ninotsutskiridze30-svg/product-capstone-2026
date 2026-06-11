"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { useRouter } from "@/shared/i18n/navigation";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  ChevronDown,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Slider } from "@/shared/ui/slider";

type Category = {
  id: string;
  name: string;
  slug: string;
  fields: { id: string; name: string; slug: string; category_id: string }[];
};

type Props = {
  categories: Category[];
};

export function TutorFilters({ categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopExpanded, setDesktopExpanded] = useState(false);
  const t = useTranslations("tutorFilters");
  const c = useTranslations("common");

  const categoryId = searchParams.get("category") ?? "";
  const fieldId = searchParams.get("field") ?? "";
  const q = searchParams.get("q") ?? "";
  const city = searchParams.get("city") ?? "";
  const lang = searchParams.get("lang") ?? "";
  const date = searchParams.get("date") ?? "";
  const minRatingRaw = searchParams.get("minRating");
  const hasPrice =
    searchParams.has("priceMin") && searchParams.has("priceMax");
  const priceMin = hasPrice
    ? Number(searchParams.get("priceMin") ?? "0")
    : 10;
  const priceMax = hasPrice
    ? Number(searchParams.get("priceMax") ?? "200")
    : 120;

  const fieldsInCategory = useMemo(() => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.fields ?? [];
  }, [categories, categoryId]);

  function pushParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    next.delete("page");
    startTransition(() => {
      router.push(`/tutors?${next.toString()}`);
    });
  }

  return (
    <>
      <div className="lg:hidden">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setMobileOpen(true)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {t("title")}
        </Button>
      </div>

      <div
        className={cn(
          "lg:hidden fixed inset-0 z-[300] bg-black/40 transition-opacity duration-200",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={cn(
          "bg-surface border-border space-y-6 rounded-xl border p-4 md:p-6 lg:sticky lg:top-4 lg:h-fit",
          "lg:translate-y-0 lg:opacity-100",
          "fixed bottom-0 inset-x-0 z-[400] max-h-[86vh] overflow-y-auto rounded-t-2xl shadow-xl transition-transform duration-200",
          mobileOpen ? "translate-y-0" : "translate-y-full",
          "lg:static lg:max-h-none lg:rounded-xl lg:shadow-none"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-body text-2xl font-semibold leading-snug">
              {t("title")}
            </h2>
            <p className="text-text-muted text-sm">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="hidden lg:inline-flex"
              onClick={() => setDesktopExpanded((prev) => !prev)}
              aria-expanded={desktopExpanded}
              aria-label={desktopExpanded ? "Hide filters" : "Show filters"}
            >
              {desktopExpanded ? "Hide filters" : "Show filters"}
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  desktopExpanded ? "rotate-180" : "rotate-0"
                )}
              />
            </Button>
            <button
              type="button"
              className="lg:hidden text-text-secondary hover:bg-gray-100 rounded-md p-2 transition-colors"
              onClick={() => setMobileOpen(false)}
              aria-label="Close filters"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          className={cn(
            "flex flex-col gap-4 md:gap-6",
            !desktopExpanded && "lg:hidden"
          )}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="q">{t("search")}</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="text-text-muted pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="q"
                  name="q"
                  defaultValue={q}
                  placeholder={t("searchPlaceholder")}
                  className="h-12 pl-10 shadow-sm"
                />
              </div>
              <Button
                type="button"
                size="sm"
                disabled={pending}
                onClick={() => {
                  const el = document.getElementById("q") as HTMLInputElement | null;
                  pushParams({ q: el?.value?.trim() || null });
                }}
              >
                {c("go")}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t("category")}</Label>
            <Select
              value={categoryId || "__all__"}
              onValueChange={(v) => {
                pushParams({
                  category: v === "__all__" ? null : v,
                  field: null,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("allCategories")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t("allCategories")}</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t("field")}</Label>
            <Select
              value={fieldId || "__all__"}
              disabled={!categoryId}
              onValueChange={(v) => {
                pushParams({ field: v === "__all__" ? null : v });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("allFields")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t("allFields")}</SelectItem>
                {fieldsInCategory.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t("budgetLabel", { min: priceMin, max: priceMax })}</Label>
            <Slider
              value={[priceMin, priceMax]}
              min={0}
              max={300}
              step={5}
              onValueCommit={(v) => {
                pushParams({
                  priceMin: String(v[0]),
                  priceMax: String(v[1]),
                });
              }}
              className="py-2"
            />
            {!hasPrice ? (
              <p className="text-text-muted text-xs">{t("budgetHint")}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t("minRating")}</Label>
            <Select
              value={minRatingRaw ?? "__any__"}
              onValueChange={(v) => {
                pushParams({ minRating: v === "__any__" ? null : v });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("any")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__any__">{t("any")}</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
                <SelectItem value="4.5">4.5+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="city">{t("city")}</Label>
            <div className="flex gap-2">
              <Input
                id="city"
                defaultValue={city}
                placeholder={t("cityPlaceholder")}
              />
              <Button
                type="button"
                size="sm"
                disabled={pending}
                onClick={() => {
                  const el = document.getElementById("city") as HTMLInputElement | null;
                  pushParams({ city: el?.value?.trim() || null });
                }}
              >
                {c("set")}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="lang">{t("language")}</Label>
            <div className="flex gap-2">
              <Input
                id="lang"
                defaultValue={lang}
                placeholder={t("languagePlaceholder")}
              />
              <Button
                type="button"
                size="sm"
                disabled={pending}
                onClick={() => {
                  const el = document.getElementById("lang") as HTMLInputElement | null;
                  pushParams({ lang: el?.value?.trim() || null });
                }}
              >
                {c("set")}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tutor-date-filter">{t("availableOn")}</Label>
            <div className="flex gap-2">
              <Input id="tutor-date-filter" type="date" defaultValue={date} />
              <Button
                type="button"
                size="sm"
                disabled={pending}
                onClick={() => {
                  const el = document.getElementById(
                    "tutor-date-filter"
                  ) as HTMLInputElement | null;
                  pushParams({ date: el?.value || null });
                }}
              >
                {c("set")}
              </Button>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "bg-surface sticky bottom-0 flex gap-3 pt-2",
            !desktopExpanded && "lg:hidden"
          )}
        >
          <Button
            type="button"
            variant="ghost"
            className="flex-1"
            disabled={pending}
            onClick={() => startTransition(() => router.push("/tutors"))}
          >
            {t("clearAll")}
          </Button>
          <Button
            type="button"
            className="flex-1 lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            Apply
          </Button>
        </div>
      </aside>
    </>
  );
}
