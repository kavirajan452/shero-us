export type ComboCategory = "tiffin" | "snacks" | "lunch";
export type ComboFoodType = "veg" | "non-veg";

export interface ComboItem {
  id: string;
  name: string;
  emoji: string;
  subCategory: string; // e.g. "Main", "Side", "Beverage"
  portionSize: number;
  portionUnit: string; // e.g. "g", "ml", "pcs"
  price: number; // MRP per item in the combo
}

export interface ComboCategoryConfig {
  id: ComboCategory;
  label: string;
  emoji: string;
  desc: string;
  minItems: number;
  maxItems: number;
  pricePerBox: number; // fixed price per combo box
}

export interface ComboSelection {
  category: ComboCategory;
  foodType: ComboFoodType;
  selectedItems: string[]; // item IDs
}

export const comboCategoryConfigs: ComboCategoryConfig[] = [
  { id: "tiffin", label: "Tiffin", emoji: "⚪", desc: "Breakfast items", minItems: 3, maxItems: 8, pricePerBox: 149 },
  { id: "snacks", label: "Snacks", emoji: "🟤", desc: "Evening snacks", minItems: 3, maxItems: 8, pricePerBox: 99 },
  { id: "lunch", label: "Lunch", emoji: "🍚", desc: "Full lunch meal", minItems: 3, maxItems: 8, pricePerBox: 199 },
];

