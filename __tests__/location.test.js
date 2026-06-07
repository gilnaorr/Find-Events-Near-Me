// Unit test 1 — distance calculation (src/location.js).
// The "distance to event" feature depends on a correct great-circle computation.
import { haversineMiles, distanceFromDevice, DEVICE_LOCATION } from "../src/location";

test("haversineMiles is zero at a point, symmetric, and distanceFromDevice rounds to a sane value", () => {
  // Distance from a point to itself is exactly 0.
  expect(haversineMiles(43.6738, -79.3793, 43.6738, -79.3793)).toBe(0);

  // The function is symmetric (A→B === B→A).
  const ab = haversineMiles(43.67, -79.38, 43.66, -79.4);
  const ba = haversineMiles(43.66, -79.4, 43.67, -79.38);
  expect(ab).toBeCloseTo(ba, 9);

  // Device (1 Mt Pleasant Rd) → AGO (43.6536, -79.3925) is ~1.5 mi; assert the
  // rounded, device-relative helper lands in a tight, known band.
  const d = distanceFromDevice(43.6536, -79.3925);
  expect(d).toBeGreaterThan(1.3);
  expect(d).toBeLessThan(1.7);

  // distanceFromDevice rounds to one decimal place.
  expect(Number.isInteger(d * 10)).toBe(true);

  // Sanity: the device location object exposes the coordinate the helper uses.
  expect(typeof DEVICE_LOCATION.lat).toBe("number");
  expect(typeof DEVICE_LOCATION.lng).toBe("number");
});
