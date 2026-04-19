import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Download, MessageCircle, Facebook, Copy, CheckCircle2, ArrowLeft, Sparkles, Heart, Users, Gift, Camera, ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { referralCode, referralStats } from "@/data/partnerMockData";
import { useRegion } from "@/contexts/RegionContext";
import WalletSection from "@/components/WalletSection";

const partnerInfo = {
  name: "Kamala Devi",
  title: "Shero Business Partner",
  phone: "+1 98XXX XX042",
  address: "Shero HQ, New York",
  photo: "", // placeholder — picked from profile
  cuisines: ["South Indian", "Sweets"],
  rating: 4.7,
  joinedDate: "Aug 2025",
};

const PartnerVisitingCard = () => {
  const [copied, setCopied] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { formatPrice } = useRegion();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
    }
  };

  const referralLink = `${window.location.origin}/welcome?ref=${referralCode}`;
  const shareText = `🌟 I'm a proud Shero Business Partner! 🍲\n\nI cook homemade food with love and deliver it through Shero — India's #1 home food platform.\n\n🎁 Use my referral code "${referralCode}" to join Shero and get $500 in your wallet!\n\n✨ Whether you want to ORDER delicious homemade food or BECOME a home chef yourself — Shero is for you!\n\nJoin now 👇\n${referralLink}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(shareText)}`, "_blank");
  };

  const downloadCard = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 700;
    canvas.height = 420;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 700, 420);
    grad.addColorStop(0, "#1a1a2e");
    grad.addColorStop(0.5, "#16213e");
    grad.addColorStop(1, "#0f3460");
    ctx.fillStyle = grad;
    ctx.roundRect(0, 0, 700, 420, 20);
    ctx.fill();

    // Gold border
    ctx.strokeStyle = "#D4A574";
    ctx.lineWidth = 3;
    ctx.roundRect(8, 8, 684, 404, 16);
    ctx.stroke();

    // Inner decorative border
    ctx.strokeStyle = "#D4A574";
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.roundRect(16, 16, 668, 388, 12);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Title
    ctx.fillStyle = "#D4A574";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.letterSpacing = "4px";
    ctx.fillText("✦  SHERO BUSINESS PARTNER  ✦", 350, 50);

    // Accent line
    ctx.fillStyle = "#D4A574";
    ctx.fillRect(200, 62, 300, 1.5);

    // Partner name
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 32px serif";
    ctx.fillText(partnerInfo.name, 350, 115);

    // Title
    ctx.fillStyle = "#D4A574";
    ctx.font = "600 14px sans-serif";
    ctx.fillText(partnerInfo.title, 350, 145);

    // Contact
    ctx.fillStyle = "#888888";
    ctx.font = "14px sans-serif";
    ctx.fillText(partnerInfo.phone, 350, 172);

    // Address
    ctx.fillStyle = "#AAAAAA";
    ctx.font = "13px sans-serif";
    ctx.fillText("Office: " + partnerInfo.address, 350, 198);

    // Divider
    ctx.fillStyle = "#D4A574";
    ctx.globalAlpha = 0.3;
    ctx.fillRect(150, 218, 400, 1);
    ctx.globalAlpha = 1;

    // Referral section
    ctx.fillStyle = "#D4A574";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("SCAN TO JOIN AS A PARTNER OR CUSTOMER & GET $500", 350, 248);

    // Code box
    ctx.strokeStyle = "#D4A574";
    ctx.lineWidth = 2;
    ctx.roundRect(250, 260, 200, 42, 10);
    ctx.stroke();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 20px monospace";
    ctx.fillText(referralCode, 350, 288);

    // Tagline
    ctx.fillStyle = "#AAAAAA";
    ctx.font = "italic 12px serif";
    ctx.fillText('"Home food made with love, delivered with pride"', 350, 340);

    // Footer
    ctx.fillStyle = "#555555";
    ctx.font = "11px sans-serif";
    ctx.fillText("www.sherohome.com  |  India's #1 Home Food Platform", 350, 380);

    const link = document.createElement("a");
    link.download = `shero-visiting-card-${partnerInfo.name.replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Intro Section */}
      <div className="text-center">
        <div className="text-5xl mb-3">🌟</div>
        <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
          You're a <span className="text-primary">Shero Partner!</span>
        </h2>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          Be proud of who you are — a Shero Business Partner. You're not just cooking food, 
          you're building an empire from your kitchen. Share your joy with friends and family!
        </p>
      </div>

      {/* Motivational Card */}
      <Card className="border-border bg-card border-l-4 border-l-primary">
        <CardContent className="pt-6 pb-5">
          <div className="flex items-start gap-3 mb-4">
            <Heart className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground text-sm mb-1">Share the Love, Share the Opportunity</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When you share your visiting card, amazing things happen:
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-card/80 rounded-xl p-3 border border-border text-center">
              <div className="text-2xl mb-1">🍽️</div>
              <p className="text-xs font-semibold text-foreground">Friends Order Food</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">They get <span className="font-bold text-accent">$500</span> in wallet to try your food!</p>
            </div>
            <div className="bg-card/80 rounded-xl p-3 border border-border text-center">
              <div className="text-2xl mb-1">👩‍🍳</div>
              <p className="text-xs font-semibold text-foreground">Family Joins as Chefs</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">You earn <span className="font-bold text-accent">$2,250</span> per partner referral!</p>
            </div>
            <div className="bg-card/80 rounded-xl p-3 border border-border text-center">
              <div className="text-2xl mb-1">💰</div>
              <p className="text-xs font-semibold text-foreground">Everyone Wins</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">New partners get <span className="font-bold text-accent">$500</span> signup bonus in first PPP!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Digital Visiting Card */}
      <Card className="border-border overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--muted))] p-6">
            <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-2xl p-6 text-center max-w-md mx-auto shadow-xl relative overflow-hidden">
              {/* Decorative corners */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#D4A574]/50 rounded-tl-lg" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#D4A574]/50 rounded-tr-lg" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#D4A574]/50 rounded-bl-lg" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#D4A574]/50 rounded-br-lg" />

              <p className="text-[10px] font-bold tracking-[4px] text-[#D4A574] mb-1">✦ SHERO BUSINESS PARTNER ✦</p>
              <div className="w-24 h-[1.5px] bg-[#D4A574]/40 mx-auto mb-4" />

              {/* Photo */}
              <div className="relative w-44 h-44 mx-auto mb-4">
                <div className="w-44 h-44 rounded-full bg-white/10 border-3 border-[#D4A574]/50 flex items-center justify-center overflow-hidden">
                  {photoUrl ? (
                    <img src={photoUrl} alt={partnerInfo.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-6xl">👩‍🍳</span>
                  )}
                </div>
                <div className="absolute -bottom-1 right-2 flex gap-1.5">
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-8 h-8 rounded-full bg-[#D4A574] flex items-center justify-center shadow-lg"
                    title="Take selfie"
                  >
                    <Camera className="w-4 h-4 text-[#1a1a2e]" />
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-8 h-8 rounded-full bg-[#D4A574] flex items-center justify-center shadow-lg"
                    title="Choose from album"
                  >
                    <ImageIcon className="w-4 h-4 text-[#1a1a2e]" />
                  </button>
                </div>
                <input ref={cameraInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handlePhotoUpload} />
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>

              <h3 className="text-xl font-serif font-bold text-white">{partnerInfo.name}</h3>
              <p className="text-[#D4A574] text-sm font-semibold tracking-wide mt-1">{partnerInfo.title}</p>
              <p className="text-white/50 text-xs mt-1.5">{partnerInfo.phone}</p>
              <p className="text-white/40 text-xs mt-1">Office: {partnerInfo.address}</p>

              <div className="w-48 h-[1px] bg-[#D4A574]/20 mx-auto mt-4 mb-3" />

              <p className="text-[9px] text-[#D4A574] font-bold tracking-wider mb-2">SCAN TO JOIN AS A PARTNER OR CUSTOMER & GET $500</p>
              
              {/* QR placeholder */}
              <div className="w-20 h-20 mx-auto bg-white rounded-lg flex items-center justify-center mb-2">
                <div className="grid grid-cols-5 gap-[2px]">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className={`w-3 h-3 ${[0, 1, 3, 4, 5, 9, 10, 14, 15, 19, 20, 21, 23, 24].includes(i) ? "bg-[#1a1a2e]" : "bg-white"}`} />
                  ))}
                </div>
              </div>

              <div className="inline-block border border-[#D4A574]/40 rounded-lg px-5 py-2">
                <span className="text-white font-mono font-bold text-base tracking-[3px]">{referralCode}</span>
              </div>

              <p className="text-white/20 text-[9px] mt-3 italic font-serif">"Home food made with love, delivered with pride"</p>
              <p className="text-white/30 text-[9px] mt-2">www.sherohome.com</p>
            </div>
          </div>

          {/* Share Actions */}
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground text-sm">Share Your Visiting Card</h4>
              <Badge variant="outline" className="text-[10px] border-accent/30 text-accent">
                $500 per referral
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="gap-2 text-xs h-10" onClick={shareWhatsApp}>
                <MessageCircle className="w-4 h-4 text-green-600" /> WhatsApp
              </Button>
              <Button variant="outline" size="sm" className="gap-2 text-xs h-10" onClick={shareFacebook}>
                <Facebook className="w-4 h-4 text-blue-600" /> Facebook
              </Button>
              <Button variant="outline" size="sm" className="gap-2 text-xs h-10" onClick={copyLink}>
                {copied ? <CheckCircle2 className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
              <Button variant="outline" size="sm" className="gap-2 text-xs h-10" onClick={downloadCard}>
                <Download className="w-4 h-4" /> Download Card
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Stats */}
      <Card className="border-border">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground text-sm">Your Referral Impact</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center bg-card rounded-xl p-3 border border-border border-l-4 border-l-emerald-500">
              <p className="text-lg font-bold text-foreground">{referralStats.totalReferred}</p>
              <p className="text-[10px] text-muted-foreground">Referred</p>
            </div>
            <div className="text-center bg-card rounded-xl p-3 border border-border border-l-4 border-l-blue-500">
              <p className="text-lg font-bold text-foreground">{referralStats.listed + referralStats.active}</p>
              <p className="text-[10px] text-muted-foreground">Joined</p>
            </div>
            <div className="text-center bg-card rounded-xl p-3 border border-border border-l-4 border-l-amber-500">
              <p className="text-lg font-bold text-primary">{formatPrice(referralStats.totalEarned)}</p>
              <p className="text-[10px] text-muted-foreground">Earned</p>
            </div>
          </div>
          <Link to="/partner/referrals">
            <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
              <Gift className="w-4 h-4" /> View All Referrals
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Wallet */}
      <div>
        <h3 className="text-lg font-serif font-bold text-foreground mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" /> My Wallet
        </h3>
        <WalletSection variant="partner" />
      </div>
    </div>
  );
};

export default PartnerVisitingCard;
