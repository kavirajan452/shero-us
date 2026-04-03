// Master Menu Data — state-wise pricing for branded (SHF) cuisines

export interface StatePricing {
  state: string;
  stateCode: string;
  price: number;    // MRP — customer-facing price
  ppp: number;      // Partner Purchase Price — base (0-6 months kitchen)
  ppp6to12: number; // PPP for 6-12 month old kitchens
  ppp12plus: number;// PPP for 12+ month old kitchens
}

export interface MasterMenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  isVeg: boolean;
  image: string;
  volume: string; // e.g. "450 ml", "250 g"
  majorVegetables: string[]; // key vegetables used — if partner turns off any, item is hidden
  brand: string; // brand label e.g. "SHF", "SHF Premium"
  videoUrl: string; // YouTube or video link for the menu item
  packingChargeFlat: number; // flat packing fee in ₹
  packingChargePct: number; // packing charge as % of MRP
  statePrices: StatePricing[];
}

export interface BrandedCuisineMaster {
  cuisine: string;
  emoji: string;
  kitchens: number;
  states: string[]; // states this cuisine operates in
  menuItems: MasterMenuItem[];
}

const TN = { state: "Tamil Nadu", stateCode: "TN" };
const AP = { state: "Andhra Pradesh", stateCode: "AP" };
const TS = { state: "Telangana", stateCode: "TS" };
const KA = { state: "Karnataka", stateCode: "KA" };
const KL = { state: "Kerala", stateCode: "KL" };
const MH = { state: "Maharashtra", stateCode: "MH" };
const GJ = { state: "Gujarat", stateCode: "GJ" };
const RJ = { state: "Rajasthan", stateCode: "RJ" };
const DL = { state: "Delhi NCR", stateCode: "DL" };
const PB = { state: "Punjab", stateCode: "PB" };

const allStates = [TN, AP, TS, KA, KL, MH, GJ, RJ, DL, PB];

function pricify(base: number, multipliers: Record<string, number>): StatePricing[] {
  const pppBase = 0.65;      // 0-6 months: 65%
  const ppp6to12 = 0.60;     // 6-12 months: 60%
  const ppp12plus = 0.55;    // 12+ months: 55%
  return allStates.map((s) => {
    const mrp = Math.round(base * (multipliers[s.stateCode] ?? 1));
    return {
      ...s,
      price: mrp,
      ppp: Math.round(mrp * pppBase),
      ppp6to12: Math.round(mrp * ppp6to12),
      ppp12plus: Math.round(mrp * ppp12plus),
    };
  });
}

// Helper to add default new fields to menu item definitions
type RawMenuItem = Omit<MasterMenuItem, "brand" | "videoUrl" | "packingChargeFlat" | "packingChargePct">;

// Sample demo video URLs for training/recipe demos
const demoVideos: Record<string, string> = {
  cm1: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  cm2: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  cm5: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  cm9: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  cm11: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  km1: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  km3: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  am1: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  nm1: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  nm3: "https://www.youtube.com/embed/dQw4w9WgXcQ",
};

function mi(raw: RawMenuItem, brand = "SHF", packFlat = 5, packPct = 3): MasterMenuItem {
  return { ...raw, brand, videoUrl: demoVideos[raw.id] || "", packingChargeFlat: packFlat, packingChargePct: packPct };
}

// Multipliers by state (TN = base 1.0)
const chettinadMul: Record<string, number> = { TN: 1, AP: 1.20, TS: 1.20, KA: 1.15, KL: 1.18, MH: 1.25, GJ: 1.30, RJ: 1.28, DL: 1.35, PB: 1.30 };
const keralaMul: Record<string, number> = { TN: 1.10, AP: 1.15, TS: 1.15, KA: 1.08, KL: 1, MH: 1.20, GJ: 1.25, RJ: 1.25, DL: 1.30, PB: 1.28 };
const andhraMul: Record<string, number> = { TN: 1.10, AP: 1, TS: 1.02, KA: 1.12, KL: 1.15, MH: 1.20, GJ: 1.25, RJ: 1.25, DL: 1.30, PB: 1.28 };
const northIndianMul: Record<string, number> = { TN: 1.15, AP: 1.12, TS: 1.12, KA: 1.10, KL: 1.18, MH: 1.05, GJ: 1.08, RJ: 1, DL: 1, PB: 1 };

