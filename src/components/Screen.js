// Screen — standard screen chrome: glow background + top safe-area inset.
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScreenBackground from "./ScreenBackground";

export default function Screen({ children }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1 }}>
      <ScreenBackground />
      <View style={{ flex: 1, paddingTop: insets.top + 6 }}>{children}</View>
    </View>
  );
}
