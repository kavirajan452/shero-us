import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import PaymentSection from "@/components/PaymentSection";
import type { PaymentMethod } from "@/components/PaymentSection";
import { saveIncompleteOrder, getAllIncompleteOrders, removeIncompleteOrder, type IncompleteOrder } from "@/data/incompleteOrderStore";
import { useToast } from "@/hooks/use-toast";
import {
  User, Phone, MapPin, Plus, Minus, Trash2, ShoppingCart, CreditCard,
  CheckCircle2, Clock, AlertTriangle, Search, RotateCcw
} from "lucide-react";

/* ── Mock data ── */
const mockMenuItems = [
  { id: "m1", name: "Chicken Biryani", price: 180, category: "Main Course" },
  { id: "m2", name: "Masala Dosa", price: 60, category: "Tiffin" },
  { id: "m3", name: "Sambar Rice", price: 80, category: "Rice" },
  { id: "m4", name: "Idli Vada (4+2)", price: 50, category: "Tiffin" },
  { id: "m5", name: "Fish Curry + Rice", price: 150, category: "Main Course" },
  { id: "m6", name: "Curd Rice", price: 60, category: "Rice" },
  { id: "m7", name: "Mutton Curry + Rice", price: 220, category: "Main Course" },
  { id: "m8", name: "Pongal", price: 55, category: "Tiffin" },
  { id: "m9", name: "Veg Thali", price: 120, category: "Thali" },
  { id: "m10", name: "Non-Veg Thali", price: 160, category: "Thali" },
];

const orderTypes = [
  { value: "instant", label: "Instant Delivery" },
  { value: "subscription", label: "Subscription" },
  { value: "party", label: "Party Order" },
  { value: "service", label: "Service Booking" },
];

interface CartEntry {
  id: string;
  name: string;
  price: number;
  qty: number;
}

