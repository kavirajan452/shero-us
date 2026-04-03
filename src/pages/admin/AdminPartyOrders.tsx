import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, PhoneCall } from "lucide-react";
import ManualPartyOrderPunching from "@/components/admin/ManualPartyOrderPunching";
import AdminPartyAllocations from "@/pages/admin/AdminPartyAllocations";

const AdminPartyOrders = () => {
  const [activeTab, setActiveTab] = useState("management");
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-serif font-bold text-foreground">🎉 {t("party.admin.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("party.admin.subtitle")}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 h-auto gap-2 rounded-2xl bg-secondary p-1.5">
          <TabsTrigger value="management" className="gap-1.5 text-xs rounded-xl py-3">
            <Package className="w-3.5 h-3.5" /> Order Management
          </TabsTrigger>
          <TabsTrigger value="manual" className="gap-1.5 text-xs rounded-xl py-3">
            <PhoneCall className="w-3.5 h-3.5" /> Manual Punching
          </TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="mt-4">
          <AdminPartyAllocations embedded />
        </TabsContent>

        <TabsContent value="manual" className="mt-4">
          <ManualPartyOrderPunching />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPartyOrders;
