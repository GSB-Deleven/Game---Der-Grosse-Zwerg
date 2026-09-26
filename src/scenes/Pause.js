import Phaser from 'phaser';
import { stil } from '../systeme/schrift.js';
import { knopf } from '../systeme/knopf.js';
import { sichere, ladeEinstellungen, speichereEinstellungen } from '../systeme/speichern.js';
import { setzeMusikLautstaerke, stoppeMusik } from '../systeme/musik.js';
import { setzeTonLautstaerke } from '../systeme/ton.js';
import { verstummen } from '../systeme/stimme.js';

const STUFEN = [{ name: 'Aus', wert: 0 }, { name: 'Leise', wert: 0.3 }, { name: 'Mittel', wert: 0.6 }, { name: 'Laut', wert: 1 }];

export class Pause extends Phaser.Scene {
  constructor() { super('Pause'); }

  create() {
    this.add.rectangle(480, 270, 960, 540, 0x0d0a14, 0.75).setInteractive();
    const g = this.add.graphics();
    g.fillStyle(0x2a2236, 0.98).fillRoundedRect(250, 40, 460, 460, 24);
    g.lineStyle(6, 0xf2c94c).strokeRoundedRect(250, 40, 460, 460, 24);
    this.add.text(480, 90, 'Pause', stil(52, '#f2c94c', { strokeThickness: 9 })).setOrigin(0.5);
    const stand = this.registry.get('stand');
    this.add.text(480, 140, `${stand.name} · ${stand.herzen} Herzen`, stil(22, '#cccccc')).setOrigin(0.5);

    knopf(this, 480, 205, { text: 'Weiterspielen', breite: 340, hoehe: 70, groesse: 32, icon: 'herz', iconScale: 2.5 }, () => this.weiter());
    const speichern = knopf(this, 480, 290, { text: 'Speichern', breite: 340, hoehe: 64, groesse: 30, farbe: 0x3f6fb5 }, () => {
      const ok = sichere(this.registry);
      this.meldung.setText(ok ? 'Gespeichert!' : 'Speichern ging leider nicht').setAlpha(1);
      this.tweens.add({ targets: this.meldung, alpha: 0, delay: 1400, duration: 400 });
    });
    this.meldung = this.add.text(480, 332, '', stil(20, '#8fd46c')).setOrigin(0.5);

    const einst = ladeEinstellungen();
    const stufeVon = (v) => STUFEN.reduce((b, s, i) => (Math.abs(s.wert - v) < Math.abs(STUFEN[b].wert - v) ? i : b), 0);
    let musik = stufeVon(einst.musik), ton = stufeVon(einst.toene ?? 1);
    const musikKnopf = knopf(this, 390, 375, { text: `Musik: ${STUFEN[musik].name}`, breite: 200, hoehe: 56, groesse: 22, farbe: 0x5c5460 }, () => {
      musik = (musik + 1) % STUFEN.length;
      einst.musik = STUFEN[musik].wert; speichereEinstellungen(einst); setzeMusikLautstaerke(einst.musik);
      musikKnopf.list.find((o) => o.type === 'Text').setText(`Musik: ${STUFEN[musik].name}`);
    });
    const tonKnopf = knopf(this, 570, 375, { text: `Töne: ${STUFEN[ton].name}`, breite: 200, hoehe: 56, groesse: 22, farbe: 0x5c5460 }, () => {
      ton = (ton + 1) % STUFEN.length;
      einst.toene = STUFEN[ton].wert; speichereEinstellungen(einst); setzeTonLautstaerke(einst.toene);
      tonKnopf.list.find((o) => o.type === 'Text').setText(`Töne: ${STUFEN[ton].name}`);
    });
    knopf(this, 480, 450, { text: 'Zum Titelbild', breite: 340, hoehe: 60, groesse: 26, farbe: 0x8a2a3c }, () => {
      sichere(this.registry);
      verstummen();
      stoppeMusik();
      this.scene.stop('Oberflaeche');
      this.scene.stop('Welt');
      this.scene.start('Titel');
    });
    void speichern;

    this.input.keyboard.on('keydown-ESC', () => this.weiter());
    this.input.keyboard.on('keydown-P', () => this.weiter());
    this.input.gamepad?.on('down', (pad, k) => { if (k.index === 9 || k.index === 1) this.weiter(); });
  }

  weiter() {
    this.scene.resume('Welt');
    this.scene.stop();
  }
}
