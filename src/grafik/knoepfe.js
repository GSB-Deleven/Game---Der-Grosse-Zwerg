// Touch-Steuerkreuz im Zwergen-Stil: runder Holzschild mit Eisenrand und Nieten,
// darauf ein Steinkreuz mit goldenen Pfeilen. Der Knauf ist ein goldener Schildbuckel
// mit Hammer-Rune. Gemalt in kleinen Pixeln und später 3-fach vergrössert (Retro-Look).

const FARBE = {
  umriss: '#1b1420',
  eisenDunkel: '#3a3844', eisen: '#5f5d6c', eisenHell: '#9a98a8',
  niete: '#d8d6e0', nieteSchatten: '#4a4856',
  holzDunkel: '#5a3620', holz: '#8a5a32', holzHell: '#a8703e', fuge: '#3e2414',
  steinDunkel: '#4e4c5a', stein: '#7c7a8a', steinHell: '#aeacbc',
  goldDunkel: '#9a6a1a', gold: '#f2c94c', goldHell: '#fff0a0',
};

function malePixel(ctx, farbe, x, y, b = 1, h = 1) {
  ctx.fillStyle = farbe;
  ctx.fillRect(x, y, b, h);
}

export function baueSteuerTexturen(scene) {
  if (scene.textures.exists('kreuz_basis')) return;

  // ---- Schild mit Steinkreuz (64 x 64) --------------------------------------
  const G = 64, M = 31.5;
  const basis = scene.textures.createCanvas('kreuz_basis', G, G);
  const c = basis.getContext();
  for (let y = 0; y < G; y++) {
    for (let x = 0; x < G; x++) {
      const dx = x - M, dy = y - M, d = Math.hypot(dx, dy);
      if (d > 31.5) continue;
      let f;
      if (d > 30.5) f = FARBE.umriss;
      else if (d > 27.5) {
        // Eisenrand: oben links heller, unten rechts dunkler
        const licht = (-dx - dy) / d;
        f = licht > 0.45 ? FARBE.eisenHell : licht < -0.45 ? FARBE.eisenDunkel : FARBE.eisen;
      } else if (d > 26.5) f = FARBE.umriss;
      else {
        // Holzbretter (senkrecht) mit Fugen und Maserung
        const brett = Math.floor((x + 2) / 9);
        const inBrett = (x + 2) % 9;
        if (inBrett === 0) f = FARBE.fuge;
        else {
          f = brett % 2 ? FARBE.holz : FARBE.holzDunkel;
          if (inBrett === 1) f = FARBE.holzHell;
          if ((y * 7 + brett * 13) % 23 === 0) f = FARBE.fuge; // Astlöcher / Maserung
        }
        if (d > 24.5 && dy > 0) f = FARBE.holzDunkel; // Schatten am unteren Rand
      }
      malePixel(c, f, x, y);
    }
  }
  // Nieten im Eisenrand
  for (let i = 0; i < 8; i++) {
    const w = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const nx = Math.round(M + Math.cos(w) * 29 - 1), ny = Math.round(M + Math.sin(w) * 29 - 1);
    malePixel(c, FARBE.nieteSchatten, nx, ny, 2, 2);
    malePixel(c, FARBE.niete, nx, ny, 1, 1);
  }
  // Steinkreuz
  const arm = 7, lang = 22;
  const kreuz = (x, y) => (Math.abs(x - M) <= arm && Math.abs(y - M) <= lang) || (Math.abs(y - M) <= arm && Math.abs(x - M) <= lang);
  for (let y = 0; y < G; y++) {
    for (let x = 0; x < G; x++) {
      if (!kreuz(x, y)) continue;
      const rand = !kreuz(x - 1, y) || !kreuz(x + 1, y) || !kreuz(x, y - 1) || !kreuz(x, y + 1);
      let f = FARBE.stein;
      if (rand) f = FARBE.umriss;
      else if (!kreuz(x, y - 2) || !kreuz(x - 2, y)) f = FARBE.steinHell;
      else if (!kreuz(x, y + 2) || !kreuz(x + 2, y)) f = FARBE.steinDunkel;
      else if ((x * 5 + y * 3) % 17 === 0) f = FARBE.steinDunkel; // Steinkörnung
      malePixel(c, f, x, y);
    }
  }
  // Mulde in der Mitte
  for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) {
    const d = Math.hypot(x, y);
    if (d <= 5) malePixel(c, d > 4 ? FARBE.steinDunkel : '#3a3846', Math.round(M + x), Math.round(M + y));
  }
  // Goldene Pfeile an den Armenden
  const pfeil = (px, py, rx, ry) => {
    // Dreieck mit Spitze in Richtung (rx, ry)
    for (let t = 0; t < 5; t++) {
      for (let s = -4 + t; s <= 4 - t; s++) {
        const x = px + rx * t + (ry ? s : 0), y = py + ry * t + (rx ? s : 0);
        const kante = s === -4 + t || s === 4 - t || t === 4;
        malePixel(c, kante ? FARBE.goldDunkel : t < 2 && s < 0 ? FARBE.goldHell : FARBE.gold, Math.round(x), Math.round(y));
      }
    }
  };
  pfeil(M, M - 16, 0, -1);
  pfeil(M, M + 16, 0, 1);
  pfeil(M - 16, M, -1, 0);
  pfeil(M + 16, M, 1, 0);
  basis.refresh();

  // ---- Knauf: goldener Schildbuckel mit Hammer-Rune (26 x 26) ---------------
  const K = 26, KM = 12.5;
  const knauf = scene.textures.createCanvas('kreuz_knauf', K, K);
  const k = knauf.getContext();
  for (let y = 0; y < K; y++) {
    for (let x = 0; x < K; x++) {
      const dx = x - KM, dy = y - KM, d = Math.hypot(dx, dy);
      if (d > 12.5) continue;
      let f;
      if (d > 11.5) f = FARBE.umriss;
      else if (d > 9.5) f = FARBE.goldDunkel; // Wulst
      else {
        const licht = (-dx - dy) / 10;
        f = licht > 0.5 ? FARBE.goldHell : licht < -0.35 ? FARBE.goldDunkel : FARBE.gold;
      }
      malePixel(k, f, x, y);
    }
  }
  // Hammer: Kopf quer, Stiel senkrecht
  malePixel(k, FARBE.umriss, 8, 8, 10, 4);
  malePixel(k, '#6a4410', 9, 9, 8, 2);
  malePixel(k, FARBE.umriss, 12, 12, 2, 7);
  malePixel(k, '#6a4410', 12, 12, 1, 6);
  // Glanzpunkt
  malePixel(k, '#ffffff', 6, 6, 2, 1);
  malePixel(k, '#ffffff', 6, 7, 1, 1);
  knauf.refresh();
}
