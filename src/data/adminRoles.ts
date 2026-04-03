export type AdminRole =
  | "super_admin"
  | "country_manager"
  | "vertical_head"
  | "regional_manager"
  | "ops_manager"
  | "onboarding_manager"
  | "kobtl"
  | "kob_executive"
  | "sap_onboarding_tl"
  | "shf_manager"
  | "hcf_manager"
  | "spc_manager"
  | "spc_tl"
  | "ssc_manager"
  | "ssc_tl"
  | "ssc_executor"
  | "finance_manager"
  | "ppp_tl"
  | "ppp_executor"
  | "party_manager"
  | "party_tl"
  | "party_executive"
  | "hr_manager"
  | "asst_manager";

// ── Permission Action Levels ──
export type PermissionLevel = "none" | "view" | "view_limited" | "download" | "upload" | "approve" | "full";

export interface SectionPermission {
  section: string;
  level: PermissionLevel;
  dataScope?: "current_day" | "one_week" | "one_month" | "all";
  notes?: string;
}

export interface AdminRoleConfig {
  key: AdminRole;
  label: string;
  description: string;
  tier: "executive" | "team_leader" | "manager" | "leadership";
  allowedSections: string[];
  permissions: SectionPermission[];
  reportsTo?: AdminRole[];
}

// ── Granular Permission Helpers ──

export function getSectionPermission(role: AdminRole, sectionPath: string): SectionPermission {
  const config = getRoleConfig(role);
  if (!config) return { section: sectionPath, level: "none" };
  const perm = config.permissions.find(p => p.section === sectionPath);
  return perm || { section: sectionPath, level: "none" };
}

export function canView(role: AdminRole, section: string): boolean {
  const perm = getSectionPermission(role, section);
  return perm.level !== "none";
}

export function canDownload(role: AdminRole, section: string): boolean {
  const perm = getSectionPermission(role, section);
  return ["download", "upload", "approve", "full"].includes(perm.level);
}

export function canUpload(role: AdminRole, section: string): boolean {
  const perm = getSectionPermission(role, section);
  return ["upload", "full"].includes(perm.level);
}

export function canApprove(role: AdminRole, section: string): boolean {
  const perm = getSectionPermission(role, section);
  return ["approve", "full"].includes(perm.level);
}

export function canEdit(role: AdminRole, section: string): boolean {
  const perm = getSectionPermission(role, section);
  return ["upload", "approve", "full"].includes(perm.level);
}

export function getDataScope(role: AdminRole, section: string): string {
  const perm = getSectionPermission(role, section);
  return perm.dataScope || "all";
}

// ── Role Tier Helpers ──
export function getRoleTier(role: AdminRole): string {
  const config = getRoleConfig(role);
  return config?.tier || "executive";
}

export function isExecutive(role: AdminRole): boolean {
  return getRoleTier(role) === "executive";
}

export function isTeamLeader(role: AdminRole): boolean {
  return getRoleTier(role) === "team_leader";
}

export function isManager(role: AdminRole): boolean {
  return getRoleTier(role) === "manager";
}

export function isLeadership(role: AdminRole): boolean {
  return getRoleTier(role) === "leadership";
}

