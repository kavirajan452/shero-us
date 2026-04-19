import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Leaf } from "lucide-react";
import type { MenuItem, AddOn } from "@/types/menu";
import { useRegion } from "@/contexts/RegionContext";

interface AddOnsDialogProps {
  item: MenuItem | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (item: MenuItem, selectedAddOns: AddOn[]) => void;
}

const AddOnsDialog = ({ item, open, onClose, onConfirm }: AddOnsDialogProps) => {
  const { formatPrice } = useRegion();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Reset selections when item changes
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && item?.addOns) {
      const defaults = new Set(item.addOns.filter((a) => a.isDefault).map((a) => a.id));
      setSelected(defaults);
    }
    if (!isOpen) onClose();
  };

  if (!item || !item.addOns?.length) return null;

  const toggleAddOn = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedAddOns = item.addOns.filter((a) => selected.has(a.id));
  const addOnsTotal = selectedAddOns.reduce((s, a) => s + a.price, 0);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-serif">Customize your order</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">{item.name}</p>
        </DialogHeader>

        <div className="space-y-1 max-h-64 overflow-y-auto">
          <p className="text-sm font-semibold text-foreground mb-2">Add-ons</p>
          {item.addOns.map((addon) => (
            <label
              key={addon.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={selected.has(addon.id)}
                onCheckedChange={() => toggleAddOn(addon.id)}
              />
              <div className="flex-1 flex items-center gap-2">
                {addon.isVeg && <Leaf className="w-3.5 h-3.5 text-accent shrink-0" />}
                <span className="text-sm text-foreground">{addon.name}</span>
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                +{formatPrice(addon.price)}
              </span>
            </label>
          ))}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <div className="flex items-center justify-between w-full text-sm">
            <span className="text-muted-foreground">Item: {formatPrice(item.price)}</span>
            {addOnsTotal > 0 && (
              <span className="text-muted-foreground">Add-ons: +{formatPrice(addOnsTotal)}</span>
            )}
          </div>
          <button
            onClick={() => {
              onConfirm(item, selectedAddOns);
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-gradient-shero text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity"
          >
            Add to Cart — {formatPrice(item.price + addOnsTotal)}
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip add-ons
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddOnsDialog;
