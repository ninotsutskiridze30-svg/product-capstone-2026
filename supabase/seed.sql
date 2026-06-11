-- Seed predefined field categories and fields (run after migrations).

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
  -- Sciences (6)
  ('Biology', 'biology', 'sciences', 'leaf'),
  ('Chemistry', 'chemistry', 'sciences', 'atom'),
  ('Physics', 'physics', 'sciences', 'orbit'),
  ('Environmental Science', 'environmental-science', 'sciences', 'globe'),
  ('Psychology', 'psychology', 'sciences', 'brain'),
  ('Earth Science', 'earth-science', 'sciences', 'mountain'),
  -- Languages (5)
  ('English', 'english', 'languages', 'book'),
  ('Spanish', 'spanish', 'languages', 'book'),
  ('French', 'french', 'languages', 'book'),
  ('German', 'german', 'languages', 'book'),
  ('Italian', 'italian', 'languages', 'book'),
  -- Mathematics (4)
  ('Algebra', 'algebra', 'mathematics', 'function'),
  ('Calculus', 'calculus', 'mathematics', 'integral'),
  ('Geometry', 'geometry', 'mathematics', 'triangle'),
  ('Statistics', 'statistics', 'mathematics', 'chart'),
  -- Arts (4)
  ('Drawing', 'drawing', 'arts', 'pencil'),
  ('Painting', 'painting', 'arts', 'brush'),
  ('Photography', 'photography', 'arts', 'camera'),
  ('Graphic Design', 'graphic-design', 'arts', 'layout'),
  -- Music (4)
  ('Piano', 'piano', 'music', 'piano'),
  ('Guitar', 'guitar', 'music', 'guitar'),
  ('Music Theory', 'music-theory', 'music', 'note'),
  ('Voice / Singing', 'voice-singing', 'music', 'mic'),
  -- Technology (5)
  ('Programming', 'programming', 'technology', 'code'),
  ('Web Development', 'web-development', 'technology', 'browser'),
  ('Data Science', 'data-science', 'technology', 'database'),
  ('Cybersecurity', 'cybersecurity', 'technology', 'shield'),
  ('UX Design', 'ux-design', 'technology', 'layout'),
  -- Sports (4)
  ('Soccer', 'soccer', 'sports', 'ball'),
  ('Basketball', 'basketball', 'sports', 'ball'),
  ('Tennis', 'tennis', 'sports', 'ball'),
  ('Swimming', 'swimming', 'sports', 'waves'),
  -- Business (4)
  ('Marketing', 'marketing', 'business', 'megaphone'),
  ('Finance', 'finance', 'business', 'chart'),
  ('Project Management', 'project-management', 'business', 'kanban'),
  ('Entrepreneurship', 'entrepreneurship', 'business', 'rocket')
) AS v(name, slug, cat_slug, icon)
JOIN public.field_categories c ON c.slug = v.cat_slug
ON CONFLICT (slug) DO NOTHING;
