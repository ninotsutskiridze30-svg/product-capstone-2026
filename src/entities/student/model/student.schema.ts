import { z } from "zod";

export const StudentDashboardSchema = z.object({
  sessions: z.array(
    z.object({
      id: z.string(),
      tutor_id: z.string(),
      status: z.string(),
      type: z.string(),
      created_at: z.string(),
      tutorName: z.string(),
    })
  ),
  requests: z.array(
    z.object({
      id: z.string(),
      tutor_id: z.string(),
      status: z.string(),
      proposed_start: z.string().nullable(),
      tutorName: z.string(),
    })
  ),
  favoriteTutors: z.array(
    z.object({
      tutor_id: z.string(),
      tutorName: z.string(),
    })
  ),
});

export type StudentDashboard = z.infer<typeof StudentDashboardSchema>;
