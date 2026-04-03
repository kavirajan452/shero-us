
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL,
  order_type text NOT NULL DEFAULT 'instant',
  invoice_number text NOT NULL,
  customer_name text NOT NULL DEFAULT '',
  customer_phone text DEFAULT '',
  customer_email text DEFAULT '',
  customer_id uuid,
  items_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  delivery_fee numeric NOT NULL DEFAULT 0,
  packing_charges numeric NOT NULL DEFAULT 0,
  platform_fee numeric NOT NULL DEFAULT 0,
  discount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  tax_rate text DEFAULT '5',
  gstin text DEFAULT '',
  company_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'generated',
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own invoices"
ON public.invoices FOR SELECT
TO authenticated
USING (customer_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Authenticated can insert invoices"
ON public.invoices FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can manage invoices"
ON public.invoices FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));
