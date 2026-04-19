import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CookiePolicy = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: April 1, 2026</p>

        <div className="prose prose-sm dark:prose-invert space-y-6">
          <section>
            <h2 className="text-xl font-semibold">What Are Cookies?</h2>
            <p>Cookies are small text files stored on your device when you visit our website. They help us provide a better user experience by remembering your preferences and understanding how you use our platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Types of Cookies We Use</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for basic functionality like login, cart management, and checkout. These cannot be disabled.</li>
              <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with our platform through anonymous analytics data.</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences like language, region, and dietary filters.</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant promotions and measure ad campaign effectiveness.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Managing Cookies</h2>
            <p>You can manage cookie preferences through your browser settings. Note that disabling certain cookies may affect platform functionality.</p>
            <p>Most browsers allow you to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>View what cookies are stored</li>
              <li>Delete individual or all cookies</li>
              <li>Block cookies from specific or all websites</li>
              <li>Block third-party cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Third-Party Cookies</h2>
            <p>Some cookies are placed by third-party services we use, including analytics tools and payment processors. These third parties have their own privacy policies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Contact</h2>
            <p>For questions about our cookie practices, email <a href="mailto:support@shero.us" className="text-primary underline">support@shero.us</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
