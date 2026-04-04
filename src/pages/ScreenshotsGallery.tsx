import { useState, useCallback } from "react";
import JSZip from "jszip";
import { Download, Printer, ExternalLink, Loader2 } from "lucide-react";

const allPages = [
  // Customer pages
  { name: "Home", path: "/" },
  { name: "Splash Screen", path: "/splash" },
  { name: "Onboarding", path: "/onboarding" },
  { name: "Welcome", path: "/welcome" },
  { name: "Auth / Login", path: "/auth" },
  { name: "Profile", path: "/customer" },
  { name: "Subscriptions", path: "/subscriptions" },
  { name: "Single Meal Order", path: "/instant-delivery" },
  { name: "Kitchen Detail", path: "/instant-delivery/kitchen/1" },
  { name: "Item Detail", path: "/instant-delivery/item/1" },
  { name: "Party Orders", path: "/party-orders" },
  { name: "Sweets & Snacks", path: "/sweets-snacks" },
  { name: "Snack Detail", path: "/sweets-snacks/s1" },
  { name: "Shero Classes", path: "/shero-classes" },
  { name: "Shero Class Category", path: "/shero-classes/yoga" },
  { name: "Shero Class Detail", path: "/shero-classes/detail/yoga-hatha-basics" },
  { name: "Services / Cookery", path: "/services" },
  { name: "Service Category", path: "/services/cook-on-demand" },
  { name: "Service Detail", path: "/services/detail/cod-1" },
  { name: "Service Booking", path: "/services/book/cod-1" },
  { name: "Food Products", path: "/food-products" },
  { name: "Experiences", path: "/experiences" },
  { name: "Chef Profile", path: "/chef/lakshmi-amma" },
  { name: "Checkout", path: "/checkout" },
  { name: "Order Confirmation", path: "/order-confirmation" },
  { name: "Order Tracking", path: "/order-tracking" },
  { name: "Customer Referrals", path: "/referrals" },
  { name: "App Store Listing", path: "/app-store" },
  { name: "Partner Enrollment", path: "/partner-enrollment" },
  // Partner pages
  { name: "Partner Dashboard", path: "/partner" },
  { name: "Partner Orders", path: "/partner/orders" },
  { name: "Partner Menu", path: "/partner/menu" },
  { name: "Partner Cuisines", path: "/partner/cuisines" },
  { name: "Partner Bulk Upload", path: "/partner/bulk-upload" },
  { name: "Partner Kitchen Schedule", path: "/partner/kitchen-schedule" },
  { name: "Partner Kitchen Attendance", path: "/partner/kitchen-attendance" },
  { name: "Partner Reports", path: "/partner/reports" },
  { name: "Partner Tips", path: "/partner/tips" },
  { name: "Partner Messages", path: "/partner/messages" },
  { name: "Partner SPC", path: "/partner/spc" },
  { name: "Partner Party Orders", path: "/partner/party-orders" },
  { name: "Partner Training", path: "/partner/training" },
  { name: "Partner Visiting Card", path: "/partner/visiting-card" },
  { name: "Partner Income Calculator", path: "/partner/income" },
  { name: "Partner Referrals", path: "/partner/referrals" },
  { name: "Partner Earnings", path: "/partner/earnings" },
  { name: "Partner Performance", path: "/partner/performance" },
  { name: "Partner Menu Items", path: "/partner/menu-items" },
  { name: "Partner Ingredients", path: "/partner/ingredients" },
  // Admin pages
  { name: "Admin Login", path: "/admin/login" },
  { name: "Admin Dashboard", path: "/admin" },
  { name: "Admin Partners", path: "/admin/partners" },
  { name: "Admin Menus", path: "/admin/menus" },
  { name: "Admin Orders", path: "/admin/orders" },
  { name: "Admin Payments", path: "/admin/payments" },
  { name: "Admin Tickets", path: "/admin/tickets" },
  { name: "Admin Communications", path: "/admin/communications" },
  { name: "Admin Metrics", path: "/admin/metrics" },
  { name: "Admin Reports", path: "/admin/reports" },
  { name: "Admin Team", path: "/admin/team" },
  { name: "Admin SPC", path: "/admin/spc" },
  { name: "Admin Order Management", path: "/admin/party-allocations" },
  { name: "Admin Delivery Analytics", path: "/admin/delivery-analytics" },
  { name: "Admin Onboarding", path: "/admin/onboarding" },
  { name: "Admin SAP Onboarding", path: "/admin/sap-onboarding" },
  { name: "Admin Users", path: "/admin/users" },
];

const categories = [
  { label: "All", filter: () => true },
  { label: "Customer", filter: (p: typeof allPages[0]) => !p.path.startsWith("/partner/") && p.path !== "/partner" && !p.path.startsWith("/admin") },
  { label: "Partner", filter: (p: typeof allPages[0]) => p.path === "/partner" || p.path.startsWith("/partner/") },
  { label: "Admin", filter: (p: typeof allPages[0]) => p.path.startsWith("/admin") },
];

