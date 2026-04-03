import { useState } from "react";
import { LayoutDashboard, ChefHat, UtensilsCrossed, ClipboardList, LogOut, Shield, BarChart3, Users, DollarSign, Headphones, Radio, Gauge, Heart, PartyPopper, UserPlus, Store, FileBarChart, BadgePercent, Briefcase, Wallet, CalendarCheck, Settings, Target, Bike, Wrench, PieChart, MapPin, MessageSquare, Bot, Phone, Star, FileEdit, TicketCheck, BookOpen, GraduationCap, Plug, CreditCard, Truck, ChevronRight, UserCog, Megaphone, Cookie, Sparkles, Package, Calendar } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import sheroLogo from "@/assets/shero-logo.png";
import { getAdminRole, getRoleConfig, hasAccess } from "@/data/adminRoles";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

// ═══════════════════════════════════════════════════════════════
// Navigation Groups — Organized by Role-Permission Relevance
// Leadership → Management → Operations → Support → Growth
// ═══════════════════════════════════════════════════════════════

// 1. COMMAND — Leadership & Management (L1-L3)
const commandItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Master Communications", url: "/admin/master-comms", icon: Megaphone },
  { title: "Financial Reports", url: "/admin/financial-reports", icon: PieChart },
  { title: "Business Metrics", url: "/admin/business-metrics", icon: Gauge },
  { title: "Consolidated Reports", url: "/admin/reports", icon: FileBarChart },
  { title: "Broadcast", url: "/admin/command-comms", icon: Radio },
];

// 2. FINANCE — Finance Managers & Leadership
const financeItems = [
  { title: "Finance Dashboard", url: "/admin/finance-dashboard", icon: PieChart },
  { title: "Invoice Settings", url: "/admin/invoice-settings", icon: FileBarChart },
  { title: "Instant Order", url: "/admin/payments", icon: DollarSign },
  { title: "Instant Delivery", url: "/admin/instant-finance", icon: Bike },
  { title: "Subscriptions", url: "/admin/sub-finance", icon: CalendarCheck },
  { title: "Party Orders", url: "/admin/party-finance", icon: PartyPopper },
  // Sweets & Snacks, Cookery Classes, Shero Classes — disabled for now
  { title: "Home Services", url: "/admin/services-finance", icon: Wrench },
  { title: "Broadcast", url: "/admin/finance-comms", icon: Megaphone },
];

// 3. INSTANT DELIVERY — Ops Managers, TLs, Executives
const instantItems = [
  { title: "Dashboard", url: "/admin/delivery-analytics", icon: LayoutDashboard },
  { title: "Order Management", url: "/admin/orders", icon: ClipboardList },
  { title: "Kitchen & Categories", url: "/admin/kitchen-categories", icon: Store },
  { title: "Menu Management", url: "/admin/menus", icon: UtensilsCrossed },
  { title: "Metrics & SCV", url: "/admin/metrics", icon: Gauge },
  { title: "Offers & Promotions", url: "/admin/promotions", icon: BadgePercent },
  { title: "Broadcast", url: "/admin/instant-comms", icon: Megaphone },
];

// 4. PARTY ORDERS — Party Managers, TLs, Executives
const partyItems = [
  { title: "Order Management", url: "/admin/party-orders", icon: ClipboardList },
  { title: "Menu Management", url: "/admin/party-menus", icon: UtensilsCrossed },
  { title: "Leads", url: "/admin/party-leads", icon: Users },
  { title: "Offers & Promotions", url: "/admin/promotions", icon: BadgePercent },
  { title: "Reports", url: "/admin/party-reports", icon: FileBarChart },
  { title: "Broadcast", url: "/admin/party-comms", icon: Megaphone },
];

// 5. SUBSCRIPTIONS — Sub Managers, TLs, Executives
const subscriptionItems = [
  { title: "Dashboard", url: "/admin/subscriptions", icon: LayoutDashboard },
  { title: "Orders", url: "/admin/sub-orders", icon: ClipboardList },
  { title: "Menu & Plans", url: "/admin/sub-menu-plans", icon: UtensilsCrossed },
  { title: "Operations", url: "/admin/sub-operations", icon: Settings },
  { title: "Leads", url: "/admin/sub-leads", icon: Target },
  { title: "Offers & Promotions", url: "/admin/promotions", icon: BadgePercent },
  { title: "Reports", url: "/admin/sub-reports", icon: FileBarChart },
  { title: "Broadcast", url: "/admin/sub-comms", icon: Megaphone },
];

