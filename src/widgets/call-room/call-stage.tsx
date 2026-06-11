"use client";

import {
  useConnectionState,
  useDataChannel,
  useLocalParticipant,
  useRemoteParticipants,
  useRoomContext,
} from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { callApi } from "@/entities/call/api/call.api";

import { CallControls } from "./call-controls";
import { CallStageGrid } from "./call-stage-grid";
import { CallStageSplit } from "./call-stage-split";

type Props = {
  callId: string;
  role: "tutor" | "student";
  peerName: string;
  selfName: string;
  isInitiator: boolean;
};

const NO_ANSWER_TIMEOUT_MS = 30_000;

/**
 * Inside the LiveKit room. Picks between the Meet-style grid (default) and
 * the whiteboard split. Whiteboard toggle is broadcast over the `wb-toggle`
 * data channel so both sides mirror it. The initiator gets a 30 s no-answer
 * timer that auto-marks the call as `missed` and bounces back to messages.
 */
export function CallStage({ callId, role, peerName, selfName, isInitiator }: Props) {
  const t = useTranslations("call");
  const router = useRouter();
  const room = useRoomContext();
  const connectionState = useConnectionState(room);
  const remoteParticipants = useRemoteParticipants();
  const { localParticipant } = useLocalParticipant();
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);

  const handleToggleMessage = useCallback(
    (msg: { payload: Uint8Array }) => {
      try {
        const text = new TextDecoder().decode(msg.payload);
        const parsed = JSON.parse(text) as { open?: boolean };
        if (typeof parsed.open === "boolean") {
          setWhiteboardOpen(parsed.open);
        }
      } catch {
        /* ignore malformed */
      }
    },
    []
  );

  const { send: sendToggle } = useDataChannel("wb-toggle", handleToggleMessage);

  // Mark call active the moment a peer is observed in the room.
  useEffect(() => {
    if (remoteParticipants.length === 0) return;
    void fetch(`/api/calls/${callId}/status`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "active" }),
    }).catch(() => undefined);
  }, [callId, remoteParticipants.length]);

  // Caller-side 30 s no-answer timeout. Only the initiator polices this so
  // the joining peer doesn't bounce themselves out by mistake. The timer
  // starts after the room is connected and clears the moment a remote peer
  // appears.
  const expiredRef = useRef(false);
  useEffect(() => {
    if (!isInitiator || expiredRef.current) return;
    if (connectionState !== ConnectionState.Connected) return;
    if (remoteParticipants.length > 0) return;

    const handle = setTimeout(() => {
      expiredRef.current = true;
      toast.error(t("noAnswer"));
      void callApi.updateStatus(callId, "missed").catch(() => undefined);
      void room.disconnect().catch(() => undefined);
      router.back();
    }, NO_ANSWER_TIMEOUT_MS);

    return () => clearTimeout(handle);
  }, [
    callId,
    connectionState,
    isInitiator,
    remoteParticipants.length,
    room,
    router,
    t,
  ]);

  const broadcastWhiteboard = useCallback(
    async (open: boolean) => {
      setWhiteboardOpen(open);
      const payload = new TextEncoder().encode(JSON.stringify({ open }));
      try {
        await sendToggle(payload, { reliable: true, topic: "wb-toggle" });
      } catch {
        /* peer might not be connected yet — they'll see it on next toggle */
      }
    },
    [sendToggle]
  );

  const localName = selfName || localParticipant.name || localParticipant.identity;

  return (
    <div
      className="relative flex h-full w-full flex-col bg-neutral-950 text-neutral-100"
      data-role={role}
    >
      <header className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
        <div className="text-sm text-neutral-300">
          <span className="font-medium text-neutral-100">{peerName}</span>
          <span className="ml-2 text-neutral-500">· {t("inCall")}</span>
        </div>
      </header>

      <div className="relative flex-1 overflow-hidden">
        {whiteboardOpen ? (
          <CallStageSplit
            callId={callId}
            peerName={peerName}
            selfName={localName}
            onCloseWhiteboard={() => void broadcastWhiteboard(false)}
          />
        ) : (
          <CallStageGrid peerName={peerName} selfName={localName} />
        )}

        <CallControls
          callId={callId}
          whiteboardOpen={whiteboardOpen}
          onToggleWhiteboard={() => void broadcastWhiteboard(!whiteboardOpen)}
        />
      </div>
    </div>
  );
}
