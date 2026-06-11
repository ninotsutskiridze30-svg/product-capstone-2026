import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";
import { groupUpdateSchema } from "@/shared/lib/schemas";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

export type GroupDetailResponse = {
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
  members: {
    id: string;
    student_id: string;
    status: "active" | "dropped" | "completed";
    joined_at: string;
    student_name: string | null;
  }[];
};

export type GroupPatchResponse = {
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

export type GroupDeleteResponse = {
  id: string;
  deleted: true;
};

type ApiErrorResponse = {
  error: string;
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<GroupDetailResponse | ApiErrorResponse>> {
  try {
    await cookies();
    const authResult = await requireAuth();
    if ("response" in authResult) {
      return authResult.response;
    }

    const parsed = paramsSchema.safeParse(await context.params);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid group id" }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { data: group } = await supabase
      .from("student_groups")
      .select("id,tutor_id,name,field_id,max_students,current_count,description,is_active")
      .eq("id", parsed.data.id)
      .maybeSingle();
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const { data: members } = await supabase
      .from("group_members")
      .select("id,student_id,status,joined_at")
      .eq("group_id", parsed.data.id)
      .order("joined_at", { ascending: false });

    const studentIds = (members ?? []).map((member) => member.student_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id,full_name")
      .in("id", studentIds);
    const nameById = new Map(
      (profiles ?? []).map((profile) => [profile.id, profile.full_name] as const)
    );

    return NextResponse.json({
      group,
      members: (members ?? []).map((member) => ({
        ...member,
        student_name: nameById.get(member.student_id) ?? null,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to load group detail" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<GroupPatchResponse | ApiErrorResponse>> {
  try {
    await cookies();
    const authResult = await requireAuth("tutor");
    if ("response" in authResult) {
      return authResult.response;
    }

    const parsedParams = paramsSchema.safeParse(await context.params);
    if (!parsedParams.success) {
      return NextResponse.json({ error: "Invalid group id" }, { status: 400 });
    }

    const parsedBody = groupUpdateSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    const { data: group } = await supabase
      .from("student_groups")
      .select("id,tutor_id")
      .eq("id", parsedParams.data.id)
      .maybeSingle();

    if (!group || group.tutor_id !== authResult.auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatePayload: {
      name?: string;
      field_id?: string;
      max_students?: number;
      description?: string | null;
      is_active?: boolean;
    } = {};
    if (parsedBody.data.name !== undefined) updatePayload.name = parsedBody.data.name;
    if (parsedBody.data.fieldId !== undefined) {
      updatePayload.field_id = parsedBody.data.fieldId;
    }
    if (parsedBody.data.maxStudents !== undefined) {
      updatePayload.max_students = parsedBody.data.maxStudents;
    }
    if (parsedBody.data.description !== undefined) {
      updatePayload.description = parsedBody.data.description;
    }
    if (parsedBody.data.isActive !== undefined) {
      updatePayload.is_active = parsedBody.data.isActive;
    }

    const { data, error } = await supabase
      .from("student_groups")
      .update(updatePayload)
      .eq("id", parsedParams.data.id)
      .select("id,tutor_id,name,field_id,max_students,current_count,description,is_active")
      .single();

    if (error || !data) {
      throw error ?? new Error("Failed to update group");
    }

    return NextResponse.json({ group: data });
  } catch {
    return NextResponse.json({ error: "Failed to update group" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<GroupDeleteResponse | ApiErrorResponse>> {
  try {
    await cookies();
    const authResult = await requireAuth("tutor");
    if ("response" in authResult) {
      return authResult.response;
    }

    const parsed = paramsSchema.safeParse(await context.params);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid group id" }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { data: group } = await supabase
      .from("student_groups")
      .select("id,tutor_id")
      .eq("id", parsed.data.id)
      .maybeSingle();

    if (!group || group.tutor_id !== authResult.auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase
      .from("student_groups")
      .update({ is_active: false })
      .eq("id", parsed.data.id);
    if (error) {
      throw error;
    }

    return NextResponse.json({ id: parsed.data.id, deleted: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete group" }, { status: 500 });
  }
}
