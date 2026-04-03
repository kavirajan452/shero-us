/**
 * Volume-based packing charges configuration for party orders.
 * 
 * Logic:
 * - Items measured in kg/L: Every 5 kg (or 5L) = 1 box. 7.5kg = 2 boxes.
 * - Items measured in pieces: $10 per piece-based item (flat, not volume).
 * - Box cost is admin-configurable (default $20).
 * 
 * Boxes are fresh, food-grade, reusable containers.
 */

export interface PackingConfig {
  boxCostRupees: number;       // cost per box (admin configurable)
  volumePerBoxKg: number;      // kg per box threshold (default 5)
  volumePerBoxLitres: number;  // litres per box threshold (default 5)
  pieceCostRupees: number;     // flat cost per piece-based item
}

/** Combo Meal Box packing — separate material & pricing */
export interface ComboPackingConfig {
  boxCostPerUnit: number;      // cost per combo box (default $15)
  labelCostPerUnit: number;    // sticker/label per box (default $2)
  sealWrapCostPerUnit: number; // cling wrap / seal per box (default $3)
  bagCostPerUnit: number;      // carry bag per box (default $5)
}

// Default config - admin can change these
const PACKING_CONFIG_KEY = "shero-packing-config";

const defaultConfig: PackingConfig = {
  boxCostRupees: 20,
  volumePerBoxKg: 5,
  volumePerBoxLitres: 5,
  pieceCostRupees: 10,
};

const COMBO_PACKING_CONFIG_KEY = "shero-combo-packing-config";

const defaultComboConfig: ComboPackingConfig = {
  boxCostPerUnit: 15,
  labelCostPerUnit: 2,
  sealWrapCostPerUnit: 3,
  bagCostPerUnit: 5,
};

export function getComboPackingConfig(): ComboPackingConfig {
  try {
    const raw = localStorage.getItem(COMBO_PACKING_CONFIG_KEY);
    return raw ? { ...defaultComboConfig, ...JSON.parse(raw) } : defaultComboConfig;
  } catch {
    return defaultComboConfig;
  }
}

export function saveComboPackingConfig(config: ComboPackingConfig) {
  localStorage.setItem(COMBO_PACKING_CONFIG_KEY, JSON.stringify(config));
}

/** Total packing cost per combo box = box + label + seal + bag */
export function getComboPackingCostPerBox(config?: ComboPackingConfig): number {
  const cfg = config || getComboPackingConfig();
  return cfg.boxCostPerUnit + cfg.labelCostPerUnit + cfg.sealWrapCostPerUnit + cfg.bagCostPerUnit;
}

export function getPackingConfig(): PackingConfig {
  try {
    const raw = localStorage.getItem(PACKING_CONFIG_KEY);
    return raw ? { ...defaultConfig, ...JSON.parse(raw) } : defaultConfig;
  } catch {
    return defaultConfig;
  }
}

export function savePackingConfig(config: PackingConfig) {
  localStorage.setItem(PACKING_CONFIG_KEY, JSON.stringify(config));
}

/**
 * Compute number of boxes needed for a given total weight/volume.
 * e.g. 7.5 kg / 5 kg per box = ceil(1.5) = 2 boxes
 */
export function computeBoxCount(totalQuantity: number, unit: string, config: PackingConfig): number {
  const lowerUnit = unit.toLowerCase();
  if (lowerUnit === "gms" || lowerUnit === "g" || lowerUnit === "kg") {
    const totalKg = lowerUnit === "kg" ? totalQuantity : totalQuantity / 1000;
    return Math.ceil(totalKg / config.volumePerBoxKg);
  }
  if (lowerUnit === "ml" || lowerUnit === "l" || lowerUnit === "litres") {
    const totalL = (lowerUnit === "l" || lowerUnit === "litres") ? totalQuantity : totalQuantity / 1000;
    return Math.ceil(totalL / config.volumePerBoxLitres);
  }
  // pieces, servings, scoops etc. → 0 boxes (charged per piece instead)
  return 0;
}

export function isPieceBasedUnit(unit: string): boolean {
  const lower = unit.toLowerCase();
  return ["pcs", "pc", "serving", "scoops", "set", "eggs"].includes(lower);
}

export interface PackingBreakdownItem {
  itemName: string;
  categoryName: string;
  totalQuantity: number;
  unit: string;
  boxes: number;
  boxCost: number;
  pieceCost: number;
  totalCost: number;
}

/**
 * Calculate packing charges for a list of selected items across categories.
 * Returns per-item breakdown and total.
 */
export function calculatePackingCharges(
  categories: { id: string; name: string; portionSize: number; portionUnit: string; items: { id: string; name: string }[] }[],
  selectedItemIds: Set<string>,
  guestCount: number,
  config?: PackingConfig
): { breakdown: PackingBreakdownItem[]; totalBoxes: number; totalCost: number } {
  const cfg = config || getPackingConfig();
  const breakdown: PackingBreakdownItem[] = [];
  let totalBoxes = 0;
  let totalCost = 0;

  for (const cat of categories) {
    for (const item of cat.items) {
      if (!selectedItemIds.has(item.id)) continue;
      const totalQty = cat.portionSize * guestCount;
      const unit = cat.portionUnit;

      if (isPieceBasedUnit(unit)) {
        // Piece-based: flat cost per item
        const pieceCost = cfg.pieceCostRupees;
        breakdown.push({
          itemName: item.name,
          categoryName: cat.name,
          totalQuantity: totalQty,
          unit,
          boxes: 0,
          boxCost: 0,
          pieceCost,
          totalCost: pieceCost,
        });
        totalCost += pieceCost;
      } else {
        // Volume/weight based
        const boxes = computeBoxCount(totalQty, unit, cfg);
        const cost = boxes * cfg.boxCostRupees;
        breakdown.push({
          itemName: item.name,
          categoryName: cat.name,
          totalQuantity: totalQty,
          unit,
          boxes,
          boxCost: cost,
          pieceCost: 0,
          totalCost: cost,
        });
        totalBoxes += boxes;
        totalCost += cost;
      }
    }
  }

  return { breakdown, totalBoxes, totalCost };
}

export const PACKING_INFO_TEXT = `All food is packed in fresh, new, food-grade reusable containers. Your family can continue to use these premium containers even after the occasion — storing rice, dal, snacks, or leftovers. We never use single-use plastic. Each box is designed to keep food fresh and safe during transit.`;
