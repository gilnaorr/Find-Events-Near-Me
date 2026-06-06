// ImgPlaceholder — striped placeholder, hue per event for variety, with an
// optional shimmer sweep during simulated image decode.
import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Pattern, Path, Rect } from "react-native-svg";
import { LinearGradient as ExpoGradient } from "expo-linear-gradient";
import { useTheme } from "../ThemeContext";
import { oklchHex } from "../oklch";

export default function ImgPlaceholder({ hue = 35, loading = false }) {
  const { dark } = useTheme();
  const c1 = dark ? oklchHex(0.36, 0.05, hue) : oklchHex(0.86, 0.06, hue);
  const c2 = dark ? oklchHex(0.28, 0.06, hue) : oklchHex(0.78, 0.09, hue);
  const stripe = dark ? "rgba(255,255,255,0.06)" : "rgba(43,39,34,0.06)";

  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!loading) return;
    const loop = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [loading, shimmer]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={`ph${hue}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={c1} />
            <Stop offset="1" stopColor={c2} />
          </LinearGradient>
          <Pattern
            id={`stripe${hue}${dark ? "d" : "l"}`}
            width="12"
            height="12"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <Path d="M0 0 L0 12" stroke={stripe} strokeWidth="1" />
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#ph${hue})`} />
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill={`url(#stripe${hue}${dark ? "d" : "l"})`}
        />
      </Svg>

      {loading && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              transform: [
                {
                  translateX: shimmer.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-300, 300],
                  }),
                },
              ],
            },
          ]}
        >
          <ExpoGradient
            colors={["transparent", "rgba(255,255,255,0.18)", "transparent"]}
            start={{ x: 0, y: 0.2 }}
            end={{ x: 1, y: 0.8 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
    </View>
  );
}
