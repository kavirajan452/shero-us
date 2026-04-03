export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  image: string;
  serviceCount: number;
}

export interface ServiceItem {
  id: string;
  categoryId: string;
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
}

export interface ServiceProvider {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  jobs: number;
  experience: string;
  skills: string[];
  verified: boolean;
  categoryIds: string[];
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: "cook-on-demand",
    name: "Cook on Demand",
    icon: "👨‍🍳",
    description: "Professional home cooks for your daily meals or special occasions",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=300&fit=crop",
    serviceCount: 8,
  },
  {
    id: "catering",
    name: "Catering Services",
    icon: "🍽️",
    description: "Full-service catering for events, weddings, and corporate functions",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=300&fit=crop",
    serviceCount: 6,
  },
  {
    id: "kitchen-deep-clean",
    name: "Kitchen Deep Cleaning",
    icon: "✨",
    description: "Professional deep cleaning for your kitchen space",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
    serviceCount: 4,
  },
  {
    id: "tiffin-service",
    name: "Tiffin / Dabba Service",
    icon: "🥡",
    description: "Daily home-cooked tiffin delivery to your office or home",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
    serviceCount: 5,
  },
  {
    id: "cooking-classes",
    name: "Cooking Classes",
    icon: "📚",
    description: "Learn authentic recipes from experienced home chefs",
    image: "https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=400&h=300&fit=crop",
    serviceCount: 6,
  },
  {
    id: "kitchen-setup",
    name: "Kitchen Setup & Consultation",
    icon: "🏠",
    description: "Expert advice on kitchen organization, equipment, and setup",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    serviceCount: 4,
  },
];

