// ─── Metric Management Data Layer ───
// SCV(Metrics) = Weighted operational score (Attendance, BR, DD, CA, RR)
// SCV(Sales)   = Expected vs Achieved sales volume ratio
// SCV(BIZ)     = Combined health score = 0.6 * SCV(Metrics) + 0.4 * SCV(Sales)

export type Vertical = "SHF" | "HCF" | "Subscriptions" | "Party Orders" | "Instant Delivery" | "Sweets & Snacks";
export type MetricKey = "attendance" | "brand_rating" | "delivery_discipline" | "customer_acceptance" | "repeat_rate";
export type SCVGrade = "A" | "B" | "C" | "D";

export interface MetricWeightage {
  key: MetricKey;
  label: string;
  shortLabel: string;
  description: string;
  weight: number; // percentage out of 100
}

export const METRIC_WEIGHTAGES: MetricWeightage[] = [
  { key: "attendance", label: "Attendance", shortLabel: "ATT", description: "Kitchen availability & operating hours compliance", weight: 25 },
  { key: "brand_rating", label: "Bad Rating", shortLabel: "BR", description: "Negative ratings, poor reviews & food quality complaints", weight: 20 },
  { key: "delivery_discipline", label: "Delayed Delivery", shortLabel: "DD", description: "Late preparation, delayed handover, missed delivery windows", weight: 20 },
  { key: "customer_acceptance", label: "Cancellations", shortLabel: "CA", description: "Order cancellation rate, rejection ratio, unfulfilled orders", weight: 20 },
  { key: "repeat_rate", label: "Rating & Reviews", shortLabel: "RR", description: "Overall rating score, review sentiment, customer feedback index", weight: 15 },
];

export interface PartnerMetrics {
  partnerId: string;
  partnerName: string;
  rmn: string;
  kitchenId: string;
  kitchenName: string;
  kitchenType: "Branded" | "Unbranded";
  vertical: Vertical;
  region: string;
  cuisine: string;
  // Operational scores 0-100
  attendance: number;
  brand_rating: number;
  delivery_discipline: number;
  customer_acceptance: number;
  repeat_rate: number;
  // Sales
  expectedSales: number;
  achievedSales: number;
  // Calculated
  scvMetrics: number;
  scvSales: number;
  scvBiz: number;
  grade: SCVGrade;
  trend: "up" | "down" | "stable";
  // Period
  month: string;
}

export interface VerticalSummary {
  vertical: Vertical;
  totalKitchens: number;
  activeKitchens: number;
  avgScvMetrics: number;
  avgScvSales: number;
  avgScvBiz: number;
  gradeDistribution: Record<SCVGrade, number>;
  totalExpectedSales: number;
  totalAchievedSales: number;
}

export interface RegionSummary {
  region: string;
  totalPartners: number;
  avgScvBiz: number;
  gradeDistribution: Record<SCVGrade, number>;
  topPerformer: string;
  bottomPerformer: string;
}

export interface TrendDataPoint {
  month: string;
  scvMetrics: number;
  scvSales: number;
  scvBiz: number;
}

export function getGrade(scv: number): SCVGrade {
  if (scv >= 80) return "A";
  if (scv >= 60) return "B";
  if (scv >= 40) return "C";
  return "D";
}

export function getGradeColor(grade: SCVGrade): string {
  switch (grade) {
    case "A": return "hsl(142, 71%, 35%)";
    case "B": return "hsl(210, 70%, 50%)";
    case "C": return "hsl(38, 92%, 50%)";
    case "D": return "hsl(0, 72%, 51%)";
  }
}

export function getGradeBg(grade: SCVGrade): string {
  switch (grade) {
    case "A": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "B": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "C": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    case "D": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  }
}

function calcSCVMetrics(m: Pick<PartnerMetrics, MetricKey>): number {
  return METRIC_WEIGHTAGES.reduce((sum, w) => sum + (m[w.key] * w.weight / 100), 0);
}

function calcSCVSales(expected: number, achieved: number): number {
  if (expected === 0) return 0;
  return Math.min(100, (achieved / expected) * 100);
}

function calcSCVBiz(scvMetrics: number, scvSales: number): number {
  return Math.round((0.6 * scvMetrics + 0.4 * scvSales) * 10) / 10;
}

// ─── Mock Data Generator ───
const REGIONS = ["New York North", "New York South", "New York Central", "Los Angeles East", "Los Angeles West", "Chicago"];
const CUISINES = ["South Indian", "North Indian", "Multi-Cuisine", "Chinese", "Biryani", "Chettinad", "Florida"];
const VERTICALS: Vertical[] = ["SHF", "HCF", "Subscriptions", "Party Orders", "Instant Delivery", "Sweets & Snacks"];
const MONTHS = ["Oct 2025", "Nov 2025", "Dec 2025", "Jan 2026", "Feb 2026", "Mar 2026"];

