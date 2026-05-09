ALTER TABLE public.instant_orders
  ADD COLUMN IF NOT EXISTS payment_provider text,
  ADD COLUMN IF NOT EXISTS payment_transaction_id text,
  ADD COLUMN IF NOT EXISTS payment_mode text DEFAULT 'demo',
  ADD COLUMN IF NOT EXISTS payment_completed_at timestamptz;

UPDATE public.instant_orders
SET payment_mode = 'demo'
WHERE payment_mode IS NULL;
