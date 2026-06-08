// Unit test 4 — search-radius input validation (src/radius.js).
// Guards the Settings radius field: only whole miles in [RADIUS_MIN, RADIUS_MAX]
// commit; everything else returns a human error and no value.
import { validateRadius, RADIUS_MIN, RADIUS_MAX } from "../src/radius";

test("validateRadius accepts whole miles in range and rejects everything else", () => {
  // Valid values → parsed integer, no error.
  expect(validateRadius("40")).toEqual({ error: null, value: 40 });
  expect(validateRadius(String(RADIUS_MIN))).toEqual({ error: null, value: RADIUS_MIN });
  expect(validateRadius(String(RADIUS_MAX))).toEqual({ error: null, value: RADIUS_MAX });
  expect(validateRadius("  7 ")).toEqual({ error: null, value: 7 }); // trims whitespace

  // Empty → prompt, no value.
  expect(validateRadius("")).toMatchObject({ value: null });
  expect(validateRadius("   ").value).toBeNull();

  // Non-numeric / decimals / signs → "Numbers only", no value.
  expect(validateRadius("abc")).toEqual({ error: "Numbers only", value: null });
  expect(validateRadius("4.5")).toEqual({ error: "Numbers only", value: null });
  expect(validateRadius("-5")).toEqual({ error: "Numbers only", value: null });

  // Below the minimum → min error, no value.
  expect(validateRadius("0")).toEqual({ error: `Minimum is ${RADIUS_MIN} mile`, value: null });

  // Above the maximum → max error, no value.
  expect(validateRadius(String(RADIUS_MAX + 1))).toEqual({
    error: `Maximum is ${RADIUS_MAX} miles`,
    value: null,
  });
  expect(validateRadius("9999").value).toBeNull();

  // The advertised bounds.
  expect(RADIUS_MIN).toBe(1);
  expect(RADIUS_MAX).toBe(250);
});
