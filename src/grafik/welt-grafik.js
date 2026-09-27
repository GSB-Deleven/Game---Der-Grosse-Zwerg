// WELT-GRAFIK: Boden mit weichen Übergängen, Gebäude, Deko und kleine Tiere.
// Alles wird im Code gemalt (keine Bilddateien nötig), im selben SNES-Stil wie die Figuren.
import { Ebene, ellipse, rechteck, vieleck, teil, RAMPEN, UMRISS, baueFigur, alsTextur } from './figuren-baukasten.js';

const K = 16; // Kachelgrösse

// ---------------------------------------------------------------------------
// Hilfen
// ---------------------------------------------------------------------------
const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
function zufall(x, y, s = 0) {
  let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  h ^= h >>> 16;
  return ((h >>> 0) % 10000) / 10000;
}
// weiches Rauschen (Wert-Rauschen)
function rauschen(x, y, s = 0) {
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = zufall(x0, y0, s), b = zufall(x0 + 1, y0, s), c = zufall(x0, y0 + 1, s), d = zufall(x0 + 1, y0 + 1, s);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

const R = {
  stein: ['#5c5864', '#8a8494', '#b4aec0'],
  schiefer: ['#2c3446', '#465470', '#6c80a2'],
  mauer: ['#6e6468', '#9c9094', '#c4b8b8'],
  glas: ['#c8862b', '#f2c94c', '#fff4b0'],
  blatt: ['#24532a', '#3f8a44', '#74c26c'],
  blattHell: ['#2f6b34', '#56a24e', '#8fd46c'],
  tanne: ['#173d2a', '#2a6040', '#4a8a58'],
  heu: ['#a8862b', '#e0c050', '#fff0a0'],
  wasser: ['#2a5a96', '#3d74b8', '#79aee6'],
  stoffRot: ['#8a2626', '#c8403a', '#f07060'],
  kaese: ['#c8962b', '#f2c94c', '#fff0a0'],
  brot: ['#7a4a1c', '#b87a3a', '#e8b070'],
};

// ---------------------------------------------------------------------------
// BODEN: malt die ganze Karte in ein einziges Bild
// boden[y][x] = 'gras' | 'blumen' | 'weg' | 'erde' | 'wasser' | 'fels' | 'felswand' | 'rune' |
//               'steinboden' | 'teppich' | 'holzboden' | 'bruecke'
// ---------------------------------------------------------------------------
const FARBEN = {
  gras: ['#4a8a3c', '#5da048', '#6cb154', '#7cc262'].map(rgb),
  weg: ['#6e6254', '#a8987e', '#bcab8e', '#d2c2a2'].map(rgb),
  erde: ['#4f311b', '#6b4428', '#7f5433'].map(rgb),
  wasser: ['#2a5a96', '#3d74b8', '#4f88c8', '#8fc4f0', '#d8f0ff'].map(rgb),
  fels: ['#4a4450', '#5e5866', '#77707e', '#948c9a', '#aaa2b0'].map(rgb),
  mauer: ['#3e3640', '#6e6470', '#8a8090', '#a89eae', '#c2b8c6'].map(rgb),
  stein: ['#4a4450', '#6e6676', '#7e7686', '#8c8494'].map(rgb),
  teppich: ['#6a1e1e', '#9a2c2c', '#b83a38', '#e0b23c'].map(rgb),
  holz: ['#3b2616', '#5e3e24', '#6b4a2e', '#7e5a38'].map(rgb),
  blumen: ['#f2c94c', '#ffffff', '#e05a8a', '#8fb8f0', '#c07ce0'].map(rgb),
};

const IST_WEG = new Set(['weg', 'erde', 'steinboden']);
const IST_GRAS = new Set(['gras', 'blumen']);
const IST_FELS = new Set(['fels', 'felswand', 'rune', 'hoehlenwand']);

// Kopfsteinpflaster: nächste Zelle in einem verschobenen Raster
function pflaster(px, py, groesse = 5) {
  const gx = Math.floor(px / groesse), gy = Math.floor(py / (groesse - 1));
  let d1 = 99, d2 = 99, id = 0;
  for (let j = -1; j <= 1; j++) {
    for (let i = -1; i <= 1; i++) {
      const cx = gx + i, cy = gy + j;
      const ox = (cx + zufall(cx, cy, 3) * 0.8 + (cy % 2) * 0.5) * groesse;
      const oy = (cy + zufall(cx, cy, 4) * 0.7) * (groesse - 1);
      const d = Math.hypot(px - ox, (py - oy) * 1.15);
      if (d < d1) { d2 = d1; d1 = d; id = zufall(cx, cy, 5); } else if (d < d2) d2 = d;
    }
  }
  return { rand: d2 - d1 < 0.9, id, mitte: d1 };
}

export function maleBoden(scene, key, boden) {
  const H = boden.length, B = boden[0].length;
  const W = B * K, HH = H * K;
  const bild = new ImageData(W, HH);
  const d = bild.data;
  const typ = (tx, ty) => (ty < 0 || ty >= H || tx < 0 || tx >= B ? null : boden[ty][tx]);
  const setze = (x, y, c) => { const i = (y * W + x) * 4; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; };
  const dunkler = (x, y, f) => { const i = (y * W + x) * 4; d[i] *= f; d[i + 1] *= f; d[i + 2] *= f; };

  // Abstand eines Pixels zur nächsten Nachbarkachel einer bestimmten Art (für Übergänge)
  const abstandZu = (tx, ty, px, py, passt) => {
    let m = 99;
    if (passt(typ(tx - 1, ty))) m = Math.min(m, px + 0.5);
    if (passt(typ(tx + 1, ty))) m = Math.min(m, K - px - 0.5);
    if (passt(typ(tx, ty - 1))) m = Math.min(m, py + 0.5);
    if (passt(typ(tx, ty + 1))) m = Math.min(m, K - py - 0.5);
    if (passt(typ(tx - 1, ty - 1))) m = Math.min(m, Math.hypot(px + 0.5, py + 0.5));
    if (passt(typ(tx + 1, ty - 1))) m = Math.min(m, Math.hypot(K - px - 0.5, py + 0.5));
    if (passt(typ(tx - 1, ty + 1))) m = Math.min(m, Math.hypot(px + 0.5, K - py - 0.5));
    if (passt(typ(tx + 1, ty + 1))) m = Math.min(m, Math.hypot(K - px - 0.5, K - py - 0.5));
    return m;
  };

  for (let ty = 0; ty < H; ty++) {
    for (let tx = 0; tx < B; tx++) {
      const t = boden[ty][tx];
      for (let py = 0; py < K; py++) {
        for (let px = 0; px < K; px++) {
          const x = tx * K + px, y = ty * K + py;
          let c;
          if (IST_GRAS.has(t)) {
            c = maleGras(x, y);
          } else if (t === 'weg') {
            const graskante = abstandZu(tx, ty, px, py, (n) => IST_GRAS.has(n));
            if (graskante < 1.5 + rauschen(x / 2, y / 2, 9) * 2.5) c = maleGras(x, y);
            else {
              const p = pflaster(x, y);
              c = p.rand ? FARBEN.weg[0] : FARBEN.weg[p.id < 0.3 ? 1 : p.id < 0.75 ? 2 : 3];
              if (!p.rand && p.mitte < 1.2 && p.id > 0.5) c = FARBEN.weg[3];
            }
          } else if (t === 'erde') {
            const graskante = abstandZu(tx, ty, px, py, (n) => IST_GRAS.has(n) || n === 'weg');
            if (graskante < 1 + rauschen(x / 2, y / 2, 7) * 2) c = maleGras(x, y);
            else {
              const furche = y % 5;
              c = furche === 0 ? FARBEN.erde[0] : furche === 1 ? FARBEN.erde[2] : FARBEN.erde[1];
              if (furche === 3 && (x + Math.floor(y / 5) * 3) % 6 < 2) c = rgb('#5da048');
              if (furche === 2 && (x + Math.floor(y / 5) * 3) % 6 === 0) c = rgb('#7cc262');
            }
          } else if (t === 'wasser') {
            const ufer = abstandZu(tx, ty, px, py, (n) => n && n !== 'wasser' && n !== 'bruecke');
            const welle = Math.sin(x * 0.45 + Math.sin(y * 0.3) * 2 + y * 0.9);
            c = FARBEN.wasser[1];
            if (rauschen(x / 7, y / 5, 2) > 0.62) c = FARBEN.wasser[2];
            if (welle > 0.93 && zufall(x, y, 1) > 0.4) c = FARBEN.wasser[3];
            if (ufer < 4) c = FARBEN.wasser[0];
            if (ufer < 2.2 + rauschen(x / 2, y / 2, 4)) c = FARBEN.wasser[4];
            if (ufer < 1) c = rgb('#b8a070');
          } else if (t === 'fels') {
            c = maleFels(x, y, tx, ty, px, py, typ);
          } else if (t === 'felswand' || t === 'rune') {
            c = maleMauer(x, y, px, py, tx, ty, typ, t === 'rune');
          } else if (t === 'steinboden') {
            const fx = x % 16, fy = y % 16;
            const plattenId = zufall(Math.floor(x / 8), Math.floor(y / 8), 2);
            c = (fx % 8 === 0 || fy % 8 === 0) ? FARBEN.stein[0] : FARBEN.stein[plattenId < 0.33 ? 1 : plattenId < 0.66 ? 2 : 3];
            if ((fx % 8 === 1 || fy % 8 === 1) && c !== FARBEN.stein[0]) c = FARBEN.stein[3];
          } else if (t === 'teppich') {
            c = FARBEN.teppich[1];
            if (px === 1 || px === 14) c = FARBEN.teppich[3];
            else if (px === 0 || px === 15) c = FARBEN.teppich[0];
            else if ((px + y) % 8 === 0 && px > 3 && px < 12) c = FARBEN.teppich[2];
          } else if (t === 'holzboden' || t === 'bruecke') {
            const brett = Math.floor(y / 4);
            c = y % 4 === 0 ? FARBEN.holz[0] : FARBEN.holz[brett % 2 ? 2 : 3];
            if ((x + brett * 7) % 19 === 0) c = FARBEN.holz[0];
            if (t === 'bruecke' && (py < 2 || py > 13)) c = py === 0 || py === 15 ? FARBEN.holz[0] : FARBEN.holz[1];
          } else if (t === 'schnee') {
            const n = rauschen(x / 6, y / 6, 21);
            c = n < 0.3 ? rgb('#c8d4e6') : n < 0.7 ? rgb('#e4ecf6') : rgb('#f8fbff');
            if (zufall(x, y, 22) > 0.97) c = rgb('#ffffff');
          } else if (t === 'hoehle') {
            const p = pflaster(x, y, 7);
            c = p.rand ? rgb('#241a26') : (p.id < 0.4 ? rgb('#3a2e3c') : p.id < 0.8 ? rgb('#443646') : rgb('#4e4050'));
          } else if (t === 'hoehlenwand') {
            const n = rauschen(x / 4, y / 4, 23);
            c = n < 0.35 ? rgb('#1a121c') : n < 0.7 ? rgb('#2a1e2c') : rgb('#3a2c3c');
            if (zufall(x, y, 24) > 0.985) c = rgb('#8a5aa8');
          } else if (t === 'schlucht') {
            const kante = abstandZu(tx, ty, px, py, (n) => n && n !== 'schlucht' && n !== 'bruecke');
            // Felswände fallen in die Tiefe ab: aussen hell, innen immer dunkler, mit senkrechten Rissen
            const riss = (x + Math.floor(rauschen(x / 3, y / 9, 27) * 5)) % 5 === 0;
            if (kante < 1.5) c = FARBEN.fels[4];
            else if (kante < 4) c = riss ? FARBEN.fels[1] : FARBEN.fels[3];
            else if (kante < 8) c = riss ? FARBEN.fels[0] : FARBEN.fels[2];
            else if (kante < 13) c = riss ? rgb('#2a2430') : FARBEN.fels[1];
            else if (kante < 20) c = riss ? rgb('#1a1620') : rgb('#342c3a');
            else c = rauschen(x / 6, y / 6, 28) > 0.6 ? rgb('#241e2a') : rgb('#16121a');
          } else if (t === 'leiter') {
            c = maleFels(x, y, tx, ty, px, py, () => 'fels');
            if (px === 3 || px === 12) c = rgb('#8a6a3a');
            if ((py % 5 === 2) && px > 3 && px < 12) c = rgb('#b8905a');
            if ((py % 5 === 3) && px > 3 && px < 12) c = rgb('#5e4428');
          } else if (t === 'sand') {
            const n = rauschen(x / 4, y / 4, 26);
            c = n < 0.4 ? rgb('#c8a870') : n < 0.8 ? rgb('#dcc08a') : rgb('#ecd4a4');
          } else {
            c = maleGras(x, y);
          }
          setze(x, y, c);
          // Blumen auf Blumenwiesen
          if (t === 'blumen' && zufall(x, y, 11) > 0.965 && px > 1 && px < 14 && py > 1 && py < 14) {
            const f = FARBEN.blumen[Math.floor(zufall(x, y, 12) * FARBEN.blumen.length)];
            setze(x, y, f);
          }
        }
      }
      // Blumen-Büschel (zweiter Durchgang, damit sie über den Pixeln liegen)
      if (t === 'blumen') {
        for (let n = 0; n < 3; n++) {
          const bx = tx * K + 3 + Math.floor(zufall(tx, ty, 20 + n) * 10), by = ty * K + 3 + Math.floor(zufall(tx, ty, 30 + n) * 10);
          const f = FARBEN.blumen[Math.floor(zufall(tx, ty, 40 + n) * FARBEN.blumen.length)];
          for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) setze(bx + dx, by + dy, f);
          setze(bx, by, rgb('#f2c94c'));
          setze(bx, by + 2, rgb('#3f7a34'));
        }
      }
      // Grasbüschel auf normalem Gras
      if (t === 'gras' && zufall(tx, ty, 50) > 0.55) {
        const bx = tx * K + 2 + Math.floor(zufall(tx, ty, 51) * 11), by = ty * K + 4 + Math.floor(zufall(tx, ty, 52) * 9);
        for (const [dx, dy, c] of [[0, 0, '#3f7a34'], [0, -1, '#3f7a34'], [-2, 0, '#3f7a34'], [-2, -1, '#7cc262'], [2, 0, '#3f7a34'], [2, -2, '#7cc262'], [1, -1, '#4f9140'], [-1, -1, '#4f9140']]) setze(bx + dx, by + dy, rgb(c));
      }
      // Kieselsteine auf Wegen
      if (t === 'weg' && zufall(tx, ty, 60) > 0.8) {
        const bx = tx * K + 4 + Math.floor(zufall(tx, ty, 61) * 8), by = ty * K + 4 + Math.floor(zufall(tx, ty, 62) * 8);
        setze(bx, by, FARBEN.weg[3]); setze(bx + 1, by, FARBEN.weg[1]); setze(bx, by + 1, FARBEN.weg[0]);
      }
    }
  }

  // Schatten unter Felskanten und Mauern (fällt auf die Kachel darunter)
  for (let ty = 1; ty < H; ty++) {
    for (let tx = 0; tx < B; tx++) {
      const oben = boden[ty - 1][tx];
      if (!IST_FELS.has(oben) || IST_FELS.has(boden[ty][tx])) continue;
      for (let py = 0; py < 5; py++) {
        for (let px = 0; px < K; px++) dunkler(tx * K + px, ty * K + py, 0.62 + py * 0.075);
      }
    }
  }

  const tex = scene.textures.exists(key) ? scene.textures.get(key) : scene.textures.createCanvas(key, W, HH);
  tex.getContext().putImageData(bild, 0, 0);
  tex.refresh();
  return key;
}

