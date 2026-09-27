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
function hexZuRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

class Ebene {
  constructor(b, h) {
    this.b = b; this.h = h;
    this.d = new Uint8ClampedArray(b * h * 4);
  }

  setze(x, y, farbe) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.b || y >= this.h) return;
    const [r, g, b] = typeof farbe === 'string' ? hexZuRgb(farbe) : farbe;
    const i = (y * this.b + x) * 4;
    this.d[i] = r; this.d[i + 1] = g; this.d[i + 2] = b; this.d[i + 3] = 255;
  }

  voll(x, y) {
    if (x < 0 || y < 0 || x >= this.b || y >= this.h) return false;
    return this.d[(y * this.b + x) * 4 + 3] > 0;
  }

  // Um alle gemalten Pixel einen Umriss legen
  umriss(farbe = UMRISS) {
    const rgb = hexZuRgb(farbe);
    const neu = [];
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.b; x++) {
        if (this.voll(x, y)) continue;
        if (this.voll(x - 1, y) || this.voll(x + 1, y) || this.voll(x, y - 1) || this.voll(x, y + 1)) neu.push([x, y]);
      }
    }
    for (const [x, y] of neu) this.setze(x, y, rgb);
    return this;
  }

  aufmalen(ziel) {
    for (let i = 0; i < this.d.length; i += 4) {
      if (this.d[i + 3]) { ziel.d[i] = this.d[i]; ziel.d[i + 1] = this.d[i + 1]; ziel.d[i + 2] = this.d[i + 2]; ziel.d[i + 3] = 255; }
    }
  }
}

// Wählt aus der Rampe je nach Lage im Teil: oben links hell, unten rechts dunkel
function schattiere(rampe, nx, ny, licht = 0) {
  const l = -(nx * 0.55 + ny * 0.85) + licht;
  if (l > 0.55) return rampe[2];
  if (l < -0.45) return rampe[0];
  return rampe[1];
}

// Gefüllte Ellipse mit Schattierung
function ellipse(e, cx, cy, rx, ry, rampe, { licht = 0, nurOben = null, nurUnten = null } = {}) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    if (nurOben !== null && y > nurOben) continue;
    if (nurUnten !== null && y < nurUnten) continue;
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry;
      if (nx * nx + ny * ny <= 1) e.setze(x, y, schattiere(rampe, nx, ny, licht));
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
      e.setze(x, y, schattiere(rampe, nx, ny, licht));
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
      e.setze(x, y, schattiere(rampe, nx, ny, licht));
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

// Horn: eine Kette von Kreisen entlang gebogener Linie
function horn(e, punkte, rampe) {
  for (const [x, y, r] of punkte) ellipse(e, x, y, r, r, rampe);
}

// ---------------------------------------------------------------------------
// DER GROSSE ZWERG (Rahmen 32 x 48, Füsse bei y = 46)
// ---------------------------------------------------------------------------
export const HELD_B = 32;
export const HELD_H = 48;

