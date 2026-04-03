import { MessageCircle, Megaphone, PartyPopper, Info, AlertTriangle, TrendingUp, DollarSign, Radio } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_COMMUNICATIONS, categoryConfig, channelConfig, type CommCategory } from "@/data/communicationsData";

const categoryIcons: Record<CommCategory, any> = {
  performance: TrendingUp,
  finance: DollarSign,
  promotion: Megaphone,
  announcement: Radio,
  alert: AlertTriangle,
  celebration: PartyPopper,
};

const PartnerMessages = () => {
  // Show only sent communications (in_app or both channels) as partner-visible messages
  const messages = MOCK_COMMUNICATIONS.filter(
    (c) => c.status === "sent" && (c.channel === "in_app" || c.channel === "both")
  ).map((c, i) => ({
    ...c,
    read: i >= 2, // first 2 unread for demo
  }));

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-primary" />
          Messages from Shero
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
        </p>
      </div>

      <div className="space-y-3">
        {messages.map((msg) => {
          const config = categoryConfig[msg.category];
          const Icon = categoryIcons[msg.category];
          return (
            <Card key={msg.id} className={`border-border transition-shadow hover:shadow-md ${!msg.read ? "border-l-2 border-l-primary" : ""}`}>
              <CardContent className="py-4 px-4">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`w-4.5 h-4.5 ${config.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-foreground text-sm">{msg.subject}</h3>
                      {!msg.read && <Badge className="text-[9px] bg-primary text-primary-foreground">New</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{msg.body}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-[10px]">{config.label}</Badge>
                      <span className="text-[10px] text-muted-foreground">From {msg.sentBy} ({msg.sentByRole})</span>
                      {msg.sentAt && (
                        <span className="text-[10px] text-muted-foreground">
                          • {new Date(msg.sentAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PartnerMessages;
