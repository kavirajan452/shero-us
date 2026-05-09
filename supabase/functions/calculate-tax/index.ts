import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// US state base sales-tax rates used in demo mode (same rates as Checkout.tsx)
const US_STATE_TAX_RATES: Record<string, number> = {
  Alabama: 0.04, Alaska: 0, Arizona: 0.056, Arkansas: 0.065, California: 0.0725,
  Colorado: 0.029, Connecticut: 0.0635, Delaware: 0, Florida: 0.06, Georgia: 0.04,
  Hawaii: 0.04, Idaho: 0.06, Illinois: 0.0625, Indiana: 0.07, Iowa: 0.06,
  Kansas: 0.065, Kentucky: 0.06, Louisiana: 0.0445, Maine: 0.055, Maryland: 0.06,
  Massachusetts: 0.0625, Michigan: 0.06, Minnesota: 0.06875, Mississippi: 0.07,
  Missouri: 0.04225, Montana: 0, Nebraska: 0.055, Nevada: 0.0685, "New Hampshire": 0,
  "New Jersey": 0.06625, "New Mexico": 0.05125, "New York": 0.04,
  "North Carolina": 0.0475, "North Dakota": 0.05, Ohio: 0.0575, Oklahoma: 0.045,
  Oregon: 0, Pennsylvania: 0.06, "Rhode Island": 0.07, "South Carolina": 0.06,
  "South Dakota": 0.042, Tennessee: 0.07, Texas: 0.0625, Utah: 0.061,
  Vermont: 0.06, Virginia: 0.053, Washington: 0.065, "West Virginia": 0.06,
  Wisconsin: 0.05, Wyoming: 0.04, "District of Columbia": 0.06,
};

const isLiveMode = () => {
  const mode = (Deno.env.get("APP_MODE") ?? Deno.env.get("MODE") ?? "dev").toLowerCase();
  return mode === "production" || mode === "prod" || mode === "live";
};

interface TaxRequest {
  subtotal: number;
  regionCode: "US" | "IN";
  customerState?: string;
  zipCode?: string;
  orderId?: string;
  city?: string;
}

interface TaxResult {
  success: boolean;
  taxAmount: number;
  taxRate: number;
  taxLabel: string;
  transactionId: string;
  mode: "dev" | "production";
  provider: "simulated" | "avalara";
  error?: string;
}

const logTaxCalc = async (params: {
  orderId: string | null;
  regionCode: string;
  customerState: string | null;
  zipCode: string | null;
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  taxLabel: string;
  transactionId: string;
  mode: "dev" | "production";
  provider: string;
  gatewayResponse: unknown;
}) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRole) return;

  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await supabase.from("tax_calculations").insert({
    order_id: params.orderId,
    region_code: params.regionCode,
    customer_state: params.customerState,
    zip_code: params.zipCode,
    subtotal: params.subtotal,
    tax_amount: params.taxAmount,
    tax_rate: params.taxRate,
    tax_label: params.taxLabel,
    transaction_id: params.transactionId,
    mode: params.mode,
    provider: params.provider,
    gateway_response: params.gatewayResponse,
  });
  if (error) {
    console.error("Failed to log tax calculation:", error.message);
  }
};

