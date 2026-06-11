"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { StudentRegisterCompleteForm } from "@/features/auth/ui/student-register-complete-form";
import { studentCompleteDataQueryOptions } from "@/entities/user/api/user.query";

export function AuthCompleteStudentModule() {
  const router = useRouter();
  const { data, isLoading } = useQuery(studentCompleteDataQueryOptions());

  useEffect(() => {
    if (data?.status === "wrong_role") {
      router.replace("/dashboard/tutor");
    }
  }, [data, router]);

  if (isLoading || !data || data.status === "wrong_role") {
    return (
      <main className="container py-8">
        <div className="h-64 animate-pulse rounded-lg bg-gray-100" />
      </main>
    );
  }

  return (
    <main className="container py-8">
      <StudentRegisterCompleteForm defaultValues={data.defaultValues} />
    </main>
  );
}
