import Phaser from 'phaser';
import { mittig, beiGroesse, rand } from '../systeme/bildschirm.js';
import { stil, zahlStil } from '../systeme/schrift.js';
import { spiele } from '../systeme/ton.js';
import { spieleMusik } from '../systeme/musik.js';
import { sprich, verstummen } from '../systeme/stimme.js';
import { sichere, ladeEinstellungen } from '../systeme/speichern.js';
import { KAPITEL } from '../levels/index.js';

// DER FLUG: Der Grosse Zwerg reitet auf Glutherz zum Schloss.
// Hoch und runter steuern (antippen/ziehen, Pfeiltasten, Stick), Sterne sammeln. Nichts kann schiefgehen.

const ABSCHNITTE = [
  { name: 'wald', text: 'Über den dunklen Wald – von oben ist er gar nicht dunkel!', himmel: [0x5aa0e0, 0xbfe3f5] },
  { name: 'berge', text: 'Über die hohen Berge – einfach drüber gleiten!', himmel: [0x4a88d8, 0xd0e8f8] },
  { name: 'tal', text: 'Über das tiefe Tal – ganz ohne Brücke!', himmel: [0x6ab0e8, 0xf0d8b0] },
  { name: 'see', text: 'Über den grossen See – schau, wie er glitzert!', himmel: [0x7ab8f0, 0xf8c8a0] },
  { name: 'schloss', text: 'Da vorne ist das Schloss der Königin!', himmel: [0xe89a6a, 0xf8d8a0] },
];
const DAUER = 11000; // pro Abschnitt

// Landschaftsstreifen im Code malen (breit und kachelbar)
function maleStreifen(scene, key, b, h, malen) {
  if (scene.textures.exists(key)) return;
  const tex = scene.textures.createCanvas(key, b, h);
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;
  malen(ctx, b, h);
  tex.refresh();
}

function landschaften(scene) {
  const zufall = (s) => { let x = s; return () => { x = (x * 16807) % 2147483647; return x / 2147483647; }; };
  // ferne Berge
  maleStreifen(scene, 'flug_ferne', 480, 200, (c, b, h) => {
    const r = zufall(3);
    c.fillStyle = '#8a8cb8';
    for (let i = -1; i < 6; i++) {
      const x = i * 100 + r() * 30, hoch = 90 + r() * 80;
      c.beginPath(); c.moveTo(x - 90, h); c.lineTo(x, h - hoch); c.lineTo(x + 90, h); c.fill();
      c.fillStyle = '#f4f4fa';
      c.beginPath(); c.moveTo(x - 20, h - hoch + 22); c.lineTo(x, h - hoch); c.lineTo(x + 20, h - hoch + 22); c.fill();
      c.fillStyle = '#8a8cb8';
    }
  });
  const boden = {
    wald: (c, b, h) => {
      const r = zufall(7);
      c.fillStyle = '#2f6b34'; c.fillRect(0, 60, b, h);
      for (let i = 0; i < 70; i++) {
        const x = r() * b, y = 40 + r() * (h - 40), rad = 14 + r() * 16;
        c.fillStyle = ['#24532a', '#3f8a44', '#4f9a4a', '#2a6040'][Math.floor(r() * 4)];
        c.beginPath(); c.arc(x, y, rad, 0, Math.PI * 2); c.fill();
        c.fillStyle = 'rgba(140,210,110,0.5)';
        c.beginPath(); c.arc(x - rad * 0.3, y - rad * 0.3, rad * 0.35, 0, Math.PI * 2); c.fill();
      }
    },
    berge: (c, b, h) => {
      const r = zufall(11);
      c.fillStyle = '#6e6480'; c.fillRect(0, h - 30, b, 30);
      for (let i = -1; i < 7; i++) {
        const x = i * 80 + r() * 30, hoch = 120 + r() * 70;
        c.fillStyle = '#5e5870';
        c.beginPath(); c.moveTo(x - 70, h); c.lineTo(x, h - hoch); c.lineTo(x + 70, h); c.fill();
        c.fillStyle = '#7a7490';
        c.beginPath(); c.moveTo(x - 70, h); c.lineTo(x, h - hoch); c.lineTo(x - 10, h); c.fill();
        c.fillStyle = '#ffffff';
        c.beginPath(); c.moveTo(x - 18, h - hoch + 26); c.lineTo(x, h - hoch); c.lineTo(x + 18, h - hoch + 26); c.fill();
      }
    },
    tal: (c, b, h) => {
      c.fillStyle = '#5da048'; c.fillRect(0, 50, b, h);
      c.fillStyle = '#4b8a3c'; for (let x = 0; x < b; x += 24) c.fillRect(x, 50 + (x % 48 ? 10 : 30), 12, 8);
      c.fillStyle = '#3d74b8';
      c.beginPath(); c.moveTo(0, 150); c.bezierCurveTo(120, 110, 240, 190, 360, 140); c.bezierCurveTo(420, 120, 450, 150, 480, 150); c.lineTo(480, 175); c.bezierCurveTo(360, 170, 240, 215, 120, 140); c.lineTo(0, 175); c.fill();
      c.fillStyle = '#8fc4f0'; for (let x = 10; x < b; x += 40) c.fillRect(x, 150, 10, 2);
    },
    see: (c, b, h) => {
      c.fillStyle = '#3d74b8'; c.fillRect(0, 40, b, h);
      c.fillStyle = '#4f88c8'; for (let y = 50; y < h; y += 14) for (let x = (y % 28); x < b; x += 36) c.fillRect(x, y, 16, 3);
      c.fillStyle = '#d8f0ff'; for (let y = 60; y < h; y += 30) for (let x = (y * 7) % 60; x < b; x += 90) c.fillRect(x, y, 6, 2);
      c.fillStyle = '#5da048'; c.fillRect(0, 34, b, 10);
    },
    schloss: (c, b, h) => {
      c.fillStyle = '#5da048'; c.fillRect(0, 50, b, h);
      c.fillStyle = '#a8987e'; c.fillRect(0, 120, b, 30);
      c.fillStyle = '#4b8a3c'; for (let x = 0; x < b; x += 30) c.fillRect(x, 60 + (x % 60 ? 0 : 20), 14, 10);
    },
  };
  for (const [name, malen] of Object.entries(boden)) maleStreifen(scene, `flug_${name}`, 480, 220, malen);
}

