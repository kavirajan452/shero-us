import { useState, useEffect, useRef, useMemo } from "react";
import { MessageCircle, Send, User, ArrowLeft, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  subscribeChatStore,
  getConversations,
  getConversation,
  addMessage,
  closeConversation,
  type ChatConversation,
} from "@/data/chatStore";

export default function SSCPartnerChats() {
  const [, forceRender] = useState(0);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get current admin identity from localStorage
  const adminName = localStorage.getItem("shero-admin-name") || "SSC Agent";

  useEffect(() => {
    return subscribeChatStore(() => forceRender((n) => n + 1));
  }, []);

  const conversations = useMemo(() => getConversations(), [forceRender]);
  const activeConversations = conversations.filter((c) => c.status === "active");
  const closedConversations = conversations.filter((c) => c.status === "closed");
  const selectedConv = selectedConvId ? getConversation(selectedConvId) : null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedConv?.messages.length]);

  const handleSend = () => {
    if (!input.trim() || !selectedConvId) return;
    addMessage(selectedConvId, input.trim(), "admin", adminName);
    setInput("");
  };

  const handleClose = (convId: string) => {
    closeConversation(convId);
    if (selectedConvId === convId) setSelectedConvId(null);
  };

  const formatTime = (d: Date) => {
    const date = new Date(d);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (d: Date) => {
    const date = new Date(d);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  // List view
  if (!selectedConv) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" /> Partner Live Chats
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Messages from partners via the Partner Chatbot
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {activeConversations.length} active
          </Badge>
        </div>

        {activeConversations.length === 0 && closedConversations.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No partner chats yet</p>
            <p className="text-xs mt-1">Chats initiated by partners will appear here</p>
          </div>
        )}

        {activeConversations.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Active Chats</p>
            {activeConversations.map((conv) => {
              const lastMsg = conv.messages[conv.messages.length - 1];
              const unread = lastMsg?.sender === "partner";
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                    unread ? "border-primary/30 bg-primary/5" : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {conv.partnerName.charAt(0)}
                    </div>
                    {unread && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-foreground">{conv.partnerName}</p>
                      <span className="text-[10px] text-muted-foreground">{formatDate(conv.lastActivity)}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{conv.partnerRMN}</p>
                    {lastMsg && (
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {lastMsg.sender === "admin" ? "You: " : ""}{lastMsg.text}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {closedConversations.length > 0 && (
          <div className="space-y-2 mt-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Closed Chats</p>
            {closedConversations.map((conv) => (
              <div
                key={conv.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border opacity-60 cursor-pointer hover:opacity-80"
                onClick={() => setSelectedConvId(conv.id)}
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                  {conv.partnerName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">{conv.partnerName}</p>
                  <p className="text-[10px] text-muted-foreground">{conv.messages.length} messages • Closed</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Chat detail view
  return (
    <div className="flex flex-col h-[600px] border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-primary/5 border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => setSelectedConvId(null)} className="hover:opacity-70">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
          {selectedConv.partnerName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground">{selectedConv.partnerName}</p>
          <p className="text-[10px] text-muted-foreground">{selectedConv.partnerRMN} • Assigned to: {selectedConv.adminName}</p>
        </div>
        <div className="flex gap-1">
          {selectedConv.status === "active" && (
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleClose(selectedConv.id)}>
              Close Chat
            </Button>
          )}
          <Badge variant={selectedConv.status === "active" ? "default" : "secondary"} className="text-[9px]">
            {selectedConv.status === "active" ? "Active" : "Closed"}
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {selectedConv.messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${
              msg.sender === "admin"
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-muted text-foreground rounded-bl-md"
            }`}>
              <p className={`text-[9px] font-semibold mb-0.5 ${msg.sender === "admin" ? "text-primary-foreground/70" : "text-primary"}`}>
                {msg.senderName}
              </p>
              <p className="text-xs leading-relaxed">{msg.text}</p>
              <p className={`text-[9px] mt-1 ${msg.sender === "admin" ? "text-primary-foreground/50" : "text-muted-foreground"}`}>
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      {selectedConv.status === "active" && (
        <div className="p-3 border-t border-border flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`Reply to ${selectedConv.partnerName}...`}
            className="text-xs h-9"
          />
          <Button size="sm" onClick={handleSend} disabled={!input.trim()} className="h-9 w-9 p-0 shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      )}

      {selectedConv.status === "closed" && (
        <div className="p-3 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">This conversation has been closed</p>
        </div>
      )}
    </div>
  );
}
