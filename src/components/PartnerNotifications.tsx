import { useState, useRef, useEffect, useMemo } from "react";
import { Bell, Volume2, Clock, CheckCircle2, X, PartyPopper } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockPartyOrders, type PartyOrderRecord } from "@/data/partyProductionData";
import { getPrepLeadHours } from "@/components/partner/PartyPrepReminders";
import { useRegion } from "@/contexts/RegionContext";
import { languages } from "@/i18n";
import { useNavigate } from "react-router-dom";
import { useInstantOrders } from "@/hooks/useSupabaseData";

const langToVoiceLocale: Record<string, string> = {
  en: "en-US", "en-IN": "en-IN", hi: "hi-IN", ta: "ta-IN", te: "te-IN",
  kn: "kn-IN", ml: "ml-IN", bn: "bn-IN", mr: "mr-IN",
  gu: "gu-IN", es: "es-ES", fr: "fr-FR", ar: "ar-SA", zh: "zh-CN",
};

const PartnerNotifications = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();
  const { formatPrice } = useRegion();
  const navigate = useNavigate();

  // ── Real orders from Supabase ──
  const { data: allOrders = [] } = useInstantOrders();

  const newOrders = useMemo(() => allOrders.filter((o: any) => o.status === "new"), [allOrders]);
  const pendingOrders = useMemo(() => allOrders.filter((o: any) => ["accepted", "preparing"].includes(o.status)), [allOrders]);

  // Party orders within prep window
  const partyPrepOrders = useMemo(() => {
    const now = new Date();
    return mockPartyOrders.filter((o) => {
      if (!["allocated", "accepted"].includes(o.status)) return false;
      const [h, m] = o.eventTime.split(":").map(Number);
      const eventDate = new Date(o.eventDate);
      eventDate.setHours(h, m, 0);
      const hoursLeft = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      const lead = getPrepLeadHours(o.selectedItems.length);
      return hoursLeft > 0 && hoursLeft <= lead;
    });
  }, []);

  const unreadCount = newOrders.length + partyPrepOrders.length;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const speakOrder = (order: any) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const items = Array.isArray(order.items) ? order.items.map((i: any) => `${i.qty || 1}× ${i.name}`).join(". ") : "";
    const text = `Order ${order.order_code}, total ${formatPrice(order.total)}. Items: ${items}.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langToVoiceLocale[i18n.language] || "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const currentLang = languages.find((l) => l.code === i18n.language);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-secondary transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[380px] max-h-[480px] overflow-hidden rounded-xl bg-card border border-border shadow-lg z-50 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <h3 className="text-sm font-bold text-foreground">{t("notifications.orderNotifications")}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                🔊 {t("notifications.voice")}: {currentLang?.label || "English"}
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-secondary">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {newOrders.length === 0 && pendingOrders.length === 0 && partyPrepOrders.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                {t("notifications.noPending")}
              </div>
            ) : (
              <>
                {/* New Orders */}
                {newOrders.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-destructive/5">
                      <p className="text-[10px] font-semibold text-destructive uppercase tracking-wider">
                        🔴 {t("notifications.newOrders")} ({newOrders.length})
                      </p>
                    </div>
                    {newOrders.map((order: any) => {
                      const items = Array.isArray(order.items) ? order.items : [];
                      return (
                        <div
                          key={order.id}
                          className="px-4 py-3 border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                          onClick={() => { navigate("/partner/orders"); setOpen(false); }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-foreground">{order.order_code}</span>
                                <Badge variant="destructive" className="text-[9px] px-1.5 py-0">{t("notifications.new")}</Badge>
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0">{(order.payment_method || "online").toUpperCase()}</Badge>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {items.map((i: any) => `${i.qty || 1}× ${i.name}`).join(", ")}
                              </p>
                              {order.note && <p className="text-[11px] text-primary mt-1 italic">📝 {order.note}</p>}
                              {order.allergens?.length > 0 && (
                                <p className="text-[11px] text-destructive mt-1 font-semibold">⚠️ {t("notifications.allergens")}: {order.allergens.join(", ")}</p>
                              )}
                              {order.cooking_instructions && (
                                <p className="text-[11px] text-accent-foreground mt-0.5 font-medium">🍳 {order.cooking_instructions}</p>
                              )}
                              <div className="flex items-center gap-2 mt-1.5">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                              <p className="font-bold text-sm text-foreground">{formatPrice(order.total)}</p>
                              <Button
                                size="sm" variant="ghost" className="h-7 w-7 p-0"
                                onClick={(e) => { e.stopPropagation(); speakOrder(order); }}
                                title={t("notifications.readAloud")}
                              >
                                <Volume2 className="w-4 h-4 text-primary" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pending Orders */}
                {pendingOrders.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-primary/5">
                      <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                        ⏳ {t("notifications.pendingOrders")} ({pendingOrders.length})
                      </p>
                    </div>
                    {pendingOrders.map((order: any) => {
                      const items = Array.isArray(order.items) ? order.items : [];
                      return (
                        <div
                          key={order.id}
                          className="px-4 py-3 border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                          onClick={() => { navigate("/partner/orders"); setOpen(false); }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-foreground">{order.order_code}</span>
                                <Badge className="text-[9px] px-1.5 py-0 bg-accent text-accent-foreground">
                                  {order.status === "accepted" ? t("notifications.accepted") : t("notifications.preparing")}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {items.map((i: any) => `${i.qty || 1}× ${i.name}`).join(", ")}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                              <p className="font-bold text-sm text-foreground">{formatPrice(order.total)}</p>
                              <Button
                                size="sm" variant="ghost" className="h-7 w-7 p-0"
                                onClick={(e) => { e.stopPropagation(); speakOrder(order); }}
                                title={t("notifications.readAloud")}
                              >
                                <Volume2 className="w-4 h-4 text-muted-foreground" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Party Prep Reminders */}
                {partyPrepOrders.length > 0 && (
                  <div>
                    <div className="px-4 py-2 bg-accent/10">
                      <p className="text-[10px] font-semibold text-accent-foreground uppercase tracking-wider">
                        ⏰ Party Prep ({partyPrepOrders.length})
                      </p>
                    </div>
                    {partyPrepOrders.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => { navigate("/partner/party-orders"); setOpen(false); }}
                        className="px-4 py-3 border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <PartyPopper className="w-4 h-4 text-primary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-foreground">{order.orderId}</span>
                              <Badge className="text-[9px] px-1.5 py-0 bg-destructive/10 text-destructive">⏰ Prep Soon</Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              🍳 {order.selectedItems.length} items · {order.guestCount} guests · {order.eventTime}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-border bg-secondary/30">
            <button
              onClick={() => { navigate("/partner/orders"); setOpen(false); }}
              className="w-full text-center text-xs font-semibold text-primary hover:underline"
            >
              {t("notifications.viewAllOrders")} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerNotifications;