const partnerNames = [
  "Lakshmi Devi", "Saroja Bai", "Kamala M.", "Fathima S.", "Meena K.", "Raheema B.",
  "Priya R.", "Anitha S.", "Deepa V.", "Revathi N.", "Sunitha P.", "Geetha L.",
  "Vasanthi M.", "Padma R.", "Jaya K.", "Uma S.", "Radha N.", "Shanti B.",
  "Kavitha D.", "Mallika T.", "Bhavani G.", "Rani M.", "Devi P.", "Selvi R.",
  "Indira K.", "Gomathi S.", "Suguna V.", "Thilaga M.", "Ponni R.", "Valli N."
];

function rand(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function generatePartnerMetrics(): PartnerMetrics[] {
  const data: PartnerMetrics[] = [];
  
  partnerNames.forEach((name, idx) => {
    const vertical = VERTICALS[idx % VERTICALS.length];
    const region = REGIONS[idx % REGIONS.length];
    const cuisine = CUISINES[idx % CUISINES.length];
    const kitchenType = idx % 3 === 0 ? "Branded" : "Unbranded" as const;
    const basePerformance = rand(30, 95);
    
    MONTHS.forEach((month, mi) => {
      const drift = mi * rand(-3, 5);
      const att = Math.min(100, Math.max(0, basePerformance + rand(-10, 10) + drift));
      const br = Math.min(100, Math.max(0, basePerformance + rand(-15, 8) + drift));
      const dd = Math.min(100, Math.max(0, basePerformance + rand(-8, 12) + drift));
      const ca = Math.min(100, Math.max(0, basePerformance + rand(-12, 10) + drift));
      const rr = Math.min(100, Math.max(0, basePerformance + rand(-10, 5) + drift));
      
      const metrics = { attendance: att, brand_rating: br, delivery_discipline: dd, customer_acceptance: ca, repeat_rate: rr };
      const scvMetrics = Math.round(calcSCVMetrics(metrics) * 10) / 10;
      
      const expectedSales = Math.round(rand(15000, 120000));
      const salesRatio = rand(0.4, 1.15);
      const achievedSales = Math.round(expectedSales * salesRatio);
      const scvSales = Math.round(calcSCVSales(expectedSales, achievedSales) * 10) / 10;
      const scvBiz = calcSCVBiz(scvMetrics, scvSales);
      
      const prevMonth = mi > 0 ? data.find(d => d.partnerId === `P${String(idx + 1).padStart(3, "0")}` && d.month === MONTHS[mi - 1]) : null;
      const trend = prevMonth ? (scvBiz > prevMonth.scvBiz + 2 ? "up" : scvBiz < prevMonth.scvBiz - 2 ? "down" : "stable") : "stable";
      
      data.push({
        partnerId: `P${String(idx + 1).padStart(3, "0")}`,
        partnerName: name,
        rmn: `+1 ${String(9800000000 + idx * 1111).slice(0, 10)}`,
        kitchenId: `SK${String(1000 + idx * 2).padStart(4, "0")}${kitchenType === "Branded" ? "-V" : ""}`,
        kitchenName: kitchenType === "Branded" ? `Shero ${cuisine}` : `${name}'s Kitchen`,
        kitchenType,
        vertical,
        region,
        cuisine,
        ...metrics,
        expectedSales,
        achievedSales,
        scvMetrics,
        scvSales,
        scvBiz,
        grade: getGrade(scvBiz),
        trend,
        month,
      });
    });
  });
  
  return data;
}

export const PARTNER_METRICS: PartnerMetrics[] = generatePartnerMetrics();

export function getLatestMetrics(): PartnerMetrics[] {
  const latestMonth = MONTHS[MONTHS.length - 1];
  return PARTNER_METRICS.filter(m => m.month === latestMonth);
}

export function getVerticalSummaries(): VerticalSummary[] {
  const latest = getLatestMetrics();
  return VERTICALS.map(v => {
    const items = latest.filter(m => m.vertical === v);
    const dist: Record<SCVGrade, number> = { A: 0, B: 0, C: 0, D: 0 };
    items.forEach(i => dist[i.grade]++);
    return {
      vertical: v,
      totalKitchens: items.length,
      activeKitchens: items.filter(i => i.attendance > 50).length,
      avgScvMetrics: items.length ? Math.round(items.reduce((s, i) => s + i.scvMetrics, 0) / items.length * 10) / 10 : 0,
      avgScvSales: items.length ? Math.round(items.reduce((s, i) => s + i.scvSales, 0) / items.length * 10) / 10 : 0,
      avgScvBiz: items.length ? Math.round(items.reduce((s, i) => s + i.scvBiz, 0) / items.length * 10) / 10 : 0,
      gradeDistribution: dist,
      totalExpectedSales: items.reduce((s, i) => s + i.expectedSales, 0),
      totalAchievedSales: items.reduce((s, i) => s + i.achievedSales, 0),
    };
  });
}

export function getRegionSummaries(): RegionSummary[] {
  const latest = getLatestMetrics();
  return REGIONS.map(r => {
    const items = latest.filter(m => m.region === r);
    const dist: Record<SCVGrade, number> = { A: 0, B: 0, C: 0, D: 0 };
    items.forEach(i => dist[i.grade]++);
    const sorted = [...items].sort((a, b) => b.scvBiz - a.scvBiz);
    return {
      region: r,
      totalPartners: items.length,
      avgScvBiz: items.length ? Math.round(items.reduce((s, i) => s + i.scvBiz, 0) / items.length * 10) / 10 : 0,
      gradeDistribution: dist,
      topPerformer: sorted[0]?.partnerName || "—",
      bottomPerformer: sorted[sorted.length - 1]?.partnerName || "—",
    };
  });
}

export function getTrendData(): TrendDataPoint[] {
  return MONTHS.map(month => {
    const items = PARTNER_METRICS.filter(m => m.month === month);
    return {
      month: month.replace(" 20", " '"),
      scvMetrics: Math.round(items.reduce((s, i) => s + i.scvMetrics, 0) / items.length * 10) / 10,
      scvSales: Math.round(items.reduce((s, i) => s + i.scvSales, 0) / items.length * 10) / 10,
      scvBiz: Math.round(items.reduce((s, i) => s + i.scvBiz, 0) / items.length * 10) / 10,
    };
  });
}

export function getIntelligenceInsights(data: PartnerMetrics[]): string[] {
  const latest = getLatestMetrics();
  const insights: string[] = [];
  
  // Grade D alert
  const gradeD = latest.filter(m => m.grade === "D");
  if (gradeD.length > 0) {
    insights.push(`🔴 ${gradeD.length} kitchen(s) in Critical (Grade D) — immediate intervention required. Weakest: ${gradeD.sort((a,b) => a.scvBiz - b.scvBiz)[0]?.partnerName}`);
  }
  
  // Declining trend
  const declining = latest.filter(m => m.trend === "down");
  if (declining.length > 0) {
    insights.push(`📉 ${declining.length} partner(s) showing declining SCV trend — schedule review meetings.`);
  }
  
  // Sales underperformance
  const underPerformers = latest.filter(m => m.scvSales < 50);
  if (underPerformers.length > 0) {
    insights.push(`💰 ${underPerformers.length} kitchen(s) achieving <50% of expected sales — consider demand-gen or menu optimization.`);
  }
  
  // Attendance outlier
  const lowAttendance = latest.filter(m => m.attendance < 60);
  if (lowAttendance.length > 0) {
    insights.push(`⏰ ${lowAttendance.length} kitchen(s) with attendance below 60% — potential availability issue impacting revenue.`);
  }
  
  // Top performers
  const topA = latest.filter(m => m.grade === "A").length;
  insights.push(`🏆 ${topA} kitchen(s) rated Grade A (Excellent) — recognize & incentivize to sustain performance.`);
  
  // Delivery discipline gap
  const avgDD = latest.reduce((s, m) => s + m.delivery_discipline, 0) / latest.length;
  if (avgDD < 70) {
    insights.push(`🚚 Average Delivery Discipline at ${avgDD.toFixed(1)}% — below 70% threshold. Training intervention recommended.`);
  }
  
  // Vertical comparison
  const vertSummaries = getVerticalSummaries();
  const bestV = vertSummaries.sort((a, b) => b.avgScvBiz - a.avgScvBiz)[0];
  const worstV = vertSummaries[vertSummaries.length - 1];
  if (bestV && worstV && bestV.vertical !== worstV.vertical) {
    insights.push(`📊 Best vertical: ${bestV.vertical} (SCV ${bestV.avgScvBiz}) vs Weakest: ${worstV.vertical} (SCV ${worstV.avgScvBiz}) — ${(bestV.avgScvBiz - worstV.avgScvBiz).toFixed(1)}pt gap.`);
  }
  
  // Repeat rate concern
  const avgRR = latest.reduce((s, m) => s + m.repeat_rate, 0) / latest.length;
  if (avgRR < 60) {
    insights.push(`🔄 Platform Repeat Rate at ${avgRR.toFixed(1)}% — customer retention programs needed.`);
  }

  return insights;
}

export { MONTHS, REGIONS, CUISINES, VERTICALS };
