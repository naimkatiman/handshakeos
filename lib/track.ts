// Funnel events, in funnel order. The route rejects any name not listed here.
export const EVENTS = [
  "landing_view",
  "audit_peak",
  "cta_click",
  "capture_view",
  "sample_run",
  "own_analyse",
  "plan_created",
  "guide_verify",
  "guide_confirm",
  "guide_done",
  "dashboard_view",
] as const;
export type EventName = (typeof EVENTS)[number];

/** Random per-tab id. No cookie, no personal data. */
function sessionId() {
  try {
    let id = sessionStorage.getItem("hs:sid");
    if (!id) {
      id = Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
      sessionStorage.setItem("hs:sid", id);
    }
    return id;
  } catch {
    return "anon" + Math.random().toString(36).slice(2, 10);
  }
}

/** Fire-and-forget. Never throws, never blocks navigation. */
export function track(name: EventName, meta?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({ name, sid: sessionId(), path: location.pathname, meta });
    if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) {
      fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    }
  } catch {
    /* tracking must never break the page */
  }
}
