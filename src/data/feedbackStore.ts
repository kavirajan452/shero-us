/** Customer feedback store — NOW SYNCED TO SUPABASE */
import { supabase } from "@/integrations/supabase/client";
export type FeedbackStatus = "pending" | "sent" | "responded" | "no_response";

export interface CustomerFeedback {
  id: string;
  orderId: string;
  orderDisplayId: string;
  customerName: string;
  customerPhone: string;
  guestCount: number;
  eventDate: string;
  occasion?: string;
  partnerName: string;
  deliveredAt: string;
  feedbackEligibleAt: string;   // 2 days after delivery
  whatsappSentAt?: string;
  status: FeedbackStatus;
  rating?: number;              // 1-5
  comment?: string;
  respondedAt?: string;
  sentBy?: string;              // admin who sent
  messageTemplate?: string;
}

// Mock data
let feedbackRecords: CustomerFeedback[] = [
  {
    id: "fb-001",
    orderId: "pty-003",
    orderDisplayId: "SH-PTY-78236",
    customerName: "Anand Srinivasan",
    customerPhone: "9866554433",
    guestCount: 200,
    eventDate: "2026-03-15",
    occasion: "Housewarming (Griha Pravesh)",
    partnerName: "Chef Lakshmi",
    deliveredAt: "2026-03-15T11:00:00",
    feedbackEligibleAt: "2026-03-17T11:00:00",
    status: "sent",
    whatsappSentAt: "2026-03-17T12:00:00",
    sentBy: "Senthil K.",
    rating: 5,
    comment: "Excellent food! Everything was fresh and delicious. The payasam was outstanding.",
    respondedAt: "2026-03-17T18:30:00",
    messageTemplate: "default",
  },
  {
    id: "fb-002",
    orderId: "pty-sample-3",
    orderDisplayId: "SH-PTY-79003",
    customerName: "Lakshmi Priya",
    customerPhone: "9855443322",
    guestCount: 100,
    eventDate: "2026-03-12",
    occasion: "Birthday Party",
    partnerName: "Chef Meena",
    deliveredAt: "2026-03-12T19:30:00",
    feedbackEligibleAt: "2026-03-14T19:30:00",
    status: "sent",
    whatsappSentAt: "2026-03-14T10:00:00",
    sentBy: "Senthil K.",
    rating: 4,
    comment: "Good food overall. Sambar was slightly spicy but everything else was perfect.",
    respondedAt: "2026-03-14T15:00:00",
    messageTemplate: "default",
  },
  {
    id: "fb-003",
    orderId: "pty-sample-4",
    orderDisplayId: "SH-PTY-79004",
    customerName: "Rajesh Kumar",
    customerPhone: "9844332211",
    guestCount: 75,
    eventDate: "2026-03-13",
    occasion: "Wedding Reception",
    partnerName: "Chef Kamala",
    deliveredAt: "2026-03-13T13:00:00",
    feedbackEligibleAt: "2026-03-15T13:00:00",
    status: "pending",
    messageTemplate: "default",
  },
  {
    id: "fb-004",
    orderId: "pty-sample-5",
    orderDisplayId: "SH-PTY-79005",
    customerName: "Deepa Mohan",
    customerPhone: "9833221100",
    guestCount: 50,
    eventDate: "2026-03-11",
    partnerName: "Chef Fathima",
    deliveredAt: "2026-03-11T12:00:00",
    feedbackEligibleAt: "2026-03-13T12:00:00",
    status: "sent",
    whatsappSentAt: "2026-03-13T11:00:00",
    sentBy: "Bharathi S.",
    messageTemplate: "default",
  },
];

export const getFeedbackRecords = () => [...feedbackRecords];

export const getPendingFeedbacks = () => feedbackRecords.filter(f => f.status === "pending");
export const getSentFeedbacks = () => feedbackRecords.filter(f => f.status === "sent" && !f.rating);
export const getRespondedFeedbacks = () => feedbackRecords.filter(f => f.status === "responded" || (f.status === "sent" && !!f.rating));
export const getNoResponseFeedbacks = () => feedbackRecords.filter(f => f.status === "no_response");

export const sendFeedbackWhatsApp = (feedbackId: string, sentBy: string): CustomerFeedback | undefined => {
  const fb = feedbackRecords.find(f => f.id === feedbackId);
  if (!fb) return undefined;
  
  feedbackRecords = feedbackRecords.map(f =>
    f.id === feedbackId
      ? { ...f, status: "sent" as const, whatsappSentAt: new Date().toISOString(), sentBy }
      : f
  );
  // Sync to Supabase
  supabase.from("customer_feedback").update({ status: "sent", whatsapp_sent_at: new Date().toISOString(), sent_by: sentBy }).eq("id", feedbackId).then(() => {});
  return feedbackRecords.find(f => f.id === feedbackId);
};

export const recordFeedbackResponse = (feedbackId: string, rating: number, comment: string) => {
  feedbackRecords = feedbackRecords.map(f =>
    f.id === feedbackId
      ? { ...f, status: "responded" as const, rating, comment, respondedAt: new Date().toISOString() }
      : f
  );
  supabase.from("customer_feedback").update({ status: "responded", rating, comment, responded_at: new Date().toISOString() }).eq("id", feedbackId).then(() => {});
};

export const markNoResponse = (feedbackId: string) => {
  feedbackRecords = feedbackRecords.map(f =>
    f.id === feedbackId
      ? { ...f, status: "no_response" as const }
      : f
  );
};

// Default WhatsApp template
export const FEEDBACK_TEMPLATE = (customerName: string, orderDisplayId: string, eventDate: string) =>
  `🙏 Hi ${customerName}!\n\nThank you for choosing Shero for your event on ${eventDate} (Order: ${orderDisplayId}).\n\nWe'd love to hear your feedback! How was the food and service?\n\nPlease rate us (1-5 ⭐) and share any comments.\n\n— Team Shero 🍽️`;
