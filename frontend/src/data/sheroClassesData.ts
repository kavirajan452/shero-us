export interface SheroClass {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  instructor: string;
  instructorImage: string;
  image: string;
  rating: number;
  reviewCount: number;
  duration: string;
  mode: "self-learning" | "live" | "both";
  selfLearningPriceIN: number;
  selfLearningPriceUS: number;
  livePriceIN: number;
  livePriceUS: number;
  videoLessons?: number;
  videoHours?: string;
  popular?: boolean;
  highlights: string[];
}

export const sheroClasses: SheroClass[] = [
  // Yoga
  {
    id: "yoga-hatha-basics",
    categoryId: "yoga",
    name: "Hatha Yoga for Beginners",
    description: "Master foundational poses, breathing techniques, and alignment. Perfect for absolute beginners seeking flexibility and calm.",
    instructor: "Patricia Sharma",
    instructorImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop",
    rating: 4.9, reviewCount: 342,
    duration: "6 weeks",
    mode: "both",
    selfLearningPriceIN: 999, selfLearningPriceUS: 19,
    livePriceIN: 2999, livePriceUS: 49,
    videoLessons: 24, videoHours: "12",
    popular: true,
    highlights: ["24 HD video lessons", "Downloadable pose guides", "Certificate on completion"],
  },
  {
    id: "yoga-pranayama",
    categoryId: "yoga",
    name: "Pranayama & Breath Mastery",
    description: "Advanced breathing techniques for stress relief, energy, and spiritual growth.",
    instructor: "Patricia Sharma",
    instructorImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face",
    image: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&h=400&fit=crop",
    rating: 4.8, reviewCount: 189,
    duration: "4 weeks",
    mode: "both",
    selfLearningPriceIN: 799, selfLearningPriceUS: 15,
    livePriceIN: 1999, livePriceUS: 35,
    videoLessons: 16, videoHours: "8",
    popular: true,
    highlights: ["16 guided sessions", "Morning & evening routines", "Stress relief techniques"],
  },
  // Zumba
  {
    id: "zumba-bollywood",
    categoryId: "zumba",
    name: "Bollywood Zumba Cardio",
    description: "High-energy dance workout fusing Bollywood beats with Zumba moves. Burn 500+ calories per session!",
    instructor: "Meera Kapoor",
    instructorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    image: "https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=600&h=400&fit=crop",
    rating: 4.8, reviewCount: 278,
    duration: "8 weeks",
    mode: "both",
    selfLearningPriceIN: 1299, selfLearningPriceUS: 25,
    livePriceIN: 3499, livePriceUS: 59,
    videoLessons: 32, videoHours: "16",
    popular: true,
    highlights: ["32 dance workouts", "Calorie tracker included", "Weekly new choreography"],
  },
  // Fitness
  {
    id: "fitness-hiit",
    categoryId: "fitness",
    name: "30-Day HIIT Transformation",
    description: "Intense interval training with personalized guidance. No equipment needed — just your determination.",
    instructor: "Coach Arjun",
    instructorImage: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&h=200&fit=crop&crop=face",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop",
    rating: 4.9, reviewCount: 456,
    duration: "4 weeks",
    mode: "both",
    selfLearningPriceIN: 1499, selfLearningPriceUS: 29,
    livePriceIN: 3999, livePriceUS: 69,
    videoLessons: 30, videoHours: "15",
    popular: true,
    highlights: ["30 daily workouts", "Meal plan included", "Progress tracking"],
  },
  {
    id: "fitness-strength",
    categoryId: "fitness",
    name: "Strength Training Fundamentals",
    description: "Build lean muscle with proper form and progressive overload techniques.",
    instructor: "Coach Arjun",
    instructorImage: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&h=200&fit=crop&crop=face",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop",
    rating: 4.7, reviewCount: 198,
    duration: "8 weeks",
    mode: "self-learning",
    selfLearningPriceIN: 1799, selfLearningPriceUS: 35,
    livePriceIN: 0, livePriceUS: 0,
    videoLessons: 40, videoHours: "20",
    highlights: ["40 exercise videos", "Form correction guides", "Workout log templates"],
  },
  // Diet
  {
    id: "diet-weightloss",
    categoryId: "diet",
    name: "Personalized Weight Loss Plan",
    description: "1-on-1 nutrition counseling with customized meal plans, weekly check-ins, and lifestyle adjustments.",
    instructor: "Dr. Ananya Reddy",
    instructorImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop",
    rating: 4.7, reviewCount: 312,
    duration: "12 weeks",
    mode: "live",
    selfLearningPriceIN: 0, selfLearningPriceUS: 0,
    livePriceIN: 4999, livePriceUS: 89,
    popular: true,
    highlights: ["Weekly 1-on-1 sessions", "Custom meal plans", "WhatsApp support"],
  },
  // Tuition
  {
    id: "tuition-math",
    categoryId: "tuition",
    name: "Mathematics Mastery (Class 8-12)",
    description: "Concept-based learning with problem-solving techniques for board exams and competitive prep.",
    instructor: "Lakshmi Iyer",
    instructorImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face",
    image: "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=600&h=400&fit=crop",
    rating: 4.8, reviewCount: 534,
    duration: "Ongoing",
    mode: "both",
    selfLearningPriceIN: 1999, selfLearningPriceUS: 39,
    livePriceIN: 4999, livePriceUS: 79,
    videoLessons: 60, videoHours: "30",
    highlights: ["60 topic videos", "Practice worksheets", "Doubt clearing sessions"],
  },
  // Stress
  {
    id: "stress-mindfulness",
    categoryId: "stress",
    name: "Mindfulness & Anxiety Management",
    description: "Evidence-based therapy techniques for managing stress, anxiety, and building emotional resilience.",
    instructor: "Dr. Kavitha Nair",
    instructorImage: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=200&fit=crop&crop=face",
    image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&h=400&fit=crop",
    rating: 4.9, reviewCount: 245,
    duration: "8 weeks",
    mode: "both",
    selfLearningPriceIN: 1299, selfLearningPriceUS: 25,
    livePriceIN: 5999, livePriceUS: 99,
    videoLessons: 20, videoHours: "10",
    popular: true,
    highlights: ["20 guided meditations", "Journaling exercises", "Private counseling option"],
  },
  // Elder care
  {
    id: "eldercare-wellness",
    categoryId: "eldercare",
    name: "Senior Wellness & Gentle Exercise",
    description: "Low-impact exercises, joint mobility routines, and wellness guidance for seniors.",
    instructor: "Sister Grace",
    instructorImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
    image: "https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?w=600&h=400&fit=crop",
    rating: 4.8, reviewCount: 156,
    duration: "Ongoing",
    mode: "live",
    selfLearningPriceIN: 0, selfLearningPriceUS: 0,
    livePriceIN: 2999, livePriceUS: 49,
    highlights: ["Personalized routines", "Weekly health check-ins", "Family updates"],
  },
  // Pregnancy
  {
    id: "pregnancy-prenatal",
    categoryId: "pregnancy",
    name: "Prenatal Yoga & Wellness",
    description: "Safe, trimester-specific yoga and breathing exercises for a healthy pregnancy journey.",
    instructor: "Dr. Swati Menon",
    instructorImage: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200&h=200&fit=crop&crop=face",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop",
    rating: 4.9, reviewCount: 289,
    duration: "9 months",
    mode: "both",
    selfLearningPriceIN: 1499, selfLearningPriceUS: 29,
    livePriceIN: 3999, livePriceUS: 69,
    videoLessons: 36, videoHours: "18",
    popular: true,
    highlights: ["Trimester-wise modules", "Labor preparation", "Post-natal recovery"],
  },
  // Astrology
  {
    id: "astrology-vedic",
    categoryId: "astrology",
    name: "Vedic Astrology 1-on-1 Consultation",
    description: "Personalized horoscope reading, life predictions, and remedial guidance by expert astrologers.",
    instructor: "Pandit Raghav",
    instructorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    image: "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=600&h=400&fit=crop",
    rating: 4.7, reviewCount: 178,
    duration: "Per session",
    mode: "live",
    selfLearningPriceIN: 0, selfLearningPriceUS: 0,
    livePriceIN: 1999, livePriceUS: 39,
    highlights: ["Birth chart analysis", "Yearly predictions", "Remedial suggestions"],
  },
];
