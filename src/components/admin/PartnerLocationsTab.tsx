import { useState, useMemo } from "react";
import { Plus, Search, MapPin, Users, Pencil, Trash2, ToggleLeft, ToggleRight, ShieldCheck, Download, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const PAGE_SIZE = 50;

interface PartnerLocationsTabProps {
  partnerLocations: any[];
  brandedKitchens: any[];
  radiusConfig: number;
  onAddLocation: (kitchenId?: string) => void;
  onEditLocation: (loc: any) => void;
}

export function PartnerLocationsTab({
  partnerLocations,
  brandedKitchens,
  radiusConfig,
  onAddLocation,
  onEditLocation,
}: PartnerLocationsTabProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [kitchenFilter, setKitchenFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(0);

  // ═══ MUTATIONS ═══
  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("kitchen_partner_locations").update({ is_active: active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["kitchen_partner_locations"] }),
  });

  const deleteLocation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("kitchen_partner_locations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen_partner_locations"] });
      toast.success("Location deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });

  // ═══ DERIVED DATA ═══
  const allLocations = partnerLocations || [];

  const filtered = useMemo(() => {
    let result = allLocations;
    if (kitchenFilter !== "all") result = result.filter((l: any) => l.kitchen_id === kitchenFilter);
    if (statusFilter === "active") result = result.filter((l: any) => l.is_active);
    if (statusFilter === "inactive") result = result.filter((l: any) => !l.is_active);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((l: any) =>
        l.partner_name.toLowerCase().includes(q) ||
        (l.zipcode || "").includes(q) ||
        (l.location || "").toLowerCase().includes(q) ||
        (l.partner_phone || "").includes(q)
      );
    }
    return result;
  }, [allLocations, kitchenFilter, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  // Reset page when filters change
  useMemo(() => setPage(0), [kitchenFilter, statusFilter, search]);

  // ═══ REPORTING AGGREGATES ═══
  const perBrandCounts = useMemo(() => {
    const map: Record<string, { total: number; active: number; zipcodes: Set<string> }> = {};
    allLocations.forEach((l: any) => {
      if (!map[l.kitchen_id]) map[l.kitchen_id] = { total: 0, active: 0, zipcodes: new Set() };
      map[l.kitchen_id].total++;
      if (l.is_active) map[l.kitchen_id].active++;
      if (l.zipcode) map[l.kitchen_id].zipcodes.add(l.zipcode);
    });
    return map;
  }, [allLocations]);

  const uniqueZIP Codes = useMemo(() => {
    const set = new Set<string>();
    allLocations.forEach((l: any) => { if (l.zipcode) set.add(l.zipcode); });
    return set.size;
  }, [allLocations]);

  const gpsCount = useMemo(() => allLocations.filter((l: any) => l.latitude && l.longitude).length, [allLocations]);

  const getKitchenName = (id: string) => brandedKitchens.find((k: any) => k.id === id)?.name || id;

  const handleExportCSV = () => {
    const headers = ["Partner Name", "Phone", "Kitchen Brand", "ZIP Code", "Location", "Latitude", "Longitude", "Active", "Created"];
    const rows = filtered.map((l: any) => [
      l.partner_name, l.partner_phone || "", getKitchenName(l.kitchen_id),
      l.zipcode || "", l.location || "",
      l.latitude || "", l.longitude || "",
      l.is_active ? "Yes" : "No",
      new Date(l.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(r => r.map((c: any) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `partner-locations-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} records`);
  };

  return (
    <div className="space-y-4">
      {/* ═══ REPORTING SUMMARY ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="border-primary/20">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">{allLocations.length.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Total Partners</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/20">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{allLocations.filter((l: any) => l.is_active).length.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{uniqueZIP Codes.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Unique ZIP Codes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{gpsCount.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">GPS Mapped</p>
          </CardContent>
        </Card>
        <Card className="border-orange-500/20">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-orange-600">{brandedKitchens.length}</p>
            <p className="text-[10px] text-muted-foreground">Kitchen Brands</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-foreground">
              {allLocations.length > 0 ? Math.round(allLocations.length / Math.max(1, brandedKitchens.length)) : 0}
            </p>
            <p className="text-[10px] text-muted-foreground">Avg / Brand</p>
          </CardContent>
        </Card>
      </div>

      {/* ═══ PER-BRAND BREAKDOWN (collapsed summary) ═══ */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">Per-Brand Distribution</span>
            <Badge variant="outline" className="text-[9px] ml-auto">Scale-ready for 10,000+ partners</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {brandedKitchens.map((k: any) => {
              const stats = perBrandCounts[k.id] || { total: 0, active: 0, zipcodes: new Set() };
              const capacity = 10000;
              const fillPct = Math.min(100, (stats.total / capacity) * 100);
              return (
                <div key={k.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{k.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-muted-foreground">{stats.total.toLocaleString()} partners</span>
                      <span className="text-green-600">{stats.active} active</span>
                      <span className="text-muted-foreground/70">{stats.zipcodes.size} zipcodes</span>
                    </div>
                    <div className="w-full h-1 bg-muted rounded-full mt-1">
                      <div className="h-1 bg-primary/60 rounded-full transition-all" style={{ width: `${fillPct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ═══ FILTERS & ACTIONS ═══ */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search partner, zipcode, phone, location..." className="pl-9" />
        </div>
        <Select value={kitchenFilter} onValueChange={setKitchenFilter}>
          <SelectTrigger className="w-[200px] h-9 text-xs"><SelectValue placeholder="All Brands" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brandedKitchens.map((k: any) => (
              <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-[120px] h-9 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleExportCSV}>
          <Download className="w-3.5 h-3.5" /> Export CSV
        </Button>
        <Button size="sm" className="gap-1.5" onClick={() => onAddLocation()}>
          <Plus className="w-4 h-4" /> Add Partner Location
        </Button>
      </div>

      {/* ═══ PAGINATED TABLE ═══ */}
      <Card>
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px] w-[180px]">Partner</TableHead>
                <TableHead className="text-[11px] w-[180px]">Kitchen Brand</TableHead>
                <TableHead className="text-[11px] w-[90px]">ZIP Code</TableHead>
                <TableHead className="text-[11px]">Location</TableHead>
                <TableHead className="text-[11px] w-[60px]">GPS</TableHead>
                <TableHead className="text-[11px] w-[70px]">Status</TableHead>
                <TableHead className="text-[11px] w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <MapPin className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No partner locations found</p>
                  </TableCell>
                </TableRow>
              ) : paged.map((loc: any) => (
                <TableRow key={loc.id} className={!loc.is_active ? "opacity-50" : ""}>
                  <TableCell>
                    <div>
                      <span className="text-sm font-medium text-foreground">{loc.partner_name}</span>
                      {loc.partner_phone && <p className="text-[10px] text-muted-foreground">{loc.partner_phone}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-orange-500 shrink-0" />
                      <span className="text-xs text-foreground truncate max-w-[150px]">{getKitchenName(loc.kitchen_id)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-foreground">{loc.zipcode || "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground truncate max-w-[150px]">{loc.location || "—"}</TableCell>
                  <TableCell>
                    {loc.latitude && loc.longitude ? (
                      <Badge variant="default" className="text-[8px] px-1.5 py-0 bg-green-100 text-green-700 border-green-200">✓ Yes</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[8px] px-1.5 py-0 text-muted-foreground">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={loc.is_active ? "default" : "secondary"} className="text-[9px] px-1.5 py-0">
                      {loc.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEditLocation(loc)}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => toggleActive.mutate({ id: loc.id, active: !loc.is_active })}>
                        {loc.is_active ? <ToggleRight className="w-3.5 h-3.5 text-primary" /> : <ToggleLeft className="w-3.5 h-3.5 text-muted-foreground" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                        onClick={() => { if (confirm(`Remove ${loc.partner_name}?`)) deleteLocation.mutate(loc.id); }}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* ═══ PAGINATION ═══ */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length === 0 ? 0 : currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, filtered.length)} of{" "}
            <strong>{filtered.length.toLocaleString()}</strong> partner locations
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={currentPage === 0}
              onClick={() => setPage(currentPage - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground px-2">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={currentPage >= totalPages - 1}
              onClick={() => setPage(currentPage + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* ═══ SCALE INFO ═══ */}
      <div className="bg-muted/50 border border-border rounded-lg p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">📊 Scale Projections:</strong>{" "}
        Each branded kitchen is designed for <strong className="text-primary">2,000–10,000+ partners</strong> across India.
        Current visibility radius: <strong className="text-primary">{radiusConfig} km</strong> (configurable from backend).
        Paginated table supports unlimited partners with search, filters, and CSV export.
      </div>
    </div>
  );
}
