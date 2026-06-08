// DetailScreen — full-bleed hero, glass floating controls, four-fact grid,
// glass venue card, tags, and a maps deep-link action sheet.
import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Modal, Linking, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import EventImage from "../components/EventImage";
import GlassButton from "../components/GlassButton";
import Glass from "../components/Glass";
import { Icons } from "../icons";
import { useTheme } from "../ThemeContext";
import { fonts, radius } from "../theme";

function description(event) {
  return `A ${event.duration_min}-minute ${event.category.toLowerCase()} event at ${event.venue} in ${event.neighborhood}. Doors open 30 minutes before start. Tickets and capacity reflected here are pulled live from the organizer and cached locally — pull to refresh.`;
}

export default function DetailScreen({ event, saved, actions, showToast }) {
  const { t, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const [showSheet, setShowSheet] = useState(false);
  if (!event) return null;

  const hue = useMemo(() => {
    const h = [...event.id].reduce((a, c) => a + c.charCodeAt(0), 0);
    return [35, 75, 155, 250, 280][h % 5];
  }, [event.id]);

  const date = new Date(event.starts_at);
  const dayLabel = date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const timeLabel = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const topBtn = insets.top + 6;

  const toggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    actions.toggleBookmark(event.id);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.surface }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.hero}>
          <EventImage url={event.image_url} hue={hue} />
          <LinearGradient
            colors={["transparent", t.surface]}
            style={styles.heroFade}
            pointerEvents="none"
          />
        </View>

        <View style={[styles.body, { backgroundColor: t.surface }]}>
          <Text style={[styles.cat, { color: t.accent }]}>
            {event.category} · {event.neighborhood}
          </Text>
          <Text style={[styles.title, { color: t.ink }]}>{event.title}</Text>

          <View style={styles.factGrid}>
            <Fact label="When" value={dayLabel} sub={`${timeLabel} · ${event.duration_min} min`} />
            <Fact label="Distance" value={`${event.distance_mi} mi`} sub={`~${Math.round(event.distance_mi * 18)} min walk`} />
            <Fact label="Price" value={event.price_from === 0 ? "Free" : `from $${event.price_from}`} />
            <Fact
              label="Capacity"
              value={event.capacity ? `${event.attendees} / ${event.capacity}` : `${event.attendees} going`}
            />
          </View>

          <Glass strong radius={radius.md} style={{ marginBottom: 20 }} contentStyle={styles.locRow}>
            <View style={[styles.locIcon, { backgroundColor: t.accent }]}>
              <Icons.Pin size={20} color={t.accentInk} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[styles.locVenue, { color: t.ink }]}>{event.venue}</Text>
              <Text style={[styles.locAddr, { color: t.ink3 }]} numberOfLines={2}>{event.address}</Text>
            </View>
            <Pressable onPress={() => setShowSheet(true)} style={[styles.locBtn, { backgroundColor: t.ink }]}>
              <Text style={[styles.locBtnText, { color: t.surface }]}>Directions</Text>
            </Pressable>
          </Glass>

          <Text style={[styles.desc, { color: t.ink2 }]}>
            Hosted by {event.organizer}. {description(event)}
          </Text>

          <View style={styles.tags}>
            {event.tags.map((tag) => (
              <Glass key={tag} strong radius={999} shadow={false} contentStyle={styles.tagInner}>
                <Text style={[styles.tagText, { color: t.ink2 }]}>#{tag}</Text>
              </Glass>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* floating controls */}
      <GlassButton size={42} strong onPress={actions.back} style={[styles.float, { top: topBtn, left: 16 }]}>
        <Icons.Back size={20} color={t.ink} />
      </GlassButton>
      <GlassButton
        size={42}
        strong
        onPress={() => showToast("Share sheet opened", <Icons.Share size={16} color="#f6f4f0" />)}
        style={[styles.float, { top: topBtn, right: 70 }]}
      >
        <Icons.Share size={18} color={t.ink} />
      </GlassButton>
      <GlassButton size={42} strong onPress={toggle} style={[styles.float, { top: topBtn, right: 16 }]}>
        {saved ? <Icons.BookmarkFill size={18} color={t.accent} /> : <Icons.Bookmark size={18} color={t.ink} />}
      </GlassButton>

      {/* CTA bar */}
      <LinearGradient
        colors={["transparent", t.surface + "ee", t.surface]}
        style={[styles.ctaBar, { paddingBottom: insets.bottom + 12 }]}
        pointerEvents="box-none"
      >
        <Glass strong radius={999} style={{ flex: 1 }} contentStyle={styles.ctaGlassBtn}>
          <Pressable onPress={toggle} style={styles.ctaInner}>
            {saved ? <Icons.BookmarkFill size={16} color={t.accent} /> : <Icons.Bookmark size={16} color={t.ink} />}
            <Text style={[styles.ctaText, { color: t.ink }]}>{saved ? "Saved" : "Save"}</Text>
          </Pressable>
        </Glass>
        <Pressable
          onPress={() => setShowSheet(true)}
          style={[styles.ctaAccent, { flex: 1.4, backgroundColor: t.accent }]}
        >
          <Icons.Directions size={16} color={t.accentInk} />
          <Text style={[styles.ctaText, { color: t.accentInk }]}>Directions</Text>
        </Pressable>
      </LinearGradient>

      <MapsActionSheet
        visible={showSheet}
        event={event}
        onClose={() => setShowSheet(false)}
        showToast={showToast}
      />
    </View>
  );
}