export class Flug extends Phaser.Scene {
  constructor() { super('Flug'); }

  create() {
    mittig(this);
    this.stand = this.registry.get('stand');
    this.sterne = 0;
    this.abschnitt = -1;
    this.zeit = 0;
    this.ziel = 250;
    this.beendet = false;
    this.fertig = false;
    landschaften(this);

    this.himmel = this.add.graphics();
    this.sonne = this.add.circle(800, 90, 40, 0xfff4b0).setAlpha(0.9);
    this.ferne = this.add.tileSprite(480, 320, 3600, 200, 'flug_ferne').setTileScale(1, 1).setOrigin(0.5, 1);
    this.boeden = {};
    for (const a of ABSCHNITTE) {
      this.boeden[a.name] = this.add.tileSprite(480, 540, 3600, 220, `flug_${a.name}`).setOrigin(0.5, 1).setAlpha(0);
    }
    this.wolken = [];
    for (let i = 0; i < 6; i++) this.neueWolke(Math.random() * 960, i % 2 === 0);

    this.schloss = this.add.image(1300, 470, 'obj_schloss').setOrigin(0.5, 1).setScale(3).setVisible(false);

    // Glutherz mit dem Grossen Zwerg auf dem Rücken
    this.reiter = this.add.container(240, this.ziel);
    this.drache = this.add.image(0, 0, 'flugdrache1').setScale(2.4);
    this.held = this.add.image(-10, -8, 'held_seite_jubeln').setOrigin(0.5, 46 / 48).setScale(2.1);
    this.reiter.add([this.held, this.drache]);
    this.reiter.bringToTop(this.held);
    let fl = 0;
    this.time.addEvent({ delay: 170, loop: true, callback: () => { fl = (fl + 1) % 4; this.drache.setTexture(`flugdrache${[0, 1, 2, 1][fl]}`); } });

    this.sternGruppe = [];
    this.time.addEvent({ delay: 900, loop: true, callback: () => { if (!this.beendet && this.abschnitt < ABSCHNITTE.length - 1) this.neuerStern(); } });

    // Anzeige
    this.sternBild = this.add.image(40, 40, 'stern').setScale(3);
    this.sternText = this.add.text(70, 42, '0', zahlStil(26)).setOrigin(0, 0.5);
    // Auf breiten/hohen Bildschirmen: Boden an den unteren Rand, Sternzähler in die Ecke
    beiGroesse(this, () => {
      const r = rand(this);
      this.r = r;
      for (const t of Object.values(this.boeden)) t.y = 540 + r.y;
      this.sternBild.setPosition(40 - r.x, 40 - r.y);
      this.sternText.setPosition(70 - r.x, 42 - r.y);
    });
    this.bannerText = this.add.text(480, 100, '', stil(30, '#ffffff', { align: 'center', wordWrap: { width: 860 } })).setOrigin(0.5).setAlpha(0);
    this.zeigeAnleitung();

    this.tasten = this.input.keyboard.addKeys('UP,DOWN,W,S');
    this.input.on('pointerdown', (p) => { this.ziel = Phaser.Math.Clamp(p.worldY, 130, 420); this.gesteuert(); });
    this.input.on('pointermove', (p) => { if (p.isDown) { this.ziel = Phaser.Math.Clamp(p.worldY, 130, 420); this.gesteuert(); } });

    spieleMusik('flug');
    this.cameras.main.fadeIn(800);
    this.naechsterAbschnitt();
  }

