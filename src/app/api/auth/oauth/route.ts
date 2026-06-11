import { NextResponse } from "next/server";
import { z } from "zod";

import { createServerClient } from "@/shared/api/supabase-server";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  provider: z.enum(["google"]),
  redirectTo: z.string().url(),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: parsed.data.provider,
    options: {
      redirectTo: parsed.data.redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data.url) {
    return NextResponse.json(
      { error: "No OAuth URL returned" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: data.url });
}
