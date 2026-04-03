import { useState, useMemo } from "react";
import { Briefcase, HeartHandshake, IndianRupee, Landmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Search, ChevronDown, ChevronRight, Shield, Eye, Globe, MapPin, UtensilsCrossed, Home, UserCircle, Plus, Pencil, Trash2, Layers, BarChart3, Users, ClipboardCheck, Target } from "lucide-react";
// TeamPMS moved to separate /admin/pms page
import { ADMIN_ROLES, type AdminRole, getAdminRole } from "@/data/adminRoles";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";

// ── Types ──

interface TeamMember {
  id: string;
  name: string;
  rem: string;
  role: AdminRole;
  phone: string;
  city: string;
  region: string;
  country: string;
  department: string;
  reportsTo: string | null;
  assignedCuisines?: string[]; // For SHF Managers
  assignedPartners: { id: string; name: string; rmn: string; kitchenType: "branded" | "own" }[];
  status: "active" | "inactive";
  joinedDate: string;
}

// ── Mock team hierarchy ──
// Super Admin → Country Manager (Ops) → Regional Managers (P&L, 4 zones)
//   → SHF Cuisine Managers (branded) + Asst Managers
//   → HCF Managers (own/unbranded) + Asst Managers

const teamMembers: TeamMember[] = [
  // ─ Country Head ─
  {
    id: "TM001", name: "Arvind S.", rem: "country@shero.in", role: "country_manager",
    phone: "+91 90000 00001", city: "Chennai", region: "All India", country: "India",
    department: "Country Leadership", reportsTo: null, assignedPartners: [], status: "active", joinedDate: "Jun 2024",
  },
  // ─ Vertical Head: SAP & OPS ─
  {
    id: "TM002", name: "Kavitha R.", rem: "sapops@shero.in", role: "vertical_head",
    phone: "+91 90000 00002", city: "Chennai", region: "India", country: "India",
    department: "SAP & OPS", reportsTo: "TM001", assignedPartners: [], status: "active", joinedDate: "Aug 2024",
  },

  // ─ Regional Managers (P&L owners) ─
  {
    id: "TM003", name: "Deepak M.", rem: "rm-south@shero.in", role: "regional_manager",
    phone: "+91 90000 00003", city: "Hyderabad", region: "South", country: "India",
    department: "Operations – South", reportsTo: "TM002", assignedPartners: [], status: "active", joinedDate: "Oct 2024",
  },
  {
    id: "TM004", name: "Radhika V.", rem: "rm-west@shero.in", role: "regional_manager",
    phone: "+91 90000 00008", city: "Mumbai", region: "West", country: "India",
    department: "Operations – West", reportsTo: "TM002", assignedPartners: [], status: "active", joinedDate: "Nov 2024",
  },
  {
    id: "TM010", name: "Arun K.", rem: "rm-north@shero.in", role: "regional_manager",
    phone: "+91 90000 00012", city: "Delhi", region: "North", country: "India",
    department: "Operations – North", reportsTo: "TM002", assignedPartners: [], status: "active", joinedDate: "Dec 2024",
  },
  {
    id: "TM020", name: "Priya S.", rem: "rm-east@shero.in", role: "regional_manager",
    phone: "+91 90000 00020", city: "Kolkata", region: "East", country: "India",
    department: "Operations – East", reportsTo: "TM002", assignedPartners: [], status: "active", joinedDate: "Jan 2025",
  },

  // ─ SHF (Shero Home Food / Branded) Cuisine Managers under South RM ─
  {
    id: "TM005", name: "Nithya P.", rem: "shf-south-chettinad@shero.in", role: "shf_manager",
    phone: "+91 90000 00004", city: "Chennai", region: "South", country: "India",
    department: "SHF – South", reportsTo: "TM003",
    assignedCuisines: ["Chettinad", "Kerala"],
    assignedPartners: [
      { id: "P001", name: "Sujatha M.", rmn: "+91 98765 43210", kitchenType: "branded" },
      { id: "P009", name: "Saroja T.", rmn: "+91 61234 56789", kitchenType: "branded" },
    ],
    status: "active", joinedDate: "Jan 2025",
  },
  {
    id: "TM006", name: "Harish G.", rem: "shf-south-andhra@shero.in", role: "shf_manager",
    phone: "+91 90000 00009", city: "Hyderabad", region: "South", country: "India",
    department: "SHF – South", reportsTo: "TM003",
    assignedCuisines: ["Andhra", "Udupi"],
    assignedPartners: [
      { id: "P003", name: "Lakshmi R.", rmn: "+91 76543 21098", kitchenType: "branded" },
    ],
    status: "active", joinedDate: "Feb 2025",
  },

  // Asst Managers under SHF South
  {
    id: "TM007", name: "Suresh K.", rem: "asst-shf-south1@shero.in", role: "asst_manager",
    phone: "+91 90000 00005", city: "Chennai", region: "South", country: "India",
    department: "SHF – South", reportsTo: "TM005",
    assignedPartners: [
      { id: "P001", name: "Sujatha M.", rmn: "+91 98765 43210", kitchenType: "branded" },
    ],
    status: "active", joinedDate: "Mar 2025",
  },
  {
    id: "TM008", name: "Lakshmi D.", rem: "asst-shf-south2@shero.in", role: "asst_manager",
    phone: "+91 90000 00010", city: "Hyderabad", region: "South", country: "India",
    department: "SHF – South", reportsTo: "TM006",
    assignedPartners: [
      { id: "P003", name: "Lakshmi R.", rmn: "+91 76543 21098", kitchenType: "branded" },
      { id: "P007", name: "Geetha B.", rmn: "+91 81234 56789", kitchenType: "branded" },
    ],
    status: "active", joinedDate: "Apr 2025",
  },

  // ─ HCF (Home Chef Kitchen / Unbranded) Manager under South RM ─
  {
    id: "TM013", name: "Madhavi K.", rem: "hcf-south@shero.in", role: "hcf_manager",
    phone: "+91 90000 00015", city: "Chennai", region: "South", country: "India",
    department: "HCF – South", reportsTo: "TM003",
    assignedPartners: [
      { id: "P002", name: "Priya K.", rmn: "+91 87654 32109", kitchenType: "own" },
      { id: "P006", name: "Revathi N.", rmn: "+91 91234 56789", kitchenType: "own" },
    ],
    status: "active", joinedDate: "Feb 2025",
  },
  {
    id: "TM014", name: "Karthik R.", rem: "asst-hcf-south@shero.in", role: "asst_manager",
    phone: "+91 90000 00016", city: "Chennai", region: "South", country: "India",
    department: "HCF – South", reportsTo: "TM013",
    assignedPartners: [
      { id: "P002", name: "Priya K.", rmn: "+91 87654 32109", kitchenType: "own" },
    ],
    status: "active", joinedDate: "Apr 2025",
  },

  // ─ SHF Manager under West RM ─
  {
    id: "TM015", name: "Anand M.", rem: "shf-west@shero.in", role: "shf_manager",
    phone: "+91 90000 00017", city: "Mumbai", region: "West", country: "India",
    department: "SHF – West", reportsTo: "TM004",
    assignedCuisines: ["Gujarati", "Marathi", "Rajasthani"],
    assignedPartners: [
      { id: "P005", name: "Anita D.", rmn: "+91 54321 09876", kitchenType: "branded" },
    ],
    status: "active", joinedDate: "Mar 2025",
  },

  // ─ HCF Manager under West RM ─
  {
    id: "TM011", name: "Preeti J.", rem: "hcf-west@shero.in", role: "hcf_manager",
    phone: "+91 90000 00013", city: "Mumbai", region: "West", country: "India",
    department: "HCF – West", reportsTo: "TM004",
    assignedPartners: [
      { id: "P004", name: "Meena S.", rmn: "+91 65432 10987", kitchenType: "own" },
      { id: "P008", name: "Padma V.", rmn: "+91 71234 56789", kitchenType: "own" },
      { id: "P010", name: "Kamala R.", rmn: "+91 51234 56789", kitchenType: "own" },
    ],
    status: "active", joinedDate: "Mar 2025",
  },
  {
    id: "TM009", name: "Vinod S.", rem: "asst-hcf-west@shero.in", role: "asst_manager",
    phone: "+91 90000 00011", city: "Mumbai", region: "West", country: "India",
    department: "HCF – West", reportsTo: "TM011",
    assignedPartners: [
      { id: "P004", name: "Meena S.", rmn: "+91 65432 10987", kitchenType: "own" },
    ],
    status: "active", joinedDate: "May 2025",
  },

  // ─ SHF Manager under North RM ─
  {
    id: "TM016", name: "Ravi T.", rem: "shf-north@shero.in", role: "shf_manager",
    phone: "+91 90000 00014", city: "Delhi", region: "North", country: "India",
    department: "SHF – North", reportsTo: "TM010",
    assignedCuisines: ["North Indian", "Punjabi", "Mughlai"],
    assignedPartners: [
      { id: "P011", name: "Sunita D.", rmn: "+91 54321 09876", kitchenType: "branded" },
    ],
    status: "active", joinedDate: "Jun 2025",
  },

  // ─ HCF Manager under North RM ─
  {
    id: "TM017", name: "Pooja S.", rem: "hcf-north@shero.in", role: "hcf_manager",
    phone: "+91 90000 00018", city: "Delhi", region: "North", country: "India",
    department: "HCF – North", reportsTo: "TM010",
    assignedPartners: [
      { id: "P012", name: "Kamla J.", rmn: "+91 43210 98765", kitchenType: "own" },
    ],
    status: "active", joinedDate: "Jul 2025",
  },
  // ─ Operations Manager (reports to Vertical Head) ─
  {
    id: "TM040", name: "Shankar V.", rem: "ops-mgr@shero.in", role: "ops_manager",
    phone: "+91 90000 00040", city: "Chennai", region: "All India", country: "India",
    department: "Operations", reportsTo: "TM002", assignedPartners: [], status: "active", joinedDate: "Jan 2025",
  },
  // ─ HR Manager (reports to Country Head) ─
  {
    id: "TM041", name: "Revathi S.", rem: "hr-mgr@shero.in", role: "hr_manager",
    phone: "+91 90000 00041", city: "Chennai", region: "All India", country: "India",
    department: "HR", reportsTo: "TM001", assignedPartners: [], status: "active", joinedDate: "Mar 2025",
  },
  // ─ Onboarding Manager (reports to Vertical Head) ─
  {
    id: "TM025", name: "Meera R.", rem: "onboarding@shero.in", role: "onboarding_manager",
    phone: "+91 90000 00025", city: "Chennai", region: "All India", country: "India",
    department: "Onboarding", reportsTo: "TM002", assignedPartners: [], status: "active", joinedDate: "Feb 2025",
  },
  // ─ Kitchen Onboarding TL (reports to Onboarding Manager) ─
  {
    id: "TM026", name: "Divya N.", rem: "kobtl@shero.in", role: "kobtl",
    phone: "+91 90000 00026", city: "Chennai", region: "All India", country: "India",
    department: "Onboarding", reportsTo: "TM025", assignedPartners: [], status: "active", joinedDate: "Mar 2025",
  },
  // ─ SAP Onboarding TL (reports to Onboarding Manager) ─
  {
    id: "TM042", name: "Karthik M.", rem: "sap-tl@shero.in", role: "sap_onboarding_tl",
    phone: "+91 90000 00042", city: "Chennai", region: "All India", country: "India",
    department: "SAP Onboarding", reportsTo: "TM025", assignedPartners: [], status: "active", joinedDate: "Apr 2025",
  },
  // ─ SPC (Shero Partner Centre) Vertical ─
  {
    id: "TM031", name: "Vasanthi K.", rem: "spc-mgr@shero.in", role: "spc_manager" as AdminRole,
    phone: "+91 90000 00031", city: "Chennai", region: "All India", country: "India",
    department: "SPC", reportsTo: "TM002", assignedPartners: [], status: "active", joinedDate: "Jan 2026",
  },
  // ─ SPC TL (reports to SPC Manager) ─
  {
    id: "TM043", name: "Yamini R.", rem: "spc-tl@shero.in", role: "spc_tl",
    phone: "+91 90000 00043", city: "Chennai", region: "All India", country: "India",
    department: "SPC", reportsTo: "TM031", assignedPartners: [], status: "active", joinedDate: "Feb 2026",
  },
  // ─ SSC (Shero Support Center) Vertical ─
  {
    id: "TM027", name: "Rekha M.", rem: "ssc-mgr@shero.in", role: "ssc_manager",
    phone: "+91 90000 00027", city: "Chennai", region: "All India", country: "India",
    department: "SSC", reportsTo: "TM002", assignedPartners: [], status: "active", joinedDate: "Apr 2025",
  },
  // ─ SSC TL (reports to Ops Manager) ─
  {
    id: "TM028", name: "Anitha S.", rem: "ssc-tl@shero.in", role: "ssc_tl",
    phone: "+91 90000 00028", city: "Chennai", region: "All India", country: "India",
    department: "SSC", reportsTo: "TM040", assignedPartners: [], status: "active", joinedDate: "May 2025",
  },
  {
    id: "TM029", name: "Preethi V.", rem: "ssc-exec@shero.in", role: "ssc_executor",
    phone: "+91 90000 00029", city: "Chennai", region: "All India", country: "India",
    department: "SSC", reportsTo: "TM028", assignedPartners: [], status: "active", joinedDate: "Jun 2025",
  },
  {
    id: "TM030", name: "Gomathi R.", rem: "ssc-exec2@shero.in", role: "ssc_executor",
    phone: "+91 90000 00030", city: "Hyderabad", region: "South", country: "India",
    department: "SSC", reportsTo: "TM028", assignedPartners: [], status: "active", joinedDate: "Jul 2025",
  },
  // ─ KOB Executive (reports to KOBTL) ─
  {
    id: "TM032", name: "Swathi R.", rem: "kob-exec@shero.in", role: "kob_executive",
    phone: "+91 90000 00032", city: "Chennai", region: "All India", country: "India",
    department: "Onboarding", reportsTo: "TM026", assignedPartners: [], status: "active", joinedDate: "Apr 2025",
  },
  {
    id: "TM033", name: "Lakshmi T.", rem: "kob-exec2@shero.in", role: "kob_executive",
    phone: "+91 90000 00033", city: "Hyderabad", region: "South", country: "India",
    department: "Onboarding", reportsTo: "TM026", assignedPartners: [], status: "active", joinedDate: "May 2025",
  },
  // ─ Finance Manager (PPP, reports to Vertical Head) ─
  {
    id: "TM034", name: "Ganesh R.", rem: "finance-mgr@shero.in", role: "finance_manager",
    phone: "+91 90000 00034", city: "Chennai", region: "All India", country: "India",
    department: "Finance (PPP)", reportsTo: "TM002", assignedPartners: [], status: "active", joinedDate: "Mar 2025",
  },
  {
    id: "TM035", name: "Vijay K.", rem: "ppp-tl@shero.in", role: "ppp_tl",
    phone: "+91 90000 00035", city: "Chennai", region: "All India", country: "India",
    department: "Finance (PPP)", reportsTo: "TM034", assignedPartners: [], status: "active", joinedDate: "Apr 2025",
  },
  {
    id: "TM036", name: "Sudha M.", rem: "ppp-exec@shero.in", role: "ppp_executor",
    phone: "+91 90000 00036", city: "Chennai", region: "All India", country: "India",
    department: "Finance (PPP)", reportsTo: "TM035", assignedPartners: [], status: "active", joinedDate: "May 2025",
  },
  // ─ Party Orders Vertical ─
  {
    id: "TM037", name: "Bharathi S.", rem: "party-mgr@shero.in", role: "party_manager",
    phone: "+91 90000 00037", city: "Chennai", region: "All India", country: "India",
    department: "Party Orders", reportsTo: "TM002", assignedPartners: [], status: "active", joinedDate: "Jan 2026",
  },
  {
    id: "TM038", name: "Senthil K.", rem: "party-tl@shero.in", role: "party_tl",
    phone: "+91 90000 00038", city: "Chennai", region: "All India", country: "India",
    department: "Party Orders", reportsTo: "TM037", assignedPartners: [], status: "active", joinedDate: "Feb 2026",
  },
  {
    id: "TM039", name: "Vani R.", rem: "party-exec@shero.in", role: "party_executive",
    phone: "+91 90000 00039", city: "Chennai", region: "All India", country: "India",
    department: "Party Orders", reportsTo: "TM038", assignedPartners: [], status: "active", joinedDate: "Mar 2026",
  },
];

