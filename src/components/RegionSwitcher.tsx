import { useRegion, type RegionCode } from "@/contexts/RegionContext";
import { Globe } from "lucide-react";

const RegionSwitcher = () => {
  const { regionCode, setRegion } = useRegion();

  const toggle = () => {
    setRegion(regionCode === "IN" ? "US" : "IN");
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-sm font-medium text-foreground transition-colors"
      title="Switch region"
    >
      <Globe className="w-3.5 h-3.5 text-muted-foreground" />
      <span>{regionCode === "IN" ? "🇮🇳 IN" : "🇺🇸 US"}</span>
    </button>
  );
};

export default RegionSwitcher;
