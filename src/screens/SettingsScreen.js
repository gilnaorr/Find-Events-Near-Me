// SettingsScreen — permission state, radius, bg-refresh / low-data toggles,
// cache size + age, clear-cache, notifications, diagnostics.
import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Screen from "../components/Screen";
import Glass from "../components/Glass";
import IOSSwitch from "../components/IOSSwitch";
import { useTheme } from "../ThemeContext";
import { fonts, radius } from "../theme";

export default function SettingsScreen({ state, actions, tweaks }) {
  const { online, cacheAgeSec, allEvents, bookmarks, lowDataMode, bgRefresh, notify, locationMode, radiusMi } = state;
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const cacheKB = (allEvents.length * 1.4 + bookmarks.size * 0.2).toFixed(1);

  const RADIUS_PRESETS = [1, 2, 5, 10, 25, 40];
  const cycleRadius = () => {
    const i = RADIUS_PRESETS.indexOf(radiusMi);
    actions.setRadius(RADIUS_PRESETS[(i + 1) % RADIUS_PRESETS.length] ?? 40);
  };

  const permSub =
    locationMode === "precise" ? "While using the app · precise"
    : locationMode === "once" ? "Granted once"
    : "Not granted — using city default";

  return (
    <Screen>
      <Glass radius={999} style={styles.header} contentStyle={styles.headerContent}>
        <View>
          <Text style={[styles.locLabel, { color: t.ink3 }]}>PREFERENCES</Text>
          <Text style={[styles.locValue, { color: t.ink }]}>Settings</Text>
        </View>
      </Glass>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}>
        <Section title="Location">
          <Row title="Permission" sub={permSub}>
            <Text style={[styles.value, { color: t.accent }]}>Change</Text>
          </Row>
          <Row title="Search radius" sub="Events within this many miles · tap to change" last>
            <Pressable onPress={cycleRadius} hitSlop={10}>
              <Text style={[styles.value, { color: t.accent, fontFamily: fonts.sansSemi }]}>{radiusMi} mi</Text>
            </Pressable>
          </Row>
        </Section>

        <Section title="Network & cache">
          <Row title="Background refresh" sub="Pulls new events every ~30 min when on Wi-Fi">
            <IOSSwitch on={bgRefresh} onChange={actions.setBgRefresh} />
          </Row>
          <Row title="Low-data mode" sub="Skips images on cellular">
            <IOSSwitch on={lowDataMode} onChange={actions.setLowDataMode} />
          </Row>
          <Row title="Cached events" sub={`TTL 15 min · last fetch ${Math.floor(cacheAgeSec / 60)}m ${cacheAgeSec % 60}s ago`}>
            <Text style={[styles.value, { color: t.ink3 }]}>{cacheKB} KB</Text>
          </Row>
          <Row title="Clear cache" sub="Bookmarks are kept" titleColor={t.accent} last>
            <Pressable onPress={actions.clearCache} hitSlop={8}>
              <Text style={[styles.value, { color: t.accent, fontFamily: fonts.sansSemi }]}>Clear</Text>
            </Pressable>
          </Row>
        </Section>

        <Section title="Notifications">
          <Row title="New events nearby" sub="Quiet hours 10pm–8am respected" last>
            <IOSSwitch on={notify} onChange={actions.setNotify} />
          </Row>
        </Section>

        <Section title="Diagnostics">
          <Row title="Network" sub="Simulated by Tweaks panel">
            <Text style={[styles.value, { color: online ? t.positive : t.danger }]}>{online ? "Online" : "Offline"}</Text>
          </Row>
          <Row title="App version" sub={`build 26.05.27 · ${tweaks.theme}`} last>
            <Text style={[styles.value, { color: t.ink3 }]}>1.0.0</Text>
          </Row>
        </Section>
      </ScrollView>
    </Screen>
  );
}

function Section({ title, children }) {
  const { t } = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: t.ink3 }]}>{title}</Text>
      <Glass strong radius={radius.md} contentStyle={{ overflow: "hidden" }}>
        {children}
      </Glass>
    </View>
  );
}

function Row({ title, sub, children, titleColor, last }) {
  const { t } = useTheme();
  return (
    <View style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.glassBorderBottom }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, { color: titleColor || t.ink }]}>{title}</Text>
        {sub ? <Text style={[styles.rowSub, { color: t.ink3 }]}>{sub}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginHorizontal: 12, marginTop: 8, marginBottom: 6 },
  headerContent: { paddingVertical: 10, paddingHorizontal: 16 },
  locLabel: { fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 0.8 },
  locValue: { fontSize: 15, fontFamily: fonts.sansSemi },
  section: { marginHorizontal: 16, marginTop: 18 },
  sectionLabel: { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10, marginHorizontal: 6 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  rowTitle: { fontSize: 15, fontFamily: fonts.sans },
  rowSub: { fontSize: 12, marginTop: 2 },
  value: { fontSize: 14, fontFamily: fonts.sans },
});
