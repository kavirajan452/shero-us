export interface SnackProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  isBestseller: boolean;
  isNewLaunch: boolean;
  badges: string[];
  packSizes: PackSize[];
  ingredients: string;
  shelfLife: string;
  madeIn: string;
  weightInfo: string;
  /** Regional origin tag like "Tamil Nadu Special", "Kerala Special" */
  regionTag?: string;
}

export interface PackSize {
  label: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
}

export const snackCategories = [
  { id: "all", label: "All", emoji: "🛒", image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop" },
  { id: "snacks", label: "Snacks", emoji: "🍘", image: "https://images.unsplash.com/photo-1606491048802-8342506d6471?w=400&h=400&fit=crop" },
  { id: "sweets", label: "Sweets", emoji: "🍮", image: "https://images.unsplash.com/photo-1589249178061-4ecde4189ef5?w=400&h=400&fit=crop" },
  { id: "papads", label: "Papads & Fryums", emoji: "🫓", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=400&fit=crop" },
  { id: "pickles", label: "Pickles", emoji: "🥒", image: "https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&h=400&fit=crop" },
  { id: "mixes", label: "Ready Mixes", emoji: "🥣", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=400&fit=crop" },
  { id: "coffee", label: "Coffee & Drinks", emoji: "☕", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=400&h=400&fit=crop" },
  { id: "daily", label: "Daily Essentials", emoji: "🧂", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop" },
  { id: "gifting", label: "Gift Hampers", emoji: "🎁", image: "https://images.unsplash.com/photo-1549488344-cbb6c34cf1ab?w=400&h=400&fit=crop" },
];

export const snackProducts: SnackProduct[] = [
  {
    id: "s1", name: "Spl Madras Mixture", description: "Crunchy, aromatic South Indian mixture made with besan, rice flakes, peanuts, curry leaves and spices. A tea-time classic loved across generations.", image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500&h=500&fit=crop",
    category: "snacks", rating: 4.81, reviewCount: 1053, isBestseller: true, isNewLaunch: false,
    badges: ["No Palm Oil", "No Preservatives", "No Maida"],
    regionTag: "Chennai Special",
    packSizes: [
      { label: "200 g", price: 179, originalPrice: 186, discountPercent: 4 },
      { label: "2 x 200 g", price: 329, originalPrice: 372, discountPercent: 12 },
      { label: "500 g (Super Saver)", price: 399, originalPrice: 499, discountPercent: 20 },
    ],
    ingredients: "Besan, Rice Flakes, Peanuts, Cashews, Curry Leaves, Green Chillies, Coconut Oil, Salt, Turmeric, Asafoetida",
    shelfLife: "45 days", madeIn: "Chennai, Tamil Nadu", weightInfo: "Net weight as per variant selected",
  },
  {
    id: "s2", name: "Kerala Banana Chips", description: "Super crispy banana chips fried in 100% pure coconut oil. Authentic Kerala-style Nenthiram chips with the perfect salt balance.", image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&h=500&fit=crop",
    category: "snacks", rating: 4.83, reviewCount: 924, isBestseller: true, isNewLaunch: false,
    badges: ["100% Coconut Oil", "No Palm Oil", "No Preservatives"],
    regionTag: "Kerala Special",
    packSizes: [
      { label: "200 g", price: 186 },
      { label: "2 x 200 g", price: 349, originalPrice: 372, discountPercent: 6 },
      { label: "3 x 200 g", price: 469, originalPrice: 558, discountPercent: 16 },
    ],
    ingredients: "Raw Banana (Nenthiram), Coconut Oil, Salt", shelfLife: "60 days", madeIn: "Kerala", weightInfo: "Net weight as per variant",
  },
  {
    id: "s3", name: "Murukku (Chakli)", description: "Traditional South Indian spiral snack made from rice flour and urad dal. Perfectly spiced and super crunchy.", image: "https://images.unsplash.com/photo-1606491048802-8342506d6471?w=500&h=500&fit=crop",
    category: "snacks", rating: 4.75, reviewCount: 786, isBestseller: true, isNewLaunch: false,
    badges: ["No Palm Oil", "No Preservatives", "Handmade"],
    regionTag: "Tamil Nadu Special",
    packSizes: [
      { label: "200 g", price: 169, originalPrice: 189, discountPercent: 11 },
      { label: "2 x 200 g", price: 319, originalPrice: 378, discountPercent: 16 },
    ],
    ingredients: "Rice Flour, Urad Dal Flour, Butter, Cumin Seeds, Sesame Seeds, Salt, Asafoetida", shelfLife: "45 days", madeIn: "Chennai, Tamil Nadu", weightInfo: "Net weight as per variant",
  },
  {
    id: "s4", name: "Mysore Pak", description: "Melt-in-your-mouth Mysore Pak made with generous amounts of ghee, besan, and sugar. Authentic Karnataka recipe.", image: "https://images.unsplash.com/photo-1589249178061-4ecde4189ef5?w=500&h=500&fit=crop",
    category: "sweets", rating: 4.88, reviewCount: 432, isBestseller: true, isNewLaunch: false,
    badges: ["Pure Ghee", "No Preservatives", "Fresh Daily"],
    regionTag: "Mysore Special",
    packSizes: [
      { label: "250 g", price: 299, originalPrice: 349, discountPercent: 14 },
      { label: "500 g", price: 549, originalPrice: 699, discountPercent: 21 },
    ],
    ingredients: "Besan, Ghee, Sugar, Cardamom", shelfLife: "15 days", madeIn: "Mysore, Karnataka", weightInfo: "Net weight as per variant",
  },
  {
    id: "s5", name: "Dates Laddu", description: "Healthy and delicious laddus made with dates, dry fruits, and nuts. No white sugar added — naturally sweetened.", image: "https://images.unsplash.com/photo-1548127039-8c3e147e4260?w=500&h=500&fit=crop",
    category: "sweets", rating: 4.79, reviewCount: 358, isBestseller: false, isNewLaunch: true,
    badges: ["No White Sugar", "No Preservatives", "Dry Fruit Rich"],
    regionTag: "Homemade",
    packSizes: [
      { label: "200 g (8 pcs)", price: 249 },
      { label: "400 g (16 pcs)", price: 449, originalPrice: 498, discountPercent: 10 },
    ],
    ingredients: "Dates, Almonds, Cashews, Pistachios, Coconut, Ghee, Cardamom", shelfLife: "20 days", madeIn: "Chennai, Tamil Nadu", weightInfo: "Approx 8 pieces per 200g",
  },
  {
    id: "s6", name: "Appalam (Papad) Combo", description: "Crispy, thin South Indian appalams made from urad dal. Perfect accompaniment with rice and sambar.", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&h=500&fit=crop",
    category: "papads", rating: 4.72, reviewCount: 215, isBestseller: false, isNewLaunch: false,
    badges: ["Ready to Fry", "Traditional Recipe"],
    regionTag: "Madurai Special",
    packSizes: [
      { label: "100 g", price: 89 },
      { label: "3 x 100 g", price: 239, originalPrice: 267, discountPercent: 10 },
    ],
    ingredients: "Urad Dal, Salt, Pepper, Cumin, Asafoetida", shelfLife: "180 days", madeIn: "Madurai, Tamil Nadu", weightInfo: "Approx 20-25 pieces per 100g",
  },
  {
    id: "s7", name: "Mango Avakaya Pickle", description: "Fiery Andhra-style raw mango pickle with mustard, red chilli, and fenugreek. Homemade taste, no chemicals.", image: "https://images.unsplash.com/photo-1590502593747-42a996133562?w=500&h=500&fit=crop",
    category: "pickles", rating: 4.85, reviewCount: 523, isBestseller: true, isNewLaunch: false,
    badges: ["Homemade", "No Preservatives", "Andhra Style"],
    regionTag: "Andhra Special",
    packSizes: [
      { label: "250 g", price: 199 },
      { label: "500 g", price: 349, originalPrice: 398, discountPercent: 12 },
    ],
    ingredients: "Raw Mango, Mustard Powder, Red Chilli Powder, Fenugreek, Salt, Sesame Oil", shelfLife: "90 days", madeIn: "Guntur, Andhra Pradesh", weightInfo: "Glass jar packing",
  },
  {
    id: "s8", name: "Tomato Rice Mix Paste", description: "Perfectly curated South Indian tomato rice mix paste. Just add rice! Authentic taste of Amma's kitchen.", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&h=500&fit=crop",
    category: "mixes", rating: 4.77, reviewCount: 645, isBestseller: true, isNewLaunch: false,
    badges: ["Ready to Mix", "No Preservatives"],
    regionTag: "South Indian",
    packSizes: [
      { label: "100 g (Serves 2)", price: 99 },
      { label: "3 x 100 g", price: 269, originalPrice: 297, discountPercent: 9 },
    ],
    ingredients: "Tomatoes, Onions, Peanuts, Curry Leaves, Mustard Seeds, Turmeric, Chilli Powder, Oil, Salt", shelfLife: "30 days", madeIn: "Chennai, Tamil Nadu", weightInfo: "Each pack serves 2 people",
  },
  {
    id: "s9", name: "Premium Filter Coffee Decoction", description: "Bold, dark roast 80:20 filter coffee decoction. Just add hot milk — ready in seconds! Authentic South Indian kaapi.", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=500&h=500&fit=crop",
    category: "coffee", rating: 4.81, reviewCount: 52, isBestseller: false, isNewLaunch: true,
    badges: ["Instant Kaapi", "80:20 Coffee", "Ready in Secs"],
    regionTag: "Chikmagalur Special",
    packSizes: [
      { label: "75 ml", price: 99, originalPrice: 125, discountPercent: 21 },
      { label: "2 x 75 ml (Weekly Pack)", price: 199, originalPrice: 250, discountPercent: 20 },
      { label: "15 ml (Sampler)", price: 25 },
    ],
    ingredients: "Premium South Indian Coffee Beans (80%), Chicory (20%)", shelfLife: "180 days", madeIn: "Chikmagalur, Karnataka", weightInfo: "Liquid decoction",
  },
  {
    id: "s10", name: "Ghee Mysore Pak Gift Box", description: "Beautifully packed premium Mysore Pak gift box — perfect for festivals, weddings, and celebrations.", image: "https://images.unsplash.com/photo-1549488344-cbb6c34cf1ab?w=500&h=500&fit=crop",
    category: "gifting", rating: 4.9, reviewCount: 178, isBestseller: false, isNewLaunch: false,
    badges: ["Gift Ready", "Premium Pack", "Pure Ghee"],
    regionTag: "Karnataka Special",
    packSizes: [
      { label: "500 g Gift Box", price: 699, originalPrice: 849, discountPercent: 18 },
      { label: "1 kg Premium Box", price: 1249, originalPrice: 1499, discountPercent: 17 },
    ],
    ingredients: "Besan, Ghee, Sugar, Cardamom, Saffron", shelfLife: "15 days", madeIn: "Mysore, Karnataka", weightInfo: "Gift box with ribbon",
  },
  {
    id: "s11", name: "Kara Sev", description: "Thin, crispy besan sev with a spicy kick. A South Indian namkeen classic, perfect for munching anytime.", image: "https://images.unsplash.com/photo-1530006786793-af9e600fdca8?w=500&h=500&fit=crop",
    category: "snacks", rating: 4.68, reviewCount: 394, isBestseller: false, isNewLaunch: false,
    badges: ["No Palm Oil", "Super Crunchy"],
    regionTag: "Chennai Special",
    packSizes: [
      { label: "200 g", price: 149 },
      { label: "2 x 200 g", price: 279, originalPrice: 298, discountPercent: 6 },
    ],
    ingredients: "Besan, Rice Flour, Coconut Oil, Red Chilli Powder, Salt, Asafoetida", shelfLife: "45 days", madeIn: "Chennai, Tamil Nadu", weightInfo: "Net weight as per variant",
  },
  {
    id: "s12", name: "Podi Combo (3 Varieties)", description: "Essential South Indian podis — Idli Podi, Curry Leaves Podi, and Paruppu Podi. Daily kitchen essentials.", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&h=500&fit=crop",
    category: "daily", rating: 4.86, reviewCount: 312, isBestseller: true, isNewLaunch: false,
    badges: ["Combo Pack", "No Preservatives", "Stone Ground"],
    regionTag: "South Indian",
    packSizes: [
      { label: "3 x 100 g Combo", price: 349, originalPrice: 420, discountPercent: 17 },
    ],
    ingredients: "Various lentils, dried red chillies, sesame seeds, curry leaves, asafoetida, coconut oil, salt", shelfLife: "60 days", madeIn: "Chennai, Tamil Nadu", weightInfo: "3 jars of 100g each",
  },
];
