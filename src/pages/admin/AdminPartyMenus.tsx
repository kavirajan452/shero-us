import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { partyMenu, mealLabels, categoryLabels } from "@/data/partyMenuData";
import { portionSizes, computeProductionVolume, getPortionSize } from "@/data/partyProductionData";
import {
  getPackingConfig, savePackingConfig, calculatePackingCharges, type PackingConfig,
  getComboPackingConfig, saveComboPackingConfig, getComboPackingCostPerBox, type ComboPackingConfig,
} from "@/data/packingChargesConfig";
import { useToast } from "@/hooks/use-toast";
import {
  Search, Download, Upload, UtensilsCrossed, Package, FileSpreadsheet, BarChart3, Settings, History, CheckCircle, Clock,
} from "lucide-react";

// Upload history stored in localStorage
interface UploadRecord {
  id: string;
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
  itemCount: number;
  status: "pending" | "partially_approved" | "approved" | "rejected";
  partyManagerApproval?: { by: string; at: string };
  verticalHeadApproval?: { by: string; at: string };
}

const UPLOAD_HISTORY_KEY = "shero-party-upload-history";

function getUploadHistory(): UploadRecord[] {
  try {
    return JSON.parse(localStorage.getItem(UPLOAD_HISTORY_KEY) || "[]");
  } catch { return []; }
}

function saveUploadRecord(record: UploadRecord) {
  const history = getUploadHistory();
  history.unshift(record);
  localStorage.setItem(UPLOAD_HISTORY_KEY, JSON.stringify(history));
}

function approveUploadByRole(id: string, role: "party_manager" | "vertical_head", approver: string) {
  const history = getUploadHistory();
  const record = history.find((r) => r.id === id);
  if (!record) return;
  const now = new Date().toISOString();
  if (role === "party_manager") {
    record.partyManagerApproval = { by: approver, at: now };
  } else {
    record.verticalHeadApproval = { by: approver, at: now };
  }
  // Both approved → mark as fully approved
  if (record.partyManagerApproval && record.verticalHeadApproval) {
    record.status = "approved";
  } else {
    record.status = "partially_approved";
  }
  localStorage.setItem(UPLOAD_HISTORY_KEY, JSON.stringify(history));
}

