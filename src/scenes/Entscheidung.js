import Phaser from 'phaser';
import { stil } from '../systeme/schrift.js';
import { spiele } from '../systeme/ton.js';

// Ein wichtiger Moment: ein einziger grosser Herz-Knopf (z.B. «Halt, lieber Drache!»)
// daten: { frage, knopf }
export class Entscheidung extends Phaser.Scene {
  constructor() { super('Entscheidung'); }

  init(daten) { this.daten = daten; this.fertig = false; }

  create() {
    const { frage, knopf } = this.daten;
    this.add.rectangle(480, 270, 960, 540, 0x05030a, 0.55);
    if (frage) this.add.text(480, 90, frage, stil(30, '#ffffff', { align: 'center', wordWrap: { width: 820 } })).setOrigin(0.5);

    const c = this.add.container(480, 300);
    const g = this.add.graphics();
    g.fillStyle(0x1b1420, 0.9).fillCircle(0, 6, 120);
    g.fillStyle(0xe05a8a, 1).fillCircle(0, 0, 118);
    g.lineStyle(8, 0xffffff).strokeCircle(0, 0, 118);
    const herz = this.add.image(0, -10, 'herz').setScale(8);
    c.add([g, herz]);
    c.setSize(240, 240).setInteractive({ useHandCursor: true });
    this.tweens.add({ targets: c, scale: 1.08, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.add.text(480, 470, knopf, stil(34, '#f2c94c', { align: 'center', wordWrap: { width: 860 }, strokeThickness: 7 })).setOrigin(0.5);

    const waehle = () => {
      if (this.fertig) return;
      this.fertig = true;
      spiele('zauber');
      this.tweens.add({
        targets: c, scale: 2.5, alpha: 0, duration: 500, ease: 'Quad.easeIn',
        onComplete: () => {
          this.scene.resume('Welt');
          this.game.events.emit('entscheidungFertig');
          this.scene.stop();
        },
      });
    };
    c.on('pointerdown', waehle);
    this.time.delayedCall(400, () => {
      this.input.keyboard.on('keydown', waehle);
      this.input.gamepad?.on('down', waehle);
    });
  }
}
