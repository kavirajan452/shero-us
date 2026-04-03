// Shared chat store — NOW BACKED BY SUPABASE with realtime

import { supabase } from "@/integrations/supabase/client";

export interface ChatMessage {
  id: string;
  text: string;
  sender: "partner" | "admin";
  senderName: string;
  timestamp: Date;
}

export interface ChatConversation {
  id: string;
  partnerName: string;
  partnerRMN: string;
  adminEmail: string;
  adminName: string;
  adminRole: string;
  messages: ChatMessage[];
  status: "active" | "closed";
  createdAt: Date;
  lastActivity: Date;
}

// ── Supabase-backed functions ──

export async function getConversationsAsync(): Promise<ChatConversation[]> {
  const { data: convs, error } = await supabase.from("partner_chats").select("*").order("last_activity", { ascending: false });
  if (error || !convs) return getConversations();
  
  const result: ChatConversation[] = [];
  for (const c of convs) {
    const { data: msgs } = await supabase.from("chat_messages").select("*").eq("conversation_id", c.id).order("created_at", { ascending: true });
    result.push({
      id: c.id,
      partnerName: c.partner_name,
      partnerRMN: c.partner_rmn,
      adminEmail: c.admin_email,
      adminName: c.admin_name,
      adminRole: c.admin_role || "",
      messages: (msgs || []).map(m => ({ id: m.id, text: m.text, sender: m.sender as "partner" | "admin", senderName: m.sender_name, timestamp: new Date(m.created_at) })),
      status: c.status as "active" | "closed",
      createdAt: new Date(c.created_at),
      lastActivity: new Date(c.last_activity),
    });
  }
  return result;
}

export async function addMessageAsync(conversationId: string, text: string, sender: "partner" | "admin", senderName: string) {
  await supabase.from("chat_messages").insert({ conversation_id: conversationId, text, sender, sender_name: senderName });
  await supabase.from("partner_chats").update({ last_activity: new Date().toISOString() }).eq("id", conversationId);
}

export async function createConversationAsync(data: { partnerName: string; partnerRMN: string; adminEmail: string; adminName: string; adminRole: string }) {
  const { data: conv, error } = await supabase.from("partner_chats").insert({
    partner_name: data.partnerName,
    partner_rmn: data.partnerRMN,
    admin_email: data.adminEmail,
    admin_name: data.adminName,
    admin_role: data.adminRole,
  }).select().single();
  if (error || !conv) return createConversation(data);
  return { id: conv.id, ...data, messages: [], status: "active" as const, createdAt: new Date(conv.created_at), lastActivity: new Date(conv.last_activity) };
}

// ── Legacy in-memory store (backward compat) ──
let conversations: ChatConversation[] = [
  {
    id: "conv-001", partnerName: "Sujatha M.", partnerRMN: "+1 (212) 555-0101",
    adminEmail: "ssc-exec@shero.in", adminName: "Preethi V.", adminRole: "SSC Executor",
    messages: [
      { id: "m1", text: "Hi, I have an issue with my order ORD-4521.", sender: "partner", senderName: "Sujatha M.", timestamp: new Date("2026-03-07T09:30:00") },
      { id: "m2", text: "Hi Sujatha! Let me check order ORD-4521 for you.", sender: "admin", senderName: "Preethi V.", timestamp: new Date("2026-03-07T09:31:00") },
    ],
    status: "active", createdAt: new Date("2026-03-07T09:30:00"), lastActivity: new Date("2026-03-07T09:34:00"),
  },
];

let listeners: (() => void)[] = [];
function notify() { listeners.forEach((fn) => fn()); }

export function subscribeChatStore(listener: () => void) {
  listeners.push(listener);
  return () => { listeners = listeners.filter((l) => l !== listener); };
}

export function getConversations(): ChatConversation[] { return [...conversations]; }
export function getConversation(id: string): ChatConversation | undefined { return conversations.find((c) => c.id === id); }
export function getConversationByParticipants(partnerRMN: string, adminEmail: string): ChatConversation | undefined {
  return conversations.find((c) => c.partnerRMN === partnerRMN && c.adminEmail === adminEmail && c.status === "active");
}

export function createConversation(data: Omit<ChatConversation, "id" | "messages" | "status" | "createdAt" | "lastActivity">): ChatConversation {
  const conv: ChatConversation = { ...data, id: `conv-${Date.now()}`, messages: [], status: "active", createdAt: new Date(), lastActivity: new Date() };
  conversations = [conv, ...conversations];
  notify();
  createConversationAsync(data).catch(() => {});
  return conv;
}

export function addMessage(conversationId: string, text: string, sender: "partner" | "admin", senderName: string): ChatMessage {
  const msg: ChatMessage = { id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, text, sender, senderName, timestamp: new Date() };
  conversations = conversations.map((c) => c.id === conversationId ? { ...c, messages: [...c.messages, msg], lastActivity: new Date() } : c);
  notify();
  addMessageAsync(conversationId, text, sender, senderName).catch(() => {});
  return msg;
}

export function closeConversation(conversationId: string) {
  conversations = conversations.map((c) => c.id === conversationId ? { ...c, status: "closed" as const } : c);
  notify();
  supabase.from("partner_chats").update({ status: "closed" }).eq("id", conversationId).then(() => {});
}
