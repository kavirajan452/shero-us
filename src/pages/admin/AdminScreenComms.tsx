import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAllScreenContent, type ScreenContent } from "@/hooks/useScreenContent";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Save, Search, Monitor, FileText, ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const screenLabels: Record<string, string> = {
  hero: "🏠 Hero Section",
  categories: "📂 Category Cards",
  trending: "🔥 Trending Dishes",
  subscription_cta: "🗓️ Subscription CTA",
  chefs: "👩‍🍳 Top Chefs",
  why: "💡 Why Choose Us",
  footer: "📋 Footer",
  service_categories: "🛒 Service Categories",
};

const AdminScreenComms = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: allContent, isLoading } = useAllScreenContent();
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Group by screen_key
  const grouped: Record<string, ScreenContent[]> = {};
  (allContent || []).forEach((item) => {
    if (!grouped[item.screen_key]) grouped[item.screen_key] = [];
    grouped[item.screen_key].push(item);
  });

  const filteredKeys = Object.keys(grouped).filter((key) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return key.includes(s) || grouped[key].some((i) => i.content_key.includes(s) || i.content_value.toLowerCase().includes(s) || (i.description || "").toLowerCase().includes(s));
  });

  const handleEdit = (id: string, value: string) => {
    setEdits((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveAll = async () => {
    const entries = Object.entries(edits);
    if (entries.length === 0) {
      toast({ title: "No changes to save" });
      return;
    }
    setSaving(true);
    let errorCount = 0;
    for (const [id, value] of entries) {
      const { error } = await supabase
        .from("screen_content")
        .update({ content_value: value })
        .eq("id", id);
      if (error) errorCount++;
    }
    setSaving(false);
    if (errorCount > 0) {
      toast({ title: `⚠️ ${errorCount} items failed to save`, variant: "destructive" });
    } else {
      toast({ title: `✅ ${entries.length} items saved successfully` });
      setEdits({});
      queryClient.invalidateQueries({ queryKey: ["screen_content"] });
    }
  };

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const changedCount = Object.keys(edits).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary" /> Screen Communications
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Edit all text displayed across customer screens. Changes go live instantly.
          </p>
        </div>
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by screen, key, or content..."
          className="pl-9 h-9 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredKeys.map((screenKey) => {
            const items = grouped[screenKey];
            const isOpen = openSections[screenKey] !== false; // default open
            const label = screenLabels[screenKey] || screenKey;

            return (
              <Collapsible key={screenKey} open={isOpen} onOpenChange={() => toggleSection(screenKey)}>
                <Card className="border-border">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/30 transition-colors rounded-t-xl">
                      <div className="flex items-center gap-2">
                        {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                        <h3 className="text-sm font-bold text-foreground">{label}</h3>
                        <Badge variant="outline" className="text-[10px]">
                          {items.length} fields
                        </Badge>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-4 px-4 space-y-3">
                      {items.map((item) => {
                        const currentValue = edits[item.id] ?? item.content_value;
                        const isChanged = edits[item.id] !== undefined && edits[item.id] !== item.content_value;
                        const isLong = item.content_value.length > 80;

                        return (
                          <div key={item.id} className="space-y-1">
                            <div className="flex items-center gap-2">
                              <label className="text-[11px] font-medium text-muted-foreground">
                                {item.content_key.replace(/_/g, " ")}
                              </label>
                              {item.description && (
                                <span className="text-[9px] text-muted-foreground/60 italic">{item.description}</span>
                              )}
                              {isChanged && (
                                <Badge className="text-[8px] bg-primary/10 text-primary border-0">changed</Badge>
                              )}
                            </div>
                            {isLong ? (
                              <Textarea
                                value={currentValue}
                                onChange={(e) => handleEdit(item.id, e.target.value)}
                                className="text-sm min-h-[60px]"
                                rows={2}
                              />
                            ) : (
                              <Input
                                value={currentValue}
                                onChange={(e) => handleEdit(item.id, e.target.value)}
                                className="h-9 text-sm"
                              />
                            )}
                          </div>
                        );
                      })}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminScreenComms;
