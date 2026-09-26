import Phaser from 'phaser';
import { KARTEN, KAPITEL } from '../levels/index.js';
import { LEGENDE } from '../levels/legende.js';
import { KACHEL, VARIANTEN, kachelNummer, figurTextur } from '../grafik/texturen.js';
import { FRUCHT_PLAETZE } from '../grafik/eigene-sprites.js';
import { sprich } from '../systeme/stimme.js';
import { spiele } from '../systeme/ton.js';
import { speichereSpielstand } from '../systeme/speichern.js';

const TEMPO = 78; // Lauftempo des Grossen Zwergs (Pixel pro Sekunde)
const HELD_STIMME = { hoehe: 0.7, tempo: 0.95 };

// Was der Grosse Zwerg sagt, wenn er etwas holt
const HOLEN_TEXTE = {
  essen: 'Ein Korb voll Essen!',
  wasser: 'Ein schwerer Kessel Wasser. Hau ruck!',
  buch: 'Ein grosses Buch von ganz oben!',
  frucht: 'Ein schöner Apfel von ganz oben!',
};

const BOTE_TEXTE = [
  ['Bote der Königin', 'Hört, hört! Eine Nachricht von der Zwergenkönigin!', { hoehe: 1.1 }],
  ['Bote der Königin', 'Auf dem höchsten Berg wohnt ein Drache. Alle haben Angst! Die Königin sucht einen mutigen Helden.', { hoehe: 1.1 }],
  ['Der Grosse Zwerg', 'Ich bin gross, ich bin stark, und ich bin mutig. Ich gehe zur Königin!', HELD_STIMME],
];

export class Welt extends Phaser.Scene {
  constructor() { super('Welt'); }

  init(daten) {
    this.kartenName = daten.karte || 'dorf';
    this.zielAusgang = daten.ziel;
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
  }

  create() {
    this.dinge = []; // alles, womit man reden oder etwas holen kann
    this.ausgangsFelder = [];
    this.baueKarte();
    this.erzeugeHeld();
    this.richteKameraEin();
    this.richteEingabeEin();

    if (!this.scene.isActive('Oberflaeche')) this.scene.launch('Oberflaeche');
    this.scene.bringToTop('Oberflaeche');
    this.game.events.emit('herzen', this.stand.herzen);

    this.pfeil = this.add.image(0, 0, 'pfeil').setDepth(100000).setVisible(false);
    this.cameras.main.fadeIn(350);

    this.events.once('shutdown', () => {
      this.game.events.off('aktion', this.beiAktion, this);
    });

    // Falls das Kapitel schon fertig ist (z.B. nach Neuladen), kommt der Bote gleich
    if (this.kapitelFertig()) this.time.delayedCall(800, () => this.boteKommt());
  }

