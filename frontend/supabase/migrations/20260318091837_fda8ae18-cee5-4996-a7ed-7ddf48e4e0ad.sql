
CREATE TABLE public.kitchen_partner_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kitchen_id text NOT NULL,
  partner_name text NOT NULL,
  partner_phone text,
  pincode text NOT NULL,
  latitude numeric,
  longitude numeric,
  location text,
  is_active boolean NOT NULL DEFAULT true,
  is_attendance_marked boolean NOT NULL DEFAULT false,
  attendance_slot text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_kitchen FOREIGN KEY (kitchen_id) REFERENCES public.kitchen_partners(id) ON DELETE CASCADE
);

ALTER TABLE public.kitchen_partner_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage kitchen partner locations" ON public.kitchen_partner_locations
  FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Anyone can read kitchen partner locations" ON public.kitchen_partner_locations
  FOR SELECT TO public USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.kitchen_partner_locations;
