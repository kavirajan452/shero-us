import { partyMenu, type LegacyPartyMenuItem as PartyMenuItem } from "./partyMenuData";

/**
 * Portion size per plate for each party menu item.
 * This would typically be imported via Excel; for now it's template data.
 */
export interface PortionSize {
  itemId: string;
  portionPerPlate: string;   // e.g. "250g", "2 pcs", "200ml"
  unit: string;              // e.g. "g", "pcs", "ml", "bowl"
  quantityPerPlate: number;  // numeric value for calculations
}

// Auto-generate portion sizes from partyMenuTypes categories
// Each category already has portionSize and portionUnit defined
import { partyMenuTypes } from "./partyMenuData";

export const portionSizes: PortionSize[] = partyMenuTypes.flatMap((menuType) =>
  menuType.categories.flatMap((cat) =>
    cat.items.map((item) => ({
      itemId: item.id,
      portionPerPlate: `${cat.portionSize} ${cat.portionUnit}`,
      unit: cat.portionUnit.toLowerCase(),
      quantityPerPlate: cat.portionSize,
    }))
  )
);

/** Mock party orders placed by customers, pending allocation */
export interface PartyOrderRecord {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerLat: number;
  customerLng: number;
  customerAddress: string;
  serviceType: "bulk-food" | "combo-meal-box";
  foodType: "veg" | "non-veg";
  guestCount: number;
  occasion: string;
  eventDate: string;
  eventTime: string;
  meals: string[];
  selectedItems: string[];   // party menu item IDs
  cookingInstructions?: string;
  totalAmount: number;
  status: "pending_allocation" | "allocated" | "accepted" | "preparing" | "delivered";
  allocatedPartnerId?: string;
  allocatedAt?: string;
  createdAt: string;
}

export interface PartnerLocation {
  id: string;
  name: string;
  phone: string;
  lat: number;
  lng: number;
  address: string;
  rating: number;
  capacity: number;       // max plates per day
  speciality: "veg" | "non-veg" | "both";
  isAvailable: boolean;
}

export const mockPartnerLocations: PartnerLocation[] = [
  { id: "pk1", name: "Chef Lakshmi", phone: "9876543210", lat: 13.0524, lng: 80.2508, address: "12, Anna Nagar East, Chennai", rating: 4.8, capacity: 500, speciality: "veg", isAvailable: true },
  { id: "pk2", name: "Chef Meena", phone: "9876543211", lat: 13.0674, lng: 80.2376, address: "45, Kilpauk, Chennai", rating: 4.6, capacity: 300, speciality: "both", isAvailable: true },
  { id: "pk3", name: "Chef Fathima", phone: "9876543212", lat: 13.0418, lng: 80.2341, address: "78, T. Nagar, Chennai", rating: 4.9, capacity: 800, speciality: "non-veg", isAvailable: true },
  { id: "pk4", name: "Chef Saroja", phone: "9876543213", lat: 13.0827, lng: 80.2707, address: "23, Perambur, Chennai", rating: 4.5, capacity: 200, speciality: "veg", isAvailable: false },
  { id: "pk5", name: "Chef Kamala", phone: "9876543214", lat: 13.0339, lng: 80.2676, address: "56, Mylapore, Chennai", rating: 4.7, capacity: 400, speciality: "both", isAvailable: true },
];

export const mockPartyOrders: PartyOrderRecord[] = [
  {
    id: "pty-001",
    orderId: "SH-PTY-78234",
    customerName: "Ramesh Kumar",
    customerPhone: "9988776655",
    customerLat: 13.0563,
    customerLng: 80.2589,
    customerAddress: "Flat 4B, Gemini Apts, Anna Nagar, Chennai",
    serviceType: "bulk-food",
    foodType: "veg",
    guestCount: 100,
    occasion: "Wedding Reception",
    eventDate: "2026-03-10",
    eventTime: "12:00",
    meals: ["lunch"],
    selectedItems: ["cl-vr-1", "cl-vr-3", "cl-wr-1", "cl-sm-1", "cl-py-1", "cl-vv-1", "cl-rs-1", "cl-ds-1"],
    cookingInstructions: "No garlic, no onion. Use only cold-pressed gingelly oil. Keep sambar mild spice.",
    totalAmount: 28500,
    status: "pending_allocation",
    createdAt: "2026-03-03T10:30:00",
  },
  {
    id: "pty-002",
    orderId: "SH-PTY-78235",
    customerName: "Priya Venkat",
    customerPhone: "9877665544",
    customerLat: 13.0401,
    customerLng: 80.2420,
    customerAddress: "15, 3rd Cross, T. Nagar, Chennai",
    serviceType: "combo-meal-box",
    foodType: "non-veg",
    guestCount: 50,
    occasion: "Birthday Party",
    eventDate: "2026-03-08",
    eventTime: "19:00",
    meals: ["dinner"],
    selectedItems: ["cl-vr-2", "cl-svr-1", "cl-sm-2", "cl-py-3", "cl-sg-1", "cl-rs-2", "cl-ds-2"],
    cookingInstructions: "Extra spicy biryani. No peanut oil. Dessert should be less sweet.",
    totalAmount: 42500,
    status: "pending_allocation",
    createdAt: "2026-03-02T14:15:00",
  },
  {
    id: "pty-003",
    orderId: "SH-PTY-78236",
    customerName: "Anand Srinivasan",
    customerPhone: "9866554433",
    customerLat: 13.0690,
    customerLng: 80.2400,
    customerAddress: "22, Poonamallee High Rd, Kilpauk, Chennai",
    serviceType: "bulk-food",
    foodType: "veg",
    guestCount: 200,
    occasion: "Housewarming (Griha Pravesh)",
    eventDate: "2026-03-15",
    eventTime: "11:00",
    meals: ["breakfast", "lunch"],
    selectedItems: ["cl-vr-1", "cl-vr-9", "cl-svr-8", "cl-wr-1", "cl-sm-1", "cl-py-1", "cl-vv-1", "cl-rs-1", "cl-ds-1"],
    cookingInstructions: "Purely Sattvic food — no onion, no garlic. Use desi ghee only. Payasam must be jaggery-based, not sugar.",
    totalAmount: 67200,
    status: "allocated",
    allocatedPartnerId: "pk1",
    allocatedAt: "2026-03-03T08:00:00",
    createdAt: "2026-03-01T09:00:00",
  },
];

/** Helper: get portion info for an item */
export const getPortionSize = (itemId: string): PortionSize | undefined =>
  portionSizes.find((p) => p.itemId === itemId);

/** Helper: compute total volume for a production chart */
export const computeProductionVolume = (selectedItemIds: string[], guestCount: number) => {
  return selectedItemIds.map((id) => {
    const item = partyMenu.find((m) => m.id === id);
    const portion = getPortionSize(id);
    if (!item || !portion) return null;
    return {
      itemId: id,
      itemName: item.name,
      category: item.category,
      mealType: item.mealType,
      portionPerPlate: portion.portionPerPlate,
      totalPortions: guestCount,
      totalVolume: `${portion.portionPerPlate} × ${guestCount}`,
    };
  }).filter(Boolean);
};
