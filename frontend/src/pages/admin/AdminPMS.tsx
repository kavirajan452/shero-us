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
  { id: "TM001", name: "Arvind S.", role: "country_manager", region: "Nationwide", department: "Country Leadership", reportsTo: null, assignedPartners: [] },
  { id: "TM002", name: "Kavitha R.", role: "vertical_head", region: "India", department: "SAP & OPS", reportsTo: "TM001", assignedPartners: [] },
  { id: "TM003", name: "David M.", role: "regional_manager", region: "Northeast", department: "Operations – South", reportsTo: "TM002", assignedPartners: [] },
  { id: "TM004", name: "Rebecca V.", role: "regional_manager", region: "West", department: "Operations – West", reportsTo: "TM002", assignedPartners: [] },
  { id: "TM005", name: "Nicole P.", role: "shf_manager", region: "Northeast", department: "SHF – South", reportsTo: "TM003", assignedPartners: [{ id: "P001", name: "Maria T.", rmn: "+1 (212) 555-0101", kitchenType: "branded" }, { id: "P009", name: "Sharon T.", rmn: "+1 (646) 555-0114", kitchenType: "branded" }] },
  { id: "TM006", name: "Henry G.", role: "shf_manager", region: "Northeast", department: "SHF – South", reportsTo: "TM003", assignedPartners: [{ id: "P003", name: "Laura R.", rmn: "+1 (312) 555-0103", kitchenType: "branded" }] },
  { id: "TM007", name: "Steven K.", role: "asst_manager", region: "Northeast", department: "SHF – South", reportsTo: "TM005", assignedPartners: [{ id: "P001", name: "Maria T.", rmn: "+1 (212) 555-0101", kitchenType: "branded" }] },
  { id: "TM008", name: "Laura D.", role: "asst_manager", region: "Northeast", department: "SHF – South", reportsTo: "TM006", assignedPartners: [{ id: "P003", name: "Laura R.", rmn: "+1 (312) 555-0103", kitchenType: "branded" }, { id: "P007", name: "Gloria B.", rmn: "+1 (415) 555-0115", kitchenType: "branded" }] },
  { id: "TM011", name: "Patricia J.", role: "hcf_manager", region: "West", department: "HCF – West", reportsTo: "TM004", assignedPartners: [{ id: "P004", name: "Lisa S.", rmn: "+1 (713) 555-0104", kitchenType: "own" }, { id: "P008", name: "Paula V.", rmn: "+1 (312) 555-0116", kitchenType: "own" }, { id: "P010", name: "Kim R.", rmn: "+1 (713) 555-0117", kitchenType: "own" }] },
  { id: "TM013", name: "Michelle K.", role: "hcf_manager", region: "Northeast", department: "HCF – South", reportsTo: "TM003", assignedPartners: [{ id: "P002", name: "Patricia K.", rmn: "+1 (310) 555-0102", kitchenType: "own" }, { id: "P006", name: "Rachel N.", rmn: "+1 (305) 555-0118", kitchenType: "own" }] },
  { id: "TM030", name: "Steven V.", role: "ops_manager", region: "Nationwide", department: "Operations", reportsTo: "TM002", assignedPartners: [] },
  { id: "TM032", name: "Rachel M.", role: "ssc_manager", region: "Nationwide", department: "SSC", reportsTo: "TM002", assignedPartners: [] },
  { id: "TM035", name: "Ganesh R.", role: "finance_manager", region: "Nationwide", department: "Finance (PPP)", reportsTo: "TM002", assignedPartners: [] },
  { id: "TM037", name: "Bharathi S.", role: "party_manager", region: "Nationwide", department: "Party Orders", reportsTo: "TM002", assignedPartners: [] },
  { id: "TM040", name: "Revathi S.", role: "hr_manager", region: "Nationwide", department: "HR", reportsTo: "TM001", assignedPartners: [] },
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
