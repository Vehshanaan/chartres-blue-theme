// Baroque rose-window marketplace icon candidates 04-08 (dev-only, no npm deps)
//
// Stained-glass rule: every colour is ONE flat polygonal pane — planar tessellation,
// straight edges only, nothing overlaid (lead came is the only "under" layer). Each
// design is a circular rose window, transparent outside the circle. No forced diagonal:
// the light/dark theme palette flows freely as jewel tones.
//
// Output: 04-…-08-*.svg into docs/icon-proposals/  (SVG only; open in a browser).
//
// Run: node docs/icon-proposals/make-rosewindows.js

const fs = require('fs');
const DIR = __dirname;

const H = (h) => '#' + h.slice(1);
const PAL = {
  deep: H('#2E4C9B'), cobalt: H('#4070D0'), bright: H('#80B0F0'),
  pale: H('#8FB0E0'), whisper: H('#A8C4E8'), sapphire: H('#1A2C4E'),
  parchment: H('#F5F0E8'), gold: H('#C9A84C'), amber: H('#A05810'),
  goldHi: H('#D4B860'), green: H('#2D6B4F'), leaf: H('#7BB896'),
  ruby: H('#9B1B30'), rose: H('#C7364A'), purple: H('#6B5B8A'), cyan: H('#3B7A9E'),
  // stand-ins for the muddy red/green of 08 — see designs 08a-c below
  emerald: H('#2FA36B'), crimson: H('#D93A4E'), teal: H('#1E8C9E'),
  ember: H('#E0703A'), azure: H('#5B8FE0'), amberHi: H('#C07A22'),
};

const R_GLASS = 47, R_RIM = 58, CX = 64, CY = 64;
const pt = (r, deg) => { const a = deg * Math.PI / 180; return [CX + r * Math.sin(a), CY - r * Math.cos(a)]; };

// ---- safe tilings (each returns concrete polygonal facets; never overlap) ----
function triFan(N, rIn, rOut, color) {
  const f = [];
  for (let k = 0; k < N; k++) {
    const a0 = -90 + k * 360 / N, a1 = -90 + (k + 1) * 360 / N;
    f.push({ pts: [pt(rIn, a0), pt(rOut, a1), pt(rIn, a1)], color: colorFn(color, k) });
  }
  return f;
}
function ringQuads(N, rIn, rOut, color) {
  const f = [];
  for (let k = 0; k < N; k++) {
    const a0 = -90 + k * 360 / N, a1 = -90 + (k + 1) * 360 / N;
    f.push({ pts: [pt(rIn, a0), pt(rOut, a0), pt(rOut, a1), pt(rIn, a1)], color: colorFn(color, k) });
  }
  return f;
}
function annulusQuads(rIn, rOut, color, n = 24) {
  const f = [];
  for (let k = 0; k < n; k++) {
    const a0 = -90 + k * 360 / n, a1 = -90 + (k + 1) * 360 / n;
    if (rIn <= 0) f.push({ pts: [pt(0, a0), pt(rOut, a1), pt(rOut, a0)], color });
    else f.push({ pts: [pt(rIn, a0), pt(rOut, a0), pt(rOut, a1), pt(rIn, a1)], color });
  }
  return f;
}
// pointed crown: N outer triangles (apex at rOut) sitting on the band that ends at rBase
function crown(N, rBase, rOut, color) {
  const f = [];
  for (let k = 0; k < N; k++) {
    const a0 = -90 + k * 360 / N, a1 = -90 + (k + 1) * 360 / N;
    f.push({ pts: [pt(rBase, a0), pt(rBase, a1), pt(rOut, (a0 + a1) / 2)], color: colorFn(color, k) });
  }
  return f;
}
const colorFn = (colors, i) => (typeof colors === 'function' ? colors(i) : colors[((i % colors.length) + colors.length) % colors.length]);
const seq = (...c) => c;

