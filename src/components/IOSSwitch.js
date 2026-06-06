// IOSSwitch — the rounded toggle used in Settings.
import React, { useEffect, useRef } from "react";
import { Pressable, Animated, StyleSheet } from "react-native";
import { useTheme } from "../ThemeContext";

export default function IOSSwitch({ on, onChange }) {
  const { t, dark } = useTheme();
  const anim = useRef(new Animated.Value(on ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: on ? 1 : 0,
      useNativeDriver: false,
      friction: 8,
      tension: 80,
    }).start();
  }, [on, anim]);

  const trackOff = dark ? "#4a443c" : "#d6d1c8";
  return (
    <Pressable onPress={() => onChange(!on)} hitSlop={8}>
      <Animated.View
        style={[
          styles.track,
          {
            backgroundColor: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [trackOff, t.positive],
            }),
          },
        ]}
      >
        <Animated.View
          style={[
            styles.knob,
            { transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) }] },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: 50, height: 30, borderRadius: 999, justifyContent: "center", padding: 2 },
  knob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 2,
  },
});
