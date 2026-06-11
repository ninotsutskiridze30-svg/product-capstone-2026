import "server-only";

import { createPublicServerClient } from "@/shared/api/supabase-server";

export type FieldCategoryWithFieldsRow = {
  id: string;
  name: string;
  slug: string;
  fields: {
    id: string;
    name: string;
    slug: string;
    category_id: string;
  }[];
};

export async function listFieldCategoriesWithFields(): Promise<
  FieldCategoryWithFieldsRow[]
> {
  const supabase = createPublicServerClient();
  const { data: categories, error: cErr } = await supabase
    .from("field_categories")
    .select("id, name, slug")
    .order("name");
  if (cErr || !categories?.length) return [];

  const { data: fields, error: fErr } = await supabase
    .from("fields")
    .select("id, name, slug, category_id")
    .order("name");
  if (fErr || !fields) {
    return categories.map((c) => ({ ...c, fields: [] }));
  }

  return categories.map((c) => ({
    ...c,
    fields: fields.filter((f) => f.category_id === c.id),
  }));
}
