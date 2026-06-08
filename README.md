# Find Events Near Me — React Native / Expo

A working React Native (Expo) port of the **Find Events Near Me** design: a small,
production-minded app that lists nearby events, lets you bookmark them, shows event
detail with deep-link directions, and surfaces every architectural state (cold start,
fresh / stale / offline cache, slow image decode, API errors, permission flow,
low-data mode).

The original handoff was a high-fidelity HTML/React prototype documenting an iOS /
SwiftUI architecture. This repo recreates that design pixel-for-pixel in React Native
so it runs on a real device via Expo.

> **Architecture:** see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for a full
> walkthrough of the layers, Architecture and Sequence Diagrams, and how each file fits together.
> **Tests:** see [`docs/Unit-Tests.md`](docs/Unit-Tests.md) (`npm test`).

## Features

Core (from the brief): list nearby events, bookmark them ("Saved" tab, persisted to
the local DB), event detail, distance-to-event from the device location, deep-link to
a maps app for directions, image + API-response caching, background refresh, graceful
network-failure handling.

**Beyond the initial brief** — these weren't in the original written description; most
came with the design prototype and are kept because they make the demo realistic:

- **Category filter** — horizontal chips on the Nearby screen (All / Live music /
  Market / Workshop / Sports / Comedy / Art) filter the list client-side.
- **Freshness chip** — header pill showing cache state + age (Live · 2m / Stale / Offline);
  the Offline state reflects **real device connectivity** via `expo-network`.
- **Light / Dark theme.**
- **Tweaks panel** — a developer overlay to drive every engineering state (see below);
  not a shipping feature, it exists so the architecture is reviewable.
- **Map tab** — a real interactive map (Leaflet + OpenStreetMap in a WebView) centered
  on your live location, with tappable event price-pins and a "you are here" marker.
- **Event images** — each event carries an `image_url` rendered via `expo-image`
  (added per review request; the original prototype used striped placeholders).

Location uses the device's **native location API** via `expo-location` (the real OS
permission prompt + `getCurrentPositionAsync()`; works in Expo Go). Because the events
are synthetic, they're **re-anchored** around your live coordinate so they stay nearby
wherever you are (`src/location.js`). If permission is denied, it falls back to a
default coordinate so the app still renders.

## Run it

```bash
npm install
npx expo start
```

Then scan the QR with **Expo Go** on your phone (works on iOS and Android — same
JS bundle). `a` opens an Android emulator and `i` opens the iOS simulator if you have
the respective SDK installed (the iOS simulator requires full Xcode).

## Tweaks (engineering states)

Tap the **sliders** button (bottom-right, above the tab bar) to open the Tweaks
sheet — the same panel from the prototype:

| Tweak             | Simulates                                                        |
|-------------------|-----------------------------------------------------------------|
| Theme             | Light / Dark.                                                   |
| Connection        | Online uses **real** device connectivity (`expo-network`); Offline forces it for demos. |
| API errors        | Off / Intermittent (50%) / Always — exercises the retry path.   |
| Cache on start    | Fresh / Stale / Empty — proves TTL + cold-start UX.             |
| Data mode         | Full / Low — gates image decoding.                              |
| Show permission   | Replays the first-run location-permission flow.                 |
| Clear cache & bookmarks | Wipes local storage; watch the empty-state + refresh.     |

## Architecture (as built here)

| Layer        | Web prototype          | This RN app                                  |
|--------------|------------------------|----------------------------------------------|
| Presentation | React + CSS            | React Native + `StyleSheet`                  |
| Local DB     | `localStorage`         | `@react-native-async-storage/async-storage` (`src/db.js`) |
| Remote API   | `fakeFetchEvents`      | same latency/error stub (`src/api.js`)        |
| Cache        | TTL + stale-while-revalidate | identical policy in `App.js`            |
| Glass / blur | `backdrop-filter`      | `expo-blur` (`src/components/Glass.js`)       |
| Gradients    | CSS radial gradients   | `react-native-svg` (`ScreenBackground`, `ImgPlaceholder`) |
| Icons        | inline SVG             | `react-native-svg` (`src/icons.js`)           |
| Maps links   | `window.__toast`       | `Linking.openURL` (Apple / Google / Waze)     |
| Event images | striped placeholders   | `expo-image` w/ memory+disk cache (`src/components/EventImage.js`) |
| Location     | `"Mission, SF"` string | `expo-location` (real) + Haversine + re-anchor (`src/location.js`) |
| Map          | abstract SVG streets   | Leaflet/OSM in a `react-native-webview` (`src/components/LeafletMap.js`) |
| Haptics      | —                      | `expo-haptics` on bookmark toggle             |
| Colors       | `oklch(...)`           | converted to hex/rgba by `gen-theme.js` → `src/theme.js` |

`src/theme.js` is generated: `node gen-theme.js` re-derives the palette from the
design's exact oklch tokens.

### Cache strategy

`App.js` owns the cache-then-network policy with a 15-minute TTL:

- **fresh** (under TTL) → show cached, no network.
- **stale** (over TTL) → show cached *and* refresh in the background.
- **empty** → fetch, show skeletons.

The freshness chip in the header (Live / Stale / Offline + age) tells the user which
truth they're looking at. Coming back online with a stale cache auto-refreshes once;
background refresh runs every 30s while foregrounded (≈30 min in production).

## Out of scope (matches the original brief)

- Native map SDK — the map is real (Leaflet + OpenStreetMap) but rendered in a WebView
  so it runs in Expo Go; map tiles need network (the events list still works offline).
  A native build would use MapKit / Google Maps.
- Continuous location tracking — one-shot `getCurrentPositionAsync()` on grant, not a
  live `watchPositionAsync` subscription.
- Real venues at your location — events are synthetic and re-anchored around your live
  coordinate, so addresses are illustrative.
- User-uploaded photos — event images are stock (Unsplash) referenced by URL; there's
  no upload pipeline.
- Auth, push, payments, analytics, i18n beyond locale date/number formatting.
