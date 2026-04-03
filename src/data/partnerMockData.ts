export type OrderStatus = "new" | "accepted" | "preparing" | "ready" | "picked_up" | "delivered" | "rejected";
export type OrderType = "instant" | "pickup" | "scheduled";

export type OrderSource = "shero" | "swiggy" | "zomato";

export interface PartnerOrder {
  id: string;
  customerName: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: OrderStatus;
  placedAt: string;
  deliveryAddress: string;
  paymentMode: "online" | "cod";
  orderType: OrderType;
  source: OrderSource;
  acceptedAt?: number; // timestamp ms
  readyAt?: number;
  note?: string;
  allergens?: string[];
  cookingInstructions?: string;
}

/** Get allowed prep time in minutes based on total item count */
export const getPrepTimeMinutes = (totalItems: number): number => {
  if (totalItems <= 3) return 20;
  if (totalItems <= 5) return 40;
  if (totalItems <= 7) return 60;
  if (totalItems <= 10) return 90;
  if (totalItems <= 15) return 120;
  return -1; // >15 items: must reject → party/bulk order
};

/** Rejection fine amount per region */
export const REJECTION_FINE: Record<string, number> = {
  INR: 500,
  USD: 6,
};

export const MAX_FREE_REJECTIONS_PER_MONTH = 2;

export type CuisineType = "Indian" | "Chinese" | "Italian" | "Continental" | "Mexican" | "Japanese" | "Thai" | "Mediterranean" | "Other";
export type PartnerType = "branded" | "marketplace";

export const partnerCuisine: CuisineType = "Indian";
export const partnerType: PartnerType = "branded";

export interface PartnerMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  isAvailable: boolean;
  image: string;
}

export interface EarningsSummary {
  today: number;
  thisWeek: number;
  thisMonth: number;
  totalOrders: number;
  avgRating: number;
  completionRate: number;
  totalSales: number;
  pppEarnings: number;
  pppPercentage: number;
  totalPenalties: number;
  penaltyCount: number;
  netPayout: number;
  inductionDate: string;
}

export const partnerOrders: PartnerOrder[] = [
  {
    id: "PO-1001", customerName: "Rahul Sharma", total: 489,
    items: [{ name: "Hyderabadi Biryani", qty: 2, price: 199 }, { name: "Raita", qty: 1, price: 49 }, { name: "Gulab Jamun", qty: 2, price: 21 }],
    status: "new", placedAt: "2 min ago", deliveryAddress: "Flat 302, Lakshmi Towers, Banjara Hills", paymentMode: "online", orderType: "instant",
    source: "swiggy",
    allergens: ["Nuts", "Dairy"], cookingInstructions: "No cashew garnish, mild spice level",
  },
  {
    id: "PO-1002", customerName: "Priya Reddy", total: 349,
    items: [{ name: "Paneer Butter Masala", qty: 1, price: 179 }, { name: "Butter Naan (4)", qty: 1, price: 120 }, { name: "Lassi", qty: 1, price: 50 }],
    status: "new", placedAt: "5 min ago", deliveryAddress: "Plot 45, Cyber Towers, HITEC City", paymentMode: "cod", orderType: "pickup",
    source: "shero",
    note: "Less spicy please", allergens: ["Peanut"], cookingInstructions: "Less spicy, no peanut oil",
  },
  {
    id: "PO-1003", customerName: "Ankit Gupta", total: 599,
    items: [{ name: "Thali Combo", qty: 2, price: 249 }, { name: "Sweet Lassi", qty: 2, price: 50 }],
    status: "accepted", placedAt: "12 min ago", deliveryAddress: "House 8-3-214, Jubilee Hills", paymentMode: "online", orderType: "instant",
    source: "zomato",
    acceptedAt: Date.now() - 5 * 60 * 1000,
    allergens: ["Gluten"], cookingInstructions: "No wheat-based items, extra rice",
  },
  {
    id: "PO-1004", customerName: "Meera Joshi", total: 275,
    items: [{ name: "Dosa Platter", qty: 1, price: 199 }, { name: "Filter Coffee", qty: 2, price: 38 }],
    status: "preparing", placedAt: "20 min ago", deliveryAddress: "Aparna Sarovar, Nallagandla", paymentMode: "online", orderType: "instant",
    source: "shero",
    acceptedAt: Date.now() - 15 * 60 * 1000,
    cookingInstructions: "Extra crispy dosa",
  },
  {
    id: "PO-1005", customerName: "Vikram Singh", total: 899,
    items: [{ name: "Party Pack Biryani", qty: 1, price: 699 }, { name: "Kebab Platter", qty: 1, price: 200 }],
    status: "ready", placedAt: "35 min ago", deliveryAddress: "My Home Hub, Madhapur", paymentMode: "cod", orderType: "instant",
    source: "swiggy",
    acceptedAt: Date.now() - 30 * 60 * 1000, readyAt: Date.now() - 2 * 60 * 1000,
    allergens: ["Sesame"], cookingInstructions: "No sesame seeds on kebabs",
  },
  {
    id: "PO-1006", customerName: "Sneha Pillai", total: 189,
    items: [{ name: "Idli Sambar", qty: 2, price: 79 }, { name: "Vada", qty: 1, price: 31 }],
    status: "delivered", placedAt: "1 hr ago", deliveryAddress: "Kondapur Main Road", paymentMode: "online", orderType: "pickup",
    source: "zomato",
  },
];