// 6. SUPPORT CENTRE — SSC Managers, TLs, Executors + General Ops + AI
const supportItems = [
  { title: "Live Order Support", url: "/admin/live-support", icon: Phone },
  { title: "Location & Pickup", url: "/admin/location-support", icon: MapPin },
  { title: "Order Modifications", url: "/admin/order-modifications", icon: FileEdit },
  { title: "Customer Feedback", url: "/admin/customer-feedback", icon: Star },
  { title: "Agent Console", url: "/admin/tickets", icon: Headphones },
  { title: "Debits & Credits", url: "/admin/debit-credit", icon: BookOpen },
  { title: "Partner Amendments", url: "/admin/partner-amendments", icon: ClipboardList },
  { title: "Internal Tickets", url: "/admin/team-tickets", icon: TicketCheck },
  { title: "Partner Queries", url: "/admin/partner-queries", icon: MessageSquare },
  { title: "AI Control Tower", url: "/admin/ai-tower", icon: Bot },
  { title: "Chatbot Fleet", url: "/admin/chatbot", icon: MessageSquare },
  { title: "Broadcast", url: "/admin/support-comms", icon: Megaphone },
];

// 7. PARTNER & KITCHEN ONBOARDING — HR, Onboarding Managers, TLs
const peopleItems = [
  { title: "Partner Management", url: "/admin/partners", icon: ChefHat },
  { title: "SAP Onboarding", url: "/admin/sap-onboarding", icon: Store },
  { title: "SPC Management", url: "/admin/spc", icon: Heart },
  { title: "Training Content", url: "/admin/training-content", icon: BookOpen },
  { title: "Broadcast", url: "/admin/people-comms", icon: Megaphone },
];

// 8. TECH MANAGEMENT — Leadership & Tech Managers
const techItems = [
  { title: "Control Centre", url: "/admin/tech-dashboard", icon: LayoutDashboard },
  { title: "Screen Communications", url: "/admin/screen-comms", icon: MessageSquare },
  { title: "Integrations", url: "/admin/tech-integrations", icon: Plug },
  { title: "Payment Gateway", url: "/admin/payment-gateway", icon: CreditCard },
  { title: "Delivery Management", url: "/admin/delivery-mgmt", icon: Truck },
  { title: "API Connections", url: "/admin/api-connections", icon: Plug },
  { title: "Broadcast", url: "/admin/tech-comms", icon: Megaphone },
];

// 9. HR MANAGEMENT — HR Managers & Leadership
const hrItems = [
  { title: "Team Management", url: "/admin/team", icon: Users },
  { title: "Performance (PMS)", url: "/admin/pms", icon: Target },
  { title: "HR Policies & Handbook", url: "/admin/hr-policies", icon: BookOpen },
  { title: "Attendance & Leave", url: "/admin/attendance-leave", icon: CalendarCheck },
  { title: "Broadcast", url: "/admin/hr-comms", icon: Megaphone },
];

// 10. SWEETS & SNACKS — Product vertical
const snacksItems = [
  { title: "Dashboard & Orders", url: "/admin/snacks-dashboard", icon: LayoutDashboard },
  { title: "Product Catalog", url: "/admin/snacks-catalog", icon: Package },
  { title: "Inventory & Pricing", url: "/admin/snacks-inventory", icon: DollarSign },
  { title: "Partner Performance", url: "/admin/snacks-partners", icon: ChefHat },
  { title: "Discounts & Promos", url: "/admin/snacks-discounts", icon: BadgePercent },
  { title: "Reports", url: "/admin/snacks-reports", icon: FileBarChart },
  { title: "Broadcast", url: "/admin/snacks-comms", icon: Megaphone },
];

// 11. COOKERY CLASSES — Cooking education vertical
const cookeryClassesItems = [
  { title: "Dashboard & Bookings", url: "/admin/cookery-dashboard", icon: LayoutDashboard },
  { title: "Instructor Management", url: "/admin/cookery-instructors", icon: GraduationCap },
  { title: "Curriculum & Content", url: "/admin/cookery-curriculum", icon: BookOpen },
  { title: "Schedule Calendar", url: "/admin/cookery-schedule", icon: Calendar },
  { title: "Reviews & Ratings", url: "/admin/cookery-reviews", icon: Star },
  { title: "Certificates", url: "/admin/cookery-certificates", icon: FileBarChart },
  { title: "Reports", url: "/admin/cookery-reports", icon: FileBarChart },
  { title: "Broadcast", url: "/admin/cookery-comms", icon: Megaphone },
];

// 12. SHERO CLASSES — Yoga, wellness & lifestyle classes
const sheroClassesItems = [
  { title: "Dashboard & Bookings", url: "/admin/shero-classes-dashboard", icon: LayoutDashboard },
  { title: "Instructor Management", url: "/admin/shero-classes-instructors", icon: GraduationCap },
  { title: "Curriculum & Content", url: "/admin/shero-classes-curriculum", icon: BookOpen },
  { title: "Schedule Calendar", url: "/admin/shero-classes-schedule", icon: Calendar },
  { title: "Reviews & Ratings", url: "/admin/shero-classes-reviews", icon: Star },
  { title: "Certificates", url: "/admin/shero-classes-certificates", icon: FileBarChart },
  { title: "Reports", url: "/admin/shero-classes-reports", icon: FileBarChart },
  { title: "Broadcast", url: "/admin/shero-classes-comms", icon: Megaphone },
];

// ═══════════════════════════════════════════════════════════════

