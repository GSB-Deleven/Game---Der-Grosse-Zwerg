import Phaser from 'phaser';
import { stil } from '../systeme/schrift.js';
import { spiele } from '../systeme/ton.js';
import { zeichenMs, sprechDauer, setzeTextTempo } from '../systeme/stimme.js';
import { ladeEinstellungen } from '../systeme/speichern.js';
import { beiGroesse, sichererRand } from '../systeme/bildschirm.js';

// Alles, was über der Spielwelt liegt: Herzen, Sprechtext, Touch-Knöpfe.
export class Oberflaeche extends Phaser.Scene {
  constructor() { super('Oberflaeche'); }

  create() {
    this.herzAnzahl = 0;
    this.steuerZonen = [];
    this.baueHerzen();
    this.setzeHerzen(this.registry.get('stand')?.herzen || 0);
    this.baueSprechfeld();
    this.baueMenueKnopf();

    this.einstellungen = ladeEinstellungen();
    setzeTextTempo(this.einstellungen.textTempo);
    this.zeigeTouch = this.einstellungen.touch === 'an' || (this.einstellungen.touch !== 'aus' && this.sys.game.device.input.touch);
    this.baueTouchSteuerung();
    if (!this.zeigeTouch) this.touchTeile.forEach((t) => t.setVisible(false));
    // Sobald jemand den Bildschirm berührt, erscheinen die Touch-Knöpfe
    this.input.on('pointerdown', (p) => {
      if (p.wasTouch && !this.zeigeTouch && this.einstellungen.touch !== 'aus') { this.zeigeTouch = true; this.touchTeile.forEach((t) => t.setVisible(true)); }
    });

    // Knöpfe an die Bildschirmränder setzen (auch nach dem Drehen des Geräts)
    beiGroesse(this, () => this.ordneAn());

    this.registry.set('touchRichtung', { x: 0, y: 0 });
    this.registry.set('istSteuerung', (p) => this.steuerZonen.some((z) => z(p)));

    const ev = this.game.events;
    ev.on('herzen', this.setzeHerzen, this);
    ev.on('herzFliegt', this.herzFliegt, this);
    ev.on('sprechen', this.zeigeText, this);
    ev.on('traegt', this.zeigeGetragen, this);
    ev.on('ortBanner', this.zeigeOrt, this);
    ev.on('einstellungen', this.neueEinstellungen, this);
    this.events.once('shutdown', () => {
      ev.off('herzen', this.setzeHerzen, this);
      ev.off('herzFliegt', this.herzFliegt, this);
      ev.off('sprechen', this.zeigeText, this);
      ev.off('traegt', this.zeigeGetragen, this);
      ev.off('ortBanner', this.zeigeOrt, this);
      ev.off('einstellungen', this.neueEinstellungen, this);
      this.registry.set('istSteuerung', null);
      this.registry.set('touchRichtung', { x: 0, y: 0 });
    });
  }

  neueEinstellungen(einst) {
    this.einstellungen = einst;
    setzeTextTempo(einst.textTempo);
    this.zeigeTouch = einst.touch === 'an' || (einst.touch !== 'aus' && this.sys.game.device.input.touch);
    this.touchTeile.forEach((t) => t.setVisible(this.zeigeTouch));
    this.ordneAn();
  }

  // Alles an die Ränder des (beliebig grossen) Bildschirms setzen, mit Abstand zur iPhone-Notch
  ordneAn() {
    const B = this.scale.width, H = this.scale.height;
    const r = sichererRand(this);
    const l = Math.max(0, r.links * 0.8), re = Math.max(0, r.rechts * 0.8), u = Math.max(0, r.unten * 0.5);
    // Oben: unter der Statusleiste bleiben (iPhone hochkant), dort kommen Berührungen nicht an
    const o = Math.max(0, r.oben, H > B ? 60 : 0);
    const rechts = this.einstellungen?.kreuz !== 'links'; // Standard: Steuerkreuz rechts
    const hochkant = H > B;
    this.herzBox.setPosition(l, o);
    this.menueKnopf.setPosition(B - 30 - re, 40 + o);

    // Sprechfeld: neben den Herzen, hochkant darunter und verkleinert
    const skala = Math.min(1, (B - 20) / 760);
    this.sprechfeld.setScale(skala);
    this.sprechfeld.setPosition(hochkant ? B / 2 : Math.max(540 + l, B / 2), (hochkant ? 90 : 12) + o);

    let kreuzX, kreuzY, knopfX, knopfY;
    if (hochkant) {
      // Einhändig: Steuerkreuz unten, Helfen-Knopf direkt darüber – beides mit einem Daumen
      kreuzX = rechts ? B - 125 - re : 125 + l;
      kreuzY = H - 150 - u;
      knopfX = rechts ? B - 110 - re : 110 + l;
      knopfY = kreuzY - 250;
    } else {
      // Quer: Steuerkreuz auf der gewählten Seite, Helfen-Knopf gegenüber
      kreuzX = rechts ? B - 130 - re : 130 + l;
      knopfX = rechts ? 120 + l : B - 120 - re;
      kreuzY = knopfY = H - 120 - u;
    }
    this.kreuz.x = kreuzX; this.kreuz.y = kreuzY;
    this.kreuzTeil.setPosition(kreuzX, kreuzY);
    this.kreuzKnauf.setPosition(kreuzX, kreuzY);
    this.aktionsKnopf.setPosition(knopfX, knopfY);
  }