const HELD_FARBEN = {
  haut: RAMPEN.haut, bart: RAMPEN.rot, helm: RAMPEN.stahl, rand: RAMPEN.gold, horn: RAMPEN.horn,
  tunika: RAMPEN.blau, hose: RAMPEN.hose, stiefel: RAMPEN.stiefel, gurt: RAMPEN.leder,
  kette: RAMPEN.kette, rucksack: RAMPEN.leder, rolle: RAMPEN.beige,
};

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

  // Stiefel
  teil(bild, (e) => {
    ellipse(e, 11.5, 44.5 - lFuss, 3.6, 2.2, F.stiefel);
    ellipse(e, 20.5, 44.5 - rFuss, 3.6, 2.2, F.stiefel);
  });
  // Beine
  teil(bild, (e) => {
    rechteck(e, 9, 36 + oy, 5, 8 - lFuss - oy, F.hose);
    rechteck(e, 18, 36 + oy, 5, 8 - rFuss - oy, F.hose);
  });

  // Arme (hinter dem Bart, vor/neben dem Rumpf)
  const armSchwung = laufen ? Math.round(Math.sin(w) * 1.5) : 0;
  const arme = (e) => {
    if (pose === 'tragen' || pose === 'jubeln') {
      rechteck(e, 3, 10 + oy, 4, 13, F.tunika, { rund: 1 });
      rechteck(e, 25, 10 + oy, 4, 13, F.tunika, { rund: 1 });
    } else if (pose === 'strecken') {
      rechteck(e, 3, 21 + oy, 4, 10, F.tunika, { rund: 1 });
      rechteck(e, 25, 4 + oy, 4, 18, F.tunika, { rund: 1 });
    } else {
      rechteck(e, 3, 21 + oy + armSchwung, 4, 10, F.tunika, { rund: 1 });
      rechteck(e, 25, 21 + oy - armSchwung, 4, 10, F.tunika, { rund: 1 });
    }
  };
  const haende = (e) => {
    if (pose === 'tragen' || pose === 'jubeln') {
      ellipse(e, 5, 8 + oy, 2.3, 2.3, F.haut);
      ellipse(e, 27, 8 + oy, 2.3, 2.3, F.haut);
    } else if (pose === 'strecken') {
      ellipse(e, 5, 32 + oy, 2.3, 2.3, F.haut);
      ellipse(e, 27, 2 + oy, 2.3, 2.3, F.haut);
    } else {
      ellipse(e, 5, 32 + oy + armSchwung, 2.3, 2.3, F.haut);
      ellipse(e, 27, 32 + oy - armSchwung, 2.3, 2.3, F.haut);
    }
  };

  // Rumpf mit Kettenhemd-Kragen und Gürtel
  teil(bild, (e) => {
    ellipse(e, 16, 29 + oy, 9.5, 9, F.tunika);
    for (let x = 9; x <= 23; x++) {
      for (let y = 20; y <= 22; y++) if ((x + y) % 2 === 0) e.setze(x, y + oy, F.kette[(x + y) % 4 === 0 ? 2 : 1]);
    }
    rechteck(e, 7, 33 + oy, 18, 3, F.gurt);
    rechteck(e, 14, 33 + oy, 4, 3, F.rand);
    e.setze(15, 34 + oy, F.gurt[0]);
  });
  teil(bild, arme);
  teil(bild, haende);

  // Kopf
  teil(bild, (e) => {
    ellipse(e, 16, 13 + oy, 7.2, 7, F.haut);
    ellipse(e, 8.6, 12.5 + oy, 1.4, 2, F.haut); // Ohren
    ellipse(e, 23.4, 12.5 + oy, 1.4, 2, F.haut);
  });
  // Bart mit zwei Zöpfen und Goldringen
  teil(bild, (e) => {
    const b = bartSchwung;
    vieleck(e, [[7.5, 11], [9.5, 13.5], [12.5, 15.5], [19.5, 15.5], [22.5, 13.5], [24.5, 11], [25.5, 20], [24, 27], [21, 30], [11, 30], [8, 27], [6.5, 20]].map(([x, y]) => [x, y + oy]), F.bart);
    for (const zx of [12.5 + b, 19.5 + b]) {
      rechteck(e, Math.round(zx - 1.5), 29 + oy, 3, 7, F.bart);
      rechteck(e, Math.round(zx - 1.5), 31 + oy, 3, 1, F.rand);
      rechteck(e, Math.round(zx - 1.5), 34 + oy, 3, 1, F.rand);
    }
    // Strähnen
    // Wellen im Bart: dunkle Strähnen und helle Glanzlichter
    for (let y = 19; y <= 28; y += 3) {
      for (let x = 9; x <= 23; x += 4) {
        const v = ((y / 3) % 2) * 2;
        e.setze(x + v, y + oy, F.bart[0]); e.setze(x + v + 1, y + 1 + oy, F.bart[0]);
        e.setze(x + v - 1, y - 1 + oy, F.bart[2]);
      }
    }
  });
  // Gesicht: Augen, Brauen, Nase, Schnurrbart, Mund
  teil(bild, (e) => {
    // Schnurrbart
    ellipse(e, 13.2, 16.8 + oy, 3.2, 1.5, F.bart, { licht: 0.5 });
    ellipse(e, 18.8, 16.8 + oy, 3.2, 1.5, F.bart, { licht: 0.5 });
  }, { umriss: false });
  const g = new Ebene(bild.b, bild.h);
  if (augen === 'offen') {
    for (const ax of [12, 19]) {
      g.setze(ax, 11 + oy, '#ffffff'); g.setze(ax + 1, 11 + oy, UMRISS);
      g.setze(ax, 12 + oy, UMRISS); g.setze(ax + 1, 12 + oy, UMRISS);
    }
  } else {
    for (const ax of [12, 19]) { g.setze(ax, 12 + oy, UMRISS); g.setze(ax + 1, 12 + oy, UMRISS); }
  }
  for (const [x, y] of [[11, 9], [12, 9], [13, 9], [14, 10], [18, 10], [19, 9], [20, 9], [21, 9]]) g.setze(x, y + oy, F.bart[1]);
  ellipse(g, 16, 14 + oy, 1.9, 1.7, F.haut, { licht: -0.3 });
  g.setze(15, 13 + oy, F.haut[2]);
  if (mund || pose === 'jubeln') { g.setze(15, 18 + oy, '#5a1a1a'); g.setze(16, 18 + oy, '#5a1a1a'); g.setze(17, 18 + oy, '#5a1a1a'); g.setze(16, 19 + oy, '#8a2a2a'); }
  g.aufmalen(bild);

  // Hörnerhelm mit Nieten
  teil(bild, (e) => {
    ellipse(e, 16, 8 + oy, 8.3, 6.8, F.helm, { nurOben: 7 + oy });
    rechteck(e, 7, 6 + oy, 18, 3, F.rand);
    for (let x = 9; x <= 23; x += 3) e.setze(x, 7 + oy, F.rand[2]);
    e.setze(12, 3 + oy, F.helm[2]); e.setze(13, 2 + oy, F.helm[2]);
  });
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

  teil(bild, (e) => {
    ellipse(e, 11.5, 44.5 - lFuss, 3.6, 2.2, F.stiefel);
    ellipse(e, 20.5, 44.5 - rFuss, 3.6, 2.2, F.stiefel);
  });
  teil(bild, (e) => {
    rechteck(e, 9, 36 + oy, 5, 8 - lFuss - oy, F.hose);
    rechteck(e, 18, 36 + oy, 5, 8 - rFuss - oy, F.hose);
  });
  teil(bild, (e) => {
    ellipse(e, 16, 29 + oy, 9.5, 9, F.tunika);
    rechteck(e, 7, 33 + oy, 18, 3, F.gurt);
  });
  const hoch = pose === 'tragen' || pose === 'jubeln';
  teil(bild, (e) => {
    if (hoch) {
      rechteck(e, 3, 10 + oy, 4, 13, F.tunika, { rund: 1 }); rechteck(e, 25, 10 + oy, 4, 13, F.tunika, { rund: 1 });
    } else if (pose === 'strecken') {
      rechteck(e, 3, 21 + oy, 4, 10, F.tunika, { rund: 1 }); rechteck(e, 25, 4 + oy, 4, 18, F.tunika, { rund: 1 });
    } else {
      rechteck(e, 3, 21 + oy - armSchwung, 4, 10, F.tunika, { rund: 1 });
      rechteck(e, 25, 21 + oy + armSchwung, 4, 10, F.tunika, { rund: 1 });
    }
  });
  teil(bild, (e) => {
    if (hoch) { ellipse(e, 5, 8 + oy, 2.3, 2.3, F.haut); ellipse(e, 27, 8 + oy, 2.3, 2.3, F.haut); }
    else if (pose === 'strecken') { ellipse(e, 5, 32 + oy, 2.3, 2.3, F.haut); ellipse(e, 27, 2 + oy, 2.3, 2.3, F.haut); }
    else { ellipse(e, 5, 32 + oy - armSchwung, 2.3, 2.3, F.haut); ellipse(e, 27, 32 + oy + armSchwung, 2.3, 2.3, F.haut); }
  });
  // Kopf von hinten: Haare, Bart schaut seitlich hervor
  teil(bild, (e) => {
    ellipse(e, 16, 13 + oy, 7.4, 7, F.bart);
    ellipse(e, 8.4, 12.5 + oy, 1.4, 2, F.haut); ellipse(e, 23.6, 12.5 + oy, 1.4, 2, F.haut);
    for (const [x, y] of [[12, 15], [15, 17], [18, 15], [20, 18], [13, 18]]) e.setze(x, y + oy, F.bart[0]);
  });
  teil(bild, (e) => {
    rechteck(e, 5, 17 + oy, 3, 6, F.bart); rechteck(e, 24, 17 + oy, 3, 6, F.bart);
  });
  // Rucksack mit Deckenrolle und Laterne
  teil(bild, (e) => {
    rechteck(e, 9, 20 + oy, 14, 14, F.rucksack, { rund: 2 });
    rechteck(e, 9, 20 + oy, 14, 5, F.rucksack, { licht: 0.4, rund: 2 });
    rechteck(e, 15, 24 + oy, 2, 2, F.rand);
  });
  teil(bild, (e) => {
    rechteck(e, 7, 17 + oy, 18, 4, F.rolle, { rund: 1 });
    e.setze(12, 18 + oy, '#b0413e'); e.setze(12, 19 + oy, '#b0413e'); e.setze(19, 18 + oy, '#b0413e'); e.setze(19, 19 + oy, '#b0413e');
  });
  teil(bild, (e) => {
    rechteck(e, 21, 27 + oy, 4, 5, F.rand);
    e.setze(22, 29 + oy, '#ffe066'); e.setze(23, 29 + oy, '#ffe066'); e.setze(22, 30 + oy, '#ff9d2e'); e.setze(23, 30 + oy, '#ff9d2e');
  });
  // Helm
  teil(bild, (e) => {
    ellipse(e, 16, 8 + oy, 8.3, 6.8, F.helm, { nurOben: 7 + oy });
    rechteck(e, 7, 6 + oy, 18, 3, F.rand);
    for (let x = 9; x <= 23; x += 3) e.setze(x, 7 + oy, F.rand[2]);
  });
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
    rechteck(e, 13 + hinten, 36 + oy, 5, 8 - oy - hintenHoch, F.hose, { licht: -0.5 });
    ellipse(e, 16.5 + hinten, 44.5 - hintenHoch, 3.8, 2.1, F.stiefel, { licht: -0.5 });
  });
  teil(bild, (e) => {
    if (hoch) rechteck(e, 13, 8 + oy, 4, 14, F.tunika, { licht: -0.5, rund: 1 });
    else rechteck(e, 14 - Math.round(s * 2), 21 + oy, 4, 10, F.tunika, { licht: -0.5, rund: 1 });
  });
  // Rucksack
  teil(bild, (e) => {
    rechteck(e, 4, 19 + oy, 7, 15, F.rucksack, { rund: 2 });
    rechteck(e, 3, 16 + oy, 8, 5, F.rolle, { rund: 2 });
    e.setze(6, 17 + oy, '#b0413e'); e.setze(6, 18 + oy, '#b0413e');
    rechteck(e, 5, 29 + oy, 3, 4, F.rand);
    e.setze(6, 31 + oy, '#ffe066');
  });
  // vorderes Bein
  teil(bild, (e) => {
    rechteck(e, 13 + vorn, 36 + oy, 5, 8 - oy - vornHoch, F.hose);
    ellipse(e, 16.5 + vorn, 44.5 - vornHoch, 3.8, 2.1, F.stiefel);
  });
  // Rumpf
  teil(bild, (e) => {
    ellipse(e, 15.5, 29 + oy, 7.5, 9, F.tunika);
    rechteck(e, 8, 33 + oy, 15, 3, F.gurt);
    rechteck(e, 20, 33 + oy, 3, 3, F.rand);
  });
  // erhobener vorderer Arm liegt hinter dem Kopf (nur die Hand schaut oben heraus)
  if (hoch || pose === 'strecken') {
    teil(bild, (e) => rechteck(e, 15, (hoch ? 6 : 1) + oy, 4, hoch ? 17 : 22, F.tunika, { rund: 1 }));
  }
  // Kopf
  teil(bild, (e) => {
    ellipse(e, 17, 13 + oy, 6.8, 7, F.haut);
    ellipse(e, 23.3, 14 + oy, 2.1, 1.8, F.haut); // Nase
  });
  // Haare hinten + Ohr
  teil(bild, (e) => {
    ellipse(e, 12.5, 13 + oy, 3.2, 5.5, F.bart);
    ellipse(e, 15.5, 12.5 + oy, 1.3, 1.9, F.haut);
  });
  // Bart
  teil(bild, (e) => {
    const b = bartSchwung;
    vieleck(e, [[13.5, 11], [16.5, 14], [21, 15.5], [25, 16.5], [25, 24], [22 + b, 30], [17 + b, 31], [14, 26]].map(([x, y]) => [x, y + oy]), F.bart);
    rechteck(e, 19 + b, 29 + oy, 3, 7, F.bart);
    rechteck(e, 19 + b, 31 + oy, 3, 1, F.rand);
    rechteck(e, 19 + b, 34 + oy, 3, 1, F.rand);
    for (const [x, y] of [[18, 22], [21, 24], [17, 26], [22, 27]]) e.setze(x, y + oy, F.bart[0]);
  });
  const g = new Ebene(bild.b, bild.h);
  ellipse(g, 22.5, 16.4 + oy, 2.6, 1.4, F.bart, { licht: 0.5 });
  if (augen === 'offen') { g.setze(20, 11 + oy, '#ffffff'); g.setze(21, 11 + oy, UMRISS); g.setze(21, 12 + oy, UMRISS); g.setze(20, 12 + oy, UMRISS); }
  else { g.setze(20, 12 + oy, UMRISS); g.setze(21, 12 + oy, UMRISS); }
  for (const [x, y] of [[19, 9], [20, 9], [21, 9], [22, 10]]) g.setze(x, y + oy, F.bart[1]);
  if (mund || pose === 'jubeln') { g.setze(22, 18 + oy, '#5a1a1a'); g.setze(23, 18 + oy, '#5a1a1a'); }
  g.aufmalen(bild);
  // vorderer Arm (hängend) – der erhobene wurde schon hinter dem Kopf gemalt
  if (!hoch && pose !== 'strecken') {
    teil(bild, (e) => rechteck(e, 16 + Math.round(s * 2), 21 + oy, 4, 10, F.tunika, { rund: 1 }));
    teil(bild, (e) => ellipse(e, 18 + Math.round(s * 2.5), 32 + oy, 2.3, 2.3, F.haut));
  }
  // Helm
  teil(bild, (e) => {
    ellipse(e, 16.5, 8 + oy, 8, 6.8, F.helm, { nurOben: 7 + oy });
    rechteck(e, 8, 6 + oy, 17, 3, F.rand);
    for (let x = 10; x <= 23; x += 3) e.setze(x, 7 + oy, F.rand[2]);
    e.setze(13, 3 + oy, F.helm[2]); e.setze(14, 2 + oy, F.helm[2]);
  });
  teil(bild, (e) => {
    horn(e, [[14.5, 4, 2.1], [13, 2.2, 1.7], [12.2, 0.8, 1.1]].map(([x, y, r]) => [x, y + oy, r]), F.horn);
  });
  if (hoch) teil(bild, (e) => ellipse(e, 17, 4 + oy, 2.3, 2.3, F.haut));
  if (pose === 'strecken') teil(bild, (e) => ellipse(e, 17, 1 + oy, 2.3, 2.3, F.haut));
}

