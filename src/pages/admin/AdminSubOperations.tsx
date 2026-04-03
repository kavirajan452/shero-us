import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Briefcase } from "lucide-react";
import AdminSubAllocation from "./AdminSubAllocation";
import AdminSubLifecycle from "./AdminSubLifecycle";

const AdminSubOperations = () => (
  <div className="space-y-4">
    <h1 className="text-xl font-bold text-foreground">⚙️ Subscription Operations</h1>
    <Tabs defaultValue="allocation">
      <TabsList className="h-9">
        <TabsTrigger value="allocation" className="text-xs gap-1.5"><Zap className="w-3.5 h-3.5" /> Allocation</TabsTrigger>
        <TabsTrigger value="lifecycle" className="text-xs gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Lifecycle</TabsTrigger>
      </TabsList>
      <TabsContent value="allocation" className="mt-4"><AdminSubAllocation /></TabsContent>
      <TabsContent value="lifecycle" className="mt-4"><AdminSubLifecycle /></TabsContent>
    </Tabs>
  </div>
);

export default AdminSubOperations;
