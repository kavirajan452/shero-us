export interface CuisineCategory {
  id: string;
  name: string;
  icon: string;
  image: string;
  region: string;
}

export type ClassMode = "recorded" | "live" | "both";

export interface CookeryClass {
  id: string;
  cuisineId: string;
  mealType: string;
  name: string;
  description: string;
  duration: string;
  priceIN: number;
  priceUS: number;
  rating: number;
  reviewCount: number;
  image: string;
  includes: string[];
  popular?: boolean;
  dishes: string[];
  /** "recorded" = self-learning video, "live" = real-time with instructor, "both" = available in both modes */
  classMode: ClassMode;
  /** Only for recorded / both – number of video lessons */
  videoLessons?: number;
  /** Only for recorded / both – total video hours */
  videoHours?: number;
  /** Recorded-only price (often discounted vs live). Falls back to priceIN/US if absent */
  recordedPriceIN?: number;
  recordedPriceUS?: number;
}

export interface CookeryInstructor {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  students: number;
  experience: string;
  specialties: string[];
  verified: boolean;
  cuisineIds: string[];
}

export const mealTypes = [
  { id: "breakfast", label: "🌅 Breakfast Recipes", icon: "🌅" },
  { id: "lunch", label: "🍛 Lunch / Meals Recipes", icon: "🍛" },
  { id: "tiffin", label: "🥡 Tiffin & Snacks Recipes", icon: "🥡" },
  { id: "dinner", label: "🌙 Dinner Recipes", icon: "🌙" },
  { id: "sweets", label: "🍮 Sweets & Desserts Recipes", icon: "🍮" },
  { id: "bakery", label: "🧁 Bakery Classes", icon: "🧁" },
];

