// location.js — device-location service (real, via expo-location).
//
// Reads the device's coordinate through the native location API (works in Expo Go).
// The mock events are defined relative to DEFAULT_LOCATION; `anchorEventsTo` translates
// that arrangement onto the live coordinate so events stay "near me" wherever you are.
import * as Location from "expo-location";

// Fallback / sample anchor. Used when permission is denied or unavailable, and as the
// origin the mock events are positioned relative to.
export const DEFAULT_LOCATION = {
  area: "Current location", // generic header label
  lat: 43.6738,
  lng: -79.3793,
  mode: "city",
};

// Current foreground permission status: "granted" | "denied" | "undetermined".
export async function getPermissionStatus() {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status;
  } catch {
    return "undetermined";
  }
}

// Reads the device coordinate. If `request` is true, prompts for permission first
// (the real OS dialog). Returns { lat, lng, mode } — falls back to DEFAULT_LOCATION
// (mode "city") if permission is denied or the read fails.
export async function getDeviceLocation({ request = false } = {}) {
  try {
    const perm = request
      ? await Location.requestForegroundPermissionsAsync()
      : await Location.getForegroundPermissionsAsync();
    if (perm.status !== "granted") {
      return { ...DEFAULT_LOCATION };
    }
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Low, // neighborhood-level; privacy-respecting
    });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude, mode: "precise", area: "Current location" };
  } catch {
    return { ...DEFAULT_LOCATION };
  }
}

// Great-circle distance in miles (Haversine).
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

// Distance (mi, 1 decimal) from a coordinate to a point.
export const distanceTo = (coord, lat, lng) =>
  Math.round(haversineMiles(coord.lat, coord.lng, lat, lng) * 10) / 10;

// Re-anchor events around `coord`: translate each event's lat/lng offset from
// DEFAULT_LOCATION onto `coord` so events sit the same small distance away (staying
// "near me"), and recompute `distance_mi`. With coord === DEFAULT_LOCATION this is the
// identity. (Distances stay realistic; they aren't bit-identical across large latitude
// shifts, since a degree of longitude covers different ground distance by latitude.)
export function anchorEventsTo(events, coord) {
  if (!coord) return events;
  const dLat = coord.lat - DEFAULT_LOCATION.lat;
  const dLng = coord.lng - DEFAULT_LOCATION.lng;
  return events.map((e) => {
    const lat = e.lat + dLat;
    const lng = e.lng + dLng;
    return { ...e, lat, lng, distance_mi: distanceTo(coord, lat, lng) };
  });
}
