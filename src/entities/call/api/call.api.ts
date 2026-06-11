import { fetchJson } from "@/shared/api/services/_shared";

export type CallStatus = "ringing" | "active" | "ended" | "declined" | "missed";

export type CallSummary = {
  id: string;
  conversation_id: string;
  livekit_room: string;
  status: CallStatus;
  initiated_by: string;
  created_at: string;
};

export type CallTokenPayload = {
  token: string;
  url: string;
  room: string;
  isInitiator: boolean;
  peerName: string;
  identity: string;
  displayName: string;
};

export const callApi = {
  startCall: (input: { conversationId: string }) =>
    fetchJson<{ call: CallSummary }>("/api/calls", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  getToken: (callId: string) =>
    fetchJson<CallTokenPayload>(`/api/calls/${callId}/token`, { method: "POST" }),

  updateStatus: (
    callId: string,
    status: Exclude<CallStatus, "ringing">
  ) =>
    fetchJson<{ ok: true }>(`/api/calls/${callId}/status`, {
      method: "POST",
      body: JSON.stringify({ status }),
    }),

  getSnapshotUrls: (snapshotId: string) =>
    fetchJson<{ imageUrl: string; snapshotUrl: string }>(
      `/api/whiteboard-snapshots?id=${snapshotId}`
    ),
};
