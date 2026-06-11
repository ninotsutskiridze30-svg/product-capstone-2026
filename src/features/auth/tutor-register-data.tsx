import { createServerClient } from "@/shared/api/supabase-server";

export type FieldCategoryWithFields = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  fields: {
    id: string;
    name: string;
    slug: string;
    category_id: string;
    icon: string | null;
    is_predefined: boolean;
  }[];
};

export async function loadFieldCategoriesForTutorSignup(): Promise<
  FieldCategoryWithFields[]
> {
  const supabase = await createServerClient();
  const { data: categories, error: catError } = await supabase
    .from("field_categories")
    .select("id, name, slug, icon")
    .order("name");

  if (catError || !categories?.length) {
    return [];
  }

  const { data: fields, error: fieldError } = await supabase
    .from("fields")
    .select("id, name, slug, category_id, icon, is_predefined")
    .order("name");

  if (fieldError || !fields) {
    return categories.map((c) => ({ ...c, fields: [] }));
  }

  return categories.map((c) => ({
    ...c,
    fields: fields.filter((f) => f.category_id === c.id),
  }));
}
