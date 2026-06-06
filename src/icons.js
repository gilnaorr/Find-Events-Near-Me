// icons.js — Minimal stroke icons, ported to react-native-svg.
import React from "react";
import Svg, { Path, Circle, Rect, Ellipse } from "react-native-svg";

const Icon = ({ children, size = 20, stroke = 1.6, color = "currentColor" }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </Svg>
);

export const Icons = {
  Pin: (p) => (
    <Icon {...p}>
      <Path d="M12 21s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12z" />
      <Circle cx="12" cy="9" r="2.5" />
    </Icon>
  ),
  PinFill: (p) => (
    <Icon {...p}>
      <Path d="M12 21s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12z" fill={p.color || "currentColor"} />
      <Circle cx="12" cy="9" r="2.5" fill="white" stroke="white" />
    </Icon>
  ),
  Bookmark: (p) => (
    <Icon {...p}>
      <Path d="M6 4h12v17l-6-4-6 4V4z" />
    </Icon>
  ),
  BookmarkFill: (p) => (
    <Icon {...p}>
      <Path d="M6 4h12v17l-6-4-6 4V4z" fill={p.color || "currentColor"} />
    </Icon>
  ),
  Search: (p) => (
    <Icon {...p}>
      <Circle cx="11" cy="11" r="7" />
      <Path d="M20 20l-3.5-3.5" />
    </Icon>
  ),
  Filter: (p) => (
    <Icon {...p}>
      <Path d="M3 6h18M6 12h12M10 18h4" />
    </Icon>
  ),
  Map: (p) => (
    <Icon {...p}>
      <Path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3z" />
      <Path d="M9 3v15M15 6v15" />
    </Icon>
  ),
  Compass: (p) => (
    <Icon {...p}>
      <Circle cx="12" cy="12" r="9" />
      <Path d="m14.5 9.5-5 1.5-1.5 5 5-1.5 1.5-5z" />
    </Icon>
  ),
  Settings: (p) => (
    <Icon {...p}>
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </Icon>
  ),
  Back: (p) => (
    <Icon {...p}>
      <Path d="m15 18-6-6 6-6" />
    </Icon>
  ),
  ChevronRight: (p) => (
    <Icon {...p}>
      <Path d="m9 6 6 6-6 6" />
    </Icon>
  ),
  Close: (p) => (
    <Icon {...p}>
      <Path d="M18 6 6 18M6 6l12 12" />
    </Icon>
  ),
  Refresh: (p) => (
    <Icon {...p}>
      <Path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <Path d="M3 3v5h5" />
    </Icon>
  ),
  Wifi: (p) => (
    <Icon {...p}>
      <Path d="M5 12.5a10 10 0 0 1 14 0" />
      <Path d="M8.5 16a5 5 0 0 1 7 0" />
      <Circle cx="12" cy="19.5" r="1" fill={p.color || "currentColor"} />
    </Icon>
  ),
  WifiOff: (p) => (
    <Icon {...p}>
      <Path d="M2 2l20 20" />
      <Path d="M8.5 16a5 5 0 0 1 7 0" />
      <Path d="M5 12.5a10 10 0 0 1 4-2.5" />
      <Path d="M15 10a10 10 0 0 1 4 2.5" />
      <Circle cx="12" cy="19.5" r="1" fill={p.color || "currentColor"} />
    </Icon>
  ),
  Calendar: (p) => (
    <Icon {...p}>
      <Rect x="3" y="5" width="18" height="16" rx="2" />
      <Path d="M3 9h18M8 3v4M16 3v4" />
    </Icon>
  ),
  Clock: (p) => (
    <Icon {...p}>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 7v5l3 2" />
    </Icon>
  ),
  Users: (p) => (
    <Icon {...p}>
      <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <Circle cx="9" cy="7" r="4" />
      <Path d="M22 21v-2a4 4 0 0 0-3-3.9" />
      <Path d="M16 3.1a4 4 0 0 1 0 7.8" />
    </Icon>
  ),
  Directions: (p) => (
    <Icon {...p}>
      <Path d="m12 2 10 10-10 10L2 12 12 2z" />
      <Path d="m8 12 3-3v2h4v2h-4v2l-3-3z" fill={p.color || "currentColor"} />
    </Icon>
  ),
  Share: (p) => (
    <Icon {...p}>
      <Path d="M12 3v13M6 9l6-6 6 6" />
      <Path d="M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
    </Icon>
  ),
  Check: (p) => (
    <Icon {...p}>
      <Path d="M20 6 9 17l-5-5" />
    </Icon>
  ),
  Database: (p) => (
    <Icon {...p}>
      <Ellipse cx="12" cy="5" rx="9" ry="3" />
      <Path d="M3 5v6c0 1.7 4 3 9 3s9-1.3 9-3V5" />
      <Path d="M3 11v6c0 1.7 4 3 9 3s9-1.3 9-3v-6" />
    </Icon>
  ),
  Cloud: (p) => (
    <Icon {...p}>
      <Path d="M18 18a5 5 0 0 0-1.5-9.8 7 7 0 0 0-13.4 2.5A4 4 0 0 0 5 18h13z" />
    </Icon>
  ),
  Bell: (p) => (
    <Icon {...p}>
      <Path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9z" />
      <Path d="M10 21a2 2 0 0 0 4 0" />
    </Icon>
  ),
  Lock: (p) => (
    <Icon {...p}>
      <Rect x="4" y="11" width="16" height="10" rx="2" />
      <Path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </Icon>
  ),
  Sparkle: (p) => (
    <Icon {...p}>
      <Path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
    </Icon>
  ),
  Inbox: (p) => (
    <Icon {...p}>
      <Path d="M3 13h5l1 3h6l1-3h5" />
      <Path d="M5 6h14l2 7v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6l2-7z" />
    </Icon>
  ),
  Sliders: (p) => (
    <Icon {...p}>
      <Path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
    </Icon>
  ),
};
