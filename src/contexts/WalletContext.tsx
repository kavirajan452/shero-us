import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type TransactionType =
  | "referral_credit"
  | "customer_referral"
  | "spin_reward"
  | "purchase_debit"
  | "ppp_bonus"
  | "adjustment";

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  referrerCode?: string;
  expires_at?: string | null;
  expired?: boolean;
  remaining_amount?: number;
}

export interface CustomerReferral {
  id: string;
  friendName: string;
  friendPhone: string;
  status: "invited" | "otp_verified" | "first_order" | "expired";
  invitedAt: string;
  verifiedAt?: string;
  rewardCredited: boolean;
  spinDone: boolean;
  spinAmount?: number | null;
}

interface WalletContextType {
  balance: number;
  transactions: WalletTransaction[];
  isFirstPurchase: boolean;
  pppBonusPaid: boolean;
  customerReferrals: CustomerReferral[];
  customerReferralCode: string;
  totalSpinWinnings: number;
  orderCount: number;
  totalReferralEarnings: number;
  earningCap: number;
  expiryNotifications: ExpiryNotification[];
  addReferralCredit: (referrerCode: string) => void;
  getUsableAmount: (orderTotal: number) => number;
  spendOnPurchase: (amount: number, orderTotal: number) => void;
  addPPPBonus: () => void;
  hasReferralCredit: boolean;
  addCustomerReferral: (name: string, phone: string) => Promise<string>;
  verifyCustomerReferral: (referralId: string) => void;
  addSpinReward: (referralId: string, amount: number) => void;
  referralStats: { total: number; verified: number; earned: number };
  markNotificationRead: (id: string) => void;
  loading: boolean;
}

