import { useState } from "react";
import { BookOpen, FileText, Download, Search, Shield, Clock, Users, AlertTriangle, Heart, IndianRupee, Calendar, CheckCircle2, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// ── Policy Categories ──

interface PolicyDocument {
  id: string;
  title: string;
  category: string;
  version: string;
  lastUpdated: string;
  description: string;
  pages: number;
  mandatory: boolean;
  acknowledgements: number;
  totalEmployees: number;
}

const policies: PolicyDocument[] = [
  {
    id: "POL-001", title: "Employee Code of Conduct", category: "General", version: "3.2",
    lastUpdated: "2026-01-15", description: "Workplace behavior, ethics, anti-harassment, confidentiality, and social media guidelines for all Shero employees.",
    pages: 24, mandatory: true, acknowledgements: 38, totalEmployees: 42,
  },
  {
    id: "POL-002", title: "Leave & Attendance Policy", category: "Leave", version: "2.1",
    lastUpdated: "2026-02-01", description: "Casual leave, sick leave, earned leave, maternity/paternity, compensatory off, and attendance tracking rules.",
    pages: 18, mandatory: true, acknowledgements: 42, totalEmployees: 42,
  },
  {
    id: "POL-003", title: "Compensation & Benefits Manual", category: "Compensation", version: "4.0",
    lastUpdated: "2026-03-01", description: "Salary structure, CTC breakdown, incentive slabs, PF/ESI, gratuity, medical insurance, and reimbursement policies.",
    pages: 32, mandatory: true, acknowledgements: 35, totalEmployees: 42,
  },
  {
    id: "POL-004", title: "Anti-Sexual Harassment (POSH) Policy", category: "Compliance", version: "1.3",
    lastUpdated: "2025-11-20", description: "Prevention of Sexual Harassment policy as per POSH Act 2013. Internal committee details, complaint procedure, and redressal timelines.",
    pages: 14, mandatory: true, acknowledgements: 40, totalEmployees: 42,
  },
  {
    id: "POL-005", title: "Partner Kitchen Visit SOP", category: "Operations", version: "2.5",
    lastUpdated: "2026-02-15", description: "Standard operating procedure for kitchen visits — checklist, hygiene audit, photo documentation, and escalation protocol.",
    pages: 12, mandatory: false, acknowledgements: 28, totalEmployees: 42,
  },
  {
    id: "POL-006", title: "Travel & Expense Reimbursement", category: "Finance", version: "1.8",
    lastUpdated: "2026-01-10", description: "Travel allowances (local & outstation), hotel entitlements by grade, meal limits, and expense claim submission process.",
    pages: 10, mandatory: false, acknowledgements: 30, totalEmployees: 42,
  },
  {
    id: "POL-007", title: "Data Privacy & Security Policy", category: "Compliance", version: "2.0",
    lastUpdated: "2026-02-28", description: "Data handling, partner PII protection, device security, password policy, and incident reporting procedures.",
    pages: 20, mandatory: true, acknowledgements: 36, totalEmployees: 42,
  },
  {
    id: "POL-008", title: "Grievance Redressal Policy", category: "General", version: "1.5",
    lastUpdated: "2025-12-10", description: "Employee grievance submission, escalation matrix, resolution timelines, and appeal process.",
    pages: 8, mandatory: false, acknowledgements: 25, totalEmployees: 42,
  },
  {
    id: "POL-009", title: "Performance Improvement Plan (PIP) Guidelines", category: "Performance", version: "1.2",
    lastUpdated: "2026-01-25", description: "PIP trigger criteria, documentation requirements, 30-60-90 day framework, mentor assignment, and exit criteria.",
    pages: 10, mandatory: false, acknowledgements: 15, totalEmployees: 42,
  },
  {
    id: "POL-010", title: "Separation & Exit Policy", category: "General", version: "2.0",
    lastUpdated: "2026-02-05", description: "Resignation, termination, notice period, full & final settlement, exit interview process, and asset handover checklist.",
    pages: 14, mandatory: true, acknowledgements: 32, totalEmployees: 42,
  },
  {
    id: "POL-011", title: "New Employee Onboarding Handbook", category: "Onboarding", version: "3.0",
    lastUpdated: "2026-03-10", description: "First-week schedule, IT setup, buddy system, department introductions, compliance training checklist, and probation milestones.",
    pages: 28, mandatory: true, acknowledgements: 8, totalEmployees: 10,
  },
];

const categoryIcons: Record<string, typeof BookOpen> = {
  General: BookOpen,
  Leave: Calendar,
  Compensation: IndianRupee,
  Compliance: Shield,
  Operations: CheckCircle2,
  Finance: IndianRupee,
  Performance: AlertTriangle,
  Onboarding: Users,
};

const categoryColors: Record<string, string> = {
  General: "bg-primary/10 text-primary",
  Leave: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  Compensation: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  Compliance: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  Operations: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  Finance: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  Performance: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  Onboarding: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
};

export default function AdminHRPolicies() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = [...new Set(policies.map((p) => p.category))].sort();

  const filtered = policies.filter((p) => {
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const mandatoryCount = policies.filter((p) => p.mandatory).length;
  const avgAck = Math.round(policies.reduce((sum, p) => sum + (p.acknowledgements / p.totalEmployees) * 100, 0) / policies.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" /> HR Policies & Handbook
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Company policies, employee handbook, SOPs & compliance documents
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-2">
          <FileText className="w-4 h-4" /> Upload New Policy
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Policies", value: policies.length, icon: FileText, accent: "text-primary" },
          { label: "Mandatory", value: mandatoryCount, icon: Shield, accent: "text-destructive" },
          { label: "Categories", value: categories.length, icon: BookOpen, accent: "text-amber-600" },
          { label: "Avg Acknowledgement", value: `${avgAck}%`, icon: CheckCircle2, accent: "text-emerald-600" },
        ].map((s) => (
          <Card key={s.label} className="border-border">
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <s.icon className={`w-4 h-4 ${s.accent}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search policies..." className="pl-9" />
        </div>
        <div className="flex gap-1 flex-wrap">
          <Button variant={categoryFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setCategoryFilter("all")} className="text-xs">
            All
          </Button>
          {categories.map((cat) => (
            <Button key={cat} variant={categoryFilter === cat ? "default" : "outline"} size="sm" onClick={() => setCategoryFilter(cat)} className="text-xs">
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Policy Cards */}
      <div className="space-y-3">
        {filtered.map((policy) => {
          const Icon = categoryIcons[policy.category] || FileText;
          const colorClass = categoryColors[policy.category] || "bg-muted text-muted-foreground";
          const ackPct = Math.round((policy.acknowledgements / policy.totalEmployees) * 100);

          return (
            <Card key={policy.id} className="border-border hover:shadow-md transition-shadow">
              <CardContent className="py-4 px-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg ${colorClass.split(" ")[0]} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`w-5 h-5 ${colorClass.split(" ").slice(1).join(" ")}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-sm font-semibold text-foreground">{policy.title}</h3>
                      {policy.mandatory && (
                        <Badge variant="destructive" className="text-[9px]">Mandatory</Badge>
                      )}
                      <Badge variant="outline" className="text-[9px]">v{policy.version}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{policy.description}</p>
                    <div className="flex items-center gap-3 flex-wrap text-[10px] text-muted-foreground">
                      <Badge className={`text-[9px] ${colorClass} border-0`}>{policy.category}</Badge>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" /> {policy.pages} pages
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Updated {new Date(policy.lastUpdated).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {ackPct}% acknowledged ({policy.acknowledgements}/{policy.totalEmployees})
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.success(`Downloading ${policy.title}...`)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card className="border-dashed border-border">
            <CardContent className="py-8 text-center">
              <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No policies found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