const roleOrder: AdminRole[] = ["super_admin", "country_manager", "vertical_head", "regional_manager", "ops_manager", "onboarding_manager", "hr_manager", "finance_manager", "kobtl", "sap_onboarding_tl", "kob_executive", "shf_manager", "hcf_manager", "spc_manager", "spc_tl", "ssc_manager", "ssc_tl", "ssc_executor", "ppp_tl", "ppp_executor", "party_manager", "party_tl", "party_executive", "asst_manager"];

const roleBadgeColors: Record<AdminRole, string> = {
  super_admin: "bg-primary/15 text-primary",
  country_manager: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  vertical_head: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400",
  regional_manager: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  ops_manager: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400",
  onboarding_manager: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400",
  hr_manager: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400",
  finance_manager: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  kobtl: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400",
  sap_onboarding_tl: "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-300",
  kob_executive: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-300",
  shf_manager: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  hcf_manager: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  spc_manager: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  spc_tl: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300",
  ssc_manager: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
  ssc_tl: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400",
  ssc_executor: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-400",
  ppp_tl: "bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-400",
  ppp_executor: "bg-lime-50 text-lime-600 dark:bg-lime-950 dark:text-lime-300",
  party_manager: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  party_tl: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  party_executive: "bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-300",
  asst_manager: "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400",
};

