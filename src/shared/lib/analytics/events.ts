import { getPostHog } from "./posthog-client";

/**
 * Typed event helper for the Sakheli analytics schema.
 *
 * Source of truth for the schema: 03-build/analytics/dashboard-link.md
 *
 * Usage:
 *   import { track } from "@/shared/lib/analytics/events";
 *   await track("booking_confirmed", { locale, tutor_id, slot_start, price });
 *
 * The helper is fire-and-forget — it never throws and never blocks the UI.
 */

export type EventMap = {
  home_viewed:                 { locale: string };
  tutor_profile_viewed:        { locale: string; tutor_id: string; subject?: string };
  signup_started:              { locale: string; role: "student" | "tutor" };
  signup_completed:            { locale: string; role: "student" | "tutor" };
  user_signed_in:              { method: "email" | "google" };
  user_signed_out:             Record<string, never>;
  tutor_connection_requested:  { tutor_id: string };
  booking_started:             { locale: string; tutor_id: string };
  booking_confirmed:           { locale: string; tutor_id: string; slot_start: string; price?: number };
  booking_invite_accepted:     { booking_id: string; tutor_id: string };
  booking_invite_declined:     { booking_id: string; tutor_id: string };
  review_submitted:            { tutor_id: string; rating: number; has_content: boolean };
  video_call_started:          { locale: string; role: "student" | "tutor"; booking_id: string };
  whiteboard_opened:           { locale: string; booking_id: string };
  whiteboard_first_stroke:     { locale: string; booking_id: string };
  video_call_ended:            { locale: string; role: "student" | "tutor"; booking_id: string; duration_seconds: number };
  homework_created:            { locale: string; booking_id?: string; has_attachment: boolean };
  homework_submitted:          { locale: string; homework_id: string };
  homework_graded:             { locale: string; homework_id: string; score?: number };
};

export type EventName = keyof EventMap;

export async function track<E extends EventName>(
  event: E,
  properties: EventMap[E]
): Promise<void> {
  try {
    const ph = await getPostHog();
    if (!ph) return;
    ph.capture(event, properties as Record<string, unknown>);
  } catch {
    // never let analytics break the UI
  }
}

export async function identify(
  distinctId: string,
  properties?: { role?: "student" | "tutor"; locale?: string }
): Promise<void> {
  try {
    const ph = await getPostHog();
    if (!ph) return;
    ph.identify(distinctId, properties);
  } catch {
    // ignore
  }
}

export async function resetIdentity(): Promise<void> {
  try {
    const ph = await getPostHog();
    if (!ph) return;
    ph.reset();
  } catch {
    // ignore
  }
}