const HELD_ANSICHT = { unten: heldVorne, oben: heldHinten, seite: heldSeite };

// Alle Bilder des Grossen Zwergs erzeugen: { name: Ebene }
export const LAUF_PHASEN = 6;
export function baueHeld() {
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
      ellipse(e, cx - 3.5, fussY - 1, 3, 1.8, RAMPEN.stiefel); ellipse(e, cx + 3.5, fussY - 1, 3, 1.8, RAMPEN.stiefel);
    });
    teil(bild, (e) => vieleck(e, [[cx - 7, koerperY], [cx + 7, koerperY], [cx + 9, fussY - 1], [cx - 9, fussY - 1]], kleid));
  } else {
    teil(bild, (e) => {
      ellipse(e, cx - 3.5, fussY - 1, 3.2, 1.9, RAMPEN.stiefel); ellipse(e, cx + 3.5, fussY - 1, 3.2, 1.9, RAMPEN.stiefel);
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
    if (jubeln) { ellipse(e, cx - koerperR[0] - 1, armY - armL, 2, 2, haut); ellipse(e, cx + koerperR[0] + 1, armY - armL, 2, 2, haut); }
    else { ellipse(e, cx - koerperR[0], armY + armL, 2, 2, haut); ellipse(e, cx + koerperR[0], armY + armL, 2, 2, haut); }
  });
  // Rumpf
  teil(bild, (e) => {
    ellipse(e, cx, koerperY + oy, koerperR[0], koerperR[1], kleid);
    if (!frau || kind) {
      rechteck(e, cx - koerperR[0] + 1, koerperY + koerperR[1] - 4 + oy, koerperR[0] * 2 - 1, 2, RAMPEN.leder);
      e.setze(cx, koerperY + koerperR[1] - 4 + oy, RAMPEN.gold[1]); e.setze(cx - 1, koerperY + koerperR[1] - 4 + oy, RAMPEN.gold[1]);
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
        rechteck(e, cx - 5, by + 5, 3, 9, haar); rechteck(e, cx + 2, by + 5, 3, 9, haar);
        rechteck(e, cx - 5, by + 11, 3, 1, RAMPEN.gold); rechteck(e, cx + 2, by + 11, 3, 1, RAMPEN.gold);
      } else if (bart === 'kurz') {
        vieleck(e, [[cx - 6.5, by], [cx + 6.5, by], [cx + 6, by + 5], [cx, by + 7], [cx - 6, by + 5]], haar);
      }
      for (const [x, y] of [[-3, 4], [2, 5], [-1, 8], [3, 9]]) if (bart !== 'kurz' || y < 6) e.setze(cx + x, by + y, haar[0]);
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
      rechteck(e, cx - kopfR[0] - 1, ky - 3, kopfR[0] * 2 + 3, 2, RAMPEN.gold);
      if (kopf === 'nasenhelm') rechteck(e, cx - 0.5, ky - 2, 2, 4, kopfF);
    } else if (kopf === 'kapuze') {
      ellipse(e, cx, ky - 0.5, kopfR[0] + 1.5, kopfR[1] + 1, kopfF, { nurOben: ky - 2 });
      rechteck(e, cx - kopfR[0] - 1.5, ky - 3, 2, 6, kopfF); rechteck(e, cx + kopfR[0], ky - 3, 2, 6, kopfF);
    } else if (kopf === 'stirnband' || kopf === 'krone') {
      ellipse(e, cx, ky - 1, kopfR[0] + 0.8, kopfR[1] + 0.3, haar, { nurOben: ky - 2 });
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
export { Ebene, ellipse, rechteck, vieleck, teil, horn, schattiere, UMRISS };
