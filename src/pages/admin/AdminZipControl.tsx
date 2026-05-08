import { useState, useMemo } from "react";
import { Plus, Trash2, Search, MapPin, CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PartnerLocation {
  id: string;
  kitchen_id: string;
  pincode: string;
  is_active: boolean;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  kitchen_name?: string;
}

function useZipLocations() {
  return useQuery({
    queryKey: ["zip_control_locations"],
    queryFn: async () => {
      const { data: locations, error } = await supabase
        .from("kitchen_partner_locations")
        .select("id, kitchen_id, pincode, is_active, latitude, longitude, created_at")
        .order("pincode");
      if (error) throw error;

      const { data: kitchens } = await supabase
        .from("kitchen_partners")
        .select("id, name");
      const kitchenMap: Record<string, string> = {};
      (kitchens || []).forEach((k: { id: string; name: string }) => { kitchenMap[k.id] = k.name; });

      return (locations || []).map((loc) => ({
        ...loc,
        kitchen_name: kitchenMap[loc.kitchen_id] ?? loc.kitchen_id,
      })) as PartnerLocation[];
    },
  });
}

function useToggleZipActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("kitchen_partner_locations")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["zip_control_locations"] }),
  });
}

function useAddZipLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { kitchen_id: string; pincode: string; latitude: number | null; longitude: number | null }) => {
      const { error } = await supabase.from("kitchen_partner_locations").insert({ ...payload, is_active: true });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["zip_control_locations"] }),
  });
}

function useDeleteZipLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("kitchen_partner_locations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["zip_control_locations"] }),
  });
}