export interface ExpiryNotification {
  id: string;
  transaction_id: string;
  notification_type: string;
  message: string;
  sent_at: string;
  read_at: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const DEFAULT_EARNING_CAP = 2500;
const DEFAULT_VALIDITY_DAYS = 90;

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [customerReferrals, setCustomerReferrals] = useState<CustomerReferral[]>([]);
  const [customerReferralCode, setCustomerReferralCode] = useState("");
  const [totalReferralEarnings, setTotalReferralEarnings] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [pppBonusPaid, setPppBonusPaid] = useState(false);
  const [earningCap, setEarningCap] = useState(DEFAULT_EARNING_CAP);
  const [expiryNotifications, setExpiryNotifications] = useState<ExpiryNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data from backend
  const fetchWalletData = useCallback(async () => {
    if (!user?.id) {
      setBalance(0);
      setTransactions([]);
      setCustomerReferrals([]);
      setCustomerReferralCode("");
      setTotalReferralEarnings(0);
      setOrderCount(0);
      setPppBonusPaid(false);
      setExpiryNotifications([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch wallet
      const { data: wallet } = await supabase
        .from("user_wallets")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (wallet) {
        setBalance(wallet.balance || 0);
        setCustomerReferralCode((wallet as any).referral_code || "");
        setTotalReferralEarnings((wallet as any).total_referral_earnings || 0);
        setOrderCount((wallet as any).order_count || 0);
      }

      // Fetch transactions
      const { data: txns } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (txns) {
        setTransactions(
          txns.map((t: any) => ({
            id: t.id,
            type: t.type as TransactionType,
            amount: t.amount,
            description: t.description,
            date: t.created_at,
            referrerCode: t.referrer_code,
            expires_at: t.expires_at,
            expired: t.expired,
            remaining_amount: t.remaining_amount,
          }))
        );
        setPppBonusPaid(txns.some((t: any) => t.type === "ppp_bonus"));
      }

      // Fetch referrals
      const { data: refs } = await supabase
        .from("customer_referrals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (refs) {
        setCustomerReferrals(
          refs.map((r: any) => ({
            id: r.id,
            friendName: r.friend_name,
            friendPhone: r.friend_phone,
            status: r.status,
            invitedAt: r.invited_at,
            verifiedAt: r.verified_at,
            rewardCredited: r.reward_credited,
            spinDone: r.spin_done,
            spinAmount: r.spin_amount,
          }))
        );
      }

      // Fetch expiry notifications
      const { data: notifs } = await supabase
        .from("wallet_expiry_notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("sent_at", { ascending: false })
        .limit(20);

      if (notifs) {
        setExpiryNotifications(notifs as ExpiryNotification[]);
      }

      // Fetch earning cap from config
      const { data: configRow } = await supabase
        .from("app_config")
        .select("value")
        .eq("key", "referral_settings")
        .single();

      if (configRow?.value) {
        setEarningCap((configRow.value as any).earning_cap || DEFAULT_EARNING_CAP);
      }
    } catch (e) {
      console.error("Wallet fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const addReferralCredit = useCallback(
    async (referrerCode: string) => {
      if (!user?.id) return;
      // Check duplicate
      const existing = transactions.find(
        (t) => t.type === "referral_credit" && t.referrerCode === referrerCode
      );
      if (existing) return;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + DEFAULT_VALIDITY_DAYS);

      await supabase.from("wallet_transactions").insert({
        user_id: user.id,
        type: "referral_credit",
        amount: 500,
        remaining_amount: 500,
        description: `Referral bonus from code ${referrerCode}`,
        referrer_code: referrerCode,
        expires_at: expiresAt.toISOString(),
      });

      // Update wallet balance
      await supabase
        .from("user_wallets")
        .update({ balance: balance + 500 })
        .eq("user_id", user.id);

      fetchWalletData();
    },
    [user?.id, balance, transactions, fetchWalletData]
  );

  const getUsableAmount = useCallback(
    (orderTotal: number) => {
      // Wallet usable from 2nd order only
      if (orderCount < 2) return 0;
      if (balance <= 0) return 0;
      // Cap at 50% of base order value
      const maxUsable = Math.floor(orderTotal * 0.5);
      return Math.min(balance, maxUsable);
    },
    [balance, orderCount]
  );

  const spendOnPurchase = useCallback(
    async (amount: number, orderTotal: number) => {
      if (!user?.id || amount <= 0) return;

      // FIFO: debit from oldest non-expired credits
      const { data: credits } = await supabase
        .from("wallet_transactions")
        .select("id, remaining_amount")
        .eq("user_id", user.id)
        .eq("expired", false)
        .gt("remaining_amount", 0)
        .not("type", "eq", "purchase_debit")
        .order("created_at", { ascending: true });

      let remaining = amount;
      if (credits) {
        for (const credit of credits) {
          if (remaining <= 0) break;
          const deduct = Math.min(remaining, credit.remaining_amount);
          await supabase
            .from("wallet_transactions")
            .update({ remaining_amount: credit.remaining_amount - deduct })
            .eq("id", credit.id);
          remaining -= deduct;
        }
      }

      // Insert debit transaction
      await supabase.from("wallet_transactions").insert({
        user_id: user.id,
        type: "purchase_debit",
        amount: -amount,
        remaining_amount: 0,
        description: `Used on order ($${orderTotal} total)`,
      });

      // Update wallet
      await supabase
        .from("user_wallets")
        .update({
          balance: Math.max(0, balance - amount),
          order_count: orderCount + 1,
        })
        .eq("user_id", user.id);

      fetchWalletData();
    },
    [user?.id, balance, orderCount, fetchWalletData]
  );

  const addPPPBonus = useCallback(async () => {
    if (!user?.id || pppBonusPaid) return;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + DEFAULT_VALIDITY_DAYS);

    await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      type: "ppp_bonus",
      amount: 500,
      remaining_amount: 500,
      description: "Partner signup bonus — paid in first PPP settlement",
      expires_at: expiresAt.toISOString(),
    });

    await supabase
      .from("user_wallets")
      .update({ balance: balance + 500 })
      .eq("user_id", user.id);

    fetchWalletData();
  }, [user?.id, pppBonusPaid, balance, fetchWalletData]);

  const addCustomerReferral = useCallback(
    async (name: string, phone: string): Promise<string> => {
      if (!user?.id) return "";

      const exists = customerReferrals.some((r) => r.friendPhone === phone);
      if (exists) return "";

      const { data } = await supabase
        .from("customer_referrals")
        .insert({
          user_id: user.id,
          friend_name: name,
          friend_phone: phone,
          status: "invited",
        })
        .select("id")
        .single();

      fetchWalletData();
      return data?.id || "";
    },
    [user?.id, customerReferrals, fetchWalletData]
  );

  const verifyCustomerReferral = useCallback(
    async (referralId: string) => {
      if (!user?.id) return;

      await supabase
        .from("customer_referrals")
        .update({
          status: "otp_verified",
          verified_at: new Date().toISOString(),
          reward_credited: true,
        })
        .eq("id", referralId)
        .eq("user_id", user.id);

      // No flat $100 reward — reward is spin-only
      fetchWalletData();
    },
    [user?.id, fetchWalletData]
  );

  const addSpinReward = useCallback(
    async (referralId: string, amount: number) => {
      if (!user?.id) return;

      // Enforce earning cap
      const cappedAmount = Math.min(amount, Math.max(0, earningCap - totalReferralEarnings));
      if (cappedAmount <= 0) return;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + DEFAULT_VALIDITY_DAYS);

      // Update referral
      await supabase
        .from("customer_referrals")
        .update({ spin_done: true, spin_amount: cappedAmount })
        .eq("id", referralId);

      // Add wallet transaction
      await supabase.from("wallet_transactions").insert({
        user_id: user.id,
        type: "spin_reward",
        amount: cappedAmount,
        remaining_amount: cappedAmount,
        description: `🎰 Spin wheel bonus — $${cappedAmount} won!`,
        expires_at: expiresAt.toISOString(),
      });

      // Update wallet balance + total earnings
      await supabase
        .from("user_wallets")
        .update({
          balance: balance + cappedAmount,
          total_referral_earnings: totalReferralEarnings + cappedAmount,
        })
        .eq("user_id", user.id);

      fetchWalletData();
    },
    [user?.id, balance, totalReferralEarnings, earningCap, fetchWalletData]
  );

  const markNotificationRead = useCallback(
    async (id: string) => {
      if (!user?.id) return;
      await supabase
        .from("wallet_expiry_notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id);
      setExpiryNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
    },
    [user?.id]
  );

  const hasReferralCredit = transactions.some((t) => t.type === "referral_credit");
  const isFirstPurchase = orderCount === 0;
  const totalSpinWinnings = transactions
    .filter((t) => t.type === "spin_reward")
    .reduce((s, t) => s + t.amount, 0);

  const referralStats = {
    total: customerReferrals.length,
    verified: customerReferrals.filter((r) => r.status !== "invited").length,
    earned: transactions
      .filter((t) => t.type === "customer_referral" || t.type === "spin_reward")
      .reduce((s, t) => s + t.amount, 0),
  };

  return (
    <WalletContext.Provider
      value={{
        balance,
        transactions,
        isFirstPurchase,
        pppBonusPaid,
        customerReferrals,
        customerReferralCode,
        totalSpinWinnings,
        orderCount,
        totalReferralEarnings,
        earningCap,
        expiryNotifications,
        addReferralCredit,
        getUsableAmount,
        spendOnPurchase,
        addPPPBonus,
        hasReferralCredit,
        addCustomerReferral,
        verifyCustomerReferral,
        addSpinReward,
        referralStats,
        markNotificationRead,
        loading,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
};
