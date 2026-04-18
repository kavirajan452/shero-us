-- Allow anonymous (unauthenticated) users to insert instant orders.
-- This covers the case where the Supabase session cookie hasn't propagated
-- to the client yet at the moment the order is placed.
DROP POLICY IF EXISTS "Anon can insert instant orders" ON public.instant_orders;
CREATE POLICY "Anon can insert instant orders" ON public.instant_orders
  FOR INSERT TO anon WITH CHECK (true);

-- Also allow anon users to read their own orders via order_code (no auth.uid check needed
-- since guest orders won't have a customer_id — admins handle visibility).
-- (read policy is already limited to authenticated via the existing policy, that's fine)
