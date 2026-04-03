import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { RegionProvider } from "@/contexts/RegionContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { WalletProvider } from "@/contexts/WalletContext";
import Index from "./pages/Index";
import Analytics from "./components/Analytics";
import ScrollToTop from "./components/ScrollToTop";
import Welcome from "./pages/Welcome";
import AppStoreListing from "./pages/AppStoreListing";
import SplashScreen from "./pages/SplashScreen";
import Onboarding from "./pages/Onboarding";
import ChefProfile from "./pages/ChefProfile";
import Subscriptions from "./pages/Subscriptions";
import Experiences from "./pages/Experiences";
import PartyOrders from "./pages/PartyOrders";
import SweetsSnacks from "./pages/SweetsSnacks";
import SnackDetail from "./pages/SnackDetail";
import SheroClasses from "./pages/SheroClasses";
import SheroClassCategory from "./pages/SheroClassCategory";
import SheroClassDetail from "./pages/SheroClassDetail";
import Services from "./pages/Services";
import ServiceCategory from "./pages/ServiceCategory";
import ServiceDetail from "./pages/ServiceDetail";
import ServiceBooking from "./pages/ServiceBooking";
import InstantDelivery from "./pages/InstantDelivery";
import KitchenDetail from "./pages/KitchenDetail";
import ItemDetail from "./pages/ItemDetail";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderTracking from "./pages/OrderTracking";
import AdminDeliveryAnalytics from "./pages/admin/AdminDeliveryAnalytics";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import CustomerReferrals from "./pages/CustomerReferrals";
import NotFound from "./pages/NotFound";
import PartnerEnrollment from "./pages/PartnerEnrollment";
import PartnerLayout from "./layouts/PartnerLayout";
import AdminLayout from "./layouts/AdminLayout";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPartners from "./pages/admin/AdminPartners";
import AdminMenus from "./pages/admin/AdminMenus";

import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReports from "./pages/admin/AdminReports";
import AdminTeam from "./pages/admin/AdminTeam";
import AdminPMS from "./pages/admin/AdminPMS";
import AdminHRPolicies from "./pages/admin/AdminHRPolicies";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminCommunications from "./pages/admin/AdminCommunications";
import AdminMetrics from "./pages/admin/AdminMetrics";
import AdminSPC from "./pages/admin/AdminSPC";
import AdminPartyAllocations from "./pages/admin/AdminPartyAllocations";
import AdminPartyLeads from "./pages/admin/AdminPartyLeads";
import AdminPartyOrders from "./pages/admin/AdminPartyOrders";
import AdminPartyMenus from "./pages/admin/AdminPartyMenus";
import AdminPartyReports from "./pages/admin/AdminPartyReports";
import AdminPartyDiscounts from "./pages/admin/AdminPartyDiscounts";
import AdminPartyFinance from "./pages/admin/AdminPartyFinance";
import AdminSubDashboard from "./pages/admin/AdminSubDashboard";
import AdminSubOrders from "./pages/admin/AdminSubOrders";
import AdminSubMenuPlans from "./pages/admin/AdminSubMenuPlans";
import AdminSubFinance from "./pages/admin/AdminSubFinance";
import AdminSubOperations from "./pages/admin/AdminSubOperations";
import AdminSubReports from "./pages/admin/AdminSubReports";
import AdminSubLeads from "./pages/admin/AdminSubLeads";
import AdminInstantFinance from "./pages/admin/AdminInstantFinance";
import AdminServicesFinance from "./pages/admin/AdminServicesFinance";

