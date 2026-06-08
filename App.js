// App.js — shell: state, navigation, cache layer, tweaks. Ports the prototype's
// App component to React Native. The "DB" is AsyncStorage; the network is a
// latency/error-modelling stub. Cache uses stale-while-revalidate with a 15m TTL.
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { useNetInfo } from "@react-native-community/netinfo";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { InstrumentSerif_400Regular, InstrumentSerif_400Regular_Italic } from "@expo-google-fonts/instrument-serif";
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium } from "@expo-google-fonts/jetbrains-mono";

import { ThemeProvider, useTheme } from "./src/ThemeContext";
import { DB } from "./src/db";
import { fakeFetchEvents, CACHE_TTL_SEC, cacheAgeSeconds, cacheFreshness } from "./src/api";
import { MOCK_EVENTS } from "./src/data";
import { getDeviceLocation, getPermissionStatus, anchorEventsTo, DEFAULT_LOCATION } from "./src/location";
import { Icons } from "./src/icons";

import TabBar, { TAB_BAR_HEIGHT } from "./src/components/TabBar";
import Toast from "./src/components/Toast";
import GlassButton from "./src/components/GlassButton";
import PermissionScreen from "./src/screens/PermissionScreen";
import NearbyScreen from "./src/screens/NearbyScreen";
import DetailScreen from "./src/screens/DetailScreen";
import MapScreen from "./src/screens/MapScreen";
import SavedScreen from "./src/screens/SavedScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import TweaksSheet from "./src/screens/TweaksSheet";

const TWEAK_DEFAULTS = {
  theme: "light",
  connection: "online",
  cacheStart: "fresh",
  dataMode: "full",
  errorMode: "off",
  showPermission: false,
};

function TweaksGearButton({ onPress, bottom }) {
  const { t } = useTheme();
  return (
    <GlassButton
      size={44}
      strong
      onPress={onPress}
      style={{ position: "absolute", right: 16, bottom, zIndex: 41 }}
    >
      <Icons.Sliders size={18} color={t.ink2} />
    </GlassButton>
  );
}

