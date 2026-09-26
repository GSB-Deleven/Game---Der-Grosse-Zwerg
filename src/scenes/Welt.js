import Phaser from 'phaser';
import { KARTEN, KAPITEL } from '../levels/index.js';
import { LEGENDE } from '../levels/legende.js';
import { KACHEL } from '../grafik/texturen.js';
import { maleBoden, erzeugeWeltTexturen, OBST_PLAETZE } from '../grafik/welt-grafik.js';
import { heldTexturen, figurTexturen } from '../grafik/figur-texturen.js';
import { sprich, verstummen, sprechDauer } from '../systeme/stimme.js';
import { spiele } from '../systeme/ton.js';
import { spieleMusik, ducken } from '../systeme/musik.js';
import { sichere } from '../systeme/speichern.js';

const TEMPO = 84;          // Lauftempo (Pixel pro Sekunde)
const SCHRITTWEITE = 30;   // so viele Pixel pro ganzem Laufzyklus
const HELD = { name: 'Der Grosse Zwerg', hoehe: 0.75, bild: 'held_unten_steh0' };

// Was der Grosse Zwerg sagt, wenn er etwas holt
const HOLEN_TEXTE = {
  essen: 'Ein Korb voll Essen!',
  wasser: 'Ein schwerer Kessel Wasser. Hau ruck!',
  buch: 'Ein grosses Buch von ganz oben!',
  frucht: 'Ein schöner Apfel von ganz oben!',
};
const HOCH_OBEN = new Set(['obstbaum', 'regal']); // hier muss er sich strecken

const BOTE_TEXTE = [
  ['bote', 'Hört, hört! Eine Nachricht von der Zwergenkönigin!'],
  ['bote', 'Auf dem höchsten Berg wohnt ein Drache. Alle haben Angst! Die Königin sucht einen mutigen Helden.'],
  ['held', 'Ich bin gross, ich bin stark, und ich bin mutig. Ich gehe zur Königin!'],
];

export class Welt extends Phaser.Scene {
  constructor() { super('Welt'); }

  init(daten) {
    this.kartenName = daten.karte || 'dorf';
    this.zielAusgang = daten.ziel;
    this.startPos = daten.pos || null;
    this.karte = KARTEN[this.kartenName];
    this.stand = this.registry.get('stand');
    this.kapitel = KAPITEL[this.stand.kapitel] || KAPITEL[1];
    this.pfad = [];
    this.pfadZiel = null;
    this.zwischenszene = false;
    this.aktionGesperrt = false;
    this.wechselt = false;
    this.letzterWunsch = null;
    this.pfadLetztes = null;
    this.traegt = null;
    this.tempo = { x: 0, y: 0 };
    this.laufPhase = 0;
    this.blick = 'unten';
    this.heldPose = null; // 'strecken' | 'jubeln' für kurze Zeit
    this.heldPoseBis = 0;
    this.heldRedenBis = 0;
    this.naechstesBlinzeln = 2000;
  }

  create() {
    heldTexturen(this);
    erzeugeWeltTexturen(this);
    this.dinge = [];
    this.figuren = [];
    this.ausgangsFelder = [];
    this.lichter = [];
    this.baueKarte();
    this.erzeugeHeld();
    this.richteKameraEin();
    this.richteEingabeEin();
    this.erzeugeLeben();

    if (!this.scene.isActive('Oberflaeche')) this.scene.launch('Oberflaeche');
    this.scene.bringToTop('Oberflaeche');
    this.game.events.emit('herzen', this.stand.herzen);
    this.game.events.emit('traegt', this.traegt);

    this.pfeil = this.add.image(0, 0, 'pfeil').setDepth(100000).setVisible(false);
    this.cameras.main.fadeIn(400);
    spieleMusik(this.karte.musik || 'dorf');

    this.game.events.on('aktion', this.beiAktion, this);
    this.game.events.on('pause', this.oeffnePause, this);
    this.lebt = true;
    this.events.once('shutdown', () => {
      this.lebt = false;
      this.game.events.off('aktion', this.beiAktion, this);
      this.game.events.off('pause', this.oeffnePause, this);
      verstummen();
    });

    this.sichern();
    // Neuer Ort? Dann ein Banner mit dem Namen (wie bei Zelda)
    if (!this.stand.orteBesucht.includes(this.kartenName)) {
      this.stand.orteBesucht.push(this.kartenName);
      this.time.delayedCall(500, () => this.game.events.emit('ortBanner', this.karte.name));
    }
    // Falls das Kapitel schon fertig ist (z.B. nach Neuladen), kommt der Bote gleich
    if (this.kapitelFertig()) this.time.delayedCall(900, () => this.boteKommt());
  }

  sichern() {
    if (this.held) this.stand.ort = { karte: this.kartenName, x: Math.round(this.held.x), y: Math.round(this.held.y) };
    this.stand.traegt = this.traegt || null;
    return sichere(this.registry);
  }

  // -------------------------------------------------------------------------
  // KARTE
  // -------------------------------------------------------------------------
  baueKarte() {
    const zeilen = this.karte.karte;
    this.breite = zeilen[0].length;
    this.hoehe = zeilen.length;
    const figuren = this.karte.figuren || {};
    const ausgaenge = this.karte.ausgaenge || {};

    // 1. Boden bestimmen (Objekte ohne eigenen Boden nehmen den ihrer Nachbarn)
    const boden = zeilen.map((z) => [...z].map((c) => LEGENDE[c]?.boden || null));
    for (let runde = 0; runde < 8; runde++) {
      for (let y = 0; y < this.hoehe; y++) {
        for (let x = 0; x < this.breite; x++) {
          if (boden[y][x]) continue;
          const n = [[-1, 0], [1, 0], [0, 1], [0, -1]].map(([dx, dy]) => boden[y + dy]?.[x + dx])
            .filter((b) => b && !['wasser', 'fels', 'felswand', 'rune'].includes(b));
          if (n.length) boden[y][x] = n.includes('weg') ? 'weg' : n[0];
        }
      }
    }
    for (let y = 0; y < this.hoehe; y++) for (let x = 0; x < this.breite; x++) {
      if (/[0-9]/.test(zeilen[y][x])) boden[y][x] = 'weg';
      boden[y][x] = boden[y][x] || 'gras';
    }
    this.bodenArt = boden;
    maleBoden(this, `boden_${this.kartenName}`, boden);
    this.add.image(0, 0, `boden_${this.kartenName}`).setOrigin(0, 0).setDepth(-100);

    // 2. Kollision, Objekte, Figuren, Ausgänge
    this.fest = [];
    const map = this.make.tilemap({ tileWidth: KACHEL, tileHeight: KACHEL, width: this.breite, height: this.hoehe });
    const set = map.addTilesetImage('kacheln', 'kacheln', KACHEL, KACHEL, 0, 0);
    this.sperre = map.createBlankLayer('sperre', set).setVisible(false);

    for (let y = 0; y < this.hoehe; y++) {
      this.fest.push([]);
      for (let x = 0; x < this.breite; x++) {
        const z = zeilen[y][x];
        const eintrag = LEGENDE[z];
        let fest = !!eintrag?.fest;
        if (/[a-z]/.test(z) && figuren[z]) {
          fest = true;
          this.erzeugeFigur(z, figuren[z], x, y);
        } else if (/[0-9]/.test(z)) {
          const inWand = this.istWand(x - 1, y) || this.istWand(x + 1, y);
          if (inWand) this.add.image(x * KACHEL, y * KACHEL, 'obj_tuer').setOrigin(0, 0).setDepth(-50);
          this.ausgangsFelder.push({ x, y, nummer: z, ...(ausgaenge[z] || {}) });
        } else if (eintrag?.start) {
          this.startFeld = { x, y };
        }
        this.fest[y].push(fest);
        if (fest) this.sperre.putTileAt(0, x, y);
        if (eintrag?.objekt) this.erzeugeObjekt(eintrag, x, y);
      }
    }
    this.sperre.setCollisionByExclusion([-1]);
    this.physics.world.setBounds(0, 0, this.breite * KACHEL, this.hoehe * KACHEL);
  }

