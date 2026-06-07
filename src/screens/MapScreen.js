// MapScreen — abstract SVG streets (not real tiles, by design), event price
// pins placed by lat/lng, a "you are here" dot, and a selection card.
import React, { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, Pattern, Path, Rect, G, Text as SvgText } from "react-native-svg";
import Glass from "../components/Glass";
import GlassButton from "../components/GlassButton";
import EventImage from "../components/EventImage";
import { Icons } from "../icons";
import { useTheme } from "../ThemeContext";
import { fonts, radius } from "../theme";
import { DEVICE_LOCATION } from "../location";

export default function MapScreen({ state, actions }) {
  const { events } = state;
  const { t, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(null);
  const [dim, setDim] = useState({ w: 0, h: 0 });

  const bounds = useMemo(() => {
    if (!events.length) return { minLat: 0, maxLat: 1, minLng: 0, maxLng: 1 };
    // Include the device location so the "you are here" dot is always in frame.
    const lats = [...events.map((e) => e.lat), DEVICE_LOCATION.lat];
    const lngs = [...events.map((e) => e.lng), DEVICE_LOCATION.lng];
    return {
      minLat: Math.min(...lats) - 0.005, maxLat: Math.max(...lats) + 0.005,
      minLng: Math.min(...lngs) - 0.005, maxLng: Math.max(...lngs) + 0.005,
    };
  }, [events]);

  const pinPos = (lat, lng) => ({
    x: ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * dim.w,
    y: ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * dim.h,
  });

  const selEvent = selected ? events.find((e) => e.id === selected) : null;

  return (
    <View style={{ flex: 1, backgroundColor: t.mapBase }}>
      <View style={styles.mapWrap} onLayout={(e) => setDim({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        <MapCanvas w={dim.w} h={dim.h} />

        {/* you-are-here — placed at the device location */}
        {dim.w > 0 && (() => {
          const me = pinPos(DEVICE_LOCATION.lat, DEVICE_LOCATION.lng);
          return (
            <View
              style={[
                styles.you,
                { backgroundColor: t.youPin, left: me.x - 11, top: me.y - 11, borderColor: t.mapBase },
              ]}
            />
          );
        })()}

        {dim.w > 0 &&
          events.map((ev) => {
            const { x, y } = pinPos(ev.lat, ev.lng);
            const free = ev.price_from === 0;
            return (
              <Pressable
                key={ev.id}
                onPress={() => setSelected(ev.id)}
                style={[
                  styles.pin,
                  {
                    left: x,
                    top: y,
                    backgroundColor: free ? t.positive : t.accent,
                    borderColor: t.mapBase,
                    transform: [{ translateX: -24 }, { translateY: -32 }],
                  },
                ]}
              >
                <Text style={[styles.pinText, { color: free ? "#fff" : t.accentInk }]}>
                  {free ? "Free" : `$${ev.price_from}`}
                </Text>
              </Pressable>
            );
          })}

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

function MapCanvas({ w, h }) {
  const { t } = useTheme();
  if (!w || !h) return null;
  return (
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 400 700" preserveAspectRatio="xMidYMid slice">
      <Defs>
        <Pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <Path d="M 40 0 L 0 0 0 40" fill="none" stroke={t.mapGrid} strokeWidth="0.5" />
        </Pattern>
      </Defs>
      <Rect width="400" height="700" fill={t.mapBase} />
      <Rect width="400" height="700" fill="url(#grid)" />
      {/* park */}
      <Rect x="60" y="380" width="120" height="90" fill={t.mapGreen} rx="3" />
      <SvgText x="120" y="430" textAnchor="middle" fontSize="9" fill={t.mapGreenInk} fontFamily={fonts.mono}>ROSEDALE PARK</SvgText>
      {/* Don Valley ravine on the east edge */}
      <Rect x="340" y="0" width="60" height="700" fill={t.mapWater} />
      <SvgText x="370" y="120" textAnchor="middle" fontSize="9" fill={t.mapWaterInk} fontFamily={fonts.mono} transform="rotate(90 370 120)">DON VALLEY</SvgText>
      {/* roads */}
      <G stroke={t.mapRoad} strokeWidth="6">
        <Path d="M0 200 L400 200" /><Path d="M0 320 L400 320" /><Path d="M0 480 L400 480" /><Path d="M0 600 L400 600" />
        <Path d="M80 0 L80 700" /><Path d="M200 0 L200 700" /><Path d="M300 0 L300 700" />
      </G>
      <G stroke={t.mapRoadEdge} strokeWidth="0.5">
        <Path d="M0 200 L400 200" /><Path d="M0 320 L400 320" /><Path d="M0 480 L400 480" /><Path d="M0 600 L400 600" />
        <Path d="M80 0 L80 700" /><Path d="M200 0 L200 700" /><Path d="M300 0 L300 700" />
      </G>
      <Path d="M0 0 L 400 700" stroke={t.mapRoad} strokeWidth="5" />
      <Path d="M0 0 L 400 700" stroke={t.mapRoadEdge} strokeWidth="0.4" />
      <SvgText x="200" y="195" fontSize="8" fill={t.mapStreetInk} fontFamily={fonts.mono} textAnchor="middle">BLOOR ST</SvgText>
      <SvgText x="200" y="315" fontSize="8" fill={t.mapStreetInk} fontFamily={fonts.mono} textAnchor="middle">WELLESLEY ST</SvgText>
      <SvgText x="200" y="475" fontSize="8" fill={t.mapStreetInk} fontFamily={fonts.mono} textAnchor="middle">CARLTON ST</SvgText>
    </Svg>
  );
}

const styles = StyleSheet.create({
  mapWrap: { flex: 1, overflow: "hidden", position: "relative" },
  search: { position: "absolute", left: 14, right: 14, zIndex: 3 },
  searchInner: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 14, paddingHorizontal: 18 },
  searchText: { fontSize: 14 },
  pin: {
    position: "absolute",
    height: 32,
    minWidth: 48,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderWidth: 2,
    shadowColor: "#c4562a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
  pinText: { fontFamily: fonts.mono, fontSize: 12, fontWeight: "600" },
  you: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 4,
    zIndex: 2,
  },
  cardWrap: { position: "absolute", left: 14, right: 14, zIndex: 4 },
  card: { flexDirection: "row", gap: 12, padding: 14, alignItems: "center" },
  cardImg: { width: 64, height: 64, borderRadius: 10, overflow: "hidden" },
  cardTitle: { fontFamily: fonts.serif, fontSize: 18, lineHeight: 21 },
  cardSub: { fontSize: 12, marginTop: 4 },
});
