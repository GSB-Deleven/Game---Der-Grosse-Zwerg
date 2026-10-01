// FIGUREN-BAUKASTEN
// Setzt Figuren aus Teilen zusammen (Stiefel, Beine, Rumpf, Arme, Kopf, Bart, Helm …)
// und berechnet daraus alle Richtungen und Bewegungsphasen – im SNES-Stil mit
// Umriss um jedes Teil und Schattierung (Licht kommt von links oben).

// ---------------------------------------------------------------------------
// Farbrampen: [dunkel, mittel, hell]
// ---------------------------------------------------------------------------
export const RAMPEN = {
  haut: ['#c98763', '#f0bf96', '#ffdcbc'],
  hautDunkel: ['#8a5a3c', '#b67a55', '#d49a72'],
  rot: ['#8e2f17', '#cf5329', '#f28a4c'],
  braun: ['#4f311b', '#7a4f2c', '#a8744a'],
  kastanie: ['#5a2a1a', '#8a4127', '#b8643a'],
  grau: ['#80858c', '#c3c7cc', '#f2f2f2'],
  schwarz: ['#15151c', '#2f2f3a', '#565664'],
  blond: ['#a8862b', '#e8c95a', '#fff0a8'],
  weiss: ['#b8bcc4', '#e8ebef', '#ffffff'],
  stahl: ['#5c6672', '#9aa6b2', '#dce4ea'],
  gold: ['#9a6d1c', '#e0b23c', '#fff0a0'],
  kupfer: ['#7a3d1c', '#b86a38', '#e8a070'],
  horn: ['#a8946a', '#e6d8b4', '#fffaea'],
  blau: ['#23406e', '#3f6fb5', '#79a6e0'],
  gruen: ['#24532a', '#3f8a44', '#74c26c'],
  moos: ['#3a4a22', '#5f7a34', '#90ad58'],
  lila: ['#40285c', '#6e4a9a', '#a07ccc'],
  weinrot: ['#4e1422', '#8a2a3c', '#c05468'],
  orange: ['#8a4a12', '#d9822b', '#f5b25a'],
  rosa: ['#8a2c52', '#d85a8a', '#f59ac0'],
  gelb: ['#a8862b', '#e8c040', '#fff0a0'],
  leder: ['#3f2716', '#6b4428', '#98683e'],
  hose: ['#33261e', '#54402f', '#7a604a'],
  stiefel: ['#1f1510', '#3b2a1f', '#5e4533'],
  holz: ['#4a3220', '#6b4a2e', '#946a44'],
  beige: ['#9a8a64', '#d8c8a0', '#f4e8c8'],
  kette: ['#4a525c', '#8a939e', '#c3ccd4'],
};

const UMRISS = '#22171a';

// ---------------------------------------------------------------------------
// Kleine Mal-Bibliothek auf Pixel-Ebene
// ---------------------------------------------------------------------------
const HEX_CACHE = new Map();
function hexZuRgb(hex) {
  let c = HEX_CACHE.get(hex);
  if (!c) {
    const n = parseInt(hex.slice(1), 16);
    c = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    HEX_CACHE.set(hex, c);
  }
  return c;
}
const alsRgb = (f) => (typeof f === 'string' ? hexZuRgb(f) : f);
const misch = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t].map(Math.round);

// Aus jeder Rampe [dunkel, mittel, hell] werden 5 Töne:
// [tiefer Schatten (kühl), dunkel, mittel, hell, Glanzlicht (warm)] – das gibt den weichen 90er-Look
const RAMPE5 = new WeakMap();
const KUEHL = [40, 30, 70], WARM = [255, 250, 225];
function rampe5(rampe) {
  let r = RAMPE5.get(rampe);
  if (r) return r;
  const [d, m, h] = rampe.map(alsRgb);
  r = [misch(misch(d, [0, 0, 0], 0.32), KUEHL, 0.18), d, m, h, misch(h, WARM, 0.45)];
  RAMPE5.set(rampe, r);
  return r;
}

class Ebene {
  constructor(b, h) {
    this.b = b; this.h = h;
    this.d = new Uint8ClampedArray(b * h * 4);
  }

  setze(x, y, farbe) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.b || y >= this.h) return;
    const [r, g, b] = alsRgb(farbe);
    const i = (y * this.b + x) * 4;
    this.d[i] = r; this.d[i + 1] = g; this.d[i + 2] = b; this.d[i + 3] = 255;
  }

  voll(x, y) {
    if (x < 0 || y < 0 || x >= this.b || y >= this.h) return false;
    return this.d[(y * this.b + x) * 4 + 3] > 0;
  }

  farbe(x, y) {
    const i = (y * this.b + x) * 4;
    return [this.d[i], this.d[i + 1], this.d[i + 2]];
  }

  // Um alle gemalten Pixel einen Umriss legen. Farbig wie bei späten SNES-/GBA-Spielen:
  // dunkel, aber leicht in der Farbe des Teils getönt.
  umriss(farbe = UMRISS) {
    const grund = hexZuRgb(farbe);
    const { b, h, d } = this;
    const a = (x, y) => x >= 0 && y >= 0 && x < b && y < h && d[(y * b + x) * 4 + 3] > 0;
    const neu = [];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < b; x++) {
        if (d[(y * b + x) * 4 + 3]) continue;
        // Nachbar, von dem die Farbe kommt; oben/links liegende Teile → Umriss unten/rechts (kräftiger)
        let qx, qy, unten = false;
        if (a(x, y - 1)) { qx = x; qy = y - 1; unten = true; }
        else if (a(x - 1, y)) { qx = x - 1; qy = y; unten = true; }
        else if (a(x + 1, y)) { qx = x + 1; qy = y; }
        else if (a(x, y + 1)) { qx = x; qy = y + 1; }
        else continue;
        const i = (qy * b + qx) * 4, t = unten ? 0.25 : 0.42;
        neu.push(x, y, grund[0] + (d[i] * 0.45 - grund[0]) * t, grund[1] + (d[i + 1] * 0.45 - grund[1]) * t, grund[2] + (d[i + 2] * 0.45 - grund[2]) * t);
      }
    }
    for (let k = 0; k < neu.length; k += 5) {
      const i = (neu[k + 1] * b + neu[k]) * 4;
      d[i] = neu[k + 2]; d[i + 1] = neu[k + 3]; d[i + 2] = neu[k + 4]; d[i + 3] = 255;
    }
    return this;
  }

  aufmalen(ziel) {
    for (let i = 0; i < this.d.length; i += 4) {
      if (this.d[i + 3]) { ziel.d[i] = this.d[i]; ziel.d[i + 1] = this.d[i + 1]; ziel.d[i + 2] = this.d[i + 2]; ziel.d[i + 3] = 255; }
    }
  }
}

// Stufe 0..4 → Farbe aus der 5er-Rampe
function stufe(rampe, v) {
  return rampe5(rampe)[Math.max(0, Math.min(4, Math.round(v)))];
}