  istWand(x, y) {
    const z = this.karte.karte[y]?.[x];
    return z === 'W' || z === 'R' || z === 'M';
  }

  erzeugeObjekt(eintrag, x, y) {
    const b = eintrag.breite || 1, h = eintrag.hoehe || 1;
    const px = x * KACHEL + (b * KACHEL) / 2;
    const py = (y + h) * KACHEL;
    const flach = eintrag.objekt === 'pilze';
    if (!flach) this.add.image(px, py - 2, 'bodenschatten').setScale((b * KACHEL + 6) / 32, 1).setDepth(-60);
    const bild = this.add.image(px, py, `obj_${eintrag.objekt}`).setOrigin(0.5, 1).setDepth(flach ? -40 : py);

    for (const [lx, ly] of eintrag.licht || []) this.lichtschein(px + (b === 3 ? lx - 24 : lx), py + ly, b === 3 ? 0.5 : 1);
    if (eintrag.flamme) this.flamme(px + eintrag.flamme[0], py + eintrag.flamme[1], py + 1);
    if (eintrag.rauch) this.kaminrauch(px + (b === 3 ? eintrag.rauch[0] - 24 : eintrag.rauch[0]), py + eintrag.rauch[1]);
    if (eintrag.funken) this.schmiedefunken(px + eintrag.funken[0], py + eintrag.funken[1], py + 1);

    if (eintrag.gibt) {
      const ding = { typ: 'quelle', gibt: eintrag.gibt, objekt: eintrag.objekt, bild, feld: { x, y, b, h } };
      if (eintrag.objekt === 'obstbaum') {
        ding.fruechte = OBST_PLAETZE.map(([fx, fy]) =>
          this.add.image(bild.x - 20 + fx, bild.y - 46 + fy, 'apfel').setDepth(py + 1));
      }
      this.dinge.push(ding);
    }
  }

