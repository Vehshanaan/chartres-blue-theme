// Chartres Blue Theme — Marketplace icon generator (dev-only, no npm deps)
//
// Draws a circular rose window: transparent outside the circle, split by a
// 45deg diagonal into a light-half palette (top-left / parchment) and a
// dark-half palette (bottom-right / navy), with a stylized stained-glass rose
// (petals + gold heart + stem + leaves + a branch with a ruby bud) inside.
// Renders a 2048 master via painter's-algorithm shape fills, then box-downsamples
// to 128x128 PNG (RGBA, transparent corners).
//
// Run: node docs/generate-icon.js  ->  writes icon.png at repo root.

const fs = require('fs');
const zlib = require('zlib');

// ---------------------------------------------------------------- config
const DESIGN = 128;           // design coordinate space (pixels of the output icon)
const F = 16;                 // supersample factor -> MASTER = 2048
const MASTER = DESIGN * F;

// Output file
const OUT = `${__dirname}/../icon.png`;

// Palette: role -> [light-half rgba, dark-half rgba]  (from the real theme files)
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const L = 0, D = 1; // half indices (light=top-left, dark=bottom-right)
const P = {
  lead:     hex('#0E1B33'),                                   // structural lead (constant, both halves)
  glass:    [hex('#F5F0E8'), hex('#1A2C4E')],                  // window panes behind the rose
  petalOut: [hex('#2E4C9B'), hex('#80B0F0')],                  // outer petals
  petalMid: [hex('#4668B6'), hex('#5E90DA')],                  // middle petals
  petalIn:  [hex('#8FB0E0'), hex('#4070D0')],                  // inner petals
  center:   [hex('#A05810'), hex('#C9A84C')],                  // gold heart
  centerDeep:[hex('#7A3E08'), hex('#A07A2F')],                 // deeper gold heart fold
  goldRing: [hex('#B8862D'), hex('#D4B860')],                  // accent ring near the rim
  stemLeaf: [hex('#1A804C'), hex('#7BB896')],                  // stem / leaves
  leafHi:   [hex('#28B868'), hex('#3D8B63')],                  // brighter leaf
  ruby:     [hex('#9B1B30'), hex('#C7364A')],                  // bud accent
};

const LEADPAD = 1.1;          // lead-line thickness around rose panes (design units)

// ---------------------------------------------------------------- raster
const buf = new Uint8Array(MASTER * MASTER * 4); // RGBA, 0 = transparent

// test(x,y) runs in design coords; box = [x0,y0,x1,y1] design bounds
// rgba is either [r,g,b] or a fn(x,y)->[r,g,b] (per-pixel colour, e.g. the diagonal glass)
function paint(test, box, rgba) {
  const [x0, y0, x1, y1] = box;
  const mx0 = Math.max(0, Math.floor(x0 * F));
  const my0 = Math.max(0, Math.floor(y0 * F));
  const mx1 = Math.min(MASTER - 1, Math.ceil(x1 * F));
  const my1 = Math.min(MASTER - 1, Math.ceil(y1 * F));
  const isFn = typeof rgba === 'function';
  for (let my = my0; my <= my1; my++) {
    const dy = (my + 0.5) / F;
    for (let mx = mx0; mx <= mx1; mx++) {
      const dxx = (mx + 0.5) / F;
      if (test(dxx, dy)) {
        const c = isFn ? rgba(dxx, dy) : rgba;
        const o = (my * MASTER + mx) * 4;
        buf[o] = c[0]; buf[o + 1] = c[1]; buf[o + 2] = c[2]; buf[o + 3] = 255;
      }
    }
  }
}

// point-in-polygon (even-odd), first arg wrapped with paint()'s signature
function polygonTest(pts) {
  const n = pts.length;
  return (x, y) => {
    let inside = false;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };
}

// point-in-rotated-ellipse
function ellipseTest(cx, cy, rx, ry, ang) {
  const c = Math.cos(ang), s = Math.sin(ang);
  return (x, y) => {
    const dx = x - cx, dy = y - cy;
    const lx = dx * c + dy * s, ly = -dx * s + dy * c; // rotate by -ang
    return (lx * lx) / (rx * rx) + (ly * ly) / (ry * ry) <= 1;
  };
}

