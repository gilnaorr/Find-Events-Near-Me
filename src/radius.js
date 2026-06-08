// radius.js — search-radius bounds + input validation. Pure (no RN imports) so it's
// shared by SettingsScreen and unit-tested in isolation.

export const RADIUS_MIN = 1;
export const RADIUS_MAX = 250;

// Validate a user-entered radius string. Returns { error, value }:
//   value — the parsed integer when valid (commit it); otherwise null
//   error — a human-readable message when invalid; null only when valid
export function validateRadius(text) {
  const s = String(text).trim();
  if (s === "") return { error: `Enter a radius (${RADIUS_MIN}–${RADIUS_MAX})`, value: null };
  if (!/^\d+$/.test(s)) return { error: "Numbers only", value: null };
  const n = parseInt(s, 10);
  if (n < RADIUS_MIN) return { error: `Minimum is ${RADIUS_MIN} mile`, value: null };
  if (n > RADIUS_MAX) return { error: `Maximum is ${RADIUS_MAX} miles`, value: null };
  return { error: null, value: n };
}
