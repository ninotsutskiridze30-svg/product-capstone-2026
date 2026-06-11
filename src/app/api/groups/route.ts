import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";
import { groupCreateSchema } from "@/shared/lib/schemas";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  tutorId: z.string().uuid(),
});

export type GroupsResponse = {
  groups: {
    id: string;
    tutor_id: string;
    name: string;
    field_id: string;
    max_students: number;
    current_count: number;
    description: string | null;
    is_active: boolean;
  }[];
};

export type GroupMutationResponse = {
  group: {
    id: string;
    tutor_id: string;
    name: string;
    field_id: string;
    max_students: number;
    current_count: number;
    description: string | null;
    is_active: boolean;
  };
};

type ApiErrorResponse = {
  error: string;
};

export async function GET(
  request: Request
): Promise<NextResponse<GroupsResponse | ApiErrorResponse>> {
  try {
    const url = new URL(request.url);
    const parsed = querySchema.safeParse({
      tutorId: url.searchParams.get("tutorId"),
    });
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid tutor id" }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("student_groups")
      .select("id,tutor_id,name,field_id,max_students,current_count,description,is_active")
      .eq("tutor_id", parsed.data.tutorId)
      .eq("is_active", true)
      .order("name");

    if (error) {
      throw error;
    }

    return NextResponse.json({ groups: data ?? [] });
  } catch {
    return NextResponse.json({ error: "Failed to load groups" }, { status: 500 });
  }
}

export async function POST(
  request: Request
): Promise<NextResponse<GroupMutationResponse | ApiErrorResponse>> {
  try {
    await cookies();
    const authResult = await requireAuth("tutor");
    if ("response" in authResult) {
      return authResult.response;
    }

    const parsed = groupCreateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    if (parsed.data.tutorId !== authResult.auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("student_groups")
      .insert({
        tutor_id: parsed.data.tutorId,
        name: parsed.data.name,
        field_id: parsed.data.fieldId,
        max_students: parsed.data.maxStudents,
        description: parsed.data.description ?? null,
        current_count: 0,
        is_active: true,
      })
      .select("id,tutor_id,name,field_id,max_students,current_count,description,is_active")
      .single();

    if (error || !data) {
      throw error ?? new Error("Failed to create group");
    }

    return NextResponse.json({ group: data });
  } catch {
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}
