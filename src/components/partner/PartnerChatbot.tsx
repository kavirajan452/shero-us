import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { MessageCircle, X, Send, Bot, ArrowLeft, Users, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ADMIN_ROLES, MOCK_ADMIN_ACCOUNTS } from "@/data/adminRoles";
import {
  subscribeChatStore,
  getConversationByParticipants,
  createConversation,
  addMessage,
  type ChatConversation,
} from "@/data/chatStore";

type ChatView = "menu" | "ai-chat" | "admin-list" | "live-chat";

interface LocalMessage {
  id: string;
  text: string;
  sender: "partner" | "bot" | "admin";
  adminName?: string;
  timestamp: Date;
}

// AI mock responses
const aiResponses: Record<string, string> = {
  order: "For order-related issues, please check your **Orders** page. If an order is stuck, try refreshing the page. For cancellation, go to Orders → select the order → Cancel. Need more help? I can connect you to an admin.",
  payment: "Payments are processed every **Monday**. Your current week's earnings will be reflected in the **PPP Earnings** section. If you see a discrepancy, I can connect you to the **PPP Manager**.",
  menu: "To manage your menu, go to **Menu Management**. Branded items are centrally controlled — use the **Ingredients** toggle to mark items available/unavailable. For unbranded items, you have full edit access.",
  kitchen: "Kitchen management is available under **Kitchens**. You can toggle kitchens ON/OFF, add new branded/unbranded kitchens, and manage cuisines. New kitchens need **KOBTL approval**.",
  training: "Visit the **Training** section to access your training modules. Complete all checkpoints to earn your certificate. Videos are available for each module.",
  leave: "To mark a leave, go to **Attendance** and toggle your availability. Make sure to inform at least **24 hours** in advance to avoid penalties.",
  default: "I'm **Shero AI Assistant** 🤖. I can help with:\n\n• 📦 **Orders** — tracking, cancellations\n• 💰 **Payments** — PPP, earnings\n• 🍽️ **Menu** — items, ingredients\n• 🏠 **Kitchen** — management\n• 📚 **Training** — modules, certificates\n• 📅 **Leave** — attendance\n\nType your question or say **\"connect to SSC\"** to chat with a support agent.",
};

function getAiResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("connect") || lower.includes("admin") || lower.includes("human") || lower.includes("person") || lower.includes("escalate") || lower.includes("ssc") || lower.includes("support")) {
    return "Sure! I'll connect you to our **SSC team**. Please select the agent you'd like to chat with. 👉 Click **\"Talk to SSC\"** above.";
  }
  if (lower.includes("order") || lower.includes("cancel")) return aiResponses.order;
  if (lower.includes("payment") || lower.includes("ppp") || lower.includes("earning") || lower.includes("payout")) return aiResponses.payment;
  if (lower.includes("menu") || lower.includes("item") || lower.includes("ingredient")) return aiResponses.menu;
  if (lower.includes("kitchen") || lower.includes("cuisine")) return aiResponses.kitchen;
  if (lower.includes("training") || lower.includes("certificate") || lower.includes("module")) return aiResponses.training;
  if (lower.includes("leave") || lower.includes("attendance") || lower.includes("off")) return aiResponses.leave;
  return `I understand you're asking about "${input}". Let me help!\n\nCould you be more specific? I can help with **orders, payments, menu, kitchens, training, or leave**.\n\nOr type **"connect to SSC"** to chat with a support agent directly.`;
}

// SSC team only
const sscTeam = MOCK_ADMIN_ACCOUNTS.filter((a) =>
  ["ssc_manager", "ssc_tl", "ssc_executor"].includes(a.role)
).map((a) => ({
  ...a,
  roleLabel: ADMIN_ROLES.find((r) => r.key === a.role)?.label || a.role,
  online: Math.random() > 0.3,
}));

// Mock partner identity
const MOCK_PARTNER = { name: "Current Partner", rmn: "+91 99999 00001" };

