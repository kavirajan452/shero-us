
-- ═══════════════════════════════════════════════════════
-- 1. INSTANT ORDERS
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.instant_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text NOT NULL,
  customer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_address text,
  kitchen_id text,
  kitchen_name text,
  partner_id text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric NOT NULL DEFAULT 0,
  delivery_fee numeric NOT NULL DEFAULT 0,
  platform_fee numeric NOT NULL DEFAULT 0,
  tax numeric NOT NULL DEFAULT 0,
  discount numeric NOT NULL DEFAULT 0,
  wallet_used numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  delivery_type text NOT NULL DEFAULT 'self-delivery',
  delivery_slot text,
  payment_method text,
  payment_status text NOT NULL DEFAULT 'pending',
  status text NOT NULL DEFAULT 'new',
  order_type text NOT NULL DEFAULT 'instant',
  note text,
  cooking_instructions text,
  allergens text[] DEFAULT '{}',
  accepted_at timestamptz,
  ready_at timestamptz,
  picked_up_at timestamptz,
  delivered_at timestamptz,
  rejected_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.instant_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own instant orders" ON public.instant_orders
  FOR SELECT TO authenticated USING (customer_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Users can insert instant orders" ON public.instant_orders
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins can manage instant orders" ON public.instant_orders
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Authenticated can update instant orders" ON public.instant_orders
  FOR UPDATE TO authenticated USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.instant_orders;

CREATE TRIGGER update_instant_orders_updated_at BEFORE UPDATE ON public.instant_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════
-- 2. SUBSCRIPTION MEAL PLANS (standard plans catalog)
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.subscription_meal_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  cuisine text NOT NULL,
  emoji text,
  description text,
  is_veg boolean NOT NULL DEFAULT true,
  slots text[] NOT NULL DEFAULT '{}',
  price_per_day numeric NOT NULL DEFAULT 0,
  weekly_menu jsonb DEFAULT '[]'::jsonb,
  highlights text[] DEFAULT '{}',
  image text,
  rating numeric DEFAULT 0,
  subscribers integer DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_meal_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read meal plans" ON public.subscription_meal_plans FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage meal plans" ON public.subscription_meal_plans FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ═══════════════════════════════════════════════════════
-- 3. SUBSCRIPTION MENU ITEMS (make-your-own items)
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.subscription_menu_items (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  cuisine text NOT NULL,
  is_veg boolean NOT NULL DEFAULT true,
  price_per_serving numeric NOT NULL DEFAULT 0,
  image text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read sub menu items" ON public.subscription_menu_items FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage sub menu items" ON public.subscription_menu_items FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ═══════════════════════════════════════════════════════
-- 4. SUBSCRIPTION CUSTOMERS
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.subscription_customers (
  id text PRIMARY KEY,
  customer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  mobile text NOT NULL,
  email text,
  plan_id text,
  plan_name text NOT NULL,
  duration text NOT NULL DEFAULT 'monthly',
  status text NOT NULL DEFAULT 'active',
  start_date date NOT NULL,
  end_date date NOT NULL,
  address text,
  persons integer NOT NULL DEFAULT 1,
  slots text[] DEFAULT '{}',
  skipped_sessions jsonb DEFAULT '[]'::jsonb,
  partner_id text,
  partner_name text,
  total_paid numeric NOT NULL DEFAULT 0,
  pause_reason text,
  cancel_reason text,
  is_custom_plan boolean NOT NULL DEFAULT false,
  price_per_session numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read sub customers" ON public.subscription_customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage sub customers" ON public.subscription_customers FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Users can insert sub customers" ON public.subscription_customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own sub" ON public.subscription_customers FOR UPDATE TO authenticated USING (customer_id = auth.uid() OR public.is_admin(auth.uid()));

ALTER PUBLICATION supabase_realtime ADD TABLE public.subscription_customers;

-- ═══════════════════════════════════════════════════════
-- 5. SERVICE BOOKINGS
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.service_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code text NOT NULL,
  customer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text,
  customer_email text,
  service_id text,
  service_name text NOT NULL,
  category_name text,
  provider_id text,
  provider_name text,
  scheduled_date date NOT NULL,
  scheduled_time text,
  duration text,
  address text,
  amount numeric NOT NULL DEFAULT 0,
  gst numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'confirmed',
  payment_status text NOT NULL DEFAULT 'paid',
  rating numeric,
  review text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own service bookings" ON public.service_bookings FOR SELECT TO authenticated USING (customer_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Users can insert service bookings" ON public.service_bookings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update service bookings" ON public.service_bookings FOR UPDATE TO authenticated USING (customer_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage service bookings" ON public.service_bookings FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

ALTER PUBLICATION supabase_realtime ADD TABLE public.service_bookings;

-- ═══════════════════════════════════════════════════════
-- 6. COMBO MENU CATEGORIES CONFIG (party order configs)
-- ═══════════════════════════════════════════════════════
CREATE TABLE public.party_combo_configs (
  id text PRIMARY KEY,
  name text NOT NULL,
  label text NOT NULL,
  description text,
  icon text,
  min_pax integer NOT NULL DEFAULT 10,
  max_pax integer NOT NULL DEFAULT 500,
  base_price_per_head numeric NOT NULL DEFAULT 0,
  food_types text[] DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.party_combo_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read party configs" ON public.party_combo_configs FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage party configs" ON public.party_combo_configs FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
