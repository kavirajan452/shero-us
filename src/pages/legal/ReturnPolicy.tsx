import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ReturnPolicy = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <h1 className="text-3xl font-bold mb-2">Return & Refund Policy</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: April 4, 2026</p>

        <div className="prose prose-sm dark:prose-invert space-y-6">
          <section>
            <h2 className="text-xl font-semibold">1. No Physical Returns</h2>
            <p>Due to the perishable nature of food products and in compliance with food safety and hygiene standards set forth by the U.S. Food and Drug Administration (FDA) and applicable state health departments, <strong>Shero USA INC does not accept physical returns of any food items</strong> once delivered. This policy exists to protect the health and safety of all our customers, as we cannot guarantee the integrity of food products once they leave our delivery chain of custody.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Quality Guarantee</h2>
            <p>We take pride in the quality of every meal prepared by our home chefs. If your order arrives in any of the following conditions, you may be eligible for a refund or account credit:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Food arrived damaged, spilled, or in compromised packaging</li>
              <li>Food does not match what was ordered</li>
              <li>Food has a quality issue (undercooked, spoiled, or foreign object)</li>
              <li>Temperature of food was not maintained during delivery</li>
            </ul>
            <p className="mt-2"><strong>Reporting window:</strong> You must report quality issues within <strong>1 hour</strong> of delivery by contacting us at <a href="mailto:support@shero.us" className="text-primary underline">support@shero.us</a> or through the app. Please include photos of the affected item(s) and your order number. Late reports beyond 1 hour may not be eligible for a refund.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Missing or Incorrect Items</h2>
            <p>If your order is missing items or you received incorrect items, please report it within <strong>1 hour</strong> of delivery. At Shero's discretion, we will either:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Issue a refund for the missing or incorrect item(s)</li>
              <li>Provide account credit for future orders</li>
              <li>Arrange re-delivery of the correct item(s) where feasible</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Cancellation Refunds</h2>
            <p>We understand plans change. Our cancellation and refund terms vary by order type:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Single Meal Orders:</strong> Orders cancelled before the kitchen begins preparation are eligible for a full refund. Once preparation has started, no refund is available.</li>
              <li><strong>Party Orders:</strong> Free cancellation up to <strong>72 hours</strong> before the event date for a full refund. Cancellations within 72 hours of the event are non-refundable, as ingredients will have been purchased and preparation may have begun.</li>
              <li><strong>Subscription Plans:</strong> Cancellation applies to future deliveries only. Refunds for the current billing cycle are issued on a prorated basis at Shero's discretion.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Refund Processing</h2>
            <p>Approved refunds are processed as follows:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Original payment method:</strong> Refunds are returned to the original payment method (credit card, debit card, or bank account) within <strong>5–10 business days</strong>. Processing time may vary depending on your financial institution.</li>
              <li><strong>Shero Wallet credits:</strong> Credits are applied instantly to your Shero Wallet and can be used on future orders.</li>
              <li><strong>Party order advance payments:</strong> For orders paid with 50% advance, eligible refunds are processed to the original payment method within 5–10 business days.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Non-Refundable Scenarios</h2>
            <p>Refunds will <strong>not</strong> be issued in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Food has been partially or fully consumed</li>
              <li>Quality complaints reported more than 1 hour after delivery</li>
              <li>Change of mind or taste preference after delivery</li>
              <li>Incorrect delivery address provided by the customer</li>
              <li>Customer was unavailable at the delivery address during the delivery window</li>
              <li>Orders affected by circumstances beyond Shero's control (natural disasters, severe weather, etc.)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Dispute Resolution</h2>
            <p>If you believe your refund request was incorrectly denied, you may escalate the matter by emailing <a href="mailto:ceo@shero.us" className="text-primary underline">ceo@shero.us</a> with your order details and supporting evidence. We are committed to fair resolution of all disputes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Contact Us</h2>
            <p>For any questions regarding this Return & Refund Policy, please reach out to us:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Email: <a href="mailto:support@shero.us" className="text-primary underline">support@shero.us</a></li>
              <li>Phone: <a href="tel:+18007437600" className="text-primary underline">+1 (800) 743-7600</a></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;
