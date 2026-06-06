// ScreenBackground — the warm radial glow the glass surfaces blur over.
// Recreates the design's four-corner radial-gradient + linear base in SVG.
import React from "react";
import { StyleSheet } from "react-native";
import Svg, { Defs, RadialGradient, LinearGradient, Stop, Rect } from "react-native-svg";
import { useTheme } from "../ThemeContext";

export default function ScreenBackground({ variant = "screen" }) {
  const { t } = useTheme();

  if (variant === "permission") {
    return (
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <LinearGradient id="pbase" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={t.bgBase1} />
            <Stop offset="1" stopColor={t.bgBase2} />
          </LinearGradient>
          <RadialGradient id="pg1" cx="0.5" cy="0.1" r="0.7">
            <Stop offset="0" stopColor={t.permGlow1} stopOpacity="1" />
            <Stop offset="0.65" stopColor={t.permGlow1} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="pg2" cx="0.8" cy="1" r="0.7">
            <Stop offset="0" stopColor={t.permGlow2} stopOpacity="1" />
            <Stop offset="0.6" stopColor={t.permGlow2} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#pbase)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#pg1)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#pg2)" />
      </Svg>
    );
  }

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id="base" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={t.bgBase1} />
          <Stop offset="1" stopColor={t.bgBase2} />
        </LinearGradient>
        <RadialGradient id="g1" cx="0.15" cy="-0.05" r="0.8">
          <Stop offset="0" stopColor={t.bgGlow1} stopOpacity="1" />
          <Stop offset="0.6" stopColor={t.bgGlow1} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="g2" cx="1" cy="0.3" r="0.7">
          <Stop offset="0" stopColor={t.bgGlow2} stopOpacity="1" />
          <Stop offset="0.55" stopColor={t.bgGlow2} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="g3" cx="0.1" cy="1" r="0.85">
          <Stop offset="0" stopColor={t.bgGlow3} stopOpacity="1" />
          <Stop offset="0.6" stopColor={t.bgGlow3} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="g4" cx="0.95" cy="0.95" r="0.7">
          <Stop offset="0" stopColor={t.bgGlow4} stopOpacity="1" />
          <Stop offset="0.55" stopColor={t.bgGlow4} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#base)" />
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#g1)" />
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#g2)" />
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#g3)" />
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#g4)" />
    </Svg>
  );
}