function circleTest(cx, cy, r) {
  return (x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
}

function bandTest(p1, p2, halfw) {
  // thick segment: distance to line <= halfw, within the segment's span
  const [x1, y1] = p1, [x2, y2] = p2;
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  return (x, y) => {
    const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / len2));
    const px = x1 + t * dx, py = y1 + t * dy;
    return (x - px) ** 2 + (y - py) ** 2 <= halfw * halfw;
  };
}

// centroid helpers (for per-half colouring)
function polyCentroid(pts) {
  let a = 0, cx = 0, cy = 0, n = pts.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    const w = xi * yj - xj * yi;
    a += w; cx += (xi + xj) * w; cy += (yi + yj) * w;
  }
  a *= 0.5;
  if (Math.abs(a) < 1e-9) return [pts[0][0], pts[0][1]];
  return [cx / (6 * a), cy / (6 * a)];
}
const halfOf = ([x, y]) => (x + y < DESIGN ? L : D);
const scaleAbout = (pts, cx, cy, k) => pts.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]);

// ---------------------------------------------------------------- shapes
function poly(pts, color) {
  const c = color.length === 2 ? color[halfOf(polyCentroid(pts))] : color;
  paint(polygonTest(pts), [
    Math.min(...pts.map(p => p[0])), Math.min(...pts.map(p => p[1])),
    Math.max(...pts.map(p => p[0])), Math.max(...pts.map(p => p[1])),
  ], c);
}
// glass pane piece with a lead outline: enlarged lead version, then the colour
function panePoly(pts, roleColor) {
  const c = polyCentroid(pts);
  const lead = scaleAbout(pts, c[0], c[1], 1 + LEADPAD * 2 / Math.max(6, Math.hypot(c[0] - pts[0][0], c[1] - pts[0][1])));
  paint(polygonTest(lead), bounds(lead), P.lead);
  poly(pts, roleColor);
}
function ell(cx, cy, rx, ry, ang, roleColor) {
  const color = roleColor.length === 2 ? roleColor[halfOf([cx, cy])] : roleColor;
  paint(ellipseTest(cx, cy, rx, ry, ang), [cx - rx, cy - ry, cx + rx, cy + ry], color);
}
function circle(cx, cy, r, roleColor) {
  const color = roleColor.length === 2 ? roleColor[halfOf([cx, cy])] : roleColor;
  paint(circleTest(cx, cy, r), [cx - r, cy - r, cx + r, cy + r], color);
}
function strokePolyline(pts, width, roleColor) {
  // capsule stroke: sample the polyline densely, draw overlapping discs
  const color = roleColor.length === 2 ? roleColor[halfOf([pts[0][0], pts[0][1]])] : roleColor;
  const r = width / 2;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
    const d = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(1, Math.ceil(d / (r * 0.4)));
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      circle(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, r, color);
    }
  }
}
function leaf(base, tip, width, roleColor) {
  // pointed oval: sample along centre line, width = sin(pi t)
  const dx = tip[0] - base[0], dy = tip[1] - base[1];
  const len = Math.hypot(dx, dy);
  const nx = -dy / len, ny = dx / len;
  const pts = [];
  const N = 8;
  for (let i = 0; i <= N; i++) {
    const t = i / N, w = (width * Math.sin(Math.PI * t)) / 2;
    pts.push([base[0] + dx * t + nx * w, base[1] + dy * t + ny * w]);
  }
  for (let i = N; i >= 0; i--) {
    const t = i / N, w = (width * Math.sin(Math.PI * t)) / 2;
    pts.push([base[0] + dx * t - nx * w, base[1] + dy * t - ny * w]);
  }
  const c = polyCentroid(pts);
  const lead = scaleAbout(pts, c[0], c[1], 1 + LEADPAD * 2 / Math.max(6, len));
  paint(polygonTest(lead), bounds(lead), P.lead);
  poly(pts, roleColor);
}
function bounds(pts) {
  return [
    Math.min(...pts.map(p => p[0])), Math.min(...pts.map(p => p[1])),
    Math.max(...pts.map(p => p[0])), Math.max(...pts.map(p => p[1])),
  ];
}