export default function AdminZipControl() {
  const { toast } = useToast();
  const { data: locations = [], isLoading, refetch } = useZipLocations();
  const toggleActive = useToggleZipActive();
  const addLocation = useAddZipLocation();
  const deleteLocation = useDeleteZipLocation();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newZip, setNewZip] = useState("");
  const [newKitchenId, setNewKitchenId] = useState("");
  const [newLat, setNewLat] = useState("");
  const [newLng, setNewLng] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Fetch kitchen list for the Add dialog
  const { data: kitchens = [] } = useQuery({
    queryKey: ["kitchen_partners_for_zip"],
    queryFn: async () => {
      const { data, error } = await supabase.from("kitchen_partners").select("id, name").order("name");
      if (error) throw error;
      return data as { id: string; name: string }[];
    },
  });

  const filtered = useMemo(() => {
    return locations.filter((loc) => {
      if (statusFilter === "active" && !loc.is_active) return false;
      if (statusFilter === "inactive" && loc.is_active) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!loc.pincode.includes(q) && !(loc.kitchen_name ?? "").toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [locations, search, statusFilter]);

  const uniqueZips = new Set(locations.map((l) => l.pincode)).size;
  const activeCount = locations.filter((l) => l.is_active).length;

  const handleToggle = (loc: PartnerLocation) => {
    toggleActive.mutate(
      { id: loc.id, is_active: !loc.is_active },
      {
        onSuccess: () => toast({ title: `ZIP ${loc.pincode} ${!loc.is_active ? "enabled" : "disabled"}` }),
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      }
    );
  };

  const handleAdd = () => {
    const zip = newZip.trim();
    if (!zip || !newKitchenId) return;
    addLocation.mutate(
      {
        kitchen_id: newKitchenId,
        pincode: zip,
        latitude: newLat ? parseFloat(newLat) : null,
        longitude: newLng ? parseFloat(newLng) : null,
      },
      {
        onSuccess: () => {
          toast({ title: `ZIP ${zip} added` });
          setShowAddDialog(false);
          setNewZip(""); setNewKitchenId(""); setNewLat(""); setNewLng("");
        },
        onError: (err: Error) => toast({ title: "Failed to add ZIP", description: err.message, variant: "destructive" }),
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteLocation.mutate(id, {
      onSuccess: () => { toast({ title: "Location removed", variant: "destructive" }); setConfirmDeleteId(null); },
      onError: () => toast({ title: "Delete failed", variant: "destructive" }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ZIP / Serviceability Control</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage which ZIP codes are eligible for delivery. Each kitchen can serve multiple ZIPs.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => refetch()}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          <Button size="sm" className="gap-1.5 text-xs" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-3.5 h-3.5" /> Add ZIP
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-4">
          <p className="text-[11px] text-muted-foreground">Total Entries</p>
          <p className="text-lg font-bold text-foreground">{locations.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-[11px] text-muted-foreground">Unique ZIPs</p>
          <p className="text-lg font-bold text-foreground">{uniqueZips}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-[11px] text-muted-foreground">Active</p>
          <p className="text-lg font-bold text-green-600">{activeCount}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-[11px] text-muted-foreground">Disabled</p>
          <p className="text-lg font-bold text-destructive">{locations.length - activeCount}</p>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ZIP or kitchen…" className="pl-9" />
        </div>
        <div className="flex gap-1">
          {(["all", "active", "inactive"] as const).map((f) => (
            <Button key={f} variant={statusFilter === f ? "default" : "outline"} size="sm" className="text-xs capitalize" onClick={() => setStatusFilter(f)}>{f}</Button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px]">ZIP Code</TableHead>
                <TableHead className="text-[10px]">Kitchen</TableHead>
                <TableHead className="text-[10px]">Coordinates</TableHead>
                <TableHead className="text-[10px]">Status</TableHead>
                <TableHead className="text-[10px]">Active</TableHead>
                <TableHead className="text-[10px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                    No locations found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((loc) => (
                  <TableRow key={loc.id} className="hover:bg-secondary/20">
                    <TableCell className="text-xs font-mono font-semibold">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                        {loc.pincode}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{loc.kitchen_name ?? loc.kitchen_id}</TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">
                      {loc.latitude != null && loc.longitude != null
                        ? `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {loc.is_active
                        ? <Badge className="bg-green-100 text-green-700 border-0 text-[10px] gap-1"><CheckCircle2 className="w-3 h-3" /> Active</Badge>
                        : <Badge className="bg-red-100 text-red-700 border-0 text-[10px] gap-1"><XCircle className="w-3 h-3" /> Disabled</Badge>}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={loc.is_active}
                        onCheckedChange={() => handleToggle(loc)}
                        disabled={toggleActive.isPending}
                        aria-label={`Toggle ZIP ${loc.pincode}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setConfirmDeleteId(loc.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add ZIP Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Delivery ZIP</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Kitchen *</Label>
              <select
                value={newKitchenId}
                onChange={(e) => setNewKitchenId(e.target.value)}
                className="w-full mt-1 text-xs border border-border rounded-lg px-3 py-2 bg-card text-foreground outline-none focus:border-primary"
              >
                <option value="">Select kitchen…</option>
                {kitchens.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">ZIP Code *</Label>
              <Input
                value={newZip}
                onChange={(e) => setNewZip(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="e.g. 10001"
                className="mt-1 text-xs"
                maxLength={10}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Latitude (optional)</Label>
                <Input value={newLat} onChange={(e) => setNewLat(e.target.value)} placeholder="40.7128" className="mt-1 text-xs" />
              </div>
              <div>
                <Label className="text-xs">Longitude (optional)</Label>
                <Input value={newLng} onChange={(e) => setNewLng(e.target.value)} placeholder="-74.0060" className="mt-1 text-xs" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button
              onClick={handleAdd}
              disabled={!newZip.trim() || !newKitchenId || addLocation.isPending}
              className="gap-1"
            >
              {addLocation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Add ZIP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Remove ZIP Location</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This will remove the kitchen–ZIP mapping permanently. The kitchen will no longer serve this ZIP.</p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)} disabled={deleteLocation.isPending}>
              {deleteLocation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
