// ── Subscription Orders Mock Data ──

export type SubscriptionMealSlot = "breakfast" | "lunch" | "dinner";
export type SubscriptionPlanType = "veg" | "nonveg" | "family" | "custom";
export type SubscriptionOrderStatus = "pending" | "cooking" | "packed" | "dispatched" | "delivered" | "skipped";

export interface SubscriptionCustomer {
  id: string;
  name: string;
  planType: SubscriptionPlanType;
  address: string;
  note?: string;
  allergens?: string[];
}

export interface SubscriptionMealOrder {
  id: string;
  slot: SubscriptionMealSlot;
  planType: SubscriptionPlanType;
  date: string; // YYYY-MM-DD
  items: { name: string; qty: number }[];
  customers: SubscriptionCustomer[];
  status: SubscriptionOrderStatus;
  totalPortions: number;
}

export const subscriptionMealOrders: SubscriptionMealOrder[] = [
  {
    id: "SUB-L001",
    slot: "lunch",
    planType: "veg",
    date: new Date().toISOString().split("T")[0],
    items: [
      { name: "Sambar Rice", qty: 12 },
      { name: "Carrot Beans Poriyal", qty: 12 },
      { name: "Rasam", qty: 12 },
      { name: "Curd", qty: 12 },
      { name: "Papad", qty: 12 },
    ],
    customers: [
      { id: "c1", name: "Priya Reddy", planType: "veg", address: "Flat 302, Cyber Towers" },
      { id: "c2", name: "Lakshmi Iyer", planType: "veg", address: "Plot 14, Uptown", allergens: ["Nuts"] },
      { id: "c3", name: "Anitha Kumari", planType: "veg", address: "8-3-214, Downtown" },
      { id: "c4", name: "Shalini Rao", planType: "veg", address: "Aparna Sarovar, Nallagandla", note: "Extra rasam" },
      { id: "c5", name: "Kavitha Menon", planType: "veg", address: "My Home Hub, Madhapur" },
      { id: "c6", name: "Revathi Nair", planType: "veg", address: "Rainbow Vistas, Hitech City" },
      { id: "c7", name: "Deepa Sharma", planType: "veg", address: "Lanco Hills, Manikonda" },
      { id: "c8", name: "Uma Devi", planType: "veg", address: "Vasavi Colony, Kondapur" },
      { id: "c9", name: "Radha Krishnan", planType: "veg", address: "Green Park Colony, Ameerpet" },
      { id: "c10", name: "Sarala Bai", planType: "veg", address: "Sai Nagar, Kukatpally" },
      { id: "c11", name: "Meenakshi S", planType: "veg", address: "Padma Colony, Dilsukhnagar" },
      { id: "c12", name: "Jaya Lakshmi", planType: "veg", address: "SR Nagar, Chicago" },
    ],
    status: "pending",
    totalPortions: 12,
  },
  {
    id: "SUB-L002",
    slot: "lunch",
    planType: "nonveg",
    date: new Date().toISOString().split("T")[0],
    items: [
      { name: "Chicken Biryani", qty: 5 },
      { name: "Raita", qty: 5 },
      { name: "Boiled Egg Curry", qty: 5 },
      { name: "Salad", qty: 5 },
    ],
    customers: [
      { id: "c13", name: "Rahul Sharma", planType: "nonveg", address: "Flat 102, Lakshmi Towers", note: "Mild spice" },
      { id: "c14", name: "Ankit Gupta", planType: "nonveg", address: "House 8-3-214, Uptown" },
      { id: "c15", name: "Vikram Singh", planType: "nonveg", address: "My Home Hub, Madhapur", allergens: ["Shellfish"] },
      { id: "c16", name: "Arjun Reddy", planType: "nonveg", address: "Cyber Pearl, Financial District" },
      { id: "c17", name: "Karthik M", planType: "nonveg", address: "Botanical Garden Rd, Kondapur" },
    ],
    status: "cooking",
    totalPortions: 5,
  },
  {
    id: "SUB-D001",
    slot: "dinner",
    planType: "veg",
    date: new Date().toISOString().split("T")[0],
    items: [
      { name: "Chapati (4)", qty: 8 },
      { name: "Paneer Butter Masala", qty: 8 },
      { name: "Dal Fry", qty: 8 },
      { name: "Jeera Rice", qty: 8 },
    ],
    customers: [
      { id: "c18", name: "Sneha Pillai", planType: "veg", address: "Kondapur Main Road" },
      { id: "c19", name: "Meera Joshi", planType: "veg", address: "Aparna Sarovar, Nallagandla" },
      { id: "c20", name: "Divya T", planType: "veg", address: "Whitefields, Financial District" },
      { id: "c21", name: "Nandini R", planType: "veg", address: "Gachibowli Main Rd" },
      { id: "c22", name: "Pooja Verma", planType: "veg", address: "DLF Cyber City" },
      { id: "c23", name: "Swathi K", planType: "veg", address: "Financial District" },
      { id: "c24", name: "Bhavani G", planType: "veg", address: "Nanakramguda" },
      { id: "c25", name: "Padma L", planType: "veg", address: "Raidurg" },
    ],
    status: "pending",
    totalPortions: 8,
  },
  {
    id: "SUB-B001",
    slot: "breakfast",
    planType: "veg",
    date: new Date().toISOString().split("T")[0],
    items: [
      { name: "Idli (4)", qty: 6 },
      { name: "Sambar", qty: 6 },
      { name: "Coconut Chutney", qty: 6 },
      { name: "Filter Coffee", qty: 6 },
    ],
    customers: [
      { id: "c26", name: "Rekha S", planType: "veg", address: "Uptown Road 36" },
      { id: "c27", name: "Vijaya M", planType: "veg", address: "Downtown Road 12" },
      { id: "c28", name: "Sudha R", planType: "veg", address: "Somajiguda" },
      { id: "c29", name: "Kamala D", planType: "veg", address: "Begumpet" },
      { id: "c30", name: "Vasantha P", planType: "veg", address: "Secunderabad" },
      { id: "c31", name: "Geetha N", planType: "veg", address: "Ameerpet" },
    ],
    status: "delivered",
    totalPortions: 6,
  },
];

