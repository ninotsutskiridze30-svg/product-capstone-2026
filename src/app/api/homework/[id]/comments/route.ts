import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";
import { createCommentInputSchema } from "@/entities/homework/model/homework.schema";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({ id: z.string().uuid() });

/** Load the assignment parties so we can authorize and resolve author roles. */
async function loadParties(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  assignmentId: string
) {
  const { data } = await supabase
    .from("homework_assignments")
    .select("id, tutor_id, student_id")
    .eq("id", assignmentId)
    .maybeSingle();
  return data;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await cookies();
  const authResult = await requireAuth();
  if ("response" in authResult) return authResult.response;

  const params = paramsSchema.safeParse(await context.params);
  if (!params.success) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const supabase = await createServerClient();
  const userId = authResult.auth.userId;
  const assignment = await loadParties(supabase, params.data.id);
  if (!assignment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (assignment.tutor_id !== userId && assignment.student_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [{ data: comments }, { data: profiles }] = await Promise.all([
    supabase
      .from("homework_comments")
      .select("id, assignment_id, author_id, author_role, body, created_at")
      .eq("assignment_id", params.data.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", [assignment.tutor_id, assignment.student_id]),
  ]);

  const byId = new Map((profiles ?? []).map((p) => [p.id, p] as const));
  const items = (comments ?? []).map((c) => ({
    ...c,
    authorName: byId.get(c.author_id)?.full_name ?? "User",
    authorAvatarUrl: byId.get(c.author_id)?.avatar_url ?? null,
  }));
  return NextResponse.json({ items });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await cookies();
  const authResult = await requireAuth();
  if ("response" in authResult) return authResult.response;

  const params = paramsSchema.safeParse(await context.params);
  if (!params.success) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = createCommentInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 }
    );
  }

  const supabase = await createServerClient();
  const userId = authResult.auth.userId;
  const assignment = await loadParties(supabase, params.data.id);
  if (!assignment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const isTutor = assignment.tutor_id === userId;
  const isStudent = assignment.student_id === userId;
  if (!isTutor && !isStudent) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: inserted, error } = await supabase
    .from("homework_comments")
    .insert({
      assignment_id: params.data.id,
      author_id: userId,
      author_role: isTutor ? "tutor" : "student",
      body: parsed.data.body,
    })
    .select("id, assignment_id, author_id, author_role, body, created_at")
    .single();
  if (error || !inserted) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to post comment" },
      { status: 500 }
    );
  }
  return NextResponse.json(inserted);
}
