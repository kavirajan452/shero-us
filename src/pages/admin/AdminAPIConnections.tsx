import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Plug, CheckCircle, AlertTriangle, XCircle, RefreshCw, Clock, Shield, Activity } from "lucide-react";

const apiConnections = [
  { name: "Google Maps Platform", category: "Location", key: "AIza****xT9v", status: "active", calls: "12,450/day", limit: "25,000/day", lastCheck: "1 min ago" },
  { name: "Firebase Cloud Messaging", category: "Notifications", key: "AAAA****B1cD", status: "active", calls: "8,200/day", limit: "Unlimited", lastCheck: "2 min ago" },
  { name: "Twilio SMS", category: "Messaging", key: "AC****ef78", status: "active", calls: "1,840/day", limit: "10,000/day", lastCheck: "3 min ago" },
  { name: "WhatsApp Business API", category: "Messaging", key: "waba_****gH3j", status: "active", calls: "3,200/day", limit: "10,000/day", lastCheck: "1 min ago" },
  { name: "AWS S3", category: "Storage", key: "AKIA****kL5m", status: "active", calls: "950/day", limit: "Unlimited", lastCheck: "5 min ago" },
  { name: "SendGrid", category: "Email", key: "SG.****nO7p", status: "warning", calls: "420/day", limit: "1,000/day", lastCheck: "8 min ago" },
  { name: "Cashfree Payouts", category: "Finance", key: "cf_****qR9s", status: "active", calls: "85/day", limit: "5,000/day", lastCheck: "10 min ago" },
  { name: "Google Analytics 4", category: "Analytics", key: "G-****tU1v", status: "active", calls: "N/A", limit: "N/A", lastCheck: "Live" },
];

const webhookEndpoints = [
  { url: "/webhooks/razorpay", events: "payment.*", status: "active", lastHit: "2 min ago", successRate: "99.8%" },
  { url: "/webhooks/dunzo", events: "delivery.*", status: "active", lastHit: "5 min ago", successRate: "99.2%" },
  { url: "/webhooks/shadowfax", events: "order.*", status: "active", lastHit: "12 min ago", successRate: "98.9%" },
  { url: "/webhooks/whatsapp", events: "message.*", status: "active", lastHit: "1 min ago", successRate: "100%" },
  { url: "/webhooks/cashfree", events: "payout.*", status: "active", lastHit: "3 hrs ago", successRate: "100%" },
];

const healthLog = [
  { time: "22:45:00", service: "Google Maps", event: "Health check passed", level: "info" },
  { time: "22:44:30", service: "SendGrid", event: "Rate limit warning: 42% quota used", level: "warning" },
  { time: "22:43:00", service: "Twilio SMS", event: "Batch delivery: 45 OTPs sent", level: "info" },
  { time: "22:40:00", service: "WhatsApp API", event: "Template message approved", level: "info" },
  { time: "22:35:00", service: "AWS S3", event: "Image upload batch: 12 files", level: "info" },
  { time: "22:30:00", service: "Firebase", event: "Push notification batch: 820 delivered", level: "info" },
];

const statusIcon = (status: string) => {
  if (status === "active") return <CheckCircle className="w-4 h-4 text-green-500" />;
  if (status === "warning") return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
  return <XCircle className="w-4 h-4 text-destructive" />;
};

export default function AdminAPIConnections() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">API Connections</h1>
        <p className="text-muted-foreground text-sm">Third-party integrations, webhook endpoints & service health</p>
      </div>

      <Tabs defaultValue="connections">
        <TabsList>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="health">Health Log</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {apiConnections.map((api) => (
              <Card key={api.name}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {statusIcon(api.status)}
                        <p className="font-semibold text-sm">{api.name}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{api.category}</Badge>
                    </div>
                    <Switch defaultChecked={api.status !== "inactive"} />
                  </div>
                  <div className="mt-3 text-xs space-y-1 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>API Key</span>
                      <code className="bg-muted px-1.5 py-0.5 rounded">{api.key}</code>
                    </div>
                    <div className="flex justify-between">
                      <span>Usage</span>
                      <span className="text-foreground font-medium">{api.calls} / {api.limit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Check</span>
                      <span>{api.lastCheck}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Webhook Endpoints</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {webhookEndpoints.map((wh) => (
                  <div key={wh.url} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <code className="text-sm font-mono">{wh.url}</code>
                      <p className="text-xs text-muted-foreground">Events: {wh.events} · Last: {wh.lastHit}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-green-600">{wh.successRate}</span>
                      <Badge variant="default" className="text-[10px]">{wh.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Service Health Log</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1">
                {healthLog.map((log, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0 text-sm">
                    <span className="text-xs text-muted-foreground font-mono w-16">{log.time}</span>
                    <Badge variant={log.level === "warning" ? "destructive" : "secondary"} className="text-[10px] w-16 justify-center">
                      {log.level}
                    </Badge>
                    <span className="font-medium text-xs w-28">{log.service}</span>
                    <span className="text-muted-foreground text-xs">{log.event}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
