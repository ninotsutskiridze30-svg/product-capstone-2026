import { z } from "zod";

export const TutorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nullable(),
  headline: z.string().nullable(),
  bio: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),
  minRate: z.number().nullable(),
  maxRate: z.number().nullable(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number(),
  languages: z.array(z.string()),
  isVerified: z.boolean(),
  isActive: z.boolean(),
  fieldLabels: z.array(z.string()).optional(),
});

export const TutorListSchema = z.array(TutorSchema);

export const TutorDashboardOverviewSchema = z.object({
  pendingBookings: z.number(),
  upcomingSessions: z.number(),
  totalStudentsApprox: z.number(),
  rating: z.number(),
  reviewCount: z.number(),
  unreadMessages: z.number(),
  monthlyEarnings: z.number(),
  upcomingList: z.array(
    z.object({
      id: z.string(),
      created_at: z.string(),
      studentName: z.string(),
      status: z.string(),
    })
  ),
  pendingList: z.array(
    z.object({
      id: z.string(),
      studentName: z.string(),
      message: z.string().nullable(),
      proposed_start: z.string().nullable(),
      proposed_end: z.string().nullable(),
      type: z.string(),
    })
  ),
  notifications: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      body: z.string().nullable(),
      created_at: z.string(),
      is_read: z.boolean(),
      type: z.string(),
    })
  ),
});

export type Tutor = z.infer<typeof TutorSchema>;
export type TutorList = z.infer<typeof TutorListSchema>;
export type TutorDashboardOverview = z.infer<typeof TutorDashboardOverviewSchema>;
