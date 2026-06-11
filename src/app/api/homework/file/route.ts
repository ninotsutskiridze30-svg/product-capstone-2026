import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";
import type { Database } from "@/shared/types/database.types";

export const dynamic = "force-dynamic";

const SIGNED_URL_TTL_SECONDS = 60 * 10;

export async function GET(request: Request) {
  await cookies();
  const authResult = await requireAuth();
  if ("response" in authResult) return authResult.response;
  const userId = authResult.auth.userId;

  const url = new URL(request.url);
  const path = url.searchParams.get("path");
  if (!path) {
    return NextResponse.json({ error: "path required" }, { status: 400 });
  }

  const supabase = await createServerClient();

  const [
    { data: assignmentMatch },
    { data: submissionMatch },
  ] = await Promise.all([
    supabase
      .from("homework_assignments")
      .select("id, tutor_id, student_id")
      .eq("attachment_url", path)
      .or(`tutor_id.eq.${userId},student_id.eq.${userId}`)
      .maybeSingle(),
    supabase
      .from("homework_submissions")
      .select(
        "id, assignment_id, student_id, homework_assignments!inner(tutor_id, student_id)"
      )
      .eq("attachment_url", path)
      .maybeSingle(),
  ]);

  let allowed = Boolean(assignmentMatch);
  if (!allowed && submissionMatch) {
    const parent = submissionMatch.homework_assignments as unknown as {
      tutor_id: string;
      student_id: string;
    } | null;
    allowed = parent
      ? parent.tutor_id === userId || parent.student_id === userId
      : false;
  }
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json(
      { error: "Server missing Supabase configuration" },
      { status: 500 }
    );
  }

  const admin = createClient<Database>(supabaseUrl, serviceKey);
  const { data, error } = await admin.storage
    .from("homework")
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to sign" },
      { status: 500 }
    );
  }
  return NextResponse.json({ url: data.signedUrl });
}
