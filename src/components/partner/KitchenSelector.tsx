import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

// Mock kitchens — in production, fetch from partner's linked kitchens
const partnerKitchens = [
  { id: "all", name: "All Kitchens" },
  { id: "k-shf-chettinad", name: "Shero Home Food – Chettinad" },
  { id: "k-shf-andhra", name: "Shero Home Food – Andhra" },
  { id: "k-hcf-priya", name: "Priya's Home Kitchen" },
  { id: "k-shf-kerala", name: "Shero Home Food – Kerala" },
];

interface KitchenSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const KitchenSelector = ({ value, onChange }: KitchenSelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 text-xs w-full max-w-[260px] bg-background">
          <SelectValue placeholder="Select Kitchen" />
        </SelectTrigger>
        <SelectContent>
          {partnerKitchens.map((k) => (
            <SelectItem key={k.id} value={k.id} className="text-xs">
              {k.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default KitchenSelector;
