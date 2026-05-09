-- ═══════════════════════════════════════════════════════════════════
-- Module 11: Tax calculations audit table (Avalara / demo mode)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.tax_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text,
  region_code text NOT NULL,
  customer_state text,
  zip_code text,
  subtotal numeric(10, 2) NOT NULL,
  tax_amount numeric(10, 2) NOT NULL,
  tax_rate numeric(6, 4) NOT NULL,
  tax_label text NOT NULL,
  transaction_id text,
  mode text NOT NULL CHECK (mode IN ('dev', 'production')),
  provider text NOT NULL DEFAULT 'simulated',
  gateway_response jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tax_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read tax calculations"
  ON public.tax_calculations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert tax calculations"
  ON public.tax_calculations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_tax_calc_order ON public.tax_calculations(order_id);
CREATE INDEX IF NOT EXISTS idx_tax_calc_state ON public.tax_calculations(customer_state);
CREATE INDEX IF NOT EXISTS idx_tax_calc_created ON public.tax_calculations(created_at DESC);
