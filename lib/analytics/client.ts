"use client";

const SESSION_KEY = "yeoun.analytics.session_id";

function createSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getAnalyticsSessionId() {
  if (typeof window === "undefined") return "";

  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const next = createSessionId();
  window.localStorage.setItem(SESSION_KEY, next);
  return next;
}

type TrackEventPayload = {
  eventName: string;
  userId?: string | null;
  path?: string;
  metadata?: Record<string, unknown>;
};

export async function trackEvent(payload: TrackEventPayload) {
  if (typeof window === "undefined") return;

  const sessionId = getAnalyticsSessionId();
  if (!sessionId) return;

  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        eventName: payload.eventName,
        sessionId,
        userId: payload.userId ?? null,
        path: payload.path ?? window.location.pathname,
        metadata: payload.metadata ?? {},
      }),
    });
  } catch {
    // Analytics failures should not block user actions.
  }
}
