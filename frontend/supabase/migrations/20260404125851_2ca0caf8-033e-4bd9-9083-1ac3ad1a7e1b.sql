ALTER TABLE public.party_orders ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.party_orders ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE public.party_orders ADD COLUMN IF NOT EXISTS advance_paid numeric NOT NULL DEFAULT 0;
ALTER TABLE public.party_orders ADD COLUMN IF NOT EXISTS balance_due numeric NOT NULL DEFAULT 0;
ALTER TABLE public.party_orders ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone;
ALTER TABLE public.party_orders ADD COLUMN IF NOT EXISTS cancellation_reason text;
ALTER TABLE public.party_orders ADD COLUMN IF NOT EXISTS refund_status text;
ALTER TABLE public.party_orders ADD COLUMN IF NOT EXISTS delivery_fee numeric NOT NULL DEFAULT 0;
ALTER TABLE public.party_orders ADD COLUMN IF NOT EXISTS delivery_distance_miles numeric;