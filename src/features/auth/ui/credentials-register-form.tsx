"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/navigation";
import { useRouter } from "@/shared/i18n/navigation";

import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  createCredentialsRegisterSchema,
  type CredentialsRegisterValues,
} from "@/features/auth/schemas";
import { useRequestOAuthUrl, useSignUp } from "@/entities/user/api/user.query";
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
import { track, identify } from "@/shared/lib/analytics/events";

type Props = {
  completePath: string;
  title: string;
  description: string;
  submitLabel: string;
};

export function CredentialsRegisterForm({
  completePath,
  title,
  description,
  submitLabel,
}: Props) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth");
  const signUp = useSignUp();
  const oauthUrl = useRequestOAuthUrl();
  const localizedCompletePath = withLocalePrefix(locale, completePath);

  const form = useForm<CredentialsRegisterValues>({
    resolver: zodResolver(createCredentialsRegisterSchema(t)),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: CredentialsRegisterValues) {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(localizedCompletePath)}`;

    try {
      const data = await signUp.mutateAsync({
        email: values.email,
        password: values.password,
        emailRedirectTo,
      });
      if (!data.userId) {
        toast.error(t("couldNotCreateAccount"));
        return;
      }
      const role = completePath.includes("tutor") ? "tutor" : "student";
      void identify(data.userId, { role, locale });
      void track("signup_completed", { locale, role });
      if (data.session) {
        toast.success(t("accountCreated"));
        router.push(completePath);
        router.refresh();
        return;
      }
      toast.message(t("checkEmailTitle"), {
        description: t("checkEmailDescription"),
      });
      router.push(
        `/login?redirect=${encodeURIComponent(localizedCompletePath)}`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign up failed");
    }
  }

  async function signUpWithGoogle() {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    try {
      const { url } = await oauthUrl.mutateAsync({
        provider: "google",
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(localizedCompletePath)}`,
      });
      window.location.assign(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "OAuth failed");
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("email")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder={t("placeholderEmail")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("password")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("repeatPassword")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={signUp.isPending}>
            {signUp.isPending ? t("creating") : submitLabel}
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="border-border w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">
            {t("or")}
          </span>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={oauthUrl.isPending || signUp.isPending}
        onClick={() => void signUpWithGoogle()}
      >
        {t("continueGoogle")}
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        {t("alreadyHaveAccountQuestion")}{" "}
        <Link
          href="/login"
          className="text-primary underline-offset-4 hover:underline"
        >
          {t("signInLink")}
        </Link>
      </p>
    </div>
  );
}
