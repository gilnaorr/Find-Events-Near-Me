// Glass — the Liquid-Glass primitive. A blurred backdrop + translucent tint +
// hairline border + soft drop shadow. Mirrors the design's `.glass` recipe;
// inset "shine" highlights are approximated with a light hairline border.
import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "../ThemeContext";

export default function Glass({
  children,
  radius = 999,
  strong = false,
  intensity = 40,
  shadow = true,
  style,
  contentStyle,
}) {
  const { t, dark } = useTheme();
  const tint = strong ? t.glassBgStrong : t.glassBg;
  return (
    <View
      style={[
        { borderRadius: radius },
        shadow && (dark ? styles.shadowDark : styles.shadow),
        style,
      ]}
    >
      <View style={{ borderRadius: radius, overflow: "hidden" }}>
        <BlurView
          intensity={intensity}
          tint={dark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: tint, borderRadius: radius },
          ]}
        />
        <View
          style={[
            {
              borderRadius: radius,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: dark ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.7)",
            },
            contentStyle,
          ]}
        >
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: "#2a2622",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      android: { elevation: 6 },
      default: {},
    }),
  },
  shadowDark: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.4,
        shadowRadius: 26,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
});
