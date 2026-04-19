import { useState, useMemo } from "react";
import KitchenSelector from "@/components/partner/KitchenSelector";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CalendarCheck, Sun, Coffee, Sunset, Moon, MoonStar, Info, AlertTriangle, ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, isBefore, isToday as isDateToday, addMonths, subMonths, isSameDay, addDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import CancellationEscalation from "@/components/partner/CancellationEscalation";

const SESSION_META = [
  { id: "breakfast", label: "BF", full: "Breakfast", icon: <Sun className="h-3 w-3" /> },
  { id: "lunch", label: "LN", full: "Lunch", icon: <Coffee className="h-3 w-3" /> },
  { id: "evening", label: "EV", full: "Snacks", icon: <Sunset className="h-3 w-3" /> },
  { id: "dinner", label: "DN", full: "Dinner", icon: <Moon className="h-3 w-3" /> },
  { id: "latenight", label: "LT", full: "Late Night", icon: <MoonStar className="h-3 w-3" /> },
];

type Attendance = Record<string, Record<string, boolean>>;

interface MappedOrder {
  orderId: string;
  type: "subscription" | "instant" | "party";
  items: number;
}

type OrderMap = Record<string, Record<string, MappedOrder[]>>;

export default function PartnerKitchenAttendance() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedKitchen, setSelectedKitchen] = useState("all");
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(today));
  const [showConfirm, setShowConfirm] = useState(false);
  const [showOrderWarning, setShowOrderWarning] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<{ dateKey: string; sessionId: string } | null>(null);
  const [pendingOrders, setPendingOrders] = useState<MappedOrder[]>([]);
  const [isCommitted, setIsCommitted] = useState(false);
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; type: "Subscription" | "Party" | "Service" | "Instant"; label: string; date: string }>({ open: false, type: "Subscription", label: "", date: "" });

  const monthDays = useMemo(() => eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) }), [currentMonth]);
  const monthLabel = format(currentMonth, "MMMM yyyy");

  // Mock orders: subscription orders on some days, instant orders on others
  const acceptedOrders = useMemo<OrderMap>(() => {
    const map: OrderMap = {};
    // Subscription orders (locked, can't change)
    const sub1 = format(addDays(today, 2), "yyyy-MM-dd");
    const sub2 = format(addDays(today, 3), "yyyy-MM-dd");
    const sub3 = format(addDays(today, 5), "yyyy-MM-dd");
    map[sub1] = { lunch: [{ orderId: "SUB-4021", type: "subscription", items: 3 }] };
    map[sub2] = { lunch: [{ orderId: "SUB-4021", type: "subscription", items: 3 }], dinner: [{ orderId: "SUB-4033", type: "subscription", items: 2 }] };
    map[sub3] = { lunch: [{ orderId: "SUB-4021", type: "subscription", items: 3 }] };
    // Party orders
    const party1 = format(addDays(today, 4), "yyyy-MM-dd");
    map[party1] = { lunch: [{ orderId: "PTY-2201", type: "party", items: 12 }] };
    // Instant order (changeable 1 day before)
    const inst1 = format(addDays(today, 1), "yyyy-MM-dd");
    map[inst1] = { dinner: [{ orderId: "INS-8801", type: "instant", items: 2 }] };
    return map;
  }, [today]);

  // Summarise accepted orders by type
  const orderSummary = useMemo(() => {
    let sub = 0, party = 0, instant = 0;
    const uniqueSub = new Set<string>();
    const uniqueParty = new Set<string>();
    Object.values(acceptedOrders).forEach((sessions) => {
      Object.values(sessions).forEach((orders) => {
        orders.forEach((o) => {
          if (o.type === "subscription") uniqueSub.add(o.orderId);
          else if (o.type === "party") uniqueParty.add(o.orderId);
          else instant++;
        });
      });
    });
    return { sub: uniqueSub.size, party: uniqueParty.size, instant };
  }, [acceptedOrders]);

  const getOrdersForSlot = (dateKey: string, sessionId: string): MappedOrder[] =>
    acceptedOrders[dateKey]?.[sessionId] ?? [];

  const hasOrder = (dateKey: string, sessionId: string): boolean =>
    getOrdersForSlot(dateKey, sessionId).length > 0;

  const hasSubOrder = (dateKey: string, sessionId: string): boolean =>
    getOrdersForSlot(dateKey, sessionId).some((o) => o.type === "subscription");

  // Check if a slot is locked (subscription = always locked; instant = locked if less than 1 day before)
  const isSlotLocked = (dateKey: string, sessionId: string): boolean => {
    const orders = getOrdersForSlot(dateKey, sessionId);
    if (orders.length === 0) return false;
    const slotDate = new Date(dateKey);
    const oneDayBefore = addDays(today, 1);
    // Sub orders: always locked once committed
    if (orders.some((o) => o.type === "subscription")) return true;
    // Party orders: always locked once accepted
    if (orders.some((o) => o.type === "party")) return true;
    // Instant orders: locked if tomorrow or today (can't change day-of or same-day)
    if (isBefore(slotDate, addDays(today, 2))) return true;
    return false;
  };

  const [attendance, setAttendance] = useState<Attendance>(() => {
    const init: Attendance = {};
    monthDays.forEach((d) => {
      const key = format(d, "yyyy-MM-dd");
      init[key] = {};
      SESSION_META.forEach((s) => {
        init[key][s.id] = !isWeekend(d) && ["breakfast", "lunch", "dinner"].includes(s.id);
      });
    });
    return init;
  });

  // Ensure attendance keys exist for current month
  useMemo(() => {
    setAttendance((prev) => {
      const next = { ...prev };
      monthDays.forEach((d) => {
        const key = format(d, "yyyy-MM-dd");
        if (!next[key]) {
          next[key] = {};
          SESSION_META.forEach((s) => {
            next[key][s.id] = !isWeekend(d) && ["breakfast", "lunch", "dinner"].includes(s.id);
          });
        }
      });
      return next;
    });
  }, [monthDays]);

  const isPastDate = (d: Date) => isBefore(d, today) && !isDateToday(d);

  const attemptToggle = (dateKey: string, sessionId: string) => {
    if (isSlotLocked(dateKey, sessionId)) {
      const orders = getOrdersForSlot(dateKey, sessionId);
      if (orders.some((o) => o.type === "subscription")) {
        toast({ title: "🔒 Subscription Locked", description: "Cannot change subscription slots. Pay fine to cancel.", variant: "destructive" });
        return;
      }
      toast({ title: "🔒 Too late to change", description: "Instant orders can only be changed 1 day before.", variant: "destructive" });
      return;
    }
    const currentlyOn = attendance[dateKey]?.[sessionId];
    if (currentlyOn && hasOrder(dateKey, sessionId)) {
      setPendingToggle({ dateKey, sessionId });
      setPendingOrders(getOrdersForSlot(dateKey, sessionId));
      setShowOrderWarning(true);
      return;
    }
    toggle(dateKey, sessionId);
  };

  const toggle = (dateKey: string, sessionId: string) => {
    setAttendance((prev) => ({
      ...prev,
      [dateKey]: { ...prev[dateKey], [sessionId]: !prev[dateKey]?.[sessionId] },
    }));
  };

  const confirmOrderToggleOff = () => {
    if (pendingToggle) {
      const orders = getOrdersForSlot(pendingToggle.dateKey, pendingToggle.sessionId);
      const orderType = orders[0]?.type === "subscription" ? "Subscription" : orders[0]?.type === "party" ? "Party" : "Instant";
      const label = orders.map((o) => o.orderId).join(", ") + ` (${orders.reduce((s, o) => s + o.items, 0)} items)`;
      toggle(pendingToggle.dateKey, pendingToggle.sessionId);
      setShowOrderWarning(false);
      setPendingToggle(null);
      setPendingOrders([]);
      // Trigger escalation dialog
      setCancelDialog({ open: true, type: orderType, label, date: pendingToggle.dateKey });
    } else {
      setShowOrderWarning(false);
      setPendingToggle(null);
      setPendingOrders([]);
    }
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    setIsCommitted(true);
    toast({ title: "Availability Committed ✅", description: `${committed} sessions confirmed for ${monthLabel}.` });
  };

  // Stats
  const totalSlots = monthDays.length * SESSION_META.length;
  const committed = monthDays.reduce((sum, d) => {
    const key = format(d, "yyyy-MM-dd");
    return sum + SESSION_META.filter((s) => attendance[key]?.[s.id]).length;
  }, 0);
  const commitPct = Math.round((committed / totalSlots) * 100);

  const orderLockedSlots = monthDays.reduce((count, d) => {
    const key = format(d, "yyyy-MM-dd");
    return count + SESSION_META.filter((s) => isSlotLocked(key, s.id)).length;
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Kitchen Attendance</h1>
        <p className="text-muted-foreground text-xs mt-1">Commit your monthly availability to receive subscription & instant orders</p>
      </div>

      {/* Kitchen Selector */}
      <KitchenSelector value={selectedKitchen} onChange={setSelectedKitchen} />

      {/* Month Selector */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">{monthLabel}</h2>
        <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border bg-card border-l-4 border-l-emerald-500">
          <CardContent className="pt-3 pb-3 flex items-center gap-3">
            <CalendarCheck className="h-6 w-6 text-primary shrink-0" />
            <div>
              <p className="text-lg font-bold text-foreground">{committed}/{totalSlots}</p>
              <p className="text-[10px] text-muted-foreground">Sessions committed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card border-l-4 border-l-blue-500">
          <CardContent className="pt-3 pb-3">
            <p className="text-xs font-medium mb-1.5">Commitment</p>
            <Progress value={commitPct} className="h-2" />
            <p className="text-[10px] text-muted-foreground mt-1">{commitPct}%</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card border-l-4 border-l-destructive">
          <CardContent className="pt-3 pb-3 flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-destructive/70 shrink-0" />
            <div>
              <p className="text-lg font-bold text-foreground">{orderLockedSlots}</p>
              <p className="text-[10px] text-muted-foreground">Locked slots</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card border-l-4 border-l-primary">
          <CardContent className="pt-3 pb-3 flex items-center gap-3">
            <Info className="h-6 w-6 text-primary/70 shrink-0" />
            <div>
              <p className="text-lg font-bold text-foreground">{monthDays.length}</p>
              <p className="text-[10px] text-muted-foreground">Days in month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rules */}
      <div className="space-y-2">
        <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/50 text-xs">
          <Info className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
          <span>Mark your attendance for the full month. Once committed, <strong>subscription slots cannot be changed</strong> — cancellation attracts a fine.</span>
        </div>
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted text-xs">
          <CalendarCheck className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
          <span><strong>Instant orders:</strong> You can change availability up to <strong>1 day before</strong>. <strong>Subscription orders:</strong> Locked once committed — pay fine to cancel.</span>
        </div>

        {/* Accepted Orders Summary */}
        {(orderSummary.sub > 0 || orderSummary.party > 0) && (
          <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/15 text-xs">
            <ShieldAlert className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-semibold text-foreground">Accepted orders this month:</span>
            {orderSummary.sub > 0 && (
              <Badge variant="secondary" className="text-[10px] gap-1 border border-primary/20">
                🔒 {orderSummary.sub} Subscription
              </Badge>
            )}
            {orderSummary.party > 0 && (
              <Badge variant="secondary" className="text-[10px] gap-1 border border-accent-foreground/20">
                🎉 {orderSummary.party} Party
              </Badge>
            )}
            {orderSummary.instant > 0 && (
              <Badge variant="secondary" className="text-[10px] gap-1 border border-muted-foreground/20">
                ⚡ {orderSummary.instant} Instant
              </Badge>
            )}
            <span className="text-muted-foreground ml-auto">Locked slots are marked with 🔒 below</span>
          </div>
        )}
      </div>

      {/* Monthly Attendance Grid */}
      <Card>
        <CardContent className="pt-3 pb-3 px-0 overflow-x-auto">
          <div className="max-h-[65vh] overflow-y-auto">
            <table className="w-full text-xs min-w-[360px]">
              <thead className="sticky top-0 bg-card z-10 shadow-sm">
                <tr className="border-b">
                  <th className="text-left py-2 pl-3 pr-1 font-medium text-muted-foreground bg-card" style={{ minWidth: 80 }}>Date</th>
                  {SESSION_META.map((s) => (
                    <th key={s.id} className="text-center py-2 px-0.5 font-medium bg-card" style={{ minWidth: 44 }}>
                      <div className="flex flex-col items-center gap-0.5">
                        {s.icon}
                        <span className="text-[8px] leading-tight">{s.label}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthDays.map((d) => {
                  const key = format(d, "yyyy-MM-dd");
                  const isWknd = isWeekend(d);
                  const isTdy = isDateToday(d);
                  const past = isPastDate(d);
                  const dayHasOrders = SESSION_META.some((s) => hasOrder(key, s.id));

                  return (
                    <tr key={key} className={`border-b last:border-0 ${isTdy ? "bg-primary/5" : past ? "opacity-40" : ""}`}>
                      <td className="py-1 pl-3 pr-1">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="font-medium text-[11px]">{format(d, "EEE")}</span>
                          <span className="text-muted-foreground text-[10px]">{format(d, "d")}</span>
                          {isTdy && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                          {dayHasOrders && <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />}
                        </div>
                      </td>
                      {SESSION_META.map((s) => {
                        const locked = isSlotLocked(key, s.id);
                        const orders = getOrdersForSlot(key, s.id);
                        const isSub = orders.some((o) => o.type === "subscription");
                        return (
                          <td key={s.id} className={`text-center py-1 px-0.5 ${locked ? "bg-destructive/5" : ""}`}>
                            <div className="flex flex-col items-center gap-0">
                              <Checkbox
                                checked={attendance[key]?.[s.id] ?? false}
                                onCheckedChange={() => !past && attemptToggle(key, s.id)}
                                disabled={past}
                                className={`h-4 w-4 ${locked ? "border-destructive" : ""}`}
                              />
                              {locked && (
                                <span className="text-[7px] text-destructive font-medium leading-none mt-0.5">
                                  🔒{orders.length}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground px-1">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Today</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> Has orders</span>
        <span className="flex items-center gap-1">🔒 Locked</span>
      </div>

      <Button className="w-full sm:w-auto" onClick={() => setShowConfirm(true)} disabled={committed === 0}>
        {isCommitted ? "Update Commitment" : "Commit Availability"}
      </Button>

      {/* Commit Confirmation */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Monthly Commitment
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                <p>You are committing to <strong>{committed} sessions</strong> for <strong>{monthLabel}</strong>.</p>
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="font-semibold text-destructive">⚠️ Important Rules</p>
                  <ul className="mt-1 space-y-1 text-foreground/80 text-xs list-disc ml-4">
                    <li><strong>Subscription orders:</strong> Cannot be cancelled once committed. Cancellation = fine.</li>
                    <li><strong>Instant orders:</strong> Can be changed up to 1 day before the slot.</li>
                    <li>Non-compliance affects your CVAT score and kitchen visibility.</li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Again</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className="bg-primary">I Understand & Commit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Order Warning */}
      <AlertDialog open={showOrderWarning} onOpenChange={(open) => { if (!open) { setShowOrderWarning(false); setPendingToggle(null); setPendingOrders([]); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
              Orders on This Slot
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                <p><strong>{pendingOrders.length} order(s)</strong> on this slot:</p>
                <div className="space-y-2">
                  {pendingOrders.map((order) => (
                    <div key={order.orderId} className="flex items-center justify-between p-2 rounded-lg border bg-muted/50">
                      <div>
                        <p className="font-medium text-xs">{order.orderId}</p>
                        <p className="text-[10px] text-muted-foreground">{order.type === "subscription" ? "Subscription (locked)" : order.type === "instant" ? "Instant" : "Party"}</p>
                      </div>
                      <Badge variant="destructive" className="text-[10px]">{order.items} items</Badge>
                    </div>
                  ))}
                </div>
                <p className="text-destructive font-medium text-xs">Switching off will trigger a $500 penalty per order.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Active</AlertDialogCancel>
            <AlertDialogAction onClick={confirmOrderToggleOff} className="bg-destructive text-destructive-foreground">
              Accept Penalty & Switch Off
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CancellationEscalation
        open={cancelDialog.open}
        onOpenChange={(open) => setCancelDialog((prev) => ({ ...prev, open }))}
        orderType={cancelDialog.type}
        orderLabel={cancelDialog.label}
        orderDate={cancelDialog.date}
      />
    </div>
  );
}