// Haar und Bärte: färbt alle schon gemalten Pixel der Ebene als fliessende Strähnen um
// (helle Kante links, dunkle Furche rechts, oben heller als unten)
function straehnen(e, rampe, { breite = 4, welle = 1.4, phase = 0, oben = 0, unten = e.h, schraeg = 0 } = {}) {
  for (let y = 0; y < e.h; y++) {
    for (let x = 0; x < e.b; x++) {
      if (!e.voll(x, y)) continue;
      const u = (x + Math.sin(y * 0.28 + phase) * welle + (y - oben) * schraeg) / breite;
      const f = u - Math.floor(u);
      const t = Math.max(0, Math.min(1, (y - oben) / Math.max(1, unten - oben)));
      let v = 2.5 - t * 1.1;
      if (f < 0.24) v += 1; else if (f > 0.76) v -= 1.1;
      // linke Seite etwas heller (Licht von links)
      if (e.voll(x - 1, y) && !e.voll(x - 2, y)) v += 0.6;
      if (!e.voll(x + 1, y)) v -= 0.6;
      e.setze(x, y, stufe(rampe, v));
    }
  }
}

// Flache Teile: oben links hell, unten rechts dunkel
function schattiere(rampe, nx, ny, licht = 0, x = 0, y = 0) {
  const l = -(nx * 0.55 + ny * 0.85) + licht;
  // l läuft etwa von -1.4 (unten rechts) bis +1.4 (oben links)
  return stufe(rampe, 2 + l * 1.45, x, y);
}

// Runde Teile: wie eine Kugel beleuchtet (Licht von links oben vorne), mit Reflexlicht am Rand unten rechts
function kugelLicht(rampe, nx, ny, licht, x, y) {
  const r2 = nx * nx + ny * ny;
  const nz = Math.sqrt(Math.max(0, 1 - r2));
  let d = -nx * 0.5 - ny * 0.62 + nz * 0.6; // Skalarprodukt mit der Lichtrichtung
  d += licht * 0.6;
  let v = 0.4 + d * 2.9;
  if (r2 > 0.62 && nx + ny > 0.7) v = Math.max(v, 1.05); // Reflexlicht vom Boden
  return stufe(rampe, v, x, y);
}

// Gefüllte Ellipse mit Schattierung
function ellipse(e, cx, cy, rx, ry, rampe, { licht = 0, nurOben = null, nurUnten = null } = {}) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    if (nurOben !== null && y > nurOben) continue;
    if (nurUnten !== null && y < nurUnten) continue;
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry;
      if (nx * nx + ny * ny <= 1) e.setze(x, y, (rx < 2.5 || ry < 2.5) ? schattiere(rampe, nx, ny, licht, x, y) : kugelLicht(rampe, nx, ny, licht, x, y));
    }
  }
}

// Gefülltes Rechteck mit Schattierung (optional abgerundet)
function rechteck(e, x0, y0, b, h, rampe, { rund = 0, licht = 0 } = {}) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + b; x++) {
      if (rund) {
        const ex = Math.min(x - x0, x0 + b - 1 - x), ey = Math.min(y - y0, y0 + h - 1 - y);
        if (ex + ey < rund) continue;
      }
      const nx = ((x + 0.5 - x0) / b) * 2 - 1, ny = ((y + 0.5 - y0) / h) * 2 - 1;
      e.setze(x, y, schattiere(rampe, nx, ny, licht, x, y));
    }
  }
}

// Polygon (Liste von [x, y]) gefüllt mit Schattierung
function vieleck(e, punkte, rampe, { licht = 0 } = {}) {
  const xs = punkte.map((p) => p[0]), ys = punkte.map((p) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
    for (let x = Math.floor(minX); x <= Math.ceil(maxX); x++) {
      const px = x + 0.5, py = y + 0.5;
      let innen = false;
      for (let i = 0, j = punkte.length - 1; i < punkte.length; j = i++) {
        const [xi, yi] = punkte[i], [xj, yj] = punkte[j];
        if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) innen = !innen;
      }
      if (!innen) continue;
      const nx = ((px - minX) / (maxX - minX || 1)) * 2 - 1, ny = ((py - minY) / (maxY - minY || 1)) * 2 - 1;
      e.setze(x, y, schattiere(rampe, nx, ny, licht, x, y));
    }
  }
}

// Ein "Teil" wird auf eine eigene Ebene gemalt, bekommt einen Umriss und wird dann aufgeklebt
function teil(bild, malen, { umriss = true } = {}) {
  const e = new Ebene(bild.b, bild.h);
  malen(e);
  if (umriss) e.umriss();
  e.aufmalen(bild);
}

// Horn: eine Kette von Kreisen entlang gebogener Linie, mit Ringen (abwechselnd heller/dunkler)
function horn(e, punkte, rampe) {
  punkte.forEach(([x, y, r], i) => ellipse(e, x, y, r, r, rampe, { licht: i % 2 ? -0.3 : 0.15 }));
}

// ---------------------------------------------------------------------------
// DER GROSSE ZWERG (Rahmen 32 x 48, Füsse bei y = 46)
// ---------------------------------------------------------------------------
export const HELD_B = 32;
export const HELD_H = 48;

const HELD_GRUND = {
  haut: RAMPEN.haut, bart: RAMPEN.rot, helm: RAMPEN.stahl, rand: RAMPEN.gold, horn: RAMPEN.horn,
  tunika: RAMPEN.blau, hose: RAMPEN.hose, stiefel: RAMPEN.stiefel, gurt: RAMPEN.leder,
  kette: RAMPEN.kette, rucksack: RAMPEN.leder, rolle: RAMPEN.beige,
};
let HELD_FARBEN = HELD_GRUND;

