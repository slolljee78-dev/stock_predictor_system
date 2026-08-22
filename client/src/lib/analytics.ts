type AnalyticsParameters = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: "event", eventName: string, parameters?: AnalyticsParameters) => void;
  }
}

/** Sends a GA4 event when analytics is available without making any product flow depend on it. */
export function trackProductEvent(eventName: string, parameters: AnalyticsParameters = {}) {
  if (typeof window === "undefined") {
    return;
  }

  window.gtag?.("event", eventName, parameters);
}
