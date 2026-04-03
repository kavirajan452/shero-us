// ── Shero Partner Centre (SPC) Data Layer ──

export type GrievanceStatus = "open" | "in_progress" | "escalated" | "resolved" | "closed";
export type GrievancePriority = "low" | "medium" | "high" | "critical";
export type GrievanceCategory = "payment" | "order_dispute" | "app_issue" | "policy" | "harassment" | "personal" | "other";
export type WellbeingCategory = "stress" | "financial" | "family" | "health" | "motivation" | "legal";
export type FriendRequestStatus = "pending" | "active" | "completed" | "declined";

export interface Grievance {
  id: string;
  partnerId: string;
  partnerName: string;
  category: GrievanceCategory;
  subject: string;
  description: string;
  priority: GrievancePriority;
  status: GrievanceStatus;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  resolution?: string;
  escalationLevel: number;
  messages: { from: "partner" | "spc"; text: string; time: string }[];
}

export interface WelfareProgram {
  id: string;
  title: string;
  category: WellbeingCategory;
  description: string;
  icon: string;
  participants: number;
  isActive: boolean;
  schedule?: string;
}

export interface FriendToPartner {
  id: string;
  partnerId: string;
  partnerName: string;
  friendName: string;
  friendRole: string;
  status: FriendRequestStatus;
  assignedDate: string;
  lastInteraction: string;
  sessionsCompleted: number;
  notes: string;
  mood: "happy" | "neutral" | "stressed" | "critical";
}

export interface StressBusterResource {
  id: string;
  title: string;
  type: "article" | "video" | "podcast" | "helpline" | "activity";
  category: WellbeingCategory;
  description: string;
  url?: string;
  helpline?: string;
  duration?: string;
}

export interface SPCKpi {
  key: string;
  label: string;
  value: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "stable";
  trendValue: number;
}

// ── SPC KPIs ──
export const SPC_KPIS: SPCKpi[] = [
  { key: "grievance_resolution_time", label: "Avg Resolution Time", value: 18, target: 24, unit: "hrs", trend: "down", trendValue: -12 },
  { key: "grievance_sla", label: "SLA Compliance", value: 92, target: 95, unit: "%", trend: "up", trendValue: 3 },
  { key: "partner_satisfaction", label: "Partner Satisfaction", value: 4.2, target: 4.5, unit: "/5", trend: "up", trendValue: 5 },
  { key: "welfare_participation", label: "Welfare Participation", value: 68, target: 75, unit: "%", trend: "up", trendValue: 8 },
  { key: "friend_sessions", label: "Friend Sessions/Month", value: 142, target: 160, unit: "", trend: "up", trendValue: 12 },
  { key: "retention_impact", label: "Retention Impact", value: 88, target: 90, unit: "%", trend: "stable", trendValue: 0 },
  { key: "escalation_rate", label: "Escalation Rate", value: 8, target: 5, unit: "%", trend: "down", trendValue: -2 },
  { key: "nps_partner", label: "Partner NPS", value: 62, target: 70, unit: "", trend: "up", trendValue: 4 },
];

