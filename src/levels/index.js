import dorf from './dorf.js';
import bibliothek from './bibliothek.js';

// Alle Karten des Spiels. Neue Karte: Datei anlegen und hier eintragen.
export const KARTEN = { dorf, bibliothek };

// Kapitel fassen Karten zusammen. Ein Kapitel ist geschafft, wenn alle Wünsche erfüllt sind.
export const KAPITEL = {
  1: { name: 'Die Zwergenfeste', karten: ['dorf', 'bibliothek'], start: 'dorf' },
};
