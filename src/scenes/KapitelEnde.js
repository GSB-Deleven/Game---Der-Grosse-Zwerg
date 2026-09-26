import Phaser from 'phaser';
import { TEXTE } from '../texte/de.js';
import { stil } from '../systeme/schrift.js';
import { knopf } from '../systeme/knopf.js';
import { sprich, verstummen } from '../systeme/stimme.js';
import { spiele } from '../systeme/ton.js';
import { bergKulisse, dekoZwerg } from '../systeme/kulisse.js';

export class KapitelEnde extends Phaser.Scene {
  constructor() { super('KapitelEnde'); }

  create() {
    this.cameras.main.fadeIn(600);
    bergKulisse(this, { nacht: true });
    const stand = this.registry.get('stand');

    this.add.text(480, 70, TEXTE.kapitelEnde, stil(60, '#f2c94c', { strokeThickness: 10 })).setOrigin(0.5);

    // Alle Herzen, die gesammelt wurden
    const n = stand.herzen;
    for (let i = 0; i < n; i++) {
      const h = this.add.image(480 - (n - 1) * 28 + i * 56, 150, 'herz').setScale(0);
      this.tweens.add({ targets: h, scale: 3, delay: 300 + i * 150, duration: 300, ease: 'Back.easeOut', onStart: () => spiele('knopf') });
    }

    const held = this.add.image(390, 500, 'held_unten_jubeln').setOrigin(0.5, 46 / 48).setScale(4.6);
    this.tweens.add({ targets: held, y: 488, duration: 350, yoyo: true, repeat: -1, ease: 'Quad.easeOut' });
    dekoZwerg(this, 580, 500, 'koenigin', 5, 'jubeln');

    this.add.text(480, 222, TEXTE.fortsetzung, stil(28, '#ffffff', { align: 'center', wordWrap: { width: 800 } })).setOrigin(0.5);
    knopf(this, 800, 505, { text: TEXTE.zurueck, breite: 320, hoehe: 64, groesse: 30 }, () => {
      verstummen();
      this.scene.start('Titel');
    });

    spiele('sieg');
    this.time.delayedCall(800, () => sprich(`${TEXTE.kapitelEnde} Du hast ${n} Herzen gesammelt. ${TEXTE.fortsetzung}`));
  }
}
