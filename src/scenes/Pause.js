import Phaser from 'phaser';
import { stil } from '../systeme/schrift.js';
import { knopf } from '../systeme/knopf.js';
import { sichere, ladeEinstellungen, speichereEinstellungen } from '../systeme/speichern.js';
import { setzeMusikLautstaerke, stoppeMusik } from '../systeme/musik.js';
import { setzeTonLautstaerke, spiele } from '../systeme/ton.js';
import { verstummen } from '../systeme/stimme.js';
import { vollbildUmschalten, istVollbild } from '../systeme/vollbild.js';

const STUFEN = [{ name: 'Aus', wert: 0 }, { name: 'Leise', wert: 0.3 }, { name: 'Mittel', wert: 0.6 }, { name: 'Laut', wert: 1 }];
const TOUCH = [{ name: 'Automatisch', wert: 'auto' }, { name: 'Immer', wert: 'an' }, { name: 'Nie', wert: 'aus' }];
const TEXT = [{ name: 'Langsam', wert: 1.5 }, { name: 'Normal', wert: 1 }, { name: 'Schnell', wert: 0.6 }];

const BELEGUNG = [
  ['Laufen', 'Pfeiltasten / W A S D', 'Stick / Steuerkreuz', 'Steuerkreuz oder hintippen'],
  ['Helfen / Reden', 'Leertaste / Enter / E', 'A (oder B, X, Y)', 'Herz-Knopf'],
  ['Menü', 'Esc / P', 'Start', 'Pause-Knopf ⏸'],
  ['Vollbild', 'F', 'im Menü', 'im Menü'],
  ['Im Menü wählen', 'Pfeiltasten + Enter', 'Steuerkreuz + A', 'antippen'],
];

// Das Menü (Esc): Spiel · Einstellungen · Steuerung
export class Pause extends Phaser.Scene {
  constructor() { super('Pause'); }

  init(daten) {
    this.von = daten?.von || 'Welt';
    this.imSpiel = this.von === 'Welt';
    this.reiter = 0;
  }

  create() {
    this.add.rectangle(480, 270, 960, 540, 0x0d0a14, 0.78).setInteractive();
    const g = this.add.graphics();
    g.fillStyle(0x2a2236, 0.98).fillRoundedRect(150, 30, 660, 480, 24);
    g.lineStyle(6, 0xf2c94c).strokeRoundedRect(150, 30, 660, 480, 24);
    this.add.text(480, 72, 'Menü', stil(46, '#f2c94c', { strokeThickness: 8 })).setOrigin(0.5);

    this.reiterKnoepfe = ['Spiel', 'Einstellungen', 'Steuerung'].map((name, i) =>
      knopf(this, 300 + i * 180, 130, { text: name, breite: 170, hoehe: 48, groesse: 22, farbe: 0x5c5460 }, () => this.zeigeReiter(i)));
    this.inhalt = this.add.container(0, 0);
    this.zeigeReiter(0);

    this.input.keyboard.on('keydown-ESC', () => this.weiter());
    this.input.keyboard.on('keydown-P', () => this.weiter());
    this.input.keyboard.on('keydown-UP', () => this.fokus(-1));
    this.input.keyboard.on('keydown-DOWN', () => this.fokus(1));
    this.input.keyboard.on('keydown-LEFT', () => this.zeigeReiter((this.reiter + 2) % 3));
    this.input.keyboard.on('keydown-RIGHT', () => this.zeigeReiter((this.reiter + 1) % 3));
    this.input.keyboard.on('keydown-ENTER', () => this.druecke());
    this.input.keyboard.on('keydown-SPACE', () => this.druecke());
    this.input.gamepad?.on('down', (pad, k) => {
      if (k.index === 9 || k.index === 1) this.weiter();
      else if (k.index === 0) this.druecke();
      else if (k.index === 12) this.fokus(-1);
      else if (k.index === 13) this.fokus(1);
      else if (k.index === 14) this.zeigeReiter((this.reiter + 2) % 3);
      else if (k.index === 15) this.zeigeReiter((this.reiter + 1) % 3);
    });
  }

  zeigeReiter(i) {
    this.reiter = i;
    spiele('knopf');
    this.reiterKnoepfe.forEach((k, j) => k.setAlpha(j === i ? 1 : 0.55));
    this.inhalt.removeAll(true);
    this.auswahl = [];
    this.fokusIndex = 0;
    if (i === 0) this.reiterSpiel();
    else if (i === 1) this.reiterEinstellungen();
    else this.reiterSteuerung();
    this.fokus(0);
  }

  eintrag(k, aktion) {
    this.inhalt.add(k);
    this.auswahl.push({ k, aktion });
    return k;
  }

  fokus(d) {
    if (!this.auswahl?.length) return;
    this.fokusIndex = (this.fokusIndex + d + this.auswahl.length) % this.auswahl.length;
    this.auswahl.forEach(({ k }, i) => k.setScale(i === this.fokusIndex ? 1.06 : 1));
    this.rahmen?.destroy();
    const k = this.auswahl[this.fokusIndex].k;
    this.rahmen = this.add.rectangle(k.x, k.y, k.width + 16, k.height + 14).setStrokeStyle(4, 0xffffff).setFillStyle();
    this.inhalt.add(this.rahmen);
  }

