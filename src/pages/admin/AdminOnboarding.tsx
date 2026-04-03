import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, Clock, Eye, Search, UserPlus, FileText, Phone } from "lucide-react";

type Status = "pending" | "approved" | "rejected";

const mockApplications = [
  { id: "ONB-1001", name: "Patricia Sharma", phone: "+1 (212) 555-0101", city: "New York", cuisine: "South Indian", appliedAt: "2 hours ago", status: "pending" as Status, step: "Documents", hasPets: true, healthCondition: "None" },
  { id: "ONB-1002", name: "Angela R.", phone: "+1 (310) 555-0102", city: "Los Angeles", cuisine: "North Indian", appliedAt: "5 hours ago", status: "pending" as Status, step: "Final Review", hasPets: false, healthCondition: "Diabetes" },
  { id: "ONB-1003", name: "Diana Kim", phone: "+1 (312) 555-0103", city: "Chicago", cuisine: "Pennsylvania", appliedAt: "1 day ago", status: "approved" as Status, step: "Completed", hasPets: false, healthCondition: "None" },
  { id: "ONB-1004", name: "Fatima Brown", phone: "+1 (713) 555-0104", city: "Houston", cuisine: "Mughlai", appliedAt: "1 day ago", status: "rejected" as Status, step: "Kitchen Inspection", hasPets: true, healthCondition: "None" },
  { id: "ONB-1005", name: "Gloria Reed", phone: "+1 (602) 555-0105", city: "Phoenix", cuisine: "Chettinad", appliedAt: "2 days ago", status: "pending" as Status, step: "Training", hasPets: false, healthCondition: "Asthma" },
  { id: "ONB-1006", name: "Helen Lee", phone: "+1 (215) 555-0106", city: "San Antonio", cuisine: "Florida", appliedAt: "3 days ago", status: "approved" as Status, step: "Completed", hasPets: true, healthCondition: "None" },
];

const statusConfig: Record<Status, { label: string; variant: "default" | "destructive" | "outline" | "secondary" }> = {
  pending: { label: "Pending", variant: "outline" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
};

export default function AdminOnboarding() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [applications, setApplications] = useState(mockApplications);
  const [selectedApp, setSelectedApp] = useState<typeof mockApplications[0] | null>(null);

  const filtered = applications.filter((app) => {
    const matchSearch = app.name.toLowerCase().includes(search.toLowerCase()) || app.id.toLowerCase().includes(search.toLowerCase());
    if (tab === "all") return matchSearch;
    return matchSearch && app.status === tab;
  });

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const updateStatus = (id: string, status: Status) => {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    if (selectedApp?.id === id) setSelectedApp((p) => p ? { ...p, status } : p);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Onboarding Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and manage partner enrollment applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Applications", value: counts.all, icon: FileText, color: "text-primary" },
          { label: "Pending Review", value: counts.pending, icon: Clock, color: "text-amber-600" },
          { label: "Approved", value: counts.approved, icon: CheckCircle2, color: "text-green-600" },
          { label: "Rejected", value: counts.rejected, icon: XCircle, color: "text-destructive" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({counts.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4 space-y-3">
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No applications found</p>
          )}
          {filtered.map((app) => (
            <Card key={app.id} className="border-border hover:shadow-sm transition-shadow">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground text-sm">{app.name}</p>
                    <Badge variant={statusConfig[app.status].variant} className="text-[10px]">
                      {statusConfig[app.status].label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{app.id} · {app.cuisine} · {app.city}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{app.phone}</span>
                    <span>Step: {app.step}</span>
                    <span>{app.appliedAt}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="outline" className="h-8 px-2 text-xs" onClick={() => setSelectedApp(app)}>
                    <Eye className="w-3.5 h-3.5 mr-1" /> View
                  </Button>
                  {app.status === "pending" && (
                    <>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10" onClick={() => updateStatus(app.id, "rejected")}>
                        <XCircle className="w-4 h-4" />
                      </Button>
                      <Button size="sm" className="h-8 w-8 p-0" onClick={() => updateStatus(app.id, "approved")}>
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Detail Panel */}
      {selectedApp && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                {selectedApp.name}
              </span>
              <Button size="sm" variant="ghost" onClick={() => setSelectedApp(null)}>✕</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {[
                { label: "Application ID", value: selectedApp.id },
                { label: "Phone", value: selectedApp.phone },
                { label: "City", value: selectedApp.city },
                { label: "Cuisine", value: selectedApp.cuisine },
                { label: "Current Step", value: selectedApp.step },
                { label: "Applied", value: selectedApp.appliedAt },
                { label: "Has Pets", value: selectedApp.hasPets ? "Yes" : "No" },
                { label: "Health Condition", value: selectedApp.healthCondition },
                { label: "Status", value: statusConfig[selectedApp.status].label },
              ].map((f) => (
                <div key={f.label} className="bg-muted/30 rounded-lg p-3 border border-border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{f.label}</p>
                  <p className="font-medium text-foreground mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>
            {selectedApp.status === "pending" && (
              <div className="flex gap-2 pt-2">
                <Button variant="destructive" size="sm" onClick={() => updateStatus(selectedApp.id, "rejected")}>
                  <XCircle className="w-4 h-4 mr-1" /> Reject
                </Button>
                <Button size="sm" onClick={() => updateStatus(selectedApp.id, "approved")}>
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
