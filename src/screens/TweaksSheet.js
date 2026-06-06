// TweaksSheet — the prototype's engineering-states panel, as a native bottom
// sheet. Drives theme, connectivity, API errors, cache freshness, data mode,
// and the permission / clear-data flows so every architectural state is reachable.
import React from "react";
import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import { fonts, radius } from "../theme";

function Segmented({ value, options, onChange }) {
  const { t, dark } = useTheme();
  return (
    <View style={[styles.seg, { backgroundColor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }]}>
      {options.map((o) => {
        const on = o === value;
        return (
          <Pressable key={o} onPress={() => onChange(o)} style={[styles.segBtn, on && { backgroundColor: dark ? "rgba(80,76,70,0.95)" : "rgba(255,255,255,0.95)" }]}>
            <Text style={[styles.segText, { color: on ? t.ink : t.ink2 }]} numberOfLines={1}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function TweakRow({ label, children }) {
  const { t } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: t.ink2 }]}>{label}</Text>
      {children}
    </View>
  );
}

export default function TweaksSheet({ visible, onClose, tweaks, controls }) {
  const { t, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const sheetBg = dark ? "rgba(34,31,27,0.98)" : "rgba(250,249,247,0.98)";

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: sheetBg, paddingBottom: insets.bottom + 16 }]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handleWrap}><View style={[styles.handle, { backgroundColor: t.ink3 }]} /></View>
          <View style={styles.header}>
            <Text style={[styles.title, { color: t.ink }]}>Tweaks</Text>
            <Pressable onPress={onClose} hitSlop={10}><Text style={[styles.close, { color: t.ink3 }]}>✕</Text></Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectLabel, { color: t.ink3 }]}>APPEARANCE</Text>
            <TweakRow label="Theme">
              <Segmented value={tweaks.theme} options={["light", "dark"]} onChange={(v) => controls.setTweak("theme", v)} />
            </TweakRow>

            <Text style={[styles.sectLabel, { color: t.ink3 }]}>ENGINEERING STATES</Text>
            <TweakRow label="Connection">
              <Segmented value={tweaks.connection} options={["online", "offline"]} onChange={(v) => controls.setTweak("connection", v)} />
            </TweakRow>
            <TweakRow label="API errors">
              <Segmented value={tweaks.errorMode} options={["off", "intermittent", "always"]} onChange={(v) => controls.setTweak("errorMode", v)} />
            </TweakRow>
            <TweakRow label="Cache on start">
              <Segmented value={tweaks.cacheStart} options={["fresh", "stale", "empty"]} onChange={controls.onCacheStart} />
            </TweakRow>
            <TweakRow label="Data mode">
              <Segmented value={tweaks.dataMode} options={["full", "low"]} onChange={controls.onDataMode} />
            </TweakRow>

            <Text style={[styles.sectLabel, { color: t.ink3 }]}>FLOWS</Text>
            <Pressable onPress={() => { onClose(); controls.onShowPermission(); }} style={[styles.btn, { backgroundColor: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.78)" }]}>
              <Text style={[styles.btnText, { color: dark ? t.ink : "#fff" }]}>Show permission screen</Text>
            </Pressable>
            <Pressable onPress={controls.onClearAll} style={[styles.btn, { backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", marginTop: 8 }]}>
              <Text style={[styles.btnText, { color: t.ink }]}>Clear cache & bookmarks</Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, maxHeight: "80%" },
  handleWrap: { alignItems: "center", paddingVertical: 8 },
  handle: { width: 40, height: 5, borderRadius: 3, opacity: 0.4 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  title: { fontSize: 20, fontFamily: fonts.sansSemi },
  close: { fontSize: 18 },
  sectLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.8, marginTop: 16, marginBottom: 8 },
  row: { marginBottom: 12 },
  rowLabel: { fontSize: 13, fontFamily: fonts.sansMed, marginBottom: 6 },
  seg: { flexDirection: "row", borderRadius: 9, padding: 2, gap: 2 },
  segBtn: { flex: 1, paddingVertical: 8, borderRadius: 7, alignItems: "center" },
  segText: { fontSize: 12.5, fontFamily: fonts.sansMed },
  btn: { height: 46, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  btnText: { fontSize: 14, fontFamily: fonts.sansMed },
});
