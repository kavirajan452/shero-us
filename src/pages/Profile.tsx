import { ArrowLeft, MapPin, Star, Heart, Settings, LogOut, Wallet, Download, FileText, HelpCircle, MessageCircle, ChevronRight, Gift, Clock, Package, Phone, Mail, Bot, PartyPopper, XCircle, Save } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { generateInvoicePDF, generateInvoiceNumber, type InvoiceData } from "@/utils/invoiceGenerator";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WalletSection from "@/components/WalletSection";
import { useWallet } from "@/contexts/WalletContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { useRegion } from "@/contexts/RegionContext";
import { useToast } from "@/hooks/use-toast";
import { downloadInvoiceForOrder } from "@/utils/invoiceService";
import { useMyPartyOrders, useMyPartyDrafts, useUpdatePartyOrder } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import CustomerSettings from "@/components/CustomerSettings";
import { useAuth } from "@/contexts/AuthContext";

const orderHistory = [
  { id: "SH4821", dish: "Chicken Biryani × 2, Raita × 2", chef: "Fathima Akka", price: 598, date: "28 Feb 2026", status: "Preparing", emoji: "🍗", invoiceAvailable: false },
  { id: "SH4798", dish: "Masala Dosa × 3", chef: "Kamala Paatti", price: 240, date: "27 Feb 2026", status: "Out for Delivery", emoji: "🥞", invoiceAvailable: false },
  { id: "SH4775", dish: "Sambar Rice × 2, Filter Coffee × 2", chef: "Lakshmi Amma", price: 260, date: "26 Feb 2026", status: "Delivered", emoji: "🍛", invoiceAvailable: true },
  { id: "SH4760", dish: "Veg Thali × 1", chef: "Saroja Amma", price: 120, date: "25 Feb 2026", status: "Delivered", emoji: "🥘", invoiceAvailable: true },
  { id: "SH4738", dish: "Gulab Jamun Box × 2", chef: "Meena Akka", price: 200, date: "24 Feb 2026", status: "Delivered", emoji: "🍮", invoiceAvailable: true },
  { id: "SH4720", dish: "Butter Chicken × 1, Naan × 4", chef: "Fathima Akka", price: 420, date: "22 Feb 2026", status: "Delivered", emoji: "🍗", invoiceAvailable: true },
  { id: "SH4705", dish: "Idli Sambar × 4", chef: "Kamala Paatti", price: 316, date: "20 Feb 2026", status: "Cancelled", emoji: "🫕", invoiceAvailable: false },
  { id: "SH4690", dish: "Fish Curry Rice × 2", chef: "Raheema Akka", price: 380, date: "18 Feb 2026", status: "Delivered", emoji: "🐟", invoiceAvailable: true },
];

const favoriteChefs = [
  { name: "Kamala Paatti", emoji: "👵", rating: 4.9, specialty: "Dosa & Idli" },
  { name: "Fathima Akka", emoji: "👩‍🍳", rating: 4.8, specialty: "Biryani Specials" },
];

const activePlan = {
  name: "Full Meals Plan",
  chef: "Lakshmi Amma",
  mealsLeft: 18,
  totalMeals: 30,
  renewDate: "Mar 15, 2026",
};

const faqs = [
  { q: "How do I cancel an order?", a: "You can cancel within 5 minutes of placing. Go to Order Tracking → Cancel. After prep starts, cancellation charges may apply." },
  { q: "How does the wallet work?", a: "Your Shero Wallet stores referral bonuses, spin rewards, and credits. On your first order, up to 50% of the wallet balance can be used. After that, full balance is available." },
  { q: "Can I change my delivery address?", a: "Yes, update your address during checkout or in Settings. You can save multiple addresses for quick selection." },
  { q: "What if the food quality is bad?", a: "Report via Contact Us within 2 hours of delivery. We'll investigate and issue a refund or credit to your wallet." },
  { q: "How do subscriptions work?", a: "Choose a meal plan (weekly/monthly), select a chef, and get daily meals delivered. Unused meals don't roll over." },
  { q: "How do I earn referral rewards?", a: "Share your referral code. When a friend signs up and verifies via OTP, you get $100 + a spin wheel bonus ($50–$500)!" },
  { q: "Is my payment secure?", a: "Yes, all payments are processed through secure payment gateways. We never store your card details." },
];