// ── Section path constants ──
export const SECTIONS = {
  DASHBOARD: "/admin",
  PARTNERS: "/admin/partners",
  ONBOARDING: "/admin/partners", // merged into Partner Management
  SAP_ONBOARDING: "/admin/sap-onboarding",
  ORDERS: "/admin/orders",
  MANUAL_ORDER: "/admin/manual-order",
  DELIVERY_ANALYTICS: "/admin/delivery-analytics",
  MENUS: "/admin/menus",
  KITCHEN_CATEGORIES: "/admin/kitchen-categories",
  PPP: "/admin/payments",
  TEAM: "/admin/team",
  SSC: "/admin/tickets",
  COMMUNICATIONS: "/admin/communications",
  METRICS: "/admin/metrics",
  REPORTS: "/admin/reports",
  MASTER_COMMS: "/admin/master-comms",
  FINANCIAL_REPORTS: "/admin/financial-reports",
  BUSINESS_METRICS: "/admin/business-metrics",
  SPC: "/admin/spc",
  USERS: "/admin/users",
  // Party
  PARTY_ORDERS: "/admin/party-orders",
  PARTY_MENUS: "/admin/party-menus",
  PARTY_ALLOCATIONS: "/admin/party-allocations",
  PARTY_LEADS: "/admin/party-leads",
  PARTY_DISCOUNTS: "/admin/party-discounts",
  PARTY_REPORTS: "/admin/party-reports",
  PARTY_FINANCE: "/admin/party-finance",
  // Subscriptions
  SUBSCRIPTIONS: "/admin/subscriptions",
  SUB_ORDERS: "/admin/sub-orders",
  SUB_MENU_PLANS: "/admin/sub-menu-plans",
  SUB_FINANCE: "/admin/sub-finance",
  SUB_OPERATIONS: "/admin/sub-operations",
  SUB_REPORTS: "/admin/sub-reports",
  SUB_LEADS: "/admin/sub-leads",
  // Sweets & Snacks
  SNACKS_DASHBOARD: "/admin/snacks-dashboard",
  SNACKS_CATALOG: "/admin/snacks-catalog",
  SNACKS_INVENTORY: "/admin/snacks-inventory",
  SNACKS_PARTNERS: "/admin/snacks-partners",
  SNACKS_DISCOUNTS: "/admin/snacks-discounts",
  SNACKS_REPORTS: "/admin/snacks-reports",
  // Finance sub-verticals
  SNACKS_FINANCE: "/admin/snacks-finance",
  COOKERY_FINANCE: "/admin/cookery-finance",
  SHERO_CLASSES_FINANCE: "/admin/shero-classes-finance",
  // Cookery Classes
  COOKERY_DASHBOARD: "/admin/cookery-dashboard",
  COOKERY_INSTRUCTORS: "/admin/cookery-instructors",
  COOKERY_CURRICULUM: "/admin/cookery-curriculum",
  COOKERY_SCHEDULE: "/admin/cookery-schedule",
  COOKERY_REVIEWS: "/admin/cookery-reviews",
  COOKERY_CERTIFICATES: "/admin/cookery-certificates",
  COOKERY_REPORTS: "/admin/cookery-reports",
  // Shero Classes
  SHERO_CLASSES_DASHBOARD: "/admin/shero-classes-dashboard",
  SHERO_CLASSES_INSTRUCTORS: "/admin/shero-classes-instructors",
  SHERO_CLASSES_CURRICULUM: "/admin/shero-classes-curriculum",
  SHERO_CLASSES_SCHEDULE: "/admin/shero-classes-schedule",
  SHERO_CLASSES_REVIEWS: "/admin/shero-classes-reviews",
  SHERO_CLASSES_CERTIFICATES: "/admin/shero-classes-certificates",
  SHERO_CLASSES_REPORTS: "/admin/shero-classes-reports",
  // Legacy
  CLASSES_DASHBOARD: "/admin/classes-dashboard",
  // Tech
  TECH_INTEGRATIONS: "/admin/tech-integrations",
  // People
  TRAINING_CONTENT: "/admin/training-content",
  // HR
  ATTENDANCE_LEAVE: "/admin/attendance-leave",
  // Broadcast (per-section communications)
  COMMAND_COMMS: "/admin/command-comms",
  FINANCE_COMMS: "/admin/finance-comms",
  INSTANT_COMMS: "/admin/instant-comms",
  PARTY_COMMS: "/admin/party-comms",
  SUB_COMMS: "/admin/sub-comms",
  SUPPORT_COMMS: "/admin/support-comms",
  PEOPLE_COMMS: "/admin/people-comms",
  TECH_COMMS: "/admin/tech-comms",
  HR_COMMS: "/admin/hr-comms",
  SNACKS_COMMS: "/admin/snacks-comms",
  COOKERY_COMMS: "/admin/cookery-comms",
  SHERO_CLASSES_COMMS: "/admin/shero-classes-comms",
  CLASSES_COMMS: "/admin/classes-comms",
} as const;

const ALL_SECTIONS = Object.values(SECTIONS);

// ── Full Permission Sets ──
const leadershipPermissions = (sections: string[]): SectionPermission[] =>
  sections.map(s => ({ section: s, level: "full" as PermissionLevel, dataScope: "all" as const }));

