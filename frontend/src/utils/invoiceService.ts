import { supabase } from "@/integrations/supabase/client";
import { generateInvoiceNumber, generateInvoicePDF, type InvoiceData } from "./invoiceGenerator";

interface CreateInvoiceParams {
  orderId: string;
  orderType: string;
  invoiceType?: "customer_sale" | "partner_purchase";
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerId?: string;
  items: { name: string; qty: string; amount: number; purchasePrice?: number; hsn?: string }[];
  subtotal: number;
  taxAmount: number;
  federalTax?: number;
  stateTax?: number;
  localTax?: number;
  deliveryFee: number;
  packingCharges: number;
  platformFee: number;
  discount: number;
  tips?: number;
  total: number;
}

async function getInvoiceSettings() {
  const { data } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", "invoice_settings")
    .maybeSingle();
  return (data?.value as Record<string, string>) || {};
}

export async function createInvoice(params: CreateInvoiceParams): Promise<string | null> {
  try {
    const settings = await getInvoiceSettings();
    const prefix = settings.invoicePrefix || "SHERO-US";
    const invoiceNumber = generateInvoiceNumber(prefix);
    const taxRate = settings.defaultTaxRate || "8.25";
    const invoiceType = params.invoiceType || "customer_sale";

    const { error } = await supabase.from("invoices").insert([{
      order_id: params.orderId,
      order_type: params.orderType,
      invoice_type: invoiceType,
      invoice_number: invoiceNumber,
      customer_name: params.customerName,
      customer_phone: params.customerPhone,
      customer_email: params.customerEmail || "",
      customer_id: params.customerId || null,
      items_snapshot: JSON.parse(JSON.stringify(params.items)),
      subtotal: params.subtotal,
      tax_amount: params.taxAmount,
      delivery_fee: params.deliveryFee,
      packing_charges: params.packingCharges,
      platform_fee: params.platformFee,
      discount: params.discount,
      tips: params.tips || 0,
      total: params.total,
      tax_rate: taxRate,
      ein: settings.ein || "",
      company_snapshot: JSON.parse(JSON.stringify(settings)),
      status: "generated",
    }]);

    if (error) { console.error("Invoice creation error:", error); return null; }
    return invoiceNumber;
  } catch (e) {
    console.error("Invoice creation failed:", e);
    return null;
  }
}

/** Create both customer sale + partner purchase invoices for a single order */
export async function createBuySellInvoices(params: CreateInvoiceParams & { partnerName?: string; partnerPhone?: string }): Promise<{ saleInvoice: string | null; purchaseInvoice: string | null }> {
  const saleInvoice = await createInvoice({ ...params, invoiceType: "customer_sale" });

  // Partner purchase invoice at PPP (purchase prices)
  const purchaseSubtotal = params.items.reduce((sum, item) => sum + (item.purchasePrice || 0) * parseInt(item.qty || "1"), 0);
  const purchaseInvoice = await createInvoice({
    ...params,
    invoiceType: "partner_purchase",
    customerName: params.partnerName || "Kitchen Partner",
    customerPhone: params.partnerPhone || "",
    subtotal: purchaseSubtotal,
    total: purchaseSubtotal,
    taxAmount: 0,
    deliveryFee: 0,
    packingCharges: 0,
    platformFee: 0,
    discount: 0,
    tips: 0,
  });

  return { saleInvoice, purchaseInvoice };
}

export async function downloadInvoiceForOrder(orderId: string, type: "customer_sale" | "partner_purchase" = "customer_sale"): Promise<boolean> {
  try {
    const { data: invoice } = await supabase
      .from("invoices")
      .select("*")
      .eq("order_id", orderId)
      .eq("invoice_type", type)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!invoice) return false;

    const invoiceData: InvoiceData = {
      invoiceNumber: invoice.invoice_number,
      generatedAt: invoice.generated_at,
      invoiceType: (invoice as any).invoice_type || "customer_sale",
      customerName: invoice.customer_name,
      customerPhone: invoice.customer_phone || "",
      customerEmail: invoice.customer_email || "",
      items: (invoice.items_snapshot as any[]) || [],
      subtotal: Number(invoice.subtotal),
      taxAmount: Number(invoice.tax_amount),
      taxRate: invoice.tax_rate || "8.25",
      federalTax: 0,
      stateTax: 0,
      localTax: 0,
      deliveryFee: Number(invoice.delivery_fee),
      packingCharges: Number(invoice.packing_charges),
      platformFee: Number(invoice.platform_fee),
      discount: Number(invoice.discount),
      tips: Number((invoice as any).tips || 0),
      total: Number(invoice.total),
      orderType: invoice.order_type,
      orderId: invoice.order_id,
      companySnapshot: (invoice.company_snapshot as Record<string, string>) || {},
    };

    const doc = generateInvoicePDF(invoiceData);
    doc.save(`invoice-${invoice.invoice_number}.pdf`);

    await supabase.from("invoices").update({ status: "downloaded" }).eq("id", invoice.id);
    return true;
  } catch (e) {
    console.error("Invoice download failed:", e);
    return false;
  }
}

export async function hasInvoice(orderId: string): Promise<boolean> {
  const { count } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("order_id", orderId);
  return (count || 0) > 0;
}