export default function PartnerChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<ChatView>("menu");
  const [aiMessages, setAiMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<(typeof sscTeam)[0] | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [activeConv, setActiveConv] = useState<ChatConversation | null>(null);
  const [, forceRender] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Subscribe to chat store changes
  useEffect(() => {
    return subscribeChatStore(() => forceRender((n) => n + 1));
  }, []);

  // Get live messages from store
  const liveMessages = useMemo(() => {
    if (!activeConv) return [];
    const conv = getConversationByParticipants(MOCK_PARTNER.rmn, activeConv.adminEmail) || activeConv;
    // Re-fetch from store
    return conv.messages.map((m) => ({
      id: m.id,
      text: m.text,
      sender: m.sender === "partner" ? ("partner" as const) : ("admin" as const),
      adminName: m.sender === "admin" ? m.senderName : undefined,
      timestamp: m.timestamp,
    }));
  }, [activeConv, forceRender]);

  const currentMessages = useMemo(() => {
    if (view === "live-chat") return liveMessages;
    if (view === "ai-chat") return aiMessages;
    return [];
  }, [view, liveMessages, aiMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentMessages, isTyping]);

  const openChat = () => {
    setIsOpen(true);
    setUnreadCount(0);
    if (aiMessages.length === 0) {
      setAiMessages([{ id: "welcome", text: aiResponses.default, sender: "bot", timestamp: new Date() }]);
    }
  };

  const sendAiMessage = () => {
    if (!input.trim()) return;
    const userMsg: LocalMessage = { id: `u-${Date.now()}`, text: input.trim(), sender: "partner", timestamp: new Date() };
    setAiMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const reply = getAiResponse(userMsg.text);
      setAiMessages((prev) => [...prev, { id: `b-${Date.now()}`, text: reply, sender: "bot", timestamp: new Date() }]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const sendLiveMessage = () => {
    if (!input.trim() || !selectedAdmin || !activeConv) return;
    addMessage(activeConv.id, input.trim(), "partner", MOCK_PARTNER.name);
    setInput("");

    // Simulate admin auto-reply
    setIsTyping(true);
    setTimeout(() => {
      const replies = [
        "Hi! Thanks for reaching out. Let me check that for you.",
        "I'm looking into this now. Please give me a moment.",
        "Sure, I can help with that. Could you share more details?",
        "Got it! I'll update you shortly.",
        "Thanks for your patience. Let me verify the information.",
      ];
      addMessage(activeConv.id, replies[Math.floor(Math.random() * replies.length)], "admin", selectedAdmin.name);
      setIsTyping(false);
    }, 1500 + Math.random() * 1500);
  };

  const handleSend = () => {
    if (view === "ai-chat") sendAiMessage();
    else if (view === "live-chat") sendLiveMessage();
  };

  const startLiveChat = useCallback((admin: (typeof sscTeam)[0]) => {
    setSelectedAdmin(admin);
    // Find or create conversation
    let conv = getConversationByParticipants(MOCK_PARTNER.rmn, admin.rem);
    if (!conv) {
      conv = createConversation({
        partnerName: MOCK_PARTNER.name,
        partnerRMN: MOCK_PARTNER.rmn,
        adminEmail: admin.rem,
        adminName: admin.name,
        adminRole: admin.roleLabel,
      });
    }
    setActiveConv(conv);
    setView("live-chat");
  }, []);

  const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const renderMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={openChat}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[360px] h-[520px] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3">
            {(view === "ai-chat" || view === "live-chat" || view === "admin-list") && (
              <button onClick={() => { setView(view === "live-chat" ? "admin-list" : "menu"); setSelectedAdmin(view === "live-chat" ? selectedAdmin : null); }} className="hover:opacity-80">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex-1 min-w-0">
              {view === "menu" && <p className="font-semibold text-sm">Shero Support</p>}
              {view === "ai-chat" && <p className="font-semibold text-sm">🤖 AI Assistant</p>}
              {view === "admin-list" && <p className="font-semibold text-sm"><Headphones className="w-4 h-4 inline mr-1" />SSC Team</p>}
              {view === "live-chat" && selectedAdmin && (
                <>
                  <p className="font-semibold text-sm">{selectedAdmin.name}</p>
                  <p className="text-[10px] opacity-80">{selectedAdmin.roleLabel} • SSC</p>
                </>
              )}
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:opacity-80">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Menu view */}
          {view === "menu" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-foreground">How can we help?</h3>
                <p className="text-xs text-muted-foreground mt-1">Choose how you'd like to get support</p>
              </div>
              <div className="w-full space-y-3">
                <button
                  onClick={() => setView("ai-chat")}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-primary/20 bg-primary/5 hover:border-primary/40 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">AI Assistant</p>
                    <p className="text-[11px] text-muted-foreground">Get instant answers to common questions</p>
                  </div>
                </button>
                <button
                  onClick={() => setView("admin-list")}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-border hover:border-primary/30 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                    <Headphones className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">Talk to SSC</p>
                    <p className="text-[11px] text-muted-foreground">Chat with Shero Support Center agents</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* SSC team list */}
          {view === "admin-list" && (
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                <p className="text-[11px] text-muted-foreground px-1 mb-2">Select an SSC agent to start chatting</p>
                {sscTeam.map((admin) => (
                  <button
                    key={admin.rem}
                    onClick={() => startLiveChat(admin)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {admin.name.charAt(0)}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${admin.online ? "bg-green-500" : "bg-muted-foreground/40"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{admin.name}</p>
                      <p className="text-[10px] text-muted-foreground">{admin.roleLabel}</p>
                    </div>
                    <Badge variant={admin.online ? "default" : "secondary"} className="text-[9px] shrink-0">
                      {admin.online ? "Online" : "Away"}
                    </Badge>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Chat messages (AI or Live) */}
          {(view === "ai-chat" || view === "live-chat") && (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
                {currentMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "partner" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                      msg.sender === "partner"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : msg.sender === "bot"
                        ? "bg-muted text-foreground rounded-bl-md"
                        : "bg-accent/20 text-foreground rounded-bl-md"
                    }`}>
                      {msg.sender === "admin" && msg.adminName && (
                        <p className="text-[9px] font-semibold text-primary mb-0.5">{msg.adminName}</p>
                      )}
                      <p className="text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }} />
                      <p className={`text-[9px] mt-1 ${msg.sender === "partner" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick actions for AI */}
              {view === "ai-chat" && aiMessages.length <= 2 && (
                <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                  {["Orders", "Payments", "Menu", "Kitchen", "Training", "Leave", "Connect to SSC"].map((q) => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); }}
                      className="px-2.5 py-1 rounded-full border border-border text-[10px] font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-border flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={view === "ai-chat" ? "Ask a question..." : `Message ${selectedAdmin?.name || "agent"}...`}
                  className="text-xs h-9"
                />
                <Button size="sm" onClick={handleSend} disabled={!input.trim()} className="h-9 w-9 p-0 shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
