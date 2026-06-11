"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { LoginForm } from "@/features/auth/ui/login-form";

export function AuthLoginModule() {
  const t = useTranslations("loginPage");

  return (
    <main className="container">
      <Suspense
        fallback={
          <div className="text-muted-foreground mx-auto w-full max-w-sm animate-pulse py-12 text-center text-sm">
            {t("loading")}
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
