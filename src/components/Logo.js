// Logo — a simple brand mark: a coral squircle holding a location pin whose
// center is an event "spark" (location + events, in one glyph). Pure SVG, no asset.
import React from "react";
import Svg, { Defs, LinearGradient, Stop, Rect, Path } from "react-native-svg";
import { useTheme } from "../ThemeContext";

export default function Logo({ size = 30 }) {
  const { t } = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Defs>
        <LinearGradient id="logoBg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={t.accent} />
          <Stop offset="1" stopColor={t.danger} />
        </LinearGradient>
      </Defs>
      {/* squircle badge */}
      <Rect x="0" y="0" width="32" height="32" rx="9" fill="url(#logoBg)" />
      {/* location pin (white) */}
      <Path
        d="M16 6.5c-3.4 0-6.1 2.7-6.1 6 0 4.3 6.1 9.4 6.1 9.4s6.1-5.1 6.1-9.4c0-3.3-2.7-6-6.1-6z"
        fill={t.accentInk}
      />
      {/* event spark punched through the pin head */}
      <Path
        d="M16 9.4l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1z"
        fill={t.accent}
      />
    </Svg>
  );
}
