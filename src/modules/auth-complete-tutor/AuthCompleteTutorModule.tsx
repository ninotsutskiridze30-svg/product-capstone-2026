"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { TutorRegisterCompleteForm } from "@/features/auth/ui/tutor-register-complete-form";
import { tutorCompleteDataQueryOptions } from "@/entities/user/api/user.query";

export function AuthCompleteTutorModule() {
  const router = useRouter();
  const { data, isLoading } = useQuery(tutorCompleteDataQueryOptions());

  useEffect(() => {
    if (data?.status === "complete") {
      router.replace("/dashboard/tutor");
    }
  }, [data, router]);

  if (isLoading || !data || data.status === "complete") {
    return (
      <main className="container py-8">
        <div className="h-64 animate-pulse rounded-lg bg-gray-100" />
      </main>
    );
  }

  return (
    <main className="container py-8">
      <TutorRegisterCompleteForm
        categories={data.categories}
        defaultFullName={data.defaultFullName}
      />
    </main>
  );
}
