CREATE POLICY "Partners can read allocated party orders"
ON public.party_orders
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'partner')
);