-- ═══════════════════════════════════════════════════════════════════
-- Phase 1 Dynamic Conversion: partner_payments, ppp_penalties, communications
-- ═══════════════════════════════════════════════════════════════════

-- ── Partner Payments (PPP weekly payouts) ──
CREATE TABLE IF NOT EXISTS public.partner_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id TEXT NOT NULL,
  week_label TEXT NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  partner_id TEXT NOT NULL,
  partner_name TEXT NOT NULL,
  rmn TEXT,
  skid TEXT,
  state TEXT,
  city TEXT,
  cuisine TEXT,
  stream TEXT CHECK (stream IN ('SHF', 'HCF')),
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_sales NUMERIC NOT NULL DEFAULT 0,
  total_ppp NUMERIC NOT NULL DEFAULT 0,
  delivery_fee NUMERIC NOT NULL DEFAULT 0,
  gateway_fee NUMERIC NOT NULL DEFAULT 0,
  cm1 NUMERIC GENERATED ALWAYS AS (total_sales - total_ppp - delivery_fee - gateway_fee) STORED,
  penalties NUMERIC NOT NULL DEFAULT 0,
  net_payable NUMERIC GENERATED ALWAYS AS (total_ppp - penalties) STORED,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'finance_approved', 'ops_approved', 'paid', 'on_hold')),
  finance_approver TEXT,
  finance_approved_at TIMESTAMPTZ,
  ops_approver TEXT,
  ops_approved_at TIMESTAMPTZ,
  bank_name TEXT,
  account_no TEXT,
  ifsc TEXT,
  upi_id TEXT,
  ppp_ratio NUMERIC NOT NULL DEFAULT 65,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage partner payments" ON public.partner_payments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── PPP Penalties ──
CREATE TABLE IF NOT EXISTS public.ppp_penalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id TEXT NOT NULL,
  partner_name TEXT NOT NULL,
  rmn TEXT,
  order_id TEXT,
  reason TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  penalty_date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('late_delivery', 'cancellation', 'quality_complaint', 'attendance', 'disciplinary')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'disputed', 'waived')),
  raised_by TEXT,
  approved_by TEXT,
  notes TEXT,
  payment_id UUID REFERENCES public.partner_payments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ppp_penalties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage ppp penalties" ON public.ppp_penalties
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── Communications ──
CREATE TABLE IF NOT EXISTS public.communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('performance', 'finance', 'promotion', 'announcement', 'alert', 'celebration')),
  channel TEXT NOT NULL DEFAULT 'in_app' CHECK (channel IN ('in_app', 'whatsapp', 'both')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')),
  vertical TEXT NOT NULL DEFAULT 'instant' CHECK (vertical IN ('instant', 'subscriptions', 'party', 'services', 'snacks', 'cookery', 'shero_classes', 'all')),
  audience_type TEXT NOT NULL DEFAULT 'all' CHECK (audience_type IN ('all', 'region', 'cuisine', 'performance', 'individual')),
  audience_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  audience_count INTEGER NOT NULL DEFAULT 0,
  sent_by TEXT NOT NULL DEFAULT 'Admin',
  sent_by_role TEXT NOT NULL DEFAULT 'admin',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  delivered_count INTEGER NOT NULL DEFAULT 0,
  read_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage communications" ON public.communications
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_partner_payments_week_id ON public.partner_payments(week_id);
CREATE INDEX IF NOT EXISTS idx_partner_payments_partner_id ON public.partner_payments(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_payments_status ON public.partner_payments(status);
CREATE INDEX IF NOT EXISTS idx_ppp_penalties_partner_id ON public.ppp_penalties(partner_id);
CREATE INDEX IF NOT EXISTS idx_communications_vertical ON public.communications(vertical);
CREATE INDEX IF NOT EXISTS idx_communications_status ON public.communications(status);
