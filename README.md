# Find Events Near Me — React Native / Expo

A working React Native (Expo) port of the **Find Events Near Me** design: a small,
production-minded app that lists nearby events, lets you bookmark them, shows event
detail with deep-link directions, and surfaces every architectural state (cold start,
fresh / stale / offline cache, slow image decode, API errors, permission flow,
low-data mode).

The original handoff was a high-fidelity HTML/React prototype documenting an iOS /
SwiftUI architecture. This repo recreates that design pixel-for-pixel in React Native
so it runs on a real device via Expo.

## Run it

```bash
npm install
npx expo start
```

Then press `i` for the iOS simulator, `a` for Android, or scan the QR code with
**Expo Go** on your phone.

## Tweaks (engineering states)

Tap the **sliders** button (bottom-right, above the tab bar) to open the Tweaks
sheet — the same panel from the prototype:

| Tweak             | Simulates                                                        |
|-------------------|-----------------------------------------------------------------|
| Theme             | Light / Dark.                                                   |
| Connection        | Online / Offline — flips the network stub, surfaces banners.    |
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

- Real map tiles (abstract SVG streets stand in — MapKit in production).
- Real photos (striped placeholders, by design).
- Real location services (the permission flow is the prototype's simulated alert).
- Auth, push, payments, analytics, i18n beyond locale date/number formatting.
