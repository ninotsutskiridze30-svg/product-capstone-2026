"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/shared/i18n/navigation";

import { CredentialsRegisterForm } from "@/features/auth/ui/credentials-register-form";

export function StudentRegisterForm() {
  const t = useTranslations("auth");

  return (
    <div className="space-y-6">
      <CredentialsRegisterForm
        completePath="/register/student/complete"
        title={t("studentRegisterCardTitle")}
        description={t("studentRegisterCardDescription")}
        submitLabel={t("createStudentAccount")}
      />
      <p className="text-muted-foreground text-center text-sm">
        <Link href="/register" className="text-primary underline-offset-4 hover:underline">
          {t("backToRoleChoice")}
        </Link>
      </p>
    </div>
  );
}
