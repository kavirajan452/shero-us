import { useState, useMemo } from "react";
import KitchenSelector from "@/components/partner/KitchenSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Sun, Coffee, Sunset, Moon, MoonStar, CalendarCheck, PartyPopper, Sparkles, Zap, Lock } from "lucide-react";
import { subscriptionMealOrders, serviceBookings } from "@/data/partnerSubscriptionData";
import { mockPartyOrders } from "@/data/partyProductionData";
import { partnerOrders } from "@/data/partnerMockData";
import { Link } from "react-router-dom";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface Session {
  id: string;
  label: string;
  icon: React.ReactNode;
  defaultOpen: string;
  defaultClose: string;
}

const SESSIONS: Session[] = [
  { id: "breakfast", label: "Breakfast", icon: <Sun className="h-4 w-4" />, defaultOpen: "07:00", defaultClose: "10:00" },
  { id: "lunch", label: "Lunch", icon: <Coffee className="h-4 w-4" />, defaultOpen: "12:00", defaultClose: "15:00" },
  { id: "evening", label: "Mid-Evening Snacks", icon: <Sunset className="h-4 w-4" />, defaultOpen: "16:00", defaultClose: "18:00" },
  { id: "dinner", label: "Dinner", icon: <Moon className="h-4 w-4" />, defaultOpen: "19:00", defaultClose: "22:00" },
  { id: "latenight", label: "Late-Night Supper", icon: <MoonStar className="h-4 w-4" />, defaultOpen: "22:00", defaultClose: "03:00" },
];

type DaySchedule = Record<string, { enabled: boolean; open: string; close: string }>;

const buildDefault = (): Record<string, DaySchedule> => {
  const schedule: Record<string, DaySchedule> = {};
  DAYS.forEach((day) => {
    const daySchedule: DaySchedule = {};
    SESSIONS.forEach((s) => {
      daySchedule[s.id] = { enabled: ["breakfast", "lunch", "dinner"].includes(s.id), open: s.defaultOpen, close: s.defaultClose };
    });
    schedule[day] = daySchedule;
  });
  return schedule;
};

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, "0");
  return [`${h}:00`, `${h}:30`];
}).flat();

// Generate next 7 dates mapped to day names
const getWeekDates = (): Record<string, string> => {
  const map: Record<string, string> = {};
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayName = DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1];
    map[dayName] = d.toISOString().split("T")[0];
  }
  return map;
};