interface NavSection {
  label: string;
  icon: typeof LayoutDashboard;
  items: { title: string; url: string; icon: typeof LayoutDashboard }[];
  color: string; // tailwind section color token
}

// 13. WALLET & REFERRALS — Growth & Retention
const walletItems = [
  { title: "Wallet & Referral Settings", url: "/admin/wallet-referrals", icon: Wallet },
];

const sections: NavSection[] = [
  { label: "Command", icon: Shield, items: commandItems, color: "section-command" },
  { label: "Finance Books", icon: Wallet, items: financeItems, color: "section-finance" },
  { label: "Instant Delivery", icon: Bike, items: instantItems, color: "section-instant" },
  { label: "Party Orders", icon: PartyPopper, items: partyItems, color: "section-party" },
  { label: "Subscriptions", icon: CalendarCheck, items: subscriptionItems, color: "section-subscription" },
  // Sweets & Snacks, Cookery Classes, Shero Classes — disabled for now
  { label: "Support Centre", icon: Phone, items: supportItems, color: "section-support" },
  { label: "Partner & Kitchen Onboarding", icon: GraduationCap, items: peopleItems, color: "section-people" },
  { label: "Tech Management", icon: Plug, items: techItems, color: "section-tech" },
  { label: "HR Management", icon: UserCog, items: hrItems, color: "section-hr" },
  { label: "Wallet & Referrals", icon: Wallet, items: walletItems, color: "section-command" },
];

// Section color CSS variable mapping
const sectionCssVar: Record<string, string> = {
  "section-command": "var(--section-command)",
  "section-finance": "var(--section-finance)",
  "section-instant": "var(--section-instant)",
  "section-party": "var(--section-party)",
  "section-subscription": "var(--section-subscription)",
  "section-snacks": "var(--section-party)",
  "section-cookery": "var(--section-subscription)",
  "section-shero": "var(--section-people)",
  "section-support": "var(--section-support)",
  "section-people": "var(--section-people)",
  "section-tech": "var(--section-tech)",
  "section-hr": "var(--section-hr)",
};

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const role = getAdminRole();
  const roleConfig = role ? getRoleConfig(role) : null;
  const location = useLocation();
  const currentPath = location.pathname;

  const handleLogout = () => {
    localStorage.removeItem("shero-admin");
    localStorage.removeItem("shero-admin-role");
    localStorage.removeItem("shero-admin-rem");
    localStorage.removeItem("shero-admin-name");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent>
        {/* Logo & Role Badge */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-4">
            <Link to="/admin" className="flex items-center gap-2">
              <img src={sheroLogo} alt="Shero" className="h-7" />
              {!collapsed && (
                <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <Shield className="w-3 h-3" /> Admin
                </span>
              )}
            </Link>
          </SidebarGroupLabel>
          {!collapsed && roleConfig && (
            <div className="px-3 pb-2 space-y-0.5">
              <span className="inline-block text-[10px] font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-0.5">
                {roleConfig.label}
              </span>
              <span className="block text-[9px] text-muted-foreground capitalize">
                {roleConfig.tier === "leadership" ? "🔑 Leadership" : roleConfig.tier === "manager" ? "👔 Manager" : roleConfig.tier === "team_leader" ? "📋 Team Leader" : "👤 Executive"}
              </span>
            </div>
          )}
        </SidebarGroup>

        {/* Dynamic Sections */}
        {sections.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !role || hasAccess(role, item.url)
          );
          if (visibleItems.length === 0) return null;
          const SectionIcon = section.icon;
          const hslColor = `hsl(${sectionCssVar[section.color] || "var(--primary)"})`;
          const isActiveSection = visibleItems.some(
            (item) => currentPath === item.url || (item.url !== "/admin" && currentPath.startsWith(item.url))
          );

          return (
            <Collapsible key={section.label} defaultOpen={isActiveSection} className="group/collapsible">
              <SidebarGroup className="relative py-0">
                {/* Colored left accent bar */}
                {!collapsed && (
                  <div
                    className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full transition-opacity"
                    style={{ backgroundColor: hslColor, opacity: isActiveSection ? 1 : 0.4 }}
                  />
                )}
                {!collapsed ? (
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel
                      className="text-[10px] uppercase tracking-wider px-3 flex items-center gap-1.5 font-bold cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ color: hslColor }}
                    >
                      <SectionIcon className="w-3.5 h-3.5" />
                      <span className="flex-1">{section.label}</span>
                      <ChevronRight className="w-3 h-3 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>
                ) : (
                  <div className="py-1" />
                )}
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {visibleItems.map((item) => (
                        <SidebarMenuItem key={item.title + item.url}>
                          <SidebarMenuButton asChild>
                            <NavLink
                              to={item.url}
                              end={item.url === "/admin"}
                              className="hover:bg-sidebar-accent/50"
                              activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                            >
                              <item.icon className="mr-2 h-4 w-4" style={{ color: hslColor }} />
                              {!collapsed && <span>{item.title}</span>}
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/admin/login" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
                <LogOut className="mr-2 h-4 w-4" />
                {!collapsed && <span>Logout</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
