import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: April 1, 2026</p>

        <div className="prose prose-sm dark:prose-invert space-y-6">
          <section>
            <h2 className="text-xl font-semibold">1. Information We Collect</h2>
            <p>Shero USA INC ("we", "our", "us") collects personal information you provide when you create an account, place an order, or contact support. This includes your name, email address, phone number, delivery address, and payment information.</p>
            <p>We also automatically collect device information, IP address, browser type, and usage data through cookies and similar technologies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To process and deliver your food orders</li>
              <li>To communicate order updates and promotional offers</li>
              <li>To improve our platform and personalize your experience</li>
              <li>To comply with legal obligations</li>
              <li>To detect and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Information Sharing</h2>
            <p>We share your information with home chef partners (for order preparation), delivery partners, payment processors, and as required by law. We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Data Security</h2>
            <p>We implement industry-standard security measures including encryption, secure servers, and access controls to protect your personal information.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Your Rights</h2>
            <p>Depending on your state of residence, you may have the right to access, correct, delete, or port your personal data. California residents have additional rights under the CCPA (see our "Do Not Sell My Information" page).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Cookies</h2>
            <p>We use cookies and similar tracking technologies to enhance your experience. See our Cookie Policy for details on how to manage your cookie preferences.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Children's Privacy</h2>
            <p>Our services are not directed to children under 13. We do not knowingly collect information from children under 13.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Contact Us</h2>
            <p>For privacy-related questions, contact us at <a href="mailto:support@shero.us" className="text-primary underline">support@shero.us</a> or write to: Shero USA INC, Elkridge, MD.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
