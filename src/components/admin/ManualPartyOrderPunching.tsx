import { useState, useMemo } from "react";
import { checkMinPrepTime } from "@/utils/prepTimeValidation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRegion } from "@/contexts/RegionContext";
import ManualPunchingMenuSelection, { type SelectedCartItem } from "./ManualPunchingMenuSelection";
import {
  comboCategoryConfigs,
  comboMenuItems,
  type ComboCategory,
  type ComboFoodType,
  type ComboItem,
} from "@/data/comboMenuData";
import {
  User, Phone, MapPin, Users, CalendarDays, Clock, ChefHat,
  CheckCircle2, ArrowRight, ArrowLeft, Percent, ShoppingCart, Package,
} from "lucide-react";

const MAX_DISCOUNT_PERCENT = 7;

type Step = "customer" | "order" | "discount" | "confirm";

interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  occasion: string;
}

const sessionOptions = [
  { value: "breakfast", label: "Breakfast", emoji: "🌅" },
  { value: "lunch", label: "Lunch", emoji: "☀️" },
  { value: "snacks", label: "Snacks", emoji: "🍿" },
  { value: "dinner", label: "Dinner", emoji: "🌙" },
];

const ManualPartyOrderPunching = () => {
  const { toast } = useToast();
  const { formatPrice } = useRegion();

  const [step, setStep] = useState<Step>("customer");
  const [customer, setCustomer] = useState<CustomerInfo>({ name: "", phone: "", address: "", occasion: "" });

  // Service type
  const [serviceType, setServiceType] = useState<"bulk-food" | "combo-meal-box">("bulk-food");

  // Order details
  const [guestCount, setGuestCount] = useState(25);
  const [eventDate, setEventDate] = useState("");
  const [servingTime, setServingTime] = useState("");
  const [foodType, setFoodType] = useState<"veg" | "nonveg">("veg");
  const [sessions, setSessions] = useState<string[]>(["lunch"]);
  const [notes, setNotes] = useState("");

  // Bulk food menu selection
  const [selectedItems, setSelectedItems] = useState<Map<string, SelectedCartItem>>(new Map());

  // Combo selection state
  const [comboCategories, setComboCategories] = useState<ComboCategory[]>([]);
  const [comboSelections, setComboSelections] = useState<Record<ComboCategory, string[]>>({} as any);

  // Auto-calculated order total
  const orderTotal = useMemo(() => {
    if (serviceType === "combo-meal-box") {
      return comboCategories.reduce((sum, cat) => {
        const config = comboCategoryConfigs.find(c => c.id === cat);
        return sum + (config?.pricePerBox || 0);
      }, 0) * guestCount;
    }
    let sum = 0;
    selectedItems.forEach(item => { sum += item.pricePerPlate; });
    return sum * guestCount;
  }, [selectedItems, guestCount, serviceType, comboCategories]);

  // Discount
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountApprovalRequested, setDiscountApprovalRequested] = useState(false);
  const [discountApproved, setDiscountApproved] = useState(false);
  const [tlRemarks, setTlRemarks] = useState("");

  const discountAmount = Math.round(orderTotal * (discountPercent / 100));
  const finalTotal = orderTotal - discountAmount;

  const handleRequestApproval = () => {
    if (discountPercent <= 0) {
      toast({ title: "Enter discount %", description: "Please enter a discount percentage before requesting approval.", variant: "destructive" });
      return;
    }
    if (discountPercent > MAX_DISCOUNT_PERCENT) {
      toast({ title: `Max ${MAX_DISCOUNT_PERCENT}% discount`, description: `Discount cannot exceed ${MAX_DISCOUNT_PERCENT}%.`, variant: "destructive" });
      return;
    }
    setDiscountApprovalRequested(true);
    toast({ title: "📩 Approval Request Sent", description: `${discountPercent}% discount request sent to Team Leader for order ${formatPrice(orderTotal)}.` });
    setTimeout(() => {
      setDiscountApproved(true);
      toast({ title: "✅ Discount Approved", description: `Team Leader approved ${discountPercent}% discount.` });
    }, 2000);
  };

  const handleConfirmOrder = () => {
    const itemCount = serviceType === "combo-meal-box" 
      ? comboCategories.reduce((sum, cat) => sum + (comboSelections[cat]?.length || 0), 0)
      : selectedItems.size;
    toast({ title: "🎉 Order Punched!", description: `${serviceType === "combo-meal-box" ? "Combo" : "Bulk"} party order for ${customer.name} (${guestCount} guests, ${itemCount} items) confirmed at ${formatPrice(finalTotal)}.` });
    setStep("customer");
    setCustomer({ name: "", phone: "", address: "", occasion: "" });
    setGuestCount(25);
    setEventDate("");
    setServingTime("");
    setSelectedItems(new Map());
    setComboCategories([]);
    setComboSelections({} as any);
    setServiceType("bulk-food");
    setDiscountPercent(0);
    setDiscountApprovalRequested(false);
    setDiscountApproved(false);
    setNotes("");
  };

  // Group selected items by cuisine for display
  const groupedItems = useMemo(() => {
    const groups: Record<string, SelectedCartItem[]> = {};
    selectedItems.forEach(item => {
      const key = item.cuisineName || "Other";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [selectedItems]);

  return (
    <div className="space-y-4">
      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs">
        {(["customer", "order", "discount", "confirm"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step === s ? "bg-primary text-primary-foreground" : i < ["customer", "order", "discount", "confirm"].indexOf(step) ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
            }`}>{i + 1}</span>
            <span className={`hidden sm:inline text-[10px] ${step === s ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              {s === "customer" ? "Customer" : s === "order" ? "Menu" : s === "discount" ? "Discount" : "Confirm"}
            </span>
            {i < 3 && <span className="text-muted-foreground mx-1">→</span>}
          </div>
        ))}
      </div>

      {/* Step 1: Customer */}
      {step === "customer" && (
        <Card className="p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <User className="w-4 h-4 text-primary" /> Customer Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">Customer Name *</label>
              <Input value={customer.name} onChange={(e) => setCustomer(p => ({ ...p, name: e.target.value }))} placeholder="Full name" className="text-xs" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">Phone Number *</label>
              <Input value={customer.phone} onChange={(e) => setCustomer(p => ({ ...p, phone: e.target.value }))} placeholder="10-digit mobile" className="text-xs" maxLength={10} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] text-muted-foreground mb-1 block">Delivery Address *</label>
              <Input value={customer.address} onChange={(e) => setCustomer(p => ({ ...p, address: e.target.value }))} placeholder="Full delivery address" className="text-xs" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">Occasion</label>
              <select value={customer.occasion} onChange={(e) => setCustomer(p => ({ ...p, occasion: e.target.value }))} className="w-full px-2.5 py-2 rounded-md border border-border bg-background text-foreground text-xs">
                <option value="">Select occasion</option>
                <option value="Wedding">Wedding</option>
                <option value="Engagement">Engagement</option>
                <option value="Birthday">Birthday</option>
                <option value="House Warming">House Warming</option>
                <option value="Corporate">Corporate Event</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => {
              if (!customer.name || !customer.phone || !customer.address) {
                toast({ title: "Fill required fields", variant: "destructive" });
                return;
              }
              setStep("order");
            }}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-1.5 hover:opacity-90"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        </Card>
      )}

      {/* Step 2: Order Details + Menu Selection */}
      {step === "order" && (
        <Card className="p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <ChefHat className="w-4 h-4 text-primary" /> Order Details & Menu
          </h3>

          {/* Service Type Selector */}
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Service Type</label>
            <div className="flex gap-2">
              {([{ v: "bulk-food" as const, l: "🍲 Bulk Food" }, { v: "combo-meal-box" as const, l: "🍱 Combo Meal Box" }]).map(st => (
                <button key={st.v} onClick={() => setServiceType(st.v)} className={`flex-1 py-2.5 rounded-lg text-xs font-medium border transition-colors ${serviceType === st.v ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border"}`}>
                  {st.l}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Guests (10–50)</label>
              <Input type="number" min={10} max={50} value={guestCount} onChange={(e) => setGuestCount(Math.min(50, Math.max(10, parseInt(e.target.value) || 10)))} className="text-xs" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Event Date</label>
              <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="text-xs" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block">Food Type</label>
              <div className="flex gap-2">
                {(["veg", "nonveg"] as const).map(ft => (
                  <button key={ft} onClick={() => setFoodType(ft)} className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${foodType === ft ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border"}`}>
                    {ft === "veg" ? "🥬 Veg" : "🍗 Non-Veg"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Serving Time</label>
              <Input type="time" value={servingTime} onChange={(e) => setServingTime(e.target.value)} className="text-xs" />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Sessions</label>
            <div className="flex gap-1.5 flex-wrap">
              {sessionOptions.map(s => {
                const selected = sessions.includes(s.value);
                return (
                  <button key={s.value} onClick={() => setSessions(prev => selected ? prev.filter(x => x !== s.value) : [...prev, s.value])} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selected ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border"}`}>
                    {s.emoji} {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Menu Selection — branched by service type */}
          <div className="border-t border-border pt-3">
            {serviceType === "bulk-food" ? (
              <>
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
                  <ShoppingCart className="w-3.5 h-3.5 text-primary" /> Select Menu Items (Bulk)
                </h4>
                <ManualPunchingMenuSelection
                  selectedItems={selectedItems}
                  onSelectionChange={setSelectedItems}
                  guestCount={guestCount}
                />
              </>
            ) : (
              <>
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
                  <Package className="w-3.5 h-3.5 text-primary" /> Build Combo Boxes
                </h4>
                {/* Category Selection */}
                <div className="mb-3">
                  <label className="text-[10px] text-muted-foreground mb-1 block">Select Combo Categories</label>
                  <div className="flex gap-2">
                    {comboCategoryConfigs.map(cat => {
                      const isSelected = comboCategories.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setComboCategories(prev => isSelected ? prev.filter(c => c !== cat.id) : [...prev, cat.id])}
                          className={`flex-1 py-3 rounded-xl border text-center transition-all ${isSelected ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/30" : "bg-background text-muted-foreground border-border hover:border-primary/40"}`}
                        >
                          <span className="text-lg block">{cat.emoji}</span>
                          <span className="text-xs font-medium block">{cat.label}</span>
                          <span className="text-[9px] opacity-70">{cat.minItems}-{cat.maxItems} items</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Item selection per category */}
                {comboCategories.map(catId => {
                  const config = comboCategoryConfigs.find(c => c.id === catId)!;
                  const comboFoodType: ComboFoodType = foodType === "veg" ? "veg" : "non-veg";
                  const items = comboMenuItems[catId][comboFoodType];
                  const selected = comboSelections[catId] || [];
                  return (
                    <div key={catId} className="mb-3 p-3 bg-secondary/50 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">{config.emoji} {config.label}</span>
                        <Badge variant="secondary" className="text-[10px]">{selected.length}/{config.maxItems} items</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {items.map(item => {
                          const isChecked = selected.includes(item.id);
                          const atMax = selected.length >= config.maxItems && !isChecked;
                          return (
                            <button
                              key={item.id}
                              disabled={atMax}
                              onClick={() => {
                                setComboSelections(prev => ({
                                  ...prev,
                                  [catId]: isChecked ? selected.filter(id => id !== item.id) : [...selected, item.id],
                                }));
                              }}
                              className={`flex items-center gap-1.5 p-2 rounded-lg text-left text-xs border transition-all ${isChecked ? "bg-primary/10 border-primary/40 text-foreground" : "bg-background border-border text-muted-foreground"} ${atMax ? "opacity-40 cursor-not-allowed" : ""}`}
                            >
                              <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] shrink-0 ${isChecked ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"}`}>
                                {isChecked && "✓"}
                              </span>
                              <span className="truncate">{item.emoji} {item.name}</span>
                              <span className="ml-auto text-[10px] shrink-0">${item.price}</span>
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[9px] text-muted-foreground">${config.pricePerBox}/box × {guestCount} = {formatPrice(config.pricePerBox * guestCount)}</p>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Internal Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any notes for this order..." className="w-full px-2.5 py-2 rounded-lg border border-border bg-background text-foreground text-xs min-h-[60px] resize-none outline-none focus:border-primary" maxLength={300} />
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep("customer")} className="flex-1 py-2.5 rounded-lg border border-border text-foreground text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-secondary">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => {
                if (!eventDate || sessions.length === 0) {
                  toast({ title: "Fill event details", description: "Date and at least one session are required.", variant: "destructive" });
                  return;
                }
                // Minimum prep time validation
                const prepErr = checkMinPrepTime(eventDate, servingTime);
                if (prepErr) {
                  toast({ title: "⏰ Insufficient Prep Time", description: prepErr, variant: "destructive" });
                  return;
                }
                if (serviceType === "bulk-food" && selectedItems.size === 0) {
                  toast({ title: "Select menu items", description: "Please select at least one menu item.", variant: "destructive" });
                  return;
                }
                if (serviceType === "combo-meal-box") {
                  if (comboCategories.length === 0) {
                    toast({ title: "Select categories", description: "Pick at least one combo category.", variant: "destructive" });
                    return;
                  }
                  const hasMinItems = comboCategories.every(cat => {
                    const config = comboCategoryConfigs.find(c => c.id === cat)!;
                    return (comboSelections[cat]?.length || 0) >= config.minItems;
                  });
                  if (!hasMinItems) {
                    toast({ title: "Select minimum items", description: "Each combo category needs its minimum items.", variant: "destructive" });
                    return;
                  }
                }
                setStep("discount");
              }}
              className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-1.5 hover:opacity-90"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </Card>
      )}

      {/* Step 3: Discount */}
      {step === "discount" && (
        <Card className="p-4 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-primary" /> Discount & Approval
          </h3>

          <div className="p-3 bg-secondary rounded-xl space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                {serviceType === "combo-meal-box"
                  ? `Order Total (${comboCategories.length} combo${comboCategories.length > 1 ? "s" : ""} × ${guestCount} guests)`
                  : `Order Total (${selectedItems.size} items × ${guestCount} guests)`}
              </span>
              <span className="font-bold text-foreground">{formatPrice(orderTotal)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Service Type</span>
              <Badge className={`text-[9px] ${serviceType === "bulk-food" ? "bg-orange-100 text-orange-800" : "bg-violet-100 text-violet-800"}`}>
                {serviceType === "bulk-food" ? "🍲 Bulk Food" : "🍱 Combo Box"}
              </Badge>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Customer</span>
              <span className="text-foreground">{customer.name}</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Discount % (max {MAX_DISCOUNT_PERCENT}%)</label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                min={0}
                max={MAX_DISCOUNT_PERCENT}
                value={discountPercent || ""}
                onChange={(e) => {
                  const val = Math.min(MAX_DISCOUNT_PERCENT, Math.max(0, parseInt(e.target.value) || 0));
                  setDiscountPercent(val);
                  setDiscountApprovalRequested(false);
                  setDiscountApproved(false);
                }}
                className="text-xs w-24"
                placeholder="0"
              />
              <span className="text-xs text-muted-foreground">%</span>
              {discountPercent > 0 && (
                <span className="text-xs text-primary font-medium">-{formatPrice(discountAmount)}</span>
              )}
            </div>
          </div>

          {discountPercent > 0 && (
            <div className="p-3 bg-secondary rounded-xl">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Discount ({discountPercent}%)</span>
                <span className="text-destructive font-medium">-{formatPrice(discountAmount)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-border pt-1">
                <span className="text-foreground">Final Total</span>
                <span className="text-primary">{formatPrice(finalTotal)}</span>
              </div>
            </div>
          )}

          {discountPercent > 0 && !discountApproved && (
            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Reason for discount (for TL)</label>
                <Input value={tlRemarks} onChange={(e) => setTlRemarks(e.target.value)} placeholder="E.g. Repeat customer, bulk order..." className="text-xs" />
              </div>
              {!discountApprovalRequested ? (
                <button onClick={handleRequestApproval} className="w-full py-2 rounded-lg border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/5 transition-colors">
                  🙋 Request Team Leader Approval
                </button>
              ) : (
                <div className="p-2.5 rounded-lg bg-secondary border border-border text-[10px] text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3 h-3 animate-spin" /> Waiting for Team Leader approval...
                </div>
              )}
            </div>
          )}

          {discountApproved && (
            <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs text-primary flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Team Leader approved {discountPercent}% discount
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={() => setStep("order")} className="flex-1 py-2.5 rounded-lg border border-border text-foreground text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-secondary">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => {
                if (discountPercent > 0 && !discountApproved) {
                  toast({ title: "Approval pending", description: "Wait for Team Leader approval before proceeding.", variant: "destructive" });
                  return;
                }
                setStep("confirm");
              }}
              className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-1.5 hover:opacity-90"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </Card>
      )}

      {/* Step 4: Confirm */}
      {step === "confirm" && (
        <Card className="p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-primary" /> Confirm & Punch Order
          </h3>

          <div className="space-y-2">
            <div className="p-3 bg-secondary rounded-xl text-xs space-y-1">
              <p className="font-semibold text-foreground">{customer.name}</p>
              <p className="text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> {customer.phone}</p>
              <p className="text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {customer.address}</p>
              {customer.occasion && <p className="text-muted-foreground">🎉 {customer.occasion}</p>}
            </div>

            <div className="p-3 bg-secondary rounded-xl text-xs space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Service Type</span>
                <Badge className={`text-[9px] ${serviceType === "bulk-food" ? "bg-orange-100 text-orange-800" : "bg-violet-100 text-violet-800"}`}>
                  {serviceType === "bulk-food" ? "🍲 Bulk Food" : "🍱 Combo Box"}
                </Badge>
              </div>
              <div className="flex justify-between"><span className="text-muted-foreground">Guests</span><span className="text-foreground font-medium">{guestCount}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="text-foreground font-medium">{eventDate}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="text-foreground font-medium">{servingTime || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Food</span><span className="text-foreground font-medium">{foodType === "veg" ? "🥬 Veg" : "🍗 Non-Veg"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Sessions</span><span className="text-foreground font-medium">{sessions.join(", ")}</span></div>
            </div>

            {serviceType === "bulk-food" ? (
              <div className="p-3 bg-secondary rounded-xl text-xs space-y-2">
                <p className="font-semibold text-foreground flex items-center gap-1"><ShoppingCart className="w-3 h-3" /> Menu Items ({selectedItems.size})</p>
                {Object.entries(groupedItems).map(([cuisine, items]) => (
                  <div key={cuisine}>
                    <p className="text-[10px] text-muted-foreground font-medium mb-0.5">{cuisine}</p>
                    {items.map(item => (
                      <div key={item.itemId} className="flex justify-between pl-2">
                        <span className="text-foreground">{item.itemName}</span>
                        <span className="text-muted-foreground">{formatPrice(item.pricePerPlate)}/plate</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-secondary rounded-xl text-xs space-y-2">
                <p className="font-semibold text-foreground flex items-center gap-1"><Package className="w-3 h-3" /> Combo Boxes ({comboCategories.length})</p>
                {comboCategories.map(catId => {
                  const config = comboCategoryConfigs.find(c => c.id === catId)!;
                  const comboFoodType: ComboFoodType = foodType === "veg" ? "veg" : "non-veg";
                  const items = comboMenuItems[catId][comboFoodType];
                  const selected = comboSelections[catId] || [];
                  return (
                    <div key={catId}>
                      <p className="text-[10px] text-muted-foreground font-medium mb-0.5">{config.emoji} {config.label} — ${config.pricePerBox}/box</p>
                      {selected.map(id => {
                        const item = items.find(i => i.id === id);
                        return item ? (
                          <div key={id} className="flex justify-between pl-2">
                            <span className="text-foreground">{item.emoji} {item.name}</span>
                            <span className="text-muted-foreground">{item.portionSize} {item.portionUnit}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="p-3 bg-secondary rounded-xl text-xs space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Order Total</span><span className="text-foreground">{formatPrice(orderTotal)}</span></div>
              {discountPercent > 0 && (
                <div className="flex justify-between"><span className="text-muted-foreground">Discount ({discountPercent}%)</span><span className="text-destructive">-{formatPrice(discountAmount)}</span></div>
              )}
              <div className="flex justify-between font-bold border-t border-border pt-1">
                <span className="text-foreground">Final Total</span>
                <span className="text-primary text-sm">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {notes && (
              <div className="p-2 bg-secondary rounded-lg border border-border text-[10px] text-muted-foreground">
                <span className="font-medium text-foreground">📝 Notes:</span> {notes}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep("discount")} className="flex-1 py-2.5 rounded-lg border border-border text-foreground text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-secondary">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={handleConfirmOrder} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-1.5 hover:opacity-90">
              ✅ Punch Order
            </button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ManualPartyOrderPunching;
