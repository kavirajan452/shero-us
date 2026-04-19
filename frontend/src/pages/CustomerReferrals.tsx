import { useState } from "react";
import { ArrowLeft, Gift, Share2, Users, Copy, CheckCircle2, MessageCircle, Smartphone, Sparkles, Trophy, Wallet, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import WalletSection from "@/components/WalletSection";
import SpinWheel from "@/components/SpinWheel";
import { useWallet } from "@/contexts/WalletContext";
import { useRegion } from "@/contexts/RegionContext";
import mascotGreeting from "@/assets/shero-mascot-greeting.png";

const CustomerReferrals = () => {
  const {
    balance, customerReferralCode, customerReferrals, referralStats,
    addCustomerReferral, verifyCustomerReferral, addSpinReward, totalSpinWinnings,
    totalReferralEarnings, earningCap,
  } = useWallet();
  const { formatPrice } = useRegion();

  const [copied, setCopied] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [friendName, setFriendName] = useState("");
  const [friendPhone, setFriendPhone] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [currentReferralId, setCurrentReferralId] = useState("");
  const [showSpin, setShowSpin] = useState(false);
  const [spinFriendName, setSpinFriendName] = useState("");
  const [spinReferralId, setSpinReferralId] = useState("");
  const [inviteError, setInviteError] = useState("");

  const referralLink = `${window.location.origin}/welcome?ref=${customerReferralCode}`;
  const shareText = `🍲 I love Shero home food! Join using my code ${customerReferralCode} and spin to win wallet rewards! 🎁\n\n${referralLink}`;
  const capReached = totalReferralEarnings >= earningCap;

  const copyCode = () => {
    navigator.clipboard.writeText(customerReferralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const handleInvite = async () => {
    setInviteError("");
    if (!friendName.trim() || friendName.trim().length < 2) {
      setInviteError("Please enter a valid name");
      return;
    }
    if (!friendPhone.trim() || friendPhone.trim().length < 10) {
      setInviteError("Please enter a valid 10-digit phone number");
      return;
    }
    const exists = customerReferrals.some((r) => r.friendPhone === friendPhone.trim());
    if (exists) {
      setInviteError("This number has already been referred!");
      return;
    }
    const id = await addCustomerReferral(friendName.trim(), friendPhone.trim());
    if (!id) {
      setInviteError("Could not create referral. Please try again.");
      return;
    }
    setCurrentReferralId(id);
    setOtpStep(true);
  };

  const handleVerifyOtp = () => {
    if (otp.length < 4) return;
    verifyCustomerReferral(currentReferralId);

    setSpinFriendName(friendName);
    setSpinReferralId(currentReferralId);
    setShowInvite(false);
    setOtpStep(false);
    setFriendName("");
    setFriendPhone("");
    setOtp("");

    setTimeout(() => setShowSpin(true), 500);
  };

  const handleSpinReward = (amount: number) => {
    addSpinReward(spinReferralId, amount);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      invited: { label: "Invited", variant: "outline" },
      otp_verified: { label: "✓ Verified", variant: "default" },
      first_order: { label: "🎉 Ordered", variant: "default" },
      expired: { label: "Expired", variant: "destructive" },
    };
    const cfg = map[status] || map.invited;
    return <Badge variant={cfg.variant} className="text-[10px]">{cfg.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-28 container mx-auto px-4 max-w-lg">
        <Link to="/customer" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </Link>

        {/* Hero Banner */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 overflow-hidden mb-6">
          <CardContent className="pt-6 pb-5 text-center">
            <img src={mascotGreeting} alt="Shero mascot" className="w-16 h-16 object-contain mx-auto mb-2 drop-shadow-md" />
            <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
              Refer Friends, <span className="text-primary">Spin & Win!</span>
            </h1>
            <p className="text-sm text-muted-foreground mb-4">
              Invite friends to Shero. Every verified referral gets a
              <span className="font-bold text-primary"> Spin Wheel reward</span> ($10 to $500)!
            </p>

            {/* Earning cap progress */}
            <div className="bg-card/80 rounded-xl p-3 border border-border mb-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Total Referral Earnings</span>
                <span className="font-semibold text-foreground">{formatPrice(totalReferralEarnings)} / {formatPrice(earningCap)}</span>
              </div>
              <Progress value={Math.min((totalReferralEarnings / earningCap) * 100, 100)} className="h-2" />
              {capReached && (
                <p className="text-[10px] text-destructive mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Maximum earning cap reached
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-card/80 rounded-xl p-3 border border-border">
                <p className="text-xl font-bold text-foreground">{referralStats.total}</p>
                <p className="text-[10px] text-muted-foreground">Invited</p>
              </div>
              <div className="bg-card/80 rounded-xl p-3 border border-border">
                <p className="text-xl font-bold text-primary">{referralStats.verified}</p>
                <p className="text-[10px] text-muted-foreground">Verified</p>
              </div>
              <div className="bg-card/80 rounded-xl p-3 border border-border">
                <p className="text-xl font-bold text-primary">{formatPrice(referralStats.earned)}</p>
                <p className="text-[10px] text-muted-foreground">Earned</p>
              </div>
            </div>

            {totalSpinWinnings > 0 && (
              <div className="flex items-center justify-center gap-2 text-xs text-primary font-medium mb-3">
                <Trophy className="w-4 h-4" />
                Total spin winnings: {formatPrice(totalSpinWinnings)}
              </div>
            )}

            <Button onClick={() => setShowInvite(true)} className="w-full gap-2" size="lg" disabled={capReached}>
              <Gift className="w-5 h-5" /> {capReached ? "Earning Cap Reached" : "Invite a Friend"}
            </Button>
          </CardContent>
        </Card>

        {/* Your Referral Code */}
        <Card className="border-border mb-5">
          <CardContent className="pt-5 pb-4">
            <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-primary" /> Your Referral Code
            </h3>
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3 border border-border mb-3">
              <span className="text-lg font-mono font-bold text-foreground flex-1 tracking-wider">{customerReferralCode || "Sign in to get code"}</span>
              {customerReferralCode && (
                <Button variant="ghost" size="sm" onClick={copyCode} className="gap-1 text-xs">
                  {copied ? <CheckCircle2 className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={shareWhatsApp}>
                <MessageCircle className="w-4 h-4 text-green-600" /> WhatsApp
              </Button>
              <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={copyCode}>
                <Copy className="w-4 h-4" /> Copy Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="border-border mb-5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { step: "1", emoji: "📱", title: "Invite a Friend", desc: "Share your code or invite directly with their phone number" },
                { step: "2", emoji: "🔐", title: "They Verify via OTP", desc: "Friend signs up with unique phone & verifies — ensures genuine new user" },
                { step: "3", emoji: "🎰", title: "Spin the Wheel!", desc: "Win $10 to $500 per referral — every verified friend gets you a spin!" },
                { step: "4", emoji: "⏳", title: "Use Within 90 Days", desc: "Wallet credits expire 90 days after earning. Spend before they expire!" },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-lg shrink-0">
                    {item.emoji}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Referral History */}
        {customerReferrals.length > 0 && (
          <Card className="border-border mb-5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Your Referrals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {customerReferrals.map((ref) => (
                <div key={ref.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm">
                    👤
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{ref.friendName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(ref.invitedAt).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                      {ref.spinDone && ` · 🎰 Won $${ref.spinAmount || 0}`}
                    </p>
                  </div>
                  {statusBadge(ref.status)}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Wallet */}
        <div className="mb-5">
          <h3 className="text-lg font-serif font-bold text-foreground mb-3 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" /> My Wallet
          </h3>
          <WalletSection variant="customer" />
        </div>
      </main>

      {/* Invite Dialog */}
      <Dialog open={showInvite} onOpenChange={(o) => { if (!o) { setShowInvite(false); setOtpStep(false); setInviteError(""); } }}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              {otpStep ? "Verify Friend's Phone" : "Invite a Friend"}
            </DialogTitle>
          </DialogHeader>

          {!otpStep ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter your friend's details. They'll get an OTP to verify they're a genuine new user.
              </p>
              <Input
                placeholder="Friend's name"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                maxLength={50}
              />
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-muted rounded-l-md border border-r-0 border-border text-sm text-muted-foreground">+1</span>
                <Input
                  placeholder="10-digit phone"
                  value={friendPhone}
                  onChange={(e) => setFriendPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  type="tel"
                  maxLength={10}
                  className="rounded-l-none"
                />
              </div>
              {inviteError && (
                <p className="text-xs text-destructive">{inviteError}</p>
              )}
              <Button onClick={handleInvite} className="w-full gap-2" disabled={!friendName.trim() || friendPhone.length < 10}>
                <Smartphone className="w-4 h-4" /> Send OTP to Friend
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                An OTP has been sent to <span className="font-semibold text-foreground">+1 {friendPhone}</span>.
                Ask {friendName} to share the code with you.
              </p>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">Demo: Enter any 4-digit code</p>
                <Input
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="text-center text-2xl tracking-[12px] font-bold"
                  maxLength={6}
                />
              </div>
              <Button onClick={handleVerifyOtp} className="w-full gap-2" disabled={otp.length < 4}>
                <CheckCircle2 className="w-4 h-4" /> Verify & Spin!
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Spin Wheel */}
      <SpinWheel
        open={showSpin}
        onClose={() => setShowSpin(false)}
        onReward={handleSpinReward}
        friendName={spinFriendName}
      />

      <BottomNav />
    </div>
  );
};

export default CustomerReferrals;
