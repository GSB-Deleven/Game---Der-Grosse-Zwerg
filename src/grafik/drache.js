// GLUTHERZ, der rote Drache – und das Pony vom Burghof.
// Gebaut mit denselben Werkzeugen wie die Zwerge (Umriss + Schattierung).
import { Ebene, ellipse, rechteck, vieleck, teil, horn, RAMPEN, UMRISS } from './figuren-baukasten.js';

const ROT = ['#6e1410', '#c02a1c', '#f0603a'];
const ROT_HELL = ['#8e2418', '#e0402a', '#ff8a5a'];      // «freudig hell»
const BAUCH = ['#b8621c', '#f09a3a', '#ffd070'];
const BAUCH_HELL = ['#d88a2c', '#ffc05a', '#fff0a8'];
const FLUEGEL = ['#4e0e14', '#8a1e22', '#c04038'];
const AUGE = ['#c89a10', '#ffd21e', '#fff6a0'];

export const DRACHE_B = 64;
export const DRACHE_H = 60;

// Drache von vorne (sitzend). zustand: 'ernst' | 'froh'
function dracheVorne(e, { zustand = 'ernst', atmen = 0, blick = 0, mund = false, augen = 'offen', jubeln = false }) {
  const froh = zustand === 'froh';
  const K = froh ? ROT_HELL : ROT, B = froh ? BAUCH_HELL : BAUCH;
  const oy = -atmen;
  const cx = 32;

  // Schwanz (rechts, geringelt, mit Spitze)
  teil(e, (t) => {
    for (const [x, y, r] of [[44, 54, 4], [50, 53, 3.6], [55, 50, 3.2], [58, 46, 2.8], [60, 42, 2.4]]) ellipse(t, x, y, r, r, K);
    vieleck(t, [[58, 40], [62, 34], [63, 41]], K);
  });
  // Flügel (zusammengefaltet hinter den Schultern)
  const flHoch = jubeln ? -6 : 0;
  teil(e, (t) => {
    vieleck(t, [[22, 28 + oy], [8, 6 + oy + flHoch], [2, 20 + oy], [8, 21 + oy], [3, 32 + oy], [13, 30 + oy], [17, 38 + oy]], FLUEGEL);
    vieleck(t, [[42, 28 + oy], [56, 6 + oy + flHoch], [62, 20 + oy], [56, 21 + oy], [61, 32 + oy], [51, 30 + oy], [47, 38 + oy]], FLUEGEL);
    for (const [x0, y0, x1, y1] of [[20, 28, 8, 7], [18, 30, 8, 21], [18, 32, 13, 30], [44, 28, 56, 7], [46, 30, 56, 21], [46, 32, 51, 30]]) {
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
      for (let i = 0; i <= n; i++) t.setze(x0 + ((x1 - x0) * i) / n, y0 + oy + ((y1 - y0 + flHoch * (y1 < 10 ? 1 : 0)) * i) / n, K[0]);
    }
  });
  // Hinterbeine
  teil(e, (t) => { ellipse(t, 19, 52, 7, 6, K); ellipse(t, 45, 52, 7, 6, K); });
  teil(e, (t) => {
    for (const x of [14, 17, 20]) t.setze(x, 58, RAMPEN.horn[2]);
    for (const x of [44, 47, 50]) t.setze(x, 58, RAMPEN.horn[2]);
  }, { umriss: false });
  // Körper + Bauch
  teil(e, (t) => {
    vieleck(t, [[25, 20 + oy], [39, 20 + oy], [42, 34 + oy], [22, 34 + oy]], K);
    ellipse(t, cx, 42 + oy, 15, 15, K);
    vieleck(t, [[29, 24 + oy], [35, 24 + oy], [38, 36 + oy], [26, 36 + oy]], B);
    ellipse(t, cx, 46 + oy, 9, 11, B);
    for (let y = 38; y < 57; y += 3) for (let x = cx - 8; x <= cx + 8; x++) if (t.voll(x, y + oy) && Math.abs(x - cx) < 8) t.setze(x, y + oy, B[0]);
  });
  // Vorderarme
  teil(e, (t) => {
    if (jubeln) { rechteck(t, 12, 22 + oy, 5, 12, K, { rund: 1 }); rechteck(t, 47, 22 + oy, 5, 12, K, { rund: 1 }); }
    else { rechteck(t, 18, 38 + oy, 5, 10, K, { rund: 1 }); rechteck(t, 41, 38 + oy, 5, 10, K, { rund: 1 }); }
  });
  // Hörner
  teil(e, (t) => {
    horn(t, [[24, 10 + oy, 2.6], [21, 6 + oy, 2.1], [19, 3 + oy, 1.6], [18, 0.8 + oy, 1]], RAMPEN.horn);
    horn(t, [[40, 10 + oy, 2.6], [43, 6 + oy, 2.1], [45, 3 + oy, 1.6], [46, 0.8 + oy, 1]], RAMPEN.horn);
  });
  // Kopf mit Schnauze und Stachelkamm
  teil(e, (t) => {
    vieleck(t, [[28, 8 + oy], [32, 3 + oy], [36, 8 + oy]], B);
    ellipse(t, cx, 17 + oy, 12, 10, K);
    ellipse(t, 19.5, 16 + oy, 2.5, 3.5, K); ellipse(t, 44.5, 16 + oy, 2.5, 3.5, K);
    ellipse(t, cx, 24 + oy, 8.5, 5.5, K, { licht: 0.4 });
  });
  const g = new Ebene(e.b, e.h);
  // Nasenlöcher
  g.setze(29, 23 + oy, UMRISS); g.setze(35, 23 + oy, UMRISS); g.setze(29, 22 + oy, K[0]); g.setze(35, 22 + oy, K[0]);
  // Augen
  for (const ax of [25, 36]) {
    if (augen === 'zu' || (jubeln && froh)) {
      for (const [dx, dy] of [[0, 1], [1, 0], [2, 0], [3, 1]]) g.setze(ax + dx, 16 + dy + oy, UMRISS);
    } else {
      ellipse(g, ax + 1.5, 16 + oy, 2.6, froh ? 2.4 : 1.8, froh ? ['#ffffff', '#ffffff', '#ffffff'] : AUGE);
      const px = ax + 1 + Math.round(blick);
      if (froh) { g.setze(px, 16 + oy, UMRISS); g.setze(px + 1, 16 + oy, UMRISS); g.setze(px, 17 + oy, UMRISS); g.setze(px + 1, 17 + oy, UMRISS); g.setze(px, 15 + oy, '#ffffff'); }
      else { g.setze(px + 1, 15 + oy, UMRISS); g.setze(px + 1, 16 + oy, UMRISS); g.setze(px + 1, 17 + oy, UMRISS); }
    }
  }
  // Brauen: ernst = schräg, froh = hochgezogen
  if (!froh) for (const [x, y] of [[24, 12], [25, 12], [26, 13], [27, 13], [37, 13], [38, 13], [39, 12], [40, 12]]) g.setze(x, y + oy, K[0]);
  else for (const [x, y] of [[24, 12], [25, 11], [26, 11], [27, 12], [36, 12], [37, 11], [38, 11], [39, 12]]) g.setze(x, y + oy, K[0]);
  // Bäckchen, wenn froh
  if (froh) { for (const x of [22, 23, 41, 42]) g.setze(x, 20 + oy, '#ff9a9a'); }
  // Mund
  if (mund || jubeln) {
    for (let x = 28; x <= 36; x++) g.setze(x, 27 + oy, '#4a0a0a');
    for (let x = 29; x <= 35; x++) g.setze(x, 28 + oy, '#8a1a2a');
    for (let x = 30; x <= 34; x++) g.setze(x, 29 + oy, '#e05a7a');
    g.setze(28, 26 + oy, '#ffffff'); g.setze(36, 26 + oy, '#ffffff');
  } else if (froh) {
    for (const [x, y] of [[27, 26], [28, 27], [29, 27], [30, 28], [31, 28], [32, 28], [33, 28], [34, 27], [35, 27], [36, 26]]) g.setze(x, y + oy, UMRISS);
  } else {
    for (let x = 28; x <= 36; x++) g.setze(x, 27 + oy, UMRISS);
  }
  g.aufmalen(e);
}

