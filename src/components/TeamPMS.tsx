import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, TrendingUp, TrendingDown, Minus, Target, Award, AlertTriangle,
  ChevronDown, ChevronRight, BarChart3, Users, Zap, Eye, Download,
  Calendar, DollarSign, CheckCircle2, Clock, XCircle, Gift, Skull,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, LineChart, Line, Legend, PieChart, Pie,
} from "recharts";
import {
  getLatestMetrics, getGrade, getGradeBg, getGradeColor,
  METRIC_WEIGHTAGES, REGIONS, type SCVGrade, type PartnerMetrics,
} from "@/data/metricsData";
import type { AdminRole } from "@/data/adminRoles";

// ── Types ──

interface TeamMember {
  id: string;
  name: string;
  role: AdminRole;
  region: string;
  department: string;
  reportsTo: string | null;
  assignedPartners: { id: string; name: string; rmn: string; kitchenType: "branded" | "own" }[];
}

interface PMSTarget {
  memberId: string;
  kpi: string;
  target: number;
  achieved: number;
  weight: number;
}

type PMSView = "scorecard" | "hierarchy" | "targets" | "reviews" | "incentives" | "analytics";

// ── KPI Definitions ──

interface KPIDefinition {
  key: string;
  label: string;
  shortLabel: string;
  weight: number;
  source: "metrics" | "sales" | "ops" | "growth";
  description: string;
}

// ── Role-Tier-Based KPI Weights ──
// Different weights per tier — Leadership focuses on P&L, Ops focuses on execution

type RoleTier = "leadership" | "manager" | "team_leader" | "executive";

const TIER_KPI_WEIGHTS: Record<RoleTier, Record<string, number>> = {
  leadership: {
    scv_biz: 15, sales_achievement: 30, partner_retention: 15, grade_a_ratio: 10,
    onboarding_velocity: 10, compliance_score: 10, customer_nps: 10,
  },
  manager: {
    scv_biz: 20, sales_achievement: 25, partner_retention: 15, grade_a_ratio: 15,
    onboarding_velocity: 10, compliance_score: 10, customer_nps: 5,
  },
  team_leader: {
    scv_biz: 25, sales_achievement: 20, partner_retention: 15, grade_a_ratio: 15,
    onboarding_velocity: 10, compliance_score: 10, customer_nps: 5,
  },
  executive: {
    scv_biz: 30, sales_achievement: 15, partner_retention: 10, grade_a_ratio: 10,
    onboarding_velocity: 5, compliance_score: 25, customer_nps: 5,
  },
};

const TIER_KPI_TARGETS: Record<RoleTier, Record<string, number>> = {
  leadership: { scv_biz: 80, sales_achievement: 100, partner_retention: 95, grade_a_ratio: 50, onboarding_velocity: 12, compliance_score: 90, customer_nps: 75 },
  manager: { scv_biz: 75, sales_achievement: 100, partner_retention: 90, grade_a_ratio: 40, onboarding_velocity: 8, compliance_score: 85, customer_nps: 70 },
  team_leader: { scv_biz: 70, sales_achievement: 100, partner_retention: 85, grade_a_ratio: 35, onboarding_velocity: 5, compliance_score: 80, customer_nps: 65 },
  executive: { scv_biz: 65, sales_achievement: 100, partner_retention: 80, grade_a_ratio: 30, onboarding_velocity: 3, compliance_score: 75, customer_nps: 60 },
};

const BASE_KPIS: KPIDefinition[] = [
  { key: "scv_biz", label: "SCV(BIZ) Score", shortLabel: "SCV", weight: 25, source: "metrics", description: "Composite health score of managed kitchens" },
  { key: "sales_achievement", label: "Sales Achievement", shortLabel: "Sales", weight: 20, source: "sales", description: "Expected vs achieved sales volume ratio" },
  { key: "partner_retention", label: "Partner Retention", shortLabel: "Retention", weight: 15, source: "ops", description: "Active partner count vs churn" },
  { key: "grade_a_ratio", label: "Grade A Kitchen %", shortLabel: "Grade A", weight: 15, source: "metrics", description: "Percentage of kitchens rated Grade A" },
  { key: "onboarding_velocity", label: "Onboarding Velocity", shortLabel: "Onboard", weight: 10, source: "growth", description: "New kitchens onboarded per month" },
  { key: "compliance_score", label: "Compliance Score", shortLabel: "Comply", weight: 10, source: "ops", description: "Attendance & discipline adherence" },
  { key: "customer_nps", label: "Customer NPS", shortLabel: "NPS", weight: 5, source: "metrics", description: "Net Promoter Score from customers" },
];

function getKPIsForTier(tier: RoleTier): KPIDefinition[] {
  const weights = TIER_KPI_WEIGHTS[tier];
  return BASE_KPIS.map(k => ({ ...k, weight: weights[k.key] || k.weight }));
}

// ── Monthly Review Cycle ──

type ReviewPhase = "target_setting" | "mid_cycle" | "final_appraisal";
type ReviewStatus = "draft" | "submitted" | "approved" | "closed";

interface ReviewCycle {
  id: string;
  month: string;
  phase: ReviewPhase;
  status: ReviewStatus;
  memberId: string;
  memberName: string;
  managerName: string;
  targetSetDate: string | null;
  midReviewDate: string | null;
  appraisalDate: string | null;
  overallTAP: number;
  grade: SCVGrade;
  managerComments: string;
  selfRating: number | null;
}

const reviewPhaseLabels: Record<ReviewPhase, { label: string; color: string }> = {
  target_setting: { label: "Target Setting", color: "bg-primary/15 text-primary" },
  mid_cycle: { label: "Mid-Cycle Review", color: "bg-action-cook/15 text-action-cook" },
  final_appraisal: { label: "Final Appraisal", color: "bg-action-done/15 text-action-done" },
};

const reviewStatusLabels: Record<ReviewStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground" },
  submitted: { label: "Submitted", color: "bg-primary/15 text-primary" },
  approved: { label: "Approved", color: "bg-action-done/15 text-action-done" },
  closed: { label: "Closed", color: "bg-muted text-muted-foreground" },
};

// ── Incentive & Penalty Engine ──

interface IncentiveRecord {
  id: string;
  memberId: string;
  memberName: string;
  role: string;
  month: string;
  overallTAP: number;
  grade: SCVGrade;
  type: "bonus" | "penalty" | "neutral";
  amount: number;
  reason: string;
  status: "pending" | "approved" | "disbursed" | "waived";
}

const INCENTIVE_SLABS = [
  { minTAP: 110, type: "bonus" as const, pctOfCTC: 15, label: "Star Performer", icon: "🌟" },
  { minTAP: 100, type: "bonus" as const, pctOfCTC: 10, label: "Exceeding", icon: "🏆" },
  { minTAP: 90, type: "bonus" as const, pctOfCTC: 5, label: "On Track+", icon: "✅" },
  { minTAP: 80, type: "neutral" as const, pctOfCTC: 0, label: "On Track", icon: "➡️" },
  { minTAP: 60, type: "penalty" as const, pctOfCTC: -5, label: "At Risk", icon: "⚠️" },
  { minTAP: 0, type: "penalty" as const, pctOfCTC: -10, label: "Critical", icon: "🔴" },
];

