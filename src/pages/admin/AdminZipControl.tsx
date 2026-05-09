import { useMemo, useState } from "react";
import { MapPin, Save, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAppConfig } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

function normalizeZipConfig(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((zip) => String(zip).trim()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((zip) => zip.trim()).filter(Boolean);
  if (value && typeof value === "object" && "zips" in value && Array.isArray((value as { zips?: unknown[] }).zips)) {
    return ((value as { zips?: unknown[] }).zips ?? []).map((zip) => String(zip).trim()).filter(Boolean);
  }
  return [];
}

export default function AdminZipControl() {
  const { toast } = useToast();
  const { data: zipConfig, refetch, isLoading } = useAppConfig("serviceable_zip_codes");
  const [saving, setSaving] = useState(false);
  const normalizedZips = useMemo(() => normalizeZipConfig(zipConfig), [zipConfig]);
  const [input, setInput] = useState("");

  const currentZips = useMemo(() => {
    const source = input.trim() ? input : normalizedZips.join(", ");
    return source
      .split(/[,\n]/)
      .map((zip) => zip.trim())
      .filter(Boolean)
      .filter((zip, index, arr) => arr.indexOf(zip) === index);
  }, [input, normalizedZips]);

  const invalidZips = currentZips.filter((zip) => !/^\d{5}$/.test(zip));

  const handleReset = () => {
    setInput(normalizedZips.join(", "));
  };

  const handleSave = async () => {
    if (invalidZips.length > 0) {
      toast({
        title: "Invalid ZIP codes",
        description: `Fix these ZIP codes first: ${invalidZips.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("app_config")
      .upsert({ key: "serviceable_zip_codes", value: currentZips, updated_at: new Date().toISOString() }, { onConflict: "key" });
    setSaving(false);

    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }

    await refetch();
    setInput(currentZips.join(", "));
    toast({ title: "ZIP codes saved", description: `${currentZips.length} ZIP codes are now configured.` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MapPin className="w-6 h-6 text-primary" /> ZIP Control
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage homepage ZIP validation and serviceable delivery ZIP codes.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Serviceable ZIP codes</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving || currentZips.length === 0} className="gap-1.5">
              <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Enter 5-digit ZIP codes separated by commas or new lines. If no ZIPs are configured, homepage ZIP validation falls back to kitchen pincode data.
          </p>
          <Textarea
            value={input || normalizedZips.join(", ")}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            placeholder="10001, 10002, 07030"
            className="text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{isLoading ? "Loading..." : `${currentZips.length} ZIP codes`}</Badge>
            {invalidZips.length > 0 && <Badge variant="destructive">{invalidZips.length} invalid</Badge>}
          </div>
          {currentZips.length > 0 && (
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs font-medium text-foreground mb-2">Preview</p>
              <div className="flex flex-wrap gap-2">
                {currentZips.map((zip) => (
                  <Badge key={zip} variant={/^\d{5}$/.test(zip) ? "outline" : "destructive"}>
                    {zip}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
