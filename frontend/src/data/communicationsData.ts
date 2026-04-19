export type CommChannel = "in_app" | "whatsapp" | "both";
export type CommCategory = "performance" | "finance" | "promotion" | "announcement" | "alert" | "celebration";
export type CommStatus = "draft" | "scheduled" | "sent" | "failed";
export type CommPriority = "low" | "normal" | "high" | "urgent";

export interface AudienceFilter {
  type: "all" | "region" | "cuisine" | "performance" | "individual";
  regions?: string[];
  cuisines?: string[];
  performanceTier?: string[];
  kitchenStatus?: string[];
  minOrders?: number;
  minRating?: number;
  partnerIds?: string[];
}

export interface Communication {
  id: string;
  subject: string;
  body: string;
  category: CommCategory;
  channel: CommChannel;
  priority: CommPriority;
  status: CommStatus;
  audience: AudienceFilter;
  audienceCount: number;
  sentBy: string;
  sentByRole: string;
  createdAt: string;
  scheduledAt?: string;
  sentAt?: string;
  readCount: number;
  deliveredCount: number;
}

export interface CommTemplate {
  id: string;
  name: string;
  category: CommCategory;
  subject: string;
  body: string;
  variables: string[];
}

export const REGIONS = ["New York North", "New York South", "New York Central", "Los Angeles East", "Los Angeles West", "Chicago", "San Jose", "Austin"];
export const CUISINES = ["South Indian", "North Indian", "Chinese", "Continental", "Florida", "Pennsylvania", "Chettinad", "Bengali", "Mughlai", "Italian", "Thai", "Japanese"];
export const PERFORMANCE_TIERS = ["Gold Chef", "Silver Chef", "Bronze Chef", "New Partner"];
export const KITCHEN_STATUSES = ["Active", "Paused", "Under Review", "Probation"];

export const COMM_TEMPLATES: CommTemplate[] = [
  {
    id: "t1",
    name: "Weekly Performance Summary",
    category: "performance",
    subject: "Your Weekly Performance Report — {{week}}",
    body: "Hi {{partner_name}},\n\nHere's your performance summary for {{week}}:\n• Orders Completed: {{orders}}\n• Rating: {{rating}} ⭐\n• On-time Delivery: {{ontime}}%\n\nKeep up the great work! 💪",
    variables: ["partner_name", "week", "orders", "rating", "ontime"],
  },
  {
    id: "t2",
    name: "Payment Processed",
    category: "finance",
    subject: "Payment of ${{amount}} Processed",
    body: "Hi {{partner_name}},\n\nYour weekly payout of ${{amount}} has been processed and will reflect in your bank account within 24-48 hours.\n\nBreakdown:\n• Order Earnings: ${{order_earnings}}\n• Bonuses: ${{bonuses}}\n• Deductions: ${{deductions}}\n\nFor queries, contact your Regional Manager.",
    variables: ["partner_name", "amount", "order_earnings", "bonuses", "deductions"],
  },
  {
    id: "t3",
    name: "Festival Promotion",
    category: "promotion",
    subject: "🎉 {{festival}} Special — Bonus Opportunity!",
    body: "Hi {{partner_name}},\n\nGreat news! Add {{festival}} special dishes to your menu between {{start_date}} and {{end_date}} and earn a flat ${{bonus}} bonus per festive order.\n\nTag your menu items as '{{festival}} Special' to qualify.\n\nLet's make this {{festival}} delicious! 🍽️",
    variables: ["partner_name", "festival", "start_date", "end_date", "bonus"],
  },
  {
    id: "t4",
    name: "Packaging Update",
    category: "alert",
    subject: "⚠️ Important: {{topic}}",
    body: "Hi {{partner_name}},\n\n{{message}}\n\nEffective Date: {{effective_date}}\n\nPlease ensure compliance to avoid any disruptions. Contact your manager if you have questions.",
    variables: ["partner_name", "topic", "message", "effective_date"],
  },
  {
    id: "t5",
    name: "Milestone Achievement",
    category: "celebration",
    subject: "🎉 Congratulations! {{milestone}}",
    body: "Hi {{partner_name}},\n\nYou've achieved {{milestone}}! 🎉\n\n{{reward_message}}\n\nThank you for being part of the Shero family. Your dedication inspires us all!",
    variables: ["partner_name", "milestone", "reward_message"],
  },
  {
    id: "t6",
    name: "General Announcement",
    category: "announcement",
    subject: "📢 {{title}}",
    body: "Dear Partners,\n\n{{message}}\n\nFor more details, check the Messages section in your Partner Dashboard.\n\nTeam Shero",
    variables: ["title", "message"],
  },
];

