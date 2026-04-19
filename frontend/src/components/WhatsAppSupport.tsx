import { MessageCircle } from "lucide-react";
import { openWhatsAppSupport, buildSupportMessage } from "@/utils/whatsapp";

interface WhatsAppSupportProps {
  orderId?: string;
  customerName?: string;
  className?: string;
}

const WhatsAppSupport = ({ orderId, customerName, className = "" }: WhatsAppSupportProps) => {
  const handleClick = () => {
    const message = buildSupportMessage({ orderId, customerName });
    openWhatsAppSupport(message);
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform md:bottom-6 ${className}`}
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
};

export default WhatsAppSupport;
