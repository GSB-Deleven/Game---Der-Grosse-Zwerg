// KAPITEL 1 – Die Zwergenfeste im Bergtal
// Jeder Buchstabe ist eine Kachel (16 x 16 Pixel). Bedeutung: siehe legende.js
export default {
  name: 'Die Zwergenfeste',
  musik: 'dorf',
  karte: [
    'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
    'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
    'MMMWWRWWWRWWMMMMMMMMMMMMWWRWWWRWWMMMMMMM',
    'MMMWWWWWWWWWMMMMMMMMMMMMWWWW1WWWWMMMMMMM',
    'MMTL..::::.L..T..,.......L.:::.L...T.MMM',
    'MM.........a.......,.......::....,...TMM',
    'MM,.b..::.c......T..........:.........MM',
    'MM.....::....................:.....EKK.M',
    'MMT....:::::::::::::::::::::::::::.:A.eM',
    'MM.......:.........:........:......:..KM',
    'MM.,.....:.....B...:...S+...:......::..M',
    'MMT......:.........:........:.......:..M',
    'MM......f:.........:...g....:.......:.TM',
    'M..PP....:::::::::::::::::::::::::::::.M',
    'M.PPP....:........................,..:.M',
    'M..P.....:..T.......,......____......:.M',
    'MT......,:.........T.......____F...F.:.M',
    'M~~~~~~..:.......,.........____..h...:.M',
    'M~~~~~~~.:...........F...............:.M',
    'M~~~~~~~~=~~~~.............j.........:TM',
    'MT~~~~~~.:.~~~~~.T.....F.......F...F...M',
    'MM,......:...,.........................M',
    'MMT..,...@.......T...T......T....T...TMM',
    'MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
  ],
  ausgaenge: {
    1: { karte: 'bibliothek', ziel: 1 },
  },
  // Figuren: Buchstabe auf der Karte -> wer ist das und was wünscht er/sie sich?
  //   aussehen: vorlage (zwerg, zwergin, kind), haar, kleid, kopf (Farben siehe eigene-sprites.js)
  //   wunsch:   was sie sich wünschen (essen, wasser, buch, frucht)
  //   neckt:    wird beim ersten Mal gesagt (die frechen Zwerge)
  //   sagt:     die Bitte
  //   danke:    wenn der Wunsch erfüllt wird
  //   danach:   was sie später sagen
  figuren: {
    a: {
      name: 'Mama Hilde',
      aussehen: { vorlage: 'zwergin', haar: 'braun', kleid: 'lila', kopf: 'gold' },
      stimme: { hoehe: 1.25 },
      wunsch: 'essen',
      sagt: 'Hallo, mein Grosser! Holst du uns bitte Essen vom Markt? Die Kinder haben so Hunger.',
      danke: 'Oh, danke schön! Du bist ein Schatz!',
      danach: 'Mit dir ist unser Dorf so viel schöner.',
    },
    b: {
      name: 'Tilda',
      aussehen: { vorlage: 'kind', haar: 'blond', kleid: 'blau', kopf: 'rosa' },
      stimme: { hoehe: 1.8, tempo: 1.05 },
      wunsch: 'essen',
      neckt: 'Hihi! Du bist doch gar kein Zwerg, du bist viel zu gross!',
      sagt: 'Mein Bauch knurrt. Bringst du mir auch etwas zu essen?',
      danke: 'Mmmh, lecker! Danke! Du bist doch ein richtig toller Zwerg!',
      danach: 'Du bist der liebste Zwerg im ganzen Dorf!',
    },
    c: {
      name: 'Bruno',
      aussehen: { vorlage: 'kind', haar: 'rot', kleid: 'orange', kopf: 'gruen' },
      stimme: { hoehe: 1.6, tempo: 1.05 },
      wunsch: 'frucht',
      neckt: 'Haha, schaut mal, der Riesen-Zwerg!',
      sagt: 'Ich möchte so gerne einen Apfel. Aber die hängen ganz, ganz oben am Baum.',
      danke: 'Juhuu, ein Apfel! Danke! Du bist so stark!',
      danach: 'Wenn ich gross bin, will ich so sein wie du!',
    },
    e: {
      name: 'Schmied Balin',
      aussehen: { vorlage: 'zwerg', haar: 'schwarz', kleid: 'leder', kopf: 'stahl' },
      stimme: { hoehe: 0.6, tempo: 0.9 },
      wunsch: 'wasser',
      sagt: 'Puh, an der Esse ist es heiss! Holst du mir einen Kessel Wasser vom Brunnen? Der ist so schwer.',
      danke: 'Ah, herrlich kühl! Danke, starker Freund!',
      danach: 'Klong, klong! Ich schmiede dir einmal einen schönen Helm.',
    },
    f: {
      name: 'Oma Runa',
      aussehen: { vorlage: 'zwergin', haar: 'grau', kleid: 'gruen', kopf: 'gold' },
      stimme: { hoehe: 1.1, tempo: 0.85 },
      wunsch: 'wasser',
      sagt: 'Meine Pilze sind so durstig. Bringst du mir bitte Wasser vom Brunnen?',
      danke: 'Danke, mein Lieber. Schau, wie die Pilze sich freuen!',
      danach: 'Ein grosses Herz ist mehr wert als alles Gold.',
    },
    g: {
      name: 'Händler Dwalin',
      aussehen: { vorlage: 'zwerg', haar: 'grau', kleid: 'blau', kopf: 'stahl' },
      stimme: { hoehe: 0.8 },
      // hat keinen Wunsch – er verteilt Essen
      sagt: 'Willkommen am Markt! Nimm dir Essen mit, so viel du tragen kannst.',
    },
    h: {
      name: 'Bauer Gorm',
      aussehen: { vorlage: 'zwerg', haar: 'braun', kleid: 'gruen', kopf: 'leder' },
      stimme: { hoehe: 0.75 },
      wunsch: 'frucht',
      sagt: 'Die schönsten Äpfel hängen ganz oben. Da komme ich nie hin. Pflückst du mir einen?',
      danke: 'Was für ein prächtiger Apfel! Danke dir!',
      danach: 'Ohne dich wäre die Ernte nur halb so gut.',
    },
    j: {
      name: 'Nella',
      aussehen: { vorlage: 'kind', haar: 'braun', kleid: 'lila', kopf: 'orange' },
      stimme: { hoehe: 1.7, tempo: 1.05 },
      wunsch: 'frucht',
      neckt: 'Bist du ein Zwerg oder ein Baum? Hihi!',
      sagt: 'Kannst du mir einen Apfel von ganz oben holen?',
      danke: 'Danke! Du bist mein allerbester Freund!',
      danach: 'Ich hab dich lieb, Grosser Zwerg!',
    },
  },
  // Was passiert, wenn alle Wünsche im Kapitel erfüllt sind?
  wennFertig: 'bote',
};
