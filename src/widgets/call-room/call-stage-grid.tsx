"use client";

import {
  isTrackReference,
  type TrackReferenceOrPlaceholder,
  useLocalParticipant,
  useTracks,
  VideoTrack,
} from "@livekit/components-react";
import { Mic, MicOff, VideoOff } from "lucide-react";
import { Track } from "livekit-client";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { cn } from "@/shared/lib/utils";

type Props = {
  peerName: string;
  selfName: string;
};

type Layout = {
  big: TrackReferenceOrPlaceholder | null;
  pip: TrackReferenceOrPlaceholder | null;
  extra: TrackReferenceOrPlaceholder | null;
};

/**
 * Decide what fills the big stage vs the floating tiles.
 *
 * Priority for the big tile:
 *   1. Peer's screen-share (someone is presenting)
 *   2. Peer's camera (normal call)
 *   3. null (no peer yet — caller-side "waiting" state)
 *
 * The PiP is always the local camera. If the local user is also sharing their
 * screen, or if the peer's camera got demoted because they're screen-sharing,
 * a second `extra` tile slots in next to the PiP.
 */
export function pickLayout(
  cameras: TrackReferenceOrPlaceholder[],
  screens: TrackReferenceOrPlaceholder[]
): Layout {
  const localCam = cameras.find((c) => c.participant.isLocal) ?? null;
  const remoteCam = cameras.find((c) => !c.participant.isLocal) ?? null;
  const localScreen =
    screens.find((s) => s.participant.isLocal && isTrackReference(s)) ?? null;
  const remoteScreen =
    screens.find((s) => !s.participant.isLocal && isTrackReference(s)) ?? null;

  if (remoteScreen) {
    // Peer is presenting — their camera gets demoted next to our PiP.
    return { big: remoteScreen, pip: localCam, extra: remoteCam };
  }
  if (localScreen) {
    // We're presenting — show peer big, our screen preview as a third tile.
    return { big: remoteCam, pip: localCam, extra: localScreen };
  }
  return { big: remoteCam, pip: localCam, extra: null };
}

export function CallStageGrid({ peerName, selfName }: Props) {
  const t = useTranslations("call");
  const cameraTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false }
  );
  const screenTracks = useTracks(
    [{ source: Track.Source.ScreenShare, withPlaceholder: false }],
    { onlySubscribed: false }
  );

  const { isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();

  const { big, pip, extra } = useMemo(
    () => pickLayout(cameraTracks, screenTracks),
    [cameraTracks, screenTracks]
  );

  return (
    <div className="relative h-full w-full overflow-hidden bg-neutral-950">
      <div className="absolute inset-0">
        <BigTile track={big} fallbackName={peerName} waitingLabel={t("waitingForPeer")} />
      </div>

      <div className="pointer-events-none absolute bottom-24 left-4 z-20 flex items-end gap-3 md:bottom-28">
        {extra ? (
          <PipTile
            track={extra}
            fallbackName={
              extra.source === Track.Source.ScreenShare ? selfName : peerName
            }
            muted
            badge={extra.source === Track.Source.ScreenShare ? t("shareScreen") : null}
          />
        ) : null}
        <PipTile
          track={pip}
          fallbackName={selfName}
          muted
          mirrored
          showLocalIndicators
          isMicMuted={!isMicrophoneEnabled}
          isCamOff={!isCameraEnabled}
        />
      </div>
    </div>
  );
}

function BigTile({
  track,
  fallbackName,
  waitingLabel,
}: {
  track: TrackReferenceOrPlaceholder | null;
  fallbackName: string;
  waitingLabel: string;
}) {
  if (track && isTrackReference(track)) {
    return (
      <div className="relative h-full w-full bg-black">
        <VideoTrack
          trackRef={track}
          className="h-full w-full object-cover"
        />
        <div className="absolute bottom-4 left-4 rounded-md bg-black/55 px-3 py-1 text-sm text-white backdrop-blur">
          {fallbackName}
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-neutral-900 text-neutral-200">
      <Avatar name={fallbackName} size={120} />
      <p className="text-lg font-medium">{fallbackName}</p>
      {!track ? (
        <p className="text-sm text-neutral-400">{waitingLabel}</p>
      ) : null}
    </div>
  );
}

function PipTile({
  track,
  fallbackName,
  muted,
  mirrored,
  badge,
  showLocalIndicators,
  isMicMuted,
  isCamOff,
}: {
  track: TrackReferenceOrPlaceholder | null;
  fallbackName: string;
  muted?: boolean;
  mirrored?: boolean;
  badge?: string | null;
  showLocalIndicators?: boolean;
  isMicMuted?: boolean;
  isCamOff?: boolean;
}) {
  return (
    <div
      className={cn(
        "pointer-events-auto relative overflow-hidden rounded-xl bg-neutral-800 shadow-2xl ring-1 ring-white/10",
        "h-24 w-40 md:h-[200px] md:w-[400px]"
      )}
    >
      {track && isTrackReference(track) && !isCamOff ? (
        <VideoTrack
          trackRef={track}
          className={cn("h-full w-full object-cover", mirrored && "scale-x-[-1]")}
          muted={muted}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-neutral-900">
          <Avatar name={fallbackName} size={48} />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent px-2 py-1">
        <span className="truncate text-xs text-white">
          {badge ?? fallbackName}
        </span>
        {showLocalIndicators ? (
          <span className="flex items-center gap-1">
            {isMicMuted ? (
              <MicOff size={14} className="text-danger" aria-hidden />
            ) : (
              <Mic size={14} className="text-white/70" aria-hidden />
            )}
            {isCamOff ? (
              <VideoOff size={14} className="text-danger" aria-hidden />
            ) : null}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function Avatar({ name, size }: { name: string; size: number }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="bg-brand-primary text-brand-primary-fg flex items-center justify-center rounded-full font-semibold"
      style={{ height: size, width: size, fontSize: size / 2.5 }}
    >
      {initials || "?"}
    </div>
  );
}
