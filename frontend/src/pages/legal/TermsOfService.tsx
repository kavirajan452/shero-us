import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TermsOfService = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: April 1, 2026</p>

        <div className="prose prose-sm dark:prose-invert space-y-6">
          <section>
            <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
            <p>By accessing or using the Shero Home Food platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use our Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Description of Service</h2>
            <p>Shero USA INC operates a platform connecting customers with independent home chefs who prepare fresh, homemade meals. We act as an intermediary and are not the food manufacturer.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. User Accounts</h2>
            <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your login credentials and all activities under your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Orders & Payments</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>All prices are listed in USD and include applicable taxes unless stated otherwise.</li>
              <li>Payment is processed at the time of order placement.</li>
              <li>We reserve the right to cancel orders due to pricing errors or unavailability.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Cancellation & Refund Policy</h2>
            <p>Orders may be cancelled within the timeframes specified at checkout. Refunds are processed to the original payment method within 5–10 business days. Party orders have specific cancellation terms outlined during booking.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Food Safety & Allergens</h2>
            <p>Our home chefs follow food safety guidelines. However, meals are prepared in home kitchens that may handle common allergens. Customers with allergies should review allergen information and communicate specific requirements.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Limitation of Liability</h2>
            <p>Shero USA INC is not liable for any indirect, incidental, or consequential damages arising from the use of our Service. Our total liability shall not exceed the amount paid for the specific order in question.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Governing Law</h2>
            <p>These Terms shall be governed by the laws of the State of Maryland, USA, without regard to conflict of law provisions.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">9. Contact</h2>
            <p>Questions about these Terms? Email us at <a href="mailto:support@shero.us" className="text-primary underline">support@shero.us</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
