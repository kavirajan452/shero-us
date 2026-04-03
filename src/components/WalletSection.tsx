import { Wallet, ArrowDownLeft, ArrowUpRight, Gift, Sparkles, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWallet, TransactionType } from "@/contexts/WalletContext";
import { useRegion } from "@/contexts/RegionContext";
import { Progress } from "@/components/ui/progress";

const txConfig: Record<TransactionType, { label: string; icon: typeof Gift; color: string }> = {
  referral_credit: { label: "Referral Bonus", icon: Gift, color: "text-accent" },
  customer_referral: { label: "Friend Referral", icon: Gift, color: "text-accent" },
  spin_reward: { label: "Spin Reward", icon: Sparkles, color: "text-primary" },
  purchase_debit: { label: "Purchase", icon: ArrowUpRight, color: "text-destructive" },
  ppp_bonus: { label: "PPP Bonus", icon: Sparkles, color: "text-primary" },
  adjustment: { label: "Adjustment", icon: ArrowDownLeft, color: "text-muted-foreground" },
};

const getExpiryInfo = (expiresAt?: string | null, expired?: boolean) => {
  if (!expiresAt || expired) return null;
  const now = new Date();
  const expiry = new Date(expiresAt);
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft <= 0) return { label: "Expired", color: "text-destructive", urgency: "expired" };
  if (daysLeft <= 3) return { label: `${daysLeft}d left`, color: "text-destructive", urgency: "critical" };
  if (daysLeft <= 7) return { label: `${daysLeft}d left`, color: "text-yellow-600", urgency: "warning" };
  return { label: `Expires ${expiry.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`, color: "text-muted-foreground", urgency: "safe" };
};

interface WalletSectionProps {
  variant?: "customer" | "partner";
}

const WalletSection = ({ variant = "customer" }: WalletSectionProps) => {
  const { balance, transactions, orderCount, pppBonusPaid, totalReferralEarnings, earningCap, expiryNotifications } = useWallet();
  const { formatPrice } = useRegion();

  // Find soonest expiring credit
  const expiringCredits = transactions
    .filter((t) => t.expires_at && !t.expired && (t.remaining_amount ?? 0) > 0 && t.amount > 0)
    .sort((a, b) => new Date(a.expires_at!).getTime() - new Date(b.expires_at!).getTime());

  const soonestExpiring = expiringCredits[0];
  const soonestExpiryInfo = soonestExpiring ? getExpiryInfo(soonestExpiring.expires_at) : null;

  // Unread notifications
  const unreadNotifs = expiryNotifications.filter((n) => !n.read_at);

  return (
    <div className="space-y-4">
      {/* Balance Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Shero Wallet Balance</p>
              <p className="text-2xl font-bold text-foreground">{formatPrice(balance)}</p>
            </div>
          </div>

          {/* Wallet usage info */}
          {variant === "customer" && orderCount < 2 && balance > 0 && (
            <div className="bg-accent/10 rounded-lg p-2.5 text-xs text-accent mb-2">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Wallet usable from your 2nd order — up to 50% of order value
            </div>
          )}

          {variant === "customer" && orderCount >= 2 && balance > 0 && (
            <div className="bg-accent/10 rounded-lg p-2.5 text-xs text-accent mb-2">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Use up to 50% of your order value from wallet!
            </div>
          )}

          {/* Expiring soon warning */}
          {soonestExpiryInfo && (soonestExpiryInfo.urgency === "critical" || soonestExpiryInfo.urgency === "warning") && (
            <div className={`rounded-lg p-2.5 text-xs mb-2 flex items-center gap-1.5 ${soonestExpiryInfo.urgency === "critical" ? "bg-destructive/10 text-destructive" : "bg-yellow-500/10 text-yellow-700"}`}>
              <AlertTriangle className="w-3 h-3" />
              {formatPrice(soonestExpiring!.remaining_amount ?? 0)} expiring in {soonestExpiryInfo.label} — use it now!
            </div>
          )}

          {/* Earning cap progress */}
          {variant === "customer" && totalReferralEarnings > 0 && (
            <div className="mt-2">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>Referral Earnings</span>
                <span>{formatPrice(totalReferralEarnings)} / {formatPrice(earningCap)}</span>
              </div>
              <Progress value={(totalReferralEarnings / earningCap) * 100} className="h-1.5" />
            </div>
          )}

          {variant === "partner" && !pppBonusPaid && balance > 0 && (
            <div className="bg-primary/10 rounded-lg p-2.5 text-xs text-primary">
              <Sparkles className="w-3 h-3 inline mr-1" />
              ₹500 signup bonus will be included in your first PPP payout
            </div>
          )}

          {variant === "partner" && pppBonusPaid && (
            <Badge variant="outline" className="text-[10px] border-accent/30 text-accent">
              ✓ Signup bonus paid in PPP
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Expiry Notifications */}
      {unreadNotifs.length > 0 && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="py-3 space-y-2">
            {unreadNotifs.slice(0, 3).map((n) => (
              <div key={n.id} className="flex items-start gap-2 text-xs">
                <Clock className="w-3.5 h-3.5 text-yellow-600 mt-0.5 shrink-0" />
                <span className="text-foreground">{n.message}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      {transactions.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Transaction History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {transactions.slice(0, 10).map((tx) => {
              const config = txConfig[tx.type];
              const Icon = config.icon;
              const expiryInfo = tx.amount > 0 ? getExpiryInfo(tx.expires_at, tx.expired) : null;
              return (
                <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center ${config.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      {expiryInfo && (
                        <span className={`text-[10px] ${expiryInfo.color}`}>
                          {tx.expired ? "Expired" : expiryInfo.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${tx.amount >= 0 ? "text-accent" : "text-destructive"}`}>
                    {tx.amount >= 0 ? "+" : ""}{formatPrice(Math.abs(tx.amount))}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {transactions.length === 0 && (
        <Card className="border-border">
          <CardContent className="py-8 text-center">
            <Wallet className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No transactions yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              {variant === "customer"
                ? "Get ₹500 when you join via a partner's referral link!"
                : "Share your visiting card to earn referral rewards!"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WalletSection;
