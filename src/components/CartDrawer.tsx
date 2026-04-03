import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, Truck } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { useRegion } from "@/contexts/RegionContext";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CartDrawer = ({ open, onOpenChange }: CartDrawerProps) => {
  const { items, updateQuantity, removeItem, subtotal, totalItems, appliedPromo, promoDiscount } = useCart();
  const { formatPrice } = useRegion();
  const freeShippingThreshold = 599;
  const remaining = Math.max(0, freeShippingThreshold - subtotal);

  if (items.length === 0) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[50vh]">
          <SheetHeader>
            <SheetTitle className="text-foreground">Your Cart</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Your cart is empty</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] flex flex-col p-0">
        <div className="px-5 pt-5 pb-3 border-b border-border">
          <SheetTitle className="text-foreground text-lg font-serif">Your Cart ({totalItems})</SheetTitle>
          {remaining > 0 ? (
            <p className="text-[11px] text-muted-foreground mt-1">
              <Truck className="w-3 h-3 inline mr-1" />
              Add {formatPrice(remaining)} more for free shipping
            </p>
          ) : (
            <p className="text-[11px] text-accent-foreground mt-1 font-semibold">🎉 Free shipping unlocked!</p>
          )}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {items.map(({ item, quantity, selectedAddOns }) => {
            const addOnsPrice = selectedAddOns.reduce((s, a) => s + a.price, 0);
            const lineTotal = (item.price + addOnsPrice) * quantity;
            return (
              <div key={item.id} className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-foreground line-clamp-2">{item.name}</h4>
                  <p className="text-[10px] text-muted-foreground">{formatPrice(item.price)} each</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQuantity(item.id, quantity - 1)}
                    className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/10 transition-colors"
                  >
                    <Minus className="w-3 h-3 text-foreground" />
                  </button>
                  <span className="text-xs font-bold text-foreground w-5 text-center">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, quantity + 1)}
                    className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/10 transition-colors"
                  >
                    <Plus className="w-3 h-3 text-foreground" />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors ml-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-xs font-bold text-foreground w-14 text-right">{formatPrice(lineTotal)}</span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-5 py-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-bold text-foreground">{formatPrice(subtotal)}</span>
          </div>
          {appliedPromo && promoDiscount > 0 && (
            <div className="flex justify-between text-sm text-primary">
              <span>Coupon ({appliedPromo.code})</span>
              <span className="font-semibold">−{formatPrice(promoDiscount)}</span>
            </div>
          )}
          <Link
            to="/checkout"
            onClick={() => onOpenChange(false)}
            className="block w-full text-center py-3.5 rounded-xl bg-gradient-shero text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity"
          >
            Proceed to Checkout — {formatPrice(subtotal - promoDiscount)}
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
