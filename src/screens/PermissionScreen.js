// PermissionScreen — first-run location primer. The "Enable location" button fires
// the real OS permission dialog via expo-location (through the injected onEnable);
// "Use a city instead" falls back to the default coordinate.
import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScreenBackground from "../components/ScreenBackground";
import Glass from "../components/Glass";
import { Icons } from "../icons";
import { useTheme } from "../ThemeContext";
import { fonts, radius } from "../theme";

const POINTS = [
  "Used only while the app is open",
  "Coarse precision — neighborhood level",
  "You can change this in Settings anytime",
];

export default function PermissionScreen({ onEnable, onSkip }) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);

  return (
    <View style={styles.root}>
      <ScreenBackground variant="permission" />
      <View style={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.illo}>
          <View style={[styles.ring, styles.ringOuter, { borderColor: t.accent + "40" }]} />
          <View style={[styles.ring, styles.ringInner, { borderColor: t.accent + "59" }]} />
          <View style={[styles.pin, { backgroundColor: t.accent }]}>
            <Icons.Pin size={28} stroke={2} color={t.accentInk} />
          </View>
        </View>

        <View>
          <Text style={[styles.title, { color: t.ink }]}>Events,{"\n"}tuned to where you are.</Text>
          <Text style={[styles.body, { color: t.ink2 }]}>
            We use your location to show events near you and calculate walking distance.
            Your coordinates never leave the device.
          </Text>

          <Glass strong radius={radius.md} style={{ marginBottom: 24 }} contentStyle={styles.points}>
            {POINTS.map((p) => (
              <View key={p} style={styles.point}>
                <View style={[styles.check, { backgroundColor: t.positive + "40" }]}>
                  <Icons.Check size={12} stroke={2.4} color={t.positive} />
                </View>
                <Text style={[styles.pointText, { color: t.ink2 }]}>{p}</Text>
              </View>
            ))}
          </Glass>

          <Pressable
            disabled={busy}
            onPress={async () => {
              setBusy(true);
              try {
                await onEnable();
              } finally {
                setBusy(false);
              }
            }}
            style={({ pressed }) => [styles.btnAccent, { backgroundColor: t.accent, opacity: pressed || busy ? 0.9 : 1 }]}
          >
            {busy ? (
              <ActivityIndicator color={t.accentInk} />
            ) : (
              <Text style={[styles.btnAccentText, { color: t.accentInk }]}>Enable location</Text>
            )}
          </Pressable>
          <Pressable onPress={onSkip} disabled={busy} style={styles.btnLink}>
            <Text style={[styles.btnLinkText, { color: t.ink2 }]}>Use a city instead</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 28 },
  illo: { flex: 1, alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", borderRadius: 999, borderWidth: 1 },
  ringInner: { width: 240, height: 240, opacity: 0.55 },
  ringOuter: { width: 340, height: 340, opacity: 0.25 },
  pin: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#c4562a",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.45,
    shadowRadius: 40,
    elevation: 10,
  },
  title: { fontFamily: fonts.serif, fontSize: 36, lineHeight: 38, marginBottom: 12 },
  body: { fontSize: 15, lineHeight: 22, marginBottom: 24 },
  points: { paddingVertical: 12, paddingHorizontal: 16, gap: 10 },
  point: { flexDirection: "row", alignItems: "center", gap: 12 },
  check: { width: 22, height: 22, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  pointText: { fontSize: 14, flex: 1 },
  btnAccent: {
    height: 52,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#c4562a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 6,
  },
  btnAccentText: { fontSize: 16, fontFamily: fonts.sansSemi },
  btnLink: { height: 40, alignItems: "center", justifyContent: "center" },
  btnLinkText: { fontSize: 16, fontFamily: fonts.sansMed },
  alertOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center", paddingHorizontal: 40 },
  alert: { width: "100%", maxWidth: 270, borderRadius: 18, overflow: "hidden" },
  aBody: { padding: 16, paddingTop: 18, alignItems: "center" },
  aTitle: { fontSize: 17, fontFamily: fonts.sansSemi, marginBottom: 6, textAlign: "center" },
  aMsg: { fontSize: 13, lineHeight: 18, textAlign: "center" },
  aActions: { flexDirection: "row", borderTopWidth: StyleSheet.hairlineWidth },
  aBtn: { flex: 1, paddingVertical: 12, alignItems: "center", justifyContent: "center" },
  aBtnText: { fontSize: 14 },
});
