/**
 * Centralized US currency formatting utility.
 * All components should use these functions instead of hardcoded $ symbols.
 */

/** Format a number as USD currency: $1,234.56 */
export const fmt = (n: number): string => `$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

/** Format with sign: ($500) for negative */
export const fmtSigned = (n: number): string => n < 0 ? `(${fmt(n)})` : fmt(n);

/** Compact format: $1.2K, $1.5M */
export const fmtCompact = (n: number): string => {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return fmt(n);
};

/** Format phone for US: (212) 555-0100 */
export const fmtPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, "").slice(-10);
  if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  return phone;
};

/** Currency symbol */
export const CURRENCY_SYMBOL = "$";