const roleIcons: Record<AdminRole, typeof Globe> = {
  super_admin: Shield,
  country_manager: Globe,
  vertical_head: Layers,
  regional_manager: MapPin,
  ops_manager: Briefcase,
  onboarding_manager: ClipboardCheck,
  hr_manager: HeartHandshake,
  finance_manager: Landmark,
  kobtl: ClipboardCheck,
  sap_onboarding_tl: ClipboardCheck,
  kob_executive: ClipboardCheck,
  shf_manager: UtensilsCrossed,
  hcf_manager: Home,
  spc_manager: Users,
  spc_tl: Users,
  ssc_manager: Users,
  ssc_tl: Users,
  ssc_executor: UserCircle,
  ppp_tl: IndianRupee,
  ppp_executor: UserCircle,
  party_manager: Target,
  party_tl: Target,
  party_executive: UserCircle,
  asst_manager: UserCircle,
};

const getRoleLabel = (role: AdminRole) => ADMIN_ROLES.find((r) => r.key === role)?.label || role;

const getRoleShortLabel = (role: AdminRole): string => {
  const map: Record<AdminRole, string> = {
    super_admin: "Super Admin",
    country_manager: "Country Head",
    vertical_head: "Vertical Head",
    regional_manager: "Regional Mgr",
    ops_manager: "Ops Manager",
    onboarding_manager: "Onboarding Mgr",
    hr_manager: "HR Manager",
    finance_manager: "Finance Mgr",
    kobtl: "Onboarding TL",
    sap_onboarding_tl: "SAP TL",
    kob_executive: "KOB Exec",
    shf_manager: "SHF Manager",
    hcf_manager: "HCF Manager",
    spc_manager: "SPC Manager",
    spc_tl: "SPC TL",
    ssc_manager: "SSC Manager",
    ssc_tl: "SSC TL",
    ssc_executor: "SSC Executor",
    ppp_tl: "PPP TL",
    ppp_executor: "PPP Executor",
    party_manager: "Party Mgr",
    party_tl: "Party TL",
    party_executive: "Party Exec",
    asst_manager: "Asst Manager",
  };
  return map[role] || role;
};

// ── Permission helpers ──

function getManageableRoles(loggedInRole: AdminRole | null): AdminRole[] {
  if (loggedInRole === "super_admin") return ["country_manager"];
  if (loggedInRole === "country_manager") return ["vertical_head", "hr_manager", "regional_manager", "ops_manager", "onboarding_manager", "finance_manager", "kobtl", "sap_onboarding_tl", "kob_executive", "shf_manager", "hcf_manager", "spc_manager", "spc_tl", "ssc_manager", "ssc_tl", "ssc_executor", "ppp_tl", "ppp_executor", "party_manager", "party_tl", "party_executive", "asst_manager"];
  if (loggedInRole === "vertical_head") return ["regional_manager", "ops_manager", "onboarding_manager", "finance_manager", "kobtl", "sap_onboarding_tl", "kob_executive", "shf_manager", "hcf_manager", "spc_manager", "spc_tl", "ssc_manager", "ssc_tl", "ssc_executor", "ppp_tl", "ppp_executor", "party_manager", "party_tl", "party_executive", "asst_manager"];
  if (loggedInRole === "hr_manager") return ["ops_manager", "onboarding_manager", "finance_manager", "kobtl", "sap_onboarding_tl", "kob_executive", "shf_manager", "hcf_manager", "spc_manager", "spc_tl", "ssc_manager", "ssc_tl", "ssc_executor", "ppp_tl", "ppp_executor", "party_manager", "party_tl", "party_executive", "asst_manager"];
  if (loggedInRole === "party_manager") return ["party_tl", "party_executive"];
  if (loggedInRole === "onboarding_manager") return ["kobtl", "sap_onboarding_tl", "kob_executive"];
  if (loggedInRole === "ops_manager") return ["ssc_tl", "ssc_executor"];
  if (loggedInRole === "finance_manager") return ["ppp_tl", "ppp_executor"];
  return [];
}

function canManageMember(loggedInRole: AdminRole | null, targetRole: AdminRole): boolean {
  return getManageableRoles(loggedInRole).includes(targetRole);
}

// ── Induction View ──