// --- Kleine Bauteile, die alle Ansichten des Grossen Zwergs teilen ---
// Stiefel mit Sohle und Glanz auf der Spitze
function stiefel(e, fx, fy, rampe, { rx = 3.7, licht = 0 } = {}) {
  ellipse(e, fx, fy, rx, 2.3, rampe, { licht });
  const sohle = Math.round(fy + 1.8);
  for (let x = Math.floor(fx - rx); x <= Math.ceil(fx + rx); x++) if (e.voll(x, sohle)) e.setze(x, sohle, stufe(rampe, 0));
  e.setze(Math.round(fx - rx / 2), Math.round(fy - 1), stufe(rampe, 4 + licht));
}
// Hosenbein mit Fellstulpe über dem Stiefel
function hosenbein(e, x, y0, b, h, F, licht = 0) {
  rechteck(e, x, y0, b, h, F.hose, { licht });
  rechteck(e, x - 1, y0 + h - 2, b + 2, 2, RAMPEN.beige, { licht: licht - 0.2 });
}
// Ärmel mit lederner Armschiene am Handgelenk (Armschiene unten bzw. oben bei erhobenem Arm)
function aermel(e, x, y0, h, F, { hoch = false, licht = 0 } = {}) {
  rechteck(e, x, y0, 4, h, F.tunika, { rund: 1, licht });
  const sy = hoch ? y0 : y0 + h - 4;
  rechteck(e, x, sy, 4, 3, F.gurt, { licht: licht + 0.2 });
  e.setze(x + 1, sy + 1, stufe(F.rand, 3));
}
// Faust mit angedeuteten Fingern
function faust(e, x, y, F) {
  ellipse(e, x, y, 2.3, 2.3, F.haut);
  e.setze(Math.round(x), Math.round(y + 1), stufe(F.haut, 0.6));
  e.setze(Math.round(x - 1), Math.round(y - 1), stufe(F.haut, 3.6));
}
// Metall-Schulterstück
function schulter(e, x, y, F) {
  ellipse(e, x, y, 3.2, 2.4, F.helm, { nurOben: Math.round(y + 1) });
  e.setze(Math.round(x), Math.round(y), stufe(F.rand, 3));
}
// Geflochtener Zopf mit Goldringen
function zopf(e, x0, y0, h, F) {
  for (let y = 0; y < h; y++) {
    const muster = y % 2 ? [1.4, 2.4, 3.2] : [3, 2.2, 1.2];
    for (let k = 0; k < 3; k++) e.setze(x0 + k, y0 + y, stufe(F.bart, muster[k] - (y / h) * 0.5));
  }
  const ry = Math.min(h - 2, 3);
  e.setze(x0, y0 + ry, stufe(F.rand, 4)); e.setze(x0 + 1, y0 + ry, stufe(F.rand, 3)); e.setze(x0 + 2, y0 + ry, stufe(F.rand, 1));
  e.setze(x0 + 1, y0 + h, stufe(F.bart, 1));
}
// Gürtel mit Goldschnalle
function guertel(e, x0, y, b, F, schnalleX) {
  rechteck(e, x0, y, b, 3, F.gurt);
  for (let x = x0 + 1; x < x0 + b - 1; x++) e.setze(x, y, stufe(F.gurt, 3));
  if (schnalleX !== undefined) {
    rechteck(e, schnalleX, y - 0.5, 4, 4, F.rand);
    e.setze(schnalleX + 1, y + 1, stufe(F.gurt, 0)); e.setze(schnalleX + 2, y + 1, stufe(F.gurt, 0));
    e.setze(schnalleX, y, stufe(F.rand, 4));
  }
}
// Hörnerhelm-Kuppel: Mittelgrat, Glanzstreifen, Goldband mit Nieten
function helmKuppel(e, cx, oy, F, { breite = 8.3, bandX = 7, bandB = 18 } = {}) {
  ellipse(e, cx, 8 + oy, breite, 6.8, F.helm, { nurOben: 7 + oy });
  for (let y = 2; y <= 5; y++) { e.setze(cx, y + oy, stufe(F.helm, 3.3)); e.setze(cx + 1, y + oy, stufe(F.helm, 1)); }
  for (const [x, y] of [[cx - 5, 4], [cx - 4, 3], [cx - 3, 2]]) e.setze(x, y + oy, stufe(F.helm, 4));
  rechteck(e, bandX, 6 + oy, bandB, 3, F.rand);
  for (let x = bandX + 2; x < bandX + bandB - 1; x += 3) { e.setze(x, 7 + oy, stufe(F.rand, 4)); e.setze(x + 1, 8 + oy, stufe(F.rand, 0)); }
}

// phase: 0..1 im Laufzyklus, laufen: bool, pose: 'normal' | 'tragen' | 'strecken' | 'jubeln'
function heldVorne(bild, { phase = 0, laufen = false, pose = 'normal', augen = 'offen', mund = false, atmen = 0 }) {
  const F = HELD_FARBEN;
  const w = phase * Math.PI * 2;
  const schritt = laufen ? Math.sin(w) : 0;
  const hub = laufen ? Math.round(Math.abs(Math.sin(w)) * 1.2) : atmen; // Körper geht beim Laufen hoch
  const oy = -hub + (pose === 'strecken' ? -2 : 0);
  const bartSchwung = laufen ? Math.round(Math.sin(w + 1.2) * 0.8) : 0;
  const lFuss = laufen ? Math.max(0, Math.round(-schritt * 1.5)) : 0;
  const rFuss = laufen ? Math.max(0, Math.round(schritt * 1.5)) : 0;

  teil(bild, (e) => { stiefel(e, 11.5, 44.5 - lFuss, F.stiefel); stiefel(e, 20.5, 44.5 - rFuss, F.stiefel); });
  teil(bild, (e) => {
    hosenbein(e, 9, 36 + oy, 5, 8 - lFuss - oy, F);
    hosenbein(e, 18, 36 + oy, 5, 8 - rFuss - oy, F);
  });

  const armSchwung = laufen ? Math.round(Math.sin(w) * 1.5) : 0;
  const arme = (e) => {
    if (pose === 'tragen' || pose === 'jubeln') {
      aermel(e, 3, 10 + oy, 13, F, { hoch: true }); aermel(e, 25, 10 + oy, 13, F, { hoch: true });
    } else if (pose === 'strecken') {
      aermel(e, 3, 21 + oy, 10, F); aermel(e, 25, 4 + oy, 18, F, { hoch: true });
    } else {
      aermel(e, 3, 21 + oy + armSchwung, 10, F); aermel(e, 25, 21 + oy - armSchwung, 10, F);
    }
  };
  const haende = (e) => {
    if (pose === 'tragen' || pose === 'jubeln') { faust(e, 5, 8 + oy, F); faust(e, 27, 8 + oy, F); }
    else if (pose === 'strecken') { faust(e, 5, 32 + oy, F); faust(e, 27, 2 + oy, F); }
    else { faust(e, 5, 32 + oy + armSchwung, F); faust(e, 27, 32 + oy - armSchwung, F); }
  };

  // Rumpf: Tunika mit Falten, Kettenhemd-Kragen, Gürtel mit Schnalle und Tasche
  teil(bild, (e) => {
    ellipse(e, 16, 29 + oy, 9.5, 9, F.tunika);
    for (let x = 9; x <= 23; x++) {
      for (let y = 20; y <= 22; y++) e.setze(x, y + oy, stufe(F.kette, (x + y) % 2 ? 1 : (y === 20 ? 4 : 3)));
    }
    for (const fx of [11, 16, 21]) for (let y = 36; y <= 37; y++) if (e.voll(fx, y + oy)) e.setze(fx, y + oy, stufe(F.tunika, 0.6));
    guertel(e, 7, 33 + oy, 18, F, 14);
    rechteck(e, 21, 34 + oy, 4, 3, F.gurt, { licht: 0.3 });
    e.setze(22, 34 + oy, stufe(F.gurt, 0));
  });
  teil(bild, arme);
  teil(bild, (e) => { schulter(e, 5, 21 + oy, F); schulter(e, 27, 21 + oy, F); });
  teil(bild, haende);

  // Kopf
  teil(bild, (e) => {
    ellipse(e, 16, 13 + oy, 7.2, 7, F.haut);
    ellipse(e, 8.6, 12.5 + oy, 1.4, 2, F.haut); // Ohren
    ellipse(e, 23.4, 12.5 + oy, 1.4, 2, F.haut);
  });
  // Bart aus fliessenden Strähnen, zwei geflochtene Zöpfe mit Goldringen
  teil(bild, (e) => {
    const b = bartSchwung;
    vieleck(e, [[7.5, 11], [9.5, 13.5], [12.5, 15.5], [19.5, 15.5], [22.5, 13.5], [24.5, 11], [25.5, 20], [24, 27], [21, 30], [11, 30], [8, 27], [6.5, 20]].map(([x, y]) => [x, y + oy]), F.bart);
    straehnen(e, F.bart, { breite: 4, oben: 13 + oy, unten: 30 + oy, phase: b });
    for (const zx of [12.5 + b, 19.5 + b]) zopf(e, Math.round(zx - 1.5), 29 + oy, 7, F);
  });
  // Gesicht: Schnurrbart, Augen, Brauen, Nase, Bäckchen, Mund
  teil(bild, (e) => {
    ellipse(e, 13.2, 16.8 + oy, 3.2, 1.5, F.bart, { licht: 0.5 });
    ellipse(e, 18.8, 16.8 + oy, 3.2, 1.5, F.bart, { licht: 0.5 });
    for (const x of [11, 12, 19, 20]) e.setze(x, 16 + oy, stufe(F.bart, 4));
  }, { umriss: false });
  const g = new Ebene(bild.b, bild.h);
  for (const ax of [12, 19]) {
    if (augen === 'offen') {
      g.setze(ax, 11 + oy, UMRISS); g.setze(ax + 1, 11 + oy, UMRISS);
      g.setze(ax, 12 + oy, UMRISS); g.setze(ax + 1, 12 + oy, '#3a3050');
      g.setze(ax, 11 + oy, '#ffffff');
    } else { g.setze(ax, 12 + oy, UMRISS); g.setze(ax + 1, 12 + oy, UMRISS); }
  }
  for (const [x, y, v] of [[11, 9, 1], [12, 9, 3], [13, 9, 3], [14, 10, 1], [18, 10, 1], [19, 9, 3], [20, 9, 3], [21, 9, 1]]) g.setze(x, y + oy, stufe(F.bart, v));
  g.setze(11, 13 + oy, misch(alsRgb(F.haut[1]), alsRgb('#e05a6a'), 0.45)); g.setze(21, 13 + oy, misch(alsRgb(F.haut[1]), alsRgb('#e05a6a'), 0.45));
  ellipse(g, 16, 14 + oy, 1.9, 1.7, F.haut, { licht: -0.3 });
  g.setze(15, 13 + oy, stufe(F.haut, 4));
  if (mund || pose === 'jubeln') { g.setze(15, 18 + oy, '#5a1a1a'); g.setze(16, 18 + oy, '#5a1a1a'); g.setze(17, 18 + oy, '#5a1a1a'); g.setze(16, 19 + oy, '#c04050'); }
  g.aufmalen(bild);

  // Hörnerhelm
  teil(bild, (e) => helmKuppel(e, 16, oy, F));
  teil(bild, (e) => {
    horn(e, [[7.5, 5.5, 2.2], [5.5, 3.8, 1.9], [4, 2, 1.4], [3.2, 0.7, 0.9]].map(([x, y, r]) => [x, y + oy, r]), F.horn);
    horn(e, [[24.5, 5.5, 2.2], [26.5, 3.8, 1.9], [28, 2, 1.4], [28.8, 0.7, 0.9]].map(([x, y, r]) => [x, y + oy, r]), F.horn);
  });
}