export const ADMIN_ROLES: AdminRoleConfig[] = [
  // ═══ LEADERSHIP TIER ═══
  {
    key: "super_admin",
    label: "Super Admin",
    description: "Full platform access — all controls, all data, all actions.",
    tier: "leadership",
    allowedSections: ALL_SECTIONS,
    permissions: leadershipPermissions(ALL_SECTIONS),
  },
  {
    key: "country_manager",
    label: "Country Head",
    description: "Owner of the country — chief of all business verticals, departments, and P&L across the country.",
    tier: "leadership",
    allowedSections: ALL_SECTIONS,
    permissions: leadershipPermissions(ALL_SECTIONS),
  },
  {
    key: "vertical_head",
    label: "Vertical Head",
    description: "Head of a business vertical (e.g. SAP & OPS). Owns the vertical's P&L and manages all managers under it. Dual-approval authority for uploads.",
    tier: "leadership",
    allowedSections: ALL_SECTIONS,
    permissions: leadershipPermissions(ALL_SECTIONS),
    reportsTo: ["country_manager"],
  },

  // ═══ MANAGER TIER ═══
  {
    key: "regional_manager",
    label: "Regional Manager",
    description: "P&L owner for the region (SHF + HCF). Can view metrics for their region's partners only.",
    tier: "manager",
    allowedSections: [SECTIONS.DASHBOARD, SECTIONS.PARTNERS, SECTIONS.ONBOARDING, SECTIONS.SAP_ONBOARDING, SECTIONS.ORDERS, SECTIONS.MENUS, SECTIONS.KITCHEN_CATEGORIES, SECTIONS.METRICS, SECTIONS.COMMUNICATIONS],
    permissions: [
      { section: SECTIONS.DASHBOARD, level: "view", dataScope: "all" },
      { section: SECTIONS.PARTNERS, level: "download", dataScope: "all" },
      { section: SECTIONS.ONBOARDING, level: "download", dataScope: "all" },
      { section: SECTIONS.SAP_ONBOARDING, level: "view", dataScope: "all" },
      { section: SECTIONS.ORDERS, level: "download", dataScope: "all" },
      { section: SECTIONS.MENUS, level: "view", dataScope: "all" },
      { section: SECTIONS.KITCHEN_CATEGORIES, level: "view", dataScope: "all" },
      { section: SECTIONS.METRICS, level: "view", dataScope: "all", notes: "Own region partners only" },
      { section: SECTIONS.COMMUNICATIONS, level: "view", dataScope: "all" },
    ],
    reportsTo: ["vertical_head"],
  },
  {
    key: "ops_manager",
    label: "Operations Manager",
    description: "Manages day-to-day operations including Order Management, SSC oversight, and Communications. Reports to Vertical Head.",
    tier: "manager",
    allowedSections: [SECTIONS.DASHBOARD, SECTIONS.ORDERS, SECTIONS.MANUAL_ORDER, SECTIONS.DELIVERY_ANALYTICS, SECTIONS.SSC, SECTIONS.COMMUNICATIONS, SECTIONS.METRICS],
    permissions: [
      { section: SECTIONS.DASHBOARD, level: "view", dataScope: "all" },
      { section: SECTIONS.ORDERS, level: "full", dataScope: "all" },
      { section: SECTIONS.MANUAL_ORDER, level: "full", dataScope: "all" },
      { section: SECTIONS.DELIVERY_ANALYTICS, level: "full", dataScope: "all" },
      { section: SECTIONS.SSC, level: "full", dataScope: "all" },
      { section: SECTIONS.COMMUNICATIONS, level: "full", dataScope: "all" },
      { section: SECTIONS.METRICS, level: "full", dataScope: "all" },
    ],
    reportsTo: ["vertical_head"],
  },
  {
    key: "onboarding_manager",
    label: "Onboarding Manager",
    description: "Approves SAP & HCF kitchens to go live. Same access level as Onboarding TL — can approve enrollments and download. Reports to Vertical Head.",
    tier: "manager",
    allowedSections: [SECTIONS.DASHBOARD, SECTIONS.PARTNERS, SECTIONS.ONBOARDING, SECTIONS.SAP_ONBOARDING],
    permissions: [
      { section: SECTIONS.DASHBOARD, level: "view", dataScope: "all" },
      { section: SECTIONS.PARTNERS, level: "approve", dataScope: "all", notes: "Approve enrollments, download licenses, renewal details, kitchen stats" },
      { section: SECTIONS.ONBOARDING, level: "approve", dataScope: "all" },
      { section: SECTIONS.SAP_ONBOARDING, level: "view", dataScope: "all" },
    ],
    reportsTo: ["vertical_head"],
  },
  {
    key: "finance_manager",
    label: "Finance Manager",
    description: "Manages all partner payments, reconciliation, penalties, and weekly bulk payouts. Reports to Vertical Head.",
    tier: "manager",
    allowedSections: [SECTIONS.DASHBOARD, SECTIONS.PPP, SECTIONS.PARTY_FINANCE],
    permissions: [
      { section: SECTIONS.DASHBOARD, level: "view", dataScope: "all" },
      { section: SECTIONS.PPP, level: "full", dataScope: "all" },
      { section: SECTIONS.PARTY_FINANCE, level: "download", dataScope: "all", notes: "View and download party finance reports" },
    ],
    reportsTo: ["vertical_head"],
  },
  {
    key: "hr_manager",
    label: "HR Manager",
    description: "Manages Team Management segment — hiring, team changes, hierarchy. Reports directly to Country Head.",
    tier: "manager",
    allowedSections: [SECTIONS.DASHBOARD, SECTIONS.TEAM, "/admin/pms", "/admin/hr-policies"],
    permissions: [
      { section: SECTIONS.DASHBOARD, level: "view", dataScope: "all" },
      { section: SECTIONS.TEAM, level: "full", dataScope: "all" },
      { section: "/admin/pms", level: "full", dataScope: "all" },
      { section: "/admin/hr-policies", level: "full", dataScope: "all" },
    ],
    reportsTo: ["country_manager"],
  },
  {
    key: "shf_manager",
    label: "SHF Cuisine Manager",
    description: "Manages Branded (Shero Home Food) kitchens for assigned cuisines. Can view own-cuisine metrics only.",
    tier: "manager",
    allowedSections: [SECTIONS.DASHBOARD, SECTIONS.PARTNERS, SECTIONS.ORDERS, SECTIONS.METRICS, SECTIONS.COMMUNICATIONS],
    permissions: [
      { section: SECTIONS.DASHBOARD, level: "view", dataScope: "all" },
      { section: SECTIONS.PARTNERS, level: "download", dataScope: "all" },
      { section: SECTIONS.ORDERS, level: "download", dataScope: "all" },
      { section: SECTIONS.METRICS, level: "view", dataScope: "all", notes: "Own cuisine partners only" },
      { section: SECTIONS.COMMUNICATIONS, level: "view", dataScope: "all" },
    ],
    reportsTo: ["regional_manager"],
  },
  {
    key: "hcf_manager",
    label: "HCF Manager",
    description: "Manages unbranded Home Chef kitchens in the cluster.",
    tier: "manager",
    allowedSections: [SECTIONS.DASHBOARD, SECTIONS.PARTNERS, SECTIONS.ORDERS, SECTIONS.COMMUNICATIONS],
    permissions: [
      { section: SECTIONS.DASHBOARD, level: "view", dataScope: "all" },
      { section: SECTIONS.PARTNERS, level: "download", dataScope: "all" },
      { section: SECTIONS.ORDERS, level: "download", dataScope: "all" },
      { section: SECTIONS.COMMUNICATIONS, level: "view", dataScope: "all" },
    ],
    reportsTo: ["regional_manager"],
  },
  {
    key: "spc_manager",
    label: "SPC Manager",
    description: "Shero Partner Centre Manager. Owns partner relationship, grievance, welfare, and Friend-to-Partner system. Reports directly to Vertical Head.",
    tier: "manager",
    allowedSections: [SECTIONS.DASHBOARD, SECTIONS.SPC],
    permissions: [
      { section: SECTIONS.DASHBOARD, level: "view", dataScope: "all" },
      { section: SECTIONS.SPC, level: "full", dataScope: "all" },
    ],
    reportsTo: ["vertical_head"],
  },
  {
    key: "ssc_manager",
    label: "SSC Manager",
    description: "Shero Support Center Manager. Manages the SSC vertical including call center operations. Reports to Vertical Head.",
    tier: "manager",
    allowedSections: [SECTIONS.DASHBOARD, SECTIONS.SSC],
    permissions: [
      { section: SECTIONS.DASHBOARD, level: "view", dataScope: "all" },
      { section: SECTIONS.SSC, level: "full", dataScope: "all" },
    ],
    reportsTo: ["vertical_head"],
  },
  {
    key: "party_manager",
    label: "Party Order Manager",
    description: "Manages the entire Party Orders vertical — menus, pricing, allocations, reports. Can upload menus, change prices (dual approval with VH). Reports to Vertical Head.",
    tier: "manager",
    allowedSections: [SECTIONS.DASHBOARD, SECTIONS.PARTY_ORDERS, SECTIONS.PARTY_MENUS, SECTIONS.PARTY_ALLOCATIONS, SECTIONS.PARTY_LEADS, SECTIONS.PARTY_DISCOUNTS, SECTIONS.PARTY_REPORTS, SECTIONS.PARTY_FINANCE],
    permissions: [
      { section: SECTIONS.DASHBOARD, level: "view", dataScope: "all" },
      { section: SECTIONS.PARTY_ORDERS, level: "full", dataScope: "all" },
      { section: SECTIONS.PARTY_MENUS, level: "upload", dataScope: "all", notes: "Upload menus, change prices — dual approval with VH" },
      { section: SECTIONS.PARTY_ALLOCATIONS, level: "full", dataScope: "all" },
      { section: SECTIONS.PARTY_LEADS, level: "full", dataScope: "all" },
      { section: SECTIONS.PARTY_DISCOUNTS, level: "full", dataScope: "all" },
      { section: SECTIONS.PARTY_REPORTS, level: "full", dataScope: "all" },
      { section: SECTIONS.PARTY_FINANCE, level: "full", dataScope: "all", notes: "Full access to party finance — sales, expenditure, CM analysis" },
    ],
    reportsTo: ["vertical_head"],
  },

  // ═══ TEAM LEADER TIER ═══
  {
    key: "kobtl",
    label: "Onboarding TL",
    description: "Kitchen Onboarding Team Lead. Approves enrollments, downloads licenses, renewal details, kitchen statistics. Reports to Onboarding Manager.",
    tier: "team_leader",
    allowedSections: [SECTIONS.DASHBOARD, SECTIONS.PARTNERS, SECTIONS.ONBOARDING],
    permissions: [
      { section: SECTIONS.DASHBOARD, level: "view", dataScope: "all" },
      { section: SECTIONS.PARTNERS, level: "approve", dataScope: "all", notes: "Approve enrollments, download licenses, renewal details, kitchen stats" },
      { section: SECTIONS.ONBOARDING, level: "approve", dataScope: "all" },
    ],
    reportsTo: ["onboarding_manager"],
  },
  {
    key: "sap_onboarding_tl",
    label: "SAP Onboarding TL",
    description: "SAP Onboarding Team Lead. Full monitor and manage access to SAP onboarding. Reports to Onboarding Manager.",
    tier: "team_leader",
    allowedSections: [SECTIONS.DASHBOARD, SECTIONS.SAP_ONBOARDING],
    permissions: [
      { section: SECTIONS.DASHBOARD, level: "view", dataScope: "all" },
      { section: SECTIONS.SAP_ONBOARDING, level: "full", dataScope: "all" },
    ],
    reportsTo: ["onboarding_manager"],
  },
  {
    key: "spc_tl",
    label: "SPC Team Lead",
    description: "SPC Team Lead. Reviews partner welfare cases and SPC reports. Reports to Vertical Head.",
    tier: "team_leader",
    allowedSections: [SECTIONS.DASHBOARD, SECTIONS.SPC],
    permissions: [
      { section: SECTIONS.DASHBOARD, level: "view", dataScope: "all" },
      { section: SECTIONS.SPC, level: "view", dataScope: "all", notes: "Review access only, reports to VH" },
    ],
    reportsTo: ["spc_manager"],
  },
  {
    key: "ssc_tl",
    label: "SSC Team Lead",
    description: "SSC Team Lead. Views all SSC areas limited to 1 month of data. Cannot approve or upload. Reports to Ops Manager.",
    tier: "team_leader",
    allowedSections: [SECTIONS.DASHBOARD, SECTIONS.SSC],
    permissions: [
      { section: SECTIONS.DASHBOARD, level: "view", dataScope: "all" },
      { section: SECTIONS.SSC, level: "view", dataScope: "one_month", notes: "View only, 1 month data window" },
    ],
    reportsTo: ["ops_manager"],
  },
  {
    key: "ppp_tl",
    label: "PPP Team Lead",
    description: "Triple P Team Lead. Views payment data, downloads reports. Cannot approve payouts or upload. Reports to Finance Manager.",
    tier: "team_leader",
    allowedSections: [SECTIONS.DASHBOARD, SECTIONS.PPP],
    permissions: [
      { section: SECTIONS.DASHBOARD, level: "view", dataScope: "all" },
      { section: SECTIONS.PPP, level: "download", dataScope: "all", notes: "View and download only, no approvals" },
    ],
    reportsTo: ["finance_manager"],
  },
  {
    key: "party_tl",
    label: "Party Order TL",
    description: "Party Order Team Lead. Views all party sections and downloads reports. Cannot upload menus, change prices, or approve. Reports to Party Manager.",
    tier: "team_leader",
    allowedSections: [SECTIONS.DASHBOARD, SECTIONS.PARTY_ORDERS, SECTIONS.PARTY_MENUS, SECTIONS.PARTY_ALLOCATIONS, SECTIONS.PARTY_LEADS, SECTIONS.PARTY_REPORTS],
    permissions: [
      { section: SECTIONS.DASHBOARD, level: "view", dataScope: "all" },
      { section: SECTIONS.PARTY_ORDERS, level: "download", dataScope: "all" },
      { section: SECTIONS.PARTY_MENUS, level: "view", dataScope: "all", notes: "View only — cannot upload or change prices" },
      { section: SECTIONS.PARTY_ALLOCATIONS, level: "download", dataScope: "all" },
      { section: SECTIONS.PARTY_LEADS, level: "download", dataScope: "all" },
      { section: SECTIONS.PARTY_REPORTS, level: "download", dataScope: "all" },
    ],
    reportsTo: ["party_manager"],
  },

  // ═══ EXECUTIVE TIER ═══
  {
    key: "kob_executive",
    label: "KOB Executive",
    description: "Kitchen Onboarding Executive. No access to Partner Management. Reports to Onboarding TL.",
    tier: "executive",
    allowedSections: [SECTIONS.DASHBOARD],
    permissions: [
      { section: SECTIONS.DASHBOARD, level: "view_limited", dataScope: "one_week" },
    ],
    reportsTo: ["kobtl"],
  },
  {
    key: "ssc_executor",
    label: "SSC Executor",
    description: "Shero Support Center Executor. Agent Console only — lookup by RMN or order number for read-only access. Reports to SSC TL.",
    tier: "executive",
    allowedSections: [SECTIONS.DASHBOARD, SECTIONS.SSC],
    permissions: [
      { section: SECTIONS.DASHBOARD, level: "view_limited", dataScope: "one_week" },
      { section: SECTIONS.SSC, level: "view_limited", dataScope: "one_week", notes: "Agent Console only — lookup by RMN or order ID, read-only" },
    ],
    reportsTo: ["ssc_tl"],
  },
  {
    key: "ppp_executor",
    label: "PPP Executor",
    description: "Triple P Executor. View current day + 1 week backdated payment data. No reports or analytics. Reports to PPP TL.",
    tier: "executive",
    allowedSections: [SECTIONS.DASHBOARD, SECTIONS.PPP],
    permissions: [
      { section: SECTIONS.DASHBOARD, level: "view_limited", dataScope: "one_week" },
      { section: SECTIONS.PPP, level: "view_limited", dataScope: "one_week", notes: "View only — no reports, no analytics" },
    ],
    reportsTo: ["ppp_tl"],
  },
  {
    key: "party_executive",
    label: "Party Order Executive",
    description: "Party Order Executive. Access to Order Management (party-allocations) only. View current day + 1 week backdated. Reports to Party TL.",
    tier: "executive",
    allowedSections: [SECTIONS.DASHBOARD, SECTIONS.PARTY_ALLOCATIONS],
    permissions: [
      { section: SECTIONS.DASHBOARD, level: "view_limited", dataScope: "one_week" },
      { section: SECTIONS.PARTY_ALLOCATIONS, level: "view_limited", dataScope: "one_week", notes: "Order Management only — view current + 1 week" },
    ],
    reportsTo: ["party_tl"],
  },
  {
    key: "asst_manager",
    label: "Assistant Manager",
    description: "Supports SHF or HCF Manager with day-to-day operations. View limited data.",
    tier: "executive",
    allowedSections: [SECTIONS.DASHBOARD, SECTIONS.PARTNERS],
    permissions: [
      { section: SECTIONS.DASHBOARD, level: "view_limited", dataScope: "one_week" },
      { section: SECTIONS.PARTNERS, level: "view_limited", dataScope: "one_week" },
    ],
    reportsTo: ["shf_manager", "hcf_manager"],
  },
];

