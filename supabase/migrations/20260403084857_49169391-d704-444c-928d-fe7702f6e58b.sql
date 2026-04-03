
-- 1. Create wallet_transactions table
CREATE TABLE public.wallet_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  description text NOT NULL DEFAULT '',
  expires_at timestamptz,
  expired boolean NOT NULL DEFAULT false,
  remaining_amount numeric NOT NULL DEFAULT 0,
  referrer_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own wallet transactions"
  ON public.wallet_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users can insert own wallet transactions"
  ON public.wallet_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all wallet transactions"
  ON public.wallet_transactions FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE INDEX idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_expires_at ON public.wallet_transactions(expires_at) WHERE expired = false AND expires_at IS NOT NULL;

-- 2. Create wallet_expiry_notifications table
CREATE TABLE public.wallet_expiry_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  transaction_id uuid NOT NULL REFERENCES public.wallet_transactions(id) ON DELETE CASCADE,
  notification_type text NOT NULL,
  message text NOT NULL DEFAULT '',
  sent_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);

ALTER TABLE public.wallet_expiry_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own expiry notifications"
  ON public.wallet_expiry_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users can update own expiry notifications"
  ON public.wallet_expiry_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all expiry notifications"
  ON public.wallet_expiry_notifications FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE INDEX idx_wallet_expiry_notifications_user_id ON public.wallet_expiry_notifications(user_id);

-- 3. Alter user_wallets table
ALTER TABLE public.user_wallets
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS total_referral_earnings numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS order_count integer NOT NULL DEFAULT 0;

-- 4. Create customer_referrals table
CREATE TABLE public.customer_referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  friend_name text NOT NULL DEFAULT '',
  friend_phone text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'invited',
  invited_at timestamptz NOT NULL DEFAULT now(),
  verified_at timestamptz,
  reward_credited boolean NOT NULL DEFAULT false,
  spin_done boolean NOT NULL DEFAULT false,
  spin_amount numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own referrals"
  ON public.customer_referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users can insert own referrals"
  ON public.customer_referrals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own referrals"
  ON public.customer_referrals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all referrals"
  ON public.customer_referrals FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE INDEX idx_customer_referrals_user_id ON public.customer_referrals(user_id);

-- 5. Helper function to generate referral codes
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE sql
AS $$
  SELECT 'SH' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 5))
$$;

-- 6. Update handle_new_user trigger to also create wallet row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.email, '')
  );
  
  -- Default role: customer
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  -- Create wallet with referral code
  INSERT INTO public.user_wallets (user_id, balance, referral_code)
  VALUES (NEW.id, 0, public.generate_referral_code())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;