function heldHinten(bild, { phase = 0, laufen = false, pose = 'normal', atmen = 0 }) {
  const F = HELD_FARBEN;
  const w = phase * Math.PI * 2;
  const schritt = laufen ? Math.sin(w) : 0;
  const hub = laufen ? Math.round(Math.abs(Math.sin(w)) * 1.2) : atmen;
  const oy = -hub + (pose === 'strecken' ? -2 : 0);
  const lFuss = laufen ? Math.max(0, Math.round(-schritt * 1.5)) : 0;
  const rFuss = laufen ? Math.max(0, Math.round(schritt * 1.5)) : 0;
  const armSchwung = laufen ? Math.round(Math.sin(w) * 1.5) : 0;

  teil(bild, (e) => { stiefel(e, 11.5, 44.5 - lFuss, F.stiefel); stiefel(e, 20.5, 44.5 - rFuss, F.stiefel); });
  teil(bild, (e) => {
    hosenbein(e, 9, 36 + oy, 5, 8 - lFuss - oy, F);
    hosenbein(e, 18, 36 + oy, 5, 8 - rFuss - oy, F);
  });
  teil(bild, (e) => {
    ellipse(e, 16, 29 + oy, 9.5, 9, F.tunika);
    for (const fx of [11, 16, 21]) for (let y = 36; y <= 37; y++) if (e.voll(fx, y + oy)) e.setze(fx, y + oy, stufe(F.tunika, 0.6));
    guertel(e, 7, 33 + oy, 18, F);
  });
  const hoch = pose === 'tragen' || pose === 'jubeln';
  teil(bild, (e) => {
    if (hoch) { aermel(e, 3, 10 + oy, 13, F, { hoch: true }); aermel(e, 25, 10 + oy, 13, F, { hoch: true }); }
    else if (pose === 'strecken') { aermel(e, 3, 21 + oy, 10, F); aermel(e, 25, 4 + oy, 18, F, { hoch: true }); }
    else { aermel(e, 3, 21 + oy - armSchwung, 10, F); aermel(e, 25, 21 + oy + armSchwung, 10, F); }
  });
  teil(bild, (e) => { schulter(e, 5, 21 + oy, F); schulter(e, 27, 21 + oy, F); });
  teil(bild, (e) => {
    if (hoch) { faust(e, 5, 8 + oy, F); faust(e, 27, 8 + oy, F); }
    else if (pose === 'strecken') { faust(e, 5, 32 + oy, F); faust(e, 27, 2 + oy, F); }
    else { faust(e, 5, 32 + oy - armSchwung, F); faust(e, 27, 32 + oy + armSchwung, F); }
  });
  // Kopf von hinten: Haare in Strähnen, Bart schaut seitlich hervor
  teil(bild, (e) => {
    ellipse(e, 16, 13 + oy, 7.4, 7, F.bart);
    straehnen(e, F.bart, { breite: 3, welle: 0.6, oben: 7 + oy, unten: 20 + oy });
    ellipse(e, 8.4, 12.5 + oy, 1.4, 2, F.haut); ellipse(e, 23.6, 12.5 + oy, 1.4, 2, F.haut);
  });
  teil(bild, (e) => {
    rechteck(e, 5, 17 + oy, 3, 6, F.bart); rechteck(e, 24, 17 + oy, 3, 6, F.bart);
    straehnen(e, F.bart, { breite: 2, welle: 0.3, oben: 17 + oy, unten: 23 + oy });
  });
  // Rucksack mit Riemen, Tasche, Deckenrolle und Laterne
  teil(bild, (e) => {
    rechteck(e, 9, 20 + oy, 14, 14, F.rucksack, { rund: 2 });
    rechteck(e, 9, 20 + oy, 14, 5, F.rucksack, { licht: 0.5, rund: 2 });
    for (let x = 10; x < 22; x++) e.setze(x, 25 + oy, stufe(F.rucksack, 0.5));
    rechteck(e, 12, 27 + oy, 8, 5, F.rucksack, { licht: -0.3, rund: 1 });
    rechteck(e, 15, 24 + oy, 2, 3, F.rand);
    e.setze(15, 24 + oy, stufe(F.rand, 4));
    for (let y = 21; y < 33; y += 2) { e.setze(10, y + oy, stufe(F.rucksack, 3.5)); }
  });
  teil(bild, (e) => {
    rechteck(e, 7, 17 + oy, 18, 4, F.rolle, { rund: 1 });
    for (let x = 9; x < 24; x += 3) e.setze(x, 18 + oy, stufe(F.rolle, 1));
    for (const rx of [12, 19]) for (let y = 17; y <= 20; y++) e.setze(rx, y + oy, y === 17 ? '#e05a50' : '#b0413e');
  });
  teil(bild, (e) => {
    rechteck(e, 21, 27 + oy, 4, 5, F.rand);
    e.setze(22, 29 + oy, '#fff8c0'); e.setze(23, 29 + oy, '#ffe066'); e.setze(22, 30 + oy, '#ffb040'); e.setze(23, 30 + oy, '#ff9d2e');
    e.setze(23, 26 + oy, stufe(F.rand, 1));
  });
  teil(bild, (e) => helmKuppel(e, 16, oy, F));
  teil(bild, (e) => {
    horn(e, [[7.5, 5.5, 2.2], [5.5, 3.8, 1.9], [4, 2, 1.4], [3.2, 0.7, 0.9]].map(([x, y, r]) => [x, y + oy, r]), F.horn);
    horn(e, [[24.5, 5.5, 2.2], [26.5, 3.8, 1.9], [28, 2, 1.4], [28.8, 0.7, 0.9]].map(([x, y, r]) => [x, y + oy, r]), F.horn);
  });
}

