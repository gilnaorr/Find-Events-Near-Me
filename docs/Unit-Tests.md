# Unit Tests

Three unit tests cover the app's pure, high-value core logic — the parts where a
regression would silently break behavior: **distance-to-event**, the **network
layer's outcomes**, and the **cache freshness / TTL policy**.

## Tooling & how to run

- **Runner:** [Jest](https://jestjs.io/) with the **`jest-expo`** preset (the
  Expo/React Native standard), configured in `package.json` (`"jest": { "preset":
  "jest-expo" }`).
- **Location:** tests live in `__tests__/`.

```bash
npm test          # or: npx jest
```

Latest run:

```
PASS __tests__/cache.test.js
PASS __tests__/location.test.js
PASS __tests__/api.test.js

Test Suites: 3 passed, 3 total
Tests:       3 passed, 3 total
Time:        5.447 s
```

---

## Test 1 — Distance & re-anchoring

**File:** `__tests__/location.test.js` · **Unit under test:** `haversineMiles` /
`distanceTo` / `anchorEventsTo` (`src/location.js`)

**Why it matters.** Every event shows a "distance from you," the Map places a "you are
here" marker, and events are **re-anchored** around the live device coordinate so they
stay nearby wherever you are. All of this rests on a correct great-circle computation
and an offset-preserving translation — a bug corrupts "events *near me*" without throwing.

**What it asserts.**
- Distance from a point to itself is exactly `0`; the function is **symmetric**
  (`dist(A,B) === dist(B,A)` to 9 decimals).
- `distanceTo` from the anchor to a point ~0.01° north lands in a tight band
  (`0.5–0.9 mi`) and is **rounded to one decimal** — guards against unit errors
  (km vs mi) or a wrong radius.
- `anchorEventsTo` **translates** an event by the `(coord − DEFAULT)` lat/lng delta
  (exact) and **recomputes** `distance_mi` to a realistic nearby value (`0 < d < 3 mi`),
  while preserving the event's other fields.

---

## Test 2 — Network stub behavior

**File:** `__tests__/api.test.js` · **Unit under test:** `fakeFetchEvents`
(`src/api.js`)

**Why it matters.** The cache and error-handling policy branches entirely on what the
network call does. The three outcomes below are the contract the rest of the app is
written against; if any flips, the offline banner, retry path, or happy path breaks.

**What it asserts.**
- **Offline** (`online: false`) → the promise **rejects** with `"offline"`.
- **Full error rate** (`errorRate: 1`) → **rejects** with `"server_error"`.
- **Online, no errors** (`errorRate: 0`) → **resolves** with a well-formed payload:
  a non-empty `events` array whose items have `id` and `image_url`, plus a parseable
  ISO `server_time`.

The success and error cases are deterministic by construction (`Math.random() < 0` is
never true; `Math.random() < 1` is always true), so the test needs no mocking. A
10 s timeout accommodates the stub's simulated 700–1100 ms latency.

---

## Test 3 — Cache freshness / TTL policy

**File:** `__tests__/cache.test.js` · **Unit under test:** `cacheFreshness` /
`cacheAgeSeconds` (`src/api.js`)

**Why it matters.** This is the **stale-while-revalidate** decision: it drives the
header freshness chip (Live vs Stale) and whether a background refresh fires. These
helpers were extracted from `App.js` specifically so the policy is testable in
isolation (and `App.js` now calls them, so the tested code is the code that runs).

**What it asserts.**
- A cache **1 minute old** → `"fresh"` (well under the 15-minute TTL).
- A cache **exactly at the TTL** → `"stale"` (boundary is `< TTL`, so the boundary is
  not fresh).
- A cache **past the TTL** → `"stale"`.
- `cacheAgeSeconds` returns floored elapsed seconds, and **clamps to `0`** for a
  missing fetch time or a clock-skewed *future* timestamp.

---

## Scope note

These are **logic** unit tests (pure functions, no UI). Component/render tests
(`@testing-library/react-native`) and integration tests of the `App.js` cache
orchestration are sensible next steps but out of scope for this set of three.
