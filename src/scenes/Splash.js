import Phaser from 'phaser';
import { stil } from '../systeme/schrift.js';
import { spiele } from '../systeme/ton.js';
import { sprich } from '../systeme/stimme.js';
import { figurTexturen } from '../grafik/figur-texturen.js';

// Grosse Einblendung für coole Momente: Strahlen, grosses Bild, Titel, Konfetti.
// daten: { titel, text, bild, farbe }
export class Splash extends Phaser.Scene {
  constructor() { super('Splash'); }

  init(daten) { this.daten = daten; this.fertig = false; }

  create() {
    const { titel, text, bild, farbe = 0xe0a030 } = this.daten;
    const cx = 480, cy = 250;
    const figur = /^fig_(.+)_([a-z_0-9]+)$/.exec(bild || '');
    if (figur && !this.textures.exists(bild)) figurTexturen(this, figur[1]);
    this.add.rectangle(480, 270, 960, 540, 0x0d0a14, 0.72);

    // drehende Strahlen
    const strahlen = this.add.graphics({ x: cx, y: cy });
    for (let i = 0; i < 16; i++) {
      const w = (i / 16) * Math.PI * 2;
      strahlen.fillStyle(i % 2 ? farbe : 0xfff0a0, i % 2 ? 0.35 : 0.18);
      strahlen.slice(0, 0, 700, w, w + Math.PI / 16, false).fillPath();
    }
    strahlen.setScale(0);
    this.tweens.add({ targets: strahlen, scale: 1, duration: 450, ease: 'Back.easeOut' });
    this.tweens.add({ targets: strahlen, angle: 360, duration: 16000, repeat: -1 });

    const kreis = this.add.circle(cx, cy, 120, 0x1b1420, 0.85).setStrokeStyle(8, 0xf2c94c).setScale(0);
    this.tweens.add({ targets: kreis, scale: 1, duration: 400, delay: 100, ease: 'Back.easeOut' });

    const b = this.add.image(cx, cy + 6, bild || 'herz').setScale(0);
    const ziel = Math.min(200 / b.height, 190 / b.width, 6);
    this.tweens.add({ targets: b, scale: ziel, duration: 500, delay: 200, ease: 'Back.easeOut' });
    this.tweens.add({ targets: b, y: cy - 2, duration: 600, delay: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const t = this.add.text(cx, 420, titel, stil(58, '#f2c94c', { strokeThickness: 10 })).setOrigin(0.5).setScale(0);
    this.tweens.add({ targets: t, scale: 1, duration: 450, delay: 350, ease: 'Back.easeOut' });
    if (text) {
      const u = this.add.text(cx, 478, text, stil(26, '#ffffff', { align: 'center', wordWrap: { width: 820 } })).setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: u, alpha: 1, duration: 300, delay: 650 });
    }

    // Konfetti-Regen
    const farben = [0xf2c94c, 0xe05a8a, 0x7aa6e0, 0x6cc46a, 0xffffff, 0xf08a4b];
    this.time.addEvent({
      delay: 40, repeat: 60, callback: () => {
        const k = this.add.rectangle(Phaser.Math.Between(40, 920), -10, 8, 12, Phaser.Utils.Array.GetRandom(farben));
        this.tweens.add({ targets: k, y: 560, x: k.x + Phaser.Math.Between(-80, 80), angle: Phaser.Math.Between(180, 720), duration: Phaser.Math.Between(1400, 2400), onComplete: () => k.destroy() });
      },
    });

    spiele('splash');
    this.time.delayedCall(500, () => sprich(`${titel} ${text || ''}`, { hoehe: 1.1 }));
    this.time.delayedCall(3800, () => this.schliessen());
    this.time.delayedCall(700, () => {
      this.input.on('pointerdown', () => this.schliessen());
      this.input.keyboard.on('keydown', () => this.schliessen());
      this.input.gamepad?.on('down', () => this.schliessen());
    });
  }

  schliessen() {
    if (this.fertig) return;
    this.fertig = true;
    this.cameras.main.fadeOut(250, 13, 10, 20);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.resume('Welt');
      this.game.events.emit('splashFertig');
      this.scene.stop();
    });
  }
}
