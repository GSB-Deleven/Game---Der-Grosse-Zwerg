import dorf from './dorf.js';
import bibliothek from './bibliothek.js';

// Alle Karten des Spiels. Neue Karte: Datei anlegen und hier eintragen.
export const KARTEN = { dorf, bibliothek };

// Kapitel fassen Karten zusammen. Ein Kapitel ist geschafft, wenn alle Wünsche erfüllt sind.
// meilensteine: coole Momente mit grosser Einblendung (Splash). Bedingungen:
//   { herzen: 1 }                – so viele Herzen gesammelt
//   { wunsch: 'frucht' }          – alle Wünsche dieser Art erfüllt
//   { figuren: ['dorf:b', …] }    – diesen Figuren wurde geholfen
export const KAPITEL = {
  1: {
    name: 'Die Zwergenfeste',
    karten: ['dorf', 'bibliothek'],
    start: 'dorf',
    meilensteine: [
      { id: 'erstesHerz', wenn: { herzen: 1 }, titel: 'Dein erstes Herz!', text: 'Du hast einem Zwerg geholfen. Wie schön!', bild: 'held_unten_jubeln', farbe: 0xe05a8a },
      { id: 'freunde', wenn: { figuren: ['dorf:b', 'dorf:c', 'dorf:j'] }, titel: 'Freundschaft!', text: 'Die frechen Kinder sind jetzt deine Freunde.', bild: 'fig_tilda_jubeln', farbe: 0x3f8a44 },
      { id: 'aepfel', wenn: { wunsch: 'frucht' }, titel: 'Alle Äpfel gepflückt!', text: 'Nur der Grosse Zwerg kommt so weit hinauf.', bild: 'frucht', farbe: 0xb0413e },
      { id: 'buecher', wenn: { wunsch: 'buch' }, titel: 'Bücher für alle!', text: 'Die Bibliothek ist glücklich.', bild: 'buch', farbe: 0x3f6fb5 },
    ],
  },
};
