'use client';
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import type { MenuItem, AddOn } from "@/types/menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface CartItem {
  item: MenuItem;
  quantity: number;
  selectedAddOns: AddOn[];
}

export interface AppliedPromo {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number;
  vertical: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, addOns?: AddOn[]) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  appliedPromo: AppliedPromo | null;
  promoDiscount: number;
  applyPromoCode: (code: string) => Promise<boolean>;
  removePromoCode: () => void;
  promoLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const syncTimeoutRef = useRef<number | null>(null);
  const hydratedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      hydratedUserIdRef.current = null;
      setItems([]);
      return;
    }
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("user_carts")
        .select("items")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) {
        console.error("Failed to load user cart", error);
        toast({
          title: "Cart load failed",
          description: "Unable to load your saved cart. Please refresh and try again.",
          variant: "destructive",
        });
        return;
      }
      if (!mounted) return;
      hydratedUserIdRef.current = user.id;
      const dbItemsRaw = data?.items;
      const dbItems = Array.isArray(dbItemsRaw) ? (dbItemsRaw as CartItem[]) : [];
      setItems(dbItems);
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id, toast]);

  useEffect(() => {
    if (!user?.id) return;
    if (hydratedUserIdRef.current !== user.id) return;

    if (syncTimeoutRef.current) {
      window.clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = window.setTimeout(async () => {
      try {
        await supabase
          .from("user_carts")
          .upsert({ user_id: user.id, items }, { onConflict: "user_id" });
      } catch (error) {
        console.error("Failed to sync user_carts", error);
        toast({
          title: "Cart sync failed",
          description: "Your recent cart changes may not be saved yet. Please try again in a moment.",
          variant: "destructive",
        });
      }
    }, 500);

    return () => {
      if (syncTimeoutRef.current) {
        window.clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [items, user?.id, toast]);

  const addItem = useCallback((item: MenuItem, addOns?: AddOn[]) => {
    setItems((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id
            ? { ...ci, quantity: ci.quantity + 1, selectedAddOns: addOns ?? ci.selectedAddOns }
            : ci
        );
      }
      return [...prev, { item, quantity: 1, selectedAddOns: addOns ?? [] }];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((ci) => ci.item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((ci) => ci.item.id !== itemId));
    } else {
      setItems((prev) => prev.map((ci) => ci.item.id === itemId ? { ...ci, quantity } : ci));
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedPromo(null);
  }, []);

  const totalItems = items.reduce((sum, ci) => sum + ci.quantity, 0);
  const subtotal = items.reduce((sum, ci) => {
    const addOnsPrice = ci.selectedAddOns.reduce((s, a) => s + a.price, 0);
    return sum + (ci.item.price + addOnsPrice) * ci.quantity;
  }, 0);

  // Calculate promo discount
  const promoDiscount = (() => {
    if (!appliedPromo) return 0;
    if (subtotal < appliedPromo.minOrderAmount) return 0;

    let discount = 0;
    if (appliedPromo.discountType === "percentage") {
      discount = (subtotal * appliedPromo.discountValue) / 100;
      if (appliedPromo.maxDiscountAmount) {
        discount = Math.min(discount, appliedPromo.maxDiscountAmount);
      }
    } else if (appliedPromo.discountType === "flat") {
      discount = appliedPromo.discountValue;
    }
    return Math.min(discount, subtotal);
  })();

  const applyPromoCode = useCallback(async (code: string): Promise<boolean> => {
    setPromoLoading(true);
    try {
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("promo_code", code.toUpperCase().trim())
        .eq("is_active", true)
        .maybeSingle();

      if (error || !data) {
        toast({ title: "Invalid code", description: "This promo code doesn't exist or has expired.", variant: "destructive" });
        setPromoLoading(false);
        return false;
      }

      // Check usage limit
      if (data.usage_limit && (data.usage_count ?? 0) >= data.usage_limit) {
        toast({ title: "Code expired", description: "This promo code has reached its usage limit.", variant: "destructive" });
        setPromoLoading(false);
        return false;
      }

      // Check min order
      if (data.min_order_amount && subtotal < data.min_order_amount) {
        toast({ title: "Minimum not met", description: `Add $${data.min_order_amount - subtotal} more to use this code.`, variant: "destructive" });
        setPromoLoading(false);
        return false;
      }

      // Check date validity
      const now = new Date();
      if (data.start_date && new Date(data.start_date) > now) {
        toast({ title: "Not yet active", description: "This promo code is not active yet.", variant: "destructive" });
        setPromoLoading(false);
        return false;
      }
      if (data.end_date && new Date(data.end_date) < now) {
        toast({ title: "Expired", description: "This promo code has expired.", variant: "destructive" });
        setPromoLoading(false);
        return false;
      }

      setAppliedPromo({
        id: data.id,
        code: data.promo_code!,
        discountType: data.discount_type || "percentage",
        discountValue: data.discount_value || 0,
        maxDiscountAmount: data.max_discount_amount,
        minOrderAmount: data.min_order_amount || 0,
        vertical: data.vertical,
      });

      toast({ title: "🎉 Code applied!", description: `${data.promo_code} — ${data.offer_text}` });
      setPromoLoading(false);
      return true;
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
      setPromoLoading(false);
      return false;
    }
  }, [subtotal, toast]);

  const removePromoCode = useCallback(() => {
    setAppliedPromo(null);
    toast({ title: "Promo removed", description: "Coupon code has been removed." });
  }, [toast]);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal,
      appliedPromo, promoDiscount, applyPromoCode, removePromoCode, promoLoading,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
