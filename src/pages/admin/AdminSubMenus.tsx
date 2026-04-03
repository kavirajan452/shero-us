import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Download, Upload, FileSpreadsheet, Shield, Globe,
  ToggleLeft, ToggleRight, History, CheckCircle2, XCircle, Clock, Trash2, Eye,
} from "lucide-react";

interface MenuUploadRecord {
  id: string; planName: string; uploadedBy: string; uploadDate: string;
  status: "pending_approval" | "approved" | "rejected" | "active" | "inactive" | "deleted";
  approvedBy?: string; verticalHeadApproval?: boolean; managerApproval?: boolean; zone?: string; itemCount: number;
}

const mockMenuUploads: MenuUploadRecord[] = [
  { id: "MU001", planName: "Chettinad Veg Thali", uploadedBy: "Priya (Manager)", uploadDate: "2026-03-14", status: "active", approvedBy: "Vertical Head", verticalHeadApproval: true, managerApproval: true, zone: "Hyderabad", itemCount: 42 },
  { id: "MU002", planName: "Kerala Sadya Box", uploadedBy: "Anitha (Manager)", uploadDate: "2026-03-13", status: "active", approvedBy: "Vertical Head", verticalHeadApproval: true, managerApproval: true, zone: "Hyderabad", itemCount: 35 },
  { id: "MU003", planName: "Andhra Spice Box - Updated", uploadedBy: "Lakshmi (TL)", uploadDate: "2026-03-15", status: "pending_approval", managerApproval: false, verticalHeadApproval: false, zone: "Hyderabad", itemCount: 48 },
  { id: "MU004", planName: "North Indian Dabba v2", uploadedBy: "Priya (Manager)", uploadDate: "2026-03-10", status: "rejected", zone: "Hyderabad", itemCount: 40 },
  { id: "MU005", planName: "South Indian Breakfast", uploadedBy: "Anitha (Manager)", uploadDate: "2026-03-12", status: "inactive", approvedBy: "Vertical Head", verticalHeadApproval: true, managerApproval: true, zone: "All Zones", itemCount: 28 },
  { id: "MU006", planName: "Old Chettinad Menu", uploadedBy: "System", uploadDate: "2026-02-01", status: "deleted", zone: "Hyderabad", itemCount: 38 },
];

const statusStyles: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  active: { bg: "bg-action-done/15", text: "text-action-done", icon: CheckCircle2 },
  pending_approval: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", icon: Clock },
  rejected: { bg: "bg-destructive/10", text: "text-destructive", icon: XCircle },
  inactive: { bg: "bg-muted", text: "text-muted-foreground", icon: ToggleLeft },
  approved: { bg: "bg-action-done/15", text: "text-action-done", icon: CheckCircle2 },
  deleted: { bg: "bg-destructive/5", text: "text-destructive/60 line-through", icon: Trash2 },
};

