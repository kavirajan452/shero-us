// Standardized veg / non-veg emoji indicators used across the entire app.
// 🥬 = Vegetarian, 🍗 = Non-Vegetarian

export const VEG_EMOJI = "🥬";
export const NON_VEG_EMOJI = "🍗";

export function foodTypeLabel(isVeg: boolean): string {
  return isVeg ? `${VEG_EMOJI} Veg` : `${NON_VEG_EMOJI} Non-Veg`;
}

export function foodTypeFullLabel(isVeg: boolean): string {
  return isVeg ? `${VEG_EMOJI} Vegetarian` : `${NON_VEG_EMOJI} Non-Vegetarian`;
}
