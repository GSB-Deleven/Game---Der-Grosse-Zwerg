// Automatischer Durchlauf: spielt das Spiel wie ein Kind – immer dem gelben Pfeil nach.
//   node tests/durchlauf.mjs              -> ganzes Spiel: Titel, Spielstand, Kapitel 1–5, Abspann
//   KAPITEL=3 node tests/durchlauf.mjs    -> nur ab Kapitel 3
// Vorher "npm run dev" starten (oder SPIEL_URL setzen). Bildschirmfotos landen in test-bilder/.
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASIS = process.env.SPIEL_URL || 'http://localhost:5173/Game-Der_Grosse_Zwerg/';
const BILDER = process.env.BILDER || 'test-bilder';
const KAP = process.env.KAPITEL;
fs.mkdirSync(BILDER, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, hasTouch: true });
const fehler = [];
page.on('pageerror', (e) => fehler.push(e.message + '\n' + (e.stack || '').split('\n').slice(0, 3).join('\n')));
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('ERR_CERT')) fehler.push(m.text()); });
await page.addInitScript(() => { if (!sessionStorage.getItem('gestartet')) { localStorage.clear(); sessionStorage.setItem('gestartet', '1'); } });
const trenner = BASIS.includes('?') ? '&' : '?';
await page.goto(`${BASIS}${trenner}schnell${KAP ? `&kapitel=${KAP}` : ''}`);
await page.waitForTimeout(2500);

const foto = async (name) => { await page.screenshot({ path: `${BILDER}/${name}.png` }); };
const zustand = () => page.evaluate(() => {
  const sp = window.spiel;
  const aktiv = sp.scene.getScenes(true).map((s) => s.scene.key);
  const w = sp.scene.getScene('Welt');
  return {
    aktiv, kapitel: sp.registry.get('stand')?.kapitel,
    karte: w?.kartenName, lebt: w?.lebt, zw: w?.zwischenszene, herzen: sp.registry.get('stand')?.herzen,
    pos: w?.held ? [Math.round(w.held.x), Math.round(w.held.y)] : null,
  };
});

if (!KAP) {
  await foto('01-titel');
  await page.keyboard.press('Space');
  await page.waitForTimeout(1200);
  await foto('02-spielstaende');
  await page.evaluate(() => {
    const s = window.spiel.scene.getScene('Spielstaende');
    s.starte(0, { name: 'Liv', bild: 'held', kapitel: 1, erfuellt: [], herzen: 0, introGesehen: false, geschichten: [], fortschritt: {}, ereignisse: [], sterne: 0, fertig: false, meilensteine: [], orteBesucht: [], ort: null, traegt: null, spielzeit: 0 });
  });
}

const gesehen = new Set();
let letzteAktion = '', gleichSeit = 0, runden = 0, geladen = false;
const start = Date.now();
while (Date.now() - start < 25 * 60 * 1000) {
  runden++;
  const z = await zustand();
  const szene = z.aktiv.find((a) => ['Geschichte', 'Splash', 'Entscheidung', 'KapitelEnde', 'Flug', 'Abspann', 'Pause'].includes(a)) || (z.aktiv.includes('Welt') ? 'Welt' : z.aktiv[0]);
  const schluessel = szene === 'Welt' ? `welt-${z.karte}` : `${szene}-${z.kapitel}`;
  if (!gesehen.has(schluessel)) {
    gesehen.add(schluessel);
    await page.waitForTimeout(szene === 'Welt' ? 2200 : 900);
    await foto(`k${z.kapitel}-${schluessel}`);
    console.log(`→ Kapitel ${z.kapitel}: ${szene}${szene === 'Welt' ? ` (${z.karte})` : ''} – ${z.herzen} Herzen`);
  }
  if (szene === 'Abspann') { await page.waitForTimeout(4000); await foto('ende-abspann'); break; }
  if (szene === 'Geschichte') await page.keyboard.press('Space');
  else if (szene === 'Splash') await page.evaluate(() => { const s = window.spiel.scene.getScene('Splash'); if (!s.fertig) s.schliessen(); });
  else if (szene === 'Entscheidung') await page.keyboard.press('Space');
  else if (szene === 'KapitelEnde') await page.evaluate(() => window.spiel.scene.getScene('KapitelEnde').weiter());
  else if (szene === 'Flug') { await page.waitForTimeout(5000); await foto(`k5-flug-mitte`); await page.evaluate(() => window.spiel.scene.getScene('Flug').ende()); await page.waitForTimeout(1500); }
  else if (szene === 'Welt' && z.lebt && !z.zw) {
    // Einmal mitten im Spiel neu laden und im Spielstand weiterspielen
    if (!KAP && !geladen && z.herzen >= 3) {
      geladen = true;
      await page.evaluate(() => window.spiel.scene.getScene('Welt').sichern());
      const vorher = z.pos;
      await page.reload(); await page.waitForTimeout(2500);
      await page.keyboard.press('Space'); await page.waitForTimeout(1000);
      await page.evaluate(() => window.spiel.scene.getScene('Spielstaende').starte(0, JSON.parse(localStorage.getItem('grosser-zwerg-plaetze-v2')).plaetze[0]));
      await page.waitForTimeout(2500);
      const nachher = await zustand();
      if (nachher.herzen !== z.herzen || Math.abs(nachher.pos[0] - vorher[0]) > 3) throw new Error(`Spielstand falsch geladen: ${JSON.stringify({ z, nachher })}`);
      console.log('✔ Spielstand gespeichert, neu geladen und am gleichen Ort weitergespielt');
      continue;
    }
    const aktion = await page.evaluate(() => {
      const w = window.spiel.scene.getScene('Welt');
      if (!w.held || w.wechselt || w.pfad.length || w.pfadZiel || w.aktionGesperrt) return 'warte';
      const ziel = w.pfeilZiel();
      if (!ziel) return 'kein Ziel';
      const f = ziel.ding ? ziel.ding.feld : ziel.feld;
      w.laufeZu(f.x * 16 + 8, f.y * 16 + 8);
      return `${w.kartenName}:${ziel.ding ? (ziel.ding.id || ziel.ding.gibt) : `feld ${f.x},${f.y}`}`;
    });
    if (aktion === letzteAktion && aktion !== 'warte') gleichSeit++; else gleichSeit = 0;
    if (aktion !== 'warte') letzteAktion = aktion;
    if (gleichSeit > 25) { await foto('fehler'); throw new Error(`Hänger bei ${aktion}: ${JSON.stringify(z)}`); }
  }
  await page.waitForTimeout(350);
}
const ende = await zustand();
await browser.close();
if (!ende.aktiv.includes('Abspann')) { console.error('Nicht bis zum Abspann gekommen:', JSON.stringify(ende)); process.exit(1); }
if (fehler.length) { console.error('Fehler im Spiel:\n' + fehler.join('\n')); process.exit(1); }
console.log(`\n✔ Bis zum Abspann durchgespielt: ${ende.herzen} Herzen, ${runden} Schritte, ${Math.round((Date.now() - start) / 1000)} s, keine Fehler.`);