export const MOCK_COMMUNICATIONS: Communication[] = [
  {
    id: "c1",
    subject: "Holi Special Menu — Bonus $50 Per Order!",
    body: "Add festive Holi dishes (Gujiya, Thandai, Puran Poli) to your menu between 10–16 March and earn a flat $50 bonus on every festive order. Menu items must be tagged as 'Holi Special'.",
    category: "promotion",
    channel: "both",
    priority: "high",
    status: "sent",
    audience: { type: "all" },
    audienceCount: 142,
    sentBy: "Kavitha R.",
    sentByRole: "Vertical Head",
    createdAt: "2026-03-02T10:00:00",
    sentAt: "2026-03-02T10:30:00",
    readCount: 98,
    deliveredCount: 138,
  },
  {
    id: "c2",
    subject: "New Kitchen Timing Feature",
    body: "You can now set your kitchen availability by the hour. Go to Kitchen Timing → Schedule to block specific time slots when you're unavailable. This helps avoid rejected orders and protects your SCV score.",
    category: "announcement",
    channel: "in_app",
    priority: "normal",
    status: "sent",
    audience: { type: "all" },
    audienceCount: 142,
    sentBy: "Arvind S.",
    sentByRole: "Country Head",
    createdAt: "2026-02-28T09:00:00",
    sentAt: "2026-02-28T09:15:00",
    readCount: 110,
    deliveredCount: 142,
  },
  {
    id: "c3",
    subject: "Weekly Payment Processed — $12,450",
    body: "Your weekly payout of $12,450 has been processed. Check your Reports section for the detailed breakdown.",
    category: "finance",
    channel: "whatsapp",
    priority: "normal",
    status: "sent",
    audience: { type: "region", regions: ["New York South"] },
    audienceCount: 34,
    sentBy: "Ganesh R.",
    sentByRole: "PPP Manager",
    createdAt: "2026-02-27T14:00:00",
    sentAt: "2026-02-27T14:10:00",
    readCount: 30,
    deliveredCount: 34,
  },
  {
    id: "c4",
    subject: "Performance Alert — Rating Below 3.5",
    body: "Your kitchen rating has dropped below 3.5 for 2 consecutive weeks. Please review feedback and improve food quality and packaging. Your Regional Manager will connect with you this week.",
    category: "performance",
    channel: "both",
    priority: "urgent",
    status: "sent",
    audience: { type: "performance", performanceTier: ["Bronze Chef"] },
    audienceCount: 8,
    sentBy: "David M.",
    sentByRole: "Regional Manager",
    createdAt: "2026-02-26T11:00:00",
    sentAt: "2026-02-26T11:05:00",
    readCount: 6,
    deliveredCount: 8,
  },
  {
    id: "c5",
    subject: "Ramadan Special Menu Drive",
    body: "Ramadan begins soon! Partners with expertise in Mughlai, Chicagoi, or Arabic cuisines — add Iftar & Sehri specials to earn 2x visibility and $75 bonus per order.",
    category: "promotion",
    channel: "both",
    priority: "high",
    status: "scheduled",
    audience: { type: "cuisine", cuisines: ["Mughlai", "Pennsylvania"] },
    audienceCount: 22,
    sentBy: "Nicole P.",
    sentByRole: "SHF Cuisine Manager",
    createdAt: "2026-03-03T08:00:00",
    scheduledAt: "2026-03-10T09:00:00",
    readCount: 0,
    deliveredCount: 0,
  },
  {
    id: "c6",
    subject: "Subscription Packaging Kit Dispatch",
    body: "Starting 15 March, all subscription orders must use Shero-branded packaging. Your kit will be dispatched by 10 March.",
    category: "alert",
    channel: "in_app",
    priority: "high",
    status: "draft",
    audience: { type: "all" },
    audienceCount: 142,
    sentBy: "Kavitha R.",
    sentByRole: "Vertical Head",
    createdAt: "2026-03-03T07:00:00",
    readCount: 0,
    deliveredCount: 0,
  },
];

export const categoryConfig: Record<CommCategory, { label: string; color: string; bg: string }> = {
  performance: { label: "Performance", color: "text-blue-600", bg: "bg-blue-100" },
  finance: { label: "Finance", color: "text-emerald-600", bg: "bg-emerald-100" },
  promotion: { label: "Promotion", color: "text-orange-600", bg: "bg-orange-100" },
  announcement: { label: "Announcement", color: "text-primary", bg: "bg-primary/10" },
  alert: { label: "Alert", color: "text-destructive", bg: "bg-destructive/10" },
  celebration: { label: "Celebration", color: "text-accent", bg: "bg-accent/10" },
};

export const channelConfig: Record<CommChannel, { label: string }> = {
  in_app: { label: "In-App" },
  whatsapp: { label: "WhatsApp" },
  both: { label: "In-App + WhatsApp" },
};

export const priorityConfig: Record<CommPriority, { label: string; color: string }> = {
  low: { label: "Low", color: "text-muted-foreground" },
  normal: { label: "Normal", color: "text-foreground" },
  high: { label: "High", color: "text-orange-600" },
  urgent: { label: "Urgent", color: "text-destructive" },
};
