import { MISSIONEN } from '../levels/missionen.js';
import { sichere } from './speichern.js';
import { stoppeMusik } from './musik.js';
import { verstummen } from './stimme.js';

// Eine Mission starten. Schon gespielte Missionen können nochmals gespielt werden:
// dann wird die Karte wieder wie neu (nur die Belohnung gibt es nicht zweimal).
export function starteMission(scene, id) {
  const m = MISSIONEN.find((x) => x.id === id);
  const stand = scene.registry.get('stand');
  if (m.karte) {
    const p = `${m.karte}:`;
    stand.erfuellt = stand.erfuellt.filter((e) => !e.startsWith(p));
    stand.ereignisse = stand.ereignisse.filter((e) => !e.startsWith(p));
    for (const k of Object.keys(stand.fortschritt)) if (k.startsWith(p)) delete stand.fortschritt[k];
  }
  stand.ort = null;
  stand.traegt = null;
  scene.registry.set('traegt', null);
  sichere(scene.registry);
  verstummen();
  stoppeMusik();
  ['Welt', 'Oberflaeche', 'Missionen'].forEach((s) => scene.scene.stop(s));
  if (m.karte) scene.scene.start('Welt', { karte: m.karte });
  else scene.scene.start(m.szene, m.daten);
}

// Mission geschafft: Belohnung eintragen (nur beim ersten Mal). Zuhause zeigt sie dann (stand.neu).
export function schliesseMissionAb(registry, id) {
  const m = MISSIONEN.find((x) => x.id === id);
  const stand = registry.get('stand');
  stand.missionen = stand.missionen || [];
  if (!m || stand.missionen.includes(id)) return;
  stand.missionen.push(id);
  stand.herzen += 1;
  if (m.belohnung.haus !== undefined) stand.haus = Math.max(stand.haus || 0, m.belohnung.haus);
  if (m.belohnung.kleid) {
    stand.kleider = [...new Set([...(stand.kleider || ['standard']), m.belohnung.kleid])];
    stand.kleid = m.belohnung.kleid;
  }
  stand.neu = id;
  stand.ort = null;
  sichere(registry);
}
