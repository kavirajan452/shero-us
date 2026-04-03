import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { standardMealPlans } from "@/data/subscriptionPlansData";
import { Plus, Edit, Star, Users, Clock, Utensils } from "lucide-react";

const AdminSubPlans = () => {
  const { toast } = useToast();
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanCuisine, setNewPlanCuisine] = useState("");
  const [newPlanIsVeg, setNewPlanIsVeg] = useState(true);
  const [newPlanPrice, setNewPlanPrice] = useState("");
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  const handleAddPlan = () => {
    if (!newPlanName || !newPlanCuisine || !newPlanPrice) { toast({ title: "Missing fields", variant: "destructive" }); return; }
    toast({ title: "✅ Meal Plan Created", description: `${newPlanName} — $${newPlanPrice}/day` });
    setShowAddPlan(false); setNewPlanName(""); setNewPlanCuisine(""); setNewPlanPrice("");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Meal Plans</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage weekly meal plan templates</p>
        </div>
        <Dialog open={showAddPlan} onOpenChange={setShowAddPlan}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs h-8 gap-1.5 bg-action-accept text-action-accept-foreground hover:bg-action-accept/90">
              <Plus className="w-3.5 h-3.5" /> New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="text-sm">Create New Meal Plan</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-foreground">Plan Name</label><Input value={newPlanName} onChange={e => setNewPlanName(e.target.value)} placeholder="e.g., Tamil Nadu Veg Thali" className="h-9 text-xs mt-1" /></div>
              <div><label className="text-xs font-medium text-foreground">Cuisine</label><Input value={newPlanCuisine} onChange={e => setNewPlanCuisine(e.target.value)} placeholder="e.g., Tamil Nadu" className="h-9 text-xs mt-1" /></div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-foreground">Type:</label>
                <button onClick={() => setNewPlanIsVeg(true)} className={`text-xs px-3 py-1.5 rounded-full transition-all ${newPlanIsVeg ? "bg-action-done/15 text-action-done font-bold ring-1 ring-action-done/30" : "bg-muted text-muted-foreground"}`}>🥬 Veg</button>
                <button onClick={() => setNewPlanIsVeg(false)} className={`text-xs px-3 py-1.5 rounded-full transition-all ${!newPlanIsVeg ? "bg-destructive/10 text-destructive font-bold ring-1 ring-destructive/30" : "bg-muted text-muted-foreground"}`}>🍗 Non-Veg</button>
              </div>
              <div><label className="text-xs font-medium text-foreground">Price per Day ($)</label><Input value={newPlanPrice} onChange={e => setNewPlanPrice(e.target.value)} placeholder="e.g., 150" type="number" className="h-9 text-xs mt-1" /></div>
              <Button className="w-full text-xs h-9 bg-action-accept text-action-accept-foreground hover:bg-action-accept/90" onClick={handleAddPlan}>Create Meal Plan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border">
          <CardContent className="p-3 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Utensils className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{standardMealPlans.length}</p>
              <p className="text-[10px] text-muted-foreground">Active Plans</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-action-done/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-action-done" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{standardMealPlans.reduce((s, p) => s + p.subscribers, 0)}</p>
              <p className="text-[10px] text-muted-foreground">Total Subscribers</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-action-cook/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-action-cook" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{standardMealPlans.reduce((s, p) => s + p.slots.length, 0)}</p>
              <p className="text-[10px] text-muted-foreground">Meal Slots</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan cards */}
      {standardMealPlans.map(plan => {
        const isExpanded = expandedPlan === plan.id;
        return (
          <Card key={plan.id} className="border-border hover:shadow-sm transition-all">
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xl">{plan.emoji}</span>
                    <h3 className="text-sm font-bold text-foreground">{plan.name}</h3>
                    <Badge className={`text-[10px] border-0 ${plan.isVeg ? "bg-action-done/15 text-action-done" : "bg-destructive/10 text-destructive"}`}>
                      {plan.isVeg ? "🥬 Veg" : "🍗 Non-Veg"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-sm font-bold text-primary">${plan.pricePerDay}/day</span>
                    <span className="text-[11px] text-muted-foreground">·</span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                      <Users className="w-3 h-3" /> {plan.subscribers} subscribers
                    </span>
                    <span className="text-[11px] text-muted-foreground">·</span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-yellow-500" /> {plan.rating}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-8 gap-1 text-muted-foreground"
                  onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                >
                  {isExpanded ? "Collapse" : "View Menu"}
                </Button>
              </div>

              {/* Slot chips */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {plan.slots.map(s => (
                  <Badge key={s} variant="outline" className="text-[10px] px-2.5 py-0.5">
                    {s === "breakfast" ? "🌅" : s === "lunch" ? "☀️" : "🌙"} {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Badge>
                ))}
                <Badge variant="outline" className="text-[10px] px-2.5 py-0.5">{plan.cuisine}</Badge>
              </div>

              {/* Expanded weekly menu */}
              {isExpanded && (
                <div className="mt-4 space-y-2">
                  {plan.weeklyMenu.map(day => (
                    <div key={day.day} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                      <span className="text-xs font-bold text-foreground w-10 shrink-0 pt-0.5">{day.day.slice(0, 3)}</span>
                      <div className="flex-1 flex flex-wrap gap-1.5">
                        {day.meals.map((meal, idx) => (
                          <div key={idx} className="bg-secondary/50 rounded-md px-2.5 py-1">
                            <span className="text-[9px] font-semibold text-muted-foreground uppercase">{meal.slot}</span>
                            <p className="text-[11px] text-foreground">{meal.items.join(", ")}</p>
                          </div>
                        ))}
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 shrink-0">
                        <Edit className="w-3 h-3 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AdminSubPlans;
