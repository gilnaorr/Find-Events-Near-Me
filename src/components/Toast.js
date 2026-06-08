// Toast — transient confirmation pill above the tab bar.
import React, { useEffect, useRef } from "react";
import { Text, StyleSheet, Animated } from "react-native";
import { fonts } from "../theme";

export default function Toast({ message, icon, onDone, bottom = 24 }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) return;
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 8, tension: 70 }).start();
    const t = setTimeout(() => {
      Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start(onDone);
    }, 2200);
    return () => clearTimeout(t);
  }, [message]);

  if (!message) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          bottom,
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        },
      ]}
      pointerEvents="none"
    >
      {icon}
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: 16,
    right: 16,
    backgroundColor: "rgba(40,37,32,0.92)",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    zIndex: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 16,
  },
  text: { color: "#f6f4f0", fontSize: 13, fontFamily: fonts.sansMed },
});