function Fact({ label, value, sub }) {
  const { t } = useTheme();
  return (
    <Glass strong radius={radius.md} style={styles.factWrap} contentStyle={styles.factInner}>
      <Text style={[styles.factLbl, { color: t.ink3 }]}>{label}</Text>
      <Text style={[styles.factVal, { color: t.ink }]}>{value}</Text>
      {sub ? <Text style={[styles.factSub, { color: t.ink2 }]}>{sub}</Text> : null}
    </Glass>
  );
}

function MapsActionSheet({ visible, event, onClose, showToast }) {
  const { t, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const q = encodeURIComponent(event.address);
  const targets = [
    { name: "Apple Maps", url: Platform.OS === "ios" ? `maps://?daddr=${q}` : `https://maps.apple.com/?daddr=${q}` },
    { name: "Google Maps", url: `comgooglemaps://?daddr=${q}&directionsmode=walking`, web: `https://www.google.com/maps/dir/?api=1&destination=${q}` },
    { name: "Waze", url: `waze://?q=${q}&navigate=yes`, web: `https://waze.com/ul?q=${q}&navigate=yes` },
  ];

  const open = async (target) => {
    onClose();
    showToast(`Opening ${target.name}…`, <Icons.Directions size={16} color="#f6f4f0" />);
    try {
      const can = await Linking.canOpenURL(target.url);
      await Linking.openURL(can ? target.url : target.web || target.url);
    } catch {}
  };

  const sheetBg = dark ? "rgba(45,42,38,0.95)" : "rgba(252,251,248,0.96)";
  const sep = dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetOverlay} onPress={onClose}>
        <Pressable style={[styles.sheetWrap, { paddingBottom: insets.bottom + 12 }]} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.sheetGroup, { backgroundColor: sheetBg }]}>
            <View style={styles.sheetTitle}>
              <Text style={[styles.sheetTitleText, { color: t.ink3 }]}>Open in</Text>
            </View>
            {targets.map((tg, i) => (
              <Pressable
                key={tg.name}
                onPress={() => open(tg)}
                style={({ pressed }) => [styles.sheetRow, { borderTopColor: sep, borderTopWidth: StyleSheet.hairlineWidth }, pressed && { backgroundColor: "rgba(127,127,127,0.12)" }]}
              >
                <Text style={[styles.sheetRowText, { color: t.alertBlue }]}>{tg.name}</Text>
              </Pressable>
            ))}
          </View>
          <View style={[styles.sheetGroup, { backgroundColor: sheetBg }]}>
            <Pressable onPress={onClose} style={({ pressed }) => [styles.sheetRow, pressed && { backgroundColor: "rgba(127,127,127,0.12)" }]}>
              <Text style={[styles.sheetRowText, { color: t.alertBlue, fontFamily: fonts.sansSemi }]}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  hero: { height: 380, overflow: "hidden" },
  heroFade: { position: "absolute", bottom: 0, left: 0, right: 0, height: 90 },
  body: { paddingHorizontal: 20, paddingBottom: 20, marginTop: -36, borderTopLeftRadius: 0 },
  cat: { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 0.9, textTransform: "uppercase", marginBottom: 10 },
  title: { fontFamily: fonts.serif, fontSize: 42, lineHeight: 42, marginBottom: 18 },
  factGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  factWrap: { width: "48%", flexGrow: 1 },
  factInner: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 12 },
  factLbl: { fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 },
  factVal: { fontSize: 16, fontFamily: fonts.sansSemi },
  factSub: { fontSize: 13, marginTop: 2 },
  locRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12 },
  locIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  locVenue: { fontSize: 15, fontFamily: fonts.sansSemi },
  locAddr: { fontSize: 12, marginTop: 2 },
  locBtn: { borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14 },
  locBtnText: { fontSize: 13, fontFamily: fonts.sansSemi },
  desc: { fontSize: 15, lineHeight: 23 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 16 },
  tagInner: { paddingVertical: 5, paddingHorizontal: 10 },
  tagText: { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 0.4 },
  float: { position: "absolute", zIndex: 5 },
  ctaBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 24 },
  ctaGlassBtn: { height: 52, alignItems: "center", justifyContent: "center" },
  ctaInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, width: "100%" },
  ctaAccent: { height: 52, borderRadius: 999, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  ctaText: { fontSize: 16, fontFamily: fonts.sansSemi },
  sheetOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheetWrap: { paddingHorizontal: 10, gap: 8 },
  sheetGroup: { borderRadius: 18, overflow: "hidden" },
  sheetTitle: { paddingVertical: 12, alignItems: "center" },
  sheetTitleText: { fontSize: 12 },
  sheetRow: { paddingVertical: 17, alignItems: "center", justifyContent: "center" },
  sheetRowText: { fontSize: 17 },
});
