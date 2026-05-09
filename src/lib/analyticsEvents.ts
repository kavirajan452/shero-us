export function trackEvent(name: string, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  if (typeof window.gtag === "function") {
    window.gtag("event", name, payload);
  }

  if (typeof window.fbq === "function") {
    window.fbq("trackCustom", name, payload);
  }
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}
