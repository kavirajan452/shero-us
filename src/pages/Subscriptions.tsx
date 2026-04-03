import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { useScreenContent, contentMap } from "@/hooks/useScreenContent";
import SubscriptionLeadCapture from "@/components/SubscriptionLeadCapture";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSubscriptionMealPlans } from "@/hooks/useSupabaseData";
import type { SubscriptionDuration, SubscriptionSlot } from "@/data/subscriptionPlansData";

const subscriptionDurations = [
  { duration: "trial" as SubscriptionDuration, label: "3-Day Trial", days: 3, discountPct: 0, badge: "Try First" },
  { duration: "weekly" as SubscriptionDuration, label: "Weekly Plan", days: 7, discountPct: 5 },
  { duration: "monthly" as SubscriptionDuration, label: "Monthly Plan", days: 30, discountPct: 15, badge: "Best Value" },
];

interface StandardMealPlan {
  id: string;
  name: string;
  cuisine: string;
  emoji: string | null;
  description: string | null;
  is_veg: boolean;
  slots: string[];
  price_per_day: number;
  weekly_menu: any;
  highlights: string[];
  image: string | null;
  rating: number;
  subscribers: number;
}
import {
  ArrowLeft, ArrowRight, Star, ChevronDown, ChevronUp, Check,
  Sparkles, Palette, Clock, Leaf, ShoppingCart,
  Calendar, MapPin, CreditCard, UtensilsCrossed, Heart, Shield,
  Truck, Gift, Crown, SkipForward, Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PaymentSection from "@/components/PaymentSection";
import type { PaymentMethod } from "@/components/PaymentSection";

type FlowStep = "lead-capture" | "landing" | "plan-detail" | "customize" | "address" | "checkout" | "confirmation";
type ActiveTab = "standard" | "custom";

const slotEmoji: Record<SubscriptionSlot, string> = { breakfast: "🌅", lunch: "☀️", dinner: "🌙" };
const slotLabel: Record<SubscriptionSlot, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner" };

const defaultDeliveryTimes: Record<SubscriptionSlot, string> = {
  breakfast: "7:00 AM",
  lunch: "12:30 PM",
  dinner: "8:00 PM",
};

const deliveryTimeOptions: Record<SubscriptionSlot, string[]> = {
  breakfast: ["6:30 AM", "7:00 AM", "7:30 AM", "8:00 AM"],
  lunch: ["12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM"],
  dinner: ["7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM"],
};

const weekDaysFull = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const weekDaysShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ── Skip/Pause calendar logic (per-session) ──
interface SkippedSessionEntry {
  date: string; // YYYY-MM-DD
  slot: SubscriptionSlot;
}

interface SkipCalendarState {
  skippedSessions: SkippedSessionEntry[];
  maxSkipsPerWeek: number; // per-session skips
  maxConsecutive: number;  // max consecutive days for SAME session
}

const getWeekNumber = (date: Date) => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
};

const canSkipSession = (
  dateStr: string,
  slot: SubscriptionSlot,
  skippedSessions: SkippedSessionEntry[],
  maxSkipsPerWeek: number,
  maxConsecutive: number
): { allowed: boolean; reason?: string } => {
  const date = new Date(dateStr);
  const week = getWeekNumber(date);
  // Count skips this week (across all sessions)
  const skipsThisWeek = skippedSessions.filter(s => getWeekNumber(new Date(s.date)) === week).length;
  if (skipsThisWeek >= maxSkipsPerWeek) return { allowed: false, reason: `Max ${maxSkipsPerWeek} session skips per week reached` };

  // Check consecutive for same slot
  const prevDay = new Date(date.getTime() - 86400000).toISOString().split("T")[0];
  const prevPrevDay = new Date(date.getTime() - 2 * 86400000).toISOString().split("T")[0];
  const sameSlotSkipped = (d: string) => skippedSessions.some(s => s.date === d && s.slot === slot);
  if (sameSlotSkipped(prevDay) && sameSlotSkipped(prevPrevDay)) {
    return { allowed: false, reason: `Cannot skip ${slot} for more than 2 consecutive days` };
  }
  const nextDay = new Date(date.getTime() + 86400000).toISOString().split("T")[0];
  if (sameSlotSkipped(prevDay) && sameSlotSkipped(nextDay)) {
    return { allowed: false, reason: `Cannot skip ${slot} for more than 2 consecutive days` };
  }

  return { allowed: true };
};

