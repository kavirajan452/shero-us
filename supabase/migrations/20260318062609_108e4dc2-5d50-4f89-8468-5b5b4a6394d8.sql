
-- ══════════════════════════════════════════════════════════
-- FULL MIGRATION: All remaining tables (Phases 2, 3, 4)
-- ══════════════════════════════════════════════════════════

-- ═══ PHASE 2: Orders & Leads ═══

-- 1. Party Leads
CREATE TABLE public.party_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'visited' CHECK (status IN ('visited','menu_saved','order_placed','pre_order_discussion','exited')),
  saved_order JSONB,
  visits INT NOT NULL DEFAULT 1,
  source TEXT NOT NULL DEFAULT 'direct',
  last_visit TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.party_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read party leads" ON public.party_leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert party leads" ON public.party_leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update party leads" ON public.party_leads FOR UPDATE TO authenticated USING (true);
CREATE INDEX idx_party_leads_phone ON public.party_leads(phone);

-- 2. Subscription Leads
CREATE TABLE public.subscription_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'organic',
  saved_plan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscription_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read subscription leads" ON public.subscription_leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert subscription leads" ON public.subscription_leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update subscription leads" ON public.subscription_leads FOR UPDATE TO authenticated USING (true);
CREATE INDEX idx_sub_leads_phone ON public.subscription_leads(phone);