const AdminPartyMenus = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [mealFilter, setMealFilter] = useState<string>("all");
  const [packingConfig, setPackingConfig] = useState<PackingConfig>(getPackingConfig());
  const [comboPackingConfig, setComboPackingConfig] = useState<ComboPackingConfig>(getComboPackingConfig());
  const [uploadHistory, setUploadHistory] = useState<UploadRecord[]>(getUploadHistory());

  const meals = ["all", ...Object.keys(mealLabels)];

  const filteredMenu = useMemo(() => {
    return partyMenu.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchMeal = mealFilter === "all" || item.mealType === mealFilter;
      return matchSearch && matchMeal;
    });
  }, [search, mealFilter]);

  const handleDownloadMasterTemplate = () => {
    const guestCount = 100;
    const headers = [
      "Item ID", "Item Name", "Meal Type", "Category", "Food Type",
      "Portion/Plate", "Unit",
      "MRP ($)", "PPP",
    ];
    const rows = partyMenu.map((item) => {
      const portion = getPortionSize(item.id);
      const mrp = item.pricePerPlateIN;
      // Use middle tier (6-12m = 60%) as default PPP
      const ppp = Math.round(mrp * 0.60 * 100) / 100;
      return [
        item.id, item.name,
        mealLabels[item.mealType] || item.mealType,
        categoryLabels[item.category] || item.category,
        item.foodType,
        portion?.portionPerPlate || "", portion?.unit || "",
        mrp,
        ppp,
      ];
    });
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws["!cols"] = headers.map(() => ({ wch: 18 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Party Master");
    XLSX.writeFile(wb, "party-master-template.xlsx");
    toast({ title: "📥 Master template downloaded" });
  };

  const handleUploadExcel = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls,.csv";
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const record: UploadRecord = {
        id: `upl-${Date.now()}`,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        uploadedBy: "Super Admin",
        itemCount: partyMenu.length,
        status: "pending",
      };
      saveUploadRecord(record);
      setUploadHistory(getUploadHistory());
      toast({ title: "📂 File received", description: "Upload recorded. Pending approval before applying changes." });
    };
    input.click();
  };

  const handleRoleApprove = (id: string, role: "party_manager" | "vertical_head") => {
    const roleName = role === "party_manager" ? "Party Order Manager" : "Vertical Head";
    approveUploadByRole(id, role, roleName);
    const updated = getUploadHistory();
    setUploadHistory(updated);
    const record = updated.find((r) => r.id === id);
    if (record?.status === "approved") {
      toast({ title: "✅ Fully Approved", description: "Both approvals received. Changes applied to system." });
    } else {
      toast({ title: `👍 ${roleName} approved`, description: "Waiting for second approval to apply changes." });
    }
  };

  const handleSavePackingConfig = () => {
    savePackingConfig(packingConfig);
    toast({ title: "✅ Bulk packing config saved" });
  };

  const handleSaveComboPackingConfig = () => {
    saveComboPackingConfig(comboPackingConfig);
    toast({ title: "✅ Combo packing config saved" });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">🍽️ Party Menu Management</h1>
        <p className="text-sm text-muted-foreground">View menus, download templates, and manage packing configurations</p>
      </div>

      <Tabs defaultValue="menus">
        <TabsList className="flex-wrap">
          <TabsTrigger value="menus" className="gap-1.5"><UtensilsCrossed className="w-3.5 h-3.5" /> Menus</TabsTrigger>
          <TabsTrigger value="templates" className="gap-1.5"><FileSpreadsheet className="w-3.5 h-3.5" /> Templates</TabsTrigger>
          <TabsTrigger value="packing" className="gap-1.5"><Package className="w-3.5 h-3.5" /> Packing</TabsTrigger>
          
        </TabsList>

        {/* Menus Tab */}
        <TabsContent value="menus" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search menu items..." className="pl-9" />
            </div>
            <div className="flex gap-1 flex-wrap">
              {meals.map((m) => (
                <button
                  key={m}
                  onClick={() => setMealFilter(m)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    mealFilter === m ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border"
                  }`}
                >
                  {m === "all" ? "All" : mealLabels[m]?.split(" ")[1] || m}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            {filteredMenu.map((item) => {
              const portion = getPortionSize(item.id);
              return (
                <Card key={item.id} className="p-3 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{item.name}</span>
                      <Badge variant={item.foodType === "veg" ? "default" : "destructive"} className="text-[9px] h-4">
                        {item.foodType === "veg" ? "V" : "NV"}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">{mealLabels[item.mealType]?.split(" ")[1]}</span>
                      <span className="text-[10px] text-muted-foreground">•</span>
                      <span className="text-[10px] text-muted-foreground">{categoryLabels[item.category]}</span>
                      {portion && <><span className="text-[10px] text-muted-foreground">•</span><span className="text-[10px] text-primary font-medium">{portion.portionPerPlate}/plate</span></>}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground">${item.pricePerPlateIN}</span>
                </Card>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground text-center">{filteredMenu.length} items</p>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4 mt-4">
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold">Master Party Template</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Single Excel file with all menu items, portions, MRP, and PPP pricing across all kitchen age tiers. Download, edit, and re-upload to update everything at once.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleDownloadMasterTemplate} className="py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center justify-center gap-1.5">
                <Download className="w-4 h-4" /> Download Excel
              </button>
              <button onClick={handleUploadExcel} className="py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 flex items-center justify-center gap-1.5">
                <Upload className="w-4 h-4" /> Upload Excel
              </button>
            </div>
          </Card>

          {/* Upload History */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">Upload History</h3>
            </div>
            {uploadHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No uploads yet. Upload an Excel file to see history here.</p>
            ) : (
              <div className="space-y-2">
                {uploadHistory.map((record) => (
                  <div key={record.id} className="border border-border rounded-lg p-3 space-y-1.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold text-foreground">{record.fileName}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Uploaded by <span className="font-medium text-foreground">{record.uploadedBy}</span> · {new Date(record.uploadedAt).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{record.itemCount} items</p>
                      </div>
                      {record.status === "pending" ? (
                        <Badge className="bg-amber-100 text-amber-800 text-[10px] gap-1">
                          <Clock className="w-3 h-3" /> Pending (0/2)
                        </Badge>
                      ) : record.status === "partially_approved" ? (
                        <Badge className="bg-blue-100 text-blue-800 text-[10px] gap-1">
                          <Clock className="w-3 h-3" /> Partial (1/2)
                        </Badge>
                      ) : record.status === "approved" ? (
                        <Badge className="bg-green-100 text-green-800 text-[10px] gap-1">
                          <CheckCircle className="w-3 h-3" /> Applied ✅
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 text-[10px]">Rejected</Badge>
                      )}
                    </div>

                    {/* Approval status for each role */}
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div className={`rounded-lg p-2 text-[10px] border ${record.partyManagerApproval ? "bg-emerald-50 border-emerald-200" : "bg-secondary border-border"}`}>
                        <p className="font-medium text-foreground">🎯 Party Order Manager</p>
                        {record.partyManagerApproval ? (
                          <p className="text-emerald-700 mt-0.5">✅ {record.partyManagerApproval.by}<br />{new Date(record.partyManagerApproval.at).toLocaleString()}</p>
                        ) : (
                          <p className="text-muted-foreground mt-0.5">⏳ Awaiting</p>
                        )}
                      </div>
                      <div className={`rounded-lg p-2 text-[10px] border ${record.verticalHeadApproval ? "bg-emerald-50 border-emerald-200" : "bg-secondary border-border"}`}>
                        <p className="font-medium text-foreground">👔 Vertical Head</p>
                        {record.verticalHeadApproval ? (
                          <p className="text-emerald-700 mt-0.5">✅ {record.verticalHeadApproval.by}<br />{new Date(record.verticalHeadApproval.at).toLocaleString()}</p>
                        ) : (
                          <p className="text-muted-foreground mt-0.5">⏳ Awaiting</p>
                        )}
                      </div>
                    </div>

                    {/* Approval buttons */}
                    {record.status !== "approved" && (
                      <div className="flex gap-2 mt-1">
                        {!record.partyManagerApproval && (
                          <button onClick={() => handleRoleApprove(record.id, "party_manager")} className="text-[10px] px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
                            🎯 Approve as Party Manager
                          </button>
                        )}
                        {!record.verticalHeadApproval && (
                          <button onClick={() => handleRoleApprove(record.id, "vertical_head")} className="text-[10px] px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
                            👔 Approve as Vertical Head
                          </button>
                        )}
                      </div>
                    )}

                    {record.status === "approved" && (
                      <p className="text-[10px] text-emerald-700 bg-emerald-50 rounded px-2 py-1 mt-1">
                        ✅ Both approvals received — changes applied to system
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Packing Tab */}
        <TabsContent value="packing" className="space-y-4 mt-4">
          {/* Bulk Food Packing */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-primary" /> 🍲 Bulk Food Packing
            </h3>
            <p className="text-[10px] text-muted-foreground mb-3">
              Volume-based: Every 5 Kg/5L = 1 box. Piece items charged flat.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Box Cost ($)</label>
                <Input type="number" value={packingConfig.boxCostRupees} onChange={(e) => setPackingConfig(prev => ({ ...prev, boxCostRupees: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Kg per Box</label>
                <Input type="number" value={packingConfig.volumePerBoxKg} onChange={(e) => setPackingConfig(prev => ({ ...prev, volumePerBoxKg: parseInt(e.target.value) || 5 }))} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Litres per Box</label>
                <Input type="number" value={packingConfig.volumePerBoxLitres} onChange={(e) => setPackingConfig(prev => ({ ...prev, volumePerBoxLitres: parseInt(e.target.value) || 5 }))} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Per-Piece Cost ($)</label>
                <Input type="number" value={packingConfig.pieceCostRupees} onChange={(e) => setPackingConfig(prev => ({ ...prev, pieceCostRupees: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <button onClick={handleSavePackingConfig} className="mt-4 w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90">
              Save Bulk Config
            </button>
          </Card>

          {/* Combo Meal Box Packing */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-orange-500" /> 🍱 Combo Meal Box Packing
            </h3>
            <p className="text-[10px] text-muted-foreground mb-3">
              Per-box charges for individual combo meal boxes. Total = ${getComboPackingCostPerBox(comboPackingConfig)}/box
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Box Cost ($/box)</label>
                <Input type="number" value={comboPackingConfig.boxCostPerUnit} onChange={(e) => setComboPackingConfig(prev => ({ ...prev, boxCostPerUnit: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Label/Sticker ($/box)</label>
                <Input type="number" value={comboPackingConfig.labelCostPerUnit} onChange={(e) => setComboPackingConfig(prev => ({ ...prev, labelCostPerUnit: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Seal/Wrap ($/box)</label>
                <Input type="number" value={comboPackingConfig.sealWrapCostPerUnit} onChange={(e) => setComboPackingConfig(prev => ({ ...prev, sealWrapCostPerUnit: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Carry Bag ($/box)</label>
                <Input type="number" value={comboPackingConfig.bagCostPerUnit} onChange={(e) => setComboPackingConfig(prev => ({ ...prev, bagCostPerUnit: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="mt-3 p-2.5 rounded-lg bg-accent/50 border border-border">
              <p className="text-xs text-foreground font-medium">
                Total per combo box: <span className="text-primary font-bold">${getComboPackingCostPerBox(comboPackingConfig)}</span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">= Box + Label + Seal + Bag</p>
            </div>
            <button onClick={handleSaveComboPackingConfig} className="mt-4 w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90">
              Save Combo Config
            </button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPartyMenus;