const Subscriptions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const isMarketingLead = searchParams.get("source") === "marketing" || searchParams.get("utm_source") !== null;
  const mainRef = useRef<HTMLElement>(null);
  const { data: subContent } = useScreenContent("subscription");
  const sc = contentMap(subContent || []);

  // Fetch meal plans from DB
  const { data: dbMealPlans, isLoading: plansLoading } = useSubscriptionMealPlans();
  const standardMealPlans: StandardMealPlan[] = dbMealPlans || [];

  // Lead capture state
  const [customerVerified, setCustomerVerified] = useState(!isMarketingLead);
  const [customerInfo, setCustomerInfo] = useState<{ name: string; phone: string; location: string; isReturning: boolean } | null>(null);

  // Flow state
  const [step, setStep] = useState<FlowStep>(isMarketingLead ? "lead-capture" : "landing");
  const [activeTab, setActiveTab] = useState<ActiveTab>("standard");
  const [selectedPlan, setSelectedPlan] = useState<StandardMealPlan | null>(null);
  const [duration, setDuration] = useState<SubscriptionDuration>("monthly");
  const [persons, setPersons] = useState(1);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [foodType, setFoodType] = useState<"veg" | "nonveg" | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<SubscriptionSlot[]>([]);
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");

  // Delivery time state
  const [deliveryTimes, setDeliveryTimes] = useState<Record<SubscriptionSlot, string>>({ ...defaultDeliveryTimes });
  const [timePickerSlot, setTimePickerSlot] = useState<SubscriptionSlot | null>(null);

   // Skip calendar state
  const [skipState, setSkipState] = useState<SkipCalendarState>({
    skippedSessions: [],
    maxSkipsPerWeek: 3,
    maxConsecutive: 2,
  });
  const [showSkipCalendar, setShowSkipCalendar] = useState(false);
  const [skipSlotFilter, setSkipSlotFilter] = useState<SubscriptionSlot | null>(null);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const durationInfo = subscriptionDurations.find(d => d.duration === duration)!;

  const calcPrice = (plan: StandardMealPlan) => {
    const base = plan.price_per_day * persons * durationInfo.days;
    const discount = base * (durationInfo.discountPct / 100);
    const delivery = 30 * durationInfo.days;
    return { base, discount, delivery, total: base - discount + delivery, perDay: plan.price_per_day * persons };
  };

  // Extended sessions from skips (per-session, not per-day)
  const extensionSessions = skipState.skippedSessions.length;
  // Group extensions by slot
  const extensionBySlot = selectedSlots.reduce((acc, slot) => {
    acc[slot] = skipState.skippedSessions.filter(s => s.slot === slot).length;
    return acc;
  }, {} as Record<string, number>);

  const handleLeadVerified = (data: { name: string; phone: string; location: string; isReturning: boolean }) => {
    setCustomerVerified(true);
    setCustomerInfo(data);
    setName(data.name);
    setMobile(data.phone);
    setAddress(data.location);
    setStep("landing");
    if (data.isReturning) {
      toast({ title: `Welcome back, ${data.name}! 🎉`, description: "Great to see you again. Pick up where you left off!" });
    }
  };

  const handleSelectStandard = (plan: StandardMealPlan) => {
    setSelectedPlan(plan);
    setStep("plan-detail");
  };

  const handlePayment = (_method: PaymentMethod) => {
    setStep("confirmation");
    toast({ title: "🎉 Subscription Activated!", description: `Your ${durationInfo.label} meal plan starts tomorrow` });
  };

  const toggleSlot = (slot: SubscriptionSlot) => {
    const isActive = selectedSlots.includes(slot);
    if (isActive) {
      setSelectedSlots(prev => prev.filter(s => s !== slot));
    } else {
      setSelectedSlots(prev => [...prev, slot]);
      // Open time picker popup for newly selected slot
      setTimePickerSlot(slot);
    }
  };

  const handleSkipSession = (dateStr: string, slot: SubscriptionSlot) => {
    const existing = skipState.skippedSessions.find(s => s.date === dateStr && s.slot === slot);
    if (existing) {
      setSkipState(prev => ({ ...prev, skippedSessions: prev.skippedSessions.filter(s => !(s.date === dateStr && s.slot === slot)) }));
      return;
    }
    const check = canSkipSession(dateStr, slot, skipState.skippedSessions, skipState.maxSkipsPerWeek, skipState.maxConsecutive);
    if (!check.allowed) {
      toast({ title: "Cannot skip", description: check.reason, variant: "destructive" });
      return;
    }
    setSkipState(prev => ({ ...prev, skippedSessions: [...prev.skippedSessions, { date: dateStr, slot }] }));
    toast({ title: `${slot.charAt(0).toUpperCase() + slot.slice(1)} skipped ⏭️`, description: `Skipped ${slot} on ${dateStr}. That session extends by 1 meal.` });
  };

  const filteredPlans = useMemo(() => {
    let plans = standardMealPlans;
    if (foodType === "veg") plans = plans.filter(p => p.isVeg);
    if (foodType === "nonveg") plans = plans.filter(p => !p.isVeg);
    if (selectedSlots.length > 0) {
      plans = plans.filter(p => selectedSlots.some(s => p.slots.includes(s)));
    }
    return plans;
  }, [foodType, selectedSlots]);

  // Generate upcoming dates for skip calendar
  const getUpcomingDates = (days: number) => {
    const dates: Date[] = [];
    const start = new Date();
    start.setDate(start.getDate() + 1); // start from tomorrow
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  // ─── Lead Capture ───
  if (step === "lead-capture") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-16 pb-24">
          <SubscriptionLeadCapture source={searchParams.get("utm_source") || "marketing"} onVerified={handleLeadVerified} />
        </main>
        <BottomNav />
      </div>
    );
  }

  // ─── Delivery Time Picker Dialog ───
  const renderTimePickerDialog = () => (
    <Dialog open={!!timePickerSlot} onOpenChange={() => setTimePickerSlot(null)}>
      <DialogContent className="max-w-[320px] rounded-xl p-4">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary" />
            {timePickerSlot && slotEmoji[timePickerSlot]} Delivery Time — {timePickerSlot && slotLabel[timePickerSlot]}
          </DialogTitle>
        </DialogHeader>
        <p className="text-[10px] text-muted-foreground">When would you like your {timePickerSlot} delivered?</p>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {timePickerSlot && deliveryTimeOptions[timePickerSlot].map(time => (
            <button
              key={time}
              onClick={() => {
                setDeliveryTimes(prev => ({ ...prev, [timePickerSlot!]: time }));
                toast({ title: `⏰ ${slotLabel[timePickerSlot!]} set to ${time}` });
                setTimePickerSlot(null);
              }}
              className={`py-2.5 px-2 rounded-lg border-2 text-xs font-bold transition-all ${
                deliveryTimes[timePickerSlot] === time
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-foreground hover:border-primary/50"
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );

  // ─── Landing Page ───
  const renderLanding = () => (
    <div className="space-y-3">
      {/* Welcome Hero */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 px-4 py-4 text-center">
        <div className="absolute top-1 right-2 text-3xl opacity-20 rotate-12">🍛</div>
        {customerInfo ? (
          <p className="text-[10px] text-primary font-medium mb-0.5">{customerInfo.isReturning ? (sc["subscription.welcome_back_text"] || "Welcome back") : (sc["subscription.welcome_text"] || "Welcome")}, {customerInfo.name}! 🙏</p>
        ) : null}
        <h1 className="text-lg font-bold text-foreground leading-snug">
          {(sc["subscription.hero_title"] || "Home-Cooked Meals, Delivered Daily").split(",").map((part, i) => (
            <span key={i}>{part}{i === 0 ? <>,<br /></> : ""}</span>
          ))}
        </h1>
        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
          {sc["subscription.hero_subtitle"] || "Fresh, preservative-free meals by verified home chefs"}
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {[
            { icon: Shield, text: sc["subscription.trust_badge_1"] || "FDA" },
            { icon: Heart, text: sc["subscription.trust_badge_2"] || "No Preservatives" },
            { icon: Truck, text: sc["subscription.trust_badge_3"] || "Daily Delivery" },
            { icon: Crown, text: sc["subscription.trust_badge_4"] || "1000+ Subscribers" },
          ].map(b => (
            <div key={b.text} className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
              <b.icon className="w-2.5 h-2.5 text-primary" />
              <span>{b.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex bg-muted rounded-lg p-1 border border-border">
        <button
          onClick={() => setActiveTab("standard")}
          className={`flex-1 py-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            activeTab === "standard"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="w-3 h-3" /> Standard Plans
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`flex-1 py-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            activeTab === "custom"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Palette className="w-3 h-3" /> Make Your Menu
        </button>
      </div>

      {activeTab === "standard" ? renderStandardTab() : renderCustomTab()}
    </div>
  );

  // ─── Standard Packages Tab ───
  const renderStandardTab = () => (
    <div className="space-y-3">
      {/* Step 1: Food Type */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Step 1 — Preference</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setFoodType(foodType === "veg" ? null : "veg")}
            className={`relative flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
              foodType === "veg"
                ? "border-green-600 bg-green-50 dark:bg-green-950/30 shadow-sm"
                : "border-border bg-background"
            }`}
          >
            <span className="text-2xl">🥬</span>
            <span className="text-xs font-bold text-foreground">Veg</span>
            {foodType === "veg" && (
              <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-green-600 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </button>
          <button
            onClick={() => setFoodType(foodType === "nonveg" ? null : "nonveg")}
            className={`relative flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
              foodType === "nonveg"
                ? "border-red-600 bg-red-50 dark:bg-red-950/30 shadow-sm"
                : "border-border bg-background"
            }`}
          >
            <span className="text-2xl">🍗</span>
            <span className="text-xs font-bold text-foreground">Non-Veg</span>
            {foodType === "nonveg" && (
              <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-600 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Step 2: Meal Slots with time badges */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Step 2 — Meal Slots <span className="font-normal">(multi)</span></p>
        <div className="grid grid-cols-3 gap-1.5">
          {(["breakfast", "lunch", "dinner"] as SubscriptionSlot[]).map(slot => {
            const active = selectedSlots.includes(slot);
            return (
              <button
                key={slot}
                onClick={() => toggleSlot(slot)}
                className={`relative flex flex-col items-center gap-0.5 py-2.5 px-2 rounded-lg border-2 transition-all ${
                  active ? "border-primary bg-primary/10" : "border-border bg-background"
                }`}
              >
                <span className="text-lg">{slotEmoji[slot]}</span>
                <span className="text-[10px] font-bold text-foreground capitalize">{slot}</span>
                {active && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); setTimePickerSlot(slot); }}
                      className="text-[9px] text-orange-600 font-bold hover:underline"
                    >
                      {deliveryTimes[slot]} ✏️
                    </button>
                    <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-2 h-2 text-primary-foreground" />
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 3: Duration */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Step 3 — Duration</p>
        <div className="grid grid-cols-3 gap-1.5">
          {subscriptionDurations.map(d => (
            <button
              key={d.duration}
              onClick={() => setDuration(d.duration)}
              className={`relative py-2 px-1 rounded-lg text-center transition-all border-2 ${
                duration === d.duration ? "border-primary bg-primary/5" : "border-border bg-background"
              }`}
            >
              {d.badge && (
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[7px] bg-destructive text-destructive-foreground px-1.5 py-px rounded-full font-bold whitespace-nowrap">
                  {d.badge}
                </span>
              )}
              <p className="text-[10px] font-bold text-foreground">{d.label.split(" ")[0]}</p>
              <p className="text-[9px] text-muted-foreground">{d.days} days</p>
              {d.discountPct > 0 && <p className="text-[9px] text-green-600 font-semibold">-{d.discountPct}%</p>}
            </button>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="flex justify-between bg-secondary/50 rounded-lg px-3 py-2">
        {[
          { label: "Pick Plan", icon: "📋" },
          { label: "We Cook", icon: "👩‍🍳" },
          { label: "Delivered", icon: "🚴" },
        ].map(s => (
          <div key={s.label} className="flex flex-col items-center text-center flex-1">
            <span className="text-lg">{s.icon}</span>
            <span className="text-[9px] font-semibold text-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Plan Cards */}
      {filteredPlans.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-3xl mb-2">🍽️</div>
          <p className="text-xs font-semibold text-foreground">No plans match</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Change food type or meal slots</p>
          <Button variant="outline" size="sm" className="mt-2 rounded-lg text-[10px] h-7" onClick={() => { setFoodType(null); setSelectedSlots([]); }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          <p className="text-[10px] text-muted-foreground flex items-center flex-wrap gap-1">
            {filteredPlans.length} plan{filteredPlans.length > 1 ? "s" : ""}
            {foodType && <Badge className="text-[8px] py-0 h-4" variant="outline">{foodType === "veg" ? "🥬 Veg" : "🍗 NV"}</Badge>}
            {selectedSlots.map(s => (
              <Badge key={s} className="text-[8px] py-0 h-4" variant="outline">{slotEmoji[s]} {slotLabel[s]}</Badge>
            ))}
          </p>
          {filteredPlans.map(plan => {
            const price = calcPrice(plan);
            return (
              <Card
                key={plan.id}
                className="overflow-hidden border-border cursor-pointer group active:scale-[0.98] transition-all"
                onClick={() => handleSelectStandard(plan)}
              >
                <div className="relative h-32 overflow-hidden">
                  <img src={plan.image} alt={plan.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <Badge className={`text-[8px] py-0 h-4 font-bold ${plan.is_veg ? "bg-green-600" : "bg-red-600"} text-white border-0`}>
                      {plan.is_veg ? "● Veg" : "● NV"}
                    </Badge>
                    {plan.subscribers > 200 && (
                      <Badge className="text-[8px] py-0 h-4 bg-yellow-500 text-black border-0 font-bold">🔥</Badge>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded px-1.5 py-0.5 flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-[10px] text-white font-bold">{plan.rating}</span>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1">
                        <span>{plan.emoji}</span> {plan.name}
                      </h3>
                      <p className="text-[9px] text-white/70">{plan.cuisine}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-white">${price.perDay}</p>
                      <p className="text-[8px] text-white/70">/day</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-2.5">
                  <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{plan.description}</p>
                  <div className="flex gap-1 mt-1.5">
                    {plan.slots.map(s => (
                      <div key={s} className="flex items-center gap-0.5 bg-secondary rounded px-1.5 py-0.5">
                        <span className="text-xs">{slotEmoji[s]}</span>
                        <span className="text-[9px] font-medium text-foreground">{slotLabel[s]}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {plan.highlights.slice(0, 3).map((h, i) => (
                      <span key={i} className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5 text-green-600" /> {h}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-foreground">${price.total.toLocaleString()}</span>
                        {price.discount > 0 && <span className="text-[10px] text-muted-foreground line-through">${price.base.toLocaleString()}</span>}
                      </div>
                      <p className="text-[8px] text-muted-foreground">
                        {durationInfo.days}d • {persons}p
                        {price.discount > 0 && <span className="text-green-600 font-semibold ml-1">Save ${price.discount.toLocaleString()}</span>}
                      </p>
                    </div>
                    <Button size="sm" className="gap-0.5 rounded-lg text-[10px] h-7 px-2.5">
                      Subscribe <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  // ─── Make Your Menu Tab ───
  const renderCustomTab = () => (
    <div className="space-y-3">
      <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
        <CardContent className="p-5 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Palette className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-sm font-bold text-foreground">🎨 Make Your Menu</h3>
          <p className="text-[10px] text-muted-foreground mt-1 max-w-xs mx-auto">
            Pick cuisines, choose dishes for each slot, set portions. Your menu, your way.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {[
              { icon: UtensilsCrossed, text: "Multi-cuisine" },
              { icon: Clock, text: "B/L/D" },
              { icon: ShoppingCart, text: "Per-item price" },
              { icon: Gift, text: "Swap anytime" },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-1 text-[9px] text-muted-foreground">
                <f.icon className="w-3 h-3 text-primary" />
                <span>{f.text}</span>
              </div>
            ))}
          </div>
          <Badge className="mt-3 bg-secondary text-secondary-foreground border-0 text-[10px]">
            🚧 Coming Soon
          </Badge>
        </CardContent>
      </Card>
    </div>
  );

  // ─── Plan Detail ───
  const renderPlanDetail = () => {
    if (!selectedPlan) return null;
    const price = calcPrice(selectedPlan);
    const activationDate = new Date();
    activationDate.setDate(activationDate.getDate() + 1);
    const activationDay = activationDate.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short" });

    return (
      <div className="space-y-3">
        <button onClick={() => { setSelectedPlan(null); setStep("landing"); }} className="flex items-center gap-1 text-xs text-primary font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        {/* Hero image */}
        <div className="relative h-36 rounded-xl overflow-hidden">
          <img src={selectedPlan.image} alt={selectedPlan.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h2 className="text-base font-bold text-white">{selectedPlan.emoji} {selectedPlan.name}</h2>
            <p className="text-[10px] text-white/70">{selectedPlan.cuisine} • {selectedPlan.is_veg ? "Veg" : "Non-Veg"}</p>
          </div>
        </div>

        {/* Highlights */}
        <div className="flex flex-wrap gap-1">
          {selectedPlan.highlights.map((h, i) => (
            <Badge key={i} variant="outline" className="text-[9px] gap-0.5 rounded-md py-0 h-5"><Leaf className="w-2.5 h-2.5 text-green-600" /> {h}</Badge>
          ))}
        </div>

        {/* Activation note */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-2.5 relative">
          <div className="flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
            <p className="text-[10px] text-foreground leading-relaxed pr-5">
              Your meals start on <strong>{activationDay}</strong> as per the subscription activation date. You get <strong>3 skips per week</strong> (max 2 consecutive days).
            </p>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <button className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors">
                <span className="text-[9px] font-bold">?</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 text-[10px] leading-relaxed p-3" side="bottom" align="end">
              <p className="font-bold text-foreground mb-1">📖 How does skip/pause work?</p>
              <ul className="space-y-1 text-muted-foreground list-disc pl-3">
                <li>You can <strong>skip up to 3 sessions per week</strong> — each session (breakfast, lunch, dinner) counts separately.</li>
                <li>If you ordered lunch + dinner and skip only <strong>lunch</strong> on Monday, only your <strong>lunch subscription extends by 1 meal</strong>. Dinner continues as normal.</li>
                <li>You <strong>can't skip the same session more than 2 days in a row</strong> — plan ahead!</li>
                <li>Each skipped session <strong>extends only that session's end date</strong>, not the whole subscription.</li>
                <li>If you skip the same session 2 days back-to-back and don't resume, the 3rd day is considered delivered (no refund).</li>
                <li>Your meals begin from <strong>{activationDay}</strong> — that's the day after you subscribe.</li>
              </ul>
            </PopoverContent>
          </Popover>
        </div>

        {/* Menu availability note */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-[10px] text-amber-800 leading-relaxed">
            <strong>Note:</strong> Slight variations in vegetables or specific menu items may occur occasionally due to seasonal availability and market pricing fluctuations. We ensure quality and taste remain consistent.
          </p>
        </div>

        {/* Weekly Menu — scrollable day-wise */}
        <div>
          <h3 className="text-xs font-bold text-foreground mb-1.5 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-primary" /> Weekly Menu
          </h3>
          <div className="space-y-1">
            {(selectedPlan.weekly_menu || []).map((day: any, dayIndex: number) => (
              <div key={day.day}>
                <button
                  onClick={() => setExpandedMenu(expandedMenu === day.day ? null : day.day)}
                  className={`w-full text-left flex items-center justify-between rounded-lg px-2.5 py-2 transition-all ${
                    expandedMenu === day.day ? "bg-primary/10 border border-primary/20" : "bg-secondary/50"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-foreground">{weekDaysFull[dayIndex]}</span>
                    {dayIndex === 0 && (
                      <Badge className="text-[7px] h-3.5 bg-primary/20 text-primary border-0">Starts here</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-muted-foreground">{day.meals.length} meal{day.meals.length > 1 ? "s" : ""}</span>
                    {expandedMenu === day.day ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                  </div>
                </button>
                {expandedMenu === day.day && (
                  <div className="px-2 py-1.5 ml-2 border-l-2 border-primary/20 space-y-1.5">
                    {day.meals.map((meal, i) => (
                      <div key={i} className="text-[10px]">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="text-xs">{slotEmoji[meal.slot]}</span>
                          <span className="font-bold text-foreground capitalize">{meal.slot}</span>
                          {selectedSlots.includes(meal.slot) && (
                            <span className="text-[8px] text-primary">({deliveryTimes[meal.slot]})</span>
                          )}
                        </div>
                        {/* Full meal description */}
                        <div className="ml-4 space-y-0.5">
                          {meal.items.map((item, j) => {
                            const dishes = item.split(" + ");
                            return (
                              <div key={j} className="flex flex-wrap gap-x-1 gap-y-0.5">
                                {dishes.map((dish, k) => (
                                  <span key={k} className="inline-flex items-center gap-0.5 text-muted-foreground">
                                    {k > 0 && <span className="text-primary/40">+</span>}
                                    <span>{dish.trim()}</span>
                                  </span>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Skip Calendar Button */}
        <button
          onClick={() => setShowSkipCalendar(!showSkipCalendar)}
          className="w-full flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2 hover:bg-secondary transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <SkipForward className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold text-foreground">Meal Skip Calendar</span>
          </div>
          <div className="flex items-center gap-1">
            <Badge className="text-[8px] h-4 bg-primary/10 text-primary border-0">
              {skipState.skippedSessions.length} skipped
            </Badge>
            {showSkipCalendar ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </div>
        </button>

        {showSkipCalendar && (
          <Card className="border-border">
            <CardContent className="p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground">Tap a session to skip. Max 3/week, max 2 consecutive per session.</p>
                {extensionSessions > 0 && (
                  <Badge className="text-[8px] bg-green-100 text-green-800 border-0">+{extensionSessions} meals extended</Badge>
                )}
              </div>
              {/* Session filter */}
              {selectedSlots.length > 1 && (
                <div className="flex gap-1">
                  <button
                    onClick={() => setSkipSlotFilter(null)}
                    className={`text-[8px] px-2 py-0.5 rounded-full border ${!skipSlotFilter ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}
                  >All</button>
                  {selectedSlots.map(s => (
                    <button
                      key={s}
                      onClick={() => setSkipSlotFilter(s)}
                      className={`text-[8px] px-2 py-0.5 rounded-full border capitalize ${skipSlotFilter === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}
                    >{slotEmoji[s]} {s}</button>
                  ))}
                </div>
              )}
              {/* Per-slot extension summary */}
              {Object.entries(extensionBySlot).filter(([, v]) => v > 0).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {Object.entries(extensionBySlot).filter(([, v]) => v > 0).map(([slot, count]) => (
                    <span key={slot} className="text-[8px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded capitalize">
                      {slot}: +{count} meal{count > 1 ? "s" : ""}
                    </span>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-7 gap-1">
                {weekDaysShort.map(d => (
                  <span key={d} className="text-[8px] text-center font-bold text-muted-foreground">{d}</span>
                ))}
              </div>
              {/* Calendar grid — each date shows skip buttons per session */}
              <div className="grid grid-cols-7 gap-1">
                {getUpcomingDates(durationInfo.days).map(date => {
                  const dateStr = date.toISOString().split("T")[0];
                  const slotsToShow = skipSlotFilter ? [skipSlotFilter] : selectedSlots;
                  const anySkipped = slotsToShow.some(sl => skipState.skippedSessions.some(s => s.date === dateStr && s.slot === sl));
                  return (
                    <div
                      key={dateStr}
                      className={`aspect-square rounded-md text-[7px] font-medium transition-all flex flex-col items-center justify-center gap-0 border ${
                        anySkipped ? "border-destructive/30 bg-destructive/10" : "border-border bg-background"
                      }`}
                    >
                      <span className="text-[8px] font-bold">{date.getDate()}</span>
                      <div className="flex gap-px">
                        {slotsToShow.map(sl => {
                          const isSkipped = skipState.skippedSessions.some(s => s.date === dateStr && s.slot === sl);
                          return (
                            <button
                              key={sl}
                              onClick={() => handleSkipSession(dateStr, sl)}
                              className={`w-2.5 h-2.5 rounded-full text-[5px] leading-none ${
                                isSkipped ? "bg-destructive text-destructive-foreground" : "bg-primary/20 text-primary hover:bg-primary/40"
                              }`}
                              title={`${isSkipped ? "Unskip" : "Skip"} ${sl} on ${dateStr}`}
                            >
                              {sl[0].toUpperCase()}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[8px] text-muted-foreground">
                ⚠️ Each skipped session extends only that session (not the full day). If you skip 2 consecutive days for the same session, the 3rd day counts as delivered.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Persons */}
        <Card className="border-border">
          <CardContent className="p-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-foreground">Persons</span>
                <p className="text-[9px] text-muted-foreground">Per person portions</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-7 w-7 p-0 rounded-md text-xs" onClick={() => setPersons(Math.max(1, persons - 1))}>-</Button>
                <span className="text-xs font-bold w-4 text-center">{persons}</span>
                <Button size="sm" variant="outline" className="h-7 w-7 p-0 rounded-md text-xs" onClick={() => setPersons(Math.min(10, persons + 1))}>+</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Duration */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Duration</p>
          <div className="grid grid-cols-3 gap-1.5">
            {subscriptionDurations.map(d => (
              <button
                key={d.duration}
                onClick={() => setDuration(d.duration)}
                className={`relative py-2 px-1 rounded-lg text-center transition-all border-2 ${
                  duration === d.duration ? "border-primary bg-primary/5" : "border-border bg-background"
                }`}
              >
                {d.badge && <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[7px] bg-destructive text-destructive-foreground px-1.5 py-px rounded-full font-bold whitespace-nowrap">{d.badge}</span>}
                <p className="text-[10px] font-bold text-foreground">{d.label.split(" ")[0]}</p>
                <p className="text-[9px] text-muted-foreground">{d.days} days</p>
                {d.discountPct > 0 && <p className="text-[9px] text-green-600 font-semibold">-{d.discountPct}%</p>}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-2.5 space-y-1">
            <div className="flex justify-between text-[10px]"><span className="text-muted-foreground">Per day ({persons}p)</span><span className="font-medium">${price.perDay}</span></div>
            <div className="flex justify-between text-[10px]"><span className="text-muted-foreground">{durationInfo.days} days</span><span className="font-medium">${price.base.toLocaleString()}</span></div>
            {price.discount > 0 && <div className="flex justify-between text-[10px] text-green-600"><span>Discount</span><span>-${price.discount.toLocaleString()}</span></div>}
            <div className="flex justify-between text-[10px]"><span className="text-muted-foreground">Delivery</span><span>${price.delivery.toLocaleString()}</span></div>
            {extensionSessions > 0 && (
              <div className="flex justify-between text-[10px] text-primary"><span>Extension ({extensionSessions} skipped sessions)</span><span>+{extensionSessions} meals free</span></div>
            )}
            <div className="border-t border-border pt-1.5 flex justify-between text-sm font-bold">
              <span>Total</span><span className="text-primary">${price.total.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Delivery times summary */}
        {selectedSlots.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedSlots.map(s => (
              <div key={s} className="flex items-center gap-0.5 bg-secondary rounded px-2 py-1 text-[9px] text-foreground">
                {slotEmoji[s]} {slotLabel[s]}: <strong>{deliveryTimes[s]}</strong>
              </div>
            ))}
          </div>
        )}

        <Button className="w-full gap-1 rounded-lg h-9 text-xs" onClick={() => setStep("address")}>
          Continue <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    );
  };

  // ─── Address ───
  const renderAddress = () => (
    <div className="space-y-3">
      <button onClick={() => setStep("plan-detail")} className="flex items-center gap-1 text-xs text-primary font-medium">
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>
      <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" /> Delivery Details</h2>

      <div className="space-y-2">
        <div>
          <label className="text-[10px] font-medium text-foreground block mb-0.5">Full Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full px-2.5 py-2 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary" placeholder="Enter your name" />
        </div>
        <div>
          <label className="text-[10px] font-medium text-foreground block mb-0.5">Mobile</label>
          <input value={mobile} onChange={e => setMobile(e.target.value)} className="w-full px-2.5 py-2 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary" placeholder="10-digit mobile" maxLength={10} />
        </div>
        <div>
          <label className="text-[10px] font-medium text-foreground block mb-0.5">Address</label>
          <textarea value={address} onChange={e => setAddress(e.target.value)} className="w-full px-2.5 py-2 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary" rows={2} placeholder="Full address with landmark" />
        </div>
        <div>
          <label className="text-[10px] font-medium text-foreground block mb-0.5">Instructions (optional)</label>
          <input value={instructions} onChange={e => setInstructions(e.target.value)} className="w-full px-2.5 py-2 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary" placeholder="e.g., Less spice" maxLength={150} />
        </div>
      </div>

      {selectedPlan && (() => {
        const price = calcPrice(selectedPlan);
        return (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-2.5 space-y-0.5">
              <div className="flex justify-between text-[10px]"><span className="text-muted-foreground">{selectedPlan.name} ({durationInfo.days}d × {persons}p)</span><span>${price.base.toLocaleString()}</span></div>
              {price.discount > 0 && <div className="flex justify-between text-[10px] text-green-600"><span>Discount</span><span>-${price.discount.toLocaleString()}</span></div>}
              <div className="flex justify-between text-[10px]"><span className="text-muted-foreground">Delivery</span><span>${price.delivery.toLocaleString()}</span></div>
              <div className="border-t border-border pt-1 flex justify-between text-xs font-bold"><span>Total</span><span className="text-primary">${price.total.toLocaleString()}</span></div>
            </CardContent>
          </Card>
        );
      })()}

      <Button className="w-full gap-1 rounded-lg h-9 text-xs" onClick={() => setStep("checkout")} disabled={!name || !mobile || !address || mobile.length < 10}>
        <CreditCard className="w-3.5 h-3.5" /> Proceed to Payment
      </Button>
    </div>
  );

  // ─── Checkout ───
  const renderCheckout = () => {
    const price = selectedPlan ? calcPrice(selectedPlan) : { total: 0 };
    return (
      <div className="space-y-3">
        <button onClick={() => setStep("address")} className="flex items-center gap-1 text-xs text-primary font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <h2 className="text-sm font-bold text-foreground">💳 Payment</h2>
        <Card className="border-border">
          <CardContent className="p-2.5 space-y-0.5 text-[10px]">
            <p className="font-semibold text-foreground text-xs">{selectedPlan?.name}</p>
            <p className="text-muted-foreground">{durationInfo.label} • {persons} person{persons > 1 ? "s" : ""}</p>
            <p className="text-muted-foreground">{name} • {mobile}</p>
            <p className="text-muted-foreground line-clamp-1">{address}</p>
            {selectedSlots.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedSlots.map(s => (
                  <span key={s} className="text-[9px] bg-secondary rounded px-1 py-0.5">{slotEmoji[s]} {deliveryTimes[s]}</span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <PaymentSection total={price.total} formatPrice={(n) => `$${n.toLocaleString()}`} onPaymentSuccess={() => handlePayment("card")} onPaymentFailure={() => {}} />
      </div>
    );
  };

  // ─── Confirmation ───
  const renderConfirmation = () => (
    <div className="text-center py-6 space-y-3">
      <div className="w-14 h-14 mx-auto rounded-full bg-green-100 flex items-center justify-center">
        <Check className="w-7 h-7 text-green-600" />
      </div>
      <h2 className="text-base font-bold text-foreground">Subscription Activated! 🎉</h2>
      <p className="text-xs text-muted-foreground">
        Your {durationInfo.label} {selectedPlan?.name} starts tomorrow.
      </p>
      <div className="bg-secondary/50 rounded-lg p-3 max-w-xs mx-auto text-left space-y-0.5 text-[10px]">
        <p className="text-foreground"><strong>Plan:</strong> {selectedPlan?.name}</p>
        <p className="text-foreground"><strong>Duration:</strong> {durationInfo.label} ({durationInfo.days} days{extensionSessions > 0 ? ` +${extensionSessions} sessions extended` : ""})</p>
        <p className="text-foreground"><strong>Persons:</strong> {persons}</p>
        <p className="text-foreground"><strong>Delivery:</strong> {address}</p>
        {selectedSlots.length > 0 && (
          <div className="pt-1 border-t border-border space-y-0.5">
            {selectedSlots.map(s => (
              <p key={s} className="text-foreground"><strong>{slotLabel[s]}:</strong> {deliveryTimes[s]}</p>
            ))}
          </div>
        )}
        {skipState.skippedSessions.length > 0 && (
          <div className="text-foreground space-y-0.5">
            <p><strong>Skipped Sessions:</strong></p>
            {skipState.skippedSessions.map((s, i) => (
              <p key={i} className="text-muted-foreground">• {s.date} — <span className="capitalize">{s.slot}</span></p>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-2 justify-center">
        <Button onClick={() => navigate("/")} variant="outline" className="rounded-lg text-xs h-8 px-3">Home</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main ref={mainRef} className="max-w-lg mx-auto px-3 pt-16 pb-20">
        {step === "landing" && renderLanding()}
        {step === "plan-detail" && renderPlanDetail()}
        {step === "address" && renderAddress()}
        {step === "checkout" && renderCheckout()}
        {step === "confirmation" && renderConfirmation()}
      </main>
      {renderTimePickerDialog()}
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Subscriptions;
