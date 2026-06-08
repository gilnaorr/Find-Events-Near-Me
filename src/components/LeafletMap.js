// LeafletMap — a real, interactive map rendered in a WebView (works in Expo Go).
// Loads Leaflet + CARTO/OpenStreetMap tiles, drops a "you are here" dot and a price
// pin per event, fits the view to them, and reports marker taps back to RN via
// postMessage. Data is pushed with injectJavaScript so the HTML never reloads.
import React, { useMemo, useRef, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { useTheme } from "../ThemeContext";

// Static HTML shell. window.render(json) (re)draws everything; it's called by RN
// after load and whenever the coordinate, events, or theme change.
const HTML = `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
  html,body,#map{height:100%;margin:0;background:transparent}
  .leaflet-container{background:transparent;font-family:-apple-system,system-ui,sans-serif}
  .pin{display:flex;align-items:center;justify-content:center;height:30px;min-width:44px;
    padding:0 11px;border-radius:999px;color:#fff;font-weight:700;font-size:12px;
    white-space:nowrap;border:2px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,.35)}
  .you{width:20px;height:20px;border-radius:50%;border:4px solid #fff;
    box-shadow:0 0 0 4px rgba(60,110,230,.25),0 4px 10px rgba(0,0,0,.35)}
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  var map = L.map('map', { zoomControl:false, attributionControl:true }).setView([43.67,-79.38], 13);
  var tiles = null, markers = L.layerGroup().addTo(map), theme = null;
  function setTiles(dark){
    if (theme === dark && tiles) return;
    theme = dark;
    if (tiles) map.removeLayer(tiles);
    var base = dark ? 'dark_all' : 'light_all';
    tiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/'+base+'/{z}/{x}/{y}{r}.png', {
      subdomains:'abcd', maxZoom:19,
      attribution:'&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);
  }
  function send(msg){ if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(msg)); }
  window.render = function(data){
    setTiles(data.dark);
    markers.clearLayers();
    var pts = [];
    // you-are-here
    var you = L.marker([data.you.lat, data.you.lng], {
      icon: L.divIcon({ className:'', html:'<div class="you" style="background:'+data.youColor+'"></div>', iconSize:[20,20], iconAnchor:[10,10] })
    });
    markers.addLayer(you); pts.push([data.you.lat, data.you.lng]);
    // events
    (data.events||[]).forEach(function(e){
      var free = e.price_from === 0;
      var label = free ? 'Free' : ('$'+e.price_from);
      var bg = free ? data.freeColor : data.accent;
      var m = L.marker([e.lat, e.lng], {
        icon: L.divIcon({ className:'', html:'<div class="pin" style="background:'+bg+'">'+label+'</div>', iconSize:[44,30], iconAnchor:[22,30] })
      });
      m.on('click', function(){ send({ type:'select', id:e.id }); });
      markers.addLayer(m); pts.push([e.lat, e.lng]);
    });
    if (pts.length > 1) map.fitBounds(pts, { padding:[48,48], maxZoom:15 });
    else map.setView(pts[0], 14);
  };
  send({ type:'ready' });
</script>
</body>
</html>`;

export default function LeafletMap({ coords, events, onSelect }) {
  const { t, dark } = useTheme();
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);

  const payload = useMemo(
    () =>
      JSON.stringify({
        you: { lat: coords.lat, lng: coords.lng },
        events: (events || []).map((e) => ({ id: e.id, lat: e.lat, lng: e.lng, price_from: e.price_from })),
        dark,
        accent: t.accent,
        freeColor: t.positive,
        youColor: t.youPin,
      }),
    [coords, events, dark, t]
  );

  const push = () => ref.current?.injectJavaScript(`window.render(${payload}); true;`);

  // Re-push whenever the data changes (after the shell has loaded).
  React.useEffect(() => {
    if (loaded) push();
  }, [payload, loaded]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <WebView
        ref={ref}
        originWhitelist={["*"]}
        source={{ html: HTML }}
        style={{ flex: 1, backgroundColor: "transparent" }}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        onMessage={(e) => {
          try {
            const msg = JSON.parse(e.nativeEvent.data);
            if (msg.type === "ready") {
              setLoaded(true);
              push();
            } else if (msg.type === "select") {
              onSelect?.(msg.id);
            }
          } catch {}
        }}
      />
      {!loaded && (
        <View style={[StyleSheet.absoluteFill, styles.loader, { backgroundColor: t.surface }]}>
          <ActivityIndicator color={t.accent} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { alignItems: "center", justifyContent: "center" },
});
