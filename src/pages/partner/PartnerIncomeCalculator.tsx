import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IndianRupee, TrendingUp, Sparkles, Star, ChefHat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AVG_EARNING_PER_ORDER = 200;
const ORDERS_PER_SESSION = 5;
const HOURS_PER_SESSION = 4;
const MONTHS_PER_YEAR = 12;

const getSessionInfo = (ordersPerDay: number) => {
  if (ordersPerDay <= ORDERS_PER_SESSION)
    return { sessions: 1, label: "Lunch only", hours: HOURS_PER_SESSION };
  if (ordersPerDay <= ORDERS_PER_SESSION * 2)
    return { sessions: 2, label: "Lunch + Dinner", hours: HOURS_PER_SESSION * 2 };
  return { sessions: 3, label: "BF + Lunch + Dinner", hours: HOURS_PER_SESSION * 3 };
};

const getDaysPerWeek = (ordersPerDay: number) => {
  if (ordersPerDay <= 3) return 4;
  if (ordersPerDay <= 5) return 5;
  return 6;
};

const getMonthlyDays = (daysPerWeek: number) => daysPerWeek * 4.33;

const quotes = [
  "Every order is a step towards your dream! 💪",
  "You're feeding families AND building your future! 🌟",
  "Your kitchen is your empire! 👑",
  "Small steps, big earnings! Keep going! 🚀",
  "You're not just cooking — you're inspiring! ❤️",
];

const PartnerIncomeCalculator = () => {
  const [inputValue, setInputValue] = useState<string>("");
  const [showResult, setShowResult] = useState(false);

  const value = parseInt(inputValue) || 0;

  const cDays = getDaysPerWeek(value);
  const cMonthlyDays = getMonthlyDays(cDays);
  const cDaily = value * AVG_EARNING_PER_ORDER;
  const cWeekly = cDaily * cDays;
  const cMonthly = Math.round(cDaily * cMonthlyDays);
  const cYearly = cMonthly * MONTHS_PER_YEAR;
  const cSession = getSessionInfo(value);
  const show3rdHint = value > 10;

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const randomQuote = quotes[value % quotes.length];

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
          <IndianRupee className="h-5 w-5 text-primary" />
          How Much You Can Earn
        </h1>
        <p className="text-muted-foreground text-xs">Plan your kitchen earnings realistically 🚀</p>
      </div>

      {/* ── Input ── */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <ChefHat className="w-3.5 h-3.5 text-primary" />
              How many orders can you do a day?
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number" min="1" max="100" placeholder="e.g. 10"
                value={inputValue}
                onChange={(e) => { setInputValue(e.target.value); setShowResult(false); }}
                className="w-28 text-center text-lg font-bold h-11 border-primary/30"
              />
              <span className="text-[10px] text-muted-foreground">orders/day</span>
            </div>
          </div>

          <Button onClick={() => value > 0 && setShowResult(true)} disabled={value <= 0} className="w-full text-sm h-10">
            <Sparkles className="mr-1.5 h-4 w-4" /> Calculate!
          </Button>
        </CardContent>
      </Card>

      {/* ── Results ── */}
      <AnimatePresence mode="wait">
        {showResult && value > 0 && (
          <motion.div
            key={value}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, type: "spring" }}
            className="space-y-3"
          >
            <Card className="border-border bg-card border-l-4 border-l-emerald-500">
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                  With {value} orders/day, you can earn:
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {[
                    { label: "Daily", val: cDaily, icon: "☀️", sub: `${value} × ${fmt(AVG_EARNING_PER_ORDER)}` },
                    { label: "Weekly", val: cWeekly, icon: "📅", sub: `${cDays} days/week` },
                    { label: "Monthly", val: cMonthly, icon: "🗓️", sub: `~${Math.round(cMonthlyDays)} working days` },
                    { label: "Yearly", val: cYearly, icon: "🎯", sub: "12 months" },
                  ].map((item, i) => (
                    <motion.div key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                      <div className="bg-muted/40 rounded-lg p-2 border border-border text-center">
                        <span className="text-base">{item.icon}</span>
                        <p className="text-[9px] text-muted-foreground">{item.label}</p>
                        <p className="text-base font-bold text-foreground">{fmt(item.val)}</p>
                        <p className="text-[8px] text-muted-foreground">{item.sub}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Kitchen commitment */}
                <div className="mt-2 bg-muted/30 rounded-lg p-2 border border-border">
                  <p className="text-[10px] font-semibold text-foreground mb-1">Kitchen Commitment:</p>
                  <div className="flex items-center justify-around text-center">
                    <div><p className="text-sm font-bold text-foreground">{cSession.hours}h</p><p className="text-[8px] text-muted-foreground">per day</p></div>
                    <div className="w-px h-6 bg-border" />
                    <div><p className="text-sm font-bold text-foreground">{cSession.sessions} sessions</p><p className="text-[8px] text-muted-foreground">{cSession.label}</p></div>
                    <div className="w-px h-6 bg-border" />
                    <div><p className="text-sm font-bold text-foreground">{cDays} days</p><p className="text-[8px] text-muted-foreground">per week</p></div>
                  </div>
                </div>

                {/* 3rd session suggestion */}
                {show3rdHint && cSession.sessions >= 3 && (
                  <div className="mt-2 bg-card rounded-lg p-2 border border-border border-l-4 border-l-amber-500 text-center">
                    <p className="text-[10px] font-semibold text-foreground">💡 Suggestion</p>
                    <p className="text-[9px] text-muted-foreground">
                      With {value} orders/day (beyond L:5 + D:5), opening a <strong>3rd session (Breakfast)</strong> is recommended for smooth operations.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Push harder */}
            <Card>
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="text-xs flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" /> What if you push harder?
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="space-y-1">
                  {[value, value + 3, value + 6].map((o, i) => {
                    const d = getDaysPerWeek(o);
                    const mo = Math.round(o * AVG_EARNING_PER_ORDER * getMonthlyDays(d));
                    return (
                      <div key={o} className={`flex justify-between items-center p-1.5 rounded-md text-[11px] ${i === 0 ? "bg-muted/50" : i === 1 ? "bg-primary/5 border border-primary/20" : "bg-primary/10 border border-primary/30"}`}>
                        <span className="text-muted-foreground">{o} orders/day {i === 0 && "(current)"}</span>
                        <span className="font-bold text-foreground">{fmt(mo)}/mo</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quote */}
            <Card className="bg-gradient-to-r from-accent/20 to-primary/10 border-accent/30">
              <CardContent className="p-3 text-center">
                <Star className="h-4 w-4 text-primary mx-auto mb-0.5" />
                <p className="text-[11px] font-medium text-foreground italic">"{randomQuote}"</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartnerIncomeCalculator;
