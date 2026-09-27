import Phaser from 'phaser';
import { stil } from '../systeme/schrift.js';
import { knopf } from '../systeme/knopf.js';
import { spiele } from '../systeme/ton.js';
import { bergKulisse } from '../systeme/kulisse.js';
import {
  ANZAHL_PLAETZE, PLATZ_BILDER, allePlaetze, leererSpielstand, loeschePlatz, speicherePlatz, spielzeitText,
} from '../systeme/speichern.js';
import { KAPITEL } from '../levels/index.js';
import { starteKapitel } from '../systeme/kapitel.js';
import { figurTexturen } from '../grafik/figur-texturen.js';
import { stoppeMusik } from '../systeme/musik.js';

// Bild-Texturen für die Speicherplätze
function platzTextur(scene, bild) {
  if (bild === 'zwergin') return `${figurTexturen(scene, 'mama')}steh0`;
  if (bild === 'kind') return `${figurTexturen(scene, 'bruno')}steh0`;
  if (bild === 'held') return 'held_unten_steh0';
  return bild;
}

export class Spielstaende extends Phaser.Scene {
  constructor() { super('Spielstaende'); }

  create() {
    this.cameras.main.fadeIn(300);
    bergKulisse(this);
    this.add.rectangle(480, 270, 960, 540, 0x1b1420, 0.35);
    this.add.text(480, 50, 'Wer spielt?', stil(52, '#f2c94c', { strokeThickness: 9 })).setOrigin(0.5);
    this.karten = this.add.container(0, 0);
    this.zeigePlaetze();

    knopf(this, 90, 505, { text: 'Zurück', breite: 150, hoehe: 54, groesse: 24, farbe: 0x5c5460 }, () => this.scene.start('Titel'));
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('Titel'));
  }

  zeigePlaetze() {
    this.karten.removeAll(true);
    const plaetze = allePlaetze();
    for (let i = 0; i < ANZAHL_PLAETZE; i++) this.karten.add(this.karte(i, plaetze[i], 170 + i * 310, 285));
  }

  karte(nummer, stand, x, y) {
    const c = this.add.container(x, y);
    const b = 270, h = 330;
    const g = this.add.graphics();
    const male = (hell) => {
      g.clear();
      g.fillStyle(0x1b1420, 0.5).fillRoundedRect(-b / 2 + 6, -h / 2 + 8, b, h, 20);
      g.fillStyle(hell ? 0x3a3048 : 0x2a2236, 0.95).fillRoundedRect(-b / 2, -h / 2, b, h, 20);
      g.lineStyle(5, stand ? 0xf2c94c : 0x8a8296).strokeRoundedRect(-b / 2, -h / 2, b, h, 20);
    };
    male(false);
    c.add(g);
    c.add(this.add.text(-b / 2 + 18, -h / 2 + 12, `${nummer + 1}`, stil(26, '#8a8296')));

    if (stand) {
      const bild = this.add.image(0, -50, platzTextur(this, stand.bild));
      bild.setScale(Math.min(5, 150 / bild.height));
      this.tweens.add({ targets: bild, y: bild.y - 5, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      c.add(bild);
      c.add(this.add.text(0, 30, stand.name, stil(34, '#ffffff')).setOrigin(0.5));
      if (stand.fertig) c.add(this.add.text(0, -150, '👑 Geschafft!', stil(22, '#f2c94c')).setOrigin(0.5));
      const kapitel = KAPITEL[stand.kapitel]?.name || `Kapitel ${stand.kapitel}`;
      c.add(this.add.text(0, 72, `Kapitel ${stand.kapitel}: ${kapitel}`, stil(18, '#f2c94c', { align: 'center', wordWrap: { width: 240 } })).setOrigin(0.5));
      c.add(this.add.image(-40, 112, 'herz').setScale(2));
      c.add(this.add.text(-18, 112, `${stand.herzen}`, stil(26)).setOrigin(0, 0.5));
      c.add(this.add.text(30, 112, spielzeitText(stand.spielzeit), stil(18, '#cccccc')).setOrigin(0, 0.5));

      // Löschen (klein, oben rechts)
      const weg = this.add.container(b / 2 - 26, -h / 2 + 26);
      const wg = this.add.graphics();
      wg.fillStyle(0xb0413e, 1).fillCircle(0, 0, 18);
      wg.lineStyle(4, 0xffffff).lineBetween(-7, -7, 7, 7).lineBetween(7, -7, -7, 7);
      weg.add(wg);
      weg.setSize(40, 40).setInteractive({ useHandCursor: true });
      weg.on('pointerdown', (p, lx, ly, ev) => { ev.stopPropagation(); spiele('knopf'); this.frageLoeschen(nummer, stand); });
      c.add(weg);
    } else {
      const plus = this.add.text(0, -30, '+', stil(110, '#8a8296')).setOrigin(0.5);
      c.add(plus);
      c.add(this.add.text(0, 70, 'Neues Spiel', stil(32, '#ffffff')).setOrigin(0.5));
    }

    c.setSize(b, h).setInteractive({ useHandCursor: true });
    c.on('pointerover', () => male(true));
    c.on('pointerout', () => male(false));
    c.on('pointerdown', () => {
      if (this.dialog) return;
      spiele('knopf');
      this.tweens.add({
        targets: c, scale: 0.95, duration: 80, yoyo: true,
        onComplete: () => (stand ? this.starte(nummer, stand) : this.neuesSpiel(nummer)),
      });
    });
    return c;
  }

  dialogRahmen(breite, hoehe) {
    const c = this.dialog = this.add.container(480, 280);
    c.add(this.add.rectangle(0, 0, 960, 540, 0x000000, 0.55).setInteractive());
    const g = this.add.graphics();
    g.fillStyle(0x2a2236, 0.98).fillRoundedRect(-breite / 2, -hoehe / 2, breite, hoehe, 20);
    g.lineStyle(5, 0xf2c94c).strokeRoundedRect(-breite / 2, -hoehe / 2, breite, hoehe, 20);
    c.add(g);
    return c;
  }

  schliesseDialog() {
    this.dialog?.destroy();
    this.dialog = null;
    this.namensFeld?.remove();
    this.namensFeld = null;
  }

  frageLoeschen(nummer, stand) {
    const c = this.dialogRahmen(560, 240);
    c.add(this.add.text(0, -60, `Spielstand «${stand.name}» löschen?`, stil(30, '#ffffff', { align: 'center', wordWrap: { width: 500 } })).setOrigin(0.5));
    c.add(knopf(this, -120, 50, { text: 'Löschen', breite: 200, hoehe: 70, farbe: 0xb0413e }, () => {
      loeschePlatz(nummer); this.schliesseDialog(); this.zeigePlaetze();
    }));
    c.add(knopf(this, 120, 50, { text: 'Behalten', breite: 200, hoehe: 70 }, () => this.schliesseDialog()));
  }

  neuesSpiel(nummer) {
    const c = this.dialogRahmen(760, 400);
    c.add(this.add.text(0, -160, 'Neues Spiel – wähle ein Bild', stil(32, '#f2c94c')).setOrigin(0.5));
    let gewaehlt = 'held';
    let name = PLATZ_BILDER[gewaehlt];
    const nameText = this.add.text(0, 60, name, stil(40)).setOrigin(0.5);
    const rahmen = [];
    Object.keys(PLATZ_BILDER).forEach((bild, i) => {
      const x = -275 + i * 110, y = -60;
      const r = this.add.rectangle(x, y, 96, 120, 0x1b1420, 0.8).setStrokeStyle(4, 0x5c5460);
      const img = this.add.image(x, y, platzTextur(this, bild));
      img.setScale(Math.min(4, 105 / img.height));
      r.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
        spiele('knopf');
        const alterName = PLATZ_BILDER[gewaehlt];
        gewaehlt = bild;
        if (name === alterName) { name = PLATZ_BILDER[bild]; nameText.setText(name); }
        rahmen.forEach((rr) => rr.setStrokeStyle(4, 0x5c5460));
        r.setStrokeStyle(5, 0xf2c94c);
      });
      if (bild === gewaehlt) r.setStrokeStyle(5, 0xf2c94c);
      rahmen.push(r);
      c.add([r, img]);
    });
    c.add(nameText);
    c.add(this.add.text(0, 100, '(Name ändern: auf den Namen tippen)', stil(16, '#aaaaaa')).setOrigin(0.5));
    nameText.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.namenEingeben(name, (neu) => {
      if (neu) { name = neu.slice(0, 14); nameText.setText(name); }
    }));
    c.add(knopf(this, -130, 160, { text: 'Abbrechen', breite: 220, hoehe: 64, groesse: 26, farbe: 0x5c5460 }, () => this.schliesseDialog()));
    c.add(knopf(this, 130, 160, { text: "Los geht's!", breite: 240, hoehe: 64, groesse: 28 }, () => {
      const stand = leererSpielstand(name, gewaehlt);
      speicherePlatz(nummer, stand);
      this.schliesseDialog();
      this.starte(nummer, stand);
    }));
  }

  // Für Eltern: Name über ein normales Eingabefeld eintippen
  namenEingeben(vorher, fertig) {
    if (this.namensFeld) return;
    const feld = document.createElement('input');
    feld.id = 'spielstand-name';
    feld.value = vorher;
    feld.maxLength = 14;
    Object.assign(feld.style, {
      position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 10,
      font: '28px "Pixelify Sans", sans-serif', padding: '10px 16px', borderRadius: '12px',
      border: '4px solid #f2c94c', background: '#1b1420', color: '#fff', width: '260px', textAlign: 'center',
    });
    document.body.appendChild(feld);
    feld.focus();
    feld.select();
    this.namensFeld = feld;
    const ende = () => {
      if (!this.namensFeld) return;
      const wert = feld.value.trim();
      feld.remove();
      this.namensFeld = null;
      fertig(wert);
    };
    feld.addEventListener('keydown', (e) => { if (e.key === 'Enter') ende(); });
    feld.addEventListener('blur', ende);
    this.events.once('shutdown', () => feld.remove());
  }

  starte(nummer, stand) {
    this.registry.set('platz', nummer);
    this.registry.set('stand', stand);
    this.registry.set('traegt', stand.traegt || null);
    spiele('fanfare');
    stoppeMusik();
    this.cameras.main.fadeOut(400);
    this.cameras.main.once('camerafadeoutcomplete', () => starteKapitel(this));
  }

}
