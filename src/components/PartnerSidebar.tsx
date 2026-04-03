import { LayoutDashboard, ClipboardList, UtensilsCrossed, LogOut, Gift, FileSpreadsheet, Package, Globe, Clock, CalendarCheck, FileBarChart, Lightbulb, MessageCircle, Heart, PartyPopper, GraduationCap, CreditCard, DollarSign, Cookie, Sparkles, Award } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { partnerType } from "@/data/partnerMockData";
import sheroLogo from "@/assets/shero-logo.png";
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

const operationsItems = [
  { title: "Dashboard", url: "/partner", icon: LayoutDashboard },
  { title: "Orders", url: "/partner/orders", icon: ClipboardList },
  { title: "Party Orders", url: "/partner/party-orders", icon: PartyPopper },
  { title: "Visiting Card", url: "/partner/visiting-card", icon: CreditCard },
  { title: "Referrals", url: "/partner/referrals", icon: Gift },
  { title: "Finance Reports", url: "/partner/reports", icon: FileBarChart },
  { title: "Performance Report - SCV", url: "/partner/performance-scv", icon: Award },
];

const getProductItems = (isBranded: boolean) => {
  const items = [
    { title: "Menu Management", url: "/partner/menu", icon: UtensilsCrossed },
    { title: "Kitchens", url: "/partner/cuisines", icon: Globe },
  ];
  // Branded partners don't get bulk upload — menu is centrally managed
  if (!isBranded) {
    items.push({ title: "Bulk Upload", url: "/partner/bulk-upload", icon: FileSpreadsheet });
  }
  return items;
};

const kitchenTimingItems = [
  { title: "Schedule", url: "/partner/kitchen-schedule", icon: Clock },
  { title: "Attendance", url: "/partner/kitchen-attendance", icon: CalendarCheck },
];

const snacksItems = [
  { title: "Snack Orders", url: "/partner/snacks-orders", icon: ClipboardList },
  { title: "My Products", url: "/partner/snacks-products", icon: Package },
];

const cookeryClassesPartnerItems = [
  { title: "My Cookery Classes", url: "/partner/cookery-classes", icon: UtensilsCrossed },
];

const sheroClassesPartnerItems = [
  { title: "My Shero Classes", url: "/partner/shero-classes", icon: Sparkles },
];

const engagementItems = [
  { title: "Training", url: "/partner/training", icon: GraduationCap },
  { title: "How Much You Can Earn", url: "/partner/income", icon: DollarSign },
  { title: "Tips to Earn More", url: "/partner/tips", icon: Lightbulb },
  { title: "Messages from Shero", url: "/partner/messages", icon: MessageCircle },
  { title: "Partner Centre", url: "/partner/spc", icon: Heart },
];

export function PartnerSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const isBranded = partnerType === "branded";
  const productItems = getProductItems(isBranded);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Logo */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-4">
            <Link to="/partner" className="flex items-center gap-2">
              <img src={sheroLogo} alt="Shero" className="h-7" />
              {!collapsed && <span className="text-xs font-semibold text-muted-foreground">Partner</span>}
            </Link>
          </SidebarGroupLabel>
        </SidebarGroup>

        {/* Operations */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60 px-3">
              Operations
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {operationsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/partner"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Product Management */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60 px-3 flex items-center gap-1.5">
              <Package className="w-3 h-3" />
              Product Management
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {productItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sweets & Snacks, Cookery Classes, Shero Classes — disabled for now */}

        {/* Kitchen Timing */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60 px-3 flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Kitchen Timing
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {kitchenTimingItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Engagement */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60 px-3 flex items-center gap-1.5">
              <Lightbulb className="w-3 h-3" />
              Engagement
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {engagementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/" className="text-muted-foreground hover:text-foreground">
                <LogOut className="mr-2 h-4 w-4" />
                {!collapsed && <span>Back to Customer App</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
