import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RegionCode } from "@/contexts/RegionContext";

// US state base sales-tax rates — used as client-side fallback when the
// edge function is unavailable (dev without Supabase running, network error, etc.)
const US_STATE_TAX_RATES: Record<string, number> = {
  Alabama: 0.04, Alaska: 0, Arizona: 0.056, Arkansas: 0.065, California: 0.0725,
  Colorado: 0.029, Connecticut: 0.0635, Delaware: 0, Florida: 0.06, Georgia: 0.04,
  Hawaii: 0.04, Idaho: 0.06, Illinois: 0.0625, Indiana: 0.07, Iowa: 0.06,
  Kansas: 0.065, Kentucky: 0.06, Louisiana: 0.0445, Maine: 0.055, Maryland: 0.06,
  Massachusetts: 0.0625, Michigan: 0.06, Minnesota: 0.06875, Mississippi: 0.07,
  Missouri: 0.04225, Montana: 0, Nebraska: 0.055, Nevada: 0.0685,
  "New Hampshire": 0, "New Jersey": 0.06625, "New Mexico": 0.05125, "New York": 0.04,
  "North Carolina": 0.0475, "North Dakota": 0.05, Ohio: 0.0575, Oklahoma: 0.045,
  Oregon: 0, Pennsylvania: 0.06, "Rhode Island": 0.07, "South Carolina": 0.06,
  "South Dakota": 0.042, Tennessee: 0.07, Texas: 0.0625, Utah: 0.061,
  Vermont: 0.06, Virginia: 0.053, Washington: 0.065, "West Virginia": 0.06,
  Wisconsin: 0.05, Wyoming: 0.04, "District of Columbia": 0.06,
};

const DEFAULT_US_TAX_RATE = 0.0825;
const DEFAULT_IN_TAX_RATE = 0.05;

function calcClientSideTax(
  subtotal: number,
  regionCode: RegionCode,
  customerState?: string,
): { taxAmount: number; taxRate: number; taxLabel: string } {
  let taxRate = regionCode === "IN" ? DEFAULT_IN_TAX_RATE : DEFAULT_US_TAX_RATE;
  if (regionCode === "US" && customerState && US_STATE_TAX_RATES[customerState] !== undefined) {
    taxRate = US_STATE_TAX_RATES[customerState];
  }
  const taxPct = (taxRate * 100).toFixed(2);
  const taxLabel =
    regionCode === "IN"
      ? `GST (${taxPct}%)`
      : customerState
      ? `Sales Tax (${taxPct}% · ${customerState})`
      : `Sales Tax (${taxPct}%)`;
  return {
    taxAmount: Math.round(subtotal * taxRate),
    taxRate,
    taxLabel,
  };
}

export interface TaxResult {
  taxAmount: number;
  taxRate: number;
  taxLabel: string;
  transactionId: string | null;
  loading: boolean;
  /** true when the server-side edge function (Avalara or simulator) was used */
  serverCalculated: boolean;
}

interface UseTaxParams {
  subtotal: number;
  regionCode: RegionCode;
  customerState?: string;
  zipCode?: string;
  city?: string;
}

const DEBOUNCE_MS = 600;

/**
 * useTax — fetches tax amount from the `calculate-tax` Supabase edge function.
 *
 * - In dev mode  the edge function returns a simulated Avalara response.
 * - In production mode it calls the real Avalara AvaTax API.
 * - Falls back to client-side calculation if the edge function is unavailable.
 *
 * The hook is debounced so it only fires after the user stops changing the
 * address/state for 600 ms.
 */
export function useTax({ subtotal, regionCode, customerState, zipCode, city }: UseTaxParams): TaxResult {
  const clientFallback = calcClientSideTax(subtotal, regionCode, customerState);

  const [taxAmount, setTaxAmount] = useState<number>(clientFallback.taxAmount);
  const [taxRate, setTaxRate] = useState<number>(clientFallback.taxRate);
  const [taxLabel, setTaxLabel] = useState<string>(clientFallback.taxLabel);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverCalculated, setServerCalculated] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Immediately update with client-side estimate (instant feedback while debounce waits)
    const cf = calcClientSideTax(subtotal, regionCode, customerState);
    setTaxAmount(cf.taxAmount);
    setTaxRate(cf.taxRate);
    setTaxLabel(cf.taxLabel);
    setServerCalculated(false);
    setTransactionId(null);

    if (timerRef.current) clearTimeout(timerRef.current);

    // Skip the edge function call when there's no meaningful address context
    const hasAddress = !!(customerState || zipCode);
    if (!hasAddress || subtotal <= 0) return;

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("calculate-tax", {
          body: { subtotal, regionCode, customerState, zipCode, city },
        });
        if (!error && data?.success) {
          setTaxAmount(Math.round(data.taxAmount));
          setTaxRate(data.taxRate);
          setTaxLabel(data.taxLabel);
          setTransactionId(data.transactionId ?? null);
          setServerCalculated(true);
        }
        // If the edge function returns an error, client-side values remain
      } catch {
        // Edge function unavailable — keep client-side values
      }
      setLoading(false);
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [subtotal, regionCode, customerState, zipCode, city]); // eslint-disable-line react-hooks/exhaustive-deps

  return { taxAmount, taxRate, taxLabel, transactionId, loading, serverCalculated };
}
