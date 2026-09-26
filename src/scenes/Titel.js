import Phaser from 'phaser';
import { TEXTE } from '../texte/de.js';
import { stil } from '../systeme/schrift.js';
import { knopf } from '../systeme/knopf.js';
import { verstummen } from '../systeme/stimme.js';
import { tonStart, spiele } from '../systeme/ton.js';
import { spieleMusik } from '../systeme/musik.js';
import { bergKulisse, dekoZwerg } from '../systeme/kulisse.js';

export class Titel extends Phaser.Scene {
  constructor() { super('Titel'); }

  create() {
    this.gestartet = false;
    this.cameras.main.fadeIn(400);
    bergKulisse(this);

    // Der Grosse Zwerg zwischen den kleinen Zwergen
    const figuren = [
      dekoZwerg(this, 170, 480, 'mama', 4.5),
      dekoZwerg(this, 270, 490, 'bruno', 4.5, 'rechts'),
      dekoZwerg(this, 690, 490, 'tilda', 4.5, 'links'),
      dekoZwerg(this, 800, 480, 'haendler', 4.5),
    ];
    figuren.forEach((f, i) => this.tweens.add({ targets: f, y: f.y - 6, duration: 500 + i * 70, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: i * 120 }));
    const held = this.add.image(480, 505, 'held_unten_steh0').setOrigin(0.5, 46 / 48).setScale(6.5);
    let bild = 0;
    this.time.addEvent({ delay: 700, loop: true, callback: () => { bild = 1 - bild; held.setTexture(`held_unten_steh${bild}`); } });
    this.time.addEvent({ delay: 3200, loop: true, callback: () => { held.setTexture('held_unten_blinzeln'); } });

    const titel = this.add.text(480, 70, TEXTE.titel, stil(80, '#f2c94c', { strokeThickness: 12 })).setOrigin(0.5);
    this.tweens.add({ targets: titel, scale: 1.04, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.add.text(480, 132, TEXTE.untertitel, stil(22, '#ffffff')).setOrigin(0.5);

    this.spielenKnopf = knopf(this, 480, 210, { text: TEXTE.spielen, breite: 280, hoehe: 86, groesse: 44, icon: 'herz', iconScale: 3 }, () => this.starte());
    this.tweens.add({ targets: this.spielenKnopf, scale: 1.06, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Musik startet beim ersten Berühren (Browser erlauben Ton erst nach einer Berührung)
    this.input.once('pointerdown', () => { tonStart(); spieleMusik('titel'); });
    this.input.keyboard.on('keydown-SPACE', () => this.starte());
    this.input.keyboard.on('keydown-ENTER', () => this.starte());
    this.input.gamepad?.on('down', () => this.starte());
  }

  starte() {
    if (this.gestartet) return;
    this.gestartet = true;
    tonStart();
    spiele('knopf');
    verstummen();
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Spielstaende'));
  }
}
