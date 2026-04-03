import { ChefHat, Users, ClipboardList, UtensilsCrossed, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import sheroWelcome from "@/assets/shero-mascot-welcome.png";

const stats = [
  { label: "Active Partners", value: "248", icon: ChefHat, color: "text-primary", link: "/admin/partners" },
  { label: "Total Orders", value: "1,842", icon: ClipboardList, color: "text-blue-600", link: "/admin/orders" },
  { label: "Cuisines Listed", value: "20", icon: UtensilsCrossed, color: "text-amber-600", link: "/admin/menus" },
  { label: "Registered Users", value: "5,120", icon: Users, color: "text-green-600", link: "/admin/users" },
];

const pendingPPPApprovals = [
  { id: "PPP-1021", partnerName: "Chef Lakshmi", cuisine: "South Indian", appliedAt: "2 hours ago", items: 12 },
  { id: "PPP-1019", partnerName: "Chef Meena", cuisine: "North Indian", appliedAt: "5 hours ago", items: 8 },
  { id: "PPP-1017", partnerName: "Chef Raheema", cuisine: "Mughlai", appliedAt: "1 day ago", items: 15 },
  { id: "PPP-1015", partnerName: "Chef Saroja", cuisine: "Chettinad", appliedAt: "1 day ago", items: 6 },
  { id: "PPP-1012", partnerName: "Chef Fathima", cuisine: "Kerala", appliedAt: "2 days ago", items: 10 },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <img src={sheroWelcome} alt="Shero" className="w-12 h-12 object-contain drop-shadow-md shrink-0 hidden md:block" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform overview and quick actions</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.link}
            className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow"
          >
            <s.icon className={`w-6 h-6 ${s.color} mb-3`} />
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Pending PPP Approvals */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Pending PPP Approvals
            <Badge variant="destructive" className="text-[10px] ml-1">{pendingPPPApprovals.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingPPPApprovals.map((app) => (
            <div key={app.id} className="flex items-center justify-between bg-muted/30 rounded-xl p-3 border border-border">
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm">{app.partnerName}</p>
                <p className="text-xs text-muted-foreground">{app.id} · {app.cuisine} · {app.items} items</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{app.appliedAt}</p>
              </div>
              <div className="flex gap-2 shrink-0 ml-3">
                <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10">
                  <XCircle className="w-4 h-4" />
                </Button>
                <Button size="sm" className="h-7 w-7 p-0">
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          <Link to="/admin/partners" className="block text-center text-sm font-semibold text-primary hover:underline pt-1">
            View All PPP Applications →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