const AdminManualOrder = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("new-order");

  // Customer profile
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custAddress, setCustAddress] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [orderType, setOrderType] = useState("instant");

  // Menu
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [notes, setNotes] = useState("");

  // Payment
  const [step, setStep] = useState<"profile" | "menu" | "payment" | "done">("profile");

  // Incomplete orders
  const [incompleteOrders, setIncompleteOrders] = useState<IncompleteOrder[]>(getAllIncompleteOrders());

  const filteredMenu = mockMenuItems.filter(
    (i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (item: typeof mockMenuItems[0]) => {
    setCart((prev) => {
      const ex = prev.find((c) => c.id === item.id);
      if (ex) return prev.map((c) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart((prev) => prev.map((c) => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter((c) => c.qty > 0));
  };

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  const canProceedToMenu = custName.trim() && custPhone.trim().length >= 10;
  const canProceedToPayment = cart.length > 0;

  const handlePaymentSuccess = () => {
    setStep("done");
    removeIncompleteOrder(`admin-${custPhone}`);
    toast({ title: "Order Placed", description: `Order placed for ${custName} — $${total}` });
  };

  const handlePaymentFailure = (method: PaymentMethod) => {
    saveIncompleteOrder({
      type: orderType as any,
      customerName: custName,
      customerPhone: custPhone,
      address: custAddress,
      deliveryType: "self-delivery",
      selectedSlot: "",
      cartSnapshot: cart,
      paymentMethod: method,
      paymentStatus: "failed",
      totalAmount: total,
      region: "IN",
    });
    setIncompleteOrders(getAllIncompleteOrders());
    toast({ title: "Payment Failed", description: "Order saved automatically. Can retry anytime.", variant: "destructive" });
  };

  const resumeOrder = (order: IncompleteOrder) => {
    setCustName(order.customerName);
    setCustPhone(order.customerPhone);
    setCustAddress(order.address);
    setOrderType(order.type);
    setCart(order.cartSnapshot || []);
    setStep("payment");
    setActiveTab("new-order");
  };

  const deleteIncomplete = (id: string) => {
    removeIncompleteOrder(id);
    setIncompleteOrders(getAllIncompleteOrders());
  };

  const resetForm = () => {
    setCustName(""); setCustPhone(""); setCustAddress(""); setCustEmail("");
    setOrderType("instant"); setCart([]); setNotes(""); setSearch(""); setStep("profile");
  };

  const formatPrice = (n: number) => `$${n.toLocaleString("en-US")}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manual Order Placement</h1>
        <p className="text-sm text-muted-foreground">Place orders on behalf of customers with payment processing</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="new-order">New Order</TabsTrigger>
          <TabsTrigger value="incomplete" className="relative">
            Incomplete Orders
            {incompleteOrders.length > 0 && (
              <Badge variant="destructive" className="ml-1.5 h-5 min-w-5 text-[10px]">{incompleteOrders.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new-order" className="mt-4">
          {/* Progress steps */}
          <div className="flex items-center gap-2 mb-6">
            {(["profile", "menu", "payment", "done"] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === s ? "bg-primary text-primary-foreground" :
                  (["profile", "menu", "payment", "done"].indexOf(step) > i) ? "bg-accent text-accent-foreground" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {["profile", "menu", "payment", "done"].indexOf(step) > i ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-xs text-muted-foreground capitalize hidden sm:inline">{s === "done" ? "Confirmed" : s}</span>
                {i < 3 && <div className="w-6 h-px bg-border" />}
              </div>
            ))}
          </div>

          {/* Step 1: Customer Profile */}
          {step === "profile" && (
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><User className="w-5 h-5" /> Customer Profile</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Full Name *</label>
                    <Input value={custName} onChange={(e) => setCustName(e.target.value)} placeholder="Customer name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Phone (RMN) *</label>
                    <Input value={custPhone} onChange={(e) => setCustPhone(e.target.value)} placeholder="10-digit mobile" maxLength={10} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                    <Input value={custEmail} onChange={(e) => setCustEmail(e.target.value)} placeholder="Email (optional)" type="email" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Order Type</label>
                    <Select value={orderType} onValueChange={setOrderType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {orderTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Delivery Address</label>
                  <Textarea value={custAddress} onChange={(e) => setCustAddress(e.target.value)} placeholder="Full delivery address" rows={2} />
                </div>
                <Button onClick={() => setStep("menu")} disabled={!canProceedToMenu} className="w-full sm:w-auto">
                  Continue to Menu Selection →
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Menu Selection */}
          {step === "menu" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> Select Items</CardTitle>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search menu..." className="pl-10" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredMenu.map((item) => {
                      const inCart = cart.find((c) => c.id === item.id);
                      return (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/30 transition-colors">
                          <div>
                            <p className="text-sm font-medium text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.category} · ${item.price}</p>
                          </div>
                          {inCart ? (
                            <div className="flex items-center gap-1">
                              <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateCartQty(item.id, -1)}><Minus className="w-3 h-3" /></Button>
                              <span className="w-6 text-center text-sm font-bold">{inCart.qty}</span>
                              <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateCartQty(item.id, 1)}><Plus className="w-3 h-3" /></Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => addToCart(item)}><Plus className="w-3 h-3 mr-1" /> Add</Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Cart summary */}
              <Card>
                <CardHeader><CardTitle className="text-lg">Cart ({cart.reduce((s, c) => s + c.qty, 0)} items)</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {cart.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No items added yet</p>
                  ) : (
                    <>
                      {cart.map((c) => (
                        <div key={c.id} className="flex items-center justify-between text-sm">
                          <div className="flex-1 min-w-0">
                            <span className="text-foreground truncate block">{c.name}</span>
                            <span className="text-muted-foreground text-xs">${c.price} × {c.qty}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">${c.price * c.qty}</span>
                            <button onClick={() => updateCartQty(c.id, -c.qty)} className="text-destructive hover:bg-destructive/10 p-1 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}
                      <div className="border-t border-border pt-2 space-y-1 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Sales Tax</span><span>${tax}</span></div>
                        <div className="flex justify-between font-bold text-base pt-1 border-t border-border"><span>Total</span><span>${total}</span></div>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Order Notes</label>
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Special instructions..." rows={2} className="text-sm" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep("profile")} className="flex-1">← Back</Button>
                    <Button onClick={() => setStep("payment")} disabled={!canProceedToPayment} className="flex-1">Payment →</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === "payment" && (
            <div className="max-w-lg">
              <Card className="mb-4">
                <CardContent className="pt-5">
                  <div className="text-sm space-y-1 mb-3">
                    <p><span className="text-muted-foreground">Customer:</span> <span className="font-medium text-foreground">{custName}</span></p>
                    <p><span className="text-muted-foreground">Phone:</span> <span className="font-medium text-foreground">{custPhone}</span></p>
                    <p><span className="text-muted-foreground">Items:</span> <span className="font-medium text-foreground">{cart.reduce((s, c) => s + c.qty, 0)} items</span></p>
                  </div>
                </CardContent>
              </Card>
              <PaymentSection
                total={total}
                formatPrice={formatPrice}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentFailure={handlePaymentFailure}
                showPaymentLink
              />
              <Button variant="outline" onClick={() => setStep("menu")} className="mt-2">← Back to Menu</Button>
            </div>
          )}

          {/* Step 4: Done */}
          {step === "done" && (
            <Card>
              <CardContent className="pt-6 text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 text-accent mx-auto" />
                <h3 className="text-xl font-bold text-foreground">Order Confirmed!</h3>
                <p className="text-muted-foreground">Order for <strong>{custName}</strong> ({custPhone}) has been placed successfully.</p>
                <p className="text-lg font-bold text-foreground">Total: ${total}</p>
                <Button onClick={resetForm}><RotateCcw className="w-4 h-4 mr-2" /> Place Another Order</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Incomplete Orders Tab */}
        <TabsContent value="incomplete" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" /> Incomplete / Failed Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {incompleteOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No incomplete orders</p>
              ) : (
                <div className="space-y-3">
                  {incompleteOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/20 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">{order.customerName}</span>
                          <Badge variant={order.paymentStatus === "failed" ? "destructive" : "secondary"} className="text-[10px]">
                            {order.paymentStatus}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">{order.type}</Badge>
                        </div>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{order.customerPhone}</span>
                          <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" />{order.paymentMethod}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(order.savedAt).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })}</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground mt-1">${order.totalAmount.toLocaleString("en-US")}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" onClick={() => resumeOrder(order)}>Resume</Button>
                        <Button size="sm" variant="outline" onClick={() => deleteIncomplete(order.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminManualOrder;
