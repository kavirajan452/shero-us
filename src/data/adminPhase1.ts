export const PHASE1_ADMIN_ROUTES = [
  "/admin",
  "/admin/orders",
  "/admin/menus",
  "/admin/kitchen-categories",
  "/admin/payments",
  "/admin/manual-order",
  "/admin/order-modifications",
  "/admin/customer-feedback",
  "/admin/users",
  "/admin/delivery-mgmt",
  "/admin/delivery-analytics",
  "/admin/invoice-settings",
  "/admin/promotions",
  "/admin/debit-credit",
  "/admin/wallet-referrals",
  "/admin/instant-finance",
  "/admin/financial-reports",
  "/admin/business-metrics",
  "/admin/metrics",
  "/admin/reports",
  "/admin/location-support",
  "/admin/live-support",
  "/admin/tickets",
  "/admin/instant-comms",
] as const;

const PHASE1_ADMIN_ROUTE_SET = new Set<string>(PHASE1_ADMIN_ROUTES);

export function isPhase1AdminRoute(pathname: string): boolean {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/admin";
  return PHASE1_ADMIN_ROUTE_SET.has(normalizedPath);
}