export interface AdminAccount {
  rem: string;
  password: string;
  role: AdminRole;
  name: string;
}

export const MOCK_ADMIN_ACCOUNTS: AdminAccount[] = [
  { rem: "superadmin@shero.in", password: "admin123", role: "super_admin", name: "System Admin" },
  { rem: "country@shero.in", password: "admin123", role: "country_manager", name: "Arvind S." },
  { rem: "sapops@shero.in", password: "admin123", role: "vertical_head", name: "Kavitha R." },
  { rem: "regional@shero.in", password: "admin123", role: "regional_manager", name: "David M." },
  { rem: "ops-mgr@shero.in", password: "admin123", role: "ops_manager", name: "Steven V." },
  { rem: "onboarding@shero.in", password: "admin123", role: "onboarding_manager", name: "Meera R." },
  { rem: "finance-mgr@shero.in", password: "admin123", role: "finance_manager", name: "Ganesh R." },
  { rem: "hr-mgr@shero.in", password: "admin123", role: "hr_manager", name: "Revathi S." },
  { rem: "kobtl@shero.in", password: "admin123", role: "kobtl", name: "Divya N." },
  { rem: "sap-tl@shero.in", password: "admin123", role: "sap_onboarding_tl", name: "Karthik M." },
  { rem: "shf@shero.in", password: "admin123", role: "shf_manager", name: "Nicole P." },
  { rem: "hcf@shero.in", password: "admin123", role: "hcf_manager", name: "Patricia J." },
  { rem: "spc-mgr@shero.in", password: "admin123", role: "spc_manager", name: "Vasanthi K." },
  { rem: "spc-tl@shero.in", password: "admin123", role: "spc_tl", name: "Yamini R." },
  { rem: "ssc-mgr@shero.in", password: "admin123", role: "ssc_manager", name: "Rachel M." },
  { rem: "ssc-tl@shero.in", password: "admin123", role: "ssc_tl", name: "Anitha S." },
  { rem: "ssc-exec@shero.in", password: "admin123", role: "ssc_executor", name: "Preethi V." },
  { rem: "kob-exec@shero.in", password: "admin123", role: "kob_executive", name: "Swathi R." },
  { rem: "kob-exec2@shero.in", password: "admin123", role: "kob_executive", name: "Lakshmi T." },
  { rem: "ppp-tl@shero.in", password: "admin123", role: "ppp_tl", name: "Vijay K." },
  { rem: "ppp-exec@shero.in", password: "admin123", role: "ppp_executor", name: "Sudha M." },
  { rem: "party-mgr@shero.in", password: "admin123", role: "party_manager", name: "Bharathi S." },
  { rem: "party-tl@shero.in", password: "admin123", role: "party_tl", name: "Senthil K." },
  { rem: "party-exec@shero.in", password: "admin123", role: "party_executive", name: "Vani R." },
  { rem: "asst@shero.in", password: "admin123", role: "asst_manager", name: "Steven K." },
  { rem: "asst2@shero.in", password: "admin123", role: "asst_manager", name: "Ramya V." },
];