  lichtschein(x, y, skala = 1) {
    const s = this.add.image(x, y, 'schein').setBlendMode(Phaser.BlendModes.ADD).setDepth(99000).setScale(skala);
    this.tweens.add({ targets: s, alpha: 0.65, scale: skala * 0.92, duration: 400 + Math.random() * 300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.lichter.push(s);
  }

  flamme(x, y, tiefe) {
    const f = this.add.image(x, y, 'flamme0').setOrigin(0.5, 1).setDepth(tiefe);
    let i = 0;
    this.time.addEvent({ delay: 110, loop: true, callback: () => { i = (i + 1) % 3; f.setTexture(`flamme${i}`); } });
  }

  kaminrauch(x, y) {
    this.time.addEvent({
      delay: 420, loop: true, callback: () => {
        const r = this.add.image(x + Phaser.Math.Between(-1, 1), y, 'rauch').setDepth(98000).setAlpha(0.8).setScale(0.5);
        this.tweens.add({
          targets: r, y: y - 34, x: r.x + Phaser.Math.Between(4, 12), alpha: 0, scale: 1.8,
          duration: 2600, ease: 'Sine.easeOut', onComplete: () => r.destroy(),
        });
      },
    });
  }

  schmiedefunken(x, y, tiefe) {
    this.time.addEvent({
      delay: 260, loop: true, callback: () => {
        const f = this.add.image(x + Phaser.Math.Between(-4, 4), y, 'funke').setDepth(tiefe + 2);
        this.tweens.add({
          targets: f, y: y - Phaser.Math.Between(10, 24), x: f.x + Phaser.Math.Between(-6, 6), alpha: 0,
          duration: 700, ease: 'Quad.easeOut', onComplete: () => f.destroy(),
        });
      },
    });
  }

  erzeugeFigur(buchstabe, daten, x, y) {
    const vorsilbe = figurTexturen(this, daten.aussehen);
    const px = x * KACHEL + KACHEL / 2;
    const py = (y + 1) * KACHEL - 1;
    this.add.image(px, py - 1, 'bodenschatten').setScale(0.7).setDepth(-60);
    const bild = this.add.image(px, py, `${vorsilbe}steh0`).setOrigin(0.5, 34 / 36).setDepth(py);
    const id = `${this.kartenName}:${buchstabe}`;
    const ding = {
      typ: 'figur', id, daten, bild, vorsilbe, feld: { x, y, b: 1, h: 1 }, gesprochen: false,
      naechstesBlinzeln: 1000 + Math.random() * 3000, blinzelnBis: 0, redenBis: 0, jubelnBis: 0,
      atemVersatz: Math.random() * 1000, hoehe: daten.stimme?.hoehe || 1,
    };
    this.dinge.push(ding);
    this.figuren.push(ding);
    if (daten.wunsch && !this.istErfuellt(id)) this.zeigeWunsch(ding);
  }

  zeigeWunsch(ding) {
    const c = this.add.container(ding.bild.x, ding.bild.y - 42).setDepth(90000);
    c.add(this.add.image(0, 0, 'blase').setScale(0.8));
    c.add(this.add.image(0, -1.5, ding.daten.wunsch).setScale(0.65));
    this.tweens.add({ targets: c, y: c.y - 3, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    ding.blase = c;
  }

  // -------------------------------------------------------------------------
  // LEBEN: Schmetterlinge, Hühner, Vögel, Wolkenschatten, Glitzern
  // -------------------------------------------------------------------------
  erzeugeLeben() {
    const leben = this.karte.leben || {};
    this.falter = [];
    for (let i = 0; i < (leben.falter || 0); i++) {
      const f = this.zufallsFeld((b) => b === 'gras' || b === 'blumen');
      if (!f) continue;
      const s = this.add.image(f.x * KACHEL + 8, f.y * KACHEL, 'falter0').setDepth(97000)
        .setTint(Phaser.Utils.Array.GetRandom([0xffffff, 0xffc0e0, 0xc0e0ff, 0xfff0a0]));
      this.falter.push({ s, ziel: { x: s.x, y: s.y }, zeit: 0 });
    }
    this.huehner = [];
    for (const [hx, hy] of leben.huehner || []) {
      const s = this.add.image(hx * KACHEL + 8, hy * KACHEL + 12, 'huhn0').setOrigin(0.5, 1).setDepth(hy * KACHEL + 12);
      this.huehner.push({ s, ziel: null, warte: Math.random() * 2000, pickt: 0 });
    }
    if (leben.wolken) {
      this.wolken = [];
      for (let i = 0; i < 3; i++) {
        const w = this.add.image(Math.random() * this.breite * KACHEL, Math.random() * this.hoehe * KACHEL, 'wolke')
          .setDepth(99500).setScale(2 + Math.random());
        this.wolken.push({ s: w, v: 6 + Math.random() * 5 });
      }
    }
    if (leben.voegel) {
      this.time.addEvent({ delay: 9000, loop: true, callback: () => this.vogelschwarm() });
      this.time.delayedCall(3000, () => this.vogelschwarm());
    }
    // Glitzern auf dem Wasser
    const wasser = [];
    this.bodenArt.forEach((r, y) => r.forEach((b, x) => { if (b === 'wasser' && this.bodenArt[y - 1]?.[x] === 'wasser') wasser.push({ x, y }); }));
    if (wasser.length) {
      this.time.addEvent({
        delay: 180, loop: true, callback: () => {
          const w = Phaser.Utils.Array.GetRandom(wasser);
          const g = this.add.image(w.x * KACHEL + Math.random() * 16, w.y * KACHEL + Math.random() * 16, 'glitzer').setDepth(-30).setScale(0);
          this.tweens.add({ targets: g, scale: 1, duration: 300, yoyo: true, onComplete: () => g.destroy() });
        },
      });
    }
  }

  zufallsFeld(passt) {
    for (let i = 0; i < 200; i++) {
      const x = Phaser.Math.Between(1, this.breite - 2), y = Phaser.Math.Between(1, this.hoehe - 2);
      if (!this.fest[y][x] && passt(this.bodenArt[y][x])) return { x, y };
    }
    return null;
  }

  vogelschwarm() {
    const cam = this.cameras.main.worldView;
    const vonLinks = Math.random() < 0.5;
    const y0 = cam.y + 10 + Math.random() * 50;
    for (let i = 0; i < 3; i++) {
      const v = this.add.image(vonLinks ? cam.x - 20 - i * 12 : cam.right + 20 + i * 12, y0 + (i % 2) * 8, 'vogel0').setDepth(99800).setFlipX(!vonLinks);
      let f = 0;
      const flatter = this.time.addEvent({ delay: 160, loop: true, callback: () => { f = 1 - f; v.setTexture(`vogel${f}`); } });
      this.tweens.add({
        targets: v, x: vonLinks ? cam.right + 60 : cam.x - 60, y: y0 - 20 + Math.random() * 40, duration: 7000,
        onComplete: () => { flatter.remove(); v.destroy(); },
      });
    }
  }

  aktualisiereLeben(zeit, delta) {
    const dt = delta / 1000;
    for (const f of this.falter) {
      f.zeit += delta;
      if (Phaser.Math.Distance.Between(f.s.x, f.s.y, f.ziel.x, f.ziel.y) < 3) {
        f.ziel = { x: f.s.x + Phaser.Math.Between(-40, 40), y: f.s.y + Phaser.Math.Between(-30, 30) };
        f.ziel.x = Phaser.Math.Clamp(f.ziel.x, 20, this.breite * KACHEL - 20);
        f.ziel.y = Phaser.Math.Clamp(f.ziel.y, 50, this.hoehe * KACHEL - 20);
      }
      const w = Math.atan2(f.ziel.y - f.s.y, f.ziel.x - f.s.x);
      f.s.x += Math.cos(w) * 18 * dt;
      f.s.y += Math.sin(w) * 18 * dt + Math.sin(zeit / 120 + f.zeit) * 0.3;
      f.s.setTexture(Math.floor(zeit / 110) % 2 ? 'falter1' : 'falter0');
    }
    for (const h of this.huehner) {
      h.warte -= delta;
      if (h.ziel) {
        const dx = h.ziel.x - h.s.x, dy = h.ziel.y - h.s.y, d = Math.hypot(dx, dy);
        if (d < 1.5) { h.ziel = null; h.warte = 800 + Math.random() * 2500; }
        else {
          h.s.x += (dx / d) * 16 * dt; h.s.y += (dy / d) * 16 * dt;
          h.s.setFlipX(dx < 0).setTexture(Math.floor(zeit / 120) % 2 ? 'huhn1' : 'huhn0');
          h.s.setDepth(h.s.y);
        }
      } else if (h.warte <= 0) {
        if (Math.random() < 0.4) { h.pickt = 600; h.warte = 900; }
        else {
          const nx = h.s.x + Phaser.Math.Between(-40, 40), ny = h.s.y + Phaser.Math.Between(-30, 30);
          const tx = Math.floor(nx / KACHEL), ty = Math.floor((ny - 2) / KACHEL);
          if (this.istFrei(tx, ty)) h.ziel = { x: nx, y: ny }; else h.warte = 300;
        }
      }
      if (h.pickt > 0) { h.pickt -= delta; h.s.setTexture(Math.floor(zeit / 150) % 2 ? 'huhn2' : 'huhn0'); }
    }
    if (this.wolken) {
      for (const w of this.wolken) {
        w.s.x += w.v * dt; w.s.y += w.v * 0.3 * dt;
        if (w.s.x > this.breite * KACHEL + 200) { w.s.x = -200; w.s.y = Math.random() * this.hoehe * KACHEL; }
      }
    }
  }

  // -------------------------------------------------------------------------
  // HELD
  // -------------------------------------------------------------------------
  erzeugeHeld() {
    let x, y;
    if (this.startPos && this.startPos.karte === this.kartenName && this.istFrei(Math.floor(this.startPos.x / KACHEL), Math.floor((this.startPos.y - 3) / KACHEL))) {
      x = this.startPos.x; y = this.startPos.y;
    } else {
      let start = this.startFeld || { x: 2, y: 2 };
      if (this.zielAusgang !== undefined) {
        const a = this.ausgangsFelder.find((f) => String(f.nummer) === String(this.zielAusgang));
        if (a) start = this.freiesNachbarfeld(a.x, a.y) || start;
      }
      x = start.x * KACHEL + KACHEL / 2;
      y = (start.y + 1) * KACHEL - 4;
    }
    this.heldSchatten = this.add.image(x, y, 'bodenschatten').setScale(0.8).setDepth(-60);
    this.held = this.physics.add.sprite(x, y, 'held_unten_steh0').setOrigin(0.5, 46 / 48);
    this.held.body.setSize(12, 7).setOffset(10, 39);
    this.held.setCollideWorldBounds(true);
    this.physics.add.collider(this.held, this.sperre);

    this.getragen = this.add.image(x, y - 48, 'herz').setVisible(false).setDepth(95000);
    const traegt = this.registry.get('traegt');
    if (traegt) this.nimm(traegt, false);
  }

  freiesNachbarfeld(x, y) {
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      if (this.istFrei(x + dx, y + dy)) return { x: x + dx, y: y + dy };
    }
    return null;
  }

  istFrei(x, y) {
    return x >= 0 && y >= 0 && x < this.breite && y < this.hoehe && !this.fest[y][x];
  }

  nimm(gegenstand, mitTon = true) {
    this.traegt = gegenstand;
    this.registry.set('traegt', gegenstand);
    this.getragen.setTexture(gegenstand).setVisible(true);
    if (mitTon) {
      spiele('aufheben');
      this.getragen.setScale(0.2);
      this.tweens.add({ targets: this.getragen, scale: 1, duration: 250, ease: 'Back.easeOut' });
    }
    this.game.events.emit('traegt', gegenstand);
  }

  gibAb() {
    this.traegt = null;
    this.registry.set('traegt', null);
    this.getragen.setVisible(false);
    this.game.events.emit('traegt', null);
  }

  richteKameraEin() {
    const cam = this.cameras.main;
    cam.setZoom(3);
    const sichtB = cam.width / 3, sichtH = cam.height / 3;
    const kartenB = this.breite * KACHEL, kartenH = this.hoehe * KACHEL;
    const bx = kartenB < sichtB ? -(sichtB - kartenB) / 2 : 0;
    const by = kartenH < sichtH ? -(sichtH - kartenH) / 2 : 0;
    cam.setBounds(bx, by, Math.max(kartenB, sichtB), Math.max(kartenH, sichtH));
    cam.startFollow(this.held, true, 0.1, 0.1, 0, 20);
    cam.setBackgroundColor(this.karte.hintergrund || '#241c2a');
  }

  // -------------------------------------------------------------------------
  // EINGABE (Tastatur, Controller, Touch)
  // -------------------------------------------------------------------------
  richteEingabeEin() {
    this.tasten = this.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT,W,A,S,D,SPACE,ENTER,E');
    this.input.keyboard.on('keydown-SPACE', () => this.beiAktion());
    this.input.keyboard.on('keydown-ENTER', () => this.beiAktion());
    this.input.keyboard.on('keydown-E', () => this.beiAktion());
    this.input.keyboard.on('keydown-ESC', () => this.oeffnePause());
    this.input.keyboard.on('keydown-P', () => this.oeffnePause());
    this.input.gamepad?.on('down', (pad, knopf) => {
      if (knopf.index === 9 || knopf.index === 8) this.oeffnePause();
      else if (knopf.index <= 3) this.beiAktion();
    });

    // Antippen / Klicken: dorthin laufen (und dort helfen)
    this.input.on('pointerdown', (zeiger) => {
      const ui = this.registry.get('istSteuerung');
      if (ui && ui(zeiger)) return;
      if (this.zwischenszene) return;
      const p = this.cameras.main.getWorldPoint(zeiger.x, zeiger.y);
      // Huhn angetippt? Gack!
      const huhn = this.huehner.find((h) => Phaser.Math.Distance.Between(h.s.x, h.s.y - 6, p.x, p.y) < 10);
      if (huhn) { spiele('gack'); this.tweens.add({ targets: huhn.s, y: huhn.s.y - 6, duration: 120, yoyo: true }); return; }
      this.laufeZu(p.x, p.y);
    });
  }

  oeffnePause() {
    if (this.zwischenszene || !this.scene.isActive()) return;
    this.sichern();
    this.scene.pause();
    this.scene.launch('Pause');
    this.scene.bringToTop('Pause');
  }

  richtungEingabe() {
    let dx = 0, dy = 0;
    const t = this.tasten;
    if (t.LEFT.isDown || t.A.isDown) dx -= 1;
    if (t.RIGHT.isDown || t.D.isDown) dx += 1;
    if (t.UP.isDown || t.W.isDown) dy -= 1;
    if (t.DOWN.isDown || t.S.isDown) dy += 1;

    const pad = this.input.gamepad?.pad1;
    if (pad) {
      if (pad.left) dx -= 1;
      if (pad.right) dx += 1;
      if (pad.up) dy -= 1;
      if (pad.down) dy += 1;
      if (Math.abs(pad.leftStick.x) > 0.3) dx += pad.leftStick.x;
      if (Math.abs(pad.leftStick.y) > 0.3) dy += pad.leftStick.y;
    }

    const touch = this.registry.get('touchRichtung');
    if (touch && (touch.x || touch.y)) { dx += touch.x; dy += touch.y; }

    const laenge = Math.hypot(dx, dy);
    if (laenge > 1) { dx /= laenge; dy /= laenge; }
    return { dx, dy };
  }

  // -------------------------------------------------------------------------
  // WEG FINDEN (für Antippen)
  // -------------------------------------------------------------------------
  laufeZu(wx, wy) {
    // Vorrang: 1. genau das Feld getroffen, 2. eine Figur, 3. ein Bild (z.B. Baumkrone)
    const tx0 = Math.floor(wx / KACHEL), ty0 = Math.floor(wy / KACHEL);
    const aufFeld = this.dinge.find((d) => tx0 >= d.feld.x && tx0 < d.feld.x + d.feld.b && ty0 >= d.feld.y && ty0 < d.feld.y + d.feld.h);
    const imBild = this.dinge.filter((d) => d.bild.getBounds().contains(wx, wy))
      .sort((a, b) => (a.typ === 'figur' ? 0 : 1) - (b.typ === 'figur' ? 0 : 1) || b.bild.depth - a.bild.depth);
    const getroffen = aufFeld || imBild[0];

    let ziele;
    if (getroffen) {
      ziele = this.felderUm(getroffen.feld);
    } else if (this.istFrei(tx0, ty0)) {
      ziele = [{ x: tx0, y: ty0 }];
    } else {
      ziele = this.felderUm({ x: tx0, y: ty0, b: 1, h: 1 });
    }
    const pfad = this.sucheWeg(ziele);
    if (!pfad) return;
    this.pfad = pfad;
    this.pfadLetztes = this.heldFeld();
    this.haengtSeit = 0;
    this.pfadZiel = getroffen || null;
    this.zeigeTippMarke(wx, wy);
    if (pfad.length === 0 && getroffen) {
      this.pfadZiel = null;
      this.schaueZu(getroffen);
      this.interagiere(getroffen);
    }
  }

  zeigeTippMarke(x, y) {
    const m = this.add.circle(x, y, 4, 0xffffff, 0.7).setDepth(99999);
    this.tweens.add({ targets: m, scale: 2.2, alpha: 0, duration: 450, onComplete: () => m.destroy() });
  }

  felderUm(feld) {
    const felder = [];
    for (let x = feld.x - 1; x <= feld.x + feld.b; x++) {
      for (let y = feld.y - 1; y <= feld.y + feld.h; y++) {
        const innen = x >= feld.x && x < feld.x + feld.b && y >= feld.y && y < feld.y + feld.h;
        if (!innen && this.istFrei(x, y)) felder.push({ x, y });
      }
    }
    return felder;
  }

  heldFeld() {
    return { x: Math.floor(this.held.x / KACHEL), y: Math.floor((this.held.y - 3) / KACHEL) };
  }

  // Breitensuche auf dem Kachelraster – gibt die Liste der Felder bis zum Ziel zurück
  sucheWeg(ziele) {
    if (!ziele.length) return null;
    const start = this.heldFeld();
    const zielSet = new Set(ziele.map((z) => `${z.x},${z.y}`));
    if (zielSet.has(`${start.x},${start.y}`)) return [];
    const vorher = new Map([[`${start.x},${start.y}`, null]]);
    const schlange = [start];
    while (schlange.length) {
      const f = schlange.shift();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const n = { x: f.x + dx, y: f.y + dy };
        const k = `${n.x},${n.y}`;
        if (vorher.has(k) || !this.istFrei(n.x, n.y)) continue;
        vorher.set(k, f);
        if (zielSet.has(k)) {
          const pfad = [];
          let p = n;
          while (p && !(p.x === start.x && p.y === start.y)) { pfad.unshift(p); p = vorher.get(`${p.x},${p.y}`); }
          return pfad;
        }
        schlange.push(n);
      }
    }
    return null;
  }

  // -------------------------------------------------------------------------
  // JEDES BILD
  // -------------------------------------------------------------------------
  update(zeit, delta) {
    if (!this.held) return;
    const dt = Math.min(delta, 50) / 1000;
    this.stand.spielzeit = (this.stand.spielzeit || 0) + dt;

    let { dx, dy } = this.zwischenszene ? { dx: 0, dy: 0 } : this.richtungEingabe();
    if (dx || dy) {
      this.pfad = [];
      this.pfadZiel = null;
    } else if (this.pfad.length && !this.zwischenszene) {
      ({ dx, dy } = this.folgePfad(delta));
    }

    // sanftes Beschleunigen und Abbremsen
    const weich = Math.min(1, dt * (dx || dy ? 14 : 18));
    this.tempo.x += (dx * TEMPO - this.tempo.x) * weich;
    this.tempo.y += (dy * TEMPO - this.tempo.y) * weich;
    if (Math.abs(this.tempo.x) < 1 && !dx) this.tempo.x = 0;
    if (Math.abs(this.tempo.y) < 1 && !dy) this.tempo.y = 0;
    this.held.setVelocity(this.tempo.x, this.tempo.y);

    this.animiereHeld(zeit, dt, dx, dy);
    this.animiereFiguren(zeit);
    this.aktualisiereLeben(zeit, delta);

    this.held.setDepth(this.held.y);
    this.heldSchatten.setPosition(this.held.x, this.held.y - 1);
    this.getragen.setPosition(this.held.x, this.held.y - 50 + (this.laufend ? Math.round(Math.abs(Math.sin(this.laufPhase * Math.PI * 2))) * -1 : 0));

    this.pruefeAusgang();
    this.aktualisierePfeil(zeit);
  }

  // Läuft Feld für Feld: zuerst quer ausrichten, dann gerade weiter – so bleibt er nirgends hängen
  folgePfad(delta) {
    const f = this.pfad[0];
    const vorher = this.pfadLetztes || this.heldFeld();
    const zx = f.x * KACHEL + KACHEL / 2, zy = (f.y + 1) * KACHEL - 4;
    const ex = zx - this.held.x, ey = zy - this.held.y;
    if (Math.abs(ex) < 2.5 && Math.abs(ey) < 2.5) {
      this.pfadLetztes = this.pfad.shift();
      this.haengtSeit = 0;
      if (!this.pfad.length) {
        this.held.setPosition(zx, zy);
        this.tempo = { x: 0, y: 0 };
        if (this.pfadZiel) {
          const ziel = this.pfadZiel;
          this.pfadZiel = null;
          this.schaueZu(ziel);
          this.interagiere(ziel);
        }
        return { dx: 0, dy: 0 };
      }
      return this.folgePfad(delta);
    }
    const bewegt = this.letztePos ? Math.hypot(this.held.x - this.letztePos.x, this.held.y - this.letztePos.y) : 1;
    this.letztePos = { x: this.held.x, y: this.held.y };
    this.haengtSeit = bewegt < 0.2 ? (this.haengtSeit || 0) + delta : 0;
    if (this.haengtSeit > 500) {
      this.haengtSeit = 0;
      const ziel = this.pfad[this.pfad.length - 1];
      this.pfadLetztes = null;
      this.held.setPosition(this.held.x + Math.sign(ex), this.held.y + Math.sign(ey));
      this.pfad = this.sucheWeg([ziel]) || [];
      return { dx: 0, dy: 0 };
    }
    const waagrecht = f.x !== vorher.x;
    const senkrecht = f.y !== vorher.y;
    if (waagrecht && !senkrecht && Math.abs(ey) > 1.5) return { dx: 0, dy: Math.sign(ey) };
    if (senkrecht && !waagrecht && Math.abs(ex) > 1.5) return { dx: Math.sign(ex), dy: 0 };
    const d = Math.hypot(ex, ey);
    return { dx: ex / d, dy: ey / d };
  }

  animiereHeld(zeit, dt, dx, dy) {
    const v = Math.hypot(this.tempo.x, this.tempo.y);
    const warLaufend = this.laufend;
    this.laufend = v > 8;
    if (dx || dy) {
      // Blickrichtung: seitlich bei (fast) waagrechter Bewegung
      if (Math.abs(dx) > Math.abs(dy) * 0.9) { this.blick = 'seite'; this.held.setFlipX(dx < 0); }
      else { this.blick = dy < 0 ? 'oben' : 'unten'; this.held.setFlipX(false); }
    }
    if (this.laufend && !warLaufend) this.staubwolke();

    const tragen = this.traegt ? '_tragen' : '';
    let bild;
    if (this.heldPose && zeit < this.heldPoseBis) {
      bild = `held_${this.blick}_${this.heldPose}`;
    } else if (this.laufend) {
      const alt = Math.floor(this.laufPhase * 6);
      this.laufPhase = (this.laufPhase + (v * dt) / SCHRITTWEITE) % 1;
      const neu = Math.floor(this.laufPhase * 6);
      if (neu !== alt && (neu === 0 || neu === 3)) spiele('schritt');
      bild = `held_${this.blick}${tragen}_lauf${neu}`;
    } else {
      this.laufPhase = 0;
      this.naechstesBlinzeln -= dt * 1000;
      if (this.naechstesBlinzeln < 0) { this.blinzelnBis = zeit + 140; this.naechstesBlinzeln = 2500 + Math.random() * 3000; }
      if (zeit < this.heldRedenBis && this.blick !== 'oben') bild = `held_${this.blick}${tragen}_${Math.floor(zeit / 140) % 2 ? 'reden' : 'steh0'}`;
      else if (zeit < this.blinzelnBis && this.blick !== 'oben') bild = `held_${this.blick}${tragen}_blinzeln`;
      else bild = `held_${this.blick}${tragen}_steh${Math.floor(zeit / 700) % 2}`;
    }
    this.held.setTexture(bild);
  }

  staubwolke() {
    for (let i = 0; i < 2; i++) {
      const s = this.add.image(this.held.x + (i ? 5 : -5), this.held.y - 1, 'staub').setDepth(this.held.y - 2).setAlpha(0.8);
      this.tweens.add({ targets: s, x: s.x + (i ? 6 : -6), y: s.y - 3, alpha: 0, scale: 1.6, duration: 380, onComplete: () => s.destroy() });
    }
  }

  animiereFiguren(zeit) {
    for (const f of this.figuren) {
      let bild;
      const nah = Phaser.Math.Distance.Between(f.bild.x, f.bild.y, this.held.x, this.held.y) < 70;
      const seite = !nah || Math.abs(this.held.x - f.bild.x) < 10 ? '' : this.held.x < f.bild.x ? 'links' : 'rechts';
      if (zeit >= f.naechstesBlinzeln) { f.blinzelnBis = zeit + 140; f.naechstesBlinzeln = zeit + 2000 + Math.random() * 4000; }
      if (zeit < f.jubelnBis) bild = Math.floor(zeit / 200) % 2 ? 'jubeln' : 'steh0';
      else if (zeit < f.redenBis) bild = Math.floor(zeit / 130) % 2 ? (seite ? `${seite}_reden` : 'reden') : (seite || 'steh0');
      else if (zeit < f.blinzelnBis) bild = 'blinzeln';
      else if (seite) bild = seite;
      else bild = Math.floor((zeit + f.atemVersatz) / 800) % 2 ? 'steh1' : 'steh0';
      f.bild.setTexture(f.vorsilbe + bild);
    }
  }

  schaueZu(ding) {
    const dx = ding.bild.x - this.held.x, dy = (ding.bild.y - 8) - (this.held.y - 8);
    if (Math.abs(dx) > Math.abs(dy)) { this.blick = 'seite'; this.held.setFlipX(dx < 0); }
    else { this.blick = dy < 0 ? 'oben' : 'unten'; this.held.setFlipX(false); }
  }

  pruefeAusgang() {
    if (this.wechselt || this.zwischenszene) return;
    const f = this.heldFeld();
    const a = this.ausgangsFelder.find((e) => e.x === f.x && e.y === f.y);
    if (!a || !a.karte) return;
    this.wechselt = true;
    spiele('tuer');
    this.held.setVelocity(0, 0);
    this.stand.ort = null;
    sichere(this.registry);
    this.cameras.main.fadeOut(300);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.restart({ karte: a.karte, ziel: a.ziel }));
  }

  // -------------------------------------------------------------------------
  // HELFEN
  // -------------------------------------------------------------------------
  beiAktion() {
    if (this.zwischenszene || this.aktionGesperrt || !this.held || !this.scene.isActive()) return;
    const ding = this.naechstesDing();
    if (ding) {
      this.schaueZu(ding);
      this.interagiere(ding);
    }
  }

  naechstesDing() {
    const fx = this.held.x, fy = this.held.y - 5;
    let bestes = null, beste = 22;
    for (const d of this.dinge) {
      const r = new Phaser.Geom.Rectangle(d.feld.x * KACHEL, d.feld.y * KACHEL, d.feld.b * KACHEL, d.feld.h * KACHEL);
      const nx = Phaser.Math.Clamp(fx, r.left, r.right), ny = Phaser.Math.Clamp(fy, r.top, r.bottom);
      const dist = Math.hypot(fx - nx, fy - ny);
      if (dist < beste) { beste = dist; bestes = d; }
    }
    return bestes;
  }

  interagiere(ding) {
    if (this.zwischenszene || this.aktionGesperrt) return;
    this.aktionGesperrt = true;
    this.time.delayedCall(350, () => { this.aktionGesperrt = false; });
    if (ding.typ === 'quelle') this.hole(ding);
    else this.redeMit(ding);
  }

  // Eine Figur (oder der Held) sagt etwas
  sage(wer, text) {
    let name, hoehe, bild;
    if (wer === 'held') {
      ({ name, hoehe } = HELD); bild = 'held_unten_steh0';
      this.heldRedenBis = this.time.now + text.length * 32;
    } else if (wer === 'bote') {
      name = 'Bote der Königin'; hoehe = 1.2; bild = `${figurTexturen(this, 'bote')}steh0`;
      if (this.boteFigur) this.boteFigur.redenBis = this.time.now + text.length * 32;
    } else {
      name = wer.daten.name; hoehe = wer.hoehe; bild = `${wer.vorsilbe}steh0`;
      wer.redenBis = this.time.now + text.length * 32;
    }
    this.game.events.emit('sprechen', { name, text, bild });
    ducken(true);
    return sprich(text, { hoehe }).then(() => ducken(false));
  }

  hole(quelle) {
    if (this.traegt === quelle.gibt) return;
    let startX = quelle.bild.x, startY = quelle.bild.y - quelle.bild.height + 8;

    if (quelle.fruechte) {
      const haengend = quelle.fruechte.filter((f) => f.visible);
      if (!haengend.length) return;
      const frucht = Phaser.Utils.Array.GetRandom(haengend);
      startX = frucht.x; startY = frucht.y;
      frucht.setVisible(false);
      if (haengend.length === 1) {
        this.time.delayedCall(2500, () => quelle.fruechte.forEach((f) => {
          f.setVisible(true).setScale(0);
          this.tweens.add({ targets: f, scale: 1, duration: 300, ease: 'Back.easeOut' });
        }));
      }
    }

    const hochOben = HOCH_OBEN.has(quelle.objekt);
    if (hochOben) {
      // Der Grosse Zwerg streckt sich – nur er kommt so weit hinauf!
      this.heldPose = 'strecken';
      this.heldPoseBis = this.time.now + 450;
      spiele('strecken');
    }
    const flug = this.add.image(startX, startY, quelle.gibt).setDepth(96000).setScale(0.6);
    this.tweens.add({
      targets: flug, x: this.held.x, y: this.held.y - 50, scale: 1, duration: hochOben ? 450 : 350,
      delay: hochOben ? 200 : 0, ease: 'Quad.easeOut',
      onComplete: () => { flug.destroy(); this.nimm(quelle.gibt); },
    });
    this.sage('held', HOLEN_TEXTE[quelle.gibt] || '');
  }

  redeMit(figur) {
    const d = figur.daten;
    if (!d.wunsch) return this.sage(figur, d.sagt);
    if (this.istErfuellt(figur.id)) return this.sage(figur, d.danach || d.danke);
    if (this.traegt === d.wunsch) return this.erfuelle(figur);

    const text = (!figur.gesprochen && d.neckt ? `${d.neckt} ` : '') + d.sagt;
    figur.gesprochen = true;
    this.letzterWunsch = figur;
    this.tweens.add({ targets: figur.blase, scale: 1.3, duration: 150, yoyo: true });
    return this.sage(figur, text);
  }

  async erfuelle(figur) {
    const d = figur.daten;
    this.gibAb();
    this.stand.erfuellt.push(figur.id);
    this.stand.herzen += 1;
    this.sichern();
    if (this.letzterWunsch === figur) this.letzterWunsch = null;

    // Freude! Blase weg, Jubel, Herz und Konfetti
    figur.blase?.destroy();
    figur.blase = null;
    figur.jubelnBis = this.time.now + 1600;
    this.heldPose = 'jubeln';
    this.heldPoseBis = this.time.now + 900;
    const y0 = figur.bild.y;
    this.tweens.add({ targets: figur.bild, y: y0 - 6, duration: 170, yoyo: true, repeat: 3, ease: 'Quad.easeOut' });
    this.konfetti(figur.bild.x, figur.bild.y - 24);
    spiele('herz');
    const herz = this.add.image(figur.bild.x, figur.bild.y - 30, 'herz').setDepth(99000).setScale(0.3);
    this.tweens.add({
      targets: herz, y: herz.y - 20, scale: 1.2, duration: 500, ease: 'Back.easeOut',
      onComplete: () => {
        const cam = this.cameras.main;
        const bx = (herz.x - cam.worldView.x) * cam.zoom, by = (herz.y - cam.worldView.y) * cam.zoom;
        herz.destroy();
        this.game.events.emit('herzFliegt', { x: bx, y: by, herzen: this.stand.herzen });
      },
    });

    await this.sage(figur, d.danke);
    if (!this.lebt) return;
    await this.pruefeMeilensteine();
    if (this.kapitelFertig()) this.time.delayedCall(500, () => this.boteKommt());
  }

  konfetti(x, y, anzahl = 30) {
    const farben = [0xf2c94c, 0xe05a8a, 0x7aa6e0, 0x6cc46a, 0xffffff, 0xf08a4b];
    for (let i = 0; i < anzahl; i++) {
      const s = this.add.rectangle(x, y, 2, 2, Phaser.Utils.Array.GetRandom(farben)).setDepth(99500);
      const winkel = Math.random() * Math.PI * 2, weite = 14 + Math.random() * 30;
      this.tweens.add({
        targets: s, x: x + Math.cos(winkel) * weite, y: y + Math.sin(winkel) * weite + 16,
        alpha: 0, angle: 360, duration: 800 + Math.random() * 500, ease: 'Quad.easeOut',
        onComplete: () => s.destroy(),
      });
    }
  }

  // -------------------------------------------------------------------------
  // SPLASH-SCREENS & MEILENSTEINE
  // -------------------------------------------------------------------------
  zeigeSplash(daten) {
    return new Promise((fertig) => {
      this.game.events.once('splashFertig', fertig);
      this.scene.pause();
      this.scene.launch('Splash', daten);
      this.scene.bringToTop('Splash');
    });
  }

  async pruefeMeilensteine() {
    for (const m of this.kapitel.meilensteine || []) {
      if (this.stand.meilensteine.includes(m.id)) continue;
      const w = m.wenn;
      let erreicht = false;
      if (w.herzen) erreicht = this.stand.herzen >= w.herzen;
      else if (w.wunsch) erreicht = this.alleWuensche().filter((x) => x.wunsch === w.wunsch).every((x) => this.istErfuellt(x.id));
      else if (w.figuren) erreicht = w.figuren.every((id) => this.istErfuellt(id));
      if (!erreicht) continue;
      this.stand.meilensteine.push(m.id);
      this.sichern();
      await this.zeigeSplash(m);
    }
  }

  // -------------------------------------------------------------------------
  // WÜNSCHE & KAPITEL
  // -------------------------------------------------------------------------
  istErfuellt(id) { return this.stand.erfuellt.includes(id); }

  alleWuensche() {
    const liste = [];
    for (const name of this.kapitel.karten) {
      const k = KARTEN[name];
      const zeilen = k.karte.join('');
      for (const [b, f] of Object.entries(k.figuren || {})) {
        if (f.wunsch && zeilen.includes(b)) liste.push({ id: `${name}:${b}`, karte: name, wunsch: f.wunsch });
      }
    }
    return liste;
  }

  kapitelFertig() {
    return this.alleWuensche().every((w) => this.istErfuellt(w.id));
  }

  // Wohin soll der Hilfe-Pfeil zeigen?
  pfeilZiel() {
    if (this.zwischenszene) return null;
    const offen = this.figuren.filter((d) => d.daten.wunsch && !this.istErfuellt(d.id));
    const naechste = (liste) => liste.sort((a, b) =>
      Phaser.Math.Distance.Between(this.held.x, this.held.y, a.bild.x, a.bild.y) -
      Phaser.Math.Distance.Between(this.held.x, this.held.y, b.bild.x, b.bild.y))[0];
    const ziel = (d) => ({ x: d.bild.x, y: d.bild.y, hoch: d.typ === 'figur' ? 44 : Math.min(d.bild.height, 40) });

    if (this.traegt) {
      if (this.letzterWunsch && this.letzterWunsch.daten.wunsch === this.traegt && !this.istErfuellt(this.letzterWunsch.id)) return ziel(this.letzterWunsch);
      const passend = naechste(offen.filter((d) => d.daten.wunsch === this.traegt));
      if (passend) return ziel(passend);
      return this.ausgangZu((w) => w.wunsch === this.traegt);
    }
    if (this.letzterWunsch && !this.istErfuellt(this.letzterWunsch.id)) {
      const quelle = naechste(this.dinge.filter((d) => d.typ === 'quelle' && d.gibt === this.letzterWunsch.daten.wunsch));
      if (quelle) return ziel(quelle);
      return this.ausgangZu(null, this.letzterWunsch.daten.wunsch);
    }
    const n = naechste(offen);
    if (n) return ziel(n);
    return this.ausgangZu(() => true);
  }

  // Tür zu einer Karte, auf der es einen passenden Wunsch (oder eine Quelle) gibt
  ausgangZu(passt, quelleFuer) {
    for (const a of this.ausgangsFelder) {
      if (!a.karte) continue;
      const k = KARTEN[a.karte];
      let treffer = false;
      if (quelleFuer) treffer = k.karte.some((z) => [...z].some((c) => LEGENDE[c]?.gibt === quelleFuer));
      else treffer = this.alleWuensche().some((w) => w.karte === a.karte && !this.istErfuellt(w.id) && passt(w));
      if (treffer) return { x: a.x * KACHEL + KACHEL / 2, y: (a.y + 1) * KACHEL, hoch: 16 };
    }
    return null;
  }

  aktualisierePfeil(zeit) {
    const ziel = this.pfeilZiel();
    if (!ziel) { this.pfeil.setVisible(false); return; }
    const cam = this.cameras.main.worldView;
    const zielX = ziel.x, zielY = ziel.y - ziel.hoch - 12;
    const rand = 10;
    const imBild = zielX > cam.x + rand && zielX < cam.right - rand && zielY > cam.y + rand && zielY < cam.bottom - rand;
    this.pfeil.setVisible(true);
    if (imBild) {
      this.pfeil.setRotation(0).setScale(0.8).setAlpha(0.95);
      this.pfeil.setPosition(zielX, zielY + Math.sin(zeit / 180) * 3);
    } else {
      const winkel = Math.atan2(ziel.y - 10 - this.held.y, ziel.x - this.held.x);
      const px = Phaser.Math.Clamp(cam.centerX + Math.cos(winkel) * 400, cam.x + 12, cam.right - 12);
      const py = Phaser.Math.Clamp(cam.centerY + Math.sin(winkel) * 400, cam.y + 12, cam.bottom - 12);
      const puls = 1 + Math.sin(zeit / 150) * 0.08;
      this.pfeil.setPosition(px, py).setRotation(winkel - Math.PI / 2).setScale(0.9 * puls).setAlpha(0.9);
    }
  }

  // -------------------------------------------------------------------------
  // ZWISCHENSZENE: Der Bote der Königin
  // -------------------------------------------------------------------------
  async boteKommt() {
    if (this.zwischenszene) return;
    this.zwischenszene = true;
    this.pfad = [];
    this.tempo = { x: 0, y: 0 };
    this.held.setVelocity(0, 0);
    this.pfeil.setVisible(false);

    const f = this.heldFeld();
    const platz = [[-2, 0], [2, 0], [0, 2], [-1, 1], [1, 1], [0, -2]].map(([dx, dy]) => ({ x: f.x + dx, y: f.y + dy }))
      .find((p) => this.istFrei(p.x, p.y)) || f;
    const px = platz.x * KACHEL + KACHEL / 2, py = (platz.y + 1) * KACHEL - 1;
    const vorsilbe = figurTexturen(this, 'bote');
    const bild = this.add.image(px, py - 80, `${vorsilbe}steh0`).setOrigin(0.5, 34 / 36).setDepth(py).setAlpha(0);
    this.boteFigur = { bild, vorsilbe, naechstesBlinzeln: 0, blinzelnBis: 0, redenBis: 0, jubelnBis: 0, atemVersatz: 0, daten: { name: 'Bote' } };
    this.figuren.push(this.boteFigur);
    this.tweens.add({ targets: bild, y: py, alpha: 1, duration: 700, ease: 'Bounce.easeOut' });
    this.konfetti(px, py - 20, 40);
    this.schaueZu({ bild });
    spiele('fanfare');
    await new Promise((r) => setTimeout(r, 900));
    if (!this.lebt) return;
    await this.zeigeSplash({ titel: 'Eine Nachricht!', text: 'Der Bote der Königin ist da!', bild: `${vorsilbe}jubeln`, farbe: 0x7c52a6 });

    for (const [wer, text] of BOTE_TEXTE) {
      if (!this.lebt) return;
      await this.sage(wer, text);
      await new Promise((r) => setTimeout(r, 350));
    }
    if (!this.lebt) return;
    this.cameras.main.fadeOut(900);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop('Oberflaeche');
      this.scene.start('KapitelEnde', { kapitel: this.stand.kapitel });
    });
  }
}