function InductionView({ members }: { members: TeamMember[] }) {
  const now = new Date();
  const recentJoiners = members
    .filter((m) => {
      const jd = new Date(m.joinedDate + " 1");
      return (now.getTime() - jd.getTime()) < 90 * 24 * 60 * 60 * 1000;
    })
    .sort((a, b) => new Date(b.joinedDate + " 1").getTime() - new Date(a.joinedDate + " 1").getTime());

  const inductionSteps = [
    { label: "IT Setup & Access", description: "Email, admin panel, device provisioning" },
    { label: "Policy Acknowledgement", description: "Code of conduct, POSH, leave policy" },
    { label: "Buddy Assignment", description: "Pair with experienced team member" },
    { label: "Department Introduction", description: "Meet team lead and key stakeholders" },
    { label: "Compliance Training", description: "Food safety, data privacy modules" },
    { label: "Probation Goals Set", description: "30-60-90 day targets defined" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "New Joiners (90d)", value: recentJoiners.length, accent: "text-primary" },
          { label: "Induction Pending", value: Math.max(0, recentJoiners.length - 2), accent: "text-orange-600" },
          { label: "Completed", value: Math.min(2, recentJoiners.length), accent: "text-emerald-600" },
          { label: "Avg Completion", value: "72%", accent: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className={`text-2xl font-bold ${s.accent}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Induction Checklist Template */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-primary" /> Standard Induction Checklist
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {inductionSteps.map((step, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{step.label}</p>
                <p className="text-[10px] text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Joiners */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Joiners</h3>
        {recentJoiners.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No new joiners in the last 90 days.</p>
        ) : (
          <div className="space-y-2">
            {recentJoiners.map((m) => {
              const roleLabel = ADMIN_ROLES.find((r) => r.key === m.role)?.label || m.role;
              const stepsCompleted = Math.floor(Math.random() * inductionSteps.length);
              const pct = Math.round((stepsCompleted / inductionSteps.length) * 100);
              return (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {m.name.split(" ").map((w) => w[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
                      <Badge variant="outline" className="text-[9px]">{roleLabel}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] text-muted-foreground">{m.department} • Joined {m.joinedDate}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-foreground">{stepsCompleted}/{inductionSteps.length} steps</p>
                    <Progress value={pct} className="w-20 h-1.5 mt-1" />
                    <p className="text-[9px] text-muted-foreground mt-0.5">{pct}% complete</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Component ──

export default function AdminTeam() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [topTab, setTopTab] = useState<"team" | "shf" | "hcf" | "workload" | "induction">("team");
  const [viewMode, setViewMode] = useState<"orgchart" | "hierarchy" | "list">("orgchart");
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [members, setMembers] = useState<TeamMember[]>(teamMembers);
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const loggedInRole = getAdminRole();
  const manageableRoles = getManageableRoles(loggedInRole);
  const canAdd = manageableRoles.length > 0;

  const regions = [...new Set(members.map((m) => m.region))].sort();

  // Stream-filtered members for SHF / HCF tabs
  const streamFiltered = useMemo(() => {
    if (topTab === "shf") {
      // SHF managers, their asst managers, and upstream hierarchy
      const shfIds = new Set<string>();
      members.forEach((m) => {
        if (m.role === "shf_manager" || (m.role === "asst_manager" && m.department.startsWith("SHF"))) {
          shfIds.add(m.id);
          // walk up
          let cur = m;
          while (cur.reportsTo) {
            shfIds.add(cur.reportsTo);
            const parent = members.find((p) => p.id === cur.reportsTo);
            if (!parent) break;
            cur = parent;
          }
        }
      });
      return members.filter((m) => shfIds.has(m.id));
    }
    if (topTab === "hcf") {
      const hcfIds = new Set<string>();
      members.forEach((m) => {
        if (m.role === "hcf_manager" || (m.role === "asst_manager" && m.department.startsWith("HCF"))) {
          hcfIds.add(m.id);
          let cur = m;
          while (cur.reportsTo) {
            hcfIds.add(cur.reportsTo);
            const parent = members.find((p) => p.id === cur.reportsTo);
            if (!parent) break;
            cur = parent;
          }
        }
      });
      return members.filter((m) => hcfIds.has(m.id));
    }
    return members;
  }, [topTab, members]);

  const filtered = useMemo(() => {
    return streamFiltered.filter((m) => {
      if (roleFilter !== "all" && m.role !== roleFilter) return false;
      if (regionFilter !== "all" && m.region !== regionFilter) return false;
      if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.rem.toLowerCase().includes(search.toLowerCase()) && !m.id.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, roleFilter, regionFilter, streamFiltered]);

  const handleSaveMember = (member: TeamMember) => {
    if (editingMember) {
      setMembers((prev) => prev.map((m) => (m.id === member.id ? member : m)));
      toast.success(`${member.name} updated successfully`);
    } else {
      setMembers((prev) => [...prev, member]);
      toast.success(`${member.name} added to team`);
    }
    setShowAddEdit(false);
    setEditingMember(null);
  };

  const handleDeleteMember = (id: string) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;
    const directReports = members.filter((m) => m.reportsTo === id);
    if (directReports.length > 0) {
      toast.error("Cannot remove — this member has direct reports. Reassign them first.");
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setSelectedMember(null);
    toast.success(`${member.name} removed from team`);
  };

  const handleEditClick = (member: TeamMember) => {
    setEditingMember(member);
    setShowAddEdit(true);
  };

  const topTabs: { key: typeof topTab; label: string; icon: typeof Globe; count: number }[] = [
    { key: "team", label: "Team", icon: Users, count: members.length },
    { key: "shf", label: "SHF", icon: UtensilsCrossed, count: members.filter((m) => m.role === "shf_manager" || (m.role === "asst_manager" && m.department.startsWith("SHF"))).length },
    { key: "hcf", label: "HCF", icon: Home, count: members.filter((m) => m.role === "hcf_manager" || (m.role === "asst_manager" && m.department.startsWith("HCF"))).length },
    { key: "workload", label: "Work Load", icon: BarChart3, count: members.filter((m) => ["asst_manager", "shf_manager", "hcf_manager"].includes(m.role)).length },
    { key: "induction", label: "New Induction", icon: ClipboardCheck, count: members.filter((m) => { const jd = new Date(m.joinedDate + " 1"); const now = new Date(); return (now.getTime() - jd.getTime()) < 90 * 24 * 60 * 60 * 1000; }).length },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ops hierarchy: Country → Regional (P&L) → SHF Cuisine Managers + HCF Managers → Asst Managers
          </p>
        </div>
        {canAdd && (
          <Button size="sm" onClick={() => { setEditingMember(null); setShowAddEdit(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Add Member
          </Button>
        )}
      </div>

      {/* ── Top-level tabs: SHF / HCF / Team / Work Load ── */}
      <div className="flex gap-2 border-b border-border pb-0">
        {topTabs.map((tab) => {
          const Icon = tab.icon;
          const active = topTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setTopTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Work Load Tab ── */}
      {topTab === "induction" ? (
        <InductionView members={members} />
      ) : topTab === "workload" ? (
        <MappingView members={filtered.length > 0 ? filtered : members} allMembers={members} onSelect={setSelectedMember} onReassign={(partnerId, fromMgrId, toMgrId) => {
          setMembers((prev) => {
            const fromMgr = prev.find((m) => m.id === fromMgrId);
            const partner = fromMgr?.assignedPartners.find((p) => p.id === partnerId);
            if (!partner) return prev;
            return prev.map((m) => {
              if (m.id === fromMgrId) return { ...m, assignedPartners: m.assignedPartners.filter((p) => p.id !== partnerId) };
              if (m.id === toMgrId) return { ...m, assignedPartners: [...m.assignedPartners, partner] };
              return m;
            });
          });
          toast.success("Partner reassigned successfully");
        }} />
      ) : (
        <>
          {/* Role summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {roleOrder.map((role) => {
              const count = streamFiltered.filter((m) => m.role === role).length;
              if (count === 0) return null;
              const Icon = roleIcons[role];
              return (
                <button
                  key={role}
                  onClick={() => setRoleFilter(roleFilter === role ? "all" : role)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    roleFilter === role
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-card hover:border-foreground/20"
                  }`}
                >
                  <Icon className="w-4 h-4 text-muted-foreground mb-1" />
                  <p className="text-lg font-bold text-foreground">{count}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{getRoleShortLabel(role)}</p>
                </button>
              );
            })}
          </div>

          {/* Filtered member list below role cards */}
          {roleFilter !== "all" && (() => {
            const roleMembers = streamFiltered.filter((m) => m.role === (roleFilter as AdminRole));
            if (roleMembers.length === 0) return null;
            return (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-1.5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {getRoleShortLabel(roleFilter as AdminRole)} · {roleMembers.length} member{roleMembers.length > 1 ? "s" : ""}
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                  {roleMembers.map((m) => {
                    const Icon = roleIcons[m.role];
                    return (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMember(m)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all text-left"
                      >
                        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{m.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{m.department} · {m.region}</p>
                        </div>
                        <Badge variant="secondary" className="text-[8px] shrink-0">{m.city}</Badge>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, REM, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-full sm:w-48 h-9 text-xs">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(["orgchart", "hierarchy", "list"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors capitalize ${viewMode === mode ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}
                >
                  {mode === "orgchart" ? "Org Chart" : mode}
                </button>
              ))}
            </div>
          </div>

          {/* View */}
          {viewMode === "orgchart" ? (
            <OrgChartView members={filtered} allMembers={streamFiltered} onSelect={setSelectedMember} />
          ) : viewMode === "hierarchy" ? (
            <HierarchyView members={filtered} allMembers={streamFiltered} onSelect={setSelectedMember} />
          ) : (
            <ListView members={filtered} onSelect={setSelectedMember} loggedInRole={loggedInRole} onEdit={handleEditClick} />
          )}
        </>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedMember && (() => { const I = roleIcons[selectedMember.role]; return <I className="w-5 h-5 text-primary" />; })()}
              {selectedMember?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <DetailItem label="Member ID" value={selectedMember.id} />
                <DetailItem label="REM" value={selectedMember.rem} />
                <DetailItem label="Phone" value={selectedMember.phone} />
                <DetailItem label="Role" value={getRoleLabel(selectedMember.role)} />
                <DetailItem label="Department" value={selectedMember.department} />
                <DetailItem label="City" value={selectedMember.city} />
                <DetailItem label="Region" value={selectedMember.region} />
                <DetailItem label="Joined" value={selectedMember.joinedDate} />
                <DetailItem
                  label="Reports To"
                  value={selectedMember.reportsTo ? members.find((m) => m.id === selectedMember.reportsTo)?.name || "—" : "— (Top Level)"}
                />
              </div>

              {/* Assigned Cuisines for SHF Managers */}
              {selectedMember.role === "shf_manager" && selectedMember.assignedCuisines && selectedMember.assignedCuisines.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Assigned Cuisines ({selectedMember.assignedCuisines.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMember.assignedCuisines.map((c) => (
                      <Badge key={c} variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800">
                        <UtensilsCrossed className="w-2.5 h-2.5 mr-1" />{c}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedMember.assignedPartners.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Assigned Partners / Kitchens ({selectedMember.assignedPartners.length})
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedMember.assignedPartners.map((p) => (
                      <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50">
                        <div>
                          <p className="text-xs font-medium text-foreground">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">RMN: {p.rmn}</p>
                        </div>
                        <Badge variant="outline" className="text-[9px] capitalize">{p.kitchenType}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedMember.assignedPartners.length === 0 && !selectedMember.assignedCuisines?.length && (
                <p className="text-xs text-muted-foreground italic">
                  {selectedMember.role === "super_admin" || selectedMember.role === "country_manager" || selectedMember.role === "regional_manager"
                    ? "Oversees all partners through the team hierarchy"
                    : "No partners directly assigned"}
                </p>
              )}

              {(() => {
                const directReports = members.filter((m) => m.reportsTo === selectedMember.id);
                if (directReports.length === 0) return null;
                return (
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Direct Reports ({directReports.length})
                    </p>
                    <div className="space-y-1.5">
                      {directReports.map((r) => (
                        <div key={r.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50">
                          <div>
                            <p className="text-xs font-medium text-foreground">{r.name}</p>
                            <p className="text-[10px] text-muted-foreground">{r.rem}</p>
                          </div>
                          <Badge className={`${roleBadgeColors[r.role]} text-[9px] border-0`}>
                            {getRoleShortLabel(r.role)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {canManageMember(loggedInRole, selectedMember.role) && (
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => { handleEditClick(selectedMember); setSelectedMember(null); }}>
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleDeleteMember(selectedMember.id)}>
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add / Edit Dialog */}
      <AddEditMemberDialog
        open={showAddEdit}
        onOpenChange={(open) => { setShowAddEdit(open); if (!open) setEditingMember(null); }}
        member={editingMember}
        manageableRoles={manageableRoles}
        allMembers={members}
        onSave={handleSaveMember}
      />
    </div>
  );
}

// ── Org Chart (Nested Cards) ──

function OrgChartView({
  members,
  allMembers,
  onSelect,
}: {
  members: TeamMember[];
  allMembers: TeamMember[];
  onSelect: (m: TeamMember) => void;
}) {
  const memberIds = new Set(members.map((m) => m.id));
  const getChildren = (parentId: string): TeamMember[] =>
    allMembers.filter((m) => m.reportsTo === parentId && memberIds.has(m.id));

  const countries = [...new Set(allMembers.map((m) => m.country))];

  return (
    <div className="space-y-6">
      {countries.map((country) => {
        const countryHead = allMembers.find(
          (m) => m.country === country && m.role === "country_manager" && memberIds.has(m.id)
        );

        if (!countryHead) return null;

        const verticalHeads = getChildren(countryHead.id).filter((m) => m.role === "vertical_head");
        const hrManagers = getChildren(countryHead.id).filter((m) => m.role === "hr_manager");

        return (
          <div key={country} className="rounded-2xl border-2 border-primary/20 bg-primary/[0.02] p-4 md:p-6">
            {/* Country Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{country}</h2>
                <p className="text-[11px] text-muted-foreground">
                  {allMembers.filter((m) => m.country === country).length} team members
                </p>
              </div>
            </div>

            {/* Country Head Card */}
            <OrgMemberCard member={countryHead} onSelect={onSelect} highlight />

            {/* HR Manager (reports to Country Head) */}
            {hrManagers.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {hrManagers.map((hr) => (
                  <div key={hr.id} className="rounded-xl border border-pink-200/50 dark:border-pink-900/50 bg-pink-50/20 dark:bg-pink-950/10 p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <HeartHandshake className="w-3 h-3 text-pink-600" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Human Resources
                      </span>
                    </div>
                    <OrgMemberCard member={hr} onSelect={onSelect} compact />
                  </div>
                ))}
              </div>
            )}

            {/* Business Vertical Labels */}
            <div className="mt-4 flex flex-wrap gap-1.5 mb-2">
              {["SAP & OPS", "DST", "OTC", "Network"].map((v) => (
                <span
                  key={v}
                  className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${
                    v === "SAP & OPS"
                      ? "bg-primary/15 text-primary border-primary/30 ring-1 ring-primary/20"
                      : "bg-muted text-muted-foreground border-border opacity-60"
                  }`}
                >
                  {v === "SAP & OPS" ? "▶ " + v : v}
                </span>
              ))}
            </div>

            {/* Vertical Heads → full sub-hierarchy */}
            <div className="mt-4 space-y-4">
              {verticalHeads.map((vh) => {
                const allVhChildren = getChildren(vh.id);
                const regionalManagers = allVhChildren.filter((m) => m.role === "regional_manager");
                const otherDirectReports = allVhChildren.filter((m) => m.role !== "regional_manager");

                // Group non-RM direct reports by department for cleaner rendering
                const subVerticalGroups: { label: string; icon: React.ReactNode; containerClass: string; members: TeamMember[] }[] = [];

                const onboardingMgrs = otherDirectReports.filter((m) => m.role === "onboarding_manager");
                if (onboardingMgrs.length > 0) {
                  subVerticalGroups.push({ label: "Onboarding", icon: <ClipboardCheck className="w-3 h-3" />, containerClass: "border-teal-200/50 dark:border-teal-900/50 bg-teal-50/20 dark:bg-teal-950/10", members: onboardingMgrs });
                }

                const kobTLs = otherDirectReports.filter((m) => m.role === "kobtl");
                if (kobTLs.length > 0) {
                  subVerticalGroups.push({ label: "Kitchen Onboarding (KOB)", icon: <ClipboardCheck className="w-3 h-3" />, containerClass: "border-cyan-200/50 dark:border-cyan-900/50 bg-cyan-50/20 dark:bg-cyan-950/10", members: kobTLs });
                }

                const spcMgrs = otherDirectReports.filter((m) => m.role === "spc_manager");
                if (spcMgrs.length > 0) {
                  subVerticalGroups.push({ label: "Shero Partner Centre (SPC)", icon: <Users className="w-3 h-3" />, containerClass: "border-violet-200/50 dark:border-violet-900/50 bg-violet-50/20 dark:bg-violet-950/10", members: spcMgrs });
                }

                const sscMgrs = otherDirectReports.filter((m) => m.role === "ssc_manager");
                if (sscMgrs.length > 0) {
                  subVerticalGroups.push({ label: "Shero Support Center (SSC)", icon: <Users className="w-3 h-3" />, containerClass: "border-rose-200/50 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10", members: sscMgrs });
                }

                const financeMgrs = otherDirectReports.filter((m) => m.role === "finance_manager");
                if (financeMgrs.length > 0) {
                  subVerticalGroups.push({ label: "Finance / PPP", icon: <Landmark className="w-3 h-3" />, containerClass: "border-emerald-200/50 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10", members: financeMgrs });
                }

                const opsMgrs = otherDirectReports.filter((m) => m.role === "ops_manager");
                if (opsMgrs.length > 0) {
                  subVerticalGroups.push({ label: "Operations", icon: <Briefcase className="w-3 h-3" />, containerClass: "border-sky-200/50 dark:border-sky-900/50 bg-sky-50/20 dark:bg-sky-950/10", members: opsMgrs });
                }

                const partyMgrs = otherDirectReports.filter((m) => m.role === "party_manager");
                if (partyMgrs.length > 0) {
                  subVerticalGroups.push({ label: "Party Orders", icon: <Target className="w-3 h-3" />, containerClass: "border-orange-200/50 dark:border-orange-900/50 bg-orange-50/20 dark:bg-orange-950/10", members: partyMgrs });
                }

                return (
                  <OrgDepartmentCard
                    key={vh.id}
                    head={vh}
                    icon={<Layers className="w-4 h-4" />}
                    label={`${vh.department} Vertical`}
                    onSelect={onSelect}
                  >
                    {/* Regional Managers → SHF / HCF streams */}
                    {regionalManagers.length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center gap-1.5 mb-3">
                          <MapPin className="w-3 h-3 text-purple-600" />
                          <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                            Regional Operations (P&L)
                          </span>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {regionalManagers.map((rm) => {
                            const shfManagers = getChildren(rm.id).filter((m) => m.role === "shf_manager");
                            const hcfManagers = getChildren(rm.id).filter((m) => m.role === "hcf_manager");

                            return (
                              <OrgDepartmentCard
                                key={rm.id}
                                head={rm}
                                icon={<MapPin className="w-4 h-4" />}
                                label={`${rm.region} Region (P&L Owner)`}
                                onSelect={onSelect}
                              >
                                {/* SHF Stream */}
                                {shfManagers.length > 0 && (
                                  <div className="mt-3">
                                    <div className="flex items-center gap-1.5 mb-2">
                                      <UtensilsCrossed className="w-3 h-3 text-amber-600" />
                                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                                        SHF — Shero Home Food (Branded)
                                      </span>
                                    </div>
                                    <div className="space-y-2">
                                      {shfManagers.map((shf) => {
                                        const assistants = getChildren(shf.id);
                                        return (
                                          <div key={shf.id} className="rounded-lg border border-amber-200/50 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20 p-2.5">
                                            <OrgMemberCard member={shf} onSelect={onSelect} compact />
                                            {shf.assignedCuisines && shf.assignedCuisines.length > 0 && (
                                              <div className="flex flex-wrap gap-1 mt-1.5 ml-9">
                                                {shf.assignedCuisines.map((c) => (
                                                  <span key={c} className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 font-medium">
                                                    {c}
                                                  </span>
                                                ))}
                                              </div>
                                            )}
                                            {assistants.length > 0 && (
                                              <div className="space-y-1 mt-2 ml-4 border-l-2 border-amber-200/50 dark:border-amber-800/50 pl-3">
                                                {assistants.map((a) => (
                                                  <OrgMemberCard key={a.id} member={a} onSelect={onSelect} compact />
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* HCF Stream */}
                                {hcfManagers.length > 0 && (
                                  <div className="mt-3">
                                    <div className="flex items-center gap-1.5 mb-2">
                                      <Home className="w-3 h-3 text-green-600" />
                                      <span className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">
                                        HCF — Home Chef Kitchens (Unbranded)
                                      </span>
                                    </div>
                                    <div className="space-y-2">
                                      {hcfManagers.map((hcf) => {
                                        const assistants = getChildren(hcf.id);
                                        return (
                                          <div key={hcf.id} className="rounded-lg border border-green-200/50 dark:border-green-900/50 bg-green-50/30 dark:bg-green-950/20 p-2.5">
                                            <OrgMemberCard member={hcf} onSelect={onSelect} compact />
                                            {assistants.length > 0 && (
                                              <div className="space-y-1 mt-2 ml-4 border-l-2 border-green-200/50 dark:border-green-800/50 pl-3">
                                                {assistants.map((a) => (
                                                  <OrgMemberCard key={a.id} member={a} onSelect={onSelect} compact />
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </OrgDepartmentCard>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Other Sub-Verticals: Onboarding, KOB, SPC, SSC, PPP */}
                    {subVerticalGroups.length > 0 && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {subVerticalGroups.map((group) => (
                          <div key={group.label} className={`rounded-xl border ${group.containerClass} p-3`}>
                            <div className="flex items-center gap-1.5 mb-2">
                              {group.icon}
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                {group.label}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {group.members.map((m) => {
                                const subReports = getChildren(m.id);
                                return (
                                  <div key={m.id}>
                                    <OrgMemberCard member={m} onSelect={onSelect} compact />
                                    {subReports.length > 0 && (
                                      <div className="space-y-1 mt-1.5 ml-4 border-l-2 border-border/50 pl-3">
                                        {subReports.map((sr) => {
                                          const srChildren = getChildren(sr.id);
                                          return (
                                            <div key={sr.id}>
                                              <OrgMemberCard member={sr} onSelect={onSelect} compact />
                                              {srChildren.length > 0 && (
                                                <div className="space-y-1 mt-1 ml-4 border-l-2 border-border/30 pl-3">
                                                  {srChildren.map((src) => (
                                                    <OrgMemberCard key={src.id} member={src} onSelect={onSelect} compact />
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </OrgDepartmentCard>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OrgDepartmentCard({
  head,
  icon,
  label,
  children,
  onSelect,
  compact = false,
}: {
  head: TeamMember;
  icon: React.ReactNode;
  label: string;
  children?: React.ReactNode;
  onSelect: (m: TeamMember) => void;
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={`rounded-xl border bg-card ${compact ? "p-3 border-border/60" : "p-4 border-border"}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`${roleBadgeColors[head.role]} rounded-md p-1`}>{icon}</span>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex-1">{label}</span>
        <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground">
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      </div>
      <OrgMemberCard member={head} onSelect={onSelect} compact={compact} />
      {expanded && children}
    </div>
  );
}

function OrgMemberCard({
  member,
  onSelect,
  highlight = false,
  compact = false,
}: {
  member: TeamMember;
  onSelect: (m: TeamMember) => void;
  highlight?: boolean;
  compact?: boolean;
}) {
  const Icon = roleIcons[member.role];
  const partnerCount = member.assignedPartners.length;

  return (
    <button
      onClick={() => onSelect(member)}
      className={`w-full text-left rounded-lg transition-all group ${
        highlight
          ? "bg-primary/5 border border-primary/20 p-3 hover:bg-primary/10"
          : compact
          ? "bg-muted/40 p-2.5 hover:bg-muted/70"
          : "bg-muted/30 border border-border/50 p-3 hover:bg-muted/60"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className={`${compact ? "w-7 h-7" : "w-9 h-9"} rounded-full bg-primary/10 flex items-center justify-center shrink-0`}>
          <Icon className={`${compact ? "w-3.5 h-3.5" : "w-4 h-4"} text-primary`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`${compact ? "text-xs" : "text-sm"} font-medium text-foreground`}>{member.name}</p>
            <Badge className={`${roleBadgeColors[member.role]} text-[8px] border-0 px-1.5 py-0`}>
              {getRoleShortLabel(member.role)}
            </Badge>
          </div>
          <p className={`${compact ? "text-[9px]" : "text-[10px]"} text-muted-foreground truncate`}>
            REM: {member.rem} · {member.city}
            {partnerCount > 0 && <span className="text-primary font-medium"> · {partnerCount} partners</span>}
          </p>
        </div>
        <Eye className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </div>
    </button>
  );
}

// ── Hierarchy View ──

function HierarchyView({
  members,
  allMembers,
  onSelect,
}: {
  members: TeamMember[];
  allMembers: TeamMember[];
  onSelect: (m: TeamMember) => void;
}) {
  const memberIds = new Set(members.map((m) => m.id));
  const roots = allMembers.filter((m) => !m.reportsTo && memberIds.has(m.id));
  const getChildren = (parentId: string): TeamMember[] =>
    allMembers.filter((m) => m.reportsTo === parentId && memberIds.has(m.id));

  if (roots.length === 0 && members.length > 0) {
    return <ListView members={members} onSelect={onSelect} loggedInRole={null} onEdit={() => {}} />;
  }

  return (
    <div className="space-y-1">
      {roots.map((root) => (
        <HierarchyNode key={root.id} member={root} getChildren={getChildren} onSelect={onSelect} depth={0} />
      ))}
    </div>
  );
}

function HierarchyNode({
  member,
  getChildren,
  onSelect,
  depth,
}: {
  member: TeamMember;
  getChildren: (id: string) => TeamMember[];
  onSelect: (m: TeamMember) => void;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const children = getChildren(member.id);

  return (
    <div>
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
        style={{ paddingLeft: `${12 + depth * 24}px` }}
      >
        {children.length > 0 ? (
          <button onClick={() => setExpanded(!expanded)} className="shrink-0 w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <span className="w-5" />
        )}
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            {(() => { const I = roleIcons[member.role]; return <I className="w-3.5 h-3.5 text-primary" />; })()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium text-foreground">{member.name}</p>
              <Badge className={`${roleBadgeColors[member.role]} text-[9px] border-0 shrink-0`}>
                {getRoleShortLabel(member.role)}
              </Badge>
              {member.assignedCuisines && member.assignedCuisines.length > 0 && (
                <span className="text-[9px] text-amber-600 dark:text-amber-400 font-medium">
                  ({member.assignedCuisines.join(", ")})
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              REM: {member.rem} · {member.region}
              {member.assignedPartners.length > 0 && ` · ${member.assignedPartners.length} partners`}
            </p>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={() => onSelect(member)}
        >
          <Eye className="w-3.5 h-3.5" />
        </Button>
      </div>
      {expanded && children.length > 0 && (
        <div className="border-l border-border/50" style={{ marginLeft: `${24 + depth * 24}px` }}>
          {children.map((child) => (
            <HierarchyNode key={child.id} member={child} getChildren={getChildren} onSelect={onSelect} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── List View ──

function ListView({
  members,
  onSelect,
  loggedInRole,
  onEdit,
}: {
  members: TeamMember[];
  onSelect: (m: TeamMember) => void;
  loggedInRole: AdminRole | null;
  onEdit: (m: TeamMember) => void;
}) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Member (REM)</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Department</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Cuisines / Partners</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-muted/20">
                <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{m.id}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{m.name}</p>
                  <p className="text-[11px] text-muted-foreground">REM: {m.rem}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge className={`${roleBadgeColors[m.role]} text-[10px] border-0`}>
                    {getRoleShortLabel(m.role)}
                  </Badge>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">{m.department}</td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                  {m.assignedCuisines && m.assignedCuisines.length > 0
                    ? m.assignedCuisines.join(", ")
                    : m.assignedPartners.length > 0
                    ? `${m.assignedPartners.length} partners`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right flex gap-1 justify-end">
                  {canManageMember(loggedInRole, m.role) && (
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit(m)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onSelect(m)}>
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Add / Edit Dialog ──

function AddEditMemberDialog({
  open,
  onOpenChange,
  member,
  manageableRoles,
  allMembers,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
  manageableRoles: AdminRole[];
  allMembers: TeamMember[];
  onSave: (m: TeamMember) => void;
}) {
  const isEdit = !!member;
  const [name, setName] = useState(member?.name || "");
  const [rem, setRem] = useState(member?.rem || "");
  const [phone, setPhone] = useState(member?.phone || "");
  const [role, setRole] = useState<AdminRole>(member?.role || manageableRoles[0]);
  const [city, setCity] = useState(member?.city || "");
  const [region, setRegion] = useState(member?.region || "");
  const [department, setDepartment] = useState(member?.department || "");
  const [reportsTo, setReportsTo] = useState(member?.reportsTo || "");

  // Reset form when member changes
  useState(() => {
    if (member) {
      setName(member.name); setRem(member.rem); setPhone(member.phone); setRole(member.role);
      setCity(member.city); setRegion(member.region); setDepartment(member.department); setReportsTo(member.reportsTo || "");
    } else {
      setName(""); setRem(""); setPhone(""); setCity(""); setRegion(""); setDepartment(""); setReportsTo("");
      if (manageableRoles.length > 0) setRole(manageableRoles[0]);
    }
  });

  const possibleSupervisors = allMembers.filter((m) => {
    const superiorRoles: Record<AdminRole, AdminRole[]> = {
      country_manager: ["super_admin"],
      vertical_head: ["country_manager"],
      regional_manager: ["vertical_head"],
      ops_manager: ["vertical_head"],
      onboarding_manager: ["vertical_head"],
      hr_manager: ["country_manager"],
      finance_manager: ["vertical_head"],
      kobtl: ["onboarding_manager"],
      sap_onboarding_tl: ["onboarding_manager"],
      kob_executive: ["kobtl"],
      shf_manager: ["regional_manager"],
      hcf_manager: ["regional_manager"],
      spc_manager: ["vertical_head"],
      spc_tl: ["spc_manager"],
      ssc_manager: ["vertical_head"],
      ssc_tl: ["ops_manager"],
      ssc_executor: ["ssc_tl"],
      ppp_tl: ["finance_manager"],
      ppp_executor: ["ppp_tl"],
      party_manager: ["vertical_head"],
      party_tl: ["party_manager"],
      party_executive: ["party_tl"],
      asst_manager: ["shf_manager", "hcf_manager"],
      super_admin: [],
    };
    return superiorRoles[role]?.includes(m.role);
  });

  const handleSubmit = () => {
    if (!name.trim() || !rem.trim()) {
      toast.error("Name and REM (email) are required");
      return;
    }
    const newMember: TeamMember = {
      id: member?.id || `TM${String(allMembers.length + 1).padStart(3, "0")}`,
      name: name.trim(), rem: rem.trim(), role,
      phone: phone.trim(), city: city.trim(), region: region.trim(),
      country: member?.country || "India",
      department: department.trim(),
      reportsTo: reportsTo || null,
      assignedCuisines: member?.assignedCuisines || [],
      assignedPartners: member?.assignedPartners || [],
      status: member?.status || "active",
      joinedDate: member?.joinedDate || new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    };
    onSave(newMember);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kavitha R." />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">REM (Email) *</Label>
              <Input value={rem} onChange={(e) => setRem(e.target.value)} placeholder="email@shero.in" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 90000 00000" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as AdminRole)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {manageableRoles.map((r) => (
                    <SelectItem key={r} value={r}>{getRoleLabel(r)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">City</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Chennai" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Region</Label>
              <Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="South" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Department</Label>
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="SHF – South" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Reports To</Label>
              <Select value={reportsTo} onValueChange={setReportsTo}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {possibleSupervisors.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({getRoleShortLabel(s.role)})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>{isEdit ? "Save Changes" : "Add Member"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Load helpers ──

const MAX_PARTNERS_PER_MANAGER = 5; // ideal max load

function getLoadInfo(count: number) {
  const pct = Math.min((count / MAX_PARTNERS_PER_MANAGER) * 100, 100);
  if (pct <= 40) return { pct, color: "bg-emerald-500", label: "Low", textColor: "text-emerald-600 dark:text-emerald-400" };
  if (pct <= 70) return { pct, color: "bg-amber-500", label: "Medium", textColor: "text-amber-600 dark:text-amber-400" };
  return { pct, color: "bg-destructive", label: "High", textColor: "text-destructive" };
}

// ── Mapping View: Reverse lookup — Manager → Kitchens/Partners ──

function MappingView({ members, allMembers, onSelect, onReassign }: { members: TeamMember[]; allMembers: TeamMember[]; onSelect: (m: TeamMember) => void; onReassign: (partnerId: string, fromMgrId: string, toMgrId: string) => void }) {
  const [dragData, setDragData] = useState<{ partnerId: string; fromMgrId: string } | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const managers = members.filter((m) => ["asst_manager", "shf_manager", "hcf_manager"].includes(m.role));

  // Group managers by their cuisine/HCF manager supervisor for load comparison
  const managerGroups = useMemo(() => {
    const groups: Record<string, { supervisor: TeamMember | null; managers: TeamMember[] }> = {};
    managers.forEach((mgr) => {
      // For asst_managers, group under their direct supervisor (cuisine/hcf manager)
      // For cuisine/hcf managers, group under their regional manager
      const parentId = mgr.reportsTo || "ungrouped";
      const parent = allMembers.find((m) => m.id === parentId) || null;
      if (!groups[parentId]) {
        groups[parentId] = { supervisor: parent, managers: [] };
      }
      groups[parentId].managers.push(mgr);
    });
    return Object.values(groups).sort((a, b) => {
      const aName = a.supervisor?.name || "ZZZ";
      const bName = b.supervisor?.name || "ZZZ";
      return aName.localeCompare(bName);
    });
  }, [managers, allMembers]);

  const getReportingChain = (member: TeamMember): string[] => {
    const chain: string[] = [];
    let current = member;
    while (current.reportsTo) {
      const parent = allMembers.find((m) => m.id === current.reportsTo);
      if (!parent) break;
      chain.push(`${parent.name} (${getRoleShortLabel(parent.role)})`);
      current = parent;
    }
    return chain.reverse();
  };

  const handleDragStart = (e: React.DragEvent, partnerId: string, fromMgrId: string) => {
    e.stopPropagation();
    setDragData({ partnerId, fromMgrId });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", partnerId);
  };

  const handleDragOver = (e: React.DragEvent, mgrId: string) => {
    e.preventDefault();
    if (dragData && dragData.fromMgrId !== mgrId) {
      e.dataTransfer.dropEffect = "move";
      setDropTargetId(mgrId);
    }
  };

  const handleDragLeave = () => {
    setDropTargetId(null);
  };

  const handleDrop = (e: React.DragEvent, toMgrId: string) => {
    e.preventDefault();
    setDropTargetId(null);
    if (dragData && dragData.fromMgrId !== toMgrId) {
      onReassign(dragData.partnerId, dragData.fromMgrId, toMgrId);
    }
    setDragData(null);
  };

  const handleDragEnd = () => {
    setDragData(null);
    setDropTargetId(null);
  };

  if (managers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No managers found matching your filters.
      </div>
    );
  }

  // Compute overall load stats
  const totalPartners = managers.reduce((s, m) => s + m.assignedPartners.length, 0);
  const avgLoad = managers.length > 0 ? (totalPartners / managers.length).toFixed(1) : "0";
  const maxLoad = Math.max(...managers.map((m) => m.assignedPartners.length), 0);
  const minLoad = Math.min(...managers.map((m) => m.assignedPartners.length), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{managers.length}</span> managers with their assigned kitchens & partners
        </p>
        <p className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
          💡 Drag partner cards between managers to reassign
        </p>
      </div>

      {/* Load overview strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-lg font-bold text-foreground">{totalPartners}</p>
          <p className="text-[10px] text-muted-foreground">Total Partners</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-lg font-bold text-foreground">{avgLoad}</p>
          <p className="text-[10px] text-muted-foreground">Avg Load / Mgr</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className={`text-lg font-bold ${getLoadInfo(maxLoad).textColor}`}>{maxLoad}</p>
          <p className="text-[10px] text-muted-foreground">Max Load</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className={`text-lg font-bold ${getLoadInfo(minLoad).textColor}`}>{minLoad}</p>
          <p className="text-[10px] text-muted-foreground">Min Load</p>
        </div>
      </div>

      {/* ── Analytics Charts ── */}
      <TeamLoadCharts managers={managers} />

      {/* Grouped by supervisor */}
      {managerGroups.map((group, gi) => (
        <div key={gi} className="space-y-3">
          {group.supervisor && (
            <div className="flex items-center gap-2 pt-2">
              <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs font-semibold text-foreground">
                Under {group.supervisor.name}
                <span className="ml-1 text-muted-foreground font-normal">({getRoleShortLabel(group.supervisor.role)})</span>
              </p>
              <span className="text-[10px] text-muted-foreground ml-auto">
                {group.managers.reduce((s, m) => s + m.assignedPartners.length, 0)} partners across {group.managers.length} managers
              </span>
            </div>
          )}

          {/* Load comparison bar for the group */}
          {group.managers.length > 1 && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                <BarChart3 className="w-3 h-3" /> Load Comparison
              </p>
              {group.managers.map((mgr) => {
                const load = getLoadInfo(mgr.assignedPartners.length);
                return (
                  <div key={mgr.id} className="flex items-center gap-2">
                    <span className="text-[10px] text-foreground font-medium w-24 truncate">{mgr.name}</span>
                    <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${load.color}`}
                        style={{ width: `${Math.max(load.pct, 4)}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-semibold w-6 text-right ${load.textColor}`}>
                      {mgr.assignedPartners.length}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {group.managers.map((mgr) => {
              const Icon = roleIcons[mgr.role];
              const chain = getReportingChain(mgr);
              const isDropTarget = dropTargetId === mgr.id;
              const load = getLoadInfo(mgr.assignedPartners.length);
              return (
                <div
                  key={mgr.id}
                  className={`rounded-xl border-2 bg-card p-4 transition-all ${
                    isDropTarget
                      ? "border-primary bg-primary/5 shadow-lg scale-[1.01]"
                      : "border-border hover:border-primary/30"
                  }`}
                  onDragOver={(e) => handleDragOver(e, mgr.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, mgr.id)}
                >
                  {/* Manager header */}
                  <div className="flex items-start gap-3 mb-2 cursor-pointer" onClick={() => onSelect(mgr)}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${roleBadgeColors[mgr.role]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">{mgr.name}</p>
                      <Badge className={`${roleBadgeColors[mgr.role]} text-[9px] border-0 mt-0.5`}>
                        {getRoleShortLabel(mgr.role)}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-1">{mgr.city} · {mgr.region}</p>
                      {mgr.assignedCuisines && mgr.assignedCuisines.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {mgr.assignedCuisines.map((c) => (
                            <span key={c} className="px-1.5 py-0.5 text-[9px] font-medium bg-primary/10 text-primary rounded-full">{c}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Load bar */}
                  <div className="mb-3 px-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Workload</span>
                      <span className={`text-[10px] font-bold ${load.textColor}`}>
                        {mgr.assignedPartners.length}/{MAX_PARTNERS_PER_MANAGER} · {load.label}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${load.color}`}
                        style={{ width: `${Math.max(load.pct, 4)}%` }}
                      />
                    </div>
                  </div>

                  {/* Reporting chain */}
                  {chain.length > 0 && (
                    <div className="mb-3 px-2 py-1.5 rounded-lg bg-muted/50">
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Reports to</p>
                      <p className="text-[10px] text-foreground">{chain.join(" → ")}</p>
                    </div>
                  )}

                  {/* Assigned partners & kitchens */}
                  <div>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5">
                      Assigned Partners ({mgr.assignedPartners.length})
                    </p>
                    {mgr.assignedPartners.length === 0 ? (
                      <div className={`text-center py-4 rounded-lg border-2 border-dashed transition-colors ${isDropTarget ? "border-primary/50 bg-primary/5" : "border-border"}`}>
                        <p className="text-[11px] text-muted-foreground italic">Drop partners here</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {mgr.assignedPartners.map((p) => (
                          <div
                            key={p.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, p.id, mgr.id)}
                            onDragEnd={handleDragEnd}
                            className={`flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/50 cursor-grab active:cursor-grabbing hover:bg-muted/60 hover:border-primary/20 transition-all ${
                              dragData?.partnerId === p.id ? "opacity-40 scale-95" : ""
                            }`}
                          >
                            <div className="flex flex-col items-center gap-0.5 text-muted-foreground/40 shrink-0">
                              <div className="w-1 h-1 rounded-full bg-current" />
                              <div className="w-1 h-1 rounded-full bg-current" />
                              <div className="w-1 h-1 rounded-full bg-current" />
                            </div>
                            <Home className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-mono font-semibold text-primary">{p.id}</span>
                                <Badge variant="outline" className={`text-[8px] h-3.5 font-bold ${p.kitchenType === "branded" ? "border-primary/40 text-primary" : "border-accent-foreground/30 text-accent-foreground"}`}>
                                  {p.kitchenType === "branded" ? "SHF" : "HCF"}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-foreground truncate">{p.name}</p>
                              <p className="text-[10px] text-muted-foreground">{p.rmn}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm text-foreground mt-0.5">{value}</p>
    </div>
  );
}

// ── Analytics Charts Component ──

const LOAD_COLORS = ["hsl(142,71%,45%)", "hsl(38,92%,50%)", "hsl(0,84%,60%)"];
const PIE_COLORS = ["hsl(38,92%,50%)", "hsl(142,71%,45%)"];

function getBarColor(count: number) {
  if (count <= 2) return LOAD_COLORS[0];
  if (count <= 3) return LOAD_COLORS[1];
  return LOAD_COLORS[2];
}

function TeamLoadCharts({ managers }: { managers: TeamMember[] }) {
  // Bar chart data: each manager with # kitchens
  const barData = managers.map((m) => ({
    name: m.name.split(" ")[0],
    fullName: m.name,
    kitchens: m.assignedPartners.length,
    role: getRoleShortLabel(m.role),
    stream: m.role === "hcf_manager" || m.department.startsWith("HCF") ? "HCF" : "SHF",
  })).sort((a, b) => b.kitchens - a.kitchens);

  // Pie chart data: SHF vs HCF total volumes
  const shfTotal = managers.reduce((s, m) => {
    return s + m.assignedPartners.filter((p) => p.kitchenType === "branded").length;
  }, 0);
  const hcfTotal = managers.reduce((s, m) => {
    return s + m.assignedPartners.filter((p) => p.kitchenType === "own").length;
  }, 0);
  const pieData = [
    { name: "SHF (Branded)", value: shfTotal },
    { name: "HCF (Own)", value: hcfTotal },
  ];

  // Per-manager SHF/HCF split for grouped pie
  const managerPieData = managers
    .filter((m) => m.assignedPartners.length > 0)
    .map((m) => {
      const shf = m.assignedPartners.filter((p) => p.kitchenType === "branded").length;
      const hcf = m.assignedPartners.filter((p) => p.kitchenType === "own").length;
      return { name: m.name, shf, hcf, total: shf + hcf };
    });

  const customTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
        <p className="font-semibold text-foreground">{d.fullName || d.name}</p>
        {d.role && <p className="text-muted-foreground">{d.role}</p>}
        <p className="text-foreground font-medium mt-1">{d.kitchens ?? d.value} kitchens</p>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Team Load Analytics</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart: Kitchens per Manager */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">
            Kitchens per Manager
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip content={customTooltip} />
                <Bar dataKey="kitchens" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {barData.map((entry, index) => (
                    <Cell key={index} fill={getBarColor(entry.kitchens)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Overall SHF vs HCF Share */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">
            SHF vs HCF Volume Share
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip content={customTooltip} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span className="text-[10px] text-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Separate SHF & HCF member share pie charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SHF Members Pie */}
        {(() => {
          const shfMembers = managers.filter(
            (m) => m.role === "shf_manager" || (m.role === "asst_manager" && m.department.startsWith("SHF"))
          );
          const shfPieData = shfMembers
            .filter((m) => m.assignedPartners.length > 0)
            .map((m) => ({ name: m.name, value: m.assignedPartners.length }));
          const SHF_SHADES = ["hsl(38,92%,50%)", "hsl(38,80%,60%)", "hsl(38,70%,40%)", "hsl(30,85%,55%)", "hsl(45,90%,48%)"];
          return (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                SHF — Member Share of Kitchens
              </p>
              <p className="text-[9px] text-muted-foreground mb-3">
                {shfPieData.reduce((s, d) => s + d.value, 0)} branded kitchens across {shfPieData.length} members
              </p>
              <div className="h-56">
                {shfPieData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-xs text-muted-foreground italic">No SHF data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={shfPieData}
                        cx="50%"
                        cy="45%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {shfPieData.map((_, i) => (
                          <Cell key={i} fill={SHF_SHADES[i % SHF_SHADES.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" iconType="circle" iconSize={8}
                        formatter={(value: string) => <span className="text-[10px] text-foreground">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          );
        })()}

        {/* HCF Members Pie */}
        {(() => {
          const hcfMembers = managers.filter(
            (m) => m.role === "hcf_manager" || (m.role === "asst_manager" && m.department.startsWith("HCF"))
          );
          const hcfPieData = hcfMembers
            .filter((m) => m.assignedPartners.length > 0)
            .map((m) => ({ name: m.name, value: m.assignedPartners.length }));
          const HCF_SHADES = ["hsl(142,71%,45%)", "hsl(142,60%,55%)", "hsl(142,50%,35%)", "hsl(150,65%,48%)", "hsl(135,70%,42%)"];
          return (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                HCF — Member Share of Kitchens
              </p>
              <p className="text-[9px] text-muted-foreground mb-3">
                {hcfPieData.reduce((s, d) => s + d.value, 0)} unbranded kitchens across {hcfPieData.length} members
              </p>
              <div className="h-56">
                {hcfPieData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-xs text-muted-foreground italic">No HCF data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={hcfPieData}
                        cx="50%"
                        cy="45%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {hcfPieData.map((_, i) => (
                          <Cell key={i} fill={HCF_SHADES[i % HCF_SHADES.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" iconType="circle" iconSize={8}
                        formatter={(value: string) => <span className="text-[10px] text-foreground">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Per-manager SHF/HCF stacked bar */}
      {managerPieData.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">
            SHF vs HCF Split per Manager
          </p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={managerPieData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span className="text-[10px] text-foreground">{value}</span>
                  )}
                />
                <Bar dataKey="shf" name="SHF (Branded)" stackId="a" fill={PIE_COLORS[0]} radius={[0, 0, 0, 0]} maxBarSize={40} />
                <Bar dataKey="hcf" name="HCF (Own)" stackId="a" fill={PIE_COLORS[1]} radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