export default function PartnerKitchenSchedule() {
  const [schedule, setSchedule] = useState(buildDefault);
  const [presets, setPresets] = useState<Set<string>>(new Set(["custom"]));
  const [selectedKitchen, setSelectedKitchen] = useState("all");

  const weekDates = useMemo(() => getWeekDates(), []);

  // Build commitments per day
  const commitments = useMemo(() => {
    const result: Record<string, { subscriptions: { slot: string; planType: string; portions: number }[]; partyOrders: { orderId: string; occasion: string; guests: number; meals: string[]; time: string }[]; services: { name: string; time: string; mode: string }[]; instantPending: number }> = {};
    const myPartnerId = "pk1";
    const todayDayName = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

    DAYS.forEach((day) => {
      const date = weekDates[day];
      if (!date) {
        result[day] = { subscriptions: [], partyOrders: [], services: [], instantPending: 0 };
        return;
      }

      const subs = subscriptionMealOrders
        .filter((o) => o.date === date)
        .map((o) => ({ slot: o.slot, planType: o.planType, portions: o.totalPortions }));

      const parties = mockPartyOrders
        .filter((o) => o.eventDate === date && (o.allocatedPartnerId === myPartnerId || o.status === "pending_allocation"))
        .map((o) => ({ orderId: o.orderId, occasion: o.occasion, guests: o.guestCount, meals: o.meals, time: o.eventTime }));

      const svcs = serviceBookings
        .filter((s) => s.date === date)
        .map((s) => ({ name: s.serviceName, time: s.time, mode: s.mode }));

      const instant = day === todayDayName ? partnerOrders.filter((o) => ["new", "accepted", "preparing"].includes(o.status)).length : 0;

      result[day] = { subscriptions: subs, partyOrders: parties, services: svcs, instantPending: instant };
    });
    return result;
  }, [weekDates]);

  const applyPresets = (toggle: string) => {
    setPresets((prev) => {
      const next = new Set(prev);
      if (toggle === "custom") {
        next.clear();
        next.add("custom");
      } else {
        next.delete("custom");
        if (next.has(toggle)) {
          next.delete(toggle);
          if (next.size === 0) next.add("custom");
        } else {
          next.add(toggle);
        }
      }
      const updated = { ...schedule };
      DAYS.forEach((day) => {
        if (next.has("custom")) {
          SESSIONS.forEach((s) => {
            updated[day][s.id] = { enabled: false, open: s.defaultOpen, close: s.defaultClose };
          });
        } else {
          SESSIONS.forEach((s) => {
            updated[day][s.id] = { enabled: false, open: s.defaultOpen, close: s.defaultClose };
          });
          if (next.has("allday")) {
            updated[day]["breakfast"] = { enabled: true, open: "08:00", close: "10:00" };
            updated[day]["lunch"] = { enabled: true, open: "12:00", close: "15:00" };
            updated[day]["evening"] = { enabled: true, open: "16:00", close: "18:00" };
            updated[day]["dinner"] = { enabled: true, open: "19:00", close: "22:00" };
          }
          if (next.has("allnight")) {
            updated[day]["latenight"] = { enabled: true, open: "22:00", close: "03:00" };
          }
        }
      });
      setSchedule({ ...updated });
      return next;
    });
  };

  const toggleSession = (day: string, sessionId: string) => {
    setPresets(new Set(["custom"]));
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [sessionId]: { ...prev[day][sessionId], enabled: !prev[day][sessionId].enabled } },
    }));
  };

  const updateTime = (day: string, sessionId: string, field: "open" | "close", value: string) => {
    setPresets(new Set(["custom"]));
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [sessionId]: { ...prev[day][sessionId], [field]: value } },
    }));
  };

  const toggleDay = (day: string, on: boolean) => {
    setPresets(new Set(["custom"]));
    setSchedule((prev) => {
      const daySchedule = { ...prev[day] };
      Object.keys(daySchedule).forEach((s) => {
        daySchedule[s] = { ...daySchedule[s], enabled: on ? ["breakfast", "lunch", "dinner"].includes(s) : false };
      });
      return { ...prev, [day]: daySchedule };
    });
  };

  const isDayActive = (day: string) => Object.values(schedule[day]).some((s) => s.enabled);
  const activeSessionCount = (day: string) => Object.values(schedule[day]).filter((s) => s.enabled).length;

  const hasCommitments = (day: string) => {
    const c = commitments[day];
    return c.subscriptions.length > 0 || c.partyOrders.length > 0 || c.services.length > 0 || c.instantPending > 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Kitchen Schedule</h1>
        <p className="text-muted-foreground text-xs mt-1">Define your weekly operating days, sessions & timings</p>
      </div>

      {/* Kitchen Selector */}
      <KitchenSelector value={selectedKitchen} onChange={setSelectedKitchen} />

      {/* Quick Presets */}
      <Card className="border-border bg-card">
        <CardContent className="pt-4 pb-4 flex flex-wrap items-center gap-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Quick Preset:</span>
          <Button size="sm" variant={presets.has("allday") ? "default" : "outline"} onClick={() => applyPresets("allday")}>
            All Day (8 AM – 10 PM)
          </Button>
          <Button size="sm" variant={presets.has("allnight") ? "default" : "outline"} onClick={() => applyPresets("allnight")}>
            All Night (10 PM – 3 AM)
          </Button>
          <Button size="sm" variant={presets.has("custom") ? "secondary" : "outline"} onClick={() => applyPresets("custom")}>
            Custom
          </Button>
        </CardContent>
      </Card>

      {/* Day-wise schedule */}
      <div className="space-y-3">
        {DAYS.map((day, di) => {
          const c = commitments[day];
          const dateStr = weekDates[day];
          const totalCommitments = c.subscriptions.length + c.partyOrders.length + c.services.length + (c.instantPending > 0 ? 1 : 0);

          return (
            <Card key={day} className={`border-border bg-card ${!isDayActive(day) ? "opacity-60" : ""}`}>
              <CardHeader className="py-3 px-3">
                <div className="flex items-center gap-2">
                  <Switch checked={isDayActive(day)} onCheckedChange={(on) => toggleDay(day, on)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-sm">{day}</CardTitle>
                      {dateStr && <span className="text-[10px] text-muted-foreground">{dateStr}</span>}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {activeSessionCount(day)} session{activeSessionCount(day) !== 1 ? "s" : ""}
                      </Badge>
                      {(di >= 5) && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Weekend</Badge>}
                      {hasCommitments(day) && (
                        <Badge className="bg-primary/10 text-primary border-0 text-[10px] gap-0.5 px-1.5 py-0">
                          <Lock className="w-2.5 h-2.5" /> {totalCommitments}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              {isDayActive(day) && (
                <CardContent className="pt-0 pb-3 px-3 space-y-3">
                  {/* Sessions */}
                  <div className="grid gap-2">
                    {SESSIONS.map((session) => {
                      const s = schedule[day][session.id];
                      return (
                        <div key={session.id} className={`p-2 rounded-lg border ${s.enabled ? "bg-accent/30 border-border" : "border-transparent"}`}>
                          <div className="flex items-center gap-2">
                            <Switch checked={s.enabled} onCheckedChange={() => toggleSession(day, session.id)} className="scale-90" />
                            <span className="flex items-center gap-1.5 text-xs font-medium flex-1">
                              {session.icon}
                              {session.label}
                            </span>
                          </div>
                          {s.enabled && (
                            <div className="flex items-center gap-2 mt-2 ml-10">
                              <Select value={s.open} onValueChange={(v) => updateTime(day, session.id, "open", v)}>
                                <SelectTrigger className="w-20 h-7 text-[11px]"><SelectValue /></SelectTrigger>
                                <SelectContent>{HOURS.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                              </Select>
                              <span className="text-[10px] text-muted-foreground">to</span>
                              <Select value={s.close} onValueChange={(v) => updateTime(day, session.id, "close", v)}>
                                <SelectTrigger className="w-20 h-7 text-[11px]"><SelectValue /></SelectTrigger>
                                <SelectContent>{HOURS.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Advance Commitments for this day */}
                  {hasCommitments(day) && (
                    <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3 space-y-2">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <CalendarCheck className="w-3 h-3" /> Advance Commitments — {dateStr}
                      </p>

                      {c.subscriptions.map((sub, i) => (
                        <Link key={`sub-${i}`} to="/partner/orders" className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50 border border-blue-200 hover:shadow-sm transition-shadow">
                          <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold text-blue-900 capitalize">{sub.slot} — {sub.planType}</span>
                            <span className="text-[10px] text-blue-600 ml-2">{sub.portions} portions</span>
                          </div>
                          <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-[9px] shrink-0">Subscription</Badge>
                        </Link>
                      ))}

                      {c.partyOrders.map((party, i) => (
                        <Link key={`party-${i}`} to="/partner/party-orders" className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 hover:shadow-sm transition-shadow">
                          <PartyPopper className="w-4 h-4 text-amber-600 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold text-amber-900">{party.orderId}</span>
                            <span className="text-[10px] text-amber-600 ml-2">{party.occasion} · {party.guests} guests · {party.time}</span>
                          </div>
                          <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-[9px] shrink-0">Party</Badge>
                        </Link>
                      ))}

                      {c.services.map((svc, i) => (
                        <Link key={`svc-${i}`} to="/partner/orders" className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 hover:shadow-sm transition-shadow">
                          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold text-emerald-900">{svc.name}</span>
                            <span className="text-[10px] text-emerald-600 ml-2">{svc.time} · {svc.mode}</span>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-[9px] shrink-0">Service</Badge>
                        </Link>
                      ))}

                      {c.instantPending > 0 && (
                        <Link to="/partner/orders" className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 hover:shadow-sm transition-shadow">
                          <Zap className="w-4 h-4 text-red-500 shrink-0" />
                          <span className="text-xs font-semibold text-red-800">{c.instantPending} instant orders pending</span>
                          <Badge className="bg-red-100 text-red-600 border-red-300 text-[9px] shrink-0 ml-auto">Instant</Badge>
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <Button className="w-full sm:w-auto">Save Schedule</Button>
    </div>
  );
}
