import { fetchJson } from "@/shared/api/services/_shared";
import type {
  GroupCreateInput,
  GroupMemberInput,
  GroupUpdateInput,
} from "@/shared/lib/schemas/group.schema";

export type GroupDto = {
  id: string;
  tutor_id: string;
  name: string;
  field_id: string;
  max_students: number;
  current_count: number;
  description: string | null;
  is_active: boolean;
};

export async function getGroups(tutorId: string) {
  return fetchJson<{ groups: GroupDto[] }>(`/api/groups?tutorId=${tutorId}`);
}

export async function getGroupDetail(groupId: string) {
  return fetchJson<{
    group: GroupDto;
    members: {
      id: string;
      student_id: string;
      student_name: string | null;
    }[];
  }>(`/api/groups/${groupId}`);
}

export async function createGroup(input: GroupCreateInput) {
  return fetchJson<{ group: GroupDto }>("/api/groups", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateGroup(id: string, input: GroupUpdateInput) {
  return fetchJson<{ group: GroupDto }>(`/api/groups/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteGroup(id: string) {
  return fetchJson<{ id: string; deleted: true }>(`/api/groups/${id}`, {
    method: "DELETE",
  });
}

export async function addGroupMember(id: string, input: GroupMemberInput) {
  return fetchJson<{ success: true }>(`/api/groups/${id}/members`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function removeGroupMember(id: string, input: GroupMemberInput) {
  return fetchJson<{ success: true }>(`/api/groups/${id}/members`, {
    method: "DELETE",
    body: JSON.stringify(input),
  });
}
