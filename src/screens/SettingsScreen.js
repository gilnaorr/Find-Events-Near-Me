// SettingsScreen — permission state, radius, bg-refresh / low-data toggles,
// cache size + age, clear-cache, notifications, diagnostics.
import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from "react-native";
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

  // Editable search radius (whole miles, 1–250). Valid input commits live; invalid
  // input shows an inline error and is reverted on blur.
  const RADIUS_MIN = 1;
  const RADIUS_MAX = 250;
  const [radiusDraft, setRadiusDraft] = useState(String(radiusMi));
  const [radiusError, setRadiusError] = useState(null);

  const validateRadius = (text) => {
    const s = text.trim();
    if (s === "") return { error: `Enter a radius (${RADIUS_MIN}–${RADIUS_MAX})`, value: null };
    if (!/^\d+$/.test(s)) return { error: "Numbers only", value: null };
    const n = parseInt(s, 10);
    if (n < RADIUS_MIN) return { error: `Minimum is ${RADIUS_MIN} mile`, value: null };
    if (n > RADIUS_MAX) return { error: `Maximum is ${RADIUS_MAX} miles`, value: null };
    return { error: null, value: n };
  };

  const onChangeRadius = (text) => {
    setRadiusDraft(text);
    const { error, value } = validateRadius(text);
    setRadiusError(error);
    if (value != null) actions.setRadius(value); // commit valid input immediately
  };

  const onBlurRadius = () => {
    if (validateRadius(radiusDraft).value == null) {
      setRadiusDraft(String(radiusMi)); // revert bad/empty input to the last valid value
      setRadiusError(null);
    }
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 72 }}>
        <Section title="Location">
          <Row title="Permission" sub={permSub}>
            <Text style={[styles.value, { color: t.accent }]}>Change</Text>
          </Row>
          <Row
            title="Search radius"
            sub={radiusError || `Events within this many miles (${RADIUS_MIN}–${RADIUS_MAX})`}
            subColor={radiusError ? t.danger : undefined}
            last
          >
            <View style={styles.radiusBox}>
              <TextInput
                value={radiusDraft}
                onChangeText={onChangeRadius}
                onBlur={onBlurRadius}
                keyboardType="number-pad"
                maxLength={3}
                selectTextOnFocus
                returnKeyType="done"
                accessibilityLabel="Search radius in miles"
                style={[
                  styles.radiusInput,
                  { color: radiusError ? t.danger : t.accent, borderColor: radiusError ? t.danger : t.hairlineStrong },
                ]}
              />
              <Text style={[styles.value, { color: t.ink3 }]}>mi</Text>
            </View>
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
          <Row title="Network" sub="Live device connectivity · override in Tweaks">
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

function Row({ title, sub, children, titleColor, subColor, last }) {
  const { t } = useTheme();
  return (
    <View style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.glassBorderBottom }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, { color: titleColor || t.ink }]}>{title}</Text>
        {sub ? <Text style={[styles.rowSub, { color: subColor || t.ink3 }]}>{sub}</Text> : null}
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
  radiusBox: { flexDirection: "row", alignItems: "center", gap: 6 },
  radiusInput: {
    minWidth: 56,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    textAlign: "right",
    fontSize: 15,
    fontFamily: fonts.sansSemi,
  },
});
