import { useState, useEffect, useRef, useMemo } from "react";
import { MessageCircle, Send, ArrowLeft, X, CheckCircle2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  subscribeChatStore,
  getConversations,
  getConversation,
  addMessage,
  closeConversation,
  type ChatConversation,
} from "@/data/chatStore";

export default function SSCFloatingChat() {
  const [open, setOpen] = useState(false);
  const [, tick] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const adminName = localStorage.getItem("shero-admin-name") || "SSC Agent";

  useEffect(() => subscribeChatStore(() => tick((n) => n + 1)), []);

  const conversations = useMemo(() => getConversations(), [tick]);
  const active = conversations.filter((c) => c.status === "active");
  const closed = conversations.filter((c) => c.status === "closed");
  const conv = selectedId ? getConversation(selectedId) : null;

  const unreadCount = active.filter(
    (c) => c.messages.length > 0 && c.messages[c.messages.length - 1].sender === "partner"
  ).length;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [conv?.messages.length]);

  const handleSend = () => {
    if (!input.trim() || !selectedId) return;
    addMessage(selectedId, input.trim(), "admin", adminName);
    setInput("");
  };

  const fmt = (d: Date) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const fmtDate = (d: Date) => {
    const date = new Date(d);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return "Today";
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    if (date.toDateString() === y.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-all flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat popup */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[520px] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary/5 border-b border-border px-4 py-3 flex items-center gap-2 shrink-0">
            {conv && (
              <button onClick={() => setSelectedId(null)} className="hover:opacity-70">
                <ArrowLeft className="w-4 h-4 text-foreground" />
              </button>
            )}
            <MessageCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground flex-1">
              {conv ? conv.partnerName : "Partner Chats"}
            </span>
            {conv && conv.status === "active" && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-[10px] px-2"
                onClick={() => {
                  closeConversation(conv.id);
                  setSelectedId(null);
                }}
              >
                Close Chat
              </Button>
            )}
            <button onClick={() => setOpen(false)} className="hover:opacity-70">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Body */}
          {!conv ? (
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {active.length === 0 && closed.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No partner chats yet</p>
                </div>
              )}

              {active.length > 0 && (
                <>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Active ({active.length})
                  </p>
                  {active.map((c) => {
                    const last = c.messages[c.messages.length - 1];
                    const unread = last?.sender === "partner";
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedId(c.id)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg border text-left transition-colors ${
                          unread ? "border-primary/30 bg-primary/5" : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {c.partnerName.charAt(0)}
                          </div>
                          {unread && (
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-xs text-foreground">{c.partnerName}</p>
                            <span className="text-[9px] text-muted-foreground">{fmtDate(c.lastActivity)}</span>
                          </div>
                          {last && (
                            <p className="text-[10px] text-muted-foreground truncate">
                              {last.sender === "admin" ? "You: " : ""}{last.text}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </>
              )}

              {closed.length > 0 && (
                <>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-3">
                    Closed ({closed.length})
                  </p>
                  {closed.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedId(c.id)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-border opacity-60 hover:opacity-80 text-left"
                    >
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {c.partnerName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs text-foreground">{c.partnerName}</p>
                        <p className="text-[9px] text-muted-foreground">{c.messages.length} messages</p>
                      </div>
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    </button>
                  ))}
                </>
              )}
            </div>
          ) : (
            <>
              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
                {conv.messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                        msg.sender === "admin"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                    >
                      <p
                        className={`text-[8px] font-semibold mb-0.5 ${
                          msg.sender === "admin" ? "text-primary-foreground/70" : "text-primary"
                        }`}
                      >
                        {msg.senderName}
                      </p>
                      <p className="text-[11px] leading-relaxed">{msg.text}</p>
                      <p
                        className={`text-[8px] mt-0.5 ${
                          msg.sender === "admin" ? "text-primary-foreground/50" : "text-muted-foreground"
                        }`}
                      >
                        {fmt(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              {conv.status === "active" ? (
                <div className="p-2.5 border-t border-border flex gap-2 shrink-0">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder={`Reply to ${conv.partnerName}...`}
                    className="text-xs h-8"
                  />
                  <Button size="sm" onClick={handleSend} disabled={!input.trim()} className="h-8 w-8 p-0 shrink-0">
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="p-2.5 border-t border-border text-center shrink-0">
                  <p className="text-[10px] text-muted-foreground">This conversation has been closed</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
