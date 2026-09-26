import Phaser from 'phaser';
import { erzeugeAlleTexturen } from '../grafik/texturen.js';
import { ladeSpielstand } from '../systeme/speichern.js';
import { SCHRIFT } from '../systeme/schrift.js';

export class Boot extends Phaser.Scene {
  constructor() { super('Boot'); }

  create() {
    erzeugeAlleTexturen(this);
    this.erzeugeAnimationen();
    this.registry.set('stand', ladeSpielstand());

    // Auf die Schrift warten (höchstens 2 Sekunden), dann Titelbild
    const weiter = () => this.scene.start('Titel');
    if (document.fonts && document.fonts.load) {
      Promise.race([
        document.fonts.load(`32px ${SCHRIFT.split(',')[0]}`),
        new Promise((r) => setTimeout(r, 2000)),
      ]).then(weiter, weiter);
    } else weiter();
  }

  erzeugeAnimationen() {
    for (const richtung of ['unten', 'oben', 'seite']) {
      this.anims.create({
        key: `held_${richtung}_laufen`,
        frames: [1, 0, 2, 0].map((n) => ({ key: `held_${richtung}_${n}` })),
        frameRate: 8,
        repeat: -1,
      });
    }
  }
}
