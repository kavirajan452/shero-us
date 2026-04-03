import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UtensilsCrossed, ChefHat, BadgePercent } from "lucide-react";
import AdminSubMenus from "./AdminSubMenus";
import AdminSubPlans from "./AdminSubPlans";
import AdminSubDiscounts from "./AdminSubDiscounts";

const AdminSubMenuPlans = () => (
  <div className="space-y-5">
    <div>
      <h1 className="text-xl font-bold text-foreground">📋 Menu, Plans & Pricing</h1>
      <p className="text-xs text-muted-foreground mt-0.5">Manage subscription menus, meal plans, and discount tiers</p>
    </div>
    <Tabs defaultValue="menus">
      <TabsList className="h-10 bg-secondary/50 p-1">
        <TabsTrigger value="menus" className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm px-4">
          <UtensilsCrossed className="w-3.5 h-3.5" /> Menu Mgmt
        </TabsTrigger>
        <TabsTrigger value="plans" className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm px-4">
          <ChefHat className="w-3.5 h-3.5" /> Meal Plans
        </TabsTrigger>
        <TabsTrigger value="discounts" className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm px-4">
          <BadgePercent className="w-3.5 h-3.5" /> Discounts
        </TabsTrigger>
      </TabsList>
      <TabsContent value="menus" className="mt-5"><AdminSubMenus /></TabsContent>
      <TabsContent value="plans" className="mt-5"><AdminSubPlans /></TabsContent>
      <TabsContent value="discounts" className="mt-5"><AdminSubDiscounts /></TabsContent>
    </Tabs>
  </div>
);

export default AdminSubMenuPlans;