const Profile = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addReferralCredit } = useWallet();
  const { formatPrice } = useRegion();
  const { user: authUser, profile, isLoggedIn, isLoading, logout } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cancelDialogOrder, setCancelDialogOrder] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const { data: partyOrders = [] } = useMyPartyOrders(authUser?.id);
  const { data: partyDrafts = [] } = useMyPartyDrafts(authUser?.id, profile?.phone || undefined);
  const updatePartyOrder = useUpdatePartyOrder();
  const [chatMessages, setChatMessages] = useState<{ from: "bot" | "user"; text: string }[]>([
    { from: "bot", text: `Hi${profile?.full_name ? ` ${profile.full_name.split(" ")[0]}` : ""}! 👋 I'm Shero Bot. How can I help you today?\n\nQuick options:\n• Order issue\n• Refund status\n• Wallet help\n• Subscription query\n• Something else` },
  ]);
  const [chatInput, setChatInput] = useState("");

  const userName = profile?.full_name || authUser?.email?.split("@")[0] || "Guest";
  const userEmail = profile?.email || authUser?.email || "";
  const userPhone = profile?.phone || "";
  const userAvatar = profile?.avatar_url ? "👤" : "👩";

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) addReferralCredit(ref);
  }, [searchParams, addReferralCredit]);

  const { toast } = useToast();

  const downloadInvoice = async (orderId: string) => {
    toast({ title: "⏳ Generating Invoice..." });
    // Try DB first
    const success = await downloadInvoiceForOrder(orderId);
    if (success) {
      toast({ title: "📄 Invoice Downloaded" });
      return;
    }
    // Fallback: generate from mock data
    const order = orderHistory.find(o => o.id === orderId);
    if (order && order.invoiceAvailable) {
      const subtotal = order.price;
      const taxAmount = Math.round(subtotal * 0.05);
      const invoiceData: InvoiceData = {
        invoiceNumber: generateInvoiceNumber("SHERO"),
        generatedAt: new Date().toISOString(),
        customerName: userName,
        customerPhone: userPhone,
        customerEmail: userEmail,
        items: [{ name: order.dish, qty: "1", amount: subtotal }],
        subtotal,
        taxAmount,
        taxRate: "5",
        deliveryFee: 0,
        packingCharges: 0,
        platformFee: 0,
        discount: 0,
        total: subtotal + taxAmount,
        orderType: "instant",
        orderId: order.id,
        companySnapshot: {},
      };
      const doc = generateInvoicePDF(invoiceData);
      doc.save(`invoice-${invoiceData.invoiceNumber}.pdf`);
      toast({ title: "📄 Invoice Downloaded" });
    } else {
      toast({ title: "ℹ️ Invoice Not Available", description: "Invoice will be available after your order is delivered.", variant: "destructive" });
    }
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { from: "user", text: userMsg }]);
    setChatInput("");

    setTimeout(() => {
      let reply = "Thanks for reaching out! Our support team will get back to you within 2 hours. You can also call us at 1800-SHERO-00.";
      const lower = userMsg.toLowerCase();
      if (lower.includes("refund") || lower.includes("money")) {
        reply = "Refunds are processed within 3-5 business days to your original payment method. If you paid via wallet, it's instant! Check your wallet for credit. Need more help? Call 1800-SHERO-00.";
      } else if (lower.includes("order") || lower.includes("cancel")) {
        reply = "You can cancel within 5 minutes of placing an order. After that, partial charges may apply. Go to Order Tracking for live status. Is there a specific order issue?";
      } else if (lower.includes("wallet") || lower.includes("balance")) {
        reply = "Your wallet balance is shown on this page. Referral credits are instant. First purchase allows 50% wallet usage. Full balance available from 2nd order onwards!";
      } else if (lower.includes("subscription") || lower.includes("plan")) {
        reply = "You can manage subscriptions from the Subscriptions page. Pause, change chef, or cancel anytime. Unused meals don't carry over to next cycle.";
      }
      setChatMessages((prev) => [...prev, { from: "bot", text: reply }]);
    }, 800);
  };

  const totalSpent = orderHistory.filter((o) => o.status === "Delivered").reduce((s, o) => s + o.price, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-sm w-full border-border">
          <CardContent className="py-10 text-center space-y-4">
            <p className="text-4xl">🔒</p>
            <h2 className="text-xl font-serif font-bold text-foreground">Log in to view your profile</h2>
            <p className="text-sm text-muted-foreground">Sign in to see your orders, wallet, and more.</p>
            <Button onClick={() => navigate("/auth?role=customer&login=true")} className="w-full">Log In</Button>
            <Button variant="outline" onClick={() => navigate("/auth?role=customer")} className="w-full">Create Account</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row gap-6 items-start mb-8">
            <div className="w-20 h-20 rounded-2xl bg-secondary border border-border flex items-center justify-center text-4xl">
              {userAvatar}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-serif font-bold text-foreground">{userName}</h2>
              <p className="text-sm text-muted-foreground">{userEmail}{userPhone ? ` · ${userPhone}` : ""}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSettingsOpen(true)} className="p-2.5 rounded-full border border-border hover:bg-secondary transition-colors">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </button>
              <button onClick={async () => { await logout(); navigate("/"); }} className="p-2.5 rounded-full border border-border hover:bg-secondary transition-colors">
                <LogOut className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
              <TabsList className="inline-flex w-max min-w-full justify-center bg-muted/50">
                <TabsTrigger value="overview" className="text-center">Overview</TabsTrigger>
                <TabsTrigger value="orders" className="text-center gap-1">
                  Order History
                  {(partyOrders.length + partyDrafts.length) > 0 && <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">{partyOrders.length + partyDrafts.length}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="wallet" className="text-center">Wallet</TabsTrigger>
                <TabsTrigger value="support" className="text-center">Help & Support</TabsTrigger>
              </TabsList>
            </div>

            {/* ── Overview ── */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Active Plan */}
                <div className="lg:col-span-1 space-y-6">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-foreground mb-4">Active Plan</h3>
                    <div className="p-5 rounded-2xl bg-gradient-shero text-primary-foreground">
                      <h4 className="font-bold text-lg mb-1">{activePlan.name}</h4>
                      <p className="text-primary-foreground/80 text-sm mb-3">with {activePlan.chef}</p>
                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Meals used</span>
                          <span>{activePlan.totalMeals - activePlan.mealsLeft}/{activePlan.totalMeals}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-primary-foreground/20">
                          <div className="h-2 rounded-full bg-primary-foreground" style={{ width: `${((activePlan.totalMeals - activePlan.mealsLeft) / activePlan.totalMeals) * 100}%` }} />
                        </div>
                      </div>
                      <p className="text-xs text-primary-foreground/70 mt-2">Renews {activePlan.renewDate}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-serif font-bold text-foreground mb-4">Favorite Chefs</h3>
                    <div className="space-y-3">
                      {favoriteChefs.map((chef) => (
                        <div key={chef.name} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                          <span className="text-2xl">{chef.emoji}</span>
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-foreground">{chef.name}</p>
                            <p className="text-xs text-muted-foreground">{chef.specialty}</p>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="w-3 h-3 fill-warm text-warm" />
                            <span className="text-muted-foreground">{chef.rating}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Stats + Recent */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-border">
                      <CardContent className="pt-4 pb-3 text-center">
                        <Package className="w-5 h-5 mx-auto text-primary mb-1" />
                        <p className="text-lg font-bold text-foreground">{orderHistory.filter((o) => o.status === "Delivered").length}</p>
                        <p className="text-[10px] text-muted-foreground">Orders</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border">
                      <CardContent className="pt-4 pb-3 text-center">
                        <Wallet className="w-5 h-5 mx-auto text-accent mb-1" />
                        <p className="text-lg font-bold text-foreground">{formatPrice(totalSpent)}</p>
                        <p className="text-[10px] text-muted-foreground">Total Spent</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border">
                      <CardContent className="pt-4 pb-3 text-center">
                        <Heart className="w-5 h-5 mx-auto text-destructive mb-1" />
                        <p className="text-lg font-bold text-foreground">{favoriteChefs.length}</p>
                        <p className="text-[10px] text-muted-foreground">Fav Chefs</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border">
                      <CardContent className="pt-4 pb-3 text-center">
                        <Clock className="w-5 h-5 mx-auto text-primary mb-1" />
                        <p className="text-lg font-bold text-foreground">{activePlan.mealsLeft}</p>
                        <p className="text-[10px] text-muted-foreground">Meals Left</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent 3 Orders */}
                  <div>
                    <h3 className="text-lg font-serif font-bold text-foreground mb-4">Recent Orders</h3>
                    <div className="space-y-3">
                      {orderHistory.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/40 transition-colors">
                          <span className="text-3xl">{order.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground text-sm">#{order.id}</h4>
                            <p className="text-xs text-muted-foreground truncate">{order.dish}</p>
                            <p className="text-xs text-muted-foreground">by {order.chef} · {order.date}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-foreground">{formatPrice(order.price)}</p>
                            <Badge 
                              variant={order.status === "Delivered" ? "default" : order.status === "Cancelled" ? "destructive" : "secondary"} 
                              className="text-[10px] mt-0.5"
                            >
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Referral CTA */}
                  <Link to="/referrals" className="block p-5 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-center hover:shadow-md transition-shadow">
                    <p className="text-lg mb-1">🎁</p>
                    <p className="text-sm font-semibold text-foreground">Refer Friends & Win up to $500!</p>
                    <p className="text-xs text-muted-foreground mt-1">Get $100 + Spin Wheel bonus for every friend who joins</p>
                  </Link>
                </div>
              </div>
            </TabsContent>

            {/* ── Order History (includes saved drafts + party orders) ── */}
            <TabsContent value="orders" className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-serif font-bold text-foreground">All Orders</h3>
                <Badge variant="outline" className="text-xs">{orderHistory.length + partyOrders.length + partyDrafts.length} total</Badge>
              </div>

              {/* Saved Drafts */}
              {partyDrafts.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <Save className="w-4 h-4" /> Saved Drafts ({partyDrafts.length})
                  </h4>
                  {partyDrafts.map((draft: any) => {
                    const snapshot = Array.isArray(draft.cart_snapshot) ? draft.cart_snapshot : [];
                    const isCombo = snapshot.some((s: any) => s.serviceType === "combo-meal-box");
                    let draftTitle = "Party Order";
                    if (isCombo) {
                      draftTitle = "🍱 Combo Meal Box";
                    } else if (snapshot.length > 0) {
                      const sessions = snapshot.map((s: any) => {
                        const session = s.session || "";
                        const labelMap: Record<string, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snacks: "Snacks", "hi-tea": "Hi-Tea" };
                        return labelMap[session] || session;
                      }).filter(Boolean);
                      draftTitle = sessions.length > 0 ? `🍲 Bulk Food · ${sessions.join(" + ")}` : "🍲 Bulk Food";
                    }
                    return (
                      <Card key={draft.id} className="border-border border-dashed">
                        <CardContent className="py-4 px-5">
                          <div className="flex items-start gap-4">
                            <span className="text-3xl">{isCombo ? "🍱" : "🍲"}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <h4 className="font-semibold text-foreground text-sm">{draftTitle}</h4>
                                <Badge variant="secondary" className="text-[10px]">
                                  {draft.payment_status === "failed" ? "Payment Failed" : "Saved"}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{draft.customer_name}</p>
                              <p className="text-xs text-muted-foreground">
                                Saved {new Date(draft.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right shrink-0 space-y-1">
                              <p className="font-bold text-foreground">{formatPrice(draft.total_amount)}</p>
                              <Link to={`/party-orders?draftId=${draft.id}`}>
                                <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1">
                                  Continue →
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Party Orders (placed) */}
              {partyOrders.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <PartyPopper className="w-4 h-4" /> Party Orders ({partyOrders.length})
                  </h4>
                  {partyOrders.map((order: any) => {
                    const statusBadge: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
                      pending_allocation: { label: "Pending", variant: "secondary" },
                      allocated: { label: "Allocated", variant: "secondary" },
                      accepted: { label: "Accepted", variant: "default" },
                      preparing: { label: "Food Ready", variant: "default" },
                      delivered: { label: "Delivered", variant: "default" },
                      cancelled: { label: "Cancelled", variant: "destructive" },
                    };
                    const badge = statusBadge[order.status] || { label: order.status, variant: "secondary" as const };
                    const canCancel = ["pending_allocation", "allocated"].includes(order.status);
                    const canDownloadInvoice = ["preparing", "delivered"].includes(order.status);

                    return (
                      <Card key={order.id} className="border-border">
                        <CardContent className="py-4 px-5">
                          <div className="flex items-start gap-4">
                            <span className="text-3xl">🎉</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <h4 className="font-semibold text-foreground text-sm">#{order.order_id}</h4>
                                <Badge variant={badge.variant} className="text-[10px]">{badge.label}</Badge>
                                <Badge variant="outline" className="text-[10px]">
                                  {order.service_type === "combo-meal-box" ? "🍱 Combo" : "🍲 Bulk"}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{order.occasion} · {order.guest_count} guests</p>
                              <p className="text-xs text-muted-foreground">{order.event_date} · {order.event_time}</p>
                              {order.cooking_instructions && (
                                <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 truncate">⚠️ {order.cooking_instructions}</p>
                              )}
                            </div>
                            <div className="text-right shrink-0 space-y-1">
                              <p className="font-bold text-foreground">{formatPrice(order.total_amount)}</p>
                              {canDownloadInvoice && (
                                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-primary" onClick={() => downloadInvoiceForOrder(order.order_id)}>
                                  <Download className="w-3 h-3" /> Invoice
                                </Button>
                              )}
                              {canCancel && (
                                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-destructive" onClick={() => setCancelDialogOrder(order)}>
                                  <XCircle className="w-3 h-3" /> Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Regular Orders */}
              <div className="space-y-3">
                {(partyOrders.length > 0 || partyDrafts.length > 0) && (
                  <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <Package className="w-4 h-4" /> Food Orders ({orderHistory.length})
                  </h4>
                )}
                {orderHistory.map((order) => (
                  <Card key={order.id} className="border-border">
                    <CardContent className="py-4 px-5">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{order.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="font-semibold text-foreground text-sm">#{order.id}</h4>
                            <Badge 
                              variant={order.status === "Delivered" ? "default" : order.status === "Cancelled" ? "destructive" : "secondary"} 
                              className="text-[10px]"
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{order.dish}</p>
                          <p className="text-xs text-muted-foreground">by {order.chef} · {order.date}</p>
                        </div>
                        <div className="text-right shrink-0 space-y-1">
                          <p className="font-bold text-foreground">{formatPrice(order.price)}</p>
                          {order.invoiceAvailable ? (
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-primary" onClick={() => downloadInvoice(order.id)}>
                              <Download className="w-3 h-3" /> Invoice
                            </Button>
                          ) : order.status !== "Cancelled" ? (
                            <p className="text-[10px] text-muted-foreground italic">Invoice after delivery</p>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="p-5 rounded-2xl bg-secondary/50 border border-border text-center">
                <p className="text-muted-foreground text-sm">
                  You've ordered <span className="font-bold text-foreground">{orderHistory.filter((o) => o.status === "Delivered").length} meals</span> totaling <span className="font-bold text-foreground">{formatPrice(totalSpent)}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">That's approximately {formatPrice(Math.round(totalSpent * 0.4))} saved vs restaurant meals 🎉</p>
              </div>
            </TabsContent>

            {/* Party Orders tab removed — content merged into Order History */}

            {/* ── Wallet ── */}
            <TabsContent value="wallet" className="space-y-6">
              <WalletSection variant="customer" />
              <Link to="/referrals" className="block">
                <Card className="border-primary/20 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="py-4 px-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">🎁</div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-sm">Earn More Wallet Credits</p>
                      <p className="text-xs text-muted-foreground">Refer friends → $100 + spin wheel bonus per referral</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            </TabsContent>

            {/* ── Help & Support ── */}
            <TabsContent value="support" className="space-y-6">
              {/* Contact Options */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" /> Contact Us
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" className="gap-2 text-xs h-12 justify-start" onClick={() => setChatOpen(true)}>
                      <Bot className="w-4 h-4 text-primary" />
                      <div className="text-left">
                        <p className="font-semibold">Chat with Bot</p>
                        <p className="text-[10px] text-muted-foreground">Instant help 24/7</p>
                      </div>
                    </Button>
                    <a href="tel:1800000000">
                      <Button variant="outline" size="sm" className="gap-2 text-xs h-12 justify-start w-full">
                        <Phone className="w-4 h-4 text-accent" />
                        <div className="text-left">
                          <p className="font-semibold">Call Us</p>
                          <p className="text-[10px] text-muted-foreground">1800-SHERO-00</p>
                        </div>
                      </Button>
                    </a>
                    <a href="mailto:support@sherohome.com">
                      <Button variant="outline" size="sm" className="gap-2 text-xs h-12 justify-start w-full">
                        <Mail className="w-4 h-4 text-primary" />
                        <div className="text-left">
                          <p className="font-semibold">Email</p>
                          <p className="text-[10px] text-muted-foreground">support@sherohome.com</p>
                        </div>
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* FAQs */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-primary" /> Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, i) => (
                      <AccordionItem key={i} value={`faq-${i}`}>
                        <AccordionTrigger className="text-sm text-left hover:no-underline">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Party Order Cancel Dialog */}
      <Dialog open={!!cancelDialogOrder} onOpenChange={() => setCancelDialogOrder(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" /> Cancel Party Order
            </DialogTitle>
          </DialogHeader>
          {cancelDialogOrder && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Cancel order <span className="font-semibold text-foreground">#{cancelDialogOrder.order_id}</span> for {cancelDialogOrder.occasion}?
              </p>
              <Input
                placeholder="Reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              <div className="p-2 rounded-lg bg-secondary text-[10px] text-muted-foreground space-y-0.5">
                <p>• Free cancellation up to 2 days before event</p>
                <p>• Cancellation charges may apply for last-minute cancellations</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setCancelDialogOrder(null)}>Keep Order</Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  disabled={!cancelReason.trim()}
                  onClick={async () => {
                    // Update party order status
                    updatePartyOrder.mutate({
                      id: cancelDialogOrder.id,
                      updates: { status: "cancelled" },
                    });
                    // Insert cancellation record
                    await supabase.from("cancellations").insert({
                      order_id: cancelDialogOrder.order_id,
                      customer_name: cancelDialogOrder.customer_name,
                      reason: cancelReason,
                      order_total: cancelDialogOrder.total_amount,
                    });
                    toast({ title: "Order cancelled", description: `Party order #${cancelDialogOrder.order_id} has been cancelled.` });
                    setCancelDialogOrder(null);
                    setCancelReason("");
                  }}
                >
                  Confirm Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Chat Bot Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-w-sm mx-auto max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" /> Shero Support Bot
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-3 min-h-[200px] max-h-[400px] py-2">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${msg.from === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-2 border-t border-border">
            <Input
              placeholder="Type your question..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              maxLength={500}
              className="flex-1"
            />
            <Button onClick={sendChat} size="sm" disabled={!chatInput.trim()}>Send</Button>
          </div>
        </DialogContent>
      </Dialog>

      <CustomerSettings open={settingsOpen} onOpenChange={setSettingsOpen} />
      <Footer />
      {/* Bottom nav removed from customer dashboard */}
    </div>
  );
};

export default Profile;
