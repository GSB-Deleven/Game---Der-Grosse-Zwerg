// MISSIONEN DER EHRENGARDE (Kapitel 6)
// Nach dem grossen Fest beschützen der Grosse Zwerg und Füürio das Zwergenreich.
// Jede Mission bringt eine Belohnung: das Zuhause wird grösser oder es gibt neue Kleider.
//
// Neue Mission:
//   1. Eine Karte in src/levels/ anlegen (wie damm.js) und in index.js unter KARTEN und KAPITEL[6].karten eintragen.
//      Am Ende des Drehbuchs steht { missionFertig: 'meine-id' } – dann geht es nach Hause.
//   2. Hier unten in MISSIONEN eintragen.
//      karte:  auf welcher Karte die Mission spielt   – oder –   szene + daten (z.B. der Flug)
//      bild:   ein Bild für die Karte am Missionsbrett (Gegenstand oder obj_…)
//      belohnung: { haus: 2 } (nächste Ausbaustufe) oder { kleid: 'name' } (siehe KLEIDER)
export const MISSIONEN = [
  {
    id: 'damm',
    titel: 'Der Staudamm',
    text: 'Der Fluss ist über die Ufer getreten! Baut mit Füürio einen Damm aus Baumstämmen.',
    bild: 'holz',
    karte: 'damm',
    belohnung: { haus: 1 },
  },
  {
    id: 'post',
    titel: 'Post mit Füürio',
    text: 'Die Brieftauben haben Schnupfen. Fliegt die Briefe durchs ganze Reich!',
    bild: 'brief',
    szene: 'Flug',
    daten: { mission: 'post' },
    belohnung: { kleid: 'garde' },
  },
];

// Ausbaustufen des Zuhauses (Bild: obj_zuhause0, obj_zuhause1, …)
export const HAUS = [
  { name: 'ein kleines Zelt' },
  { name: 'eine gemütliche Holzhütte', sagt: 'Eine Holzhütte! Jetzt wird es im Winter schön warm.' },
  { name: 'ein Steinhaus mit Fahne', sagt: 'Ein richtiges Steinhaus mit Fahne! Wie ein kleines Schloss.' },
];

// Kleider für den Grossen Zwerg: Farben aus RAMPEN (src/grafik/figuren-baukasten.js)
export const KLEIDER = {
  standard: { name: 'die blaue Tunika', farben: {} },
  garde: { name: 'die Rüstung der Garde', farben: { tunika: 'weinrot', helm: 'gold', rand: 'stahl' }, sagt: 'Eine goldene Garde-Rüstung! Die glänzt ja wie die Sonne!' },
};

// Text und Bild für die Belohnung einer Mission
export function belohnungVon(m) {
  if (m.belohnung.haus !== undefined) return { text: `Belohnung: ${HAUS[m.belohnung.haus].name}!`, bild: `obj_zuhause${m.belohnung.haus}`, sagt: HAUS[m.belohnung.haus].sagt };
  const k = KLEIDER[m.belohnung.kleid];
  return { text: `Belohnung: ${k.name}!`, bild: `kleid_${m.belohnung.kleid}`, sagt: k.sagt };
}
