// gen-icons.js — rasterizes the app logo (same mark as src/components/Logo.js)
// into the launcher icon, splash icon, Android adaptive layers, and favicon.
// Run: `node gen-icons.js`. Dev-only; uses @resvg/resvg-js (no system deps).
const fs = require("fs");
const path = require("path");
const { Resvg } = require("@resvg/resvg-js");

const ACCENT = "#e2684a";
const DANGER = "#cf4040";
const INK = "#fffbf6"; // accent-ink (near-white)

// pin + spark drawn in a 32-unit box, matching Logo.js, parameterized by color.
const pinAndSpark = (pinFill, sparkFill) => `
  <path d="M16 6.5c-3.4 0-6.1 2.7-6.1 6 0 4.3 6.1 9.4 6.1 9.4s6.1-5.1 6.1-9.4c0-3.3-2.7-6-6.1-6z" fill="${pinFill}"/>
  <path d="M16 9.4l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1z" fill="${sparkFill}"/>
`;

const gradientDef = `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${ACCENT}"/>
      <stop offset="1" stop-color="${DANGER}"/>
    </linearGradient>
  </defs>`;

// Full-bleed icon (iOS masks the corners itself): gradient fills the square,
// logo glyph centered. viewBox 0..32, glyph centered & scaled up.
const fullBleed = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  ${gradientDef}
  <rect x="0" y="0" width="32" height="32" fill="url(#bg)"/>
  <g transform="translate(16 16.5) scale(1.7) translate(-16 -14.2)">
    ${pinAndSpark(INK, ACCENT)}
  </g>
</svg>`;

// Rounded squircle mark on transparent (splash / favicon).
const squircle = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  ${gradientDef}
  <rect x="0" y="0" width="32" height="32" rx="9" fill="url(#bg)"/>
  ${pinAndSpark(INK, ACCENT)}
</svg>`;

// Android adaptive foreground: glyph only, inside the centered ~66% safe zone,
// on transparent. The OS composites it over the background layer.
const adaptiveForeground = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <g transform="translate(16 16) scale(1.25) translate(-16 -14.2)">
    ${pinAndSpark(INK, ACCENT)}
  </g>
</svg>`;

// Android adaptive background: the coral gradient as a full square.
const adaptiveBackground = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  ${gradientDef}
  <rect x="0" y="0" width="32" height="32" fill="url(#bg)"/>
</svg>`;

// Monochrome (themed icons): pin silhouette in solid black on transparent.
const monochrome = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <g transform="translate(16 16) scale(1.25) translate(-16 -14.2)">
    <path d="M16 6.5c-3.4 0-6.1 2.7-6.1 6 0 4.3 6.1 9.4 6.1 9.4s6.1-5.1 6.1-9.4c0-3.3-2.7-6-6.1-6z" fill="#000000"/>
  </g>
</svg>`;

function render(svg, size) {
  const r = new Resvg(svg, { fitTo: { mode: "width", value: size } });
  return r.render().asPng();
}

const A = (f) => path.join(__dirname, "assets", f);
const jobs = [
  ["icon.png", fullBleed, 1024],
  ["splash-icon.png", squircle, 1024],
  ["android-icon-foreground.png", adaptiveForeground, 1024],
  ["android-icon-background.png", adaptiveBackground, 1024],
  ["android-icon-monochrome.png", monochrome, 1024],
  ["favicon.png", squircle, 64],
];

for (const [file, svg, size] of jobs) {
  fs.writeFileSync(A(file), render(svg, size));
  console.log("wrote assets/" + file + " (" + size + "px)");
}
