// Unit test 1 — distance + re-anchoring (src/location.js).
// "Distance to event" and "events near me" depend on a correct great-circle
// computation and an offset-preserving re-anchor around the live coordinate.
import { haversineMiles, distanceTo, anchorEventsTo, DEFAULT_LOCATION } from "../src/location";

test("haversine is zero/symmetric, distanceTo bands correctly, and anchorEventsTo preserves relative distance", () => {
  // Distance from a point to itself is 0; the function is symmetric.
  expect(haversineMiles(43.6738, -79.3793, 43.6738, -79.3793)).toBe(0);
  const ab = haversineMiles(43.67, -79.38, 43.66, -79.4);
  const ba = haversineMiles(43.66, -79.4, 43.67, -79.38);
  expect(ab).toBeCloseTo(ba, 9);

  // distanceTo from the anchor to ~0.01° north (~0.7 mi), rounded to 0.1.
  const d = distanceTo(DEFAULT_LOCATION, DEFAULT_LOCATION.lat + 0.01, DEFAULT_LOCATION.lng);
  expect(d).toBeGreaterThan(0.5);
  expect(d).toBeLessThan(0.9);
  expect(Number.isInteger(d * 10)).toBe(true);

  // anchorEventsTo translates an event by the (coord - DEFAULT) delta so it sits the
  // same small offset away from the new coordinate (distance stays realistic/nearby),
  // and recomputes distance_mi relative to that coordinate.
  const ev = [{ id: "x", lat: DEFAULT_LOCATION.lat + 0.01, lng: DEFAULT_LOCATION.lng - 0.02, price_from: 0 }];
  const coord = { lat: 40, lng: -75 };
  const [out] = anchorEventsTo(ev, coord);
  expect(out.lat).toBeCloseTo(40.01, 9); // translated by the same lat/lng delta
  expect(out.lng).toBeCloseTo(-75.02, 9);
  expect(out.distance_mi).toBeGreaterThan(0); // recomputed, still nearby (< a few mi)
  expect(out.distance_mi).toBeLessThan(3);
  expect(out.id).toBe("x"); // other fields preserved
});
