// Bildschirm-Anpassung: Das Spiel ist für 960 x 540 gestaltet, füllt aber jeden Bildschirm aus
// (Handy quer ist breiter, Tablet ist höher). Die Spielwelt zeigt dann einfach mehr,
// Menüs und Bildergeschichten bleiben in der Mitte, Knöpfe rutschen an die Ränder.
export const BREITE = 960;
export const HOEHE = 540;

// Hochkant (einhändig) ist das Spielfeld schmaler als 960: Menüs werden dann verkleinert
export function zoomFuer(scene, breite = BREITE) {
  return Math.min(1, scene.scale.width / breite, scene.scale.height / HOEHE);
}

// Zusätzlicher sichtbarer Rand links/rechts/oben/unten gegenüber 960 x 540 (in Welt-Punkten der Szene)
export function rand(scene) {
  const z = zoomFuer(scene);
  return { x: (scene.scale.width / z - BREITE) / 2, y: (scene.scale.height / z - HOEHE) / 2 };
}

// Hält die 960 x 540 grosse Gestaltung einer Szene in der Bildschirmmitte.
// breite: wie breit der wichtige Teil ist (z. B. nur das Menü-Fenster), damit er hochkant grösser bleibt
export function mittig(scene, breite = BREITE) {
  const setze = () => {
    const cam = scene.cameras?.main;
    if (!cam) return; // Szene schon beendet
    cam.setZoom(zoomFuer(scene, breite));
    cam.centerOn(BREITE / 2, HOEHE / 2);
  };
  setze();
  scene.scale.on('resize', setze);
  scene.events.once('shutdown', () => scene.scale.off('resize', setze));
}

// Ruft eine Funktion jetzt und bei jeder Grössenänderung auf (bis die Szene endet)
export function beiGroesse(scene, fn) {
  fn();
  const f = () => { if (scene.cameras?.main) fn(); }; // nur solange die Szene lebt
  scene.scale.on('resize', f);
  scene.events.once('shutdown', () => scene.scale.off('resize', f));
}

// Sichere Ränder (iPhone-Notch, abgerundete Ecken) in Spiel-Punkten
let probe = null;
export function sichererRand(scene) {
  try {
    if (!probe) {
      probe = document.createElement('div');
      probe.style.cssText = 'position:fixed;left:0;top:0;visibility:hidden;pointer-events:none;'
        + 'padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);';
      document.body.appendChild(probe);
    }
    const s = getComputedStyle(probe);
    const canvas = scene.game.canvas.getBoundingClientRect();
    const f = canvas.width ? scene.scale.width / canvas.width : 1;
    return {
      links: parseFloat(s.paddingLeft) * f || 0,
      rechts: parseFloat(s.paddingRight) * f || 0,
      oben: parseFloat(s.paddingTop) * f || 0,
      unten: parseFloat(s.paddingBottom) * f || 0,
    };
  } catch (e) {
    return { links: 0, rechts: 0, oben: 0, unten: 0 };
  }
}

// Hochkant spielen: das Spielfeld dreht sich mit (540 x 960), statt «Bitte drehen» zu zeigen.
// Nur auf Handys (schmaler als 600 Punkte). Standardmässig an, im Menü abschaltbar.
export function passeFormAn(spiel, einstellungen) {
  const erlaubt = einstellungen?.hochkant !== 'nein'; // Standard: hochkant einhändig spielen
  document.body.classList.toggle('hochkant-ok', erlaubt);
  const hochkant = erlaubt && window.innerHeight > window.innerWidth && window.innerWidth <= 600;
  const [b, h] = hochkant ? [HOEHE, BREITE] : [BREITE, HOEHE];
  // Im EXPAND-Modus rechnet Phaser mit der Grösse aus der Spiel-Konfiguration
  if (spiel.config.width !== b) {
    spiel.config.width = b;
    spiel.config.height = h;
    spiel.scale.refresh();
  }
}