  // ---- Herzen oben links ----------------------------------------------------
  baueHerzen() {
    this.herzBox = this.add.container(0, 0);
    const g = this.add.graphics();
    g.fillStyle(0x1b1420, 0.7).fillRoundedRect(12, 12, 150, 64, 16);
    this.herzBild = this.add.image(50, 44, 'herz').setScale(3);
    this.herzText = this.add.text(88, 44, '0', stil(40)).setOrigin(0, 0.5);
    this.herzBox.add([g, this.herzBild, this.herzText]);
  }

  setzeHerzen(n) {
    this.herzAnzahl = n;
    this.herzText.setText(String(n));
  }

  herzFliegt({ x, y, herzen }) {
    const h = this.add.image(x, y, 'herz').setScale(3);
    this.tweens.add({
      targets: h, x: this.herzBox.x + this.herzBild.x, y: this.herzBox.y + this.herzBild.y, scale: 3, duration: 700, ease: 'Cubic.easeIn',
      onComplete: () => {
        h.destroy();
        this.setzeHerzen(herzen);
        this.tweens.add({ targets: this.herzBild, scale: 4.2, duration: 120, yoyo: true });
      },
    });
  }

  // ---- Sprechfeld oben: Porträt, Name, Text erscheint Buchstabe für Buchstabe ----
  baueSprechfeld() {
    this.sprechfeld = this.add.container(540, 12).setVisible(false);
    this.sprechRahmen = this.add.graphics();
    this.portraitRahmen = this.add.graphics();
    this.portrait = this.add.image(-322, 50, 'herz').setScale(2.4);
    this.sprechName = this.add.text(-270, 10, '', stil(21, '#f2c94c'));
    this.sprechText = this.add.text(-270, 38, '', stil(23, '#ffffff', { wordWrap: { width: 610 }, lineSpacing: 2 }));
    this.sprechfeld.add([this.sprechRahmen, this.portraitRahmen, this.portrait, this.sprechName, this.sprechText]);
  }

  zeigeText({ name, text, bild }) {
    this.sprechName.setText(name || '');
    this.sprechText.setText(text);
    const hoehe = Math.max(100, 38 + this.sprechText.height + 14);
    this.sprechText.setText('');
    this.sprechRahmen.clear()
      .fillStyle(0x1b1420, 0.9).fillRoundedRect(-370, 0, 740, hoehe, 16)
      .lineStyle(3, 0xf2c94c).strokeRoundedRect(-370, 0, 740, hoehe, 16);
    this.portraitRahmen.clear().fillStyle(0x3a3048, 1).fillRoundedRect(-360, 10, 76, 80, 10);
    if (bild && this.textures.exists(bild)) {
      const f = this.textures.get(bild).getSourceImage();
      const skala = Math.min(2.4, 72 / f.width);
      this.portrait.setTexture(bild).setOrigin(0.5, 0).setCrop(0, 0, f.width, Math.min(f.height, 28)).setVisible(true);
      this.portrait.setScale(skala).setPosition(-322, 14);
    } else this.portrait.setVisible(false);
    this.sprechfeld.setVisible(true).setAlpha(1);
    this.textZeit?.remove();
    this.schreiber?.remove();
    this.tweens.killTweensOf(this.sprechfeld);
    let i = 0;
    this.schreiber = this.time.addEvent({
      delay: zeichenMs(), repeat: text.length - 1,
      callback: () => { i++; this.sprechText.setText(text.slice(0, i)); },
    });
    this.textZeit = this.time.delayedCall(sprechDauer(text) + 400, () => {
      this.tweens.add({ targets: this.sprechfeld, alpha: 0, duration: 400, onComplete: () => this.sprechfeld.setVisible(false) });
    });
  }

  // ---- Orts-Banner (wie bei Zelda) ------------------------------------------
  zeigeOrt(name) {
    const c = this.add.container(this.scale.width / 2, this.scale.height / 2 - 20).setAlpha(0).setScale(Math.min(1, (this.scale.width - 20) / 680));
    const g = this.add.graphics();
    g.fillStyle(0x1b1420, 0.85).fillRect(-330, -38, 660, 76);
    g.lineStyle(3, 0xf2c94c).lineBetween(-330, -38, 330, -38).lineBetween(-330, 38, 330, 38);
    c.add([g, this.add.text(0, 0, name, stil(40, '#f2c94c', { strokeThickness: 8 })).setOrigin(0.5)]);
    this.tweens.add({ targets: c, alpha: 1, duration: 500, hold: 1800, yoyo: true, onComplete: () => c.destroy() });
  }

