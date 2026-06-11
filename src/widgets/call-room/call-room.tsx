"use client";

import "@livekit/components-styles";

import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { callApi, type CallTokenPayload } from "@/entities/call/api/call.api";

import { CallStage } from "./call-stage";

type Props = {
  callId: string;
  role: "tutor" | "student";
};

/**
 * Outer shell that fetches a LiveKit token and mounts the room.
 * Token fetch + connect are split so we can show a clear loading state
 * (LiveKit's prebuilt loaders don't surface our auth errors well).
 */
export function CallRoom({ callId, role }: Props) {
  const router = useRouter();
  const t = useTranslations("call");
  const [token, setToken] = useState<CallTokenPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    callApi
      .getToken(callId)
      .then((payload) => {
        if (cancelled) return;
        setToken(payload);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : t("joinFailed");
        setError(message);
      });
    return () => {
      cancelled = true;
    };
  }, [callId, t]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-100">
        <div className="space-y-4 text-center">
          <p className="text-lg">{error}</p>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md bg-neutral-800 px-4 py-2 text-sm hover:bg-neutral-700"
          >
            {t("goBack")}
          </button>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-100">
        <p>{t("connecting")}</p>
      </div>
    );
  }

  return (
    // LiveKit's `.lk-room-container` class forces `height: 100%` onto the room's
    // root div (overriding utility classes on it). A percentage height only
    // resolves against a parent with a *definite* height, but the app <body>
    // only sets `min-height` — so without this shell the room collapses to 0px
    // and nothing renders until a height is forced in DevTools. This wrapper is
    // that definite anchor. `dvh` keeps the controls reachable under mobile
    // browser chrome.
    <div className="h-dvh w-full overflow-hidden bg-neutral-950">
      <LiveKitRoom
        token={token.token}
        serverUrl={token.url}
        connect
        audio
        video
        data-lk-theme="default"
        className="h-full w-full bg-neutral-950"
        onError={(err) => {
          toast.error(err.message);
        }}
        onDisconnected={() => {
          void callApi.updateStatus(callId, "ended").catch(() => undefined);
          router.back();
        }}
      >
        <CallStage
          callId={callId}
          role={role}
          peerName={token.peerName}
          selfName={token.displayName}
          isInitiator={token.isInitiator}
        />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}
