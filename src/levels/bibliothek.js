// Die Runen-Bibliothek – riesige Regale, an die nur der Grosse Zwerg hinkommt
export default {
  name: 'Die Runen-Bibliothek',
  musik: 'bibliothek',
  hintergrund: '#1b1420',
  karte: [
    'WWWWWWWWWWWWWWWWWWWWWW',
    'WWRWWWWWWRWWWWRWWWWWRW',
    'WQQQ#L#QQQQ##QQQQ#L#QW',
    'W#########||#########W',
    'W####c####||#########W',
    'W#K#######||####d##K#W',
    'W#########||#########W',
    'W#$#######||#######%#W',
    'W#########||#########W',
    'WWWWWWWWWW1WWWWWWWWWWW',
  ],
  ausgaenge: {
    1: { karte: 'dorf', ziel: 1 },
  },
  figuren: {
    c: {
      name: 'Bibliothekar Thorin',
      aussehen: 'bibliothekar',
      stimme: { hoehe: 0.7, tempo: 0.85 },
      wunsch: 'buch',
      sagt: 'Ach, mein Rücken! Holst du mir bitte das grosse Runenbuch vom obersten Regal?',
      danke: 'Wunderbar! Danke, mein grosser Freund.',
      danach: 'In den Büchern steht: Ein wahrer Held hilft anderen.',
    },
    d: {
      name: 'Pip',
      aussehen: 'pip',
      stimme: { hoehe: 1.9, tempo: 1.05 },
      wunsch: 'buch',
      sagt: 'Ich will das Drachenbuch anschauen! Aber das ist so hoch oben.',
      danke: 'Das Drachenbuch! Danke! Schau, ein Drache!',
      danach: 'Ob Drachen wohl auch Freunde haben?',
    },
  },
};
