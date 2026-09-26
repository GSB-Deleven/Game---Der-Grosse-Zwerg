import Phaser from 'phaser';
import { TEXTE } from '../texte/de.js';
import { stil } from '../systeme/schrift.js';
import { knopf } from '../systeme/knopf.js';
import { sprich, verstummen } from '../systeme/stimme.js';
import { sichere } from '../systeme/speichern.js';
import { bergKulisse, dekoZwerg } from '../systeme/kulisse.js';

// Bilder zu den Geschichten-Seiten. Jede Funktion malt ein Bild in den Rahmen.
const BILDER = {
  intro: [
    (s) => { // Der Grosse Zwerg zwischen den kleinen
      dekoZwerg(s, 320, 400, 'haendler', 5);
      dekoZwerg(s, 395, 400, 'mama', 5);
      s.add.image(480, 402, 'held_unten_steh0').setOrigin(0.5, 46 / 48).setScale(6);
      dekoZwerg(s, 565, 400, 'tilda', 5);
      dekoZwerg(s, 640, 400, 'schmied', 5);
    },
    (s) => { // Die frechen Zwergenkinder lachen
      s.add.image(400, 402, 'held_seite_steh0').setOrigin(0.5, 46 / 48).setScale(6);
      const k1 = dekoZwerg(s, 545, 400, 'bruno', 5.5, 'links_reden');
      const k2 = dekoZwerg(s, 630, 400, 'tilda', 5.5, 'links_reden');
      s.tweens.add({ targets: [k1, k2], y: 385, duration: 250, yoyo: true, repeat: -1 });
      s.add.text(580, 250, 'Hihi!', stil(34, '#ffffff')).setOrigin(0.5).setAngle(-8);
    },
    (s) => { // Das grosse Herz
      s.add.image(480, 402, 'held_unten_jubeln').setOrigin(0.5, 46 / 48).setScale(6);
      const h = s.add.image(480, 170, 'herz').setScale(5);
      s.tweens.add({ targets: h, scale: 6, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      s.add.image(360, 390, 'buch').setScale(3);
      s.add.image(600, 390, 'wasser').setScale(3);
      s.add.image(330, 260, 'frucht').setScale(3);
      s.add.image(630, 260, 'essen').setScale(3);
    },
    (s) => { // Wünsche als Bild über dem Kopf
      dekoZwerg(s, 540, 400, 'mama', 6);
      const blase = s.add.container(540, 150);
      blase.add(s.add.image(0, 0, 'blase').setScale(4));
      blase.add(s.add.image(0, -10, 'essen').setScale(3));
      s.tweens.add({ targets: blase, y: 140, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      s.add.image(380, 402, 'held_seite_steh0').setOrigin(0.5, 46 / 48).setScale(6);
    },
  ],
};

export class Geschichte extends Phaser.Scene {
  constructor() { super('Geschichte'); }

  init(daten) {
    this.name = daten.seiten || 'intro';
    this.texte = TEXTE[this.name];
    this.bilder = BILDER[this.name] || [];
    this.weiter = daten.weiter;
    this.seite = -1;
  }

  create() {
    this.cameras.main.fadeIn(400);
    bergKulisse(this);
    this.inhalt = this.add.container(0, 0);

    const panel = this.add.graphics();
    panel.fillStyle(0x1b1420, 0.88).fillRoundedRect(40, 420, 880, 108, 18);
    panel.lineStyle(4, 0xf2c94c).strokeRoundedRect(40, 420, 880, 108, 18);
    this.text = this.add.text(480, 474, '', stil(26, '#ffffff', { align: 'center', wordWrap: { width: 820 } })).setOrigin(0.5);

    knopf(this, 870, 40, { text: 'Weiter', breite: 150, hoehe: 56, groesse: 26 }, () => this.naechste());
    this.input.on('pointerdown', (p, ziele) => { if (!ziele.length) this.naechste(); });
    this.input.keyboard.on('keydown-SPACE', () => this.naechste());
    this.input.keyboard.on('keydown-ENTER', () => this.naechste());
    this.input.gamepad?.on('down', () => this.naechste());

    this.naechste();
  }

  naechste() {
    const jetzt = this.time.now;
    if (this.letzterKlick && jetzt - this.letzterKlick < 400) return;
    this.letzterKlick = jetzt;
    this.seite++;
    this.zeitgeber?.remove();
    if (this.seite >= this.texte.length) return this.fertig();

    this.inhalt.removeAll(true);
    const vorher = new Set(this.children.list);
    this.bilder[this.seite]?.(this);
    // Alles, was das Bild neu gemalt hat, in den Inhalts-Container packen
    this.children.list.filter((o) => !vorher.has(o) && o !== this.inhalt).forEach((o) => this.inhalt.add(o));
    this.children.bringToTop(this.text);

    const text = this.texte[this.seite];
    this.text.setText(text);
    const seite = this.seite;
    sprich(text, { hoehe: 1, tempo: 0.9 }).then(() => {
      if (this.seite === seite && this.scene.isActive()) this.zeitgeber = this.time.delayedCall(1200, () => this.naechste());
    });
  }

  fertig() {
    if (this.beendet) return;
    this.beendet = true;
    verstummen();
    const stand = this.registry.get('stand');
    if (this.name === 'intro') { stand.introGesehen = true; sichere(this.registry); }
    this.cameras.main.fadeOut(400);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(this.weiter.szene, this.weiter.daten));
  }
}