function emitSVG(facets, path, name) {
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">\n<!-- ${name} -->\n<circle cx="64" cy="64" r="${R_RIM}" fill="#0E1B33"/>\n`;
  for (const f of facets) s += `<polygon points="${f.pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')}" fill="${f.color}"/>\n`;
  s += `<g fill="none" stroke="#0E1B33" stroke-width="2" stroke-linejoin="round">\n`;
  for (const f of facets) s += `<polygon points="${f.pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')}"/>\n`;
  s += `</g>\n</svg>\n`;
  fs.writeFileSync(path, s);
  console.log('wrote', path.split(/[\\/]/).pop());
}

// ================================================================= DESIGN 04 — Golden Rose
const design04 = () => [
  ...triFan(8, 0.5, 7, seq(PAL.gold)),
  ...annulusQuads(7, 8.2, PAL.amber),
  ...ringQuads(8, 8.2, 19, seq(PAL.cobalt, PAL.pale)),
  ...annulusQuads(19, 20.2, PAL.gold),
  ...ringQuads(8, 20.2, 33, seq(PAL.deep, PAL.sapphire)),
  ...annulusQuads(33, 34.2, PAL.goldHi),
  ...ringQuads(8, 34.2, R_GLASS, seq(PAL.green, PAL.gold)),
];

// ================================================================= DESIGN 05 — Kaleidoscope Gem (cut-jewel wedges)
const design05 = () => {
  const col = seq(PAL.cobalt, PAL.deep, PAL.bright, PAL.pale, PAL.ruby, PAL.bright, PAL.gold, PAL.cobalt);
  return [
    ...triFan(8, 0.5, 7, seq(PAL.gold, PAL.amber, PAL.gold, PAL.amber)),
    ...annulusQuads(7, 8.2, PAL.amber),
    ...ringQuads(8, 8.2, 28, col),
    ...annulusQuads(28, 29.2, PAL.gold),
    ...ringQuads(8, 29.2, R_GLASS, seq(PAL.deep, PAL.pale, PAL.sapphire, PAL.cobalt)),
    ...crown(16, R_GLASS, 54, seq(PAL.ruby, PAL.gold)),
  ];
};

// ================================================================= DESIGN 06 — Star Crown (pointed silhouette)
const design06 = () => [
  ...triFan(8, 0.5, 7, seq(PAL.gold)),
  ...annulusQuads(7, 8.2, PAL.amber),
  ...ringQuads(8, 8.2, 20, seq(PAL.cobalt, PAL.bright)),
  ...annulusQuads(20, 21.2, PAL.gold),
  ...ringQuads(8, 21.2, 44, seq(PAL.deep, PAL.sapphire)),
  ...annulusQuads(44, 45.2, PAL.amber),
  ...ringQuads(8, 45.2, R_GLASS, seq(PAL.green)),
  ...crown(16, R_GLASS, 56, seq(PAL.bright, PAL.gold, PAL.bright, PAL.amber)),
];

// ================================================================= DESIGN 07 — Eightfoil Roundel (big petals)
const design07 = () => [
  ...triFan(8, 0.5, 7, seq(PAL.gold)),
  ...annulusQuads(7, 8.2, PAL.goldHi),
  ...ringQuads(8, 8.2, 30, seq(PAL.bright, PAL.whisper)),
  ...annulusQuads(30, 31.2, PAL.amber),
  ...ringQuads(8, 31.2, R_GLASS, seq(PAL.sapphire, PAL.green)),
  ...crown(8, R_GLASS, 52, seq(PAL.bright, PAL.gold, PAL.bright, PAL.gold)),
];

// ================================================================= DESIGN 08 — Baroque Chandelier + jewel crown
const design08 = () => [
  ...triFan(8, 0.5, 7, seq(PAL.gold)),
  ...annulusQuads(7, 8.2, PAL.amber),
  ...ringQuads(8, 8.2, 16, seq(PAL.bright, PAL.whisper)),
  ...annulusQuads(16, 17.2, PAL.gold),
  ...ringQuads(16, 17.2, 27, seq(PAL.cobalt, PAL.pale, PAL.cobalt, PAL.gold)),
  ...annulusQuads(27, 28.2, PAL.goldHi),
  ...ringQuads(8, 28.2, 38, seq(PAL.deep, PAL.sapphire)),
  ...annulusQuads(38, 39.2, PAL.amber),
  ...ringQuads(8, 39.2, R_GLASS, seq(PAL.green)),
  ...crown(16, R_GLASS, 55, seq(PAL.gold, PAL.ruby)),
];

