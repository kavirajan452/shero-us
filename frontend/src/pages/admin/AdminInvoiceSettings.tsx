import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Building2, Receipt, Landmark, Save, Loader2, Truck, Heart } from "lucide-react";

interface InvoiceSettings {
  companyName: string;
  companyType: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  ein: string;
  hsnSacCode: string;
  defaultTaxRate: string;
  federalTaxRate: string;
  stateTaxRate: string;
  localTaxRate: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  invoicePrefix: string;
  termsAndConditions: string;
  logoUrl: string;
  supportEmail: string;
  supportPhone: string;
  deliveryFee: string;
  tipsEnabled: string;
  tipPresets: string;
}

const defaultSettings: InvoiceSettings = {
  companyName: "Shero USA INC",
  companyType: "Delaware C-Corporation",
  address: "6639 Cambriya Terrace",
  city: "Elkridge",
  state: "Maryland",
  zipcode: "21075",
  country: "USA",
  ein: "XX-XXXXXXX",
  hsnSacCode: "",
  defaultTaxRate: "8.25",
  federalTaxRate: "0",
  stateTaxRate: "6",
  localTaxRate: "2.25",
  bankName: "",
  accountNumber: "",
  routingNumber: "",
  invoicePrefix: "SHERO-US",
  termsAndConditions: "1. This is a computer-generated invoice.\n2. All disputes subject to Delaware jurisdiction.\n3. E&OE (Errors and Omissions Excepted).\n4. Shero USA INC is a Delaware C-Corporation.",
  logoUrl: "",
  supportEmail: "support@sherousainc.com",
  supportPhone: "+1 (410) 000-0000",
  deliveryFee: "30",
  tipsEnabled: "true",
  tipPresets: "[5, 10, 15, 20]",
};

