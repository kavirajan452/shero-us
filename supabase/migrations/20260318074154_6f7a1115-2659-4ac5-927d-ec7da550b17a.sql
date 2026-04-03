
-- Table for all screen text/content management
CREATE TABLE public.screen_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_key text NOT NULL,
  content_key text NOT NULL,
  content_value text NOT NULL DEFAULT '',
  content_type text NOT NULL DEFAULT 'text',
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(screen_key, content_key)
);

ALTER TABLE public.screen_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage screen content" ON public.screen_content
  FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Anyone can read screen content" ON public.screen_content
  FOR SELECT TO public USING (true);

CREATE TRIGGER update_screen_content_updated_at
  BEFORE UPDATE ON public.screen_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table for promotions / offers across all verticals
CREATE TABLE public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vertical text NOT NULL,
  title text NOT NULL,
  offer_text text NOT NULL DEFAULT '',
  offer_tag text,
  discount_value numeric DEFAULT 0,
  discount_type text DEFAULT 'percentage',
  is_active boolean NOT NULL DEFAULT true,
  start_date date,
  end_date date,
  target_screen text,
  display_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage promotions" ON public.promotions
  FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Anyone can read active promotions" ON public.promotions
  FOR SELECT TO public USING (is_active = true);

CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
