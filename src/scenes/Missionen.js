import Phaser from 'phaser';
import { mittig } from '../systeme/bildschirm.js';
import { stil } from '../systeme/schrift.js';
import { spiele } from '../systeme/ton.js';
import { sprich, verstummen } from '../systeme/stimme.js';
import { MISSIONEN, belohnungVon } from '../levels/missionen.js';
import { starteMission } from '../systeme/missionen.js';

// DAS MISSIONSBRETT: Karten mit Bildern. Einmal antippen = vorlesen, nochmals antippen (oder «Los!») = starten.
export class Missionen extends Phaser.Scene {
  constructor() { super('Missionen'); }

  create() {
    mittig(this, 720);
    const stand = this.registry.get('stand');
    const erledigt = stand.missionen || [];
    this.gewaehlt = -1;
    this.startet = false;
    this.losKnopf = null;

    // Klick neben das Brett schliesst es wieder
    const fenster = new Phaser.Geom.Rectangle(130, 40, 700, 460);
    this.add.rectangle(480, 270, 4000, 3000, 0x0d0a14, 0.75).setInteractive()
      .on('pointerdown', (p) => { if (!fenster.contains(p.worldX, p.worldY)) this.schliessen(); });
    const g = this.add.graphics();
    g.fillStyle(0x6a3a1e, 1).fillRoundedRect(130, 40, 700, 460, 20);
    g.lineStyle(6, 0xf2c94c).strokeRoundedRect(130, 40, 700, 460, 20);
    this.add.text(480, 80, 'Missionen der Garde', stil(36, '#f2c94c', { strokeThickness: 8 })).setOrigin(0.5);

    // eine Karte pro Mission, dazu eine «Bald mehr»-Karte
    const eintraege = [...MISSIONEN, null];
    const breite = 200, abstand = 220;
    const x0 = 480 - ((eintraege.length - 1) * abstand) / 2;
    this.karten = eintraege.map((m, i) => this.karte(x0 + i * abstand, 270, breite, m, m && erledigt.includes(m.id)));

    this.input.keyboard.on('keydown-ESC', () => this.schliessen());
    this.input.keyboard.on('keydown-LEFT', () => this.waehle(Math.max(0, this.gewaehlt - 1)));
    this.input.keyboard.on('keydown-RIGHT', () => this.waehle(Math.min(MISSIONEN.length - 1, this.gewaehlt + 1)));
    this.input.keyboard.on('keydown-ENTER', () => this.los());
    this.input.keyboard.on('keydown-SPACE', () => this.los());
    this.input.gamepad?.on('down', (pad, k) => {
      if (k.index === 1 || k.index === 9) this.schliessen();
      else if (k.index === 0) this.los();
      else if (k.index === 14) this.waehle(Math.max(0, this.gewaehlt - 1));
      else if (k.index === 15) this.waehle(Math.min(MISSIONEN.length - 1, this.gewaehlt + 1));
    });

    const offen = MISSIONEN.findIndex((m) => !erledigt.includes(m.id));
    sprich(offen >= 0 ? 'Welche Mission machen wir? Tipp auf ein Bild!' : 'Alle Missionen geschafft! Du kannst sie nochmals spielen. Bald gibt es neue.', { hoehe: 0.75 });
  }

  karte(x, y, breite, m, fertig) {
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    const hoehe = 300;
    const male = (aktiv) => {
      g.clear();
      g.fillStyle(0x1b1420, 0.5).fillRoundedRect(-breite / 2 + 4, -hoehe / 2 + 6, breite, hoehe, 14);
      g.fillStyle(m ? 0xf4ead0 : 0xb8a888, 1).fillRoundedRect(-breite / 2, -hoehe / 2, breite, hoehe, 14);
      g.lineStyle(aktiv ? 7 : 4, aktiv ? 0xffffff : 0x9a6d1c).strokeRoundedRect(-breite / 2, -hoehe / 2, breite, hoehe, 14);
    };
    male(false);
    c.add(g);
    if (!m) {
      c.add(this.add.text(0, -40, '?', stil(80, '#6a5a40')).setOrigin(0.5));
      c.add(this.add.text(0, 70, 'Bald gibt es\nneue Missionen!', stil(20, '#4a3a28', { align: 'center', strokeThickness: 0 })).setOrigin(0.5));
      return { c, male };
    }
    const bild = this.add.image(0, -70, m.bild).setScale(5);
    c.add(bild);
    this.tweens.add({ targets: bild, y: -76, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    c.add(this.add.text(0, 10, m.titel, stil(22, '#3a2a18', { align: 'center', strokeThickness: 0, wordWrap: { width: breite - 20 } })).setOrigin(0.5));
    const b = belohnungVon(m);
    c.add(this.add.text(0, 52, 'Belohnung:', stil(15, '#6a5a40', { strokeThickness: 0 })).setOrigin(0.5));
    c.add(this.add.image(0, 100, b.bild).setScale(b.bild.startsWith('obj_') ? 1.2 : 1.5).setOrigin(0.5, 0.5));
    if (fertig) {
      const haken = this.add.circle(breite / 2 - 18, -hoehe / 2 + 18, 18, 0x3f8a44).setStrokeStyle(3, 0xffffff);
      c.add(haken);
      c.add(this.add.text(breite / 2 - 18, -hoehe / 2 + 18, '✓', stil(24)).setOrigin(0.5));
    }
    c.setSize(breite, hoehe).setInteractive({ useHandCursor: true });
    const i = MISSIONEN.indexOf(m);
    c.on('pointerdown', () => (this.gewaehlt === i ? this.los() : this.waehle(i)));
    return { c, male, m };
  }

  waehle(i) {
    if (i < 0 || i === this.gewaehlt) return;
    this.gewaehlt = i;
    spiele('knopf');
    this.karten.forEach((k, j) => { k.male(j === i); k.c.setScale(j === i ? 1.05 : 1); });
    const m = MISSIONEN[i];
    this.losKnopf?.destroy();
    this.losKnopf = this.add.container(this.karten[i].c.x, 455);
    const g = this.add.graphics().fillStyle(0x3f8a44).fillRoundedRect(-70, -24, 140, 48, 14).lineStyle(4, 0xf2c94c).strokeRoundedRect(-70, -24, 140, 48, 14);
    this.losKnopf.add([g, this.add.text(0, 0, 'Los!', stil(28)).setOrigin(0.5)]);
    this.losKnopf.setSize(140, 48).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.los());
    this.tweens.add({ targets: this.losKnopf, scale: 1.08, duration: 400, yoyo: true, repeat: -1 });
    verstummen();
    sprich(`${m.titel}. ${m.text}`, { hoehe: 0.75 });
  }

  los() {
    if (this.gewaehlt < 0) { this.waehle(0); return; }
    if (this.startet) return;
    this.startet = true;
    spiele('tuer');
    const id = MISSIONEN[this.gewaehlt].id;
    this.cameras.main.fadeOut(400);
    this.cameras.main.once('camerafadeoutcomplete', () => starteMission(this, id));
  }

  schliessen() {
    if (this.startet) return;
    verstummen();
    this.scene.resume('Welt');
    this.scene.stop();
  }
}