import AdminSAPOnboarding from "./pages/admin/AdminSAPOnboarding";
import AdminManualOrder from "./pages/admin/AdminManualOrder";
import AdminLiveSupport from "./pages/admin/AdminLiveSupport";
import AdminLocationSupport from "./pages/admin/AdminLocationSupport";
import AdminOrderModifications from "./pages/admin/AdminOrderModifications";
import AdminCustomerFeedback from "./pages/admin/AdminCustomerFeedback";
import AdminPartnerAmendments from "./pages/admin/AdminPartnerAmendments";
import AdminTeamTickets from "./pages/admin/AdminTeamTickets";
import AdminPartnerComms from "./pages/admin/AdminPartnerComms";
import AdminAITower from "./pages/admin/AdminAITower";
import AdminChatbot from "./pages/admin/AdminChatbot";
import AdminDebitCredit from "./pages/admin/AdminDebitCredit";
import AdminPaymentGateway from "./pages/admin/AdminPaymentGateway";
import AdminTechDashboard from "./pages/admin/AdminTechDashboard";
import AdminDeliveryManagement from "./pages/admin/AdminDeliveryManagement";
import AdminAPIConnections from "./pages/admin/AdminAPIConnections";
import AdminFinanceDashboard from "./pages/admin/AdminFinanceDashboard";
import AdminInvoiceSettings from "./pages/admin/AdminInvoiceSettings";
import AdminSnacksDashboard from "./pages/admin/AdminSnacksDashboard";
import AdminClassesDashboard from "./pages/admin/AdminClassesDashboard";
import AdminSnacksFinance from "./pages/admin/AdminSnacksFinance";
import AdminCookeryFinance from "./pages/admin/AdminCookeryFinance";
import AdminSheroClassesFinance from "./pages/admin/AdminSheroClassesFinance";
import ComingSoon from "./components/admin/ComingSoon";
import AdminScreenComms from "./pages/admin/AdminScreenComms";
import AdminWalletExpiry from "./pages/admin/AdminWalletExpiry";
import AdminPromotions from "./pages/admin/AdminPromotions";
import AdminMasterComms from "./pages/admin/AdminMasterComms";
import AdminFinancialReports from "./pages/admin/AdminFinancialReports";
import AdminBusinessMetrics from "./pages/admin/AdminBusinessMetrics";
import AdminKitchenCategories from "./pages/admin/AdminKitchenCategories";
import PartnerDashboard from "./pages/partner/PartnerDashboard";
import PartnerOrders from "./pages/partner/PartnerOrders";
import PartnerMenuManagement from "./pages/partner/PartnerMenuManagement";
import PartnerBulkUpload from "./pages/partner/PartnerBulkUpload";
import PartnerCuisines from "./pages/partner/PartnerCuisines";
import PartnerReferrals from "./pages/partner/PartnerReferrals";
import PartnerKitchenSchedule from "./pages/partner/PartnerKitchenSchedule";
import PartnerKitchenAttendance from "./pages/partner/PartnerKitchenAttendance";
import PartnerReports from "./pages/partner/PartnerReports";
import PartnerPerformanceSCV from "./pages/partner/PartnerPerformanceSCV";
import PartnerTips from "./pages/partner/PartnerTips";
import PartnerMessages from "./pages/partner/PartnerMessages";
import PartnerSPC from "./pages/partner/PartnerSPC";
import PartnerPartyOrders from "./pages/partner/PartnerPartyOrders";
import PartnerTraining from "./pages/partner/PartnerTraining";
import PartnerVisitingCard from "./pages/partner/PartnerVisitingCard";
import PartnerIncomeCalculator from "./pages/partner/PartnerIncomeCalculator";
import PartnerEarnings from "./pages/partner/PartnerEarnings";
import PartnerPerformance from "./pages/partner/PartnerPerformance";
import PartnerMenuItems from "./pages/partner/PartnerMenuItems";
import PartnerIngredients from "./pages/partner/PartnerIngredients";
import PartnerSnacksOrders from "./pages/partner/PartnerSnacksOrders";
import PartnerSnacksProducts from "./pages/partner/PartnerSnacksProducts";
import PartnerClasses from "./pages/partner/PartnerClasses";
import FoodProducts from "./pages/FoodProducts";
import ScreenshotsGallery from "./pages/ScreenshotsGallery";
import AboutShero from "./pages/AboutShero";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <RegionProvider>
      <AuthProvider>
        <WalletProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Analytics />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/app-store" element={<AppStoreListing />} />
                <Route path="/splash" element={<SplashScreen />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/chef/:id" element={<ChefProfile />} />
                <Route path="/subscriptions" element={<Subscriptions />} />
                <Route path="/experiences" element={<Experiences />} />
                <Route path="/party-orders" element={<PartyOrders />} />
                {/* Shero Classes, Cookery Classes — disabled for now */}
                <Route path="/sweets-snacks" element={<SweetsSnacks />} />
                <Route path="/sweets-snacks/:id" element={<SnackDetail />} />
                <Route path="/shero-classes" element={<ComingSoon title="Shero Classes" description="This vertical is currently disabled and will be enabled soon." section="Customer" />} />
                <Route path="/shero-classes/:categoryId" element={<ComingSoon title="Shero Classes" description="This vertical is currently disabled and will be enabled soon." section="Customer" />} />
                <Route path="/shero-classes/detail/:classId" element={<ComingSoon title="Shero Classes" description="This vertical is currently disabled and will be enabled soon." section="Customer" />} />
                <Route path="/services" element={<ComingSoon title="Cookery Classes" description="This vertical is currently disabled and will be enabled soon." section="Customer" />} />
                <Route path="/services/:categoryId" element={<ComingSoon title="Cookery Classes" description="This vertical is currently disabled and will be enabled soon." section="Customer" />} />
                <Route path="/services/detail/:serviceId" element={<ComingSoon title="Cookery Classes" description="This vertical is currently disabled and will be enabled soon." section="Customer" />} />
                <Route path="/services/book/:serviceId" element={<ComingSoon title="Cookery Classes" description="This vertical is currently disabled and will be enabled soon." section="Customer" />} />
                <Route path="/instant-delivery" element={<InstantDelivery />} />
                <Route path="/instant-delivery/kitchen/:id" element={<KitchenDetail />} />
                <Route path="/instant-delivery/item/:id" element={<ItemDetail />} />
                <Route path="/food-products" element={<FoodProducts />} />
                <Route path="/about" element={<AboutShero />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/order-tracking" element={<OrderTracking />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/partner-enrollment" element={<PartnerEnrollment />} />
                <Route path="/customer" element={<Profile />} />
                <Route path="/referrals" element={<CustomerReferrals />} />
                <Route path="/partner" element={<PartnerLayout />}>
                  <Route index element={<PartnerDashboard />} />
                  <Route path="orders" element={<PartnerOrders />} />
                  <Route path="menu" element={<PartnerMenuManagement />} />
                  <Route path="cuisines" element={<PartnerCuisines />} />
                  <Route path="bulk-upload" element={<PartnerBulkUpload />} />
                  <Route path="referrals" element={<PartnerReferrals />} />
                  <Route path="kitchen-schedule" element={<PartnerKitchenSchedule />} />
                  <Route path="kitchen-attendance" element={<PartnerKitchenAttendance />} />
                  <Route path="reports" element={<PartnerReports />} />
                  <Route path="performance-scv" element={<PartnerPerformanceSCV />} />
                  <Route path="tips" element={<PartnerTips />} />
                  <Route path="messages" element={<PartnerMessages />} />
                  <Route path="spc" element={<PartnerSPC />} />
                  <Route path="party-orders" element={<PartnerPartyOrders />} />
                  <Route path="training" element={<PartnerTraining />} />
                  <Route path="visiting-card" element={<PartnerVisitingCard />} />
                  <Route path="income" element={<PartnerIncomeCalculator />} />
                  <Route path="earnings" element={<PartnerEarnings />} />
                  <Route path="performance" element={<PartnerPerformance />} />
                  <Route path="menu-items" element={<PartnerMenuItems />} />
                  <Route path="ingredients" element={<PartnerIngredients />} />
                  {/* Snacks, Cookery, Shero — disabled */}
                  <Route path="snacks-orders" element={<ComingSoon title="Snack Orders" description="This vertical is currently disabled." section="Partner" />} />
                  <Route path="snacks-products" element={<ComingSoon title="Snack Products" description="This vertical is currently disabled." section="Partner" />} />
                  <Route path="classes" element={<ComingSoon title="Classes" description="This vertical is currently disabled." section="Partner" />} />
                  <Route path="cookery-classes" element={<ComingSoon title="Cookery Classes" description="This vertical is currently disabled." section="Partner" />} />
                  <Route path="shero-classes" element={<ComingSoon title="Shero Classes" description="This vertical is currently disabled." section="Partner" />} />
                </Route>
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="partners" element={<AdminPartners />} />
                  <Route path="master-comms" element={<AdminMasterComms />} />
                  <Route path="financial-reports" element={<AdminFinancialReports />} />
                  <Route path="business-metrics" element={<AdminBusinessMetrics />} />
                  
                  <Route path="menus" element={<AdminMenus />} />
                  <Route path="kitchen-categories" element={<AdminKitchenCategories />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="payments" element={<AdminPayments />} />
                  <Route path="tickets" element={<AdminTickets />} />
                  <Route path="communications" element={<AdminCommunications />} />
                  <Route path="command-comms" element={<AdminCommunications sectionFilter="command" />} />
                  <Route path="finance-comms" element={<AdminCommunications sectionFilter="finance" />} />
                  <Route path="instant-comms" element={<AdminCommunications sectionFilter="instant" />} />
                  <Route path="party-comms" element={<AdminCommunications sectionFilter="party" />} />
                  <Route path="sub-comms" element={<AdminCommunications sectionFilter="subscription" />} />
                  <Route path="support-comms" element={<AdminCommunications sectionFilter="support" />} />
                  <Route path="people-comms" element={<AdminCommunications sectionFilter="people" />} />
                  <Route path="tech-comms" element={<AdminCommunications sectionFilter="tech" />} />
                  <Route path="hr-comms" element={<AdminCommunications sectionFilter="hr" />} />
                  <Route path="metrics" element={<AdminMetrics />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="team" element={<AdminTeam />} />
                  <Route path="pms" element={<AdminPMS />} />
                  <Route path="hr-policies" element={<AdminHRPolicies />} />
                  <Route path="spc" element={<AdminSPC />} />
                  <Route path="party-allocations" element={<AdminPartyAllocations />} />
                  <Route path="party-leads" element={<AdminPartyLeads />} />
                  <Route path="party-orders" element={<AdminPartyOrders />} />
                  <Route path="party-menus" element={<AdminPartyMenus />} />
                  <Route path="party-reports" element={<AdminPartyReports />} />
                  <Route path="party-discounts" element={<AdminPartyDiscounts />} />
                  <Route path="party-finance" element={<AdminPartyFinance />} />
                  <Route path="delivery-analytics" element={<AdminDeliveryAnalytics />} />
                  <Route path="subscriptions" element={<AdminSubDashboard />} />
                  <Route path="sub-orders" element={<AdminSubOrders />} />
                  <Route path="sub-menu-plans" element={<AdminSubMenuPlans />} />
                  <Route path="sub-finance" element={<AdminSubFinance />} />
                  <Route path="sub-operations" element={<AdminSubOperations />} />
                  <Route path="sub-reports" element={<AdminSubReports />} />
                  <Route path="instant-finance" element={<AdminInstantFinance />} />
                  <Route path="services-finance" element={<AdminServicesFinance />} />
                  <Route path="snacks-finance" element={<AdminSnacksFinance />} />
                  <Route path="cookery-finance" element={<AdminCookeryFinance />} />
                  <Route path="shero-classes-finance" element={<AdminSheroClassesFinance />} />
                  <Route path="finance-dashboard" element={<AdminFinanceDashboard />} />
                  <Route path="invoice-settings" element={<AdminInvoiceSettings />} />
                  <Route path="sub-leads" element={<AdminSubLeads />} />
                  <Route path="onboarding" element={<Navigate to="/admin/partners" replace />} />
                  <Route path="sap-onboarding" element={<AdminSAPOnboarding />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="manual-order" element={<AdminManualOrder />} />
                  <Route path="live-support" element={<AdminLiveSupport />} />
                  <Route path="location-support" element={<AdminLocationSupport />} />
                  <Route path="order-modifications" element={<AdminOrderModifications />} />
                  <Route path="customer-feedback" element={<AdminCustomerFeedback />} />
                  <Route path="partner-amendments" element={<AdminPartnerAmendments />} />
                  <Route path="team-tickets" element={<AdminTeamTickets />} />
                  <Route path="partner-queries" element={<AdminPartnerComms />} />
                  <Route path="ai-tower" element={<AdminAITower />} />
                  <Route path="chatbot" element={<AdminChatbot />} />
                  <Route path="debit-credit" element={<AdminDebitCredit />} />
                  <Route path="stripe" element={<AdminStripeIntegration />} />
                  <Route path="tech-dashboard" element={<AdminTechDashboard />} />
                  <Route path="screen-comms" element={<AdminScreenComms />} />
                  <Route path="promotions" element={<AdminPromotions />} />
                  <Route path="delivery-mgmt" element={<AdminDeliveryManagement />} />
                  <Route path="api-connections" element={<AdminAPIConnections />} />
                  <Route path="snacks-dashboard" element={<AdminSnacksDashboard />} />
                  <Route path="snacks-catalog" element={<ComingSoon title="Product Catalog" description="Manage the Sweets & Snacks product catalog — approve new items, edit listings, manage categories." section="Sweets & Snacks" />} />
                  <Route path="snacks-inventory" element={<ComingSoon title="Inventory & Pricing" description="Monitor stock levels, set pricing rules, manage bulk pricing and pack sizes." section="Sweets & Snacks" />} />
                  <Route path="snacks-partners" element={<ComingSoon title="Partner Performance" description="Track fulfillment metrics, preparation times, quality ratings and partner scorecards." section="Sweets & Snacks" />} />
                  <Route path="snacks-discounts" element={<ComingSoon title="Discounts & Promotions" description="Create discount coupons, seasonal offers, and promotional campaigns for snack products." section="Sweets & Snacks" />} />
                  <Route path="snacks-reports" element={<ComingSoon title="Sweets & Snacks Reports" description="Revenue analytics, product performance, regional trends and inventory turnover reports." section="Sweets & Snacks" />} />
                  <Route path="snacks-comms" element={<AdminCommunications sectionFilter="snacks" />} />
                  {/* Cookery Classes */}
                  <Route path="cookery-dashboard" element={<AdminClassesDashboard />} />
                  <Route path="cookery-instructors" element={<ComingSoon title="Instructor Management" description="Manage cooking instructor profiles, assign classes, track teaching hours and performance." section="Cookery Classes" />} />
                  <Route path="cookery-curriculum" element={<ComingSoon title="Curriculum & Content" description="Create and manage cooking course content, recipe libraries, video modules and learning materials." section="Cookery Classes" />} />
                  <Route path="cookery-schedule" element={<ComingSoon title="Schedule Calendar" description="View and manage cookery class schedules, batch timings and instructor availability." section="Cookery Classes" />} />
                  <Route path="cookery-reviews" element={<ComingSoon title="Reviews & Ratings" description="Monitor student reviews, instructor ratings, and quality feedback across cookery classes." section="Cookery Classes" />} />
                  <Route path="cookery-certificates" element={<ComingSoon title="Certificate Management" description="Design certificate templates, manage issuance rules for cookery course completions." section="Cookery Classes" />} />
                  <Route path="cookery-reports" element={<ComingSoon title="Cookery Classes Reports" description="Enrollment analytics, revenue by cuisine, instructor performance and completion rates." section="Cookery Classes" />} />
                  <Route path="cookery-comms" element={<AdminCommunications sectionFilter="cookery" />} />
                  {/* Shero Classes */}
                  <Route path="shero-classes-dashboard" element={<AdminClassesDashboard />} />
                  <Route path="shero-classes-instructors" element={<ComingSoon title="Instructor Management" description="Manage yoga and wellness instructor profiles, certifications and class assignments." section="Shero Classes" />} />
                  <Route path="shero-classes-curriculum" element={<ComingSoon title="Curriculum & Content" description="Create and manage yoga, wellness and lifestyle course content and session plans." section="Shero Classes" />} />
                  <Route path="shero-classes-schedule" element={<ComingSoon title="Schedule Calendar" description="View and manage Shero class schedules, session timings and room allocation." section="Shero Classes" />} />
                  <Route path="shero-classes-reviews" element={<ComingSoon title="Reviews & Ratings" description="Monitor student reviews and ratings across yoga, wellness and lifestyle classes." section="Shero Classes" />} />
                  <Route path="shero-classes-certificates" element={<ComingSoon title="Certificate Management" description="Design certificate templates and manage issuance for Shero class completions." section="Shero Classes" />} />
                  <Route path="shero-classes-reports" element={<ComingSoon title="Shero Classes Reports" description="Enrollment analytics, revenue by category, instructor performance and completion rates." section="Shero Classes" />} />
                  <Route path="shero-classes-comms" element={<AdminCommunications sectionFilter="shero-classes" />} />
                  {/* Legacy classes routes - redirect */}
                  <Route path="classes-dashboard" element={<AdminClassesDashboard />} />
                  <Route path="classes-comms" element={<AdminCommunications sectionFilter="cookery" />} />
                  <Route path="tech-integrations" element={<ComingSoon title="Integrations Overview" description="Monitor all third-party integrations, webhook health, API usage quotas and service dependencies." section="Tech Management" />} />
                  <Route path="training-content" element={<ComingSoon title="Training Content" description="Manage partner training modules, video content, quizzes and certification tracks." section="Partner & Kitchen Onboarding" />} />
                  <Route path="attendance-leave" element={<ComingSoon title="Attendance & Leave" description="Track team attendance, manage leave requests, holidays and shift schedules." section="HR Management" />} />
                  <Route path="wallet-referrals" element={<AdminWalletExpiry />} />
                </Route>
                <Route path="/screenshots" element={<ScreenshotsGallery />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
        </WalletProvider>
      </AuthProvider>
    </RegionProvider>
  </QueryClientProvider>
);

export default App;
