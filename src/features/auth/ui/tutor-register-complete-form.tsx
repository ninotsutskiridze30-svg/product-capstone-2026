"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/navigation";
import { useRouter } from "@/shared/i18n/navigation";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { FieldCategoryWithFields } from "@/features/auth/tutor-register-data";
import {
  createTutorRegisterDetailsSchema,
  type TutorRegisterDetailsValues,
} from "@/features/auth/schemas";
import { applyTutorRegistrationWrites } from "@/features/auth/tutor-registration-writes";
import { userApi } from "@/entities/user/api/user.api";
import { createBrowserClient } from "@/shared/api/supabase-browser";
import { withLocalePrefix } from "@/shared/i18n/locale-path";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

type Props = {
  categories: FieldCategoryWithFields[];
  defaultFullName: string;
};

export function TutorRegisterCompleteForm({
  categories,
  defaultFullName,
}: Props) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth");
  const [pending, setPending] = useState(false);
  const supabase = createBrowserClient();
  const completePath = withLocalePrefix(locale, "/register/tutor/complete");

  const form = useForm<TutorRegisterDetailsValues>({
    resolver: zodResolver(createTutorRegisterDetailsSchema(t)),
    defaultValues: {
      fullName: defaultFullName,
      headline: "",
      hourlyRateMin: 20,
      hourlyRateMax: 60,
      fieldIds: [],
      proficiencyLevel: "intermediate",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library -- checkbox list needs live fieldIds
  const selectedIds = form.watch("fieldIds");

  function toggleField(id: string, checked: boolean) {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    form.setValue("fieldIds", [...next], { shouldValidate: true });
  }

  async function onSubmit(values: TutorRegisterDetailsValues) {
    if (values.hourlyRateMax < values.hourlyRateMin) {
      toast.error(t("maxRateGteMin"));
      return;
    }
    setPending(true);
    const { user } = await userApi.getMe();
    if (!user) {
      setPending(false);
      toast.error(t("signInAgainContinue"));
      router.push(
        `/login?redirect=${encodeURIComponent(completePath)}`
      );
      return;
    }

    const { error: writeError } = await applyTutorRegistrationWrites(
      supabase,
      user.id,
      values
    );

    if (writeError) {
      setPending(false);
      toast.error(writeError.message);
      return;
    }

    setPending(false);
    toast.success(t("tutorProfileCreated"));
    router.push("/dashboard/tutor");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("finishTutorProfileTitle")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("finishTutorProfileSubtitle")}
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fullName")}</FormLabel>
                <FormControl>
                  <Input autoComplete="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="headline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("headline")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("headlinePlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="hourlyRateMin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("minRate")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      name={field.name}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      value={Number.isFinite(field.value) ? field.value : ""}
                      onChange={(e) => {
                        const v = e.target.valueAsNumber;
                        field.onChange(Number.isFinite(v) ? v : 0);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hourlyRateMax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("maxRate")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      name={field.name}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      value={Number.isFinite(field.value) ? field.value : ""}
                      onChange={(e) => {
                        const v = e.target.valueAsNumber;
                        field.onChange(Number.isFinite(v) ? v : 0);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="proficiencyLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("proficiencyLabel")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("levelPlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="beginner">{t("beginner")}</SelectItem>
                    <SelectItem value="intermediate">
                      {t("intermediate")}
                    </SelectItem>
                    <SelectItem value="advanced">{t("advanced")}</SelectItem>
                    <SelectItem value="expert">{t("expert")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fieldIds"
            render={() => (
              <FormItem>
                <FormLabel>{t("subjects")}</FormLabel>
                <FormDescription>
                  {t("subjectsDescription")}
                </FormDescription>
                <div className="max-h-56 space-y-3 overflow-y-auto rounded-lg border p-3">
                  {categories.map((cat) => (
                    <div key={cat.id} className="space-y-2">
                      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                        {cat.name}
                      </p>
                      <div className="flex flex-col gap-2">
                        {cat.fields.map((f) => (
                          <label
                            key={f.id}
                            className="flex cursor-pointer items-center gap-2 text-sm"
                          >
                            <Checkbox
                              checked={selectedIds.includes(f.id)}
                              onCheckedChange={(c) =>
                                toggleField(f.id, c === true)
                              }
                            />
                            {f.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? t("saving") : t("saveTutorProfile")}
          </Button>
        </form>
      </Form>
      <p className="text-muted-foreground text-center text-sm">
        <Link
          href="/dashboard"
          className="text-primary underline-offset-4 hover:underline"
        >
          {t("linkDashboard")}
        </Link>
        {" · "}
        <Link href="/" className="text-primary underline-offset-4 hover:underline">
          {t("linkHome")}
        </Link>
      </p>
    </div>
  );
}
