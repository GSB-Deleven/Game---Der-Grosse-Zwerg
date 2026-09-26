import { PALETTE, SPRITES } from './eigene-sprites.js';

export const KACHEL = 16;

// Zeichnet ein Text-Raster (Liste von Zeilen) auf eine Canvas-Textur.
export function malePixel(scene, key, zeilen, extraFarben = {}) {
  const hoehe = zeilen.length;
  const breite = Math.max(...zeilen.map((z) => z.length));
  const tex = scene.textures.createCanvas(key, breite, hoehe);
  const ctx = tex.getContext();
  zeilen.forEach((zeile, y) => {
    if (zeile.length !== breite) console.warn(`Sprite ${key}: Zeile ${y} hat ${zeile.length} statt ${breite} Zeichen`);
    for (let x = 0; x < zeile.length; x++) {
      const zeichen = zeile[x];
      if (zeichen === '.' || zeichen === ' ') continue;
      const farbe = extraFarben[zeichen] || PALETTE[zeichen];
      if (!farbe) continue;
      ctx.fillStyle = farbe;
      ctx.fillRect(x, y, 1, 1);
    }
  });
  tex.refresh();
  return tex;
}

// Einfacher, immer gleicher Zufall (damit das Gras jedes Mal gleich aussieht)
function zufall(saat) {
  let s = saat >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Boden-Kacheln – werden im Code gemalt. Reihenfolge = Kachel-Nummer.
// ---------------------------------------------------------------------------
const KACHEL_MALER = {
  gras(ctx, r) {
    ctx.fillStyle = '#5da048'; ctx.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = r() < 0.5 ? '#6fb556' : '#4b8a3c';
      ctx.fillRect(Math.floor(r() * 16), Math.floor(r() * 16), 1, 2);
    }
  },
  blumen(ctx, r) {
    KACHEL_MALER.gras(ctx, r);
    const farben = ['#f2c94c', '#ffffff', '#e05a8a', '#7aa6e0'];
    for (let i = 0; i < 3; i++) {
      const x = 2 + Math.floor(r() * 12), y = 2 + Math.floor(r() * 12);
      ctx.fillStyle = farben[Math.floor(r() * farben.length)];
      ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x, y - 1, 1, 3);
      ctx.fillStyle = '#f2c94c'; ctx.fillRect(x, y, 1, 1);
    }
  },
  weg(ctx, r) {
    ctx.fillStyle = '#9a8a74'; ctx.fillRect(0, 0, 16, 16);
    const steine = [[0, 0, 7, 5], [8, 0, 8, 6], [0, 6, 5, 5], [6, 7, 6, 4], [13, 7, 3, 5], [0, 12, 8, 4], [9, 12, 7, 4]];
    for (const [x, y, w, h] of steine) {
      ctx.fillStyle = r() < 0.5 ? '#b8a88e' : '#c4b59a';
      ctx.fillRect(x + 1, y + 1, w - 1, h - 1);
      ctx.fillStyle = '#d8cbb0'; ctx.fillRect(x + 1, y + 1, w - 2, 1);
    }
  },
  fels(ctx, r) {
    ctx.fillStyle = '#6e6470'; ctx.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 6; i++) {
      const x = Math.floor(r() * 14), y = Math.floor(r() * 14);
      ctx.fillStyle = '#8a8090'; ctx.fillRect(x, y, 3, 2);
      ctx.fillStyle = '#4e4652'; ctx.fillRect(x, y + 2, 3, 1);
    }
  },
  felswand(ctx) { // behauene Steinblöcke einer Zwergenhalle
    ctx.fillStyle = '#4a4250'; ctx.fillRect(0, 0, 16, 16);
    const bloecke = [[0, 0, 8, 5], [8, 0, 8, 5], [-4, 5, 8, 5], [4, 5, 8, 5], [12, 5, 8, 5], [0, 10, 8, 6], [8, 10, 8, 6]];
    for (const [x, y, w, h] of bloecke) {
      ctx.fillStyle = '#8a8296'; ctx.fillRect(x + 1, y + 1, w - 1, h - 1);
      ctx.fillStyle = '#a49cb0'; ctx.fillRect(x + 1, y + 1, w - 1, 1);
    }
  },
  rune(ctx) { // Steinwand mit goldener Rune
    KACHEL_MALER.felswand(ctx);
    ctx.fillStyle = '#f2c94c';
    ctx.fillRect(7, 3, 2, 10); ctx.fillRect(4, 5, 3, 1); ctx.fillRect(9, 5, 3, 1); ctx.fillRect(4, 10, 8, 1);
  },
  wasser(ctx, r) {
    ctx.fillStyle = '#3d6aa8'; ctx.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = '#7aa6e0';
      ctx.fillRect(Math.floor(r() * 12), Math.floor(r() * 15), 4, 1);
    }
  },
  steinboden(ctx, r) {
    ctx.fillStyle = '#5c5460'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = r() < 0.5 ? '#8c8290' : '#847a88';
    ctx.fillRect(1, 1, 7, 7); ctx.fillRect(9, 9, 6, 6);
    ctx.fillStyle = '#7a7080'; ctx.fillRect(9, 1, 6, 7); ctx.fillRect(1, 9, 7, 6);
  },
  teppich(ctx) {
    ctx.fillStyle = '#8e2f17'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#b0413e'; ctx.fillRect(2, 0, 12, 16);
    ctx.fillStyle = '#f2c94c'; ctx.fillRect(2, 0, 1, 16); ctx.fillRect(13, 0, 1, 16);
  },
  holzboden(ctx, r) {
    ctx.fillStyle = '#6b4a2e'; ctx.fillRect(0, 0, 16, 16);
    for (let y = 0; y < 16; y += 4) {
      ctx.fillStyle = '#4a3220'; ctx.fillRect(0, y, 16, 1);
      ctx.fillRect(Math.floor(r() * 16), y, 1, 4);
    }
  },
  erde(ctx) { // Acker
    ctx.fillStyle = '#7a4f2c'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#5b3a22';
    for (let y = 1; y < 16; y += 4) ctx.fillRect(0, y, 16, 2);
    ctx.fillStyle = '#4f9a4a';
    for (let x = 2; x < 16; x += 5) { ctx.fillRect(x, 4, 2, 2); ctx.fillRect(x + 1, 12, 2, 2); }
  },
  bruecke(ctx) {
    ctx.fillStyle = '#3d6aa8'; ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#8a5a33'; ctx.fillRect(0, 1, 16, 14);
    ctx.fillStyle = '#5b3a22';
    for (let x = 0; x < 16; x += 4) ctx.fillRect(x, 1, 1, 14);
  },
};

