// Unit test 2 — network stub behavior (src/api.js fakeFetchEvents).
// Verifies the three outcomes the cache/error policy relies on: offline rejection,
// server-error rejection, and a well-formed success payload.
import { fakeFetchEvents } from "../src/api";

test("fakeFetchEvents rejects when offline, rejects at full error rate, and resolves online", async () => {
  // Offline → rejects before any 'random' roll.
  await expect(fakeFetchEvents({ online: false })).rejects.toThrow("offline");

  // errorRate = 1 → always a server error (Math.random() < 1 is always true).
  await expect(fakeFetchEvents({ online: true, errorRate: 1 })).rejects.toThrow("server_error");

  // Online + errorRate = 0 → deterministic success with a well-formed payload.
  const res = await fakeFetchEvents({ online: true, errorRate: 0 });
  expect(Array.isArray(res.events)).toBe(true);
  expect(res.events.length).toBeGreaterThan(0);
  expect(res.events[0]).toHaveProperty("id");
  expect(res.events[0]).toHaveProperty("image_url");
  expect(typeof res.server_time).toBe("string");
  expect(Number.isNaN(Date.parse(res.server_time))).toBe(false);
}, 10000);