const BASE_CTC_BY_TIER: Record<RoleTier, number> = {
  leadership: 150000, manager: 80000, team_leader: 50000, executive: 30000,
};

function getIncentiveSlab(tap: number) {
  return INCENTIVE_SLABS.find(s => tap >= s.minTAP) || INCENTIVE_SLABS[INCENTIVE_SLABS.length - 1];
}

// ── Helpers ──

function getTAPColor(perf: number): string {
  if (perf >= 100) return "text-green-600 dark:text-green-400";
  if (perf >= 80) return "text-blue-600 dark:text-blue-400";
  if (perf >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function getTAPBg(perf: number): string {
  if (perf >= 100) return "bg-green-100 dark:bg-green-900/30";
  if (perf >= 80) return "bg-blue-100 dark:bg-blue-900/30";
  if (perf >= 60) return "bg-amber-100 dark:bg-amber-900/30";
  return "bg-red-100 dark:bg-red-900/30";
}

function getTrendIcon(perf: number) {
  if (perf >= 100) return <TrendingUp className="w-3.5 h-3.5 text-green-500" />;
  if (perf >= 80) return <Minus className="w-3.5 h-3.5 text-blue-500" />;
  return <TrendingDown className="w-3.5 h-3.5 text-red-500" />;
}

function getRoleTier(role: AdminRole): RoleTier {
  const tiers: Partial<Record<AdminRole, RoleTier>> = {
    super_admin: "leadership", country_manager: "leadership", vertical_head: "leadership",
    regional_manager: "manager", ops_manager: "manager", onboarding_manager: "manager",
    hr_manager: "manager", finance_manager: "manager", shf_manager: "manager",
    hcf_manager: "manager", spc_manager: "manager", ssc_manager: "manager", party_manager: "manager",
    kobtl: "team_leader", sap_onboarding_tl: "team_leader", spc_tl: "team_leader",
    ssc_tl: "team_leader", ppp_tl: "team_leader", party_tl: "team_leader",
    kob_executive: "executive", ssc_executor: "executive", ppp_executor: "executive",
    party_executive: "executive", asst_manager: "team_leader",
  };
  return tiers[role] ?? "executive";
}

function getRoleLevel(role: AdminRole): number {
  const levels: Partial<Record<AdminRole, number>> = {
    super_admin: 0, country_manager: 1, vertical_head: 2,
    regional_manager: 3, onboarding_manager: 3,
    shf_manager: 4, hcf_manager: 4, spc_manager: 3, ssc_manager: 4,
    kobtl: 4, ssc_tl: 5, asst_manager: 5,
    ssc_executor: 6, kob_executive: 6,
  };
  return levels[role] ?? 5;
}

// ── Generate PMS data from metrics (now tier-aware) ──

function generatePMSData(members: TeamMember[]): Map<string, PMSTarget[]> {
  const latestMetrics = getLatestMetrics();
  const pmsMap = new Map<string, PMSTarget[]>();

  members.forEach((member) => {
    const tier = getRoleTier(member.role);
    const tierWeights = TIER_KPI_WEIGHTS[tier];
    const tierTargets = TIER_KPI_TARGETS[tier];
    const targets: PMSTarget[] = [];
    const managedPartnerIds = member.assignedPartners.map((p) => p.id);
    const regionMetrics = latestMetrics.filter((m) => m.region.includes(member.region.split(" ")[0]) || member.region === "All India");
    const directMetrics = managedPartnerIds.length > 0
      ? latestMetrics.filter((m) => managedPartnerIds.some((pid) => m.partnerId === pid))
      : regionMetrics;
    const relevantMetrics = directMetrics.length > 0 ? directMetrics : regionMetrics.length > 0 ? regionMetrics : latestMetrics;

    // SCV(BIZ)
    const avgScvBiz = relevantMetrics.length > 0
      ? relevantMetrics.reduce((s, m) => s + m.scvBiz, 0) / relevantMetrics.length : 0;
    targets.push({ memberId: member.id, kpi: "scv_biz", weight: tierWeights.scv_biz, target: tierTargets.scv_biz, achieved: Math.round(avgScvBiz * 10) / 10 });

    // Sales Achievement
    const totalExpected = relevantMetrics.reduce((s, m) => s + m.expectedSales, 0);
    const totalAchieved = relevantMetrics.reduce((s, m) => s + m.achievedSales, 0);
    const salesPerf = totalExpected > 0 ? (totalAchieved / totalExpected) * 100 : 0;
    targets.push({ memberId: member.id, kpi: "sales_achievement", weight: tierWeights.sales_achievement, target: tierTargets.sales_achievement, achieved: Math.round(salesPerf * 10) / 10 });

    // Partner Retention
    const activePartners = relevantMetrics.filter((m) => m.attendance > 50).length;
    const retentionRate = relevantMetrics.length > 0 ? (activePartners / relevantMetrics.length) * 100 : 0;
    targets.push({ memberId: member.id, kpi: "partner_retention", weight: tierWeights.partner_retention, target: tierTargets.partner_retention, achieved: Math.round(retentionRate * 10) / 10 });

    // Grade A Kitchen %
    const gradeA = relevantMetrics.filter((m) => m.grade === "A").length;
    const gradeARatio = relevantMetrics.length > 0 ? (gradeA / relevantMetrics.length) * 100 : 0;
    targets.push({ memberId: member.id, kpi: "grade_a_ratio", weight: tierWeights.grade_a_ratio, target: tierTargets.grade_a_ratio, achieved: Math.round(gradeARatio * 10) / 10 });

    // Onboarding Velocity
    targets.push({ memberId: member.id, kpi: "onboarding_velocity", weight: tierWeights.onboarding_velocity, target: tierTargets.onboarding_velocity, achieved: Math.round(tierTargets.onboarding_velocity * (0.5 + Math.random() * 0.8)) });

    // Compliance Score
    const avgAttendance = relevantMetrics.length > 0
      ? relevantMetrics.reduce((s, m) => s + m.attendance, 0) / relevantMetrics.length : 0;
    targets.push({ memberId: member.id, kpi: "compliance_score", weight: tierWeights.compliance_score, target: tierTargets.compliance_score, achieved: Math.round(avgAttendance * 10) / 10 });

    // Customer NPS
    const avgRR = relevantMetrics.length > 0
      ? relevantMetrics.reduce((s, m) => s + m.repeat_rate, 0) / relevantMetrics.length : 0;
    targets.push({ memberId: member.id, kpi: "customer_nps", weight: tierWeights.customer_nps, target: tierTargets.customer_nps, achieved: Math.round(avgRR * 10) / 10 });

    pmsMap.set(member.id, targets);
  });

  return pmsMap;
}

function getOverallPerformance(targets: PMSTarget[]): number {
  const totalWeight = targets.reduce((s, t) => s + t.weight, 0);
  if (totalWeight === 0) return 0;
  const weightedPerf = targets.reduce((s, t) => {
    const perf = t.target > 0 ? (t.achieved / t.target) * 100 : 0;
    return s + perf * (t.weight / totalWeight);
  }, 0);
  return Math.round(weightedPerf * 10) / 10;
}

// ── Generate Review Cycles ──

function generateReviewCycles(members: TeamMember[], pmsData: Map<string, PMSTarget[]>): ReviewCycle[] {
  const months = ["Mar 2026", "Feb 2026", "Jan 2026", "Dec 2025", "Nov 2025"];
  const reviews: ReviewCycle[] = [];
  
  members.forEach((member) => {
    const targets = pmsData.get(member.id) || [];
    const overall = getOverallPerformance(targets);
    const grade = getGrade(overall);
    const manager = members.find(m => m.id === member.reportsTo);

    months.forEach((month, mi) => {
      const variance = (Math.random() - 0.5) * 20;
      const monthTAP = Math.max(30, Math.min(120, Math.round((overall + variance) * 10) / 10));
      const monthGrade = getGrade(monthTAP);
      const phase: ReviewPhase = mi === 0 ? "mid_cycle" : mi === 1 ? "final_appraisal" : "final_appraisal";
      const status: ReviewStatus = mi === 0 ? "submitted" : mi <= 1 ? "approved" : "closed";

      reviews.push({
        id: `REV-${member.id}-${mi}`,
        month,
        phase,
        status,
        memberId: member.id,
        memberName: member.name,
        managerName: manager?.name || "—",
        targetSetDate: `1 ${month}`,
        midReviewDate: mi <= 1 ? `15 ${month}` : null,
        appraisalDate: mi >= 1 ? `28 ${month}` : null,
        overallTAP: monthTAP,
        grade: monthGrade,
        managerComments: monthTAP >= 100 ? "Exceeding expectations. Recommend for incentive." : monthTAP >= 80 ? "On track. Continue current trajectory." : monthTAP >= 60 ? "Needs improvement. Schedule coaching." : "Critical performance. PIP recommended.",
        selfRating: mi <= 2 ? Math.round((monthTAP / 100) * 5 * 10) / 10 : null,
      });
    });
  });

  return reviews;
}

// ── Generate Incentive Records ──

function generateIncentiveRecords(members: TeamMember[], pmsData: Map<string, PMSTarget[]>): IncentiveRecord[] {
  const records: IncentiveRecord[] = [];
  const months = ["Mar 2026", "Feb 2026", "Jan 2026"];

  members.forEach(member => {
    const targets = pmsData.get(member.id) || [];
    const overall = getOverallPerformance(targets);
    const tier = getRoleTier(member.role);
    const baseCTC = BASE_CTC_BY_TIER[tier];

    months.forEach((month, mi) => {
      const variance = (Math.random() - 0.5) * 20;
      const monthTAP = Math.max(30, Math.min(120, Math.round((overall + variance) * 10) / 10));
      const slab = getIncentiveSlab(monthTAP);
      const amount = Math.round(baseCTC * Math.abs(slab.pctOfCTC) / 100);
      const grade = getGrade(monthTAP);

      if (slab.pctOfCTC !== 0) {
        records.push({
          id: `INC-${member.id}-${mi}`,
          memberId: member.id,
          memberName: member.name,
          role: member.role.replace(/_/g, " "),
          month,
          overallTAP: monthTAP,
          grade,
          type: slab.type,
          amount,
          reason: `${slab.icon} ${slab.label} — TAP ${monthTAP}% (${slab.pctOfCTC > 0 ? "+" : ""}${slab.pctOfCTC}% of base CTC $${baseCTC.toLocaleString("en-US")})`,
          status: mi === 0 ? "pending" : mi === 1 ? "approved" : "disbursed",
        });
      }
    });
  });

  return records.sort((a, b) => a.month.localeCompare(b.month));
}

// ── Main Component ──

interface TeamPMSProps {
  members: TeamMember[];
}

export default function TeamPMS({ members }: TeamPMSProps) {
  const [view, setView] = useState<PMSView>("scorecard");
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const regions = [...new Set(members.map((m) => m.region))].sort();
  const pmsData = useMemo(() => generatePMSData(members), [members]);
  const reviewCycles = useMemo(() => generateReviewCycles(members, pmsData), [members, pmsData]);
  const incentiveRecords = useMemo(() => generateIncentiveRecords(members, pmsData), [members, pmsData]);

  const filtered = useMemo(() => {
    return members.filter((m) => {
      if (regionFilter !== "all" && m.region !== regionFilter) return false;
      if (levelFilter !== "all") {
        const level = getRoleLevel(m.role);
        if (levelFilter === "leadership" && level > 2) return false;
        if (levelFilter === "regional" && level !== 3) return false;
        if (levelFilter === "operational" && level < 4) return false;
      }
      if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.id.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [members, search, regionFilter, levelFilter]);

  const ranked = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const perfA = getOverallPerformance(pmsData.get(a.id) || []);
      const perfB = getOverallPerformance(pmsData.get(b.id) || []);
      return perfB - perfA;
    });
  }, [filtered, pmsData]);

  const stats = useMemo(() => {
    const allPerfs = members.map((m) => getOverallPerformance(pmsData.get(m.id) || []));
    const avgPerf = allPerfs.length > 0 ? allPerfs.reduce((s, p) => s + p, 0) / allPerfs.length : 0;
    const exceeding = allPerfs.filter((p) => p >= 100).length;
    const onTrack = allPerfs.filter((p) => p >= 80 && p < 100).length;
    const atRisk = allPerfs.filter((p) => p >= 60 && p < 80).length;
    const critical = allPerfs.filter((p) => p < 60).length;
    return { avgPerf: Math.round(avgPerf * 10) / 10, exceeding, onTrack, atRisk, critical };
  }, [members, pmsData]);

  const toggleExpand = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const views: { key: PMSView; label: string; icon: typeof Users }[] = [
    { key: "scorecard", label: "Scorecard", icon: Target },
    { key: "hierarchy", label: "Hierarchy TAP", icon: Users },
    { key: "targets", label: "Tier Targets", icon: Zap },
    { key: "reviews", label: "Review Cycles", icon: Calendar },
    { key: "incentives", label: "Incentives", icon: DollarSign },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="space-y-5">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Avg Performance" value={`${stats.avgPerf}%`} color={getTAPColor(stats.avgPerf)} icon={<BarChart3 className="w-4 h-4" />} />
        <StatCard label="Exceeding Target" value={String(stats.exceeding)} color="text-green-600 dark:text-green-400" icon={<Award className="w-4 h-4" />} />
        <StatCard label="On Track" value={String(stats.onTrack)} color="text-blue-600 dark:text-blue-400" icon={<TrendingUp className="w-4 h-4" />} />
        <StatCard label="At Risk" value={String(stats.atRisk)} color="text-amber-600 dark:text-amber-400" icon={<AlertTriangle className="w-4 h-4" />} />
        <StatCard label="Critical" value={String(stats.critical)} color="text-red-600 dark:text-red-400" icon={<TrendingDown className="w-4 h-4" />} />
      </div>

      {/* Sub-navigation */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-border overflow-hidden flex-wrap">
          {views.map((v) => {
            const Icon = v.icon;
            return (
              <button key={v.key} onClick={() => setView(v.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${view === v.key ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}>
                <Icon className="w-3.5 h-3.5" /> {v.label}
              </button>
            );
          })}
        </div>
        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search member..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 w-48 text-xs" />
        </div>
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="All Regions" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="All Levels" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="leadership">Leadership (L1-L2)</SelectItem>
            <SelectItem value="regional">Regional (L3)</SelectItem>
            <SelectItem value="operational">Operational (L4+)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Views */}
      {view === "scorecard" && <ScorecardView members={ranked} pmsData={pmsData} expandedRows={expandedRows} onToggle={toggleExpand} onSelect={setSelectedMember} />}
      {view === "hierarchy" && <HierarchyTAPView members={members} filtered={ranked} pmsData={pmsData} onSelect={setSelectedMember} />}
      {view === "targets" && <TierTargetView members={ranked} pmsData={pmsData} />}
      {view === "reviews" && <ReviewCycleView reviews={reviewCycles} members={members} pmsData={pmsData} />}
      {view === "incentives" && <IncentiveView records={incentiveRecords} members={members} pmsData={pmsData} />}
      {view === "analytics" && <AnalyticsView members={members} pmsData={pmsData} />}

      {/* Detail Dialog */}
      <MemberPMSDialog memberId={selectedMember} members={members} pmsData={pmsData} reviews={reviewCycles} incentives={incentiveRecords} onClose={() => setSelectedMember(null)} />
    </div>
  );
}

// ── Stat Card ──

function StatCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className={`flex items-center gap-1.5 ${color} mb-1`}>{icon}<span className="text-[10px] font-medium uppercase tracking-wider">{label}</span></div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

// ── Scorecard View ──

function ScorecardView({ members, pmsData, expandedRows, onToggle, onSelect }: {
  members: TeamMember[]; pmsData: Map<string, PMSTarget[]>; expandedRows: Set<string>;
  onToggle: (id: string) => void; onSelect: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-8" />
            <TableHead className="text-xs">Rank</TableHead>
            <TableHead className="text-xs">Member</TableHead>
            <TableHead className="text-xs">Tier</TableHead>
            <TableHead className="text-xs">Region</TableHead>
            {BASE_KPIS.map((k) => (
              <TableHead key={k.key} className="text-xs text-center">{k.shortLabel}</TableHead>
            ))}
            <TableHead className="text-xs text-center font-bold">TAP %</TableHead>
            <TableHead className="text-xs text-center">Grade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((m, idx) => {
            const targets = pmsData.get(m.id) || [];
            const overall = getOverallPerformance(targets);
            const grade = getGrade(overall);
            const tier = getRoleTier(m.role);
            const expanded = expandedRows.has(m.id);
            return (
              <>
                <TableRow key={m.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => onSelect(m.id)}>
                  <TableCell className="p-1">
                    <button onClick={(e) => { e.stopPropagation(); onToggle(m.id); }} className="p-1 hover:bg-muted rounded">
                      {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-muted-foreground">#{idx + 1}</TableCell>
                  <TableCell className="text-xs font-medium">{m.name}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[8px] capitalize">{tier}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{m.region}</TableCell>
                  {BASE_KPIS.map((kpi) => {
                    const t = targets.find((tt) => tt.kpi === kpi.key);
                    if (!t) return <TableCell key={kpi.key} className="text-center text-xs text-muted-foreground">—</TableCell>;
                    const perf = t.target > 0 ? Math.round((t.achieved / t.target) * 100) : 0;
                    return (
                      <TableCell key={kpi.key} className="text-center p-1">
                        <div className={`text-xs font-semibold ${getTAPColor(perf)}`}>{perf}%</div>
                        <div className="text-[9px] text-muted-foreground">{t.weight}%w</div>
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${getTAPBg(overall)} ${getTAPColor(overall)}`}>
                      {getTrendIcon(overall)} {overall}%
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={`text-[10px] ${getGradeBg(grade)}`}>{grade}</Badge>
                  </TableCell>
                </TableRow>
                {expanded && (
                  <TableRow key={`${m.id}-detail`} className="bg-muted/20">
                    <TableCell colSpan={13} className="p-3">
                      <ExpandedTAPDetail targets={targets} tier={tier} />
                    </TableCell>
                  </TableRow>
                )}
              </>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function ExpandedTAPDetail({ targets, tier }: { targets: PMSTarget[]; tier: RoleTier }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <Badge variant="outline" className="text-[8px] capitalize">Tier: {tier}</Badge>
        <span>KPI weights are tier-specific — {tier === "leadership" ? "P&L-heavy (Sales 30%)" : tier === "executive" ? "Compliance-heavy (25%)" : "Balanced execution"}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {targets.map((t) => {
          const kpi = BASE_KPIS.find((k) => k.key === t.kpi);
          const perf = t.target > 0 ? Math.round((t.achieved / t.target) * 100) : 0;
          return (
            <div key={t.kpi} className="rounded-lg border border-border bg-card p-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-medium text-muted-foreground">{kpi?.label || t.kpi}</span>
                <span className={`text-xs font-bold ${getTAPColor(perf)}`}>{perf}%</span>
              </div>
              <Progress value={Math.min(100, perf)} className="h-1.5 mb-1.5" />
              <div className="flex justify-between text-[9px] text-muted-foreground">
                <span>T: {t.target}</span>
                <span>A: {t.achieved}</span>
                <span className="font-medium">W: {t.weight}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tier Target View (replaces old TargetSettingView) ──

function TierTargetView({ members, pmsData }: { members: TeamMember[]; pmsData: Map<string, PMSTarget[]> }) {
  const [selectedTier, setSelectedTier] = useState<RoleTier | "all">("all");

  const tiers: RoleTier[] = ["leadership", "manager", "team_leader", "executive"];
  const tierLabels: Record<RoleTier, string> = { leadership: "Leadership", manager: "Manager", team_leader: "Team Leader", executive: "Executive" };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Role-Tier KPI Matrix</h3>
          <p className="text-[10px] text-muted-foreground">Different weights & targets per hierarchy tier — cascades from Leadership to Executive</p>
        </div>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><Download className="w-3.5 h-3.5" /> Export</Button>
      </div>

      {/* Tier weight comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {tiers.map(tier => {
          const weights = TIER_KPI_WEIGHTS[tier];
          const tierTargets = TIER_KPI_TARGETS[tier];
          const tierMembers = members.filter(m => getRoleTier(m.role) === tier);
          const avgTAP = tierMembers.length > 0
            ? Math.round(tierMembers.reduce((s, m) => s + getOverallPerformance(pmsData.get(m.id) || []), 0) / tierMembers.length * 10) / 10
            : 0;

          return (
            <Card key={tier} className={`cursor-pointer transition-all ${selectedTier === tier ? "border-primary shadow-md" : "hover:border-primary/30"}`}
              onClick={() => setSelectedTier(selectedTier === tier ? "all" : tier)}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center justify-between capitalize">
                  {tierLabels[tier]}
                  <Badge variant="outline" className="text-[8px]">{tierMembers.length} members</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-muted-foreground">Avg TAP</span>
                  <span className={`text-sm font-bold ${getTAPColor(avgTAP)}`}>{avgTAP}%</span>
                </div>
                {BASE_KPIS.map(kpi => (
                  <div key={kpi.key} className="flex items-center justify-between text-[9px]">
                    <span className="text-muted-foreground">{kpi.shortLabel}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-bold">{weights[kpi.key]}%w</span>
                      <span className="text-muted-foreground">T:{tierTargets[kpi.key]}</span>
                    </div>
                  </div>
                ))}
                {/* Visual weight bar */}
                <div className="flex gap-0.5 h-3 rounded-full overflow-hidden mt-2">
                  {BASE_KPIS.map((k, i) => {
                    const colors = ["bg-blue-500", "bg-green-500", "bg-amber-500", "bg-purple-500", "bg-cyan-500", "bg-rose-500", "bg-indigo-500"];
                    return <div key={k.key} className={`${colors[i]}`} style={{ width: `${weights[k.key]}%` }} />;
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Member table filtered by selected tier */}
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs">Member</TableHead>
              <TableHead className="text-xs">Tier</TableHead>
              {BASE_KPIS.map((k) => (
                <TableHead key={k.key} className="text-xs text-center">
                  {k.shortLabel}
                  <div className="text-[8px] text-muted-foreground font-normal flex gap-1 justify-center mt-0.5">
                    <span className="text-blue-500">T</span>/<span className="text-green-500">A</span>/<span className="text-amber-500">P</span>
                  </div>
                </TableHead>
              ))}
              <TableHead className="text-xs text-center">Weighted TAP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(selectedTier === "all" ? members : members.filter(m => getRoleTier(m.role) === selectedTier)).map((m) => {
              const targets = pmsData.get(m.id) || [];
              const overall = getOverallPerformance(targets);
              const tier = getRoleTier(m.role);
              return (
                <TableRow key={m.id}>
                  <TableCell className="text-xs font-medium">{m.name}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[8px] capitalize">{tier}</Badge></TableCell>
                  {BASE_KPIS.map((kpi) => {
                    const t = targets.find((tt) => tt.kpi === kpi.key);
                    if (!t) return <TableCell key={kpi.key} className="text-center text-[9px] text-muted-foreground">—</TableCell>;
                    const perf = t.target > 0 ? Math.round((t.achieved / t.target) * 100) : 0;
                    return (
                      <TableCell key={kpi.key} className="text-center p-1.5">
                        <div className="text-[9px] leading-relaxed">
                          <span className="text-blue-600 dark:text-blue-400">{t.target}</span>
                          {" / "}
                          <span className="text-green-600 dark:text-green-400">{t.achieved}</span>
                          {" / "}
                          <span className={`font-bold ${getTAPColor(perf)}`}>{perf}%</span>
                        </div>
                        <div className="text-[8px] text-muted-foreground">{t.weight}%w</div>
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center">
                    <span className={`text-xs font-bold ${getTAPColor(overall)}`}>{overall}%</span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Review Cycle View ──

function ReviewCycleView({ reviews, members, pmsData }: { reviews: ReviewCycle[]; members: TeamMember[]; pmsData: Map<string, PMSTarget[]> }) {
  const [monthFilter, setMonthFilter] = useState("all");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const months = [...new Set(reviews.map(r => r.month))];

  const filteredReviews = reviews.filter(r => {
    if (monthFilter !== "all" && r.month !== monthFilter) return false;
    if (phaseFilter !== "all" && r.phase !== phaseFilter) return false;
    return true;
  });

  const cycleSummary = useMemo(() => {
    const currentMonth = reviews.filter(r => r.month === months[0]);
    return {
      total: currentMonth.length,
      targetSetting: currentMonth.filter(r => r.phase === "target_setting").length,
      midCycle: currentMonth.filter(r => r.phase === "mid_cycle").length,
      appraisal: currentMonth.filter(r => r.phase === "final_appraisal").length,
      pending: currentMonth.filter(r => r.status === "draft" || r.status === "submitted").length,
      completed: currentMonth.filter(r => r.status === "approved" || r.status === "closed").length,
    };
  }, [reviews, months]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Monthly Review Cycles</h3>
          <p className="text-[10px] text-muted-foreground">Target Setting → Mid-Cycle Check-in → Final Appraisal — recurring monthly</p>
        </div>
      </div>

      {/* Cycle Phase Pipeline */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-primary/20">
          <CardContent className="p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Phase 1: Target Setting</div>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="text-xl font-bold text-primary">{cycleSummary.targetSetting}</span>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1">1st of month — Manager sets KPI targets</p>
          </CardContent>
        </Card>
        <Card className="border-action-cook/20">
          <CardContent className="p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Phase 2: Mid-Cycle Review</div>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Eye className="w-5 h-5 text-action-cook" />
              <span className="text-xl font-bold text-action-cook">{cycleSummary.midCycle}</span>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1">15th of month — Progress check & coaching</p>
          </CardContent>
        </Card>
        <Card className="border-action-done/20">
          <CardContent className="p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Phase 3: Final Appraisal</div>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Award className="w-5 h-5 text-action-done" />
              <span className="text-xl font-bold text-action-done">{cycleSummary.appraisal}</span>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1">28th of month — Grade & incentive decision</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-40 h-8 text-xs"><SelectValue placeholder="All Months" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={phaseFilter} onValueChange={setPhaseFilter}>
          <SelectTrigger className="w-40 h-8 text-xs"><SelectValue placeholder="All Phases" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Phases</SelectItem>
            <SelectItem value="target_setting">Target Setting</SelectItem>
            <SelectItem value="mid_cycle">Mid-Cycle</SelectItem>
            <SelectItem value="final_appraisal">Appraisal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Review Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs">Month</TableHead>
              <TableHead className="text-xs">Member</TableHead>
              <TableHead className="text-xs">Reviewer</TableHead>
              <TableHead className="text-xs">Phase</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs text-center">TAP %</TableHead>
              <TableHead className="text-xs text-center">Grade</TableHead>
              <TableHead className="text-xs">Self Rating</TableHead>
              <TableHead className="text-xs">Manager Comments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReviews.slice(0, 30).map(r => {
              const phaseCfg = reviewPhaseLabels[r.phase];
              const statusCfg = reviewStatusLabels[r.status];
              return (
                <TableRow key={r.id}>
                  <TableCell className="text-xs text-muted-foreground">{r.month}</TableCell>
                  <TableCell className="text-xs font-medium">{r.memberName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.managerName}</TableCell>
                  <TableCell><Badge className={`text-[8px] ${phaseCfg.color}`}>{phaseCfg.label}</Badge></TableCell>
                  <TableCell><Badge className={`text-[8px] ${statusCfg.color}`}>{statusCfg.label}</Badge></TableCell>
                  <TableCell className="text-center"><span className={`text-xs font-bold ${getTAPColor(r.overallTAP)}`}>{r.overallTAP}%</span></TableCell>
                  <TableCell className="text-center"><Badge className={`text-[9px] ${getGradeBg(r.grade)}`}>{r.grade}</Badge></TableCell>
                  <TableCell className="text-xs">{r.selfRating ? `${r.selfRating}/5` : "—"}</TableCell>
                  <TableCell className="text-[10px] text-muted-foreground max-w-[200px] truncate">{r.managerComments}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Incentive View ──

function IncentiveView({ records, members, pmsData }: { records: IncentiveRecord[]; members: TeamMember[]; pmsData: Map<string, PMSTarget[]> }) {
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredRecords = typeFilter === "all" ? records : records.filter(r => r.type === typeFilter);

  const summary = useMemo(() => {
    const totalBonuses = records.filter(r => r.type === "bonus").reduce((s, r) => s + r.amount, 0);
    const totalPenalties = records.filter(r => r.type === "penalty").reduce((s, r) => s + r.amount, 0);
    const bonusCount = records.filter(r => r.type === "bonus").length;
    const penaltyCount = records.filter(r => r.type === "penalty").length;
    const pendingAmount = records.filter(r => r.status === "pending").reduce((s, r) => s + r.amount, 0);
    return { totalBonuses, totalPenalties, bonusCount, penaltyCount, pendingAmount, net: totalBonuses - totalPenalties };
  }, [records]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" /> Incentive & Penalty Engine</h3>
          <p className="text-[10px] text-muted-foreground">Auto-calculated from TAP % — linked to base CTC per tier. Feeds into PPP payroll.</p>
        </div>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><Download className="w-3.5 h-3.5" /> Export Payroll</Button>
      </div>

      {/* Slab Rules */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-xs">Incentive Slab Structure</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {INCENTIVE_SLABS.map(slab => (
              <div key={slab.label} className={`rounded-lg border p-2.5 text-center ${slab.type === "bonus" ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20" : slab.type === "penalty" ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20" : "border-border"}`}>
                <div className="text-lg">{slab.icon}</div>
                <p className="text-[10px] font-bold text-foreground">{slab.label}</p>
                <p className="text-[9px] text-muted-foreground">TAP ≥ {slab.minTAP}%</p>
                <p className={`text-xs font-bold mt-1 ${slab.pctOfCTC > 0 ? "text-green-600 dark:text-green-400" : slab.pctOfCTC < 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
                  {slab.pctOfCTC > 0 ? "+" : ""}{slab.pctOfCTC}% CTC
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {(["leadership", "manager", "team_leader", "executive"] as RoleTier[]).map(tier => (
              <div key={tier} className="text-center text-[9px] text-muted-foreground">
                <span className="capitalize font-medium text-foreground">{tier.replace(/_/g, " ")}</span>
                <br />Base CTC: ${BASE_CTC_BY_TIER[tier].toLocaleString("en-US")}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-green-200/50 dark:border-green-800/50"><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Bonuses</p><p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">${summary.totalBonuses.toLocaleString("en-US")}</p><p className="text-[9px] text-muted-foreground">{summary.bonusCount} records</p></CardContent></Card>
        <Card className="border-red-200/50 dark:border-red-800/50"><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Penalties</p><p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">${summary.totalPenalties.toLocaleString("en-US")}</p><p className="text-[9px] text-muted-foreground">{summary.penaltyCount} records</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Net Impact</p><p className={`text-xl font-bold mt-1 ${summary.net >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>${summary.net.toLocaleString("en-US")}</p></CardContent></Card>
        <Card className="border-primary/20"><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Pending Approval</p><p className="text-xl font-bold text-primary mt-1">${summary.pendingAmount.toLocaleString("en-US")}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Disbursed</p><p className="text-xl font-bold text-foreground mt-1">${records.filter(r => r.status === "disbursed").reduce((s, r) => s + r.amount, 0).toLocaleString("en-US")}</p></CardContent></Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="bonus">Bonuses Only</SelectItem>
            <SelectItem value="penalty">Penalties Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Records Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs">Month</TableHead>
              <TableHead className="text-xs">Member</TableHead>
              <TableHead className="text-xs">Role</TableHead>
              <TableHead className="text-xs text-center">TAP %</TableHead>
              <TableHead className="text-xs text-center">Grade</TableHead>
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs text-right">Amount ($)</TableHead>
              <TableHead className="text-xs">Reason</TableHead>
              <TableHead className="text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.slice(0, 30).map(r => (
              <TableRow key={r.id}>
                <TableCell className="text-xs text-muted-foreground">{r.month}</TableCell>
                <TableCell className="text-xs font-medium">{r.memberName}</TableCell>
                <TableCell className="text-[10px] text-muted-foreground capitalize">{r.role}</TableCell>
                <TableCell className="text-center"><span className={`text-xs font-bold ${getTAPColor(r.overallTAP)}`}>{r.overallTAP}%</span></TableCell>
                <TableCell className="text-center"><Badge className={`text-[9px] ${getGradeBg(r.grade)}`}>{r.grade}</Badge></TableCell>
                <TableCell>
                  <Badge className={`text-[8px] ${r.type === "bonus" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                    {r.type === "bonus" ? <Gift className="w-2.5 h-2.5 mr-0.5" /> : <Skull className="w-2.5 h-2.5 mr-0.5" />}
                    {r.type}
                  </Badge>
                </TableCell>
                <TableCell className={`text-xs text-right font-mono font-bold ${r.type === "bonus" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {r.type === "bonus" ? "+" : "-"}${r.amount.toLocaleString("en-US")}
                </TableCell>
                <TableCell className="text-[10px] text-muted-foreground max-w-[200px] truncate">{r.reason}</TableCell>
                <TableCell>
                  <Badge className={`text-[8px] ${r.status === "disbursed" ? "bg-action-done/15 text-action-done" : r.status === "approved" ? "bg-primary/15 text-primary" : r.status === "pending" ? "bg-action-cook/15 text-action-cook" : "bg-muted text-muted-foreground"}`}>
                    {r.status === "disbursed" ? <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> : r.status === "pending" ? <Clock className="w-2.5 h-2.5 mr-0.5" /> : null}
                    {r.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Hierarchy TAP View ──

function HierarchyTAPView({ members, filtered, pmsData, onSelect }: {
  members: TeamMember[]; filtered: TeamMember[]; pmsData: Map<string, PMSTarget[]>; onSelect: (id: string) => void;
}) {
  const roots = members.filter((m) => !m.reportsTo);

  function renderNode(member: TeamMember, depth: number): React.ReactNode {
    const targets = pmsData.get(member.id) || [];
    const overall = getOverallPerformance(targets);
    const grade = getGrade(overall);
    const children = members.filter((m) => m.reportsTo === member.id);
    const isFiltered = filtered.some((f) => f.id === member.id);
    const teamIds = getDescendantIds(member.id, members);
    const teamPerfs = teamIds.map((id) => getOverallPerformance(pmsData.get(id) || []));
    const teamAvg = teamPerfs.length > 0 ? Math.round(teamPerfs.reduce((s, p) => s + p, 0) / teamPerfs.length * 10) / 10 : 0;
    const tier = getRoleTier(member.role);

    return (
      <div key={member.id} className={`${!isFiltered ? "opacity-40" : ""}`}>
        <div
          className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card hover:border-primary/40 cursor-pointer transition-all mb-1"
          style={{ marginLeft: depth * 24 }}
          onClick={() => onSelect(member.id)}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold">{member.name}</span>
              <Badge variant="secondary" className="text-[8px]">{member.role.replace(/_/g, " ")}</Badge>
              <Badge variant="outline" className="text-[7px] capitalize">{tier}</Badge>
              <span className="text-[9px] text-muted-foreground">{member.region}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <div className="text-center">
              <div className="text-muted-foreground">Individual</div>
              <div className={`font-bold ${getTAPColor(overall)}`}>{overall}%</div>
            </div>
            {children.length > 0 && (
              <div className="text-center">
                <div className="text-muted-foreground">Team Avg</div>
                <div className={`font-bold ${getTAPColor(teamAvg)}`}>{teamAvg}%</div>
              </div>
            )}
            <Badge className={`text-[9px] ${getGradeBg(grade)}`}>{grade}</Badge>
          </div>
        </div>
        {children.map((c) => renderNode(c, depth + 1))}
      </div>
    );
  }

  return <div className="space-y-0.5">{roots.map((r) => renderNode(r, 0))}</div>;
}

function getDescendantIds(memberId: string, members: TeamMember[]): string[] {
  const ids: string[] = [memberId];
  const children = members.filter((m) => m.reportsTo === memberId);
  children.forEach((c) => ids.push(...getDescendantIds(c.id, members)));
  return ids;
}

// ── Analytics View ──

function AnalyticsView({ members, pmsData }: { members: TeamMember[]; pmsData: Map<string, PMSTarget[]> }) {
  const regionData = useMemo(() => {
    const regionMap = new Map<string, number[]>();
    members.forEach((m) => {
      const perf = getOverallPerformance(pmsData.get(m.id) || []);
      if (!regionMap.has(m.region)) regionMap.set(m.region, []);
      regionMap.get(m.region)!.push(perf);
    });
    return Array.from(regionMap.entries()).map(([region, perfs]) => ({
      region,
      avgPerformance: Math.round(perfs.reduce((s, p) => s + p, 0) / perfs.length * 10) / 10,
      members: perfs.length,
    }));
  }, [members, pmsData]);

  const tierData = useMemo(() => {
    const tiers: Record<string, number[]> = { Leadership: [], Manager: [], "Team Leader": [], Executive: [] };
    const tierMap: Record<RoleTier, string> = { leadership: "Leadership", manager: "Manager", team_leader: "Team Leader", executive: "Executive" };
    members.forEach((m) => {
      const perf = getOverallPerformance(pmsData.get(m.id) || []);
      const tier = getRoleTier(m.role);
      tiers[tierMap[tier]].push(perf);
    });
    return Object.entries(tiers).map(([tier, perfs]) => ({
      tier,
      avgPerformance: perfs.length > 0 ? Math.round(perfs.reduce((s, p) => s + p, 0) / perfs.length * 10) / 10 : 0,
      members: perfs.length,
    }));
  }, [members, pmsData]);

  const kpiData = useMemo(() => {
    return BASE_KPIS.map((kpi) => {
      const perfs: number[] = [];
      members.forEach((m) => {
        const t = (pmsData.get(m.id) || []).find((tt) => tt.kpi === kpi.key);
        if (t && t.target > 0) perfs.push((t.achieved / t.target) * 100);
      });
      return {
        kpi: kpi.shortLabel,
        avgPerformance: perfs.length > 0 ? Math.round(perfs.reduce((s, p) => s + p, 0) / perfs.length * 10) / 10 : 0,
        exceeding: perfs.filter((p) => p >= 100).length,
        belowTarget: perfs.filter((p) => p < 80).length,
      };
    });
  }, [members, pmsData]);

  const gradeData = useMemo(() => {
    const dist: Record<SCVGrade, number> = { A: 0, B: 0, C: 0, D: 0 };
    members.forEach((m) => { const perf = getOverallPerformance(pmsData.get(m.id) || []); dist[getGrade(perf)]++; });
    return Object.entries(dist).map(([grade, count]) => ({ grade, count, fill: getGradeColor(grade as SCVGrade) }));
  }, [members, pmsData]);

  const insights = useMemo(() => {
    const ins: string[] = [];
    const allPerfs = members.map((m) => ({ name: m.name, role: m.role, perf: getOverallPerformance(pmsData.get(m.id) || []) }));
    const sorted = [...allPerfs].sort((a, b) => b.perf - a.perf);
    const critical = sorted.filter((p) => p.perf < 60);
    if (critical.length > 0) ins.push(`🔴 ${critical.length} team member(s) in critical zone (<60%) — ${critical.map((c) => c.name).join(", ")}. Immediate coaching required.`);
    const topPerformers = sorted.filter((p) => p.perf >= 100);
    if (topPerformers.length > 0) ins.push(`🏆 ${topPerformers.length} member(s) exceeding targets — ${topPerformers.map((t) => t.name).join(", ")}. Recommend bonus disbursal.`);
    const weakKpi = [...kpiData].sort((a, b) => a.avgPerformance - b.avgPerformance)[0];
    if (weakKpi) ins.push(`📉 Weakest KPI: ${weakKpi.kpi} at ${weakKpi.avgPerformance}% — ${weakKpi.belowTarget} members below target.`);
    const weakTier = [...tierData].sort((a, b) => a.avgPerformance - b.avgPerformance)[0];
    if (weakTier) ins.push(`📊 Lowest tier: ${weakTier.tier} at ${weakTier.avgPerformance}% avg across ${weakTier.members} members.`);
    ins.push(`📋 Total: ${members.length} members. Weighted TAP avg: ${(allPerfs.reduce((s, p) => s + p.perf, 0) / allPerfs.length).toFixed(1)}%.`);
    return ins;
  }, [members, pmsData, kpiData, tierData]);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-4">
        <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-500" /> PMS Intelligence — Gyan Panel
        </h3>
        <div className="space-y-1.5">
          {insights.map((ins, i) => <p key={i} className="text-xs text-foreground/80 leading-relaxed">{ins}</p>)}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="rounded-xl border border-border bg-card p-4">
          <h4 className="text-xs font-semibold text-foreground mb-3">Regional Performance (TAP Avg %)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={regionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="region" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 120]} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey="avgPerformance" radius={[6, 6, 0, 0]}>
                {regionData.map((d, i) => (
                  <Cell key={i} fill={d.avgPerformance >= 80 ? "hsl(142,71%,35%)" : d.avgPerformance >= 60 ? "hsl(38,92%,50%)" : "hsl(0,72%,51%)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h4 className="text-xs font-semibold text-foreground mb-3">Grade Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={gradeData} dataKey="count" nameKey="grade" cx="50%" cy="50%" outerRadius={90} innerRadius={50} label={({ grade, count }) => `${grade}: ${count}`}>
                {gradeData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h4 className="text-xs font-semibold text-foreground mb-3">KPI Performance Radar</h4>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={kpiData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="kpi" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 120]} tick={{ fontSize: 9 }} />
              <Radar name="Avg %" dataKey="avgPerformance" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h4 className="text-xs font-semibold text-foreground mb-3">Performance by Tier</h4>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={tierData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 120]} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="tier" tick={{ fontSize: 10 }} width={100} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey="avgPerformance" radius={[0, 6, 6, 0]} fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ── Member PMS Dialog ──

function MemberPMSDialog({ memberId, members, pmsData, reviews, incentives, onClose }: {
  memberId: string | null; members: TeamMember[]; pmsData: Map<string, PMSTarget[]>;
  reviews: ReviewCycle[]; incentives: IncentiveRecord[]; onClose: () => void;
}) {
  if (!memberId) return null;
  const member = members.find((m) => m.id === memberId);
  if (!member) return null;
  const targets = pmsData.get(memberId) || [];
  const overall = getOverallPerformance(targets);
  const grade = getGrade(overall);
  const tier = getRoleTier(member.role);
  const slab = getIncentiveSlab(overall);
  const baseCTC = BASE_CTC_BY_TIER[tier];
  const incentiveAmt = Math.round(baseCTC * Math.abs(slab.pctOfCTC) / 100);

  const directReports = members.filter((m) => m.reportsTo === memberId);
  const allDescendants = getDescendantIds(memberId, members).filter((id) => id !== memberId);
  const memberReviews = reviews.filter(r => r.memberId === memberId);
  const memberIncentives = incentives.filter(r => r.memberId === memberId);

  const radarData = targets.map((t) => {
    const kpi = BASE_KPIS.find((k) => k.key === t.kpi);
    const perf = t.target > 0 ? Math.round((t.achieved / t.target) * 100) : 0;
    return { kpi: kpi?.shortLabel || t.kpi, target: 100, achieved: perf };
  });

  return (
    <Dialog open={!!memberId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            PMS Profile: {member.name}
            <Badge className={`text-[10px] ${getGradeBg(grade)}`}>Grade {grade}</Badge>
            <Badge variant="outline" className="text-[8px] capitalize">{tier}</Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="performance">
          <TabsList className="h-auto flex-wrap gap-1">
            <TabsTrigger value="performance" className="text-xs">Performance</TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs">Reviews ({memberReviews.length})</TabsTrigger>
            <TabsTrigger value="incentives" className="text-xs">Incentives ({memberIncentives.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4 mt-3">
            <div className="grid grid-cols-5 gap-2">
              <div className="rounded-lg border border-border bg-muted/30 p-2 text-center">
                <div className="text-[9px] text-muted-foreground">TAP</div>
                <div className={`text-lg font-bold ${getTAPColor(overall)}`}>{overall}%</div>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-2 text-center">
                <div className="text-[9px] text-muted-foreground">Partners</div>
                <div className="text-lg font-bold text-foreground">{member.assignedPartners.length}</div>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-2 text-center">
                <div className="text-[9px] text-muted-foreground">Reports</div>
                <div className="text-lg font-bold text-foreground">{directReports.length}</div>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-2 text-center">
                <div className="text-[9px] text-muted-foreground">Team</div>
                <div className="text-lg font-bold text-foreground">{allDescendants.length}</div>
              </div>
              <div className={`rounded-lg border p-2 text-center ${slab.type === "bonus" ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20" : slab.type === "penalty" ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20" : "border-border bg-muted/30"}`}>
                <div className="text-[9px] text-muted-foreground">Incentive</div>
                <div className={`text-sm font-bold ${slab.type === "bonus" ? "text-green-600 dark:text-green-400" : slab.type === "penalty" ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
                  {slab.icon} ${incentiveAmt.toLocaleString("en-US")}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-3">
              <h4 className="text-xs font-semibold mb-2">KPI Radar</h4>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="kpi" tick={{ fontSize: 9 }} />
                  <PolarRadiusAxis domain={[0, 120]} tick={{ fontSize: 8 }} />
                  <Radar name="Target" dataKey="target" stroke="hsl(var(--muted-foreground))" fill="none" strokeDasharray="4 4" />
                  <Radar name="Achieved" dataKey="achieved" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h4 className="text-xs font-semibold mb-2">TAP Breakdown (Tier: <span className="capitalize text-primary">{tier}</span> weights)</h4>
              <div className="space-y-1.5">
                {targets.map((t) => {
                  const kpi = BASE_KPIS.find((k) => k.key === t.kpi);
                  const perf = t.target > 0 ? Math.round((t.achieved / t.target) * 100) : 0;
                  return (
                    <div key={t.kpi} className="flex items-center gap-3 text-xs">
                      <span className="w-24 text-muted-foreground truncate">{kpi?.label}</span>
                      <span className="w-10 text-blue-600 dark:text-blue-400 text-right">{t.target}</span>
                      <span className="w-10 text-green-600 dark:text-green-400 text-right">{t.achieved}</span>
                      <div className="flex-1"><Progress value={Math.min(100, perf)} className="h-1.5" /></div>
                      <span className={`w-10 text-right font-bold ${getTAPColor(perf)}`}>{perf}%</span>
                      <span className="w-10 text-right text-muted-foreground text-[9px]">{t.weight}%w</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-3">
            <div className="space-y-2">
              {memberReviews.length === 0 ? <p className="text-xs text-muted-foreground py-4 text-center">No review cycles</p> : (
                memberReviews.map(r => (
                  <div key={r.id} className="rounded-lg border border-border p-3 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold">{r.month}</span>
                      <Badge className={`text-[8px] ${reviewPhaseLabels[r.phase].color}`}>{reviewPhaseLabels[r.phase].label}</Badge>
                      <Badge className={`text-[8px] ${reviewStatusLabels[r.status].color}`}>{reviewStatusLabels[r.status].label}</Badge>
                      <span className={`text-xs font-bold ml-auto ${getTAPColor(r.overallTAP)}`}>{r.overallTAP}%</span>
                      <Badge className={`text-[9px] ${getGradeBg(r.grade)}`}>{r.grade}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Reviewer: {r.managerName} · Self: {r.selfRating ? `${r.selfRating}/5` : "—"}</p>
                    <p className="text-[10px] text-foreground/80 italic">"{r.managerComments}"</p>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="incentives" className="mt-3">
            <div className="space-y-2">
              {memberIncentives.length === 0 ? <p className="text-xs text-muted-foreground py-4 text-center">No incentive records</p> : (
                memberIncentives.map(r => (
                  <div key={r.id} className={`rounded-lg border p-3 ${r.type === "bonus" ? "border-green-200/50 dark:border-green-800/50" : "border-red-200/50 dark:border-red-800/50"}`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold">{r.month}</span>
                      <Badge className={`text-[8px] ${r.type === "bonus" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                        {r.type}
                      </Badge>
                      <span className={`text-sm font-bold ml-auto ${r.type === "bonus" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {r.type === "bonus" ? "+" : "-"}${r.amount.toLocaleString("en-US")}
                      </span>
                      <Badge className={`text-[8px] ${r.status === "disbursed" ? "bg-action-done/15 text-action-done" : r.status === "approved" ? "bg-primary/15 text-primary" : "bg-action-cook/15 text-action-cook"}`}>
                        {r.status}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{r.reason}</p>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
