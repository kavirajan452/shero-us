import { useState, useMemo, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload, Leaf, FileSpreadsheet, Download, AlertTriangle, CheckCircle2, X, Eye,
  ChevronDown, ChevronUp, Clock, User, Mail, Plus, ClipboardList,
  BarChart3, Building2, MapPin, UtensilsCrossed, TrendingUp, PieChart,
  ShieldCheck, XCircle, Search, ImageIcon, Store, Ban, Video, Tag
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { brandedCuisineMasters, type BrandedCuisineMaster, type MasterMenuItem } from "@/data/masterMenuData";
import {
  comboCategoryConfigs,
  comboMenuItems,
  type ComboCategory,
  type ComboFoodType,
  type ComboItem,
} from "@/data/comboMenuData";
import { useRegion } from "@/contexts/RegionContext";
import { useToast } from "@/hooks/use-toast";
import { getAdminRole, ADMIN_ROLES } from "@/data/adminRoles";
import * as XLSX from "xlsx";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

/* ── Upload History Record ── */
interface UploadRecord {
  id: string;
  cuisine: string;
  uploadedAt: Date;
  uploadedBy: string;
  itemCount: number;
  categoryCount: number;
  fileName: string;
  approvalSentAt: Date | null;
  status: "pending_approval" | "approved" | "rejected";
}

const INITIAL_UPLOAD_HISTORY: UploadRecord[] = [
  {
    id: "rec_1",
    cuisine: "Chettinad",
    uploadedAt: new Date("2026-02-15T10:30:00"),
    uploadedBy: "Arvind S.",
    itemCount: 16,
    categoryCount: 6,
    fileName: "Chettinad_menu_v3.xlsx",
    approvalSentAt: new Date("2026-02-15T10:32:00"),
    status: "approved",
  },
  {
    id: "rec_2",
    cuisine: "Kerala",
    uploadedAt: new Date("2026-02-20T14:15:00"),
    uploadedBy: "Arvind S.",
    itemCount: 5,
    categoryCount: 3,
    fileName: "Kerala_menu_v1.xlsx",
    approvalSentAt: new Date("2026-02-20T14:17:00"),
    status: "approved",
  },
  {
    id: "rec_3",
    cuisine: "Andhra",
    uploadedAt: new Date("2026-02-28T09:45:00"),
    uploadedBy: "Arvind S.",
    itemCount: 8,
    categoryCount: 4,
    fileName: "Andhra_menu_update.xlsx",
    approvalSentAt: null,
    status: "pending_approval",
  },
];

function formatDateTime(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) + ", " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

/* ── Bulk Upload Dialog ── */
interface ParsedRow {
  name: string;
  category: string;
  description: string;
  volume: string;
  isVeg: boolean;
  imageUrl: string;
  majorVegetables: string[];
  brand: string;
  videoUrl: string;
  packingChargeFlat: number;
  packingChargePct: number;
  statePrices: Record<string, number>;
  ppp0to6: number;
  ppp6to12: number;
  ppp12plus: number;
  error?: string;
}

function BulkUploadDialog({
  open, onOpenChange, cuisine, onImportComplete,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  cuisine: BrandedCuisineMaster;
  onImportComplete: (record: Omit<UploadRecord, "id">) => void;
}) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");

  const states = cuisine.states;
  const validRows = parsed.filter((r) => !r.error);
  const errorRows = parsed.filter((r) => r.error);

  const downloadTemplate = () => {
    const mrpHeaders = states.map((s) => `MRP ${s} (₹)`);
    const pppHeaders = ["PPP 0-6m (65%)", "PPP 6-12m (60%)", "PPP 12m+ (55%)"];
    const headers = ["Item Name", "Category", "Description", "Volume", "Veg (Y/N)", "Photo URL", "Major Vegetables", "Brand", "Video URL", "Packing ₹ (Flat)", "Packing % (Pct)", ...mrpHeaders, ...pppHeaders];
    const fixedStart = 12; // first MRP column index (0-based) in the row
    const makeSample = (name: string, desc: string, vegs: string, video: string, mrps: number[]) => {
      const row: any[] = [name, "Sambar", desc, "450 ml", "Y", "https://example.com/photo.jpg", vegs, "SHF", video, 5, 3, ...mrps];
      // PPP columns as Excel formulas referencing first MRP column
      const firstMrpCell = XLSX.utils.encode_col(fixedStart) + "ROW";
      row.push({ t: "n", v: mrps[0] * 0.65, f: `ROUND(${XLSX.utils.encode_col(fixedStart)}ROW*0.65,0)` });
      row.push({ t: "n", v: mrps[0] * 0.60, f: `ROUND(${XLSX.utils.encode_col(fixedStart)}ROW*0.60,0)` });
      row.push({ t: "n", v: mrps[0] * 0.55, f: `ROUND(${XLSX.utils.encode_col(fixedStart)}ROW*0.55,0)` });
      return row;
    };
    const sample = [
      makeSample("Carrot Sambar", "Lentils with carrot & spices", "Carrot, Dal/Lentils, Tamarind", "https://youtube.com/watch?v=example", states.map((_, i) => i === 0 ? 167 : 200)),
      makeSample("Beans Sambar", "Lentils with beans & spices", "Beans, Dal/Lentils, Tamarind", "", states.map((_, i) => i === 0 ? 174 : 210)),
    ];
    // Fix formula row references
    sample.forEach((row, si) => {
      const excelRow = si + 2; // row 2, 3, etc.
      for (let c = row.length - 3; c < row.length; c++) {
        if (row[c] && row[c].f) row[c].f = row[c].f.replace(/ROW/g, String(excelRow));
      }
    });
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sample]);
    ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 2, 14) }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Menu Items");
    XLSX.writeFile(wb, `${cuisine.cuisine}_menu_template.xlsx`);
    toast({ title: "Template downloaded", description: `Fill in items for ${cuisine.cuisine} and upload back` });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParseError("");
    setParsed([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (rows.length < 2) { setParseError("File is empty or has no data rows."); return; }

        const headerRow = rows[0].map((h: any) => String(h).trim().toLowerCase());
        const nameIdx = headerRow.findIndex((h) => h.includes("item name") || h === "name");
        const catIdx = headerRow.findIndex((h) => h.includes("category"));
        const descIdx = headerRow.findIndex((h) => h.includes("description"));
        const volIdx = headerRow.findIndex((h) => h.includes("volume"));
        const vegIdx = headerRow.findIndex((h) => h.includes("veg") && !h.includes("vegetable"));
        const photoIdx = headerRow.findIndex((h) => h.includes("photo") || h.includes("image"));
        const vegListIdx = headerRow.findIndex((h) => h.includes("major vegetable") || h.includes("vegetables"));
        if (nameIdx === -1 || catIdx === -1) { setParseError("Missing required columns: 'Item Name', 'Category'. Please use the template."); return; }

        const brandIdx = headerRow.findIndex((h) => h.includes("brand"));
        const videoIdx = headerRow.findIndex((h) => h.includes("video"));
        const packFlatIdx = headerRow.findIndex((h) => h.includes("packing") && (h.includes("flat") || h.includes("₹")));
        const packPctIdx = headerRow.findIndex((h) => h.includes("packing") && (h.includes("pct") || h.includes("%")));

        const ppp06Idx = headerRow.findIndex((h) => h.includes("ppp") && h.includes("0-6") || h.includes("65%"));
        const ppp612Idx = headerRow.findIndex((h) => h.includes("ppp") && h.includes("6-12") || h.includes("60%"));
        const ppp12Idx = headerRow.findIndex((h) => h.includes("ppp") && h.includes("12m") || h.includes("55%"));

        const stateColMap: Record<string, number> = {};
        states.forEach((sc) => {
          const idx = headerRow.findIndex((h) => (h.includes(`mrp ${sc.toLowerCase()}`) || h.includes(`price ${sc.toLowerCase()}`) || h.includes(sc.toLowerCase())) && !h.includes("ppp"));
          if (idx !== -1) stateColMap[sc] = idx;
        });

        const parsedRows: ParsedRow[] = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0 || !row[nameIdx]) continue;
          const name = String(row[nameIdx] ?? "").trim();
          const category = String(row[catIdx] ?? "").trim();
          const description = descIdx !== -1 ? String(row[descIdx] ?? "").trim() : "";
          const volume = volIdx !== -1 ? String(row[volIdx] ?? "450 ml").trim() : "450 ml";
          const vegVal = vegIdx !== -1 ? String(row[vegIdx] ?? "Y").trim().toUpperCase() : "Y";
          const isVeg = vegVal === "Y" || vegVal === "YES" || vegVal === "TRUE" || vegVal === "1";
          const imageUrl = photoIdx !== -1 ? String(row[photoIdx] ?? "").trim() : "";
          const vegListRaw = vegListIdx !== -1 ? String(row[vegListIdx] ?? "").trim() : "";
          const majorVegetables = vegListRaw ? vegListRaw.split(",").map((v) => v.trim()).filter(Boolean) : [];
          const brand = brandIdx !== -1 ? String(row[brandIdx] ?? "SHF").trim() : "SHF";
          const videoUrl = videoIdx !== -1 ? String(row[videoIdx] ?? "").trim() : "";
          const packingChargeFlat = packFlatIdx !== -1 ? Number(row[packFlatIdx]) || 5 : 5;
          const packingChargePct = packPctIdx !== -1 ? Number(row[packPctIdx]) || 3 : 3;
          const sp: Record<string, number> = {};
          Object.entries(stateColMap).forEach(([sc, idx]) => { const val = Number(row[idx]); if (val > 0) sp[sc] = val; });
          const hasAnyStatePrice = Object.values(sp).some((v) => v > 0);
          const firstMrp = Object.values(sp)[0] || 0;
          const ppp0to6 = ppp06Idx !== -1 ? Number(row[ppp06Idx]) || Math.round(firstMrp * 0.65) : Math.round(firstMrp * 0.65);
          const ppp6to12 = ppp612Idx !== -1 ? Number(row[ppp612Idx]) || Math.round(firstMrp * 0.60) : Math.round(firstMrp * 0.60);
          const ppp12plus = ppp12Idx !== -1 ? Number(row[ppp12Idx]) || Math.round(firstMrp * 0.55) : Math.round(firstMrp * 0.55);
          let error: string | undefined;
          if (!name) error = "Missing item name";
          else if (!category) error = "Missing category";
          else if (!hasAnyStatePrice) error = "No state prices provided";
          parsedRows.push({ name, category, description, volume, isVeg, imageUrl, majorVegetables, brand, videoUrl, packingChargeFlat, packingChargePct, statePrices: sp, ppp0to6, ppp6to12, ppp12plus, error });
        }
        if (parsedRows.length === 0) { setParseError("No valid data rows found in the file."); return; }
        setParsed(parsedRows);
      } catch { setParseError("Failed to parse file. Please ensure it's a valid .xlsx or .csv file."); }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = () => {
    const categories = [...new Set(validRows.map((r) => r.category))];
    const adminName = localStorage.getItem("shero-admin-name") || "Unknown";
    onImportComplete({
      cuisine: cuisine.cuisine, uploadedAt: new Date(), uploadedBy: adminName,
      itemCount: validRows.length, categoryCount: categories.length, fileName,
      approvalSentAt: null, status: "pending_approval",
    });
    toast({ title: "Menu Uploaded", description: `${validRows.length} items imported for ${cuisine.cuisine}. Pending approval.` });
    setParsed([]); setFileName(""); onOpenChange(false);
  };

  const reset = () => { setParsed([]); setFileName(""); setParseError(""); if (fileRef.current) fileRef.current.value = ""; };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <span className="text-xl">{cuisine.emoji}</span> Upload Menu — SHF {cuisine.cuisine}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground mb-2">
              Upload an Excel file with columns: <span className="font-semibold text-foreground">Item Name, Category, Description, Volume, Veg (Y/N), Photo URL, Major Vegetables, Brand, Video URL, Packing ₹ (Flat), Packing % (Pct), MRP per state, PPP 0-6m (65%), PPP 6-12m (60%), PPP 12m+ (55%)</span>. PPP columns auto-calculate from MRP if left blank.
            </p>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={downloadTemplate}>
              <Download className="w-3.5 h-3.5" /> Download Template
            </Button>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Select File</Label>
            <div className="flex items-center gap-2">
              <Input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="h-9 text-xs file:text-xs" />
              {fileName && <button onClick={reset} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4 text-muted-foreground" /></button>}
            </div>
          </div>
          {parseError && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">{parseError}</p>
            </div>
          )}
          {parsed.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-xs gap-1"><CheckCircle2 className="w-3 h-3 text-accent" /> {validRows.length} valid</Badge>
                {errorRows.length > 0 && <Badge variant="destructive" className="text-xs gap-1"><AlertTriangle className="w-3 h-3" /> {errorRows.length} errors</Badge>}
              </div>
              <div className="overflow-x-auto rounded-lg border border-border max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-[10px] font-semibold w-8">#</TableHead>
                      <TableHead className="text-[10px] font-semibold w-10">Photo</TableHead>
                      <TableHead className="text-[10px] font-semibold">Item Name</TableHead>
                      <TableHead className="text-[10px] font-semibold">Category</TableHead>
                      <TableHead className="text-[10px] font-semibold">Volume</TableHead>
                      <TableHead className="text-[10px] font-semibold">Veg</TableHead>
                      <TableHead className="text-[10px] font-semibold">Major Vegetables</TableHead>
                      <TableHead className="text-[10px] font-semibold">Brand</TableHead>
                      <TableHead className="text-[10px] font-semibold">Video URL</TableHead>
                      <TableHead className="text-[10px] font-semibold text-right">Packing ₹</TableHead>
                      <TableHead className="text-[10px] font-semibold text-right">Packing %</TableHead>
                      {states.map((s) => <TableHead key={s} className="text-[10px] font-semibold text-center">MRP {s}</TableHead>)}
                      <TableHead className="text-[10px] font-semibold text-right text-accent">PPP 0-6m</TableHead>
                      <TableHead className="text-[10px] font-semibold text-right text-yellow-600">PPP 6-12m</TableHead>
                      <TableHead className="text-[10px] font-semibold text-right text-destructive">PPP 12m+</TableHead>
                      <TableHead className="text-[10px] font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsed.map((row, idx) => (
                      <TableRow key={idx} className={row.error ? "bg-destructive/5" : ""}>
                        <TableCell className="text-[10px] text-muted-foreground p-2">{idx + 1}</TableCell>
                        <TableCell className="p-2">
                          {row.imageUrl ? (
                            <div className="w-8 h-8 rounded overflow-hidden bg-muted shrink-0">
                              <img src={row.imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded bg-muted/60 flex items-center justify-center"><ImageIcon className="w-3 h-3 text-muted-foreground" /></div>
                          )}
                        </TableCell>
                        <TableCell className="text-xs font-medium p-2">{row.name || "—"}</TableCell>
                        <TableCell className="text-[10px] p-2">{row.category || "—"}</TableCell>
                        <TableCell className="text-[10px] p-2">{row.volume}</TableCell>
                        <TableCell className="p-2">{row.isVeg ? <Leaf className="w-3 h-3 text-accent" /> : <span className="text-[10px] text-muted-foreground">NV</span>}</TableCell>
                        <TableCell className="p-2">
                          {row.majorVegetables.length > 0 ? (
                            <div className="flex flex-wrap gap-0.5">
                              {row.majorVegetables.map((v, vi) => (
                                <Badge key={vi} variant="secondary" className="text-[8px] px-1 py-0">{v}</Badge>
                              ))}
                            </div>
                          ) : <span className="text-[10px] text-muted-foreground/50">—</span>}
                        </TableCell>
                        <TableCell className="p-2">
                          <Badge variant="secondary" className="text-[8px] px-1 py-0">{row.brand}</Badge>
                        </TableCell>
                        <TableCell className="p-2 text-[10px] text-muted-foreground max-w-[100px] truncate">
                          {row.videoUrl ? <a href={row.videoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">🎬 Link</a> : "—"}
                        </TableCell>
                        <TableCell className="text-[10px] text-right p-2">₹{row.packingChargeFlat}</TableCell>
                        <TableCell className="text-[10px] text-right p-2">{row.packingChargePct}%</TableCell>
                        {states.map((s) => <TableCell key={s} className="text-[10px] text-center p-2">{row.statePrices[s] ? `₹${row.statePrices[s]}` : <span className="text-muted-foreground/50">—</span>}</TableCell>)}
                        <TableCell className="text-[10px] text-right p-2 text-accent font-medium">₹{row.ppp0to6}</TableCell>
                        <TableCell className="text-[10px] text-right p-2 text-yellow-600 font-medium">₹{row.ppp6to12}</TableCell>
                        <TableCell className="text-[10px] text-right p-2 text-destructive font-medium">₹{row.ppp12plus}</TableCell>
                        <TableCell className="p-2">{row.error ? <span className="text-[9px] text-destructive">{row.error}</span> : <CheckCircle2 className="w-3.5 h-3.5 text-accent" />}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="mt-2">
          <Button variant="outline" size="sm" onClick={() => { reset(); onOpenChange(false); }}>Cancel</Button>
          <Button size="sm" onClick={handleImport} disabled={validRows.length === 0} className="gap-1"><Upload className="w-3.5 h-3.5" /> Import {validRows.length} Items</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Cuisine Menu Preview (inline expandable) ── */
function CuisineMenuPreview({ cuisine }: { cuisine: BrandedCuisineMaster }) {
  const { formatPrice } = useRegion();
  const [packingMode, setPackingMode] = useState<"flat" | "percent" | "both">("both");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const allBrands = useMemo(() => [...new Set(cuisine.menuItems.map((i) => i.brand))], [cuisine]);
  const categories = useMemo(() => [...new Set(cuisine.menuItems.map((i) => i.category))], [cuisine]);

  return (
    <div className="space-y-3 p-4 border-t border-border bg-muted/20">
      {/* PPP Kitchen Age Legend */}
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
        <span className="font-semibold text-foreground">PPP by Kitchen Age:</span>
        <span>🟢 0-6 mo (65%)</span>
        <span>🟡 6-12 mo (60%)</span>
        <span>🔴 12+ mo (55%)</span>
      </div>

      {categories.map((cat) => {
        const items = cuisine.menuItems.filter((i) => i.category === cat && (selectedBrand === "all" || i.brand === selectedBrand));
        return (
          <div key={cat}>
            <h4 className="text-xs font-semibold text-foreground mb-1.5">{cat} <span className="text-muted-foreground font-normal">({items.length})</span></h4>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-[10px] font-semibold w-10">Photo</TableHead>
                    <TableHead className="text-[10px] font-semibold">Item Name</TableHead>
                    <TableHead className="text-[10px] font-semibold">
                      <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                        <SelectTrigger className="h-5 w-[80px] text-[10px] border-none bg-transparent p-0 gap-0.5 font-semibold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="text-xs">All Brands</SelectItem>
                          {allBrands.map((b) => (
                            <SelectItem key={b} value={b} className="text-xs">{b}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableHead>
                    <TableHead className="text-[10px] font-semibold">Volume</TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">MRP</TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">
                      <Select value={packingMode} onValueChange={(v) => setPackingMode(v as "flat" | "percent" | "both")}>
                        <SelectTrigger className="h-5 w-[100px] text-[10px] border-none bg-transparent p-0 gap-0.5 font-semibold justify-end">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flat" className="text-xs">Packing ₹ (Flat)</SelectItem>
                          <SelectItem value="percent" className="text-xs">Packing % </SelectItem>
                          <SelectItem value="both" className="text-xs">Packing (Both)</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">PPP 0-6m</TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">PPP 6-12m</TableHead>
                    <TableHead className="text-[10px] font-semibold text-right">PPP 12m+</TableHead>
                    <TableHead className="text-[10px] font-semibold text-center">Video</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const prices = item.statePrices.filter((sp) => cuisine.states.includes(sp.stateCode) && sp.price > 0);
                    const minP = Math.min(...prices.map((p) => p.price));
                    const maxP = Math.max(...prices.map((p) => p.price));
                    const minPPP = Math.min(...prices.map((p) => p.ppp));
                    const maxPPP = Math.max(...prices.map((p) => p.ppp));
                    const minPPP6 = Math.min(...prices.map((p) => p.ppp6to12));
                    const maxPPP6 = Math.max(...prices.map((p) => p.ppp6to12));
                    const minPPP12 = Math.min(...prices.map((p) => p.ppp12plus));
                    const maxPPP12 = Math.max(...prices.map((p) => p.ppp12plus));
                    const priceRange = (min: number, max: number) => min === max ? formatPrice(min) : `${formatPrice(min)}–${formatPrice(max)}`;

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="p-2">
                          {item.image ? (
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted shrink-0">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                              <ImageIcon className="w-3 h-3 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="p-2">
                          <div className="flex items-center gap-1">
                            {item.isVeg && <Leaf className="w-3 h-3 text-accent shrink-0" />}
                            <span className="text-xs font-medium text-foreground">{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="p-2">
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                            <Tag className="w-2.5 h-2.5 mr-0.5" />{item.brand}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[10px] text-muted-foreground p-2">{item.volume}</TableCell>
                        <TableCell className="text-xs font-semibold text-foreground text-right p-2">{priceRange(minP, maxP)}</TableCell>
                        <TableCell className="text-xs text-foreground text-right p-2">
                          {packingMode === "flat" && `₹${item.packingChargeFlat}`}
                          {packingMode === "percent" && `${item.packingChargePct}%`}
                          {packingMode === "both" && `₹${item.packingChargeFlat} + ${item.packingChargePct}%`}
                        </TableCell>
                        <TableCell className="text-[10px] text-right p-2 text-accent font-medium">{priceRange(minPPP, maxPPP)}</TableCell>
                        <TableCell className="text-[10px] text-right p-2 text-yellow-600 font-medium">{priceRange(minPPP6, maxPPP6)}</TableCell>
                        <TableCell className="text-[10px] text-right p-2 text-destructive font-medium">{priceRange(minPPP12, maxPPP12)}</TableCell>
                        <TableCell className="text-center p-2">
                          {item.videoUrl ? (
                            <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center">
                              <Video className="w-4 h-4 text-destructive hover:text-destructive/80" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground/40 text-[10px]">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        );
      })}
      {cuisine.menuItems.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">No menu items yet. Upload an Excel file to get started.</p>
      )}
    </div>
  );
}

/* ── Upload History Table ── */
function UploadHistory({ records }: { records: UploadRecord[] }) {
  if (records.length === 0) return null;
  return (
    <div className="border-t border-border bg-muted/10 px-4 py-3">
      <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Upload History</h4>
      <div className="space-y-1.5">
        {records.map((rec) => (
          <div key={rec.id} className="flex items-center gap-3 text-xs rounded-md bg-card border border-border/50 px-3 py-2">
            <FileSpreadsheet className="w-3.5 h-3.5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-foreground">{rec.fileName}</span>
              <span className="text-muted-foreground ml-2">· {rec.itemCount} items · {rec.categoryCount} categories</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
              <User className="w-3 h-3" /><span>{rec.uploadedBy}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
              <Clock className="w-3 h-3" /><span>{formatDateTime(rec.uploadedAt)}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {rec.approvalSentAt ? (
                <span className="flex items-center gap-1 text-[10px] text-accent"><Mail className="w-3 h-3" /> Approved {formatDateTime(rec.approvalSentAt)}</span>
              ) : (
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-muted-foreground/40 text-muted-foreground">Pending Approval</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Add New Branded Cuisine Dialog ── */
const ALL_STATES = ["TN", "AP", "TS", "KA", "KL", "MH", "GJ", "RJ", "DL", "PB"];
const EMOJI_OPTIONS = ["🍛", "🥥", "🌶️", "🫓", "🥗", "🏜️", "🥘", "🍗", "🫕", "🍲", "🥙", "🍚"];

function AddCuisineDialog({ open, onOpenChange, onAdd }: {
  open: boolean; onOpenChange: (v: boolean) => void; onAdd: (cuisine: BrandedCuisineMaster) => void;
}) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🍛");
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const { toast } = useToast();

  const toggleState = (s: string) => setSelectedStates((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const handleAdd = () => {
    if (!name.trim() || selectedStates.length === 0) return;
    onAdd({ cuisine: name.trim(), emoji, kitchens: 0, states: selectedStates, menuItems: [] });
    toast({ title: "Cuisine Added", description: `SHF – ${name.trim()} created. Upload a menu to get started.` });
    setName(""); setEmoji("🍛"); setSelectedStates([]); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="text-base">Add New Branded Cuisine</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Cuisine Name</Label>
            <Input placeholder="e.g. Bengali, Hyderabadi, Konkani…" value={name} onChange={(e) => setName(e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Icon</Label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_OPTIONS.map((e) => (
                <button key={e} onClick={() => setEmoji(e)} className={`w-9 h-9 rounded-lg border text-lg flex items-center justify-center transition-colors ${emoji === e ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted"}`}>{e}</button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Operating States</Label>
            <p className="text-[10px] text-muted-foreground">Select the states where this cuisine will be available.</p>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {ALL_STATES.map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={selectedStates.includes(s)} onCheckedChange={() => toggleState(s)} />
                  <span className="text-xs text-foreground">{s}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="mt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={handleAdd} disabled={!name.trim() || selectedStates.length === 0} className="gap-1"><Plus className="w-3.5 h-3.5" /> Add Cuisine</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════
   MENU STATISTICS — Menu-specific stats (SHF & HCF menu counts)
   ═══════════════════════════════════════════════════════════ */

const HCF_MENU_MOCK = {
  totalMenuItems: 1845,
  stateWise: [
    { state: "Tamil Nadu", code: "TN", items: 420 },
    { state: "Karnataka", code: "KA", items: 310 },
    { state: "Andhra Pradesh", code: "AP", items: 265 },
    { state: "Maharashtra", code: "MH", items: 230 },
    { state: "Kerala", code: "KL", items: 195 },
    { state: "Telangana", code: "TS", items: 170 },
    { state: "Delhi NCR", code: "DL", items: 110 },
    { state: "Gujarat", code: "GJ", items: 80 },
    { state: "Punjab", code: "PB", items: 40 },
    { state: "Rajasthan", code: "RJ", items: 25 },
  ],
  cuisineSplit: [
    { cuisine: "South Indian", count: 520, color: "hsl(var(--primary))" },
    { cuisine: "North Indian", count: 380, color: "hsl(var(--accent))" },
    { cuisine: "Andhra / Telugu", count: 265, color: "hsl(25 95% 53%)" },
    { cuisine: "Kerala", count: 195, color: "hsl(160 60% 45%)" },
    { cuisine: "Mughlai", count: 180, color: "hsl(280 60% 50%)" },
    { cuisine: "Gujarati", count: 150, color: "hsl(45 90% 50%)" },
    { cuisine: "Others", count: 155, color: "hsl(var(--muted-foreground))" },
  ],
};

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-4.5 h-4.5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground leading-tight">{label}</p>
          <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
          {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function MenuStatistics({ allCuisines }: { allCuisines: BrandedCuisineMaster[] }) {
  const totalSHFItems = allCuisines.reduce((s, c) => s + c.menuItems.length, 0);
  const totalSHFCategories = allCuisines.reduce((s, c) => s + new Set(c.menuItems.map((i) => i.category)).size, 0);

  const shfBarData = allCuisines.map((c) => ({
    name: c.cuisine,
    items: c.menuItems.length,
    categories: new Set(c.menuItems.map((i) => i.category)).size,
  }));

  const shfChartConfig = {
    items: { label: "Menu Items", color: "hsl(var(--primary))" },
    categories: { label: "Categories", color: "hsl(var(--accent))" },
  };

  const hcfBarConfig = {
    items: { label: "Menu Items", color: "hsl(var(--primary))" },
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={UtensilsCrossed} label="SHF Menu Items" value={totalSHFItems} sub={`${allCuisines.length} cuisines`} />
        <StatCard icon={ClipboardList} label="SHF Categories" value={totalSHFCategories} />
        <StatCard icon={UtensilsCrossed} label="HCF Menu Items" value={HCF_MENU_MOCK.totalMenuItems} sub="Home Chef" />
        <StatCard icon={UtensilsCrossed} label="Total Menu Items" value={totalSHFItems + HCF_MENU_MOCK.totalMenuItems} sub="SHF + HCF" />
      </div>

      {/* SHF Menu Stats */}
      <div>
        <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" /> SHF — Branded Menu Items by Cuisine
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Items & Categories by Cuisine</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-3">
              <ChartContainer config={shfChartConfig} className="h-[220px] w-full">
                <BarChart data={shfBarData} margin={{ top: 4, right: 8, bottom: 4, left: -12 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-30} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="items" fill="var(--color-items)" radius={[3, 3, 0, 0]} barSize={14} />
                  <Bar dataKey="categories" fill="var(--color-categories)" radius={[3, 3, 0, 0]} barSize={14} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Cuisine Menu Details</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="overflow-auto max-h-[230px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-[10px] font-semibold">Cuisine</TableHead>
                      <TableHead className="text-[10px] font-semibold text-center">Items</TableHead>
                      <TableHead className="text-[10px] font-semibold text-center">Categories</TableHead>
                      <TableHead className="text-[10px] font-semibold text-center">States</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allCuisines.map((c) => (
                      <TableRow key={c.cuisine}>
                        <TableCell className="text-xs py-1.5 px-2">
                          <span className="mr-1.5">{c.emoji}</span>{c.cuisine}
                        </TableCell>
                        <TableCell className="text-xs text-center py-1.5">{c.menuItems.length}</TableCell>
                        <TableCell className="text-xs text-center py-1.5">{new Set(c.menuItems.map((i) => i.category)).size}</TableCell>
                        <TableCell className="text-[10px] text-center text-muted-foreground py-1.5">{c.states.length}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* HCF Menu Stats */}
      <div>
        <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" /> HCF — Home Chef Menu Items
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold text-muted-foreground">State-wise Menu Items</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-3">
              <ChartContainer config={hcfBarConfig} className="h-[220px] w-full">
                <BarChart data={HCF_MENU_MOCK.stateWise} margin={{ top: 4, right: 8, bottom: 4, left: -12 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis dataKey="code" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="items" fill="var(--color-items)" radius={[3, 3, 0, 0]} barSize={20} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold text-muted-foreground">Cuisine-wise Menu Split</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="space-y-2">
                {HCF_MENU_MOCK.cuisineSplit.map((cs) => {
                  const pct = Math.round((cs.count / HCF_MENU_MOCK.totalMenuItems) * 100);
                  return (
                    <div key={cs.cuisine} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: cs.color }} />
                      <span className="text-xs text-foreground flex-1">{cs.cuisine}</span>
                      <span className="text-xs font-semibold text-foreground">{cs.count}</span>
                      <span className="text-[10px] text-muted-foreground w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SHARED KITCHEN TYPES (SAP + HCF)
   ═══════════════════════════════════════════════════════════ */

interface KitchenMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  isVeg: boolean;
  image: string;
  category: string;
  servingSize: string;
}

interface ApprovalRecord {
  action: "approved" | "rejected";
  approverName: string;
  approverEmail: string;
  approverRole: string;
  timestamp: Date;
  remarks: string;
}

interface KitchenRecord {
  skid: string;
  partnerName: string;
  rmn: string;
  kitchenName: string;
  cuisine: string;
  city: string;
  state: string;
  status: "pending" | "approved" | "rejected" | "closed";
  licenceNumber: string;
  licenceExpiry: Date;
  menuItems: KitchenMenuItem[];
  approvalHistory: ApprovalRecord[];
  stream: "SAP" | "HCF";
  closedReason?: string;
}

/* ── Helper: days until licence expiry ── */
function daysUntilExpiry(d: Date): number {
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function LicenceExpiryBadge({ expiry }: { expiry: Date }) {
  const days = daysUntilExpiry(expiry);
  if (days < 0) return <Badge variant="destructive" className="text-[9px] gap-1"><AlertTriangle className="w-2.5 h-2.5" /> Expired</Badge>;
  if (days <= 30) return <Badge className="text-[9px] gap-1 bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800"><Clock className="w-2.5 h-2.5" /> {days}d left</Badge>;
  return <Badge variant="secondary" className="text-[9px]">{expiry.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</Badge>;
}

/* ── Auto-close expired kitchens ── */
function autoCloseExpired(kitchens: KitchenRecord[]): KitchenRecord[] {
  return kitchens.map((k) => {
    if (k.status === "approved" && daysUntilExpiry(k.licenceExpiry) < 0) {
      return { ...k, status: "closed" as const, closedReason: "Licence expired" };
    }
    return k;
  });
}

/* ── Mock SAP Kitchens ── */
const MOCK_SAP_KITCHENS: KitchenRecord[] = [
  {
    skid: "SAP-CHN-001", partnerName: "Sujatha M.", rmn: "98765•••10", kitchenName: "SHF Chettinad Veg – Anna Nagar",
    cuisine: "Chettinad", city: "Chennai", state: "TN", status: "pending", stream: "SAP",
    licenceNumber: "FSSAI-TN-2024-78901", licenceExpiry: new Date("2026-03-20"),
    menuItems: [
      { id: "s1", name: "Chettinad Sambar", description: "Classic Chettinad sambar with shallots", price: 167, isVeg: true, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop", category: "Sambar", servingSize: "450 ml" },
      { id: "s2", name: "Appam", description: "Lacy rice-flour hoppers, soft centre", price: 89, isVeg: true, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&h=200&fit=crop", category: "Tiffin", servingSize: "3 pcs" },
    ],
    approvalHistory: [],
  },
  {
    skid: "SAP-BLR-003", partnerName: "Lakshmi R.", rmn: "76543•••98", kitchenName: "SHF Andhra – Koramangala",
    cuisine: "Andhra", city: "Bangalore", state: "KA", status: "approved", stream: "SAP",
    licenceNumber: "FSSAI-KA-2025-12345", licenceExpiry: new Date("2027-01-15"),
    menuItems: [
      { id: "s3", name: "Gongura Chicken", description: "Sorrel-leaf chicken curry", price: 239, isVeg: false, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200&h=200&fit=crop", category: "Main Course", servingSize: "350 ml" },
    ],
    approvalHistory: [
      { action: "approved", approverName: "Meera R.", approverEmail: "onboarding@shero.in", approverRole: "Onboarding Manager", timestamp: new Date("2026-02-18T10:00:00"), remarks: "All documents verified. Kitchen approved." },
    ],
  },
  {
    skid: "SAP-MUM-007", partnerName: "Anita D.", rmn: "54321•••76", kitchenName: "SHF Gujarati – Andheri",
    cuisine: "Gujarati", city: "Mumbai", state: "MH", status: "rejected", stream: "SAP",
    licenceNumber: "FSSAI-MH-2025-55678", licenceExpiry: new Date("2026-04-10"),
    menuItems: [
      { id: "s4", name: "Undhiyu", description: "Mixed vegetable casserole", price: 189, isVeg: true, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop", category: "Main Course", servingSize: "400 gm" },
    ],
    approvalHistory: [
      { action: "rejected", approverName: "Meera R.", approverEmail: "onboarding@shero.in", approverRole: "Onboarding Manager", timestamp: new Date("2026-02-22T16:00:00"), remarks: "FSSAI licence copy not legible. Re-upload required." },
    ],
  },
];

/* ── Mock HCF Kitchens ── */
const MOCK_HCF_KITCHENS: KitchenRecord[] = [
  {
    skid: "HCF-CHN-001", partnerName: "Lakshmi D.", rmn: "98765•••10", kitchenName: "Lakshmi's Kitchen",
    cuisine: "South Indian", city: "Chennai", state: "TN", status: "pending", stream: "HCF",
    licenceNumber: "FSSAI-TN-2025-44321", licenceExpiry: new Date("2026-03-25"),
    menuItems: [
      { id: "h1", name: "Idli Sambar Combo", description: "Soft steamed idlis served with hot sambar and coconut chutney", price: 89, isVeg: true, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&h=200&fit=crop", category: "Breakfast", servingSize: "4 pcs" },
      { id: "h2", name: "Masala Dosa", description: "Crispy rice crepe filled with spiced potato masala", price: 109, isVeg: true, image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=200&h=200&fit=crop", category: "Breakfast", servingSize: "1 pc" },
      { id: "h3", name: "Chicken Chettinad", description: "Spicy Chettinad-style chicken curry", price: 219, isVeg: false, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200&h=200&fit=crop", category: "Main Course", servingSize: "350 ml" },
      { id: "h4", name: "Sambar Rice", description: "Comfort rice mixed with lentil sambar", price: 129, isVeg: true, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop", category: "Rice", servingSize: "400 gm" },
    ],
    approvalHistory: [],
  },
  {
    skid: "HCF-BLR-005", partnerName: "Meena R.", rmn: "87654•••22", kitchenName: "Meena's Home Bites",
    cuisine: "Karnataka", city: "Bangalore", state: "KA", status: "pending", stream: "HCF",
    licenceNumber: "FSSAI-KA-2025-98765", licenceExpiry: new Date("2026-06-30"),
    menuItems: [
      { id: "h5", name: "Bisi Bele Bath", description: "Traditional Karnataka-style spiced rice", price: 139, isVeg: true, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop", category: "Rice", servingSize: "400 gm" },
      { id: "h6", name: "Ragi Mudde", description: "Finger millet balls with saaru", price: 99, isVeg: true, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&h=200&fit=crop", category: "Main Course", servingSize: "3 pcs" },
    ],
    approvalHistory: [],
  },
  {
    skid: "HCF-HYD-012", partnerName: "Fatima B.", rmn: "91234•••45", kitchenName: "Fatima's Biryani House",
    cuisine: "Hyderabadi", city: "Hyderabad", state: "TS", status: "approved", stream: "HCF",
    licenceNumber: "FSSAI-TS-2024-11111", licenceExpiry: new Date("2026-02-15"),
    menuItems: [
      { id: "h8", name: "Hyderabadi Chicken Biryani", description: "Aromatic dum biryani with tender chicken", price: 259, isVeg: false, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&h=200&fit=crop", category: "Biryani", servingSize: "500 gm" },
      { id: "h9", name: "Mirchi Ka Salan", description: "Spicy curry with green chillies in peanut-sesame gravy", price: 149, isVeg: true, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop", category: "Sides", servingSize: "250 ml" },
    ],
    approvalHistory: [
      { action: "approved", approverName: "Meera R.", approverEmail: "onboarding@shero.in", approverRole: "Onboarding Manager", timestamp: new Date("2026-02-20T11:30:00"), remarks: "Menu quality verified. Approved for listing." },
    ],
  },
  {
    skid: "HCF-MUM-008", partnerName: "Priya S.", rmn: "99876•••33", kitchenName: "Priya's Maharashtrian Delights",
    cuisine: "Maharashtrian", city: "Mumbai", state: "MH", status: "rejected", stream: "HCF",
    licenceNumber: "FSSAI-MH-2025-22222", licenceExpiry: new Date("2027-05-01"),
    menuItems: [
      { id: "h11", name: "Misal Pav", description: "Spicy sprouts curry topped with farsan, served with pav", price: 109, isVeg: true, image: "https://images.unsplash.com/photo-1606491956689-2ea866880049?w=200&h=200&fit=crop", category: "Snacks", servingSize: "1 plate" },
    ],
    approvalHistory: [
      { action: "rejected", approverName: "Meera R.", approverEmail: "onboarding@shero.in", approverRole: "Onboarding Manager", timestamp: new Date("2026-02-25T14:10:00"), remarks: "Photos not clear. Need better food images." },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════
   REUSABLE KTN APPROVAL COMPONENT (SAP & HCF)
   ═══════════════════════════════════════════════════════════ */

function KitchenApprovalTab({ kitchens, setKitchens, stream }: { kitchens: KitchenRecord[]; setKitchens: React.Dispatch<React.SetStateAction<KitchenRecord[]>>; stream: "SAP" | "HCF" }) {
  const [expandedKitchen, setExpandedKitchen] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected" | "closed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [approvalDialog, setApprovalDialog] = useState<{ skid: string; action: "approved" | "rejected" } | null>(null);
  const [remarks, setRemarks] = useState("");
  const { toast } = useToast();
  const { formatPrice } = useRegion();

  const role = getAdminRole();
  const canApprove = role === "onboarding_manager" || role === "super_admin" || role === "country_manager";
  const adminName = localStorage.getItem("shero-admin-name") || "Unknown";
  const adminEmail = localStorage.getItem("shero-admin-rem") || "";
  const adminRoleLabel = role ? (ADMIN_ROLES.find(r => r.key === role)?.label || role) : "";

  const filtered = useMemo(() => {
    let list = kitchens;
    if (filter !== "all") list = list.filter((k) => k.status === filter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((k) =>
        k.kitchenName.toLowerCase().includes(q) ||
        k.skid.toLowerCase().includes(q) ||
        k.cuisine.toLowerCase().includes(q) ||
        k.city.toLowerCase().includes(q) ||
        k.licenceNumber.toLowerCase().includes(q)
      );
    }
    return list;
  }, [kitchens, filter, searchQuery]);

  const counts = useMemo(() => ({
    all: kitchens.length,
    pending: kitchens.filter((k) => k.status === "pending").length,
    approved: kitchens.filter((k) => k.status === "approved").length,
    rejected: kitchens.filter((k) => k.status === "rejected").length,
    closed: kitchens.filter((k) => k.status === "closed").length,
  }), [kitchens]);

  const handleApproval = () => {
    if (!approvalDialog) return;
    setKitchens((prev) =>
      prev.map((k) =>
        k.skid === approvalDialog.skid
          ? {
              ...k,
              status: approvalDialog.action,
              approvalHistory: [
                { action: approvalDialog.action, approverName: adminName, approverEmail: adminEmail, approverRole: adminRoleLabel, timestamp: new Date(), remarks },
                ...k.approvalHistory,
              ],
            }
          : k
      )
    );
    toast({
      title: approvalDialog.action === "approved" ? "Kitchen Approved" : "Kitchen Rejected",
      description: `${approvalDialog.skid} has been ${approvalDialog.action}.`,
    });
    setApprovalDialog(null);
    setRemarks("");
  };

  const statusBadge = (status: KitchenRecord["status"]) => {
    if (status === "approved") return <Badge className="text-[10px] bg-accent/15 text-accent border-accent/30">Approved</Badge>;
    if (status === "rejected") return <Badge variant="destructive" className="text-[10px]">Rejected</Badge>;
    if (status === "closed") return <Badge className="text-[10px] bg-destructive/10 text-destructive border-destructive/30 gap-1"><Ban className="w-2.5 h-2.5" /> Closed</Badge>;
    return <Badge variant="outline" className="text-[10px] border-yellow-500/40 text-yellow-600">Pending</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search kitchen, SKID, licence, cuisine…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-8 text-xs pl-8" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["all", "pending", "approved", "rejected", "closed"] as const).map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" className="text-[10px] h-7 px-2.5 capitalize" onClick={() => setFilter(f)}>
              {f} ({counts[f]})
            </Button>
          ))}
        </div>
      </div>

      {/* Kitchen List */}
      <div className="space-y-2.5">
        {filtered.length === 0 && <div className="text-center py-12 text-sm text-muted-foreground">No kitchens found.</div>}
        {filtered.map((kitchen) => {
          const isExpanded = expandedKitchen === kitchen.skid;
          const categories = [...new Set(kitchen.menuItems.map((i) => i.category))];

          return (
            <Card key={kitchen.skid} className={`border-border overflow-hidden ${kitchen.status === "closed" ? "opacity-75" : ""}`}>
              <CardContent className="p-0">
                {/* Kitchen Header */}
                <div className="flex items-center gap-4 px-5 py-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${kitchen.status === "closed" ? "bg-destructive/10" : "bg-muted/60"}`}>
                    {kitchen.status === "closed" ? <Ban className="w-5 h-5 text-destructive" /> : <Store className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-foreground leading-tight">{kitchen.kitchenName}</h3>
                      {statusBadge(kitchen.status)}
                      {kitchen.closedReason && <span className="text-[9px] text-destructive">({kitchen.closedReason})</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-normal">{kitchen.skid}</Badge>
                      <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-normal">{kitchen.cuisine}</Badge>
                      <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-normal">{kitchen.menuItems.length} items</Badge>
                      <span className="text-[10px] text-muted-foreground">{kitchen.city}, {kitchen.state}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
                        <User className="w-2.5 h-2.5" /> {kitchen.partnerName} · RMN: {kitchen.rmn}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
                        <ClipboardList className="w-2.5 h-2.5" /> {kitchen.licenceNumber}
                      </p>
                      <LicenceExpiryBadge expiry={kitchen.licenceExpiry} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setExpandedKitchen(isExpanded ? null : kitchen.skid)} title="View menu & details">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    {canApprove && kitchen.status !== "approved" && kitchen.status !== "closed" && (
                      <Button size="sm" className="gap-1.5 text-xs h-8 px-3" onClick={() => setApprovalDialog({ skid: kitchen.skid, action: "approved" })}>
                        <ShieldCheck className="w-3.5 h-3.5" /> Approve
                      </Button>
                    )}
                    {canApprove && kitchen.status !== "rejected" && kitchen.status !== "closed" && (
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 px-3 text-destructive border-destructive/30 hover:bg-destructive/5" onClick={() => setApprovalDialog({ skid: kitchen.skid, action: "rejected" })}>
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </Button>
                    )}
                  </div>
                </div>

                {/* Expanded: Menu Items */}
                {isExpanded && (
                  <div className="border-t border-border bg-muted/10">
                    <div className="px-4 py-3 bg-muted/20 border-b border-border">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div><span className="text-muted-foreground block text-[10px]">Licence Number</span><span className="font-medium text-foreground">{kitchen.licenceNumber}</span></div>
                        <div><span className="text-muted-foreground block text-[10px]">Licence Expiry</span><span className="font-medium text-foreground">{kitchen.licenceExpiry.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span> <LicenceExpiryBadge expiry={kitchen.licenceExpiry} /></div>
                        <div><span className="text-muted-foreground block text-[10px]">Stream</span><span className="font-medium text-foreground">{stream}</span></div>
                        <div><span className="text-muted-foreground block text-[10px]">Partner Profile</span><a href={`/admin/partners`} className="text-primary text-xs font-medium hover:underline flex items-center gap-1"><Eye className="w-3 h-3" /> View Profile</a></div>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      {categories.map((cat) => {
                        const items = kitchen.menuItems.filter((i) => i.category === cat);
                        return (
                          <div key={cat}>
                            <h4 className="text-xs font-semibold text-foreground mb-2">{cat} <span className="text-muted-foreground font-normal">({items.length})</span></h4>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {items.map((item) => (
                                <div key={item.id} className="flex gap-3 rounded-lg border border-border bg-card p-3">
                                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      {item.isVeg ? (
                                        <span className="w-3.5 h-3.5 border border-accent rounded-sm flex items-center justify-center shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-accent" /></span>
                                      ) : (
                                        <span className="w-3.5 h-3.5 border border-destructive rounded-sm flex items-center justify-center shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-destructive" /></span>
                                      )}
                                      <span className="text-xs font-semibold text-foreground truncate">{item.name}</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs font-bold text-foreground">{formatPrice(item.price)}</span>
                                      <span className="text-[10px] text-muted-foreground">· {item.servingSize}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Approval History */}
                    {kitchen.approvalHistory.length > 0 && (
                      <div className="border-t border-border px-4 py-3 bg-muted/20">
                        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Approval History</h4>
                        <div className="space-y-1.5">
                          {kitchen.approvalHistory.map((rec, idx) => (
                            <div key={idx} className="flex items-start gap-3 text-xs rounded-md bg-card border border-border/50 px-3 py-2">
                              {rec.action === "approved" ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-foreground capitalize">{rec.action}</span>
                                {rec.remarks && <p className="text-[10px] text-muted-foreground mt-0.5">"{rec.remarks}"</p>}
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                                <User className="w-3 h-3" /><span>{rec.approverName}</span>
                              </div>
                              <Badge variant="secondary" className="text-[9px] shrink-0">{rec.approverRole}</Badge>
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                                <Clock className="w-3 h-3" /><span>{formatDateTime(rec.timestamp)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Approval Dialog */}
      <Dialog open={!!approvalDialog} onOpenChange={(v) => { if (!v) { setApprovalDialog(null); setRemarks(""); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              {approvalDialog?.action === "approved" ? (
                <><ShieldCheck className="w-4 h-4 text-accent" /> Approve Kitchen</>
              ) : (
                <><XCircle className="w-4 h-4 text-destructive" /> Reject Kitchen</>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              {approvalDialog?.action === "approved"
                ? "This kitchen and its menu will go live and be visible to customers."
                : "This kitchen will be marked as rejected. The partner will be notified."}
            </p>
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <User className="w-3 h-3 text-muted-foreground" />
                <span className="text-foreground font-medium">{adminName}</span>
                <Badge variant="secondary" className="text-[9px]">{adminRoleLabel}</Badge>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Mail className="w-3 h-3" /><span>{adminEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Clock className="w-3 h-3" /><span>{formatDateTime(new Date())}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Remarks</Label>
              <Textarea
                placeholder={approvalDialog?.action === "approved" ? "Optional remarks…" : "Reason for rejection (required)…"}
                value={remarks} onChange={(e) => setRemarks(e.target.value)} className="text-xs min-h-[70px]"
              />
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" size="sm" onClick={() => { setApprovalDialog(null); setRemarks(""); }}>Cancel</Button>
            <Button
              size="sm" variant={approvalDialog?.action === "approved" ? "default" : "destructive"}
              onClick={handleApproval} disabled={approvalDialog?.action === "rejected" && !remarks.trim()} className="gap-1"
            >
              {approvalDialog?.action === "approved" ? <><ShieldCheck className="w-3.5 h-3.5" /> Confirm Approval</> : <><XCircle className="w-3.5 h-3.5" /> Confirm Rejection</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   INGREDIENT GRID MANAGEMENT — Admin-side vegetable/ingredient grid
   ═══════════════════════════════════════════════════════════ */

const REGIONAL_LANGS = [
  { key: "hi", label: "Hindi" },
  { key: "ta", label: "Tamil" },
  { key: "te", label: "Telugu" },
  { key: "kn", label: "Kannada" },
  { key: "ml", label: "Malayalam" },
  { key: "bn", label: "Bengali" },
  { key: "mr", label: "Marathi" },
  { key: "gu", label: "Gujarati" },
] as const;

type RegLangKey = typeof REGIONAL_LANGS[number]["key"];
type IngredientItem = { id: string; name: string; emoji: string } & Record<string, string>;

const MASTER_INGREDIENTS: IngredientItem[] = [
  { id: "v1", name: "Tomato", emoji: "🍅", hi: "टमाटर", ta: "தக்காளி", te: "టమాటా", kn: "ಟೊಮೇಟೊ", ml: "തക്കാളി", bn: "টমেটো", mr: "टोमॅटो", gu: "ટમેટું" },
  { id: "v2", name: "Onion", emoji: "🧅", hi: "प्याज", ta: "வெங்காயம்", te: "ఉల్లిపాయ", kn: "ಈರುಳ್ಳಿ", ml: "ഉള്ളി", bn: "পেঁয়াজ", mr: "कांदा", gu: "ડુંગળી" },
  { id: "v3", name: "Potato", emoji: "🥔", hi: "आलू", ta: "உருளைக்கிழங்கு", te: "బంగాళదుంప", kn: "ಆಲೂಗಡ್ಡೆ", ml: "ഉരുളക്കിഴങ്ങ്", bn: "আলু", mr: "बटाटा", gu: "બટાકા" },
  { id: "v4", name: "Carrot", emoji: "🥕", hi: "गाजर", ta: "கேரட்", te: "కేరట్", kn: "ಕ್ಯಾರೆಟ್", ml: "കാരറ്റ്", bn: "গাজর", mr: "गाजर", gu: "ગાજર" },
  { id: "v5", name: "Beans", emoji: "🫘", hi: "बीन्स", ta: "பீன்ஸ்", te: "చిక్కుడు", kn: "ಬೀನ್ಸ್", ml: "ബീൻസ്", bn: "বিনস", mr: "शेंगा", gu: "ફણસી" },
  { id: "v6", name: "Capsicum", emoji: "🫑", hi: "शिमला मिर्च", ta: "குடைமிளகாய்", te: "క్యాప్సికమ్", kn: "ದೊಣ್ಣೆ ಮೆಣಸು", ml: "കാപ്സിക്കം", bn: "ক্যাপসিকাম", mr: "ढोबळी मिर्ची", gu: "સિમલા મરચું" },
  { id: "v7", name: "Brinjal", emoji: "🍆", hi: "बैंगन", ta: "கத்திரிக்காய்", te: "వంకాయ", kn: "ಬದನೆಕಾಯಿ", ml: "വഴുതനങ്ങ", bn: "বেগুন", mr: "वांगे", gu: "રીંગણ" },
  { id: "v8", name: "Cauliflower", emoji: "🥦", hi: "गोभी", ta: "காலிஃபிளவர்", te: "గోబీ", kn: "ಹೂಕೋಸು", ml: "കോളിഫ്ലവർ", bn: "ফুলকপি", mr: "फ्लॉवर", gu: "ફ્લાવર" },
  { id: "v9", name: "Cabbage", emoji: "🥬", hi: "पत्ता गोभी", ta: "முட்டைக்கோஸ்", te: "క్యాబేజీ", kn: "ಎಲೆಕೋಸು", ml: "കാബേജ്", bn: "বাঁধাকপি", mr: "कोबी", gu: "કોબીજ" },
  { id: "v10", name: "Spinach", emoji: "🥬", hi: "पालक", ta: "கீரை", te: "పాలకూర", kn: "ಪಾಲಕ್", ml: "ചീര", bn: "পালং", mr: "पालक", gu: "પાલક" },
  { id: "v11", name: "Drumstick", emoji: "🥒", hi: "सहजन", ta: "முருங்கை", te: "మునగ", kn: "ನುಗ್ಗೆಕಾಯಿ", ml: "മുരിങ്ങ", bn: "সজনে", mr: "शेवगा", gu: "સરગવો" },
  { id: "v12", name: "Pumpkin", emoji: "🎃", hi: "कद्दू", ta: "பூசணி", te: "గుమ్మడి", kn: "ಕುಂಬಳಕಾಯಿ", ml: "മത്തങ്ങ", bn: "কুমড়ো", mr: "भोपळा", gu: "કોળું" },
  { id: "v13", name: "Bitter Gourd", emoji: "🥒", hi: "करेला", ta: "பாகற்காய்", te: "కాకర", kn: "ಹಾಗಲಕಾಯಿ", ml: "പാവയ്ക്ക", bn: "করলা", mr: "कारले", gu: "કારેલું" },
  { id: "v14", name: "Okra / Lady Finger", emoji: "🟢", hi: "भिंडी", ta: "வெண்டைக்காய்", te: "బెండకాయ", kn: "ಬೆಂಡೆಕಾಯಿ", ml: "വെണ്ടയ്ക്ക", bn: "ঢেঁড়স", mr: "भेंडी", gu: "ભીંડા" },
  { id: "v15", name: "Ridge Gourd", emoji: "🥒", hi: "तोरई", ta: "பீர்க்கங்காய்", te: "బీరకాయ", kn: "ಹೀರೆಕಾಯಿ", ml: "പീച്ചിങ്ങ", bn: "ঝিঙে", mr: "दोडका", gu: "તુરિયા" },
  { id: "v16", name: "Bottle Gourd", emoji: "🥒", hi: "लौकी", ta: "சுரைக்காய்", te: "సొరకాయ", kn: "ಸೋರೆಕಾಯಿ", ml: "ചുരക്ക", bn: "লাউ", mr: "दुधी", gu: "દૂધી" },
  { id: "v17", name: "Green Chili", emoji: "🌶️", hi: "हरी मिर्च", ta: "பச்சை மிளகாய்", te: "పచ్చి మిర్చి", kn: "ಹಸಿ ಮೆಣಸು", ml: "പച്ചമുളക്", bn: "কাঁচা লঙ্কা", mr: "हिरवी मिरची", gu: "લીલું મરચું" },
  { id: "v18", name: "Coriander", emoji: "🌿", hi: "धनिया", ta: "கொத்தமல்லி", te: "కొత్తిమీర", kn: "ಕೊತ್ತಂಬರಿ", ml: "മല്ലി", bn: "ধনে", mr: "कोथिंबीर", gu: "ધાણા" },
  { id: "v19", name: "Curry Leaves", emoji: "🍃", hi: "करी पत्ता", ta: "கறிவேப்பிலை", te: "కరివేపాకు", kn: "ಕರಿಬೇವು", ml: "കറിവേപ്പില", bn: "কারি পাতা", mr: "कढीपत्ता", gu: "મીઠો લીમડો" },
  { id: "v20", name: "Dal / Lentils", emoji: "🫘", hi: "दाल", ta: "பருப்பு", te: "పప్పు", kn: "ಬೇಳೆ", ml: "പരിപ്പ്", bn: "ডাল", mr: "डाळ", gu: "દાળ" },
  { id: "v21", name: "Tamarind", emoji: "🟤", hi: "इमली", ta: "புளி", te: "చింతపండు", kn: "ಹುಣಸೆ", ml: "പുളി", bn: "তেঁতুল", mr: "चिंच", gu: "આમલી" },
  { id: "v22", name: "Coconut", emoji: "🥥", hi: "नारियल", ta: "தேங்காய்", te: "కొబ్బరి", kn: "ತೆಂಗಿನಕಾಯಿ", ml: "തേങ്ങ", bn: "নারকেল", mr: "नारळ", gu: "નારિયેળ" },
  { id: "v23", name: "Ginger", emoji: "🫚", hi: "अदरक", ta: "இஞ்சி", te: "అల్లం", kn: "ಶುಂಠಿ", ml: "ഇഞ്ചി", bn: "আদা", mr: "आले", gu: "આદું" },
  { id: "v24", name: "Garlic", emoji: "🧄", hi: "लहसुन", ta: "பூண்டு", te: "వెల్లుల్లి", kn: "ಬೆಳ್ಳುಳ್ಳಿ", ml: "വെളുത്തുള്ളി", bn: "রসুন", mr: "लसूण", gu: "લસણ" },
];

function IngredientGridManagement() {
  const { toast } = useToast();
  const [ingredients, setIngredients] = useState<IngredientItem[]>(MASTER_INGREDIENTS);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("🥬");
  const [newRegional, setNewRegional] = useState<Record<string, string>>({});
  const [addLang, setAddLang] = useState<RegLangKey>("hi");
  const [displayLang, setDisplayLang] = useState<RegLangKey>("hi");

  const addIngredient = () => {
    if (!newName.trim()) return;
    const id = `v${Date.now()}`;
    const item: IngredientItem = { id, name: newName.trim(), emoji: newEmoji };
    REGIONAL_LANGS.forEach((l) => { item[l.key] = newRegional[l.key]?.trim() || newName.trim(); });
    setIngredients((prev) => [...prev, item]);
    toast({ title: "Ingredient Added", description: `${newName.trim()} added to the master grid.` });
    setNewName(""); setNewEmoji("🥬"); setNewRegional({}); setAddLang("hi");
  };

  const removeIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
    toast({ title: "Ingredient Removed" });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
        <Leaf className="w-5 h-5 text-primary shrink-0" />
        <div>
          <p className="text-xs font-semibold text-foreground">Master Ingredient Grid</p>
          <p className="text-[11px] text-muted-foreground">Define the vegetables/ingredients available for branded cuisine kitchens. This grid syncs to all partner Ingredient Dashboards.</p>
        </div>
      </div>

      {/* Add New */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-xs font-semibold text-muted-foreground">Add New Ingredient</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div className="flex flex-wrap gap-2 items-end">
            <div className="space-y-1">
              <Label className="text-[10px] font-semibold">Emoji</Label>
              <Input value={newEmoji} onChange={(e) => setNewEmoji(e.target.value)} className="h-8 w-16 text-center text-lg" />
            </div>
            <div className="space-y-1 flex-1 min-w-[120px]">
              <Label className="text-[10px] font-semibold">Name (English)</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Sweet Potato" className="h-8 text-xs" />
            </div>
            <Button size="sm" className="gap-1 h-8" onClick={addIngredient} disabled={!newName.trim()}>
              <Plus className="w-3 h-3" /> Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 items-end">
            <div className="space-y-1">
              <Label className="text-[10px] font-semibold">Language</Label>
              <Select value={addLang} onValueChange={(v) => setAddLang(v as RegLangKey)}>
                <SelectTrigger className="h-8 w-[140px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGIONAL_LANGS.map((l) => (
                    <SelectItem key={l.key} value={l.key} className="text-xs">{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 flex-1 min-w-[150px]">
              <Label className="text-[10px] font-semibold">Name in {REGIONAL_LANGS.find((l) => l.key === addLang)?.label}</Label>
              <Input
                value={newRegional[addLang] || ""}
                onChange={(e) => setNewRegional((p) => ({ ...p, [addLang]: e.target.value }))}
                placeholder={`Enter name in ${REGIONAL_LANGS.find((l) => l.key === addLang)?.label}`}
                className="h-8 text-xs"
              />
            </div>
          </div>
          {Object.keys(newRegional).filter((k) => newRegional[k]?.trim()).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(newRegional).filter(([, v]) => v?.trim()).map(([k, v]) => (
                <span key={k} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-[10px] text-foreground">
                  <span className="font-semibold">{REGIONAL_LANGS.find((l) => l.key === k)?.label}:</span> {v}
                  <button onClick={() => setNewRegional((p) => { const n = { ...p }; delete n[k]; return n; })} className="text-muted-foreground hover:text-destructive ml-0.5">×</button>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Language display selector */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold text-muted-foreground">Show in:</span>
        <Select value={displayLang} onValueChange={(v) => setDisplayLang(v as RegLangKey)}>
          <SelectTrigger className="h-8 w-[160px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REGIONAL_LANGS.map((l) => (
              <SelectItem key={l.key} value={l.key} className="text-xs">{l.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {ingredients.map((v) => (
          <div key={v.id} className="relative flex flex-col items-center gap-1 p-3 rounded-xl border border-border bg-card text-center group hover:border-primary/40 transition-colors">
            <button onClick={() => removeIngredient(v.id)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" title="Remove">
              <X className="w-3 h-3" />
            </button>
            <span className="text-2xl leading-none">{v.emoji}</span>
            <span className="text-[10px] font-medium text-foreground leading-tight">{v.name}</span>
            <span className="text-[9px] text-muted-foreground leading-tight">{v[displayLang] || v.hi || v.name}</span>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground">
        {ingredients.length} ingredients in master grid · Showing regional name in {REGIONAL_LANGS.find((l) => l.key === displayLang)?.label} · Changes sync to all partner Ingredient Dashboards automatically
      </p>

      {/* Eligible Menu Items by Ingredient */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
          <UtensilsCrossed className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-xs font-semibold text-foreground">Eligible Menu Items</p>
            <p className="text-[11px] text-muted-foreground">Menu items linked to each ingredient across all branded cuisines. If a partner marks an ingredient unavailable, these items auto-hide.</p>
          </div>
        </div>

        {ingredients.map((ing) => {
          const matchingItems: { cuisine: string; emoji: string; item: MasterMenuItem }[] = [];
          brandedCuisineMasters.forEach((c) => {
            c.menuItems.forEach((item) => {
              if (item.majorVegetables.some((v) => v.toLowerCase() === ing.name.toLowerCase() || v.toLowerCase().includes(ing.name.toLowerCase().split(" ")[0]))) {
                matchingItems.push({ cuisine: c.cuisine, emoji: c.emoji, item });
              }
            });
          });
          if (matchingItems.length === 0) return null;
          return (
            <div key={ing.id} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">{ing.emoji}</span>
                <span className="text-xs font-semibold text-foreground">{ing.name}</span>
                <Badge variant="secondary" className="text-[9px]">{matchingItems.length} items</Badge>
              </div>
              <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                {matchingItems.map((m) => (
                  <div key={m.item.id} className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-border bg-card text-xs">
                    {m.item.image ? (
                      <img src={m.item.image} alt={m.item.name} className="w-8 h-8 rounded-md object-cover shrink-0 bg-muted" />
                    ) : (
                      <div className="w-8 h-8 rounded-md bg-muted/60 flex items-center justify-center shrink-0">
                        <ImageIcon className="w-3 h-3 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-foreground block truncate">{m.item.name}</span>
                      <span className="text-[9px] text-muted-foreground">{m.emoji} {m.cuisine} · {m.item.category}</span>
                    </div>
                    {m.item.isVeg && <Leaf className="w-3 h-3 text-accent shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SUBSCRIPTION PLAN MANAGEMENT — Admin-managed meal plan templates
   ═══════════════════════════════════════════════════════════ */

interface SubscriptionPlan {
  id: string;
  name: string;
  type: "veg" | "non-veg";
  duration: "weekly" | "monthly";
  mealsPerDay: number;
  pricePerMonth: number;
  isActive: boolean;
  features: string[];
}

const SESSIONS = ["Breakfast", "Lunch", "Snacks", "Dinner"] as const;
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

type DayMenu = Record<string, string>;
type WeeklyMenu = Record<string, DayMenu>;

const MOCK_PLANS: SubscriptionPlan[] = [
  { id: "sp1", name: "Veg Daily Tiffin", type: "veg", duration: "monthly", mealsPerDay: 1, pricePerMonth: 2499, isActive: true, features: ["1 meal/day", "Skip any day", "Free delivery"] },
  { id: "sp2", name: "Veg Full Meals", type: "veg", duration: "monthly", mealsPerDay: 2, pricePerMonth: 5999, isActive: true, features: ["Lunch + Dinner", "Weekend specials", "Free delivery"] },
  { id: "sp3", name: "Veg Family Feast", type: "veg", duration: "monthly", mealsPerDay: 3, pricePerMonth: 8999, isActive: true, features: ["3 meals/day", "Serves 4", "Free delivery"] },
  { id: "sp4", name: "Non-Veg Daily Tiffin", type: "non-veg", duration: "monthly", mealsPerDay: 1, pricePerMonth: 2999, isActive: true, features: ["1 meal/day", "Non-veg options", "Free delivery"] },
  { id: "sp5", name: "Non-Veg Full Meals", type: "non-veg", duration: "monthly", mealsPerDay: 2, pricePerMonth: 6999, isActive: true, features: ["Lunch + Dinner", "Non-veg specials", "Free delivery"] },
  { id: "sp6", name: "Veg Weekly Trial", type: "veg", duration: "weekly", mealsPerDay: 2, pricePerMonth: 1499, isActive: true, features: ["7-day trial", "2 meals/day", "Cancel anytime"] },
  { id: "sp7", name: "Non-Veg Weekly Trial", type: "non-veg", duration: "weekly", mealsPerDay: 2, pricePerMonth: 1799, isActive: false, features: ["7-day trial", "2 meals/day", "Cancel anytime"] },
];

/* ── Weekly Menu Editor Dialog ── */
function WeeklyMenuDialog({
  open, onOpenChange, plan, menu, onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  plan: SubscriptionPlan;
  menu: WeeklyMenu;
  onSave: (menu: WeeklyMenu) => void;
}) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<WeeklyMenu>(menu);
  const sessions = SESSIONS.slice(0, Math.max(plan.mealsPerDay, 2));

  const updateCell = (day: string, session: string, value: string) => {
    setDraft((prev) => ({
      ...prev,
      [day]: { ...(prev[day] || {}), [session]: value },
    }));
  };

  const handleSave = () => {
    onSave(draft);
    toast({ title: "Menu Saved", description: `Weekly menu updated for ${plan.name}` });
    onOpenChange(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (rows.length < 2) { toast({ title: "Empty file", variant: "destructive" }); return; }
        const headerRow = rows[0].map((h: any) => String(h).trim());
        const imported: WeeklyMenu = {};
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const day = String(row[0] || "").trim();
          if (!DAYS_OF_WEEK.includes(day as any)) continue;
          const dayMenu: DayMenu = {};
          headerRow.forEach((h, idx) => {
            if (idx === 0) return;
            const sessionMatch = SESSIONS.find((s) => h.toLowerCase().includes(s.toLowerCase()));
            if (sessionMatch && row[idx]) dayMenu[sessionMatch] = String(row[idx]).trim();
          });
          imported[day] = dayMenu;
        }
        setDraft(imported);
        toast({ title: "Imported", description: `Parsed ${Object.keys(imported).length} days from file` });
      } catch { toast({ title: "Parse error", variant: "destructive" }); }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const headers = ["Day", ...sessions.map(String)];
    const rows = DAYS_OF_WEEK.map((d) => [d, ...sessions.map(() => "")]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 4, 18) }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Weekly Menu");
    XLSX.writeFile(wb, `${plan.name.replace(/\s/g, "_")}_menu_template.xlsx`);
  };

  const downloadCurrent = () => {
    const headers = ["Day", ...sessions.map(String)];
    const rows = DAYS_OF_WEEK.map((d) => [d, ...sessions.map((s) => draft[d]?.[s] || "")]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 4, 18) }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Weekly Menu");
    XLSX.writeFile(wb, `${plan.name.replace(/\s/g, "_")}_menu.xlsx`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            {plan.type === "veg" ? <Leaf className="w-4 h-4 text-accent" /> : <span>🍗</span>}
            Weekly Menu — {plan.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={downloadTemplate}>
              <Download className="w-3.5 h-3.5" /> Template
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={downloadCurrent}>
              <Download className="w-3.5 h-3.5" /> Download Current
            </Button>
            <div className="flex-1" />
            <Input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="h-8 text-xs file:text-xs max-w-[220px]" />
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-[10px] font-semibold w-24">Day</TableHead>
                  {sessions.map((s) => (
                    <TableHead key={s} className="text-[10px] font-semibold text-center">{s}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {DAYS_OF_WEEK.map((day) => (
                  <TableRow key={day}>
                    <TableCell className="text-xs font-medium text-foreground p-2">{day}</TableCell>
                    {sessions.map((session) => (
                      <TableCell key={session} className="p-1.5">
                        <Input
                          value={draft[day]?.[session] || ""}
                          onChange={(e) => updateCell(day, session, e.target.value)}
                          placeholder="e.g. Rice + Sambar"
                          className="h-7 text-[10px] border-border/50"
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={handleSave} className="gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Save Menu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SubscriptionPlanManagement() {
  const { toast } = useToast();
  const [plans, setPlans] = useState(MOCK_PLANS);
  const [filter, setFilter] = useState<"all" | "veg" | "non-veg">("all");
  const [weeklyMenus, setWeeklyMenus] = useState<Record<string, WeeklyMenu>>({});
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: "", type: "veg" as "veg" | "non-veg", duration: "monthly" as "weekly" | "monthly", mealsPerDay: 1, pricePerMonth: 0, features: "" });

  const togglePlan = (id: string) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
    toast({ title: "Plan Updated" });
  };

  const handleMenuSave = (planId: string, menu: WeeklyMenu) => {
    setWeeklyMenus((prev) => ({ ...prev, [planId]: menu }));
  };

  const handleAddPlan = () => {
    if (!newPlan.name.trim() || newPlan.pricePerMonth <= 0) return;
    const plan: SubscriptionPlan = {
      id: `sp_${Date.now()}`,
      name: newPlan.name.trim(),
      type: newPlan.type,
      duration: newPlan.duration,
      mealsPerDay: newPlan.mealsPerDay,
      pricePerMonth: newPlan.pricePerMonth,
      isActive: true,
      features: newPlan.features.split(",").map((f) => f.trim()).filter(Boolean),
    };
    setPlans((prev) => [...prev, plan]);
    toast({ title: "Plan Created", description: `${plan.name} added successfully` });
    setNewPlan({ name: "", type: "veg", duration: "monthly", mealsPerDay: 1, pricePerMonth: 0, features: "" });
    setShowAddPlan(false);
  };

  const filtered = filter === "all" ? plans : plans.filter(p => p.type === filter);
  const activePlans = plans.filter(p => p.isActive).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
        <ClipboardList className="w-5 h-5 text-primary shrink-0" />
        <div>
          <p className="text-xs font-semibold text-foreground">Subscription Plan Templates</p>
          <p className="text-[11px] text-muted-foreground">Manage Veg & Non-Veg weekly/monthly meal plan templates shown to customers. "Make Your Own Meal" plan coming soon.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4"><p className="text-[10px] text-muted-foreground">Total Plans</p><p className="text-2xl font-bold text-foreground">{plans.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-[10px] text-muted-foreground">Active</p><p className="text-2xl font-bold text-primary">{activePlans}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-[10px] text-muted-foreground">Inactive</p><p className="text-2xl font-bold text-muted-foreground">{plans.length - activePlans}</p></CardContent></Card>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="flex gap-1.5 flex-1">
          {(["all", "veg", "non-veg"] as const).map(f => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" className="text-[10px] h-7 px-3 capitalize gap-1" onClick={() => setFilter(f)}>
              {f === "veg" && <Leaf className="w-3 h-3" />}
              {f === "all" ? "All" : f === "veg" ? "Veg" : "Non-Veg"}
            </Button>
          ))}
        </div>
        <Button size="sm" className="gap-1.5 h-7 text-[10px]" onClick={() => setShowAddPlan(true)}>
          <Plus className="w-3 h-3" /> Add Plan
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(plan => {
          const hasMenu = weeklyMenus[plan.id] && Object.keys(weeklyMenus[plan.id]).length > 0;
          const isExpanded = expandedPlan === plan.id;
          const sessions = SESSIONS.slice(0, Math.max(plan.mealsPerDay, 2));
          return (
            <Card key={plan.id} className={`border-border overflow-hidden ${!plan.isActive ? "opacity-60" : ""}`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {plan.type === "veg" ? <Leaf className="w-4 h-4 text-accent" /> : <span className="text-sm">🍗</span>}
                    <h3 className="text-sm font-semibold text-foreground">{plan.name}</h3>
                  </div>
                  <Switch checked={plan.isActive} onCheckedChange={() => togglePlan(plan.id)} />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] capitalize">{plan.duration}</Badge>
                  <Badge variant="secondary" className="text-[10px]">{plan.mealsPerDay} meal{plan.mealsPerDay > 1 ? "s" : ""}/day</Badge>
                </div>
                <p className="text-xl font-bold text-foreground">₹{plan.pricePerMonth.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/{plan.duration === "weekly" ? "week" : "month"}</span></p>
                <ul className="space-y-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-accent shrink-0" /> {f}
                    </li>
                  ))}
                </ul>

                {/* Add / Edit Menu */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" className="gap-1.5 text-[10px] h-7 flex-1" onClick={() => setEditingPlan(plan)}>
                    <FileSpreadsheet className="w-3 h-3" /> {hasMenu ? "Edit Menu" : "Add Menu"}
                  </Button>
                  {hasMenu && (
                    <Button variant="ghost" size="sm" className="gap-1 text-[10px] h-7" onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {isExpanded ? "Hide" : "View"}
                    </Button>
                  )}
                </div>

                {/* Inline day-wise preview */}
                {hasMenu && isExpanded && (
                  <div className="overflow-x-auto rounded-lg border border-border mt-1">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="text-[9px] font-semibold p-1.5 w-14">Day</TableHead>
                          {sessions.map((s) => (
                            <TableHead key={s} className="text-[9px] font-semibold text-center p-1.5">{s}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {DAYS_OF_WEEK.map((day) => (
                          <TableRow key={day}>
                            <TableCell className="text-[9px] font-medium p-1.5">{day.slice(0, 3)}</TableCell>
                            {sessions.map((s) => (
                              <TableCell key={s} className="text-[9px] text-center p-1.5 text-muted-foreground">
                                {weeklyMenus[plan.id]?.[day]?.[s] || <span className="text-muted-foreground/40">—</span>}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Make Your Own placeholder */}
      <Card className="border-dashed border-2 border-primary/30">
        <CardContent className="p-6 text-center">
          <p className="text-sm font-semibold text-foreground mb-1">🍽️ Make Your Own Meal Plan</p>
          <p className="text-xs text-muted-foreground">Coming soon — Customers will be able to customize their own subscription by picking cuisines, meals, and delivery schedule.</p>
        </CardContent>
      </Card>

      {/* Weekly Menu Editor Dialog */}
      {editingPlan && (
        <WeeklyMenuDialog
          open={!!editingPlan}
          onOpenChange={(v) => { if (!v) setEditingPlan(null); }}
          plan={editingPlan}
          menu={weeklyMenus[editingPlan.id] || {}}
          onSave={(menu) => handleMenuSave(editingPlan.id, menu)}
        />
      )}

      {/* Add Plan Dialog */}
      <Dialog open={showAddPlan} onOpenChange={setShowAddPlan}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Create New Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Plan Name</Label>
              <Input value={newPlan.name} onChange={(e) => setNewPlan((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Veg Premium Meals" className="h-8 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Type</Label>
                <Select value={newPlan.type} onValueChange={(v: "veg" | "non-veg") => setNewPlan((p) => ({ ...p, type: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="veg">Veg</SelectItem>
                    <SelectItem value="non-veg">Non-Veg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Duration</Label>
                <Select value={newPlan.duration} onValueChange={(v: "weekly" | "monthly") => setNewPlan((p) => ({ ...p, duration: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Meals per Day</Label>
                <Input type="number" min={1} max={4} value={newPlan.mealsPerDay} onChange={(e) => setNewPlan((p) => ({ ...p, mealsPerDay: Number(e.target.value) }))} className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Price (₹)</Label>
                <Input type="number" min={0} value={newPlan.pricePerMonth || ""} onChange={(e) => setNewPlan((p) => ({ ...p, pricePerMonth: Number(e.target.value) }))} placeholder="2499" className="h-8 text-xs" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Features (comma-separated)</Label>
              <Input value={newPlan.features} onChange={(e) => setNewPlan((p) => ({ ...p, features: e.target.value }))} placeholder="e.g. 2 meals/day, Free delivery, Skip any day" className="h-8 text-xs" />
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" size="sm" onClick={() => setShowAddPlan(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAddPlan} disabled={!newPlan.name.trim() || newPlan.pricePerMonth <= 0} className="gap-1">
              <Plus className="w-3.5 h-3.5" /> Create Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   COMBO MENU MANAGEMENT — Upload/Download/View combo items
   ═══════════════════════════════════════════════════════════ */
function ComboMenuManagement() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<ComboCategory>("tiffin");
  const [selectedFoodType, setSelectedFoodType] = useState<ComboFoodType>("veg");
  const [parsedRows, setParsedRows] = useState<ComboItem[]>([]);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const role = getAdminRole();
  const canUpload = role === "country_manager" || role === "super_admin";

  const currentItems = comboMenuItems[selectedCategory][selectedFoodType];

  const downloadTemplate = () => {
    const headers = [
      "Item ID", "Item Name", "Emoji", "Sub-Category", "Description",
      "Portion Size", "Portion Unit", "Veg/Non-Veg", "Category (tiffin/snacks/lunch)",
      "Photo URL", "Brand", "Video URL",
      "MRP (₹)", "Packing ₹ (Flat)", "Packing % (Pct)",
      "PPP 0-6m (65%)", "PPP 6-12m (60%)", "PPP 12m+ (55%)"
    ];
    const sampleRows = currentItems.slice(0, 3).map((item) => {
      const mrp = item.price;
      return [
        item.id,
        item.name,
        item.emoji,
        item.subCategory,
        "",
        item.portionSize,
        item.portionUnit,
        selectedFoodType === "veg" ? "Veg" : "Non-Veg",
        selectedCategory,
        "",
        "SHF",
        "",
        mrp,
        5,
        3,
        Math.round(mrp * 0.65),
        Math.round(mrp * 0.60),
        Math.round(mrp * 0.55),
      ];
    });
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 2, 14) }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Combo Items");
    XLSX.writeFile(wb, `combo_${selectedCategory}_${selectedFoodType}_template.xlsx`);
    toast({ title: "Template downloaded", description: `Combo ${selectedCategory} (${selectedFoodType}) template ready` });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParseError("");
    setParsedRows([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (rows.length < 2) { setParseError("File is empty or has no data rows."); return; }

        const headerRow = rows[0].map((h: any) => String(h).trim().toLowerCase());
        const nameIdx = headerRow.findIndex(h => h.includes("item name") || h === "name");
        const emojiIdx = headerRow.findIndex(h => h.includes("emoji"));
        const subCatIdx = headerRow.findIndex(h => h.includes("sub-category") || h.includes("subcategory"));
        const portionIdx = headerRow.findIndex(h => h.includes("portion size"));
        const unitIdx = headerRow.findIndex(h => h.includes("portion unit") || h.includes("unit"));
        const priceIdx = headerRow.findIndex(h => h.includes("mrp") || h.includes("price"));

        if (nameIdx === -1) { setParseError("Missing 'Item Name' column."); return; }

        const parsed: ComboItem[] = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || !row[nameIdx]) continue;
          parsed.push({
            id: `combo-${Date.now()}-${i}`,
            name: String(row[nameIdx]).trim(),
            emoji: emojiIdx !== -1 ? String(row[emojiIdx] ?? "🍽️").trim() : "🍽️",
            subCategory: subCatIdx !== -1 ? String(row[subCatIdx] ?? "Main").trim() : "Main",
            portionSize: portionIdx !== -1 ? Number(row[portionIdx]) || 100 : 100,
            portionUnit: unitIdx !== -1 ? String(row[unitIdx] ?? "g").trim() : "g",
            price: priceIdx !== -1 ? Number(row[priceIdx]) || 0 : 0,
          });
        }
        if (parsed.length === 0) { setParseError("No valid data rows found."); return; }
        setParsedRows(parsed);
      } catch { setParseError("Failed to parse file."); }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = () => {
    toast({ title: "✅ Combo menu uploaded", description: `${parsedRows.length} items imported for ${selectedCategory} (${selectedFoodType}). Pending dual approval.` });
    setParsedRows([]); setFileName(""); setParseError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const reset = () => { setParsedRows([]); setFileName(""); setParseError(""); if (fileRef.current) fileRef.current.value = ""; };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">🍱 Combo Box Menu Items</h3>
          <p className="text-[10px] text-muted-foreground">Upload and manage items for combo meal boxes (3–8 items per box)</p>
        </div>
        <div className="flex gap-1.5">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value as ComboCategory)} className="px-2 py-1 rounded-md border border-border bg-background text-foreground text-xs">
            {comboCategoryConfigs.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
          </select>
          <select value={selectedFoodType} onChange={(e) => setSelectedFoodType(e.target.value as ComboFoodType)} className="px-2 py-1 rounded-md border border-border bg-background text-foreground text-xs">
            <option value="veg">🥬 Veg</option>
            <option value="non-veg">🍗 Non-Veg</option>
          </select>
        </div>
      </div>

      {/* Current items table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs flex items-center gap-1.5">
            {comboCategoryConfigs.find(c => c.id === selectedCategory)?.emoji} {comboCategoryConfigs.find(c => c.id === selectedCategory)?.label} — {selectedFoodType === "veg" ? "🥬 Veg" : "🍗 Non-Veg"}
            <Badge variant="secondary" className="text-[10px] ml-auto">{currentItems.length} items</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-[10px] font-semibold w-8">#</TableHead>
                  <TableHead className="text-[10px] font-semibold">Item</TableHead>
                  <TableHead className="text-[10px] font-semibold">Sub-Category</TableHead>
                  <TableHead className="text-[10px] font-semibold text-right">Portion</TableHead>
                  <TableHead className="text-[10px] font-semibold text-right">MRP (₹)</TableHead>
                  <TableHead className="text-[10px] font-semibold text-right text-accent">PPP 0-6m</TableHead>
                  <TableHead className="text-[10px] font-semibold text-right text-yellow-600">PPP 6-12m</TableHead>
                  <TableHead className="text-[10px] font-semibold text-right text-destructive">PPP 12m+</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((item, idx) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-[10px] text-muted-foreground p-2">{idx + 1}</TableCell>
                    <TableCell className="text-xs font-medium p-2">
                      <span className="mr-1">{item.emoji}</span>{item.name}
                    </TableCell>
                    <TableCell className="text-[10px] p-2">{item.subCategory}</TableCell>
                    <TableCell className="text-[10px] text-right p-2">{item.portionSize} {item.portionUnit}</TableCell>
                    <TableCell className="text-xs font-semibold text-right p-2">₹{item.price}</TableCell>
                    <TableCell className="text-[10px] text-right p-2 text-accent font-medium">₹{Math.round(item.price * 0.65)}</TableCell>
                    <TableCell className="text-[10px] text-right p-2 text-yellow-600 font-medium">₹{Math.round(item.price * 0.60)}</TableCell>
                    <TableCell className="text-[10px] text-right p-2 text-destructive font-medium">₹{Math.round(item.price * 0.55)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* PPP Kitchen Age Legend */}
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
        <span className="font-semibold text-foreground">PPP by Kitchen Age:</span>
        <span>🟢 0-6 mo (65%)</span>
        <span>🟡 6-12 mo (60%)</span>
        <span>🔴 12+ mo (55%)</span>
      </div>

      {/* Box pricing info */}
      <div className="bg-secondary/50 border border-border rounded-lg p-3 text-xs space-y-1">
        <p className="font-semibold text-foreground">📦 Box Pricing</p>
        {comboCategoryConfigs.map(c => (
          <div key={c.id} className="flex justify-between">
            <span className="text-muted-foreground">{c.emoji} {c.label} (pick {c.minItems}–{c.maxItems} items)</span>
            <span className="font-semibold text-foreground">₹{c.pricePerBox}/box</span>
          </div>
        ))}
      </div>

      {/* Upload section */}
      {canUpload && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-primary" /> Upload Combo Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-[10px] text-muted-foreground mb-2">
                Template columns: <span className="font-semibold text-foreground">Item ID, Item Name, Emoji, Sub-Category, Description, Portion Size, Portion Unit, Veg/Non-Veg, Category, Photo URL, Brand, Video URL, MRP (₹), Packing ₹ (Flat), Packing % (Pct), PPP 0-6m (65%), PPP 6-12m (60%), PPP 12m+ (55%)</span>. PPP columns auto-calculate from MRP if left blank.
              </p>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={downloadTemplate}>
                <Download className="w-3.5 h-3.5" /> Download Template
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Select File</Label>
              <div className="flex items-center gap-2">
                <Input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="h-9 text-xs file:text-xs" />
                {fileName && <button onClick={reset} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4 text-muted-foreground" /></button>}
              </div>
            </div>

            {parseError && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">{parseError}</p>
              </div>
            )}

            {parsedRows.length > 0 && (
              <div className="space-y-2">
                <Badge variant="secondary" className="text-xs gap-1"><CheckCircle2 className="w-3 h-3 text-accent" /> {parsedRows.length} items parsed</Badge>
                <div className="overflow-x-auto rounded-lg border border-border max-h-[200px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-[10px] font-semibold">#</TableHead>
                        <TableHead className="text-[10px] font-semibold">Item</TableHead>
                        <TableHead className="text-[10px] font-semibold">Sub-Cat</TableHead>
                        <TableHead className="text-[10px] font-semibold text-right">Portion</TableHead>
                        <TableHead className="text-[10px] font-semibold text-right">MRP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedRows.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-[10px] p-2">{idx + 1}</TableCell>
                          <TableCell className="text-xs p-2">{row.emoji} {row.name}</TableCell>
                          <TableCell className="text-[10px] p-2">{row.subCategory}</TableCell>
                          <TableCell className="text-[10px] text-right p-2">{row.portionSize} {row.portionUnit}</TableCell>
                          <TableCell className="text-xs font-semibold text-right p-2">₹{row.price}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={reset}>Cancel</Button>
                  <Button size="sm" className="gap-1" onClick={handleImport}>
                    <Upload className="w-3.5 h-3.5" /> Import {parsedRows.length} Items
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-accent/10 border border-accent/30 rounded-lg p-2 text-[10px] text-muted-foreground">
              <p className="font-medium text-foreground mb-0.5">⚠️ Dual Approval Required</p>
              <p>Uploaded combo menus need approval from Party Order Manager + Vertical Head before going live.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE — Menu Management (7 tabs)
   ═══════════════════════════════════════════════════════════ */
export default function AdminMenus() {
  const [uploadCuisine, setUploadCuisine] = useState<BrandedCuisineMaster | null>(null);
  const [expandedCuisine, setExpandedCuisine] = useState<string | null>(null);
  const [uploadHistory, setUploadHistory] = useState<UploadRecord[]>(INITIAL_UPLOAD_HISTORY);
  const [addedCuisines, setAddedCuisines] = useState<BrandedCuisineMaster[]>([]);
  const [showAddCuisine, setShowAddCuisine] = useState(false);

  // Lifted kitchen state — auto-close expired on init
  const [sapKitchens, setSapKitchens] = useState<KitchenRecord[]>(() => autoCloseExpired(MOCK_SAP_KITCHENS));
  const [hcfKitchens, setHcfKitchens] = useState<KitchenRecord[]>(() => autoCloseExpired(MOCK_HCF_KITCHENS));

  const role = getAdminRole();
  const canUpload = role === "country_manager" || role === "super_admin";
  const allCuisines = useMemo(() => [...brandedCuisineMasters, ...addedCuisines], [addedCuisines]);
  const totalItems = allCuisines.reduce((s, c) => s + c.menuItems.length, 0);

  const handleImportComplete = (record: Omit<UploadRecord, "id">) => {
    setUploadHistory((prev) => [{ ...record, id: `rec_${Date.now()}` }, ...prev]);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Menu Management</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {allCuisines.length} branded cuisines · {totalItems} menu items
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <div className="overflow-x-auto -mx-1 px-1">
          <TabsList className="inline-flex w-auto min-w-full sm:min-w-0 gap-1 h-auto p-1">
            <TabsTrigger value="upload" className="gap-1.5 text-[11px] px-3 py-2 whitespace-nowrap">
              <Upload className="w-3.5 h-3.5 shrink-0" /> <span className="hidden sm:inline">Branded</span> Menu
            </TabsTrigger>
            <TabsTrigger value="ingredients" className="gap-1.5 text-[11px] px-3 py-2 whitespace-nowrap">
              <Leaf className="w-3.5 h-3.5 shrink-0" /> Ingredient Grid
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="gap-1.5 text-[11px] px-3 py-2 whitespace-nowrap">
              <ClipboardList className="w-3.5 h-3.5 shrink-0" /> Subscription Plans
            </TabsTrigger>
            <TabsTrigger value="sap-approval" className="gap-1.5 text-[11px] px-3 py-2 whitespace-nowrap">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> SAP KTN
            </TabsTrigger>
            <TabsTrigger value="hcf-approval" className="gap-1.5 text-[11px] px-3 py-2 whitespace-nowrap">
              <Store className="w-3.5 h-3.5 shrink-0" /> HCF KTN
            </TabsTrigger>
            <TabsTrigger value="statistics" className="gap-1.5 text-[11px] px-3 py-2 whitespace-nowrap">
              <BarChart3 className="w-3.5 h-3.5 shrink-0" /> Menu Statistics
            </TabsTrigger>
            <TabsTrigger value="combo-menu" className="gap-1.5 text-[11px] px-3 py-2 whitespace-nowrap">
              <UtensilsCrossed className="w-3.5 h-3.5 shrink-0" /> Combo Box
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1 — Branded Menu Upload */}
        <TabsContent value="upload" className="mt-4">
          <div className="space-y-2.5">
            {canUpload && (
              <div className="flex justify-end mb-2">
                <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setShowAddCuisine(true)}>
                  <Plus className="w-4 h-4" /> Add Cuisine
                </Button>
              </div>
            )}
            {allCuisines.map((c) => {
              const isExpanded = expandedCuisine === c.cuisine;
              const categories = [...new Set(c.menuItems.map((i) => i.category))];
              const cuisineRecords = uploadHistory.filter((r) => r.cuisine === c.cuisine);
              const lastUpload = cuisineRecords[0];
              return (
                <Card key={c.cuisine} className="border-border overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4 px-5 py-3.5">
                      <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center text-xl shrink-0">{c.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-foreground leading-tight">SHF – {c.cuisine}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-normal">{c.menuItems.length} items</Badge>
                          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-normal">{categories.length} categories</Badge>
                          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-normal">{c.kitchens} kitchens</Badge>
                          <span className="text-[10px] text-muted-foreground">{c.states.join(", ")}</span>
                        </div>
                        {lastUpload && (
                          <p className="text-[10px] text-muted-foreground/70 mt-1 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            Last upload: {formatDateTime(lastUpload.uploadedAt)} by {lastUpload.uploadedBy}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setExpandedCuisine(isExpanded ? null : c.cuisine)} title={isExpanded ? "Collapse" : "View menu"}>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        {canUpload && (
                          <Button size="sm" className="gap-1.5 text-xs h-8 px-3" onClick={() => setUploadCuisine(c)}>
                            <Upload className="w-3.5 h-3.5" /> Upload
                          </Button>
                        )}
                      </div>
                    </div>
                    {cuisineRecords.length > 0 && isExpanded && <UploadHistory records={cuisineRecords} />}
                    {isExpanded && <CuisineMenuPreview cuisine={c} />}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* TAB: Ingredient Grid */}
        <TabsContent value="ingredients" className="mt-4">
          <IngredientGridManagement />
        </TabsContent>

        {/* TAB: Subscription Plans */}
        <TabsContent value="subscriptions" className="mt-4">
          <SubscriptionPlanManagement />
        </TabsContent>

        {/* TAB 2 — SAP KTN Approvals */}
        <TabsContent value="sap-approval" className="mt-4">
          <KitchenApprovalTab kitchens={sapKitchens} setKitchens={setSapKitchens} stream="SAP" />
        </TabsContent>

        {/* TAB 3 — HCF KTN Kitchen Approval */}
        <TabsContent value="hcf-approval" className="mt-4">
          <KitchenApprovalTab kitchens={hcfKitchens} setKitchens={setHcfKitchens} stream="HCF" />
        </TabsContent>

        {/* TAB 4 — Menu Statistics */}
        <TabsContent value="statistics" className="mt-4">
          <MenuStatistics allCuisines={allCuisines} />
        </TabsContent>

        {/* TAB 5 — Combo Box Menu */}
        <TabsContent value="combo-menu" className="mt-4">
          <ComboMenuManagement />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {uploadCuisine && (
        <BulkUploadDialog open={!!uploadCuisine} onOpenChange={(v) => { if (!v) setUploadCuisine(null); }} cuisine={uploadCuisine} onImportComplete={handleImportComplete} />
      )}
      <AddCuisineDialog open={showAddCuisine} onOpenChange={setShowAddCuisine} onAdd={(c) => setAddedCuisines((prev) => [...prev, c])} />
    </div>
  );
}