// ================================================================= DESIGN 08a — jewel band
// Why 08's red and green look dirty: relative luminance of ruby is 0.045, amber 0.09,
// green 0.12 — all hugging the #0E1B33 field (0.013) — while gold sits at 0.41. The low
// band reads as grey sludge, not colour. 08a keeps the hues and lifts green and ruby to
// 0.28 / 0.18, so every pane lands in the one bright band.
const design08a = () => [
  ...triFan(8, 0.5, 7, seq(PAL.gold)),
  ...annulusQuads(7, 8.2, PAL.amber),
  ...ringQuads(8, 8.2, 16, seq(PAL.bright, PAL.whisper)),
  ...annulusQuads(16, 17.2, PAL.gold),
  ...ringQuads(16, 17.2, 27, seq(PAL.cobalt, PAL.pale, PAL.cobalt, PAL.gold)),
  ...annulusQuads(27, 28.2, PAL.goldHi),
  ...ringQuads(8, 28.2, 38, seq(PAL.deep, PAL.sapphire)),
  ...annulusQuads(38, 39.2, PAL.amber),
  ...ringQuads(8, 39.2, R_GLASS, seq(PAL.emerald)),
  ...crown(16, R_GLASS, 55, seq(PAL.gold, PAL.crimson)),
];

// ================================================================= DESIGN 08b — teal & ember
// The clash is red-against-green; teal (0.22) against ember orange (0.28) replaces it with
// cool-against-warm on the same ring and crown slots. Both amber bands lift to amberHi as
// well — fresh teal next to #A05810 greys out for exactly the same reason the red did.
const design08b = () => [
  ...triFan(8, 0.5, 7, seq(PAL.gold)),
  ...annulusQuads(7, 8.2, PAL.amberHi),
  ...ringQuads(8, 8.2, 16, seq(PAL.bright, PAL.whisper)),
  ...annulusQuads(16, 17.2, PAL.gold),
  ...ringQuads(16, 17.2, 27, seq(PAL.cobalt, PAL.pale, PAL.cobalt, PAL.gold)),
  ...annulusQuads(27, 28.2, PAL.goldHi),
  ...ringQuads(8, 28.2, 38, seq(PAL.deep, PAL.sapphire)),
  ...annulusQuads(38, 39.2, PAL.amberHi),
  ...ringQuads(8, 39.2, R_GLASS, seq(PAL.teal)),
  ...crown(16, R_GLASS, 55, seq(PAL.gold, PAL.ember)),
];

// ================================================================= DESIGN 08c — cobalt & gold only
// No second hue family at all: the ring turns azure and the crown alternates gold with the
// deep blue it already sits on, so the "dark tooth" reads as deliberate inlay. Cleanest of
// the three once scaled down to marketplace size.
const design08c = () => [
  ...triFan(8, 0.5, 7, seq(PAL.gold)),
  ...annulusQuads(7, 8.2, PAL.amber),
  ...ringQuads(8, 8.2, 16, seq(PAL.bright, PAL.whisper)),
  ...annulusQuads(16, 17.2, PAL.gold),
  ...ringQuads(16, 17.2, 27, seq(PAL.cobalt, PAL.pale, PAL.cobalt, PAL.gold)),
  ...annulusQuads(27, 28.2, PAL.goldHi),
  ...ringQuads(8, 28.2, 38, seq(PAL.deep, PAL.sapphire)),
  ...annulusQuads(38, 39.2, PAL.amber),
  ...ringQuads(8, 39.2, R_GLASS, seq(PAL.azure)),
  ...crown(16, R_GLASS, 55, seq(PAL.gold, PAL.deep)),
];

const designs = [
  ['04-golden-rose', design04],
  ['05-kaleidoscope-gem', design05],
  ['06-star-crown', design06],
  ['07-eightfoil-roundel', design07],
  ['08-chandelier-layers', design08],
  ['08a-jewel-band', design08a],
  ['08b-teal-ember', design08b],
  ['08c-cobalt-gold', design08c],
];
for (const [name, fn] of designs) emitSVG(fn(), `${DIR}/${name}.svg`, name);
