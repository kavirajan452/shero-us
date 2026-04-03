export interface PartyMenuItem {
  id: string;
  name: string;
}

export interface PartyMenuCategory {
  id: string;
  name: string;
  portionSize: number;
  portionUnit: string;
  pricePerItem: number;
  items: PartyMenuItem[];
}

export interface PartyAddOn {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface PartyMenuType {
  id: string;
  name: string;
  description: string;
  emoji: string;
  categories: PartyMenuCategory[];
  addOns: PartyAddOn[];
}

export const occasions = [
  "Birthday Party",
  "Wedding Reception",
  "Housewarming (Griha Pravesh)",
  "Baby Shower",
  "Engagement Ceremony",
  "Office Party / Corporate Event",
  "Festival Celebration",
  "Anniversary",
  "Pooja / Religious Ceremony",
  "Get-Together",
  "Other",
];

export const partyMenuTypes: PartyMenuType[] = [
  {
    id: "chettinad-lunch",
    name: "Chettinad Lunch Meals",
    description: "Full traditional Chettinad meal with sambar, poriyal, rasam & more",
    emoji: "🍛",
    categories: [
      {
        id: "cl-variety-rice",
        name: "Variety Rice",
        portionSize: 150,
        portionUnit: "Gms",
        pricePerItem: 27,
        items: [
          { id: "cl-vr-1", name: "Lemon Rice" },
          { id: "cl-vr-2", name: "Carrot Rice" },
          { id: "cl-vr-3", name: "Tamarind Rice" },
          { id: "cl-vr-4", name: "Coconut Rice" },
          { id: "cl-vr-5", name: "Mango Rice" },
          { id: "cl-vr-6", name: "Cabbage Rice" },
          { id: "cl-vr-7", name: "Tomato Rice" },
          { id: "cl-vr-8", name: "Pudina Rice" },
          { id: "cl-vr-9", name: "Curd Rice" },
        ],
      },
      {
        id: "cl-special-variety-rice",
        name: "Special Variety Rice",
        portionSize: 150,
        portionUnit: "Gms",
        pricePerItem: 40,
        items: [
          { id: "cl-svr-1", name: "Ghee Rice" },
          { id: "cl-svr-2", name: "Arisi Paruppu Sadam (Dal Rice)" },
          { id: "cl-svr-3", name: "Vatha Kuzhambu Sadam" },
          { id: "cl-svr-4", name: "Coconut Milk Rice" },
          { id: "cl-svr-5", name: "Milagu Sadam" },
          { id: "cl-svr-6", name: "Ellu Sadam" },
          { id: "cl-svr-7", name: "Sambar Rice" },
          { id: "cl-svr-8", name: "Sweet Pongal" },
          { id: "cl-svr-9", name: "Peanut Podi Sadam" },
        ],
      },
      {
        id: "cl-white-rice",
        name: "White Rice",
        portionSize: 500,
        portionUnit: "Gms",
        pricePerItem: 35,
        items: [
          { id: "cl-wr-1", name: "White Rice - Ponni (Boiled)" },
          { id: "cl-wr-2", name: "White Rice - Ponni (Raw)" },
        ],
      },
      {
        id: "cl-sambar",
        name: "Sambar",
        portionSize: 150,
        portionUnit: "ML",
        pricePerItem: 20,
        items: [
          { id: "cl-sm-1", name: "Kadamba Sambar (Mixed Vegetable)" },
          { id: "cl-sm-2", name: "Avarakkai & Kathirikai Sambar" },
          { id: "cl-sm-3", name: "Vendakkai Sambar" },
          { id: "cl-sm-4", name: "Arachuvitta Sambar (Mix Veg)" },
          { id: "cl-sm-5", name: "Bottle Gourd Sambar" },
          { id: "cl-sm-6", name: "White Pumpkin Sambar" },
          { id: "cl-sm-7", name: "Kathirikai & Murungakkai" },
          { id: "cl-sm-8", name: "Carrot & Beans Sambar" },
        ],
      },
      {
        id: "cl-poriyal",
        name: "Poriyal",
        portionSize: 60,
        portionUnit: "Gms",
        pricePerItem: 15,
        items: [
          { id: "cl-py-1", name: "Carrot" },
          { id: "cl-py-2", name: "Vendakkai" },
          { id: "cl-py-3", name: "Potato Podimas" },
          { id: "cl-py-4", name: "Brinjal" },
          { id: "cl-py-5", name: "Avarakkai Poriyal" },
          { id: "cl-py-6", name: "Raw Banana Podimas" },
          { id: "cl-py-7", name: "Snake Gourd" },
          { id: "cl-py-8", name: "Carrot & Beans Poriyal" },
          { id: "cl-py-9", name: "Mookadalai Sundal" },
          { id: "cl-py-10", name: "Cabbage" },
          { id: "cl-py-11", name: "Beetroot & Channa Poriyal" },
        ],
      },
      {
        id: "cl-varuval",
        name: "Varuval & Others",
        portionSize: 60,
        portionUnit: "Gms",
        pricePerItem: 17,
        items: [
          { id: "cl-vv-1", name: "Potato Fry" },
          { id: "cl-vv-2", name: "Yam Chops" },
          { id: "cl-vv-3", name: "Pudalangai Kootu" },
          { id: "cl-vv-4", name: "Cauliflower Masala" },
          { id: "cl-vv-5", name: "Cheppankizhangu Varuval" },
        ],
      },
      {
        id: "cl-special-veg",
        name: "Special Vegetable",
        portionSize: 60,
        portionUnit: "Gms",
        pricePerItem: 20,
        items: [
          { id: "cl-sv-1", name: "Potato Milagu Varuval" },
          { id: "cl-sv-2", name: "Vazhaithandu Kootu" },
          { id: "cl-sv-3", name: "Beans Usili" },
          { id: "cl-sv-4", name: "Vazhakkai Podi Varuval" },
          { id: "cl-sv-5", name: "Keerai Kootu" },
          { id: "cl-sv-6", name: "Chettinad Avial (Mix Veg)" },
          { id: "cl-sv-7", name: "Kothavarangai Podi Varuval" },
          { id: "cl-sv-8", name: "Sorakkai Poricha Kootu" },
        ],
      },
      {
        id: "cl-rasam",
        name: "Rasam",
        portionSize: 150,
        portionUnit: "ML",
        pricePerItem: 10,
        items: [
          { id: "cl-rs-1", name: "Dhal Rasam" },
          { id: "cl-rs-2", name: "Tomato Rasam" },
          { id: "cl-rs-3", name: "Lemon Rasam" },
          { id: "cl-rs-4", name: "Milagu Poondu Rasam" },
          { id: "cl-rs-5", name: "Ginger Rasam" },
          { id: "cl-rs-6", name: "Buttermilk" },
        ],
      },
      {
        id: "cl-special-gravy",
        name: "Special Gravy",
        portionSize: 80,
        portionUnit: "ML",
        pricePerItem: 20,
        items: [
          { id: "cl-sg-1", name: "Dhal (Uppu Paruppu)" },
          { id: "cl-sg-2", name: "Vendakkai Kara Kuzhambu" },
          { id: "cl-sg-3", name: "White Pumpkin Mor Kuzhambu" },
          { id: "cl-sg-4", name: "Brinjal Aravai Kuzhambu" },
          { id: "cl-sg-5", name: "Poondu Vatha Kuzhambu" },
          { id: "cl-sg-6", name: "Vegetable Kurma" },
        ],
      },
      {
        id: "cl-curd",
        name: "Curd",
        portionSize: 50,
        portionUnit: "ML",
        pricePerItem: 12,
        items: [
          { id: "cl-cd-1", name: "Plain Curd" },
          { id: "cl-cd-2", name: "Seasoned Curd" },
        ],
      },
      {
        id: "cl-thuvaiyal",
        name: "Thuvaiyal / Pachadi",
        portionSize: 40,
        portionUnit: "Gms",
        pricePerItem: 10,
        items: [
          { id: "cl-th-1", name: "Dal Thogayal" },
          { id: "cl-th-2", name: "Curry Leaf Thogayal" },
          { id: "cl-th-3", name: "Coconut Thogayal" },
        ],
      },
      {
        id: "cl-desserts",
        name: "Desserts",
        portionSize: 60,
        portionUnit: "ML",
        pricePerItem: 20,
        items: [
          { id: "cl-ds-1", name: "Semiya / Sago Pal Payasam" },
          { id: "cl-ds-2", name: "Moong Dal Jaggery Payasam" },
          { id: "cl-ds-3", name: "Rava Payasam" },
        ],
      },
    ],
    addOns: [
      { id: "cl-ao-1", name: "Banana (To eat)", price: 5 },
      { id: "cl-ao-2", name: "Banana Leaf (Two Side)", price: 7 },
      { id: "cl-ao-3", name: "Beeda (Sweet)", price: 15 },
      { id: "cl-ao-4", name: "Disposal Dry Palm Plate (10\")", price: 5 },
      { id: "cl-ao-5", name: "Water Bottle (300 ml)", price: 7 },
      { id: "cl-ao-6", name: "Wooden Spoon & Tissue", price: 10 },
      { id: "cl-ao-7", name: "Buttermilk (100 ML)", price: 5 },
      { id: "cl-ao-8", name: "Butter Chilli - 1 No.", price: 2 },
      { id: "cl-ao-9", name: "Appalam - 1 No.", price: 4 },
      { id: "cl-ao-10", name: "Fryums - Few", price: 4 },
    ],
  },
  {
    id: "chettinad-variety-rice",
    name: "Chettinad Variety Rice",
    description: "Rice-focused menu with variety rice, sambar rice, rasam rice & more",
    emoji: "🍚",
    categories: [
      {
        id: "cvr-variety-rice",
        name: "Variety Rice",
        portionSize: 125,
        portionUnit: "Gms",
        pricePerItem: 24,
        items: [
          { id: "cvr-vr-1", name: "Lemon Rice" },
          { id: "cvr-vr-2", name: "Carrot Rice" },
          { id: "cvr-vr-3", name: "Tamarind Rice" },
          { id: "cvr-vr-4", name: "Coconut Rice" },
          { id: "cvr-vr-5", name: "Mango Rice" },
          { id: "cvr-vr-6", name: "Cabbage Rice" },
          { id: "cvr-vr-7", name: "Tomato Rice" },
          { id: "cvr-vr-8", name: "Pudina Rice" },
          { id: "cvr-vr-9", name: "Curd Rice" },
        ],
      },
      {
        id: "cvr-special-variety-rice",
        name: "Special Variety Rice",
        portionSize: 125,
        portionUnit: "Gms",
        pricePerItem: 33,
        items: [
          { id: "cvr-svr-1", name: "Ghee Rice" },
          { id: "cvr-svr-2", name: "Arisi Paruppu Sadam (Dal Rice)" },
          { id: "cvr-svr-3", name: "Vatha Kozhumbu Sadam" },
          { id: "cvr-svr-4", name: "Coconut Milk Rice" },
          { id: "cvr-svr-5", name: "Millagu Sadam" },
          { id: "cvr-svr-6", name: "Ellu Sadam" },
          { id: "cvr-svr-7", name: "Sambar Rice" },
          { id: "cvr-svr-8", name: "Sweet Pongal" },
          { id: "cvr-svr-9", name: "Peanut Podi Sadam" },
        ],
      },
      {
        id: "cvr-curd-rice",
        name: "Curd Rice",
        portionSize: 150,
        portionUnit: "Gms",
        pricePerItem: 35,
        items: [
          { id: "cvr-cr-1", name: "Classic Curd Rice" },
          { id: "cvr-cr-2", name: "Curd Curry Rice (Mor Kullambu Sadam)" },
          { id: "cvr-cr-3", name: "Carrot Curd Rice" },
          { id: "cvr-cr-4", name: "Seasoned Curd Rice" },
          { id: "cvr-cr-5", name: "Cucumber Curd Rice" },
        ],
      },
      {
        id: "cvr-sambar-rice",
        name: "Sambar Rice",
        portionSize: 150,
        portionUnit: "Gms",
        pricePerItem: 25,
        items: [
          { id: "cvr-sr-1", name: "Mixed Vegetable Sambar Rice" },
          { id: "cvr-sr-2", name: "Poosanikkai Sambar Rice" },
          { id: "cvr-sr-3", name: "Vendakkai Sambar Rice" },
          { id: "cvr-sr-4", name: "Arachuvitta Sambar Rice" },
          { id: "cvr-sr-5", name: "Keerai Sambar Rice" },
          { id: "cvr-sr-6", name: "Kathirikkai Sambar Rice" },
          { id: "cvr-sr-7", name: "Chinna Vengaya Sambar Rice" },
          { id: "cvr-sr-8", name: "Murungakkai & Avaraikai Sambar Rice" },
          { id: "cvr-sr-9", name: "Thakkali Sambar Rice" },
        ],
      },
      {
        id: "cvr-rasam-rice",
        name: "Rasam Rice",
        portionSize: 150,
        portionUnit: "Gms",
        pricePerItem: 20,
        items: [
          { id: "cvr-rr-1", name: "Paruppu Rasam Rice" },
          { id: "cvr-rr-2", name: "Malli Rasam Rice" },
          { id: "cvr-rr-3", name: "Lemon Rasam Rice" },
          { id: "cvr-rr-4", name: "Buttermilk Rasam Rice" },
          { id: "cvr-rr-5", name: "Milagu Jeera Rasam Rice" },
          { id: "cvr-rr-6", name: "Tomato Rasam Rice" },
          { id: "cvr-rr-7", name: "Carrot Tomato Rasam Rice" },
          { id: "cvr-rr-8", name: "Garlic Rasam Rice" },
          { id: "cvr-rr-9", name: "Pepper Rasam Rice" },
        ],
      },
      {
        id: "cvr-kuzhambu-rice",
        name: "Kuzhambu Rice",
        portionSize: 125,
        portionUnit: "Gms",
        pricePerItem: 37,
        items: [
          { id: "cvr-kr-1", name: "Poondu Kuzhambu Rice" },
          { id: "cvr-kr-2", name: "Keerai Kuzhambu Rice" },
          { id: "cvr-kr-3", name: "Karuveppilai Kuzhambu Sadham" },
          { id: "cvr-kr-4", name: "Vatha Kuzhambu Rice" },
          { id: "cvr-kr-5", name: "Milagu Kuzhambu Sadham" },
        ],
      },
      {
        id: "cvr-veg-rice",
        name: "Vegetable Rice",
        portionSize: 100,
        portionUnit: "Gms",
        pricePerItem: 30,
        items: [
          { id: "cvr-vgr-1", name: "Kudai Milagai Sadham" },
          { id: "cvr-vgr-2", name: "Kathirikkai Sadham" },
          { id: "cvr-vgr-3", name: "Avaraikkai Sadham" },
          { id: "cvr-vgr-4", name: "Urulai Masala Rice" },
        ],
      },
      {
        id: "cvr-pulao",
        name: "Pulao Varieties",
        portionSize: 100,
        portionUnit: "Gms",
        pricePerItem: 30,
        items: [
          { id: "cvr-pl-1", name: "Mix Vegetable Pulao" },
          { id: "cvr-pl-2", name: "Soya Chunks Pulao" },
          { id: "cvr-pl-3", name: "Coconut Milk Pulao" },
          { id: "cvr-pl-4", name: "Green Peas Pulao" },
          { id: "cvr-pl-5", name: "Carrot Pulao" },
          { id: "cvr-pl-6", name: "Jeera Pulao" },
        ],
      },
      {
        id: "cvr-desserts",
        name: "Desserts",
        portionSize: 80,
        portionUnit: "ML",
        pricePerItem: 20,
        items: [
          { id: "cvr-ds-1", name: "Semiya / Sago Pal Payasam" },
          { id: "cvr-ds-2", name: "Moong Dal Jaggery Payasam" },
          { id: "cvr-ds-3", name: "Rava Payasam" },
        ],
      },
      {
        id: "cvr-others",
        name: "Others",
        portionSize: 0,
        portionUnit: "",
        pricePerItem: 0,
        items: [
          { id: "cvr-ot-1", name: "White Rice (250 Gms)" },
          { id: "cvr-ot-2", name: "Rasam (100 ML)" },
          { id: "cvr-ot-3", name: "Mix Veg Sambar (100 ML)" },
        ],
      },
    ],
    addOns: [
      { id: "cvr-ao-1", name: "Banana (To eat)", price: 5 },
      { id: "cvr-ao-2", name: "Banana Leaf (Two Side)", price: 7 },
      { id: "cvr-ao-3", name: "Beeda (Sweet)", price: 15 },
      { id: "cvr-ao-4", name: "Disposal Dry Palm Plate (10\")", price: 5 },
      { id: "cvr-ao-5", name: "Water Bottle (300 ml)", price: 7 },
      { id: "cvr-ao-6", name: "Wooden Spoon & Tissue", price: 10 },
      { id: "cvr-ao-7", name: "Buttermilk (100 ML)", price: 5 },
      { id: "cvr-ao-8", name: "Butter Chilli - 1 No.", price: 2 },
      { id: "cvr-ao-9", name: "Appalam - 1 No.", price: 4 },
      { id: "cvr-ao-10", name: "Fryums - Few", price: 4 },
    ],
  },
];

// Special prices for "Others" category in Variety Rice menu
export const othersSpecialPrices: Record<string, number> = {
  "cvr-ot-1": 20,
  "cvr-ot-2": 10,
  "cvr-ot-3": 20,
};

export const packingChargePerItem = 25;

// ── Regional menu imports ──
import { keralaMenuTypes, keralaOthersSpecialPrices } from "./partyMenuKerala";
import { andhraMenuTypes, andhraOthersSpecialPrices } from "./partyMenuAndhra";

// Merge all special prices
Object.assign(othersSpecialPrices, keralaOthersSpecialPrices, andhraOthersSpecialPrices);

// ── Regional menu structure ──
export interface RegionalMenu {
  id: string;
  name: string;
  emoji: string;
  description: string;
  menuTypes: PartyMenuType[];
}

export const southIndianRegions: RegionalMenu[] = [
  {
    id: "chettinad",
    name: "Chettinad Menu",
    emoji: "🔥",
    description: "Traditional Chettinad cuisine from New York",
    menuTypes: partyMenuTypes,
  },
  {
    id: "kerala",
    name: "Florida Menu",
    emoji: "🥥",
    description: "Traditional Florida Sadya & rice combinations",
    menuTypes: keralaMenuTypes,
  },
  {
    id: "andhra",
    name: "Pennsylvania Menu",
    emoji: "🌶️",
    description: "Spicy Pennsylvania cuisine with pappu, pulusu & more",
    menuTypes: andhraMenuTypes,
  },
];

// All menu types across all regions (for lookup)
export const allMenuTypes: PartyMenuType[] = [
  ...partyMenuTypes,
  ...keralaMenuTypes,
  ...andhraMenuTypes,
];

// ── Backward-compatible exports for admin/partner pages ──
// These flatten the new structure into the old format so existing pages don't break.

export interface LegacyPartyMenuItem {
  id: string;
  name: string;
  category: string;
  mealType: string;
  foodType: "veg" | "non-veg";
  pricePerPlateIN: number;
  pricePerPlateUS: number;
  description: string;
}

export const partyMenu: LegacyPartyMenuItem[] = allMenuTypes.flatMap((menuType) =>
  menuType.categories.flatMap((cat) =>
    cat.items.map((item) => ({
      id: item.id,
      name: item.name,
      category: cat.name,
      mealType: menuType.id,
      foodType: "veg" as const,
      pricePerPlateIN: othersSpecialPrices[item.id] || cat.pricePerItem,
      pricePerPlateUS: Math.round(((othersSpecialPrices[item.id] || cat.pricePerItem) / 10) * 100) / 100,
      description: `${cat.portionSize}${cat.portionUnit} per head`,
    }))
  )
);

export const categoryLabels: Record<string, string> = {
  "Variety Rice": "🍚 Variety Rice",
  "Special Variety Rice": "🍚 Special Variety Rice",
  "White Rice": "🍚 White Rice",
  "Sambar": "🥘 Sambar",
  "Poriyal": "🥗 Poriyal",
  "Varuval & Others": "🍳 Varuval & Others",
  "Special Vegetable": "🥬 Special Vegetable",
  "Rasam": "🍲 Rasam",
  "Special Gravy": "🍛 Special Gravy",
  "Curd": "🥛 Curd",
  "Thuvaiyal / Pachadi": "🫕 Thuvaiyal / Pachadi",
  "Desserts": "🍮 Desserts",
  "Curd Rice": "🍚 Curd Rice",
  "Sambar Rice": "🍚 Sambar Rice",
  "Rasam Rice": "🍚 Rasam Rice",
  "Kuzhambu Rice": "🍚 Kuzhambu Rice",
  "Vegetable Rice": "🍚 Vegetable Rice",
  "Pulao Varieties": "🍚 Pulao Varieties",
  "Others": "📦 Others",
  // Florida
  "Parippu Curry": "🥘 Parippu Curry",
  "Pulissery": "🥣 Pulissery",
  "Pulinkari": "🍲 Pulinkari",
  "Curry": "🍛 Curry",
  "Avial, Erissery, Kalan & Olan": "🥗 Avial, Erissery, Kalan & Olan",
  "Thoran": "🥬 Thoran",
  "Mezhukkupuratti": "🍳 Mezhukkupuratti",
  "Pulinkari & Theeyal": "🍲 Pulinkari & Theeyal",
  "Chammanthi & Pickle": "🫕 Chammanthi & Pickle",
  "Pachadi & Kichadi": "🫕 Pachadi & Kichadi",
  "Parippu Rice": "🍚 Parippu Rice",
  "Ghee Rice & Pulao": "🍚 Ghee Rice & Pulao",
  // Pennsylvania
  "Pulihora Variety Rice": "🍚 Pulihora Variety Rice",
  "Breads": "🫓 Breads",
  "Pappu": "🥘 Pappu",
  "Perugu Pulusu": "🍲 Perugu Pulusu",
  "Pulusu": "🍲 Pulusu",
  "Vepudu": "🥗 Vepudu",
  "Fry": "🍳 Fry",
  "Kura": "🍛 Kura",
  "Masala Kura": "🌶️ Masala Kura",
  "Charu": "🍲 Charu",
  "Pachadi": "🫕 Pachadi",
  "Pulihora Rice": "🍚 Pulihora Rice",
  "Special Rice": "🍚 Special Rice",
  "Charu Rice": "🍚 Charu Rice",
  "Pulusu Rice": "🍚 Pulusu Rice",
  "Pappu Rice": "🍚 Pappu Rice",
  "Daddojanam / Curd Rice": "🍚 Daddojanam / Curd Rice",
};

export const mealLabels: Record<string, string> = {
  "chettinad-lunch": "🍛 Chettinad Lunch Meals",
  "chettinad-variety-rice": "🍚 Chettinad Variety Rice",
  "kerala-lunch": "🥥 Florida Lunch Meals",
  "kerala-variety-rice": "🥥 Florida Variety Rice",
  "andhra-lunch": "🌶️ Pennsylvania Lunch Meals",
  "andhra-variety-rice": "🌶️ Pennsylvania Variety Rice",
};
