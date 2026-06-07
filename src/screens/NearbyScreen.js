// NearbyScreen (home) — header, editorial title, category filter chips,
// offline/error banners, skeleton on cold start, empty state, event list.
import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Screen from "../components/Screen";
import BrandHeader from "../components/BrandHeader";
import AppHeader from "../components/AppHeader";
import EventCard from "../components/EventCard";
import SkeletonCard from "../components/SkeletonCard";
import Glass from "../components/Glass";
import { Icons } from "../icons";
import { useTheme } from "../ThemeContext";
import { fonts, radius } from "../theme";

const CATEGORIES = ["All", "Live music", "Market", "Workshop", "Sports", "Comedy", "Art"];

export default function NearbyScreen({ state, actions }) {
  const { events, online, freshness, cacheAgeSec, refreshing, fetchError, bookmarks, city, lowDataMode } = state;
  const { t, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState("All");
  const [imgLoading, setImgLoading] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setImgLoading(false), lowDataMode ? 1100 : 600);
    return () => clearTimeout(id);
  }, [events, lowDataMode]);

  const visible = useMemo(
    () => (filter === "All" ? events : events.filter((e) => e.category === filter)),
    [events, filter]
  );
  const empty = !refreshing && events.length === 0;

  return (
    <Screen>
      <BrandHeader />
      <AppHeader
        city={city}
        freshness={freshness}
        ageSec={cacheAgeSec}
        online={online}
        onRefresh={actions.refresh}
        refreshing={refreshing}
      />

      <Text style={[styles.sectionTitle, { color: t.ink }]}>This week,{"\n"}near you.</Text>

      <View style={{ maxHeight: 52 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {CATEGORIES.map((c) => {
            const on = filter === c;
            return (
              <Pressable
                key={c}
                onPress={() => setFilter(c)}
                style={[styles.chip, on ? { backgroundColor: t.ink } : { backgroundColor: t.glassBgStrong, borderColor: dark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.6)", borderWidth: StyleSheet.hairlineWidth }]}
              >
                <Text style={[styles.chipText, { color: on ? t.surface : t.ink2 }]}>{c}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}
      >
        {!online && (
          <Glass strong radius={radius.md} style={styles.banner} contentStyle={styles.bannerContent}>
            <Icons.WifiOff size={18} color={t.ink2} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.bTitle, { color: t.ink }]}>You're offline</Text>
              <Text style={[styles.bSub, { color: t.ink2 }]}>Showing events from your last sync.</Text>
            </View>
          </Glass>
        )}
        {fetchError && online && (
          <Glass strong radius={radius.md} style={styles.banner} contentStyle={[styles.bannerContent, { backgroundColor: t.warningTint + "99" }]}>
            <Icons.Cloud size={18} color={t.warning} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.bTitle, { color: t.ink }]}>Couldn't reach the events server</Text>
              <Text style={[styles.bSub, { color: t.ink2 }]}>Retrying in the background.</Text>
            </View>
            <Pressable onPress={actions.refresh} hitSlop={8}>
              <Text style={[styles.bAction, { color: t.accent }]}>Retry</Text>
            </Pressable>
          </Glass>
        )}

        <View style={styles.list}>
          {refreshing && events.length === 0 && (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}

          {empty && (
            <View style={[styles.empty, { paddingTop: 60 }]}>
              <Glass strong radius={999} style={styles.emIcon} contentStyle={styles.emIconInner}>
                <Icons.Inbox size={24} color={t.ink3} />
              </Glass>
              <Text style={[styles.emTitle, { color: t.ink }]}>No events here yet</Text>
              <Text style={[styles.emBody, { color: t.ink2 }]}>
                Try widening your radius in Settings, or check back tomorrow.
              </Text>
            </View>
          )}

          {visible.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              saved={bookmarks.has(ev.id)}
              loading={imgLoading && !lowDataMode}
              onOpen={() => actions.openDetail(ev.id)}
              onToggleSave={() => actions.toggleBookmark(ev.id)}
            />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontFamily: fonts.serif, fontSize: 40, lineHeight: 40, marginHorizontal: 20, marginTop: 6, marginBottom: 16 },
  chips: { paddingHorizontal: 20, paddingBottom: 16, gap: 8, flexDirection: "row" },
  chip: { paddingVertical: 9, paddingHorizontal: 16, borderRadius: 999 },
  chipText: { fontSize: 13, fontFamily: fonts.sansMed },
  banner: { marginHorizontal: 16, marginBottom: 14 },
  bannerContent: { flexDirection: "row", gap: 12, alignItems: "flex-start", padding: 14 },
  bTitle: { fontSize: 13, fontFamily: fonts.sansSemi, marginBottom: 2 },
  bSub: { fontSize: 13 },
  bAction: { fontSize: 12, fontFamily: fonts.sansSemi },
  list: { paddingHorizontal: 16, paddingTop: 4, gap: 16 },
  empty: { alignItems: "center", paddingHorizontal: 32, gap: 12 },
  emIcon: { width: 72, height: 72 },
  emIconInner: { width: 72, height: 72, alignItems: "center", justifyContent: "center" },
  emTitle: { fontFamily: fonts.serif, fontSize: 26, lineHeight: 30 },
  emBody: { fontSize: 14, lineHeight: 21, textAlign: "center", maxWidth: 260 },
});