  druecke() {
    const e = this.auswahl?.[this.fokusIndex];
    if (e) { spiele('knopf'); e.aktion(); }
  }

  reiterSpiel() {
    const stand = this.registry.get('stand');
    if (this.imSpiel && stand) this.inhalt.add(this.add.text(480, 185, `${stand.name} · Kapitel ${stand.kapitel} · ${stand.herzen} Herzen`, stil(22, '#cccccc')).setOrigin(0.5));
    const weiter = () => this.weiter();
    this.eintrag(knopf(this, 480, 250, { text: 'Weiterspielen', breite: 340, hoehe: 64, groesse: 30, icon: 'herz', iconScale: 2.5 }, weiter), weiter);
    if (this.imSpiel) {
      const speichern = () => {
        const ok = sichere(this.registry);
        this.meldung.setText(ok ? 'Gespeichert!' : 'Speichern ging leider nicht').setAlpha(1);
        this.tweens.add({ targets: this.meldung, alpha: 0, delay: 1400, duration: 400 });
      };
      this.eintrag(knopf(this, 480, 330, { text: 'Speichern', breite: 340, hoehe: 60, groesse: 28, farbe: 0x3f6fb5 }, speichern), speichern);
      this.meldung = this.add.text(480, 372, '', stil(20, '#8fd46c')).setOrigin(0.5);
      this.inhalt.add(this.meldung);
      const titel = () => {
        sichere(this.registry);
        verstummen();
        stoppeMusik();
        ['Oberflaeche', 'Welt', 'Splash', 'Entscheidung'].forEach((s) => this.scene.stop(s));
        this.scene.start('Titel');
      };
      this.eintrag(knopf(this, 480, 420, { text: 'Zum Titelbild', breite: 340, hoehe: 56, groesse: 24, farbe: 0x8a2a3c }, titel), titel);
    }
  }

  reiterEinstellungen() {
    const einst = ladeEinstellungen();
    const naechste = (liste, wert) => {
      const i = liste.reduce((b, s, j) => (Math.abs((typeof s.wert === 'number' ? s.wert : 0) - (typeof wert === 'number' ? wert : 0)) < 1e-6 || s.wert === wert ? j : b), 0);
      return (i + 1) % liste.length;
    };
    const name = (liste, wert) => (liste.find((s) => s.wert === wert) || liste.reduce((b, s) => (Math.abs(s.wert - wert) < Math.abs(b.wert - wert) ? s : b))).name;
    const zeile = (y, beschriftung, wertText, aendern) => {
      this.inhalt.add(this.add.text(250, y, beschriftung, stil(26)).setOrigin(0, 0.5));
      const k = knopf(this, 620, y, { text: wertText(), breite: 230, hoehe: 50, groesse: 22, farbe: 0x5c5460 }, () => {});
      const aktion = () => { aendern(); speichereEinstellungen(einst); k.list.find((o) => o.type === 'Text').setText(wertText()); };
      k.removeAllListeners('pointerdown');
      k.on('pointerdown', () => { spiele('knopf'); aktion(); });
      this.eintrag(k, aktion);
    };
    zeile(200, 'Musik', () => name(STUFEN, einst.musik), () => { einst.musik = STUFEN[naechste(STUFEN, einst.musik)].wert; setzeMusikLautstaerke(einst.musik); });
    zeile(262, 'Töne', () => name(STUFEN, einst.toene ?? 1), () => { einst.toene = STUFEN[naechste(STUFEN, einst.toene ?? 1)].wert; setzeTonLautstaerke(einst.toene); spiele('herz'); });
    zeile(324, 'Text-Tempo', () => name(TEXT, einst.textTempo ?? 1), () => { einst.textTempo = TEXT[naechste(TEXT, einst.textTempo ?? 1)].wert; this.game.events.emit('einstellungen', einst); });
    zeile(386, 'Touch-Knöpfe', () => name(TOUCH, einst.touch || 'auto'), () => { einst.touch = TOUCH[naechste(TOUCH, einst.touch || 'auto')].wert; this.game.events.emit('einstellungen', einst); });
    zeile(448, 'Vollbild (F)', () => (istVollbild(this) ? 'An' : 'Aus'), () => { vollbildUmschalten(this.game); });
  }

  reiterSteuerung() {
    const x = [175, 330, 510, 660];
    const kopf = ['', 'Tastatur', 'Controller', 'Tablet / Handy'];
    kopf.forEach((t, i) => this.inhalt.add(this.add.text(x[i], 185, t, stil(20, '#f2c94c'))));
    BELEGUNG.forEach((zeile, j) => {
      zeile.forEach((t, i) => this.inhalt.add(this.add.text(x[i], 225 + j * 52, t, stil(i === 0 ? 20 : 17, i === 0 ? '#ffffff' : '#dddddd', { wordWrap: { width: i === 3 ? 140 : 160 } }))));
    });
    this.inhalt.add(this.add.text(480, 490, 'Tipp: Einfach auf eine Figur tippen – der Zwerg läuft hin und hilft.', stil(17, '#8fd46c')).setOrigin(0.5));
  }

  weiter() {
    if (this.scene.isPaused(this.von)) this.scene.resume(this.von);
    this.scene.stop();
  }
}