  // ---- Pause-Knopf -----------------------------------------------------------
  baueMenueKnopf() {
    const k = this.menueKnopf = this.add.container(930, 40);
    const g = this.add.graphics();
    g.fillStyle(0x1b1420, 0.7).fillRoundedRect(-26, -26, 52, 52, 12);
    g.fillStyle(0xffffff, 1);
    g.fillRect(-12, -13, 8, 26); g.fillRect(4, -13, 8, 26);
    k.add(g);
    k.setSize(52, 52).setInteractive({ useHandCursor: true });
    k.on('pointerdown', () => { spiele('knopf'); this.game.events.emit('pause'); });
    this.steuerZonen.push((p) => Math.abs(p.x - k.x) < 32 && Math.abs(p.y - k.y) < 32);
  }

  // ---- Touch: Steuerkreuz links, Helfen-Knopf rechts ----------------------
  baueTouchSteuerung() {
    this.touchTeile = [];
    const kr = 95, kx = 0, ky = 0;
    const kreuz = this.kreuz = { x: 130, y: 420 };

    const basis = this.kreuzTeil = this.add.graphics().setAlpha(0.55).setPosition(kreuz.x, kreuz.y);
    basis.fillStyle(0x1b1420, 1).fillCircle(kx, ky, kr);
    basis.lineStyle(4, 0xffffff, 0.8).strokeCircle(kx, ky, kr);
    basis.fillStyle(0xffffff, 0.9);
    const d = kr - 22;
    basis.fillTriangle(kx, ky - d - 14, kx - 14, ky - d + 6, kx + 14, ky - d + 6);
    basis.fillTriangle(kx, ky + d + 14, kx - 14, ky + d - 6, kx + 14, ky + d - 6);
    basis.fillTriangle(kx - d - 14, ky, kx - d + 6, ky - 14, kx - d + 6, ky + 14);
    basis.fillTriangle(kx + d + 14, ky, kx + d - 6, ky - 14, kx + d - 6, ky + 14);
    const knauf = this.kreuzKnauf = this.add.circle(kreuz.x, kreuz.y, 34, 0xf2c94c, 0.9).setStrokeStyle(4, 0x1b1420);
    this.touchTeile.push(basis, knauf);

    let zeigerId = null;
    const setze = (p) => {
      const dx = p.x - kreuz.x, dy = p.y - kreuz.y;
      const l = Math.hypot(dx, dy);
      const max = kr - 30;
      const k = l > max ? max / l : 1;
      knauf.setPosition(kreuz.x + dx * k, kreuz.y + dy * k);
      if (l < 12) { this.registry.set('touchRichtung', { x: 0, y: 0 }); return; }
      const staerke = Math.min(1, l / 40);
      this.registry.set('touchRichtung', { x: (dx / l) * staerke, y: (dy / l) * staerke });
    };
    const loslassen = () => {
      zeigerId = null;
      knauf.setPosition(kreuz.x, kreuz.y);
      this.registry.set('touchRichtung', { x: 0, y: 0 });
    };
    const imKreuz = (p) => this.zeigeTouch && Math.hypot(p.x - kreuz.x, p.y - kreuz.y) < kr + 30;
    this.steuerZonen.push(imKreuz);

    this.input.on('pointerdown', (p) => { if (imKreuz(p) && zeigerId === null) { zeigerId = p.id; setze(p); } });
    this.input.on('pointermove', (p) => { if (p.id === zeigerId) setze(p); });
    this.input.on('pointerup', (p) => { if (p.id === zeigerId) loslassen(); });
    this.input.on('pointerupoutside', (p) => { if (p.id === zeigerId) loslassen(); });

    // Grosser Helfen-Knopf
    const ar = 78;
    const aktion = this.aktionsKnopf = this.add.container(840, 420);
    const ag = this.add.graphics();
    ag.fillStyle(0x1b1420, 0.6).fillCircle(4, 6, ar);
    ag.fillStyle(0xe05a8a, 0.92).fillCircle(0, 0, ar);
    ag.lineStyle(5, 0xffffff, 0.9).strokeCircle(0, 0, ar);
    this.aktionsBild = this.add.image(0, -6, 'herz').setScale(4);
    this.aktionsText = this.add.text(0, 48, 'Helfen', stil(22)).setOrigin(0.5);
    aktion.add([ag, this.aktionsBild, this.aktionsText]);
    this.touchTeile.push(aktion);
    const imKnopf = (p) => this.zeigeTouch && Math.hypot(p.x - aktion.x, p.y - aktion.y) < ar + 20;
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
