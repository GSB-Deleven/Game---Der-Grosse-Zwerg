// Prüft alle Karten: Sind alle Figuren, Quellen, Türen und Auslöser erreichbar?
// Einmal vor den Bauaufgaben (Schild + passende Quelle müssen erreichbar sein)
// und einmal, nachdem alles gebaut ist. Aufruf: npm run pruefen
import { KARTEN } from '../src/levels/index.js';
import { LEGENDE } from '../src/levels/legende.js';

let fehler = 0;
const melde = (t) => { console.log('  ✗ ' + t); fehler++; };

for (const [name, k] of Object.entries(KARTEN)) {
  const zeilen = k.karte.map((z) => [...z]);
  const H = zeilen.length, B = zeilen[0].length;
  zeilen.forEach((z, y) => { if (z.length !== B) melde(`${name}: Zeile ${y} hat ${z.length} statt ${B} Zeichen`); });
  const figuren = k.figuren || {};
  for (const z of new Set(zeilen.flat())) {
    if (/[a-z]/.test(z) && !figuren[z]) melde(`${name}: Figur "${z}" steht auf der Karte, fehlt aber unter figuren`);
    if (!/[a-z0-9@]/.test(z) && !(z in LEGENDE)) melde(`${name}: Zeichen "${z}" fehlt in der Legende`);
    if (/[1-9]/.test(z) && !k.ausgaenge?.[z]) melde(`${name}: Ausgang "${z}" ist nicht unter ausgaenge beschrieben`);
  }
  for (const [nr, a] of Object.entries(k.ausgaenge || {})) {
    if (!KARTEN[a.karte]) melde(`${name}: Ausgang ${nr} führt zu unbekannter Karte "${a.karte}"`);
    else if (!KARTEN[a.karte].karte.some((z) => z.includes(String(a.ziel)))) melde(`${name}: Ziel-Tür ${a.ziel} fehlt auf Karte ${a.karte}`);
  }

  const pruefe = (gebaut) => {
    const g = zeilen.map((r) => r.slice());
    const fest = g.map((r) => r.map((c) => !!LEGENDE[c]?.fest));
    const dinge = [];
    g.forEach((r, y) => r.forEach((c, x) => {
      const f = figuren[c];
      if (/[a-z]/.test(c) && f) {
        if (f.baustelle) {
          if (gebaut) f.baustelle.baue.forEach((st) => (typeof st[0] === 'number' ? [st] : st).forEach(([bx, by]) => { fest[by][bx] = !!LEGENDE[f.baustelle.zu]?.fest; }));
          else fest[y][x] = true;
          if (!gebaut) dinge.push({ was: `Bauaufgabe ${c}`, x, y, b: 1, h: 1, wunsch: f.wunsch });
        } else {
          const gross = f.aussehen === 'drache';
          const fx = gross ? x - 1 : x, fy = gross ? y - 1 : y, fb = gross ? 3 : 1, fh = gross ? 2 : 1;
          for (let yy = fy; yy < fy + fh; yy++) for (let xx = fx; xx < fx + fb; xx++) fest[yy][xx] = true;
          dinge.push({ was: `Figur ${c} (${f.name})`, x: fx, y: fy, b: fb, h: fh });
        }
      } else if (LEGENDE[c]?.gibt) dinge.push({ was: `Quelle ${c} (${LEGENDE[c].gibt})`, x, y, b: LEGENDE[c].breite || 1, h: 1, gibt: LEGENDE[c].gibt });
      else if (/[1-9]/.test(c)) dinge.push({ was: `Tür ${c}`, x, y, b: 1, h: 1, tuer: true });
      else if (c === '0') dinge.push({ was: 'Auslöser', x, y, b: 1, h: 1, tuer: true });
    }));
    // Startpunkte: @ und Felder neben Türen
    const start = [];
    g.forEach((r, y) => r.forEach((c, x) => {
      if (c === '@') start.push([x, y]);
      if (/[1-9]/.test(c)) for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) if (fest[y + dy]?.[x + dx] === false) { start.push([x + dx, y + dy]); break; }
    }));
    const frei = (x, y) => y >= 0 && x >= 0 && y < H && x < B && !fest[y][x];
    const erreicht = new Set();
    const schlange = start.slice(0, 1);
    schlange.forEach(([x, y]) => erreicht.add(`${x},${y}`));
    while (schlange.length) {
      const [x, y] = schlange.shift();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const n = [x + dx, y + dy];
        if ((frei(...n) || /[0-9]/.test(g[n[1]]?.[n[0]])) && !erreicht.has(n.join(','))) {
          erreicht.add(n.join(','));
          if (frei(...n)) schlange.push(n);
        }
      }
    }
    const nah = (d) => {
      if (d.tuer) return erreicht.has(`${d.x},${d.y}`);
      for (let y = d.y - 1; y <= d.y + d.h; y++) for (let x = d.x - 1; x <= d.x + d.b; x++) if (erreicht.has(`${x},${y}`) && frei(x, y)) return true;
      return false;
    };
    for (const d of dinge) {
      if (!gebaut && !d.wunsch && !d.gibt) continue; // vor dem Bauen nur Bauaufgaben + Quellen prüfen
      if (!nah(d)) {
        const quelleFuerBau = !gebaut && d.gibt && !dinge.some((x) => x.wunsch === d.gibt);
        if (!quelleFuerBau) melde(`${name}${gebaut ? '' : ' (vor dem Bauen)'}: ${d.was} bei (${d.x},${d.y}) ist nicht erreichbar`);
      }
    }
  };
  pruefe(false);
  pruefe(true);
  console.log(`${fehler ? '…' : '✓'} ${name} (${B}×${H})`);
}
console.log(fehler ? `\n${fehler} Problem(e) gefunden.` : '\nAlle Karten sind in Ordnung.');
process.exit(fehler ? 1 : 0);
