import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { requireAuth } from "@/shared/api/require-auth";
import { createServerClient } from "@/shared/api/supabase";
import { profilePatchSchema } from "@/shared/lib/schemas";
import type { Json } from "@/shared/types/database.types";

export const dynamic = "force-dynamic";

export type ProfileGetResponse = {
  profile: {
    id: string;
    role: "tutor" | "student";
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    bio: string | null;
    city: string | null;
    country: string | null;
    created_at: string;
    updated_at: string;
  } | null;
  tutorProfile: {
    id: string;
    headline: string | null;
    hourly_rate_min: number | null;
    hourly_rate_max: number | null;
    currency: string;
    experience_years: number | null;
    education: unknown;
    certifications: unknown;
    languages: string[];
    rating: number;
    review_count: number;
    is_verified: boolean;
    is_active: boolean;
    response_time_hours: number | null;
    website_url: string | null;
    linkedin_url: string | null;
    search_document: string;
    search_vector: unknown;
  } | null;
};

export type ProfilePatchResponse = {
  success: true;
};

type ApiErrorResponse = {
  error: string;
};

export async function GET(): Promise<
  NextResponse<ProfileGetResponse | ApiErrorResponse>
> {
  try {
    await cookies();
    const authResult = await requireAuth();
    if ("response" in authResult) {
      return authResult.response;
    }

    const supabase = await createServerClient();
    const [{ data: profile }, { data: tutorProfile }] = await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("id", authResult.auth.userId)
        .maybeSingle(),
      supabase
        .from("tutor_profiles")
        .select("*")
        .eq("id", authResult.auth.userId)
        .maybeSingle(),
    ]);

    return NextResponse.json({ profile: profile ?? null, tutorProfile: tutorProfile ?? null });
  } catch {
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request
): Promise<NextResponse<ProfilePatchResponse | ApiErrorResponse>> {
  try {
    await cookies();
    const authResult = await requireAuth();
    if ("response" in authResult) {
      return authResult.response;
    }

    const parsed = profilePatchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid profile payload" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();
    const data = parsed.data;

    const profileUpdate: {
      full_name?: string;
      bio?: string | null;
      phone?: string | null;
      city?: string | null;
      country?: string | null;
    } = {};
    if (data.fullName != null) profileUpdate.full_name = data.fullName;
    if (data.bio != null) profileUpdate.bio = data.bio;
    if (data.phone != null) profileUpdate.phone = data.phone;
    if (data.city != null) profileUpdate.city = data.city;
    if (data.country != null) profileUpdate.country = data.country;

    if (Object.keys(profileUpdate).length > 0) {
      const { error } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", authResult.auth.userId);
      if (error) throw error;
    }

    const tutorUpdate: {
      headline?: string | null;
      hourly_rate_min?: number | null;
      hourly_rate_max?: number | null;
      experience_years?: number | null;
      languages?: string[];
      website_url?: string | null;
      linkedin_url?: string | null;
      education?: Json;
      certifications?: Json;
    } = {};
    if (data.headline !== undefined) tutorUpdate.headline = data.headline;
    if (data.hourlyRateMin !== undefined) tutorUpdate.hourly_rate_min = data.hourlyRateMin;
    if (data.hourlyRateMax !== undefined) tutorUpdate.hourly_rate_max = data.hourlyRateMax;
    if (data.experienceYears !== undefined) {
      tutorUpdate.experience_years = data.experienceYears;
    }
    if (data.languages !== undefined) tutorUpdate.languages = data.languages;
    if (data.websiteUrl !== undefined) tutorUpdate.website_url = data.websiteUrl;
    if (data.linkedinUrl !== undefined) tutorUpdate.linkedin_url = data.linkedinUrl;
    if (data.education !== undefined) tutorUpdate.education = data.education as Json;
    if (data.certifications !== undefined) {
      tutorUpdate.certifications = data.certifications as Json;
    }

    if (Object.keys(tutorUpdate).length > 0) {
      const { error } = await supabase
        .from("tutor_profiles")
        .update(tutorUpdate)
        .eq("id", authResult.auth.userId);
      if (error) throw error;
    }

    revalidateTag(`profile-${authResult.auth.userId}`, "max");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
