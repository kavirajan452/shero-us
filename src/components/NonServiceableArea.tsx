import { useState } from "react";
import { MapPin, Bell, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NonServiceableAreaProps {
  detectedLocation?: string;
  zipCode?: string;
  /** When true, renders a compact inline form without the large icon/heading block */
  compact?: boolean;
}

const NonServiceableArea = ({ detectedLocation, zipCode, compact }: NonServiceableAreaProps) => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() && !phone.trim()) {
      toast({ title: "Please enter your email or phone number", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("area_leads").insert({
        email: email.trim() || null,
        phone: phone.trim() || null,
        detected_location: detectedLocation || null,
        zip_code: zipCode || null,
        source: "non_serviceable",
      });
      if (error) throw error;
      setSubmitted(true);
      toast({ title: "You're on the list! 🎉", description: "We'll notify you as soon as we launch in your area." });
    } catch {
      toast({ title: "Something went wrong", description: "Please try again later.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={`flex flex-col items-center justify-center text-center ${compact ? "py-4 px-2" : "py-12 px-6"}`}>
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <CheckCircle2 className="w-6 h-6 text-primary" />
        </div>
        <h2 className={`font-serif font-bold text-foreground mb-1 ${compact ? "text-base" : "text-xl"}`}>You're on the list!</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          We'll send you a notification as soon as Shero Home Food launches in your area. Stay tuned!
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">We're not in your area yet</p>
            {(detectedLocation || zipCode) && (
              <p className="text-xs text-muted-foreground">
                📍 {detectedLocation || zipCode}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">
              Leave your details — we'll notify you when we expand nearby!
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-2">
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl h-9 text-sm"
          />
          <p className="text-[10px] text-muted-foreground text-center">or</p>
          <Input
            type="tel"
            placeholder="Phone (e.g. 212-555-0100)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-xl h-9 text-sm"
            maxLength={14}
          />
          <Button type="submit" className="w-full rounded-xl gap-2 h-9" disabled={loading}>
            <Bell className="w-3.5 h-3.5" />
            {loading ? "Submitting..." : "Notify Me When Available"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
        <MapPin className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-serif font-bold text-foreground mb-2">
        We're not in your area yet
      </h2>
      {detectedLocation && (
        <p className="text-sm text-muted-foreground mb-1">
          📍 {detectedLocation}
        </p>
      )}
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        Shero Home Food is currently available in select US cities. Leave your details and we'll notify you when we expand to your neighborhood!
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">or</span>
        </div>
        <Input
          type="tel"
          placeholder="Phone number (e.g. 212-555-0100)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="rounded-xl"
          maxLength={14}
        />
        <Button type="submit" className="w-full rounded-xl gap-2" disabled={loading}>
          <Bell className="w-4 h-4" /> {loading ? "Submitting..." : "Notify Me When Available"}
        </Button>
      </form>
    </div>
  );
};

export default NonServiceableArea;
