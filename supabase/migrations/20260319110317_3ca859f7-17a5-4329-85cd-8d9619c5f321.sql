
-- Tighten incomplete_orders: customers see only their own records
DROP POLICY IF EXISTS "Authenticated users can read incomplete orders" ON public.incomplete_orders;
CREATE POLICY "Users can read own incomplete orders" ON public.incomplete_orders
  FOR SELECT TO authenticated
  USING (customer_id = auth.uid() OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can update incomplete orders" ON public.incomplete_orders;
CREATE POLICY "Users can update own incomplete orders" ON public.incomplete_orders
  FOR UPDATE TO authenticated
  USING (customer_id = auth.uid() OR customer_id IS NULL OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can delete incomplete orders" ON public.incomplete_orders;
CREATE POLICY "Users can delete own incomplete orders" ON public.incomplete_orders
  FOR DELETE TO authenticated
  USING (customer_id = auth.uid() OR is_admin(auth.uid()));

-- Tighten party_orders: customers see only their own records
DROP POLICY IF EXISTS "Authenticated users can read party orders" ON public.party_orders;
CREATE POLICY "Users can read own party orders" ON public.party_orders
  FOR SELECT TO authenticated
  USING (customer_id = auth.uid() OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can update party orders" ON public.party_orders;
CREATE POLICY "Users can update own party orders" ON public.party_orders
  FOR UPDATE TO authenticated
  USING (customer_id = auth.uid() OR is_admin(auth.uid()));
