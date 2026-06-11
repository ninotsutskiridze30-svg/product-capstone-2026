import type { SupabaseClient } from "@supabase/supabase-js";

import type { TutorRegisterDetailsValues } from "@/features/auth/schemas";
import type { Database } from "@/shared/types/database.types";

export async function applyTutorRegistrationWrites(
  supabase: SupabaseClient<Database>,
  userId: string,
  values: TutorRegisterDetailsValues
): Promise<{ error: { message: string } | null }> {
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      role: "tutor",
      full_name: values.fullName,
    })
    .eq("id", userId);

  if (profileError) return { error: profileError };

  const { error: tpError } = await supabase.from("tutor_profiles").insert({
    id: userId,
    headline: values.headline,
    hourly_rate_min: values.hourlyRateMin,
    hourly_rate_max: values.hourlyRateMax,
    is_active: true,
  });

  if (tpError) return { error: tpError };

  const rows = values.fieldIds.map((fieldId) => ({
    tutor_id: userId,
    field_id: fieldId,
    proficiency_level: values.proficiencyLevel,
  }));

  const { error: tfError } = await supabase.from("tutor_fields").insert(rows);
  if (tfError) return { error: tfError };

  return { error: null };
}