export interface Vegetable {
  id: string;
  name: string;
  nameHi: string;
  emoji: string;
  isAvailable: boolean;
}

export const vegetables: Vegetable[] = [
  { id: "v1", name: "Tomato", nameHi: "தக்காளி", emoji: "🍅", isAvailable: true },
  { id: "v2", name: "Onion", nameHi: "வெங்காயம்", emoji: "🧅", isAvailable: true },
  { id: "v3", name: "Potato", nameHi: "உருளை", emoji: "🥔", isAvailable: true },
  { id: "v4", name: "Brinjal", nameHi: "கத்திரி", emoji: "🍆", isAvailable: true },
  { id: "v5", name: "Drumstick", nameHi: "முருங்கை", emoji: "🌱", isAvailable: true },
  { id: "v6", name: "Okra", nameHi: "வெண்டை", emoji: "🟩", isAvailable: true },
  { id: "v7", name: "Carrot", nameHi: "கேரட்", emoji: "🥕", isAvailable: true },
  { id: "v8", name: "Beans", nameHi: "பீன்ஸ்", emoji: "🫘", isAvailable: true },
  { id: "v9", name: "Spinach/Keerai", nameHi: "கீரை", emoji: "🥬", isAvailable: true },
  { id: "v10", name: "Radish", nameHi: "முள்ளங்கி", emoji: "🫚", isAvailable: true },
  { id: "v11", name: "Snake Gourd", nameHi: "புடலங்கை", emoji: "🥒", isAvailable: true },
  { id: "v12", name: "Cauliflower", nameHi: "காலிஃப்ளவர்", emoji: "🥦", isAvailable: true },
  { id: "v13", name: "Cabbage", nameHi: "முட்டைகோஸ்", emoji: "🥗", isAvailable: true },
  { id: "v14", name: "Raw Banana", nameHi: "வாழைக்காய்", emoji: "🍌", isAvailable: true },
  { id: "v15", name: "Broad Beans", nameHi: "அவரை", emoji: "🫛", isAvailable: false },
  { id: "v16", name: "Shallots", nameHi: "சின்ன வெங்காயம்", emoji: "🧅", isAvailable: true },
  { id: "v17", name: "Tamarind", nameHi: "புளி", emoji: "🟤", isAvailable: true },
  { id: "v18", name: "Coconut", nameHi: "தேங்காய்", emoji: "🥥", isAvailable: true },
  { id: "v19", name: "Dal/Lentils", nameHi: "பருப்பு", emoji: "🫕", isAvailable: true },
  { id: "v20", name: "Rice", nameHi: "அரிசி", emoji: "🍚", isAvailable: true },
  { id: "v21", name: "Pepper", nameHi: "மிளகு", emoji: "⚫", isAvailable: true },
  { id: "v22", name: "Garlic", nameHi: "பூண்டு", emoji: "🧄", isAvailable: true },
  { id: "v23", name: "Curd/Buttermilk", nameHi: "தயிர்/மோர்", emoji: "🥛", isAvailable: true },
  { id: "v24", name: "Chickpeas", nameHi: "கடலை", emoji: "🟡", isAvailable: true },
];

