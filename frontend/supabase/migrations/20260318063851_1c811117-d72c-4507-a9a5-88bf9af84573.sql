
-- Kitchen Partners table (maps to mockData.ts KitchenPartner)
CREATE TABLE IF NOT EXISTS public.kitchen_partners (
  id text PRIMARY KEY,
  partner_id text NOT NULL,
  name text NOT NULL,
  image text,
  rating numeric NOT NULL DEFAULT 0,
  review_count integer NOT NULL DEFAULT 0,
  cuisine text[] NOT NULL DEFAULT '{}',
  delivery_time text,
  min_order numeric NOT NULL DEFAULT 0,
  is_branded boolean NOT NULL DEFAULT false,
  location text,
  is_veg boolean NOT NULL DEFAULT true,
  food_preference text NOT NULL DEFAULT 'veg',
  is_attendance_marked boolean NOT NULL DEFAULT false,
  attendance_slot text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.kitchen_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read kitchen partners" ON public.kitchen_partners FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage kitchen partners" ON public.kitchen_partners FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Instant Delivery Menu Items (maps to mockData.ts MenuItem — kitchen-specific items)
CREATE TABLE IF NOT EXISTS public.instant_menu_items (
  id text PRIMARY KEY,
  kitchen_id text NOT NULL REFERENCES public.kitchen_partners(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  ppp numeric NOT NULL DEFAULT 0,
  image text,
  category text NOT NULL,
  is_veg boolean NOT NULL DEFAULT true,
  is_bestseller boolean NOT NULL DEFAULT false,
  spice_level text NOT NULL DEFAULT 'mild',
  serving_size text,
  preparation_time text,
  ingredients text[] DEFAULT '{}',
  major_vegetables text[] DEFAULT '{}',
  allergens text[] DEFAULT '{}',
  nutrition_info jsonb DEFAULT '{}',
  is_toggled_on boolean NOT NULL DEFAULT true,
  add_ons jsonb DEFAULT '[]',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.instant_menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read instant menu items" ON public.instant_menu_items FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage instant menu items" ON public.instant_menu_items FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Enable realtime on kitchen_partners for live attendance updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.kitchen_partners;

-- Add updated_at triggers
CREATE TRIGGER update_kitchen_partners_updated_at BEFORE UPDATE ON public.kitchen_partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_instant_menu_items_updated_at BEFORE UPDATE ON public.instant_menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
