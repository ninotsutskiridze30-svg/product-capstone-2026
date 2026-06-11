import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";
import type { Database } from "@/shared/types/database.types";

export const dynamic = "force-dynamic";

const BUCKET = "whiteboard-snapshots";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB
const MAX_JSON_BYTES = 4 * 1024 * 1024; // 4 MB

export type SnapshotMutationResponse = {
  snapshot: {
    id: string;
    conversation_id: string;
    image_path: string;
    snapshot_path: string;
    created_at: string;
  };
  message: {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    attachment_type: string | null;
    attachment_ref: string | null;
    is_read: boolean;
    created_at: string;
  };
};

type ApiErrorResponse = { error: string };

export async function POST(
  request: Request
): Promise<NextResponse<SnapshotMutationResponse | ApiErrorResponse>> {
  try {
    await cookies();
    const authResult = await requireAuth();
    if ("response" in authResult) {
      return authResult.response;
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

    const image = form.get("image");
    const snapshot = form.get("snapshot");
    const callSessionIdRaw = form.get("callSessionId");

    if (!(image instanceof File) || !(snapshot instanceof File)) {
      return NextResponse.json(
        { error: "image and snapshot files required" },
        { status: 400 }
      );
    }
    if (image.size === 0 || image.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "image too large" }, { status: 400 });
    }
    if (snapshot.size === 0 || snapshot.size > MAX_JSON_BYTES) {
      return NextResponse.json({ error: "snapshot too large" }, { status: 400 });
    }
    if (typeof callSessionIdRaw !== "string") {
      return NextResponse.json({ error: "callSessionId required" }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { userId } = authResult.auth;

    const { data: call } = await supabase
      .from("call_sessions")
      .select("id,conversation_id,conversations!inner(tutor_id,student_id)")
      .eq("id", callSessionIdRaw)
      .maybeSingle();

    if (!call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }
    const conv = call.conversations as unknown as {
      tutor_id: string;
      student_id: string;
    };
    if (conv.tutor_id !== userId && conv.student_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const snapshotId = crypto.randomUUID();
    const imagePath = `${call.conversation_id}/${snapshotId}.png`;
    const snapshotPath = `${call.conversation_id}/${snapshotId}.json`;

    const admin = createClient<Database>(url, serviceKey);
    const imageBuffer = Buffer.from(await image.arrayBuffer());
    const snapshotBuffer = Buffer.from(await snapshot.arrayBuffer());

    const { error: imageUploadError } = await admin.storage
      .from(BUCKET)
      .upload(imagePath, imageBuffer, { contentType: "image/png", upsert: false });
    if (imageUploadError) {
      return NextResponse.json({ error: imageUploadError.message }, { status: 500 });
    }

    const { error: snapshotUploadError } = await admin.storage
      .from(BUCKET)
      .upload(snapshotPath, snapshotBuffer, {
        contentType: "application/json",
        upsert: false,
      });
    if (snapshotUploadError) {
      // Best-effort cleanup of the image so we don't leave orphaned blobs.
      await admin.storage.from(BUCKET).remove([imagePath]);
      return NextResponse.json({ error: snapshotUploadError.message }, { status: 500 });
    }

    const { data: snapshotRow, error: snapshotInsertError } = await supabase
      .from("whiteboard_snapshots")
      .insert({
        id: snapshotId,
        call_session_id: call.id,
        conversation_id: call.conversation_id,
        saved_by: userId,
        image_path: imagePath,
        snapshot_path: snapshotPath,
      })
      .select("id,conversation_id,image_path,snapshot_path,created_at")
      .single();

    if (snapshotInsertError || !snapshotRow) {
      await admin.storage.from(BUCKET).remove([imagePath, snapshotPath]);
      throw snapshotInsertError ?? new Error("Failed to record snapshot");
    }

    // Insert a message so the saved board appears in the chat timeline for
    // both participants — existing realtime channel will deliver it.
    const { data: messageRow, error: messageInsertError } = await supabase
      .from("messages")
      .insert({
        conversation_id: call.conversation_id,
        sender_id: userId,
        content: "",
        attachment_type: "whiteboard",
        attachment_ref: snapshotRow.id,
        is_read: false,
      })
      .select(
        "id,conversation_id,sender_id,content,attachment_type,attachment_ref,is_read,created_at"
      )
      .single();

    if (messageInsertError || !messageRow) {
      throw messageInsertError ?? new Error("Failed to attach snapshot to chat");
    }

    await supabase
      .from("conversations")
      .update({ last_message_at: messageRow.created_at })
      .eq("id", call.conversation_id);

    return NextResponse.json({ snapshot: snapshotRow, message: messageRow });
  } catch {
    return NextResponse.json({ error: "Failed to save whiteboard" }, { status: 500 });
  }
}

const URL_LIST_SCHEMA = "GET /api/whiteboard-snapshots?id=<snapshot-id>";

export async function GET(
  request: Request
): Promise<NextResponse<{ imageUrl: string; snapshotUrl: string } | ApiErrorResponse>> {
  try {
    await cookies();
    const authResult = await requireAuth();
    if ("response" in authResult) {
      return authResult.response;
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: URL_LIST_SCHEMA }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { data: snapshot } = await supabase
      .from("whiteboard_snapshots")
      .select(
        "id,image_path,snapshot_path,conversation_id,conversations!inner(tutor_id,student_id)"
      )
      .eq("id", id)
      .maybeSingle();

    if (!snapshot) {
      return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
    }
    const conv = snapshot.conversations as unknown as {
      tutor_id: string;
      student_id: string;
    };
    if (
      conv.tutor_id !== authResult.auth.userId &&
      conv.student_id !== authResult.auth.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!serviceKey || !supabaseUrl) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }
    const admin = createClient<Database>(supabaseUrl, serviceKey);

    const [imageSigned, snapshotSigned] = await Promise.all([
      admin.storage.from(BUCKET).createSignedUrl(snapshot.image_path, 60 * 60),
      admin.storage.from(BUCKET).createSignedUrl(snapshot.snapshot_path, 60 * 60),
    ]);

    if (imageSigned.error || !imageSigned.data) {
      return NextResponse.json({ error: imageSigned.error?.message ?? "Sign failed" }, { status: 500 });
    }
    if (snapshotSigned.error || !snapshotSigned.data) {
      return NextResponse.json({ error: snapshotSigned.error?.message ?? "Sign failed" }, { status: 500 });
    }

    return NextResponse.json({
      imageUrl: imageSigned.data.signedUrl,
      snapshotUrl: snapshotSigned.data.signedUrl,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load snapshot" }, { status: 500 });
  }
}