export const KACHEL_NAMEN = Object.keys(KACHEL_MALER);
export const kachelNummer = (name) => KACHEL_NAMEN.indexOf(name);

// Jede Kachel bekommt 4 Varianten (für abwechslungsreiches Gras usw.)
export const VARIANTEN = 4;

function erzeugeKachelset(scene) {
  const tex = scene.textures.createCanvas('kacheln', KACHEL * VARIANTEN, KACHEL * KACHEL_NAMEN.length);
  const ctx = tex.getContext();
  KACHEL_NAMEN.forEach((name, zeile) => {
    for (let v = 0; v < VARIANTEN; v++) {
      ctx.save();
      ctx.translate(v * KACHEL, zeile * KACHEL);
      ctx.beginPath(); ctx.rect(0, 0, KACHEL, KACHEL); ctx.clip();
      KACHEL_MALER[name](ctx, zufall(zeile * 97 + v * 13 + 7));
      ctx.restore();
    }
  });
  tex.refresh();
}

// Sanfter Schatten unter Figuren
function erzeugeSchatten(scene) {
  const tex = scene.textures.createCanvas('schatten', 14, 5);
  const ctx = tex.getContext();
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.fillRect(2, 0, 10, 5); ctx.fillRect(0, 1, 14, 3);
  tex.refresh();
}

// Sprechblase (für Wünsche über den Köpfen)
function erzeugeBlase(scene) {
  malePixel(scene, 'blase', [
    '..kkkkkkkkkkkkkkkk..',
    '.kxxxxxxxxxxxxxxxxk.',
    'kxxxxxxxxxxxxxxxxxxk',
    'kxxxxxxxxxxxxxxxxxxk',
    'kxxxxxxxxxxxxxxxxxxk',
    'kxxxxxxxxxxxxxxxxxxk',
    'kxxxxxxxxxxxxxxxxxxk',
    'kxxxxxxxxxxxxxxxxxxk',
    'kxxxxxxxxxxxxxxxxxxk',
    'kxxxxxxxxxxxxxxxxxxk',
    'kxxxxxxxxxxxxxxxxxxk',
    'kxxxxxxxxxxxxxxxxxxk',
    'kxxxxxxxxxxxxxxxxxxk',
    'kxxxxxxxxxxxxxxxxxxk',
    'kxxxxxxxxxxxxxxxxxxk',
    'kxxxxxxxxxxxxxxxxxxk',
    'kxxxxxxxxxxxxxxxxxxk',
    '.kxxxxxxxxxxxxxxxxk.',
    '..kkkkkkxxxkkkkkkk..',
    '.......kxxk.........',
    '.......kxk..........',
    '.......kk...........',
  ]);
  malePixel(scene, 'pfeil', [
    '....kkkk....',
    '....kyyk....',
    '....kyyk....',
    '....kyyk....',
    'kkkkkyykkkkk',
    '.kyyyyyyyyk.',
    '..kyyyyyyk..',
    '...kyyyyk...',
    '....kyyk....',
    '.....kk.....',
  ]);
}

export function erzeugeAlleTexturen(scene, figuren = []) {
  for (const [key, zeilen] of Object.entries(SPRITES)) malePixel(scene, key, zeilen);
  erzeugeKachelset(scene);
  erzeugeSchatten(scene);
  erzeugeBlase(scene);
}
