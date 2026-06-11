import "server-only";

import { createPublicServerClient } from "@/shared/api/supabase-server";
import type { TutorProfile } from "@/shared/types/database.types";
import { expandCalendarEventsForRange } from "@/shared/lib/calendar-recurrence";

export type PublicTutorRow = TutorProfile & {
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    city: string | null;
    country: string | null;
  } | null;
};

export type ListPublicTutorsParams = {
  search?: string;
  categoryId?: string;
  fieldId?: string;
  priceMin?: number;
  priceMax?: number;
  minRating?: number;
  city?: string;
  language?: string;
  availableOn?: string;
  offset?: number;
  limit?: number;
};

const PAGE_SIZE = 12;

export async function listPublicTutors(
  params: ListPublicTutorsParams = {}
): Promise<{ tutors: PublicTutorRow[]; totalApprox: number }> {
  const supabase = createPublicServerClient();
  const limit = params.limit ?? PAGE_SIZE;
  const offset = params.offset ?? 0;

  let tutorIds: string[] | null = null;

  if (params.fieldId) {
    const { data: tf } = await supabase
      .from("tutor_fields")
      .select("tutor_id")
      .eq("field_id", params.fieldId);
    tutorIds = [...new Set((tf ?? []).map((r) => r.tutor_id))];
    if (tutorIds.length === 0) {
      return { tutors: [], totalApprox: 0 };
    }
  }

  if (params.categoryId && !params.fieldId) {
    const { data: fieldsInCat } = await supabase
      .from("fields")
      .select("id")
      .eq("category_id", params.categoryId);
    const fids = (fieldsInCat ?? []).map((f) => f.id);
    if (fids.length === 0) {
      return { tutors: [], totalApprox: 0 };
    }
    const { data: tf } = await supabase
      .from("tutor_fields")
      .select("tutor_id")
      .in("field_id", fids);
    tutorIds = [...new Set((tf ?? []).map((r) => r.tutor_id))];
    if (tutorIds.length === 0) {
      return { tutors: [], totalApprox: 0 };
    }
  }

  if (params.search?.trim()) {
    const { data: searched, error } = await supabase.rpc("search_active_tutors", {
      p_query: params.search.trim(),
    });
    if (error) {
      return { tutors: [], totalApprox: 0 };
    }
    const ids = (searched ?? []).map((r) => r.id);
    if (ids.length === 0) {
      return { tutors: [], totalApprox: 0 };
    }
    tutorIds = tutorIds ? tutorIds.filter((id) => ids.includes(id)) : ids;
    if (tutorIds.length === 0) {
      return { tutors: [], totalApprox: 0 };
    }
  }

  if (params.city?.trim()) {
    const { data: cityProfiles } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "tutor")
      .ilike("city", `%${params.city.trim()}%`);
    const cityIds = [...new Set((cityProfiles ?? []).map((p) => p.id))];
    tutorIds =
      tutorIds != null
        ? tutorIds.filter((id) => cityIds.includes(id))
        : cityIds;
    if (tutorIds.length === 0) {
      return { tutors: [], totalApprox: 0 };
    }
  }

  let query = supabase
    .from("tutor_profiles")
    .select(
      `
      *,
      profiles (
        id,
        full_name,
        avatar_url,
        city,
        country
      )
    `,
      { count: "exact" }
    )
    .eq("is_active", true);

  if (tutorIds) {
    query = query.in("id", tutorIds);
  }

  if (
    params.priceMin != null &&
    params.priceMax != null &&
    !Number.isNaN(params.priceMin) &&
    !Number.isNaN(params.priceMax)
  ) {
    query = query.lte("hourly_rate_min", params.priceMax);
    query = query.gte("hourly_rate_max", params.priceMin);
  }
  if (
    params.minRating != null &&
    !Number.isNaN(Number(params.minRating))
  ) {
    query = query.gte("rating", Number(params.minRating));
  }
  if (params.language?.trim()) {
    query = query.contains("languages", [params.language.trim()]);
  }

  if (params.availableOn) {
    const rangeStart = new Date(params.availableOn);
    rangeStart.setUTCHours(0, 0, 0, 0);
    const rangeEnd = new Date(rangeStart);
    rangeEnd.setUTCDate(rangeEnd.getUTCDate() + 1);

    const { data: nonRecurring } = await supabase
      .from("calendar_events")
      .select("tutor_id")
      .eq("type", "available")
      .or("is_recurring.is.null,is_recurring.eq.false")
      .lt("start_time", rangeEnd.toISOString())
      .gt("end_time", rangeStart.toISOString());

    const { data: recurringRows } = await supabase
      .from("calendar_events")
      .select(
        "id,tutor_id,title,start_time,end_time,type,color,is_recurring,recurrence_rule,recurrence_until"
      )
      .eq("type", "available")
      .eq("is_recurring", true);

    const recurringOnDay = new Set(
      expandCalendarEventsForRange(recurringRows ?? [], rangeStart, rangeEnd)
        .map((e) => e.tutor_id)
        .filter((id): id is string => Boolean(id))
    );

    const availIds = [
      ...new Set([
        ...(nonRecurring ?? []).map((e) => e.tutor_id),
        ...recurringOnDay,
      ]),
    ];
    if (availIds.length === 0) {
      return { tutors: [], totalApprox: 0 };
    }
    query = query.in("id", availIds);
  }

  query = query
    .order("rating", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error || !data) {
    return { tutors: [], totalApprox: 0 };
  }

  return {
    tutors: data as unknown as PublicTutorRow[],
    totalApprox: count ?? data.length,
  };
}

