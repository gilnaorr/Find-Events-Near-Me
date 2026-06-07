// App.js — shell: state, navigation, cache layer, tweaks. Ports the prototype's
// App component to React Native. The "DB" is AsyncStorage; the network is a
// latency/error-modelling stub. Cache uses stale-while-revalidate with a 15m TTL.
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
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
import { fakeFetchEvents, CACHE_TTL_SEC } from "./src/api";
import { MOCK_EVENTS } from "./src/data";
import { DEVICE_LOCATION } from "./src/location";
import { Icons } from "./src/icons";

import TabBar from "./src/components/TabBar";
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

function TweaksGearButton({ onPress, bottomInset }) {
  const { t } = useTheme();
  return (
    <GlassButton
      size={44}
      strong
      onPress={onPress}
      style={{ position: "absolute", right: 16, bottom: 92 + bottomInset, zIndex: 41 }}
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
  const [prefs, setPrefs] = useState({ lowDataMode: false, bgRefresh: true, notify: false, locationMode: "precise" });
  const [cache, setCache] = useState(null);

  // ephemeral state
  const [tab, setTab] = useState("nearby");
  const [openEventId, setOpenEventId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [now, setNow] = useState(() => Date.now() / 1000);
  const [granted, setGranted] = useState(true);
  const [toast, setToast] = useState(null);
  const [tweaksOpen, setTweaksOpen] = useState(false);

  const online = tweaks.connection !== "offline";
  const errorRate = tweaks.errorMode === "always" ? 1 : tweaks.errorMode === "intermittent" ? 0.5 : 0;

  const doRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    setFetchError(null);
    try {
      const res = await fakeFetchEvents({ online: tweaks.connection !== "offline", errorRate });
      setCache({ events: res.events, fetched_at: Date.now() / 1000 });
    } catch (e) {
      setFetchError(e.message);
    } finally {
      setRefreshing(false);
    }
  }, [tweaks.connection, errorRate, refreshing]);

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

  const cacheAgeSec = cache?.fetched_at ? Math.max(0, Math.floor(now - cache.fetched_at)) : 0;
  const freshness = cacheAgeSec < CACHE_TTL_SEC ? "fresh" : "stale";
  const events = cache?.events || [];

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
    }),
    [doRefresh, toggleBookmark]
  );

  const sharedState = {
    events, online, freshness, cacheAgeSec, refreshing, fetchError,
    bookmarks, city: DEVICE_LOCATION.area,
    lowDataMode: prefs.lowDataMode, bgRefresh: prefs.bgRefresh,
    notify: prefs.notify, locationMode: prefs.locationMode,
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

  const openEvent = openEventId ? events.find((e) => e.id === openEventId) : null;

  let body;
  if (!granted) {
    body = (
      <PermissionScreen
        onGranted={(mode) => { setGranted(true); setPrefs((p) => ({ ...p, locationMode: mode })); setTweak("showPermission", false); }}
        onSkip={() => { setGranted(true); setPrefs((p) => ({ ...p, locationMode: "city" })); setTweak("showPermission", false); }}
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

  return (
    <ThemeProvider dark={dark}>
      <StatusBar style={dark ? "light" : "dark"} />
      <View style={{ flex: 1 }}>
        {body}

        {showChrome && (
          <>
            <TabBar active={tab} onChange={setTab} bottomInset={insets.bottom} />
            <TweaksGearButton onPress={() => setTweaksOpen(true)} bottomInset={insets.bottom} />
          </>
        )}

        <Toast message={toast?.m} icon={toast?.icon} onDone={() => setToast(null)} bottomInset={insets.bottom} />

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
