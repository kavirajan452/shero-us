import { useState } from "react";
import { MapPin, Bell, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NonServiceableAreaProps {
  detectedLocation?: string;
  zipCode?: string;
}

const NonServiceableArea = ({ detectedLocation, zipCode }: NonServiceableAreaProps) => {
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
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-serif font-bold text-foreground mb-2">You're on the list!</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          We'll send you a notification as soon as Shero Home Food launches in your area. Stay tuned!
        </p>
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
