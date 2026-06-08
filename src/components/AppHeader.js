// AppHeader — floating glass capsule: accent location dot, city, freshness chip,
// refresh button (spinner while refreshing).
import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import Glass from "./Glass";
import GlassButton from "./GlassButton";
import FreshnessChip from "./FreshnessChip";
import { Icons } from "../icons";
import { useTheme } from "../ThemeContext";
import { fonts } from "../theme";

function Spinner({ color }) {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 700, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);
  return (
    <Animated.View
      style={{
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: "rgba(150,138,120,0.5)",
        borderTopColor: color,
        transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }],
      }}
    />
  );
}

export default function AppHeader({ city, freshness, ageSec, online, onRefresh, refreshing, sublabel = "Nearby" }) {
  const { t } = useTheme();
  return (
    <Glass radius={999} style={styles.header} contentStyle={styles.headerContent}>
      <View style={styles.loc}>
        <View style={[styles.locDot, { backgroundColor: t.accent }]}>
          <Icons.Pin size={16} stroke={2} color={t.accentInk} />
        </View>
        <View style={{ flexShrink: 1, minWidth: 0 }}>
          <Text style={[styles.locLabel, { color: t.ink3 }]}>{sublabel}</Text>
          <Text
            style={[styles.locValue, { color: t.ink }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {city}
          </Text>
        </View>
      </View>
      <FreshnessChip state={!online ? "offline" : refreshing ? "live" : freshness} ageSec={ageSec} />
      <GlassButton size={34} strong onPress={onRefresh}>
        {refreshing ? <Spinner color={t.accent} /> : <Icons.Refresh size={15} color={t.ink2} />}
      </GlassButton>
    </Glass>
  );
}

const styles = StyleSheet.create({
  header: { marginHorizontal: 12, marginTop: 8, marginBottom: 6 },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    paddingLeft: 14,
    paddingRight: 8,
  },
  loc: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1, minWidth: 0 },
  locDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#c4562a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  locLabel: { fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 0.8, textTransform: "uppercase" },
  locValue: { fontSize: 13, fontFamily: fonts.sansSemi },
});
