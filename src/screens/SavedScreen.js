// SavedScreen — local-DB-backed bookmarks list with a count chip + empty state.
import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Screen from "../components/Screen";
import Glass from "../components/Glass";
import EventCard from "../components/EventCard";
import { Icons } from "../icons";
import { useTheme } from "../ThemeContext";
import { fonts, radius } from "../theme";

export default function SavedScreen({ state, actions }) {
  const { allEvents, bookmarks } = state;
  const { t, dark } = useTheme();
  const insets = useSafeAreaInsets();
  // Saved shows all bookmarks regardless of the search radius.
  const saved = allEvents.filter((e) => bookmarks.has(e.id));

  return (
    <Screen>
      <Glass radius={999} style={styles.header} contentStyle={styles.headerContent}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.locLabel, { color: t.ink3 }]}>MY EVENTS</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Icons.BookmarkFill size={16} color={t.ink} />
            <Text style={[styles.locValue, { color: t.ink }]}>Saved</Text>
          </View>
        </View>
        <View style={[styles.countChip, { backgroundColor: dark ? "rgba(255,255,255,0.08)" : "rgba(43,39,34,0.06)" }]}>
          <Icons.Database size={12} color={t.ink2} />
          <Text style={[styles.countText, { color: t.ink2 }]}>Local · {saved.length}</Text>
        </View>
      </Glass>

      <Text style={[styles.sectionTitle, { color: t.ink }]}>Where you{"\n"}said yes.</Text>

      {saved.length === 0 ? (
        <View style={styles.empty}>
          <Glass strong radius={999} style={styles.emIcon} contentStyle={styles.emIconInner}>
            <Icons.Bookmark size={24} color={t.ink3} />
          </Glass>
          <Text style={[styles.emTitle, { color: t.ink }]}>Nothing saved yet</Text>
          <Text style={[styles.emBody, { color: t.ink2 }]}>
            Tap the bookmark on any event and it'll live here — synced to your device, offline-first.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 140 + insets.bottom, gap: 16 }}>
          {saved.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              saved
              onOpen={() => actions.openDetail(ev.id)}
              onToggleSave={() => actions.toggleBookmark(ev.id)}
            />
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginHorizontal: 12, marginTop: 8, marginBottom: 6 },
  headerContent: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingLeft: 16, paddingRight: 12, gap: 10 },
  locLabel: { fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 0.8 },
  locValue: { fontSize: 15, fontFamily: fonts.sansSemi },
  countChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  countText: { fontFamily: fonts.mono, fontSize: 10.5 },
  sectionTitle: { fontFamily: fonts.serif, fontSize: 40, lineHeight: 40, marginHorizontal: 20, marginTop: 6, marginBottom: 16 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 12, marginBottom: 80 },
  emIcon: { width: 72, height: 72 },
  emIconInner: { width: 72, height: 72, alignItems: "center", justifyContent: "center" },
  emTitle: { fontFamily: fonts.serif, fontSize: 26, lineHeight: 30 },
  emBody: { fontSize: 14, lineHeight: 21, textAlign: "center", maxWidth: 260 },
});
