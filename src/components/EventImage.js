// EventImage — renders an event's photo over the striped placeholder.
// The placeholder shows immediately (and shimmers) while the network image
// decodes; expo-image handles memory+disk caching and a fade-in transition,
// and we fall back to the placeholder if there's no URL or the load fails.
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import ImgPlaceholder from "./ImgPlaceholder";

export default function EventImage({ url, hue = 35, loading = false }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const showPlaceholder = !url || failed;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* base / fallback — always present so we never flash an empty box */}
      <ImgPlaceholder hue={hue} loading={loading || (!loaded && !failed && !!url)} />

      {url && !failed && (
        <Image
          source={{ uri: url }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
    </View>
  );
}
