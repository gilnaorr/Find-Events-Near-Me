// SkeletonCard — cold-start placeholder while the first fetch is in flight.
import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import ImgPlaceholder from "./ImgPlaceholder";
import { useTheme } from "../ThemeContext";
import { radius } from "../theme";

export default function SkeletonCard() {
  const { t, dark } = useTheme();
  const bar = t.surface3;
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: t.surface2 },
        dark ? styles.shadowDark : styles.shadow,
      ]}
    >
      <View style={[styles.img, { backgroundColor: t.surface3 }]}>
        <ImgPlaceholder loading hue={35} />
      </View>
      <View style={styles.body}>
        <View style={{ height: 10, width: 120, backgroundColor: bar, borderRadius: 4 }} />
        <View style={{ height: 22, width: "85%", backgroundColor: bar, borderRadius: 6, marginTop: 4 }} />
        <View style={{ height: 12, width: "60%", backgroundColor: bar, borderRadius: 4, marginTop: 8 }} />
      </View>
    </View>
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
  img: { height: 168, overflow: "hidden" },
  body: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16 },
});
