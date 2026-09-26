// Die Runen-Bibliothek – riesige Regale, an die nur der Grosse Zwerg hinkommt
export default {
  name: 'Die Runen-Bibliothek',
  karte: [
    'WWWWWWWWWWWWWWWWWWWW',
    'WWRWWWWWRWWWWWWRWWWW',
    'WQQQ#L#QQQQ#L#QQQQ#W',
    'W########||########W',
    'W####c###||########W',
    'W########||##d#####W',
    'W####K###||###K####W',
    'W########||########W',
    'W########||########W',
    'WWWWWWWWW1WWWWWWWWWW',
  ],
  ausgaenge: {
    1: { karte: 'dorf', ziel: 1 },
  },
  figuren: {
    c: {
      name: 'Bibliothekar Thorin',
      aussehen: { vorlage: 'zwerg', haar: 'grau', kleid: 'lila', kopf: 'gold' },
      stimme: { hoehe: 0.7, tempo: 0.85 },
      wunsch: 'buch',
      sagt: 'Ach, mein Rücken! Holst du mir bitte das grosse Runenbuch vom obersten Regal?',
      danke: 'Wunderbar! Danke, mein grosser Freund.',
      danach: 'In den Büchern steht: Ein wahrer Held hilft anderen.',
    },
    d: {
      name: 'Pip',
      aussehen: { vorlage: 'kind', haar: 'schwarz', kleid: 'gruen', kopf: 'blau' },
      stimme: { hoehe: 1.9, tempo: 1.05 },
      wunsch: 'buch',
      sagt: 'Ich will das Drachenbuch anschauen! Aber das ist so hoch oben.',
      danke: 'Das Drachenbuch! Danke! Schau, ein Drache!',
      danach: 'Ob Drachen wohl auch Freunde haben?',
    },
  },
};
