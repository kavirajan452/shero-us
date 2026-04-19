import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What is Shero Home Food?",
    a: "Shero Home Food is a platform that connects you with trusted home chefs in your neighborhood who prepare fresh, authentic homemade meals — not restaurant food, not cloud kitchens. Just real home cooking delivered to your door.",
  },
  {
    q: "How does ordering work?",
    a: "Browse home chefs near you, pick your meals, and place an order. Your food is freshly prepared in a real home kitchen and delivered at your chosen time slot. You can also subscribe for daily meals or book party orders for events.",
  },
  {
    q: "Is the food safe to eat?",
    a: "Absolutely. All our home chefs undergo food safety training, and kitchens are audited regularly. We follow FDA-compliant hygiene practices. However, meals are prepared in home kitchens that handle common allergens — please check our Allergen Notice for details.",
  },
  {
    q: "What areas do you serve?",
    a: "We're currently serving select US cities and expanding rapidly. Enter your ZIP code on the app to check if we deliver to your area. If we don't yet, you can join our waitlist and we'll notify you when we launch nearby.",
  },
  {
    q: "Can I order for a party or large group?",
    a: "Yes! We offer dedicated Party Orders for events of 10+ guests. Choose from regional cuisines, customize your menu per session (breakfast, lunch, dinner), and our home chefs handle the rest. 50% advance booking is available.",
  },
  {
    q: "Do you offer meal subscriptions?",
    a: "Yes — we offer weekly and monthly meal subscription plans. Get fresh homemade meals delivered daily from a nearby home chef. Plans are flexible and can be paused or cancelled anytime.",
  },
  {
    q: "How are your home chefs selected?",
    a: "Every Shero home chef goes through a multi-step onboarding process including kitchen audits, food safety training, taste tests, and quality checks. We only partner with women who are passionate about home cooking.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit/debit cards (Visa, Mastercard, Amex), Apple Pay, Google Pay, and Shero Wallet credits. All payments are securely processed.",
  },
  {
    q: "What is your cancellation & refund policy?",
    a: "Instant orders can be cancelled before the chef starts preparation for a full refund. Party orders offer free cancellation up to 2 days before the event. Refunds are processed within 5–10 business days to your original payment method.",
  },
  {
    q: "How can I become a Shero home chef?",
    a: "If you're a passionate home cook, visit our 'Be a Shero' page to apply. We provide training, kitchen setup guidance, and a steady stream of orders. Join thousands of women earning independently through their culinary skills.",
  },
];

const HomeFAQ = () => {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-3">
            FAQs
          </span>
          <h2 className="text-2xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Everything you need to know about Shero Home Food.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-sm font-medium">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default HomeFAQ;
