import { useState, useCallback } from "react";
import { createInvoice } from "@/utils/invoiceService";
import { Video, MapPin, Clock, Users, ExternalLink, CheckCircle2, XCircle, Volume2, VolumeX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  serviceBookings as initialBookings,
  serviceCategoryConfig,
  type ServiceBooking,
  type ServiceBookingStatus,
} from "@/data/partnerSubscriptionData";
import { useRegion } from "@/contexts/RegionContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { buildServiceSpeech, speak, stopSpeaking } from "@/utils/partnerTTS";

const statusColors: Record<ServiceBookingStatus, string> = {
  upcoming: "bg-primary text-primary-foreground",
  in_progress: "bg-accent text-accent-foreground",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/20 text-destructive",
};

const ServiceBookingsTab = () => {
  const [bookings, setBookings] = useState<ServiceBooking[]>(initialBookings);
  const [filter, setFilter] = useState<"today" | "upcoming" | "all">("today");
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const { formatPrice } = useRegion();
  const { toast } = useToast();
  const { i18n } = useTranslation();

  const speakBooking = useCallback((booking: ServiceBooking) => {
    if (speakingId === booking.id) { stopSpeaking(); setSpeakingId(null); return; }
    const text = buildServiceSpeech(booking, i18n.language);
    speak(text, i18n.language, () => setSpeakingId(booking.id), () => setSpeakingId(null));
  }, [speakingId, i18n.language]);

  const today = new Date().toISOString().split("T")[0];

  const filtered = bookings.filter((b) => {
    if (filter === "today") return b.date === today;
    if (filter === "upcoming") return b.status === "upcoming" || b.status === "in_progress";
    return true;
  });

  const handleStart = (id: string) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "in_progress" as ServiceBookingStatus } : b)));
    toast({ title: "Session Started", description: "📹 Live session in progress" });
  };

  const handleComplete = (id: string) => {
    const booking = bookings.find(b => b.id === id);
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "completed" as ServiceBookingStatus } : b)));
    if (booking) {
      const gst = Math.round(booking.price * 0.18);
      createInvoice({
        orderId: booking.id,
        orderType: "service",
        customerName: booking.customerName,
        customerPhone: "",
        items: [{ name: booking.serviceName, qty: "1", amount: booking.price }],
        subtotal: booking.price,
        taxAmount: gst,
        deliveryFee: 0,
        packingCharges: 0,
        platformFee: 0,
        discount: 0,
        total: booking.price + gst,
      });
    }
    toast({ title: "Session Completed", description: "✅ Marked as completed" });
  };

  const handleCancel = (id: string) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "cancelled" as ServiceBookingStatus } : b)));
    toast({ title: "Session Cancelled", description: "Customer will be notified", variant: "destructive" });
  };

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2">
        {(["today", "upcoming", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f === "today" ? "Today" : f === "upcoming" ? "Upcoming" : "All"}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No service bookings found</p>
      )}

      {filtered.map((booking) => {
        const cat = serviceCategoryConfig[booking.serviceCategory];
        return (
          <Card key={booking.id} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg">{cat.emoji}</span>
                    <span className="font-bold text-sm text-foreground">{booking.serviceName}</span>
                    <Badge className={`text-[10px] ${statusColors[booking.status]}`}>
                      {booking.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>

                  {/* Category & mode */}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge className={`text-[10px] ${cat.color}`}>{cat.label}</Badge>
                    <Badge variant="outline" className="text-[10px] gap-1">
                      {booking.mode === "online" ? (
                        <><Video className="w-2.5 h-2.5" /> Online</>
                      ) : (
                        <><MapPin className="w-2.5 h-2.5" /> In-Person</>
                      )}
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="mt-2 space-y-0.5">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {booking.date} · {booking.time} · {booking.duration}
                    </p>
                    <p className="text-xs text-foreground font-medium">
                      👤 {booking.customerName}
                      {booking.studentsCount && booking.studentsCount > 1 && (
                        <span className="text-muted-foreground font-normal"> + {booking.studentsCount - 1} more</span>
                      )}
                    </p>
                    {booking.studentsCount && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" /> {booking.studentsCount} participant{booking.studentsCount > 1 ? "s" : ""}
                      </p>
                    )}
                    {booking.address && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {booking.address}
                      </p>
                    )}
                    {booking.notes && (
                      <p className="text-xs text-primary mt-1 italic">📝 {booking.notes}</p>
                    )}
                  </div>
                </div>

                {/* Right side */}
                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      size="sm" variant="ghost"
                      className={`h-8 w-8 p-0 ${speakingId === booking.id ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
                      onClick={() => speakBooking(booking)}
                      title={speakingId === booking.id ? "Stop reading" : "Read booking aloud"}
                    >
                      {speakingId === booking.id ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <p className="text-lg font-bold text-foreground">{formatPrice(booking.price)}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-2">
                    {booking.status === "upcoming" && (
                      <>
                        <Button size="sm" onClick={() => handleStart(booking.id)} className="text-xs gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Start
                        </Button>
                        {booking.meetingLink && (
                          <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="text-xs gap-1 w-full">
                              <ExternalLink className="w-3 h-3" /> Join Link
                            </Button>
                          </a>
                        )}
                        <Button
                          size="sm" variant="outline"
                          onClick={() => handleCancel(booking.id)}
                          className="text-xs text-destructive border-destructive/30"
                        >
                          <XCircle className="w-3 h-3" /> Cancel
                        </Button>
                      </>
                    )}
                    {booking.status === "in_progress" && (
                      <Button size="sm" onClick={() => handleComplete(booking.id)} className="text-xs gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Complete
                      </Button>
                    )}
                    {booking.status === "completed" && (
                      <Badge className="bg-muted text-muted-foreground text-[10px]">✅ Done</Badge>
                    )}
                    {booking.status === "cancelled" && (
                      <Badge className="bg-destructive/10 text-destructive text-[10px]">Cancelled</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ServiceBookingsTab;