// ── Service Bookings Mock Data ──

export type ServiceCategory = "yoga" | "zumba" | "fitness" | "nutrition" | "cookery" | "tuitions" | "wellness" | "eldercare" | "parenting" | "astrology";
export type ServiceBookingStatus = "upcoming" | "in_progress" | "completed" | "cancelled";
export type ServiceMode = "online" | "in_person";

export interface ServiceBooking {
  id: string;
  serviceCategory: ServiceCategory;
  serviceName: string;
  customerName: string;
  date: string;
  time: string;
  duration: string; // e.g. "60 min"
  mode: ServiceMode;
  status: ServiceBookingStatus;
  price: number;
  notes?: string;
  meetingLink?: string;
  address?: string;
  studentsCount?: number; // for group classes
}

const today = new Date().toISOString().split("T")[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

export const serviceBookings: ServiceBooking[] = [
  {
    id: "SRV-001", serviceCategory: "yoga", serviceName: "Morning Yoga Flow",
    customerName: "Ananya Kapoor", date: today, time: "06:30 AM", duration: "60 min",
    mode: "online", status: "upcoming", price: 499, meetingLink: "https://meet.google.com/abc",
    studentsCount: 8,
  },
  {
    id: "SRV-002", serviceCategory: "cookery", serviceName: "South Indian Breakfast Masterclass",
    customerName: "Divya Suresh", date: today, time: "10:00 AM", duration: "90 min",
    mode: "in_person", status: "in_progress", price: 1299,
    address: "Partner Kitchen, Uptown", studentsCount: 4,
    notes: "Participants bringing own utensils",
  },
  {
    id: "SRV-003", serviceCategory: "nutrition", serviceName: "1-on-1 Diet Consultation",
    customerName: "Ramesh Babu", date: today, time: "02:00 PM", duration: "45 min",
    mode: "online", status: "upcoming", price: 799, meetingLink: "https://meet.google.com/xyz",
  },
  {
    id: "SRV-004", serviceCategory: "zumba", serviceName: "Evening Zumba Fitness",
    customerName: "Sita Lakshmi", date: today, time: "05:30 PM", duration: "45 min",
    mode: "online", status: "upcoming", price: 399, meetingLink: "https://meet.google.com/def",
    studentsCount: 15,
  },
  {
    id: "SRV-005", serviceCategory: "fitness", serviceName: "Personal Fitness Training",
    customerName: "Vikash Kumar", date: tomorrow, time: "07:00 AM", duration: "60 min",
    mode: "in_person", status: "upcoming", price: 999,
    address: "Green Park Colony, Ameerpet",
  },
  {
    id: "SRV-006", serviceCategory: "parenting", serviceName: "New Mom Wellness Session",
    customerName: "Neha Agarwal", date: tomorrow, time: "11:00 AM", duration: "45 min",
    mode: "online", status: "upcoming", price: 699, meetingLink: "https://meet.google.com/ghi",
  },
  {
    id: "SRV-007", serviceCategory: "cookery", serviceName: "Chicagoi Biryani Workshop",
    customerName: "Fatima Begum", date: today, time: "11:00 AM", duration: "120 min",
    mode: "in_person", status: "completed", price: 1999,
    address: "Partner Kitchen, Downtown", studentsCount: 6,
  },
  {
    id: "SRV-008", serviceCategory: "wellness", serviceName: "Stress Management Coaching",
    customerName: "Arun Prakash", date: tomorrow, time: "04:00 PM", duration: "60 min",
    mode: "online", status: "upcoming", price: 899,
  },
];

export const serviceCategoryConfig: Record<ServiceCategory, { label: string; emoji: string; color: string }> = {
  yoga: { label: "Yoga & Meditation", emoji: "🧘", color: "bg-green-100 text-green-800" },
  zumba: { label: "Zumba & Dance", emoji: "💃", color: "bg-pink-100 text-pink-800" },
  fitness: { label: "Fitness", emoji: "💪", color: "bg-blue-100 text-blue-800" },
  nutrition: { label: "Diet & Nutrition", emoji: "🥗", color: "bg-emerald-100 text-emerald-800" },
  cookery: { label: "Cookery Class", emoji: "👩‍🍳", color: "bg-orange-100 text-orange-800" },
  tuitions: { label: "Tuitions", emoji: "📚", color: "bg-indigo-100 text-indigo-800" },
  wellness: { label: "Stress & Wellness", emoji: "🧠", color: "bg-purple-100 text-purple-800" },
  eldercare: { label: "Elder Care", emoji: "👴", color: "bg-amber-100 text-amber-800" },
  parenting: { label: "Pregnancy & Parenting", emoji: "👶", color: "bg-rose-100 text-rose-800" },
  astrology: { label: "Astrology", emoji: "🔮", color: "bg-violet-100 text-violet-800" },
};
