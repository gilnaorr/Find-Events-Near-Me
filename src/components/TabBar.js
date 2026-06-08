// TabBar — full-width bottom navigation bar that RESERVES layout space (content sits
// above it, never under it). Glass background + top hairline; active tab gets an
// accent pill behind its icon. Rendered as a flex child below the screen body.
import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icons } from "../icons";
import { useTheme } from "../ThemeContext";
import { fonts } from "../theme";

// Content height of the bar (excluding the bottom safe-area inset).
export const TAB_BAR_HEIGHT = 60;

const TABS = [
  { id: "nearby", label: "Nearby", icon: Icons.Compass },
  { id: "map", label: "Map", icon: Icons.Map },
  { id: "saved", label: "Saved", icon: Icons.Bookmark },
  { id: "settings", label: "Settings", icon: Icons.Settings },
];

export default function TabBar({ active, onChange }) {
  const { t, dark } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: insets.bottom, borderTopColor: dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)" },
        dark ? styles.shadowDark : styles.shadow,
      ]}
    >
      <BlurView intensity={40} tint={dark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: t.glassBgStrong }]} />
      <View style={styles.row}>
        {TABS.map((tab) => {
          const Ico = tab.icon;
          const on = active === tab.id;
          return (
            <Pressable key={tab.id} onPress={() => onChange(tab.id)} style={styles.tab}>
              <View style={[styles.iconWrap, on && { backgroundColor: t.accent }]}>
                <Ico size={20} stroke={on ? 2 : 1.7} color={on ? t.accentInk : t.ink3} />
              </View>
              <Text style={[styles.label, { color: on ? t.accent : t.ink3 }]} numberOfLines={1}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { borderTopWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  row: { height: TAB_BAR_HEIGHT, flexDirection: "row", alignItems: "center", paddingTop: 6 },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", gap: 2 },
  iconWrap: { paddingHorizontal: 16, paddingVertical: 4, borderRadius: 999 },
  label: { fontFamily: fonts.sansMed, fontSize: 10 },
  shadow: {
    ...Platform.select({
      ios: { shadowColor: "#2a2622", shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 12 },
      default: {},
    }),
  },
  shadowDark: {
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.3, shadowRadius: 10 },
      android: { elevation: 14 },
      default: {},
    }),
  },
});
