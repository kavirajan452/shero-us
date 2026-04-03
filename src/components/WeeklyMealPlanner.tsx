import { useState, useMemo } from "react";
import { Check, Pencil, ArrowLeft, Play, SkipForward, ChevronDown, Minus, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

/* ── Menu Data ── */

interface MenuItem {
  id: string;
  name: string;
}

interface MealSlotMenu {
  main: MenuItem[];
  side1: MenuItem[];
  side2: MenuItem[];
}

const breakfastMenu: MealSlotMenu = {
  main: [
    { id: "b-m1", name: "Idli 40gm 4nos" },
    { id: "b-m2", name: "Idiyappam 5nos" },
    { id: "b-m3", name: "6 Veetu Dosa 3nos" },
    { id: "b-m4", name: "Poori 4nos" },
    { id: "b-m5", name: "Ven Pongal 250ml" },
    { id: "b-m6", name: "Onion Ragi Dosa 3nos" },
    { id: "b-m7", name: "Khichadi 250ml" },
    { id: "b-m8", name: "Andhra Upma 250ml" },
    { id: "b-m9", name: "Andhra Style Erra Karam Dosa 3nos" },
    { id: "b-m10", name: "Andhra Pesarratu 3nos" },
    { id: "b-m11", name: "Lemon Semiya Upma 250ml" },
    { id: "b-m12", name: "Puttu 4pcs" },
    { id: "b-m13", name: "Nool Puttu 4nos" },
    { id: "b-m14", name: "Pal Appam 3nos" },
    { id: "b-m15", name: "Methi Poori 6nos" },
    { id: "b-m16", name: "Butter Chapathi 4nos" },
    { id: "b-m17", name: "Ghee Phulka 6nos" },
  ],
  side1: [
    { id: "b-s1-1", name: "Tiffin Sambar 200ml" },
    { id: "b-s1-2", name: "Veg White Kurma 200ml" },
    { id: "b-s1-3", name: "Potato Masala 200ml" },
    { id: "b-s1-4", name: "Kara Podi 200ml" },
    { id: "b-s1-5", name: "Potato Curry 200ml" },
    { id: "b-s1-6", name: "Karivepaku Podi 200ml" },
    { id: "b-s1-7", name: "Kadala Curry 200ml" },
    { id: "b-s1-8", name: "Cheru Payaru Curry 200ml" },
    { id: "b-s1-9", name: "Veg Stew 200ml" },
    { id: "b-s1-10", name: "Makhani Curry 200ml" },
    { id: "b-s1-11", name: "Dal Palak 200ml" },
    { id: "b-s1-12", name: "Curd 200ml + Pickle" },
    { id: "b-s1-13", name: "Subzi 250ml" },
  ],
  side2: [
    { id: "b-s2-1", name: "Coconut Chutney 100ml" },
    { id: "b-s2-2", name: "Kara Chutney 100ml" },
    { id: "b-s2-3", name: "Green Chutney 100ml" },
    { id: "b-s2-4", name: "Tomato Palli Chutney 100ml" },
    { id: "b-s2-5", name: "Allam Chutney 100ml" },
    { id: "b-s2-6", name: "Ullipaya Chutney 100ml" },
    { id: "b-s2-7", name: "Kothimeera Kobbari Chutney 100ml" },
    { id: "b-s2-8", name: "Pudina Kobbari Chutney 100ml" },
    { id: "b-s2-9", name: "Thenga Chammandhi 100ml" },
    { id: "b-s2-10", name: "Banana 2" },
    { id: "b-s2-11", name: "Ulli Chammanthi 100ml" },
    { id: "b-s2-12", name: "Pappadam 4" },
  ],
};

const lunchMenu: MealSlotMenu = {
  main: [
    { id: "l-m1", name: "White Rice 450ml" },
    { id: "l-m2", name: "Butter Chapathi 2nos" },
    { id: "l-m3", name: "Phulka 4nos" },
    { id: "l-m4", name: "Ghee Chapathi 2nos" },
    { id: "l-m5", name: "Butter Phulka 4nos" },
    { id: "l-m6", name: "Ghee Phulka 4nos" },
    { id: "l-m7", name: "Methi Poori 4nos" },
    { id: "l-m8", name: "Choru 450ml" },
  ],
  side1: [
    { id: "l-s1-1", name: "Kathirikai Murungai Sambar 200ml" },
    { id: "l-s1-2", name: "Vendakai Moor Kuzhambu 200ml" },
    { id: "l-s1-3", name: "Mix Veg Sambar 200ml" },
    { id: "l-s1-4", name: "Sundakai Vatha Kozhambu 200ml" },
    { id: "l-s1-5", name: "Mullangi Murungai Sambar 200ml" },
    { id: "l-s1-6", name: "Urulai Carrot Sambar 200ml" },
    { id: "l-s1-7", name: "Carrot Beans Sambar 200ml" },
    { id: "l-s1-8", name: "Munakkaya Mullangi Sambar 200ml" },
  ],
  side2: [
    { id: "l-s2-1", name: "Tomato Rasam 150ml" },
    { id: "l-s2-2", name: "Poondu Rasam 150ml" },
    { id: "l-s2-3", name: "Milagu Rasam 150ml" },
    { id: "l-s2-4", name: "Vendakai Moor Kozhambu 150ml" },
    { id: "l-s2-5", name: "Inji Rasam 150ml" },
    { id: "l-s2-6", name: "Plain Moor Kozhambu 150ml" },
    { id: "l-s2-7", name: "Miriyala Charu 150ml" },
    { id: "l-s2-8", name: "Majiga with Coriander 150ml" },
  ],
};

const dinnerMenu: MealSlotMenu = {
  main: [
    { id: "d-m1", name: "Plain Uttapam 3nos" },
    { id: "d-m2", name: "Veg Khichdi 250ml" },
    { id: "d-m3", name: "Chapati 3nos" },
    { id: "d-m4", name: "Tomato Sevai 450ml" },
    { id: "d-m5", name: "Broken Wheat Upma 450ml" },
    { id: "d-m6", name: "Veg Godhumai Dosai 3nos" },
    { id: "d-m7", name: "Godhuma Pindi Dosa 3nos" },
    { id: "d-m8", name: "Goduma Vegetable Upma 250ml" },
    { id: "d-m9", name: "Lemon Semiya Upma 250ml" },
    { id: "d-m10", name: "Idli 4nos 40gm" },
    { id: "d-m11", name: "Rava Dosa 3nos" },
    { id: "d-m12", name: "Kanji 450ml" },
    { id: "d-m13", name: "Nool Puttu 4nos" },
    { id: "d-m14", name: "Phulka 6nos" },
    { id: "d-m15", name: "Aloo Paratha 3nos" },
  ],
  side1: [
    { id: "d-s1-1", name: "Tiffin Sambar 200ml" },
    { id: "d-s1-2", name: "Channa Kurma 200ml" },
    { id: "d-s1-3", name: "Veg White Kurma 200ml" },
    { id: "d-s1-4", name: "Vanpayaru Thoran 200ml" },
    { id: "d-s1-5", name: "Cheru Payaru Curry 200ml" },
    { id: "d-s1-6", name: "Kadala Curry 200ml" },
    { id: "d-s1-7", name: "Kadalai Thoran 200ml" },
    { id: "d-s1-8", name: "Veg Stew 200ml" },
    { id: "d-s1-9", name: "Khorma 200ml" },
    { id: "d-s1-10", name: "Masala 200ml" },
    { id: "d-s1-11", name: "Makhani Curry 200ml" },
    { id: "d-s1-12", name: "Subzi 200ml" },
  ],
  side2: [
    { id: "d-s2-1", name: "Poodu Thovayal 100ml" },
    { id: "d-s2-2", name: "Kara Chutney 100ml" },
    { id: "d-s2-3", name: "Coconut Chutney 100ml" },
    { id: "d-s2-4", name: "Green Chutney 100ml" },
    { id: "d-s2-5", name: "Tomato Palli Chutney 100ml" },
    { id: "d-s2-6", name: "Kothimeera Kobbari Chutney 100ml" },
    { id: "d-s2-7", name: "Potato Curry 100ml" },
    { id: "d-s2-8", name: "Green Coconut Chutney 100ml" },
    { id: "d-s2-9", name: "Inji Chammandhi 100ml" },
    { id: "d-s2-10", name: "Thenga Chammandhi 100ml" },
    { id: "d-s2-11", name: "Papadam 2" },
    { id: "d-s2-12", name: "Banana 1" },
  ],
};

const MEAL_PRICES = { breakfast: 130, lunch: 150, dinner: 130 } as const;
const PACKING_CHARGES: Record<MealType, number> = { breakfast: 15, lunch: 20, dinner: 15 };
const DELIVERY_CHARGE_RANGE = { min: 80, max: 150 } as const;
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
type MealType = "breakfast" | "lunch" | "dinner";
type ColumnType = "main" | "side1" | "side2";

interface DaySelections {
  breakfast: { main: string | null; side1: string | null; side2: string | null };
  lunch: { main: string | null; side1: string | null; side2: string | null };
  dinner: { main: string | null; side1: string | null; side2: string | null };
}

const emptyDay = (): DaySelections => ({
  breakfast: { main: null, side1: null, side2: null },
  lunch: { main: null, side1: null, side2: null },
  dinner: { main: null, side1: null, side2: null },
});

const getMenu = (meal: MealType): MealSlotMenu =>
  meal === "breakfast" ? breakfastMenu : meal === "lunch" ? lunchMenu : dinnerMenu;

const getItemName = (meal: MealType, col: ColumnType, id: string): string => {
  const menu = getMenu(meal);
  return menu[col].find((i) => i.id === id)?.name ?? id;
};

export interface MealPlanSummary {
  meals: MealType[];
  persons: number;
  activeDays: number;
  skippedDays: number;
  /** Day-of-week indices that were skipped (0=Mon, 1=Tue, ... 6=Sun) */
  skippedWeekdays: number[];
  foodTotal: number;
  packingTotal: number;
  deliveryEstimate: { min: number; max: number };
  weeklyEstimate: { min: number; max: number };
  dailyFoodRate: number;
  dailyPackingRate: number;
  deliveryPerDay: { min: number; max: number };
}

interface Props {
  planName: string;
  onClose: () => void;
  onConfirm: (summary: MealPlanSummary) => void;
}

const WeeklyMealPlanner = ({ planName, onClose, onConfirm }: Props) => {
  const { toast } = useToast();
  const [step, setStep] = useState<"meals" | "customize" | "summary">("meals");
  const [enabledMeals, setEnabledMeals] = useState<Set<MealType>>(new Set());
  const [persons, setPersons] = useState(1);
  const [selections, setSelections] = useState<DaySelections[]>(
    () => Array.from({ length: 7 }, emptyDay)
  );
  const [skippedDays, setSkippedDays] = useState<boolean[]>(() => Array(7).fill(false));

  const toggleMealChoice = (meal: MealType) => {
    setEnabledMeals((prev) => {
      const next = new Set(prev);
      if (next.has(meal)) next.delete(meal);
      else next.add(meal);
      return next;
    });
  };

  const toggleSkipDay = (dayIdx: number) => {
    setSkippedDays((prev) => {
      const next = [...prev];
      next[dayIdx] = !next[dayIdx];
      return next;
    });
    if (!skippedDays[dayIdx]) {
      setSelections((prev) => {
        const next = [...prev];
        next[dayIdx] = emptyDay();
        return next;
      });
    }
  };

  const enabledMealsArr = (["breakfast", "lunch", "dinner"] as MealType[]).filter((m) => enabledMeals.has(m));

  const isDayComplete = (dayIdx: number) => {
    if (skippedDays[dayIdx]) return true;
    const d = selections[dayIdx];
    return enabledMealsArr.every((m) => d[m].main && d[m].side1 && d[m].side2);
  };

  const isMealComplete = (dayIdx: number, meal: MealType) => {
    const s = selections[dayIdx][meal];
    return !!(s.main && s.side1 && s.side2);
  };

  const completedMealsCount = (dayIdx: number) =>
    enabledMealsArr.filter((m) => isMealComplete(dayIdx, m)).length;

  const dailyTotal = (dayIdx: number) => {
    if (skippedDays[dayIdx]) return 0;
    let total = 0;
    enabledMealsArr.forEach((m) => {
      if (isMealComplete(dayIdx, m)) total += MEAL_PRICES[m];
    });
    return total;
  };

  const dailyMaxTotal = enabledMealsArr.reduce((s, m) => s + MEAL_PRICES[m], 0);
  const activeDaysCount = skippedDays.filter((s) => !s).length;
  const hasAtLeastOneDay = activeDaysCount > 0;
  const allComplete = DAYS.every((_, i) => isDayComplete(i)) && hasAtLeastOneDay;

  const weeklyBreakdown = useMemo(() => {
    const result: Record<string, number> = {};
    enabledMealsArr.forEach((m) => {
      result[m] = activeDaysCount * MEAL_PRICES[m];
    });
    const subtotal = Object.values(result).reduce((s, v) => s + v, 0);
    const packingPerDay = enabledMealsArr.reduce((s, m) => s + PACKING_CHARGES[m], 0);
    const totalPacking = packingPerDay * activeDaysCount * persons;
    return { ...result, subtotal, days: activeDaysCount, packingPerDay, totalPacking };
  }, [activeDaysCount, enabledMeals, persons]);

  /* ── Render: Meal Slot (as collapsible dropdown) ── */
  const renderMealSlot = (meal: MealType, dayIdx: number) => {
    const menu = getMenu(meal);
    const complete = isMealComplete(dayIdx, meal);
    const label = meal.charAt(0).toUpperCase() + meal.slice(1);
    const sel = selections[dayIdx][meal];
    const summaryParts = [
      sel.main ? getItemName(meal, "main", sel.main) : null,
      sel.side1 ? getItemName(meal, "side1", sel.side1) : null,
      sel.side2 ? getItemName(meal, "side2", sel.side2) : null,
    ].filter(Boolean);

    const selectForDay = (col: ColumnType, itemId: string) => {
      setSelections((prev) => {
        const next = [...prev];
        const day = { ...next[dayIdx] };
        const slot = { ...day[meal] };
        slot[col] = slot[col] === itemId ? null : itemId;
        day[meal] = slot;
        next[dayIdx] = day;
        return next;
      });
    };

    const renderCol = (col: ColumnType, items: MenuItem[]) => {
      const selected = sel[col];
      const colLabel = col === "main" ? "Main" : col === "side1" ? "Side 1" : "Side 2";
      return (
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">{colLabel}</p>
          <div className="space-y-1">
            {items.map((item) => {
              const isSelected = selected === item.id;
              const isDisabled = selected !== null && !isSelected;
              return (
                <button
                  key={item.id}
                  onClick={() => selectForDay(col, item.id)}
                  disabled={isDisabled}
                  className={cn(
                    "w-full text-left text-[11px] px-2.5 py-2 rounded-lg border transition-all duration-150",
                    isSelected
                      ? "border-primary bg-primary/10 text-foreground font-medium"
                      : isDisabled
                      ? "border-border/50 bg-muted/30 text-muted-foreground/40 cursor-not-allowed"
                      : "border-border hover:border-primary/50 text-foreground hover:bg-primary/5 cursor-pointer"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {isSelected && <Check className="w-3 h-3 text-primary shrink-0" />}
                    <span className="truncate">{item.name}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      );
    };

    return (
      <Collapsible className="rounded-lg border border-border overflow-hidden">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between px-3 py-2.5 bg-card hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">{label}</span>
              <span className="text-[9px] text-muted-foreground">${MEAL_PRICES[meal]}/day</span>
              {complete && (
                <Badge className="text-[8px] bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 border-0 gap-0.5 px-1.5 py-0">
                  <Check className="w-2.5 h-2.5" /> Done
                </Badge>
              )}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground transition-transform [[data-state=open]>&]:rotate-180" />
          </div>
          {complete && summaryParts.length > 0 && (
            <div className="px-3 pb-1.5 text-left">
              <p className="text-[9px] text-muted-foreground truncate">
                {summaryParts.join(" · ")}
              </p>
            </div>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 pt-1 border-t border-border bg-muted/10">
            <div className="grid grid-cols-3 gap-2">
              {renderCol("main", menu.main)}
              {renderCol("side1", menu.side1)}
              {renderCol("side2", menu.side2)}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  /* ── STEP: Choose Meals ── */
  if (step === "meals") {
    const mealOptions: { key: MealType; label: string; emoji: string; price: number }[] = [
      { key: "breakfast", label: "Breakfast", emoji: "🌅", price: MEAL_PRICES.breakfast },
      { key: "lunch", label: "Lunch", emoji: "☀️", price: MEAL_PRICES.lunch },
      { key: "dinner", label: "Dinner", emoji: "🌙", price: MEAL_PRICES.dinner },
    ];

    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
          <div className="container mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" className="shrink-0" onClick={onClose}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h2 className="text-base font-bold text-foreground">Choose Your Meals</h2>
              <p className="text-[11px] text-muted-foreground">{planName}</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-md">
          <p className="text-sm text-muted-foreground text-center mb-6">
            Select which meals you'd like included in your weekly plan. You can choose one or more.
          </p>

          <div className="space-y-3">
            {mealOptions.map((opt) => {
              const selected = enabledMeals.has(opt.key);
              return (
                <button
                  key={opt.key}
                  onClick={() => toggleMealChoice(opt.key)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">{opt.label}</p>
                    <p className="text-[11px] text-muted-foreground">${opt.price}/day per meal</p>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all",
                    selected ? "bg-primary border-primary" : "border-border"
                  )}>
                    {selected && <Check className="w-4 h-4 text-primary-foreground" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Number of Persons */}
          <div className="mt-6 p-4 rounded-xl border-2 border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-bold text-foreground">Number of Persons</p>
                  <p className="text-[11px] text-muted-foreground">Pricing is per person per meal</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  disabled={persons <= 1}
                  onClick={() => setPersons((p) => Math.max(1, p - 1))}
                >
                  <Minus className="w-3.5 h-3.5" />
                </Button>
                <span className="text-lg font-bold text-foreground w-8 text-center">{persons}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  disabled={persons >= 10}
                  onClick={() => setPersons((p) => Math.min(10, p + 1))}
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {enabledMeals.size > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">
                ${dailyMaxTotal * persons}/day for {persons} person{persons > 1 ? "s" : ""} · ${dailyMaxTotal * persons * 7}/week
              </p>
            </div>
          )}

          <Button
            className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-11"
            disabled={enabledMeals.size === 0}
            onClick={() => setStep("customize")}
          >
            Continue to Customise ({enabledMeals.size} meal{enabledMeals.size !== 1 ? "s" : ""} · {persons} person{persons > 1 ? "s" : ""})
          </Button>
        </div>
      </div>
    );
  }

  /* ── STEP: Customize (all days on one page) ── */
  if (step === "customize") {
    const weekTotal = DAYS.reduce((sum, _, i) => sum + dailyTotal(i), 0) * persons;

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setStep("meals")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex-1">
                <h2 className="text-base font-bold text-foreground">Customise Your Weekly Meal Plan</h2>
                <p className="text-[11px] text-muted-foreground">{planName} · {enabledMealsArr.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(" + ")}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{activeDaysCount} days · {persons} person{persons > 1 ? "s" : ""}</p>
                <p className="text-sm font-bold text-foreground">${weekTotal}/week</p>
              </div>
            </div>
          </div>
        </div>

        {/* All Days */}
        <div className="container mx-auto px-4 py-5 pb-28 space-y-4">
          {DAYS.map((day, i) => {
            const dayComplete = isDayComplete(i);
            const isSkipped = skippedDays[i];

            return (
              <Collapsible key={day} defaultOpen={i === 0} className="rounded-xl border-2 border-border overflow-hidden">
                <CollapsibleTrigger className="w-full">
                  <div className={cn(
                    "flex items-center justify-between px-4 py-3 transition-colors",
                    isSkipped ? "bg-muted/30" : dayComplete ? "bg-green-50 dark:bg-green-950/20" : "bg-card hover:bg-muted/20"
                  )}>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-bold", isSkipped ? "text-muted-foreground line-through" : "text-foreground")}>{day}</span>
                      {isSkipped && <Badge variant="secondary" className="text-[9px]">Skipped</Badge>}
                      {!isSkipped && dayComplete && (
                        <Badge className="text-[8px] bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 border-0 gap-0.5 px-1.5">
                          <Check className="w-2.5 h-2.5" /> Complete
                        </Badge>
                      )}
                      {!isSkipped && !dayComplete && (
                         <Badge variant="outline" className="text-[9px]">{completedMealsCount(i)}/{enabledMealsArr.length} meals</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!isSkipped && <span className="text-[10px] font-semibold text-muted-foreground">${dailyTotal(i)}/day</span>}
                      <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform [[data-state=open]>&]:rotate-180" />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 py-3 border-t border-border space-y-2">
                    {/* Skip toggle */}
                    <div className="flex justify-end mb-1">
                      <Button
                        variant={isSkipped ? "default" : "outline"}
                        size="sm"
                        className="text-[10px] h-6 gap-1 px-2"
                        onClick={(e) => { e.stopPropagation(); toggleSkipDay(i); }}
                      >
                        {isSkipped ? <><Play className="w-3 h-3" /> Enable Day</> : <><SkipForward className="w-3 h-3" /> Skip Day</>}
                      </Button>
                    </div>

                    {isSkipped ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No meals — day skipped</p>
                    ) : (
                      <div className="space-y-2">
                        {enabledMealsArr.map((meal) => renderMealSlot(meal, i))}
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>

        {/* Sticky Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-30">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-muted-foreground">
                {activeDaysCount} days × {persons} person{persons > 1 ? "s" : ""} × ${dailyMaxTotal}/day
              </span>
              <span className="text-sm font-bold text-foreground">Total: ${weekTotal}/week</span>
            </div>
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              size="sm"
              disabled={!allComplete}
              onClick={() => setStep("summary")}
            >
              View Weekly Summary
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── STEP: Weekly Summary ── */
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setStep("customize")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-base font-bold text-foreground">Weekly Meal Summary</h2>
            <p className="text-[11px] text-muted-foreground">{planName}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-5 pb-40">
        {/* Day-by-day summary */}
        <div className="space-y-3">
          {DAYS.map((day, i) => (
            <Card key={day} className={cn("overflow-hidden", skippedDays[i] && "opacity-50")}>
              <CardContent className="p-0">
                <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b border-border">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-foreground">{day}</h4>
                    {skippedDays[i] && (
                      <Badge variant="secondary" className="text-[9px]">Skipped</Badge>
                    )}
                  </div>
                  {!skippedDays[i] && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[11px] text-primary gap-1"
                      onClick={() => setStep("customize")}
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </Button>
                  )}
                </div>
                {skippedDays[i] ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No meals — day skipped
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {enabledMealsArr.map((meal) => {
                      const s = selections[i][meal];
                      const label = meal.charAt(0).toUpperCase() + meal.slice(1);
                      return (
                        <div key={meal}>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                            {label} — ${MEAL_PRICES[meal]}
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {(["main", "side1", "side2"] as ColumnType[]).map((col) => (
                              <div key={col} className="text-[11px] text-foreground bg-muted/30 rounded px-2 py-1.5">
                                <span className="text-[9px] text-muted-foreground uppercase block mb-0.5">
                                  {col === "main" ? "Main" : col === "side1" ? "Side 1" : "Side 2"}
                                </span>
                                {s[col] ? getItemName(meal, col, s[col]!) : "—"}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Weekly Cost Breakdown */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <h4 className="text-sm font-bold text-foreground mb-3">Weekly Cost Breakdown</h4>
            <div className="space-y-2 text-sm">
              {persons > 1 && (
                <div className="flex justify-between text-muted-foreground text-xs">
                  <span>Persons</span>
                  <span>{persons}</span>
                </div>
              )}
              {enabledMealsArr.map((meal) => {
                const label = meal.charAt(0).toUpperCase() + meal.slice(1);
                const cost = weeklyBreakdown.days * MEAL_PRICES[meal] * persons;
                return (
                  <div key={meal} className="flex justify-between text-muted-foreground">
                    <span>{label} × {weeklyBreakdown.days} days{persons > 1 ? ` × ${persons}` : ""}</span>
                    <span>${cost.toLocaleString()}</span>
                  </div>
                );
              })}
              {skippedDays.some(Boolean) && (
                <div className="flex justify-between text-muted-foreground text-xs">
                  <span>Days skipped</span>
                  <span>{skippedDays.filter(Boolean).length} day(s)</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between text-foreground">
                <span>Subtotal</span>
                <span>${(weeklyBreakdown.subtotal * persons).toLocaleString()}/week</span>
              </div>
              <div className="flex justify-between text-muted-foreground text-xs">
                <span>Packing charges ({enabledMealsArr.map(m => `${m.charAt(0).toUpperCase() + m.slice(1)} $${PACKING_CHARGES[m]}`).join(", ")})</span>
                <span>${weeklyBreakdown.totalPacking.toLocaleString()}/week</span>
              </div>
              <div className="flex justify-between text-muted-foreground text-xs">
                <span>Delivery charges (approx.)</span>
                <span>${DELIVERY_CHARGE_RANGE.min}–${DELIVERY_CHARGE_RANGE.max}/day</span>
              </div>
              <div className="flex justify-between text-muted-foreground text-xs">
                <span>Taxes (Sales Tax)</span>
                <span className="italic">Calculated at checkout</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground">
                <span>Estimated Total</span>
                <span>${((weeklyBreakdown.subtotal * persons) + weeklyBreakdown.totalPacking + (DELIVERY_CHARGE_RANGE.min * activeDaysCount)).toLocaleString()}–${((weeklyBreakdown.subtotal * persons) + weeklyBreakdown.totalPacking + (DELIVERY_CHARGE_RANGE.max * activeDaysCount)).toLocaleString()}/week</span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 bg-muted/50 rounded p-2">
              Delivery charges vary based on distance (${DELIVERY_CHARGE_RANGE.min}–${DELIVERY_CHARGE_RANGE.max}/day). Final amount with exact delivery &amp; taxes at checkout.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-30">
        <div className="container mx-auto px-4 py-3 space-y-2">
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-12 text-base font-bold"
            disabled={!allComplete}
            onClick={() => {
              const dailyFoodRate = enabledMealsArr.reduce((s, m) => s + MEAL_PRICES[m], 0) * persons;
              const dailyPackingRate = enabledMealsArr.reduce((s, m) => s + PACKING_CHARGES[m], 0) * persons;
              const foodTotal = dailyFoodRate * activeDaysCount;
              const packingTotal = dailyPackingRate * activeDaysCount;
              const deliveryEstimate = { min: DELIVERY_CHARGE_RANGE.min * activeDaysCount, max: DELIVERY_CHARGE_RANGE.max * activeDaysCount };
              const summary: MealPlanSummary = {
                meals: enabledMealsArr,
                persons,
                activeDays: activeDaysCount,
                skippedDays: skippedDays.filter(Boolean).length,
                skippedWeekdays: skippedDays.map((s, i) => s ? i : -1).filter(i => i >= 0),
                foodTotal,
                packingTotal,
                deliveryEstimate,
                weeklyEstimate: { min: foodTotal + packingTotal + deliveryEstimate.min, max: foodTotal + packingTotal + deliveryEstimate.max },
                dailyFoodRate,
                dailyPackingRate,
                deliveryPerDay: { min: DELIVERY_CHARGE_RANGE.min, max: DELIVERY_CHARGE_RANGE.max },
              };
              toast({ title: "Meal Plan Confirmed! 🎉", description: "Your weekly meal plan has been saved." });
              onConfirm(summary);
            }}
          >
            Confirm My Weekly Plan
          </Button>
          <p className="text-[10px] text-muted-foreground text-center">
            Your meal plan renews weekly. You can edit it up to 24 hours before each day.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeeklyMealPlanner;
