export type TutorFilters = {
  field?: string;
  city?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  language?: string;
  type?: "online" | "onsite";
  date?: string;
  q?: string;
  page?: number;
  limit?: number;
};

export const queryKeys = {
  tutors: {
    all: ["tutors"] as const,
    list: (filters: TutorFilters) => ["tutors", "list", filters] as const,
    detail: (slug: string) => ["tutors", "detail", slug] as const,
  },
  bookings: {
    all: ["bookings"] as const,
    list: (userId: string) => ["bookings", userId] as const,
    detail: (id: string) => ["bookings", "detail", id] as const,
  },
  calendar: {
    events: (tutorId: string) => ["calendar", tutorId] as const,
  },
  conversations: {
    all: ["conversations"] as const,
    list: (userId: string) => ["conversations", userId] as const,
    messages: (conversationId: string) =>
      ["messages", conversationId] as const,
  },
  notifications: {
    list: (userId: string) => ["notifications", userId] as const,
  },
  groups: {
    all: ["groups"] as const,
    list: (tutorId: string) => ["groups", tutorId] as const,
    detail: (id: string) => ["groups", "detail", id] as const,
  },
  profile: {
    current: ["profile", "current"] as const,
  },
  reviews: {
    tutor: (tutorId: string) => ["reviews", tutorId] as const,
  },
} as const;
