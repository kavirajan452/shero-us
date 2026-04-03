import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// ============================================
// REPLACE THESE WITH YOUR ACTUAL IDs
// ============================================
const GA_MEASUREMENT_ID = "G-XXXXXXXXXX"; // Google Analytics 4
const META_PIXEL_ID = "XXXXXXXXXXXXXXX"; // Meta (Facebook) Pixel

// ---------- Google Analytics 4 ----------
function loadGA4() {
  if (document.getElementById("ga4-script")) return;

  const script = document.createElement("script");
  script.id = "ga4-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(args);
  }
  (window as any).gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID, {
    send_page_view: false, // we send manually on route change
  });
}

function trackGA4PageView(path: string, title: string) {
  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", "page_view", {
      page_path: path,
      page_title: title,
    });
  }
}

// ---------- Meta Pixel ----------
function loadMetaPixel() {
  if ((window as any).fbq) return;

  (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  (window as any).fbq("init", META_PIXEL_ID);
}

function trackMetaPageView() {
  if (typeof (window as any).fbq === "function") {
    (window as any).fbq("track", "PageView");
  }
}

// ---------- Time on Page ----------
function trackTimeOnPage(path: string) {
  const startTime = Date.now();

  return () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    if (timeSpent > 0 && typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "time_on_page", {
        page_path: path,
        time_seconds: timeSpent,
        engagement_time_msec: timeSpent * 1000,
      });
    }
  };
}

// ---------- Component ----------
const Analytics = () => {
  const location = useLocation();
  const cleanupRef = useRef<(() => void) | null>(null);

  // Load scripts once
  useEffect(() => {
    if (GA_MEASUREMENT_ID !== "G-XXXXXXXXXX") {
      loadGA4();
    }
    if (META_PIXEL_ID !== "XXXXXXXXXXXXXXX") {
      loadMetaPixel();
    }
  }, []);

  // Track on route change
  useEffect(() => {
    // Flush previous page time
    if (cleanupRef.current) {
      cleanupRef.current();
    }

    const path = location.pathname + location.search;
    const title = document.title;

    trackGA4PageView(path, title);
    trackMetaPageView();

    cleanupRef.current = trackTimeOnPage(path);

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [location]);

  return null;
};

export default Analytics;
