import { Lightbulb, TrendingUp, Clock, Star, ChefHat, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const tips = [
  {
    icon: Clock,
    title: "Stay Active During Peak Hours",
    description: "Orders surge between 11:30 AM–1:30 PM and 7–9 PM. Being online during these windows can increase your daily earnings by up to 40%.",
    impact: "High Impact",
    category: "Timing",
  },
  {
    icon: Star,
    title: "Maintain 4.5+ Rating",
    description: "Partners with ratings above 4.5 get 2x more visibility in customer search results and are prioritized for subscription orders.",
    impact: "High Impact",
    category: "Quality",
  },
  {
    icon: ChefHat,
    title: "Add Weekend Specials",
    description: "Kitchens offering weekend-only dishes see 25% more orders on Saturdays and Sundays. Try adding a biryani or a festive special.",
    impact: "Medium Impact",
    category: "Menu",
  },
  {
    icon: TrendingUp,
    title: "Accept Orders Within 2 Minutes",
    description: "Fast acceptance rates improve your Scorecard Value (SCV). Partners who accept within 2 minutes earn a 5-point bonus on their CVAT score.",
    impact: "High Impact",
    category: "Performance",
  },
  {
    icon: Users,
    title: "Refer Other Chefs",
    description: "Earn up to ₹2,250 per successful referral. When your referred chef completes their first 10 orders, you earn ₹750. When they get listed, another ₹750.",
    impact: "Earnings Boost",
    category: "Referral",
  },
  {
    icon: Lightbulb,
    title: "Keep Zero Rejections",
    description: "Every rejected order impacts your SCV negatively. If you can't cook a dish, mark it as unavailable in advance rather than rejecting live orders.",
    impact: "Medium Impact",
    category: "Operations",
  },
];

const PartnerTips = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-primary" />
          Tips to Earn More
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Actionable insights to maximize your kitchen's potential
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {tips.map((tip, i) => (
          <Card key={i} className="border-border hover:shadow-md transition-shadow">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <tip.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-foreground text-sm">{tip.title}</h3>
                    <Badge variant="secondary" className="text-[10px]">{tip.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tip.description}</p>
                  <Badge variant="outline" className="mt-2 text-[10px] border-primary/30 text-primary">
                    {tip.impact}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PartnerTips;