export function getAdminRole(): AdminRole | null {
  const storedRole = localStorage.getItem("shero-admin-role");
  if (storedRole === "admin") return "super_admin";
  return ADMIN_ROLES.some((role) => role.key === storedRole) ? (storedRole as AdminRole) : null;
}

export function getRoleConfig(role: AdminRole): AdminRoleConfig | undefined {
  return ADMIN_ROLES.find((r) => r.key === role);
}

export function hasAccess(role: AdminRole, section: string): boolean {
  const config = getRoleConfig(role);
  if (!config) return false;
  // Broadcast pages (-comms) are accessible if the role has access to ANY section in the same group
  if (section.endsWith("-comms")) return true;
  if (section === SECTIONS.KITCHEN_CATEGORIES) {
    return config.allowedSections.includes(SECTIONS.KITCHEN_CATEGORIES) || config.allowedSections.includes(SECTIONS.MENUS);
  }
  return config.allowedSections.includes(section);
}

// ── Reporting Hierarchy ──
export interface ReportingNode {
  role: AdminRole;
  label: string;
  reportsTo: AdminRole | null;
  unit: string;
}

export const REPORTING_HIERARCHY: ReportingNode[] = [
  { role: "super_admin", label: "Super Admin", reportsTo: null, unit: "Platform" },
  { role: "country_manager", label: "Country Head", reportsTo: "super_admin", unit: "Country" },
  { role: "vertical_head", label: "Vertical Head (SAP & OPS)", reportsTo: "country_manager", unit: "SAP & OPS" },
  { role: "hr_manager", label: "HR Manager", reportsTo: "country_manager", unit: "HR" },
  { role: "regional_manager", label: "Regional Manager", reportsTo: "vertical_head", unit: "Regional Ops" },
  { role: "ops_manager", label: "Operations Manager", reportsTo: "vertical_head", unit: "Operations" },
  { role: "onboarding_manager", label: "Onboarding Manager", reportsTo: "vertical_head", unit: "Onboarding" },
  { role: "finance_manager", label: "Finance Manager", reportsTo: "vertical_head", unit: "Finance (PPP)" },
  { role: "spc_manager", label: "SPC Manager", reportsTo: "vertical_head", unit: "SPC" },
  { role: "ssc_manager", label: "SSC Manager", reportsTo: "vertical_head", unit: "SSC" },
  { role: "party_manager", label: "Party Order Manager", reportsTo: "vertical_head", unit: "Party Orders" },
  { role: "kobtl", label: "Onboarding TL", reportsTo: "onboarding_manager", unit: "Onboarding" },
  { role: "sap_onboarding_tl", label: "SAP Onboarding TL", reportsTo: "onboarding_manager", unit: "SAP Onboarding" },
  { role: "ssc_tl", label: "SSC TL", reportsTo: "ops_manager", unit: "SSC" },
  { role: "spc_tl", label: "SPC TL", reportsTo: "spc_manager", unit: "SPC" },
  { role: "ppp_tl", label: "PPP TL", reportsTo: "finance_manager", unit: "Finance (PPP)" },
  { role: "party_tl", label: "Party Order TL", reportsTo: "party_manager", unit: "Party Orders" },
  { role: "shf_manager", label: "SHF Cuisine Manager", reportsTo: "regional_manager", unit: "SHF" },
  { role: "hcf_manager", label: "HCF Manager", reportsTo: "regional_manager", unit: "HCF" },
  { role: "kob_executive", label: "KOB Executive", reportsTo: "kobtl", unit: "Onboarding" },
  { role: "ssc_executor", label: "SSC Executor", reportsTo: "ssc_tl", unit: "SSC" },
  { role: "ppp_executor", label: "PPP Executor", reportsTo: "ppp_tl", unit: "Finance (PPP)" },
  { role: "party_executive", label: "Party Order Exec", reportsTo: "party_tl", unit: "Party Orders" },
  { role: "asst_manager", label: "Assistant Manager", reportsTo: "shf_manager", unit: "SHF/HCF" },
];
