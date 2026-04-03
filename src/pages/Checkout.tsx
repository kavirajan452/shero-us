import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Tag, Heart } from "lucide-react";
import { ArrowLeft, Minus, Plus, Trash2, MapPin, Phone, User, Clock, Truck, Package, Shield, Wallet, AlertTriangle } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";

const DELIVERY_FEE_DEFAULT = 30;
const TIP_PRESETS_DEFAULT = [5, 10, 15, 20];

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

  // Tips state
  const [tipAmount, setTipAmount] = useState(0);
  const [customTip, setCustomTip] = useState("");
  const [showCustomTip, setShowCustomTip] = useState(false);
  const [tipPresets, setTipPresets] = useState(TIP_PRESETS_DEFAULT);
  const [configDeliveryFee, setConfigDeliveryFee] = useState(DELIVERY_FEE_DEFAULT);

  // Load delivery fee and tip presets from backend config
  useEffect(() => {
    supabase.from("app_config").select("value").eq("key", "invoice_settings").maybeSingle().then(({ data }) => {
      if (data?.value && typeof data.value === "object") {
        const cfg = data.value as Record<string, string>;
        if (cfg.deliveryFee) setConfigDeliveryFee(parseFloat(cfg.deliveryFee) || DELIVERY_FEE_DEFAULT);
        if (cfg.tipPresets) {
          try { setTipPresets(JSON.parse(cfg.tipPresets)); } catch {}
        }
      }
    });
  }, []);

  // Detect if cart is snacks-only (shipped items, no time slots needed)
  const isSnacksOnly = items.length > 0 && items.every((ci) => ci.item.kitchenId === "snacks");

  const deliveryType = isSnacksOnly ? "shipping" : "self-delivery";
  const [selectedSlot, setSelectedSlot] = useState(isSnacksOnly ? "shipping" : "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [addressQuery, setAddressQuery] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<{ display: string; lat: string; lon: string; state: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [flatDoor, setFlatDoor] = useState("");
  const [floorBlock, setFloorBlock] = useState("");
  const [addressExtra, setAddressExtra] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [customerState, setCustomerState] = useState("");
  const [attempted, setAttempted] = useState(false);

  // Auto-check serviceability on mount via GPS (non-blocking)
  useEffect(() => {
    if (isSnacksOnly || serviceableStatus !== "unknown" || !hasKitchens) return;
    setServiceableStatus("checking");
    detectAndCheck().then((result) => {
      setServiceableStatus(result.serviceable ? "serviceable" : "not_serviceable");
    });
  }, [hasKitchens]); // eslint-disable-line react-hooks/exhaustive-deps

  // Also check when ZIP code is entered
  useEffect(() => {
    if (zipCode.length === 5 && hasKitchens) {
      const isServiceable = checkByZip(zipCode);
      setServiceableStatus(isServiceable ? "serviceable" : "not_serviceable");
    }
  }, [zipCode, hasKitchens, checkByZip]);

  // US state sales tax rates
  const STATE_TAX_RATES: Record<string, number> = {
    "Alabama": 0.04, "Alaska": 0, "Arizona": 0.056, "Arkansas": 0.065, "California": 0.0725,
    "Colorado": 0.029, "Connecticut": 0.0635, "Delaware": 0, "Florida": 0.06, "Georgia": 0.04,
    "Hawaii": 0.04, "Idaho": 0.06, "Illinois": 0.0625, "Indiana": 0.07, "Iowa": 0.06,
    "Kansas": 0.065, "Kentucky": 0.06, "Louisiana": 0.0445, "Maine": 0.055, "Maryland": 0.06,
    "Massachusetts": 0.0625, "Michigan": 0.06, "Minnesota": 0.06875, "Mississippi": 0.07,
    "Missouri": 0.04225, "Montana": 0, "Nebraska": 0.055, "Nevada": 0.0685, "New Hampshire": 0,
    "New Jersey": 0.06625, "New Mexico": 0.05125, "New York": 0.04, "North Carolina": 0.0475,
    "North Dakota": 0.05, "Ohio": 0.0575, "Oklahoma": 0.045, "Oregon": 0, "Pennsylvania": 0.06,
    "Rhode Island": 0.07, "South Carolina": 0.06, "South Dakota": 0.042, "Tennessee": 0.07,
    "Texas": 0.0625, "Utah": 0.061, "Vermont": 0.06, "Virginia": 0.053, "Washington": 0.065,
    "West Virginia": 0.06, "Wisconsin": 0.05, "Wyoming": 0.04, "District of Columbia": 0.06,
  };

  const localTaxRate = customerState && STATE_TAX_RATES[customerState] !== undefined
    ? STATE_TAX_RATES[customerState] : region.taxRate;
  const localTaxLabel = customerState
    ? `Sales Tax (${(localTaxRate * 100).toFixed(2)}% · ${customerState})`
    : region.taxLabel;

  const deliveryFee = isSnacksOnly ? (subtotal >= 599 ? 0 : 49) : configDeliveryFee;
  const tax = Math.round((subtotal - promoDiscount) * localTaxRate);
  const subtotalWithFees = subtotal - promoDiscount + deliveryFee + tax + tipAmount;
  const walletUsable = useWalletBalance ? getUsableAmount(subtotalWithFees) : 0;
  const total = subtotalWithFees - walletUsable;

  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSession, setSelectedSession] = useState<"Lunch" | "Dinner" | "">("");

  const deliveryDays = useMemo(() => {
    const now = new Date();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return [1, 2, 3].map(d => {
      const date = new Date(now);
      date.setDate(date.getDate() + d);
      return {
        index: d,
        label: d === 1 ? "Tomorrow" : `${dayNames[date.getDay()]}`,
        date: `${monthNames[date.getMonth()]} ${date.getDate()}`,
        fullDate: date,
      };
    });
  }, []);

  const sessionSlots = useMemo(() => {
    if (!selectedDay || !selectedSession) return [];
    const hours = selectedSession === "Lunch" ? [12, 13, 14] : [19, 20, 21];
    const day = deliveryDays.find(d => d.index === selectedDay);
    if (!day) return [];
    const fmt = (d: Date) => d.toLocaleTimeString(region.locale, { hour: "2-digit", minute: "2-digit", hour12: true });
    return hours.map(h => {
      const start = new Date(day.fullDate);
      start.setHours(h, 0, 0, 0);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      return { label: `${fmt(start)} – ${fmt(end)}`, value: `d${selectedDay}-${h}` };
    });
  }, [selectedDay, selectedSession, deliveryDays, region]);

  // Debounced address search via Nominatim
  useEffect(() => {
    if (addressQuery.length < 3) { setAddressSuggestions([]); return; }
    const timer = setTimeout(async () => {
      setSearchingAddress(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressQuery)}&format=json&limit=5&addressdetails=1&countrycodes=us`);
        const data = await res.json();
        setAddressSuggestions(data.map((d: any) => ({ display: d.display_name, lat: d.lat, lon: d.lon, state: d.address?.state || "" })));
        setShowSuggestions(true);
      } catch { setAddressSuggestions([]); }
      setSearchingAddress(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [addressQuery]);

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
      platform_fee: 0,
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
  const missingAddress = !address.trim();
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
            {items.map(({ item, quantity, selectedAddOns }, index) => {
              const addOnsPrice = selectedAddOns.reduce((s, a) => s + a.price, 0);
              return (
                <div key={item.id} className="space-y-2 pb-3 border-b border-border last:border-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-bold text-muted-foreground mt-0.5 w-5 shrink-0">{index + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground leading-snug">{item.name}</h4>
                      <span className="text-xs text-muted-foreground">{formatPrice(item.price)}</span>
                      {selectedAddOns.length > 0 && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Add-ons: {selectedAddOns.map((a) => `${a.name} (+${formatPrice(a.price)})`).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between ml-8">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQuantity(item.id, quantity - 1)} className="p-1.5 rounded-lg bg-secondary hover:bg-primary/10 transition-colors">
                        <Minus className="w-3.5 h-3.5 text-foreground" />
                      </button>
                      <span className="text-sm font-bold w-6 text-center text-foreground">{quantity}</span>
                      <button onClick={() => updateQuantity(item.id, quantity + 1)} className="p-1.5 rounded-lg bg-secondary hover:bg-primary/10 transition-colors">
                        <Plus className="w-3.5 h-3.5 text-foreground" />
                      </button>
                      <button onClick={() => removeItem(item.id)} className="p-1.5 ml-1 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-foreground">{formatPrice((item.price + addOnsPrice) * quantity)}</span>
                  </div>
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
            {/* Address auto-suggest */}
            <div className="relative">
              <MapPin className={`absolute left-3 top-3.5 w-4 h-4 ${attempted && missingAddress ? "text-destructive" : "text-muted-foreground"}`} />
              <input
                value={address ? address : addressQuery}
                onChange={(e) => { setAddressQuery(e.target.value); setAddress(""); }}
                onFocus={() => addressSuggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search address..."
                className={`w-full pl-10 pr-4 py-3 rounded-xl bg-background border text-foreground placeholder:text-muted-foreground outline-none transition-colors ${attempted && missingAddress ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"}`}
              />
              {searchingAddress && <span className="absolute right-3 top-3.5 text-xs text-muted-foreground">Searching…</span>}
              {attempted && missingAddress && <p className="text-[11px] text-destructive mt-1 ml-1">Delivery address is required</p>}
              {showSuggestions && addressSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                  {addressSuggestions.map((s, i) => (
                    <button key={i} onMouseDown={() => { setAddress(s.display); setAddressQuery(s.display); setShowSuggestions(false); if (s.state) setCustomerState(s.state); }} className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors first:rounded-t-xl last:rounded-b-xl">
                      <MapPin className="w-3 h-3 inline mr-2 text-muted-foreground" />{s.display}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Extra address fields */}
            <div className="grid grid-cols-2 gap-3">
              <input value={flatDoor} onChange={(e) => setFlatDoor(e.target.value)} type="text" placeholder="Flat / Door No." className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors text-sm" />
              <input value={floorBlock} onChange={(e) => setFloorBlock(e.target.value)} type="text" placeholder="Floor / Block / Wing" className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors text-sm" />
            </div>
            <input value={addressExtra} onChange={(e) => setAddressExtra(e.target.value)} type="text" placeholder="Landmark / Extra directions (optional)" className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors text-sm" />
            {/* Snacks-specific: ZIP code + city */}
            {isSnacksOnly && (
              <div className="grid grid-cols-2 gap-3">
                <input value={zipCode} onChange={(e) => setZipCode(e.target.value)} type="text" placeholder="ZIP Code" maxLength={5} className={`w-full px-4 py-3 rounded-xl bg-background border text-foreground placeholder:text-muted-foreground outline-none transition-colors ${attempted && missingZipCode ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"}`} />
                <input value={city} onChange={(e) => setCity(e.target.value)} type="text" placeholder="City" className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
              </div>
            )}
          </div>
        </section>

        {/* Serviceability Check Banner */}
        {serviceableStatus === "checking" && (
          <section className="bg-card border border-border rounded-2xl p-5 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Checking delivery availability for your location…</p>
            </div>
          </section>
        )}

        {isNotServiceable && (
          <section className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5 mb-5">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-destructive">Outside Delivery Area</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  We currently deliver within {radiusMiles} miles of our partner kitchens.
                  {detectedLocation && ` Your location: ${detectedLocation}.`}
                </p>
              </div>
            </div>
            <NonServiceableArea detectedLocation={detectedLocation || undefined} zipCode={zipCode || undefined} />
          </section>
        )}

        {/* Delivery Info — fixed fee, delivery only */}
        {!isSnacksOnly && !isNotServiceable && (
          <section className="bg-card border border-border rounded-2xl p-5 mb-5">
            <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" /> Delivery
            </h2>
            <div className="flex items-center justify-between p-3 rounded-xl border border-primary bg-primary/5 mb-4">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-primary" />
                <div>
                  <span className="text-sm font-medium text-primary">Home Delivery</span>
                  <p className="text-xs text-muted-foreground">Delivered by Shero partner</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-foreground">{formatPrice(configDeliveryFee)}</span>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-medium text-foreground">Choose delivery slot</p>
              {/* Step 1: Pick a day */}
              <div className="flex gap-2">
                {deliveryDays.map(day => (
                  <button
                    key={day.index}
                    type="button"
                    onClick={() => { setSelectedDay(day.index); setSelectedSession(""); setSelectedSlot(""); }}
                    className={`flex-1 rounded-xl border px-2 py-2 text-center transition-colors ${selectedDay === day.index ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground hover:border-primary/30"}`}
                  >
                    <span className="block text-xs font-semibold">{day.label}</span>
                    <span className="block text-[10px] text-muted-foreground">{day.date}</span>
                  </button>
                ))}
              </div>
              {/* Step 2: Pick session */}
              {selectedDay > 0 && (
                <div className="flex gap-2">
                  {(["Lunch", "Dinner"] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => { setSelectedSession(s); setSelectedSlot(""); }}
                      className={`flex-1 rounded-xl border px-2 py-2 text-xs font-medium transition-colors ${selectedSession === s ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground hover:border-primary/30"}`}
                    >
                      {s === "Lunch" ? "🍛 Lunch" : "🍽️ Dinner"}
                    </button>
                  ))}
                </div>
              )}
              {/* Step 3: Pick time slot */}
              {sessionSlots.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {sessionSlots.map(slot => (
                    <button
                      key={slot.value}
                      type="button"
                      onClick={() => setSelectedSlot(slot.value)}
                      className={`rounded-xl border px-2 py-2.5 text-center text-xs font-medium transition-colors ${selectedSlot === slot.value ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground hover:border-primary/30"}`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              )}
              {attempted && missingSlot && <p className="text-[11px] text-destructive">Please select a delivery slot</p>}
            </div>
          </section>
        )}

        {/* Tips Section */}
        {!isSnacksOnly && !isNotServiceable && (
          <section className="bg-card border border-border rounded-2xl p-5 mb-5">
            <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" /> Tip Your Home Chef
            </h2>
            <p className="text-xs text-muted-foreground mb-3">100% of tips go to your kitchen partner</p>
            <div className="flex gap-2 flex-wrap">
              {tipPresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => { setTipAmount(preset); setShowCustomTip(false); setCustomTip(""); }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tipAmount === preset && !showCustomTip ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:border-primary/30 border border-transparent"}`}
                >
                  {formatPrice(preset)}
                </button>
              ))}
              <button
                onClick={() => { setShowCustomTip(true); setTipAmount(0); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${showCustomTip ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:border-primary/30 border border-transparent"}`}
              >
                Custom
              </button>
              {tipAmount > 0 && !showCustomTip && (
                <button
                  onClick={() => setTipAmount(0)}
                  className="px-3 py-2 rounded-xl text-xs text-destructive hover:bg-destructive/10 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
            {showCustomTip && (
              <div className="mt-3 flex gap-2">
                <input
                  type="number"
                  value={customTip}
                  onChange={(e) => setCustomTip(e.target.value)}
                  placeholder="Enter amount"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-primary transition-colors"
                  min="0"
                />
                <button
                  onClick={() => { const val = parseFloat(customTip) || 0; setTipAmount(val); }}
                  className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
                >
                  Add
                </button>
              </div>
            )}
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
              <p>🇺🇸 Nationwide delivery via trusted courier partners</p>
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
            
            <div className="flex justify-between"><span className="text-muted-foreground">{region.taxLabel}</span><span className="text-foreground">{formatPrice(tax)}</span></div>
            {tipAmount > 0 && (
              <div className="flex justify-between text-primary">
                <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> Tip</span>
                <span className="font-semibold">{formatPrice(tipAmount)}</span>
              </div>
            )}

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
            <button onClick={() => { if (isLoggedIn) setAttempted(true); }} className="w-full py-4 rounded-2xl bg-gradient-shero text-primary-foreground font-semibold text-lg opacity-70 shadow-shero hover:opacity-80 transition-opacity">
              Pay {formatPrice(total)} & Place Order
            </button>
            {isLoggedIn && attempted && (
              <p className="text-xs text-center mt-2 text-destructive font-medium">
                ⚠ Please fix the highlighted fields above
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
