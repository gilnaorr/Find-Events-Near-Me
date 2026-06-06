// GlassButton — circular blurred control (bookmark / back / share / refresh).
import React from "react";
import { Pressable, View, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "../ThemeContext";

export default function GlassButton({ size = 38, onPress, children, style, strong = false }) {
  const { t, dark } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
        styles.shadow,
        style,
      ]}
    >
      <BlurView intensity={strong ? 50 : 36} tint={dark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: dark ? "rgba(48,44,40,0.5)" : "rgba(255,255,255,0.45)" },
        ]}
      />
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: size / 2,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: dark ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.7)",
        }}
      >
        {children}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
});