const ScreenshotsGallery = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const baseUrl = window.location.origin;

  const activeFilter = categories.find(c => c.label === activeCategory)?.filter || (() => true);
  const filteredPages = allPages.filter(activeFilter);

  const downloadPage = useCallback(async (pagePath: string, pageName: string) => {
    setDownloading(pagePath);
    try {
      // Open the page in a hidden iframe, render it, then capture
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.left = "-9999px";
      iframe.style.width = "430px";
      iframe.style.height = "900px";
      iframe.src = `${baseUrl}${pagePath}`;
      document.body.appendChild(iframe);

      await new Promise(resolve => {
        iframe.onload = () => setTimeout(resolve, 2000); // wait for render
      });

      try {
        const html2canvas = (await import("html2canvas")).default;
        const canvas = await html2canvas(iframe.contentDocument!.body, {
          width: 430,
          height: iframe.contentDocument!.body.scrollHeight,
          useCORS: true,
          allowTaint: true,
          scale: 2,
        });

        const link = document.createElement("a");
        link.download = `${pageName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch {
        // Fallback: open in new tab for manual save
        window.open(`${baseUrl}${pagePath}`, "_blank");
      }

      document.body.removeChild(iframe);
    } catch {
      window.open(`${baseUrl}${pagePath}`, "_blank");
    }
    setDownloading(null);
  }, [baseUrl]);

  const openInNewTab = (path: string) => {
    window.open(`${baseUrl}${path}`, "_blank");
  };

  const printGallery = () => {
    window.print();
  };

  const capturePageAsBlob = useCallback(async (pagePath: string): Promise<Blob | null> => {
    try {
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.left = "-9999px";
      iframe.style.width = "430px";
      iframe.style.height = "900px";
      iframe.src = `${baseUrl}${pagePath}`;
      document.body.appendChild(iframe);

      await new Promise(resolve => {
        iframe.onload = () => setTimeout(resolve, 2500);
      });

      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(iframe.contentDocument!.body, {
        width: 430,
        height: iframe.contentDocument!.body.scrollHeight,
        useCORS: true,
        allowTaint: true,
        scale: 2,
      });

      document.body.removeChild(iframe);

      return new Promise(resolve => {
        canvas.toBlob(blob => resolve(blob), "image/png");
      });
    } catch {
      return null;
    }
  }, [baseUrl]);

  const downloadAllPages = useCallback(async () => {
    setDownloadingAll(true);
    setDownloadProgress(0);
    const zip = new JSZip();
    const pages = filteredPages;

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      setDownloadProgress(Math.round(((i) / pages.length) * 100));
      const blob = await capturePageAsBlob(page.path);
      if (blob) {
        const fileName = `${String(i + 1).padStart(2, "0")}-${page.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.png`;
        zip.file(fileName, blob);
      }
    }

    setDownloadProgress(100);
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);
    link.download = `shero-app-screenshots-${activeCategory.toLowerCase()}.zip`;
    link.click();
    URL.revokeObjectURL(link.href);

    setDownloadingAll(false);
    setDownloadProgress(0);
  }, [filteredPages, activeCategory, capturePageAsBlob]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">📸 App Screenshots Gallery</h1>
            <p className="text-muted-foreground text-sm">
              All {allPages.length} pages • Click to preview, download individual pages, or print all
            </p>
          </div>
          <div className="flex gap-2 print:hidden">
            <button
              onClick={downloadAllPages}
              disabled={downloadingAll}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {downloadingAll ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {downloadProgress}%
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download All ({filteredPages.length})
                </>
              )}
            </button>
            <button
              onClick={printGallery}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 mb-6 flex-wrap print:hidden">
          {categories.map(cat => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(cat.label)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat.label
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Full-size modal */}
        {selectedPage && (
          <div className="fixed inset-0 bg-black/80 z-50 flex flex-col print:hidden" onClick={() => setSelectedPage(null)}>
            <div className="flex items-center justify-between p-4 text-white">
              <span className="text-lg font-semibold">
                {allPages.find(p => p.path === selectedPage)?.name} — {selectedPage}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); downloadPage(selectedPage, allPages.find(p => p.path === selectedPage)?.name || "page"); }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-sm"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); openInNewTab(selectedPage); }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm"
                >
                  <ExternalLink className="w-4 h-4" /> Open Tab
                </button>
                <button onClick={() => setSelectedPage(null)} className="text-2xl hover:text-red-400">✕</button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4" onClick={e => e.stopPropagation()}>
              <iframe
                src={`${baseUrl}${selectedPage}`}
                className="w-full rounded-lg shadow-2xl bg-card"
                style={{ height: "3000px", maxWidth: "430px", margin: "0 auto", display: "block" }}
                title={selectedPage}
              />
            </div>
          </div>
        )}

        {/* Page grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPages.map(page => (
            <div
              key={page.path}
              className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-xl hover:border-primary/50 transition-all"
            >
              <div
                className="relative h-[300px] overflow-hidden bg-muted cursor-pointer"
                onClick={() => setSelectedPage(page.path)}
              >
                <iframe
                  src={`${baseUrl}${page.path}`}
                  className="w-[430px] h-[900px] origin-top-left pointer-events-none"
                  style={{ transform: "scale(0.47)" }}
                  title={page.name}
                  loading="lazy"
                />
              </div>
              <div className="p-3 border-t border-border flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{page.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono">{page.path}</p>
                </div>
                <div className="flex gap-1 print:hidden">
                  <button
                    onClick={() => downloadPage(page.path, page.name)}
                    disabled={downloading === page.path}
                    className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    title="Download as PNG"
                  >
                    {downloading === page.path ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openInNewTab(page.path)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScreenshotsGallery;
