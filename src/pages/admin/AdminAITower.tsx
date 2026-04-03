import { Bot, Cpu, Activity, Zap, MessageSquare, Brain, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const aiModules = [
  { name: "Order Routing AI", status: "active", accuracy: 94, calls: 1240, description: "Auto-assigns orders to nearest available partner based on cuisine, capacity & location" },
  { name: "Demand Forecasting", status: "active", accuracy: 87, calls: 48, description: "Predicts daily order volumes by area and cuisine for partner scheduling" },
  { name: "Customer Sentiment", status: "active", accuracy: 91, calls: 315, description: "Analyses feedback, reviews & complaints for real-time NPS scoring" },
  { name: "Smart Pricing Engine", status: "coming_soon", accuracy: 0, calls: 0, description: "Dynamic pricing based on demand, time-of-day & partner capacity" },
  { name: "Fraud Detection", status: "coming_soon", accuracy: 0, calls: 0, description: "Identifies suspicious order patterns, fake reviews & payment anomalies" },
  { name: "Voice AI Agent", status: "coming_soon", accuracy: 0, calls: 0, description: "AI-powered call handling for customer support & order status queries" },
];

export default function AdminAITower() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" /> AI Control Tower
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Central intelligence hub — AI modules, model performance & automation control</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Active Modules</p><p className="text-2xl font-bold text-action-done mt-1">3</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Coming Soon</p><p className="text-2xl font-bold text-muted-foreground mt-1">3</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">API Calls Today</p><p className="text-2xl font-bold text-primary mt-1">1,603</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg Accuracy</p><p className="text-2xl font-bold text-action-done mt-1">90.7%</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aiModules.map(mod => (
          <Card key={mod.name} className={mod.status === "coming_soon" ? "opacity-60" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" /> {mod.name}
                </CardTitle>
                <Badge className={`text-[8px] ${mod.status === "active" ? "bg-action-done/15 text-action-done" : "bg-muted text-muted-foreground"}`}>
                  {mod.status === "active" ? "● Active" : "Coming Soon"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">{mod.description}</p>
              {mod.status === "active" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Accuracy</span>
                    <span className="font-bold text-foreground">{mod.accuracy}%</span>
                  </div>
                  <Progress value={mod.accuracy} className="h-2" />
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>API calls today: {mod.calls.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-action-done" /> Healthy</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