// Seitenansicht, schaut nach rechts
function heldSeite(bild, { phase = 0, laufen = false, pose = 'normal', augen = 'offen', mund = false, atmen = 0 }) {
  const F = HELD_FARBEN;
  const w = phase * Math.PI * 2;
  const s = laufen ? Math.sin(w) : 0;
  const hub = laufen ? Math.round(Math.abs(Math.sin(w)) * 1.2) : atmen;
  const oy = -hub + (pose === 'strecken' ? -2 : 0);
  const bartSchwung = laufen ? Math.round(Math.cos(w) * 0.8) : 0;
  const vorn = Math.round(s * 3.5), hinten = Math.round(-s * 3.5);
  const vornHoch = laufen && s > 0.3 ? 1 : 0, hintenHoch = laufen && s < -0.3 ? 1 : 0;
  const hoch = pose === 'tragen' || pose === 'jubeln';

  // hinteres Bein + Arm (dunkler, weil weiter weg)
  teil(bild, (e) => {
    hosenbein(e, 13 + hinten, 36 + oy, 5, 8 - oy - hintenHoch, F, -0.5);
    stiefel(e, 16.5 + hinten, 44.5 - hintenHoch, F.stiefel, { rx: 3.8, licht: -0.5 });
  });
  teil(bild, (e) => {
    if (hoch) aermel(e, 13, 8 + oy, 14, F, { hoch: true, licht: -0.5 });
    else aermel(e, 14 - Math.round(s * 2), 21 + oy, 10, F, { licht: -0.5 });
  });
  // Rucksack
  teil(bild, (e) => {
    rechteck(e, 4, 19 + oy, 7, 15, F.rucksack, { rund: 2 });
    for (let y = 20; y < 33; y += 2) e.setze(5, y + oy, stufe(F.rucksack, 3.5));
    rechteck(e, 3, 16 + oy, 8, 5, F.rolle, { rund: 2 });
    e.setze(6, 17 + oy, '#e05a50'); e.setze(6, 18 + oy, '#b0413e'); e.setze(6, 19 + oy, '#b0413e');
    rechteck(e, 5, 29 + oy, 3, 4, F.rand);
    e.setze(6, 31 + oy, '#ffe066'); e.setze(6, 30 + oy, '#fff8c0');
  });
  // vorderes Bein
  teil(bild, (e) => {
    hosenbein(e, 13 + vorn, 36 + oy, 5, 8 - oy - vornHoch, F);
    stiefel(e, 16.5 + vorn, 44.5 - vornHoch, F.stiefel, { rx: 3.8 });
  });
  // Rumpf
  teil(bild, (e) => {
    ellipse(e, 15.5, 29 + oy, 7.5, 9, F.tunika);
    for (let x = 12; x <= 21; x++) for (let y = 20; y <= 22; y++) if (e.voll(x, y + oy)) e.setze(x, y + oy, stufe(F.kette, (x + y) % 2 ? 1 : (y === 20 ? 4 : 3)));
    for (const fx of [12, 17]) for (let y = 36; y <= 37; y++) if (e.voll(fx, y + oy)) e.setze(fx, y + oy, stufe(F.tunika, 0.6));
    guertel(e, 8, 33 + oy, 15, F);
    rechteck(e, 20, 33 + oy, 3, 3, F.rand);
    e.setze(20, 33 + oy, stufe(F.rand, 4));
  });
  // erhobener vorderer Arm liegt hinter dem Kopf (nur die Hand schaut oben heraus)
  if (hoch || pose === 'strecken') {
    teil(bild, (e) => aermel(e, 15, (hoch ? 6 : 1) + oy, hoch ? 17 : 22, F, { hoch: true }));
  }
  // Kopf
  teil(bild, (e) => {
    ellipse(e, 17, 13 + oy, 6.8, 7, F.haut);
    ellipse(e, 23.3, 14 + oy, 2.1, 1.8, F.haut); // Nase
    e.setze(23, 13 + oy, stufe(F.haut, 4));
  });
  // Haare hinten + Ohr
  teil(bild, (e) => {
    ellipse(e, 12.5, 13 + oy, 3.2, 5.5, F.bart);
    straehnen(e, F.bart, { breite: 2, welle: 0.4, oben: 8 + oy, unten: 18 + oy });
    ellipse(e, 15.5, 12.5 + oy, 1.3, 1.9, F.haut);
  });
  // Bart
  teil(bild, (e) => {
    const b = bartSchwung;
    vieleck(e, [[13.5, 11], [16.5, 14], [21, 15.5], [25, 16.5], [25, 24], [22 + b, 30], [17 + b, 31], [14, 26]].map(([x, y]) => [x, y + oy]), F.bart);
    straehnen(e, F.bart, { breite: 4, oben: 14 + oy, unten: 31 + oy, schraeg: -0.25, phase: b });
    zopf(e, 19 + b, 29 + oy, 7, F);
  });
  const g = new Ebene(bild.b, bild.h);
  ellipse(g, 22.5, 16.4 + oy, 2.6, 1.4, F.bart, { licht: 0.5 });
  g.setze(21, 16 + oy, stufe(F.bart, 4)); g.setze(22, 16 + oy, stufe(F.bart, 4));
  if (augen === 'offen') { g.setze(20, 11 + oy, '#ffffff'); g.setze(21, 11 + oy, UMRISS); g.setze(21, 12 + oy, '#3a3050'); g.setze(20, 12 + oy, UMRISS); }
  else { g.setze(20, 12 + oy, UMRISS); g.setze(21, 12 + oy, UMRISS); }
  for (const [x, y, v] of [[19, 9, 1], [20, 9, 3], [21, 9, 3], [22, 10, 1]]) g.setze(x, y + oy, stufe(F.bart, v));
  g.setze(19, 14 + oy, misch(alsRgb(F.haut[1]), alsRgb('#e05a6a'), 0.45));
  if (mund || pose === 'jubeln') { g.setze(22, 18 + oy, '#5a1a1a'); g.setze(23, 18 + oy, '#5a1a1a'); }
  g.aufmalen(bild);
  // vorderer Arm (hängend) – der erhobene wurde schon hinter dem Kopf gemalt
  if (!hoch && pose !== 'strecken') {
    teil(bild, (e) => aermel(e, 16 + Math.round(s * 2), 21 + oy, 10, F));
    teil(bild, (e) => schulter(e, 18, 21 + oy, F));
    teil(bild, (e) => faust(e, 18 + Math.round(s * 2.5), 32 + oy, F));
  }
  // Helm
  teil(bild, (e) => helmKuppel(e, 16.5, oy, F, { breite: 8, bandX: 8, bandB: 17 }));
  teil(bild, (e) => {
    horn(e, [[14.5, 4, 2.1], [13, 2.2, 1.7], [12.2, 0.8, 1.1]].map(([x, y, r]) => [x, y + oy, r]), F.horn);
  });
  if (hoch) teil(bild, (e) => faust(e, 17, 4 + oy, F));
  if (pose === 'strecken') teil(bild, (e) => faust(e, 17, 1 + oy, F));
}

