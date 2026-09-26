import Phaser from 'phaser';
import { erzeugeAlleTexturen } from '../grafik/texturen.js';
import { ladeEinstellungen, leererSpielstand } from '../systeme/speichern.js';
import { heldTexturen } from '../grafik/figur-texturen.js';
import { erzeugeWeltTexturen } from '../grafik/welt-grafik.js';
import { setzeMusikLautstaerke } from '../systeme/musik.js';
import { setzeTonLautstaerke } from '../systeme/ton.js';
import { SCHRIFT } from '../systeme/schrift.js';

export class Boot extends Phaser.Scene {
  constructor() { super('Boot'); }

  create() {
    erzeugeAlleTexturen(this);
    heldTexturen(this);
    erzeugeWeltTexturen(this);
    this.registry.set('stand', leererSpielstand());
    const einst = ladeEinstellungen();
    setzeMusikLautstaerke(einst.musik);
    setzeTonLautstaerke(einst.toene ?? 1);

    // Auf die Schrift warten (höchstens 2 Sekunden), dann Titelbild
    const weiter = () => this.scene.start('Titel');
    if (document.fonts && document.fonts.load) {
      Promise.race([
        document.fonts.load(`32px ${SCHRIFT.split(',')[0]}`),
        new Promise((r) => setTimeout(r, 2000)),
      ]).then(weiter, weiter);
    } else weiter();
  }
}