function Shell() {
  const insets = useSafeAreaInsets();
  const [tweaks, setTweaks] = useState(TWEAK_DEFAULTS);
  const setTweak = useCallback((k, v) => setTweaks((p) => ({ ...p, [k]: v })), []);
  const dark = tweaks.theme === "dark";

  // persistent state
  const [hydrated, setHydrated] = useState(false);
  const [bookmarks, setBookmarks] = useState(() => new Set());
  const [prefs, setPrefs] = useState({ lowDataMode: false, bgRefresh: true, notify: false, locationMode: "precise", radiusMi: 40 });
  const [cache, setCache] = useState(null);

  // ephemeral state
  const [tab, setTab] = useState("nearby");
  const [openEventId, setOpenEventId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [now, setNow] = useState(() => Date.now() / 1000);
  const [granted, setGranted] = useState(true);
  const [coords, setCoords] = useState(DEFAULT_LOCATION);
  const [toast, setToast] = useState(null);
  const [tweaksOpen, setTweaksOpen] = useState(false);

  // Real device connectivity via NetInfo (reliable real-time listener + active
  // internet-reachability probe). Offline if EITHER signal is explicitly false
  // (e.g. airplane mode, or connected to Wi-Fi with no internet). Unknown (null,
  // before the first probe) is treated as online. Tweaks "Connection: offline"
  // forces offline for demos.
  const net = useNetInfo();
  const deviceOnline = (net.isConnected ?? true) && (net.isInternetReachable ?? true);
  const online = tweaks.connection === "offline" ? false : deviceOnline;
  const errorRate = tweaks.errorMode === "always" ? 1 : tweaks.errorMode === "intermittent" ? 0.5 : 0;

  const doRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    setFetchError(null);
    try {
      const res = await fakeFetchEvents({ online, errorRate });
      setCache({ events: res.events, fetched_at: Date.now() / 1000 });
    } catch (e) {
      setFetchError(e.message);
    } finally {
      setRefreshing(false);
    }
  }, [online, errorRate, refreshing]);

  // Hydrate from the "DB", then seed cache per the cache-on-start tweak.
  useEffect(() => {
    (async () => {
      const persisted = (await DB.load()) || {};
      if (persisted.bookmarks) setBookmarks(new Set(persisted.bookmarks));
      if (persisted.prefs) setPrefs((p) => ({ ...p, ...persisted.prefs }));
      if (persisted.cache) {
        setCache(persisted.cache);
      } else {
        const nowMs = Date.now();
        if (tweaks.cacheStart === "empty") doRefresh();
        else if (tweaks.cacheStart === "stale")
          setCache({ events: MOCK_EVENTS, fetched_at: (nowMs - (CACHE_TTL_SEC + 600) * 1000) / 1000 });
        else setCache({ events: MOCK_EVENTS, fetched_at: (nowMs - 90 * 1000) / 1000 });
      }
      setHydrated(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Determine location permission + initial coordinate on mount.
  // Already granted → read the position silently. Undetermined → show the primer.
  // Denied → keep the fallback coordinate and proceed.
  useEffect(() => {
    (async () => {
      const status = await getPermissionStatus();
      if (status === "granted") {
        const loc = await getDeviceLocation();
        setCoords(loc);
        setPrefs((p) => ({ ...p, locationMode: loc.mode }));
      } else if (status === "undetermined") {
        setGranted(false);
      }
    })();
  }, []);

  // Persist on meaningful change.
  useEffect(() => {
    if (!hydrated) return;
    DB.save({ bookmarks, cache, prefs });
  }, [bookmarks, cache, prefs, hydrated]);

  // tick "now" every 5s so age chips update
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now() / 1000), 5000);
    return () => clearInterval(i);
  }, []);

  const cacheAgeSec = cacheAgeSeconds(cache?.fetched_at, now);
  const freshness = cacheFreshness(cache?.fetched_at, now);
  // Re-anchor cached events around the live coordinate (preserves their spread,
  // recomputes distance_mi) so they're "near me" wherever the device is.
  const allEvents = useMemo(() => anchorEventsTo(cache?.events || [], coords), [cache, coords]);
  // Discovery surfaces (Nearby, Map) only show events within the search radius.
  // Saved/Settings/detail use the full set so bookmarks aren't hidden by the radius.
  const events = useMemo(
    () => allEvents.filter((e) => e.distance_mi <= prefs.radiusMi),
    [allEvents, prefs.radiusMi]
  );

  // Background refresh — every 30s in the prototype, ~30m in production.
  useEffect(() => {
    if (!prefs.bgRefresh) return;
    const id = setInterval(() => {
      if (online && freshness === "stale") doRefresh();
    }, 30000);
    return () => clearInterval(id);
  }, [prefs.bgRefresh, online, freshness, doRefresh]);

  // Auto-refresh once when coming back online with a stale cache.
  const prevOnline = useRef(online);
  useEffect(() => {
    if (online && !prevOnline.current && freshness === "stale") doRefresh();
    prevOnline.current = online;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online]);

  const showToast = useCallback((m, icon) => setToast({ m, icon }), []);

  const toggleBookmark = useCallback((id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setToast({ m: "Removed from saved", icon: <Icons.Bookmark size={16} color="#f6f4f0" /> });
      } else {
        next.add(id);
        setToast({ m: "Saved to your events", icon: <Icons.BookmarkFill size={16} color="#f6f4f0" /> });
      }
      return next;
    });
  }, []);

  const actions = useMemo(
    () => ({
      setTab,
      openDetail: (id) => setOpenEventId(id),
      back: () => setOpenEventId(null),
      refresh: doRefresh,
      toggleBookmark,
      clearCache: () => {
        DB.clearCache();
        setCache(null);
        setToast({ m: "Cache cleared", icon: <Icons.Database size={16} color="#f6f4f0" /> });
        doRefresh();
      },
      setLowDataMode: (v) => setPrefs((p) => ({ ...p, lowDataMode: v })),
      setBgRefresh: (v) => setPrefs((p) => ({ ...p, bgRefresh: v })),
      setNotify: (v) => setPrefs((p) => ({ ...p, notify: v })),
      setRadius: (v) => setPrefs((p) => ({ ...p, radiusMi: v })),
    }),
    [doRefresh, toggleBookmark]
  );

  const sharedState = {
    events, allEvents, coords, online, freshness, cacheAgeSec, refreshing, fetchError,
    bookmarks, city: "Current location",
    lowDataMode: prefs.lowDataMode, bgRefresh: prefs.bgRefresh,
    notify: prefs.notify, locationMode: prefs.locationMode, radiusMi: prefs.radiusMi,
  };

  const tweakControls = {
    setTweak,
    onCacheStart: (v) => {
      setTweak("cacheStart", v);
      if (v === "empty") { DB.clearCache(); setCache(null); doRefresh(); }
      else if (v === "stale") setCache({ events: MOCK_EVENTS, fetched_at: (Date.now() - (CACHE_TTL_SEC + 600) * 1000) / 1000 });
      else setCache({ events: MOCK_EVENTS, fetched_at: (Date.now() - 90 * 1000) / 1000 });
    },
    onDataMode: (v) => { setTweak("dataMode", v); setPrefs((p) => ({ ...p, lowDataMode: v === "low" })); },
    onShowPermission: () => { setGranted(false); setTweak("showPermission", true); },
    onClearAll: () => { DB.clearAll(); setBookmarks(new Set()); setCache(null); doRefresh(); },
  };

  const openEvent = openEventId ? allEvents.find((e) => e.id === openEventId) : null;

  let body;
  if (!granted) {
    body = (
      <PermissionScreen
        onEnable={async () => {
          const loc = await getDeviceLocation({ request: true }); // fires the real OS dialog
          setCoords(loc);
          setPrefs((p) => ({ ...p, locationMode: loc.mode }));
          setGranted(true);
          setTweak("showPermission", false);
        }}
        onSkip={() => {
          setCoords(DEFAULT_LOCATION);
          setGranted(true);
          setPrefs((p) => ({ ...p, locationMode: "city" }));
          setTweak("showPermission", false);
        }}
      />
    );
  } else if (openEvent) {
    body = <DetailScreen event={openEvent} saved={bookmarks.has(openEvent.id)} actions={actions} showToast={showToast} />;
  } else if (tab === "nearby") {
    body = <NearbyScreen state={sharedState} actions={actions} />;
  } else if (tab === "map") {
    body = <MapScreen state={sharedState} actions={actions} />;
  } else if (tab === "saved") {
    body = <SavedScreen state={sharedState} actions={actions} />;
  } else {
    body = <SettingsScreen state={sharedState} actions={actions} tweaks={tweaks} />;
  }

  const showChrome = granted && !openEvent;
  // The tab bar reserves space below the body. The gear floats just above the bar;
  // the toast floats above the bar (tab screens) or above the detail CTA (detail).
  const barSpace = showChrome ? TAB_BAR_HEIGHT + insets.bottom : 0;
  const gearBottom = barSpace + 12;
  const toastBottom = openEvent ? 92 + insets.bottom : showChrome ? barSpace + 12 : 24 + insets.bottom;

  return (
    <ThemeProvider dark={dark}>
      <StatusBar style={dark ? "light" : "dark"} />
      <View style={{ flex: 1 }}>
        {/* content region — sits above the bar; overlays are positioned against it */}
        <View style={{ flex: 1 }}>{body}</View>

        {showChrome && <TabBar active={tab} onChange={setTab} />}

        {showChrome && (
          <TweaksGearButton onPress={() => setTweaksOpen(true)} bottom={gearBottom} />
        )}

        <Toast message={toast?.m} icon={toast?.icon} onDone={() => setToast(null)} bottom={toastBottom} />

        <TweaksSheet visible={tweaksOpen} onClose={() => setTweaksOpen(false)} tweaks={tweaks} controls={tweakControls} />
      </View>
    </ThemeProvider>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color="#dd6b4f" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Shell />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f6f4f0" },
});
