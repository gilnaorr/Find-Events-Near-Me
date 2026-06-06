// FreshnessChip — shows cache state (Live / Stale / Offline / Updating) + age.
import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useTheme } from "../ThemeContext";
import { fonts } from "../theme";

export default function FreshnessChip({ state = "fresh", ageSec = 0 }) {
  const { t, dark } = useTheme();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (state !== "live") return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [state, pulse]);

  let bg, fg;
  if (state === "stale") {
    bg = t.warningTint;
    fg = t.warning;
  } else if (state === "offline") {
    bg = dark ? "rgba(255,255,255,0.08)" : "rgba(43,39,34,0.08)";
    fg = t.ink2;
  } else {
    bg = t.positiveTint;
    fg = t.positive;
  }

  const label =
    state === "live" ? "Updating"
    : state === "offline" ? "Offline"
    : state === "stale" ? "Stale"
    : "Live";
  const ageLabel = ageSec < 60 ? `${ageSec}s` : `${Math.floor(ageSec / 60)}m`;

  return (
    <View style={[styles.chip, { backgroundColor: bg, borderColor: fg + "55" }]}>
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: fg },
          state === "live" && {
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }) }],
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.4] }),
          },
        ]}
      />
      <Text style={[styles.label, { color: fg }]}>
        {label} · {ageLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingLeft: 9,
    paddingRight: 10,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 0.2 },
});
