import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAllPromotions, type Promotion } from "@/hooks/useScreenContent";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Save, Plus, Trash2, BadgePercent, Tag } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const verticalOptions = [
  { value: "instant_delivery", label: "Single Meal Order" },
  { value: "subscriptions", label: "Subscriptions" },
  { value: "party_orders", label: "Party Orders" },
  { value: "sweets_snacks", label: "Sweets & Snacks" },
  { value: "shero_classes", label: "Shero Classes" },
  { value: "cookery_classes", label: "Cookery Classes" },
  { value: "services", label: "Home Services" },
  { value: "global", label: "Global / All" },
];

const targetScreenOptions = [
  { value: "category_cards", label: "Category Cards (Home)" },
  { value: "listing_page", label: "Listing Page Banner" },
  { value: "checkout", label: "Checkout Page" },
  { value: "detail_page", label: "Detail Page" },
];

const AdminPromotions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: promotions, isLoading } = useAllPromotions();
  const [edits, setEdits] = useState<Record<string, Partial<Promotion>>>({});
  const [saving, setSaving] = useState(false);

  const handleEdit = (id: string, field: keyof Promotion, value: any) => {
    setEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSaveAll = async () => {
    const entries = Object.entries(edits);
    if (entries.length === 0) {
      toast({ title: "No changes to save" });
      return;
    }
    setSaving(true);
    let errorCount = 0;
    for (const [id, updates] of entries) {
      const { error } = await supabase.from("promotions").update(updates).eq("id", id);
      if (error) errorCount++;
    }
    setSaving(false);
    if (errorCount > 0) {
      toast({ title: `⚠️ ${errorCount} items failed`, variant: "destructive" });
    } else {
      toast({ title: `✅ ${entries.length} promotions saved` });
      setEdits({});
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    }
  };

  const handleAdd = async () => {
    const { error } = await supabase.from("promotions").insert({
      vertical: "instant_delivery",
      title: "New Promotion",
      offer_text: "Get a great deal!",
      offer_tag: "NEW OFFER",
      discount_value: 10,
      discount_type: "percentage",
      is_active: false,
      target_screen: "category_cards",
      display_order: (promotions || []).length + 1,
    });
    if (error) {
      toast({ title: "Failed to add", variant: "destructive" });
    } else {
      toast({ title: "✅ Promotion added (inactive)" });
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("promotions").delete().eq("id", id);
    if (!error) {
      toast({ title: "🗑️ Promotion deleted" });
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    }
  };

  const getPromo = (promo: Promotion, field: keyof Promotion) => {
    return edits[promo.id]?.[field] ?? promo[field];
  };

  const changedCount = Object.keys(edits).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <BadgePercent className="w-5 h-5 text-primary" /> Offers & Promotions
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage promotional text, discount labels, and offer banners across all verticals.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5" onClick={handleAdd}>
            <Plus className="w-3.5 h-3.5" /> Add Promotion
          </Button>
          <Button
            size="sm"
            className="text-xs h-8 gap-1.5 bg-action-accept text-action-accept-foreground hover:bg-action-accept/90"
            onClick={handleSaveAll}
            disabled={saving || changedCount === 0}
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Saving..." : `Save All${changedCount > 0 ? ` (${changedCount})` : ""}`}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {(promotions || []).map((promo) => (
            <Card key={promo.id} className="border-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">
                      {getPromo(promo, "title") as string}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {verticalOptions.find((v) => v.value === promo.vertical)?.label || promo.vertical}
                    </Badge>
                    {getPromo(promo, "is_active") ? (
                      <Badge className="text-[9px] bg-action-done/15 text-action-done border-0">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px]">Inactive</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={getPromo(promo, "is_active") as boolean}
                      onCheckedChange={(v) => handleEdit(promo.id, "is_active", v)}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive"
                      onClick={() => handleDelete(promo.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground">Title</label>
                    <Input
                      value={getPromo(promo, "title") as string}
                      onChange={(e) => handleEdit(promo.id, "title", e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground">Offer Tag (e.g. FLAT 50% OFF)</label>
                    <Input
                      value={(getPromo(promo, "offer_tag") as string) || ""}
                      onChange={(e) => handleEdit(promo.id, "offer_tag", e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground">Discount Value</label>
                    <Input
                      type="number"
                      value={getPromo(promo, "discount_value") as number}
                      onChange={(e) => handleEdit(promo.id, "discount_value", Number(e.target.value))}
                      className="h-8 text-xs"
                      min={0}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground">Vertical</label>
                    <Select
                      value={getPromo(promo, "vertical") as string}
                      onValueChange={(v) => handleEdit(promo.id, "vertical", v)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {verticalOptions.map((v) => (
                          <SelectItem key={v.value} value={v.value} className="text-xs">
                            {v.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground">Offer Description</label>
                    <Input
                      value={getPromo(promo, "offer_text") as string}
                      onChange={(e) => handleEdit(promo.id, "offer_text", e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground">Target Screen</label>
                    <Select
                      value={(getPromo(promo, "target_screen") as string) || "category_cards"}
                      onValueChange={(v) => handleEdit(promo.id, "target_screen", v)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {targetScreenOptions.map((v) => (
                          <SelectItem key={v.value} value={v.value} className="text-xs">
                            {v.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground">Display Order</label>
                    <Input
                      type="number"
                      value={getPromo(promo, "display_order") as number}
                      onChange={(e) => handleEdit(promo.id, "display_order", Number(e.target.value))}
                      className="h-8 text-xs"
                      min={0}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPromotions;