export const brandedCuisineMasters: BrandedCuisineMaster[] = [
  {
    cuisine: "Chettinad",
    emoji: "🍛",
    kitchens: 24,
    states: ["TN", "AP", "TS", "KA", "KL", "MH", "DL"],
    menuItems: [
      mi({ id: "cm1", name: "Chinna Vengayam Sambar", description: "Sambar full of little tiny, juicy, tamarind soaked purple shallots", category: "Paruppu Sambar", isVeg: true, volume: "450 ml", image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719484899_667d41e369b8a.jpg", majorVegetables: ["Shallots", "Dal/Lentils", "Tamarind"], statePrices: pricify(167, chettinadMul) }),
      mi({ id: "cm2", name: "Murungaikai Sambar", description: "Popular all-time favorite sambar with drumstick vegetable", category: "Paruppu Sambar", isVeg: true, volume: "450 ml", image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/items/1719484962_667d4222a2c20.jpg", majorVegetables: ["Drumstick", "Dal/Lentils", "Tamarind"], statePrices: pricify(167, chettinadMul) }),
      mi({ id: "cm3", name: "Kathirikai Murungakai Sambar", description: "Lentils with brinjal, drumstick, tamarind, herbs & special sambar powder", category: "Paruppu Sambar", isVeg: true, volume: "450 ml", image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719485249_667d43416ca2c.jpg", majorVegetables: ["Brinjal", "Drumstick", "Dal/Lentils", "Tamarind"], statePrices: pricify(174, chettinadMul) }),
      mi({ id: "cm4", name: "Carrot Beans Sambar", description: "Lentils with carrot, beans, tamarind, herbs & special sambar powder", category: "Paruppu Sambar", isVeg: true, volume: "450 ml", image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719827105_66827aa1bd8f2.jpg", majorVegetables: ["Carrot", "Beans", "Dal/Lentils", "Tamarind"], statePrices: pricify(174, chettinadMul) }),
      mi({ id: "cm5", name: "Vendaikai Kara Kuzhambu", description: "Spicy, tangy South Indian okra curry with tamarind, coconut & aromatic spices", category: "Kara Kuzhambu", isVeg: true, volume: "450 ml", image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719486129_667d46b1608b3.jpg", majorVegetables: ["Okra", "Tamarind", "Coconut"], statePrices: pricify(224, chettinadMul) }),
      mi({ id: "cm6", name: "Urulai Kara Kuzhambu", description: "Potato curry in spicy, tangy tamarind base with coconut & aromatic spices", category: "Kara Kuzhambu", isVeg: true, volume: "450 ml", image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719486172_667d46dc0b434.jpg", majorVegetables: ["Potato", "Tamarind", "Coconut"], statePrices: pricify(224, chettinadMul) }),
      mi({ id: "cm7", name: "Vendaikai Moor Kuzhambu", description: "Healthy buttermilk curry with lady's finger", category: "Moor Kuzhambu", isVeg: true, volume: "450 ml", image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719486472_667d4808dc725.jpg", majorVegetables: ["Okra", "Curd/Buttermilk", "Coconut"], statePrices: pricify(210, chettinadMul) }),
      mi({ id: "cm8", name: "Chinna Vengayam Moor Kuzhambu", description: "Buttermilk curry with shallots, coconut & aromatic spices", category: "Moor Kuzhambu", isVeg: true, volume: "450 ml", image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719486573_667d486dbdb4b.jpg", majorVegetables: ["Shallots", "Curd/Buttermilk", "Coconut"], statePrices: pricify(214, chettinadMul) }),
      mi({ id: "cm9", name: "Milagu Rasam", description: "Spicy rasam with black pepper, tomatoes & other spices", category: "Rasam", isVeg: true, volume: "450 ml", image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719486726_667d4906272e6.jpg", majorVegetables: ["Pepper", "Tomato", "Tamarind"], statePrices: pricify(127, chettinadMul) }),
      mi({ id: "cm10", name: "Poondu Rasam", description: "Spicy, tangy rasam with tamarind, tomato & lots of garlic", category: "Rasam", isVeg: true, volume: "450 ml", image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719486887_667d49a7cbcd2.jpg", majorVegetables: ["Garlic", "Tomato", "Tamarind"], statePrices: pricify(124, chettinadMul) }),
      mi({ id: "cm11", name: "Carrot Beans Poriyal", description: "Colorful stir fry of boiled carrot & beans with grated coconut", category: "Poriyal", isVeg: true, volume: "250 g", image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719487022_667d4a2e13758.jpg", majorVegetables: ["Carrot", "Beans", "Coconut"], statePrices: pricify(196, chettinadMul) }),
      mi({ id: "cm12", name: "Vendaikai Poriyal", description: "Tempered & sautéed lady's finger with South Indian spices", category: "Poriyal", isVeg: true, volume: "250 g", image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719487269_667d4b252c3d7.jpg", majorVegetables: ["Okra", "Coconut"], statePrices: pricify(187, chettinadMul) }),
      mi({ id: "cm13", name: "Keerai Poriyal", description: "Healthy stir-fry with nutrient-rich greens, spices & grated coconut", category: "Poriyal", isVeg: true, volume: "250 g", image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719490914_667d59628bbe2.jpg", majorVegetables: ["Spinach/Keerai", "Coconut"], statePrices: pricify(196, chettinadMul) }),
      mi({ id: "cm14", name: "Urulai Kara Varuval", description: "Potato varuval with South Indian spices", category: "Varuval & Piratal", isVeg: true, volume: "250 g", image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1719828860_6682817cde325.jpg", majorVegetables: ["Potato", "Pepper"], statePrices: pricify(205, chettinadMul) }),
      mi({ id: "cm15", name: "Vazhaikkai Podimas", description: "Boiled raw banana sautéed with onions, green chilies & mild spices", category: "Podimas", isVeg: true, volume: "250 g", image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1728298102_6703bc763ffff.png", majorVegetables: ["Raw Banana", "Onion"], statePrices: pricify(193, chettinadMul) }),
      mi({ id: "cm16", name: "Urulai Podimas", description: "Boiled potatoes sautéed with onion & green chillies", category: "Podimas", isVeg: true, volume: "250 g", image: "https://sherohomeerp-shero.s3.ap-south-1.amazonaws.com/catalog/items/1728298127_6703bc8fb5075.png", majorVegetables: ["Potato", "Onion"], statePrices: pricify(193, chettinadMul) }),
    ],
  },
  {
    cuisine: "Kerala",
    emoji: "🥥",
    kitchens: 18,
    states: ["KL", "TN", "KA", "MH"],
    menuItems: [
      mi({ id: "kl1", name: "Avial", description: "Mixed vegetables in coconut & yogurt gravy", category: "Curry", isVeg: true, volume: "450 ml", image: "", majorVegetables: ["Drumstick", "Carrot", "Beans", "Coconut", "Curd/Buttermilk"], statePrices: pricify(195, keralaMul) }),
      mi({ id: "kl2", name: "Sambar (Kerala Style)", description: "Kerala-style lentil curry with vegetables & coconut", category: "Curry", isVeg: true, volume: "450 ml", image: "", majorVegetables: ["Drumstick", "Dal/Lentils", "Tamarind", "Coconut"], statePrices: pricify(175, keralaMul) }),
      mi({ id: "kl3", name: "Thoran", description: "Dry stir-fried vegetables with coconut", category: "Poriyal", isVeg: true, volume: "250 g", image: "", majorVegetables: ["Cabbage", "Coconut"], statePrices: pricify(165, keralaMul) }),
      mi({ id: "kl4", name: "Olan", description: "Ash gourd & cowpeas cooked in coconut milk", category: "Curry", isVeg: true, volume: "450 ml", image: "", majorVegetables: ["Coconut"], statePrices: pricify(185, keralaMul) }),
      mi({ id: "kl5", name: "Rasam (Kerala Style)", description: "Peppery thin soup with tomato & tamarind", category: "Rasam", isVeg: true, volume: "450 ml", image: "", majorVegetables: ["Pepper", "Tomato", "Tamarind"], statePrices: pricify(120, keralaMul) }),
    ],
  },
  {
    cuisine: "Andhra",
    emoji: "🌶️",
    kitchens: 31,
    states: ["AP", "TS", "TN", "KA", "MH", "DL"],
    menuItems: [
      mi({ id: "an1", name: "Gutti Vankaya Kura", description: "Stuffed brinjal curry with peanut & sesame", category: "Curry", isVeg: true, volume: "450 ml", image: "", majorVegetables: ["Brinjal", "Onion", "Tamarind"], statePrices: pricify(220, andhraMul) }),
      mi({ id: "an2", name: "Pappu (Dal)", description: "Andhra-style toor dal with tomato tempering", category: "Dal", isVeg: true, volume: "450 ml", image: "", majorVegetables: ["Dal/Lentils", "Tomato"], statePrices: pricify(155, andhraMul) }),
      mi({ id: "an3", name: "Gongura Pachadi", description: "Tangy sorrel leaves chutney with red chili", category: "Pachadi", isVeg: true, volume: "200 g", image: "", majorVegetables: ["Onion", "Garlic"], statePrices: pricify(145, andhraMul) }),
      mi({ id: "an4", name: "Bendakaya Vepudu", description: "Crispy okra fry with Andhra spices", category: "Fry", isVeg: true, volume: "250 g", image: "", majorVegetables: ["Okra", "Onion"], statePrices: pricify(190, andhraMul) }),
      mi({ id: "an5", name: "Pesarattu", description: "Green moong dal crepe, Andhra specialty", category: "Breakfast", isVeg: true, volume: "2 pcs", image: "", majorVegetables: ["Dal/Lentils", "Onion"], statePrices: pricify(130, andhraMul) }),
    ],
  },
  {
    cuisine: "North Indian",
    emoji: "🫓",
    kitchens: 42,
    states: ["DL", "PB", "RJ", "MH", "GJ", "KA", "TN", "AP", "TS"],
    menuItems: [
      mi({ id: "ni1", name: "Dal Makhani", description: "Creamy black lentils simmered overnight", category: "Dal", isVeg: true, volume: "450 ml", image: "", majorVegetables: ["Dal/Lentils", "Tomato"], statePrices: pricify(199, northIndianMul) }),
      mi({ id: "ni2", name: "Paneer Butter Masala", description: "Rich tomato-cashew gravy with paneer cubes", category: "Curry", isVeg: true, volume: "450 ml", image: "", majorVegetables: ["Tomato", "Onion"], statePrices: pricify(229, northIndianMul) }),
      mi({ id: "ni3", name: "Chole", description: "Spiced chickpea curry, Punjabi style", category: "Curry", isVeg: true, volume: "450 ml", image: "", majorVegetables: ["Chickpeas", "Tomato", "Onion"], statePrices: pricify(179, northIndianMul) }),
      mi({ id: "ni4", name: "Aloo Gobi", description: "Dry potato & cauliflower with cumin & turmeric", category: "Sabzi", isVeg: true, volume: "250 g", image: "", majorVegetables: ["Potato", "Cauliflower", "Tomato"], statePrices: pricify(165, northIndianMul) }),
      mi({ id: "ni5", name: "Rajma", description: "Red kidney beans in tomato gravy", category: "Curry", isVeg: true, volume: "450 ml", image: "", majorVegetables: ["Tomato", "Onion"], statePrices: pricify(185, northIndianMul) }),
    ],
  },
  {
    cuisine: "Punjabi",
    emoji: "🫓",
    kitchens: 28,
    states: ["PB", "DL", "RJ", "MH", "GJ"],
    menuItems: [
      mi({ id: "pj1", name: "Sarson Ka Saag", description: "Mustard greens cooked with spices & ghee", category: "Sabzi", isVeg: true, volume: "350 g", image: "", majorVegetables: ["Spinach/Keerai", "Garlic"], statePrices: pricify(210, northIndianMul) }),
      mi({ id: "pj2", name: "Makki Di Roti", description: "Cornflour flatbread, Punjabi staple", category: "Bread", isVeg: true, volume: "2 pcs", image: "", majorVegetables: [], statePrices: pricify(80, northIndianMul) }),
      mi({ id: "pj3", name: "Amritsari Chole", description: "Dark spiced chickpeas, Amritsar style", category: "Curry", isVeg: true, volume: "450 ml", image: "", majorVegetables: ["Chickpeas", "Tomato", "Onion"], statePrices: pricify(189, northIndianMul) }),
    ],
  },
  {
    cuisine: "Gujarati",
    emoji: "🥗",
    kitchens: 15,
    states: ["GJ", "MH", "RJ", "DL"],
    menuItems: [
      mi({ id: "gj1", name: "Undhiyu", description: "Mixed vegetable casserole, Surat specialty", category: "Curry", isVeg: true, volume: "450 ml", image: "", majorVegetables: ["Potato", "Brinjal", "Beans", "Raw Banana"], statePrices: pricify(230, northIndianMul) }),
      mi({ id: "gj2", name: "Dal Dhokli", description: "Wheat dumplings cooked in turmeric dal", category: "Dal", isVeg: true, volume: "450 ml", image: "", majorVegetables: ["Dal/Lentils", "Tomato"], statePrices: pricify(175, northIndianMul) }),
      mi({ id: "gj3", name: "Kadhi", description: "Yogurt-based curry with gram flour dumplings", category: "Curry", isVeg: true, volume: "450 ml", image: "", majorVegetables: ["Curd/Buttermilk", "Onion"], statePrices: pricify(155, northIndianMul) }),
    ],
  },
  {
    cuisine: "Rajasthani",
    emoji: "🏜️",
    kitchens: 8,
    states: ["RJ", "DL", "GJ"],
    menuItems: [
      mi({ id: "rj1", name: "Dal Baati", description: "Baked wheat balls with five-lentil dal", category: "Dal", isVeg: true, volume: "2 pcs + 300 ml", image: "", majorVegetables: ["Dal/Lentils"], statePrices: pricify(199, northIndianMul) }),
      mi({ id: "rj2", name: "Gatte Ki Sabzi", description: "Gram flour dumplings in spiced yogurt gravy", category: "Curry", isVeg: true, volume: "450 ml", image: "", majorVegetables: ["Curd/Buttermilk", "Chickpeas"], statePrices: pricify(185, northIndianMul) }),
    ],
  },
  {
    cuisine: "Udupi",
    emoji: "🥘",
    kitchens: 12,
    states: ["KA", "TN", "KL", "MH"],
    menuItems: [
      mi({ id: "ud1", name: "Bisi Bele Bath", description: "Spiced rice with lentils & vegetables, Karnataka style", category: "Rice", isVeg: true, volume: "350 g", image: "", majorVegetables: ["Dal/Lentils", "Carrot", "Beans", "Tamarind"], statePrices: pricify(175, keralaMul) }),
      mi({ id: "ud2", name: "Saaru (Rasam)", description: "Karnataka-style pepper & tomato rasam", category: "Rasam", isVeg: true, volume: "450 ml", image: "", majorVegetables: ["Pepper", "Tomato", "Tamarind"], statePrices: pricify(115, keralaMul) }),
      mi({ id: "ud3", name: "Kosambari", description: "Moong dal salad with cucumber & coconut", category: "Salad", isVeg: true, volume: "200 g", image: "", majorVegetables: ["Dal/Lentils", "Coconut"], statePrices: pricify(120, keralaMul) }),
    ],
  },
  {
    cuisine: "Marathi",
    emoji: "🌶️",
    kitchens: 10,
    states: ["MH", "KA", "GJ"],
    menuItems: [
      mi({ id: "mr1", name: "Puran Poli", description: "Sweet lentil-stuffed flatbread", category: "Bread", isVeg: true, volume: "2 pcs", image: "", majorVegetables: ["Dal/Lentils"], statePrices: pricify(140, northIndianMul) }),
      mi({ id: "mr2", name: "Bharli Vangi", description: "Stuffed baby brinjals with peanut-coconut masala", category: "Curry", isVeg: true, volume: "350 g", image: "", majorVegetables: ["Brinjal", "Coconut", "Onion"], statePrices: pricify(195, northIndianMul) }),
      mi({ id: "mr3", name: "Amti Dal", description: "Maharashtrian spiced & tangy toor dal", category: "Dal", isVeg: true, volume: "450 ml", image: "", majorVegetables: ["Dal/Lentils", "Tamarind", "Coconut"], statePrices: pricify(160, northIndianMul) }),
    ],
  },
  {
    cuisine: "Mughlai",
    emoji: "🍗",
    kitchens: 19,
    states: ["DL", "PB", "MH", "TS", "AP", "KA"],
    menuItems: [
      mi({ id: "mg1", name: "Shahi Paneer", description: "Paneer in rich cashew-cream gravy", category: "Curry", isVeg: true, volume: "450 ml", image: "", majorVegetables: ["Tomato", "Onion"], statePrices: pricify(245, northIndianMul) }),
      mi({ id: "mg2", name: "Navratan Korma", description: "Mixed vegetables & fruits in mild cream sauce", category: "Curry", isVeg: true, volume: "450 ml", image: "", majorVegetables: ["Carrot", "Beans", "Potato", "Cauliflower"], statePrices: pricify(235, northIndianMul) }),
      mi({ id: "mg3", name: "Dal Mughlai", description: "Lentils with cream, butter & aromatic spices", category: "Dal", isVeg: true, volume: "450 ml", image: "", majorVegetables: ["Dal/Lentils", "Tomato"], statePrices: pricify(199, northIndianMul) }),
    ],
  },
];
