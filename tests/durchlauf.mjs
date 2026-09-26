// Automatischer Durchlauf: spielt Kapitel 1 komplett durch (wie ein Kind mit Antippen)
// und prüft, dass es keine Sackgassen gibt. Start: erst "npm run dev", dann "node tests/durchlauf.mjs"
import { chromium } from 'playwright';

const URL = process.env.SPIEL_URL || 'http://localhost:5173/Game---Der-Grosse-Zwerg/';
const BILDER = process.env.BILDER || 'test-bilder';
const fs = await import('node:fs');
fs.mkdirSync(BILDER, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, hasTouch: true });
const fehler = [];
page.on('pageerror', (e) => fehler.push(e.message));
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('ERR_CERT')) fehler.push(m.text()); });
await page.addInitScript(() => localStorage.clear());
await page.goto(URL);
await page.waitForTimeout(2500);
await page.screenshot({ path: `${BILDER}/01-titel.png` });

const warteAuf = async (bedingung, ms = 20000) => {
  const start = Date.now();
  while (Date.now() - start < ms) {
    if (await page.evaluate(bedingung)) return true;
    await page.waitForTimeout(200);
  }
  const zustand = await page.evaluate(() => {
    const w = window.spiel.scene.getScene('Welt');
    return w && w.held ? JSON.stringify({ karte: w.kartenName, x: w.held.x, y: w.held.y, feld: w.heldFeld(), pfad: w.pfad, ziel: w.pfadZiel?.feld, traegt: w.traegt }) : 'keine Welt';
  });
  await page.screenshot({ path: `${BILDER}/fehler.png` });
  throw new Error('Zeitüberschreitung: ' + bedingung.toString() + '\nZustand: ' + zustand);
};

// Spielen drücken -> Geschichte
await page.keyboard.press('Space');
await warteAuf(() => window.spiel.scene.isActive('Geschichte'));
await page.waitForTimeout(800);
await page.screenshot({ path: `${BILDER}/02-geschichte.png` });
for (let i = 0; i < 4; i++) { await page.waitForTimeout(500); await page.keyboard.press('Space'); }
await warteAuf(() => window.spiel.scene.isActive('Welt'));
await page.waitForTimeout(1200);
await page.screenshot({ path: `${BILDER}/03-dorf-start.png` });

// Tippt auf ein Ding (Figur oder Quelle) und wartet, bis der Held dort ist
const tippeAuf = async (filter) => {
  const punkt = await page.evaluate((f) => {
    const w = window.spiel.scene.getScene('Welt');
    const d = w.dinge.find((x) => (x.typ === 'figur' ? x.id.endsWith(':' + f) : x.gibt === f));
    if (!d) return null;
    w.laufeZu(d.bild.x, d.bild.y - 4);
    return true;
  }, filter);
  if (!punkt) throw new Error('Nicht gefunden: ' + filter);
  await warteAuf(() => { const w = window.spiel.scene.getScene('Welt'); return w.pfad.length === 0 && !w.pfadZiel; }, 30000);
  await page.waitForTimeout(700);
};

const traegt = () => page.evaluate(() => window.spiel.scene.getScene('Welt').traegt || null);
const herzen = () => page.evaluate(() => window.spiel.registry.get('stand').herzen);

// Aufgaben im Dorf: [Figur, Gegenstand]
const dorf = [['a', 'essen'], ['b', 'essen'], ['c', 'frucht'], ['e', 'wasser'], ['f', 'wasser'], ['h', 'frucht'], ['j', 'frucht']];
let n = 0;
for (const [figur, ding] of dorf) {
  await tippeAuf(figur); // Wunsch anhören
  if (n === 0) await page.screenshot({ path: `${BILDER}/04-wunsch.png` });
  await tippeAuf(ding); // holen
  if ((await traegt()) !== ding) throw new Error(`Trägt nicht ${ding}, sondern ${await traegt()}`);
  if (n === 0) await page.screenshot({ path: `${BILDER}/05-traegt.png` });
  await tippeAuf(figur); // bringen
  n++;
  if ((await herzen()) !== n) throw new Error(`Erwartet ${n} Herzen, habe ${await herzen()}`);
  console.log(`✔ ${figur} bekommt ${ding} – ${n} Herzen`);
}
await page.screenshot({ path: `${BILDER}/06-dorf-geholfen.png` });

// In die Bibliothek
await page.evaluate(() => { const w = window.spiel.scene.getScene('Welt'); const a = w.ausgangsFelder[0]; w.laufeZu(a.x * 16 + 8, a.y * 16 + 8); });
await warteAuf(() => { const w = window.spiel.scene.getScene('Welt'); return w.kartenName === 'bibliothek' && w.held && !w.wechselt; });
await page.waitForTimeout(1000);
await page.screenshot({ path: `${BILDER}/07-bibliothek.png` });
for (const figur of ['c', 'd']) {
  await tippeAuf(figur);
  await tippeAuf('buch');
  await tippeAuf(figur);
  n++;
  if ((await herzen()) !== n) throw new Error(`Erwartet ${n} Herzen, habe ${await herzen()}`);
  console.log(`✔ Bibliothek ${figur} bekommt buch – ${n} Herzen`);
}
// Der Bote kommt
await warteAuf(() => window.spiel.scene.getScene('Welt').zwischenszene === true);
await page.waitForTimeout(2500);
await page.screenshot({ path: `${BILDER}/08-bote.png` });
await warteAuf(() => window.spiel.scene.isActive('KapitelEnde'), 90000);
await page.waitForTimeout(2500);
await page.screenshot({ path: `${BILDER}/09-kapitel-ende.png` });

await browser.close();
if (fehler.length) { console.error('Fehler im Spiel:\n' + fehler.join('\n')); process.exit(1); }
console.log(`Kapitel 1 komplett durchgespielt: ${n} Herzen, keine Fehler.`);
