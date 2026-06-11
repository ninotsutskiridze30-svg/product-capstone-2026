"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createLoginSchema, type LoginValues } from "@/features/auth/schemas";
import { useRequestOAuthUrl, useSignIn } from "@/entities/user/api/user.query";
import { Link, useRouter } from "@/shared/i18n/navigation";
import {
  toPathWithoutLocale,
  withLocalePrefix,
} from "@/shared/i18n/locale-path";
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
import { track } from "@/shared/lib/analytics/events";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("auth");
  const redirectToRaw = searchParams.get("redirect") ?? "/dashboard";
  const redirectInternal = toPathWithoutLocale(redirectToRaw);
  const redirectOAuth = withLocalePrefix(locale, redirectInternal);
  const signIn = useSignIn();
  const oauthUrl = useRequestOAuthUrl();

  const form = useForm<LoginValues>({
    resolver: zodResolver(createLoginSchema(t)),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    try {
      await signIn.mutateAsync({
        email: values.email,
        password: values.password,
      });
      void track("user_signed_in", { method: "email" });
      toast.success(t("signedInToast"));
      router.push(redirectInternal);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign in failed");
    }
  }

  async function signInWithGoogle() {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    try {
      const { url } = await oauthUrl.mutateAsync({
        provider: "google",
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectOAuth)}`,
      });
      void track("user_signed_in", { method: "google" });
      window.location.assign(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "OAuth failed");
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("signInTitle")}
        </h1>
        <p className="text-muted-foreground text-sm">{t("signInSubtitle")}</p>
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
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={signIn.isPending}>
            {signIn.isPending ? t("signingIn") : t("signInCta")}
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
        disabled={oauthUrl.isPending || signIn.isPending}
        onClick={() => void signInWithGoogle()}
      >
        {t("continueGoogle")}
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        {t("noAccount")}{" "}
        <Link
          href="/register"
          className="text-primary underline-offset-4 hover:underline"
        >
          {t("registerLink")}
        </Link>
      </p>
    </div>
  );
}
