// Party order leads & saved orders store
// NOW BACKED BY SUPABASE — localStorage kept as fallback cache

import { supabase } from "@/integrations/supabase/client";

export type LeadStatus = "visited" | "menu_saved" | "order_placed" | "pre_order_discussion" | "exited";

export interface PartyLead {
  id: string;
  name: string;
  phone: string;
  location: string;
  createdAt: string;
  lastVisit: string;
  status: LeadStatus;
  savedOrder?: SavedPartyOrder;
  visits: number;
  source: string;
}

export interface SavedPartyOrder {
  foodType: string;
  menuChoice: string;
  selectedMenuType: string;
  guestCount: number;
  occasion: string;
  eventDate: string;
  servingTime: string;
  deliveryOption: string;
  selectedItems: string[];
  selectedAddOns: string[];
  savedAt: string;
  expiresAt: string;
}

// ── Supabase-backed functions ──

function mapDbToLead(row: any): PartyLead {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    location: row.location,
    createdAt: row.created_at,
    lastVisit: row.last_visit || row.updated_at,
    status: row.status as LeadStatus,
    savedOrder: row.saved_order || undefined,
    visits: row.visits || 1,
    source: row.source || "direct",
  };
}

export async function getAllLeadsAsync(): Promise<PartyLead[]> {
  const { data, error } = await supabase.from("party_leads").select("*").order("created_at", { ascending: false });
  if (error || !data) return getAllLeads(); // fallback to localStorage
  return data.map(mapDbToLead);
}

export async function findLeadByPhoneAsync(phone: string): Promise<PartyLead | null> {
  const cleaned = phone.replace(/\D/g, "");
  const { data, error } = await supabase.from("party_leads").select("*").eq("phone", cleaned).maybeSingle();
  if (error || !data) return findLeadByPhone(cleaned); // fallback to localStorage
  return mapDbToLead(data);
}

export async function createOrUpdateLeadAsync(data: { name: string; phone: string; location: string; source?: string }): Promise<PartyLead> {
  const { data: existing } = await supabase.from("party_leads").select("*").eq("phone", data.phone).maybeSingle();
  
  if (existing) {
    const { data: updated, error } = await supabase.from("party_leads").update({
      name: data.name || existing.name,
      location: data.location || existing.location,
      last_visit: new Date().toISOString(),
      visits: (existing.visits || 1) + 1,
    }).eq("id", existing.id).select().single();
    if (error || !updated) return createOrUpdateLead(data); // fallback
    return mapDbToLead(updated);
  }
  
  const { data: created, error } = await supabase.from("party_leads").insert({
    name: data.name,
    phone: data.phone,
    location: data.location,
    source: data.source || "direct",
    status: "visited",
    visits: 1,
  }).select().single();
  if (error || !created) return createOrUpdateLead(data); // fallback
  return mapDbToLead(created);
}

export async function updateLeadStatusAsync(phone: string, status: LeadStatus) {
  await supabase.from("party_leads").update({ status, last_visit: new Date().toISOString() }).eq("phone", phone);
}

export async function saveOrderForLeadAsync(phone: string, order: Omit<SavedPartyOrder, "savedAt" | "expiresAt">) {
  const d = new Date(); d.setDate(d.getDate() + 15);
  const savedOrder = { ...order, savedAt: new Date().toISOString(), expiresAt: d.toISOString() };
  await supabase.from("party_leads").update({ saved_order: savedOrder as any, status: "menu_saved", last_visit: new Date().toISOString() }).eq("phone", phone);
}

// ── Legacy localStorage functions (kept for backward compatibility) ──

const LEADS_KEY = "shero-party-leads";
const CURRENT_LEAD_KEY = "shero-party-current-lead";

export function getAllLeads(): PartyLead[] {
  try {
    const raw = localStorage.getItem(LEADS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveAllLeads(leads: PartyLead[]) {
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
}

export function findLeadByPhone(phone: string): PartyLead | null {
  return getAllLeads().find((l) => l.phone === phone) || null;
}

export function createOrUpdateLead(data: { name: string; phone: string; location: string; source?: string }): PartyLead {
  const leads = getAllLeads();
  const existing = leads.find((l) => l.phone === data.phone);
  if (existing) {
    existing.name = data.name || existing.name;
    existing.location = data.location || existing.location;
    existing.lastVisit = new Date().toISOString();
    existing.visits += 1;
    saveAllLeads(leads);
    setCurrentLead(existing);
    // Also sync to Supabase
    createOrUpdateLeadAsync(data).catch(() => {});
    return existing;
  }
  const lead: PartyLead = {
    id: `pl-${Date.now()}`,
    name: data.name, phone: data.phone, location: data.location,
    createdAt: new Date().toISOString(), lastVisit: new Date().toISOString(),
    status: "visited", visits: 1, source: data.source || "direct",
  };
  leads.push(lead);
  saveAllLeads(leads);
  setCurrentLead(lead);
  createOrUpdateLeadAsync(data).catch(() => {});
  return lead;
}

export function updateLeadStatus(phone: string, status: LeadStatus) {
  const leads = getAllLeads();
  const lead = leads.find((l) => l.phone === phone);
  if (lead) { lead.status = status; lead.lastVisit = new Date().toISOString(); saveAllLeads(leads); }
  updateLeadStatusAsync(phone, status).catch(() => {});
}

export function saveOrderForLead(phone: string, order: Omit<SavedPartyOrder, "savedAt" | "expiresAt">) {
  const leads = getAllLeads();
  const lead = leads.find((l) => l.phone === phone);
  if (lead) {
    const d = new Date(); d.setDate(d.getDate() + 15);
    lead.savedOrder = { ...order, savedAt: new Date().toISOString(), expiresAt: d.toISOString() };
    lead.status = "menu_saved"; lead.lastVisit = new Date().toISOString();
    saveAllLeads(leads);
  }
  saveOrderForLeadAsync(phone, order).catch(() => {});
}

export function markOrderPlaced(phone: string) { updateLeadStatus(phone, "order_placed"); }
export function setCurrentLead(lead: PartyLead) { localStorage.setItem(CURRENT_LEAD_KEY, JSON.stringify(lead)); }
export function getCurrentLead(): PartyLead | null { try { return JSON.parse(localStorage.getItem(CURRENT_LEAD_KEY) || "null"); } catch { return null; } }
export function clearCurrentLead() { localStorage.removeItem(CURRENT_LEAD_KEY); }

export function getLeadStats() {
  const leads = getAllLeads();
  return {
    total: leads.length,
    visited: leads.filter((l) => l.status === "visited").length,
    menuSaved: leads.filter((l) => l.status === "menu_saved").length,
    orderPlaced: leads.filter((l) => l.status === "order_placed").length,
    preOrderDiscussion: leads.filter((l) => l.status === "pre_order_discussion").length,
    exited: leads.filter((l) => l.status === "exited").length,
  };
}
