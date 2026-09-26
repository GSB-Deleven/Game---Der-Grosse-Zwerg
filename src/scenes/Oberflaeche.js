import Phaser from 'phaser';
import { stil } from '../systeme/schrift.js';
import { spiele } from '../systeme/ton.js';
import { verstummen } from '../systeme/stimme.js';

// Alles, was über der Spielwelt liegt: Herzen, Sprechtext, Touch-Knöpfe.
export class Oberflaeche extends Phaser.Scene {
  constructor() { super('Oberflaeche'); }

  create() {
    this.herzAnzahl = 0;
    this.steuerZonen = [];
    this.baueHerzen();
    this.baueSprechfeld();
    this.baueMenueKnopf();

    this.zeigeTouch = this.sys.game.device.input.touch;
    this.baueTouchSteuerung();
    if (!this.zeigeTouch) this.touchTeile.forEach((t) => t.setVisible(false));
    // Sobald jemand den Bildschirm berührt, erscheinen die Touch-Knöpfe
    this.input.on('pointerdown', (p) => {
      if (p.wasTouch && !this.zeigeTouch) { this.zeigeTouch = true; this.touchTeile.forEach((t) => t.setVisible(true)); }
    });

    this.registry.set('touchRichtung', { x: 0, y: 0 });
    this.registry.set('istSteuerung', (p) => this.steuerZonen.some((z) => z(p)));

    const ev = this.game.events;
    ev.on('herzen', this.setzeHerzen, this);
    ev.on('herzFliegt', this.herzFliegt, this);
    ev.on('sprechen', this.zeigeText, this);
    ev.on('traegt', this.zeigeGetragen, this);
    this.events.once('shutdown', () => {
      ev.off('herzen', this.setzeHerzen, this);
      ev.off('herzFliegt', this.herzFliegt, this);
      ev.off('sprechen', this.zeigeText, this);
      ev.off('traegt', this.zeigeGetragen, this);
      this.registry.set('istSteuerung', null);
      this.registry.set('touchRichtung', { x: 0, y: 0 });
    });
  }

  // ---- Herzen oben links ----------------------------------------------------
  baueHerzen() {
    const g = this.add.graphics();
    g.fillStyle(0x1b1420, 0.7).fillRoundedRect(12, 12, 150, 64, 16);
    this.herzBild = this.add.image(50, 44, 'herz').setScale(3);
    this.herzText = this.add.text(88, 44, '0', stil(40)).setOrigin(0, 0.5);
  }

  setzeHerzen(n) {
    this.herzAnzahl = n;
    this.herzText.setText(String(n));
  }

  herzFliegt({ x, y, herzen }) {
    const h = this.add.image(x, y, 'herz').setScale(3);
    this.tweens.add({
      targets: h, x: this.herzBild.x, y: this.herzBild.y, scale: 3, duration: 700, ease: 'Cubic.easeIn',
      onComplete: () => {
        h.destroy();
        this.setzeHerzen(herzen);
        this.tweens.add({ targets: this.herzBild, scale: 4.2, duration: 120, yoyo: true });
      },
    });
  }

  // ---- Sprechtext oben ------------------------------------------------------
  baueSprechfeld() {
    this.sprechfeld = this.add.container(560, 16).setVisible(false);
    this.sprechRahmen = this.add.graphics();
    this.sprechName = this.add.text(-340, 10, '', stil(20, '#f2c94c'));
    this.sprechText = this.add.text(-340, 36, '', stil(22, '#ffffff', { wordWrap: { width: 680 } }));
    this.sprechfeld.add([this.sprechRahmen, this.sprechName, this.sprechText]);
  }

  zeigeText({ name, text }) {
    this.sprechName.setText(name || '');
    this.sprechText.setText(text);
    const hoehe = 36 + this.sprechText.height + 12;
    this.sprechRahmen.clear()
      .fillStyle(0x1b1420, 0.88).fillRoundedRect(-360, 0, 720, hoehe, 16)
      .lineStyle(3, 0xf2c94c).strokeRoundedRect(-360, 0, 720, hoehe, 16);
    this.sprechfeld.setVisible(true).setAlpha(1);
    this.textZeit?.remove();
    this.tweens.killTweensOf(this.sprechfeld);
    this.textZeit = this.time.delayedCall(2500 + text.length * 70, () => {
      this.tweens.add({ targets: this.sprechfeld, alpha: 0, duration: 400, onComplete: () => this.sprechfeld.setVisible(false) });
    });
  }

