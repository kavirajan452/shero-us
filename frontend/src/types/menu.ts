// ── Shared menu types used across customer, partner, and admin pages ──

export interface AddOn {
  id: string;
  name: string;
  price: number;
  isVeg: boolean;
  isDefault?: boolean;
}

export interface MenuItem {
  id: string;
  kitchenId: string;
  name: string;
  description: string;
  price: number;
  ppp: number;
  image: string;
  category: string;
  isVeg: boolean;
  isBestseller: boolean;
  spiceLevel: "mild" | "medium" | "spicy";
  servingSize: string;
  preparationTime: string;
  ingredients: string[];
  majorVegetables: string[];
  allergens: string[];
  nutritionInfo: { calories: number; protein: string; carbs: string; fat: string };
  isToggledOn: boolean;
  addOns?: AddOn[];
}

export interface KitchenPartner {
  id: string;
  partnerId: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  cuisine: string[];
  deliveryTime: string;
  minOrder: number;
  isBranded: boolean;
  location: string;
  isVeg: boolean;
  foodPreference: "veg" | "nonveg" | "both";
  isAttendanceMarked: boolean;
  attendanceSlot: string;
}

export interface PartnerProfile {
  rmn: string;
  name: string;
  avatar: string;
  enrollmentStatus: "approved" | "pending" | "rejected";
  approvedVerticals: string[];
}