const AdminSubMenus = () => {
  const { toast } = useToast();
  const [menuUploads, setMenuUploads] = useState<MenuUploadRecord[]>(mockMenuUploads);
  const [menuFilter, setMenuFilter] = useState<string>("all");

  const filteredUploads = menuUploads.filter(m => menuFilter === "all" || m.status === menuFilter);

  const counts: Record<string, number> = {
    all: menuUploads.length,
    active: menuUploads.filter(m => m.status === "active").length,
    pending_approval: menuUploads.filter(m => m.status === "pending_approval").length,
    inactive: menuUploads.filter(m => m.status === "inactive").length,
    rejected: menuUploads.filter(m => m.status === "rejected").length,
    deleted: menuUploads.filter(m => m.status === "deleted").length,
  };

  const handleMenuApproval = (id: string, approved: boolean, level: "manager" | "verticalHead") => {
    setMenuUploads(prev => prev.map(m => {
      if (m.id !== id) return m;
      const updated = { ...m };
      if (level === "manager") updated.managerApproval = approved;
      if (level === "verticalHead") updated.verticalHeadApproval = approved;
      if (updated.managerApproval && updated.verticalHeadApproval) { updated.status = "approved"; updated.approvedBy = "Dual Approved"; }
      else if (!approved) { updated.status = "rejected"; }
      return updated;
    }));
    toast({ title: approved ? "✅ Approved" : "❌ Rejected", description: `${level === "manager" ? "Manager" : "Vertical Head"} ${approved ? "approved" : "rejected"} menu` });
  };

  return (
    <div className="space-y-5">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Menu Management</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Upload, approve & manage subscription menus</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5" onClick={() => toast({ title: "📥 Template Downloaded" })}>
            <Download className="w-3.5 h-3.5" /> Template
          </Button>
          <Button size="sm" className="text-xs h-8 gap-1.5 bg-action-accept text-action-accept-foreground hover:bg-action-accept/90" onClick={() => {
            setMenuUploads(prev => [{ id: `MU${String(prev.length + 1).padStart(3, "0")}`, planName: "New Menu Upload", uploadedBy: "Current User", uploadDate: new Date().toISOString().split("T")[0], status: "pending_approval", managerApproval: false, verticalHeadApproval: false, zone: "Hyderabad", itemCount: 0 }, ...prev]);
            toast({ title: "📤 Menu Uploaded", description: "Pending dual approval" });
          }}>
            <Upload className="w-3.5 h-3.5" /> Upload Menu
          </Button>
        </div>
      </div>

      {/* Template info card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-3.5">
          <div className="flex items-start gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-foreground mb-1.5">Excel Template Columns</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-4 gap-y-1">
                {["Plan Name", "Day (Mon-Sun)", "Session (B/L/D)", "Item Name", "MRP ($)", "PPP (60% default)", "Customer Price", "Discount %", "Portion Size", "Cuisine", "Veg/NV", "Zone"].map(col => (
                  <span key={col} className="text-[10px] text-muted-foreground">• {col}</span>
                ))}
              </div>
              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-primary/15">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] text-primary font-semibold">Dual approval required: Manager + Vertical Head</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter pills */}
      <div className="flex gap-1.5 flex-wrap">
        {[
          { key: "all", label: "All" },
          { key: "active", label: "Active" },
          { key: "pending_approval", label: "Pending" },
          { key: "inactive", label: "Inactive" },
          { key: "rejected", label: "Rejected" },
          { key: "deleted", label: "Deleted" },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setMenuFilter(f.key)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
              menuFilter === f.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            }`}
          >
            {f.label}
            <span className={`ml-1.5 text-[10px] ${menuFilter === f.key ? "opacity-80" : "opacity-60"}`}>
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Menu cards */}
      <div className="space-y-3">
        {filteredUploads.map(m => {
          const style = statusStyles[m.status] || statusStyles.active;
          const StatusIcon = style.icon;

          return (
            <Card
              key={m.id}
              className={`border-border transition-all hover:shadow-sm ${
                m.status === "pending_approval" ? "border-l-4 border-l-yellow-400" :
                m.status === "rejected" ? "border-l-4 border-l-destructive/50" :
                m.status === "deleted" ? "opacity-60" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Plan info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`text-sm font-bold ${m.status === "deleted" ? "text-muted-foreground line-through" : "text-foreground"}`}>
                        {m.planName}
                      </h3>
                      <Badge className={`text-[10px] gap-1 ${style.bg} ${style.text} border-0`}>
                        <StatusIcon className="w-3 h-3" />
                        {m.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span>{m.uploadedBy}</span>
                      <span>·</span>
                      <span>{m.uploadDate}</span>
                      <span>·</span>
                      <Badge variant="outline" className="text-[10px] gap-1 font-normal">
                        <Globe className="w-2.5 h-2.5" /> {m.zone}
                      </Badge>
                    </div>

                    {/* Item count bar */}
                    <div className="flex items-center gap-2 mt-2.5">
                      <div className="flex items-center gap-1.5 bg-secondary/60 rounded-md px-2.5 py-1">
                        <span className="text-lg font-bold text-foreground">{m.itemCount}</span>
                        <span className="text-[10px] text-muted-foreground leading-tight">menu<br />items</span>
                      </div>

                      {/* Approval indicators */}
                      <div className="flex gap-1.5">
                        <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg ${
                          m.managerApproval ? "bg-action-done/12" : "bg-muted/60"
                        }`}>
                          <span className={`text-[10px] font-bold ${m.managerApproval ? "text-action-done" : "text-muted-foreground"}`}>Mgr</span>
                          {m.managerApproval
                            ? <CheckCircle2 className="w-4 h-4 text-action-done" />
                            : <XCircle className="w-4 h-4 text-muted-foreground/50" />
                          }
                        </div>
                        <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg ${
                          m.verticalHeadApproval ? "bg-action-done/12" : "bg-muted/60"
                        }`}>
                          <span className={`text-[10px] font-bold ${m.verticalHeadApproval ? "text-action-done" : "text-muted-foreground"}`}>VH</span>
                          {m.verticalHeadApproval
                            ? <CheckCircle2 className="w-4 h-4 text-action-done" />
                            : <XCircle className="w-4 h-4 text-muted-foreground/50" />
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground">
                      <Eye className="w-4 h-4" />
                    </Button>

                    {m.status === "pending_approval" && (
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          className="text-[10px] h-7 gap-1 bg-action-done text-action-done-foreground hover:bg-action-done/90"
                          onClick={() => handleMenuApproval(m.id, true, "manager")}
                        >
                          Mgr ✓
                        </Button>
                        <Button
                          size="sm"
                          className="text-[10px] h-7 gap-1 bg-action-accept text-action-accept-foreground hover:bg-action-accept/90"
                          onClick={() => handleMenuApproval(m.id, true, "verticalHead")}
                        >
                          VH ✓
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-[10px] h-7 gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={() => handleMenuApproval(m.id, false, "manager")}
                        >
                          <XCircle className="w-3 h-3" /> Reject
                        </Button>
                      </div>
                    )}

                    {m.status === "active" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[10px] h-7 gap-1"
                        onClick={() => { setMenuUploads(prev => prev.map(x => x.id === m.id ? { ...x, status: "inactive" } : x)); toast({ title: "Menu deactivated" }); }}
                      >
                        <ToggleLeft className="w-3 h-3" /> Deactivate
                      </Button>
                    )}

                    {m.status === "inactive" && (
                      <Button
                        size="sm"
                        className="text-[10px] h-7 gap-1 bg-action-accept text-action-accept-foreground hover:bg-action-accept/90"
                        onClick={() => { setMenuUploads(prev => prev.map(x => x.id === m.id ? { ...x, status: "active" } : x)); toast({ title: "Menu reactivated" }); }}
                      >
                        <ToggleRight className="w-3 h-3" /> Activate
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredUploads.length === 0 && (
        <p className="text-center text-muted-foreground py-8 text-sm">No menus match this filter</p>
      )}

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t border-border">
        <History className="w-3.5 h-3.5" /> Upload history is preserved. Deleted menus remain in records for audit.
      </div>
    </div>
  );
};

export default AdminSubMenus;