function maleGras(x, y) {
  const n = rauschen(x / 9, y / 9, 1) * 0.7 + rauschen(x / 3, y / 3, 2) * 0.3;
  let i = n < 0.35 ? 0 : n < 0.62 ? 1 : n < 0.82 ? 2 : 3;
  const r = zufall(x, y, 3);
  if (r > 0.93) i = Math.min(3, i + 1);
  else if (r < 0.07) i = Math.max(0, i - 1);
  return FARBEN.gras[i];
}

function maleFels(x, y, tx, ty, px, py, typ) {
  const unten = typ(tx, ty + 1);
  const kante = unten && !IST_FELS.has(unten);
  if (kante && py >= 5) {
    // Felswand: senkrechte Schichten, unten dunkler
    const spalte = Math.floor((x + Math.floor(rauschen(x / 3, y / 8, 5) * 3)) / 4);
    let i = 2 + (zufall(spalte, ty, 6) > 0.5 ? 1 : 0);
    if ((x + Math.floor(rauschen(x / 2, y / 6, 7) * 4)) % 4 === 0) i = 1;
    if (py > 12) i = Math.max(0, i - 1);
    if (py === 5) i = 4;
    if (py === 15) i = 0;
    return FARBEN.fels[i];
  }
  // Hochebene: Fels mit Moos
  const n = rauschen(x / 5, y / 5, 8);
  if (rauschen(x / 7, y / 7, 12) > 0.72) return n > 0.5 ? rgb('#5f7a34') : rgb('#4f6a2c');
  let i = n < 0.3 ? 1 : n < 0.65 ? 2 : 3;
  if (zufall(x, y, 9) > 0.95) i = 4;
  if (kante && py === 4) i = 4;
  return FARBEN.fels[i];
}