// ── Mock Grievances ──
export const MOCK_GRIEVANCES: Grievance[] = [
  {
    id: "GRV001", partnerId: "P001", partnerName: "Sujatha M.", category: "payment",
    subject: "Weekly payout delayed by 3 days",
    description: "My weekly payout for week ending Feb 22 has not been credited. Usually arrives by Monday but it's Thursday now.",
    priority: "high", status: "in_progress", assignedTo: "SPC-Anitha",
    createdAt: "2026-02-27", updatedAt: "2026-02-28", escalationLevel: 1,
    messages: [
      { from: "partner", text: "My payout for last week is still pending. Please check.", time: "2026-02-27 09:30" },
      { from: "spc", text: "We're checking with the PPP team. Will update within 4 hours.", time: "2026-02-27 10:15" },
      { from: "spc", text: "The delay was due to bank processing. Amount will be credited by tomorrow.", time: "2026-02-28 11:00" },
    ],
  },
  {
    id: "GRV002", partnerId: "P002", partnerName: "Priya K.", category: "order_dispute",
    subject: "Customer falsely reported food quality issue",
    description: "A customer claimed the food was stale but I prepared it fresh. My rating dropped. Please review.",
    priority: "medium", status: "open", assignedTo: "SPC-Rekha",
    createdAt: "2026-03-01", updatedAt: "2026-03-01", escalationLevel: 0,
    messages: [
      { from: "partner", text: "Customer gave 1 star saying food was stale. This is not true. I always cook fresh.", time: "2026-03-01 14:20" },
    ],
  },
  {
    id: "GRV003", partnerId: "P003", partnerName: "Lakshmi R.", category: "personal",
    subject: "Need leave for family emergency",
    description: "My mother is hospitalized. I need to take 2 weeks off but worried about my kitchen status.",
    priority: "high", status: "resolved", assignedTo: "SPC-Anitha",
    createdAt: "2026-02-15", updatedAt: "2026-02-20", escalationLevel: 0,
    resolution: "Approved 2-week emergency leave. Kitchen set to temporary pause. No penalty applied. Follow-up call scheduled.",
    messages: [
      { from: "partner", text: "My mother had a stroke. I need to go to my village. Will my kitchen be deactivated?", time: "2026-02-15 08:00" },
      { from: "spc", text: "Don't worry. We'll pause your kitchen. No penalties. Take care of your family. 🙏", time: "2026-02-15 08:30" },
      { from: "partner", text: "Thank you so much. I'll be back in 2 weeks.", time: "2026-02-15 09:00" },
      { from: "spc", text: "Your kitchen is paused. We'll reactivate when you're ready. Wishing your mother a speedy recovery.", time: "2026-02-15 09:15" },
    ],
  },
  {
    id: "GRV004", partnerId: "P004", partnerName: "Meena S.", category: "harassment",
    subject: "Delivery person was rude and threatening",
    description: "The delivery partner used abusive language when I asked him to wait 2 minutes for the food to be packed.",
    priority: "critical", status: "escalated", assignedTo: "SPC-Manager",
    createdAt: "2026-03-02", updatedAt: "2026-03-02", escalationLevel: 2,
    messages: [
      { from: "partner", text: "The delivery boy shouted at me in front of my family. I feel unsafe.", time: "2026-03-02 12:30" },
      { from: "spc", text: "This is unacceptable. We're escalating this immediately. The delivery partner will be suspended pending investigation.", time: "2026-03-02 12:45" },
    ],
  },
  {
    id: "GRV005", partnerId: "P005", partnerName: "Anita D.", category: "app_issue",
    subject: "App not showing new orders since morning",
    description: "I'm not receiving any order notifications since 7 AM. Checked internet - it's working fine.",
    priority: "high", status: "resolved", assignedTo: "SPC-Tech",
    createdAt: "2026-02-28", updatedAt: "2026-02-28", escalationLevel: 0,
    resolution: "App cache cleared remotely. Orders restored. Partner confirmed receiving orders.",
    messages: [
      { from: "partner", text: "No orders since morning. Is there a problem?", time: "2026-02-28 09:00" },
      { from: "spc", text: "We've pushed a fix. Please restart the app. Orders should start flowing now.", time: "2026-02-28 09:30" },
      { from: "partner", text: "Yes! Getting orders now. Thank you!", time: "2026-02-28 09:45" },
    ],
  },
  {
    id: "GRV006", partnerId: "P006", partnerName: "Revathi N.", category: "policy",
    subject: "Unfair penalty for order cancellation by customer",
    description: "Customer cancelled after I started cooking. I was penalized ₹150. This is unfair as I incurred costs.",
    priority: "medium", status: "in_progress", assignedTo: "SPC-Anitha",
    createdAt: "2026-03-01", updatedAt: "2026-03-02", escalationLevel: 0,
    messages: [
      { from: "partner", text: "I spent ₹200 on ingredients and the customer cancelled after 20 mins. Why am I penalized?", time: "2026-03-01 16:00" },
      { from: "spc", text: "We understand your concern. Reviewing the cancellation timeline with the ops team.", time: "2026-03-01 16:30" },
    ],
  },
];

