import { baueHeld, baueFigur, alsTextur } from './figuren-baukasten.js';
import { baueDrache, baueTier, baueAugen, baueFlugDrache } from './drache.js';
import { FIGUREN_AUSSEHEN } from './figuren-liste.js';

// Alle Bilder des Grossen Zwergs als Texturen anlegen (einmalig beim Start)
export function heldTexturen(scene) {
  if (scene.textures.exists('held_unten_steh0')) return;
  for (const [key, ebene] of Object.entries(baueHeld())) alsTextur(scene, key, ebene);
  alsTextur(scene, 'drachenaugen', baueAugen());
  for (let i = 0; i < 3; i++) alsTextur(scene, `flugdrache${i}`, baueFlugDrache(i));
}

// Grösse einer Figur: wo die Füsse sind und wie viele Felder sie belegt
export function figurMasse(name) {
  if (name === 'drache') return { fussY: 58 / 60, felderB: 3, felderH: 2, schatten: 2.4 };
  return { fussY: 34 / 36, felderB: 1, felderH: 1, schatten: 0.7 };
}

// Bilder einer Figur anlegen; gibt den Namens-Anfang zurück, z.B. "fig_mama_" (+ steh0, reden, …)
// zustand: nur beim Drachen ('ernst' oder 'froh')
export function figurTexturen(scene, name, zustand) {
  const vorsilbe = name === 'drache' ? `fig_drache_${zustand || 'ernst'}_` : `fig_${name}_`;
  if (scene.textures.exists(`${vorsilbe}steh0`)) return vorsilbe;
  let bilder;
  if (name === 'drache') bilder = baueDrache(zustand || 'ernst');
  else if (name === 'pony') bilder = baueTier('pony');
  else {
    const aussehen = FIGUREN_AUSSEHEN[name];
    if (!aussehen) throw new Error(`Unbekanntes Aussehen: ${name} (siehe src/grafik/figuren-liste.js)`);
    bilder = baueFigur(aussehen);
  }
  for (const [bild, ebene] of Object.entries(bilder)) alsTextur(scene, vorsilbe + bild, ebene);
  return vorsilbe;
}
