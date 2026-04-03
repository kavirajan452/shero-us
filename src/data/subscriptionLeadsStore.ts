// Subscription Lead Capture Store — NOW BACKED BY SUPABASE

import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionLead {
  id: string;
  name: string;
  phone: string;
  location: string;
  source: "direct" | "marketing" | "referral" | "organic";
  createdAt: string;
  updatedAt: string;
  savedPlan?: string;
}

function mapDbToLead(row: any): SubscriptionLead {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    location: row.location,
    source: row.source as SubscriptionLead["source"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    savedPlan: row.saved_plan || undefined,
  };
}

export const findSubscriptionLeadByPhone = async (phone: string): Promise<SubscriptionLead | undefined> => {
  const { data } = await supabase.from("subscription_leads").select("*").eq("phone", phone).maybeSingle();
  return data ? mapDbToLead(data) : undefined;
};

export const createOrUpdateSubscriptionLead = async (input: {
  name: string; phone: string; location: string; source?: string;
}): Promise<SubscriptionLead> => {
  const { data: existing } = await supabase.from("subscription_leads").select("*").eq("phone", input.phone).maybeSingle();
  
  if (existing) {
    const { data, error } = await supabase.from("subscription_leads").update({
      name: input.name || existing.name,
      location: input.location || existing.location,
    }).eq("id", existing.id).select().single();
    if (error || !data) throw error || new Error("Update failed");
    return mapDbToLead(data);
  }
  
  const { data, error } = await supabase.from("subscription_leads").insert({
    name: input.name,
    phone: input.phone,
    location: input.location,
    source: (input.source as SubscriptionLead["source"]) || "organic",
  }).select().single();
  if (error || !data) throw error || new Error("Insert failed");
  return mapDbToLead(data);
};
