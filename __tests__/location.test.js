// Unit test 1 — distance + per-event distance attach (src/location.js).
// "Distance to event" and "events near me" depend on a correct great-circle
// computation and attaching the true distance from the device to each event.
import { haversineMiles, distanceTo, withDistances, DEFAULT_LOCATION } from "../src/location";

test("haversine is zero/symmetric, distanceTo bands correctly, and withDistances measures from the coordinate", () => {
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

  // withDistances keeps each event's own lat/lng and sets distance_mi to the true
  // distance from the given coordinate — so it changes with the device's position.
  const ev = [{ id: "x", lat: 43.7, lng: -79.4 }];
  const here = { lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lng };
  const far = { lat: 40, lng: -75 };
  const [near] = withDistances(ev, here);
  const [away] = withDistances(ev, far);
  expect(near.lat).toBe(43.7); // event location is untouched
  expect(near.lng).toBe(-79.4);
  expect(near.distance_mi).toBe(distanceTo(here, 43.7, -79.4));
  expect(away.distance_mi).toBe(distanceTo(far, 43.7, -79.4));
  expect(away.distance_mi).toBeGreaterThan(near.distance_mi); // farther device → larger distance
  expect(near.id).toBe("x"); // other fields preserved
});
