import jsPDF from "jspdf";

export interface InvoiceData {
  invoiceNumber: string;
  generatedAt: string;
  invoiceType: "customer_sale" | "partner_purchase";
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: { name: string; qty: string; amount: number; purchasePrice?: number; hsn?: string }[];
  subtotal: number;
  taxAmount: number;
  taxRate: string;
  federalTax: number;
  stateTax: number;
  localTax: number;
  deliveryFee: number;
  packingCharges: number;
  platformFee: number;
  discount: number;
  tips: number;
  total: number;
  orderType: string;
  orderId: string;
  companySnapshot: {
    companyName?: string;
    companyType?: string;
    ein?: string;
    address?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    phone?: string;
    email?: string;
    supportEmail?: string;
    supportPhone?: string;
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
    logoUrl?: string;
    termsAndConditions?: string;
    hsnSacCode?: string;
    deliveryFee?: string;
  };
}

export function generateInvoicePDF(data: InvoiceData): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pw = 210;
  const m = 15;
  let y = 15;

  const co = data.companySnapshot;
  const companyName = co.companyName || "Shero USA INC";
  const companyType = co.companyType || "Delaware C-Corporation";
  const ein = co.ein || "";
  const isPartnerInvoice = data.invoiceType === "partner_purchase";

  // Header
  doc.setFillColor(26, 26, 46);
  doc.rect(0, 0, pw, 32, "F");
  doc.setTextColor(212, 165, 116);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(companyName, pw / 2, 11, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(companyType, pw / 2, 17, { align: "center" });
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(isPartnerInvoice ? "PURCHASE INVOICE" : "SALE INVOICE", pw / 2, 25, { align: "center" });
  y = 38;

  // Company details
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(8);
  if (ein) doc.text(`EIN: ${ein}`, m, y);
  if (co.address) doc.text(`${co.address}${co.city ? ", " + co.city : ""}${co.state ? ", " + co.state : ""} ${co.zipcode || ""}`, m, y + 4);
  const contactLine = [co.supportPhone || co.phone, co.supportEmail || co.email].filter(Boolean).join(" | ");
  if (contactLine) doc.text(contactLine, m, y + 8);
  y += 16;

  // Invoice meta
  doc.setFontSize(9);
  doc.setTextColor(33, 33, 33);
  doc.setFont("helvetica", "bold");
  doc.text(`Invoice No: ${data.invoiceNumber}`, m, y);
  doc.text(`Date: ${new Date(data.generatedAt).toLocaleDateString("en-US")}`, pw - m, y, { align: "right" });
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.text(`Order: #${data.orderId}`, m, y);
  doc.text(`Type: ${formatOrderType(data.orderType)}`, pw - m, y, { align: "right" });
  y += 8;

  // Bill To / From
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(isPartnerInvoice ? "Purchased From (Kitchen Partner):" : "Bill To:", m, y);
  doc.setFont("helvetica", "normal");
  y += 5;
  doc.text(data.customerName, m, y);
  y += 4;
  if (data.customerPhone) { doc.text(data.customerPhone, m, y); y += 4; }
  if (data.customerEmail) { doc.text(data.customerEmail, m, y); y += 4; }
  y += 4;

  // Items table header
  doc.setFillColor(245, 245, 245);
  const colWidth = pw - m * 2;
  doc.rect(m, y, colWidth, 7, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(33, 33, 33);
  doc.text("#", m + 2, y + 5);
  doc.text("Item", m + 10, y + 5);
  doc.text("Qty", pw - m - 35, y + 5);
  doc.text(isPartnerInvoice ? "Purchase Price" : "Amount", pw - m - 5, y + 5, { align: "right" });
  y += 10;

  // Items
  doc.setFont("helvetica", "normal");
  data.items.forEach((item, idx) => {
    if (y > 260) { doc.addPage(); y = 15; }
    doc.text(`${idx + 1}`, m + 2, y);
    doc.text(item.name.substring(0, 40), m + 10, y);
    doc.text(item.qty, pw - m - 35, y);
    const price = isPartnerInvoice && item.purchasePrice ? item.purchasePrice : item.amount;
    doc.text(`$${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, pw - m - 5, y, { align: "right" });
    y += 5;
  });

  y += 3;
  doc.setDrawColor(200, 200, 200);
  doc.line(m, y, pw - m, y);
  y += 5;

  // Totals
  const addLine = (label: string, val: string, bold = false) => {
    if (y > 275) { doc.addPage(); y = 15; }
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 10 : 9);
    doc.text(label, pw - m - 60, y);
    doc.text(val, pw - m - 5, y, { align: "right" });
    y += 5;
  };

  const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  addLine("Subtotal", fmt(data.subtotal));
  if (data.deliveryFee > 0) addLine("Delivery Fee", fmt(data.deliveryFee));
  if (data.packingCharges > 0) addLine("Packing Charges", fmt(data.packingCharges));
  if (data.platformFee > 0) addLine("Platform Fee", fmt(data.platformFee));
  if (data.discount > 0) addLine("Discount", `-${fmt(data.discount)}`);

  // Tax breakdown
  if (data.federalTax > 0) addLine("Federal Tax", fmt(data.federalTax));
  if (data.stateTax > 0) addLine(`State Tax (${co.state || "MD"})`, fmt(data.stateTax));
  if (data.localTax > 0) addLine("Local Tax", fmt(data.localTax));
  if (data.federalTax === 0 && data.stateTax === 0 && data.localTax === 0 && data.taxAmount > 0) {
    const taxRate = parseFloat(data.taxRate) || 8.25;
    addLine(`Sales Tax (${taxRate}%)`, fmt(data.taxAmount));
  }

  // Tips (customer invoice only)
  if (!isPartnerInvoice && data.tips > 0) {
    addLine("Tip", fmt(data.tips));
  }

  y += 2;
  doc.line(pw - m - 65, y, pw - m, y);
  y += 5;
  addLine("TOTAL", fmt(Math.round(data.total * 100) / 100), true);

  // Bank details
  if (co.bankName || co.accountNumber) {
    y += 8;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Bank / Payment Details:", m, y);
    doc.setFont("helvetica", "normal");
    y += 4;
    if (co.bankName) { doc.text(`Bank: ${co.bankName}`, m, y); y += 4; }
    if (co.accountNumber) { doc.text(`Account: ${co.accountNumber}`, m, y); y += 4; }
    if (co.routingNumber) { doc.text(`Routing: ${co.routingNumber}`, m, y); y += 4; }
  }

  // Terms
  if (co.termsAndConditions) {
    y += 6;
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text("Terms & Conditions:", m, y);
    y += 3;
    const terms = doc.splitTextToSize(co.termsAndConditions, pw - m * 2);
    doc.text(terms, m, y);
  }

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text("This is a computer-generated invoice. No signature required.", pw / 2, 287, { align: "center" });

  return doc;
}

function formatOrderType(type: string): string {
  const map: Record<string, string> = {
    instant: "Instant Order",
    party_bulk: "Party Order (Bulk)",
    party_combo: "Party Order (Combo Box)",
    subscription: "Subscription",
    service: "Home Service",
    snacks: "Sweets & Snacks",
    cookery_class: "Cookery Class",
    shero_class: "Shero Class",
  };
  return map[type] || type;
}

export function generateInvoiceNumber(prefix: string = "SHERO-US"): string {
  const now = new Date();
  const year = now.getFullYear();
  const seq = Date.now().toString().slice(-6);
  return `${prefix}/${year}/${seq}`;
}
