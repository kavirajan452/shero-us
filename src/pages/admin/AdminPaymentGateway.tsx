import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, CheckCircle, AlertTriangle } from "lucide-react";

const stripeConfig = {
  status: "active",
  mode: "live",
  accountId: "acct_****8kG2",
  lastSync: "2026-03-17 22:45:00",
  webhookUrl: "https://api.sherohomefood.com/webhooks/stripe",
};

const recentTransactions = [
  { id: "pi_Q1a2b3c4d5", amount: 1250, status: "succeeded", method: "Visa •••• 4242", customer: "Maria G.", time: "2 min ago" },
  { id: "pi_Q1e6f7g8h9", amount: 3500, status: "succeeded", method: "Mastercard •••• 5555", customer: "James K.", time: "8 min ago" },
  { id: "pi_Q1i0j1k2l3", amount: 890, status: "refunded", method: "Apple Pay", customer: "Sarah S.", time: "15 min ago" },
  { id: "pi_Q1m4n5o6p7", amount: 4200, status: "failed", method: "Amex •••• 3782", customer: "Robert R.", time: "22 min ago" },
  { id: "pi_Q1q8r9s0t1", amount: 1800, status: "succeeded", method: "Google Pay", customer: "Laura D.", time: "30 min ago" },
];

const webhookEvents = [
  { event: "payment_intent.succeeded", count: 342, lastFired: "2 min ago", status: "healthy" },
  { event: "payment_intent.payment_failed", count: 18, lastFired: "22 min ago", status: "healthy" },
  { event: "charge.refunded", count: 12, lastFired: "15 min ago", status: "healthy" },
  { event: "checkout.session.completed", count: 340, lastFired: "2 min ago", status: "healthy" },
  { event: "payout.paid", count: 3, lastFired: "6 hrs ago", status: "warning" },
];

export default function AdminPaymentGateway() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payment Gateway</h1>
          <p className="text-muted-foreground text-sm">Stripe configuration, webhooks & transaction monitoring</p>
        </div>
        <Badge variant={stripeConfig.status === "active" ? "default" : "destructive"} className="text-sm px-3 py-1">
          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Live & Active
        </Badge>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card><CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Today's Collections</p>
              <p className="text-2xl font-bold">$184,250</p>
              <p className="text-xs text-primary">↑ 12% vs yesterday</p>
            </CardContent></Card>
            <Card><CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold">96.4%</p>
              <p className="text-xs text-muted-foreground">342 of 355 attempts</p>
            </CardContent></Card>
            <Card><CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Pending Payouts</p>
              <p className="text-2xl font-bold">$52,800</p>
              <p className="text-xs text-muted-foreground">Next: Tomorrow 6 AM EST</p>
            </CardContent></Card>
            <Card><CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Refunds Today</p>
              <p className="text-2xl font-bold">$2,140</p>
              <p className="text-xs text-muted-foreground">3 refunds processed</p>
            </CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Stripe Account ID</span>
                <code className="text-sm bg-muted px-2 py-0.5 rounded">{stripeConfig.accountId}</code>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Mode</span>
                <Badge variant="default">Live</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Webhook URL</span>
                <code className="text-xs bg-muted px-2 py-0.5 rounded">{stripeConfig.webhookUrl}</code>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Last Sync</span>
                <span className="text-sm">{stripeConfig.lastSync}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Recent Transactions</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentTransactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between py-2.5 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{txn.customer}</p>
                        <p className="text-xs text-muted-foreground">{txn.id} · {txn.method}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">${txn.amount.toLocaleString()}</p>
                      <Badge variant={txn.status === "succeeded" ? "default" : txn.status === "refunded" ? "secondary" : "destructive"} className="text-[10px]">
                        {txn.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Webhook Events</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {webhookEvents.map((evt) => (
                  <div key={evt.event} className="flex items-center justify-between py-2.5 border-b last:border-0">
                    <div>
                      <p className="text-sm font-mono">{evt.event}</p>
                      <p className="text-xs text-muted-foreground">Last: {evt.lastFired}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{evt.count}</span>
                      {evt.status === "healthy" ? (
                        <CheckCircle className="w-4 h-4 text-primary" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Payment Methods</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {["Credit / Debit Cards (Visa, Mastercard, Amex)", "Apple Pay", "Google Pay", "ACH Direct Debit"].map((method) => (
                <div key={method} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm">{method}</span>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Security</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm">Auto-refund on failed delivery</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm">Radar fraud detection</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">PCI-DSS compliance mode</span>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
