import Phaser from 'phaser';
import { TEXTE } from '../texte/de.js';
import { stil } from '../systeme/schrift.js';
import { knopf } from '../systeme/knopf.js';
import { sprich, verstummen } from '../systeme/stimme.js';
import { tonStart, spiele } from '../systeme/ton.js';
import { leererSpielstand, loescheSpielstand, speichereSpielstand } from '../systeme/speichern.js';
import { bergKulisse, dekoZwerg } from '../systeme/kulisse.js';
import { KAPITEL } from '../levels/index.js';

export class Titel extends Phaser.Scene {
  constructor() { super('Titel'); }

  create() {
    this.gestartet = false;
    bergKulisse(this);

    // Der Grosse Zwerg zwischen den kleinen Zwergen
    dekoZwerg(this, 200, 470, { vorlage: 'zwergin', haar: 'blond', kleid: 'gruen', kopf: 'gold' });
    dekoZwerg(this, 300, 480, { vorlage: 'kind', haar: 'rot', kleid: 'orange', kopf: 'gruen' });
    dekoZwerg(this, 660, 480, { vorlage: 'kind', haar: 'blond', kleid: 'blau', kopf: 'rosa' });
    dekoZwerg(this, 770, 470, { vorlage: 'zwerg', haar: 'grau', kleid: 'blau', kopf: 'stahl' });
    const held = this.add.image(480, 500, 'held_unten_0').setOrigin(0.5, 1).setScale(7);
    this.tweens.add({ targets: held, y: 494, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const titel = this.add.text(480, 70, TEXTE.titel, stil(76, '#f2c94c', { strokeThickness: 12 })).setOrigin(0.5);
    this.tweens.add({ targets: titel, scale: 1.04, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.add.text(480, 130, TEXTE.untertitel, stil(22, '#ffffff')).setOrigin(0.5);

    this.spielenKnopf = knopf(this, 480, 205, { text: TEXTE.spielen, breite: 280, hoehe: 86, groesse: 44, icon: 'herz', iconScale: 3 }, () => this.starte());
    this.tweens.add({ targets: this.spielenKnopf, scale: 1.06, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Kleiner Knopf für Eltern: Spielstand löschen
    this.add.text(950, 530, TEXTE.neu, stil(18, '#dddddd')).setOrigin(1, 1)
      .setInteractive({ useHandCursor: true }).on('pointerdown', () => this.frageNeu());

    // Tastatur / Controller
    this.input.keyboard.on('keydown-SPACE', () => this.starte());
    this.input.keyboard.on('keydown-ENTER', () => this.starte());
    this.input.gamepad?.on('down', () => this.starte());
  }

  frageNeu() {
    if (this.frage) return;
    const c = this.frage = this.add.container(480, 300);
    const g = this.add.graphics();
    g.fillStyle(0x1b1420, 0.92).fillRoundedRect(-260, -110, 520, 220, 20);
    g.lineStyle(4, 0xf2c94c).strokeRoundedRect(-260, -110, 520, 220, 20);
    c.add(g);
    c.add(this.add.text(0, -55, TEXTE.neuFrage, stil(30)).setOrigin(0.5));
    c.add(knopf(this, -110, 40, { text: TEXTE.ja, breite: 180, hoehe: 70, farbe: 0xb0413e }, () => {
      loescheSpielstand();
      const neu = leererSpielstand();
      speichereSpielstand(neu);
      this.registry.set('stand', neu);
      this.registry.set('traegt', null);
      c.destroy(); this.frage = null;
    }));
    c.add(knopf(this, 110, 40, { text: TEXTE.nein, breite: 180, hoehe: 70 }, () => { c.destroy(); this.frage = null; }));
  }

  starte() {
    if (this.gestartet || this.frage) return;
    this.gestartet = true;
    tonStart();
    spiele('fanfare');
    verstummen();
    const stand = this.registry.get('stand');
    const kapitel = KAPITEL[stand.kapitel] || KAPITEL[1];
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      if (!stand.introGesehen) {
        this.scene.start('Geschichte', { seiten: 'intro', weiter: { szene: 'Welt', daten: { karte: kapitel.start } } });
      } else {
        this.scene.start('Welt', { karte: kapitel.start });
      }
    });
  }
}
