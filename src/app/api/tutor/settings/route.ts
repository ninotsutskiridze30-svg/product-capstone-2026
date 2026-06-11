import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";
import { createServerClient as createServerClientLegacy } from "@/shared/api/supabase-server";
import { tutorNotificationPrefsPatchSchema } from "@/shared/lib/schemas";

export const dynamic = "force-dynamic";

export type TutorSettingsPatchResponse = {
  success: true;
};

type ApiErrorResponse = {
  error: string;
};

export async function GET() {
  const supabase = await createServerClientLegacy();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select("email_booking, email_message, push_booking, push_message")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({
    prefs: prefs ?? {
      email_booking: true,
      email_message: true,
      push_booking: true,
      push_message: true,
    },
  });
}

export async function PATCH(
  request: Request
): Promise<NextResponse<TutorSettingsPatchResponse | ApiErrorResponse>> {
  try {
    await cookies();
    const authResult = await requireAuth("tutor");
    if ("response" in authResult) {
      return authResult.response;
    }

    const parsed = tutorNotificationPrefsPatchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    const { error } = await supabase.from("notification_preferences").upsert({
      user_id: authResult.auth.userId,
      email_booking: parsed.data.emailBooking,
      email_message: parsed.data.emailMessage,
      push_booking: parsed.data.pushBooking,
      push_message: parsed.data.pushMessage,
    });
    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to save preferences" },
      { status: 500 }
    );
  }
}
