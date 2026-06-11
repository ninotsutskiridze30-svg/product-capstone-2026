"use client";

import {
  isTrackReference,
  type TrackReferenceOrPlaceholder,
  useTracks,
  VideoTrack,
} from "@livekit/components-react";
import { Track } from "livekit-client";

import { Whiteboard } from "@/widgets/whiteboard/whiteboard";

type Props = {
  callId: string;
  peerName: string;
  selfName: string;
  onCloseWhiteboard: () => void;
};

/**
 * Whiteboard + cameras split. Mirrors Google Meet's "screen share with
 * picture-in-picture column": board at ~80 % of width, two stacked video
 * tiles (peer on top, self on bottom) at ~20 %.
 */
export function CallStageSplit({
  callId,
  peerName,
  selfName,
  onCloseWhiteboard,
}: Props) {
  const cameraTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false }
  );
  const local = cameraTracks.find((t) => t.participant.isLocal) ?? null;
  const remote = cameraTracks.find((t) => !t.participant.isLocal) ?? null;

  return (
    <div className="flex h-full w-full bg-neutral-950">
      <div className="relative flex-[4] bg-white">
        <Whiteboard callId={callId} onClose={onCloseWhiteboard} />
      </div>
      <div className="flex flex-[1] flex-col gap-2 p-2">
        <CameraStrip track={remote} fallbackName={peerName} />
        <CameraStrip track={local} fallbackName={selfName} mirrored muted />
      </div>
    </div>
  );
}

function CameraStrip({
  track,
  fallbackName,
  mirrored,
  muted,
}: {
  track: TrackReferenceOrPlaceholder | null;
  fallbackName: string;
  mirrored?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="relative flex-1 overflow-hidden rounded-lg bg-neutral-800 ring-1 ring-white/10">
      {track && isTrackReference(track) ? (
        <VideoTrack
          trackRef={track}
          className={mirrored ? "h-full w-full scale-x-[-1] object-cover" : "h-full w-full object-cover"}
          muted={muted}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="bg-brand-primary text-brand-primary-fg flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold">
            {initials(fallbackName)}
          </span>
        </div>
      )}
      <span className="absolute bottom-1 left-1 rounded bg-black/55 px-1.5 py-0.5 text-[11px] text-white">
        {fallbackName}
      </span>
    </div>
  );
}

function initials(name: string) {
  return (
    name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}
