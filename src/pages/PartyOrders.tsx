import { useState, useMemo, useCallback, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useCreatePartyOrder } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import jsPDF from "jspdf";
import { useScreenContent, contentMap } from "@/hooks/useScreenContent";
import { checkMinPrepTime } from "@/utils/prepTimeValidation";
import Navbar from "@/components/Navbar";
import bulkFoodImg from "@/assets/bulk-food-icon.png";
import comboIdliImg from "@/assets/combo-idli.png";
import comboVadaImg from "@/assets/combo-vada.png";
import comboThaliImg from "@/assets/combo-thali.png";
import Footer from "@/components/Footer";
import {
  comboCategoryConfigs,
  comboMenuItems,
  getComboItemsBySubCategory,
  getComboCategoryConfig,
  type ComboCategory,
  type ComboFoodType,
  type ComboSelection,
} from "@/data/comboMenuData";
import BottomNav from "@/components/BottomNav";
import PartyLeadCapture from "@/components/PartyLeadCapture";
import PaymentSection from "@/components/PaymentSection";
import type { PaymentMethod } from "@/components/PaymentSection";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRegion } from "@/contexts/RegionContext";
import { useToast } from "@/hooks/use-toast";
import { saveIncompleteOrderAsync } from "@/data/incompleteOrderStore";
import {
  calculatePackingCharges,
  getPackingConfig,
  PACKING_INFO_TEXT,
  type PackingBreakdownItem,
} from "@/data/packingChargesConfig";
import {
  occasions,
  othersSpecialPrices,
  southIndianRegions,
  allMenuTypes,
  type PartyMenuType,
  type RegionalMenu,
} from "@/data/partyMenuData";
import {
  getCurrentLead,
  saveOrderForLead,
  markOrderPlaced,
  findLeadByPhoneAsync,
  setCurrentLead,
  type PartyLead,
} from "@/data/partyLeadsStore";
import {
  ArrowLeft,
  ArrowRight,
  Users,
  CalendarDays,
  Clock,
  Sparkles,
  ShoppingCart,
  Check,
  Info,
  UtensilsCrossed,
  Save,
  Share2,
  Plus,
  Download,
  MessageCircle,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Package,
} from "lucide-react";

type ServiceType = "combo-meal-box" | "bulk-food";
type FoodType = "veg" | "non-veg";

const serviceTypeOptions: { value: ServiceType; label: string; emoji: string; desc: string }[] = [
  { value: "combo-meal-box", label: "Combo Meal Box", emoji: "🍱", desc: "3–5 course packed meal, individually packed per guest" },
  { value: "bulk-food", label: "Bulk Food", emoji: "🍲", desc: "Each item given in bulk for serving in a food line" },
];
type MenuChoice = "chettinad" | "kerala" | "andhra" | "north-indian" | "south-indian-mix";
type SessionType = "breakfast" | "lunch" | "snacks" | "dinner";

const foodTypeOptions: { value: FoodType; label: string; emoji: string; desc: string }[] = [
  { value: "veg", label: "Vegetarian", emoji: "🥬", desc: "Pure veg meals with no meat or eggs" },
  { value: "non-veg", label: "Non-Vegetarian", emoji: "🍗", desc: "Includes chicken, mutton, fish & more" },
];

const menuChoiceOptions: { value: MenuChoice; label: string; emoji: string; desc: string }[] = [
  { value: "chettinad", label: "Chettinad", emoji: "🔥", desc: "Traditional Chettinad cuisine" },
  { value: "kerala", label: "Kerala", emoji: "🥥", desc: "Traditional Kerala Sadya & rice combos" },
  { value: "andhra", label: "Andhra", emoji: "🌶️", desc: "Spicy Andhra cuisine" },
  { value: "north-indian", label: "North Indian", emoji: "🫓", desc: "Paneer, Biryani, Naan & more" },
  { value: "south-indian-mix", label: "South Indian Mix", emoji: "🍛", desc: "Best of all South Indian" },
];

const sessionOptions: { value: SessionType; label: string; emoji: string; time: string }[] = [
  { value: "breakfast", label: "Breakfast", emoji: "🌅", time: "8–11 AM" },
  { value: "lunch", label: "Lunch", emoji: "☀️", time: "11 AM–4 PM" },
  { value: "snacks", label: "Snacks", emoji: "🍿", time: "4–7 PM" },
  { value: "dinner", label: "Dinner", emoji: "🌙", time: "7–10 PM" },
];


const sessionServingTimes: Record<SessionType, { value: string; label: string }[]> = {
  breakfast: [
    { value: "08:00", label: "8:00 AM" },
    { value: "08:30", label: "8:30 AM" },
    { value: "09:00", label: "9:00 AM" },
    { value: "09:30", label: "9:30 AM" },
    { value: "10:00", label: "10:00 AM" },
    { value: "10:30", label: "10:30 AM" },
  ],
  lunch: [
    { value: "11:00", label: "11:00 AM" },
    { value: "11:30", label: "11:30 AM" },
    { value: "12:00", label: "12:00 PM" },
    { value: "12:30", label: "12:30 PM" },
    { value: "13:00", label: "1:00 PM" },
    { value: "13:30", label: "1:30 PM" },
    { value: "14:00", label: "2:00 PM" },
    { value: "14:30", label: "2:30 PM" },
    { value: "15:00", label: "3:00 PM" },
    { value: "15:30", label: "3:30 PM" },
  ],
  snacks: [
    { value: "16:00", label: "4:00 PM" },
    { value: "16:30", label: "4:30 PM" },
    { value: "17:00", label: "5:00 PM" },
    { value: "17:30", label: "5:30 PM" },
    { value: "18:00", label: "6:00 PM" },
    { value: "18:30", label: "6:30 PM" },
  ],
  dinner: [
    { value: "19:00", label: "7:00 PM" },
    { value: "19:30", label: "7:30 PM" },
    { value: "20:00", label: "8:00 PM" },
    { value: "20:30", label: "8:30 PM" },
    { value: "21:00", label: "9:00 PM" },
    { value: "21:30", label: "9:30 PM" },
  ],
};


// Per-cuisine selection within a session
interface CuisineSelection {
  menuTypeId: string | null;
  selectedItems: Set<string>;
  selectedAddOns: Set<string>;
}

const emptyCuisineSelection = (): CuisineSelection => ({
  menuTypeId: null,
  selectedItems: new Set(),
  selectedAddOns: new Set(),
});

interface SessionMenuData {
  guestCount: number;
  occasion: string;
  eventDate: string;
  servingTime: string;
  activeCuisine: MenuChoice;
  cuisineSelections: Record<string, CuisineSelection>;
}

// Helper: get all selected item IDs across all cuisines in a session
const getAllSelectedItems = (data: SessionMenuData): Set<string> => {
  const all = new Set<string>();
  Object.values(data.cuisineSelections).forEach(cs => cs.selectedItems.forEach(id => all.add(id)));
  return all;
};

const getAllSelectedAddOns = (data: SessionMenuData): Set<string> => {
  const all = new Set<string>();
  Object.values(data.cuisineSelections).forEach(cs => cs.selectedAddOns.forEach(id => all.add(id)));
  return all;
};

const getActiveCuisineSelection = (data: SessionMenuData): CuisineSelection => {
  return data.cuisineSelections[data.activeCuisine] || emptyCuisineSelection();
};

const emptySessionMenu = (): SessionMenuData => ({
  guestCount: 0,
  occasion: "",
  eventDate: "",
  servingTime: "",
  activeCuisine: "chettinad",
  cuisineSelections: {},
});

// Wizard phases
type WizardPhase =
  | "serviceType"    // step 0
  | "foodType"       // step 1
  | "sessions"       // step 2
  | "sessionMenu"    // step 3+ (repeats per session, has sub-steps)
  | "comboCategory"  // combo step 1
  | "comboFoodType"  // combo step 2 (per category)
  | "comboItems"     // combo step 3 (per category)
  | "comboEventDetails" // combo step 4
  | "comboSummary"   // combo summary
  | "summary"
  | "payment";

type SessionSubStep = "eventDetails" | "menuChoice" | "menuType" | "selectItems";

