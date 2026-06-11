import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";
import {
  uploadPayloadSchema,
  validateUploadFile,
} from "@/shared/lib/schemas/upload.schema";
import type { Database } from "@/shared/types/database.types";

const BUCKETS = [
  "avatars",
  "covers",
  "gallery",
  "certificates",
  "homework",
] as const;
type Bucket = (typeof BUCKETS)[number];

const PRIVATE_BUCKETS: ReadonlySet<Bucket> = new Set(["homework"]);
const SIGNED_URL_TTL_SECONDS = 60 * 60;

export async function POST(request: Request) {
  try {
    await cookies();
    const authResult = await requireAuth();
    if ("response" in authResult) {
      return authResult.response;
    }

    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!serviceKey || !url) {
      return NextResponse.json(
        { error: "Server missing Supabase configuration" },
        { status: 500 }
      );
    }

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const file = form.get("file");
    const bucketRaw = form.get("bucket");
    const pathOpt = form.get("path");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file required" }, { status: 400 });
    }

    const parsedPayload = uploadPayloadSchema.safeParse({
      bucket: bucketRaw,
      path: typeof pathOpt === "string" ? pathOpt : undefined,
    });
    if (!parsedPayload.success) {
      return NextResponse.json(
        { error: parsedPayload.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    if (!BUCKETS.includes(parsedPayload.data.bucket as Bucket)) {
      return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
    }

    const fileCheck = validateUploadFile(file, parsedPayload.data.bucket);
    if (!fileCheck.valid) {
      return NextResponse.json({ error: fileCheck.error }, { status: 400 });
    }

    const objectPath =
      parsedPayload.data.path && parsedPayload.data.path.trim().length > 0
        ? parsedPayload.data.path.trim()
        : `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]+/g, "_")}`;

    const admin = createClient<Database>(url, serviceKey);
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: upErr } = await admin.storage
      .from(parsedPayload.data.bucket)
      .upload(objectPath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    const bucket = parsedPayload.data.bucket as Bucket;

    if (PRIVATE_BUCKETS.has(bucket)) {
      const { data: signed, error: signErr } = await admin.storage
        .from(bucket)
        .createSignedUrl(objectPath, SIGNED_URL_TTL_SECONDS);

      if (signErr || !signed) {
        return NextResponse.json(
          { error: signErr?.message ?? "Failed to sign upload URL" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        url: signed.signedUrl,
        path: objectPath,
        bucket,
        size: file.size,
        name: file.name,
      });
    }

    const { data: pub } = admin.storage
      .from(bucket)
      .getPublicUrl(objectPath);

    return NextResponse.json({
      url: pub.publicUrl,
      path: objectPath,
      bucket,
      size: file.size,
      name: file.name,
    });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
