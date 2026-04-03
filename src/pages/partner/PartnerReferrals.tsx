import { useState } from "react";
import { Copy, CheckCircle2, Share2, Users, Gift, TrendingUp, Crown, MessageCircle, Facebook, Instagram, Award, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRegion } from "@/contexts/RegionContext";
import {
  referralCode, referralMilestones, referralStats, referralHistory,
  REFERRAL_MILESTONE_1, REFERRAL_MILESTONE_2, REFERRAL_TOTAL_PER_PERSON,
} from "@/data/partnerMockData";

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-800 border-green-300",
  onboarded: "bg-blue-100 text-blue-800 border-blue-300",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
  under_review: "bg-purple-100 text-purple-800 border-purple-300",
  paid: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

const enrollmentStatusLabels: Record<string, string> = {
  new: "Application Submitted",
  video_watched: "Video Watched",
  payment_pending: "Payment Pending",
  paid: "Paid — Under Review",
  approved: "Approved ✅",
  rejected: "Rejected ❌",
  thinking: "Thinking",
  not_interested: "Not Interested",
};

const PartnerReferrals = () => {
  const { toast } = useToast();
  const { formatPrice } = useRegion();
  const [copied, setCopied] = useState(false);

  const referralLink = `${window.location.origin}/partner-enrollment?ref=${referralCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast({ title: "Copied!", description: "Referral code copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(
      `🍳 Join Shero – Cook from home & earn!\n\nI'm earning as a Shero Kitchen Partner and you can too. Use my referral code: ${referralCode}\n\nSign up here: ${referralLink}\n\n🎥 Watch how it works and start your journey today!`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent(referralLink);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  };

  const shareToInstagram = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: "Link Copied!", description: "Paste this link in your Instagram bio or story" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-foreground">Refer & Earn</h2>
        <p className="text-xs text-muted-foreground mt-1">Invite friends to join Shero and earn up to {formatPrice(REFERRAL_TOTAL_PER_PERSON)} per referral</p>
      </div>

      {/* Referral Code + Share */}
      <Card className="border-border bg-card border-l-4 border-l-primary">
        <CardContent className="pt-5 pb-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Your Referral Code</p>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold font-mono text-foreground tracking-wider">{referralCode}</span>
            <Button variant="outline" size="sm" onClick={copyCode} className="gap-1.5">
              {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mb-3">Share on your social groups — earn {formatPrice(REFERRAL_MILESTONE_1)} when they're listed + {formatPrice(REFERRAL_MILESTONE_2)} when they go active!</p>

          <div className="flex flex-wrap gap-2">
            <Button onClick={shareToWhatsApp} className="gap-2 bg-[#25D366] hover:bg-[#1da851] text-white">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </Button>
            <Button onClick={shareToFacebook} className="gap-2 bg-[#1877F2] hover:bg-[#0d65d9] text-white">
              <Facebook className="w-4 h-4" /> Facebook
            </Button>
            <Button onClick={shareToInstagram} className="gap-2 bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white hover:opacity-90">
              <Instagram className="w-4 h-4" /> Instagram
            </Button>
            <Button variant="outline" onClick={() => {
              navigator.clipboard.writeText(referralLink);
              toast({ title: "Link Copied!", description: "Share this link anywhere" });
            }} className="gap-2">
              <Share2 className="w-4 h-4" /> Copy Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Referred", value: referralStats.totalReferred, icon: Users, color: "text-primary", accent: "border-l-emerald-500" },
          { label: "Listed", value: referralStats.listed, icon: CheckCircle2, color: "text-primary", accent: "border-l-blue-500" },
          { label: "Active", value: referralStats.active, icon: TrendingUp, color: "text-primary", accent: "border-l-green-500" },
          { label: "Total Earned", value: formatPrice(referralStats.totalEarned), icon: Gift, color: "text-primary", accent: "border-l-amber-500" },
        ].map((s) => (
          <Card key={s.label} className={`border-border bg-card border-l-4 ${s.accent}`}>
            <CardContent className="pt-3 pb-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                <span className="text-[10px] text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-lg font-bold text-foreground">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reward Milestones */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Reward Milestones
          </CardTitle>
          <CardDescription>Earn rewards at two milestones for each person you refer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Milestone 1 */}
            <div className="flex-1 rounded-xl border border-border bg-card border-l-4 border-l-blue-500 p-5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-700 dark:text-blue-300">1</span>
                </div>
                <Badge className="text-[10px] bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-300">Listed</Badge>
              </div>
              <p className="text-2xl font-bold text-foreground mt-2">{formatPrice(REFERRAL_MILESTONE_1)}</p>
              <p className="text-xs text-muted-foreground mt-1">When your referral is approved as a Shero partner</p>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-2 font-medium">✓ {referralStats.listed} referrals listed = {formatPrice(referralStats.listedRewardsEarned)}</p>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center sm:py-0 py-1">
              <ArrowRight className="w-5 h-5 text-muted-foreground sm:block hidden" />
              <ArrowRight className="w-5 h-5 text-muted-foreground sm:hidden rotate-90" />
            </div>

            {/* Milestone 2 */}
            <div className="flex-1 rounded-xl border border-border bg-card border-l-4 border-l-green-500 p-5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <span className="text-sm font-bold text-green-700 dark:text-green-300">2</span>
                </div>
                <Badge className="text-[10px] bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300">Active</Badge>
              </div>
              <p className="text-2xl font-bold text-foreground mt-2">{formatPrice(REFERRAL_MILESTONE_2)}</p>
              <p className="text-xs text-muted-foreground mt-1">When your referral starts cooking & completes first order</p>
              <p className="text-[10px] text-green-600 dark:text-green-400 mt-2 font-medium">✓ {referralStats.active} referrals active = {formatPrice(referralStats.activeRewardsEarned)}</p>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/20 text-center">
            <p className="text-sm font-semibold text-foreground">Total per referral: <span className="text-accent">{formatPrice(REFERRAL_TOTAL_PER_PERSON)}</span></p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{formatPrice(REFERRAL_MILESTONE_1)} on listing + {formatPrice(REFERRAL_MILESTONE_2)} on activation</p>
          </div>
        </CardContent>
      </Card>

      {/* Referral History */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Referral History</CardTitle>
          <CardDescription>Track the status of everyone you've referred</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="space-y-2">
            {referralHistory.map((ref) => (
              <div key={ref.id} className="bg-muted/30 rounded-xl p-3 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{ref.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {ref.phone} · Referred {ref.referredDate}
                    </p>
                    {ref.joinedDate && (
                      <p className="text-xs text-muted-foreground">Joined {ref.joinedDate}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0 ml-3">
                    <Badge variant="outline" className={`text-[10px] capitalize border ${statusStyles[ref.status] || ""}`}>
                      {ref.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                {/* Reward milestones */}
                <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">Listed:</span>
                    {ref.listedReward ? (
                      <span className="text-xs font-bold text-blue-600">{formatPrice(ref.listedReward)} ✓</span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">—</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">Active:</span>
                    {ref.activeReward ? (
                      <span className="text-xs font-bold text-green-600">{formatPrice(ref.activeReward)} ✓</span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">—</span>
                    )}
                  </div>
                  {ref.totalReward > 0 && (
                    <span className="text-xs font-bold text-accent ml-auto">Total: {formatPrice(ref.totalReward)}</span>
                  )}
                </div>

                {/* Enrollment status from admin partner management */}
                {ref.enrollmentStatus && (
                  <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Enrollment:</span>
                    <span className="text-xs font-medium text-foreground">
                      {enrollmentStatusLabels[ref.enrollmentStatus] || ref.enrollmentStatus}
                    </span>
                    {ref.enrollmentLeadId && (
                      <span className="text-[10px] font-mono text-muted-foreground ml-auto">{ref.enrollmentLeadId}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: "1", title: "Share Your Code", desc: "Send your referral code or link to friends via WhatsApp, Facebook, or Instagram groups" },
              { step: "2", title: "They Sign Up", desc: "Your friend clicks the link, fills the enrollment form with your referral code, and their application is linked to you" },
              { step: "3", title: "Track Their Status", desc: "Their enrollment status (submitted, paid, approved, rejected) appears in your referral history in real time" },
              { step: "4", title: "You Earn Rewards", desc: `$${REFERRAL_MILESTONE_1} when they're listed + $${REFERRAL_MILESTONE_2} when they go active = $${REFERRAL_TOTAL_PER_PERSON} total` },
            ].map((s) => (
              <div key={s.step} className="text-center p-4 rounded-xl border border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg font-bold text-primary">{s.step}</span>
                </div>
                <p className="font-semibold text-sm text-foreground">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerReferrals;
