// Controller-Test: spielt nur mit einem simulierten Xbox-Controller (keine Maus, keine Tastatur)
// vom Titelbild über «Wer spielt?» und das Bild für ein neues Spiel bis ins Dorf und läuft dort los.
//   SPIEL_URL=http://localhost:4173/Game-Der_Grosse_Zwerg/ node tests/controller.mjs
import { chromium } from 'playwright';

const BASIS = process.env.SPIEL_URL || 'http://localhost:5173/Game-Der_Grosse_Zwerg/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const fehler = [];
page.on('pageerror', (e) => fehler.push(e.message));

// Ein Standard-Gamepad nachbauen. Wichtig: Phaser übernimmt nur Daten mit aktuellem Zeitstempel.
await page.addInitScript(() => {
  localStorage.clear();
  const knoepfe = Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 }));
  const pad = { id: 'Xbox Wireless Controller (STANDARD GAMEPAD)', index: 0, connected: true, mapping: 'standard', timestamp: performance.now(), axes: [0, 0, 0, 0], buttons: knoepfe };
  navigator.getGamepads = () => [pad, null, null, null];
  window.testPad = {
    druecke: async (i) => {
      knoepfe[i].pressed = true; knoepfe[i].value = 1; pad.timestamp = performance.now();
      await new Promise((r) => setTimeout(r, 120));
      knoepfe[i].pressed = false; knoepfe[i].value = 0; pad.timestamp = performance.now();
    },
    stick: (x, y) => { pad.axes[0] = x; pad.axes[1] = y; pad.timestamp = performance.now(); },
  };
});

const A = 0, B = 1, LINKS = 14, RECHTS = 15;
const drueck = async (i, warte = 700) => { await page.evaluate((i) => window.testPad.druecke(i), i); await page.waitForTimeout(warte); };
const szenen = () => page.evaluate(() => window.spiel.scene.getScenes(true).map((s) => s.scene.key));
const pruefe = (ok, text) => { console.log(`${ok ? '✔' : '✘'} ${text}`); if (!ok) process.exitCode = 1; };

await page.goto(`${BASIS}${BASIS.includes('?') ? '&' : '?'}schnell`);
await page.waitForTimeout(4000);
await drueck(A, 1500);
pruefe((await szenen()).includes('Spielstaende'), 'A auf dem Titelbild öffnet «Wer spielt?»');
await drueck(RECHTS); await drueck(LINKS);
await drueck(A, 1200);
pruefe(await page.evaluate(() => !!window.spiel.scene.getScene('Spielstaende').dialog), 'A öffnet «Neues Spiel»');
await drueck(B, 800);
pruefe(await page.evaluate(() => !window.spiel.scene.getScene('Spielstaende').dialog), 'B schliesst den Dialog');
await drueck(A, 1200);
await drueck(RECHTS); await drueck(RECHTS);
await drueck(A, 4000);
for (let i = 0; i < 8 && !(await szenen()).includes('Welt'); i++) await drueck(A, 700); // Geschichte weiterblättern
pruefe((await szenen()).includes('Welt'), 'Spiel startet im Dorf');
pruefe(await page.evaluate(() => window.spiel.registry.get('stand')?.bild === 'kind'), 'Bild «Kind» mit dem Steuerkreuz gewählt');
const vorher = await page.evaluate(() => window.spiel.scene.getScene('Welt').held.x);
await page.evaluate(() => window.testPad.stick(1, 0));
await page.waitForTimeout(800);
await page.evaluate(() => window.testPad.stick(0, 0));
const nachher = await page.evaluate(() => window.spiel.scene.getScene('Welt').held.x);
pruefe(nachher > vorher + 16, 'Mit dem Stick gelaufen');
pruefe(!fehler.length, `Keine Fehler im Browser${fehler.length ? `: ${fehler.join(' | ')}` : ''}`);
await browser.close();
