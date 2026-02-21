const STORAGE_KEY = "tunele-correlation_id";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Returns a sticky correlation ID that persists across page refreshes and OAuth redirects.
 * Uses a 24-hour sliding window: the TTL resets every time the ID is used.
 *
 * Falls back to a fresh in-memory ID if localStorage is unavailable.
 */
export function getStickyCorrelationId(): string {
  try {
    const now = Date.now();
    const raw = localStorage.getItem(STORAGE_KEY);
    const stored = raw ? JSON.parse(raw) : null;

    const id =
      stored && typeof stored.id === "string" && stored.expiresAt > now
        ? stored.id
        : crypto.randomUUID();

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id, expiresAt: now + TTL_MS }));

    return id;
  } catch {
    return crypto.randomUUID();
  }
}