  // -------------------------------------------------------------------------
  // KARTE
  // -------------------------------------------------------------------------
  baueKarte() {
    const zeilen = this.karte.karte;
    this.breite = zeilen[0].length;
    this.hoehe = zeilen.length;
    this.fest = [];

    const map = this.make.tilemap({ tileWidth: KACHEL, tileHeight: KACHEL, width: this.breite, height: this.hoehe });
    const set = map.addTilesetImage('kacheln', 'kacheln', KACHEL, KACHEL, 0, 0);
    this.boden = map.createBlankLayer('boden', set).setDepth(-10);
    this.sperre = map.createBlankLayer('sperre', set).setVisible(false);

    const figuren = this.karte.figuren || {};
    const ausgaenge = this.karte.ausgaenge || {};

    for (let y = 0; y < this.hoehe; y++) {
      this.fest.push([]);
      for (let x = 0; x < this.breite; x++) {
        const z = zeilen[y][x];
        let eintrag = LEGENDE[z];
        let fest = false;

        if (/[a-z]/.test(z) && figuren[z]) {
          eintrag = { boden: this.bodenNeben(x, y) };
          fest = true;
          this.erzeugeFigur(z, figuren[z], x, y);
        } else if (/[0-9]/.test(z)) {
          const inWand = this.istWand(x - 1, y) || this.istWand(x + 1, y);
          eintrag = { boden: inWand ? 'steinboden' : this.bodenNeben(x, y) };
          if (inWand) this.add.image(x * KACHEL, y * KACHEL, 'tuer').setOrigin(0, 0).setDepth(-5);
          this.ausgangsFelder.push({ x, y, nummer: z, ...(ausgaenge[z] || {}) });
        } else if (!eintrag) {
          eintrag = { boden: 'gras' };
        }

        if (eintrag.bodenWieNachbar) eintrag = { ...eintrag, boden: this.bodenNeben(x, y) };
        if (eintrag.start) this.startFeld = { x, y };
        fest = fest || !!eintrag.fest;
        this.fest[y].push(fest);

        const variante = (x * 7 + y * 13 + ((x * y) % 5)) % VARIANTEN;
        this.boden.putTileAt(kachelNummer(eintrag.boden) * VARIANTEN + variante, x, y);
        if (fest) this.sperre.putTileAt(0, x, y);
        if (eintrag.objekt) this.erzeugeObjekt(eintrag, x, y);
      }
    }
    this.sperre.setCollisionByExclusion([-1]);
    this.physics.world.setBounds(0, 0, this.breite * KACHEL, this.hoehe * KACHEL);
  }

  istWand(x, y) {
    const z = this.karte.karte[y]?.[x];
    return z === 'W' || z === 'R' || z === 'M';
  }

