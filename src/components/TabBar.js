// TabBar — floating Liquid-Glass pill, bottom-center, with an accent active tab.
import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { Icons } from "../icons";
import { useTheme } from "../ThemeContext";
import { fonts } from "../theme";

const TABS = [
  { id: "nearby", label: "Nearby", icon: Icons.Compass },
  { id: "map", label: "Map", icon: Icons.Map },
  { id: "saved", label: "Saved", icon: Icons.Bookmark },
  { id: "settings", label: "Settings", icon: Icons.Settings },
];

export default function TabBar({ active, onChange, bottomInset = 0 }) {
  const { t, dark } = useTheme();
  return (
    <View style={[styles.wrap, { bottom: 18 + bottomInset }]} pointerEvents="box-none">
      <View style={[styles.bar, dark ? styles.shadowDark : styles.shadow]}>
        <BlurView intensity={40} tint={dark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: t.glassBg }]} />
        <View style={styles.row}>
          {TABS.map((tab) => {
            const Ico = tab.icon;
            const on = active === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => onChange(tab.id)}
                style={[styles.tab, on && { backgroundColor: t.accent }]}
              >
                <Ico size={20} stroke={on ? 2 : 1.7} color={on ? t.accentInk : t.ink3} />
                <Text
                  style={[styles.tabLabel, { color: on ? t.accentInk : t.ink3 }]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, alignItems: "center", zIndex: 40 },
  bar: { borderRadius: 999, overflow: "hidden", padding: 6 },
  row: { flexDirection: "row", gap: 2 },
  tab: {
    width: 56,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
  },
  tabLabel: { fontFamily: fonts.sansMed, fontSize: 9.5, marginTop: 2 },
  shadow: {
    ...Platform.select({
      ios: { shadowColor: "#2a2622", shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.16, shadowRadius: 24 },
      android: { elevation: 12 },
      default: {},
    }),
  },
  shadowDark: {
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.45, shadowRadius: 26 },
      android: { elevation: 14 },
      default: {},
    }),
  },
});
