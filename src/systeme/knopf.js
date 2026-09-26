import Phaser from 'phaser';
import { stil } from './schrift.js';
import { spiele } from './ton.js';

// Ein grosser, freundlicher Knopf (für Maus und Finger)
export function knopf(scene, x, y, { text = '', breite = 260, hoehe = 80, farbe = 0x3f8a44, rand = 0xf2c94c, groesse = 36, icon = null, iconScale = 3 }, beiDruck) {
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  const male = (hell) => {
    g.clear();
    g.fillStyle(0x1b1420, 1).fillRoundedRect(-breite / 2 + 4, -hoehe / 2 + 6, breite, hoehe, 18);
    g.fillStyle(hell ? Phaser.Display.Color.ValueToColor(farbe).lighten(15).color : farbe, 1).fillRoundedRect(-breite / 2, -hoehe / 2, breite, hoehe, 18);
    g.lineStyle(5, rand, 1).strokeRoundedRect(-breite / 2, -hoehe / 2, breite, hoehe, 18);
  };
  male(false);
  c.add(g);
  let textX = 0;
  if (icon) {
    const bild = scene.add.image(text ? -breite / 2 + 50 : 0, 0, icon).setScale(iconScale);
    c.add(bild);
    textX = text ? 25 : 0;
  }
  if (text) c.add(scene.add.text(textX, 0, text, stil(groesse)).setOrigin(0.5));
  c.setSize(breite, hoehe);
  c.setInteractive({ useHandCursor: true });
  c.on('pointerover', () => male(true));
  c.on('pointerout', () => male(false));
  c.on('pointerdown', () => {
    spiele('knopf');
    scene.tweens.add({ targets: c, scale: 0.92, duration: 70, yoyo: true, onComplete: () => beiDruck?.() });
  });
  return c;
}
