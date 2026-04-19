import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Download, MessageCircle, Facebook, Copy, CheckCircle2 } from "lucide-react";
import { referralCode } from "@/data/partnerMockData";
import sheroLogo from "@/assets/shero-logo.png";

const partnerInfo = {
  name: "Chef Kamala Devi",
  sheroId: "SKID-TN-0042",
  phone: "+1 98XXX XX042",  // masked
  photo: "👩‍🍳",
  cuisines: ["South Indian", "Sweets"],
  rating: 4.7,
};

const DigitalVisitingCard = () => {
  const [copied, setCopied] = useState(false);

  const referralLink = `${window.location.origin}/welcome?ref=${referralCode}`;
  const shareText = `🍲 Join Shero — India's homefood platform!\n\nUse my referral code: ${referralCode}\nGet $500 in your wallet!\n\n${referralLink}`;

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
    canvas.width = 600;
    canvas.height = 340;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    const grad = ctx.createLinearGradient(0, 0, 600, 340);
    grad.addColorStop(0, "#1a1a2e");
    grad.addColorStop(1, "#16213e");
    ctx.fillStyle = grad;
    ctx.roundRect(0, 0, 600, 340, 16);
    ctx.fill();

    // Gold accent line
    ctx.fillStyle = "#D4A574";
    ctx.fillRect(0, 60, 600, 3);

    // Title
    ctx.fillStyle = "#D4A574";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SHERO BUSINESS PARTNER", 300, 40);

    // Partner info
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 28px serif";
    ctx.fillText(partnerInfo.name, 300, 110);

    ctx.fillStyle = "#D4A574";
    ctx.font = "16px sans-serif";
    ctx.fillText(partnerInfo.sheroId, 300, 140);

    ctx.fillStyle = "#AAAAAA";
    ctx.font = "14px sans-serif";
    ctx.fillText(partnerInfo.phone, 300, 165);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "13px sans-serif";
    ctx.fillText(partnerInfo.cuisines.join(" • "), 300, 195);

    // QR placeholder label
    ctx.fillStyle = "#D4A574";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("SCAN TO JOIN & GET $500", 300, 235);

    // Referral code
    ctx.strokeStyle = "#D4A574";
    ctx.lineWidth = 2;
    ctx.roundRect(180, 250, 240, 36, 8);
    ctx.stroke();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 16px monospace";
    ctx.fillText(referralCode, 300, 275);

    // Footer
    ctx.fillStyle = "#666666";
    ctx.font = "11px sans-serif";
    ctx.fillText("www.sherohome.com", 300, 320);

    const link = document.createElement("a");
    link.download = `shero-card-${partnerInfo.sheroId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <Card className="border-border overflow-hidden">
      <CardContent className="p-0">
        {/* Card Preview */}
        <div className="bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--muted))] p-6">
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl p-6 text-center max-w-md mx-auto shadow-xl">
            <p className="text-xs font-bold tracking-[3px] text-[#D4A574] mb-1">SHERO BUSINESS PARTNER</p>
            <div className="w-full h-[2px] bg-[#D4A574]/40 mb-4" />

            <div className="text-5xl mb-2">{partnerInfo.photo}</div>
            <h3 className="text-xl font-serif font-bold text-white">{partnerInfo.name}</h3>
            <p className="text-[#D4A574] text-sm font-medium mt-1">{partnerInfo.sheroId}</p>
            <p className="text-white/50 text-xs mt-1">{partnerInfo.phone}</p>
            <p className="text-white/70 text-xs mt-2">{partnerInfo.cuisines.join(" • ")}</p>

            <div className="mt-4 pt-3 border-t border-white/10">
              <p className="text-[10px] text-[#D4A574] font-bold tracking-wider mb-1">SCAN TO JOIN & GET $500</p>
              {/* QR placeholder */}
              <div className="w-20 h-20 mx-auto bg-white rounded-lg flex items-center justify-center">
                <div className="grid grid-cols-5 gap-[2px]">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className={`w-3 h-3 ${[0, 1, 3, 4, 5, 9, 10, 14, 15, 19, 20, 21, 23, 24].includes(i) ? "bg-[#1a1a2e]" : "bg-white"}`} />
                  ))}
                </div>
              </div>
              <div className="mt-2 inline-block border border-[#D4A574]/40 rounded-lg px-4 py-1.5">
                <span className="text-white font-mono font-bold text-sm tracking-wider">{referralCode}</span>
              </div>
            </div>

            <p className="text-white/30 text-[10px] mt-3">www.sherohome.com</p>
          </div>
        </div>

        {/* Share Actions */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground text-sm">Share Your Card</h4>
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
              $500 per referral
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={shareWhatsApp}>
              <MessageCircle className="w-4 h-4 text-green-600" /> WhatsApp
            </Button>
            <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={shareFacebook}>
              <Facebook className="w-4 h-4 text-blue-600" /> Facebook
            </Button>
            <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={copyLink}>
              {copied ? <CheckCircle2 className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={downloadCard}>
              <Download className="w-4 h-4" /> Download
            </Button>
          </div>

          <p className="text-[10px] text-muted-foreground text-center">
            Anyone who joins using your code gets $500 in their Shero Wallet!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DigitalVisitingCard;
