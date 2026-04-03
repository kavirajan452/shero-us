import { useState, useRef } from "react";
import { Upload, Download, FileSpreadsheet, AlertTriangle, X, Leaf } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { type PartnerMenuItem, partnerType } from "@/data/partnerMockData";
import { useRegion } from "@/contexts/RegionContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";

interface ParsedRow {
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  image: string;
}

const TEMPLATE_COLUMNS = ["Name", "Description", "Price", "Category", "Is Veg (Yes/No)", "Image URL"];

const PartnerBulkUpload = () => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { formatPrice } = useRegion();
  const { toast } = useToast();

  const isBranded = partnerType === "branded";

  if (isBranded) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-serif font-bold text-foreground">Bulk Upload</h2>
        <Card className="border-border">
          <CardContent className="p-8 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto" />
            <h3 className="font-semibold text-foreground">Not Available for Branded Partners</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Menu items for Shero Branded kitchens are managed centrally by the back office. 
              Use the <strong>Ingredients</strong> page to toggle available ingredients — menu items will auto-update.
            </p>
            <Link to="/partner/ingredients" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-2">
              Go to Ingredients →
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      TEMPLATE_COLUMNS,
      ["Chinna Vengayam Sambar", "Sambar with shallots and tamarind", 167, "Paruppu Sambar", "Yes", ""],
      ["Milagu Rasam", "Spicy pepper rasam with tomato", 127, "Rasam", "Yes", ""],
      ["Carrot Beans Poriyal", "Stir fry of carrot & beans with coconut", 196, "Poriyal", "Yes", ""],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Menu Template");
    ws["!cols"] = [{ wch: 30 }, { wch: 50 }, { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 40 }];
    XLSX.writeFile(wb, "Shero_Menu_Template.xlsx");
    toast({ title: "Template downloaded", description: "Fill in the Excel file and upload it back" });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setIsUploading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

      if (json.length === 0) {
        setUploadError("The Excel file is empty. Please add menu items and try again.");
        setIsUploading(false);
        return;
      }

      const rows: ParsedRow[] = [];
      const errors: string[] = [];

      json.forEach((row, idx) => {
        const name = String(row["Name"] || row["name"] || "").trim();
        const description = String(row["Description"] || row["description"] || "").trim();
        const priceRaw = row["Price"] || row["price"];
        const price = Number(priceRaw);
        const category = String(row["Category"] || row["category"] || "").trim();
        const isVegRaw = String(row["Is Veg (Yes/No)"] || row["Is Veg"] || row["isVeg"] || row["Veg"] || "Yes").trim().toLowerCase();
        const image = String(row["Image URL"] || row["image"] || row["Image"] || "").trim();

        if (!name) { errors.push(`Row ${idx + 2}: Missing name`); return; }
        if (!category) { errors.push(`Row ${idx + 2}: Missing category`); return; }
        if (isNaN(price) || price <= 0) { errors.push(`Row ${idx + 2}: Invalid price "${priceRaw}"`); return; }

        rows.push({
          name,
          description: description || `Homemade ${name}`,
          price,
          category,
          isVeg: isVegRaw === "yes" || isVegRaw === "y" || isVegRaw === "true",
          image,
        });
      });

      if (errors.length > 0 && rows.length === 0) {
        setUploadError(errors.slice(0, 5).join("\n"));
      } else {
        if (errors.length > 0) {
          toast({ title: `${errors.length} rows skipped`, description: errors[0], variant: "destructive" });
        }
        setParsedRows(rows);
        setShowUploadDialog(true);
      }
    } catch {
      setUploadError("Failed to parse file. Please use a valid .xlsx or .csv file.");
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const confirmUpload = (mode: "replace" | "append") => {
    toast({
      title: `${parsedRows.length} items ${mode === "replace" ? "imported" : "added"}`,
      description: `Menu ${mode === "replace" ? "replaced" : "updated"} from Excel. Go to Menu Items to view.`,
    });
    setUploadedCount((prev) => prev + parsedRows.length);
    setShowUploadDialog(false);
    setParsedRows([]);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif font-bold text-foreground">Bulk Upload Menu</h2>
      <p className="text-sm text-muted-foreground">
        Upload your complete menu via Excel or CSV. Download the template, fill in your items, and upload it back.
      </p>

      {/* Steps */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border">
          <CardContent className="p-4 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
              <Download className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground text-sm">1. Download Template</h3>
            <p className="text-xs text-muted-foreground">Get the Excel template with the correct column format</p>
            <Button size="sm" variant="outline" onClick={downloadTemplate} className="w-full gap-1.5">
              <Download className="w-3.5 h-3.5" /> Download .xlsx
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground text-sm">2. Fill Your Menu</h3>
            <p className="text-xs text-muted-foreground">Add all your dishes with name, price, category & veg/non-veg</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground text-sm">3. Upload & Import</h3>
            <p className="text-xs text-muted-foreground">Upload the file to import all items into your menu</p>
            <label>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileSelect} />
              <Button size="sm" className="w-full gap-1.5" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                <Upload className="w-3.5 h-3.5" /> {isUploading ? "Reading…" : "Upload Excel"}
              </Button>
            </label>
          </CardContent>
        </Card>
      </div>

      {/* Expected format */}
      <Card className="border-border">
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground text-sm mb-3">Expected Excel Format</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {TEMPLATE_COLUMNS.map((col) => (
                    <th key={col} className="text-left p-2 font-semibold text-muted-foreground">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="p-2 text-foreground">Chinna Vengayam Sambar</td>
                  <td className="p-2 text-muted-foreground">Sambar with shallots…</td>
                  <td className="p-2 text-foreground">167</td>
                  <td className="p-2 text-foreground">Paruppu Sambar</td>
                  <td className="p-2 text-foreground">Yes</td>
                  <td className="p-2 text-muted-foreground italic">optional</td>
                </tr>
                <tr>
                  <td className="p-2 text-foreground">Milagu Rasam</td>
                  <td className="p-2 text-muted-foreground">Spicy pepper rasam…</td>
                  <td className="p-2 text-foreground">127</td>
                  <td className="p-2 text-foreground">Rasam</td>
                  <td className="p-2 text-foreground">Yes</td>
                  <td className="p-2 text-muted-foreground italic">optional</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {uploadedCount > 0 && (
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="p-3 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-accent" />
            <span className="text-sm text-foreground">{uploadedCount} items imported this session</span>
          </CardContent>
        </Card>
      )}

      {uploadError && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Upload Error</p>
              <pre className="text-xs text-destructive/80 whitespace-pre-wrap mt-1">{uploadError}</pre>
            </div>
            <button onClick={() => setUploadError(null)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </CardContent>
        </Card>
      )}

      {/* Upload Preview Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-accent" />
              Import Menu from Excel
            </DialogTitle>
            <DialogDescription>{parsedRows.length} items found. Choose how to import them.</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {parsedRows.map((row, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border">
                <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center text-accent text-xs font-bold shrink-0">{idx + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-foreground text-sm truncate">{row.name}</span>
                    {row.isVeg && <Leaf className="w-3 h-3 text-accent shrink-0" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{row.category}</p>
                </div>
                <span className="font-bold text-foreground text-sm shrink-0">{formatPrice(row.price)}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-3 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={() => confirmUpload("append")}>Append to existing</Button>
            <Button className="flex-1" onClick={() => confirmUpload("replace")}>Replace entire menu</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnerBulkUpload;
