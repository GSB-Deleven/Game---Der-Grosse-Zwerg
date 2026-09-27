import Phaser from 'phaser';
import { figurTexturen } from '../grafik/figur-texturen.js';

// Malt eine hübsche Berg-Kulisse als Hintergrund (für Titel & Geschichten)
export function bergKulisse(scene, { breite = 960, hoehe = 540, nacht = false } = {}) {
  const g = scene.add.graphics();
  const himmel = nacht ? [0x1b1640, 0x3a2f6b] : [0x6fb3e8, 0xbfe3f5];
  // Auf breiten oder hohen Bildschirmen reicht die Kulisse über 960 x 540 hinaus
  const R = 900, x0 = -R, bb = breite + 2 * R;
  g.fillStyle(himmel[0], 1).fillRect(x0, -R, bb, R);
  const streifen = 12;
  for (let i = 0; i < streifen; i++) {
    const t = i / (streifen - 1);
    const c = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(himmel[0]), Phaser.Display.Color.ValueToColor(himmel[1]), 100, t * 100);
    g.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b), 1);
    g.fillRect(x0, (i * hoehe * 0.7) / streifen, bb, hoehe * 0.7 / streifen + 1);
  }
  if (nacht) {
    for (let i = 0; i < 160; i++) {
      g.fillStyle(0xffffff, Math.random() * 0.8 + 0.2);
      g.fillRect(x0 + Math.random() * bb, -300 + Math.random() * (hoehe * 0.55 + 300), 3, 3);
    }
  }
  // Berge (hinten)
  const berg = (x, spitze, b, farbe, schnee) => {
    g.fillStyle(farbe, 1);
    g.fillTriangle(x - b, hoehe * 0.72, x, spitze, x + b, hoehe * 0.72);
    if (schnee) {
      g.fillStyle(0xf4f4f8, 1);
      const s = (hoehe * 0.72 - spitze) * 0.22;
      g.fillTriangle(x - b * 0.22, spitze + s, x, spitze, x + b * 0.22, spitze + s);
    }
  };
  berg(-260, 140, 300, nacht ? 0x241f38 : 0x6c6888, true);
  berg(1220, 120, 320, nacht ? 0x241f38 : 0x6c6888, true);
  berg(-80, 270, 220, nacht ? 0x1f2a2a : 0x4f7a55, false);
  berg(1060, 250, 230, nacht ? 0x1f2a2a : 0x4f7a55, false);
  berg(140, 170, 260, nacht ? 0x2a2440 : 0x7d7a9a, true);
  berg(470, 60, 330, nacht ? 0x241f38 : 0x6c6888, true);
  berg(820, 150, 280, nacht ? 0x2a2440 : 0x7d7a9a, true);
  berg(300, 260, 200, nacht ? 0x1f2a2a : 0x4f7a55, false);
  berg(700, 280, 220, nacht ? 0x1f2a2a : 0x4f7a55, false);
  // Wiese
  g.fillStyle(nacht ? 0x284a2a : 0x5da048, 1).fillRect(x0, hoehe * 0.7, bb, hoehe * 0.3 + R);
  g.fillStyle(nacht ? 0x1f3a22 : 0x4b8a3c, 1);
  for (let i = 0; i < 260; i++) g.fillRect(x0 + Math.random() * bb, hoehe * 0.72 + Math.random() * (hoehe * 0.28 + 300), 6, 9);
  return g;
}

// Setzt eine Figur (Name aus figuren-liste.js) als Deko; bild: steh0, jubeln, links, rechts …
export function dekoZwerg(scene, x, y, name, skala = 4, bild = 'steh0') {
  return scene.add.image(x, y, figurTexturen(scene, name) + bild).setOrigin(0.5, 34 / 36).setScale(skala);
}
