// ── Subscription Plans & Standard Menus ──

export type SubscriptionDuration = "trial" | "weekly" | "monthly";
export type SubscriptionSlot = "breakfast" | "lunch" | "dinner";
export type SubscriptionStatus = "active" | "paused" | "cancelled" | "trial" | "expired";

export interface StandardMealPlan {
  id: string;
  name: string;
  cuisine: string;
  emoji: string;
  description: string;
  isVeg: boolean;
  slots: SubscriptionSlot[];
  pricePerDay: number; // per person per day
  weeklyMenu: WeeklyMenuDay[];
  highlights: string[];
  image: string;
  rating: number;
  subscribers: number;
}

export interface WeeklyMenuDay {
  day: string; // Mon, Tue, etc.
  meals: { slot: SubscriptionSlot; items: string[] }[];
}

export interface SubscriptionPricing {
  duration: SubscriptionDuration;
  label: string;
  days: number;
  discountPct: number;
  badge?: string;
}

export const subscriptionDurations: SubscriptionPricing[] = [
  { duration: "trial", label: "3-Day Trial", days: 3, discountPct: 0, badge: "Try First" },
  { duration: "weekly", label: "Weekly Plan", days: 7, discountPct: 5 },
  { duration: "monthly", label: "Monthly Plan", days: 30, discountPct: 15, badge: "Best Value" },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const standardMealPlans: StandardMealPlan[] = [
  {
    id: "sp-chettinad-veg",
    name: "Chettinad Veg Thali",
    cuisine: "Chettinad",
    emoji: "🍛",
    description: "Authentic Chettinad vegetarian meals with sambar, kuzhambu, poriyal & rasam — rotating daily",
    isVeg: true,
    slots: ["lunch", "dinner"],
    pricePerDay: 150,
    rating: 4.6,
    subscribers: 234,
    image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719484899_667d41e369b8a.jpg",
    highlights: ["Home-cooked taste", "Fresh daily", "Zero preservatives", "Rotating menu"],
    weeklyMenu: weekDays.map((day, i) => ({
      day,
      meals: [
        { slot: "lunch" as SubscriptionSlot, items: [
          ["Sambar Rice + Carrot Beans Poriyal + Rasam + Curd + Papad", "Kara Kuzhambu Rice + Vendaikai Poriyal + Rasam + Curd", "Moor Kuzhambu Rice + Urulai Podimas + Rasam + Papad", "Dal Fry Rice + Keerai Poriyal + Rasam + Curd", "Sambar Rice + Urulai Kara Varuval + Rasam + Curd", "Special Biryani + Raita + Papad", "Pongal + Sambar + Chutney + Vadai"][i],
        ]},
        { slot: "dinner" as SubscriptionSlot, items: [
          ["Chapati (4) + Paneer Curry + Dal + Salad", "Parotta (3) + Veg Kurma + Raita", "Chapati (4) + Aloo Gobi + Dal Tadka", "Dosa (3) + Sambar + Chutney", "Chapati (4) + Mixed Veg + Dal", "Fried Rice + Gobi Manchurian + Soup", "Idli (4) + Sambar + Chutney"][i],
        ]},
      ],
    })),
  },
  {
    id: "sp-chettinad-nv",
    name: "Chettinad Non-Veg Thali",
    cuisine: "Chettinad",
    emoji: "🍗",
    description: "Spicy Chettinad chicken & mutton curries with rice, sides & rasam",
    isVeg: false,
    slots: ["lunch"],
    pricePerDay: 180,
    rating: 4.8,
    subscribers: 189,
    image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719486129_667d46b1608b3.jpg",
    highlights: ["Country chicken", "Fresh spices", "Bone-in flavour", "Protein-rich"],
    weeklyMenu: weekDays.map((day, i) => ({
      day,
      meals: [{ slot: "lunch" as SubscriptionSlot, items: [
        ["Chicken Curry Rice + Egg Poriyal + Rasam", "Chicken Biryani + Raita + Boiled Egg", "Mutton Kuzhambu Rice + Chicken Fry + Rasam", "Fish Curry Rice + Egg Curry + Rasam", "Chicken Biryani + Chicken 65 + Raita", "Mutton Biryani + Raita + Egg Curry", "Chicken Curry Rice + Omelette + Rasam"][i],
      ]}],
    })),
  },
  {
    id: "sp-kerala-veg",
    name: "Kerala Sadya Box",
    cuisine: "Kerala",
    emoji: "🥥",
    description: "Traditional Kerala vegetarian meals with avial, olan, thoran & payasam on weekends",
    isVeg: true,
    slots: ["lunch"],
    pricePerDay: 160,
    rating: 4.5,
    subscribers: 156,
    image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719486472_667d4808dc725.jpg",
    highlights: ["Coconut-based", "Ayurvedic", "Weekend payasam", "Banana leaf style"],
    weeklyMenu: weekDays.map((day, i) => ({
      day,
      meals: [{ slot: "lunch" as SubscriptionSlot, items: [
        ["Avial + Sambar Rice + Thoran + Rasam + Curd", "Olan + Rice + Cabbage Thoran + Rasam", "Erissery + Rice + Beans Thoran + Buttermilk", "Kootu Curry + Rice + Avial + Rasam", "Sambar Rice + Pachadi + Thoran + Papadum", "Sadya Special: Avial + Olan + Payasam + Rice", "Puttu + Kadala Curry + Banana"][i],
      ]}],
    })),
  },
  {
    id: "sp-andhra-nv",
    name: "Andhra Spice Box",
    cuisine: "Andhra",
    emoji: "🌶️",
    description: "Fiery Andhra non-veg meals with gongura, mirchi dishes and authentic spice blends",
    isVeg: false,
    slots: ["lunch", "dinner"],
    pricePerDay: 175,
    rating: 4.7,
    subscribers: 198,
    image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719487022_667d4a2e13758.jpg",
    highlights: ["Guntur chili", "Gongura specials", "Country eggs", "Andhra pickle"],
    weeklyMenu: weekDays.map((day, i) => ({
      day,
      meals: [
        { slot: "lunch" as SubscriptionSlot, items: [
          ["Gongura Chicken + Rice + Pappu + Fry", "Chicken Biryani + Mirchi Ka Salan + Raita", "Natu Kodi Pulusu + Rice + Egg Fry + Chutney", "Gutti Vankaya Curry + Rice + Pappu + Pachadi", "Royyala Iguru + Rice + Dal + Fry", "Mutton Biryani + Raita + Egg Curry", "Pesarattu + Upma + Ginger Chutney"][i],
        ]},
        { slot: "dinner" as SubscriptionSlot, items: [
          ["Chapati (4) + Chicken Curry + Dal", "Parotta (3) + Egg Masala + Raita", "Chapati (4) + Mutton Fry + Dal", "Biryani + Raita", "Roti (4) + Chicken Do Pyaza + Dal", "Fried Rice + Chilli Chicken", "Dosa (3) + Chicken Kurma"][i],
        ]},
      ],
    })),
  },
  {
    id: "sp-north-veg",
    name: "North Indian Veg Dabba",
    cuisine: "North Indian",
    emoji: "🫓",
    description: "Rich Punjabi & Mughlai vegetarian meals with paneer, dal makhani & fresh rotis",
    isVeg: true,
    slots: ["lunch", "dinner"],
    pricePerDay: 165,
    rating: 4.4,
    subscribers: 142,
    image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719828860_6682817cde325.jpg",
    highlights: ["Fresh rotis", "Rich gravies", "Punjabi tadka", "Dessert Fridays"],
    weeklyMenu: weekDays.map((day, i) => ({
      day,
      meals: [
        { slot: "lunch" as SubscriptionSlot, items: [
          ["Dal Makhani + Jeera Rice + Aloo Gobi + Roti (3) + Raita", "Rajma + Rice + Mix Veg + Roti (3) + Salad", "Chole + Rice + Baingan Bharta + Roti (3)", "Kadhi Pakora + Rice + Aloo Palak + Roti (3)", "Paneer Butter Masala + Rice + Dal Fry + Naan (2)", "Veg Biryani + Raita + Paneer Tikka + Gulab Jamun", "Puri (4) + Chole + Aloo Sabzi + Halwa"][i],
        ]},
        { slot: "dinner" as SubscriptionSlot, items: [
          ["Chapati (4) + Palak Paneer + Dal", "Parantha (3) + Curd + Pickle", "Chapati (4) + Mushroom Masala + Dal", "Roti (4) + Matar Paneer + Raita", "Chapati (4) + Mix Dal + Bhindi Fry", "Fried Rice + Paneer Chilli + Soup", "Stuffed Parantha (3) + Curd + Chutney"][i],
        ]},
      ],
    })),
  },
  {
    id: "sp-breakfast",
    name: "South Indian Breakfast Box",
    cuisine: "South Indian",
    emoji: "🌅",
    description: "Hot idli, dosa, pongal & vada with fresh chutneys and filter coffee",
    isVeg: true,
    slots: ["breakfast"],
    pricePerDay: 99,
    rating: 4.9,
    subscribers: 312,
    image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719486887_667d49a7cbcd2.jpg",
    highlights: ["6:30 AM delivery", "Filter coffee", "Fresh ground", "Stone-ground batter"],
    weeklyMenu: weekDays.map((day, i) => ({
      day,
      meals: [{ slot: "breakfast" as SubscriptionSlot, items: [
        ["Idli (4) + Sambar + Chutney + Filter Coffee", "Masala Dosa (2) + Sambar + Chutney + Coffee", "Pongal + Vada (2) + Sambar + Coffee", "Rava Idli (4) + Chutney (3) + Coffee", "Upma + Vada (2) + Sambar + Coffee", "Poori (3) + Potato Masala + Payasam + Coffee", "Adai (2) + Aviyal + Jaggery Coffee"][i],
      ]}],
    })),
  },
];

// ── Subscription Customer (Admin View) ──

export interface SkippedSession {
  date: string;
  slot: SubscriptionSlot;
}

export interface SubscriptionCustomerRecord {
  id: string;
  name: string;
  mobile: string;
  email: string;
  planId: string;
  planName: string;
  duration: SubscriptionDuration;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  address: string;
  persons: number;
  slots: SubscriptionSlot[];
  skippedSessions: SkippedSession[];
  partnerId?: string;
  partnerName?: string;
  totalPaid: number;
  pauseReason?: string;
  cancelReason?: string;
  isCustomPlan: boolean;
  pricePerSession?: number;
}

const today = new Date();
const fmt = (d: Date) => d.toISOString().split("T")[0];
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

export const subscriptionCustomers: SubscriptionCustomerRecord[] = [
  { id: "SC001", name: "Priya Reddy", mobile: "9876543210", email: "priya@mail.com", planId: "sp-chettinad-veg", planName: "Chettinad Veg Thali", duration: "monthly", status: "active", startDate: fmt(addDays(today, -15)), endDate: fmt(addDays(today, 15)), address: "Flat 302, Cyber Towers, HITEC City", persons: 2, slots: ["lunch", "dinner"], skippedSessions: [{ date: fmt(addDays(today, -3)), slot: "lunch" }], partnerId: "P001", partnerName: "Chef Lakshmi Kitchen", totalPaid: 8550, isCustomPlan: false, pricePerSession: 95 },
  { id: "SC002", name: "Rahul Sharma", mobile: "9876543211", email: "rahul@mail.com", planId: "sp-andhra-nv", planName: "Andhra Spice Box", duration: "weekly", status: "active", startDate: fmt(addDays(today, -3)), endDate: fmt(addDays(today, 4)), address: "My Home Hub, Madhapur", persons: 1, slots: ["lunch"], skippedSessions: [], partnerId: "P003", partnerName: "Chef Meena Kitchen", totalPaid: 1225, isCustomPlan: false, pricePerSession: 175 },
  { id: "SC003", name: "Lakshmi Iyer", mobile: "9876543212", email: "lakshmi@mail.com", planId: "custom", planName: "Custom Meal Plan", duration: "monthly", status: "active", startDate: fmt(addDays(today, -10)), endDate: fmt(addDays(today, 20)), address: "Jubilee Hills Road 14", persons: 3, slots: ["breakfast", "lunch"], skippedSessions: [{ date: fmt(addDays(today, -5)), slot: "breakfast" }, { date: fmt(addDays(today, -1)), slot: "lunch" }], partnerId: "P002", partnerName: "Chef Fathima Kitchen", totalPaid: 15300, isCustomPlan: true, pricePerSession: 130 },
  { id: "SC004", name: "Anitha Kumari", mobile: "9876543213", email: "anitha@mail.com", planId: "sp-breakfast", planName: "South Indian Breakfast Box", duration: "trial", status: "trial", startDate: fmt(today), endDate: fmt(addDays(today, 3)), address: "Banjara Hills Road 12", persons: 1, slots: ["breakfast"], skippedSessions: [], totalPaid: 297, isCustomPlan: false, pricePerSession: 99 },
  { id: "SC005", name: "Sneha Pillai", mobile: "9876543214", email: "sneha@mail.com", planId: "sp-kerala-veg", planName: "Kerala Sadya Box", duration: "weekly", status: "paused", startDate: fmt(addDays(today, -5)), endDate: fmt(addDays(today, 2)), address: "Kondapur Main Road", persons: 2, slots: ["lunch"], skippedSessions: [], pauseReason: "Travelling for 3 days", partnerId: "P004", partnerName: "Chef Kamala Kitchen", totalPaid: 2128, isCustomPlan: false, pricePerSession: 152 },
  { id: "SC006", name: "Vikram Singh", mobile: "9876543215", email: "vikram@mail.com", planId: "sp-north-veg", planName: "North Indian Veg Dabba", duration: "monthly", status: "cancelled", startDate: fmt(addDays(today, -20)), endDate: fmt(addDays(today, -5)), address: "DLF Cyber City, Gachibowli", persons: 1, slots: ["lunch", "dinner"], skippedSessions: [], cancelReason: "Moving to a different city", partnerId: "P005", partnerName: "Chef Saroja Kitchen", totalPaid: 4950, isCustomPlan: false, pricePerSession: 90 },
  { id: "SC007", name: "Meera Joshi", mobile: "9876543216", email: "meera@mail.com", planId: "sp-chettinad-nv", planName: "Chettinad Non-Veg Thali", duration: "monthly", status: "active", startDate: fmt(addDays(today, -8)), endDate: fmt(addDays(today, 22)), address: "Aparna Sarovar, Nallagandla", persons: 1, slots: ["lunch"], skippedSessions: [{ date: fmt(addDays(today, 2)), slot: "lunch" }], partnerId: "P001", partnerName: "Chef Lakshmi Kitchen", totalPaid: 5400, isCustomPlan: false, pricePerSession: 180 },
  { id: "SC008", name: "Deepa Sharma", mobile: "9876543217", email: "deepa@mail.com", planId: "custom", planName: "Custom Family Plan", duration: "weekly", status: "active", startDate: fmt(addDays(today, -2)), endDate: fmt(addDays(today, 5)), address: "Lanco Hills, Manikonda", persons: 4, slots: ["breakfast", "lunch", "dinner"], skippedSessions: [], partnerId: "P002", partnerName: "Chef Fathima Kitchen", totalPaid: 7980, isCustomPlan: true, pricePerSession: 85 },
];

// ── Make Your Own menu items (reuse from master but simplified for subscriptions) ──

export interface SubscriptionMenuItem {
  id: string;
  name: string;
  category: string;
  cuisine: string;
  isVeg: boolean;
  pricePerServing: number;
  image: string;
}

export const subscriptionMenuItems: SubscriptionMenuItem[] = [
  // Chettinad
  { id: "sm1", name: "Sambar Rice", category: "Main", cuisine: "Chettinad", isVeg: true, pricePerServing: 60, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719484899_667d41e369b8a.jpg" },
  { id: "sm2", name: "Kara Kuzhambu Rice", category: "Main", cuisine: "Chettinad", isVeg: true, pricePerServing: 70, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719486129_667d46b1608b3.jpg" },
  { id: "sm3", name: "Carrot Beans Poriyal", category: "Side", cuisine: "Chettinad", isVeg: true, pricePerServing: 40, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719487022_667d4a2e13758.jpg" },
  { id: "sm4", name: "Rasam", category: "Side", cuisine: "Chettinad", isVeg: true, pricePerServing: 25, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719486726_667d4906272e6.jpg" },
  { id: "sm5", name: "Chicken Curry", category: "Main", cuisine: "Chettinad", isVeg: false, pricePerServing: 90, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719486129_667d46b1608b3.jpg" },
  { id: "sm6", name: "Chicken Biryani", category: "Main", cuisine: "Chettinad", isVeg: false, pricePerServing: 110, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719486129_667d46b1608b3.jpg" },
  { id: "sm7", name: "Egg Curry", category: "Side", cuisine: "Chettinad", isVeg: false, pricePerServing: 45, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719486573_667d486dbdb4b.jpg" },
  // Kerala
  { id: "sm8", name: "Avial + Rice", category: "Main", cuisine: "Kerala", isVeg: true, pricePerServing: 65, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719486472_667d4808dc725.jpg" },
  { id: "sm9", name: "Thoran", category: "Side", cuisine: "Kerala", isVeg: true, pricePerServing: 35, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719490914_667d59628bbe2.jpg" },
  { id: "sm10", name: "Fish Curry", category: "Main", cuisine: "Kerala", isVeg: false, pricePerServing: 95, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719486472_667d4808dc725.jpg" },
  // Andhra
  { id: "sm11", name: "Gongura Chicken Rice", category: "Main", cuisine: "Andhra", isVeg: false, pricePerServing: 100, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719487022_667d4a2e13758.jpg" },
  { id: "sm12", name: "Pappu + Rice", category: "Main", cuisine: "Andhra", isVeg: true, pricePerServing: 55, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719484899_667d41e369b8a.jpg" },
  { id: "sm13", name: "Gutti Vankaya Curry", category: "Side", cuisine: "Andhra", isVeg: true, pricePerServing: 50, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719487269_667d4b252c3d7.jpg" },
  // North Indian
  { id: "sm14", name: "Dal Makhani + Rice", category: "Main", cuisine: "North Indian", isVeg: true, pricePerServing: 70, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719828860_6682817cde325.jpg" },
  { id: "sm15", name: "Paneer Butter Masala", category: "Main", cuisine: "North Indian", isVeg: true, pricePerServing: 85, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719828860_6682817cde325.jpg" },
  { id: "sm16", name: "Chapati (4)", category: "Side", cuisine: "North Indian", isVeg: true, pricePerServing: 40, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719828860_6682817cde325.jpg" },
  { id: "sm17", name: "Butter Chicken", category: "Main", cuisine: "North Indian", isVeg: false, pricePerServing: 105, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719828860_6682817cde325.jpg" },
  // Breakfast
  { id: "sm18", name: "Idli (4) + Sambar + Chutney", category: "Breakfast", cuisine: "South Indian", isVeg: true, pricePerServing: 50, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719486887_667d49a7cbcd2.jpg" },
  { id: "sm19", name: "Masala Dosa (2) + Sambar", category: "Breakfast", cuisine: "South Indian", isVeg: true, pricePerServing: 60, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719486887_667d49a7cbcd2.jpg" },
  { id: "sm20", name: "Pongal + Vada (2)", category: "Breakfast", cuisine: "South Indian", isVeg: true, pricePerServing: 55, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719486887_667d49a7cbcd2.jpg" },
  { id: "sm21", name: "Filter Coffee", category: "Beverage", cuisine: "South Indian", isVeg: true, pricePerServing: 20, image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719486887_667d49a7cbcd2.jpg" },
];
