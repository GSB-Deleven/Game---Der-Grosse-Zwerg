import Phaser from 'phaser';
import { mittig } from '../systeme/bildschirm.js';
import { stil } from '../systeme/schrift.js';
import { knopf } from '../systeme/knopf.js';
import { spiele } from '../systeme/ton.js';
import { spieleMusik, stoppeMusik } from '../systeme/musik.js';
import { sprich, verstummen } from '../systeme/stimme.js';
import { sichere } from '../systeme/speichern.js';
import { starteKapitel } from '../systeme/kapitel.js';
import { bergKulisse, dekoZwerg } from '../systeme/kulisse.js';
import { figurTexturen } from '../grafik/figur-texturen.js';

// DER ABSPANN: Feuerwerk, alle Figuren winken, und die Namen der Macher
export class Abspann extends Phaser.Scene {
  constructor() { super('Abspann'); }

  create() {
    mittig(this);
    this.knopfDa = false;
    const stand = this.registry.get('stand');
    stand.fertig = true;
    sichere(this.registry);
    this.cameras.main.fadeIn(1000);
    bergKulisse(this, { nacht: true });
    spieleMusik('fest');

    // Feuerwerk
    const farben = [0xf2c94c, 0xe05a8a, 0x7aa6e0, 0x6cc46a, 0xffffff, 0xf08a4b];
    this.time.addEvent({
      delay: 900, loop: true, callback: () => {
        const x = 120 + Math.random() * 720, y = 60 + Math.random() * 160, f = Phaser.Utils.Array.GetRandom(farben);
        for (let i = 0; i < 24; i++) {
          const w = (i / 24) * Math.PI * 2;
          const p = this.add.rectangle(x, y, 5, 5, f);
          this.tweens.add({ targets: p, x: x + Math.cos(w) * 80, y: y + Math.sin(w) * 80 + 30, alpha: 0, duration: 1200, ease: 'Quad.easeOut', onComplete: () => p.destroy() });
        }
        spiele('stern');
      },
    });

    // Parade: alle laufen winkend vorbei
    const parade = ['koenigin', 'mama', 'tilda', 'bruno', 'nella', 'schmied', 'oma', 'haendler', 'bauer', 'bibliothekar', 'pip', 'gaertnerin', 'fischerin', 'wanderer', 'mira', 'wache'];
    const drache = this.add.image(-200, 532, `${figurTexturen(this, 'drache', 'froh')}jubeln`).setOrigin(0.5, 58 / 60).setScale(4);
    const held = this.add.image(-80, 532, 'held_seite_lauf0').setOrigin(0.5, 46 / 48).setScale(3.4);
    const gruppe = [held, drache];
    parade.forEach((name, i) => gruppe.push(dekoZwerg(this, -300 - i * 90, 532, name, 3, i % 2 ? 'jubeln' : 'steh0')));
    let bild = 0;
    this.time.addEvent({ delay: 110, loop: true, callback: () => { bild = (bild + 1) % 6; held.setTexture(`held_seite_lauf${bild}`); } });
    gruppe.forEach((g) => this.tweens.add({ targets: g, y: g.y - 8, duration: 300, yoyo: true, repeat: -1, delay: Math.random() * 300 }));
    this.tweens.add({ targets: gruppe, x: '+=2600', duration: 42000 });

    // Abspann-Text
    const zeilen = [
      ['Der Grosse Zwerg', 60, '#f2c94c'],
      ['', 20],
      ['Eine Geschichte über Mut,', 30], ['Freundschaft und ein grosses Herz', 30],
      ['', 30],
      ['Erzählt von Papa', 32, '#f2c94c'],
      ['Spielidee und Wünsche: Liv', 32, '#f2c94c'],
      [`Gespielt von: ${stand.name}`, 30, '#ffffff'],
      ['', 30],
      ['Glutherz, der Drache', 28], ['Königin Brunhild', 28], ['und alle Zwerge der Zwergenfeste', 28],
      ['', 30],
      [`Gesammelt: ${stand.herzen} Herzen und ${stand.sterne || 0} Sterne`, 26, '#f59ac0'],
      ['', 40],
      ['Wer weiss –', 32], ['vielleicht beschützen die zwei', 32], ['das Zwergenreich bis heute.', 32],
      ['', 50],
      ['Ende', 64, '#f2c94c'],
    ];
    const text = this.add.container(480, 420);
    const maskenForm = this.make.graphics({ add: false }).fillRect(-1200, -1200, 3360, 1620);
    text.setMask(maskenForm.createGeometryMask());
    let y = 0;
    for (const [z, g, f] of zeilen) {
      if (z) text.add(this.add.text(0, y, z, stil(g, f || '#ffffff', { align: 'center' })).setOrigin(0.5, 0));
      y += g + 14;
    }
    this.tweens.add({ targets: text, y: 200 - y, duration: 36000, ease: 'Linear', onComplete: () => this.zeigeKnopf() });
    this.time.delayedCall(1200, () => sprich('Der Grosse Zwerg. Eine Geschichte über Mut, Freundschaft und ein grosses Herz.'));

    knopf(this, 880, 30, { text: 'Weiter', breite: 140, hoehe: 44, groesse: 20, farbe: 0x5c5460 }, () => this.zeigeKnopf());
  }

  zeigeKnopf() {
    if (this.knopfDa) return;
    this.knopfDa = true;
    const k = knopf(this, 480, 300, { text: 'Weiter: Die Ehrengarde', breite: 440, hoehe: 76, groesse: 30, icon: 'herz', iconScale: 2.5 }, () => this.weiterZurGarde());
    const t = knopf(this, 480, 400, { text: 'Zum Titelbild', breite: 300, hoehe: 56, groesse: 24, farbe: 0x5c5460 }, () => {
      verstummen();
      stoppeMusik();
      this.scene.start('Titel');
    });
    [k, t].forEach((b) => { b.setScale(0); this.tweens.add({ targets: b, scale: 1, duration: 400, ease: 'Back.easeOut' }); });
  }

  // Nach dem Happy End geht es weiter: Missionen der Ehrengarde
  weiterZurGarde() {
    verstummen();
    stoppeMusik();
    starteKapitel(this);
  }
}
