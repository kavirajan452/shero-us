import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const DoNotSell = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <h1 className="text-3xl font-bold mb-2">Do Not Sell My Personal Information</h1>
        <p className="text-muted-foreground text-sm mb-8">California Consumer Privacy Act (CCPA)</p>

        <div className="prose prose-sm dark:prose-invert space-y-6">
          <section>
            <h2 className="text-xl font-semibold">Your Rights Under CCPA</h2>
            <p>Under the California Consumer Privacy Act (CCPA), California residents have the right to opt out of the "sale" of their personal information. Shero USA INC does <strong>not sell personal information</strong> to third parties for monetary consideration.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">What We Share</h2>
            <p>We share limited information with service providers strictly for the purpose of fulfilling your orders:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Home chef partners (name, address, order details for food preparation)</li>
              <li>Delivery partners (address for delivery fulfillment)</li>
              <li>Payment processors (payment details for transaction processing)</li>
            </ul>
            <p>These are considered "service provider" relationships, not "sales" under CCPA.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Your CCPA Rights</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Right to Know:</strong> Request what personal information we've collected</li>
              <li><strong>Right to Delete:</strong> Request deletion of your personal information</li>
              <li><strong>Right to Opt-Out:</strong> Opt out of sale of personal information (we do not sell)</li>
              <li><strong>Right to Non-Discrimination:</strong> Exercise your rights without receiving discriminatory treatment</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Submit a Request</h2>
            <p>To exercise any of these rights, contact us at:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Email: <a href="mailto:support@shero.us" className="text-primary underline">support@shero.us</a></li>
              <li>Phone: +1 (800) 743-7600</li>
            </ul>
            <p>We will verify your identity and respond within 45 days as required by law.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DoNotSell;
