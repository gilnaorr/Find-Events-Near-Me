// location.js — device-location service.
//
// In production this wraps the native location API (iOS CLLocationManager /
// `expo-location`): request permission, then read the device coordinate and
// sort/score events by real distance. For the Expo demo we MIMIC a fixed device
// fix at 1 Mt Pleasant Rd, Toronto — swap `getDeviceLocation` for a real
// `Location.getCurrentPositionAsync()` call to go live.

export const DEVICE_LOCATION = {
  label: "1 Mt Pleasant Rd",
  neighborhood: "Rosedale",
  city: "Toronto, ON",
  area: "Rosedale, Toronto", // shown in the header
  lat: 43.6738,
  lng: -79.3793,
};

// Returns the current device coordinate. Mimicked for the demo; production would
// `await Location.requestForegroundPermissionsAsync()` then `getCurrentPositionAsync()`.
export async function getDeviceLocation() {
  return DEVICE_LOCATION;
}

// Great-circle distance in miles (Haversine) — what CLLocation.distance(from:)
// gives natively, formatted to miles like MeasurementFormatter would.
export function haversineMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8; // earth radius, miles
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const distanceFromDevice = (lat, lng) =>
  Math.round(haversineMiles(DEVICE_LOCATION.lat, DEVICE_LOCATION.lng, lat, lng) * 10) / 10;