const PartyOrders = () => {
  const { formatPrice, region, calcTax } = useRegion();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const { data: partyContent } = useScreenContent("party");
  const pc = contentMap(partyContent || []);

  // Lead gate
  const [leadVerified, setLeadVerified] = useState(() => !!getCurrentLead());
  const [currentLead, setCurrentLeadState] = useState<PartyLead | null>(getCurrentLead);
  const [showRetrieveChoice, setShowRetrieveChoice] = useState(false);

  // Wizard state
  const [phase, setPhase] = useState<WizardPhase>("serviceType");
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [foodType, setFoodType] = useState<FoodType | null>(null);
  const [selectedSessions, setSelectedSessions] = useState<SessionType[]>([]);
  const [paymentOption, setPaymentOption] = useState<"full" | "part">("full");
  const [showPackingInfo, setShowPackingInfo] = useState(false);
  const [showDeliveryInfo, setShowDeliveryInfo] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountApprovalRequested, setDiscountApprovalRequested] = useState(false);
  const [cookingInstructions, setCookingInstructions] = useState<string[]>(["", "", ""]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showThankYou, setShowThankYou] = useState<string | null>(null);

  // Geolocation for customer lat/lng
  const [customerCoords, setCustomerCoords] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCustomerCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.log("Geolocation not available")
      );
    }
  }, []);

  // Combo state
  const [comboCategories, setComboCategories] = useState<ComboCategory[]>([]);
  const [comboSelections, setComboSelections] = useState<ComboSelection[]>([]);
  const [comboCurrentCatIdx, setComboCurrentCatIdx] = useState(0);
  const [comboGuestCount, setComboGuestCount] = useState(0);
  const [comboEventDate, setComboEventDate] = useState("");
  const [comboOccasion, setComboOccasion] = useState("");
  const [comboServingTime, setComboServingTime] = useState("");

  // Per-session menu data (includes guest count, date, serving time per session)
  const [sessionMenus, setSessionMenus] = useState<Record<SessionType, SessionMenuData>>({
    breakfast: emptySessionMenu(),
    lunch: emptySessionMenu(),
    snacks: emptySessionMenu(),
    dinner: emptySessionMenu(),
  });

  // Session config navigation
  const [currentSessionIdx, setCurrentSessionIdx] = useState(0);
  const [sessionSubStep, setSessionSubStep] = useState<SessionSubStep>("eventDetails");

  const currentSession = selectedSessions[currentSessionIdx] as SessionType | undefined;
  const currentSessionData = currentSession ? sessionMenus[currentSession] : null;

  const updateCurrentSession = useCallback((updater: (prev: SessionMenuData) => SessionMenuData) => {
    if (!currentSession) return;
    setSessionMenus(prev => ({
      ...prev,
      [currentSession]: updater(prev[currentSession]),
    }));
  }, [currentSession]);

  // Helpers
  const getActiveRegion = (choice: MenuChoice | null): RegionalMenu | null => {
    if (!choice || choice === "north-indian" || choice === "south-indian-mix") return null;
    return southIndianRegions.find((r) => r.id === choice) || null;
  };

  const getAvailableMenuTypes = (choice: MenuChoice | null): PartyMenuType[] => {
    if (choice === "south-indian-mix") return southIndianRegions.flatMap((r) => r.menuTypes);
    const region = getActiveRegion(choice);
    if (region) return region.menuTypes;
    return [];
  };

  const getActiveMenu = (menuTypeId: string | null): PartyMenuType | null => {
    return allMenuTypes.find((m) => m.id === menuTypeId) || null;
  };

  // Pricing per session — iterates all cuisine selections
  const calcSessionCost = useCallback((data: SessionMenuData) => {
    let mealCost = 0, addOnCost = 0, itemCount = 0;
    for (const [cuisineKey, cs] of Object.entries(data.cuisineSelections)) {
      const menu = getActiveMenu(cs.menuTypeId);
      if (!menu) continue;
      for (const cat of menu.categories) {
        for (const item of cat.items) {
          if (cs.selectedItems.has(item.id)) { mealCost += othersSpecialPrices[item.id] || cat.pricePerItem; itemCount++; }
        }
      }
      for (const ao of menu.addOns) {
        if (cs.selectedAddOns.has(ao.id)) addOnCost += ao.price;
      }
    }
    const sessionTotal = (mealCost + addOnCost) * data.guestCount;
    return { mealCost, addOnCost, itemCount, sessionTotal };
  }, []);

  // Combined guest count (for display)
  const totalGuestCount = useMemo(() => {
    return selectedSessions.reduce((sum, s) => Math.max(sum, sessionMenus[s].guestCount), 0);
  }, [selectedSessions, sessionMenus]);

  const packingResult = useMemo(() => {
    const config = getPackingConfig();
    let allBreakdown: PackingBreakdownItem[] = [];
    let totalBoxes = 0;
    let totalCost = 0;
    for (const s of selectedSessions) {
      const data = sessionMenus[s];
      for (const cs of Object.values(data.cuisineSelections)) {
        const menu = getActiveMenu(cs.menuTypeId);
        if (!menu) continue;
        const result = calculatePackingCharges(menu.categories, cs.selectedItems, data.guestCount, config);
        allBreakdown = [...allBreakdown, ...result.breakdown];
        totalBoxes += result.totalBoxes;
        totalCost += result.totalCost;
      }
    }
    return { breakdown: allBreakdown, totalBoxes, totalCost };
  }, [selectedSessions, sessionMenus]);

  // Distance-based delivery fee (miles): 0-3 → $8, 3-5 → $12, 5-8 → $18, >8 → $25
  const haversineMiles = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3958.8;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const [deliveryDistance, setDeliveryDistance] = useState<number | null>(null);

  const calculatePartyDeliveryFee = (distanceMiles: number | null): number => {
    if (distanceMiles === null) return 12; // default mid-tier
    if (distanceMiles <= 3) return 8;
    if (distanceMiles <= 5) return 12;
    if (distanceMiles <= 8) return 18;
    return 25; // extended range for party orders
  };

  const DELIVERY_FEE = calculatePartyDeliveryFee(deliveryDistance);

  const totalCosts = useMemo(() => {
    let totalMeal = 0, totalAddOn = 0, totalItems = 0;
    for (const s of selectedSessions) {
      const data = sessionMenus[s];
      const c = calcSessionCost(data);
      totalMeal += c.mealCost * data.guestCount;
      totalAddOn += c.addOnCost * data.guestCount;
      totalItems += c.itemCount;
    }
    const packingCost = packingResult.totalCost;
    const deliveryFee = DELIVERY_FEE;
    const subtotal = totalMeal + totalAddOn + packingCost + deliveryFee;
    const appliedDiscount = couponApplied ? discountAmount : 0;
    const afterDiscount = subtotal - appliedDiscount;
    const tax = calcTax(afterDiscount);
    return { mealSubtotal: totalMeal, addOnSubtotal: totalAddOn, packingCost, deliveryFee, discount: appliedDiscount, subtotal: afterDiscount, tax, total: afterDiscount + tax, totalItems };
  }, [selectedSessions, sessionMenus, calcSessionCost, calcTax, couponApplied, discountAmount]);

  // ── Draft restoration from Profile "Continue" button ──
  const [draftLoaded, setDraftLoaded] = useState(false);
  useEffect(() => {
    const draftId = searchParams.get("draftId");
    if (!draftId || draftLoaded) return;
    
    const loadDraft = async () => {
      try {
        const { data, error } = await supabase
          .from("incomplete_orders")
          .select("*")
          .eq("id", draftId)
          .single();
        if (error || !data) return;

        // Skip lead gate for draft resume
        setLeadVerified(true);
        const lead: PartyLead = {
          id: `draft-${draftId}`,
          name: data.customer_name,
          phone: data.customer_phone,
          location: data.address || "",
          status: "menu_saved",
          visits: 1,
          lastVisit: new Date().toISOString(),
          createdAt: data.created_at,
          source: "draft_resume",
        };
        setCurrentLeadState(lead);
        setCurrentLead(lead);

        const snapshot = Array.isArray(data.cart_snapshot) ? data.cart_snapshot as any[] : [];
        const isCombo = snapshot.some((s: any) => s.serviceType === "combo-meal-box");

        if (isCombo) {
          // Restore combo flow
          setServiceType("combo-meal-box");
          const snap = snapshot[0] || {} as any;
          if (snap.comboSelections) {
            setComboSelections(snap.comboSelections);
            const cats = (snap.comboSelections as any[]).map((s: any) => s.category as ComboCategory);
            setComboCategories(cats);
          }
          if (snap.comboGuestCount) setComboGuestCount(snap.comboGuestCount);
          if (snap.comboEventDate) setComboEventDate(snap.comboEventDate);
          if (snap.comboServingTime) setComboServingTime(snap.comboServingTime);
          if (snap.comboOccasion) setComboOccasion(snap.comboOccasion);
          setPhase("comboSummary");
        } else {
          // Restore bulk food flow
          setServiceType("bulk-food");
          const sessions: SessionType[] = [];
          const newMenus: Record<SessionType, SessionMenuData> = {
            breakfast: emptySessionMenu(),
            lunch: emptySessionMenu(),
            snacks: emptySessionMenu(),
            dinner: emptySessionMenu(),
          };

          for (const entry of snapshot) {
            const sessionKey = (entry as any).session as SessionType;
            if (!sessionKey) continue;
            sessions.push(sessionKey);
            const items: string[] = Array.isArray((entry as any).items) ? (entry as any).items : [];
            // Reconstruct session menu data with selected items
            newMenus[sessionKey] = {
              ...emptySessionMenu(),
              guestCount: 25, // Default, will be editable in summary
              cuisineSelections: {
                chettinad: {
                  menuTypeId: null,
                  selectedItems: new Set(items),
                  selectedAddOns: new Set(),
                },
              },
            };
          }

          if (sessions.length > 0) {
            setSelectedSessions(sessions);
            setSessionMenus(newMenus);
          }
          setPhase("summary");
        }

        setDraftLoaded(true);
        toast({ title: "📋 Draft loaded", description: "Review and edit your saved order." });
      } catch (err) {
        console.error("Failed to load draft:", err);
      }
    };
    loadDraft();
  }, [searchParams, draftLoaded]);

  // Lead handlers
  const handleLeadVerified = useCallback(async (data: { name: string; phone: string; location: string; isReturning: boolean; hasSavedOrder: boolean }) => {
    // Try to get lead from DB first for fresh saved_order data
    let lead = getCurrentLead();
    if (data.isReturning && data.hasSavedOrder) {
      try {
        const dbLead = await findLeadByPhoneAsync(data.phone);
        if (dbLead) {
          lead = dbLead;
          setCurrentLead(dbLead);
        }
      } catch { /* use localStorage lead */ }
    }
    setCurrentLeadState(lead);
    setLeadVerified(true);
    if (data.isReturning && data.hasSavedOrder) setShowRetrieveChoice(true);
  }, []);

  const restoreSavedOrder = useCallback(() => {
    if (!currentLead?.savedOrder) return;
    const so = currentLead.savedOrder;
    setFoodType(so.foodType as FoodType);
    const cuisine = (so.menuChoice || "chettinad") as MenuChoice;
    const lunchData: SessionMenuData = {
      guestCount: so.guestCount,
      occasion: so.occasion,
      eventDate: so.eventDate,
      servingTime: so.servingTime,
      activeCuisine: cuisine,
      cuisineSelections: {
        [cuisine]: {
          menuTypeId: so.selectedMenuType,
          selectedItems: new Set(so.selectedItems),
          selectedAddOns: new Set(so.selectedAddOns),
        },
      },
    };
    setSessionMenus(prev => ({ ...prev, lunch: lunchData }));
    setSelectedSessions(["lunch"]);
    setPhase("summary");
    setShowRetrieveChoice(false);
    toast({ title: "✅ Order Retrieved", description: "Your saved menu has been loaded." });
  }, [currentLead, toast]);

  // Toggle session
  const toggleSession = (s: SessionType) => {
    if (selectedSessions.includes(s)) {
      setSelectedSessions(prev => prev.filter(x => x !== s));
    } else {
      setSelectedSessions(prev => [...prev, s].sort((a, b) => sessionOptions.findIndex(o => o.value === a) - sessionOptions.findIndex(o => o.value === b)));
    }
  };

  // Navigation
  const scrollTop = () => window.scrollTo(0, 0);

  const goToPhase = (p: WizardPhase) => { setPhase(p); scrollTop(); };

  const nextSessionSubStep = () => {
    if (sessionSubStep === "eventDetails") {
      // Validate minimum prep time
      if (currentSessionData) {
        const err = checkMinPrepTime(currentSessionData.eventDate, currentSessionData.servingTime);
        if (err) { toast({ title: "⏰ Insufficient Prep Time", description: err, variant: "destructive" }); return; }
      }
      // Auto-select first cuisine and first menu type, skip straight to items
      const defaultCuisine: MenuChoice = currentSessionData?.activeCuisine || "chettinad";
      const available = getAvailableMenuTypes(defaultCuisine);
      const firstMenuType = available.length > 0 ? available[0].id : null;
      updateCurrentSession(prev => {
        const existingCS = prev.cuisineSelections[defaultCuisine];
        return {
          ...prev,
          activeCuisine: defaultCuisine,
          cuisineSelections: {
            ...prev.cuisineSelections,
            [defaultCuisine]: existingCS || { menuTypeId: firstMenuType, selectedItems: new Set(), selectedAddOns: new Set() },
          },
        };
      });
      setSessionSubStep("selectItems"); scrollTop();
    }
    else if (sessionSubStep === "selectItems") {
      if (currentSessionIdx < selectedSessions.length - 1) {
        setCurrentSessionIdx(currentSessionIdx + 1);
        setSessionSubStep("eventDetails");
        scrollTop();
      } else {
        goToPhase("summary");
      }
    }
  };

  const prevSessionSubStep = () => {
    if (sessionSubStep === "eventDetails") {
      if (currentSessionIdx > 0) {
        setCurrentSessionIdx(currentSessionIdx - 1);
        setSessionSubStep("selectItems");
        scrollTop();
      } else {
        goToPhase("sessions");
      }
    } else if (sessionSubStep === "selectItems") { setSessionSubStep("eventDetails"); scrollTop(); }
  };

  // Stepper
  const isComboFlow = serviceType === "combo-meal-box";
  const stepperSteps = useMemo(() => {
    if (isComboFlow) {
      const steps = ["Service Type", "Categories"];
      comboCategories.forEach(c => {
        const cfg = getComboCategoryConfig(c);
        steps.push(cfg.label);
      });
      steps.push("Event Details", "Summary", "Payment");
      return steps;
    }
    const steps = ["Service Type", "Food Type", "Sessions"];
    selectedSessions.forEach(s => {
      const label = sessionOptions.find(o => o.value === s)?.label || s;
      steps.push(`${label}`);
    });
    steps.push("Summary", "Payment");
    return steps;
  }, [isComboFlow, selectedSessions, comboCategories]);

  const currentStepIndex = useMemo(() => {
    if (phase === "serviceType") return 0;
    if (isComboFlow) {
      if (phase === "comboCategory") return 1;
      if (phase === "comboFoodType" || phase === "comboItems") return 2 + comboCurrentCatIdx;
      if (phase === "comboEventDetails") return 2 + comboCategories.length;
      if (phase === "comboSummary" || phase === "summary") return 3 + comboCategories.length;
      if (phase === "payment") return 4 + comboCategories.length;
      return 0;
    }
    if (phase === "foodType") return 1;
    if (phase === "sessions") return 2;
    if (phase === "sessionMenu") return 3 + currentSessionIdx;
    if (phase === "summary") return 3 + selectedSessions.length;
    if (phase === "payment") return 4 + selectedSessions.length;
    return 0;
  }, [phase, isComboFlow, currentSessionIdx, selectedSessions.length, comboCurrentCatIdx, comboCategories.length]);

  // Combo helpers
  const currentComboCategory = comboCategories[comboCurrentCatIdx] as ComboCategory | undefined;
  const currentComboSelection = comboSelections.find(s => s.category === currentComboCategory);
  const currentComboCategoryConfig = currentComboCategory ? getComboCategoryConfig(currentComboCategory) : null;

  const COMBO_PACKING_PER_BOX = 15;

  const comboTotalCost = useMemo(() => {
    let total = 0;
    for (const sel of comboSelections) {
      const cfg = getComboCategoryConfig(sel.category);
      total += cfg.pricePerBox;
    }
    return total * (comboGuestCount || 0);
  }, [comboSelections, comboGuestCount]);

  const comboPackingCost = useMemo(() => COMBO_PACKING_PER_BOX * comboSelections.length * (comboGuestCount || 0), [comboSelections, comboGuestCount]);
  const comboSubtotalBeforeTax = useMemo(() => comboTotalCost + comboPackingCost + DELIVERY_FEE, [comboTotalCost, comboPackingCost]);
  const comboTax = useMemo(() => calcTax(comboSubtotalBeforeTax), [comboSubtotalBeforeTax, calcTax]);
  const comboGrandTotal = useMemo(() => comboSubtotalBeforeTax + comboTax, [comboSubtotalBeforeTax, comboTax]);

  // Validation
  const canProceedSessions = selectedSessions.length > 0;
  const canProceedSessionDetails = (currentSessionData?.guestCount ?? 0) >= 10 && (currentSessionData?.eventDate ?? "") !== "" && (currentSessionData?.servingTime ?? "") !== "";
    const canProceedItems = (() => {
    if (!currentSessionData) return false;
    return getAllSelectedItems(currentSessionData).size > 0;
  })();
  const canProceedMenuType = currentSessionData?.cuisineSelections[currentSessionData?.activeCuisine]?.menuTypeId !== null;

  const showThankYouAndRedirect = useCallback((msg: string) => {
    setShowThankYou(msg);
    setTimeout(() => navigate("/"), 2500);
  }, [navigate]);

  const handleSave = useCallback(() => {
    if (!currentLead) return;
    const firstSession = selectedSessions[0];
    const firstData = firstSession ? sessionMenus[firstSession] : emptySessionMenu();
    saveOrderForLead(currentLead.phone, {
      foodType: foodType || "",
      menuChoice: firstData.activeCuisine || "",
      selectedMenuType: getActiveCuisineSelection(firstData).menuTypeId || "",
      guestCount: firstData.guestCount,
      occasion: firstData.occasion,
      eventDate: firstData.eventDate,
      servingTime: firstData.servingTime,
      deliveryOption: "delivery",
      selectedItems: selectedSessions.flatMap(s => Array.from(getAllSelectedItems(sessionMenus[s]))),
      selectedAddOns: selectedSessions.flatMap(s => Array.from(getAllSelectedAddOns(sessionMenus[s]))),
    });
    // Also save to incomplete_orders (Supabase) so it shows in Profile > Party Orders
    saveIncompleteOrderAsync({
      type: "party",
      customerName: currentLead.name,
      customerPhone: currentLead.phone,
      totalAmount: totalCosts.total,
      paymentStatus: "pending",
      region: region.code,
      address: currentLead.location || "",
      deliveryType: "delivery",
      selectedSlot: "",
      paymentMethod: null as any,
      cartSnapshot: selectedSessions.map(s => ({ session: s, items: Array.from(getAllSelectedItems(sessionMenus[s])) })),
      customerId: authUser?.id,
    });
    showThankYouAndRedirect("🙏 Thank you! Your menu has been saved for 15 days. We'll be ready when you are!");
  }, [currentLead, foodType, sessionMenus, selectedSessions, showThankYouAndRedirect, totalCosts.total, region.code, authUser]);

  const createPartyOrder = useCreatePartyOrder();

  const handlePaymentSuccess = useCallback(async () => {
    if (currentLead) markOrderPlaced(currentLead.phone);

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // Build order payload
    const orderIdPrefix = isComboFlow ? "SH-CMB" : "SH-PTY";
    const orderId = `${orderIdPrefix}-${Date.now().toString(36).toUpperCase()}`;

    if (isComboFlow) {
      // Combo flow
      const selectedItemIds = comboSelections.flatMap(s => s.selectedItems);
      try {
        await createPartyOrder.mutateAsync({
          order_id: orderId,
          customer_name: currentLead?.name || "",
          customer_phone: currentLead?.phone || "",
          customer_address: currentLead?.location || "",
          customer_id: user?.id || null,
          service_type: "combo-meal-box",
          food_type: foodType || "veg",
          guest_count: comboGuestCount,
          occasion: comboOccasion || "Party",
          event_date: comboEventDate,
          event_time: comboServingTime || "12:00",
          meals: ["lunch"],
          selected_items: selectedItemIds,
          cooking_instructions: cookingInstructions.filter(c => c.trim()).join(" | ") || null,
          total_amount: Math.round(comboGrandTotal),
          customer_lat: customerCoords?.lat || null,
          customer_lng: customerCoords?.lng || null,
          status: "pending_allocation",
        });
      } catch (err) {
        console.error("Failed to save party order:", err);
      }
    } else {
      // Bulk food flow
      const allItems = selectedSessions.flatMap(s => Array.from(getAllSelectedItems(sessionMenus[s])));
      const firstSession = selectedSessions[0];
      const firstData = firstSession ? sessionMenus[firstSession] : emptySessionMenu();
      try {
        await createPartyOrder.mutateAsync({
          order_id: orderId,
          customer_name: currentLead?.name || "",
          customer_phone: currentLead?.phone || "",
          customer_address: currentLead?.location || "",
          customer_id: user?.id || null,
          service_type: "bulk-food",
          food_type: foodType || "veg",
          guest_count: firstData.guestCount,
          occasion: firstData.occasion || "Party",
          event_date: firstData.eventDate || new Date().toISOString().split("T")[0],
          event_time: firstData.servingTime || "12:00",
          meals: selectedSessions,
          selected_items: allItems,
          cooking_instructions: cookingInstructions.filter(c => c.trim()).join(" | ") || null,
          total_amount: Math.round(totalCosts.total),
          customer_lat: customerCoords?.lat || null,
          customer_lng: customerCoords?.lng || null,
          status: "pending_allocation",
        });
      } catch (err) {
        console.error("Failed to save party order:", err);
      }
    }

    navigate("/order-confirmation?type=party");
  }, [currentLead, navigate, isComboFlow, createPartyOrder, comboSelections, comboGuestCount, comboOccasion, comboEventDate, comboServingTime, comboGrandTotal, foodType, selectedSessions, sessionMenus, totalCosts.total, cookingInstructions]);

  const handlePaymentFailure = useCallback((method: PaymentMethod) => {
    handleSave();
    saveIncompleteOrderAsync({
      type: "party",
      customerName: currentLead?.name || "",
      customerPhone: currentLead?.phone || "",
      address: currentLead?.location || "",
      deliveryType: "delivery",
      selectedSlot: "",
      cartSnapshot: selectedSessions.map(s => ({ session: s, items: Array.from(getAllSelectedItems(sessionMenus[s])) })),
      paymentMethod: method,
      paymentStatus: "failed",
      totalAmount: totalCosts.total,
      region: region.code,
      customerId: authUser?.id,
    });
    toast({ title: "Order saved", description: "Your order details have been saved. You can retry payment.", variant: "destructive" });
  }, [currentLead, selectedSessions, sessionMenus, totalCosts.total, region.code, toast, handleSave, authUser]);

  // Summary text builder
  const buildSummaryText = useCallback(() => {
    let lines: string[] = [];
    lines.push(`🎉 SHERO PARTY ORDER`);
    lines.push(`━━━━━━━━━━━━━━━━━━`);
    if (currentLead) lines.push(`Customer: ${currentLead.name} | ${currentLead.phone}`);
    lines.push(`Food: ${foodType === "veg" ? "🥬 Veg" : "🍗 Non-Veg"}`);
    lines.push(`Delivery: ${formatPrice(DELIVERY_FEE)} (flat fee)`);
    lines.push(``);

    for (const s of selectedSessions) {
      const sOpt = sessionOptions.find(o => o.value === s)!;
      const data = sessionMenus[s];

      lines.push(`📋 ${sOpt.label.toUpperCase()} (${sOpt.time})`);
      lines.push(`Guests: ${data.guestCount} | Date: ${data.eventDate} | Serving: ${data.servingTime}`);
      if (data.occasion) lines.push(`Occasion: ${data.occasion}`);
      lines.push(`━━━━━━━━━━━━━━━━━━`);

      for (const [cuisineKey, cs] of Object.entries(data.cuisineSelections)) {
        if (cs.selectedItems.size === 0 && cs.selectedAddOns.size === 0) continue;
        const menu = getActiveMenu(cs.menuTypeId);
        if (!menu) continue;
        const cuisineLabel = menuChoiceOptions.find(c => c.value === cuisineKey)?.label || cuisineKey;
        lines.push(`🍽️ ${cuisineLabel}`);

        menu.categories.forEach((cat) => {
          const catItems = cat.items.filter(i => cs.selectedItems.has(i.id));
          if (catItems.length === 0) return;
          catItems.forEach((item) => {
            const price = othersSpecialPrices[item.id] || cat.pricePerItem;
            const totalQty = cat.portionSize * data.guestCount;
            const qtyDisplay = totalQty >= 1000 ? `${(totalQty / 1000).toFixed(1)} Kg` : `${totalQty} ${cat.portionUnit}`;
            lines.push(`${item.name} - ${qtyDisplay} - ${formatPrice(price * data.guestCount)}`);
          });
        });

        const addOns = menu.addOns.filter(ao => cs.selectedAddOns.has(ao.id));
        if (addOns.length > 0) {
          lines.push(`➕ ADD-ONS`);
          addOns.forEach(ao => lines.push(`${ao.name} - ${formatPrice(ao.price * data.guestCount)}`));
        }
      }
      lines.push(``);
    }

    lines.push(`━━━━━━━━━━━━━━━━━━`);
    lines.push(`Meal: ${formatPrice(totalCosts.mealSubtotal)}`);
    if (totalCosts.addOnSubtotal > 0) lines.push(`Add-Ons: ${formatPrice(totalCosts.addOnSubtotal)}`);
    lines.push(`Packing: ${formatPrice(totalCosts.packingCost)}`);
    lines.push(`Delivery: ${formatPrice(DELIVERY_FEE)}`);
    if (totalCosts.discount > 0) lines.push(`Discount: -${formatPrice(totalCosts.discount)}`);
    lines.push(`${region.taxLabel}: ${formatPrice(Math.round(totalCosts.tax))}`);
    lines.push(`TOTAL: ${formatPrice(Math.round(totalCosts.total))}`);
    lines.push(`\nPowered by Shero 🧡`);
    return lines.join("\n");
  }, [currentLead, foodType, selectedSessions, sessionMenus, totalCosts, region.taxLabel, formatPrice]);

  const handleDownloadPDF = useCallback(() => {
    const text = buildSummaryText();
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
    doc.setFontSize(10);
    const splitLines = doc.splitTextToSize(text, pageWidth);
    let y = margin;
    splitLines.forEach((line: string) => {
      if (y > 280) { doc.addPage(); y = margin; }
      doc.text(line, margin, y);
      y += 5;
    });
    doc.save(`shero-party-order-${Date.now()}.pdf`);
    showThankYouAndRedirect("🙏 Thank you! Your PDF has been downloaded. Our team will connect with you soon!");
  }, [buildSummaryText, showThankYouAndRedirect]);

  const handleWhatsAppShare = useCallback(() => {
    window.open(`https://wa.me/?text=${encodeURIComponent(buildSummaryText())}`, "_blank");
    showThankYouAndRedirect("🙏 Thank you! Your order has been shared via WhatsApp. We'll follow up shortly!");
  }, [buildSummaryText, showThankYouAndRedirect]);

  const handleShare = useCallback(() => {
    const text = buildSummaryText();
    if (navigator.share) navigator.share({ title: "Shero Party Order", text });
    else navigator.clipboard.writeText(text);
    showThankYouAndRedirect("🙏 Thank you! Your order details have been shared. Our team will reach out soon!");
  }, [buildSummaryText, showThankYouAndRedirect]);

  // Combo summary text builder
  const buildComboSummaryText = useCallback(() => {
    const lines: string[] = [];
    lines.push(`🍱 SHERO COMBO MEAL BOX ORDER`);
    lines.push(`━━━━━━━━━━━━━━━━━━`);
    if (currentLead) lines.push(`Customer: ${currentLead.name} | ${currentLead.phone}`);
    lines.push(`📦 Boxes: ${comboGuestCount} | 📅 ${comboEventDate} | ⏰ ${[...sessionServingTimes.breakfast, ...sessionServingTimes.lunch, ...sessionServingTimes.snacks, ...sessionServingTimes.dinner].find(t => t.value === comboServingTime)?.label || comboServingTime}`);
    if (comboOccasion) lines.push(`🎉 ${comboOccasion}`);
    lines.push(``);
    comboSelections.forEach(sel => {
      const cfg = getComboCategoryConfig(sel.category);
      const items = comboMenuItems[sel.category][sel.foodType];
      const selectedItemObjects = items.filter(i => sel.selectedItems.includes(i.id));
      lines.push(`${cfg.label} (${sel.foodType === "veg" ? "🥬 Veg" : "🍗 Non-Veg"}) — ${formatPrice(cfg.pricePerBox)}/box`);
      selectedItemObjects.forEach(item => lines.push(`  • ${item.name}`));
      lines.push(``);
    });
    lines.push(`━━━━━━━━━━━━━━━━━━`);
    lines.push(`Combo: ${formatPrice(comboTotalCost)}`);
    lines.push(`Packing: ${formatPrice(comboPackingCost)}`);
    lines.push(`Delivery: ${formatPrice(DELIVERY_FEE)}`);
    lines.push(`${region.taxLabel}: ${formatPrice(Math.round(comboTax))}`);
    lines.push(`TOTAL: ${formatPrice(Math.round(comboGrandTotal))}`);
    lines.push(`\nPowered by Shero 🧡`);
    return lines.join("\n");
  }, [currentLead, comboGuestCount, comboEventDate, comboServingTime, comboOccasion, comboSelections, comboTotalCost, comboPackingCost, comboTax, comboGrandTotal, region.taxLabel, formatPrice]);

  const handleComboDownloadPDF = useCallback(() => {
    const text = buildComboSummaryText();
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
    doc.setFontSize(10);
    const splitLines = doc.splitTextToSize(text, pageWidth);
    let y = margin;
    splitLines.forEach((line: string) => {
      if (y > 280) { doc.addPage(); y = margin; }
      doc.text(line, margin, y);
      y += 5;
    });
    doc.save(`shero-combo-order-${Date.now()}.pdf`);
    toast({ title: "📄 PDF Downloaded" });
  }, [buildComboSummaryText, toast]);

  const handleComboWhatsApp = useCallback(() => {
    window.open(`https://wa.me/?text=${encodeURIComponent(buildComboSummaryText())}`, "_blank");
    toast({ title: "📤 Shared via WhatsApp" });
  }, [buildComboSummaryText, toast]);

  const handleComboShare = useCallback(() => {
    const text = buildComboSummaryText();
    if (navigator.share) navigator.share({ title: "Shero Combo Order", text });
    else { navigator.clipboard.writeText(text); toast({ title: "📋 Copied to clipboard" }); }
  }, [buildComboSummaryText, toast]);

  const handleComboSave = useCallback(() => {
    if (!currentLead) return;
    // Save to incomplete_orders table
    saveIncompleteOrderAsync({
      type: "party",
      customerName: currentLead.name,
      customerPhone: currentLead.phone,
      totalAmount: comboGrandTotal,
      paymentStatus: "pending",
      region: region.code,
      address: "",
      deliveryType: "delivery",
      selectedSlot: "",
      paymentMethod: null,
      cartSnapshot: [{ serviceType: "combo-meal-box", comboSelections, comboGuestCount, comboEventDate, comboServingTime, comboOccasion }],
      customerId: authUser?.id,
    });
    // Also save to party_leads.saved_order so it can be retrieved
    saveOrderForLead(currentLead.phone, {
      foodType: "veg",
      menuChoice: "combo-meal-box",
      selectedMenuType: "combo",
      guestCount: comboGuestCount,
      occasion: comboOccasion,
      eventDate: comboEventDate,
      servingTime: comboServingTime,
      deliveryOption: "delivery",
      selectedItems: comboSelections.flatMap(sel => sel.selectedItems.map(i => `${sel.category}:${i}`)),
      selectedAddOns: [],
    });
    toast({ title: "💾 Order Saved", description: "Your combo order has been saved." });
  }, [currentLead, comboGrandTotal, comboSelections, comboGuestCount, comboEventDate, comboServingTime, comboOccasion, region.code, toast, authUser]);

  if (showThankYou) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center space-y-4 animate-in fade-in-0 zoom-in-95 duration-500">
          <div className="bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 border border-primary/30 rounded-2xl p-6 shadow-lg">
            <span className="text-5xl block mb-3">🎉</span>
            <h2 className="text-lg font-serif font-bold text-foreground mb-2">Thank You!</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{showThankYou}</p>
            <div className="mt-4 h-1 w-full bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-accent animate-[progress_2.5s_linear]" style={{ width: "100%" }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">Redirecting to home...</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Lead gate ──
  if (!leadVerified) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-16 pb-20"><PartyLeadCapture onVerified={handleLeadVerified} /></main>
        <Footer />
      </div>
    );
  }

  if (showRetrieveChoice) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-16 pb-20 container mx-auto px-3 max-w-sm flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <span className="text-4xl">👋</span>
            <h2 className="text-lg font-serif font-bold text-foreground">Welcome back, {currentLead?.name}!</h2>
            <p className="text-xs text-muted-foreground">You have a saved menu from {currentLead?.savedOrder ? new Date(currentLead.savedOrder.savedAt).toLocaleDateString() : ""}.</p>
            <div className="flex flex-col gap-2">
              <button onClick={restoreSavedOrder} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                <RotateCcw className="w-4 h-4" /> Retrieve Saved Order
              </button>
              <button onClick={() => setShowRetrieveChoice(false)} className="w-full py-3 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors">
                Start New Order
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Current session menu helpers
  const curCuisineSelection = currentSessionData ? getActiveCuisineSelection(currentSessionData) : null;
  const curMenu = curCuisineSelection ? getActiveMenu(curCuisineSelection.menuTypeId) : null;
  const curAvailableMenuTypes = currentSessionData ? getAvailableMenuTypes(currentSessionData.activeCuisine) : [];
  const curSessionOpt = currentSession ? sessionOptions.find(o => o.value === currentSession) : null;
  const curSessionCost = currentSessionData ? calcSessionCost(currentSessionData) : { mealCost: 0, addOnCost: 0, itemCount: 0 };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16 pb-20 container mx-auto px-3 max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back
        </Link>

        <div className="flex items-center justify-between mb-1">
          <h1 className="text-lg font-serif font-bold text-foreground">{pc["party.hero_title"] || "🎉 Party Orders"}</h1>
          {currentLead && (
            <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">👤 {currentLead.name}</span>
          )}
        </div>
        {(phase === "serviceType" || phase === "foodType") && (
          <p className="text-xs text-muted-foreground mb-3">{pc["party.hero_subtitle"] || "Thank you for choosing genuinely homemade food for your guests."}</p>
        )}

        {/* Stepper */}
        <div className="flex items-center gap-0.5 mb-4 overflow-x-auto">
          {stepperSteps.map((s, i) => (
            <div key={s + i} className="flex items-center flex-1 min-w-0">
              <div className={`flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold shrink-0 transition-colors ${
                i < currentStepIndex ? "bg-primary text-primary-foreground" : i === currentStepIndex ? "bg-primary text-primary-foreground ring-1 ring-primary/30" : "bg-secondary text-muted-foreground"
              }`}>
                {i < currentStepIndex ? <Check className="w-2.5 h-2.5" /> : i + 1}
              </div>
              {i < stepperSteps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-0.5 rounded ${i < currentStepIndex ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-[10px] text-muted-foreground mb-3 font-medium">{stepperSteps[currentStepIndex]}</div>

        {/* ── SERVICE TYPE ── */}
        {phase === "serviceType" && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Package className="w-4 h-4 text-primary" /> How would you like the food?
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {serviceTypeOptions.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setServiceType(s.value)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    serviceType === s.value ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="w-16 h-16 flex items-center justify-center shrink-0">
                    {s.value === "bulk-food" ? (
                      <img src={bulkFoodImg} alt="Bulk Food" width={64} height={64} className="w-16 h-16 object-contain" loading="eager" decoding="async" fetchPriority="high" />
                    ) : (
                      <span className="text-5xl leading-none">{s.emoji}</span>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-foreground">{s.label}</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => {
              if (serviceType === "combo-meal-box") {
                setComboCategories([]);
                setComboSelections([]);
                setComboCurrentCatIdx(0);
                goToPhase("comboCategory");
              } else {
                goToPhase("foodType");
              }
            }} disabled={!serviceType} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
              Next <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </section>
        )}

        {/* ── FOOD TYPE ── */}
        {phase === "foodType" && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <UtensilsCrossed className="w-4 h-4 text-primary" /> Veg or Non-Veg?
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {foodTypeOptions.map((f) => (
                <button
                  key={f.value}
                  onClick={() => { setFoodType(f.value); setSelectedSessions([]); setSessionMenus({ breakfast: emptySessionMenu(), lunch: emptySessionMenu(), snacks: emptySessionMenu(), dinner: emptySessionMenu() }); }}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${
                    foodType === f.value ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40"
                  }`}
                >
                  <span className="text-2xl">{f.emoji}</span>
                  <span className="font-semibold text-xs text-foreground">{f.label}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => goToPhase("serviceType")} className="flex-1 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors">Back</button>
              <button onClick={() => goToPhase("sessions")} disabled={!foodType} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
                Next <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>
        )}

        {/* ── SESSION SELECTION ── */}
        {phase === "sessions" && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" /> Select Meal Sessions
            </h2>
            <p className="text-[10px] text-muted-foreground">Choose one or more. Each session's menu is configured separately.</p>
            <div className="grid grid-cols-2 gap-1.5">
              {sessionOptions.map((s) => {
                const selected = selectedSessions.includes(s.value);
                return (
                  <button
                    key={s.value}
                    onClick={() => toggleSession(s.value)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all ${
                      selected ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      selected ? "bg-primary border-primary" : "border-muted-foreground"
                    }`}>
                      {selected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-xs text-foreground flex items-center gap-1">{s.emoji} {s.label}</span>
                      
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button onClick={() => goToPhase("foodType")} className="flex-1 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors">Back</button>
              <button onClick={() => { setCurrentSessionIdx(0); setSessionSubStep("eventDetails"); goToPhase("sessionMenu"); }} disabled={!canProceedSessions} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
                Next <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>
        )}

        {/* ── COMBO: CATEGORY SELECTION ── */}
        {phase === "comboCategory" && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              🍱 What's in your combo?
            </h2>
            <p className="text-[10px] text-muted-foreground">Pick one or more meal categories for your combo box.</p>
            <div className="grid grid-cols-3 gap-2">
              {comboCategoryConfigs.map((cat) => {
                const selected = comboCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setComboCategories(prev =>
                        prev.includes(cat.id) ? prev.filter(c => c !== cat.id) : [...prev, cat.id]
                      );
                    }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center relative shadow-sm ${
                      selected ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary/20" : "border-border bg-card hover:border-primary/40 hover:shadow-md"
                    }`}
                  >
                    {selected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${selected ? "bg-primary/15" : "bg-secondary"}`}>
                      <img src={cat.id === "tiffin" ? comboIdliImg : cat.id === "snacks" ? comboVadaImg : comboThaliImg} alt={cat.label} className="w-14 h-14 object-contain drop-shadow-md" />
                    </div>
                    <span className="font-bold text-sm text-foreground">{cat.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button onClick={() => goToPhase("serviceType")} className="flex-1 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors">Back</button>
              <button
                onClick={() => {
                  setComboSelections(comboCategories.map(cat => ({ category: cat, foodType: "veg" as ComboFoodType, selectedItems: [] })));
                  setComboCurrentCatIdx(0);
                  goToPhase("comboFoodType");
                }}
                disabled={comboCategories.length === 0}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>
        )}

        {/* ── COMBO: FOOD TYPE (per category) ── */}
        {phase === "comboFoodType" && currentComboCategory && currentComboCategoryConfig && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <img src={currentComboCategoryConfig.id === "tiffin" ? comboIdliImg : currentComboCategoryConfig.id === "snacks" ? comboVadaImg : comboThaliImg} alt={currentComboCategoryConfig.label} className="w-8 h-8 object-contain" />
              <div>
                <h2 className="text-sm font-semibold text-foreground">{currentComboCategoryConfig.label}</h2>
                <p className="text-[10px] text-muted-foreground">Category {comboCurrentCatIdx + 1} of {comboCategories.length} — Veg or Non-Veg?</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {foodTypeOptions.map((f) => {
                const currentFT = currentComboSelection?.foodType;
                return (
                  <button
                    key={f.value}
                    onClick={() => {
                      setComboSelections(prev => prev.map(s =>
                        s.category === currentComboCategory ? { ...s, foodType: f.value as ComboFoodType, selectedItems: [] } : s
                      ));
                    }}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${
                      currentFT === f.value ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <span className="text-2xl">{f.emoji}</span>
                    <span className="font-semibold text-xs text-foreground">{f.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button onClick={() => {
                if (comboCurrentCatIdx > 0) {
                  setComboCurrentCatIdx(comboCurrentCatIdx - 1);
                  goToPhase("comboItems");
                } else {
                  goToPhase("comboCategory");
                }
              }} className="flex-1 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors">Back</button>
              <button
                onClick={() => goToPhase("comboItems")}
                disabled={!currentComboSelection?.foodType}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                Pick Items <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>
        )}

        {/* ── COMBO: ITEM SELECTION (per category) ── */}
        {phase === "comboItems" && currentComboCategory && currentComboCategoryConfig && currentComboSelection && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <img src={currentComboCategoryConfig.id === "tiffin" ? comboIdliImg : currentComboCategoryConfig.id === "snacks" ? comboVadaImg : comboThaliImg} alt={currentComboCategoryConfig.label} className="w-8 h-8 object-contain" />
              <div>
                <h2 className="text-sm font-semibold text-foreground">{currentComboCategoryConfig.label} — {currentComboSelection.foodType === "veg" ? "🥬 Veg" : "🍗 Non-Veg"}</h2>
                <p className="text-[10px] text-muted-foreground">Pick {currentComboCategoryConfig.minItems}–{currentComboCategoryConfig.maxItems} items for your combo box</p>
              </div>
            </div>

            {(() => {
              const grouped = getComboItemsBySubCategory(currentComboCategory, currentComboSelection.foodType);
              return Object.entries(grouped).map(([subCat, items]) => (
                <div key={subCat}>
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">{subCat}</h4>
                  <div className="space-y-1">
                    {items.map((item) => {
                      const checked = currentComboSelection.selectedItems.includes(item.id);
                      const atMax = currentComboSelection.selectedItems.length >= currentComboCategoryConfig!.maxItems && !checked;
                      return (
                        <label key={item.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                          checked ? "border-primary bg-primary/5" : atMax ? "border-border opacity-40 cursor-not-allowed" : "border-border hover:border-primary/30"
                        }`}>
                          <Checkbox
                            checked={checked}
                            disabled={atMax}
                            onCheckedChange={() => {
                              setComboSelections(prev => prev.map(s => {
                                if (s.category !== currentComboCategory) return s;
                                const next = checked
                                  ? s.selectedItems.filter(id => id !== item.id)
                                  : [...s.selectedItems, item.id];
                                return { ...s, selectedItems: next };
                              }));
                            }}
                            className="h-3.5 w-3.5"
                          />
                          <span className="text-sm">{item.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-medium text-foreground block truncate">{item.name}</span>
                            <span className="text-[10px] text-muted-foreground">{item.portionSize} {item.portionUnit}</span>
                          </div>
                          <span className="text-xs font-semibold text-foreground shrink-0">{formatPrice(item.price)}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}

            {/* Floating selection count */}
            <div className="sticky bottom-0 bg-card border border-border rounded-xl p-2.5 shadow-lg flex items-center justify-between z-30">
              <p className="text-xs text-foreground font-medium">
                {currentComboSelection.selectedItems.length} of {currentComboCategoryConfig.minItems}–{currentComboCategoryConfig.maxItems} items
              </p>
              <span className="text-xs font-bold text-primary">{formatPrice(currentComboCategoryConfig.pricePerBox)}/box</span>
            </div>

            <div className="flex gap-2">
              <button onClick={() => goToPhase("comboFoodType")} className="flex-1 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors">Back</button>
              <button
                onClick={() => {
                  if (comboCurrentCatIdx < comboCategories.length - 1) {
                    setComboCurrentCatIdx(comboCurrentCatIdx + 1);
                    goToPhase("comboFoodType");
                  } else {
                    goToPhase("comboEventDetails");
                  }
                }}
                disabled={currentComboSelection.selectedItems.length < currentComboCategoryConfig.minItems}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                {comboCurrentCatIdx < comboCategories.length - 1 ? (
                  <>Next: {getComboCategoryConfig(comboCategories[comboCurrentCatIdx + 1]).label} <ArrowRight className="w-3.5 h-3.5" /></>
                ) : (
                  <>Event Details <ArrowRight className="w-3.5 h-3.5" /></>
                )}
              </button>
            </div>
          </section>
        )}

        {/* ── COMBO: EVENT DETAILS ── */}
        {phase === "comboEventDetails" && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-primary" /> Event Details
            </h2>

            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Boxes (min 10)</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setComboGuestCount(Math.max(0, comboGuestCount - 5))} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-secondary">−</button>
                  <input type="number" value={comboGuestCount || ""} onChange={(e) => setComboGuestCount(Math.max(0, Math.min(50, Number(e.target.value))))} className="w-16 text-center py-1.5 rounded-lg border border-border bg-background text-foreground text-sm font-semibold" />
                  <button onClick={() => setComboGuestCount(Math.min(50, comboGuestCount + 5))} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-secondary">+</button>
                  <span className="text-[10px] text-muted-foreground">boxes</span>
                </div>
                {comboGuestCount > 0 && comboGuestCount < 10 && (
                  <p className="text-[10px] text-destructive mt-1">Minimum 10 boxes required</p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Occasion</label>
                <select value={comboOccasion} onChange={(e) => setComboOccasion(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs">
                  <option value="">Select</option>
                  {occasions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Event Date</label>
                <input type="date" value={comboEventDate} onChange={(e) => setComboEventDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs" />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Serving Time</label>
                <select value={comboServingTime} onChange={(e) => setComboServingTime(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs">
                  <option value="">Select time</option>
                  {[...sessionServingTimes.breakfast, ...sessionServingTimes.lunch, ...sessionServingTimes.snacks, ...sessionServingTimes.dinner].map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => { setComboCurrentCatIdx(comboCategories.length - 1); goToPhase("comboItems"); }} className="flex-1 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors">Back</button>
              <button
                onClick={() => {
                  const err = checkMinPrepTime(comboEventDate, comboServingTime);
                  if (err) { toast({ title: "⏰ Insufficient Prep Time", description: err, variant: "destructive" }); return; }
                  goToPhase("comboSummary");
                }}
                disabled={comboGuestCount < 10 || !comboEventDate || !comboServingTime}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                Summary <ShoppingCart className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>
        )}

        {/* ── COMBO SUMMARY ── */}
        {phase === "comboSummary" && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">🍱 Combo Order Summary</h2>
              <button
                onClick={() => setPhase("comboItems")}
                className="px-3 py-1 rounded-lg border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/5 transition-colors"
              >
                ✏️ Edit Menu
              </button>
            </div>

            {comboSelections.map((sel) => {
              const cfg = getComboCategoryConfig(sel.category);
              const items = comboMenuItems[sel.category][sel.foodType];
              const selectedItemObjects = items.filter(i => sel.selectedItems.includes(i.id));
              return (
                <div key={sel.category} className="bg-card border border-border rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                      <img src={cfg.id === "tiffin" ? comboIdliImg : cfg.id === "snacks" ? comboVadaImg : comboThaliImg} alt={cfg.label} className="w-5 h-5 object-contain" /> {cfg.label} <span className="text-[10px] font-normal text-muted-foreground">({sel.foodType === "veg" ? "🥬 Veg" : "🍗 Non-Veg"})</span>
                    </h3>
                    <span className="text-xs font-bold text-primary">{formatPrice(cfg.pricePerBox)}/box</span>
                  </div>
                  <div className="space-y-0.5">
                    {selectedItemObjects.map(item => (
                      <div key={item.id} className="flex items-center gap-1.5 text-xs text-foreground py-0.5">
                        <span>{item.emoji}</span>
                        <span>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="bg-card border border-border rounded-xl p-3">
              <h3 className="font-semibold text-xs text-foreground mb-1.5">📋 Event Details</h3>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>📦 {comboGuestCount} boxes · 📅 {comboEventDate} · ⏰ {[...sessionServingTimes.breakfast, ...sessionServingTimes.lunch, ...sessionServingTimes.snacks, ...sessionServingTimes.dinner].find(t => t.value === comboServingTime)?.label || comboServingTime}</p>
                {comboOccasion && <p>🎉 {comboOccasion}</p>}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-3">
              <h3 className="font-semibold text-xs text-foreground mb-2 flex items-center gap-1.5">
                🍳 Cooking Instructions <span className="text-muted-foreground font-normal">(optional, max 3)</span>
              </h3>
              <div className="space-y-2">
                {cookingInstructions.map((instruction, idx) => (
                  <div key={idx}>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-muted-foreground w-4 shrink-0">{idx + 1}.</span>
                      <input
                        type="text"
                        value={instruction}
                        maxLength={150}
                        onChange={(e) => {
                          const updated = [...cookingInstructions];
                          updated[idx] = e.target.value;
                          setCookingInstructions(updated);
                        }}
                        placeholder={idx === 0 ? "E.g. No garlic, less oil" : idx === 1 ? "E.g. Extra spicy" : "E.g. Use only desi ghee"}
                        className="flex-1 px-2.5 py-2 rounded-lg border border-border bg-background text-foreground text-xs placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-3">
              <h3 className="font-semibold text-xs text-foreground mb-2">Grand Total</h3>
              <div className="space-y-1 text-xs">
                {comboSelections.map(sel => {
                  const cfg = getComboCategoryConfig(sel.category);
                  return (
                    <div key={sel.category} className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1"><img src={cfg.id === "tiffin" ? comboIdliImg : cfg.id === "snacks" ? comboVadaImg : comboThaliImg} alt={cfg.label} className="w-4 h-4 object-contain inline" /> {cfg.label} × {comboGuestCount}</span>
                      <span className="text-foreground">{formatPrice(cfg.pricePerBox * comboGuestCount)}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1"><Package className="w-3 h-3" /> Packing ({comboSelections.length * comboGuestCount} boxes × {formatPrice(COMBO_PACKING_PER_BOX)})</span><span className="text-foreground">{formatPrice(comboPackingCost)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">🚚 Delivery</span><span className="text-foreground">{formatPrice(DELIVERY_FEE)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{region.taxLabel}</span><span className="text-foreground">{formatPrice(Math.round(comboTax))}</span></div>
                <div className="border-t border-border pt-1.5 flex justify-between font-bold text-sm">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{formatPrice(Math.round(comboGrandTotal))}</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-3">
              <h3 className="font-semibold text-xs text-foreground mb-2">Payment Option</h3>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setPaymentOption("full")} className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border-2 text-xs font-medium transition-all ${paymentOption === "full" ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"}`}>
                  <span className="font-bold">Full Payment</span>
                  <span className="text-[10px]">{formatPrice(Math.round(comboGrandTotal))}</span>
                </button>
                <button onClick={() => setPaymentOption("part")} className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border-2 text-xs font-medium transition-all ${paymentOption === "part" ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"}`}>
                  <span className="font-bold">50% Advance</span>
                  <span className="text-[10px]">{formatPrice(Math.round(comboGrandTotal * 0.5))} now</span>
                </button>
              </div>
            </div>

            <div className="bg-secondary/50 border border-border rounded-lg p-2 text-[10px] text-muted-foreground space-y-0.5">
              <p>• Minimum 50% advance payment on booking.</p>
              <p>• Balance payment due 2 days before the event.</p>
              <p>• Free cancellation up to 3 days before event.</p>
              <p>• Distance-based delivery fee applied.</p>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-4 gap-1.5">
              <button onClick={handleComboDownloadPDF} className="py-2 rounded-lg border border-border text-foreground font-medium flex items-center justify-center gap-1 hover:bg-secondary transition-colors text-[11px]">
                <Download className="w-3 h-3" /> PDF
              </button>
              <button onClick={handleComboWhatsApp} className="py-2 rounded-lg border border-border text-foreground font-medium flex items-center justify-center gap-1 hover:bg-secondary transition-colors text-[11px]">
                <MessageCircle className="w-3 h-3" /> WhatsApp
              </button>
              <button onClick={handleComboSave} className="py-2 rounded-lg border border-border text-foreground font-medium flex items-center justify-center gap-1 hover:bg-secondary transition-colors text-[11px]">
                <Save className="w-3 h-3" /> Save
              </button>
              <button onClick={handleComboShare} className="py-2 rounded-lg border border-border text-foreground font-medium flex items-center justify-center gap-1 hover:bg-secondary transition-colors text-[11px]">
                <Share2 className="w-3 h-3" /> Share
              </button>
            </div>

            <div className="flex gap-2">
              <button onClick={() => goToPhase("comboEventDetails")} className="flex-1 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors">
                Edit
              </button>
              <button onClick={() => goToPhase("payment")} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity shadow-lg">
                Proceed to Payment
              </button>
            </div>
          </section>
        )}

        {/* ── SESSION MENU CONFIG ── */}
        {phase === "sessionMenu" && currentSession && currentSessionData && curSessionOpt && (
          <section className="space-y-3">
            {/* Session badge */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{curSessionOpt.emoji}</span>
              <div>
                <h2 className="text-sm font-semibold text-foreground">{curSessionOpt.label}</h2>
                <p className="text-[10px] text-muted-foreground">Session {currentSessionIdx + 1} of {selectedSessions.length}</p>
              </div>
            </div>

            {/* Sub-step: Event Details per session */}
            {sessionSubStep === "eventDetails" && (
              <>
                <h3 className="text-xs font-medium text-foreground flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-primary" /> {curSessionOpt.label} — Event Details
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-medium text-foreground flex items-center gap-1 mb-1">
                      <Users className="w-3 h-3 text-primary" /> Guests (10–50)
                    </label>
                    <input type="number" min={10} max={50} value={currentSessionData.guestCount || ""} onChange={(e) => { const val = parseInt(e.target.value) || 0; if (val > 50) { toast({ title: "⚠️ Maximum 50 guests", description: "Party orders are limited to 50 guests per session.", variant: "destructive" }); updateCurrentSession(prev => ({ ...prev, guestCount: 50 })); return; } updateCurrentSession(prev => ({ ...prev, guestCount: val })); }} onBlur={() => { if (currentSessionData.guestCount > 0 && currentSessionData.guestCount < 10) { updateCurrentSession(prev => ({ ...prev, guestCount: 10 })); toast({ title: "⚠️ Minimum 10 guests required", description: "Party orders require at least 10 guests per session.", variant: "destructive" }); } }} placeholder="10–50" className="w-full px-2.5 py-2 rounded-lg bg-background border border-border text-foreground text-xs placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-foreground flex items-center gap-1 mb-1">
                      <Sparkles className="w-3 h-3 text-primary" /> Occasion
                    </label>
                    <select value={currentSessionData.occasion} onChange={(e) => updateCurrentSession(prev => ({ ...prev, occasion: e.target.value }))} className="w-full px-2.5 py-2 rounded-lg bg-secondary border border-border text-foreground text-xs outline-none focus:border-primary transition-colors">
                      <option value="">Select</option>
                      {occasions.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-medium text-foreground flex items-center gap-1 mb-1">
                      <CalendarDays className="w-3 h-3 text-primary" /> Event Date
                    </label>
                    <input type="date" value={currentSessionData.eventDate} onChange={(e) => updateCurrentSession(prev => ({ ...prev, eventDate: e.target.value }))} min={new Date().toISOString().split("T")[0]} className="w-full px-2.5 py-2 rounded-lg bg-secondary border border-border text-foreground text-xs outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-foreground flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3 text-primary" /> Serving Time
                    </label>
                    <select value={currentSessionData.servingTime} onChange={(e) => updateCurrentSession(prev => ({ ...prev, servingTime: e.target.value }))} className="w-full px-2.5 py-2 rounded-lg bg-secondary border border-border text-foreground text-xs outline-none focus:border-primary transition-colors">
                      <option value="">Select time</option>
                      {sessionServingTimes[currentSession].map(t => <option key={t.value} value={t.label}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={prevSessionSubStep} className="flex-1 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors">Back</button>
                  <button onClick={nextSessionSubStep} disabled={!canProceedSessionDetails} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
                    Next <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}






            {/* Sub-step: Select Items */}
            {sessionSubStep === "selectItems" && (
              <>
                {/* Cuisine Tabs */}
                <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide sticky top-0 z-20 bg-background py-2 border-b border-border/50">
                  {menuChoiceOptions.map((mc) => {
                    const isActive = currentSessionData.activeCuisine === mc.value;
                    return (
                      <button
                        key={mc.value}
                        onClick={() => {
                          const available = getAvailableMenuTypes(mc.value);
                          const firstMenuType = available.length > 0 ? available[0].id : null;
                          updateCurrentSession(prev => {
                            const existingCS = prev.cuisineSelections[mc.value];
                            return {
                              ...prev,
                              activeCuisine: mc.value,
                              cuisineSelections: {
                                ...prev.cuisineSelections,
                                [mc.value]: existingCS || { menuTypeId: firstMenuType, selectedItems: new Set(), selectedAddOns: new Set() },
                              },
                            };
                          });
                          setExpandedCategories(new Set());
                        }}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                          isActive ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {mc.emoji} {mc.label}
                      </button>
                    );
                  })}
                </div>

                {curMenu && curCuisineSelection ? (
                <>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium text-foreground">{curMenu.emoji} {curMenu.name}</h3>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                    {curCuisineSelection.selectedItems.size} selected{getAllSelectedItems(currentSessionData).size > curCuisineSelection.selectedItems.size ? ` (${getAllSelectedItems(currentSessionData).size} total)` : ""}
                  </span>
                </div>

                {curMenu.categories.map((cat) => {
                  const expanded = expandedCategories.has(cat.id);
                  const selectedCount = cat.items.filter(i => curCuisineSelection!.selectedItems.has(i.id)).length;
                  return (
                    <div key={cat.id} className="mb-1">
                      <button
                        onClick={() => setExpandedCategories(prev => { const n = new Set(prev); n.has(cat.id) ? n.delete(cat.id) : n.add(cat.id); return n; })}
                        className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 transition-colors"
                      >
                        {expanded ? <ChevronDown className="w-3.5 h-3.5 text-primary shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                        <div className="flex-1 text-left min-w-0">
                          <span className="text-xs font-bold text-foreground block truncate">{cat.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {cat.items.length} options · {cat.portionSize > 0 ? `${cat.portionSize}${cat.portionUnit} · ` : ""}${othersSpecialPrices[cat.items[0]?.id] || cat.pricePerItem}/item
                          </span>
                        </div>
                        {selectedCount > 0 && (
                          <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold shrink-0">{selectedCount}</span>
                        )}
                      </button>
                      {expanded && (
                        <div className="space-y-1 mt-1 pl-2">
                          {cat.items.map((item) => {
                            const price = othersSpecialPrices[item.id] || cat.pricePerItem;
                            const checked = curCuisineSelection!.selectedItems.has(item.id);
                            return (
                              <label key={item.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${checked ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                                <Checkbox checked={checked} onCheckedChange={() => {
                                  const cuisine = currentSessionData.activeCuisine;
                                  updateCurrentSession(prev => {
                                    const cs = prev.cuisineSelections[cuisine] || emptyCuisineSelection();
                                    const next = new Set(cs.selectedItems);
                                    next.has(item.id) ? next.delete(item.id) : next.add(item.id);
                                    return { ...prev, cuisineSelections: { ...prev.cuisineSelections, [cuisine]: { ...cs, selectedItems: next } } };
                                  });
                                }} className="h-3.5 w-3.5" />
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs font-medium text-foreground block truncate">{item.name}</span>
                                  {cat.portionSize > 0 && <span className="text-[10px] text-muted-foreground">{cat.portionSize} {cat.portionUnit} per head</span>}
                                </div>
                                <span className="text-xs font-semibold text-foreground shrink-0">${price}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add-Ons */}
                <div>
                  <div className="sticky top-16 bg-background py-1 z-10 border-b border-border mb-1">
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1"><Plus className="w-3 h-3 text-primary" /> Add-Ons</h4>
                  </div>
                  <div className="space-y-1">
                    {curMenu.addOns.map((ao) => {
                      const checked = curCuisineSelection!.selectedAddOns.has(ao.id);
                      return (
                        <label key={ao.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${checked ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                          <Checkbox checked={checked} onCheckedChange={() => {
                            const cuisine = currentSessionData.activeCuisine;
                            updateCurrentSession(prev => {
                              const cs = prev.cuisineSelections[cuisine] || emptyCuisineSelection();
                              const next = new Set(cs.selectedAddOns);
                              next.has(ao.id) ? next.delete(ao.id) : next.add(ao.id);
                              return { ...prev, cuisineSelections: { ...prev.cuisineSelections, [cuisine]: { ...cs, selectedAddOns: next } } };
                            });
                          }} className="h-3.5 w-3.5" />
                          <span className="flex-1 text-xs font-medium text-foreground">{ao.name}</span>
                          <span className="text-xs font-semibold text-foreground">${ao.price}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                </>
                ) : (
                  <div className="p-6 text-center bg-secondary/30 rounded-xl border border-border">
                    <p className="text-lg mb-1">🚧</p>
                    <p className="text-sm font-semibold text-foreground">Coming Soon</p>
                    <p className="text-[10px] text-muted-foreground mt-1">This cuisine menu is being curated. Please select another cuisine above.</p>
                  </div>
                )}

                {/* Floating cost bar */}
                {getAllSelectedItems(currentSessionData).size > 0 && (
                  <div className="sticky bottom-0 bg-card border border-border rounded-xl p-2.5 shadow-lg flex items-center justify-between z-30">
                    <div>
                      <p className="text-[10px] text-muted-foreground">{getAllSelectedItems(currentSessionData).size} items × {currentSessionData.guestCount} guests</p>
                      <p className="text-sm font-bold text-foreground">{formatPrice(curSessionCost.mealCost + curSessionCost.addOnCost)}<span className="text-[10px] font-normal text-muted-foreground">/plate</span></p>
                    </div>
                    <span className="text-sm font-bold text-primary">{formatPrice((curSessionCost.mealCost + curSessionCost.addOnCost) * currentSessionData.guestCount)}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={prevSessionSubStep} className="flex-1 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors">Back</button>
                  <button onClick={nextSessionSubStep} disabled={!canProceedItems} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
                    {currentSessionIdx < selectedSessions.length - 1 ? (
                      <>Next: {sessionOptions.find(o => o.value === selectedSessions[currentSessionIdx + 1])?.label} <ArrowRight className="w-3.5 h-3.5" /></>
                    ) : (
                      <>Summary <ShoppingCart className="w-3.5 h-3.5" /></>
                    )}
                  </button>
                </div>
              </>
            )}
          </section>
        )}

        {/* ── SUMMARY ── */}
        {phase === "summary" && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Order Summary</h2>
              <button
                onClick={() => {
                  setCurrentSessionIdx(0);
                  setSessionSubStep("selectItems");
                  setPhase("sessionMenu");
                }}
                className="px-3 py-1 rounded-lg border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/5 transition-colors"
              >
                ✏️ Edit Menu
              </button>
            </div>

            {/* Session-wise breakdown — grouped by cuisine */}
            {selectedSessions.map(s => {
              const sOpt = sessionOptions.find(o => o.value === s)!;
              const data = sessionMenus[s];
              const cost = calcSessionCost(data);
              const allItems = getAllSelectedItems(data);
              if (allItems.size === 0) return null;

              // Get cuisines that have selections
              const activeCuisines = Object.entries(data.cuisineSelections).filter(([_, cs]) => cs.selectedItems.size > 0 || cs.selectedAddOns.size > 0);

              return (
                <div key={s} className="bg-card border border-border rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                      {sOpt.emoji} {sOpt.label}
                    </h3>
                    <span className="text-[10px] text-muted-foreground">{data.servingTime || sOpt.time}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mb-2 space-y-0.5">
                    <p>{data.guestCount} guests · {data.eventDate}{data.occasion ? ` · ${data.occasion}` : ""}</p>
                    <p>{activeCuisines.map(([k]) => menuChoiceOptions.find(c => c.value === k)?.label).filter(Boolean).join(", ")} · {allItems.size} items</p>
                  </div>

                  {activeCuisines.map(([cuisineKey, cs]) => {
                    const menu = getActiveMenu(cs.menuTypeId);
                    if (!menu) return null;
                    const cuisineLabel = menuChoiceOptions.find(c => c.value === cuisineKey)?.label || cuisineKey;
                    const cuisineEmoji = menuChoiceOptions.find(c => c.value === cuisineKey)?.emoji || "🍽️";

                    return (
                      <div key={cuisineKey} className="mb-2">
                        <div className="flex items-center gap-1.5 mb-1 pb-1 border-b border-border">
                          <span className="text-xs">{cuisineEmoji}</span>
                          <span className="text-[10px] font-bold text-foreground uppercase tracking-wide">{cuisineLabel}</span>
                          <span className="text-[10px] text-muted-foreground">· {menu.name}</span>
                        </div>

                        <div className="space-y-1.5">
                          {menu.categories.map((cat) => {
                            const catItems = cat.items.filter(i => cs.selectedItems.has(i.id));
                            if (catItems.length === 0) return null;
                            return (
                              <div key={cat.id}>
                                <p className="text-[10px] font-bold text-muted-foreground mb-0.5 uppercase tracking-wide">{cat.name}</p>
                                {catItems.map(item => {
                                  const price = othersSpecialPrices[item.id] || cat.pricePerItem;
                                  const totalQty = cat.portionSize * data.guestCount;
                                  const qtyDisplay = totalQty >= 1000 ? `${(totalQty / 1000).toFixed(1)} Kg` : `${totalQty} ${cat.portionUnit}`;
                                  return (
                                    <div key={item.id} className="flex items-center text-xs py-0.5">
                                      <span className="flex-1 text-foreground truncate pr-2">{item.name}</span>
                                      <span className="w-20 text-right text-muted-foreground">{qtyDisplay}</span>
                                      <span className="w-16 text-right text-foreground font-medium">{formatPrice(price * data.guestCount)}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>

                        {cs.selectedAddOns.size > 0 && (
                          <div className="mt-1.5 pt-1.5 border-t border-border/50">
                            <p className="text-[10px] font-semibold text-muted-foreground mb-0.5 uppercase tracking-wide">Add-Ons</p>
                            {menu.addOns.filter(ao => cs.selectedAddOns.has(ao.id)).map(ao => (
                              <div key={ao.id} className="flex items-center text-xs py-0.5">
                                <span className="flex-1 text-foreground truncate pr-2">{ao.name}</span>
                                <span className="w-20 text-right text-muted-foreground">{data.guestCount} qty</span>
                                <span className="w-16 text-right text-foreground font-medium">{formatPrice(ao.price * data.guestCount)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="mt-2 pt-2 border-t border-border flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Session Subtotal ({data.guestCount} guests)</span>
                    <span className="text-primary">{formatPrice(cost.sessionTotal)}</span>
                  </div>
                </div>
              );
            })}

            {/* Cooking Instructions */}
            <div className="bg-card border border-border rounded-xl p-3">
              <h3 className="font-semibold text-xs text-foreground mb-2 flex items-center gap-1.5">
                🍳 Cooking Instructions <span className="text-muted-foreground font-normal">(optional, max 3)</span>
              </h3>
              <div className="space-y-2">
                {cookingInstructions.map((instruction, idx) => {
                  const charCount = instruction.length;
                  const isOverLimit = charCount > 150;
                  return (
                    <div key={idx}>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-muted-foreground w-4 shrink-0">{idx + 1}.</span>
                        <input
                          type="text"
                          value={instruction}
                          maxLength={150}
                          onChange={(e) => {
                            const updated = [...cookingInstructions];
                            updated[idx] = e.target.value;
                            setCookingInstructions(updated);
                          }}
                          placeholder={idx === 0 ? "E.g. No garlic, less oil" : idx === 1 ? "E.g. Extra spicy" : "E.g. Use only desi ghee"}
                          className="flex-1 px-2.5 py-2 rounded-lg border border-border bg-background text-foreground text-xs placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      <p className={`text-[10px] mt-0.5 text-right pr-1 ${isOverLimit ? "text-destructive" : "text-muted-foreground"}`}>{charCount}/150</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Fee */}
            <div className="bg-card border border-border rounded-xl p-3">
              <h3 className="font-semibold text-xs text-foreground mb-1 flex items-center gap-1.5">
                🚚 Delivery
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground font-medium">Delivery Fee ({deliveryDistance !== null ? `${deliveryDistance.toFixed(1)} mi` : "calculating..."})</span>
                <span className="text-xs font-bold text-foreground">{formatPrice(DELIVERY_FEE)}</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <button onClick={() => setShowDeliveryInfo(!showDeliveryInfo)} className="text-primary hover:text-primary/80"><Info className="w-3 h-3" /></button>
                <span className="text-[10px] text-muted-foreground">How is delivery fee calculated?</span>
              </div>
              {showDeliveryInfo && (
                <div className="mt-2 p-2 rounded-lg bg-secondary/50 border border-border text-[10px] text-muted-foreground space-y-0.5">
                  <p className="font-medium text-foreground">ℹ️ Distance-Based Delivery Fee</p>
                  <p>• 0–3 miles: $8</p>
                  <p>• 3–5 miles: $12</p>
                  <p>• 5–8 miles: $18</p>
                  <p>• 8+ miles: $25 (extended range)</p>
                  <p>• Covers packaging, loading, transport & doorstep delivery.</p>
                </div>
              )}
            </div>

            {/* Discount / Coupon */}
            <div className="bg-card border border-border rounded-xl p-3">
              <h3 className="font-semibold text-xs text-foreground mb-2 flex items-center gap-1.5">
                🏷️ Discount
              </h3>
              {!couponApplied ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                      onClick={() => {
                        if (!couponCode.trim()) return;
                        // Mock coupon validation — in real app this would call backend
                        if (couponCode === "PARTY10") {
                          const disc = Math.round(totalCosts.mealSubtotal * 0.1);
                          setDiscountAmount(disc);
                          setCouponApplied(true);
                          toast({ title: "🎉 Coupon Applied!", description: `${formatPrice(disc)} discount applied (10% off meals)` });
                        } else {
                          toast({ title: "❌ Invalid Coupon", description: "This coupon code is not valid. Please try a different code.", variant: "destructive" });
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-300">
                  <div>
                    <p className="text-xs font-semibold text-green-800 dark:text-green-300">✅ Coupon "{couponCode}" applied</p>
                    <p className="text-[10px] text-green-600 dark:text-green-400">-${discountAmount} discount</p>
                  </div>
                  <button
                    onClick={() => { setCouponApplied(false); setCouponCode(""); setDiscountAmount(0); }}
                    className="text-xs text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Grand Total Bill */}
            <div className="bg-card border border-border rounded-xl p-3">
              <h3 className="font-semibold text-xs text-foreground mb-2">Grand Total</h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Meal ({totalCosts.totalItems} items)</span><span className="text-foreground">{formatPrice(totalCosts.mealSubtotal)}</span></div>
                {totalCosts.addOnSubtotal > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Add-Ons</span><span className="text-foreground">{formatPrice(totalCosts.addOnSubtotal)}</span></div>}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Package className="w-3 h-3" /> Packing ({packingResult.totalBoxes} boxes)
                    <button onClick={() => setShowPackingInfo(!showPackingInfo)} className="text-primary hover:text-primary/80"><Info className="w-3 h-3" /></button>
                  </span>
                  <span className="text-foreground">{formatPrice(totalCosts.packingCost)}</span>
                </div>
                {showPackingInfo && (
                  <div className="bg-secondary/50 border border-border rounded-lg p-2 space-y-1">
                    <p className="text-[10px] text-foreground font-medium">📦 Packing Details</p>
                    {packingResult.breakdown.slice(0, 8).map((b, i) => (
                      <div key={i} className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground truncate pr-2">{b.itemName}</span>
                        <span className="text-foreground shrink-0">{b.boxes > 0 ? `${b.boxes} box = ${formatPrice(b.boxCost)}` : formatPrice(b.pieceCost)}</span>
                      </div>
                    ))}
                    {packingResult.breakdown.length > 8 && <p className="text-[10px] text-muted-foreground">...+{packingResult.breakdown.length - 8} more items</p>}
                    <p className="text-[9px] text-muted-foreground italic mt-1 border-t border-border pt-1">{PACKING_INFO_TEXT}</p>
                  </div>
                )}
                <div className="flex justify-between"><span className="text-muted-foreground">🚚 Delivery</span><span className="text-foreground">{formatPrice(totalCosts.deliveryFee)}</span></div>
                {totalCosts.discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400"><span>🏷️ Discount</span><span>-{formatPrice(totalCosts.discount)}</span></div>
                )}
                <div className="flex justify-between"><span className="text-muted-foreground">{region.taxLabel}</span><span className="text-foreground">{formatPrice(Math.round(totalCosts.tax))}</span></div>
                <div className="border-t border-border pt-1.5 flex justify-between font-bold text-sm">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{formatPrice(Math.round(totalCosts.total))}</span>
                </div>
              </div>
            </div>

            {/* Payment Option */}
            <div className="bg-card border border-border rounded-xl p-3">
              <h3 className="font-semibold text-xs text-foreground mb-2">Payment Option</h3>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setPaymentOption("full")} className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border-2 text-xs font-medium transition-all ${paymentOption === "full" ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"}`}>
                  <span className="font-bold">Full Payment</span>
                  <span className="text-[10px]">{formatPrice(Math.round(totalCosts.total))}</span>
                </button>
                <button onClick={() => setPaymentOption("part")} className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border-2 text-xs font-medium transition-all ${paymentOption === "part" ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"}`}>
                  <span className="font-bold">50% Advance</span>
                  <span className="text-[10px]">{formatPrice(Math.round(totalCosts.total * 0.5))} now</span>
                </button>
              </div>
              {paymentOption === "part" && (
                <div className="mt-2 p-2 rounded-lg bg-accent/20 border border-accent text-[10px] text-muted-foreground space-y-0.5">
                  <p>✅ Pay {formatPrice(Math.round(totalCosts.total * 0.5))} now (50% advance)</p>
                  <p>💰 Balance {formatPrice(Math.round(totalCosts.total * 0.5))} due 1 day before the event</p>
                  <p>🔔 You'll receive a reminder for balance payment</p>
                </div>
              )}
            </div>

            {/* Terms */}
            <div className="bg-secondary/50 border border-border rounded-lg p-2 text-[10px] text-muted-foreground space-y-0.5">
              <p>• Minimum 50% advance payment on booking.</p>
              <p>• Balance payment due 2 days before the event.</p>
              <p>• Free cancellation up to 3 days before event. Full refund.</p>
              <p>• Distance-based delivery fee applied on all party orders.</p>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-4 gap-1.5">
              <button onClick={handleDownloadPDF} className="py-2 rounded-lg border border-border text-foreground font-medium flex items-center justify-center gap-1 hover:bg-secondary transition-colors text-[11px]">
                <Download className="w-3 h-3" /> PDF
              </button>
              <button onClick={handleWhatsAppShare} className="py-2 rounded-lg border border-border text-foreground font-medium flex items-center justify-center gap-1 hover:bg-secondary transition-colors text-[11px]">
                <MessageCircle className="w-3 h-3" /> WhatsApp
              </button>
              <button onClick={handleSave} className="py-2 rounded-lg border border-border text-foreground font-medium flex items-center justify-center gap-1 hover:bg-secondary transition-colors text-[11px]">
                <Save className="w-3 h-3" /> Save
              </button>
              <button onClick={handleShare} className="py-2 rounded-lg border border-border text-foreground font-medium flex items-center justify-center gap-1 hover:bg-secondary transition-colors text-[11px]">
                <Share2 className="w-3 h-3" /> Share
              </button>
            </div>

            <button
              onClick={() => window.open("https://wa.me/919962662664?text=Hi%20Shero%2C%20I%20need%20help%20with%20my%20party%20order", "_blank")}
              className="w-full py-2 rounded-lg border border-primary/30 text-primary font-medium flex items-center justify-center gap-1.5 hover:bg-primary/5 transition-colors text-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" /> Chat with Agent
            </button>

            <div className="flex gap-2">
              <button onClick={() => { setCurrentSessionIdx(selectedSessions.length - 1); setSessionSubStep("selectItems"); goToPhase("sessionMenu"); }} className="flex-1 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors">
                Edit
              </button>
              <button onClick={() => goToPhase("payment")} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity shadow-lg">
                Proceed to Payment
              </button>
            </div>
          </section>
        )}

        {/* ── PAYMENT ── */}
        {phase === "payment" && (
          <section className="space-y-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">💳 Payment</h2>
            <div className="p-3 rounded-xl bg-secondary/50 border border-border text-xs space-y-1">
              {isComboFlow ? (
                <>
                  <div className="flex justify-between"><span className="text-muted-foreground">Order Total</span><span className="font-bold text-foreground">{formatPrice(comboGrandTotal)}</span></div>
                  {paymentOption === "part" && (
                    <>
                      <div className="flex justify-between"><span className="text-muted-foreground">Advance (50%)</span><span className="font-bold text-primary">{formatPrice(comboGrandTotal * 0.5)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Balance (due 1 day before)</span><span className="text-foreground">{formatPrice(comboGrandTotal * 0.5)}</span></div>
                    </>
                  )}
                  <div className="flex justify-between"><span className="text-muted-foreground">Combo Categories</span><span className="text-foreground">{comboSelections.map(s => getComboCategoryConfig(s.category).label).join(", ")}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">📦 Boxes</span><span className="text-foreground">{comboGuestCount} · {comboEventDate}</span></div>
                </>
              ) : (
                <>
                  <div className="flex justify-between"><span className="text-muted-foreground">Order Total</span><span className="font-bold text-foreground">{formatPrice(totalCosts.total)}</span></div>
                  {paymentOption === "part" && (
                    <>
                      <div className="flex justify-between"><span className="text-muted-foreground">Advance (50%)</span><span className="font-bold text-primary">{formatPrice(totalCosts.total * 0.5)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Balance (due 1 day before)</span><span className="text-foreground">{formatPrice(totalCosts.total * 0.5)}</span></div>
                    </>
                  )}
                  <div className="flex justify-between"><span className="text-muted-foreground">Sessions</span><span className="text-foreground">{selectedSessions.map(s => sessionOptions.find(o => o.value === s)?.label).join(", ")}</span></div>
                  {selectedSessions.map(s => {
                    const sOpt = sessionOptions.find(o => o.value === s)!;
                    const data = sessionMenus[s];
                    return <div key={s} className="flex justify-between"><span className="text-muted-foreground">{sOpt.emoji} {sOpt.label}</span><span className="text-foreground">{data.guestCount} guests · {data.eventDate}</span></div>;
                  })}
                </>
              )}
              <p className="text-[10px] text-muted-foreground pt-1 border-t border-border mt-1">
                {paymentOption === "part" ? "50% advance now. Balance due 1 day before event. Free cancellation 2 days before." : "Full payment on booking. Free cancellation 2 days before event."}
              </p>
            </div>
            <PaymentSection
              total={(() => {
                const base = isComboFlow ? comboGrandTotal : totalCosts.total;
                return paymentOption === "part" ? base * 0.5 : base;
              })()}
              formatPrice={formatPrice}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentFailure={handlePaymentFailure}
            />
            <button onClick={() => goToPhase(isComboFlow ? "comboSummary" : "summary")} className="w-full py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-secondary transition-colors">
              ← Back to Summary
            </button>
          </section>
        )}
      </main>
      <Footer />

    </div>
  );
};

export default PartyOrders;
