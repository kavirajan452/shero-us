-- Add promo code and usage tracking columns to promotions
ALTER TABLE public.promotions
  ADD COLUMN IF NOT EXISTS promo_code TEXT,
  ADD COLUMN IF NOT EXISTS min_order_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_discount_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS usage_limit INTEGER,
  ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS show_in_banner BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS banner_text TEXT;

-- Create unique index on promo_code (only for non-null codes)
CREATE UNIQUE INDEX IF NOT EXISTS idx_promotions_promo_code ON public.promotions (promo_code) WHERE promo_code IS NOT NULL;

-- Update existing promotions with codes and banner info
UPDATE public.promotions SET promo_code = 'SHERO30', min_order_amount = 199, max_discount_amount = 150, show_in_banner = false, banner_text = 'Get up to 30% off — Use code SHERO30' WHERE vertical = 'instant_delivery' AND discount_value = 30;

UPDATE public.promotions SET promo_code = 'SHEROSUB20', min_order_amount = 499, max_discount_amount = 200, show_in_banner = false, banner_text = 'Save 20% on subscriptions — Use code SHEROSUB20' WHERE vertical = 'subscriptions' AND discount_value = 20;

UPDATE public.promotions SET promo_code = 'PARTY50', min_order_amount = 2999, max_discount_amount = 500, show_in_banner = false, banner_text = 'Flat 50% off party orders — Use code PARTY50' WHERE vertical = 'party_orders' AND discount_value = 50;

-- Insert the main banner promotion
INSERT INTO public.promotions (title, vertical, offer_text, offer_tag, discount_type, discount_value, promo_code, min_order_amount, max_discount_amount, show_in_banner, banner_text, display_order, is_active)
VALUES ('Welcome Banner Offer', 'all', 'First order FREE delivery + 20% off', 'WELCOME OFFER', 'percentage', 20, 'SHERO20', 0, 100, true, '🎉 First order FREE delivery + 20% off — Use code SHERO20', 0, true)
ON CONFLICT DO NOTHING;