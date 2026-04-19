-- Allow customers to recover legacy incomplete party drafts by matching their verified profile phone
DROP POLICY IF EXISTS "Users can read own incomplete orders" ON public.incomplete_orders;
CREATE POLICY "Users can read own incomplete orders"
ON public.incomplete_orders
FOR SELECT
TO authenticated
USING (
  customer_id = auth.uid()
  OR is_admin(auth.uid())
  OR (
    customer_id IS NULL
    AND regexp_replace(coalesce(customer_phone, ''), '\D', '', 'g') = (
      SELECT regexp_replace(coalesce(p.phone, ''), '\D', '', 'g')
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
      LIMIT 1
    )
  )
);

DROP POLICY IF EXISTS "Users can update own incomplete orders" ON public.incomplete_orders;
CREATE POLICY "Users can update own incomplete orders"
ON public.incomplete_orders
FOR UPDATE
TO authenticated
USING (
  customer_id = auth.uid()
  OR is_admin(auth.uid())
  OR (
    customer_id IS NULL
    AND regexp_replace(coalesce(customer_phone, ''), '\D', '', 'g') = (
      SELECT regexp_replace(coalesce(p.phone, ''), '\D', '', 'g')
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
      LIMIT 1
    )
  )
)
WITH CHECK (
  customer_id = auth.uid()
  OR is_admin(auth.uid())
  OR (
    customer_id IS NULL
    AND regexp_replace(coalesce(customer_phone, ''), '\D', '', 'g') = (
      SELECT regexp_replace(coalesce(p.phone, ''), '\D', '', 'g')
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
      LIMIT 1
    )
  )
);