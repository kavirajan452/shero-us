import type { InteractiveTrainingConfig } from "@/components/partner/InteractiveTrainingPlayer";

/**
 * Demo checkpoint configs for each app training module.
 * In production these would come from a CMS / backend.
 * The video source is a placeholder — each module would have its own video.
 */

const VIDEO_SRC = "/shero-promo.mp4";

export const appTrainingConfigs: Record<string, InteractiveTrainingConfig> = {
  onboarding: {
    title: "Getting Started with Shero Partner App",
    videoSrc: VIDEO_SRC,
    checkpoints: [
      {
        timeSeconds: 5,
        segmentLabel: "App Overview",
        quiz: {
          question: "Where do you find your daily order summary in the app?",
          options: ["Profile page", "Dashboard home screen", "Settings menu", "Earnings tab"],
          correctIndex: 1,
          explanation: "The Dashboard is your command centre — it shows live orders, earnings, and alerts at a glance.",
        },
      },
      {
        timeSeconds: 10,
        segmentLabel: "Profile Setup",
        quiz: {
          question: "Which document is mandatory to complete your kitchen profile?",
          options: ["Passport", "FSSAI License", "Driving License", "Voter ID"],
          correctIndex: 1,
          explanation: "An FSSAI license is required for all food business operators in India.",
        },
      },
      {
        timeSeconds: 15,
        segmentLabel: "First Order",
        quiz: {
          question: "What should you do when you receive your first order notification?",
          options: ["Ignore it until you're ready", "Accept within 60 seconds", "Call the customer first", "Wait for admin approval"],
          correctIndex: 1,
          explanation: "Quick acceptance improves your SCV score and customer satisfaction.",
        },
      },
    ],
  },
  orders: {
    title: "Receiving & Managing Orders",
    videoSrc: VIDEO_SRC,
    checkpoints: [
      {
        timeSeconds: 5,
        segmentLabel: "Order Types",
        quiz: {
          question: "How many order types does the Shero platform support?",
          options: ["2 — Instant & Subscription", "3 — Instant, Subscription & Party", "4 — Including Services", "1 — Only Instant"],
          correctIndex: 1,
          explanation: "Shero supports Instant delivery, Subscription meals, and Party/bulk orders.",
        },
      },
      {
        timeSeconds: 10,
        segmentLabel: "Preparation Flow",
        quiz: {
          question: "When should food preparation begin for a subscription order?",
          options: ["When the delivery agent arrives", "30 minutes before the scheduled slot", "Immediately after acceptance", "Only after customer confirms"],
          correctIndex: 1,
          explanation: "Starting 30 minutes before ensures food is fresh and ready on time.",
        },
      },
      {
        timeSeconds: 15,
        segmentLabel: "Handoff Process",
        quiz: {
          question: "What must you verify before handing food to the delivery agent?",
          options: ["Customer phone number", "Order ID & item count", "Agent's personal ID", "Payment receipt"],
          correctIndex: 1,
          explanation: "Always cross-check the Order ID and item count to avoid mix-ups.",
        },
      },
    ],
  },
  menu: {
    title: "Menu & Ingredient Management",
    videoSrc: VIDEO_SRC,
    checkpoints: [
      {
        timeSeconds: 6,
        segmentLabel: "Menu Basics",
        quiz: {
          question: "What happens when you mark an ingredient as 'unavailable'?",
          options: ["Nothing changes", "Affected dishes are auto-hidden from customers", "Your kitchen goes offline", "Admin is notified"],
          correctIndex: 1,
          explanation: "The system auto-hides dishes that depend on unavailable ingredients to prevent failed orders.",
        },
      },
      {
        timeSeconds: 12,
        segmentLabel: "Branded vs Unbranded",
        quiz: {
          question: "Can you modify the recipe of a branded Shero menu item?",
          options: ["Yes, freely", "No — branded recipes are standardised", "Only with customer permission", "Only on weekends"],
          correctIndex: 1,
          explanation: "Branded items follow Shero's standardised recipes for consistent quality across all kitchens.",
        },
      },
    ],
  },
  earnings: {
    title: "Understanding Your Earnings & Reports",
    videoSrc: VIDEO_SRC,
    checkpoints: [
      {
        timeSeconds: 5,
        segmentLabel: "PPP Model",
        quiz: {
          question: "What does PPP stand for in Shero's earning model?",
          options: ["Pay Per Plate", "Profit Per Partner", "Price Per Product", "Points Per Purchase"],
          correctIndex: 0,
          explanation: "PPP (Pay Per Plate) means you earn a fixed amount for every plate/order you prepare.",
        },
      },
      {
        timeSeconds: 12,
        segmentLabel: "Reports",
        quiz: {
          question: "How often can you download your earnings report?",
          options: ["Only monthly", "Only weekly", "Anytime — daily, weekly, or monthly", "Only when admin sends it"],
          correctIndex: 2,
          explanation: "Reports are available on-demand in daily, weekly, or monthly formats.",
        },
      },
    ],
  },
  schedule: {
    title: "Kitchen Schedule & Attendance",
    videoSrc: VIDEO_SRC,
    checkpoints: [
      {
        timeSeconds: 5,
        segmentLabel: "Weekly Schedule",
        quiz: {
          question: "What is the minimum weekly attendance requirement?",
          options: ["50%", "70%", "90%", "100%"],
          correctIndex: 2,
          explanation: "Partners must maintain at least 90% weekly attendance for a good SCV score.",
        },
      },
      {
        timeSeconds: 10,
        segmentLabel: "Leave Management",
        quiz: {
          question: "How far in advance should you request planned leave?",
          options: ["Same day", "24 hours", "48 hours", "1 week"],
          correctIndex: 2,
          explanation: "48 hours advance notice allows the system to redistribute orders smoothly.",
        },
      },
    ],
  },
  referrals: {
    title: "Referrals & Growing Your Business",
    videoSrc: VIDEO_SRC,
    checkpoints: [
      {
        timeSeconds: 5,
        segmentLabel: "Referral Code",
        quiz: {
          question: "Where can a referred partner enter your referral code?",
          options: ["During enrollment", "After first order", "In settings", "Cannot enter manually"],
          correctIndex: 0,
          explanation: "The referral code is entered during the partner enrollment/signup process.",
        },
      },
      {
        timeSeconds: 10,
        segmentLabel: "Rewards",
        quiz: {
          question: "When do you receive your referral reward?",
          options: ["Immediately on signup", "After referred partner completes 10 orders", "After 1 month", "Never — it's just points"],
          correctIndex: 1,
          explanation: "Referral rewards are credited after the new partner completes their first 10 orders.",
        },
      },
    ],
  },
};

/** Cooking training checkpoint configs */
export const cookingTrainingConfigs: Record<string, InteractiveTrainingConfig> = {
  "Hyderabadi Biryani": {
    title: "Hyderabadi Biryani — Cooking Training",
    videoSrc: VIDEO_SRC,
    checkpoints: [
      {
        timeSeconds: 6,
        segmentLabel: "Rice Preparation",
        quiz: {
          question: "How long should basmati rice be soaked before cooking biryani?",
          options: ["5 minutes", "30 minutes", "2 hours", "No soaking needed"],
          correctIndex: 1,
          explanation: "30 minutes of soaking ensures even cooking and elongated grains.",
        },
      },
      {
        timeSeconds: 12,
        segmentLabel: "Dum Process",
        quiz: {
          question: "What is the purpose of 'dum' (sealing) in biryani?",
          options: ["To cool it down", "To trap steam for slow cooking", "To add colour", "To remove excess oil"],
          correctIndex: 1,
          explanation: "Dum traps steam inside, allowing the rice and meat to cook together in aromatic moisture.",
        },
      },
    ],
  },
};
