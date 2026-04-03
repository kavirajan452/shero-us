import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, Clock, Bell, Settings, AlertTriangle, CheckCircle2, Sparkles, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface SpinSegment {
  label: string;
  value: number;
  weight: number;
}

interface ExpirySettings {
  validity_days: number;
  warning_days: number[];
  auto_expire_enabled: boolean;
  notification_messages: Record<string, string>;
}

interface ReferralSettings {
  earning_cap: number;
  spin_segments: SpinSegment[];
  wallet_usage_min_orders: number;
  wallet_usage_max_pct: number;
  referral_enabled: boolean;
}

const AdminWalletExpiry = () => {
  const [expirySettings, setExpirySettings] = useState<ExpirySettings>({
    validity_days: 90,
    warning_days: [7, 3, 1],
    auto_expire_enabled: true,
    notification_messages: {},
  });
  const [referralSettings, setReferralSettings] = useState<ReferralSettings>({
    earning_cap: 2500,
    spin_segments: [],
    wallet_usage_min_orders: 2,
    wallet_usage_max_pct: 50,
    referral_enabled: true,
  });
  const [expiringCredits, setExpiringCredits] = useState<any[]>([]);
  const [expiredLog, setExpiredLog] = useState<any[]>([]);
  const [notificationLog, setNotificationLog] = useState<any[]>([]);
  const [summaryStats, setSummaryStats] = useState({ activeCredits: 0, expiringThisWeek: 0, expiredThisMonth: 0, notifsSent: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchData();
  }, []);

  const fetchSettings = async () => {
    const [{ data: expiry }, { data: referral }] = await Promise.all([
      supabase.from("app_config").select("value").eq("key", "wallet_expiry_settings").single(),
      supabase.from("app_config").select("value").eq("key", "referral_settings").single(),
    ]);
    if (expiry?.value) setExpirySettings(expiry.value as any);
    if (referral?.value) setReferralSettings(referral.value as any);
  };

  const fetchData = async () => {
    const now = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [{ data: expiring }, { data: expired }, { data: notifs }, { data: active }] = await Promise.all([
      supabase
        .from("wallet_transactions")
        .select("*")
        .eq("expired", false)
        .gt("remaining_amount", 0)
        .not("expires_at", "is", null)
        .lte("expires_at", weekLater.toISOString())
        .gte("expires_at", now.toISOString())
        .order("expires_at", { ascending: true })
        .limit(50),
      supabase
        .from("wallet_transactions")
        .select("*")
        .eq("expired", true)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("wallet_expiry_notifications")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(50),
      supabase
        .from("wallet_transactions")
        .select("id", { count: "exact" })
        .eq("expired", false)
        .gt("remaining_amount", 0)
        .not("expires_at", "is", null),
    ]);

    setExpiringCredits(expiring || []);
    setExpiredLog(expired || []);
    setNotificationLog(notifs || []);

    setSummaryStats({
      activeCredits: active?.length || 0,
      expiringThisWeek: expiring?.length || 0,
      expiredThisMonth: (expired || []).filter((e: any) => new Date(e.created_at) > monthAgo).length,
      notifsSent: notifs?.length || 0,
    });
  };

  const saveExpirySettings = async () => {
    setSaving(true);
    await supabase
      .from("app_config")
      .update({ value: expirySettings as any, updated_at: new Date().toISOString() })
      .eq("key", "wallet_expiry_settings");
    toast.success("Expiry settings saved");
    setSaving(false);
  };

  const saveReferralSettings = async () => {
    setSaving(true);
    await supabase
      .from("app_config")
      .update({ value: referralSettings as any, updated_at: new Date().toISOString() })
      .eq("key", "referral_settings");
    toast.success("Referral settings saved");
    setSaving(false);
  };

  const addSegment = () => {
    setReferralSettings((prev) => ({
      ...prev,
      spin_segments: [...prev.spin_segments, { label: "$0", value: 0, weight: 10 }],
    }));
  };

  const removeSegment = (idx: number) => {
    setReferralSettings((prev) => ({
      ...prev,
      spin_segments: prev.spin_segments.filter((_, i) => i !== idx),
    }));
  };

  const updateSegment = (idx: number, field: keyof SpinSegment, val: string | number) => {
    setReferralSettings((prev) => ({
      ...prev,
      spin_segments: prev.spin_segments.map((s, i) =>
        i === idx ? { ...s, [field]: field === "label" ? val : Number(val) } : s
      ),
    }));
  };

  const runExpiryProcess = async () => {
    toast.info("Processing wallet expiry...");
    try {
      const { data, error } = await supabase.functions.invoke("process-wallet-expiry", { method: "POST" });
      if (error) throw error;
      toast.success(`Done: ${data?.credits_expired || 0} expired, ${data?.notifications_sent || 0} notifications sent`);
      fetchData();
    } catch (e: any) {
      toast.error("Failed: " + (e.message || "Unknown error"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Wallet className="w-6 h-6 text-primary" /> Wallet & Referral Management
        </h1>
        <Button onClick={runExpiryProcess} variant="outline" size="sm" className="gap-2">
          <Clock className="w-4 h-4" /> Run Expiry Now
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <CheckCircle2 className="w-6 h-6 mx-auto text-accent mb-2" />
            <p className="text-2xl font-bold text-foreground">{summaryStats.activeCredits}</p>
            <p className="text-xs text-muted-foreground">Active Credits</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <AlertTriangle className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold text-foreground">{summaryStats.expiringThisWeek}</p>
            <p className="text-xs text-muted-foreground">Expiring This Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <Clock className="w-6 h-6 mx-auto text-destructive mb-2" />
            <p className="text-2xl font-bold text-foreground">{summaryStats.expiredThisMonth}</p>
            <p className="text-xs text-muted-foreground">Expired This Month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <Bell className="w-6 h-6 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{summaryStats.notifsSent}</p>
            <p className="text-xs text-muted-foreground">Notifications Sent</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="settings">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="expiring">Expiring</TabsTrigger>
          <TabsTrigger value="expired">Expired Log</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Expiry Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Validity (days)</label>
                  <Input
                    type="number"
                    value={expirySettings.validity_days}
                    onChange={(e) => setExpirySettings({ ...expirySettings, validity_days: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs text-muted-foreground">Auto-expire enabled</label>
                  <Switch
                    checked={expirySettings.auto_expire_enabled}
                    onCheckedChange={(v) => setExpirySettings({ ...expirySettings, auto_expire_enabled: v })}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Warning Days (comma-separated)</label>
                <Input
                  value={expirySettings.warning_days.join(", ")}
                  onChange={(e) =>
                    setExpirySettings({
                      ...expirySettings,
                      warning_days: e.target.value.split(",").map((d) => parseInt(d.trim())).filter((n) => !isNaN(n)),
                    })
                  }
                />
              </div>
              <Button onClick={saveExpirySettings} disabled={saving} className="gap-2">
                <Settings className="w-4 h-4" /> Save Expiry Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Referral & Spin Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Earning Cap ($)</label>
                  <Input
                    type="number"
                    value={referralSettings.earning_cap}
                    onChange={(e) => setReferralSettings({ ...referralSettings, earning_cap: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Min Orders for Wallet</label>
                  <Input
                    type="number"
                    value={referralSettings.wallet_usage_min_orders}
                    onChange={(e) => setReferralSettings({ ...referralSettings, wallet_usage_min_orders: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Max % of Order</label>
                  <Input
                    type="number"
                    value={referralSettings.wallet_usage_max_pct}
                    onChange={(e) => setReferralSettings({ ...referralSettings, wallet_usage_max_pct: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs text-muted-foreground">Referral Program Enabled</label>
                <Switch
                  checked={referralSettings.referral_enabled}
                  onCheckedChange={(v) => setReferralSettings({ ...referralSettings, referral_enabled: v })}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-foreground">Spin Wheel Segments</label>
                  <Button variant="outline" size="sm" onClick={addSegment} className="gap-1 text-xs">
                    <Plus className="w-3 h-3" /> Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {referralSettings.spin_segments.map((seg, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        placeholder="Label"
                        value={seg.label}
                        onChange={(e) => updateSegment(i, "label", e.target.value)}
                        className="w-24"
                      />
                      <Input
                        type="number"
                        placeholder="Value"
                        value={seg.value}
                        onChange={(e) => updateSegment(i, "value", e.target.value)}
                        className="w-20"
                      />
                      <Input
                        type="number"
                        placeholder="Weight"
                        value={seg.weight}
                        onChange={(e) => updateSegment(i, "weight", e.target.value)}
                        className="w-20"
                      />
                      <Button variant="ghost" size="sm" onClick={() => removeSegment(i)}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={saveReferralSettings} disabled={saving} className="gap-2">
                <Settings className="w-4 h-4" /> Save Referral Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expiring Credits Tab */}
        <TabsContent value="expiring">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Credits Expiring This Week</CardTitle>
            </CardHeader>
            <CardContent>
              {expiringCredits.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No credits expiring soon</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiringCredits.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="text-xs">{c.user_id?.slice(0, 8)}...</TableCell>
                        <TableCell className="font-medium">${c.amount}</TableCell>
                        <TableCell className="font-medium text-primary">${c.remaining_amount}</TableCell>
                        <TableCell className="text-xs">{new Date(c.expires_at).toLocaleDateString("en-US")}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{c.type}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expired Log Tab */}
        <TabsContent value="expired">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Expired Credits Log</CardTitle>
            </CardHeader>
            <CardContent>
              {expiredLog.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No expired credits yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Original Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Expired At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiredLog.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="text-xs">{c.user_id?.slice(0, 8)}...</TableCell>
                        <TableCell className="font-medium text-destructive">${c.amount}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{c.type}</Badge></TableCell>
                        <TableCell className="text-xs">{new Date(c.created_at).toLocaleDateString("en-US")}</TableCell>
                        <TableCell className="text-xs">{c.expires_at ? new Date(c.expires_at).toLocaleDateString("en-US") : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Notification Log</CardTitle>
            </CardHeader>
            <CardContent>
              {notificationLog.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No notifications sent yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Read</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notificationLog.map((n) => (
                      <TableRow key={n.id}>
                        <TableCell className="text-xs">{n.user_id?.slice(0, 8)}...</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{n.notification_type}</Badge></TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">{n.message}</TableCell>
                        <TableCell className="text-xs">{new Date(n.sent_at).toLocaleDateString("en-US")}</TableCell>
                        <TableCell>
                          {n.read_at ? (
                            <Badge variant="default" className="text-[10px]">Read</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">Unread</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminWalletExpiry;
