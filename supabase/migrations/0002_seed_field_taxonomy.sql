-- Reference data for tutor signup (categories + predefined fields).
-- Mirrors supabase/seed.sql so hosted projects get data without relying on seed runs.

INSERT INTO public.field_categories (name, slug, icon) VALUES
  ('Sciences', 'sciences', 'flask'),
  ('Languages', 'languages', 'languages'),
  ('Mathematics', 'mathematics', 'sigma'),
  ('Arts', 'arts', 'palette'),
  ('Music', 'music', 'music'),
  ('Technology', 'technology', 'cpu'),
  ('Sports', 'sports', 'trophy'),
  ('Business', 'business', 'briefcase')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.fields (name, slug, category_id, icon, is_predefined)
SELECT v.name, v.slug, c.id, v.icon, true
FROM (VALUES
  ('Biology', 'biology', 'sciences', 'leaf'),
  ('Chemistry', 'chemistry', 'sciences', 'atom'),
  ('Physics', 'physics', 'sciences', 'orbit'),
  ('Environmental Science', 'environmental-science', 'sciences', 'globe'),
  ('Psychology', 'psychology', 'sciences', 'brain'),
  ('Earth Science', 'earth-science', 'sciences', 'mountain'),
  ('English', 'english', 'languages', 'book'),
  ('Spanish', 'spanish', 'languages', 'book'),
  ('French', 'french', 'languages', 'book'),
  ('German', 'german', 'languages', 'book'),
  ('Italian', 'italian', 'languages', 'book'),
  ('Algebra', 'algebra', 'mathematics', 'function'),
  ('Calculus', 'calculus', 'mathematics', 'integral'),
  ('Geometry', 'geometry', 'mathematics', 'triangle'),
  ('Statistics', 'statistics', 'mathematics', 'chart'),
  ('Drawing', 'drawing', 'arts', 'pencil'),
  ('Painting', 'painting', 'arts', 'brush'),
  ('Photography', 'photography', 'arts', 'camera'),
  ('Graphic Design', 'graphic-design', 'arts', 'layout'),
  ('Piano', 'piano', 'music', 'piano'),
  ('Guitar', 'guitar', 'music', 'guitar'),
  ('Music Theory', 'music-theory', 'music', 'note'),
  ('Voice / Singing', 'voice-singing', 'music', 'mic'),
  ('Programming', 'programming', 'technology', 'code'),
  ('Web Development', 'web-development', 'technology', 'browser'),
  ('Data Science', 'data-science', 'technology', 'database'),
  ('Cybersecurity', 'cybersecurity', 'technology', 'shield'),
  ('UX Design', 'ux-design', 'technology', 'layout'),
  ('Soccer', 'soccer', 'sports', 'ball'),
  ('Basketball', 'basketball', 'sports', 'ball'),
  ('Tennis', 'tennis', 'sports', 'ball'),
  ('Swimming', 'swimming', 'sports', 'waves'),
  ('Marketing', 'marketing', 'business', 'megaphone'),
  ('Finance', 'finance', 'business', 'chart'),
  ('Project Management', 'project-management', 'business', 'kanban'),
  ('Entrepreneurship', 'entrepreneurship', 'business', 'rocket')
) AS v(name, slug, cat_slug, icon)
JOIN public.field_categories c ON c.slug = v.cat_slug
ON CONFLICT (slug) DO NOTHING;
