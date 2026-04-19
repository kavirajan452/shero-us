CREATE TABLE IF NOT EXISTS public.payment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.instant_orders(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL,
  mode text NOT NULL CHECK (mode IN ('dev', 'production')),
  provider text NOT NULL,
  status text NOT NULL,
  gateway_response jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_attempts_order_id ON public.payment_attempts(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_created_at ON public.payment_attempts(created_at DESC);

ALTER TABLE public.payment_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own payment attempts" ON public.payment_attempts;
CREATE POLICY "Users can read own payment attempts"
  ON public.payment_attempts
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.instant_orders o
      WHERE o.id = payment_attempts.order_id
        AND o.customer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service role can insert payment attempts" ON public.payment_attempts;
CREATE POLICY "Service role can insert payment attempts"
  ON public.payment_attempts
  FOR INSERT
  TO service_role
  WITH CHECK (true);
