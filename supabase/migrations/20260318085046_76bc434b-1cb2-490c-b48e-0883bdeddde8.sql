
CREATE TABLE public.kitchen_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kitchen_id text NOT NULL REFERENCES public.kitchen_partners(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(kitchen_id, name)
);

ALTER TABLE public.kitchen_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage kitchen categories"
  ON public.kitchen_categories FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Anyone can read kitchen categories"
  ON public.kitchen_categories FOR SELECT
  TO public
  USING (true);

CREATE TRIGGER update_kitchen_categories_updated_at
  BEFORE UPDATE ON public.kitchen_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
