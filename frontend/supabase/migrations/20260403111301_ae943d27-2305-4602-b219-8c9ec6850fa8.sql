
ALTER TABLE public.invoices 
  ADD COLUMN IF NOT EXISTS tips numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS invoice_type text NOT NULL DEFAULT 'customer_sale',
  ADD COLUMN IF NOT EXISTS ein text DEFAULT '';

COMMENT ON COLUMN public.invoices.invoice_type IS 'customer_sale or partner_purchase';
COMMENT ON COLUMN public.invoices.tips IS 'Customer tip amount';
COMMENT ON COLUMN public.invoices.ein IS 'Company EIN number';