function maleMauer(x, y, px, py, tx, ty, typ, rune) {
  const reihe = Math.floor(y / 5);
  const versatz = reihe % 2 ? 4 : 0;
  const fugeX = (x + versatz) % 8 === 0;
  const fugeY = y % 5 === 0;
  const unten = typ(tx, ty + 1);
  const sockel = unten && !IST_FELS.has(unten) && py > 11;
  let c = fugeX || fugeY ? FARBEN.mauer[0] : FARBEN.mauer[zufall(Math.floor((x + versatz) / 8), reihe, 4) > 0.5 ? 2 : 3];
  if (!fugeX && !fugeY && y % 5 === 1) c = FARBEN.mauer[4];
  if (sockel) c = py === 12 ? FARBEN.mauer[4] : FARBEN.mauer[1];
  if (rune) {
    // goldene Zwergen-Rune, leicht leuchtend
    const r = [[7, 3], [7, 4], [7, 5], [7, 6], [7, 7], [7, 8], [7, 9], [7, 10], [8, 3], [8, 10], [4, 5], [5, 5], [6, 5], [9, 5], [10, 5], [11, 5], [5, 9], [6, 8], [9, 8], [10, 9]];
    if (r.some(([rx, ry]) => rx === px && ry === py)) c = rgb('#f2c94c');
    else if (r.some(([rx, ry]) => Math.abs(rx - px) + Math.abs(ry - py) === 1)) c = rgb('#8a6a3a');
  }
  return c;
}

// ---------------------------------------------------------------------------
// OBJEKTE (Gebäude und Deko)
// ---------------------------------------------------------------------------
function mach(b, h, malen) { const e = new Ebene(b, h); malen(e); return e; }

