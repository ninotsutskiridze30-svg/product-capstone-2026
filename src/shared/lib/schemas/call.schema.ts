import { z } from "zod";

export const callCreateSchema = z.object({
  conversationId: z.string().uuid(),
});

export const callStatusUpdateSchema = z.object({
  status: z.enum(["active", "ended", "declined", "missed"]),
});

export type CallCreateInput = z.infer<typeof callCreateSchema>;
export type CallStatusUpdateInput = z.infer<typeof callStatusUpdateSchema>;
