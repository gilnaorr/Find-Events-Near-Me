// location.js — device-location service (real, via expo-location).
//
// Reads the device's coordinate through the native location API (works in Expo Go).
// `withDistances` then tags each event with its true distance from that coordinate.
import * as Location from "expo-location";

// Fallback location, used when permission is denied or unavailable (mode "city").
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

// Attach the true distance (mi) from `coord` to each event's own location. Events keep
// their real lat/lng, so the distance reflects the device's actual position and updates
// as it moves. (No coord → events returned unchanged.)
export function withDistances(events, coord) {
  if (!coord) return events;
  return events.map((e) => ({ ...e, distance_mi: distanceTo(coord, e.lat, e.lng) }));
}
