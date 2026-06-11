"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/navigation";
import { useRouter } from "@/shared/i18n/navigation";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  createStudentProfileCompleteSchema,
  type StudentProfileCompleteValues,
} from "@/features/auth/schemas";
import { userApi } from "@/entities/user/api/user.api";
import { createBrowserClient } from "@/shared/api/supabase-browser";
import { withLocalePrefix } from "@/shared/i18n/locale-path";
import { Button } from "@/shared/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

type Props = {
  defaultValues: StudentProfileCompleteValues;
};

export function StudentRegisterCompleteForm({ defaultValues }: Props) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth");
  const common = useTranslations("common");
  const [pending, setPending] = useState(false);
  const supabase = createBrowserClient();
  const completePath = withLocalePrefix(locale, "/register/student/complete");
  const loginWithNext = `/login?redirect=${encodeURIComponent(completePath)}`;

  const form = useForm<StudentProfileCompleteValues>({
    resolver: zodResolver(createStudentProfileCompleteSchema(t)),
    defaultValues,
  });

  async function onSubmit(values: StudentProfileCompleteValues) {
    setPending(true);
    const { user } = await userApi.getMe();
    if (!user) {
      setPending(false);
      toast.error(t("signInAgainContinue"));
      router.push(loginWithNext);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: values.fullName,
        phone: values.phone?.trim() || null,
        city: values.city?.trim() || null,
        country: values.country?.trim() || null,
        bio: values.bio?.trim() || null,
      })
      .eq("id", user.id);

    if (error) {
      setPending(false);
      toast.error(error.message);
      return;
    }

    setPending(false);
    toast.success(t("profileSaved"));
    router.push("/dashboard/student");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("finishStudentTitle")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("finishStudentSubtitle")}
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
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("phone")}</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    autoComplete="tel"
                      placeholder={common("optional")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("city")}</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="address-level2"
                      placeholder={common("optional")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("country")}</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="country-name"
                      placeholder={common("optional")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("bio")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("bioPlaceholder")}
                    className="min-h-[100px] resize-y"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? t("saving") : t("continueDashboard")}
          </Button>
        </form>
      </Form>
      <p className="text-muted-foreground text-center text-sm">
        <Link href="/register" className="text-primary underline-offset-4 hover:underline">
          {t("backToRoleChoice")}
        </Link>
        {" · "}
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          {t("signInLink")}
        </Link>
      </p>
    </div>
  );
}