  // Zu Beginn: Tafel «Sammle die Sterne!» und wie man Glutherz steuert (passend zum Gerät)
  zeigeAnleitung() {
    const einst = ladeEinstellungen();
    const touch = einst.touch === 'an' || (einst.touch !== 'aus' && this.sys.game.device.input.touch);
    const wie = touch ? 'Wisch nach oben oder unten!' : 'Drück ↑ oder ↓ (oder W und S)';
    this.steuerZaehler = 0;
    this.anleitungSeit = this.time.now;
    const tafel = this.add.container(610, 170).setDepth(20);
    const g = this.add.graphics();
    g.fillStyle(0x2a2236, 0.92).fillRoundedRect(-215, -62, 430, 124, 20);
    g.lineStyle(5, 0xf2c94c).strokeRoundedRect(-215, -62, 430, 124, 20);
    tafel.add(g);
    tafel.add(this.add.image(-180, -24, 'stern').setScale(2));
    tafel.add(this.add.image(180, -24, 'stern').setScale(2));
    tafel.add(this.add.text(0, -24, 'Sammle die Sterne!', stil(30, '#f2c94c', { strokeThickness: 7 })).setOrigin(0.5));
    tafel.add(this.add.text(0, 28, wie, stil(21, '#ffffff')).setOrigin(0.5));
    tafel.setScale(0.3).setAlpha(0);
    this.tweens.add({ targets: tafel, scale: 1, alpha: 1, duration: 450, ease: 'Back.easeOut' });
    this.anleitung = tafel;

    // Pfeile über und unter Glutherz, dazu ein «Finger», der hoch und runter wischt
    const pfeile = this.add.container(0, 0).setDepth(19);
    const oben = this.add.triangle(0, -95, 0, 22, 18, 0, 36, 22, 0xffffff).setStrokeStyle(4, 0x1b1420);
    const unten = this.add.triangle(0, 95, 0, 0, 18, 22, 36, 0, 0xffffff).setStrokeStyle(4, 0x1b1420);
    pfeile.add([oben, unten]);
    this.tweens.add({ targets: oben, y: -105, duration: 450, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: unten, y: 105, duration: 450, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    if (touch) {
      const finger = this.add.circle(0, 0, 13, 0xffffff, 0.85).setStrokeStyle(3, 0x1b1420);
      pfeile.add(finger);
      this.tweens.add({ targets: finger, y: { from: 55, to: -55 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    this.steuerPfeile = pfeile;
    sprich(`Sammle die Sterne! ${touch ? 'Wisch nach oben oder unten' : 'Drück die Pfeiltasten hoch oder runter'}, dann fliegt Glutherz hoch oder runter.`, { hoehe: 0.75 });
    // spätestens nach 12 Sekunden ausblenden
    this.time.delayedCall(12000, () => this.versteckeAnleitung());
  }

  // Jemand hat gesteuert: nach ein paar Mal (und kurzem Lesen) verschwindet die Anleitung
  gesteuert() {
    if (!this.anleitung) return;
    this.steuerZaehler++;
    if (this.steuerZaehler > 20 && this.time.now - this.anleitungSeit > 4000) this.versteckeAnleitung();
  }

  versteckeAnleitung() {
    if (!this.anleitung) return;
    const weg = [this.anleitung, this.steuerPfeile];
    this.anleitung = null;
    this.tweens.add({ targets: weg, alpha: 0, duration: 600, onComplete: () => weg.forEach((o) => o.destroy()) });
  }

  neueWolke(x, vorn) {
    const w = this.add.ellipse(x, 60 + Math.random() * 300, 120 + Math.random() * 120, 40 + Math.random() * 30, 0xffffff, vorn ? 0.55 : 0.8);
    if (vorn) w.setDepth(10);
    this.wolken.push({ w, v: vorn ? 260 : 90 });
  }

  neuerStern() {
    const s = this.add.image(1000 + (this.r?.x || 0), 140 + Math.random() * 270, 'stern').setScale(2.4).setDepth(5);
    this.tweens.add({ targets: s, angle: 360, duration: 2000, repeat: -1 });
    this.sternGruppe.push(s);
  }

  naechsterAbschnitt() {
    this.abschnitt++;
    const a = ABSCHNITTE[this.abschnitt];
    if (!a) return;
    for (const [name, t] of Object.entries(this.boeden)) this.tweens.add({ targets: t, alpha: name === a.name ? 1 : 0, duration: 1500 });
    const h = this.himmel;
    h.clear();
    h.fillGradientStyle(a.himmel[0], a.himmel[0], a.himmel[1], a.himmel[1], 1).fillRect(-1400, -1400, 3760, 3340);
    const banner = () => {
      this.bannerText.setText(a.text).setAlpha(0);
      this.tweens.add({ targets: this.bannerText, alpha: 1, duration: 500, hold: 3500, yoyo: true });
      sprich(a.text, { hoehe: 0.75 });
    };
    if (this.abschnitt === 0) this.time.delayedCall(6500, () => { if (!this.anleitung) banner(); });
    else banner();
    if (a.name === 'schloss') {
      this.schloss.setVisible(true).setX(1300 + (this.r?.x || 0));
      this.tweens.add({ targets: this.schloss, x: 700, duration: 5000, ease: 'Sine.easeOut' });
      this.time.delayedCall(5200, () => this.landen());
    } else {
      this.time.delayedCall(DAUER, () => this.naechsterAbschnitt());
    }
  }

  update(zeit, delta) {
    const dt = Math.min(delta, 50) / 1000;
    const tempo = this.beendet ? 60 : 180;
    if (!this.beendet) {
      if (this.tasten.UP.isDown || this.tasten.W.isDown) this.ziel = Math.max(130, this.ziel - 260 * dt);
      if (this.tasten.DOWN.isDown || this.tasten.S.isDown) this.ziel = Math.min(420, this.ziel + 260 * dt);
      const pad = this.input.gamepad?.pad1;
      if (pad && Math.abs(pad.leftStick.y) > 0.3) this.ziel = Phaser.Math.Clamp(this.ziel + pad.leftStick.y * 260 * dt, 130, 420);
      if (pad?.up) this.ziel = Math.max(130, this.ziel - 260 * dt);
      if (pad?.down) this.ziel = Math.min(420, this.ziel + 260 * dt);
    }
    if (this.anleitung && (this.tasten.UP.isDown || this.tasten.DOWN.isDown || this.tasten.W.isDown || this.tasten.S.isDown)) this.gesteuert();
    const alt = this.reiter.y;
    this.reiter.y += (this.ziel - this.reiter.y) * Math.min(1, dt * 3) + Math.sin(zeit / 400) * 0.3;
    this.reiter.setRotation(Phaser.Math.Clamp((this.reiter.y - alt) * 0.04, -0.25, 0.25));
    this.steuerPfeile?.setPosition(this.reiter.x + 10, this.reiter.y);

    this.ferne.tilePositionX += tempo * 0.15 * dt;
    for (const t of Object.values(this.boeden)) t.tilePositionX += tempo * dt;
    for (const w of this.wolken) {
      w.w.x -= w.v * dt * (tempo / 180);
      if (w.w.x < -150 - (this.r?.x || 0)) { w.w.x = 1100 + (this.r?.x || 0); w.w.y = 60 + Math.random() * 300; }
    }
    for (const s of [...this.sternGruppe]) {
      s.x -= tempo * 1.4 * dt;
      if (Phaser.Math.Distance.Between(s.x, s.y, this.reiter.x + 40, this.reiter.y - 10) < 70) this.sammle(s);
      else if (s.x < -30 - (this.r?.x || 0)) { s.destroy(); this.sternGruppe.splice(this.sternGruppe.indexOf(s), 1); }
    }
  }

  sammle(s) {
    this.sternGruppe.splice(this.sternGruppe.indexOf(s), 1);
    this.sterne++;
    this.sternText.setText(String(this.sterne));
    spiele('stern');
    this.tweens.add({ targets: s, x: this.sternBild.x, y: this.sternBild.y, scale: 1, duration: 400, onComplete: () => s.destroy() });
  }

  landen() {
    if (this.beendet) return;
    this.beendet = true;
    this.ziel = 400;
    this.tweens.add({ targets: this.reiter, x: 620, duration: 2500, ease: 'Sine.easeInOut' });
    this.time.delayedCall(2600, () => this.ende());
  }

  // Ende des Flugs: auf dem Marktplatz landen
  ende() {
    if (this.fertig) return;
    this.fertig = true;
    verstummen();
    this.stand.sterne = (this.stand.sterne || 0) + this.sterne;
    this.stand.ort = null;
    sichere(this.registry);
    spiele('splash');
    this.cameras.main.fadeOut(900, 255, 240, 200);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Welt', { karte: KAPITEL[5].start }));
  }
}
