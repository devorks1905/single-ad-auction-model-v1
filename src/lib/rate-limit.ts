/**
 * Basit in-memory rate limiter.
 * Üretimde birden fazla instance varsa Redis/Upstash kullanılmalı.
 */

const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000; // 1 dakika
const MAX_REQUESTS = 10;  // pencere başına max istek

/**
 * Rate limit kontrolü yapar.
 * @param key - Genellikle IP adresi
 * @param limit - Pencere başına max istek (varsayılan 10)
 * @param windowMs - Pencere süresi ms cinsinden (varsayılan 60s)
 * @returns { limited: boolean, remaining: number, resetAt: number }
 */
export function rateLimit(
  key: string,
  limit = MAX_REQUESTS,
  windowMs = WINDOW_MS
): { limited: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { limited: true, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { limited: false, remaining: limit - entry.count, resetAt: entry.resetAt };
}

/** İstekten IP adresini çıkarır. */
export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

/** Eski girişleri temizler (periyodik çağrılabilir). */
export function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}

// Her 5 dakikada bir temizle
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimits, 5 * 60_000);
}