export function baueDrache(zustand = 'ernst') {
  const bilder = {};
  const mach = (name, opt) => { const e = new Ebene(DRACHE_B, DRACHE_H); dracheVorne(e, { zustand, ...opt }); bilder[name] = e; };
  mach('steh0', {});
  mach('steh1', { atmen: 1 });
  mach('blinzeln', { augen: 'zu' });
  mach('reden', { mund: true });
  mach('jubeln', { jubeln: true });
  mach('links', { blick: -1 });
  mach('rechts', { blick: 1 });
  mach('links_reden', { blick: -1, mund: true });
  mach('rechts_reden', { blick: 1, mund: true });
  return bilder;
}

// Zwei leuchtende Augen im Dunkeln
export function baueAugen() {
  const e = new Ebene(28, 9);
  for (const ax of [5, 22]) {
    ellipse(e, ax, 4.5, 4, 2.8, AUGE);
    for (let y = 2; y <= 7; y++) e.setze(ax, y, UMRISS);
  }
  return e;
}

// Fliegender Drache von der Seite (schaut nach rechts). fluegel: 0 oben, 1 mitte, 2 unten
export const FLUG_B = 100;
export const FLUG_H = 70;
export function baueFlugDrache(fluegel = 1) {
  const e = new Ebene(FLUG_B, FLUG_H);
  const K = ROT_HELL, B = BAUCH_HELL;
  const hinterFluegel = [
    [[40, 32], [36, 4], [52, 12], [62, 4], [60, 32]],
    [[38, 32], [18, 22], [36, 26], [52, 22], [60, 32]],
    [[40, 34], [30, 58], [46, 50], [58, 56], [60, 36]],
  ][fluegel];
  teil(e, (t) => vieleck(t, hinterFluegel.map(([x, y]) => [x - 4, y + 2]), FLUEGEL, { licht: -0.5 }));
  // Schwanz
  teil(e, (t) => {
    for (const [x, y, r] of [[26, 42, 6], [18, 42, 4.6], [11, 40, 3.6], [6, 37, 2.8]]) ellipse(t, x, y, r, r, K);
    vieleck(t, [[4, 36], [0, 30], [0, 40]], K);
  });
  // Beine
  teil(e, (t) => { ellipse(t, 40, 50, 5, 4, K); ellipse(t, 58, 50, 5, 4, K); });
  // Körper
  teil(e, (t) => {
    ellipse(t, 48, 40, 24, 11, K);
    ellipse(t, 50, 45, 18, 6, B);
    for (let x = 34; x < 66; x += 4) for (let y = 42; y < 51; y++) if (t.voll(x, y) && y > 42) t.setze(x, y, B[0]);
  });
  // Rückenstacheln
  teil(e, (t) => { for (const x of [30, 38, 46, 54]) vieleck(t, [[x - 3, 31], [x, 25], [x + 3, 31]], B); });
  // Hals & Kopf
  teil(e, (t) => {
    vieleck(t, [[62, 34], [74, 18], [82, 20], [72, 40]], K);
    ellipse(t, 80, 18, 10, 8, K);
    ellipse(t, 90, 22, 7, 5, K, { licht: 0.4 });
  });
  teil(e, (t) => horn(t, [[75, 11, 2.4], [71, 7, 2], [67, 4, 1.5], [64, 2, 1]], RAMPEN.horn));
  const g = new Ebene(FLUG_B, FLUG_H);
  g.setze(94, 20, UMRISS); g.setze(95, 20, UMRISS);
  ellipse(g, 82, 16, 2.4, 2.4, ['#ffffff', '#ffffff', '#ffffff']);
  g.setze(83, 16, UMRISS); g.setze(83, 17, UMRISS); g.setze(84, 16, UMRISS); g.setze(82, 15, '#ffffff');
  for (const [x, y] of [[85, 25], [86, 26], [87, 26], [88, 26], [89, 26], [90, 25]]) g.setze(x, y, UMRISS);
  g.setze(79, 21, '#ff9a9a'); g.setze(80, 21, '#ff9a9a');
  g.aufmalen(e);
  // vorderer Flügel
  const vorn = [
    [[46, 32], [44, 0], [58, 8], [70, 0], [66, 32]],
    [[44, 32], [24, 18], [44, 22], [60, 18], [66, 32]],
    [[46, 34], [38, 62], [52, 54], [66, 62], [66, 36]],
  ][fluegel];
  teil(e, (t) => {
    vieleck(t, vorn, FLUEGEL);
    const [a, b, , d] = vorn;
    for (const ziel of [b, d]) {
      const n = Math.max(Math.abs(ziel[0] - a[0]), Math.abs(ziel[1] - a[1]));
      for (let i = 0; i <= n; i++) t.setze(a[0] + ((ziel[0] - a[0]) * i) / n, a[1] + ((ziel[1] - a[1]) * i) / n, K[0]);
    }
  });
  return e;
}