// Map menu items to required ingredients (vegetable IDs)
export const menuIngredientMap: Record<string, string[]> = {
  m1: ["v16", "v19", "v17"],           // Chinna Vengayam Sambar: shallots, dal, tamarind
  m2: ["v5", "v19", "v17"],            // Murungaikai Sambar: drumstick, dal, tamarind
  m3: ["v4", "v5", "v19", "v17"],      // Kathirikai Murungakai Sambar: brinjal, drumstick, dal, tamarind
  m4: ["v7", "v8", "v19", "v17"],      // Carrot Beans Sambar: carrot, beans, dal, tamarind
  m5: ["v6", "v17", "v18"],            // Vendaikai Kara Kuzhambu: okra, tamarind, coconut
  m6: ["v3", "v17", "v18"],            // Urulai Kara Kuzhambu: potato, tamarind, coconut
  m7: ["v4", "v24", "v17", "v18"],     // Kathirikai Verkadalai Kara Kuzhambu: brinjal, chickpeas, tamarind, coconut
  m8: ["v6", "v23", "v18"],            // Vendaikai Moor Kuzhambu: okra, curd, coconut
  m9: ["v16", "v23", "v18"],           // Chinna Vengayam Moor Kuzhambu: shallots, curd, coconut
  m10: ["v4", "v23", "v18"],           // Kathirikai Moor Kuzhambu: brinjal, curd, coconut
  m11: ["v21", "v1", "v17"],           // Milagu Rasam: pepper, tomato, tamarind
  m12: ["v22", "v1", "v17"],           // Poondu Rasam: garlic, tomato, tamarind
  m13: ["v1", "v17"],                  // Tomato Rasam: tomato, tamarind
  m14: ["v15", "v1", "v17"],           // Lemon Rasam: lemon (raw banana placeholder), tomato, tamarind
  m15: ["v7", "v8", "v18"],            // Carrot Beans Poriyal: carrot, beans, coconut
  m16: ["v6", "v18"],                  // Vendaikai Poriyal: okra, coconut
  m17: ["v9", "v18"],                  // Keerai Poriyal: spinach, coconut
  m18: ["v13", "v2", "v18"],           // Cabbage Poriyal: cabbage, onion, coconut
  m19: ["v3", "v21"],                  // Urulai Kara Varuval: potato, pepper
  m20: ["v6"],                         // Vendaikai Varuval: okra
  m21: ["v3", "v24"],                  // Potato Channa Varuval: potato, chickpeas
  m22: ["v12", "v24"],                 // Cauliflower Channa Varuval: cauliflower, chickpeas
  m23: ["v14", "v2"],                  // Vazhaikkai Podimas: raw banana, onion
  m24: ["v3", "v2"],                   // Urulai Podimas: potato, onion
};

export interface PartnerMenuItemExtended extends PartnerMenuItem {
  requiredIngredients: string[];
}

