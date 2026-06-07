// api.js — Simulated network layer. In production: URLSession with ETag +
// If-Modified-Since. Models latency (700–1100ms), connectivity, error rate.
import { MOCK_EVENTS } from "./data";

// Cache TTL — 15 minutes. "fresh" while under TTL, "stale" once exceeded.
export const CACHE_TTL_SEC = 15 * 60;

export function fakeFetchEvents({ online, errorRate = 0 }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!online) return reject(new Error("offline"));
      if (Math.random() < errorRate) return reject(new Error("server_error"));
      resolve({ events: MOCK_EVENTS, server_time: new Date().toISOString() });
    }, 700 + Math.random() * 400);
  });
}

// Pure cache-policy helpers (the stale-while-revalidate math), extracted so the
// freshness decision is testable in isolation. `fetchedAtSec`/`nowSec` are epoch
// seconds; a missing or future fetch time clamps the age to 0.
export function cacheAgeSeconds(fetchedAtSec, nowSec) {
  if (!fetchedAtSec) return 0;
  return Math.max(0, Math.floor(nowSec - fetchedAtSec));
}

export function cacheFreshness(fetchedAtSec, nowSec) {
  return cacheAgeSeconds(fetchedAtSec, nowSec) < CACHE_TTL_SEC ? "fresh" : "stale";
}
