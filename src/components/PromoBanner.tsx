import { useState } from "react";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const PromoBanner = () => {
  const [dismissed, setDismissed] = useState(false);

  const { data: bannerPromo } = useQuery({
    queryKey: ["banner-promotion"],
    queryFn: async () => {
      const { data } = await supabase
        .from("promotions")
        .select("*")
        .eq("is_active", true)
        .eq("show_in_banner", true)
        .order("display_order", { ascending: true })
        .limit(1)
        .maybeSingle();
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (dismissed || !bannerPromo) return null;

  const displayText = bannerPromo.banner_text || bannerPromo.offer_text;

  return (
    <div className="bg-primary text-primary-foreground text-center py-2 px-4 text-sm font-medium relative">
      <span className="inline-flex items-center gap-1.5">
        {displayText}
        {bannerPromo.promo_code && !displayText.includes(bannerPromo.promo_code) && (
          <> — Use code <span className="font-bold underline underline-offset-2">{bannerPromo.promo_code}</span></>
        )}
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-primary-foreground/20 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default PromoBanner;