const HELD_ANSICHT = { unten: heldVorne, oben: heldHinten, seite: heldSeite };

// Alle Bilder des Grossen Zwergs erzeugen: { name: Ebene }
export const LAUF_PHASEN = 6;
// kleid: Farben, die anders sein sollen, z.B. { tunika: 'weinrot', helm: 'gold' } (Namen aus RAMPEN)
export function baueHeld(kleid = {}) {
  HELD_FARBEN = { ...HELD_GRUND };
  for (const [teil, farbe] of Object.entries(kleid)) if (RAMPEN[farbe]) HELD_FARBEN[teil] = RAMPEN[farbe];
  const bilder = {};
  const neu = () => new Ebene(HELD_B, HELD_H);
  for (const [richtung, malen] of Object.entries(HELD_ANSICHT)) {
    for (const pose of ['normal', 'tragen']) {
      const p = pose === 'normal' ? '' : '_tragen';
      for (let i = 0; i < LAUF_PHASEN; i++) {
        const b = neu(); malen(b, { phase: i / LAUF_PHASEN, laufen: true, pose }); bilder[`held_${richtung}${p}_lauf${i}`] = b;
      }
      for (let i = 0; i < 2; i++) {
        const b = neu(); malen(b, { atmen: i, pose }); bilder[`held_${richtung}${p}_steh${i}`] = b;
      }
      const z = neu(); malen(z, { pose, augen: 'zu' }); bilder[`held_${richtung}${p}_blinzeln`] = z;
      const m = neu(); malen(m, { pose, mund: true }); bilder[`held_${richtung}${p}_reden`] = m;
    }
    const s = neu(); malen(s, { pose: 'strecken' }); bilder[`held_${richtung}_strecken`] = s;
    const j = neu(); malen(j, { pose: 'jubeln' }); bilder[`held_${richtung}_jubeln`] = j;
  }
  return bilder;
}

// ---------------------------------------------------------------------------
// DORF-ZWERGE (Rahmen 28 x 36, Füsse bei y = 34)
// ---------------------------------------------------------------------------
export const FIGUR_B = 28;
export const FIGUR_H = 36;

