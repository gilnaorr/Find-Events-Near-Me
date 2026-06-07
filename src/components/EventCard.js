// EventCard — the primary list cell: striped hero, floating category pill,
// glass bookmark, serif title, meta + price footer.
import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import EventImage from "./EventImage";
import GlassButton from "./GlassButton";
import { Icons } from "../icons";
import { useTheme } from "../ThemeContext";
import { fonts, radius } from "../theme";

export function hueFor(id) {
  const h = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
  return [25, 55, 145, 220, 285][h % 5];
}

export default function EventCard({ event, saved, onOpen, onToggleSave, loading }) {
  const { t, dark } = useTheme();
  const hue = useMemo(() => hueFor(event.id), [event.id]);
  const date = new Date(event.starts_at);
  const dayLabel = date
    .toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
    .toUpperCase();
  const timeLabel = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: t.surface2, transform: [{ scale: pressed ? 0.99 : 1 }] },
        dark ? styles.shadowDark : styles.shadow,
      ]}
    >
      <View style={[styles.img, { backgroundColor: t.surface3 }]}>
        <EventImage url={event.image_url} hue={hue} loading={loading} />
        {/* category pill */}
        <View style={styles.catPillWrap}>
          <BlurView intensity={30} tint={dark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: dark ? "rgba(35,32,28,0.5)" : "rgba(255,255,255,0.55)" },
            ]}
          />
          <Text style={[styles.catPillText, { color: t.ink }]}>{event.category}</Text>
        </View>
        {/* bookmark */}
        <GlassButton size={38} onPress={onToggleSave} style={styles.bookmark}>
          {saved ? (
            <Icons.BookmarkFill size={18} color={t.accent} />
          ) : (
            <Icons.Bookmark size={18} color={t.ink} />
          )}
        </GlassButton>
      </View>

      <View style={styles.body}>
        <View style={styles.meta}>
          <Text style={[styles.metaText, { color: t.ink3 }]}>{dayLabel}</Text>
          <View style={[styles.sep, { backgroundColor: t.ink3 }]} />
          <Text style={[styles.metaText, { color: t.ink3 }]}>{timeLabel}</Text>
          <View style={[styles.sep, { backgroundColor: t.ink3 }]} />
          <Text style={[styles.metaText, { color: t.ink3 }]}>{event.distance_mi} mi</Text>
        </View>
        <Text style={[styles.title, { color: t.ink }]}>{event.title}</Text>
        <View style={styles.foot}>
          <Text style={[styles.venue, { color: t.ink3 }]} numberOfLines={1}>
            {event.venue} · {event.neighborhood}
          </Text>
          <Text style={[styles.price, { color: t.ink }]}>
            {event.price_from === 0 ? "Free" : `$${event.price_from}+`}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, overflow: "hidden" },
  shadow: {
    ...Platform.select({
      ios: { shadowColor: "#2a2622", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.09, shadowRadius: 22 },
      android: { elevation: 5 },
      default: {},
    }),
  },
  shadowDark: {
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.35, shadowRadius: 22 },
      android: { elevation: 7 },
      default: {},
    }),
  },
  img: { height: 168, position: "relative", overflow: "hidden" },
  catPillWrap: {
    position: "absolute",
    bottom: 12,
    left: 12,
    height: 23,
    borderRadius: 999,
    overflow: "hidden",
    justifyContent: "center",
    paddingHorizontal: 9,
  },
  catPillText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  bookmark: { position: "absolute", top: 12, right: 12 },
  body: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16, gap: 6 },
  meta: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  metaText: { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 0.4, textTransform: "uppercase" },
  sep: { width: 3, height: 3, borderRadius: 1.5, opacity: 0.5 },
  title: { fontFamily: fonts.serif, fontSize: 26, lineHeight: 28 },
  foot: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6, gap: 10 },
  venue: { fontSize: 13, flex: 1 },
  price: { fontSize: 13, fontFamily: fonts.sansSemi },
});