const AdminInvoiceSettings = () => {
  const [settings, setSettings] = useState<InvoiceSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadSettings(); }, []);

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

  const totalTax = (parseFloat(settings.federalTaxRate) || 0) + (parseFloat(settings.stateTaxRate) || 0) + (parseFloat(settings.localTaxRate) || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><FileText className="w-6 h-6 text-primary" /> Invoice Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure Shero USA INC company details, tax structure, delivery fees, and invoicing</p>
        </div>
        <Button onClick={saveSettings} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Settings
        </Button>
      </div>

      {/* Buy-Sell Model Info */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-4 pb-3">
          <p className="text-sm font-semibold text-foreground mb-1">📦 Buy-Sell Invoicing Model</p>
          <p className="text-xs text-muted-foreground">Shero buys food from Kitchen Partners at <strong>Purchase Price (PPP)</strong> and sells to customers at <strong>MRP</strong>. Two invoices are generated per order: a <Badge variant="outline" className="text-[10px]">Purchase Invoice</Badge> to the partner and a <Badge variant="outline" className="text-[10px]">Sale Invoice</Badge> to the customer.</p>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Company Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" /> Company Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Company Name</Label><Input value={settings.companyName} onChange={e => update("companyName", e.target.value)} /></div>
              <div><Label className="text-xs">Corporation Type</Label><Input value={settings.companyType} onChange={e => update("companyType", e.target.value)} /></div>
            </div>
            <div><Label className="text-xs">Registered Address</Label><Textarea value={settings.address} onChange={e => update("address", e.target.value)} rows={2} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs">City</Label><Input value={settings.city} onChange={e => update("city", e.target.value)} /></div>
              <div><Label className="text-xs">State</Label><Input value={settings.state} onChange={e => update("state", e.target.value)} /></div>
              <div><Label className="text-xs">ZIP Code</Label><Input value={settings.zipcode} onChange={e => update("zipcode", e.target.value)} /></div>
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
            <div><Label className="text-xs">EIN (Employer Identification Number)</Label><Input value={settings.ein} onChange={e => update("ein", e.target.value)} placeholder="XX-XXXXXXX" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs">Federal Tax %</Label><Input type="number" value={settings.federalTaxRate} onChange={e => update("federalTaxRate", e.target.value)} /></div>
              <div><Label className="text-xs">State Tax %</Label><Input type="number" value={settings.stateTaxRate} onChange={e => update("stateTaxRate", e.target.value)} /></div>
              <div><Label className="text-xs">Local Tax %</Label><Input type="number" value={settings.localTaxRate} onChange={e => update("localTaxRate", e.target.value)} /></div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 border border-border text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">ℹ️ Tax Breakdown (Total: {totalTax.toFixed(2)}%)</p>
              <p>• Federal Tax: {settings.federalTaxRate}%</p>
              <p>• State Tax ({settings.state}): {settings.stateTaxRate}%</p>
              <p>• Local Tax: {settings.localTaxRate}%</p>
              <p className="text-primary font-medium mt-1">Applied on: Subtotal + Packing + Delivery − Discount</p>
            </div>
          </CardContent>
        </Card>

        {/* Delivery & Tips */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Truck className="w-4 h-4 text-primary" /> Delivery & Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Fixed Delivery Fee ($)</Label>
              <Input type="number" value={settings.deliveryFee} onChange={e => update("deliveryFee", e.target.value)} />
              <p className="text-[10px] text-muted-foreground mt-1">Delivery only — no pickup option. No third-party integration for now.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Tips Enabled</Label>
                <Input value={settings.tipsEnabled} onChange={e => update("tipsEnabled", e.target.value)} placeholder="true / false" />
              </div>
              <div>
                <Label className="text-xs">Tip Presets ($)</Label>
                <Input value={settings.tipPresets} onChange={e => update("tipPresets", e.target.value)} placeholder="[5, 10, 15, 20]" />
              </div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 border border-border text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground flex items-center gap-1"><Heart className="w-3 h-3 text-primary" /> Tips Configuration</p>
              <p>• Tips are optional and go directly to kitchen partners</p>
              <p>• Preset amounts shown as quick-select buttons at checkout</p>
              <p>• Custom tip amount also supported</p>
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
            <div><Label className="text-xs">Routing Number</Label><Input value={settings.routingNumber} onChange={e => update("routingNumber", e.target.value)} /></div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Template */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Invoice Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid lg:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Invoice Number Prefix</Label>
              <Input value={settings.invoicePrefix} onChange={e => update("invoicePrefix", e.target.value)} />
              <p className="text-[10px] text-muted-foreground mt-1">
                Preview: <Badge variant="outline" className="text-[10px]">{settings.invoicePrefix}/{new Date().getFullYear()}/000001</Badge>
              </p>
            </div>
            <div>
              <Label className="text-xs">Terms & Conditions</Label>
              <Textarea value={settings.termsAndConditions} onChange={e => update("termsAndConditions", e.target.value)} rows={5} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Trigger Mapping */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Invoice Trigger Mapping (Buy-Sell Model)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Vertical</th>
                  <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Trigger Event</th>
                  <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Invoices Generated</th>
                  <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { v: "Instant Orders", trigger: "Status → Delivered", invoices: "Sale + Purchase", status: "active" },
                  { v: "Party Orders (Bulk)", trigger: "Partner marks Food Ready", invoices: "Sale + Purchase", status: "active" },
                  { v: "Party Orders (Combo)", trigger: "Partner marks Food Ready", invoices: "Sale + Purchase", status: "active" },
                  { v: "Subscriptions", trigger: "Daily delivery marked", invoices: "Sale + Purchase", status: "active" },
                  { v: "Home Services", trigger: "Booking completed", invoices: "Sale only", status: "active" },
                  { v: "Sweets & Snacks", trigger: "Status → Delivered", invoices: "Sale + Purchase", status: "coming_soon" },
                  { v: "Cookery Classes", trigger: "Attendance marked", invoices: "Sale only", status: "coming_soon" },
                  { v: "Shero Classes", trigger: "Class completed", invoices: "Sale only", status: "coming_soon" },
                ].map(row => (
                  <tr key={row.v} className="border-b border-border/50">
                    <td className="py-2 px-3 font-medium text-foreground">{row.v}</td>
                    <td className="py-2 px-3 text-muted-foreground">{row.trigger}</td>
                    <td className="py-2 px-3 text-muted-foreground">{row.invoices}</td>
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
