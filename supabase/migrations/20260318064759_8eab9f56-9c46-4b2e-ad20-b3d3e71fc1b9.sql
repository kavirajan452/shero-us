
-- Cookery Categories
CREATE TABLE IF NOT EXISTS public.cookery_categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  icon text,
  image text,
  region text NOT NULL DEFAULT 'Indian',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cookery_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read cookery categories" ON public.cookery_categories FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage cookery categories" ON public.cookery_categories FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Cookery Classes
CREATE TABLE IF NOT EXISTS public.cookery_classes (
  id text PRIMARY KEY,
  cuisine_id text NOT NULL,
  meal_type text NOT NULL,
  name text NOT NULL,
  description text,
  duration text,
  price_in numeric NOT NULL DEFAULT 0,
  price_us numeric NOT NULL DEFAULT 0,
  recorded_price_in numeric,
  recorded_price_us numeric,
  rating numeric NOT NULL DEFAULT 0,
  review_count integer NOT NULL DEFAULT 0,
  image text,
  includes text[] DEFAULT '{}',
  popular boolean DEFAULT false,
  dishes text[] DEFAULT '{}',
  class_mode text NOT NULL DEFAULT 'both',
  video_lessons integer,
  video_hours numeric,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cookery_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read cookery classes" ON public.cookery_classes FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage cookery classes" ON public.cookery_classes FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE TRIGGER update_cookery_classes_updated_at BEFORE UPDATE ON public.cookery_classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Shero Classes (yoga, zumba, fitness, diet, tuition, etc.)
CREATE TABLE IF NOT EXISTS public.shero_classes (
  id text PRIMARY KEY,
  category_id text NOT NULL,
  name text NOT NULL,
  description text,
  instructor text,
  instructor_image text,
  image text,
  rating numeric NOT NULL DEFAULT 0,
  review_count integer NOT NULL DEFAULT 0,
  duration text,
  mode text NOT NULL DEFAULT 'both',
  self_learning_price_in numeric NOT NULL DEFAULT 0,
  self_learning_price_us numeric NOT NULL DEFAULT 0,
  live_price_in numeric NOT NULL DEFAULT 0,
  live_price_us numeric NOT NULL DEFAULT 0,
  video_lessons integer,
  video_hours text,
  popular boolean DEFAULT false,
  highlights text[] DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.shero_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read shero classes" ON public.shero_classes FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage shero classes" ON public.shero_classes FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE TRIGGER update_shero_classes_updated_at BEFORE UPDATE ON public.shero_classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Service Categories
CREATE TABLE IF NOT EXISTS public.service_categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  icon text,
  description text,
  image text,
  service_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read service categories" ON public.service_categories FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage service categories" ON public.service_categories FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Service Items
CREATE TABLE IF NOT EXISTS public.service_items (
  id text PRIMARY KEY,
  category_id text NOT NULL,
  name text NOT NULL,
  description text,
  duration text,
  price_in numeric NOT NULL DEFAULT 0,
  price_us numeric NOT NULL DEFAULT 0,
  rating numeric NOT NULL DEFAULT 0,
  review_count integer NOT NULL DEFAULT 0,
  image text,
  includes text[] DEFAULT '{}',
  popular boolean DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.service_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read service items" ON public.service_items FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage service items" ON public.service_items FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE TRIGGER update_service_items_updated_at BEFORE UPDATE ON public.service_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Service Providers
CREATE TABLE IF NOT EXISTS public.service_providers (
  id text PRIMARY KEY,
  name text NOT NULL,
  avatar text,
  rating numeric NOT NULL DEFAULT 0,
  jobs integer NOT NULL DEFAULT 0,
  experience text,
  skills text[] DEFAULT '{}',
  verified boolean DEFAULT false,
  category_ids text[] DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read service providers" ON public.service_providers FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage service providers" ON public.service_providers FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
