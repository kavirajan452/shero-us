import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Tag } from "lucide-react";
import { ArrowLeft, Minus, Plus, Trash2, MapPin, Phone, User, Clock, Truck, Store, Package, Shield, Wallet, AlertTriangle } from "lucide-react";
import CheckoutAuth from "@/components/CheckoutAuth";
import PaymentSection from "@/components/PaymentSection";
import type { PaymentMethod } from "@/components/PaymentSection";
import NonServiceableArea from "@/components/NonServiceableArea";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { useCart } from "@/contexts/CartContext";
import { useRegion } from "@/contexts/RegionContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { useCreateInstantOrder, useSaveIncompleteOrder } from "@/hooks/useSupabaseData";
import { useServiceability } from "@/hooks/useServiceability";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const deliveryOptionsBase = [
  { id: "self-pickup", label: "Self Pickup", description: "Pick up from kitchen", icon: Store },
  { id: "self-delivery", label: "Self Delivery", description: "Kitchen's own delivery", icon: Truck },
  { id: "third-party", label: "Third-Party Delivery", description: "Delivered via partner service", icon: Package },
];

const Checkout = () => {
  const { items, updateQuantity, removeItem, subtotal, clearCart, totalItems, appliedPromo, promoDiscount, applyPromoCode, removePromoCode, promoLoading } = useCart();
  const [promoInput, setPromoInput] = useState("");
  const { formatPrice, calcTax, region } = useRegion();
  const { isLoggedIn } = useAuth();
  const { balance, getUsableAmount, spendOnPurchase } = useWallet();
  const navigate = useNavigate();
  const createOrder = useCreateInstantOrder();
  const saveIncomplete = useSaveIncompleteOrder();
  const [useWalletBalance, setUseWalletBalance] = useState(true);
  const { detectAndCheck, checkByZip, detectedLocation, checking: geoChecking, radiusMiles, hasKitchens } = useServiceability();
  const [serviceableStatus, setServiceableStatus] = useState<"unknown" | "checking" | "serviceable" | "not_serviceable">("unknown");

  // Detect if cart is snacks-only (shipped items, no time slots needed)
  const isSnacksOnly = items.length > 0 && items.every((ci) => ci.item.kitchenId === "snacks");

  const [deliveryType, setDeliveryType] = useState(isSnacksOnly ? "shipping" : "self-delivery");
  const [selectedSlot, setSelectedSlot] = useState(isSnacksOnly ? "shipping" : "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [attempted, setAttempted] = useState(false);

  // Auto-check serviceability on mount via GPS (non-blocking)
  useEffect(() => {
    if (isSnacksOnly || serviceableStatus !== "unknown" || !hasKitchens) return;
    setServiceableStatus("checking");
    detectAndCheck().then((result) => {
      setServiceableStatus(result.serviceable ? "serviceable" : "not_serviceable");
    });
  }, [hasKitchens]); // eslint-disable-line react-hooks/exhaustive-deps

  // Also check when ZIP code is entered (for snacks or manual entry)
  useEffect(() => {
    if (zipCode.length === 5 && hasKitchens) {
      const isServiceable = checkByZip(zipCode);
      setServiceableStatus(isServiceable ? "serviceable" : "not_serviceable");
    }
  }, [zipCode, hasKitchens, checkByZip]);

  const deliveryFees: Record<string, Record<string, number>> = {
    IN: { "self-pickup": 0, "self-delivery": 30, "third-party": 50 },
    US: { "self-pickup": 0, "self-delivery": 4, "third-party": 7 },
  };

  const deliveryFee = isSnacksOnly ? (subtotal >= 599 ? 0 : 49) : (deliveryFees[region.code]?.[deliveryType] || 0);
  const tax = calcTax(subtotal - promoDiscount);
  const subtotalWithFees = subtotal - promoDiscount + deliveryFee + region.platformFee + tax;
  const walletUsable = useWalletBalance ? getUsableAmount(subtotalWithFees) : 0;
  const total = subtotalWithFees - walletUsable;

  const slots = useMemo(() => {
    const now = new Date();
    const result: { label: string; value: string }[] = [];
    const minTime = new Date(now.getTime() + region.minPrepMinutes * 60 * 1000);

    for (let h = region.deliveryStartHour; h < region.deliveryEndHour; h++) {
      for (const m of [0, 30]) {
        const slot = new Date(now);
        slot.setHours(h, m, 0, 0);
        if (slot < now || slot < minTime) continue;
        const end = new Date(slot.getTime() + 30 * 60 * 1000);
        const fmt = (d: Date) => d.toLocaleTimeString(region.locale, { hour: "2-digit", minute: "2-digit", hour12: true });
        result.push({ label: `${fmt(slot)} – ${fmt(end)}`, value: `${h}:${m.toString().padStart(2, "0")}` });
      }
    }
    if (result.length === 0) {
      for (let h = region.deliveryStartHour; h < region.deliveryEndHour; h++) {
        for (const m of [0, 30]) {
          const slot = new Date(now);
          slot.setDate(slot.getDate() + 1);
          slot.setHours(h, m, 0, 0);
          const end = new Date(slot.getTime() + 30 * 60 * 1000);
          const fmt = (d: Date) => d.toLocaleTimeString(region.locale, { hour: "2-digit", minute: "2-digit", hour12: true });
          result.push({ label: `Tomorrow ${fmt(slot)} – ${fmt(end)}`, value: `tmr-${h}:${m.toString().padStart(2, "0")}` });
        }
      }
    }
    return result.slice(0, 8);
  }, [region]);

  const handleAddressChange = (val: string) => {
    setAddress(val);
    if (val.length > 2) {
      setFilteredSuggestions(region.addressSuggestions.filter((a) => a.toLowerCase().includes(val.toLowerCase())));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const { toast } = useToast();

  const handlePaymentSuccess = (method?: PaymentMethod) => {
    // Save order to database
    createOrder.mutate({
      order_code: `SH-INS-${Date.now().toString(36).toUpperCase()}`,
      customer_name: name,
      customer_phone: phone,
      customer_address: address,
      items: items.map(({ item, quantity, selectedAddOns }) => ({
        name: item.name, qty: quantity, price: item.price, addOns: selectedAddOns.map(a => a.name),
      })),
      subtotal,
      discount: promoDiscount,
      delivery_fee: deliveryFee,
      platform_fee: region.platformFee,
      tax,
      wallet_used: walletUsable,
      total,
      note: appliedPromo ? `Promo: ${appliedPromo.code}` : undefined,
      delivery_type: deliveryType,
      delivery_slot: selectedSlot,
      payment_method: method || "online",
      payment_status: "paid",
      status: "new",
    });
    if (walletUsable > 0) {
      spendOnPurchase(walletUsable, subtotalWithFees);
    }
    clearCart();
    navigate("/order-confirmation");
  };

  const handlePaymentFailure = (method: PaymentMethod) => {
    saveIncomplete.mutate({
      type: "instant",
      customer_name: name,
      customer_phone: phone,
      address,
      delivery_type: deliveryType,
      selected_slot: selectedSlot,
      cart_snapshot: items.map(({ item, quantity, selectedAddOns }) => ({
        id: item.id, name: item.name, price: item.price, quantity, addOns: selectedAddOns,
      })),
      payment_method: method,
      payment_status: "failed",
      total_amount: total,
      region: region.code,
    });
    toast({
      title: "Order saved",
      description: "Your order details have been saved. You can retry payment anytime.",
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-24 container mx-auto px-4 text-center">
          <p className="text-lg text-muted-foreground mb-4">Your cart is empty</p>
          <Link to="/instant-delivery" className="text-primary font-semibold hover:underline">Browse Kitchens →</Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  const missingName = !name.trim();
  const missingPhone = phone.trim().length < region.phoneMaxLength;
  const missingAddress = deliveryType !== "self-pickup" && !address.trim();
  const missingSlot = !isSnacksOnly && !selectedSlot;
  const missingZipCode = isSnacksOnly && zipCode.trim().length < 5;

  const isNotServiceable = serviceableStatus === "not_serviceable" && hasKitchens;

  const canPlaceOrder = isSnacksOnly
    ? !missingName && !missingPhone && !missingAddress && !missingZipCode && isLoggedIn && !isNotServiceable
    : !missingName && !missingPhone && !missingAddress && !missingSlot && isLoggedIn && !isNotServiceable;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-28 container mx-auto px-4 max-w-2xl">
        <Link to="/instant-delivery" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>

        <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Checkout</h1>

        {/* Cart Items */}
        <section className="bg-card border border-border rounded-2xl p-5 mb-5">
          <h2 className="font-semibold text-foreground mb-4">Your Order ({totalItems} items)</h2>
          <div className="space-y-3">
            {items.map(({ item, quantity, selectedAddOns }) => {
              const addOnsPrice = selectedAddOns.reduce((s, a) => s + a.price, 0);
              return (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground truncate">{item.name}</h4>
                      <span className="text-sm text-muted-foreground">{formatPrice(item.price)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQuantity(item.id, quantity - 1)} className="p-1 rounded bg-secondary hover:bg-primary/10 transition-colors">
                        <Minus className="w-3.5 h-3.5 text-foreground" />
                      </button>
                      <span className="text-sm font-bold w-5 text-center text-foreground">{quantity}</span>
                      <button onClick={() => updateQuantity(item.id, quantity + 1)} className="p-1 rounded bg-secondary hover:bg-primary/10 transition-colors">
                        <Plus className="w-3.5 h-3.5 text-foreground" />
                      </button>
                      <button onClick={() => removeItem(item.id)} className="p-1 ml-1 text-destructive hover:bg-destructive/10 rounded transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-foreground w-16 text-right">{formatPrice((item.price + addOnsPrice) * quantity)}</span>
                  </div>
                  {selectedAddOns.length > 0 && (
                    <div className="ml-[4.25rem] text-xs text-muted-foreground">
                      Add-ons: {selectedAddOns.map((a) => `${a.name} (+${formatPrice(a.price)})`).join(", ")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Contact & Address */}
        <section className="bg-card border border-border rounded-2xl p-5 mb-5">
          <h2 className="font-semibold text-foreground mb-4">Contact & Delivery Address</h2>
          <div className="space-y-3">
            <div className="relative">
              <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${attempted && missingName ? "text-destructive" : "text-muted-foreground"}`} />
              <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Full Name" className={`w-full pl-10 pr-4 py-3 rounded-xl bg-background border text-foreground placeholder:text-muted-foreground outline-none transition-colors ${attempted && missingName ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"}`} />
              {attempted && missingName && <p className="text-[11px] text-destructive mt-1 ml-1">Name is required</p>}
            </div>
            <div className="relative">
              <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${attempted && missingPhone ? "text-destructive" : "text-muted-foreground"}`} />
              <div className="flex">
                <span className={`flex items-center pl-10 pr-2 py-3 bg-background border border-r-0 rounded-l-xl text-sm text-muted-foreground ${attempted && missingPhone ? "border-destructive" : "border-border"}`}>{region.phonePrefix}</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder={region.phonePlaceholder} maxLength={region.phoneMaxLength} className={`w-full pr-4 py-3 rounded-r-xl bg-background border text-foreground placeholder:text-muted-foreground outline-none transition-colors ${attempted && missingPhone ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"}`} />
              </div>
              {attempted && missingPhone && <p className="text-[11px] text-destructive mt-1 ml-1">Valid phone number is required</p>}
            </div>
            {deliveryType !== "self-pickup" && (
              <div className="relative">
                <MapPin className={`absolute left-3 top-3.5 w-4 h-4 ${attempted && missingAddress ? "text-destructive" : "text-muted-foreground"}`} />
                <textarea value={address} onChange={(e) => handleAddressChange(e.target.value)} onFocus={() => address.length > 2 && setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} placeholder={region.addressPlaceholder} rows={2} className={`w-full pl-10 pr-4 py-3 rounded-xl bg-background border text-foreground placeholder:text-muted-foreground outline-none transition-colors resize-none ${attempted && missingAddress ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"}`} />
                {attempted && missingAddress && <p className="text-[11px] text-destructive mt-1 ml-1">Delivery address is required</p>}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg z-10 max-h-40 overflow-y-auto">
                    {filteredSuggestions.map((s) => (
                      <button key={s} onMouseDown={() => { setAddress(s); setShowSuggestions(false); }} className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors first:rounded-t-xl last:rounded-b-xl">
                        <MapPin className="w-3 h-3 inline mr-2 text-muted-foreground" />{s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Snacks-specific: ZIP code + city */}
            {isSnacksOnly && (
              <div className="grid grid-cols-2 gap-3">
                <input value={zipCode} onChange={(e) => setZipCode(e.target.value)} type="text" placeholder="ZIP Code" maxLength={5} className={`w-full px-4 py-3 rounded-xl bg-background border text-foreground placeholder:text-muted-foreground outline-none transition-colors ${attempted && missingZipCode ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"}`} />
                <input value={city} onChange={(e) => setCity(e.target.value)} type="text" placeholder="City" className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
              </div>
            )}
          </div>
        </section>

        {/* Delivery Options — hide for snacks */}
        {!isSnacksOnly && (
          <section className="bg-card border border-border rounded-2xl p-5 mb-5">
            <h2 className="font-semibold text-foreground mb-4">Delivery Method</h2>
            <div className="space-y-2">
              {deliveryOptionsBase.map((opt) => {
                const fee = deliveryFees[region.code]?.[opt.id] || 0;
                return (
                  <button key={opt.id} onClick={() => setDeliveryType(opt.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${deliveryType === opt.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                    <opt.icon className={`w-5 h-5 ${deliveryType === opt.id ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="flex-1 text-left">
                      <span className={`text-sm font-medium ${deliveryType === opt.id ? "text-primary" : "text-foreground"}`}>{opt.label}</span>
                      <p className="text-xs text-muted-foreground">{opt.description}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{fee === 0 ? "Free" : formatPrice(fee)}</span>
                  </button>
                );
              })}
            </div>
            {deliveryType === "third-party" && (
              <div className="mt-3 p-3 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Delivery Partner Auto-Assigned</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card border border-border text-xs">
                    <span>🚲</span>
                    <span className="text-foreground font-medium">Dunzo / Shadowfax</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Best available partner assigned based on ETA & availability.</p>
              </div>
            )}
          </section>
        )}

        {/* Delivery Schedule — hide for snacks */}
        {!isSnacksOnly && (
          <section className="bg-card border border-border rounded-2xl p-5 mb-5">
            <h2 className={`font-semibold mb-1 flex items-center gap-2 ${attempted && missingSlot ? "text-destructive" : "text-foreground"}`}>
              <Clock className={`w-4 h-4 ${attempted && missingSlot ? "text-destructive" : "text-primary"}`} /> Delivery Schedule
              {attempted && missingSlot && <span className="text-[11px] font-normal ml-auto">Please select a slot</span>}
            </h2>
            <p className="text-xs text-muted-foreground mb-4">Min {region.minPrepMinutes / 60} hr{region.minPrepMinutes > 60 ? "s" : ""} prep · {region.deliveryStartHour} AM – {region.deliveryEndHour > 12 ? `${region.deliveryEndHour - 12} PM` : `${region.deliveryEndHour} AM`}</p>
            <div className="grid grid-cols-2 gap-2">
              {slots.map((slot) => (
                <button key={slot.value} onClick={() => setSelectedSlot(slot.value)} className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${selectedSlot === slot.value ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:border-primary/30 border border-transparent"}`}>
                  {slot.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Snacks shipping info */}
        {isSnacksOnly && (
          <section className="bg-card border border-border rounded-2xl p-5 mb-5">
            <h2 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" /> Shipping Info
            </h2>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p>📦 Ships within 1-2 business days</p>
              <p>🚚 {subtotal >= 599 ? "Free shipping applied! 🎉" : `Add ${formatPrice(599 - subtotal)} more for free shipping`}</p>
              <p>🌍 Pan-India delivery via trusted courier partners</p>
            </div>
          </section>
        )}

        {/* Promo Code */}
        <section className="bg-card border border-border rounded-2xl p-5 mb-5">
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" /> Apply Promo Code
          </h2>
          {appliedPromo ? (
            <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
              <div>
                <span className="text-sm font-bold text-primary">{appliedPromo.code}</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {appliedPromo.discountType === "percentage"
                    ? `${appliedPromo.discountValue}% off${appliedPromo.maxDiscountAmount ? ` (up to ${formatPrice(appliedPromo.maxDiscountAmount)})` : ""}`
                    : `${formatPrice(appliedPromo.discountValue)} off`}
                  {" · You save "}
                  <span className="text-primary font-semibold">{formatPrice(promoDiscount)}</span>
                </p>
              </div>
              <button onClick={removePromoCode} className="text-xs text-destructive font-medium hover:underline">Remove</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && promoInput.trim() && applyPromoCode(promoInput)}
                placeholder="Enter coupon code"
                className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-primary transition-colors uppercase tracking-wider"
              />
              <button
                onClick={() => applyPromoCode(promoInput)}
                disabled={!promoInput.trim() || promoLoading}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                {promoLoading ? "..." : "Apply"}
              </button>
            </div>
          )}
        </section>

        {/* Bill Summary */}
        <section className="bg-card border border-border rounded-2xl p-5 mb-5">
          <h2 className="font-semibold text-foreground mb-4">Bill Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Item Total</span><span className="text-foreground">{formatPrice(subtotal)}</span></div>
            {promoDiscount > 0 && (
              <div className="flex justify-between text-primary">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Coupon ({appliedPromo?.code})
                </span>
                <span className="font-semibold">−{formatPrice(promoDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery Fee</span><span className="text-foreground">{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Platform Fee</span><span className="text-foreground">{formatPrice(region.platformFee)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{region.taxLabel}</span><span className="text-foreground">{formatPrice(tax)}</span></div>

            {/* Wallet */}
            {balance > 0 && (
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Wallet (Bal: {formatPrice(balance)})</span>
                  </div>
                  <Switch checked={useWalletBalance} onCheckedChange={setUseWalletBalance} />
                </div>
                {useWalletBalance && walletUsable > 0 && (
                  <p className="text-xs text-accent mt-1 ml-6">
                    −{formatPrice(walletUsable)} applied
                    {getUsableAmount(subtotalWithFees) < balance && " (50% cap on first purchase)"}
                  </p>
                )}
              </div>
            )}

            <div className="border-t border-border pt-2 flex justify-between font-bold text-base">
              <span className="text-foreground">Total</span><span className="text-foreground">{formatPrice(total)}</span>
            </div>
          </div>
        </section>

        {!isLoggedIn && <CheckoutAuth />}

        {isLoggedIn && canPlaceOrder ? (
          <PaymentSection
            total={total}
            formatPrice={formatPrice}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentFailure={handlePaymentFailure}
          />
        ) : (
          <>
            <button onClick={() => setAttempted(true)} className="w-full py-4 rounded-2xl bg-gradient-shero text-primary-foreground font-semibold text-lg opacity-70 shadow-shero hover:opacity-80 transition-opacity">
              Pay {formatPrice(total)} & Place Order
            </button>
            {isLoggedIn && (
              <p className={`text-xs text-center mt-2 ${attempted ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                {attempted ? "⚠ Please fix the highlighted fields above" : "Please fill in all details and select a delivery slot"}
              </p>
            )}
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default Checkout;
