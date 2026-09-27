// Bildschirm-Anpassung: Das Spiel ist für 960 x 540 gestaltet, füllt aber jeden Bildschirm aus
// (Handy quer ist breiter, Tablet ist höher). Die Spielwelt zeigt dann einfach mehr,
// Menüs und Bildergeschichten bleiben in der Mitte, Knöpfe rutschen an die Ränder.
export const BREITE = 960;
export const HOEHE = 540;

// Zusätzlicher Rand links/rechts/oben/unten gegenüber 960 x 540 (in Spiel-Punkten)
export function rand(scene) {
  return { x: (scene.scale.width - BREITE) / 2, y: (scene.scale.height - HOEHE) / 2 };
}

// Hält die 960 x 540 grosse Gestaltung einer Szene in der Bildschirmmitte
export function mittig(scene) {
  const setze = () => {
    const r = rand(scene);
    scene.cameras.main.setScroll(-r.x, -r.y);
  };
  setze();
  scene.scale.on('resize', setze);
  scene.events.once('shutdown', () => scene.scale.off('resize', setze));
}

// Ruft eine Funktion jetzt und bei jeder Grössenänderung auf (bis die Szene endet)
export function beiGroesse(scene, fn) {
  fn();
  const f = () => fn();
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
