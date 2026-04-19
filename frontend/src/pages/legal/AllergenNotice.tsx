import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AllergenNotice = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <h1 className="text-3xl font-bold mb-2">Allergen Notice</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: April 1, 2026</p>

        <div className="prose prose-sm dark:prose-invert space-y-6">
          <section>
            <h2 className="text-xl font-semibold">Important Allergen Information</h2>
            <p>All meals on the Shero platform are prepared in home kitchens by independent home chefs. These kitchens are <strong>not allergen-free environments</strong> and may process foods containing the following major allergens:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Milk & Dairy</li>
              <li>Eggs</li>
              <li>Tree Nuts (cashews, almonds, pistachios, etc.)</li>
              <li>Peanuts</li>
              <li>Wheat & Gluten</li>
              <li>Soy</li>
              <li>Fish</li>
              <li>Shellfish</li>
              <li>Sesame</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Cross-Contamination Risk</h2>
            <p>Due to the nature of home kitchen preparation, there is always a risk of cross-contamination. Even dishes labeled as free from a specific allergen may have come into contact with that allergen during preparation.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Your Responsibility</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Please review individual dish descriptions and allergen tags carefully before ordering.</li>
              <li>Use the "Cooking Instructions" field to communicate specific allergy requirements.</li>
              <li>If you have a severe or life-threatening allergy, please contact us before placing your order.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">FDA Disclaimer</h2>
            <p>This information is provided for informational purposes only and is not intended as medical advice. If you have food allergies, consult your healthcare provider before consuming any meals from our platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Contact</h2>
            <p>For allergen-specific queries, contact <a href="mailto:support@shero.us" className="text-primary underline">support@shero.us</a> or call +1 (800) 743-7600.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AllergenNotice;
