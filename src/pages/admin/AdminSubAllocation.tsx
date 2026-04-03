import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionCustomers, useUpdateSubscriptionCustomer } from "@/hooks/useSupabaseData";
import { useKitchenPartners } from "@/hooks/useSupabaseData";
import { RefreshCw, Loader2 } from "lucide-react";

const AdminSubAllocation = () => {
  const { toast } = useToast();
  const { data: customers = [], isLoading: loadingCustomers } = useSubscriptionCustomers();
  const { data: kitchenPartners = [] } = useKitchenPartners();
  const updateCustomer = useUpdateSubscriptionCustomer();

  // Build partner capacity data from kitchen_partners
  const partners = kitchenPartners.map(kp => ({
    id: kp.id,
    name: kp.name,
    capacity: 25, // default capacity
    current: customers.filter(c => c.partner_name === kp.name).length,
  }));

  const handleAllocate = (customerId: string, partnerName: string) => {
    const partner = kitchenPartners.find(p => p.name === partnerName);
    updateCustomer.mutate({
      id: customerId,
      updates: { partner_name: partnerName, partner_id: partner?.id || "P-auto" },
    }, {
      onSuccess: () => toast({ title: "Partner Allocated", description: `${partnerName} assigned` }),
    });
  };

  if (loadingCustomers) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">🏠 Partner Allocation</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {partners.map(p => {
          const utilization = p.capacity > 0 ? Math.round((p.current / p.capacity) * 100) : 0;
          return (
            <Card key={p.id} className="border-border">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.current}/{p.capacity} subscribers</p>
                  </div>
                  <Badge className={`text-[9px] ${utilization > 80 ? "bg-red-100 text-red-800" : utilization > 60 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>{utilization}%</Badge>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className={`h-full rounded-full ${utilization > 80 ? "bg-destructive" : utilization > 60 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${utilization}%` }} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <h4 className="text-xs font-semibold text-foreground mt-4">Unallocated / Pending Allocation</h4>
      <div className="space-y-2">
        {customers.filter(c => !c.partner_id && ["active", "trial"].includes(c.status)).map(c => (
          <Card key={c.id} className="border-yellow-300/50">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground">{c.name} — {c.plan_name}</p>
                <p className="text-[10px] text-muted-foreground">{c.address}</p>
              </div>
              <Select onValueChange={(val) => handleAllocate(c.id, val)}>
                <SelectTrigger className="w-40 h-8 text-[10px]"><SelectValue placeholder="Assign Partner" /></SelectTrigger>
                <SelectContent>
                  {partners.filter(p => p.current < p.capacity).map(p => (
                    <SelectItem key={p.id} value={p.name} className="text-xs">{p.name} ({p.capacity - p.current} slots)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}
        {customers.filter(c => !c.partner_id && ["active", "trial"].includes(c.status)).length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">All active subscriptions are allocated ✅</p>
        )}
      </div>

      <h4 className="text-xs font-semibold text-foreground mt-4">Current Allocations</h4>
      <div className="rounded-lg border border-border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[10px]">Customer</TableHead>
              <TableHead className="text-[10px]">Plan</TableHead>
              <TableHead className="text-[10px]">Partner</TableHead>
              <TableHead className="text-[10px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.filter(c => c.partner_id).map(c => (
              <TableRow key={c.id}>
                <TableCell className="text-xs">{c.name}</TableCell>
                <TableCell className="text-xs">{c.plan_name} ({c.persons}p)</TableCell>
                <TableCell className="text-xs">{c.partner_name}</TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1" onClick={() => {
                    const randomPartner = kitchenPartners[Math.floor(Math.random() * kitchenPartners.length)];
                    if (randomPartner) handleAllocate(c.id, randomPartner.name);
                  }}>
                    <RefreshCw className="w-3 h-3" /> Reassign
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminSubAllocation;
