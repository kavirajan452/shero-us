import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Accessibility = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <h1 className="text-3xl font-bold mb-2">Accessibility Statement</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: April 1, 2026</p>

        <div className="prose prose-sm dark:prose-invert space-y-6">
          <section>
            <h2 className="text-xl font-semibold">Our Commitment</h2>
            <p>Shero USA INC is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Standards</h2>
            <p>We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1, Level AA. These guidelines explain how to make web content more accessible for people with disabilities.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Measures Taken</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Semantic HTML structure for screen reader compatibility</li>
              <li>Keyboard navigation support across the platform</li>
              <li>Sufficient color contrast ratios</li>
              <li>Alt text for images</li>
              <li>Responsive design for various devices and zoom levels</li>
              <li>Focus indicators for interactive elements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Feedback</h2>
            <p>We welcome your feedback on the accessibility of Shero Home Food. Please let us know if you encounter accessibility barriers:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Email: <a href="mailto:support@shero.us" className="text-primary underline">support@shero.us</a></li>
              <li>Phone: +1 (800) 743-7600</li>
            </ul>
            <p>We try to respond to accessibility feedback within 2 business days.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Accessibility;