  // ---- Menü-Knopf (zurück zum Titel) ---------------------------------------
  baueMenueKnopf() {
    const k = this.add.container(930, 40);
    const g = this.add.graphics();
    g.fillStyle(0x1b1420, 0.7).fillRoundedRect(-24, -24, 48, 48, 12);
    g.fillStyle(0xffffff, 1);
    g.fillRect(-12, -12, 7, 24); g.fillRect(4, -12, 7, 24); // Pause-Zeichen
    k.add(g);
    k.setSize(48, 48).setInteractive({ useHandCursor: true });
    k.on('pointerdown', () => {
      spiele('knopf');
      verstummen();
      this.scene.stop('Welt');
      this.scene.start('Titel');
    });
    this.steuerZonen.push((p) => Math.abs(p.x - 930) < 30 && Math.abs(p.y - 40) < 30);
  }

  // ---- Touch: Steuerkreuz links, Helfen-Knopf rechts ----------------------
  baueTouchSteuerung() {
    this.touchTeile = [];
    const kx = 130, ky = 420, kr = 95;

    const basis = this.add.graphics().setAlpha(0.55);
    basis.fillStyle(0x1b1420, 1).fillCircle(kx, ky, kr);
    basis.lineStyle(4, 0xffffff, 0.8).strokeCircle(kx, ky, kr);
    basis.fillStyle(0xffffff, 0.9);
    const d = kr - 22;
    basis.fillTriangle(kx, ky - d - 14, kx - 14, ky - d + 6, kx + 14, ky - d + 6);
    basis.fillTriangle(kx, ky + d + 14, kx - 14, ky + d - 6, kx + 14, ky + d - 6);
    basis.fillTriangle(kx - d - 14, ky, kx - d + 6, ky - 14, kx - d + 6, ky + 14);
    basis.fillTriangle(kx + d + 14, ky, kx + d - 6, ky - 14, kx + d - 6, ky + 14);
    const knauf = this.add.circle(kx, ky, 34, 0xf2c94c, 0.9).setStrokeStyle(4, 0x1b1420);
    this.touchTeile.push(basis, knauf);

    let zeigerId = null;
    const setze = (p) => {
      const dx = p.x - kx, dy = p.y - ky;
      const l = Math.hypot(dx, dy);
      const max = kr - 30;
      const k = l > max ? max / l : 1;
      knauf.setPosition(kx + dx * k, ky + dy * k);
      if (l < 12) { this.registry.set('touchRichtung', { x: 0, y: 0 }); return; }
      const staerke = Math.min(1, l / 40);
      this.registry.set('touchRichtung', { x: (dx / l) * staerke, y: (dy / l) * staerke });
    };
    const loslassen = () => {
      zeigerId = null;
      knauf.setPosition(kx, ky);
      this.registry.set('touchRichtung', { x: 0, y: 0 });
    };
    const imKreuz = (p) => this.zeigeTouch && Math.hypot(p.x - kx, p.y - ky) < kr + 30;
    this.steuerZonen.push(imKreuz);

    this.input.on('pointerdown', (p) => { if (imKreuz(p) && zeigerId === null) { zeigerId = p.id; setze(p); } });
    this.input.on('pointermove', (p) => { if (p.id === zeigerId) setze(p); });
    this.input.on('pointerup', (p) => { if (p.id === zeigerId) loslassen(); });
    this.input.on('pointerupoutside', (p) => { if (p.id === zeigerId) loslassen(); });

    // Grosser Helfen-Knopf
    const ax = 840, ay = 420, ar = 78;
    const aktion = this.add.container(ax, ay);
    const ag = this.add.graphics();
    ag.fillStyle(0x1b1420, 0.6).fillCircle(4, 6, ar);
    ag.fillStyle(0xe05a8a, 0.92).fillCircle(0, 0, ar);
    ag.lineStyle(5, 0xffffff, 0.9).strokeCircle(0, 0, ar);
    this.aktionsBild = this.add.image(0, -6, 'herz').setScale(4);
    this.aktionsText = this.add.text(0, 48, 'Helfen', stil(22)).setOrigin(0.5);
    aktion.add([ag, this.aktionsBild, this.aktionsText]);
    this.touchTeile.push(aktion);
    const imKnopf = (p) => this.zeigeTouch && Math.hypot(p.x - ax, p.y - ay) < ar + 20;
    this.steuerZonen.push(imKnopf);
    this.input.on('pointerdown', (p) => {
      if (!imKnopf(p)) return;
      this.tweens.add({ targets: aktion, scale: 0.88, duration: 70, yoyo: true });
      this.game.events.emit('aktion');
    });
  }

  zeigeGetragen(gegenstand) {
    // Der Helfen-Knopf zeigt, was der Grosse Zwerg gerade trägt
    this.aktionsBild.setTexture(gegenstand || 'herz');
  }
}
