import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Building2, Receipt, Landmark, Save, Loader2 } from "lucide-react";

interface InvoiceSettings {
  companyName: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  ein: string;
  hsnSacCode: string;
  defaultTaxRate: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  invoicePrefix: string;
  termsAndConditions: string;
  logoUrl: string;
  supportEmail: string;
  supportPhone: string;
}

const defaultSettings: InvoiceSettings = {
  companyName: "Shero Home Food Pvt Ltd",
  address: "",
  city: "New York",
  state: "New York",
  zipcode: "",
  country: "USA",
  ein: "",
  hsnSacCode: "996331",
  defaultTaxRate: "5",
  bankName: "",
  accountNumber: "",
  ifsc: "",
  invoicePrefix: "SHERO",
  termsAndConditions: "1. This is a computer-generated invoice.\n2. All disputes subject to New York jurisdiction.\n3. E&OE (Errors and Omissions Excepted).",
  logoUrl: "",
  supportEmail: "",
  supportPhone: "",
};

const AdminInvoiceSettings = () => {
  const [settings, setSettings] = useState<InvoiceSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from("app_config")
        .select("value")
        .eq("key", "invoice_settings")
        .maybeSingle();
      if (data?.value && typeof data.value === "object") {
        setSettings({ ...defaultSettings, ...(data.value as Record<string, string>) });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Try update first, then insert
      const { data: existing } = await supabase.from("app_config").select("key").eq("key", "invoice_settings").maybeSingle();
      let error;
      if (existing) {
        ({ error } = await supabase.from("app_config").update({ value: JSON.parse(JSON.stringify(settings)), updated_at: new Date().toISOString() }).eq("key", "invoice_settings"));
      } else {
        ({ error } = await supabase.from("app_config").insert([{ key: "invoice_settings", value: JSON.parse(JSON.stringify(settings)) }]));
      }
      if (error) throw error;
      toast({ title: "✅ Settings Saved", description: "Invoice configuration updated successfully." });
    } catch (e: any) {
      toast({ title: "❌ Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof InvoiceSettings, value: string) => setSettings(prev => ({ ...prev, [key]: value }));

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><FileText className="w-6 h-6 text-primary" /> Invoice Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure company details, tax rates, and invoice template for all verticals</p>
        </div>
        <Button onClick={saveSettings} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Settings
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Company Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" /> Company Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div><Label className="text-xs">Company Name</Label><Input value={settings.companyName} onChange={e => update("companyName", e.target.value)} /></div>
            <div><Label className="text-xs">Registered Address</Label><Textarea value={settings.address} onChange={e => update("address", e.target.value)} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">City</Label><Input value={settings.city} onChange={e => update("city", e.target.value)} /></div>
              <div><Label className="text-xs">State</Label><Input value={settings.state} onChange={e => update("state", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">ZIP Code</Label><Input value={settings.zipcode} onChange={e => update("zipcode", e.target.value)} /></div>
              <div><Label className="text-xs">Country</Label><Input value={settings.country} onChange={e => update("country", e.target.value)} /></div>
            </div>
            <div><Label className="text-xs">Logo URL</Label><Input value={settings.logoUrl} onChange={e => update("logoUrl", e.target.value)} placeholder="https://..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Support Email</Label><Input value={settings.supportEmail} onChange={e => update("supportEmail", e.target.value)} /></div>
              <div><Label className="text-xs">Support Phone</Label><Input value={settings.supportPhone} onChange={e => update("supportPhone", e.target.value)} /></div>
            </div>
          </CardContent>
        </Card>

        {/* Tax Configuration */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Receipt className="w-4 h-4 text-primary" /> Tax Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div><Label className="text-xs">EIN Number</Label><Input value={settings.ein} onChange={e => update("ein", e.target.value)} placeholder="22AAAAA0000A1Z5" /></div>
            <div><Label className="text-xs">HSN / SAC Code</Label><Input value={settings.hsnSacCode} onChange={e => update("hsnSacCode", e.target.value)} placeholder="996331" /></div>
            <div>
              <Label className="text-xs">Default Sales Tax Rate (%)</Label>
              <Input type="number" value={settings.defaultTaxRate} onChange={e => update("defaultTaxRate", e.target.value)} />
              <p className="text-[10px] text-muted-foreground mt-1">Split as CSales Tax + SSales Tax (intra-state) or ISales Tax (inter-state)</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 border border-border text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">ℹ️ Tax Calculation</p>
              <p>• Sales Tax is applied on (subtotal + packing + delivery - discount)</p>
              <p>• For intra-state: CSales Tax {parseFloat(settings.defaultTaxRate) / 2}% + SSales Tax {parseFloat(settings.defaultTaxRate) / 2}%</p>
              <p>• For inter-state: ISales Tax {settings.defaultTaxRate}%</p>
            </div>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Landmark className="w-4 h-4 text-primary" /> Bank Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div><Label className="text-xs">Bank Name</Label><Input value={settings.bankName} onChange={e => update("bankName", e.target.value)} /></div>
            <div><Label className="text-xs">Account Number</Label><Input value={settings.accountNumber} onChange={e => update("accountNumber", e.target.value)} /></div>
            <div><Label className="text-xs">IFSC Code</Label><Input value={settings.ifsc} onChange={e => update("ifsc", e.target.value)} /></div>
          </CardContent>
        </Card>

        {/* Invoice Template */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Invoice Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Invoice Number Prefix</Label>
              <Input value={settings.invoicePrefix} onChange={e => update("invoicePrefix", e.target.value)} />
              <p className="text-[10px] text-muted-foreground mt-1">
                Preview: <Badge variant="outline" className="text-[10px]">{settings.invoicePrefix}/2526/000001</Badge>
              </p>
            </div>
            <div>
              <Label className="text-xs">Terms & Conditions</Label>
              <Textarea value={settings.termsAndConditions} onChange={e => update("termsAndConditions", e.target.value)} rows={5} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cross-Vertical Mapping */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Invoice Trigger Mapping</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Vertical</th>
                  <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Trigger Event</th>
                  <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { v: "Instant Orders", trigger: "Status → Delivered", status: "active" },
                  { v: "Party Orders (Bulk)", trigger: "Partner marks Food Ready", status: "active" },
                  { v: "Party Orders (Combo)", trigger: "Partner marks Food Ready", status: "active" },
                  { v: "Subscriptions", trigger: "Daily delivery marked", status: "active" },
                  { v: "Home Services", trigger: "Booking completed", status: "active" },
                  { v: "Sweets & Snacks", trigger: "Status → Delivered", status: "coming_soon" },
                  { v: "Cookery Classes", trigger: "Attendance marked", status: "coming_soon" },
                  { v: "Shero Classes", trigger: "Class completed", status: "coming_soon" },
                ].map(row => (
                  <tr key={row.v} className="border-b border-border/50">
                    <td className="py-2 px-3 font-medium text-foreground">{row.v}</td>
                    <td className="py-2 px-3 text-muted-foreground">{row.trigger}</td>
                    <td className="py-2 px-3">
                      <Badge variant={row.status === "active" ? "default" : "secondary"} className="text-[10px]">
                        {row.status === "active" ? "✅ Active" : "🔒 Coming Soon"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInvoiceSettings;
