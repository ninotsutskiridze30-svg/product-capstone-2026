import type { NotificationType } from "@/app/api/notifications/route";

type Role = "tutor" | "student";

function str(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

/**
 * Resolve the in-app destination for a notification when it's clicked.
 *
 * Returns a locale-LESS relative path; pass it to `useRouter().push` / `Link`
 * from `@/shared/i18n/navigation`, which prepend the active locale. Malformed
 * payloads degrade to the relevant list page instead of a broken `/undefined`.
 */
export function notificationHref(
  type: NotificationType,
  payload: Record<string, unknown>,
  role: Role
): string {
  switch (type) {
    case "message": {
      // Incoming calls are also type "message" (with a callId) — intentionally
      // link to the conversation rather than auto-joining the call.
      // DB triggers emit snake_case (conversation_id); accept both casings.
      const conversationId = str(payload.conversationId) ?? str(payload.conversation_id);
      return conversationId
        ? `/dashboard/${role}/messages?conversation=${conversationId}`
        : `/dashboard/${role}/messages`;
    }
    case "homework_assigned":
    case "homework_submitted":
    case "homework_graded":
    case "homework_revision_requested":
    case "homework_ai_review_ready": {
      const assignmentId = str(payload.assignment_id);
      return assignmentId
        ? `/dashboard/${role}/homework/${assignmentId}`
        : `/dashboard/${role}/homework`;
    }
    case "booking_request":
    case "booking_accepted":
    case "booking_declined":
    case "booking_expired":
    case "booking_cancelled":
    case "booking_invite":
    case "booking_invite_declined":
    case "session_reminder":
      return `/dashboard/${role}/bookings`;
    case "review":
      // No review detail page; land on the tutor dashboard.
      return `/dashboard/${role}`;
    default:
      return `/dashboard/${role}`;
  }
}
