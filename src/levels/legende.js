// Was bedeutet welcher Buchstabe auf einer Karte?
//   boden  = welche Boden-Kachel darunter liegt (siehe src/grafik/texturen.js)
//   fest   = kann man nicht durchlaufen
//   objekt = Bild, das auf die Kachel gestellt wird
//   gibt   = hier kann der Grosse Zwerg etwas holen
//   bodenWieNachbar = nimmt den Boden der Nachbarkachel (passt drinnen und draussen)
// Kleinbuchstaben (a, b, c …) sind Figuren – sie stehen in der Level-Datei unter "figuren".
// Ziffern (1, 2, 3 …) sind Türen/Ausgänge – sie stehen unter "ausgaenge".
export const LEGENDE = {
  '.': { boden: 'gras' },
  ',': { boden: 'blumen' },
  ':': { boden: 'weg' },
  '_': { boden: 'erde' },
  '#': { boden: 'steinboden' },
  '|': { boden: 'teppich' },
  '=': { boden: 'bruecke' },
  '-': { boden: 'holzboden' },
  '~': { boden: 'wasser', fest: true },
  'M': { boden: 'fels', fest: true },
  'W': { boden: 'felswand', fest: true },
  'R': { boden: 'rune', fest: true },
  '@': { boden: 'weg', start: true },
  'T': { boden: 'gras', fest: true, objekt: 'tanne' },
  'F': { boden: 'gras', fest: true, objekt: 'obstbaum', gibt: 'frucht' },
  'B': { boden: 'weg', fest: true, objekt: 'brunnen', gibt: 'wasser' },
  'S': { boden: 'weg', fest: true, objekt: 'marktstand', breite: 2, gibt: 'essen' },
  '+': { boden: 'weg', fest: true }, // gehört zu einem breiten Objekt links davon
  'Q': { boden: 'steinboden', fest: true, objekt: 'buecherregal', gibt: 'buch' },
  'A': { boden: 'weg', fest: true, objekt: 'amboss', bodenWieNachbar: true },
  'E': { boden: 'weg', fest: true, objekt: 'esse', bodenWieNachbar: true },
  'K': { boden: 'weg', fest: true, objekt: 'fass', bodenWieNachbar: true },
  'L': { boden: 'weg', fest: true, objekt: 'fackel', bodenWieNachbar: true },
  'P': { boden: 'gras', objekt: 'pilze' },
};
