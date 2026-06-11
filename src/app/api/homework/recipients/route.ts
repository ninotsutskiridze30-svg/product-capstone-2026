import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  await cookies();
  const authResult = await requireAuth("tutor");
  if ("response" in authResult) return authResult.response;
  const tutorId = authResult.auth.userId;

  const supabase = await createServerClient();

  const [{ data: connections }, { data: groups }] = await Promise.all([
    supabase
      .from("connections")
      .select("student_id")
      .eq("tutor_id", tutorId),
    supabase
      .from("student_groups")
      .select("id, name")
      .eq("tutor_id", tutorId)
      .eq("is_active", true),
  ]);

  const studentIds = (connections ?? []).map((c) => c.student_id);
  const { data: profiles } =
    studentIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", studentIds)
      : { data: [] as Array<{ id: string; full_name: string | null; avatar_url: string | null }> };

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p] as const));

  const students = studentIds
    .map((id) => {
      const p = profileById.get(id);
      return {
        id,
        full_name: p?.full_name ?? null,
        avatar_url: p?.avatar_url ?? null,
      };
    })
    .sort((a, b) =>
      (a.full_name ?? "").localeCompare(b.full_name ?? "", undefined, {
        sensitivity: "base",
      })
    );

  const groupIds = (groups ?? []).map((g) => g.id);
  const { data: members } =
    groupIds.length > 0
      ? await supabase
          .from("group_members")
          .select("group_id")
          .in("group_id", groupIds)
          .eq("status", "active")
      : { data: [] as Array<{ group_id: string }> };

  const memberCount = new Map<string, number>();
  for (const m of members ?? []) {
    memberCount.set(m.group_id, (memberCount.get(m.group_id) ?? 0) + 1);
  }

  const groupOptions = (groups ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    memberCount: memberCount.get(g.id) ?? 0,
  }));

  return NextResponse.json({ students, groups: groupOptions });
}