// ── Welfare Programs ──
export const WELFARE_PROGRAMS: WelfareProgram[] = [
  { id: "WP001", title: "Morning Yoga & Meditation", category: "stress", description: "Daily 30-min guided yoga session for partners via video call. Reduces kitchen stress and improves focus.", icon: "🧘", participants: 85, isActive: true, schedule: "Mon-Sat 6:00 AM" },
  { id: "WP002", title: "Financial Literacy Workshop", category: "financial", description: "Monthly workshop on savings, investments, and managing kitchen finances. Includes personal budgeting tips.", icon: "💰", participants: 120, isActive: true, schedule: "1st Saturday, 3:00 PM" },
  { id: "WP003", title: "Women's Health Camp", category: "health", description: "Quarterly health check-up camps. Free screening for common health issues. Partnerships with local hospitals.", icon: "🏥", participants: 200, isActive: true, schedule: "Quarterly" },
  { id: "WP004", title: "Kids' Education Support", category: "family", description: "Scholarship guidance and education support for partners' children. Includes school supply assistance.", icon: "📚", participants: 45, isActive: true },
  { id: "WP005", title: "Legal Aid Desk", category: "legal", description: "Free legal consultation for partners facing domestic, property, or civil issues. Confidential and supportive.", icon: "⚖️", participants: 18, isActive: true, schedule: "Every Wednesday 4-6 PM" },
  { id: "WP006", title: "Motivation Monday Circle", category: "motivation", description: "Weekly group call with success stories, peer support, and motivational speakers. Build community bonds.", icon: "💪", participants: 95, isActive: true, schedule: "Every Monday 10:00 AM" },
  { id: "WP007", title: "Emergency Fund", category: "financial", description: "Interest-free micro-loans for partners in financial emergencies. Quick 24-hour disbursal.", icon: "🆘", participants: 32, isActive: true },
  { id: "WP008", title: "Festival Celebrations", category: "motivation", description: "Community celebrations for all festivals. Gift hampers, bonus incentives, and family get-togethers.", icon: "🎉", participants: 340, isActive: true, schedule: "All major festivals" },
];

// ── Friend to Partner ──
export const FRIEND_TO_PARTNER: FriendToPartner[] = [
  { id: "FTP001", partnerId: "P001", partnerName: "Sujatha M.", friendName: "Anitha S.", friendRole: "SPC Counsellor", status: "active", assignedDate: "2026-01-15", lastInteraction: "2026-03-01", sessionsCompleted: 6, notes: "Partner adjusting well. Occasional stress about order volumes.", mood: "happy" },
  { id: "FTP002", partnerId: "P004", partnerName: "Meena S.", friendName: "Preethi V.", friendRole: "SPC Counsellor", status: "active", assignedDate: "2026-02-01", lastInteraction: "2026-03-02", sessionsCompleted: 4, notes: "Recent harassment incident. Needs extra support. Counselling escalated.", mood: "stressed" },
  { id: "FTP003", partnerId: "P003", partnerName: "Lakshmi R.", friendName: "Rekha M.", friendRole: "SPC Senior", status: "active", assignedDate: "2026-01-20", lastInteraction: "2026-02-28", sessionsCompleted: 5, notes: "Mother recovering. Partner returning to work. Positive outlook.", mood: "neutral" },
  { id: "FTP004", partnerId: "P006", partnerName: "Revathi N.", friendName: "Anitha S.", friendRole: "SPC Counsellor", status: "active", assignedDate: "2026-02-10", lastInteraction: "2026-03-01", sessionsCompleted: 3, notes: "Financial stress. Connected to Financial Literacy program.", mood: "stressed" },
  { id: "FTP005", partnerId: "P002", partnerName: "Priya K.", friendName: "Gomathi R.", friendRole: "SPC Buddy", status: "active", assignedDate: "2026-02-15", lastInteraction: "2026-02-27", sessionsCompleted: 2, notes: "New partner. Onboarding support. Adjusting to platform.", mood: "neutral" },
  { id: "FTP006", partnerId: "P009", partnerName: "Saroja T.", friendName: "Preethi V.", friendRole: "SPC Counsellor", status: "completed", assignedDate: "2025-11-01", lastInteraction: "2026-01-30", sessionsCompleted: 8, notes: "Completed cycle. Partner is thriving. Grade A performer now.", mood: "happy" },
];

