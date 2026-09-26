import Phaser from 'phaser';
import { figurTextur } from '../grafik/texturen.js';

// Malt eine hübsche Berg-Kulisse als Hintergrund (für Titel & Geschichten)
export function bergKulisse(scene, { breite = 960, hoehe = 540, nacht = false } = {}) {
  const g = scene.add.graphics();
  const himmel = nacht ? [0x1b1640, 0x3a2f6b] : [0x6fb3e8, 0xbfe3f5];
  const streifen = 12;
  for (let i = 0; i < streifen; i++) {
    const t = i / (streifen - 1);
    const c = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(himmel[0]), Phaser.Display.Color.ValueToColor(himmel[1]), 100, t * 100);
    g.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b), 1);
    g.fillRect(0, (i * hoehe * 0.7) / streifen, breite, hoehe * 0.7 / streifen + 1);
  }
  if (nacht) {
    for (let i = 0; i < 60; i++) {
      g.fillStyle(0xffffff, Math.random() * 0.8 + 0.2);
      g.fillRect(Math.random() * breite, Math.random() * hoehe * 0.55, 3, 3);
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
  berg(140, 170, 260, nacht ? 0x2a2440 : 0x7d7a9a, true);
  berg(470, 60, 330, nacht ? 0x241f38 : 0x6c6888, true);
  berg(820, 150, 280, nacht ? 0x2a2440 : 0x7d7a9a, true);
  berg(300, 260, 200, nacht ? 0x1f2a2a : 0x4f7a55, false);
  berg(700, 280, 220, nacht ? 0x1f2a2a : 0x4f7a55, false);
  // Wiese
  g.fillStyle(nacht ? 0x284a2a : 0x5da048, 1).fillRect(0, hoehe * 0.7, breite, hoehe * 0.3);
  g.fillStyle(nacht ? 0x1f3a22 : 0x4b8a3c, 1);
  for (let i = 0; i < 90; i++) g.fillRect(Math.random() * breite, hoehe * 0.72 + Math.random() * hoehe * 0.28, 6, 9);
  return g;
}

// Setzt einen kleinen Dorf-Zwerg als Deko
export function dekoZwerg(scene, x, y, aussehen, skala = 4) {
  return scene.add.image(x, y, figurTextur(scene, aussehen)).setOrigin(0.5, 1).setScale(skala);
}
