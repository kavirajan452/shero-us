import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { subscriptionDurations, type SubscriptionDuration } from "@/data/subscriptionPlansData";
import { BadgePercent, Truck, Save, Percent, Users, Calendar } from "lucide-react";

interface DiscountConfig { duration: SubscriptionDuration; label: string; discountPct: number; deliveryFeePerDay: number; minPersons: number; maxPersons: number; }

const defaultDiscounts: DiscountConfig[] = [
  { duration: "trial", label: "3-Day Trial", discountPct: 0, deliveryFeePerDay: 30, minPersons: 1, maxPersons: 4 },
  { duration: "weekly", label: "Weekly Plan", discountPct: 5, deliveryFeePerDay: 30, minPersons: 1, maxPersons: 6 },
  { duration: "monthly", label: "Monthly Plan", discountPct: 15, deliveryFeePerDay: 30, minPersons: 1, maxPersons: 10 },
];

const durationColors: Record<SubscriptionDuration, string> = {
  trial: "border-l-action-cook",
  weekly: "border-l-action-pack",
  monthly: "border-l-action-dispatch",
};

const AdminSubDiscounts = () => {
  const { toast } = useToast();
  const [discounts, setDiscounts] = useState<DiscountConfig[]>(defaultDiscounts);

  const handleUpdate = (dur: SubscriptionDuration, field: keyof DiscountConfig, value: number) => {
    setDiscounts(prev => prev.map(d => d.duration === dur ? { ...d, [field]: value } : d));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <BadgePercent className="w-5 h-5 text-primary" /> Discounts & Delivery Fees
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Configure pricing tiers per subscription duration</p>
        </div>
        <Button size="sm" className="text-xs h-8 gap-1.5 bg-action-accept text-action-accept-foreground hover:bg-action-accept/90" onClick={() => toast({ title: "✅ Discount config saved" })}>
          <Save className="w-3.5 h-3.5" /> Save All
        </Button>
      </div>

      <div className="space-y-4">
        {discounts.map(d => {
          const durData = subscriptionDurations.find(x => x.duration === d.duration);
          const totalDelivery = d.deliveryFeePerDay * (durData?.days || 0);

          return (
            <Card key={d.duration} className={`border-border border-l-4 ${durationColors[d.duration]}`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-foreground">{d.label}</h4>
                    <Badge variant="outline" className="text-[10px]">
                      <Calendar className="w-2.5 h-2.5 mr-0.5" /> {durData?.days || 0} days
                    </Badge>
                  </div>
                  {d.discountPct > 0 && (
                    <Badge className="text-xs bg-action-done/15 text-action-done border-0 font-bold">
                      {d.discountPct}% OFF
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                      <Percent className="w-2.5 h-2.5" /> Discount %
                    </label>
                    <Input type="number" value={d.discountPct} onChange={e => handleUpdate(d.duration, "discountPct", Number(e.target.value))} className="h-9 text-sm font-medium" min={0} max={50} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                      <Truck className="w-2.5 h-2.5" /> Delivery ₹/day
                    </label>
                    <Input type="number" value={d.deliveryFeePerDay} onChange={e => handleUpdate(d.duration, "deliveryFeePerDay", Number(e.target.value))} className="h-9 text-sm font-medium" min={0} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                      <Users className="w-2.5 h-2.5" /> Min Persons
                    </label>
                    <Input type="number" value={d.minPersons} onChange={e => handleUpdate(d.duration, "minPersons", Number(e.target.value))} className="h-9 text-sm font-medium" min={1} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                      <Users className="w-2.5 h-2.5" /> Max Persons
                    </label>
                    <Input type="number" value={d.maxPersons} onChange={e => handleUpdate(d.duration, "maxPersons", Number(e.target.value))} className="h-9 text-sm font-medium" min={1} />
                  </div>
                </div>

                <div className="bg-secondary/40 rounded-md px-3 py-2 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Total delivery fee for plan</span>
                  <span className="text-sm font-bold text-foreground">
                    ₹{d.deliveryFeePerDay}/day × {durData?.days || 0} days = <span className="text-primary">₹{totalDelivery}</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminSubDiscounts;
