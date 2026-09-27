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
  kapitel2: [
    (s) => {
      s.add.image(700, 405, 'obj_schloss').setOrigin(0.5, 1).setScale(2.6);
      const h = s.add.image(300, 402, 'held_seite_lauf0').setOrigin(0.5, 46 / 48).setScale(5);
      let i = 0;
      s.time.addEvent({ delay: 110, loop: true, callback: () => { i = (i + 1) % 6; h.setTexture(`held_seite_lauf${i}`); } });
      s.tweens.add({ targets: h, x: 420, duration: 4000 });
    },
    (s) => {
      s.add.image(480, 405, 'obj_schloss').setOrigin(0.5, 1).setScale(2.2).setAlpha(0.5);
      s.add.image(380, 402, 'held_seite_steh0').setOrigin(0.5, 46 / 48).setScale(6);
      dekoZwerg(s, 580, 400, 'koenigin', 6, 'reden');
    },
  ],
  kapitel3: [
    (s) => {
      s.add.image(480, 402, 'held_unten_jubeln').setOrigin(0.5, 46 / 48).setScale(6);
      ['stein', 'brett', 'seil', 'beeren', 'fackel'].forEach((g, i) => {
        const b = s.add.image(250 + i * 115, 190, g).setScale(0);
        s.tweens.add({ targets: b, scale: 3.5, delay: 200 + i * 250, duration: 400, ease: 'Back.easeOut' });
      });
    },
    (s) => {
      s.add.image(200, 400, 'obj_laubbaum').setOrigin(0.5, 1).setScale(4);
      s.add.image(760, 400, 'obj_tanne').setOrigin(0.5, 1).setScale(4);
      s.add.image(480, 402, 'held_seite_steh0').setOrigin(0.5, 46 / 48).setScale(6);
      s.add.image(620, 390, 'obj_trittstein').setScale(4);
    },
  ],
  kapitel4: [
    (s) => {
      s.add.image(480, 330, 'obj_hoehleneingang').setOrigin(0.5, 1).setScale(4);
      s.add.image(480, 402, 'held_oben_steh0').setOrigin(0.5, 46 / 48).setScale(5.5);
    },
    (s) => {
      s.add.rectangle(480, 250, 960, 500, 0x05030a, 0.85);
      const schein = s.add.image(420, 300, 'schein').setScale(5).setBlendMode(Phaser.BlendModes.ADD);
      s.tweens.add({ targets: schein, alpha: 0.6, duration: 300, yoyo: true, repeat: -1 });
      s.add.image(420, 402, 'held_seite_tragen_steh0').setOrigin(0.5, 46 / 48).setScale(5.5);
      s.add.image(420, 402 - 48 * 5.5 + 10, 'fackel').setScale(4);
      const augen = s.add.image(700, 200, 'drachenaugen').setScale(5).setAlpha(0);
      s.tweens.add({ targets: augen, alpha: 1, delay: 2500, duration: 1500 });
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
    stand.geschichten = stand.geschichten || [];
    if (!stand.geschichten.includes(this.name)) stand.geschichten.push(this.name);
    if (this.name === 'intro') stand.introGesehen = true;
    sichere(this.registry);
    this.cameras.main.fadeOut(400);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(this.weiter.szene, this.weiter.daten));
  }
}
