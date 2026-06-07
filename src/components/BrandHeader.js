// BrandHeader — app logo + name, shown at the top of the home screen.
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Logo from "./Logo";
import { useTheme } from "../ThemeContext";
import { fonts } from "../theme";

export default function BrandHeader() {
  const { t } = useTheme();
  return (
    <View style={styles.row}>
      <Logo size={30} />
      <Text style={[styles.name, { color: t.ink }]}>Find Events Near Me</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginHorizontal: 20,
    marginTop: 2,
    marginBottom: 8,
  },
  name: { fontFamily: fonts.sansSemi, fontSize: 18, letterSpacing: -0.2 },
});
