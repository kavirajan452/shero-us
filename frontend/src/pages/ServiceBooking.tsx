import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { useRegion } from "@/contexts/RegionContext";
import { cookeryClasses, cookeryInstructors, cuisineCategories } from "@/data/cookeryData";
import { ArrowLeft, CalendarDays, Clock, MapPin, Phone, User, Star, BadgeCheck, Check, Info } from "lucide-react";

const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
];

const modeOptions = [
  { id: "online", label: "💻 Online Live (Zoom/Meet)", description: "Live virtual class with real-time interaction" },
  { id: "offline", label: "🏠 At Instructor's Kitchen", description: "In-person hands-on class" },
  { id: "home", label: "🏡 At Your Home", description: "Instructor visits your kitchen" },
];

const ServiceBooking = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { formatPrice, region, calcTax } = useRegion();
  const navigate = useNavigate();

  const cls = cookeryClasses.find((c) => c.id === serviceId);
  const cuisine = cls ? cuisineCategories.find((c) => c.id === cls.cuisineId) : null;
  const instructors = cls ? cookeryInstructors.filter((i) => i.cuisineIds.includes(cls.cuisineId)).slice(0, 4) : [];

  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedMode, setSelectedMode] = useState("offline");
  const [selectedInstructor, setSelectedInstructor] = useState<string | null>(null);
  const [participants, setParticipants] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const price = cls ? (region.code === "IN" ? cls.priceIN : cls.priceUS) : 0;
  const subtotal = price * participants;
  const tax = calcTax(subtotal);
  const total = subtotal + tax + region.platformFee;

  const dates = useMemo(() => {
    const result: { label: string; value: string; day: string }[] = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      result.push({
        label: d.toLocaleDateString(region.locale, { month: "short", day: "numeric" }),
        value: d.toISOString().split("T")[0],
        day: d.toLocaleDateString(region.locale, { weekday: "short" }),
      });
    }
    return result;
  }, [region.locale]);

  const canStep0 = selectedDate && selectedTime && selectedMode;
  const canStep1 = name.trim() && phone.trim().length >= region.phoneMaxLength;

  const handleBook = () => navigate("/order-confirmation");

  if (!cls || !cuisine) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-24 container mx-auto px-4 text-center">
          <p className="text-muted-foreground">Class not found</p>
          <Link to="/services" className="text-primary font-semibold hover:underline mt-4 inline-block">← Back to Cookery Classes</Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  const steps = ["Schedule", "Your Details", "Confirm"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-28 container mx-auto px-4 max-w-2xl">
        <Link to={`/services/detail/${cls.id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Class
        </Link>

        {/* Class summary */}
        <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl mb-5">
          <img src={cls.image} alt={cls.name} className="w-14 h-14 rounded-lg object-cover" />
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-foreground truncate">{cls.name}</h2>
            <p className="text-xs text-muted-foreground">{cuisine.icon} {cuisine.name} · {cls.duration}</p>
          </div>
          <span className="text-base font-bold text-foreground">{formatPrice(price)}</span>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-1 mb-6">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 transition-colors ${
                i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-primary text-primary-foreground ring-2 ring-primary/30" : "bg-secondary text-muted-foreground"
              }`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-1 rounded ${i < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {/* Step 0: Schedule */}
        {step === 0 && (
          <section className="space-y-5">
            {/* Date */}
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <CalendarDays className="w-4 h-4 text-primary" /> Select Date
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {dates.map((d) => (
                  <button key={d.value} onClick={() => setSelectedDate(d.value)} className={`flex flex-col items-center px-4 py-3 rounded-xl border shrink-0 transition-colors ${
                    selectedDate === d.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                  }`}>
                    <span className="text-xs text-muted-foreground">{d.day}</span>
                    <span className={`text-sm font-semibold ${selectedDate === d.value ? "text-primary" : "text-foreground"}`}>{d.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time */}
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-primary" /> Select Time
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((t) => (
                  <button key={t} onClick={() => setSelectedTime(t)} className={`px-2 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    selectedTime === t ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground border border-transparent hover:border-primary/30"
                  }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Class Mode</h3>
              <div className="space-y-2">
                {modeOptions.map((opt) => (
                  <button key={opt.id} onClick={() => setSelectedMode(opt.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                    selectedMode === opt.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                  }`}>
                    <span className="text-lg">{opt.label.split(" ")[0]}</span>
                    <div>
                      <span className={`text-sm font-medium ${selectedMode === opt.id ? "text-primary" : "text-foreground"}`}>{opt.label.split(" ").slice(1).join(" ")}</span>
                      <p className="text-xs text-muted-foreground">{opt.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Participants */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Number of Participants</h3>
              <div className="flex items-center gap-3">
                <button onClick={() => setParticipants(Math.max(1, participants - 1))} className="w-9 h-9 rounded-lg bg-secondary text-foreground font-bold text-lg flex items-center justify-center">−</button>
                <span className="text-lg font-bold text-foreground w-8 text-center">{participants}</span>
                <button onClick={() => setParticipants(Math.min(10, participants + 1))} className="w-9 h-9 rounded-lg bg-secondary text-foreground font-bold text-lg flex items-center justify-center">+</button>
                <span className="text-sm text-muted-foreground ml-2">{formatPrice(price)} × {participants} = {formatPrice(subtotal)}</span>
              </div>
            </div>

            {/* Instructor */}
            {instructors.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Prefer an Instructor? (Optional)</h3>
                <div className="space-y-2">
                  {instructors.map((inst) => (
                    <button key={inst.id} onClick={() => setSelectedInstructor(selectedInstructor === inst.id ? null : inst.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                      selectedInstructor === inst.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    }`}>
                      <img src={inst.avatar} alt={inst.name} className="w-10 h-10 rounded-full object-cover" />
                      <div className="flex-1 text-left">
                        <span className="text-sm font-medium text-foreground flex items-center gap-1">
                          {inst.name} {inst.verified && <BadgeCheck className="w-3.5 h-3.5 text-primary" />}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 inline" /> {inst.rating} · {inst.students.toLocaleString()} students
                        </span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedInstructor === inst.id ? "border-primary bg-primary" : "border-border"
                      }`}>
                        {selectedInstructor === inst.id && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => setStep(1)} disabled={!canStep0} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
              Continue
            </button>
          </section>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Your Details</h3>
            <div className="space-y-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Full Name" className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <div className="flex">
                  <span className="flex items-center pl-10 pr-2 py-3 bg-background border border-r-0 border-border rounded-l-xl text-sm text-muted-foreground">{region.phonePrefix}</span>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder={region.phonePlaceholder} maxLength={region.phoneMaxLength} className="w-full pr-4 py-3 rounded-r-xl bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              {selectedMode !== "online" && (
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                  <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder={selectedMode === "home" ? "Your address (instructor will visit)" : "Will be shared after booking"} rows={2} className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none" />
                </div>
              )}
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any dietary restrictions or special requests? (optional)" rows={2} className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-secondary transition-colors">Back</button>
              <button onClick={() => setStep(2)} disabled={!canStep1} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">Review Booking</button>
            </div>
          </section>
        )}

        {/* Step 2: Summary */}
        {step === 2 && (
          <section className="space-y-5">
            <h3 className="text-lg font-semibold text-foreground">Booking Summary</h3>

            <div className="bg-card border border-border rounded-2xl p-5 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Class</span><span className="text-foreground font-medium text-right max-w-[60%]">{cls.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Cuisine</span><span className="text-foreground font-medium">{cuisine.icon} {cuisine.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="text-foreground font-medium">{selectedDate}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="text-foreground font-medium">{selectedTime}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="text-foreground font-medium">{cls.duration}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Mode</span><span className="text-foreground font-medium">{modeOptions.find((m) => m.id === selectedMode)?.label}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Participants</span><span className="text-foreground font-medium">{participants}</span></div>
              {selectedInstructor && <div className="flex justify-between"><span className="text-muted-foreground">Instructor</span><span className="text-foreground font-medium">{instructors.find((i) => i.id === selectedInstructor)?.name}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="text-foreground font-medium">{name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="text-foreground font-medium">{region.phonePrefix} {phone}</span></div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
              <h4 className="font-semibold text-foreground mb-3">Payment Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Class Fee ({participants} × {formatPrice(price)})</span><span className="text-foreground">{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{region.taxLabel}</span><span className="text-foreground">{formatPrice(tax)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Platform Fee</span><span className="text-foreground">{formatPrice(region.platformFee)}</span></div>
                <div className="border-t border-border pt-2 flex justify-between font-bold text-base">
                  <span className="text-foreground">Total</span><span className="text-foreground">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <div className="bg-accent/30 border border-accent rounded-xl p-3 text-xs text-accent-foreground flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Free rescheduling up to 24 hours before the class. Cancellation with full refund available up to 48 hours prior.</span>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-secondary transition-colors">Edit</button>
              <button onClick={handleBook} className="flex-1 py-4 rounded-xl bg-gradient-shero text-primary-foreground font-semibold hover:opacity-90 transition-opacity shadow-shero">
                Confirm & Pay — {formatPrice(total)}
              </button>
            </div>
          </section>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default ServiceBooking;