const OBJEKTE = {
  // Zwergenhaus 48 x 56: Steinmauern, Schieferdach, Kamin, Rundbogentür, Fenster mit Licht
  haus: () => mach(48, 58, (e) => {
    teil(e, (t) => { rechteck(t, 34, 2, 7, 14, R.stein); rechteck(t, 33, 1, 9, 3, R.stein, { licht: 0.5 }); });
    teil(e, (t) => {
      rechteck(t, 4, 28, 40, 28, R.mauer);
      for (let y = 30; y < 56; y += 5) for (let x = 4 + ((y / 5) % 2) * 4; x < 44; x += 8) { t.setze(x, y, R.mauer[0]); t.setze(x, y + 1, R.mauer[0]); }
      for (let x = 4; x < 44; x++) for (let y = 29; y < 56; y += 5) t.setze(x, y, R.mauer[0]);
      rechteck(t, 4, 52, 40, 4, R.stein, { licht: -0.4 });
    });
    teil(e, (t) => {
      vieleck(t, [[9, 6], [39, 6], [47, 31], [1, 31]], R.schiefer);
      for (let y = 10; y < 31; y += 4) for (let x = 2; x < 47; x++) if (t.voll(x, y)) t.setze(x, y, R.schiefer[0]);
      for (let y = 8; y < 31; y += 4) for (let x = 4 + (y % 8); x < 46; x += 6) if (t.voll(x, y)) t.setze(x, y + 1, R.schiefer[0]);
      rechteck(t, 9, 5, 30, 2, R.schiefer, { licht: 0.8 });
    });
    teil(e, (t) => {
      rechteck(t, 19, 38, 10, 18, RAMPEN.holz);
      ellipse(t, 24, 39, 5, 4, RAMPEN.holz, { nurOben: 39 });
      for (let y = 40; y < 56; y++) t.setze(24, y, RAMPEN.holz[0]);
      rechteck(t, 19, 42, 10, 1, RAMPEN.stahl); rechteck(t, 19, 50, 10, 1, RAMPEN.stahl);
      t.setze(26, 47, RAMPEN.gold[2]);
    });
    for (const fx of [7, 34]) {
      teil(e, (t) => {
        rechteck(t, fx, 35, 8, 8, R.glas, { licht: 0.2 });
        for (let y = 35; y < 43; y++) t.setze(fx + 4, y, RAMPEN.holz[0]);
        for (let x = fx; x < fx + 8; x++) t.setze(x, 39, RAMPEN.holz[0]);
      });
      teil(e, (t) => {
        rechteck(t, fx - 1, 43, 10, 3, RAMPEN.holz);
        for (let i = 0; i < 4; i++) { t.setze(fx + i * 2 + 1, 42, i % 2 ? '#e05a8a' : '#f2c94c'); t.setze(fx + i * 2, 42, '#3f8a44'); }
      });
    }
  }),

  tanne: () => mach(24, 42, (e) => {
    teil(e, (t) => rechteck(t, 10, 32, 4, 9, RAMPEN.holz));
    for (const [y0, b] of [[22, 11], [13, 9], [5, 6]]) {
      teil(e, (t) => {
        vieleck(t, [[12, y0 - 6], [12 + b, y0 + 11], [12 - b, y0 + 11]], R.tanne);
        for (let x = 12 - b + 2; x < 12 + b - 1; x += 3) t.setze(x, y0 + 10, R.tanne[0]);
      });
    }
  }),

  obstbaum: () => mach(40, 46, (e) => {
    teil(e, (t) => { rechteck(t, 17, 30, 6, 15, RAMPEN.holz); rechteck(t, 14, 42, 12, 3, RAMPEN.holz); t.setze(19, 36, RAMPEN.holz[0]); });
    teil(e, (t) => {
      for (const [x, y, rx, ry] of [[20, 13, 13, 11], [10, 21, 9, 8], [30, 21, 9, 8], [20, 24, 12, 8]]) ellipse(t, x, y, rx, ry, R.blatt);
      for (let i = 0; i < 40; i++) {
        const x = 4 + Math.floor(zufall(i, 1, 7) * 32), y = 3 + Math.floor(zufall(i, 2, 7) * 28);
        if (t.voll(x, y)) { t.setze(x, y, R.blatt[zufall(i, 3, 7) > 0.5 ? 0 : 2]); }
      }
    });
  }),

  busch: () => mach(20, 16, (e) => {
    teil(e, (t) => { ellipse(t, 6, 10, 6, 5, R.blattHell); ellipse(t, 14, 10, 6, 5, R.blattHell); ellipse(t, 10, 6, 6, 5, R.blattHell); });
    const b = new Ebene(20, 16);
    for (const [x, y] of [[6, 8], [13, 6], [10, 11], [15, 11]]) { b.setze(x, y, '#e05a8a'); }
    b.aufmalen(e);
  }),

  fels: () => mach(18, 14, (e) => {
    teil(e, (t) => { ellipse(t, 9, 8, 8, 5.5, R.stein); ellipse(t, 6, 6, 4, 3.5, R.stein, { licht: 0.4 }); });
    const b = new Ebene(18, 14);
    for (const [x, y] of [[9, 6], [10, 7], [10, 8], [12, 9]]) b.setze(x, y, R.stein[0]);
    b.aufmalen(e);
  }),

  laterne: () => mach(12, 30, (e) => {
    teil(e, (t) => { rechteck(t, 5, 10, 2, 19, RAMPEN.stiefel); rechteck(t, 3, 27, 6, 2, RAMPEN.stiefel); });
    teil(e, (t) => { rechteck(t, 2, 2, 8, 9, RAMPEN.stiefel); rechteck(t, 3, 4, 6, 6, R.glas); rechteck(t, 1, 1, 10, 2, RAMPEN.stiefel); });
  }),

  holzstapel: () => mach(22, 16, (e) => {
    for (const [x, y] of [[5, 11], [11, 11], [17, 11], [8, 6], [14, 6]]) {
      teil(e, (t) => { ellipse(t, x, y, 3.2, 3.2, RAMPEN.beige); t.setze(x, y, RAMPEN.holz[1]); t.setze(x - 1, y - 1, RAMPEN.beige[0]); });
    }
  }),

  kiste: () => mach(16, 16, (e) => {
    teil(e, (t) => {
      rechteck(t, 1, 3, 14, 12, RAMPEN.holz);
      for (let i = 0; i < 12; i++) { t.setze(2 + i, 4 + i * 0.9, RAMPEN.holz[0]); }
      for (let x = 1; x < 15; x++) { t.setze(x, 7, RAMPEN.holz[0]); t.setze(x, 11, RAMPEN.holz[0]); }
      rechteck(t, 1, 3, 14, 2, RAMPEN.holz, { licht: 0.8 });
    });
  }),

  fass: () => mach(14, 18, (e) => {
    teil(e, (t) => {
      ellipse(t, 7, 10, 6, 7, RAMPEN.holz);
      rechteck(t, 1, 4, 12, 12, RAMPEN.holz);
      for (const y of [5, 9, 13]) for (let x = 1; x < 13; x++) t.setze(x, y, RAMPEN.stahl[0]);
      ellipse(t, 7, 3.5, 5.5, 2, RAMPEN.holz, { licht: 0.8 });
    });
  }),

  heuballen: () => mach(20, 16, (e) => {
    teil(e, (t) => {
      rechteck(t, 1, 3, 18, 12, R.heu, { rund: 2 });
      for (let x = 2; x < 18; x += 3) for (let y = 4; y < 14; y++) if ((x + y) % 4 === 0) t.setze(x, y, R.heu[0]);
      for (let y = 3; y < 15; y++) { t.setze(6, y, RAMPEN.leder[1]); t.setze(13, y, RAMPEN.leder[1]); }
    });
  }),

  wegweiser: () => mach(20, 24, (e) => {
    teil(e, (t) => rechteck(t, 9, 6, 3, 17, RAMPEN.holz));
    teil(e, (t) => { vieleck(t, [[2, 3], [15, 3], [19, 6.5], [15, 10], [2, 10]], RAMPEN.beige); for (let x = 4; x < 14; x += 2) t.setze(x, 6, RAMPEN.holz[1]); });
  }),

  zaun: () => mach(16, 16, (e) => {
    teil(e, (t) => {
      rechteck(t, 0, 5, 16, 2, RAMPEN.holz); rechteck(t, 0, 10, 16, 2, RAMPEN.holz);
      rechteck(t, 2, 2, 3, 13, RAMPEN.holz, { licht: 0.3 }); rechteck(t, 11, 2, 3, 13, RAMPEN.holz, { licht: 0.3 });
    });
  }),

  brunnen: () => mach(28, 36, (e) => {
    teil(e, (t) => { rechteck(t, 3, 6, 2, 22, RAMPEN.holz); rechteck(t, 23, 6, 2, 22, RAMPEN.holz); });
    teil(e, (t) => { vieleck(t, [[0, 8], [14, 0], [28, 8], [25, 10], [3, 10]], R.schiefer); });
    teil(e, (t) => { rechteck(t, 5, 8, 18, 2, RAMPEN.holz); for (let y = 10; y < 16; y++) t.setze(14, y, RAMPEN.beige[0]); rechteck(t, 12, 15, 5, 4, RAMPEN.stahl); });
    teil(e, (t) => {
      ellipse(t, 14, 27, 13, 8, R.stein);
      ellipse(t, 14, 24, 10, 4, R.wasser, { licht: 0.3 });
      for (let x = 2; x < 27; x += 4) for (let y = 27; y < 35; y += 3) if (t.voll(x, y)) t.setze(x, y, R.stein[0]);
    });
  }),

  marktstand: () => mach(32, 34, (e) => {
    teil(e, (t) => { rechteck(t, 2, 8, 2, 25, RAMPEN.holz); rechteck(t, 28, 8, 2, 25, RAMPEN.holz); });
    teil(e, (t) => {
      rechteck(t, 0, 20, 32, 5, RAMPEN.holz, { licht: 0.5 });
      rechteck(t, 1, 25, 30, 8, RAMPEN.holz);
      for (let x = 1; x < 31; x += 5) for (let y = 25; y < 33; y++) t.setze(x, y, RAMPEN.holz[0]);
    });
    teil(e, (t) => { ellipse(t, 7, 18, 4, 2.6, R.brot); ellipse(t, 13, 17.5, 3.5, 2.5, R.brot); });
    teil(e, (t) => { vieleck(t, [[17, 20], [22, 14], [26, 20]], R.kaese); t.setze(21, 18, R.kaese[0]); t.setze(23, 19, R.kaese[0]); });
    teil(e, (t) => { ellipse(t, 28, 18, 2, 2, R.stoffRot); });
    teil(e, (t) => {
      vieleck(t, [[0, 3], [32, 3], [32, 10], [0, 10]], R.stoffRot);
      for (let x = 0; x < 32; x++) if (Math.floor(x / 4) % 2) for (let y = 3; y < 10; y++) t.setze(x, y, '#f4eee4');
      for (let x = 0; x < 32; x += 4) { t.setze(x + 1, 10, x % 8 ? '#f4eee4' : R.stoffRot[1]); t.setze(x + 2, 10, x % 8 ? '#f4eee4' : R.stoffRot[1]); }
    });
  }),

  amboss: () => mach(20, 16, (e) => {
    teil(e, (t) => { rechteck(t, 5, 10, 10, 5, RAMPEN.holz); });
    teil(e, (t) => { vieleck(t, [[1, 3], [16, 3], [19, 5], [14, 6], [13, 9], [7, 9], [6, 6], [1, 5]], RAMPEN.stahl); });
  }),

  esse: () => mach(22, 32, (e) => {
    teil(e, (t) => { rechteck(t, 7, 0, 8, 12, R.stein); });
    teil(e, (t) => { rechteck(t, 1, 11, 20, 20, R.stein); rechteck(t, 4, 17, 14, 8, RAMPEN.stiefel); });
    const g = new Ebene(22, 32);
    for (let x = 5; x < 17; x++) for (let y = 19; y < 25; y++) g.setze(x, y, (x + y) % 3 === 0 ? '#ffe066' : (x * y) % 4 === 0 ? '#ff5a2e' : '#ff9d2e');
    g.aufmalen(e);
  }),

  pilze: () => mach(18, 14, (e) => {
    for (const [x, y, r] of [[5, 7, 4], [12, 8, 3.5], [9, 11, 2.5]]) {
      teil(e, (t) => rechteck(t, x - 1, y, 3, Math.round(r) + 1, RAMPEN.beige));
      teil(e, (t) => { ellipse(t, x, y, r, r * 0.7, R.stoffRot, { nurOben: y }); t.setze(x - 1, y - 2, '#ffffff'); t.setze(x + 1, y - 1, '#ffffff'); });
    }
  }),

  mine: () => mach(32, 30, (e) => {
    teil(e, (t) => { rechteck(t, 3, 4, 26, 26, RAMPEN.stiefel); ellipse(t, 16, 12, 11, 9, RAMPEN.schwarz); rechteck(t, 5, 12, 22, 18, RAMPEN.schwarz); });
    teil(e, (t) => { rechteck(t, 2, 4, 4, 26, RAMPEN.holz); rechteck(t, 26, 4, 4, 26, RAMPEN.holz); rechteck(t, 0, 2, 32, 4, RAMPEN.holz, { licht: 0.3 }); });
    const g = new Ebene(32, 30);
    for (let y = 18; y < 30; y += 3) for (let x = 9; x < 23; x++) g.setze(x, y, RAMPEN.holz[0]);
    for (let y = 16; y < 30; y++) { g.setze(11, y, RAMPEN.stahl[1]); g.setze(20, y, RAMPEN.stahl[1]); }
    g.aufmalen(e);
  }),

  feuerschale: () => mach(14, 20, (e) => {
    teil(e, (t) => { rechteck(t, 6, 8, 2, 11, RAMPEN.stiefel); rechteck(t, 3, 17, 8, 2, RAMPEN.stiefel); });
    teil(e, (t) => { vieleck(t, [[1, 4], [13, 4], [11, 9], [3, 9]], RAMPEN.stahl); });
  }),

  regal: () => mach(16, 44, (e) => {
    teil(e, (t) => {
      rechteck(t, 0, 0, 16, 44, RAMPEN.holz);
      rechteck(t, 2, 2, 12, 40, RAMPEN.stiefel);
      const farben = ['#b0413e', '#3f6fb5', '#3f8a44', '#e0b23c', '#6e4a9a', '#d9822b'];
      for (const [y0, voll] of [[2, 1], [11, 1], [20, 0.9], [29, 0.3], [38, 0]]) {
        rechteck(t, 1, y0 + 7, 14, 2, RAMPEN.holz, { licht: 0.4 });
        for (let x = 2; x < 14; x++) {
          if (zufall(x, y0, 3) > voll) continue;
          const h = 4 + Math.floor(zufall(x, y0, 4) * 3);
          const f = farben[Math.floor(zufall(x, y0, 5) * farben.length)];
          for (let y = y0 + 7 - h; y < y0 + 7; y++) t.setze(x, y, f);
          if (zufall(x, y0, 6) > 0.5) t.setze(x, y0 + 7 - h + 1, '#f2c94c');
        }
      }
    });
  }),

  // Schild für Bauaufgaben
  schild: () => mach(16, 22, (e) => {
    teil(e, (t) => rechteck(t, 7, 10, 2, 11, RAMPEN.holz));
    teil(e, (t) => { rechteck(t, 1, 1, 14, 11, RAMPEN.beige, { rund: 1 }); });
  }),
  trittstein: () => mach(16, 16, (e) => {
    teil(e, (t) => { ellipse(t, 8, 10, 7, 5, R.stein); ellipse(t, 6, 8, 3, 2, R.stein, { licht: 0.6 }); });
  }),
  steinhaufen: () => mach(22, 18, (e) => {
    for (const [x, y, r] of [[6, 13, 4.5], [15, 13, 5], [10, 7, 4.5], [17, 6, 3]]) teil(e, (t) => ellipse(t, x, y, r, r * 0.8, R.stein));
  }),
  beerenbusch: () => mach(20, 18, (e) => {
    teil(e, (t) => { ellipse(t, 6, 12, 6, 5, R.blatt); ellipse(t, 14, 12, 6, 5, R.blatt); ellipse(t, 10, 7, 7, 6, R.blatt); });
    const b = new Ebene(20, 18);
    for (const [x, y] of [[5, 9], [8, 6], [12, 10], [15, 8], [7, 13], [13, 14], [10, 4]]) { b.setze(x, y, '#4a3a9a'); b.setze(x + 1, y, '#6a5ac8'); b.setze(x, y + 1, '#3a2a7a'); b.setze(x + 1, y + 1, '#4a3a9a'); }
    b.aufmalen(e);
  }),
  seilkiste: () => mach(18, 18, (e) => {
    teil(e, (t) => { rechteck(t, 1, 7, 16, 10, RAMPEN.holz); for (let x = 1; x < 17; x++) t.setze(x, 11, RAMPEN.holz[0]); });
    teil(e, (t) => { ellipse(t, 9, 6, 6, 3.5, RAMPEN.beige); ellipse(t, 9, 6, 3, 1.5, RAMPEN.beige, { licht: -0.8 }); });
  }),
  heuhaufen: () => mach(22, 18, (e) => {
    teil(e, (t) => { ellipse(t, 11, 12, 10, 6, R.heu); ellipse(t, 11, 8, 7, 5, R.heu); for (let i = 0; i < 12; i++) t.setze(3 + i * 1.5, 9 + (i % 3) * 2, R.heu[0]); });
  }),
  laubbaum: () => mach(36, 44, (e) => {
    teil(e, (t) => { rechteck(t, 15, 28, 6, 15, RAMPEN.holz); });
    teil(e, (t) => { for (const [x, y, rx, ry] of [[18, 14, 13, 11], [9, 22, 9, 8], [27, 22, 9, 8], [18, 25, 11, 7]]) ellipse(t, x, y, rx, ry, R.tanne); });
  }),
  turm: () => mach(32, 72, (e) => {
    teil(e, (t) => { rechteck(t, 4, 26, 24, 45, R.mauer); for (let y = 30; y < 70; y += 6) for (let x = 4; x < 28; x++) t.setze(x, y, R.mauer[0]); rechteck(t, 13, 36, 6, 9, RAMPEN.stiefel, { rund: 2 }); });
    teil(e, (t) => { vieleck(t, [[16, 0], [31, 27], [1, 27]], R.schiefer); });
    teil(e, (t) => { rechteck(t, 15, 0, 2, 2, RAMPEN.holz); vieleck(t, [[17, -6 + 6], [26, -2 + 6], [17, 2 + 4]], R.stoffRot); });
  }),
  banner: () => mach(16, 30, (e) => {
    teil(e, (t) => { rechteck(t, 1, 2, 14, 2, RAMPEN.gold); vieleck(t, [[3, 4], [13, 4], [13, 26], [8, 22], [3, 26]], R.stoffRot); });
    const g = new Ebene(16, 30);
    for (const [x, y] of [[8, 9], [7, 10], [9, 10], [8, 11], [6, 12], [10, 12], [8, 12], [8, 13], [8, 14]]) g.setze(x, y, '#f2c94c');
    g.aufmalen(e);
  }),
  saeule: () => mach(16, 44, (e) => {
    teil(e, (t) => { rechteck(t, 3, 4, 10, 36, R.mauer); for (const x of [5, 8, 11]) for (let y = 6; y < 38; y++) t.setze(x, y, R.mauer[1]); rechteck(t, 1, 0, 14, 5, R.mauer, { licht: 0.5 }); rechteck(t, 1, 39, 14, 5, R.mauer); });
  }),
  thron: () => mach(32, 44, (e) => {
    teil(e, (t) => { rechteck(t, 4, 2, 24, 30, RAMPEN.gold, { rund: 3 }); rechteck(t, 8, 6, 16, 22, R.stoffRot); });
    teil(e, (t) => { rechteck(t, 2, 26, 28, 10, RAMPEN.gold); rechteck(t, 5, 28, 22, 5, R.stoffRot, { licht: 0.4 }); rechteck(t, 4, 36, 4, 7, RAMPEN.gold); rechteck(t, 24, 36, 4, 7, RAMPEN.gold); });
    const g = new Ebene(32, 44);
    for (const [x, y] of [[15, 0], [16, 0], [10, 2], [21, 2], [16, 12], [15, 13], [17, 13], [16, 14]]) g.setze(x, y, '#e05a8a');
    g.aufmalen(e);
  }),
  rosen: () => mach(18, 16, (e) => {
    teil(e, (t) => { ellipse(t, 9, 10, 8, 5, R.blatt); });
    const g = new Ebene(18, 16);
    for (const [x, y] of [[4, 8], [9, 6], [13, 9], [7, 11], [12, 12]]) { g.setze(x, y, '#e8303a'); g.setze(x + 1, y, '#ff6a70'); g.setze(x, y + 1, '#a8202a'); g.setze(x + 1, y + 1, '#e8303a'); }
    g.aufmalen(e);
  }),
  stall: () => mach(48, 50, (e) => {
    teil(e, (t) => { rechteck(t, 3, 20, 42, 29, RAMPEN.holz); for (let x = 3; x < 45; x += 4) for (let y = 20; y < 49; y++) t.setze(x, y, RAMPEN.holz[0]); });
    teil(e, (t) => { vieleck(t, [[8, 2], [40, 2], [47, 22], [1, 22]], ['#6a3a1e', '#8a4a26', '#b0643a']); for (let y = 6; y < 22; y += 4) for (let x = 2; x < 46; x++) if (t.voll(x, y)) t.setze(x, y, '#5a2e16'); });
    teil(e, (t) => { rechteck(t, 16, 30, 16, 19, RAMPEN.stiefel); for (let i = 0; i < 16; i++) { t.setze(16 + i, 30 + i * 1.15, RAMPEN.holz[1]); t.setze(31 - i, 30 + i * 1.15, RAMPEN.holz[1]); } });
  }),
  kristall: () => mach(14, 20, (e) => {
    teil(e, (t) => { vieleck(t, [[7, 0], [11, 8], [9, 19], [5, 19], [3, 8]], ['#6a3aa8', '#a070e0', '#e0c8ff']); vieleck(t, [[2, 10], [5, 14], [4, 19], [0, 19]], ['#6a3aa8', '#a070e0', '#e0c8ff']); });
  }),
  hoehlenpilze: () => mach(22, 18, (e) => {
    for (const [x, y, r] of [[6, 10, 5], [15, 11, 4.5], [11, 15, 3]]) {
      teil(e, (t) => rechteck(t, x - 1, y, 3, Math.round(r) + 2, RAMPEN.beige));
      teil(e, (t) => { ellipse(t, x, y, r, r * 0.7, ['#4a7a3a', '#7ab84a', '#c8f080'], { nurOben: y }); t.setze(x - 1, y - 2, '#f0ffc0'); });
    }
  }),
  quelle: () => mach(26, 20, (e) => {
    teil(e, (t) => { ellipse(t, 13, 12, 12, 7, R.stein); ellipse(t, 13, 11, 9, 4.5, R.wasser, { licht: 0.4 }); });
  }),
  hoehleneingang: () => mach(48, 44, (e) => {
    teil(e, (t) => { ellipse(t, 24, 26, 23, 20, R.stein, { nurUnten: 0 }); rechteck(t, 1, 26, 46, 18, R.stein); });
    teil(e, (t) => { ellipse(t, 24, 30, 14, 14, ['#050308', '#0e0a12', '#1a141e']); rechteck(t, 10, 30, 28, 14, ['#050308', '#0e0a12', '#1a141e']); }, { umriss: false });
  }),
  schlosstor: () => mach(48, 48, (e) => {
    teil(e, (t) => { rechteck(t, 0, 4, 48, 44, R.mauer); for (let y = 8; y < 48; y += 6) for (let x = 0; x < 48; x++) t.setze(x, y, R.mauer[0]); for (let x = 0; x < 48; x += 8) rechteck(t, x, 0, 5, 5, R.mauer, { licht: 0.5 }); });
    teil(e, (t) => { ellipse(t, 24, 26, 12, 10, RAMPEN.holz, { nurOben: 26 }); rechteck(t, 12, 26, 24, 22, RAMPEN.holz); for (let x = 14; x < 36; x += 4) for (let y = 18; y < 48; y++) if (t.voll(x, y)) t.setze(x, y, RAMPEN.stahl[0]); });
  }),
  schloss: () => mach(112, 96, (e) => {
    teil(e, (t) => { rechteck(t, 16, 36, 80, 60, R.mauer); for (let y = 40; y < 96; y += 6) for (let x = 16 + ((y / 6) % 2) * 4; x < 96; x += 8) { t.setze(x, y, R.mauer[0]); } for (let x = 16; x < 96; x += 8) rechteck(t, x, 30, 5, 6, R.mauer, { licht: 0.5 }); });
    for (const tx of [0, 88]) {
      teil(e, (t) => { rechteck(t, tx + 2, 24, 20, 72, R.mauer); for (let y = 28; y < 96; y += 6) for (let x = tx + 2; x < tx + 22; x++) t.setze(x, y, R.mauer[0]); rechteck(t, tx + 8, 40, 8, 10, R.glas, { rund: 2 }); });
      teil(e, (t) => vieleck(t, [[tx + 12, 0], [tx + 24, 25], [tx, 25]], R.schiefer));
      teil(e, (t) => vieleck(t, [[tx + 12, 0], [tx + 21, 3], [tx + 12, 6]], R.stoffRot));
    }
    teil(e, (t) => { rechteck(t, 46, 4, 20, 34, R.mauer); vieleck(t, [[56, -8 + 8], [68, 10], [44, 10]], R.schiefer); rechteck(t, 52, 16, 8, 12, R.glas, { rund: 2 }); });
    teil(e, (t) => { ellipse(t, 56, 72, 14, 12, RAMPEN.holz, { nurOben: 72 }); rechteck(t, 42, 72, 28, 24, RAMPEN.holz); for (let x = 44; x < 70; x += 4) for (let y = 62; y < 96; y++) if (t.voll(x, y)) t.setze(x, y, RAMPEN.stahl[0]); });
    for (const bx of [30, 76]) teil(e, (t) => { vieleck(t, [[bx - 5, 44], [bx + 5, 44], [bx + 5, 66], [bx, 62], [bx - 5, 66]], R.stoffRot); t.setze(bx, 52, '#f2c94c'); t.setze(bx, 53, '#f2c94c'); });
  }),

  tuer: () => mach(16, 16, (e) => {
    teil(e, (t) => {
      rechteck(t, 2, 4, 12, 12, RAMPEN.holz);
      ellipse(t, 8, 5, 6, 4, RAMPEN.holz, { nurOben: 5 });
      for (let y = 2; y < 16; y++) t.setze(8, y, RAMPEN.holz[0]);
      rechteck(t, 2, 7, 12, 1, RAMPEN.stahl); rechteck(t, 2, 12, 12, 1, RAMPEN.stahl);
      t.setze(10, 10, RAMPEN.gold[2]);
    });
  }),
};