// aussehen: { typ: zwerg|zwergin|kind|koenigin|bote, haar, bart, kopf, kopfFarbe, kleid, schuerze, umhang, haut }
function figurVorne(bild, a, { blick = 0, mund = false, augen = 'offen', atmen = 0, jubeln = false }) {
  const R = (n, ersatz) => RAMPEN[n] || RAMPEN[ersatz];
  const haut = R(a.haut, 'haut');
  const haar = R(a.haar, 'braun');
  const kleid = R(a.kleid, 'gruen');
  const kopfF = R(a.kopfFarbe, a.kopf === 'kapuze' ? 'gruen' : 'stahl');
  const kind = a.typ === 'kind';
  const frau = a.typ === 'zwergin' || a.typ === 'koenigin';
  const cx = 14;
  // Proportionen
  const fussY = 34;
  const koerperY = kind ? 26 : 23; // Mitte Rumpf
  const koerperR = kind ? [6, 5] : [8.5, 7.5];
  const kopfY = (kind ? 16 : 11.5) - atmen;
  const kopfR = kind ? [6.2, 6] : [6.4, 6];
  const oy = -atmen;

  // Umhang hinten
  if (a.umhang) {
    teil(bild, (e) => vieleck(e, [[cx - 8, koerperY - 7], [cx + 8, koerperY - 7], [cx + 10, fussY - 1], [cx - 10, fussY - 1]], R(a.umhang, 'weinrot'), { licht: -0.3 }));
  }
  // Füsse + Beine / langes Kleid
  if (frau && !kind) {
    teil(bild, (e) => {
      stiefel(e, cx - 3.5, fussY - 1.5, RAMPEN.stiefel, { rx: 3 }); stiefel(e, cx + 3.5, fussY - 1.5, RAMPEN.stiefel, { rx: 3 });
    });
    teil(bild, (e) => {
      vieleck(e, [[cx - 7, koerperY], [cx + 7, koerperY], [cx + 9, fussY - 1], [cx - 9, fussY - 1]], kleid);
      // Falten im Rock
      for (const fx of [-4, 0, 4]) for (let y = koerperY + 4; y < fussY - 1; y++) if (e.voll(cx + fx + Math.round((y - koerperY) * fx * 0.04), y)) e.setze(cx + fx + Math.round((y - koerperY) * fx * 0.04), y, stufe(kleid, y % 3 ? 1 : 0.6));
      for (let x = cx - 9; x <= cx + 9; x++) if (e.voll(x, fussY - 2)) e.setze(x, fussY - 2, stufe(kleid, 3));
    });
  } else {
    teil(bild, (e) => {
      stiefel(e, cx - 3.5, fussY - 1.5, RAMPEN.stiefel, { rx: 3.2 }); stiefel(e, cx + 3.5, fussY - 1.5, RAMPEN.stiefel, { rx: 3.2 });
    });
    teil(bild, (e) => {
      rechteck(e, cx - 6, koerperY + koerperR[1] - 3, 5, fussY - (koerperY + koerperR[1] - 3) - 1, RAMPEN.hose);
      rechteck(e, cx + 1, koerperY + koerperR[1] - 3, 5, fussY - (koerperY + koerperR[1] - 3) - 1, RAMPEN.hose);
    });
  }
  // Arme
  const armY = koerperY - koerperR[1] + 2 + oy;
  const armL = kind ? 7 : 9;
  teil(bild, (e) => {
    if (jubeln) {
      rechteck(e, cx - koerperR[0] - 3, armY - armL + 1, 4, armL, kleid, { rund: 1 });
      rechteck(e, cx + koerperR[0] - 1, armY - armL + 1, 4, armL, kleid, { rund: 1 });
    } else {
      rechteck(e, cx - koerperR[0] - 2, armY, 4, armL, kleid, { rund: 1 });
      rechteck(e, cx + koerperR[0] - 2, armY, 4, armL, kleid, { rund: 1 });
    }
  });
  teil(bild, (e) => {
    const H = { haut };
    if (jubeln) { faust(e, cx - koerperR[0] - 1, armY - armL, H); faust(e, cx + koerperR[0] + 1, armY - armL, H); }
    else { faust(e, cx - koerperR[0], armY + armL, H); faust(e, cx + koerperR[0], armY + armL, H); }
  });
  // Rumpf
  teil(bild, (e) => {
    ellipse(e, cx, koerperY + oy, koerperR[0], koerperR[1], kleid);
    // Falten unten am Hemd
    for (const fx of [-4, 0, 4]) for (let y = koerperY + koerperR[1] - 2; y <= koerperY + koerperR[1]; y++) if (e.voll(cx + fx, y + oy)) e.setze(cx + fx, y + oy, stufe(kleid, 0.7));
    if (!frau || kind) {
      const gy = koerperY + koerperR[1] - 4 + oy;
      rechteck(e, cx - koerperR[0] + 1, gy, koerperR[0] * 2 - 1, 2, RAMPEN.leder);
      for (let x = cx - koerperR[0] + 2; x < cx + koerperR[0] - 1; x++) e.setze(x, gy, stufe(RAMPEN.leder, 3));
      rechteck(e, cx - 1, gy - 0.5, 3, 3, RAMPEN.gold);
      e.setze(cx, gy + 0.5, stufe(RAMPEN.leder, 0)); e.setze(cx - 1, gy - 0.5, stufe(RAMPEN.gold, 4));
    }
    if (a.schuerze) rechteck(e, cx - 4, koerperY - 3 + oy, 8, koerperR[1] + 5, R(a.schuerze, 'leder'), { rund: 1 });
    if (a.typ === 'koenigin') {
      rechteck(e, cx - koerperR[0], koerperY - koerperR[1] + oy, koerperR[0] * 2, 3, RAMPEN.weiss, { rund: 1 });
      e.setze(cx, koerperY + 1 + oy, RAMPEN.gold[2]); e.setze(cx, koerperY + 4 + oy, RAMPEN.gold[2]);
    }
  });
  // lange Zöpfe (Zwergin) hinter dem Kopf
  if (frau && !kind) {
    teil(bild, (e) => {
      for (const zx of [cx - 8, cx + 6]) {
        const x0 = Math.round(zx);
        for (let y = 0; y < 14; y++) {
          const hell = y % 3 === 0;
          e.setze(x0 + (y % 2), kopfY + 1 + y, hell ? haar[2] : haar[1]);
          e.setze(x0 + 1 - (y % 2), kopfY + 1 + y, haar[0]);
          e.setze(x0 + 2, kopfY + 1 + y, y % 3 === 1 ? haar[1] : haar[0]);
        }
        rechteck(e, x0, kopfY + 11, 3, 1, RAMPEN.gold);
      }
    });
  }
  // Kopf
  teil(bild, (e) => {
    ellipse(e, cx, kopfY, kopfR[0], kopfR[1], haut);
    ellipse(e, cx - kopfR[0] - 0.5, kopfY + 0.5, 1.2, 1.7, haut); ellipse(e, cx + kopfR[0] + 0.5, kopfY + 0.5, 1.2, 1.7, haut);
  });
  // Bart
  const bart = a.bart || (a.typ === 'zwerg' ? 'lang' : 'keiner');
  if (bart !== 'keiner') {
    teil(bild, (e) => {
      const by = kopfY + 1.5;
      if (bart === 'lang') {
        vieleck(e, [[cx - 6.5, by], [cx + 6.5, by], [cx + 7.5, by + 6], [cx + 4, by + 13], [cx, by + 15], [cx - 4, by + 13], [cx - 7.5, by + 6]], haar);
      } else if (bart === 'gabel') {
        vieleck(e, [[cx - 6.5, by], [cx + 6.5, by], [cx + 7, by + 6], [cx + 5, by + 13], [cx + 2, by + 10], [cx - 2, by + 10], [cx - 5, by + 13], [cx - 7, by + 6]], haar);
      } else if (bart === 'zoepfe') {
        vieleck(e, [[cx - 6.5, by], [cx + 6.5, by], [cx + 6.5, by + 6], [cx - 6.5, by + 6]], haar);
        straehnen(e, haar, { breite: 3, welle: 0.6, oben: by, unten: by + 6 });
        zopf(e, cx - 5, by + 5, 8, { bart: haar, rand: RAMPEN.gold }); zopf(e, cx + 2, by + 5, 8, { bart: haar, rand: RAMPEN.gold });
      } else if (bart === 'kurz') {
        vieleck(e, [[cx - 6.5, by], [cx + 6.5, by], [cx + 6, by + 5], [cx, by + 7], [cx - 6, by + 5]], haar);
      }
      if (bart !== 'zoepfe') straehnen(e, haar, { breite: 3, welle: 0.8, oben: by, unten: by + 15 });
    });
  }
  // Gesicht
  const g = new Ebene(bild.b, bild.h);
  const ay = Math.round(kopfY - 0.5);
  const bx = Math.round(blick);
  for (const ax of [cx - 3, cx + 2]) {
    if (augen === 'offen') {
      g.setze(ax, ay, '#ffffff'); g.setze(ax + 1, ay, '#ffffff');
      g.setze(ax + (bx > 0 ? 1 : 0), ay, UMRISS);
      g.setze(ax, ay + 1, UMRISS); g.setze(ax + 1, ay + 1, UMRISS);
      if (bx < 0) g.setze(ax, ay, UMRISS);
      if (kind || frau) { g.setze(ax - (ax < cx ? 1 : -2), ay - 1, UMRISS); }
    } else { g.setze(ax, ay + 1, UMRISS); g.setze(ax + 1, ay + 1, UMRISS); }
  }
  if (bart !== 'keiner') {
    for (const [x, y] of [[-4, -2], [-3, -2], [-2, -2], [2, -2], [3, -2], [4, -2]]) g.setze(cx + x, ay + y, haar[0]);
    ellipse(g, cx - 2, ay + 3.5, 2.2, 1.1, haar, { licht: 0.4 }); ellipse(g, cx + 2, ay + 3.5, 2.2, 1.1, haar, { licht: 0.4 });
  } else {
    g.setze(cx - 4, ay + 2, RAMPEN.rosa[2]); g.setze(cx + 4, ay + 2, RAMPEN.rosa[2]); // Bäckchen
  }
  ellipse(g, cx, ay + 2, 1.4, 1.2, haut, { licht: -0.4 });
  if (mund || jubeln) { g.setze(cx - 1, ay + 5, '#5a1a1a'); g.setze(cx, ay + 5, '#5a1a1a'); g.setze(cx, ay + 6, '#8a2a2a'); }
  else if (bart === 'keiner') { g.setze(cx - 1, ay + 4, '#9a4a4a'); g.setze(cx, ay + 4, '#9a4a4a'); }
  g.aufmalen(bild);

  // Kopfbedeckung
  const kopf = a.kopf || (a.typ === 'zwerg' ? 'nasenhelm' : a.typ === 'kind' ? 'kapuze' : 'stirnband');
  teil(bild, (e) => {
    const ky = kopfY;
    if (kopf === 'nasenhelm' || kopf === 'hoernerhelm' || kopf === 'federhelm') {
      ellipse(e, cx, ky - 1, kopfR[0] + 1.2, kopfR[1] + 0.5, kopfF, { nurOben: ky - 2 });
      for (let y = Math.round(ky - 7); y <= ky - 4; y++) { e.setze(cx, y, stufe(kopfF, 3.3)); e.setze(cx + 1, y, stufe(kopfF, 1)); }
      for (const [x, y] of [[-4, -5], [-3, -6]]) e.setze(cx + x, ky + y, stufe(kopfF, 4));
      rechteck(e, cx - kopfR[0] - 1, ky - 3, kopfR[0] * 2 + 3, 2, RAMPEN.gold);
      for (let x = cx - kopfR[0]; x < cx + kopfR[0] + 2; x += 3) e.setze(x, ky - 3, stufe(RAMPEN.gold, 4));
      if (kopf === 'nasenhelm') rechteck(e, cx - 0.5, ky - 2, 2, 4, kopfF);
    } else if (kopf === 'kapuze') {
      ellipse(e, cx, ky - 0.5, kopfR[0] + 1.5, kopfR[1] + 1, kopfF, { nurOben: ky - 2 });
      rechteck(e, cx - kopfR[0] - 1.5, ky - 3, 2, 6, kopfF); rechteck(e, cx + kopfR[0], ky - 3, 2, 6, kopfF);
      for (let x = Math.round(cx - kopfR[0]); x <= cx + kopfR[0]; x++) if (e.voll(x, ky - 2)) e.setze(x, ky - 2, stufe(kopfF, 3.5)); // Saum
    } else if (kopf === 'stirnband' || kopf === 'krone') {
      ellipse(e, cx, ky - 1, kopfR[0] + 0.8, kopfR[1] + 0.3, haar, { nurOben: ky - 2 });
      straehnen(e, haar, { breite: 2, welle: 0.3, oben: ky - 8, unten: ky - 2, schraeg: 0.3 });
      rechteck(e, cx - kopfR[0], ky - 3, kopfR[0] * 2 + 1, 2, kopf === 'krone' ? RAMPEN.gold : kopfF);
    } else if (kopf === 'glatze') {
      ellipse(e, cx, ky - 1, kopfR[0], kopfR[1], haut, { nurOben: ky - 3 });
      rechteck(e, cx - kopfR[0] - 1, ky - 2, 3, 4, haar); rechteck(e, cx + kopfR[0] - 1, ky - 2, 3, 4, haar);
    }
  });
  if (kopf === 'hoernerhelm') {
    teil(bild, (e) => {
      horn(e, [[cx - 6.5, kopfY - 3, 1.7], [cx - 8.5, kopfY - 5, 1.4], [cx - 9.5, kopfY - 7.5, 1]], RAMPEN.horn);
      horn(e, [[cx + 6.5, kopfY - 3, 1.7], [cx + 8.5, kopfY - 5, 1.4], [cx + 9.5, kopfY - 7.5, 1]], RAMPEN.horn);
    });
  }
  if (kopf === 'federhelm') {
    teil(bild, (e) => { ellipse(e, cx + 1, kopfY - 9, 2, 3.5, RAMPEN.rosa); ellipse(e, cx + 3, kopfY - 11, 1.5, 2.5, RAMPEN.rosa); });
  }
  if (kopf === 'krone') {
    teil(bild, (e) => {
      rechteck(e, cx - 5, kopfY - 6, 11, 3, RAMPEN.gold);
      for (const x of [-5, -2, 1, 4]) rechteck(e, cx + x, kopfY - 8, 2, 2, RAMPEN.gold);
      e.setze(cx, kopfY - 5, '#e05a8a'); e.setze(cx - 3, kopfY - 5, '#79a6e0'); e.setze(cx + 3, kopfY - 5, '#79a6e0');
    });
  }
  // Bote: Trompete
  if (a.typ === 'bote') {
    teil(bild, (e) => {
      rechteck(e, cx + 7, koerperY - 3, 6, 2, RAMPEN.gold);
      ellipse(e, cx + 13, koerperY - 2, 1.5, 2.5, RAMPEN.gold);
    });
  }
}