// annular-sector polygon (a rose petal / tracery wedge); outer edge can bulge
function sectorPts(cx, cy, r0, r1, bulge, a0, a1, n = 12) {
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push([cx + Math.cos(a0 + (a1 - a0) * i / n) * r0, cy + Math.sin(a0 + (a1 - a0) * i / n) * r0]);
  for (let i = n; i >= 0; i--) {
    const f = 1 + bulge * Math.sin(Math.PI * i / n);
    pts.push([cx + Math.cos(a0 + (a1 - a0) * i / n) * (r1 * f), cy + Math.sin(a0 + (a1 - a0) * i / n) * (r1 * f)]);
  }
  return pts;
}
// glass petal pane with a lead outline
function paneSector(cx, cy, r0, r1, bulge, a0, a1, roleColor) {
  const pad = LEADPAD / Math.max(6, r1);
  const lead = sectorPts(cx, cy, Math.max(0, r0 - LEADPAD), r1 + LEADPAD, bulge + 0.03, a0 - pad, a1 + pad, 14);
  paint(polygonTest(lead), bounds(lead), P.lead);
  poly(sectorPts(cx, cy, r0, r1, bulge, a0, a1, 14), roleColor);
}
// thin ring (annulus) tinted per half
function annulus(cx, cy, r0, r1, roleColor) {
  paint((x, y) => { const r2 = (x - cx) ** 2 + (y - cy) ** 2; return r2 <= r1 * r1 && r2 >= r0 * r0; },
    [cx - r1, cy - r1, cx + r1, cy + r1], (x, y) => roleColor[halfOf([x, y])]);
}

// ---------------------------------------------------------------- scene
const CX = 64, CY = 64;       // window centre
const Bx = 64, By = 53;       // bloom centre (a touch above middle, room for stem/leaves)
const GLASS = 49;             // glass radius
const RIM_OUT = 61;           // outer lead frame radius
const RIM_IN = 53;            // inner edge of the lead frame
const GOLD_R0 = 50, GOLD_R1 = 52;   // gold accent ring near the rim
const WEDGE_IN = 37, WEDGE_OUT = 49; // outer tracery wedges
const MID_R0 = 34, MID_R1 = 36;     // mid gold ring
const BLOOM_R = 33;           // rose medallion radius

// 1. glass disc, coloured per diagonal half (light above-left, dark below-right)
paint((x, y) => (x - CX) ** 2 + (y - CY) ** 2 <= GLASS * GLASS,
  [CX - GLASS, CY - GLASS, CX + GLASS, CY + GLASS], (x, y) => P.glass[(x + y < DESIGN ? L : D)]);

// 2. outer rose-window tracery: 12 wedge panes on the glass field
for (let k = 0; k < 12; k++) {
  const a0 = -Math.PI / 2 + k * 2 * Math.PI / 12;
  paneSector(CX, CY, WEDGE_IN, WEDGE_OUT, 0, a0 + 0.03, a0 + 2 * Math.PI / 12 - 0.03, P.glass);
}
// 3. gold rings: mid ring delimiting the medallion + accent ring near the rim
annulus(CX, CY, MID_R0, MID_R1, P.goldRing);
annulus(CX, CY, GOLD_R0, GOLD_R1, P.goldRing);

// 4. crisp diagonal lead divider: visible from rim inward to the medallion
{
  const d = (GLASS - 1) / Math.SQRT2;
  poly([[64 - d, 64 + d], [64 + d, 64 - d], [64 + d + 1.7, 64 - d + 1.7], [64 - d + 1.7, 64 + d + 1.7]], P.lead);
}