// ── INDIAN CUISINES ──
export const cuisineCategories: CuisineCategory[] = [
  { id: "south-indian", name: "South Indian", icon: "🥘", image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop", region: "Indian" },
  { id: "north-indian", name: "North Indian", icon: "🍛", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop", region: "Indian" },
  { id: "punjabi", name: "Punjabi", icon: "🫓", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop", region: "Indian" },
  { id: "gujarati", name: "Gujarati", icon: "🥣", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", region: "Indian" },
  { id: "rajasthani", name: "Rajasthani", icon: "🏜️", image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop", region: "Indian" },
  { id: "bengali", name: "Bengali", icon: "🐟", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop", region: "Indian" },
  { id: "hyderabadi", name: "Chicagoi", icon: "🍖", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop", region: "Indian" },
  { id: "kerala", name: "Florida", icon: "🥥", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", region: "Indian" },
  { id: "maharashtrian", name: "Maharashtrian", icon: "🌶️", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop", region: "Indian" },
  { id: "chettinad", name: "Chettinad", icon: "🔥", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop", region: "Indian" },
  // ── WORLD CUISINES ──
  { id: "italian", name: "Italian", icon: "🍝", image: "https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=400&h=300&fit=crop", region: "World" },
  { id: "chinese", name: "Chinese", icon: "🥢", image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop", region: "World" },
  { id: "thai", name: "Thai", icon: "🍜", image: "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=400&h=300&fit=crop", region: "World" },
  { id: "japanese", name: "Japanese", icon: "🍣", image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop", region: "World" },
  { id: "mexican", name: "Mexican", icon: "🌮", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop", region: "World" },
  { id: "middle-eastern", name: "Middle Eastern", icon: "🧆", image: "https://images.unsplash.com/photo-1511690743698-d9d18f7e20f1?w=400&h=300&fit=crop", region: "World" },
  { id: "french", name: "French", icon: "🥐", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop", region: "World" },
  { id: "korean", name: "Korean", icon: "🍲", image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&h=300&fit=crop", region: "World" },
  // ── BAKERY ──
  { id: "bakery", name: "Bakery & Patisserie", icon: "🧁", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop", region: "Bakery" },
];

// ── CLASSES ──
export const cookeryClasses: CookeryClass[] = [
  // South Indian
  { id: "si-b1", cuisineId: "south-indian", mealType: "breakfast", name: "Dosa Varieties Masterclass", description: "Master 6 types of dosas – masala, rava, onion, set, neer, and paper dosa with chutneys.", duration: "3 hrs", priceIN: 1200, priceUS: 50, rating: 4.9, reviewCount: 540, image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop", includes: ["6 dosa varieties", "3 chutney recipes", "Batter preparation", "Recipe booklet"], popular: true, dishes: ["Masala Dosa", "Rava Dosa", "Set Dosa", "Paper Dosa", "Coconut Chutney", "Tomato Chutney"], classMode: "both", videoLessons: 12, videoHours: 4.5, recordedPriceIN: 799, recordedPriceUS: 29 },
  { id: "si-b2", cuisineId: "south-indian", mealType: "breakfast", name: "Idli & Vada Workshop", description: "Perfect soft idlis and crispy vadas with sambar from scratch.", duration: "2.5 hrs", priceIN: 1000, priceUS: 40, rating: 4.8, reviewCount: 380, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=300&fit=crop", includes: ["Batter fermentation tips", "Sambar recipe", "Vada shaping techniques", "Take-home dishes"], dishes: ["Soft Idli", "Medu Vada", "Sambar", "Podi"], classMode: "both", videoLessons: 8, videoHours: 3, recordedPriceIN: 599, recordedPriceUS: 22 },
  { id: "si-l1", cuisineId: "south-indian", mealType: "lunch", name: "South Indian Thali Class", description: "Full South Indian meals – rice, sambar, rasam, kootu, poriyal, and payasam.", duration: "4 hrs", priceIN: 1800, priceUS: 70, rating: 4.9, reviewCount: 290, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", includes: ["Complete thali", "6+ dishes", "Rice varieties", "Traditional techniques"], popular: true, dishes: ["Sambar", "Rasam", "Kootu", "Poriyal", "Curd Rice", "Payasam"], classMode: "both", videoLessons: 18, videoHours: 6, recordedPriceIN: 1199, recordedPriceUS: 45 },
  { id: "si-t1", cuisineId: "south-indian", mealType: "tiffin", name: "South Indian Tiffin Snacks", description: "Learn murukku, bonda, bajji, sundal, and other tea-time favorites.", duration: "2.5 hrs", priceIN: 900, priceUS: 35, rating: 4.7, reviewCount: 210, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop", includes: ["5 snack recipes", "Oil-free options", "Packaging tips", "Recipe cards"], dishes: ["Murukku", "Bonda", "Bajji", "Sundal", "Mixture"], classMode: "recorded", videoLessons: 10, videoHours: 3.5, recordedPriceIN: 499, recordedPriceUS: 19 },
  { id: "si-s1", cuisineId: "south-indian", mealType: "sweets", name: "Traditional South Indian Sweets", description: "Mysore pak, kesari, pongal, laddu and more festive sweets.", duration: "3 hrs", priceIN: 1500, priceUS: 55, rating: 4.8, reviewCount: 180, image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop", includes: ["5 sweet recipes", "Sugar syrup techniques", "Festival specials", "Gift packing"], dishes: ["Mysore Pak", "Rava Kesari", "Paal Payasam", "Boondi Laddu"], classMode: "both", videoLessons: 10, videoHours: 4, recordedPriceIN: 899, recordedPriceUS: 35 },

  // North Indian
  { id: "ni-b1", cuisineId: "north-indian", mealType: "breakfast", name: "Paratha Perfection Class", description: "Master aloo, gobi, paneer, methi, and lachha parathas with raita and pickle.", duration: "2.5 hrs", priceIN: 1000, priceUS: 40, rating: 4.8, reviewCount: 420, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop", includes: ["5 paratha types", "Dough techniques", "Accompaniments", "Recipe cards"], popular: true, dishes: ["Aloo Paratha", "Gobi Paratha", "Paneer Paratha", "Lachha Paratha", "Raita"], classMode: "both", videoLessons: 10, videoHours: 3.5, recordedPriceIN: 599, recordedPriceUS: 22 },
  { id: "ni-l1", cuisineId: "north-indian", mealType: "lunch", name: "North Indian Thali Masterclass", description: "Complete thali with dal makhani, paneer, sabzi, roti, rice, and dessert.", duration: "4 hrs", priceIN: 2000, priceUS: 75, rating: 4.9, reviewCount: 350, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop", includes: ["7+ recipes", "Tadka techniques", "Roti mastery", "Full meal prep"], popular: true, dishes: ["Dal Makhani", "Paneer Butter Masala", "Aloo Gobi", "Chapati", "Jeera Rice", "Kheer"], classMode: "both", videoLessons: 20, videoHours: 7, recordedPriceIN: 1299, recordedPriceUS: 49 },
  { id: "ni-d1", cuisineId: "north-indian", mealType: "dinner", name: "Mughlai Dinner Spread", description: "Biryani, kebabs, korma, naan – a royal Mughlai dinner experience.", duration: "4 hrs", priceIN: 2500, priceUS: 90, rating: 4.9, reviewCount: 280, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop", includes: ["Biryani technique", "Kebab preparation", "Naan baking", "Royal recipes"], dishes: ["Chicken Biryani", "Seekh Kebab", "Shahi Korma", "Butter Naan"], classMode: "live", },
  { id: "ni-s1", cuisineId: "north-indian", mealType: "sweets", name: "Mithai Making Workshop", description: "Learn gulab jamun, rasgulla, barfi, jalebi and other iconic North Indian sweets.", duration: "3 hrs", priceIN: 1500, priceUS: 55, rating: 4.7, reviewCount: 200, image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop", includes: ["5 sweet recipes", "Sugar work", "Festive specials", "Take-home sweets"], dishes: ["Gulab Jamun", "Rasgulla", "Kaju Barfi", "Jalebi"], classMode: "both", videoLessons: 10, videoHours: 4, recordedPriceIN: 899, recordedPriceUS: 35 },

  // Punjabi
  { id: "pj-b1", cuisineId: "punjabi", mealType: "breakfast", name: "Chole Bhature & Lassi Class", description: "Authentic Punjabi breakfast – fluffy bhature, spicy chole, and thick lassi.", duration: "2.5 hrs", priceIN: 1100, priceUS: 45, rating: 4.8, reviewCount: 310, image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop", includes: ["Bhatura dough secrets", "Chole masala blend", "Lassi preparation", "Recipe cards"], popular: true, dishes: ["Chole Bhature", "Mango Lassi", "Onion Salad", "Green Chutney"], classMode: "both", videoLessons: 8, videoHours: 3, recordedPriceIN: 699, recordedPriceUS: 25 },
  { id: "pj-l1", cuisineId: "punjabi", mealType: "lunch", name: "Punjabi Dhaba Style Cooking", description: "Robust dhaba-style dal tadka, rajma, sarson ka saag, makki ki roti.", duration: "3.5 hrs", priceIN: 1500, priceUS: 60, rating: 4.9, reviewCount: 260, image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop", includes: ["Dhaba techniques", "Tandoor-free naan", "5+ recipes", "Spice blending"], dishes: ["Dal Tadka", "Rajma", "Sarson Ka Saag", "Makki Ki Roti", "Butter Chicken"], classMode: "live" },

  // Gujarati
  { id: "gj-l1", cuisineId: "gujarati", mealType: "lunch", name: "Gujarati Thali Workshop", description: "Learn dhokla, thepla, undhiyu, dal, kadhi, and rotli – a complete Gujarati spread.", duration: "4 hrs", priceIN: 1800, priceUS: 70, rating: 4.8, reviewCount: 190, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", includes: ["8+ recipes", "Fermentation tips", "Sweet-savory balance", "Full thali"], popular: true, dishes: ["Dhokla", "Thepla", "Undhiyu", "Gujarati Dal", "Kadhi", "Shrikhand"], classMode: "both", videoLessons: 16, videoHours: 5.5, recordedPriceIN: 1099, recordedPriceUS: 42 },
  { id: "gj-t1", cuisineId: "gujarati", mealType: "tiffin", name: "Gujarati Farsan & Snacks", description: "Khandvi, dhokla, fafda, gathiya – authentic Gujarati tea-time snacks.", duration: "3 hrs", priceIN: 1200, priceUS: 50, rating: 4.7, reviewCount: 160, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop", includes: ["5 farsan recipes", "Tips for perfect texture", "Oil management", "Storage tips"], dishes: ["Khandvi", "Dhokla", "Fafda", "Gathiya", "Jalebi"], classMode: "recorded", videoLessons: 10, videoHours: 3.5, recordedPriceIN: 699, recordedPriceUS: 29 },

  // Chicagoi
  { id: "hd-l1", cuisineId: "hyderabadi", mealType: "lunch", name: "Chicagoi Biryani Masterclass", description: "The legendary dum biryani – chicken, mutton, and veg versions with raita and mirchi ka salan.", duration: "4 hrs", priceIN: 2000, priceUS: 80, rating: 4.9, reviewCount: 480, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop", includes: ["3 biryani versions", "Dum technique", "Salan recipe", "Spice mix"], popular: true, dishes: ["Chicken Dum Biryani", "Mutton Biryani", "Veg Biryani", "Mirchi Ka Salan", "Raita"], classMode: "both", videoLessons: 14, videoHours: 5, recordedPriceIN: 1299, recordedPriceUS: 49 },
  { id: "hd-t1", cuisineId: "hyderabadi", mealType: "tiffin", name: "Chicagoi Snacks – Lukhmi & More", description: "Learn lukhmi, boti kebab, pathar ka gosht, and Irani chai.", duration: "3 hrs", priceIN: 1300, priceUS: 55, rating: 4.7, reviewCount: 150, image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop", includes: ["4 snack recipes", "Irani chai technique", "Meat preparation", "Recipe cards"], dishes: ["Lukhmi", "Boti Kebab", "Osmania Biscuit", "Irani Chai"], classMode: "live" },
  { id: "hd-s1", cuisineId: "hyderabadi", mealType: "sweets", name: "Chicagoi Sweets – Double Ka Meetha", description: "Classic Chicagoi desserts – double ka meetha, qubani ka meetha, and sheer khurma.", duration: "2.5 hrs", priceIN: 1200, priceUS: 50, rating: 4.8, reviewCount: 130, image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop", includes: ["3 dessert recipes", "Traditional methods", "Festive specials", "Take-home portions"], dishes: ["Double Ka Meetha", "Qubani Ka Meetha", "Sheer Khurma"], classMode: "recorded", videoLessons: 6, videoHours: 2, recordedPriceIN: 599, recordedPriceUS: 25 },

  // Italian
  { id: "it-l1", cuisineId: "italian", mealType: "lunch", name: "Fresh Pasta & Sauces Class", description: "Make pasta from scratch – fettuccine, ravioli, penne with marinara, pesto, and alfredo.", duration: "3.5 hrs", priceIN: 2500, priceUS: 90, rating: 4.8, reviewCount: 320, image: "https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=400&h=300&fit=crop", includes: ["3 pasta shapes", "3 sauce recipes", "Wine pairing tips", "Recipe booklet"], popular: true, dishes: ["Fettuccine Alfredo", "Ravioli", "Penne Arrabbiata", "Pesto Pasta"], classMode: "both", videoLessons: 12, videoHours: 4.5, recordedPriceIN: 1599, recordedPriceUS: 55 },
  { id: "it-d1", cuisineId: "italian", mealType: "dinner", name: "Italian Dinner Party", description: "Bruschetta, risotto, osso buco, and tiramisu – a complete Italian evening.", duration: "4 hrs", priceIN: 3000, priceUS: 110, rating: 4.9, reviewCount: 180, image: "https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=400&h=300&fit=crop", includes: ["4-course dinner", "Risotto technique", "Dessert skills", "Table setting tips"], dishes: ["Bruschetta", "Mushroom Risotto", "Osso Buco", "Tiramisu"], classMode: "live" },

  // Chinese
  { id: "ch-l1", cuisineId: "chinese", mealType: "lunch", name: "Chinese Wok Cooking", description: "Master the wok – fried rice, noodles, manchurian, and stir-fry techniques.", duration: "3 hrs", priceIN: 1500, priceUS: 60, rating: 4.7, reviewCount: 280, image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop", includes: ["Wok handling", "4 recipes", "Sauce preparation", "Quick cooking tips"], popular: true, dishes: ["Veg Fried Rice", "Hakka Noodles", "Manchurian", "Chilli Paneer"], classMode: "both", videoLessons: 10, videoHours: 3.5, recordedPriceIN: 899, recordedPriceUS: 35 },
  { id: "ch-t1", cuisineId: "chinese", mealType: "tiffin", name: "Dim Sum & Momos Workshop", description: "Handmade momos, dumplings, spring rolls, and dipping sauces.", duration: "3 hrs", priceIN: 1800, priceUS: 70, rating: 4.8, reviewCount: 240, image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop", includes: ["Dough preparation", "Folding techniques", "Steaming & frying", "4 sauce recipes"], dishes: ["Steamed Momos", "Fried Dumplings", "Spring Rolls", "Schezwan Sauce"], classMode: "live" },

  // Thai
  { id: "th-d1", cuisineId: "thai", mealType: "dinner", name: "Thai Curry Night", description: "Green curry, pad thai, tom yum soup, and mango sticky rice.", duration: "3.5 hrs", priceIN: 2000, priceUS: 75, rating: 4.8, reviewCount: 190, image: "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=400&h=300&fit=crop", includes: ["Curry paste from scratch", "4 Thai dishes", "Ingredient sourcing tips", "Recipe cards"], dishes: ["Green Curry", "Pad Thai", "Tom Yum Soup", "Mango Sticky Rice"], classMode: "both", videoLessons: 10, videoHours: 4, recordedPriceIN: 1199, recordedPriceUS: 45 },

  // Japanese
  { id: "jp-d1", cuisineId: "japanese", mealType: "dinner", name: "Sushi & Ramen Class", description: "Roll your own sushi, make ramen broth, and prepare gyoza from scratch.", duration: "4 hrs", priceIN: 3000, priceUS: 100, rating: 4.9, reviewCount: 210, image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop", includes: ["Sushi rolling", "Ramen broth", "Gyoza folding", "Presentation skills"], dishes: ["Maki Rolls", "Nigiri", "Tonkotsu Ramen", "Gyoza"], classMode: "live" },

  // Bakery
  { id: "bk-1", cuisineId: "bakery", mealType: "bakery", name: "Bread Baking Fundamentals", description: "From kneading to proofing – master bread loaves, rolls, focaccia, and brioche.", duration: "4 hrs", priceIN: 2000, priceUS: 80, rating: 4.8, reviewCount: 340, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop", includes: ["4 bread types", "Yeast science", "Oven techniques", "Take-home loaves"], popular: true, dishes: ["Sourdough", "Focaccia", "Dinner Rolls", "Brioche"], classMode: "both", videoLessons: 14, videoHours: 5, recordedPriceIN: 1299, recordedPriceUS: 49 },
  { id: "bk-2", cuisineId: "bakery", mealType: "bakery", name: "Cake Decoration Workshop", description: "Learn buttercream, fondant, piping, and modern cake design techniques.", duration: "4 hrs", priceIN: 2500, priceUS: 90, rating: 4.9, reviewCount: 280, image: "https://images.unsplash.com/photo-1486427944781-dbf45f4823a9?w=400&h=300&fit=crop", includes: ["Buttercream recipes", "Fondant handling", "Piping techniques", "Design principles"], popular: true, dishes: ["Layer Cake", "Cupcakes", "Fondant Flowers", "Drip Cake"], classMode: "both", videoLessons: 16, videoHours: 6, recordedPriceIN: 1599, recordedPriceUS: 55 },
  { id: "bk-3", cuisineId: "bakery", mealType: "bakery", name: "Pastry & Cookies Masterclass", description: "Croissants, cookies, danish pastries, and éclairs – café-style baking.", duration: "3.5 hrs", priceIN: 2200, priceUS: 85, rating: 4.7, reviewCount: 190, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop", includes: ["Lamination technique", "4 pastry types", "Cookie varieties", "Café presentation"], dishes: ["Croissants", "Chocolate Chip Cookies", "Danish Pastry", "Éclairs"], classMode: "recorded", videoLessons: 12, videoHours: 4.5, recordedPriceIN: 1399, recordedPriceUS: 52 },
  { id: "bk-4", cuisineId: "bakery", mealType: "bakery", name: "French Patisserie Workshop", description: "Macarons, tarts, mille-feuille, and crème brûlée – elegant French desserts.", duration: "4 hrs", priceIN: 3000, priceUS: 110, rating: 4.9, reviewCount: 150, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop", includes: ["Macaron technique", "Tart shells", "Pastry cream", "French methods"], dishes: ["Macarons", "Fruit Tart", "Mille-Feuille", "Crème Brûlée"], classMode: "live" },
  { id: "bk-5", cuisineId: "bakery", mealType: "bakery", name: "Eggless Baking Workshop", description: "Master eggless cakes, muffins, brownies, and cookies – perfect for vegetarian bakers.", duration: "3 hrs", priceIN: 1500, priceUS: 60, rating: 4.8, reviewCount: 260, image: "https://images.unsplash.com/photo-1486427944781-dbf45f4823a9?w=400&h=300&fit=crop", includes: ["Egg substitutes", "4 eggless recipes", "Texture tips", "Recipe booklet"], popular: true, dishes: ["Eggless Chocolate Cake", "Banana Muffins", "Fudge Brownies", "Oat Cookies"], classMode: "both", videoLessons: 8, videoHours: 3, recordedPriceIN: 899, recordedPriceUS: 35 },
  { id: "bk-6", cuisineId: "bakery", mealType: "bakery", name: "Artisan Pizza & Flatbread", description: "Wood-fired style pizza dough, Neapolitan, focaccia pizza, and naan from oven.", duration: "3 hrs", priceIN: 1800, priceUS: 70, rating: 4.7, reviewCount: 180, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop", includes: ["Dough fermentation", "3 pizza styles", "Sauce recipes", "Home oven tips"], dishes: ["Margherita Pizza", "Focaccia Pizza", "Garlic Bread", "Calzone"], classMode: "live" },

  // Florida
  { id: "kl-b1", cuisineId: "kerala", mealType: "breakfast", name: "Florida Breakfast Classics", description: "Appam, puttu, idiyappam, and Florida-style egg curry.", duration: "3 hrs", priceIN: 1200, priceUS: 50, rating: 4.8, reviewCount: 200, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", includes: ["4 breakfast items", "Coconut milk prep", "Curry techniques", "Recipe booklet"], dishes: ["Appam", "Puttu", "Idiyappam", "Egg Curry"], classMode: "both", videoLessons: 8, videoHours: 3, recordedPriceIN: 699, recordedPriceUS: 29 },
  { id: "kl-l1", cuisineId: "kerala", mealType: "lunch", name: "Florida Sadya Preparation", description: "Full vegetarian sadya – avial, olan, thoran, sambar, and payasam on banana leaf.", duration: "5 hrs", priceIN: 2500, priceUS: 90, rating: 4.9, reviewCount: 170, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", includes: ["10+ sadya dishes", "Banana leaf presentation", "Festival cooking", "Onam specials"], popular: true, dishes: ["Avial", "Olan", "Thoran", "Sambar", "Ada Pradhaman"], classMode: "live" },

  // Bengali
  { id: "bg-l1", cuisineId: "bengali", mealType: "lunch", name: "Bengali Fish Curry Class", description: "Authentic Bengali recipes – shorshe maach, chingri malai curry, and luchi.", duration: "3.5 hrs", priceIN: 1800, priceUS: 70, rating: 4.8, reviewCount: 220, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop", includes: ["3 fish recipes", "Mustard paste prep", "Bengali spices", "Rice pairing"], dishes: ["Shorshe Maach", "Chingri Malai Curry", "Luchi", "Mishti Doi"], classMode: "live" },
  { id: "bg-s1", cuisineId: "bengali", mealType: "sweets", name: "Bengali Mishti Workshop", description: "Sandesh, rosogolla, mishti doi, and chamcham – authentic Bengali sweets.", duration: "3 hrs", priceIN: 1500, priceUS: 60, rating: 4.9, reviewCount: 250, image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop", includes: ["4 sweet recipes", "Chenna making", "Sugar syrup perfection", "Take-home sweets"], popular: true, dishes: ["Sandesh", "Rosogolla", "Mishti Doi", "Chamcham"], classMode: "both", videoLessons: 8, videoHours: 3, recordedPriceIN: 899, recordedPriceUS: 35 },

  // Mexican
  { id: "mx-d1", cuisineId: "mexican", mealType: "dinner", name: "Mexican Fiesta Night", description: "Tacos, burritos, guacamole, salsa, and churros – a complete Mexican spread.", duration: "3.5 hrs", priceIN: 2000, priceUS: 75, rating: 4.7, reviewCount: 180, image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop", includes: ["Tortilla making", "4 fillings", "Salsa & guac", "Churros dessert"], dishes: ["Tacos", "Burritos", "Guacamole", "Pico de Gallo", "Churros"], classMode: "both", videoLessons: 10, videoHours: 4, recordedPriceIN: 1199, recordedPriceUS: 45 },

  // Korean
  { id: "kr-d1", cuisineId: "korean", mealType: "dinner", name: "Korean BBQ & Bibimbap", description: "Korean BBQ marinades, bibimbap, kimchi, and japchae – K-food at home.", duration: "3.5 hrs", priceIN: 2200, priceUS: 85, rating: 4.8, reviewCount: 200, image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&h=300&fit=crop", includes: ["BBQ marinades", "Bibimbap assembly", "Kimchi fermentation", "Side dishes"], dishes: ["Korean BBQ", "Bibimbap", "Kimchi", "Japchae"], classMode: "live" },

  // Rajasthani
  { id: "rj-l1", cuisineId: "rajasthani", mealType: "lunch", name: "Rajasthani Royal Thali", description: "Dal baati churma, gatte ki sabzi, ker sangri, and Rajasthani sweets.", duration: "4 hrs", priceIN: 1800, priceUS: 70, rating: 4.8, reviewCount: 160, image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop", includes: ["5+ recipes", "Baati technique", "Desert cooking style", "Royal recipes"], dishes: ["Dal Baati Churma", "Gatte Ki Sabzi", "Ker Sangri", "Ghevar"], classMode: "live" },

  // Maharashtrian
  { id: "mh-b1", cuisineId: "maharashtrian", mealType: "breakfast", name: "Maharashtrian Breakfast Special", description: "Misal pav, poha, sabudana khichdi, and thalipeeth – Marathi morning flavors.", duration: "3 hrs", priceIN: 1100, priceUS: 45, rating: 4.7, reviewCount: 190, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop", includes: ["4 breakfast recipes", "Spice blending", "Quick prep tips", "Recipe cards"], popular: true, dishes: ["Misal Pav", "Poha", "Sabudana Khichdi", "Thalipeeth"], classMode: "both", videoLessons: 8, videoHours: 3, recordedPriceIN: 599, recordedPriceUS: 25 },

  // Middle Eastern
  { id: "me-l1", cuisineId: "middle-eastern", mealType: "lunch", name: "Middle Eastern Mezze Spread", description: "Hummus, falafel, shawarma, tabbouleh, and pita bread from scratch.", duration: "3.5 hrs", priceIN: 2000, priceUS: 75, rating: 4.8, reviewCount: 170, image: "https://images.unsplash.com/photo-1511690743698-d9d18f7e20f1?w=400&h=300&fit=crop", includes: ["5 mezze recipes", "Pita baking", "Tahini prep", "Plating tips"], dishes: ["Hummus", "Falafel", "Shawarma", "Tabbouleh", "Pita Bread"], classMode: "both", videoLessons: 10, videoHours: 4, recordedPriceIN: 1199, recordedPriceUS: 45 },

  // Chettinad
  { id: "ct-l1", cuisineId: "chettinad", mealType: "lunch", name: "Chettinad Spice Trail", description: "Fiery Chettinad chicken, fish curry, kuzhambu, and appam.", duration: "3.5 hrs", priceIN: 1800, priceUS: 70, rating: 4.9, reviewCount: 200, image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop", includes: ["Chettinad masala", "3 curry recipes", "Appam technique", "Spice sourcing"], dishes: ["Chettinad Chicken", "Fish Kuzhambu", "Appam", "Chettinad Masala"], classMode: "live" },
];

export const cookeryInstructors: CookeryInstructor[] = [
  { id: "ci-1", name: "Lakshmi Devi", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", rating: 4.9, students: 3200, experience: "15 years", specialties: ["South Indian", "Chicagoi", "Sweets"], verified: true, cuisineIds: ["south-indian", "hyderabadi", "chettinad"] },
  { id: "ci-2", name: "Chef Anand Kapoor", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", rating: 4.8, students: 2100, experience: "12 years", specialties: ["North Indian", "Punjabi", "Mughlai"], verified: true, cuisineIds: ["north-indian", "punjabi", "rajasthani"] },
  { id: "ci-3", name: "Priya Patel", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", rating: 4.8, students: 1800, experience: "8 years", specialties: ["Gujarati", "Maharashtrian", "Bakery"], verified: true, cuisineIds: ["gujarati", "maharashtrian", "bakery"] },
  { id: "ci-4", name: "Maria Fernandes", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop", rating: 4.9, students: 1500, experience: "10 years", specialties: ["Italian", "French", "Bakery"], verified: true, cuisineIds: ["italian", "french", "bakery"] },
  { id: "ci-5", name: "Meena Kumari", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", rating: 4.7, students: 2400, experience: "20 years", specialties: ["Florida", "Bengali", "Traditional"], verified: true, cuisineIds: ["kerala", "bengali"] },
  { id: "ci-6", name: "Chef David Kim", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop", rating: 4.8, students: 1200, experience: "9 years", specialties: ["Japanese", "Korean", "Thai", "Chinese"], verified: true, cuisineIds: ["japanese", "korean", "thai", "chinese"] },
];