// Ahnen-Statue: ein Zwerg aus Stein auf einem Sockel
function statue() {
  const figur = baueFigur({ typ: 'zwerg', bart: 'zoepfe', kopf: 'hoernerhelm' }).steh0;
  const e = new Ebene(28, 46);
  teil(e, (t) => { rechteck(t, 4, 34, 20, 11, R.stein); rechteck(t, 2, 32, 24, 3, R.stein, { licht: 0.6 }); });
  for (let y = 0; y < figur.h; y++) {
    for (let x = 0; x < figur.b; x++) {
      const i = (y * figur.b + x) * 4;
      if (!figur.d[i + 3]) continue;
      const hell = (figur.d[i] * 0.3 + figur.d[i + 1] * 0.59 + figur.d[i + 2] * 0.11) / 255;
      const c = hell < 0.2 ? '#3a3640' : hell < 0.45 ? R.stein[0] : hell < 0.7 ? R.stein[1] : R.stein[2];
      e.setze(x, y, c);
    }
  }
  return e;
}

// Früchte am Obstbaum (Positionen relativ zur linken oberen Ecke des Baumbildes)
export const OBST_PLAETZE = [[11, 8], [20, 4], [29, 9], [8, 18], [33, 19], [17, 14], [25, 16]];

// ---------------------------------------------------------------------------
// Kleine Bilder: Tiere, Licht, Rauch, Funken
// ---------------------------------------------------------------------------
function kleinteile() {
  const t = {};
  t.apfel = mach(6, 7, (e) => teil(e, (x) => { ellipse(x, 3, 4, 2.6, 2.6, R.stoffRot); x.setze(3, 1, RAMPEN.holz[0]); x.setze(2, 3, '#ffffff'); }, { umriss: true }));
  for (let i = 0; i < 3; i++) {
    t[`flamme${i}`] = mach(10, 12, (e) => {
      const h = [9, 11, 8][i], s = [0, 1, -1][i];
      teil(e, (x) => { vieleck(x, [[5 + s, 11 - h], [9, 11], [1, 11]], ['#d9401e', '#ff9d2e', '#ffe066']); ellipse(x, 5, 9, 2, 2, ['#ffb020', '#ffe066', '#ffffff']); }, { umriss: false });
    });
  }
  for (let i = 0; i < 2; i++) {
    t[`falter${i}`] = mach(7, 5, (e) => {
      const f = ['#f2c94c', '#ffffff'];
      if (i === 0) { e.setze(0, 0, f[0]); e.setze(1, 0, f[0]); e.setze(0, 1, f[0]); e.setze(1, 1, f[0]); e.setze(5, 0, f[0]); e.setze(6, 0, f[0]); e.setze(5, 1, f[0]); e.setze(6, 1, f[0]); e.setze(1, 2, f[0]); e.setze(5, 2, f[0]); }
      else { e.setze(1, 1, f[0]); e.setze(2, 1, f[0]); e.setze(4, 1, f[0]); e.setze(5, 1, f[0]); }
      e.setze(3, 1, UMRISS); e.setze(3, 2, UMRISS); e.setze(3, 3, UMRISS);
    });
  }
  for (let i = 0; i < 2; i++) {
    t[`vogel${i}`] = mach(9, 5, (e) => {
      const c = '#2b2530';
      if (i === 0) { for (const [x, y] of [[0, 0], [1, 1], [2, 2], [3, 2], [4, 3], [5, 2], [6, 2], [7, 1], [8, 0]]) e.setze(x, y, c); }
      else { for (const [x, y] of [[0, 3], [1, 2], [2, 2], [3, 2], [4, 3], [5, 2], [6, 2], [7, 2], [8, 3]]) e.setze(x, y, c); }
    });
  }
  for (let i = 0; i < 3; i++) {
    t[`huhn${i}`] = mach(14, 14, (e) => {
      const pick = i === 2, schritt = i === 1;
      teil(e, (x) => { rechteck(x, 5, 10, 1, 3, RAMPEN.orange); rechteck(x, 8 + (schritt ? 1 : 0), 10, 1, 3, RAMPEN.orange); });
      teil(e, (x) => {
        ellipse(x, 7, 8, 5, 3.6, RAMPEN.weiss);
        ellipse(x, pick ? 11 : 10, pick ? 8 : 4, 2.4, 2.4, RAMPEN.weiss);
        rechteck(x, 2, 5, 2, 3, RAMPEN.weiss);
      });
      const g = new Ebene(14, 14);
      const kx = pick ? 11 : 10, ky = pick ? 8 : 4;
      g.setze(kx, ky - 3, '#d83a3a'); g.setze(kx + 1, ky - 3, '#d83a3a');
      g.setze(kx + 3, ky, '#e8a030'); g.setze(kx + 1, ky - 1, UMRISS); g.setze(kx + 1, ky + 1, '#d83a3a');
      g.aufmalen(e);
    });
  }
  t.rauch = mach(8, 8, (e) => ellipse(e, 4, 4, 3.5, 3.5, ['#9a96a0', '#c8c4cc', '#eeeaf0']));
  t.funke = mach(2, 2, (e) => { e.setze(0, 0, '#ffe066'); e.setze(1, 0, '#ff9d2e'); e.setze(0, 1, '#ff9d2e'); e.setze(1, 1, '#ffe066'); });
  t.glitzer = mach(5, 5, (e) => { e.setze(2, 0, '#ffffff'); e.setze(2, 4, '#ffffff'); e.setze(0, 2, '#ffffff'); e.setze(4, 2, '#ffffff'); e.setze(2, 2, '#ffffff'); e.setze(1, 2, '#d8f0ff'); e.setze(3, 2, '#d8f0ff'); e.setze(2, 1, '#d8f0ff'); e.setze(2, 3, '#d8f0ff'); });
  t.staub = mach(5, 4, (e) => ellipse(e, 2.5, 2, 2.3, 1.8, ['#b0a080', '#d8c8a8', '#f0e4c8']));
  t.gluehwurm = mach(4, 4, (e) => { e.setze(1, 1, '#fff8a0'); e.setze(2, 1, '#e0ff80'); e.setze(1, 2, '#e0ff80'); e.setze(2, 2, '#fff8a0'); e.setze(0, 1, '#80a040'); e.setze(3, 2, '#80a040'); });
  t.stern = mach(15, 15, (e) => teil(e, (x) => vieleck(x, [[7.5, 0], [9.5, 5], [15, 5.5], [11, 9], [12.5, 14.5], [7.5, 11.5], [2.5, 14.5], [4, 9], [0, 5.5], [5.5, 5]], RAMPEN.gold)));
  // neue Gegenstände (16 x 16)
  t.stein = mach(16, 16, (e) => teil(e, (x) => { ellipse(x, 8, 9, 6.5, 5, R.stein); ellipse(x, 6, 7, 2.5, 1.8, R.stein, { licht: 0.8 }); }));
  t.brett = mach(16, 16, (e) => teil(e, (x) => { rechteck(x, 1, 5, 14, 6, RAMPEN.holz, { rund: 1 }); for (let i = 2; i < 14; i += 5) x.setze(i, 8, RAMPEN.holz[0]); x.setze(3, 7, RAMPEN.stahl[1]); x.setze(12, 7, RAMPEN.stahl[1]); }));
  t.seil = mach(16, 16, (e) => teil(e, (x) => { ellipse(x, 8, 8, 6.5, 6, RAMPEN.beige); ellipse(x, 8, 8, 3, 2.5, RAMPEN.beige, { licht: -0.9 }); x.setze(13, 13, RAMPEN.beige[0]); x.setze(14, 14, RAMPEN.beige[0]); }));
  t.beeren = mach(16, 16, (e) => {
    teil(e, (x) => { ellipse(x, 8, 11, 7, 4, RAMPEN.holz); });
    teil(e, (x) => { for (const [bx, by] of [[5, 8], [8, 7], [11, 8], [6.5, 5.5], [9.5, 5.5], [8, 4]]) ellipse(x, bx, by, 1.8, 1.8, ['#2a1a6a', '#4a3a9a', '#8a7ae0']); });
  });
  t.heu = mach(16, 16, (e) => teil(e, (x) => { ellipse(x, 8, 9, 7, 5, R.heu); for (let i = 0; i < 6; i++) x.setze(3 + i * 2, 7 + (i % 2) * 3, R.heu[0]); x.setze(8, 3, R.heu[1]); x.setze(9, 4, R.heu[1]); }));
  t.fackel = mach(16, 16, (e) => {
    teil(e, (x) => { rechteck(x, 7, 7, 3, 9, RAMPEN.holz); rechteck(x, 6, 6, 5, 2, RAMPEN.stahl); });
    teil(e, (x) => { vieleck(x, [[8.5, 0], [12, 6], [5, 6]], ['#d9401e', '#ff9d2e', '#ffe066']); x.setze(8, 4, '#ffffff'); }, { umriss: false });
  });
  t.pilze = mach(16, 16, (e) => {
    teil(e, (x) => { ellipse(x, 8, 12, 7, 3.5, RAMPEN.holz); });
    for (const [px, py, r] of [[5, 8, 3.5], [11, 8, 3.2], [8, 6, 3]]) teil(e, (x) => { rechteck(x, px - 1, py, 2, 3, RAMPEN.beige); ellipse(x, px, py, r, r * 0.7, ['#4a7a3a', '#7ab84a', '#c8f080'], { nurOben: py }); });
  });
  t.ausruf = mach(16, 16, (e) => teil(e, (x) => { rechteck(x, 6, 1, 4, 9, R.stoffRot, { rund: 1 }); ellipse(x, 8, 13, 2, 2, R.stoffRot); }));
  return t;
}