// ── Stress Buster Resources ──
export const STRESS_BUSTERS: StressBusterResource[] = [
  { id: "SB001", title: "5-Minute Kitchen Calm Down", type: "activity", category: "stress", description: "Quick breathing exercises you can do between orders. Resets your energy in minutes.", duration: "5 min" },
  { id: "SB002", title: "Women's Helpline", type: "helpline", category: "health", description: "National Women's Helpline for any distress. Available 24/7. Free and confidential.", helpline: "181" },
  { id: "SB003", title: "Managing Kitchen Burnout", type: "article", category: "stress", description: "Tips from experienced Shero partners on managing daily cooking stress and maintaining work-life balance." },
  { id: "SB004", title: "Financial Planning for Home Chefs", type: "video", category: "financial", description: "Learn to track your kitchen expenses, set profit goals, and save for the future.", duration: "15 min" },
  { id: "SB005", title: "Dealing with Difficult Customers", type: "podcast", category: "motivation", description: "Real stories from Shero partners on handling customer complaints gracefully.", duration: "20 min" },
  { id: "SB006", title: "Child Helpline", type: "helpline", category: "family", description: "For any concerns related to children's welfare, education, or safety.", helpline: "1098" },
  { id: "SB007", title: "Mental Health Support", type: "helpline", category: "stress", description: "iCall — Free professional counselling for mental health. Trained psychologists.", helpline: "9152987821" },
  { id: "SB008", title: "Legal Aid Free Helpline", type: "helpline", category: "legal", description: "Free legal assistance for women. National Legal Services Authority.", helpline: "15100" },
  { id: "SB009", title: "Quick Stretch Routine", type: "activity", category: "health", description: "10-minute stretching routine designed for people who stand and cook for hours.", duration: "10 min" },
  { id: "SB010", title: "Success Story: From ₹0 to ₹50K/month", type: "video", category: "motivation", description: "Inspiring journey of a Shero partner who built a thriving kitchen business from scratch.", duration: "12 min" },
];

// ── Grievance Trend Data ──
export const GRIEVANCE_TRENDS = [
  { month: "Oct", opened: 28, resolved: 25, escalated: 3 },
  { month: "Nov", opened: 32, resolved: 30, escalated: 4 },
  { month: "Dec", opened: 24, resolved: 22, escalated: 2 },
  { month: "Jan", opened: 35, resolved: 31, escalated: 5 },
  { month: "Feb", opened: 30, resolved: 28, escalated: 3 },
  { month: "Mar", opened: 12, resolved: 8, escalated: 2 },
];

export const CATEGORY_DISTRIBUTION = [
  { name: "Payment", value: 35, fill: "hsl(var(--primary))" },
  { name: "Order Dispute", value: 22, fill: "hsl(var(--chart-2))" },
  { name: "App Issue", value: 15, fill: "hsl(var(--chart-3))" },
  { name: "Policy", value: 12, fill: "hsl(var(--chart-4))" },
  { name: "Personal", value: 10, fill: "hsl(var(--chart-5))" },
  { name: "Harassment", value: 4, fill: "hsl(var(--destructive))" },
  { name: "Other", value: 2, fill: "hsl(var(--muted-foreground))" },
];

export const MOOD_DISTRIBUTION = [
  { name: "Happy", value: 45, fill: "hsl(142 76% 36%)" },
  { name: "Neutral", value: 30, fill: "hsl(var(--chart-3))" },
  { name: "Stressed", value: 20, fill: "hsl(var(--chart-4))" },
  { name: "Critical", value: 5, fill: "hsl(var(--destructive))" },
];
