import { baueHeld, baueFigur, alsTextur } from './figuren-baukasten.js';
import { FIGUREN_AUSSEHEN } from './figuren-liste.js';

// Alle Bilder des Grossen Zwergs als Texturen anlegen (einmalig beim Start)
export function heldTexturen(scene) {
  if (scene.textures.exists('held_unten_steh0')) return;
  for (const [key, ebene] of Object.entries(baueHeld())) alsTextur(scene, key, ebene);
}

// Bilder einer Figur anlegen; gibt den Namens-Anfang zurück, z.B. "fig_mama_" (+ steh0, reden, …)
export function figurTexturen(scene, name) {
  const aussehen = FIGUREN_AUSSEHEN[name];
  if (!aussehen) throw new Error(`Unbekanntes Aussehen: ${name} (siehe src/grafik/figuren-liste.js)`);
  const vorsilbe = `fig_${name}_`;
  if (!scene.textures.exists(`${vorsilbe}steh0`)) {
    for (const [bild, ebene] of Object.entries(baueFigur(aussehen))) alsTextur(scene, vorsilbe + bild, ebene);
  }
  return vorsilbe;
}
