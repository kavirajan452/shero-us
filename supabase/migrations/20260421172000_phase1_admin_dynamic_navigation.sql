-- Phase 1 — Admin Dynamic Navigation (Single Meal Order section)
-- Stores the navigation structure in app_config so menu/section changes are DB-driven.

INSERT INTO public.app_config (key, value)
VALUES (
  'admin_phase1_single_meal_nav',
  '{
    "items": [
      { "title": "Dashboard", "url": "/admin" },
      { "title": "Order Management", "url": "/admin/orders" },
      { "title": "Menu Management", "url": "/admin/menus" },
      { "title": "Kitchen & Categories", "url": "/admin/kitchen-categories" },
      { "title": "Payments", "url": "/admin/payments" },
      { "title": "Manual Order", "url": "/admin/manual-order" },
      { "title": "Order Modifications", "url": "/admin/order-modifications" },
      { "title": "Customer Feedback", "url": "/admin/customer-feedback" },
      { "title": "Users", "url": "/admin/users" },
      { "title": "Delivery Management", "url": "/admin/delivery-mgmt" },
      { "title": "Delivery Analytics", "url": "/admin/delivery-analytics" },
      { "title": "Invoice Settings", "url": "/admin/invoice-settings" },
      { "title": "Promotions", "url": "/admin/promotions" },
      { "title": "Debit & Credit", "url": "/admin/debit-credit" },
      { "title": "Wallet & Referrals", "url": "/admin/wallet-referrals" },
      { "title": "Instant Finance", "url": "/admin/instant-finance" },
      { "title": "Financial Reports", "url": "/admin/financial-reports" },
      { "title": "Business Metrics", "url": "/admin/business-metrics" },
      { "title": "Metrics", "url": "/admin/metrics" },
      { "title": "Reports", "url": "/admin/reports" },
      { "title": "Location Support", "url": "/admin/location-support" },
      { "title": "Live Support", "url": "/admin/live-support" },
      { "title": "Tickets", "url": "/admin/tickets" },
      { "title": "Broadcast", "url": "/admin/instant-comms" }
    ]
  }'::jsonb
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = now();
