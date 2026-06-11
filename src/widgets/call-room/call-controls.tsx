"use client";

import { useLocalParticipant, useRoomContext } from "@livekit/components-react";
import {
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  PencilRuler,
  Phone,
  Video,
  VideoOff,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { callApi } from "@/entities/call/api/call.api";
import { cn } from "@/shared/lib/utils";

type Props = {
  callId: string;
  whiteboardOpen: boolean;
  onToggleWhiteboard: () => void;
};

export function CallControls({
  callId,
  whiteboardOpen,
  onToggleWhiteboard,
}: Props) {
  const t = useTranslations("call");
  const room = useRoomContext();
  const {
    isMicrophoneEnabled,
    isCameraEnabled,
    isScreenShareEnabled,
    localParticipant,
  } = useLocalParticipant();
  const [busy, setBusy] = useState(false);

  async function toggleMic() {
    setBusy(true);
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("micError"));
    } finally {
      setBusy(false);
    }
  }

  async function toggleCam() {
    setBusy(true);
    try {
      await localParticipant.setCameraEnabled(!isCameraEnabled);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("cameraError"));
    } finally {
      setBusy(false);
    }
  }

  async function toggleScreen() {
    setBusy(true);
    try {
      await localParticipant.setScreenShareEnabled(!isScreenShareEnabled);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("screenError"));
    } finally {
      setBusy(false);
    }
  }

  async function leave() {
    setBusy(true);
    try {
      await callApi.updateStatus(callId, "ended").catch(() => undefined);
      await room.disconnect();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 z-30 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-neutral-900/85 px-3 py-2 shadow-2xl backdrop-blur">
        <ControlButton
          active={isMicrophoneEnabled}
          onClick={toggleMic}
          disabled={busy}
          label={isMicrophoneEnabled ? t("micOn") : t("micOff")}
        >
          {isMicrophoneEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </ControlButton>

        <ControlButton
          active={isCameraEnabled}
          onClick={toggleCam}
          disabled={busy}
          label={isCameraEnabled ? t("camOn") : t("camOff")}
        >
          {isCameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
        </ControlButton>

        <ControlButton
          active={isScreenShareEnabled}
          onClick={toggleScreen}
          disabled={busy}
          label={isScreenShareEnabled ? t("stopShareScreen") : t("shareScreen")}
        >
          {isScreenShareEnabled ? <MonitorOff size={20} /> : <Monitor size={20} />}
        </ControlButton>

        <ControlButton
          active={whiteboardOpen}
          onClick={onToggleWhiteboard}
          label={whiteboardOpen ? t("closeWhiteboard") : t("openWhiteboard")}
        >
          <PencilRuler size={20} />
        </ControlButton>

        <button
          type="button"
          onClick={() => void leave()}
          disabled={busy}
          aria-label={t("endCall")}
          className="bg-danger ml-1 flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium text-white shadow-sm transition-colors hover:opacity-90 disabled:opacity-50"
        >
          <Phone size={18} className="rotate-[135deg]" />
          <span className="hidden md:inline">{t("endCall")}</span>
        </button>
      </div>
    </div>
  );
}

function ControlButton({
  active,
  onClick,
  disabled,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
        active
          ? "bg-neutral-700 text-white hover:bg-neutral-600"
          : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700",
        disabled && "opacity-50"
      )}
    >
      {children}
    </button>
  );
}
