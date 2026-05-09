// ═══ Supabase Data Hooks — replaces all localStorage/in-memory stores ═══
// Each hook provides real-time database queries for a specific domain.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { normalizeZip } from "@/lib/customerLocation";

// ── Helper: subscribe to realtime changes on a table ──
function useRealtimeSubscription(table: string, queryKeys: string[]) {
  const queryClient = useQueryClient();
  useEffect(() => {
    // Use a unique channel name per effect invocation to avoid "cannot add
    // callbacks after subscribe()" errors when React StrictMode or Fast Refresh
    // remounts the component before the previous channel's cleanup completes.
    const channelName = `realtime-${table}-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => {
        queryKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [table, queryClient]);
}

// ═══ PARTY LEADS ═══
export function usePartyLeads() {
  useRealtimeSubscription("party_leads", ["party_leads"]);
  return useQuery({
    queryKey: ["party_leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("party_leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useUpsertPartyLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (lead: { name: string; phone: string; location: string; source?: string; status?: string; saved_order?: any }) => {
      // Check if lead exists by phone
      const { data: existing } = await supabase.from("party_leads").select("id").eq("phone", lead.phone).maybeSingle();
      if (existing) {
        const { data, error } = await supabase.from("party_leads").update({
          name: lead.name || undefined,
          location: lead.location || undefined,
          status: lead.status || undefined,
          saved_order: lead.saved_order || undefined,
          last_visit: new Date().toISOString(),
          visits: undefined, // will use RPC or raw increment later
        }).eq("id", existing.id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from("party_leads").insert({
        name: lead.name,
        phone: lead.phone,
        location: lead.location,
        source: lead.source || "direct",
        status: lead.status || "visited",
        saved_order: lead.saved_order || null,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["party_leads"] }),
  });
}

// ═══ SUBSCRIPTION LEADS ═══
export function useSubscriptionLeads() {
  return useQuery({
    queryKey: ["subscription_leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("subscription_leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useUpsertSubscriptionLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (lead: { name: string; phone: string; location: string; source?: string }) => {
      const { data: existing } = await supabase.from("subscription_leads").select("id").eq("phone", lead.phone).maybeSingle();
      if (existing) {
        const { data, error } = await supabase.from("subscription_leads").update({ name: lead.name, location: lead.location }).eq("id", existing.id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from("subscription_leads").insert(lead).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subscription_leads"] }),
  });
}

// ═══ PARTY ORDERS ═══
export function usePartyOrders(statusFilter?: string) {
  useRealtimeSubscription("party_orders", ["party_orders"]);
  return useQuery({
    queryKey: ["party_orders", statusFilter],
    queryFn: async () => {
      let q = supabase.from("party_orders").select("*").order("created_at", { ascending: false });
      if (statusFilter) q = q.eq("status", statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

// Customer-scoped: only fetch party orders for the logged-in user
export function useMyPartyOrders(userId: string | undefined) {
  useRealtimeSubscription("party_orders", ["my_party_orders"]);
  return useQuery({
    queryKey: ["my_party_orders", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("party_orders")
        .select("*")
        .eq("customer_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

// Customer-scoped: fetch saved party drafts from incomplete_orders
export function useMyPartyDrafts(userId: string | undefined, userPhone: string | undefined) {
  useRealtimeSubscription("incomplete_orders", ["my_party_drafts"]);
  return useQuery({
    queryKey: ["my_party_drafts", userId, userPhone],
    queryFn: async () => {
      if (!userId) return [];
      // Fetch by customer_id first
      const { data: byId, error: e1 } = await supabase
        .from("incomplete_orders")
        .select("*")
        .eq("type", "party")
        .eq("customer_id", userId)
        .order("created_at", { ascending: false });
      
      const results = byId || [];
      const existingIds = new Set(results.map(r => r.id));

      // Also fetch legacy drafts by phone (where customer_id is null)
      if (userPhone) {
        const cleanPhone = userPhone.replace(/\D/g, "");
        if (cleanPhone) {
          const { data: byPhone } = await supabase
            .from("incomplete_orders")
            .select("*")
            .eq("type", "party")
            .is("customer_id", null)
            .eq("customer_phone", cleanPhone)
            .order("created_at", { ascending: false });
          
          if (byPhone?.length) {
            // Claim these drafts for the user
            const ids = byPhone.map(r => r.id);
            await supabase.from("incomplete_orders").update({ customer_id: userId }).in("id", ids);
            byPhone.forEach(r => { if (!existingIds.has(r.id)) results.push(r); });
          }
        }
      }
      
      return results;
    },
    enabled: !!userId,
  });
}

export function useCreatePartyOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (order: any) => {
      const { data, error } = await supabase.from("party_orders").insert(order).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["party_orders"] }),
  });
}

export function useUpdatePartyOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase.from("party_orders").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["party_orders"] }),
  });
}

// ═══ INCOMPLETE ORDERS ═══
export function useIncompleteOrders() {
  return useQuery({
    queryKey: ["incomplete_orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("incomplete_orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useSaveIncompleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (order: any) => {
      const { data, error } = await supabase.from("incomplete_orders").upsert(order, { onConflict: "id" }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["incomplete_orders"] }),
  });
}

// ═══ SNACK ORDERS ═══
export function useSnackOrders() {
  return useQuery({
    queryKey: ["snack_orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("snack_orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// ═══ ALLOCATION ESCALATIONS & LOGS ═══
export function useAllocationEscalations() {
  useRealtimeSubscription("allocation_escalations", ["allocation_escalations"]);
  return useQuery({
    queryKey: ["allocation_escalations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("allocation_escalations").select("*").order("escalated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAllocationLogs() {
  return useQuery({
    queryKey: ["allocation_logs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("allocation_logs").select("*").order("allocated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useResolveEscalation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; status: string; resolved_by: string; resolution: string; refund_amount?: number; refund_type?: string; notes?: string }) => {
      const { data, error } = await supabase.from("allocation_escalations").update({ ...updates, resolved_at: new Date().toISOString() }).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allocation_escalations"] }),
  });
}

// ═══ PARTNER CHATS ═══
export function usePartnerChats() {
  useRealtimeSubscription("partner_chats", ["partner_chats"]);
  return useQuery({
    queryKey: ["partner_chats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("partner_chats").select("*").order("last_activity", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useChatMessages(conversationId: string | null) {
  useRealtimeSubscription("chat_messages", ["chat_messages", conversationId || ""]);
  return useQuery({
    queryKey: ["chat_messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await supabase.from("chat_messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!conversationId,
  });
}

export function useSendChatMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, text, sender, senderName }: { conversationId: string; text: string; sender: "partner" | "admin"; senderName: string }) => {
      const { data, error } = await supabase.from("chat_messages").insert({ conversation_id: conversationId, text, sender, sender_name: senderName }).select().single();
      if (error) throw error;
      // Update last_activity
      await supabase.from("partner_chats").update({ last_activity: new Date().toISOString() }).eq("id", conversationId);
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["chat_messages", vars.conversationId] });
      qc.invalidateQueries({ queryKey: ["partner_chats"] });
    },
  });
}

// ═══ CUSTOMER FEEDBACK ═══
export function useCustomerFeedback() {
  return useQuery({
    queryKey: ["customer_feedback"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customer_feedback").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase.from("customer_feedback").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customer_feedback"] }),
  });
}

// ═══ STOCK ALERTS ═══
export function useStockAlerts() {
  useRealtimeSubscription("stock_alerts", ["stock_alerts"]);
  return useQuery({
    queryKey: ["stock_alerts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("stock_alerts").select("*").order("reported_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateStockAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase.from("stock_alerts").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stock_alerts"] }),
  });
}

// ═══ ORDER MODIFICATIONS ═══
export function useOrderModifications() {
  useRealtimeSubscription("order_modifications", ["order_modifications"]);
  return useQuery({
    queryKey: ["order_modifications"],
    queryFn: async () => {
      const { data, error } = await supabase.from("order_modifications").select("*").order("requested_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateOrderModification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (mod: any) => {
      const { data, error } = await supabase.from("order_modifications").insert(mod).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["order_modifications"] }),
  });
}

// ═══ CANCELLATIONS ═══
export function useCancellations() {
  useRealtimeSubscription("cancellations", ["cancellations"]);
  return useQuery({
    queryKey: ["cancellations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cancellations").select("*").order("cancelled_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateCancellation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cancellation: any) => {
      const { data, error } = await supabase.from("cancellations").insert(cancellation).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cancellations"] }),
  });
}

// ═══ DELAY COMPLAINTS ═══
export function useDelayComplaints() {
  useRealtimeSubscription("delay_complaints", ["delay_complaints"]);
  return useQuery({
    queryKey: ["delay_complaints"],
    queryFn: async () => {
      const { data, error } = await supabase.from("delay_complaints").select("*").order("reported_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// ═══ LEDGER ENTRIES ═══
export function useLedgerEntries() {
  return useQuery({
    queryKey: ["ledger_entries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ledger_entries").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateLedgerEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: any) => {
      const { data, error } = await supabase.from("ledger_entries").insert(entry).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ledger_entries"] }),
  });
}

// ═══ CLASS BOOKINGS ═══
export function useClassBookings() {
  return useQuery({
    queryKey: ["class_bookings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("class_bookings").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// ═══ DELIVERY TRACKING ═══
export function useDeliveryTracking(orderId?: string) {
  useRealtimeSubscription("delivery_tracking", ["delivery_tracking"]);
  return useQuery({
    queryKey: ["delivery_tracking", orderId],
    queryFn: async () => {
      let q = supabase.from("delivery_tracking").select("*").order("created_at", { ascending: false });
      if (orderId) q = q.eq("order_id", orderId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateDeliveryTracking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase.from("delivery_tracking").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["delivery_tracking"] }),
  });
}

export function useCreateDeliveryTracking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (record: any) => {
      const { data, error } = await supabase.from("delivery_tracking").insert(record).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["delivery_tracking"] }),
  });
}

export function useCreateAllocationLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (log: any) => {
      const { data, error } = await supabase.from("allocation_logs").insert(log).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allocation_logs"] }),
  });
}

export function useCreateEscalation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (escalation: any) => {
      const { data, error } = await supabase.from("allocation_escalations").insert(escalation).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allocation_escalations"] }),
  });
}

export function useCreateFeedbackRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (feedback: any) => {
      const { data, error } = await supabase.from("customer_feedback").insert(feedback).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customer_feedback"] }),
  });
}

export function useMenuItems(cuisine?: string) {
  return useQuery({
    queryKey: ["menu_items", cuisine],
    queryFn: async () => {
      let q = supabase.from("menu_items").select("*").eq("is_active", true);
      if (cuisine) q = q.eq("cuisine", cuisine);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

// ═══ COMBO ITEMS ═══
export function useComboItems() {
  return useQuery({
    queryKey: ["combo_items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("combo_items").select("*").eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });
}

// ═══ PARTY MENU ITEMS ═══
export function usePartyMenuItems(region?: string) {
  return useQuery({
    queryKey: ["party_menu_items", region],
    queryFn: async () => {
      let q = supabase.from("party_menu_items").select("*").eq("is_active", true);
      if (region) q = q.eq("region", region);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

// ═══ SNACK PRODUCTS ═══
export function useSnackProducts(category?: string) {
  return useQuery({
    queryKey: ["snack_products", category],
    queryFn: async () => {
      let q = supabase.from("snack_products").select("*").eq("is_active", true);
      if (category && category !== "all") q = q.eq("category", category);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useSnackProductById(id: string) {
  return useQuery({
    queryKey: ["snack_product", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("snack_products").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// ═══ SUBSCRIPTION PLANS ═══
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ["subscription_plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("subscription_plans").select("*").eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });
}

// ═══ SERVICES ═══
export function useServices(category?: string) {
  return useQuery({
    queryKey: ["services", category],
    queryFn: async () => {
      let q = supabase.from("services").select("*").eq("is_active", true);
      if (category) q = q.eq("category", category);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

// ═══ APP CONFIG ═══
export function useAppConfig(key: string) {
  return useQuery({
    queryKey: ["app_config", key],
    queryFn: async () => {
      const { data, error } = await supabase.from("app_config").select("value").eq("key", key).maybeSingle();
      if (error) throw error;
      return data?.value;
    },
  });
}

// ═══ USER CART ═══
export function useUserCart() {
  return useQuery({
    queryKey: ["user_cart"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase.from("user_carts").select("*").eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useSaveCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: any[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.from("user_carts").upsert({ user_id: user.id, items }, { onConflict: "user_id" }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_cart"] }),
  });
}

// ═══ USER WALLET ═══
export function useUserWallet() {
  return useQuery({
    queryKey: ["user_wallet"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase.from("user_wallets").select("*").eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

// ═══ KITCHEN PARTNERS ═══

// Haversine distance in km
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useKitchenVisibilityRadius() {
  return useQuery({
    queryKey: ["kitchen_visibility_radius"],
    queryFn: async () => {
      const { data } = await supabase.from("app_config").select("value").eq("key", "kitchen_visibility_radius_km").maybeSingle();
      return data ? Number(data.value) : 7;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useKitchenPartners(activeOnly?: boolean) {
  useRealtimeSubscription("kitchen_partners", ["kitchen_partners"]);
  return useQuery({
    queryKey: ["kitchen_partners", activeOnly],
    queryFn: async () => {
      let q = supabase.from("kitchen_partners").select("*").eq("is_active", true);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useNearbyKitchenPartners(customerLat?: number | null, customerLng?: number | null, customerZip?: string | null) {
  useRealtimeSubscription("kitchen_partners", ["kitchen_partners_nearby"]);
  const { data: radiusKm } = useKitchenVisibilityRadius();

  return useQuery({
    queryKey: ["kitchen_partners_nearby", customerLat, customerLng, customerZip, radiusKm],
    queryFn: async () => {
      const [kitchenRes, locRes] = await Promise.all([
        supabase.from("kitchen_partners").select("*").eq("is_active", true),
        supabase.from("kitchen_partner_locations").select("*").eq("is_active", true),
      ]);
      if (kitchenRes.error) throw kitchenRes.error;
      if (locRes.error) throw locRes.error;

      const kitchens = kitchenRes.data || [];
      const locations = locRes.data || [];
      const radius = radiusKm || 7;
      const normalizedZip = normalizeZip(customerZip || "");

      const kitchenWithMeta = kitchens.map((k: any) => {
        let distance: number | null = null;
        let zipMatch = false;

        if (k.is_branded) {
          const kitchenLocs = locations.filter((l: any) => l.kitchen_id === k.id);
          if (customerLat != null && customerLng != null) {
            const distances = kitchenLocs
              .filter((l: any) => l.latitude && l.longitude)
              .map((l: any) => haversineDistance(customerLat, customerLng, Number(l.latitude), Number(l.longitude)));
            distance = distances.length > 0 ? Math.min(...distances) : null;
          }

          zipMatch = normalizedZip
            ? kitchenLocs.some((l: any) => normalizeZip(String(l.pincode || "")) === normalizedZip)
            : false;
        } else {
          if (customerLat != null && customerLng != null && k.latitude && k.longitude) {
            distance = haversineDistance(Number(customerLat), Number(customerLng), Number(k.latitude), Number(k.longitude));
          }

          zipMatch = normalizedZip
            ? normalizeZip(String(k.pincode || "")) === normalizedZip
            : false;
        }

        return { ...k, distance, zipMatch };
      });

      const hasCoords = customerLat != null && customerLng != null;
      const hasZip = !!normalizedZip;

      if (hasCoords) {
        const coordFiltered = kitchenWithMeta.filter((k: any) => k.distance != null && k.distance <= radius);
        if (coordFiltered.length > 0 || !hasZip) {
          return coordFiltered;
        }
      }

      if (hasZip) {
        return kitchenWithMeta.filter((k: any) => k.zipMatch);
      }

      return kitchenWithMeta;
    },
  });
}

export function useKitchenPartner(id: string | undefined) {
  return useQuery({
    queryKey: ["kitchen_partner", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("kitchen_partners").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// ═══ INSTANT MENU ITEMS (kitchen-specific) ═══
export function useInstantMenuItems(kitchenId?: string) {
  return useQuery({
    queryKey: ["instant_menu_items", kitchenId],
    queryFn: async () => {
      let q = supabase.from("instant_menu_items").select("*").eq("is_active", true);
      if (kitchenId) q = q.eq("kitchen_id", kitchenId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

// ═══ INSTANT MENU CATEGORIES (from kitchen_categories for branded, plus instant_menu_items) ═══
export function useInstantMenuCategories() {
  return useQuery({
    queryKey: ["instant_menu_categories"],
    queryFn: async () => {
      // Pull from kitchen_categories (branded kitchens) + instant_menu_items (all)
      const [catRes, menuRes] = await Promise.all([
        supabase.from("kitchen_categories").select("name").eq("is_active", true),
        supabase.from("instant_menu_items").select("category").eq("is_active", true),
      ]);
      if (catRes.error) throw catRes.error;
      if (menuRes.error) throw menuRes.error;
      const names = new Set<string>();
      (catRes.data || []).forEach((c: any) => names.add(c.name));
      (menuRes.data || []).forEach((m: any) => names.add(m.category));
      return [...names].sort();
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ═══ KITCHEN CATEGORIES (for a specific kitchen) ═══
export function useKitchenCategoriesForKitchen(kitchenId?: string) {
  return useQuery({
    queryKey: ["kitchen_categories", kitchenId],
    queryFn: async () => {
      if (!kitchenId) return [];
      const { data, error } = await supabase
        .from("kitchen_categories")
        .select("*")
        .eq("kitchen_id", kitchenId)
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return data;
    },
    enabled: !!kitchenId,
  });
}

export function useInstantMenuItem(id: string | undefined) {
  return useQuery({
    queryKey: ["instant_menu_item", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("instant_menu_items").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// ═══ SUBSCRIPTION MEAL PLANS ═══
export function useSubscriptionMealPlans() {
  return useQuery({
    queryKey: ["subscription_meal_plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("subscription_meal_plans").select("*").eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });
}

// ═══ SUBSCRIPTION MENU ITEMS ═══
export function useSubscriptionMenuItems(cuisine?: string) {
  return useQuery({
    queryKey: ["subscription_menu_items", cuisine],
    queryFn: async () => {
      let q = supabase.from("subscription_menu_items").select("*").eq("is_active", true);
      if (cuisine) q = q.eq("cuisine", cuisine);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

// ═══ SUBSCRIPTION CUSTOMERS ═══
export function useSubscriptionCustomers(statusFilter?: string) {
  useRealtimeSubscription("subscription_customers", ["subscription_customers"]);
  return useQuery({
    queryKey: ["subscription_customers", statusFilter],
    queryFn: async () => {
      let q = supabase.from("subscription_customers").select("*").order("created_at", { ascending: false });
      if (statusFilter) q = q.eq("status", statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateSubscriptionCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase.from("subscription_customers").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subscription_customers"] }),
  });
}

// ═══ INSTANT ORDERS ═══
export function useInstantOrders(statusFilter?: string) {
  useRealtimeSubscription("instant_orders", ["instant_orders"]);
  return useQuery({
    queryKey: ["instant_orders", statusFilter],
    queryFn: async () => {
      let q = supabase.from("instant_orders").select("*").order("created_at", { ascending: false });
      if (statusFilter) q = q.eq("status", statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateInstantOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (order: any) => {
      const { data, error } = await supabase.from("instant_orders").insert(order).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instant_orders"] }),
  });
}

export function useUpdateInstantOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase.from("instant_orders").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instant_orders"] }),
  });
}

// ═══ SERVICE BOOKINGS ═══
export function useServiceBookings() {
  useRealtimeSubscription("service_bookings", ["service_bookings"]);
  return useQuery({
    queryKey: ["service_bookings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_bookings").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateServiceBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (booking: any) => {
      const { data, error } = await supabase.from("service_bookings").insert(booking).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["service_bookings"] }),
  });
}

// ═══ PARTY COMBO CONFIGS ═══
export function usePartyComboConfigs() {
  return useQuery({
    queryKey: ["party_combo_configs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("party_combo_configs").select("*").eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });
}

// ═══ ADMIN DASHBOARD STATS ═══
export function useAdminDashboardStats() {
  useRealtimeSubscription("instant_orders", ["admin_dashboard_stats"]);
  useRealtimeSubscription("kitchen_partners", ["admin_dashboard_stats"]);
  return useQuery({
    queryKey: ["admin_dashboard_stats"],
    queryFn: async () => {
      const [ordersRes, kitchensRes, usersRes, menuItemsRes] = await Promise.all([
        supabase.from("instant_orders").select("id, status, total", { count: "exact" }),
        supabase.from("kitchen_partners").select("id, is_active", { count: "exact" }).eq("is_active", true),
        supabase.from("profiles").select("user_id", { count: "exact" }),
        supabase.from("instant_menu_items").select("id, category", { count: "exact" }).eq("is_active", true),
      ]);
      const totalOrders = ordersRes.count ?? (ordersRes.data?.length ?? 0);
      const activeKitchens = kitchensRes.count ?? (kitchensRes.data?.length ?? 0);
      const registeredUsers = usersRes.count ?? (usersRes.data?.length ?? 0);
      const cuisineSet = new Set((menuItemsRes.data || []).map((r: any) => r.category));

      // Revenue from delivered orders
      const revenue = (ordersRes.data || [])
        .filter((o: any) => o.status === "delivered")
        .reduce((s: number, o: any) => s + Number(o.total || 0), 0);

      return {
        totalOrders,
        activeKitchens,
        registeredUsers,
        cuisines: cuisineSet.size,
        revenue,
      };
    },
    staleTime: 30 * 1000, // refresh every 30s
  });
}

// Pending partner onboarding requests (from party_orders with status = 'draft' used as proxy,
// or instant_orders with status = 'new' as pending PPP approvals stand-in until
// a dedicated partner_applications table is available)
export function usePendingInstantOrders(limit = 5) {
  useRealtimeSubscription("instant_orders", ["pending_instant_orders"]);
  return useQuery({
    queryKey: ["pending_instant_orders", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instant_orders")
        .select("id, order_code, customer_name, kitchen_name, total, created_at, status")
        .eq("status", "new")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });
}

// ═══ PARTNER PAYMENTS ═══
export function usePartnerPayments(weekId?: string) {
  return useQuery({
    queryKey: ["partner_payments", weekId],
    queryFn: async () => {
      let q = supabase.from("partner_payments" as any).select("*").order("created_at", { ascending: false });
      if (weekId) q = (q as any).eq("week_id", weekId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}

export function usePartnerPaymentWeeks() {
  return useQuery({
    queryKey: ["partner_payment_weeks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_payments" as any)
        .select("week_id, week_label, week_start, week_end, status")
        .order("week_start", { ascending: false });
      if (error) throw error;
      // Deduplicate by week_id
      const seen = new Set<string>();
      return ((data ?? []) as any[]).filter((r: any) => {
        if (seen.has(r.week_id)) return false;
        seen.add(r.week_id);
        return true;
      });
    },
  });
}

export function useCreatePartnerPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payment: any) => {
      const { data, error } = await supabase.from("partner_payments" as any).insert(payment).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["partner_payments"] });
      qc.invalidateQueries({ queryKey: ["partner_payment_weeks"] });
    },
  });
}

export function useUpdatePartnerPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase.from("partner_payments" as any).update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["partner_payments"] });
      qc.invalidateQueries({ queryKey: ["partner_payment_weeks"] });
    },
  });
}

// ═══ PPP PENALTIES ═══
export function usePPPPenalties(partnerId?: string) {
  return useQuery({
    queryKey: ["ppp_penalties", partnerId],
    queryFn: async () => {
      let q = supabase.from("ppp_penalties" as any).select("*").order("created_at", { ascending: false });
      if (partnerId) q = (q as any).eq("partner_id", partnerId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}

export function useCreatePPPPenalty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (penalty: any) => {
      const { data, error } = await supabase.from("ppp_penalties" as any).insert(penalty).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ppp_penalties"] }),
  });
}

export function useUpdatePPPPenalty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase.from("ppp_penalties" as any).update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ppp_penalties"] }),
  });
}

// ═══ COMMUNICATIONS ═══
export function useCommunications(vertical?: string) {
  return useQuery({
    queryKey: ["communications", vertical],
    queryFn: async () => {
      let q = supabase.from("communications" as any).select("*").order("created_at", { ascending: false });
      if (vertical) q = (q as any).eq("vertical", vertical);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}

export function useCreateCommunication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (comm: any) => {
      const { data, error } = await supabase.from("communications" as any).insert(comm).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["communications"] }),
  });
}

export function useUpdateCommunication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase.from("communications" as any).update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["communications"] }),
  });
}

export function useDeleteCommunication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("communications" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["communications"] }),
  });
}

// ═══ INSTANT ORDER STATS (aggregated) ═══
export function useInstantOrderStats() {
  return useQuery({
    queryKey: ["instant_order_stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instant_orders")
        .select("id, status, total, subtotal, delivery_fee, platform_fee, tax, discount, created_at, kitchen_name, partner_id");
      if (error) throw error;
      const orders = data ?? [];
      const delivered = orders.filter((o: any) => o.status === "delivered");
      const totalRevenue = delivered.reduce((s: number, o: any) => s + Number(o.total || 0), 0);
      const totalSales = delivered.reduce((s: number, o: any) => s + Number(o.subtotal || 0), 0);
      const totalDeliveryFee = delivered.reduce((s: number, o: any) => s + Number(o.delivery_fee || 0), 0);
      const totalPlatformFee = delivered.reduce((s: number, o: any) => s + Number(o.platform_fee || 0), 0);
      const totalTax = delivered.reduce((s: number, o: any) => s + Number(o.tax || 0), 0);
      const totalDiscount = delivered.reduce((s: number, o: any) => s + Number(o.discount || 0), 0);
      // Group by month
      const byMonth: Record<string, { revenue: number; orders: number }> = {};
      for (const o of delivered) {
        const month = new Date(o.created_at).toLocaleDateString("en-US", { month: "short" });
        if (!byMonth[month]) byMonth[month] = { revenue: 0, orders: 0 };
        byMonth[month].revenue += Number(o.total || 0);
        byMonth[month].orders += 1;
      }
      const statusCounts: Record<string, number> = {};
      for (const o of orders) {
        statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
      }
      // By partner
      const byPartner: Record<string, { name: string; orders: number; revenue: number }> = {};
      for (const o of delivered) {
        const key = o.partner_id || "unknown";
        if (!byPartner[key]) byPartner[key] = { name: o.kitchen_name || key, orders: 0, revenue: 0 };
        byPartner[key].orders += 1;
        byPartner[key].revenue += Number(o.total || 0);
      }
      return {
        totalOrders: orders.length,
        deliveredOrders: delivered.length,
        totalRevenue,
        totalSales,
        totalDeliveryFee,
        totalPlatformFee,
        totalTax,
        totalDiscount,
        byMonth,
        statusCounts,
        byPartner,
        avgOrderValue: delivered.length > 0 ? Math.round(totalRevenue / delivered.length) : 0,
      };
    },
    staleTime: 60 * 1000,
  });
}
