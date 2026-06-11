import type { GroupMutationResponse } from "@/app/api/groups/route";
import type { GroupCreateInput } from "@/shared/lib/schemas";
import { fetchJson } from "@/shared/api/services/_shared";

export const groupApi = {
  createGroup: async (input: GroupCreateInput) => {
    return fetchJson<GroupMutationResponse>("/api/groups", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
