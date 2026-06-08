// MapScreen — real interactive map (Leaflet in a WebView) centered on the device
// location, with a price-pin per event. Tapping a pin opens a selection card that
// links to the event detail. The search bar and card are RN glass overlays.
import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LeafletMap from "../components/LeafletMap";
import Glass from "../components/Glass";
import GlassButton from "../components/GlassButton";
import EventImage from "../components/EventImage";
import { Icons } from "../icons";
import { useTheme } from "../ThemeContext";
import { fonts, radius } from "../theme";

export default function MapScreen({ state, actions }) {
  const { events, coords } = state;
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(null);
  const selEvent = selected ? events.find((e) => e.id === selected) : null;

  return (
    <View style={{ flex: 1, backgroundColor: t.surface }}>
      <View style={styles.mapWrap}>
        <LeafletMap coords={coords} events={events} onSelect={setSelected} />

        {/* search bar */}
        <Glass strong radius={999} style={[styles.search, { top: insets.top + 8 }]} contentStyle={styles.searchInner}>
          <Icons.Search size={16} color={t.ink2} />
          <Text style={[styles.searchText, { color: t.ink2 }]}>Search a neighborhood or venue</Text>
        </Glass>

        {selEvent && (
          <Pressable onPress={() => actions.openDetail(selEvent.id)} style={[styles.cardWrap, { bottom: 96 + insets.bottom }]}>
            <Glass strong radius={radius.lg} contentStyle={styles.card}>
              <View style={styles.cardImg}>
                <EventImage url={selEvent.image_url} hue={35} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.cardTitle, { color: t.ink }]} numberOfLines={1}>{selEvent.title}</Text>
                <Text style={[styles.cardSub, { color: t.ink3 }]} numberOfLines={1}>
                  {selEvent.venue} · {selEvent.distance_mi} mi
                </Text>
              </View>
              <GlassButton size={34} strong onPress={() => setSelected(null)}>
                <Icons.Close size={14} color={t.ink2} />
              </GlassButton>
            </Glass>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapWrap: { flex: 1, overflow: "hidden", position: "relative" },
  search: { position: "absolute", left: 14, right: 14, zIndex: 3 },
  searchInner: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 14, paddingHorizontal: 18 },
  searchText: { fontSize: 14 },
  cardWrap: { position: "absolute", left: 14, right: 14, zIndex: 4 },
  card: { flexDirection: "row", gap: 12, padding: 14, alignItems: "center" },
  cardImg: { width: 64, height: 64, borderRadius: 10, overflow: "hidden" },
  cardTitle: { fontFamily: fonts.serif, fontSize: 18, lineHeight: 21 },
  cardSub: { fontSize: 12, marginTop: 4 },
});
