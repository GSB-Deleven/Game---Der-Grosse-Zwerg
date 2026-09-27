import Phaser from 'phaser';
import { mittig } from '../systeme/bildschirm.js';
import { TEXTE } from '../texte/de.js';
import { stil } from '../systeme/schrift.js';
import { knopf } from '../systeme/knopf.js';
import { sprich, verstummen } from '../systeme/stimme.js';
import { spiele } from '../systeme/ton.js';
import { stoppeMusik } from '../systeme/musik.js';
import { bergKulisse, dekoZwerg } from '../systeme/kulisse.js';
import { KAPITEL } from '../levels/index.js';
import { naechstesKapitel } from '../systeme/kapitel.js';

// Wer beim Kapitelende neben dem Grossen Zwerg jubelt
const JUBLER = { 1: 'bote', 2: 'koenigin', 3: 'mira', 4: 'koenigin' };

export class KapitelEnde extends Phaser.Scene {
  constructor() { super('KapitelEnde'); }

  init(daten) { this.nummer = daten.kapitel || this.registry.get('stand').kapitel; this.los = false; }

  create() {
    mittig(this);
    stoppeMusik();
    this.cameras.main.fadeIn(600);
    bergKulisse(this, { nacht: true });
    const stand = this.registry.get('stand');
    const titel = TEXTE.kapitelGeschafft(this.nummer);
    this.add.text(480, 64, titel, stil(58, '#f2c94c', { strokeThickness: 10 })).setOrigin(0.5);
    this.add.text(480, 118, KAPITEL[this.nummer]?.name || '', stil(26, '#ffffff')).setOrigin(0.5);

    // Herzen
    const n = Math.min(stand.herzen, 18);
    for (let i = 0; i < n; i++) {
      const h = this.add.image(480 - (n - 1) * 22 + i * 44, 168, 'herz').setScale(0);
      this.tweens.add({ targets: h, scale: 2.4, delay: 300 + i * 100, duration: 300, ease: 'Back.easeOut', onStart: () => spiele('knopf') });
    }
    if (stand.herzen > n) this.add.text(480, 200, `${stand.herzen} Herzen!`, stil(22)).setOrigin(0.5);

    const held = this.add.image(390, 480, 'held_unten_jubeln').setOrigin(0.5, 46 / 48).setScale(4.6);
    this.tweens.add({ targets: held, y: 468, duration: 350, yoyo: true, repeat: -1, ease: 'Quad.easeOut' });
    dekoZwerg(this, 580, 480, JUBLER[this.nummer] || 'mama', 5, 'jubeln');

    const naechstes = KAPITEL[this.nummer + 1];
    const text = naechstes ? `Weiter geht's mit Kapitel ${this.nummer + 1}: ${naechstes.name}` : '';
    this.add.text(480, 236, text, stil(26, '#ffffff', { align: 'center', wordWrap: { width: 820 } })).setOrigin(0.5);

    if (naechstes) {
      const k = knopf(this, 800, 470, { text: TEXTE.weiter, breite: 240, hoehe: 76, groesse: 36, icon: 'herz', iconScale: 2.5 }, () => this.weiter());
      this.tweens.add({ targets: k, scale: 1.06, duration: 600, yoyo: true, repeat: -1 });
    }
    knopf(this, 130, 500, { text: TEXTE.zurueck, breite: 220, hoehe: 54, groesse: 22, farbe: 0x5c5460 }, () => { verstummen(); this.scene.start('Titel'); });
    this.input.keyboard.on('keydown-SPACE', () => this.weiter());
    this.input.keyboard.on('keydown-ENTER', () => this.weiter());
    this.input.gamepad?.on('down', () => this.weiter());

    spiele('sieg');
    this.time.delayedCall(800, () => sprich(`${titel} ${text}`));
  }

  weiter() {
    if (this.los || !KAPITEL[this.nummer + 1]) return;
    this.los = true;
    verstummen();
    this.cameras.main.fadeOut(400);
    this.cameras.main.once('camerafadeoutcomplete', () => naechstesKapitel(this));
  }
}