// Alle Bilder einer Dorf-Figur: steh0/1, blinzeln, reden, jubeln, blick links/rechts
export function baueFigur(aussehen) {
  const bilder = {};
  const neu = () => new Ebene(FIGUR_B, FIGUR_H);
  const mach = (name, opt) => { const b = neu(); figurVorne(b, aussehen, opt); bilder[name] = b; };
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

// Eine Ebene als Phaser-Textur anlegen
export function alsTextur(scene, key, ebene) {
  if (scene.textures.exists(key)) return key;
  const tex = scene.textures.createCanvas(key, ebene.b, ebene.h);
  const ctx = tex.getContext();
  ctx.putImageData(new ImageData(ebene.d, ebene.b, ebene.h), 0, 0);
  tex.refresh();
  return key;
}

// Für die Galerie: Ebene auf ein normales Canvas malen
export function alsCanvas(ebene, skala = 4) {
  const c = document.createElement('canvas');
  c.width = ebene.b * skala; c.height = ebene.h * skala;
  const tmp = document.createElement('canvas');
  tmp.width = ebene.b; tmp.height = ebene.h;
  tmp.getContext('2d').putImageData(new ImageData(ebene.d, ebene.b, ebene.h), 0, 0);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tmp, 0, 0, c.width, c.height);
  return c;
}

// Mal-Werkzeuge auch für Gebäude und Deko nutzbar machen
export { Ebene, ellipse, rechteck, vieleck, teil, horn, schattiere, straehnen, stufe, rampe5, misch, UMRISS };