-- 3. Party Orders
CREATE TABLE public.party_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES auth.users(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_lat NUMERIC,
  customer_lng NUMERIC,
  customer_address TEXT,
  service_type TEXT NOT NULL DEFAULT 'bulk-food' CHECK (service_type IN ('bulk-food','combo-meal-box')),
  food_type TEXT NOT NULL CHECK (food_type IN ('veg','non-veg')),
  guest_count INT NOT NULL,
  occasion TEXT,
  event_date DATE NOT NULL,
  event_time TEXT,
  meals TEXT[] DEFAULT '{}',
  selected_items TEXT[] DEFAULT '{}',
  cooking_instructions TEXT,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending_allocation' CHECK (status IN ('pending_allocation','allocated','accepted','preparing','delivered','cancelled')),
  allocated_partner_id TEXT,
  allocated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.party_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read party orders" ON public.party_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert party orders" ON public.party_orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update party orders" ON public.party_orders FOR UPDATE TO authenticated USING (true);
CREATE INDEX idx_party_orders_status ON public.party_orders(status);

-- 4. Incomplete Orders
CREATE TABLE public.incomplete_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('instant','party','subscription','service')),
  customer_id UUID REFERENCES auth.users(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address TEXT,
  delivery_type TEXT,
  selected_slot TEXT,
  cart_snapshot JSONB DEFAULT '[]'::jsonb,
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','failed','abandoned')),
  total_amount NUMERIC NOT NULL DEFAULT 0,
  region TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.incomplete_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read incomplete orders" ON public.incomplete_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert incomplete orders" ON public.incomplete_orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update incomplete orders" ON public.incomplete_orders FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete incomplete orders" ON public.incomplete_orders FOR DELETE TO authenticated USING (true);

-- 5. Snack Orders
CREATE TABLE public.snack_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES auth.users(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  partner_id TEXT,
  partner_name TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  packing_charge NUMERIC NOT NULL DEFAULT 0,
  delivery_charge NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  gst NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','confirmed','preparing','packed','dispatched','delivered','cancelled')),
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('paid','cod','pending')),
  shipping_address TEXT,
  city TEXT,
  pincode TEXT,
  estimated_delivery DATE,
  tracking_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.snack_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read snack orders" ON public.snack_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert snack orders" ON public.snack_orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update snack orders" ON public.snack_orders FOR UPDATE TO authenticated USING (true);

-- 6. Partner Allocations (escalations + logs)
CREATE TABLE public.allocation_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  order_display_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  guest_count INT,
  event_date DATE,
  reason TEXT NOT NULL,
  rejected_by TEXT[] DEFAULT '{}',
  rejection_reasons JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending_team_action' CHECK (status IN ('pending_team_action','reallocated','cancelled_refunded')),
  resolved_by TEXT,
  resolved_at TIMESTAMPTZ,
  resolution TEXT,
  refund_amount NUMERIC,
  refund_type TEXT CHECK (refund_type IS NULL OR refund_type IN ('full','partial')),
  notes TEXT,
  escalated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.allocation_escalations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage escalations" ON public.allocation_escalations FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.allocation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  order_display_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('auto','manual')),
  partner_id TEXT,
  partner_name TEXT,
  distance NUMERIC,
  status TEXT NOT NULL CHECK (status IN ('sent','accepted','rejected','escalated','cancelled')),
  rejection_reason TEXT,
  auto_attempt INT,
  allocated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.allocation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage allocation logs" ON public.allocation_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ═══ PHASE 3: Menus & Products ═══

-- 7. Menu Items (Master menu)
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  cuisine TEXT NOT NULL,
  is_veg BOOLEAN NOT NULL DEFAULT true,
  image TEXT,
  volume TEXT,
  brand TEXT,
  video_url TEXT,
  major_vegetables TEXT[] DEFAULT '{}',
  packing_charge_flat NUMERIC DEFAULT 0,
  packing_charge_pct NUMERIC DEFAULT 0,
  state_prices JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read menu items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Admins can manage menu items" ON public.menu_items FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE INDEX idx_menu_items_cuisine ON public.menu_items(cuisine);

-- 8. Combo Items
CREATE TABLE public.combo_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  food_type TEXT NOT NULL CHECK (food_type IN ('veg','non-veg')),
  sub_category TEXT,
  portion TEXT,
  mrp NUMERIC NOT NULL DEFAULT 0,
  ppp NUMERIC NOT NULL DEFAULT 0,
  emoji TEXT,
  photo_url TEXT,
  description TEXT,
  brand TEXT,
  video_url TEXT,
  packing_charge_flat NUMERIC DEFAULT 0,
  packing_charge_pct NUMERIC DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.combo_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read combo items" ON public.combo_items FOR SELECT USING (true);
CREATE POLICY "Admins can manage combo items" ON public.combo_items FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 9. Party Menu Items
CREATE TABLE public.party_menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code TEXT NOT NULL,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  cuisine TEXT,
  food_type TEXT NOT NULL CHECK (food_type IN ('veg','non-veg')),
  category TEXT NOT NULL,
  portion_size NUMERIC,
  portion_unit TEXT,
  mrp NUMERIC NOT NULL DEFAULT 0,
  ppp NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.party_menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read party menu items" ON public.party_menu_items FOR SELECT USING (true);
CREATE POLICY "Admins can manage party menu items" ON public.party_menu_items FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 10. Snack Products
CREATE TABLE public.snack_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  category TEXT NOT NULL,
  rating NUMERIC DEFAULT 0,
  review_count INT DEFAULT 0,
  is_bestseller BOOLEAN DEFAULT false,
  is_new_launch BOOLEAN DEFAULT false,
  badges TEXT[] DEFAULT '{}',
  pack_sizes JSONB DEFAULT '[]'::jsonb,
  ingredients TEXT,
  shelf_life TEXT,
  made_in TEXT,
  weight_info TEXT,
  region_tag TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.snack_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read snack products" ON public.snack_products FOR SELECT USING (true);
CREATE POLICY "Admins can manage snack products" ON public.snack_products FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 11. Subscription Plans
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  duration_days INT NOT NULL DEFAULT 7,
  features JSONB DEFAULT '[]'::jsonb,
  meal_slots JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read subscription plans" ON public.subscription_plans FOR SELECT USING (true);
CREATE POLICY "Admins can manage subscription plans" ON public.subscription_plans FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 12. Services
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  duration TEXT,
  image TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admins can manage services" ON public.services FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 13. App Config (key-value store for packing charges, etc.)
CREATE TABLE public.app_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read app config" ON public.app_config FOR SELECT USING (true);
CREATE POLICY "Admins can manage app config" ON public.app_config FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ═══ PHASE 4: Operations & Communications ═══

-- 14. Partner Chats
CREATE TABLE public.partner_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_name TEXT NOT NULL,
  partner_rmn TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  admin_name TEXT NOT NULL,
  admin_role TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.partner_chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage chats" ON public.partner_chats FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.partner_chats(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('partner','admin')),
  sender_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage chat messages" ON public.chat_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX idx_chat_messages_conv ON public.chat_messages(conversation_id);

-- 15. Customer Feedback
CREATE TABLE public.customer_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  order_display_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  guest_count INT,
  event_date DATE,
  occasion TEXT,
  partner_name TEXT,
  delivered_at TIMESTAMPTZ,
  feedback_eligible_at TIMESTAMPTZ,
  whatsapp_sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','responded','no_response')),
  rating INT CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  comment TEXT,
  responded_at TIMESTAMPTZ,
  sent_by TEXT,
  message_template TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.customer_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage feedback" ON public.customer_feedback FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 16. Stock Alerts
CREATE TABLE public.stock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  partner_name TEXT NOT NULL,
  partner_id TEXT NOT NULL,
  kitchen_name TEXT,
  item_name TEXT NOT NULL,
  suggested_alternative TEXT,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','acknowledged','resolved','escalated')),
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  notes TEXT,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage stock alerts" ON public.stock_alerts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 17. Order Modifications
CREATE TABLE public.order_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  kitchen_name TEXT,
  partner_name TEXT,
  modification_type TEXT NOT NULL CHECK (modification_type IN ('add_item','remove_item','change_item','change_qty','cancel_item','other')),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','acknowledged','resolved','escalated')),
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  notes TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.order_modifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage modifications" ON public.order_modifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 18. Customer Cancellations
CREATE TABLE public.cancellations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  reason_detail TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  order_total NUMERIC NOT NULL DEFAULT 0,
  refund_status TEXT NOT NULL DEFAULT 'pending' CHECK (refund_status IN ('pending','processed','denied')),
  partner_notified BOOLEAN NOT NULL DEFAULT false,
  partner_acknowledged BOOLEAN NOT NULL DEFAULT false,
  cancelled_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cancellations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage cancellations" ON public.cancellations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 19. Delay Complaints
CREATE TABLE public.delay_complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  kitchen_name TEXT,
  partner_name TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','acknowledged','resolved','escalated')),
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  notes TEXT,
  partner_notified BOOLEAN NOT NULL DEFAULT false,
  partner_acknowledged BOOLEAN NOT NULL DEFAULT false,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.delay_complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage delay complaints" ON public.delay_complaints FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 20. Ledger Entries (Debit/Credit)
CREATE TABLE public.ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_type TEXT NOT NULL CHECK (entry_type IN ('debit','credit','voucher')),
  linked_entry_id UUID REFERENCES public.ledger_entries(id),
  order_id TEXT,
  partner_id TEXT,
  partner_name TEXT,
  customer_id TEXT,
  customer_name TEXT,
  reason_code TEXT NOT NULL,
  reason_label TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  sub_vertical TEXT,
  severity TEXT,
  status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval','approved','rejected','escalated')),
  raised_by TEXT NOT NULL,
  raised_by_role TEXT NOT NULL,
  approved_by TEXT,
  approved_by_role TEXT,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage ledger" ON public.ledger_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 21. Class Bookings
CREATE TABLE public.class_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code TEXT NOT NULL UNIQUE,
  vertical TEXT NOT NULL CHECK (vertical IN ('shero','cookery')),
  class_id TEXT NOT NULL,
  class_name TEXT NOT NULL,
  category_name TEXT,
  mode TEXT NOT NULL CHECK (mode IN ('self-learning','live')),
  customer_id UUID REFERENCES auth.users(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  instructor_id TEXT,
  instructor_name TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TEXT,
  duration TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  gst NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed','upcoming','in_progress','completed','cancelled','no_show')),
  payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('paid','pending','refunded')),
  rating NUMERIC,
  review TEXT,
  attendance_marked BOOLEAN NOT NULL DEFAULT false,
  certificate_issued BOOLEAN NOT NULL DEFAULT false,
  meeting_link TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.class_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read class bookings" ON public.class_bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert class bookings" ON public.class_bookings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update class bookings" ON public.class_bookings FOR UPDATE TO authenticated USING (true);

-- 22. Delivery Tracking
CREATE TABLE public.delivery_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  delivery_partner TEXT NOT NULL,
  tracking_id TEXT,
  agent_name TEXT,
  agent_phone TEXT,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned','picked_up','in_transit','delivered','failed')),
  estimated_arrival TIMESTAMPTZ,
  actual_delivery TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.delivery_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage delivery tracking" ON public.delivery_tracking FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 23. Cart (persistent)
CREATE TABLE public.user_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own cart" ON public.user_carts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 24. Wallet
CREATE TABLE public.user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC NOT NULL DEFAULT 0,
  transactions JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own wallet" ON public.user_wallets FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER update_party_leads_updated_at BEFORE UPDATE ON public.party_leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscription_leads_updated_at BEFORE UPDATE ON public.subscription_leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_party_orders_updated_at BEFORE UPDATE ON public.party_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_incomplete_orders_updated_at BEFORE UPDATE ON public.incomplete_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_snack_orders_updated_at BEFORE UPDATE ON public.snack_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_combo_items_updated_at BEFORE UPDATE ON public.combo_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_party_menu_items_updated_at BEFORE UPDATE ON public.party_menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_snack_products_updated_at BEFORE UPDATE ON public.snack_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_class_bookings_updated_at BEFORE UPDATE ON public.class_bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_delivery_tracking_updated_at BEFORE UPDATE ON public.delivery_tracking FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_carts_updated_at BEFORE UPDATE ON public.user_carts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_wallets_updated_at BEFORE UPDATE ON public.user_wallets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Realtime on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.party_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.partner_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_modifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cancellations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.delay_complaints;
ALTER PUBLICATION supabase_realtime ADD TABLE public.allocation_escalations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_tracking;