export const partnerMenu: PartnerMenuItem[] = [
  // Paruppu Sambar
  { id: "m1", name: "Chinna Vengayam Sambar", description: "Sambar full of little tiny, juicy, tamarind soaked purple shallots", price: 167, category: "Paruppu Sambar", isVeg: true, isAvailable: true, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719484899_667d41e369b8a.jpg" },
  { id: "m2", name: "Murungaikai Sambar", description: "Popular all-time favorite sambar with drumstick vegetable", price: 167, category: "Paruppu Sambar", isVeg: true, isAvailable: true, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/items/1719484962_667d4222a2c20.jpg" },
  { id: "m3", name: "Kathirikai Murungakai Sambar", description: "Lentils with brinjal, drumstick, tamarind, herbs & special sambar powder", price: 174, category: "Paruppu Sambar", isVeg: true, isAvailable: true, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719485249_667d43416ca2c.jpg" },
  { id: "m4", name: "Carrot Beans Sambar", description: "Lentils with carrot, beans, tamarind, herbs & special sambar powder", price: 174, category: "Paruppu Sambar", isVeg: true, isAvailable: true, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719827105_66827aa1bd8f2.jpg" },
  // Kara Kuzhambu
  { id: "m5", name: "Vendaikai Kara Kuzhambu", description: "Spicy, tangy South Indian okra curry with tamarind, coconut & aromatic spices", price: 224, category: "Kara Kuzhambu", isVeg: true, isAvailable: true, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719486129_667d46b1608b3.jpg" },
  { id: "m6", name: "Urulai Kara Kuzhambu", description: "Potato curry in spicy, tangy tamarind base with coconut & aromatic spices", price: 224, category: "Kara Kuzhambu", isVeg: true, isAvailable: true, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719486172_667d46dc0b434.jpg" },
  { id: "m7", name: "Kathirikai Verkadalai Kara Kuzhambu", description: "Brinjal & groundnuts in spicy, tangy tamarind & coconut gravy", price: 229, category: "Kara Kuzhambu", isVeg: true, isAvailable: true, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719827650_66827cc244f6a.jpg" },
  // Moor Kuzhambu
  { id: "m8", name: "Vendaikai Moor Kuzhambu", description: "Healthy buttermilk curry with lady's finger", price: 210, category: "Moor Kuzhambu", isVeg: true, isAvailable: true, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719486472_667d4808dc725.jpg" },
  { id: "m9", name: "Chinna Vengayam Moor Kuzhambu", description: "Buttermilk curry with shallots, coconut & aromatic spices", price: 214, category: "Moor Kuzhambu", isVeg: true, isAvailable: true, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719486573_667d486dbdb4b.jpg" },
  { id: "m10", name: "Kathirikai Moor Kuzhambu", description: "Buttermilk curry with brinjal", price: 206, category: "Moor Kuzhambu", isVeg: true, isAvailable: true, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719827832_66827d78020ef.jpg" },
  // Rasam
  { id: "m11", name: "Milagu Rasam", description: "Spicy rasam with black pepper, tomatoes & other spices", price: 127, category: "Rasam", isVeg: true, isAvailable: true, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719486726_667d4906272e6.jpg" },
  { id: "m12", name: "Poondu Rasam", description: "Spicy, tangy rasam with tamarind, tomato & lots of garlic", price: 124, category: "Rasam", isVeg: true, isAvailable: true, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719486887_667d49a7cbcd2.jpg" },
  { id: "m13", name: "Tomato Rasam", description: "Spicy, tangy rasam with tamarind, tomato, garlic & herbs", price: 124, category: "Rasam", isVeg: true, isAvailable: true, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719486930_667d49d226416.jpg" },
  { id: "m14", name: "Lemon Rasam", description: "Aromatic rasam with tomato, spices, herbs & lemon extract", price: 124, category: "Rasam", isVeg: true, isAvailable: true, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719827995_66827e1b58b58.jpg" },
  // Poriyal
  { id: "m15", name: "Carrot Beans Poriyal", description: "Colorful stir fry of boiled carrot & beans with grated coconut", price: 196, category: "Poriyal", isVeg: true, isAvailable: true, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719487022_667d4a2e13758.jpg" },
  { id: "m16", name: "Vendaikai Poriyal", description: "Tempered & sautéed lady's finger with South Indian spices", price: 187, category: "Poriyal", isVeg: true, isAvailable: true, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719487269_667d4b252c3d7.jpg" },
  { id: "m17", name: "Keerai Poriyal", description: "Healthy stir-fry with nutrient-rich greens, spices & grated coconut", price: 196, category: "Poriyal", isVeg: true, isAvailable: true, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719490914_667d59628bbe2.jpg" },
  { id: "m18", name: "Cabbage Poriyal", description: "Cabbage seasoned with coconut oil, spices & fine chopped onions", price: 187, category: "Poriyal", isVeg: true, isAvailable: true, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719828597_668280757ce95.jpg" },
  // Varuval & Piratal
  { id: "m19", name: "Urulai Kara Varuval", description: "Potato varuval with South Indian spices", price: 205, category: "Varuval & Piratal", isVeg: true, isAvailable: true, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719828860_6682817cde325.jpg" },
  { id: "m20", name: "Vendaikai Varuval", description: "Lady's finger varuval with South Indian spices", price: 205, category: "Varuval & Piratal", isVeg: true, isAvailable: true, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719828892_6682819c1ca16.jpg" },
  { id: "m21", name: "Potato Channa Varuval", description: "Chickpeas & potato with South Indian spices", price: 205, category: "Varuval & Piratal", isVeg: true, isAvailable: true, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719828979_668281f37c1b4.jpg" },
  { id: "m22", name: "Cauliflower Channa Varuval", description: "Cauliflower & channa with a spicy touch", price: 211, category: "Varuval & Piratal", isVeg: true, isAvailable: true, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719754025_66815d29928e0.jpg" },
  // Podimas
  { id: "m23", name: "Vazhaikkai Podimas", description: "Boiled raw banana sautéed with onions, green chilies & mild spices", price: 193, category: "Podimas", isVeg: true, isAvailable: true, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1728298102_6703bc763ffff.png" },
  { id: "m24", name: "Urulai Podimas", description: "Boiled potatoes sautéed with onion & green chillies", price: 193, category: "Podimas", isVeg: true, isAvailable: true, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1728298127_6703bc8fb5075.png" },
];

export const earningsSummary: EarningsSummary = {
  today: 2340,
  thisWeek: 14580,
  thisMonth: 52430,
  totalOrders: 287,
  avgRating: 4.7,
  completionRate: 96.5,
  totalSales: 187500,
  pppEarnings: 52430,
  pppPercentage: 27.96,
  totalPenalties: 1275,
  penaltyCount: 14,
  netPayout: 51155,
  inductionDate: "2025-08-15",
};

export const weeklyEarnings = [
  { day: "Mon", amount: 1850, potential: 3200 },
  { day: "Tue", amount: 2340, potential: 3200 },
  { day: "Wed", amount: 0, potential: 3200 },      // On leave
  { day: "Thu", amount: 2780, potential: 3400 },
  { day: "Fri", amount: 3150, potential: 5100 },    // Fri 1.5x potential
  { day: "Sat", amount: 3890, potential: 7800 },    // Sat 2x (weekend/holiday surge)
  { day: "Sun", amount: 2650, potential: 7000 },    // Sun 2x (weekend/holiday surge)
];

// Opportunity calculations for partner (weekends/holidays have 2x potential)
export const opportunitySummary = {
  actualThisWeek: 16660,
  potentialThisWeek: 32900,     // Weekends inflated 2x
  missedThisWeek: 16240,
  actualThisMonth: 52430,
  potentialThisMonth: 85000,    // Holidays & weekends boost
  missedThisMonth: 32570,
  actualToday: 2340,
  potentialToday: 3200,
  missedToday: 860,
};

// ── CVAT Performance System ──

export type CVATCategory = "A" | "B" | "C" | "D";

export interface WeeklyPerformance {
  week: string; // e.g. "Week 1", "Week 2", "Week 3"
  weekLabel: string; // e.g. "Feb 10-16"
  kitchenTimingScore: number; // % on-time kitchen open/close
  productAvailability: number; // % products available vs committed
  customerReviews: number; // avg rating 1-5
  delayedDeliveries: number; // count of delayed orders
  totalOrders: number;
  badReviews: number; // count of 1-2 star reviews
  cancellations: number; // count of order cancellations
  scv: number; // scorecard value 0-100
  cvatCategory: CVATCategory;
}

export interface PerformanceInsight {
  type: "positive" | "warning" | "critical";
  metric: string;
  message: string;
  tip?: string;
}

export const performanceWeeks: WeeklyPerformance[] = [
  {
    week: "Week 1", weekLabel: "Feb 10–16",
    kitchenTimingScore: 88, productAvailability: 92, customerReviews: 4.5,
    delayedDeliveries: 3, totalOrders: 42, badReviews: 2, cancellations: 4, scv: 78, cvatCategory: "B",
  },
  {
    week: "Week 2", weekLabel: "Feb 17–23",
    kitchenTimingScore: 94, productAvailability: 96, customerReviews: 4.7,
    delayedDeliveries: 1, totalOrders: 51, badReviews: 1, cancellations: 1, scv: 88, cvatCategory: "A",
  },
  {
    week: "Week 3", weekLabel: "Feb 24–28",
    kitchenTimingScore: 91, productAvailability: 89, customerReviews: 4.3,
    delayedDeliveries: 4, totalOrders: 38, badReviews: 3, cancellations: 5, scv: 72, cvatCategory: "B",
  },
];

// SCV-based classification: A = 80+, B = 60-80, C = 40-60, D = below 40
export const getSCVCategory = (scv: number): CVATCategory => {
  if (scv >= 80) return "A";
  if (scv >= 60) return "B";
  if (scv >= 40) return "C";
  return "D";
};

export const currentSCV = 79;
export const currentCVAT: CVATCategory = getSCVCategory(currentSCV);

export const cvatDescriptions: Record<CVATCategory, { label: string; color: string; description: string; range: string }> = {
  A: { label: "Excellent", color: "text-green-600", description: "Superior performing kitchen – exemplary standards", range: "SCV 80+" },
  B: { label: "Good", color: "text-blue-600", description: "Good performance – room for minor improvements", range: "SCV 60–80" },
  C: { label: "Needs Improvement", color: "text-yellow-600", description: "Average performance – needs attention on key metrics", range: "SCV 40–60" },
  D: { label: "Critical", color: "text-red-600", description: "Low performance – urgent improvement required", range: "SCV below 40" },
};

export const performanceInsights: PerformanceInsight[] = [
  { type: "positive", metric: "Product Availability", message: "Your availability was 96% last week – great job keeping your full menu live!", tip: "Maintaining 95%+ availability boosts your visibility in customer search results." },
  { type: "warning", metric: "Kitchen Timing", message: "Your on-time kitchen opening dropped from 94% to 91% this week.", tip: "Try setting alarms 30 minutes before your scheduled opening. Consistent timing builds customer trust." },
  { type: "warning", metric: "Delayed Deliveries", message: "Delayed deliveries increased from 1 to 4 this week.", tip: "Consider preparing popular items slightly ahead of time during peak hours (12-1 PM, 7-8 PM)." },
  { type: "critical", metric: "Bad Reviews", message: "You received 3 low ratings (1-2 stars) this week – up from 1 last week.", tip: "Check specific feedback in your reviews. Common fixes: portion size, spice levels, packaging quality." },
];

// ── Referral Reward Milestones ──
// Milestone 1: Referred person gets "approved/listed" → ₹750
// Milestone 2: Referred person becomes "active" (starts cooking) → ₹1,500

export const REFERRAL_MILESTONE_1 = 750;  // On listed/approved
export const REFERRAL_MILESTONE_2 = 1500; // On active
export const REFERRAL_TOTAL_PER_PERSON = REFERRAL_MILESTONE_1 + REFERRAL_MILESTONE_2; // ₹2,250

export interface ReferralTier {
  milestone: 1 | 2;
  reward: number;
  label: string;
  trigger: string;
  description: string;
}

export interface Referral {
  id: string;
  name: string;
  phone: string;
  status: "pending" | "onboarded" | "active" | "rejected" | "under_review" | "paid";
  referredDate: string;
  joinedDate?: string;
  listedReward?: number;  // ₹750 paid when listed
  activeReward?: number;  // ₹1,500 paid when active
  totalReward: number;
  enrollmentLeadId?: string;
  enrollmentStatus?: string;
}

export const referralCode = "SHERO-MEERA24";

export const referralMilestones: ReferralTier[] = [
  { milestone: 1, reward: 750, label: "Listed", trigger: "approved", description: "Referred person applies, pays ₹999, and gets approved as a Shero partner" },
  { milestone: 2, reward: 1500, label: "Active", trigger: "active", description: "Referred partner starts cooking and completes their first order" },
];

// Keep old export name for backwards compatibility
export const referralTiers = referralMilestones;

export const referralStats = {
  totalReferred: 9,
  listed: 7,       // approved/onboarded
  active: 5,       // actively cooking
  pending: 2,
  rejected: 0,
  listedRewardsEarned: 5250,  // 7 × ₹750
  activeRewardsEarned: 7500,  // 5 × ₹1,500
  totalEarned: 12750,         // 5,250 + 7,500
  currentTier: "Champion" as string,
};

export const referralHistory: Referral[] = [
  { id: "R001", name: "Sunita Devi", phone: "98xxx12345", status: "active", referredDate: "Jan 15, 2026", joinedDate: "Jan 22, 2026", listedReward: 750, activeReward: 1500, totalReward: 2250, enrollmentLeadId: "EL-R01", enrollmentStatus: "approved" },
  { id: "R002", name: "Kavitha Rao", phone: "97xxx67890", status: "active", referredDate: "Jan 20, 2026", joinedDate: "Jan 28, 2026", listedReward: 750, activeReward: 1500, totalReward: 2250, enrollmentLeadId: "EL-R02", enrollmentStatus: "approved" },
  { id: "R003", name: "Lakshmi Nair", phone: "96xxx11223", status: "active", referredDate: "Feb 01, 2026", joinedDate: "Feb 08, 2026", listedReward: 750, activeReward: 1500, totalReward: 2250, enrollmentLeadId: "EL-R03", enrollmentStatus: "approved" },
  { id: "R004", name: "Anjali Sharma", phone: "95xxx44556", status: "active", referredDate: "Feb 05, 2026", joinedDate: "Feb 12, 2026", listedReward: 750, activeReward: 1500, totalReward: 2250, enrollmentLeadId: "EL-R04", enrollmentStatus: "approved" },
  { id: "R005", name: "Preethi Kumari", phone: "94xxx77889", status: "active", referredDate: "Feb 10, 2026", joinedDate: "Feb 18, 2026", listedReward: 750, activeReward: 1500, totalReward: 2250, enrollmentLeadId: "EL-R05", enrollmentStatus: "approved" },
  { id: "R006", name: "Radha Menon", phone: "93xxx00112", status: "onboarded", referredDate: "Feb 15, 2026", joinedDate: "Feb 22, 2026", listedReward: 750, totalReward: 750, enrollmentLeadId: "EL-R06", enrollmentStatus: "approved" },
  { id: "R007", name: "Deepa Gowda", phone: "92xxx33445", status: "paid", referredDate: "Feb 20, 2026", joinedDate: "Feb 26, 2026", listedReward: 750, totalReward: 750, enrollmentLeadId: "EL-R07", enrollmentStatus: "paid" },
  { id: "R008", name: "Fatima Begum", phone: "91xxx66778", status: "under_review", referredDate: "Feb 25, 2026", totalReward: 0, enrollmentLeadId: "EL-R08", enrollmentStatus: "video_watched" },
  { id: "R009", name: "Swathi Reddy", phone: "90xxx99001", status: "pending", referredDate: "Feb 27, 2026", totalReward: 0, enrollmentLeadId: "EL-R09", enrollmentStatus: "new" },
];
