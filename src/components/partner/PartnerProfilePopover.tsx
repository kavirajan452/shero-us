import { User, Award, ShieldCheck, Clock, ChefHat } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const fdaData = {
  licenseNo: "11521099000234",
  appliedDate: "2024-06-15",
  receivedDate: "2024-07-20",
  validUpto: "2029-07-19",
};

const kitchenBrands = [
  { brand: "Shero Home Kitchen", startDate: "2023-03-10" },
  { brand: "Shero Swiggy Cloud", startDate: "2024-01-05" },
  { brand: "Shero Zomato Express", startDate: "2024-08-22" },
];

const sheroBadges = [
  { label: "Top Rated Chef", icon: "⭐", color: "bg-amber-100 text-amber-800 border-amber-300" },
  { label: "100 Orders Club", icon: "🎯", color: "bg-blue-100 text-blue-800 border-blue-300" },
  { label: "Zero Cancellation", icon: "✅", color: "bg-green-100 text-green-800 border-green-300" },
  { label: "Hygiene Champion", icon: "🧼", color: "bg-purple-100 text-purple-800 border-purple-300" },
];

function getAge(startDate: string) {
  const start = new Date(startDate);
  const now = new Date();
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years > 0) return `${years}y ${rem}m`;
  return `${rem}m`;
}

const PartnerProfilePopover = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full border border-border hover:bg-accent">
          <User className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">Chef Lakshmi</p>
              <p className="text-xs text-muted-foreground">Partner ID: SHP-0042</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* FDA Certificate */}
        <div className="p-4 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">FDA Certificate</h4>
          </div>
          <div className="grid grid-cols-2 gap-y-1.5 text-xs">
            <span className="text-muted-foreground">License No</span>
            <span className="font-medium text-foreground">{fdaData.licenseNo}</span>
            <span className="text-muted-foreground">Applied</span>
            <span className="text-foreground">{new Date(fdaData.appliedDate).toLocaleDateString()}</span>
            <span className="text-muted-foreground">Received</span>
            <span className="text-foreground">{new Date(fdaData.receivedDate).toLocaleDateString()}</span>
            <span className="text-muted-foreground">Valid Upto</span>
            <span className="text-foreground">{new Date(fdaData.validUpto).toLocaleDateString()}</span>
          </div>
        </div>

        <Separator />

        {/* Kitchen Age per Brand */}
        <div className="p-4 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-primary" />
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">Kitchen Age</h4>
          </div>
          <div className="space-y-1.5">
            {kitchenBrands.map((k) => (
              <div key={k.brand} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{k.brand}</span>
                <Badge variant="secondary" className="text-[10px] px-2 py-0">{getAge(k.startDate)}</Badge>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Shero Badges */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">Shero Badges</h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sheroBadges.map((b) => (
              <span key={b.label} className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border ${b.color}`}>
                <span>{b.icon}</span> {b.label}
              </span>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PartnerProfilePopover;