export const serviceItems: ServiceItem[] = [
  // Cook on Demand
  { id: "cod-1", categoryId: "cook-on-demand", name: "Daily Cook – Breakfast & Lunch", description: "A trained home cook visits daily to prepare fresh breakfast and lunch for your family. Menu customized to your preferences.", duration: "3-4 hrs/day", priceIN: 500, priceUS: 25, rating: 4.8, reviewCount: 1240, image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=300&fit=crop", includes: ["Customized daily menu", "Grocery list planning", "Kitchen cleanup after cooking", "Up to 4 dishes per session"], popular: true },
  { id: "cod-2", categoryId: "cook-on-demand", name: "Daily Cook – All 3 Meals", description: "Full-day cook for breakfast, lunch, and dinner. Ideal for families or working professionals.", duration: "6-7 hrs/day", priceIN: 900, priceUS: 45, rating: 4.7, reviewCount: 860, image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop", includes: ["3 meals per day", "Snacks & tea preparation", "Full kitchen cleanup", "Up to 8 dishes per day"], popular: true },
  { id: "cod-3", categoryId: "cook-on-demand", name: "Weekend Special Cook", description: "Chef for weekend special meals – elaborate spreads for family gatherings.", duration: "4-5 hrs", priceIN: 1200, priceUS: 55, rating: 4.9, reviewCount: 430, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop", includes: ["Premium multi-course meal", "Up to 10 dishes", "Table setup assistance", "Kitchen cleanup included"] },
  { id: "cod-4", categoryId: "cook-on-demand", name: "Party Chef – On Site", description: "Professional chef comes to your home to cook for your party or gathering.", duration: "5-8 hrs", priceIN: 2500, priceUS: 120, rating: 4.8, reviewCount: 310, image: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=400&h=300&fit=crop", includes: ["Custom party menu", "Up to 15 dishes", "Serving assistance", "Full cleanup"], popular: true },
  { id: "cod-5", categoryId: "cook-on-demand", name: "Diet / Health Cook", description: "Specialized cook for dietary needs – keto, diabetic-friendly, low-carb, vegan.", duration: "3-4 hrs/day", priceIN: 700, priceUS: 35, rating: 4.6, reviewCount: 220, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", includes: ["Nutritionist-approved menu", "Calorie-tracked meals", "Specialized ingredients", "Weekly meal plan"] },
  { id: "cod-6", categoryId: "cook-on-demand", name: "Live Counters – Chaat & Street Food", description: "Live food counter setup at your home for parties – pani puri, dosa, chaat.", duration: "3-4 hrs", priceIN: 3000, priceUS: 150, rating: 4.9, reviewCount: 180, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop", includes: ["Live cooking station", "All ingredients included", "Serving staff", "Setup & cleanup"] },
  { id: "cod-7", categoryId: "cook-on-demand", name: "Baking & Desserts Chef", description: "Specialized baker for cakes, pastries, and Indian sweets at your home.", duration: "4-5 hrs", priceIN: 1500, priceUS: 70, rating: 4.7, reviewCount: 290, image: "https://images.unsplash.com/photo-1486427944781-dbf45f4823a9?w=400&h=300&fit=crop", includes: ["Custom cake/dessert menu", "All ingredients provided", "Decorating included", "Packaging for leftovers"] },
  { id: "cod-8", categoryId: "cook-on-demand", name: "Trial Cook Session", description: "One-time trial session to evaluate a cook before committing to a monthly plan.", duration: "2-3 hrs", priceIN: 350, priceUS: 18, rating: 4.5, reviewCount: 560, image: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&h=300&fit=crop", includes: ["2-3 dishes", "Assess cooking style", "No commitment", "Free rescheduling"] },

  // Catering
  { id: "cat-1", categoryId: "catering", name: "Small Gathering Catering (10-30)", description: "Complete catering for intimate gatherings – birthday parties, kitty parties, poojas.", duration: "Full event", priceIN: 8000, priceUS: 400, rating: 4.8, reviewCount: 340, image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=300&fit=crop", includes: ["Menu planning", "Cooking & serving", "Crockery & cutlery", "Cleanup after event"], popular: true },
  { id: "cat-2", categoryId: "catering", name: "Medium Event Catering (30-100)", description: "Full-service catering for medium-sized events with diverse menu options.", duration: "Full event", priceIN: 25000, priceUS: 1200, rating: 4.7, reviewCount: 210, image: "https://images.unsplash.com/photo-1530062845289-9109b2c9c868?w=400&h=300&fit=crop", includes: ["Multi-cuisine menu", "Professional serving staff", "Buffet setup", "Complete cleanup"] },
  { id: "cat-3", categoryId: "catering", name: "Corporate Lunch Catering", description: "Office lunch catering for team meetings, client visits, and corporate events.", duration: "2-3 hrs", priceIN: 350, priceUS: 18, rating: 4.6, reviewCount: 180, image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400&h=300&fit=crop", includes: ["Per-person pricing", "Box or buffet option", "Dietary accommodation", "On-time delivery guarantee"], popular: true },
  { id: "cat-4", categoryId: "catering", name: "Wedding Catering", description: "Grand wedding catering with elaborate menus, live counters, and premium service.", duration: "Full day", priceIN: 80000, priceUS: 4000, rating: 4.9, reviewCount: 95, image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=300&fit=crop", includes: ["Custom multi-course menu", "Live cooking counters", "Decorated buffet setup", "Full event staff"] },
  { id: "cat-5", categoryId: "catering", name: "Festival Special Catering", description: "Special festival menus – Diwali, Holi, Eid, Christmas, Pongal celebrations.", duration: "Half/Full day", priceIN: 12000, priceUS: 600, rating: 4.8, reviewCount: 150, image: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop", includes: ["Festival-themed menu", "Traditional recipes", "Festive decoration assist", "Prasad preparation"] },
  { id: "cat-6", categoryId: "catering", name: "BBQ & Outdoor Catering", description: "Outdoor BBQ setup for garden parties, terrace events, and farmhouse gatherings.", duration: "4-6 hrs", priceIN: 15000, priceUS: 750, rating: 4.7, reviewCount: 120, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop", includes: ["BBQ grill setup", "Marinades & sauces", "Grilling chef", "Salads & sides"] },

  // Kitchen Deep Cleaning
  { id: "kdc-1", categoryId: "kitchen-deep-clean", name: "Standard Kitchen Clean", description: "Thorough cleaning of kitchen surfaces, appliances, and storage areas.", duration: "2-3 hrs", priceIN: 1500, priceUS: 75, rating: 4.6, reviewCount: 890, image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop", includes: ["Countertop & slab cleaning", "Appliance exterior clean", "Sink & drain cleaning", "Floor mopping"], popular: true },
  { id: "kdc-2", categoryId: "kitchen-deep-clean", name: "Deep Clean + Chimney Service", description: "Complete kitchen deep clean plus chimney filter cleaning and degreasing.", duration: "3-4 hrs", priceIN: 2500, priceUS: 120, rating: 4.7, reviewCount: 540, image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop", includes: ["Full kitchen deep clean", "Chimney disassembly & clean", "Grease trap cleaning", "Reassembly & testing"], popular: true },
  { id: "kdc-3", categoryId: "kitchen-deep-clean", name: "Fridge Deep Cleaning", description: "Internal and external cleaning of refrigerator with deodorizing.", duration: "1-2 hrs", priceIN: 800, priceUS: 40, rating: 4.5, reviewCount: 320, image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=300&fit=crop", includes: ["Shelf & drawer removal", "Interior sanitization", "Deodorizing treatment", "Exterior polish"] },
  { id: "kdc-4", categoryId: "kitchen-deep-clean", name: "Full Kitchen Makeover", description: "Premium deep clean covering every surface, appliance, cabinet interior, and more.", duration: "5-6 hrs", priceIN: 4000, priceUS: 200, rating: 4.9, reviewCount: 190, image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop", includes: ["Cabinet interior cleaning", "Oven & microwave deep clean", "Tile & grout scrub", "Pest prevention spray"] },

  // Tiffin / Dabba Service
  { id: "tif-1", categoryId: "tiffin-service", name: "Veg Tiffin – Lunch", description: "Daily vegetarian lunch tiffin with roti, sabzi, dal, rice, and salad.", duration: "Monthly", priceIN: 3500, priceUS: 180, rating: 4.7, reviewCount: 1560, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", includes: ["4 items per meal", "6 days a week", "Free delivery", "Weekly menu rotation"], popular: true },
  { id: "tif-2", categoryId: "tiffin-service", name: "Non-Veg Tiffin – Lunch", description: "Daily non-veg lunch tiffin with chicken/fish curry, roti, rice, and sides.", duration: "Monthly", priceIN: 4500, priceUS: 220, rating: 4.6, reviewCount: 890, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop", includes: ["Non-veg 3 days/week", "4-5 items per meal", "6 days delivery", "Hygiene certified"] },
  { id: "tif-3", categoryId: "tiffin-service", name: "Diet Tiffin – Weight Loss", description: "Calorie-controlled meals designed for weight management goals.", duration: "Monthly", priceIN: 5000, priceUS: 250, rating: 4.8, reviewCount: 410, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", includes: ["Nutritionist designed", "Calorie counted", "High protein options", "Weekly check-in"] },
  { id: "tif-4", categoryId: "tiffin-service", name: "Breakfast + Lunch Combo", description: "Start your day right with home-cooked breakfast and lunch delivered together.", duration: "Monthly", priceIN: 5500, priceUS: 280, rating: 4.7, reviewCount: 340, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop", includes: ["2 meals per day", "Diverse breakfast menu", "Full lunch thali", "Weekend specials"] },
  { id: "tif-5", categoryId: "tiffin-service", name: "Office Group Tiffin (5+ people)", description: "Group tiffin plan for offices with bulk pricing and customized menu.", duration: "Monthly", priceIN: 3000, priceUS: 150, rating: 4.6, reviewCount: 220, image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=300&fit=crop", includes: ["Bulk discount", "Group-customized menu", "On-time delivery", "Weekly feedback loop"], popular: true },

  // Cooking Classes
  { id: "cls-1", categoryId: "cooking-classes", name: "South Indian Masterclass", description: "Learn authentic dosa, idli, sambar, and chutneys from an experienced chef.", duration: "3 hrs", priceIN: 1500, priceUS: 60, rating: 4.9, reviewCount: 320, image: "https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=400&h=300&fit=crop", includes: ["Hands-on cooking", "Recipe booklet", "Ingredients provided", "Take-home dishes"], popular: true },
  { id: "cls-2", categoryId: "cooking-classes", name: "North Indian Thali Class", description: "Master dal makhani, butter chicken, naan, and classic North Indian dishes.", duration: "3-4 hrs", priceIN: 1800, priceUS: 70, rating: 4.8, reviewCount: 280, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop", includes: ["5+ recipes", "Tips & techniques", "All ingredients", "Certificate"] },
  { id: "cls-3", categoryId: "cooking-classes", name: "Baking Fundamentals", description: "Learn bread, cookies, cakes, and pastry basics from a professional baker.", duration: "4 hrs", priceIN: 2000, priceUS: 80, rating: 4.7, reviewCount: 190, image: "https://images.unsplash.com/photo-1486427944781-dbf45f4823a9?w=400&h=300&fit=crop", includes: ["Oven techniques", "Decoration basics", "Take-home bakes", "Recipe cards"] },
  { id: "cls-4", categoryId: "cooking-classes", name: "Kids Cooking Workshop", description: "Fun, safe cooking activities for kids aged 6-14. Simple recipes they'll love.", duration: "2 hrs", priceIN: 800, priceUS: 35, rating: 4.9, reviewCount: 150, image: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&h=300&fit=crop", includes: ["Kid-safe recipes", "Fun activities", "Apron & chef hat", "Certificate of completion"] },
  { id: "cls-5", categoryId: "cooking-classes", name: "Pickle & Preserves Workshop", description: "Traditional methods of making pickles, jams, and preserves at home.", duration: "3 hrs", priceIN: 1200, priceUS: 50, rating: 4.6, reviewCount: 110, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop", includes: ["5 pickle varieties", "Sterilization techniques", "Take-home jars", "Storage tips"] },
  { id: "cls-6", categoryId: "cooking-classes", name: "International Cuisine – Italian", description: "Pasta from scratch, risotto, bruschetta, and tiramisu in one session.", duration: "4 hrs", priceIN: 2500, priceUS: 90, rating: 4.8, reviewCount: 170, image: "https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=400&h=300&fit=crop", includes: ["Fresh pasta making", "4 Italian dishes", "Wine pairing tips", "Recipe booklet"] },

  // Kitchen Setup
  { id: "ks-1", categoryId: "kitchen-setup", name: "Kitchen Organization", description: "Professional organizer optimizes your kitchen storage, shelving, and workflow.", duration: "3-4 hrs", priceIN: 2000, priceUS: 100, rating: 4.7, reviewCount: 180, image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop", includes: ["Storage assessment", "Shelf organizers", "Labeling system", "Pantry setup"], popular: true },
  { id: "ks-2", categoryId: "kitchen-setup", name: "New Kitchen Equipment Consultation", description: "Expert advice on buying the right appliances and cookware for your needs.", duration: "1-2 hrs", priceIN: 500, priceUS: 30, rating: 4.5, reviewCount: 90, image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop", includes: ["Needs assessment", "Brand recommendations", "Budget planning", "Shopping list"] },
  { id: "ks-3", categoryId: "kitchen-setup", name: "Modular Kitchen Consultation", description: "Design and layout planning for modular kitchen renovation or new setup.", duration: "2-3 hrs", priceIN: 1500, priceUS: 75, rating: 4.6, reviewCount: 70, image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop", includes: ["Layout planning", "Material advice", "Vendor referrals", "3D visualization"] },
  { id: "ks-4", categoryId: "kitchen-setup", name: "Home Bakery Setup Guide", description: "Everything you need to start a home baking business – equipment, licensing, recipes.", duration: "2 hrs", priceIN: 1000, priceUS: 50, rating: 4.8, reviewCount: 130, image: "https://images.unsplash.com/photo-1486427944781-dbf45f4823a9?w=400&h=300&fit=crop", includes: ["Equipment checklist", "FDA guidance", "Starter recipes", "Marketing tips"] },
];

export const serviceProviders: ServiceProvider[] = [
  { id: "sp-1", name: "Lakshmi Devi", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", rating: 4.9, jobs: 1240, experience: "12 years", skills: ["South Indian", "North Indian", "Baking"], verified: true, categoryIds: ["cook-on-demand", "catering", "cooking-classes"] },
  { id: "sp-2", name: "Mohammed Irfan", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", rating: 4.8, jobs: 890, experience: "8 years", skills: ["Mughlai", "Biryani", "BBQ", "Kebabs"], verified: true, categoryIds: ["cook-on-demand", "catering"] },
  { id: "sp-3", name: "Priya Sharma", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", rating: 4.7, jobs: 560, experience: "5 years", skills: ["Continental", "Baking", "Diet Meals"], verified: true, categoryIds: ["cook-on-demand", "tiffin-service", "cooking-classes"] },
  { id: "sp-4", name: "Rajesh Kumar", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop", rating: 4.6, jobs: 340, experience: "6 years", skills: ["Kitchen Cleaning", "Deep Clean", "Chimney Service"], verified: true, categoryIds: ["kitchen-deep-clean"] },
  { id: "sp-5", name: "Anitha Reddy", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop", rating: 4.9, jobs: 780, experience: "10 years", skills: ["Hyderabadi", "Andhra", "Pickles"], verified: true, categoryIds: ["cook-on-demand", "tiffin-service", "cooking-classes"] },
  { id: "sp-6", name: "David Wilson", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop", rating: 4.7, jobs: 420, experience: "7 years", skills: ["American BBQ", "Italian", "Meal Prep"], verified: true, categoryIds: ["cook-on-demand", "catering", "cooking-classes"] },
];