// 5. stalk & leaves & branch (drawn before the bloom so the medallion overlaps their tops)
strokePolyline([[64, 82], [65, 92], [64, 101], [63, 107]], 8, P.lead);   // lead under-stalk
strokePolyline([[64, 82], [65, 92], [64, 101], [63, 107]], 5.5, P.stemLeaf);
leaf([63, 99], [45, 103], 8, P.stemLeaf);        // lower-left leaf
leaf([65, 90], [83, 96], 8, P.leafHi);           // lower-right leaf
leaf([63, 107], [53, 114], 5, P.leafHi);         // small lower leaf
strokePolyline([[65, 90], [72, 84], [78, 80]], 3, P.leafHi); // branch to the right
circle(78, 79, 3, P.ruby);                        // ruby bud on the branch
circle(72, 84, 2, P.goldRing);                    // tiny gold bud on the branch

// 6. rose medallion: lead backing disc, then 3 layered rings of petals, then the gold heart
paint(circleTest(Bx, By, BLOOM_R + LEADPAD), [Bx - 34, By - 34, Bx + 34, By + 34], P.lead);
const rings = [
  { r0: 19,       r1: BLOOM_R, col: P.petalOut, rot: 0,   bulge: 0.09 },
  { r0: 10,       r1: 22,      col: P.petalMid, rot: 30,  bulge: 0.12 },
  { r0: 3,        r1: 12,      col: P.petalIn,  rot: 0,   bulge: 0.14 },
];
for (const ring of rings) {
  for (let k = 0; k < 6; k++) {
    const off = ring.rot * Math.PI / 180;
    const a0 = -Math.PI / 2 + off + k * 2 * Math.PI / 6 - Math.PI * 0.14;
    const a1 = a0 + Math.PI * 0.28;
    paneSector(Bx, By, ring.r0, ring.r1, ring.bulge, a0, a1, ring.col);
  }
}
// gold heart
paint(circleTest(Bx, By, 6 + LEADPAD), [Bx - 7, By - 7, Bx + 7, By + 7], P.lead);
circle(Bx, By, 6, P.center);
circle(Bx, By, 3, P.centerDeep);                   // deeper gold fold
paint(circleTest(Bx, By, 1.4 + LEADPAD), [Bx - 2, By - 2, Bx + 2, By + 2], P.lead);
circle(Bx, By, 1.4, P.ruby);                       // ruby gemset at the very heart

// 7. outer lead frame ring, drawn last so it stays a clean rim
paint((x, y) => {
  const r2 = (x - CX) ** 2 + (y - CY) ** 2;
  return r2 <= RIM_OUT * RIM_OUT && r2 >= RIM_IN * RIM_IN;
}, [CX - RIM_OUT, CY - RIM_OUT, CX + RIM_OUT, CY + RIM_OUT], P.lead);

// ---------------------------------------------------------------- downsample to 128x128
const SIZE = DESIGN;
const out = new Uint8Array(SIZE * SIZE * 4);
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    let r = 0, g = 0, b = 0, a = 0;
    for (let sy = 0; sy < F; sy++) {
      const my = y * F + sy;
      for (let sx = 0; sx < F; sx++) {
        const o = (my * MASTER + (x * F + sx)) * 4;
        r += buf[o]; g += buf[o + 1]; b += buf[o + 2]; a += buf[o + 3];
      }
    }
    const o = (y * SIZE + x) * 4;
    out[o] = r / (F * F); out[o + 1] = g / (F * F); out[o + 2] = b / (F * F); out[o + 3] = a / (F * F);
  }
}

// ---------------------------------------------------------------- minimal PNG encoder (RGBA)
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(b) {
  let c = 0xFFFFFFFF;
  for (const byte of b) c = crcTable[(c ^ byte) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td), 0);
  return Buffer.concat([len, td, crc]);
}
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0; // 8-bit RGBA
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0; // filter: none
    rgba.slice(y * width * 4, (y + 1) * width * 4).forEach((v, i) => {
      raw[y * (1 + width * 4) + 1 + i] = v;
    });
  }
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

fs.writeFileSync(OUT, encodePNG(SIZE, SIZE, out));
console.log(`wrote ${OUT} (${SIZE}x${SIZE}, transparent outside the rose window)`);