// Weicher Lichtschein (für Laternen, Feuer, Fenster)
function erzeugeSchein(scene) {
  if (scene.textures.exists('schein')) return;
  const tex = scene.textures.createCanvas('schein', 64, 64);
  const ctx = tex.getContext();
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,220,140,0.55)');
  g.addColorStop(0.4, 'rgba(255,180,90,0.22)');
  g.addColorStop(1, 'rgba(255,160,60,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
  tex.refresh();
  const wolke = scene.textures.createCanvas('wolke', 160, 80);
  const w = wolke.getContext();
  const gw = w.createRadialGradient(80, 40, 0, 80, 40, 80);
  gw.addColorStop(0, 'rgba(20,30,60,0.16)');
  gw.addColorStop(0.7, 'rgba(20,30,60,0.08)');
  gw.addColorStop(1, 'rgba(20,30,60,0)');
  w.setTransform(1, 0, 0, 0.5, 0, 20);
  w.fillStyle = gw; w.fillRect(0, 0, 160, 160);
  wolke.refresh();
  const schatten = scene.textures.createCanvas('bodenschatten', 32, 12);
  const s = schatten.getContext();
  const gs = s.createRadialGradient(16, 6, 0, 16, 6, 16);
  gs.addColorStop(0, 'rgba(10,10,20,0.38)');
  gs.addColorStop(0.7, 'rgba(10,10,20,0.22)');
  gs.addColorStop(1, 'rgba(10,10,20,0)');
  s.setTransform(1, 0, 0, 0.375, 0, 3.75);
  s.fillStyle = gs; s.fillRect(0, 0, 32, 32);
  schatten.refresh();
}

function erzeugeLichtmaske(scene) {
  if (scene.textures.exists('lichtmaske')) return;
  const tex = scene.textures.createCanvas('lichtmaske', 64, 64);
  const ctx = tex.getContext();
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.55, 'rgba(255,255,255,0.85)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
  tex.refresh();
}

export function erzeugeWeltTexturen(scene) {
  erzeugeLichtmaske(scene);
  if (scene.textures.exists('obj_haus')) return;
  for (const [name, bau] of Object.entries(OBJEKTE)) alsTextur(scene, `obj_${name}`, bau());
  alsTextur(scene, 'obj_statue', statue());
  for (const [name, e] of Object.entries(kleinteile())) alsTextur(scene, name, e);
  erzeugeSchein(scene);
}
