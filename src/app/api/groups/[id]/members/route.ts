import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";
import { groupMemberSchema } from "@/shared/lib/schemas";

export const dynamic = "force-dynamic";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

export type GroupMembersMutationResponse = {
  success: true;
};

type ApiErrorResponse = {
  error: string;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<GroupMembersMutationResponse | ApiErrorResponse>> {
  try {
    await cookies();
    const authResult = await requireAuth("student");
    if ("response" in authResult) {
      return authResult.response;
    }

    const parsedParams = paramsSchema.safeParse(await context.params);
    if (!parsedParams.success) {
      return NextResponse.json({ error: "Invalid group id" }, { status: 400 });
    }

    const parsedBody = groupMemberSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    if (parsedBody.data.studentId !== authResult.auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = await createServerClient();
    const { error } = await supabase.from("group_members").insert({
      group_id: parsedParams.data.id,
      student_id: parsedBody.data.studentId,
      status: "active",
    });
    if (error) {
      throw error;
    }

    const { data: members } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", parsedParams.data.id)
      .eq("status", "active");

    await supabase
      .from("student_groups")
      .update({ current_count: (members ?? []).length })
      .eq("id", parsedParams.data.id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to add group member" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<GroupMembersMutationResponse | ApiErrorResponse>> {
  try {
    await cookies();
    const authResult = await requireAuth();
    if ("response" in authResult) {
      return authResult.response;
    }

    const parsedParams = paramsSchema.safeParse(await context.params);
    if (!parsedParams.success) {
      return NextResponse.json({ error: "Invalid group id" }, { status: 400 });
    }

    const parsedBody = groupMemberSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", parsedParams.data.id)
      .eq("student_id", parsedBody.data.studentId);

    if (error) {
      throw error;
    }

    const { data: members } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", parsedParams.data.id)
      .eq("status", "active");

    await supabase
      .from("student_groups")
      .update({ current_count: (members ?? []).length })
      .eq("id", parsedParams.data.id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to remove group member" },
      { status: 500 }
    );
  }
}
