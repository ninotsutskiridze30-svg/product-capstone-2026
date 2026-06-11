import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { GroupCreateInput } from "@/shared/lib/schemas";
import { groupApi } from "./group.api";

export const groupKeys = {
  all: ["groups"] as const,
};

export function useCreateStudentGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: GroupCreateInput) => groupApi.createGroup(input),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["tutor", "groups"] });
    },
  });
}