  bodenNeben(x, y) {
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, 1], [0, -1]]) {
      const e = LEGENDE[this.karte.karte[y + dy]?.[x + dx]];
      if (e && !e.fest && e.boden) return e.boden;
    }
    return 'gras';
  }

  erzeugeObjekt(eintrag, x, y) {
    const breite = eintrag.breite || 1;
    const px = x * KACHEL + (breite * KACHEL) / 2;
    const py = (y + 1) * KACHEL;
    const bild = this.add.image(px, py, eintrag.objekt).setOrigin(0.5, 1).setDepth(py);
    if (eintrag.objekt === 'fackel') this.tweens.add({ targets: bild, scaleY: 1.05, duration: 180, yoyo: true, repeat: -1 });

    if (eintrag.gibt) {
      const ding = {
        typ: 'quelle', gibt: eintrag.gibt, bild,
        feld: { x, y, b: breite, h: 1 },
      };
      if (eintrag.objekt === 'obstbaum') {
        ding.fruechte = FRUCHT_PLAETZE.map(([fx, fy]) =>
          this.add.image(bild.x - 16 + fx + 3, bild.y - bild.height + fy + 3, 'frucht_klein').setDepth(py + 1));
      }
      this.dinge.push(ding);
    }
  }

  erzeugeFigur(buchstabe, daten, x, y) {
    const key = figurTextur(this, daten.aussehen);
    const px = x * KACHEL + KACHEL / 2;
    const py = (y + 1) * KACHEL;
    const schatten = this.add.image(px, py - 1, 'schatten').setDepth(py - 1);
    const bild = this.add.image(px, py, key).setOrigin(0.5, 1).setDepth(py);
    // Die Figuren "atmen" ein bisschen
    this.tweens.add({ targets: bild, scaleY: 1.04, duration: 900 + Math.random() * 400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const id = `${this.kartenName}:${buchstabe}`;
    const ding = { typ: 'figur', id, daten, bild, schatten, feld: { x, y, b: 1, h: 1 }, gesprochen: false };
    this.dinge.push(ding);
    if (daten.wunsch && !this.istErfuellt(id)) this.zeigeWunsch(ding);
  }

  zeigeWunsch(ding) {
    const c = this.add.container(ding.bild.x, ding.bild.y - ding.bild.height - 14).setDepth(90000);
    c.add(this.add.image(0, 0, 'blase').setScale(0.75));
    c.add(this.add.image(0, -1.5, ding.daten.wunsch).setScale(0.6));
    this.tweens.add({ targets: c, y: c.y - 3, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    ding.blase = c;
  }

  // -------------------------------------------------------------------------
  // HELD
  // -------------------------------------------------------------------------
  erzeugeHeld() {
    let start = this.startFeld || { x: 2, y: 2 };
    if (this.zielAusgang !== undefined) {
      const a = this.ausgangsFelder.find((f) => String(f.nummer) === String(this.zielAusgang));
      if (a) start = this.freiesNachbarfeld(a.x, a.y) || start;
    }
    const x = start.x * KACHEL + KACHEL / 2;
    const y = (start.y + 1) * KACHEL - 2;
    this.heldSchatten = this.add.image(x, y, 'schatten');
    this.held = this.physics.add.sprite(x, y, 'held_unten_0').setOrigin(0.5, 1);
    this.held.body.setSize(10, 6).setOffset(3, 26);
    this.held.setCollideWorldBounds(true);
    this.physics.add.collider(this.held, this.sperre);
    this.blick = 'unten';

    this.getragen = this.add.image(x, y - 34, 'herz').setVisible(false).setDepth(95000);
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
    cam.startFollow(this.held, true, 0.12, 0.12, 0, 16);
    cam.setBackgroundColor(this.kartenName === 'bibliothek' ? '#2a2230' : '#3a3440');
  }

  // -------------------------------------------------------------------------
  // EINGABE (Tastatur, Controller, Touch)
  // -------------------------------------------------------------------------
  richteEingabeEin() {
    this.tasten = this.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT,W,A,S,D,SPACE,ENTER,E');
    this.input.keyboard.on('keydown-SPACE', () => this.beiAktion());
    this.input.keyboard.on('keydown-ENTER', () => this.beiAktion());
    this.input.keyboard.on('keydown-E', () => this.beiAktion());
    this.input.gamepad?.on('down', (pad, knopf) => { if (knopf.index <= 3) this.beiAktion(); });
    this.game.events.on('aktion', this.beiAktion, this);

    // Antippen / Klicken: dorthin laufen (und dort helfen)
    this.input.on('pointerdown', (zeiger) => {
      const ui = this.registry.get('istSteuerung');
      if (ui && ui(zeiger)) return;
      if (this.zwischenszene) return;
      const p = this.cameras.main.getWorldPoint(zeiger.x, zeiger.y);
      this.laufeZu(p.x, p.y);
    });
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
    // Hat man auf eine Figur oder etwas zum Holen getippt?
    // Vorrang: 1. genau das Feld getroffen, 2. eine Figur, 3. ein Bild (z.B. Baumkrone)
    const tx0 = Math.floor(wx / KACHEL), ty0 = Math.floor(wy / KACHEL);
    const aufFeld = this.dinge.find((d) => tx0 >= d.feld.x && tx0 < d.feld.x + d.feld.b && ty0 >= d.feld.y && ty0 < d.feld.y + d.feld.h);
    const imBild = this.dinge.filter((d) => d.bild.getBounds().contains(wx, wy))
      .sort((a, b) => (a.typ === 'figur' ? 0 : 1) - (b.typ === 'figur' ? 0 : 1) || b.bild.depth - a.bild.depth);
    const getroffen = aufFeld || imBild[0];

    let ziele;
    if (getroffen) {
      ziele = this.felderUm(getroffen.feld);
    } else {
      const tx = Math.floor(wx / KACHEL), ty = Math.floor(wy / KACHEL);
      if (this.istFrei(tx, ty)) ziele = [{ x: tx, y: ty }];
      else ziele = this.felderUm({ x: tx, y: ty, b: 1, h: 1 });
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
    const m = this.add.circle(x, y, 5, 0xffffff, 0.6).setDepth(99999);
    this.tweens.add({ targets: m, scale: 2, alpha: 0, duration: 400, onComplete: () => m.destroy() });
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
  // JEDES BILD (60x pro Sekunde)
  // -------------------------------------------------------------------------
  update(zeit, delta) {
    if (!this.held) return;
    let { dx, dy } = this.zwischenszene ? { dx: 0, dy: 0 } : this.richtungEingabe();

    if (dx || dy) {
      this.pfad = [];
      this.pfadZiel = null;
    } else if (this.pfad.length && !this.zwischenszene) {
      ({ dx, dy } = this.folgePfad(delta));
    }

    this.held.setVelocity(dx * TEMPO, dy * TEMPO);
    this.animiereHeld(dx, dy);

    this.held.setDepth(this.held.y);
    this.heldSchatten.setPosition(this.held.x, this.held.y - 1).setDepth(this.held.y - 1);
    this.getragen.setPosition(this.held.x, this.held.y - 36 + Math.sin(zeit / 150) * 0.8);

    this.pruefeAusgang();
    this.aktualisierePfeil(zeit);
  }

  // Läuft Feld für Feld: zuerst quer ausrichten, dann gerade weiter – so bleibt er nirgends hängen
  folgePfad(delta) {
    const f = this.pfad[0];
    const vorher = this.pfadLetztes || this.heldFeld();
    const zx = f.x * KACHEL + KACHEL / 2, zy = (f.y + 1) * KACHEL - 4;
    const ex = zx - this.held.x, ey = zy - this.held.y;
    if (Math.abs(ex) < 2 && Math.abs(ey) < 2) {
      this.pfadLetztes = this.pfad.shift();
      this.haengtSeit = 0;
      if (!this.pfad.length) {
        this.held.setPosition(zx, zy);
        if (this.pfadZiel) {
          const ziel = this.pfadZiel;
          this.pfadZiel = null;
          this.schaueZu(ziel);
          this.interagiere(ziel);
        }
      }
      return { dx: 0, dy: 0 };
    }
    // Hänger-Erkennung: wenn er sich nicht bewegt, Weg neu suchen
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

  animiereHeld(dx, dy) {
    if (!dx && !dy) {
      this.held.anims.stop();
      this.held.setTexture(`held_${this.blick}_0`);
      return;
    }
    if (Math.abs(dx) > Math.abs(dy)) {
      this.blick = 'seite';
      this.held.setFlipX(dx < 0);
    } else {
      this.blick = dy < 0 ? 'oben' : 'unten';
      this.held.setFlipX(false);
    }
    this.held.anims.play(`held_${this.blick}_laufen`, true);
  }

  schaueZu(ding) {
    const dx = ding.bild.x - this.held.x, dy = (ding.bild.y - 8) - (this.held.y - 8);
    if (Math.abs(dx) > Math.abs(dy)) { this.blick = 'seite'; this.held.setFlipX(dx < 0); }
    else this.blick = dy < 0 ? 'oben' : 'unten';
  }

  pruefeAusgang() {
    if (this.wechselt || this.zwischenszene) return;
    const f = this.heldFeld();
    const a = this.ausgangsFelder.find((e) => e.x === f.x && e.y === f.y);
    if (!a || !a.karte) return;
    this.wechselt = true;
    spiele('tuer');
    this.held.setVelocity(0, 0);
    this.cameras.main.fadeOut(250);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.restart({ karte: a.karte, ziel: a.ziel }));
  }

  // -------------------------------------------------------------------------
  // HELFEN
  // -------------------------------------------------------------------------
  beiAktion() {
    if (this.zwischenszene || this.aktionGesperrt || !this.held) return;
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

  sage(name, text, stimme) {
    this.game.events.emit('sprechen', { name, text });
    spiele('reden');
    return sprich(text, stimme);
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

    // Der Grosse Zwerg streckt sich
    this.tweens.add({ targets: this.held, scaleY: 1.12, duration: 120, yoyo: true });
    const flug = this.add.image(startX, startY, quelle.gibt).setDepth(96000).setScale(0.6);
    this.tweens.add({
      targets: flug, x: this.held.x, y: this.held.y - 36, scale: 1, duration: 350, ease: 'Quad.easeOut',
      onComplete: () => { flug.destroy(); this.nimm(quelle.gibt); },
    });
    this.sage('Der Grosse Zwerg', HOLEN_TEXTE[quelle.gibt] || '', HELD_STIMME);
  }

  redeMit(figur) {
    const d = figur.daten;
    if (!d.wunsch) return this.sage(d.name, d.sagt, d.stimme);

    if (this.istErfuellt(figur.id)) return this.sage(d.name, d.danach || d.danke, d.stimme);

    if (this.traegt === d.wunsch) return this.erfuelle(figur);

    const text = (!figur.gesprochen && d.neckt ? `${d.neckt} ` : '') + d.sagt;
    figur.gesprochen = true;
    this.letzterWunsch = figur;
    this.tweens.add({ targets: figur.blase, scale: 1.3, duration: 150, yoyo: true });
    return this.sage(d.name, text, d.stimme);
  }

  erfuelle(figur) {
    const d = figur.daten;
    this.gibAb();
    this.stand.erfuellt.push(figur.id);
    this.stand.herzen += 1;
    speichereSpielstand(this.stand);
    if (this.letzterWunsch === figur) this.letzterWunsch = null;

    // Wunsch-Blase weg, Freudensprung, Herz und Konfetti
    figur.blase?.destroy();
    figur.blase = null;
    const y0 = figur.bild.y;
    this.tweens.add({ targets: figur.bild, y: y0 - 8, duration: 160, yoyo: true, repeat: 2, ease: 'Quad.easeOut' });
    this.konfetti(figur.bild.x, figur.bild.y - 20);
    spiele('herz');
    const herz = this.add.image(figur.bild.x, figur.bild.y - 24, 'herz').setDepth(99000).setScale(0.3);
    this.tweens.add({
      targets: herz, y: herz.y - 20, scale: 1.1, duration: 500, ease: 'Back.easeOut',
      onComplete: () => {
        const cam = this.cameras.main;
        const bx = (herz.x - cam.worldView.x) * cam.zoom, by = (herz.y - cam.worldView.y) * cam.zoom;
        herz.destroy();
        this.game.events.emit('herzFliegt', { x: bx, y: by, herzen: this.stand.herzen });
      },
    });

    this.sage(d.name, d.danke, d.stimme).then(() => {
      if (this.kapitelFertig()) this.time.delayedCall(600, () => this.boteKommt());
    });
  }

  konfetti(x, y) {
    const farben = [0xf2c94c, 0xe05a8a, 0x7aa6e0, 0x6cc46a, 0xffffff, 0xf08a4b];
    for (let i = 0; i < 26; i++) {
      const s = this.add.rectangle(x, y, 2, 2, Phaser.Utils.Array.GetRandom(farben)).setDepth(99500);
      const winkel = Math.random() * Math.PI * 2, weite = 14 + Math.random() * 26;
      this.tweens.add({
        targets: s, x: x + Math.cos(winkel) * weite, y: y + Math.sin(winkel) * weite + 14,
        alpha: 0, angle: 360, duration: 700 + Math.random() * 400, ease: 'Quad.easeOut',
        onComplete: () => s.destroy(),
      });
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
    const offen = this.dinge.filter((d) => d.typ === 'figur' && d.daten.wunsch && !this.istErfuellt(d.id));
    const naechste = (liste) => liste.sort((a, b) =>
      Phaser.Math.Distance.Between(this.held.x, this.held.y, a.bild.x, a.bild.y) -
      Phaser.Math.Distance.Between(this.held.x, this.held.y, b.bild.x, b.bild.y))[0];

    if (this.traegt) {
      if (this.letzterWunsch && this.letzterWunsch.daten.wunsch === this.traegt && !this.istErfuellt(this.letzterWunsch.id)) return this.letzterWunsch.bild;
      const passend = naechste(offen.filter((d) => d.daten.wunsch === this.traegt));
      if (passend) return passend.bild;
      return this.ausgangZu((w) => w.wunsch === this.traegt);
    }
    if (this.letzterWunsch && !this.istErfuellt(this.letzterWunsch.id)) {
      const quelle = naechste(this.dinge.filter((d) => d.typ === 'quelle' && d.gibt === this.letzterWunsch.daten.wunsch));
      if (quelle) return quelle.bild;
      return this.ausgangZu(null, this.letzterWunsch.daten.wunsch);
    }
    const n = naechste(offen);
    if (n) return n.bild;
    return this.ausgangZu(() => true);
  }

  // Tür zu einer Karte, auf der es einen passenden Wunsch (oder eine Quelle) gibt
  ausgangZu(passt, quelleFuer) {
    for (const a of this.ausgangsFelder) {
      if (!a.karte) continue;
      const k = KARTEN[a.karte];
      let treffer = false;
      if (quelleFuer) {
        treffer = k.karte.some((z) => [...z].some((c) => LEGENDE[c]?.gibt === quelleFuer));
      } else {
        treffer = this.alleWuensche().some((w) => w.karte === a.karte && !this.istErfuellt(w.id) && passt(w));
      }
      if (treffer) return { x: a.x * KACHEL + KACHEL / 2, y: (a.y + 1) * KACHEL, height: 16 };
    }
    return null;
  }

  aktualisierePfeil(zeit) {
    const ziel = this.pfeilZiel();
    if (!ziel) { this.pfeil.setVisible(false); return; }
    const cam = this.cameras.main.worldView;
    const zielX = ziel.x, zielY = ziel.y - (ziel.height || 16) - 22;
    const rand = 10;
    const imBild = zielX > cam.x + rand && zielX < cam.right - rand && zielY > cam.y + rand && zielY < cam.bottom - rand;
    this.pfeil.setVisible(true);
    if (imBild) {
      // Pfeil hüpft über dem Ziel und zeigt nach unten
      this.pfeil.setRotation(0).setScale(0.8).setAlpha(0.95);
      this.pfeil.setPosition(zielX, zielY + Math.sin(zeit / 180) * 3);
    } else {
      // Pfeil am Bildrand zeigt in die richtige Richtung
      const winkel = Math.atan2(ziel.y - 10 - this.held.y, ziel.x - this.held.x);
      const cx = cam.centerX, cy = cam.centerY;
      const px = Phaser.Math.Clamp(cx + Math.cos(winkel) * 400, cam.x + 12, cam.right - 12);
      const py = Phaser.Math.Clamp(cy + Math.sin(winkel) * 400, cam.y + 12, cam.bottom - 12);
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
    this.held.setVelocity(0, 0);
    this.pfeil.setVisible(false);

    const f = this.heldFeld();
    const platz = [[-2, 0], [2, 0], [0, 2], [-1, 1], [1, 1], [0, -2]].map(([dx, dy]) => ({ x: f.x + dx, y: f.y + dy }))
      .find((p) => this.istFrei(p.x, p.y)) || f;
    const px = platz.x * KACHEL + KACHEL / 2, py = (platz.y + 1) * KACHEL;
    const bote = this.add.image(px, py - 60, figurTextur(this, { vorlage: 'bote', haar: 'braun', kleid: 'blau', kopf: 'stahl' }))
      .setOrigin(0.5, 1).setDepth(py).setAlpha(0);
    this.tweens.add({ targets: bote, y: py, alpha: 1, duration: 600, ease: 'Bounce.easeOut' });
    this.konfetti(px, py - 20);
    spiele('fanfare');
    await new Promise((r) => this.time.delayedCall(900, r));

    for (const [name, text, stimme] of BOTE_TEXTE) {
      if (!this.scene.isActive()) return;
      await this.sage(name, text, stimme);
      await new Promise((r) => this.time.delayedCall(400, r));
    }
    if (!this.scene.isActive()) return;
    this.cameras.main.fadeOut(800);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop('Oberflaeche');
      this.scene.start('KapitelEnde', { kapitel: this.stand.kapitel });
    });
  }
}
