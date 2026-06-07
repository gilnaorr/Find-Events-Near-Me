// Unit test 3 — cache freshness / TTL policy (src/api.js).
// This is the stale-while-revalidate decision that drives the freshness chip and
// whether a background refresh fires.
import { cacheFreshness, cacheAgeSeconds, CACHE_TTL_SEC } from "../src/api";

test("cacheFreshness is fresh under the TTL and stale past it; age clamps to >= 0", () => {
  const now = 1_000_000; // arbitrary epoch-seconds "now"

  // 1 minute old → well under the 15-minute TTL → fresh.
  expect(cacheFreshness(now - 60, now)).toBe("fresh");

  // Exactly at the TTL boundary is no longer "< TTL" → stale.
  expect(cacheFreshness(now - CACHE_TTL_SEC, now)).toBe("stale");

  // Comfortably past the TTL → stale.
  expect(cacheFreshness(now - (CACHE_TTL_SEC + 600), now)).toBe("stale");

  // Age is the floored elapsed seconds...
  expect(cacheAgeSeconds(now - 90, now)).toBe(90);

  // ...clamped to 0 for a missing fetch time or a clock-skewed future timestamp.
  expect(cacheAgeSeconds(undefined, now)).toBe(0);
  expect(cacheAgeSeconds(now + 50, now)).toBe(0);
});
