// Controller-Test: spielt nur mit einem simulierten Xbox-Controller (keine Maus, keine Tastatur)
// vom Titelbild über «Wer spielt?» und das Bild für ein neues Spiel bis ins Dorf, läuft dort los
// und öffnet/schliesst das Menü mit Select und Start.
// Zweimal: Controller als Nummer 0 und als Nummer 1 (unter Windows häufig – dort stürzte Phaser früher ab).
//   SPIEL_URL=http://localhost:4173/Game-Der_Grosse_Zwerg/ node tests/controller.mjs
import { chromium } from 'playwright';

const BASIS = process.env.SPIEL_URL || 'http://localhost:5173/Game-Der_Grosse_Zwerg/';
const A = 0, B = 1, SELECT = 8, START = 9, LINKS = 14, RECHTS = 15;
const pruefe = (ok, text) => { console.log(`${ok ? '✔' : '✘'} ${text}`); if (!ok) process.exitCode = 1; };
const browser = await chromium.launch();

for (const nummer of [0, 1]) {
  console.log(`\nController als Nummer ${nummer}:`);
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const fehler = [];
  page.on('pageerror', (e) => fehler.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && m.text().startsWith('Fehler im Spiel')) fehler.push(m.text().split('\n')[0]); });

  // Ein Standard-Gamepad nachbauen. Wichtig: Phaser übernimmt nur Daten mit aktuellem Zeitstempel.
  await page.addInitScript((nummer) => {
    localStorage.clear();
    const knoepfe = Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 }));
    const pad = { id: 'Xbox Wireless Controller (STANDARD GAMEPAD)', index: nummer, connected: true, mapping: 'standard', timestamp: performance.now(), axes: [0, 0, 0, 0], buttons: knoepfe };
    const liste = [null, null, null, null];
    liste[nummer] = pad;
    navigator.getGamepads = () => liste;
    window.testPad = {
      druecke: async (i) => {
        knoepfe[i].pressed = true; knoepfe[i].value = 1; pad.timestamp = performance.now();
        await new Promise((r) => setTimeout(r, 150));
        knoepfe[i].pressed = false; knoepfe[i].value = 0; pad.timestamp = performance.now();
      },
      stick: (x, y) => { pad.axes[0] = x; pad.axes[1] = y; pad.timestamp = performance.now(); },
    };
  }, nummer);

  const drueck = async (i, warte = 700) => { await page.evaluate((i) => window.testPad.druecke(i), i); await page.waitForTimeout(warte); };
  const szenen = () => page.evaluate(() => window.spiel.scene.getScenes(true).map((s) => s.scene.key));
  const dialogOffen = () => page.evaluate(() => !!window.spiel.scene.getScene('Spielstaende').dialog);
  const laeuft = async () => {
    const vorher = await page.evaluate(() => window.spiel.loop.frame);
    await page.waitForTimeout(400);
    return (await page.evaluate(() => window.spiel.loop.frame)) > vorher + 3;
  };

  await page.goto(`${BASIS}${BASIS.includes('?') ? '&' : '?'}schnell`);
  await page.waitForTimeout(4000);
  await drueck(A, 1500);
  pruefe((await szenen()).includes('Spielstaende'), 'A auf dem Titelbild öffnet «Wer spielt?»');
  await drueck(B, 1500);
  pruefe((await szenen()).includes('Titel') && await laeuft(), 'B auf «Wer spielt?» geht zurück, Spiel läuft weiter');
  await drueck(A, 1500);
  await drueck(RECHTS); await drueck(LINKS);
  await drueck(A, 1200);
  pruefe(await dialogOffen(), 'A öffnet «Neues Spiel»');
  await drueck(B, 800);
  pruefe(!(await dialogOffen()), 'B schliesst den Dialog');
  await drueck(A, 1200);
  await drueck(RECHTS); await drueck(RECHTS);
  await drueck(A, 4000);
  for (let i = 0; i < 8 && !(await szenen()).includes('Welt'); i++) await drueck(A, 700); // Geschichte weiterblättern
  pruefe((await szenen()).includes('Welt'), 'Spiel startet im Dorf');
  pruefe(await page.evaluate(() => window.spiel.registry.get('stand')?.bild === 'kind'), 'Bild «Kind» mit dem Steuerkreuz gewählt');
  const x0 = await page.evaluate(() => window.spiel.scene.getScene('Welt').held.x);
  await page.evaluate(() => window.testPad.stick(1, 0));
  await page.waitForTimeout(800);
  await page.evaluate(() => window.testPad.stick(0, 0));
  pruefe((await page.evaluate(() => window.spiel.scene.getScene('Welt').held.x)) > x0 + 16, 'Mit dem Stick gelaufen');
  await page.waitForTimeout(1500);
  await drueck(SELECT, 1000);
  pruefe((await szenen()).includes('Pause'), 'Select öffnet das Menü');
  await drueck(SELECT, 1000);
  pruefe(!(await szenen()).includes('Pause'), 'Select schliesst das Menü wieder');
  await drueck(START, 1000);
  await drueck(START, 1000);
  pruefe(!(await szenen()).includes('Pause') && await laeuft(), 'Start öffnet und schliesst das Menü, Spiel läuft');
  pruefe(!fehler.length, `Keine Fehler im Browser${fehler.length ? `: ${fehler.join(' | ')}` : ''}`);
  await page.close();
}
await browser.close();
