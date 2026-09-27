import Phaser from 'phaser';
import { erzeugeAlleTexturen } from '../grafik/texturen.js';
import { ladeEinstellungen, leererSpielstand } from '../systeme/speichern.js';
import { heldTexturen } from '../grafik/figur-texturen.js';
import { starteKapitel } from '../systeme/kapitel.js';
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
    const weiter = () => {
      // Entwickler-Abkürzung: ?kapitel=3 startet direkt in Kapitel 3 (Speicherplatz 3)
      const k = Number(new URLSearchParams(location.search).get('kapitel'));
      if (k) {
        const stand = leererSpielstand('Test', 'held');
        stand.kapitel = k;
        stand.introGesehen = true;
        stand.geschichten = ['intro', 'kapitel2', 'kapitel3', 'kapitel4'];
        this.registry.set('platz', 2);
        this.registry.set('stand', stand);
        starteKapitel(this, { mitIntro: false });
        return;
      }
      this.scene.start('Titel');
    };
    if (document.fonts && document.fonts.load) {
      Promise.race([
        document.fonts.load(`32px ${SCHRIFT.split(',')[0]}`),
        new Promise((r) => setTimeout(r, 2000)),
      ]).then(weiter, weiter);
    } else weiter();
  }
}