export async function getFieldLabelsForTutors(
  tutorIds: string[]
): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (tutorIds.length === 0) return map;
  const supabase = createPublicServerClient();
  const { data: tfs, error } = await supabase
    .from("tutor_fields")
    .select("tutor_id, field_id, custom_field_name")
    .in("tutor_id", tutorIds);
  if (error || !tfs?.length) return map;

  const fieldIds = [...new Set(tfs.map((t) => t.field_id))];
  const { data: fieldRows } = await supabase
    .from("fields")
    .select("id, name")
    .in("id", fieldIds);
  const nameById = new Map(
    (fieldRows ?? []).map((f) => [f.id, f.name] as const)
  );

  for (const row of tfs) {
    const name =
      nameById.get(row.field_id) ?? row.custom_field_name ?? "Subject";
    const list = map.get(row.tutor_id) ?? [];
    list.push(name);
    map.set(row.tutor_id, list);
  }
  return map;
}

export type TutorPublicDetail = {
  tutor: TutorProfile;
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    bio: string | null;
    city: string | null;
    country: string | null;
  };
  fields: {
    field_id: string;
    name: string;
    proficiency_level: string | null;
    years_of_experience: number | null;
  }[];
  images: {
    id: string;
    url: string;
    type: "cover" | "gallery" | "certificate";
    sort_order: number;
  }[];
  reviews: {
    id: string;
    rating: number;
    content: string | null;
    created_at: string;
    studentLabel: string;
  }[];
  ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>;
};

export async function getTutorPublicDetail(
  tutorId: string
): Promise<TutorPublicDetail | null> {
  const supabase = createPublicServerClient();

  const { data: tutor, error: tErr } = await supabase
    .from("tutor_profiles")
    .select("*")
    .eq("id", tutorId)
    .eq("is_active", true)
    .maybeSingle();

  if (tErr || !tutor) return null;

  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, phone, bio, city, country")
    .eq("id", tutorId)
    .maybeSingle();

  if (pErr || !profile) return null;

  const { data: tf } = await supabase
    .from("tutor_fields")
    .select(
      "field_id, proficiency_level, years_of_experience, custom_field_name"
    )
    .eq("tutor_id", tutorId);

  const tfRows = tf ?? [];
  const fieldIds = [...new Set(tfRows.map((r) => r.field_id))];
  const { data: fieldRows } = await supabase
    .from("fields")
    .select("id, name")
    .in("id", fieldIds);
  const nameById = new Map(
    (fieldRows ?? []).map((f) => [f.id, f.name] as const)
  );

  const fields = tfRows.map((r) => ({
    field_id: r.field_id,
    name: nameById.get(r.field_id) ?? r.custom_field_name ?? "Subject",
    proficiency_level: r.proficiency_level,
    years_of_experience: r.years_of_experience,
  }));

  const { data: images } = await supabase
    .from("tutor_images")
    .select("id, url, type, sort_order")
    .eq("tutor_id", tutorId)
    .order("sort_order", { ascending: true });

  const { data: reviewsRaw } = await supabase
    .from("reviews")
    .select("id, rating, content, created_at")
    .eq("tutor_id", tutorId)
    .eq("is_visible", true)
    .order("created_at", { ascending: false })
    .limit(50);

  const ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  const reviews =
    reviewsRaw?.map((r) => {
      const k = r.rating as 1 | 2 | 3 | 4 | 5;
      if (k >= 1 && k <= 5) ratingBreakdown[k]++;
      return {
        id: r.id,
        rating: r.rating,
        content: r.content,
        created_at: r.created_at,
        studentLabel: "Student",
      };
    }) ?? [];

  return {
    tutor,
    profile,
    fields,
    images: images ?? [],
    reviews,
    ratingBreakdown,
  };
}

export type TutorCalendarEventRow = {
  id: string;
  title: string | null;
  start_time: string;
  end_time: string;
  type:
    | "available"
    | "booked"
    | "blocked"
    | "lesson"
    | "pending"
    | "confirmed"
    | "invite_pending";
  color: string | null;
  is_recurring: boolean;
  recurrence_rule: unknown;
  recurrence_until: string | null;
};

/** Types safe to show on the public tutor profile (no pending invites or booked lessons). */
const PUBLIC_CALENDAR_EVENT_TYPES: TutorCalendarEventRow["type"][] = [
  "available",
  "blocked",
];

export async function getTutorCalendarEvents(
  tutorId: string,
  options?: { forPublicView?: boolean }
): Promise<TutorCalendarEventRow[]> {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("calendar_events")
    .select(
      "id, title, start_time, end_time, type, color, is_recurring, recurrence_rule, recurrence_until"
    )
    .eq("tutor_id", tutorId)
    .order("start_time", { ascending: true });
  if (error || !data) return [];
  if (options?.forPublicView) {
    return data.filter((row) =>
      PUBLIC_CALENDAR_EVENT_TYPES.includes(row.type as TutorCalendarEventRow["type"])
    );
  }
  return data as TutorCalendarEventRow[];
}