// ---------------------------------------------------------------------------
// PONY (von vorne, 28 x 36)
// ---------------------------------------------------------------------------
const FELL = ['#6a4424', '#a8743e', '#d8aa70'];
const MAEHNE = ['#2e1c10', '#4a2e1a', '#6e4628'];

function ponyVorne(e, { atmen = 0, blick = 0, mund = false, augen = 'offen', jubeln = false }) {
  const oy = -atmen - (jubeln ? 2 : 0);
  teil(e, (t) => {
    for (const x of [8, 12, 16, 20]) { rechteck(t, x - 1, 26, 3, 8, FELL); rechteck(t, x - 1, 32, 3, 2, MAEHNE); }
  });
  teil(e, (t) => ellipse(t, 14, 24 + oy, 10, 6, FELL));
  teil(e, (t) => {
    ellipse(t, 14, 13 + oy, 6.5, 8, FELL);
    ellipse(t, 14, 19 + oy, 4.5, 3.5, ['#b88a6a', '#e0b898', '#f8d8c0']);
    vieleck(t, [[8, 7 + oy], [9, 1 + oy], [11, 6 + oy]], FELL);
    vieleck(t, [[17, 6 + oy], [19, 1 + oy], [20, 7 + oy]], FELL);
  });
  teil(e, (t) => { vieleck(t, [[10, 4 + oy], [18, 4 + oy], [16, 10 + oy], [14, 7 + oy], [12, 10 + oy]], MAEHNE); });
  const g = new Ebene(e.b, e.h);
  for (const ax of [10, 17]) {
    if (augen === 'zu') { g.setze(ax, 13 + oy, UMRISS); g.setze(ax + 1, 13 + oy, UMRISS); }
    else { g.setze(ax, 12 + oy, '#ffffff'); g.setze(ax + (blick > 0 ? 1 : 0), 13 + oy, UMRISS); g.setze(ax + 1, 12 + oy, UMRISS); g.setze(ax + 1, 13 + oy, UMRISS); }
  }
  g.setze(12, 19 + oy, UMRISS); g.setze(16, 19 + oy, UMRISS);
  if (mund || jubeln) { g.setze(13, 21 + oy, '#5a1a1a'); g.setze(14, 21 + oy, '#5a1a1a'); g.setze(15, 21 + oy, '#5a1a1a'); }
  g.aufmalen(e);
}

export function baueTier(art) {
  const bilder = {};
  const malen = art === 'pony' ? ponyVorne : ponyVorne;
  const mach = (name, opt) => { const e = new Ebene(28, 36); malen(e, opt); bilder[name] = e; };
  mach('steh0', {}); mach('steh1', { atmen: 1 }); mach('blinzeln', { augen: 'zu' }); mach('reden', { mund: true });
  mach('jubeln', { jubeln: true }); mach('links', { blick: -1 }); mach('rechts', { blick: 1 });
  mach('links_reden', { blick: -1, mund: true }); mach('rechts_reden', { blick: 1, mund: true });
  return bilder;
}