// Items per category × food type
export const comboMenuItems: Record<ComboCategory, Record<ComboFoodType, ComboItem[]>> = {
  tiffin: {
    veg: [
      { id: "t-v-1", name: "Idli (3 pcs)", emoji: "🫕", subCategory: "Main", portionSize: 150, portionUnit: "g", price: 30 },
      { id: "t-v-2", name: "Medu Vada (2 pcs)", emoji: "🍩", subCategory: "Main", portionSize: 120, portionUnit: "g", price: 35 },
      { id: "t-v-3", name: "Pongal", emoji: "🍲", subCategory: "Main", portionSize: 200, portionUnit: "g", price: 40 },
      { id: "t-v-4", name: "Masala Dosa", emoji: "🥞", subCategory: "Main", portionSize: 180, portionUnit: "g", price: 45 },
      { id: "t-v-5", name: "Upma", emoji: "🍛", subCategory: "Main", portionSize: 200, portionUnit: "g", price: 30 },
      { id: "t-v-6", name: "Poori (3 pcs)", emoji: "🫓", subCategory: "Main", portionSize: 150, portionUnit: "g", price: 35 },
      { id: "t-v-7", name: "Sambar", emoji: "🥘", subCategory: "Side", portionSize: 100, portionUnit: "ml", price: 15 },
      { id: "t-v-8", name: "Coconut Chutney", emoji: "🥣", subCategory: "Side", portionSize: 50, portionUnit: "g", price: 10 },
      { id: "t-v-9", name: "Tomato Chutney", emoji: "🫕", subCategory: "Side", portionSize: 50, portionUnit: "g", price: 10 },
      { id: "t-v-10", name: "Filter Coffee", emoji: "☕", subCategory: "Beverage", portionSize: 150, portionUnit: "ml", price: 20 },
      { id: "t-v-11", name: "Badam Milk", emoji: "🥛", subCategory: "Beverage", portionSize: 200, portionUnit: "ml", price: 25 },
    ],
    "non-veg": [
      { id: "t-nv-1", name: "Egg Dosa", emoji: "🥞", subCategory: "Main", portionSize: 200, portionUnit: "g", price: 50 },
      { id: "t-nv-2", name: "Egg Puffs (2 pcs)", emoji: "🥐", subCategory: "Main", portionSize: 140, portionUnit: "g", price: 40 },
      { id: "t-nv-3", name: "Chicken Keema Idli (3 pcs)", emoji: "🫕", subCategory: "Main", portionSize: 180, portionUnit: "g", price: 55 },
      { id: "t-nv-4", name: "Egg Bhurji Poori", emoji: "🫓", subCategory: "Main", portionSize: 200, portionUnit: "g", price: 45 },
      { id: "t-nv-5", name: "Omelette (2 egg)", emoji: "🍳", subCategory: "Main", portionSize: 120, portionUnit: "g", price: 30 },
      { id: "t-nv-6", name: "Sambar", emoji: "🥘", subCategory: "Side", portionSize: 100, portionUnit: "ml", price: 15 },
      { id: "t-nv-7", name: "Coconut Chutney", emoji: "🥣", subCategory: "Side", portionSize: 50, portionUnit: "g", price: 10 },
      { id: "t-nv-8", name: "Filter Coffee", emoji: "☕", subCategory: "Beverage", portionSize: 150, portionUnit: "ml", price: 20 },
      { id: "t-nv-9", name: "Tea", emoji: "🍵", subCategory: "Beverage", portionSize: 150, portionUnit: "ml", price: 15 },
    ],
  },
  snacks: {
    veg: [
      { id: "s-v-1", name: "Bajji / Pakoda", emoji: "🥘", subCategory: "Main", portionSize: 100, portionUnit: "g", price: 25 },
      { id: "s-v-2", name: "Samosa (2 pcs)", emoji: "🔺", subCategory: "Main", portionSize: 120, portionUnit: "g", price: 30 },
      { id: "s-v-3", name: "Veg Cutlet (2 pcs)", emoji: "🥙", subCategory: "Main", portionSize: 100, portionUnit: "g", price: 30 },
      { id: "s-v-4", name: "Sundal", emoji: "🫘", subCategory: "Main", portionSize: 100, portionUnit: "g", price: 20 },
      { id: "s-v-5", name: "Murukku Mix", emoji: "🌀", subCategory: "Main", portionSize: 80, portionUnit: "g", price: 25 },
      { id: "s-v-6", name: "Mysore Pak (2 pcs)", emoji: "🍮", subCategory: "Sweet", portionSize: 60, portionUnit: "g", price: 30 },
      { id: "s-v-7", name: "Jangiri (2 pcs)", emoji: "🧁", subCategory: "Sweet", portionSize: 60, portionUnit: "g", price: 30 },
      { id: "s-v-8", name: "Masala Chai", emoji: "🍵", subCategory: "Beverage", portionSize: 150, portionUnit: "ml", price: 15 },
    ],
    "non-veg": [
      { id: "s-nv-1", name: "Chicken 65 (5 pcs)", emoji: "🍗", subCategory: "Main", portionSize: 150, portionUnit: "g", price: 55 },
      { id: "s-nv-2", name: "Mutton Cutlet (2 pcs)", emoji: "🥩", subCategory: "Main", portionSize: 120, portionUnit: "g", price: 60 },
      { id: "s-nv-3", name: "Fish Fingers (4 pcs)", emoji: "🐟", subCategory: "Main", portionSize: 120, portionUnit: "g", price: 50 },
      { id: "s-nv-4", name: "Egg Bajji (3 pcs)", emoji: "🥚", subCategory: "Main", portionSize: 120, portionUnit: "g", price: 35 },
      { id: "s-nv-5", name: "Prawn Pakoda", emoji: "🦐", subCategory: "Main", portionSize: 100, portionUnit: "g", price: 65 },
      { id: "s-nv-6", name: "Mysore Pak (2 pcs)", emoji: "🍮", subCategory: "Sweet", portionSize: 60, portionUnit: "g", price: 30 },
      { id: "s-nv-7", name: "Masala Chai", emoji: "🍵", subCategory: "Beverage", portionSize: 150, portionUnit: "ml", price: 15 },
    ],
  },
  lunch: {
    veg: [
      { id: "l-v-1", name: "Sambar Rice", emoji: "🍛", subCategory: "Main", portionSize: 300, portionUnit: "g", price: 45 },
      { id: "l-v-2", name: "Curd Rice", emoji: "🍚", subCategory: "Main", portionSize: 250, portionUnit: "g", price: 35 },
      { id: "l-v-3", name: "Lemon Rice", emoji: "🍋", subCategory: "Main", portionSize: 250, portionUnit: "g", price: 35 },
      { id: "l-v-4", name: "Veg Biryani", emoji: "🍛", subCategory: "Main", portionSize: 300, portionUnit: "g", price: 55 },
      { id: "l-v-5", name: "Chapati (3 pcs)", emoji: "🫓", subCategory: "Main", portionSize: 150, portionUnit: "g", price: 30 },
      { id: "l-v-6", name: "Kootu", emoji: "🥘", subCategory: "Side", portionSize: 100, portionUnit: "g", price: 20 },
      { id: "l-v-7", name: "Poriyal", emoji: "🥗", subCategory: "Side", portionSize: 80, portionUnit: "g", price: 18 },
      { id: "l-v-8", name: "Rasam", emoji: "🫕", subCategory: "Side", portionSize: 100, portionUnit: "ml", price: 15 },
      { id: "l-v-9", name: "Appalam (2 pcs)", emoji: "⭕", subCategory: "Side", portionSize: 2, portionUnit: "pcs", price: 5 },
      { id: "l-v-10", name: "Pickle", emoji: "🫙", subCategory: "Side", portionSize: 20, portionUnit: "g", price: 5 },
      { id: "l-v-11", name: "Payasam", emoji: "🍮", subCategory: "Sweet", portionSize: 100, portionUnit: "ml", price: 25 },
      { id: "l-v-12", name: "Buttermilk", emoji: "🥛", subCategory: "Beverage", portionSize: 200, portionUnit: "ml", price: 10 },
    ],
    "non-veg": [
      { id: "l-nv-1", name: "Chicken Biryani", emoji: "🍛", subCategory: "Main", portionSize: 350, portionUnit: "g", price: 75 },
      { id: "l-nv-2", name: "Mutton Biryani", emoji: "🍖", subCategory: "Main", portionSize: 350, portionUnit: "g", price: 95 },
      { id: "l-nv-3", name: "Fish Curry Rice", emoji: "🐟", subCategory: "Main", portionSize: 300, portionUnit: "g", price: 70 },
      { id: "l-nv-4", name: "Egg Biryani", emoji: "🥚", subCategory: "Main", portionSize: 300, portionUnit: "g", price: 55 },
      { id: "l-nv-5", name: "Chicken Curry", emoji: "🍗", subCategory: "Side", portionSize: 150, portionUnit: "g", price: 45 },
      { id: "l-nv-6", name: "Mutton Kuzhambu", emoji: "🥩", subCategory: "Side", portionSize: 150, portionUnit: "g", price: 55 },
      { id: "l-nv-7", name: "Rasam", emoji: "🥘", subCategory: "Side", portionSize: 100, portionUnit: "ml", price: 15 },
      { id: "l-nv-8", name: "Appalam (2 pcs)", emoji: "⭕", subCategory: "Side", portionSize: 2, portionUnit: "pcs", price: 5 },
      { id: "l-nv-9", name: "Pickle", emoji: "🫙", subCategory: "Side", portionSize: 20, portionUnit: "g", price: 5 },
      { id: "l-nv-10", name: "Payasam", emoji: "🍮", subCategory: "Sweet", portionSize: 100, portionUnit: "ml", price: 25 },
      { id: "l-nv-11", name: "Buttermilk", emoji: "🥛", subCategory: "Beverage", portionSize: 200, portionUnit: "ml", price: 10 },
    ],
  },
};

// Helper to get items grouped by sub-category
export const getComboItemsBySubCategory = (
  category: ComboCategory,
  foodType: ComboFoodType
): Record<string, ComboItem[]> => {
  const items = comboMenuItems[category][foodType];
  const grouped: Record<string, ComboItem[]> = {};
  for (const item of items) {
    if (!grouped[item.subCategory]) grouped[item.subCategory] = [];
    grouped[item.subCategory].push(item);
  }
  return grouped;
};

export const getComboCategoryConfig = (id: ComboCategory): ComboCategoryConfig => {
  return comboCategoryConfigs.find(c => c.id === id)!;
};
