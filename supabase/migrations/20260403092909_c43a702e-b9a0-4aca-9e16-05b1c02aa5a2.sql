
CREATE TABLE public.area_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  phone TEXT,
  detected_location TEXT,
  zip_code TEXT,
  source TEXT NOT NULL DEFAULT 'non_serviceable',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.area_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert area leads" ON public.area_leads
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Admins can manage area leads" ON public.area_leads
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
