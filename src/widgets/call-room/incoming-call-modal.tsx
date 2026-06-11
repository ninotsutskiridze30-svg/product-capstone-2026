"use client";

import { Phone, PhoneOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { callApi } from "@/entities/call/api/call.api";
import { useAuthUserId } from "@/entities/user/api/user.query";
import { createBrowserClient } from "@/shared/api/supabase-browser";
import {
  type CallSessionChange,
  useCallSessionsChannel,
} from "@/shared/hooks/useRealtime";
import { useRouter } from "@/shared/i18n/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/ui/dialog";

type IncomingCall = {
  id: string;
  conversationId: string;
  callerName: string;
};

const RING_TIMEOUT_MS = 30_000;

/**
 * Full-screen-style modal that pops when another user calls. Blocks accidental
 * dismissal (must explicitly accept or decline), plays a synth ring, and
 * auto-marks the call as `missed` after 30 s of no answer. Mounted globally
 * inside the dashboard layout.
 */
export function IncomingCallModal() {
  const t = useTranslations("call");
  const router = useRouter();
  const userId = useAuthUserId();
  const [incoming, setIncoming] = useState<IncomingCall | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    setIncoming(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const onCallSessionChange = useCallback(
    async (change: CallSessionChange) => {
      const row = change.row;
      if (change.event === "INSERT") {
        if (row.status !== "ringing" || row.initiated_by === userId) return;
        const supabase = createBrowserClient();
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", row.initiated_by)
          .maybeSingle();
        setIncoming({
          id: row.id,
          conversationId: row.conversation_id,
          callerName: profile?.full_name ?? t("someone"),
        });
        return;
      }
      // UPDATE — if the call we're showing transitioned out of "ringing"
      // (caller cancelled, call accepted elsewhere, etc.) close ourselves.
      setIncoming((current) =>
        current?.id === row.id && row.status !== "ringing" ? null : current
      );
    },
    [t, userId]
  );

  useCallSessionsChannel(userId, onCallSessionChange);

  // 30 s no-answer timer + best-effort ringtone. Both effects key on
  // `incoming?.id` so they re-run for every fresh ring.
  useEffect(() => {
    if (!incoming) return;
    const callId = incoming.id;
    timeoutRef.current = setTimeout(() => {
      void callApi.updateStatus(callId, "missed").catch(() => undefined);
      setIncoming((current) => (current?.id === callId ? null : current));
    }, RING_TIMEOUT_MS);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [incoming]);

  useEffect(() => {
    if (!incoming) return;
    const ringer = startRingtone();
    return () => ringer.stop();
  }, [incoming]);

  const accept = useCallback(() => {
    if (!incoming) return;
    const id = incoming.id;
    dismiss();
    router.push(`/call/${id}`);
  }, [incoming, dismiss, router]);

  const decline = useCallback(async () => {
    if (!incoming) return;
    const id = incoming.id;
    dismiss();
    try {
      await callApi.updateStatus(id, "declined");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("declineFailed"));
    }
  }, [incoming, dismiss, t]);

  return (
    <Dialog
      open={incoming !== null}
      onOpenChange={(next) => {
        // We never let the modal close itself implicitly — accept/decline
        // are the only exits. Ignore overlay clicks / programmatic closes.
        if (!next) return;
      }}
    >
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
        className="bg-background w-full max-w-md gap-6 rounded-2xl p-8 text-center"
      >
        <div className="flex flex-col items-center gap-4">
          <RingAvatar name={incoming?.callerName ?? ""} />
          <div className="space-y-1">
            <DialogTitle className="text-2xl font-semibold">
              {incoming?.callerName ?? t("someone")}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {t("ringing")}
            </DialogDescription>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-center gap-10">
          <button
            type="button"
            onClick={() => void decline()}
            aria-label={t("decline")}
            className="bg-danger flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 hover:opacity-90"
          >
            <PhoneOff size={28} />
          </button>
          <button
            type="button"
            onClick={() => void accept()}
            aria-label={t("accept")}
            className="bg-success flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 hover:opacity-90"
          >
            <Phone size={28} />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RingAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative">
      <span className="bg-brand-primary/30 absolute inset-0 -m-2 animate-ping rounded-full" />
      <span className="bg-brand-primary/20 absolute inset-0 -m-1 animate-pulse rounded-full" />
      <div className="bg-brand-primary text-brand-primary-fg relative flex h-20 w-20 items-center justify-center rounded-full text-2xl font-semibold shadow-xl">
        {initials || "?"}
      </div>
    </div>
  );
}

type Ringer = { stop: () => void };

/**
 * Web Audio ringtone. Two short beeps (about 0.4 s each), repeating every
 * ~2 s. Falls back to a no-op if AudioContext is unavailable or stays
 * suspended (autoplay-block on first paint with no user gesture).
 */
function startRingtone(): Ringer {
  if (typeof window === "undefined") {
    return { stop: () => undefined };
  }
  const AudioCtor =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtor) return { stop: () => undefined };

  let stopped = false;
  let ctx: AudioContext | null = null;
  try {
    ctx = new AudioCtor();
  } catch {
    return { stop: () => undefined };
  }
  const audioCtx = ctx;
  void audioCtx.resume().catch(() => undefined);

  const playBeep = (frequency: number, startAt: number, duration: number) => {
    if (stopped) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0, startAt);
    gain.gain.linearRampToValueAtTime(0.18, startAt + 0.02);
    gain.gain.setValueAtTime(0.18, startAt + duration - 0.05);
    gain.gain.linearRampToValueAtTime(0, startAt + duration);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(startAt);
    osc.stop(startAt + duration);
  };

  const cycle = () => {
    if (stopped) return;
    const now = audioCtx.currentTime;
    playBeep(880, now, 0.35);
    playBeep(660, now + 0.45, 0.35);
  };

  cycle();
  const interval = window.setInterval(cycle, 2000);

  return {
    stop: () => {
      stopped = true;
      window.clearInterval(interval);
      void audioCtx.close().catch(() => undefined);
    },
  };
}