const buildDemoResponse = (req: TaxRequest): TaxResult => {
  let taxRate = 0.0825; // default US rate
  if (req.regionCode === "IN") {
    taxRate = 0.05; // GST 5%
  } else if (req.customerState && US_STATE_TAX_RATES[req.customerState] !== undefined) {
    taxRate = US_STATE_TAX_RATES[req.customerState];
  }

  const taxAmount = Math.round(req.subtotal * taxRate * 100) / 100;
  const taxPct = (taxRate * 100).toFixed(2);
  const taxLabel =
    req.regionCode === "IN"
      ? `GST (${taxPct}%)`
      : req.customerState
      ? `Sales Tax (${taxPct}% · ${req.customerState})`
      : `Sales Tax (${taxPct}%)`;

  const transactionId = `avlr_sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  return {
    success: true,
    taxAmount,
    taxRate,
    taxLabel,
    transactionId,
    mode: "dev",
    provider: "simulated",
  };
};

const buildAvalaraResponse = async (req: TaxRequest): Promise<TaxResult> => {
  const accountId = Deno.env.get("AVALARA_ACCOUNT_ID");
  const licenseKey = Deno.env.get("AVALARA_LICENSE_KEY");
  const companyCode = Deno.env.get("AVALARA_COMPANY_CODE") ?? "DEFAULT";
  const environment = Deno.env.get("AVALARA_ENVIRONMENT") ?? "production"; // production | sandbox

  if (!accountId || !licenseKey) {
    return {
      success: false,
      taxAmount: 0,
      taxRate: 0,
      taxLabel: "Tax",
      transactionId: "",
      mode: "production",
      provider: "avalara",
      error: "AVALARA_ACCOUNT_ID or AVALARA_LICENSE_KEY is not configured",
    };
  }

  const baseUrl =
    environment === "sandbox"
      ? "https://sandbox-rest.avatax.com"
      : "https://rest.avatax.com";

  const credentials = btoa(`${accountId}:${licenseKey}`);
  const today = new Date().toISOString().split("T")[0];

  // Build origin address (Shero kitchen — use Texas as default origin state)
  const originAddress = {
    line1: "3307 Northland Drive",
    city: "Austin",
    region: "TX",
    postalCode: "78731",
    country: "US",
  };

  // Build destination address from the request
  const destinationAddress: Record<string, string> = {
    country: req.regionCode === "IN" ? "IN" : "US",
  };
  if (req.zipCode) destinationAddress.postalCode = req.zipCode;
  if (req.customerState) destinationAddress.region = req.customerState.slice(0, 2).toUpperCase();
  if (req.city) destinationAddress.city = req.city;

  const transactionBody = {
    type: "SalesOrder",
    companyCode,
    date: today,
    customerCode: "SHERO_CUSTOMER",
    addresses: {
      ShipFrom: originAddress,
      ShipTo: destinationAddress,
    },
    lines: [
      {
        number: "1",
        amount: req.subtotal,
        taxCode: "FR020100", // food/restaurant taxCode
        description: "Food delivery items",
      },
    ],
    commit: false,
    currencyCode: req.regionCode === "IN" ? "INR" : "USD",
  };

  const avalaraResp = await fetch(`${baseUrl}/api/v2/transactions/create`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(transactionBody),
  });

  const avalaraJson = await avalaraResp.json();

  if (!avalaraResp.ok) {
    const errMsg =
      avalaraJson?.error?.message ??
      avalaraJson?.messages?.[0]?.summary ??
      "Avalara request failed";
    return {
      success: false,
      taxAmount: 0,
      taxRate: 0,
      taxLabel: "Tax",
      transactionId: "",
      mode: "production",
      provider: "avalara",
      error: errMsg,
    };
  }

  const totalTax: number = avalaraJson.totalTax ?? avalaraJson.totalTaxCalculated ?? 0;
  const taxRate = req.subtotal > 0 ? totalTax / req.subtotal : 0;
  const taxPct = (taxRate * 100).toFixed(2);
  const taxLabel =
    req.customerState
      ? `Sales Tax (${taxPct}% · ${req.customerState})`
      : `Sales Tax (${taxPct}%)`;

  return {
    success: true,
    taxAmount: Math.round(totalTax * 100) / 100,
    taxRate,
    taxLabel,
    transactionId: avalaraJson.code ?? `avlr_${Date.now()}`,
    mode: "production",
    provider: "avalara",
  };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json();
    const subtotal = Number(body?.subtotal ?? 0);
    if (!Number.isFinite(subtotal) || subtotal < 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid subtotal" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const taxReq: TaxRequest = {
      subtotal,
      regionCode: body?.regionCode === "IN" ? "IN" : "US",
      customerState: typeof body?.customerState === "string" ? body.customerState : undefined,
      zipCode: typeof body?.zipCode === "string" ? body.zipCode : undefined,
      city: typeof body?.city === "string" ? body.city : undefined,
      orderId: typeof body?.orderId === "string" ? body.orderId : undefined,
    };

    const liveMode = isLiveMode();
    let result: TaxResult;

    if (!liveMode) {
      result = buildDemoResponse(taxReq);
    } else {
      result = await buildAvalaraResponse(taxReq);
      // If Avalara fails in production, fall back to demo rates and flag it
      if (!result.success) {
        console.warn("Avalara call failed, falling back to demo rates:", result.error);
        result = {
          ...buildDemoResponse(taxReq),
          mode: "production",
          provider: "simulated",
        };
      }
    }

    await logTaxCalc({
      orderId: taxReq.orderId ?? null,
      regionCode: taxReq.regionCode,
      customerState: taxReq.customerState ?? null,
      zipCode: taxReq.zipCode ?? null,
      subtotal,
      taxAmount: result.taxAmount,
      taxRate: result.taxRate,
      taxLabel: result.taxLabel,
      transactionId: result.transactionId,
      mode: result.mode,
      provider: result.provider,
      gatewayResponse: result,
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
