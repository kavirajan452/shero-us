import { useState } from "react";
import TeamPMS from "@/components/TeamPMS";
import type { AdminRole } from "@/data/adminRoles";

// Re-use the same team members data structure
interface TeamMember {
  id: string;
  name: string;
  role: AdminRole;
  region: string;
  department: string;
  reportsTo: string | null;
  assignedPartners: { id: string; name: string; rmn: string; kitchenType: "branded" | "own" }[];
}

// Import the same mock data used in AdminTeam — we duplicate a minimal set here
// In production this would come from a shared store/API
const teamMembers: TeamMember[] = [
  { id: "TM001", name: "Arvind S.", role: "country_manager", region: "All India", department: "Country Leadership", reportsTo: null, assignedPartners: [] },
  { id: "TM002", name: "Kavitha R.", role: "vertical_head", region: "India", department: "SAP & OPS", reportsTo: "TM001", assignedPartners: [] },
  { id: "TM003", name: "Deepak M.", role: "regional_manager", region: "South", department: "Operations – South", reportsTo: "TM002", assignedPartners: [] },
  { id: "TM004", name: "Radhika V.", role: "regional_manager", region: "West", department: "Operations – West", reportsTo: "TM002", assignedPartners: [] },
  { id: "TM005", name: "Nithya P.", role: "shf_manager", region: "South", department: "SHF – South", reportsTo: "TM003", assignedPartners: [{ id: "P001", name: "Sujatha M.", rmn: "+91 98765 43210", kitchenType: "branded" }, { id: "P009", name: "Saroja T.", rmn: "+91 61234 56789", kitchenType: "branded" }] },
  { id: "TM006", name: "Harish G.", role: "shf_manager", region: "South", department: "SHF – South", reportsTo: "TM003", assignedPartners: [{ id: "P003", name: "Lakshmi R.", rmn: "+91 76543 21098", kitchenType: "branded" }] },
  { id: "TM007", name: "Suresh K.", role: "asst_manager", region: "South", department: "SHF – South", reportsTo: "TM005", assignedPartners: [{ id: "P001", name: "Sujatha M.", rmn: "+91 98765 43210", kitchenType: "branded" }] },
  { id: "TM008", name: "Lakshmi D.", role: "asst_manager", region: "South", department: "SHF – South", reportsTo: "TM006", assignedPartners: [{ id: "P003", name: "Lakshmi R.", rmn: "+91 76543 21098", kitchenType: "branded" }, { id: "P007", name: "Geetha B.", rmn: "+91 81234 56789", kitchenType: "branded" }] },
  { id: "TM011", name: "Preeti J.", role: "hcf_manager", region: "West", department: "HCF – West", reportsTo: "TM004", assignedPartners: [{ id: "P004", name: "Meena S.", rmn: "+91 65432 10987", kitchenType: "own" }, { id: "P008", name: "Padma V.", rmn: "+91 71234 56789", kitchenType: "own" }, { id: "P010", name: "Kamala R.", rmn: "+91 51234 56789", kitchenType: "own" }] },
  { id: "TM013", name: "Madhavi K.", role: "hcf_manager", region: "South", department: "HCF – South", reportsTo: "TM003", assignedPartners: [{ id: "P002", name: "Priya K.", rmn: "+91 87654 32109", kitchenType: "own" }, { id: "P006", name: "Revathi N.", rmn: "+91 91234 56789", kitchenType: "own" }] },
  { id: "TM030", name: "Shankar V.", role: "ops_manager", region: "All India", department: "Operations", reportsTo: "TM002", assignedPartners: [] },
  { id: "TM032", name: "Rekha M.", role: "ssc_manager", region: "All India", department: "SSC", reportsTo: "TM002", assignedPartners: [] },
  { id: "TM035", name: "Ganesh R.", role: "finance_manager", region: "All India", department: "Finance (PPP)", reportsTo: "TM002", assignedPartners: [] },
  { id: "TM037", name: "Bharathi S.", role: "party_manager", region: "All India", department: "Party Orders", reportsTo: "TM002", assignedPartners: [] },
  { id: "TM040", name: "Revathi S.", role: "hr_manager", region: "All India", department: "HR", reportsTo: "TM001", assignedPartners: [] },
];

export default function AdminPMS() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Performance Management System</h1>
        <p className="text-sm text-muted-foreground mt-1">
          KPI scorecards, review cycles, incentive engine & hierarchy roll-ups
        </p>
      </div>
      <TeamPMS members={teamMembers} />
    </div>
  );
}
