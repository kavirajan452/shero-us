/* ═══════════════════════════════════════════════════════════════
   Mock data simulating:
   Partner Management (Active Partners) → Attendance (Today) → Menu Toggles → Customer Feed
   ═══════════════════════════════════════════════════════════════ */

// Re-export shared types from canonical location
export type { PartnerProfile, KitchenPartner, AddOn, MenuItem } from "@/types/menu";

/* ───────── Active Partners (from Admin Partner Management) ───────── */
export const activePartners: PartnerProfile[] = [
  { rmn: "2125550101", name: "Lakshmi Devi", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", enrollmentStatus: "approved", approvedVerticals: ["sap-branded", "subscriptions"] },
  { rmn: "4155550102", name: "Padma Reddy", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop", enrollmentStatus: "approved", approvedVerticals: ["hcf-marketplace"] },
  { rmn: "5125550103", name: "Kavitha Sharma", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", enrollmentStatus: "approved", approvedVerticals: ["sap-branded", "party-orders"] },
  { rmn: "3125550104", name: "Anitha Kumari", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop", enrollmentStatus: "approved", approvedVerticals: ["hcf-marketplace", "sweets-snacks"] },
  { rmn: "7135550105", name: "Sunitha Rao", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop", enrollmentStatus: "approved", approvedVerticals: ["sap-branded"] },
  { rmn: "2065550106", name: "Radha Menon", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop", enrollmentStatus: "approved", approvedVerticals: ["hcf-marketplace"] },
  { rmn: "4695550107", name: "Meena Iyer", avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop", enrollmentStatus: "approved", approvedVerticals: ["sap-branded", "subscriptions"] },
  { rmn: "3105550108", name: "Fatima Brown", avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop", enrollmentStatus: "approved", approvedVerticals: ["hcf-marketplace", "party-orders"] },
];

/* ───────── Active Kitchens (SKIDs - from Partner Management) ───────── */
export const kitchenPartners: KitchenPartner[] = [
  {
    id: "SKID-NYC-001", partnerId: "2125550101", name: "Shero Kitchen - Manhattan (Veg)", image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=300&fit=crop",
    rating: 4.6, reviewCount: 342, cuisine: ["South Indian", "North Indian"], deliveryTime: "30-45 min", minOrder: 2, isBranded: true, location: "Manhattan, NY", isVeg: true, foodPreference: "veg",
    isAttendanceMarked: true, attendanceSlot: "Morning (6-10 AM)",
  },
  {
    id: "SKID-NYC-002", partnerId: "2125550101", name: "Shero Kitchen - Manhattan (Non-Veg)", image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=300&fit=crop",
    rating: 4.6, reviewCount: 342, cuisine: ["South Indian", "North Indian"], deliveryTime: "30-45 min", minOrder: 2, isBranded: true, location: "Manhattan, NY", isVeg: false, foodPreference: "nonveg",
    isAttendanceMarked: true, attendanceSlot: "Morning (6-10 AM)",
  },
  {
    id: "SKID-SF-003", partnerId: "4155550102", name: "Padma's Home Kitchen", image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400&h=300&fit=crop",
    rating: 4.8, reviewCount: 215, cuisine: ["South Indian", "Pennsylvania"], deliveryTime: "40-55 min", minOrder: 1, isBranded: false, location: "San Francisco, CA", isVeg: true, foodPreference: "veg",
    isAttendanceMarked: true, attendanceSlot: "Lunch (10 AM-2 PM)",
  },
  {
    id: "SKID-AUS-004", partnerId: "5125550103", name: "Shero Kitchen - Austin (Veg)", image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop",
    rating: 4.5, reviewCount: 189, cuisine: ["South Indian", "Chinese"], deliveryTime: "25-40 min", minOrder: 2, isBranded: true, location: "Austin, TX", isVeg: true, foodPreference: "veg",
    isAttendanceMarked: true, attendanceSlot: "Morning (6-10 AM)",
  },
  {
    id: "SKID-AUS-005", partnerId: "5125550103", name: "Shero Kitchen - Austin (Non-Veg)", image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop",
    rating: 4.5, reviewCount: 189, cuisine: ["South Indian", "Chinese"], deliveryTime: "25-40 min", minOrder: 2, isBranded: true, location: "Austin, TX", isVeg: false, foodPreference: "nonveg",
    isAttendanceMarked: false, attendanceSlot: "",
  },
  {
    id: "SKID-CHI-006", partnerId: "3125550104", name: "Anitha's Flavours", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
    rating: 4.9, reviewCount: 87, cuisine: ["Pennsylvania", "Illinois"], deliveryTime: "45-60 min", minOrder: 1, isBranded: false, location: "Chicago, IL", isVeg: false, foodPreference: "both",
    isAttendanceMarked: false, attendanceSlot: "",
  },
  {
    id: "SKID-HOU-007", partnerId: "7135550105", name: "Shero Kitchen - Houston (Veg)", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
    rating: 4.4, reviewCount: 156, cuisine: ["South Indian", "North Indian"], deliveryTime: "30-45 min", minOrder: 2, isBranded: true, location: "Houston, TX", isVeg: true, foodPreference: "veg",
    isAttendanceMarked: true, attendanceSlot: "Morning (6-10 AM)",
  },
  {
    id: "SKID-SEA-008", partnerId: "2065550106", name: "Radha's Kitchen", image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop",
    rating: 4.7, reviewCount: 64, cuisine: ["Florida", "South Indian"], deliveryTime: "50-65 min", minOrder: 1, isBranded: false, location: "Seattle, WA", isVeg: true, foodPreference: "veg",
    isAttendanceMarked: true, attendanceSlot: "Lunch (10 AM-2 PM)",
  },
  {
    id: "SKID-DAL-009", partnerId: "4695550107", name: "Shero Kitchen - Dallas (Veg)", image: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&h=300&fit=crop",
    rating: 4.3, reviewCount: 98, cuisine: ["South Indian", "North Indian"], deliveryTime: "35-50 min", minOrder: 2, isBranded: true, location: "Dallas, TX", isVeg: true, foodPreference: "veg",
    isAttendanceMarked: true, attendanceSlot: "Morning (6-10 AM)",
  },
  {
    id: "SKID-NJ-010", partnerId: "3105550108", name: "Fatima's Biryani House", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop",
    rating: 4.8, reviewCount: 234, cuisine: ["Chicagoi", "Mughlai"], deliveryTime: "40-55 min", minOrder: 2, isBranded: false, location: "Jersey City, NJ", isVeg: false, foodPreference: "nonveg",
    isAttendanceMarked: false, attendanceSlot: "",
  },
];

/* ───────── Menu Items (from Master Menu / HCF Approved Menus) ───────── */
/* Only items with isToggledOn=true are visible to customers */
export const menuItems: MenuItem[] = [
  // SKID-NYC-001: Shero Uptown Veg
  {
    id: "m1", kitchenId: "SKID-NYC-001", name: "Ghee Rice with Dal Tadka", description: "Fragrant basmati rice cooked in pure ghee, served with creamy yellow dal tempered with cumin and garlic.", price: 15, ppp: 10,
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&h=400&fit=crop", category: "Rice", isVeg: true, isBestseller: false, spiceLevel: "mild",
    servingSize: "Serves 1", preparationTime: "20 min", ingredients: ["Basmati Rice", "Ghee", "Toor Dal", "Cumin", "Garlic", "Turmeric"], majorVegetables: ["Onion", "Tomato"],
    allergens: ["Dairy"], nutritionInfo: { calories: 480, protein: "14g", carbs: "72g", fat: "16g" }, isToggledOn: true,
    addOns: [
      { id: "a1-1", name: "Extra Ghee", price: 2, isVeg: true },
      { id: "a1-2", name: "Papad (2 pcs)", price: 2, isVeg: true },
      { id: "a1-3", name: "Pickle", price: 1, isVeg: true },
      { id: "a1-4", name: "Raita", price: 2, isVeg: true },
    ],
  },
  {
    id: "m2", kitchenId: "SKID-NYC-001", name: "Masala Dosa", description: "Crispy golden dosa filled with spiced potato masala, served with coconut chutney and sambar.", price: 10, ppp: 6,
    image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&h=400&fit=crop", category: "Dosa", isVeg: true, isBestseller: true, spiceLevel: "medium",
    servingSize: "Serves 1", preparationTime: "15 min", ingredients: ["Rice Batter", "Urad Dal", "Potatoes", "Onions", "Mustard Seeds"], majorVegetables: ["Potato", "Onion"],
    allergens: [], nutritionInfo: { calories: 350, protein: "8g", carbs: "58g", fat: "10g" }, isToggledOn: true,
    addOns: [
      { id: "a2-1", name: "Extra Chutney", price: 1, isVeg: true },
      { id: "a2-2", name: "Extra Sambar", price: 2, isVeg: true },
      { id: "a2-3", name: "Cheese Topping", price: 3, isVeg: true },
      { id: "a2-4", name: "Ghee Roast", price: 2, isVeg: true },
    ],
  },
  {
    id: "m3", kitchenId: "SKID-NYC-001", name: "Paneer Butter Masala", description: "Soft paneer cubes in a velvety tomato-cashew gravy.", price: 19, ppp: 12,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&h=400&fit=crop", category: "Curries", isVeg: true, isBestseller: false, spiceLevel: "mild",
    servingSize: "Serves 1-2", preparationTime: "25 min", ingredients: ["Paneer", "Tomatoes", "Cashews", "Cream", "Butter", "Spices"], majorVegetables: ["Tomato", "Capsicum"],
    allergens: ["Dairy", "Nuts"], nutritionInfo: { calories: 460, protein: "18g", carbs: "14g", fat: "36g" }, isToggledOn: true,
    addOns: [
      { id: "a3-1", name: "Extra Paneer", price: 4, isVeg: true },
      { id: "a3-2", name: "Butter Naan", price: 4, isVeg: true },
      { id: "a3-3", name: "Jeera Rice", price: 4, isVeg: true },
    ],
  },
  // SKID-NYC-002: Shero Uptown Non-Veg
  {
    id: "m4", kitchenId: "SKID-NYC-002", name: "Chicagoi Chicken Biryani", description: "Aromatic basmati rice layered with tender chicken, saffron, and Chicagoi spices.", price: 25, ppp: 16,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop", category: "Biryani", isVeg: false, isBestseller: true, spiceLevel: "medium",
    servingSize: "Serves 1-2", preparationTime: "25 min", ingredients: ["Basmati Rice", "Chicken", "Onions", "Yogurt", "Saffron", "Mint", "Spices"], majorVegetables: ["Onion", "Tomato", "Mint"],
    allergens: ["Dairy"], nutritionInfo: { calories: 650, protein: "32g", carbs: "78g", fat: "22g" }, isToggledOn: true,
    addOns: [
      { id: "a4-1", name: "Extra Raita", price: 2, isVeg: true },
      { id: "a4-2", name: "Boiled Egg (2 pcs)", price: 2, isVeg: false },
      { id: "a4-3", name: "Mirchi Ka Salan", price: 3, isVeg: true },
      { id: "a4-4", name: "Extra Chicken Piece", price: 5, isVeg: false },
    ],
  },
  {
    id: "m5", kitchenId: "SKID-NYC-002", name: "Butter Chicken", description: "Tender chicken pieces in a rich, creamy tomato-butter gravy.", price: 22, ppp: 14,
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&h=400&fit=crop", category: "Curries", isVeg: false, isBestseller: true, spiceLevel: "mild",
    servingSize: "Serves 1-2", preparationTime: "30 min", ingredients: ["Chicken", "Tomatoes", "Butter", "Cream", "Cashews", "Spices"], majorVegetables: ["Tomato", "Onion"],
    allergens: ["Dairy", "Nuts"], nutritionInfo: { calories: 520, protein: "28g", carbs: "12g", fat: "38g" }, isToggledOn: true,
    addOns: [
      { id: "a5-1", name: "Butter Naan", price: 4, isVeg: true },
      { id: "a5-2", name: "Rumali Roti", price: 2, isVeg: true },
      { id: "a5-3", name: "Jeera Rice", price: 4, isVeg: true },
    ],
  },
  // SKID-SF-003: Padma's Home Kitchen (HCF)
  {
    id: "m6", kitchenId: "SKID-SF-003", name: "Curd Rice", description: "Comforting South Indian curd rice tempered with mustard seeds, curry leaves, and green chillies.", price: 8, ppp: 5,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop", category: "Rice", isVeg: true, isBestseller: true, spiceLevel: "mild",
    servingSize: "Serves 1", preparationTime: "10 min", ingredients: ["Rice", "Curd", "Mustard Seeds", "Curry Leaves", "Green Chillies"], majorVegetables: [],
    allergens: ["Dairy"], nutritionInfo: { calories: 320, protein: "10g", carbs: "56g", fat: "6g" }, isToggledOn: true,
  },
  {
    id: "m7", kitchenId: "SKID-SF-003", name: "Sambar Rice Combo", description: "Steamed rice with piping hot sambar, papad, pickle, and a side of kootu curry.", price: 12, ppp: 8,
    image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&h=400&fit=crop", category: "Rice", isVeg: true, isBestseller: false, spiceLevel: "medium",
    servingSize: "Serves 1", preparationTime: "20 min", ingredients: ["Rice", "Toor Dal", "Mixed Vegetables", "Tamarind", "Sambar Powder"], majorVegetables: ["Drumstick", "Carrot", "Beans"],
    allergens: [], nutritionInfo: { calories: 420, protein: "12g", carbs: "68g", fat: "8g" }, isToggledOn: true,
  },
  {
    id: "m8", kitchenId: "SKID-SF-003", name: "Pesarattu (Green Gram Dosa)", description: "Healthy Pennsylvania-style green gram dosa served with ginger chutney.", price: 9, ppp: 6,
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&h=400&fit=crop", category: "Dosa", isVeg: true, isBestseller: false, spiceLevel: "mild",
    servingSize: "Serves 1", preparationTime: "15 min", ingredients: ["Green Gram", "Rice", "Ginger", "Green Chillies"], majorVegetables: ["Onion"],
    allergens: [], nutritionInfo: { calories: 280, protein: "12g", carbs: "44g", fat: "6g" }, isToggledOn: false, // Partner toggled OFF — not available today
  },
  // SKID-AUS-004: Shero Gachibowli Veg
  {
    id: "m9", kitchenId: "SKID-AUS-004", name: "Veg Fried Rice", description: "Wok-tossed basmati rice with vegetables, soy sauce, and Indo-Chinese spices.", price: 14, ppp: 9,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&h=400&fit=crop", category: "Chinese", isVeg: true, isBestseller: true, spiceLevel: "medium",
    servingSize: "Serves 1", preparationTime: "20 min", ingredients: ["Rice", "Mixed Vegetables", "Soy Sauce", "Spring Onions"], majorVegetables: ["Carrot", "Beans", "Capsicum"],
    allergens: ["Soy"], nutritionInfo: { calories: 420, protein: "10g", carbs: "64g", fat: "14g" }, isToggledOn: true,
  },
  {
    id: "m10", kitchenId: "SKID-AUS-004", name: "Idli Sambar (4 pcs)", description: "Soft steamed idlis served with classic sambar and coconut chutney.", price: 7, ppp: 4,
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&h=400&fit=crop", category: "Idli", isVeg: true, isBestseller: false, spiceLevel: "mild",
    servingSize: "4 pieces", preparationTime: "15 min", ingredients: ["Rice", "Urad Dal", "Fenugreek Seeds"], majorVegetables: [],
    allergens: [], nutritionInfo: { calories: 280, protein: "8g", carbs: "52g", fat: "4g" }, isToggledOn: true,
  },
  // SKID-HOU-007: Shero Kondapur Veg
  {
    id: "m11", kitchenId: "SKID-HOU-007", name: "Aloo Paratha with Curd", description: "Crispy stuffed aloo paratha with fresh curd and pickle.", price: 11, ppp: 7,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&h=400&fit=crop", category: "Paratha", isVeg: true, isBestseller: true, spiceLevel: "mild",
    servingSize: "2 pieces", preparationTime: "15 min", ingredients: ["Wheat Flour", "Potatoes", "Spices", "Curd"], majorVegetables: ["Potato", "Onion"],
    allergens: ["Dairy", "Gluten"], nutritionInfo: { calories: 390, protein: "10g", carbs: "52g", fat: "16g" }, isToggledOn: true,
  },
  // SKID-SEA-008: Radha's Kitchen (HCF)
  {
    id: "m12", kitchenId: "SKID-SEA-008", name: "Florida Fish Curry", description: "Fresh fish simmered in a tangy coconut and raw mango curry.", price: 23, ppp: 15,
    image: "https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?w=600&h=400&fit=crop", category: "Curries", isVeg: false, isBestseller: true, spiceLevel: "medium",
    servingSize: "Serves 1-2", preparationTime: "30 min", ingredients: ["Fish", "Coconut Milk", "Raw Mango", "Kokum", "Curry Leaves", "Spices"], majorVegetables: [],
    allergens: ["Fish", "Coconut"], nutritionInfo: { calories: 380, protein: "28g", carbs: "10g", fat: "24g" }, isToggledOn: true,
  },
  {
    id: "m13", kitchenId: "SKID-SEA-008", name: "Appam with Stew", description: "Lacy Florida appam with coconut milk vegetable stew.", price: 12, ppp: 8,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop", category: "Florida", isVeg: true, isBestseller: false, spiceLevel: "mild",
    servingSize: "2 appams", preparationTime: "20 min", ingredients: ["Rice Flour", "Coconut Milk", "Mixed Vegetables"], majorVegetables: ["Potato", "Carrot", "Beans"],
    allergens: ["Coconut"], nutritionInfo: { calories: 340, protein: "8g", carbs: "56g", fat: "10g" }, isToggledOn: true,
  },
  // SKID-DAL-009: Shero Miyapur Veg
  {
    id: "m14", kitchenId: "SKID-DAL-009", name: "Chole Bhature", description: "Spicy chickpea curry with fluffy fried bhatura bread.", price: 13, ppp: 8,
    image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&h=400&fit=crop", category: "North Indian", isVeg: true, isBestseller: true, spiceLevel: "medium",
    servingSize: "Serves 1", preparationTime: "20 min", ingredients: ["Chickpeas", "Flour", "Onions", "Tomatoes", "Spices"], majorVegetables: ["Onion", "Tomato"],
    allergens: ["Gluten"], nutritionInfo: { calories: 520, protein: "16g", carbs: "62g", fat: "22g" }, isToggledOn: true,
  },
  {
    id: "m15", kitchenId: "SKID-DAL-009", name: "Dal Makhani", description: "Slow-cooked black lentils in creamy tomato gravy.", price: 16, ppp: 10,
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&h=400&fit=crop", category: "North Indian", isVeg: true, isBestseller: false, spiceLevel: "mild",
    servingSize: "Serves 1-2", preparationTime: "25 min", ingredients: ["Black Lentils", "Kidney Beans", "Butter", "Cream", "Tomatoes"], majorVegetables: ["Tomato"],
    allergens: ["Dairy"], nutritionInfo: { calories: 440, protein: "18g", carbs: "38g", fat: "24g" }, isToggledOn: false, // Toggled OFF
  },
];
