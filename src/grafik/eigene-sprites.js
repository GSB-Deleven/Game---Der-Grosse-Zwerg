// Selbst gezeichnete Pixel-Figuren im Dungeons-&-Dragons-Stil.
// Jeder Buchstabe ist ein Pixel, die Farbe steht in PALETTE. "." = durchsichtig.
// Tipp: Figuren kann man hier direkt umzeichnen – einfach Buchstaben ändern.

export const PALETTE = {
  k: '#2b1d1a', // Umriss
  s: '#f2c29a', // Haut
  S: '#cf9272', // Haut Schatten
  e: '#2b1d1a', // Augen
  r: '#d0502a', // Bart rot
  R: '#8e2f17', // Bart rot dunkel
  o: '#f08a4b', // Bart Glanz
  h: '#c3ccd4', // Stahl
  H: '#6f7a86', // Stahl dunkel
  w: '#f3ead2', // Horn
  W: '#c7b58a', // Horn Schatten
  y: '#f2c94c', // Gold
  Y: '#b8862b', // Gold dunkel
  c: '#3f6fb5', // Tunika
  C: '#2b4c80', // Tunika dunkel
  b: '#8a5a33', // Leder
  B: '#5b3a22', // Leder dunkel / Hose
  n: '#3b2a22', // Stiefel
  x: '#ffffff', // Weiss
  g: '#4f9a4a', // Grün
  G: '#2f6b34', // Grün dunkel
  v: '#7cc862', // Grün hell
  p: '#e05a8a', // Rosa
  P: '#9c3564', // Rosa dunkel
  u: '#7aa6e0', // Hellblau
  U: '#3d6aa8', // Blau
  l: '#e8e0c8', // Pergament
  L: '#a89a78', // Pergament dunkel
  m: '#8a8f99', // Stein
  M: '#5c606b', // Stein dunkel
  a: '#b0413e', // Apfelrot
  A: '#7a2626', // Apfelrot dunkel
  f: '#ff9d2e', // Feuer
  F: '#ffe066', // Feuer hell
  t: '#6b4a2e', // Holz
  T: '#4a3220', // Holz dunkel
};

// ---------------------------------------------------------------------------
// DER GROSSE ZWERG (16 x 32) – Hörnerhelm, roter Flechtbart, Rucksack
// ---------------------------------------------------------------------------
const helden_kopf_vorne = [
  '.k............k.',
  'kwk..........kwk',
  'kwk.kkkkkkkk.kwk',
  'kwWkhhhhhhhhkWwk',
  '.kWkhhxhhhhhkWk.',
  '..kHhhhhhhhhhHk.',
  '..kyyyyyyyyyyk..',
  '..kssssssssssk..',
  '..ksseSsssSesk..',
  '..krsssSSsssrk..',
  '.krrrssssssrrrk.',
  '.krorrrRRrrrork.',
  '.krrorrrrrrorrk.',
];
const helden_koerper_vorne = [
  'kbrrorrrrrrorrbk',
  'kcbrrrrrrrrrrbck',
  'kccrrrRrrRrrrcck',
  'kccrrorrrrorrcck',
  'kCccrrrRRrrrccCk',
  'kCcckrrrrrrkccCk',
  'sCccckyrryk.ccCs',
  'sBbbbbyRRybbbbBs',
  'kCccckrkkrkcccCk',
  'kCcccckRRkccccCk',
  '.kCcccckkccccCk.',
  '.kCcccccccccCCk.',
];
const helden_beine = [
  ['..kBBBBBBBBBBk..', '..kBBBBkkBBBBk..', '..kBBBk..kBBBk..', '..kBBBk..kBBBk..', '..knnnk..knnnk..', '.knnnnk..knnnnk.', '.kkkkkk..kkkkkk.'],
  ['..kBBBBBBBBBBk..', '..kBBBBkkBBBBk..', '..kBBBk..kBBBk..', '..knnnk..kBBBk..', '.knnnnk..kBBBk..', '.kkkkkk..knnnnk.', '.........kkkkkk.'],
  ['..kBBBBBBBBBBk..', '..kBBBBkkBBBBk..', '..kBBBk..kBBBk..', '..kBBBk..knnnk..', '..kBBBk..knnnnk.', '.knnnnk..kkkkkk.', '.kkkkkk.........'],
];

const helden_kopf_hinten = [
  '.k............k.',
  'kwk..........kwk',
  'kwk.kkkkkkkk.kwk',
  'kwWkhhhhhhhhkWwk',
  '.kWkhhhhhhhhkWk.',
  '..kHhhhhhhhhhHk.',
  '..kyyyyyyyyyyk..',
  '..krrrrrrrrrrk..',
  '..krrRrrrrRrrk..',
  '..krrrrrrrrrrk..',
  '.kkrRrrrrrrRrkk.',
  '.kckkkkkkkkkkck.',
  'kcckbbbbbbbbkcck',
];
const helden_koerper_hinten = [
  'kcckbwwwwwwbkcck',
  'kcckbWWWWWWbkcck',
  'kcckbbbbbbbbkcck',
  'kcckbbbyybbbkcck',
  'kCckbbbbbbbbkcCk',
  'kCckBBBBBBBBkcCk',
  'sCcckkkkkkkkccCs',
  'sBbbbbbbbbbbbbBs',
  'kCccccccccccccCk',
  'kCccccccccccccCk',
  '.kCccccccccccCk.',
  '.kCcccccccccCCk.',
];

const helden_seite = [
  '..........k.....',
  '.........kwk....',
  '....kkkkkkwk....',
  '...khhhhhkWk....',
  '..khhhhxhhkk....',
  '..kHhhhhhhhk....',
  '..kyyyyyyyyyk...',
  '..krrrsssssk....',
  '..krrrssssek....',
  '..krRrsssssSk...',
  '..krrrrssrrrk...',
  '.kkkrrrorrrrrk..',
  'kbbkrrrrrRrrrk..',
];
const helden_seite_koerper = [
  'kbbkcrrrrrrRrk..',
  'kbbkccrrorrrk...',
  'kbbkccrrRrrrk...',
  'kbbkcccrrrrk....',
  'kBbkcccrRrrk....',
  'kBbkcccsrrk.....',
  'kBBkcccssyk.....',
  '.kkbbbbbbyk.....',
  '..kCcccccck.....',
  '..kCcccccck.....',
  '..kCccccccck....',
  '..kCCcccccck....',
];
const helden_seite_beine = [
  ['...kBBBBBBk.....', '...kBBBBBBk.....', '...kBBkBBBk.....', '...kBBkBBBk.....', '...knnknnnk.....', '...knnknnnnk....', '...kkkkkkkkk....'],
  ['...kBBBBBBk.....', '...kBBBBBBk.....', '..kBBk.kBBk.....', '..kBBk.kBBBk....', '.knnnk..knnnk...', '.knnnk..knnnnk..', '.kkkkk..kkkkkk..'],
  ['...kBBBBBBk.....', '...kBBBBBBk.....', '...kBBBBBk......', '...kBBBBBk......', '...knnnnnk......', '...knnnnnnk.....', '...kkkkkkkk.....'],
];

function held(kopf, koerper, beine) {
  return [...kopf, ...koerper, ...beine];
}

// ---------------------------------------------------------------------------
// DORF-ZWERGE (16 x 20) – Vorlagen, die mit Farben variiert werden
// Platzhalter: 1/2/3 = Haar/Bart hell/mittel/dunkel, 4/5 = Kleid/Tunika hell/dunkel,
//              6/7 = Kopfbedeckung hell/dunkel
// ---------------------------------------------------------------------------
const VORLAGE_ZWERG_HELM = [ // Nasenhelm, langer Bart mit Zöpfen
  '....kkkkkkkk....',
  '...k66666666k...',
  '..k6x66666666k..',
  '..k7666666667k..',
  '..kyyyyyyyyyyk..',
  '..kss7ss7sssk...',
  '..ksek77kesSk...',
  '.k2sssSSsssS2k..',
  '.k22211112222k..',
  'k4k2221122222k4k',
  'k44k22222222k44k',
  'k45k2222222k454k',
  'sk5kk2y22y2kk5ks',
  'kbbbbk22k2kbbbbk',
  '.k555k2kk2k555k.',
  '.k5555kyyk5555k.',
  '..kBBBBBBBBBBk..',
  '..kBBBk..kBBBk..',
  '..knnnk..knnnk..',
  '.kkkkkk..kkkkkk.',
];
const VORLAGE_ZWERGIN = [ // geflochtene Zöpfe, Stirnband
  '....kkkkkkkk....',
  '...k22222222k...',
  '..k2112222222k..',
  '..k2y6666666y2k.',
  '..k2ssssssss2k..',
  '..k2seSsssSe2k..',
  '..k2ssssSsss2k..',
  '..k22sspPpss22k.',
  '.k1k2ksssssk2k1k',
  '.k2kk44444444kk2',
  'k2k4k44x44x44k4k',
  'k2k4444444444k4k',
  'yk44k4444444k44s',
  'k2kk44444444kk.k',
  '.yk5555555555k..',
  '..k5555555555k..',
  '..k5555555555k..',
  '..k5555555555k..',
  '..kkknnk..knnkkk',
  '...kkkk....kkkk.',
];
const VORLAGE_KIND = [ // 16 x 16, kleiner Zwerg mit Kapuze
  '................',
  '................',
  '.....kkkkkk.....',
  '....k666666k....',
  '...k66666666k...',
  '...k6ssssss6k...',
  '...kseSssSesk...',
  '...k1sssssss1k..',
  '..k11sspPss11k..',
  '..k4k111111k4k..',
  '.k44k41111k444k.',
  '.sk44k4444k44ks.',
  '..kbbbbyybbbbk..',
  '..kBBBBkkBBBBk..',
  '..knnnk..knnnk..',
  '..kkkkk..kkkkk..',
];

// Zwergenkönigin (16 x 22): Krone, Pelzkragen, geflochtenes Haar, langes Kleid
const KOENIGIN = [
  '...y..y..y..y...',
  '...yk.yk.yk.y...',
  '...yyyyyyyyyy...',
  '...yaYyuYyaYy...',
  '..k2222222222k..',
  '..k2ssssssss2k..',
  '..k2seSssSes2k..',
  '..k2ssssSsss2k..',
  '..k2ssspPsss2k..',
  '.k12kssssssk21k.',
  'k1k2xkxxxxkx2k1k',
  'k2kxxxxxxxxxxk2k',
  'yk4xx4444444xx4k',
  'k2k444444y44444k',
  '.yk44444444444ks',
  '..k44444444444k.',
  '..k44444444444k.',
  '.k5444444444445k',
  '.k5444444444445k',
  '.k5544444444455k',
  'k55555555555555k',
  'kkkkkkkkkkkkkkkk',
];

// Bote der Königin (16 x 20): Helm mit Federbusch, Trompete
const BOTE = [
  '......kppk......',
  '.....kpPpk......',
  '....kkkpkkkk....',
  '...khhhhhhhhk...',
  '..khxhhhhhhhhk..',
  '..kyyyyyyyyyyk..',
  '..ksssssssssk...',
  '..kseSssSeskk...',
  '..k1sssSsss1k...',
  '..k11111111k1yyy',
  '.kpk111111kpkyYy',
  'kppk1111kkppkyyy',
  'kpPkkkkkkpPPsk..',
  'sbbbbbyybbbbbk..',
  '.kpPpPpPpPpPk...',
  '.kPpPpPpPpPpk...',
  '..kBBBBBBBBk....',
  '..kBBk..kBBk....',
  '..knnk..knnk....',
  '.kkkkk..kkkkk...',
];

// ---------------------------------------------------------------------------
// GEGENSTÄNDE (16 x 16)
// ---------------------------------------------------------------------------
const ESSEN = [ // Korb mit Brot und Käse
  '................',
  '.....kkkk.......',
  '....kbbbbk.kkk..',
  '...kbybbyk.kyyk.',
  '...kbbbbbkkyYyk.',
  '..kkkkkkkkkkkkk.',
  '..kttttttttttk..',
  '.kTtTtTtTtTtTtk.',
  '.ktTtTtTtTtTtTk.',
  '.kTtTtTtTtTtTtk.',
  '.ktTtTtTtTtTtTk.',
  '..kTtTtTtTtTtk..',
  '..kttttttttttk..',
  '...kkkkkkkkkk...',
  '................',
  '................',
];
const WASSER = [ // Eisenkessel mit Wasser
  '................',
  '.....kkkkkk.....',
  '....k......k....',
  '...k........k...',
  '..kkkkkkkkkkkk..',
  '..kuuxuuuuuuuk..',
  '..kHuuuuuuuuHk..',
  '.kHhHHHHHHHHhHk.',
  '.kHhhhhhhhhhhHk.',
  '.kHhhhhhhhhhhHk.',
  '.kHHhhhhhhhhHHk.',
  '..kHHHHHHHHHHk..',
  '..kMMMMMMMMMMk..',
  '...kkkkkkkkkk...',
  '................',
  '................',
];
const BUCH = [ // dicker Wälzer mit Rune
  '................',
  '...kkkkkkkkkk...',
  '..kaaaaaaaaaakk.',
  '..kaAyyyyyyAakl.',
  '..kaAyaaaayAakl.',
  '..kaAyayyayAakl.',
  '..kaAyaaaayAakl.',
  '..kaAyayyayAakl.',
  '..kaAyaaaayAakl.',
  '..kaAyyyyyyAakl.',
  '..kaaaaaaaaaakl.',
  '..kAAAAAAAAAAkl.',
  '...kllllllllllk.',
  '....kkkkkkkkkk..',
  '................',
  '................',
];
const FRUCHT = [ // Apfel
  '................',
  '.......kk.......',
  '......ktk.kk....',
  '......kt.kggk...',
  '....kkktkkGk....',
  '...kaaakaaak....',
  '..kaxaaaaaaAk...',
  '..kaxaaaaaaAk...',
  '..kaaaaaaaaAk...',
  '..kaaaaaaaAAk...',
  '..kaaaaaaaAAk...',
  '...kaaaaAAAk....',
  '....kAAkAAk.....',
  '.....kk.kk......',
  '................',
  '................',
];
const HERZ = [
  '................',
  '..kkkk....kkkk..',
  '.kppppk..kppppk.',
  'kpxxppPkkpppppPk',
  'kpxpppppppppppPk',
  'kpppppppppppppPk',
  'kpppppppppppppPk',
  '.kpppppppppppPk.',
  '..kpppppppppPk..',
  '...kpppppppPk...',
  '....kpppppPk....',
  '.....kpppPk.....',
  '......kpPk......',
  '.......kk.......',
  '................',
  '................',
];

// ---------------------------------------------------------------------------
// DORF-OBJEKTE
// ---------------------------------------------------------------------------
const BRUNNEN = [ // 16 x 24, Steinbrunnen mit Dach
  '..kkkkkkkkkkkk..',
  '.kTtTtTtTtTtTtk.',
  'kTtTtTtTtTtTtTtk',
  'kkkkkkkkkkkkkkkk',
  '..kt..kk....kt..',
  '..kt..kn....kt..',
  '..kt..kk....kt..',
  '..kt...k....kt..',
  '..kt...k....kt..',
  '..kt..kHk...kt..',
  '..kt..kHk...kt..',
  '.kkkkkkkkkkkkkk.',
  'kmmMmmmMmmmMmmmk',
  'kuuuuuuxuuuuuuuk',
  'kUuuuuuuuuuuuuUk',
  'kmmmMmmmmMmmmMmk',
  'kMmmmMmmmmMmmmMk',
  'kmmMmmmMmmmMmmmk',
  'kMmmmmMmmmmmMmmk',
  'kmmmMmmmmMmmmMmk',
  '.kMMMMMMMMMMMMk.',
  '..kkkkkkkkkkkk..',
  '................',
  '................',
];
const MARKTSTAND = [ // 32 x 24, Stand mit gestreiftem Dach, Brot & Käse
  '..kkkkkkkkkkkkkkkkkkkkkkkkkkkk..',
  '.kaaaxxxaaaxxxaaaxxxaaaxxxaaaxk.',
  'kaaaxxxaaaxxxaaaxxxaaaxxxaaaxxxk',
  'kAAAlllAAAlllAAAlllAAAlllAAAlllk',
  '.kk.kk.kk.kk.kk.kk.kk.kk.kk.kk..',
  '..kt......................kt....',
  '..kt......................kt....',
  '..kt......................kt....',
  '..kt......................kt....',
  '..kt..kkk...kkkk..kkk.....kt....',
  '..kt.kbybk.kyyYYkkbybk....kt....',
  '..kt.kbbbkkyYyyYykbbbk.kk.kt....',
  'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  'kttttttttttttttttttttttttttttttk',
  'kTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTk',
  'ktTTtTTtTTtTTtTTtTTtTTtTTtTTtTTk',
  'ktTTtTTtTTtTTtTTtTTtTTtTTtTTtTTk',
  'ktTTtTTtTTtTTtTTtTTtTTtTTtTTtTTk',
  'ktTTtTTtTTtTTtTTtTTtTTtTTtTTtTTk',
  'kTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTk',
  'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  '.kk........................kk...',
  '................................',
  '................................',
];
const BUECHERREGAL = [ // 16 x 40, riesiges Regal
  'kkkkkkkkkkkkkkkk',
  'kTttttttttttttTk',
  'kTkakukgkykakPTk',
  'kTkakukgkykakPTk',
  'kTkakukgkykakPTk',
  'kTkkkkkkkkkkkkTk',
  'kTttttttttttttTk',
  'kTkUkakykgkUkaTk',
  'kTkUkakykgkUkaTk',
  'kTkUkakykgkUkaTk',
  'kTkkkkkkkkkkkkTk',
  'kTttttttttttttTk',
  'kTkgkkyykakkukTk',
  'kTkgkaYYkakPukTk',
  'kTkgkaYYkakPukTk',
  'kTkkkkkkkkkkkkTk',
  'kTttttttttttttTk',
  'kT.............k',
  'kT.............k',
  'kT.............k',
  'kTttttttttttttTk',
  'kTkakk.......kTk',
  'kTkakk.......kTk',
  'kTkkkk.......kTk',
  'kTttttttttttttTk',
  'kT.............k',
  'kT.............k',
  'kT.............k',
  'kTttttttttttttTk',
  'kT.............k',
  'kT.............k',
  'kT.............k',
  'kTttttttttttttTk',
  'kT.............k',
  'kT.............k',
  'kT.............k',
  'kTttttttttttttTk',
  'kTTTTTTTTTTTTTTk',
  'kkkkkkkkkkkkkkkk',
  '................',
];
const AMBOSS = [ // 16 x 16 Schmiede-Amboss
  '................',
  '................',
  '................',
  '..kkkkkkkkkkk...',
  '.kHhhhhhhhhhhkk.',
  'kHhxhhhhhhhhhhHk',
  '.kkkHhhhhhhHkkk.',
  '....kHhhhhHk....',
  '....kHHhhHHk....',
  '...kHHHHHHHHk...',
  '..kMMMMMMMMMMk..',
  '..ktttttttttTk..',
  '..kTTTTTTTTTTk..',
  '..kk........kk..',
  '................',
  '................',
];
const ESSE = [ // 16 x 24 Schmiede-Esse mit Glut
  '....kkkkkkkk....',
  '....kMmmmmMk....',
  '....kMmmmmMk....',
  '....kMmmmmMk....',
  '...kkMmmmmMkk...',
  '..kMMMMMMMMMMk..',
  '.kMmmmmmmmmmmMk.',
  'kMmmkkkkkkkkmmMk',
  'kMmkFfFfFfFfkmMk',
  'kMmkfFfFfFfFkmMk',
  'kMmkfaFaFaFakmMk',
  'kMmkaAaAaAaAkmMk',
  'kMmkkkkkkkkkkmMk',
  'kMmmmmmmmmmmmmMk',
  'kMMmmMmmmMmmMMMk',
  'kMmmmmmMmmmmmmMk',
  'kMMMMMMMMMMMMMMk',
  'kkkkkkkkkkkkkkkk',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
];
const FASS = [
  '................',
  '....kkkkkkkk....',
  '...kTttttttTk...',
  '..kkkkkkkkkkkk..',
  '..kTtttttttTTk..',
  '..kttxttttttTk..',
  '..kkkkkkkkkkkk..',
  '..kTttttttttTk..',
  '..kttttttttTTk..',
  '..kkkkkkkkkkkk..',
  '..kTtttttttTTk..',
  '...kTtttttTTk...',
  '....kkkkkkkk....',
  '................',
  '................',
  '................',
];
const FACKEL = [ // Kohlebecken auf Ständer
  '......kFk.......',
  '.....kFfFk......',
  '....kfFFFfk.....',
  '....kfFfFfk.....',
  '...kkfaffakk....',
  '...kHHHHHHHk....',
  '....kHhhhHk.....',
  '.....kHHHk......',
  '......kHk.......',
  '......kHk.......',
  '......kHk.......',
  '......kHk.......',
  '.....kHHHk......',
  '....kHHHHHk.....',
  '....kkkkkkk.....',
  '................',
];
const PILZE = [
  '................',
  '................',
  '................',
  '....kkkk........',
  '...kaxaaak......',
  '..kaaaxaaak.....',
  '..kkkkkkkkk.kkk.',
  '....kllk...kaxak',
  '....kllk..kaaaak',
  '....kllk..kkkkk.',
  '....kllk...klk..',
  '...kkkkkk..klk..',
  '................',
  '................',
  '................',
  '................',
];

// Obstbaum (32 x 34) – die Früchte werden einzeln oben drauf gehängt (siehe FRUCHT_KLEIN)
const OBSTBAUM = [
  '............kkkkkkkk............',
  '.........kkkgvgggGggkkk.........',
  '.......kkvggGggggggggggkk.......',
  '.....kkGggggggggggGgggvggkk.....',
  '....kggggggggGggggvgggggGggk....',
  '...kggggGgggggvggggGggggggggk...',
  '..kGggggggvgggGggggggggggGgvgk..',
  '..kgggvggGggggggggggGggvgggggk..',
  '.kvgGggggggggggGgggvggggggGgggk.',
  '.kggggggggGggggvgggggGggggggggk.',
  '.kgggGggggggggggGggggggggggGggk.',
  '.kgggggggggGggggggggggGgggggggk.',
  '.kggggGggggggggggGggggggggggGgk.',
  '.kggggggggggGggggggggggGggggggk.',
  '..kggggGggggggggggGggggggggggk..',
  '..kggggggggggGggggggggggGggggk..',
  '...kggggGggggggggggGggggggggk...',
  '....kgggggggggGggggggggggGgk....',
  '.....kkgGgGgGgGgGgGgGgGgGkk.....',
  '.......kkGgGgGgGgGgGgGgkk.......',
  '.........kkkGgGgGgGgkkk.........',
  '............kkTttTkk............',
  '.............kTttTk.............',
  '.............kTttTk.............',
  '.............kTttTk.............',
  '.............kTttTk.............',
  '.............kTttTk.............',
  '.............kTttTk.............',
  '............kTTttTk.............',
  '...........kTtTttTTk............',
  '..........kkkkkkkkkkk...........',
  '................................',
  '................................',
  '................................',
];
// Pvsitivnen der Früchte im Baum (x, y) – ganz vben, wv nur der Grvsse Zwerg hinkvmmt
export const FRUCHT_PLAETZE = [[6, 5], [13, 2], [21, 4], [25, 9], [9, 11], [18, 9]];
const FRUCHT_KLEIN = [
  '..kk..',
  '.kaak.',
  'kaxaAk',
  'kaaaAk',
  '.kAAk.',
  '..kk..',
];

// Tanne (16 x 32) für Waldränder
const TANNE = [
  '.......kk.......',
  '......kGgk......',
  '......kGgk......',
  '.....kGggGk.....',
  '....kGgggggk....',
  '.....kkGgkk.....',
  '....kGgggggk....',
  '...kGgggggGgk...',
  '..kGggGgggggGk..',
  '...kkkGggGkkk...',
  '...kGgggggggk...',
  '..kGgggGgggggk..',
  '.kGggggggGggggk.',
  'kGggGgggggggGggk',
  '.kkkGgggGgggkkk.',
  '..kGgggggggGgk..',
  '.kGgggGggggggGk.',
  'kGgggggggGgggggk',
  'kGGgggGggggGgGGk',
  '.kkGGGGGGGGGGkk.',
  '...kkkkTTkkkk...',
  '.......Ttk......',
  '......kTtk......',
  '......kkkk......',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
];

// Tür für Steinhallen (16 x 16)
const TUER = [
  'kkkkkkkkkkkkkkkk',
  'kMkkkkkkkkkkkkMk',
  'kMkTtTkyykTtTkMk',
  'kMkTtTtkktTtTkMk',
  'kMkTtTtTtTtTtkMk',
  'kMkHHHHHHHHHHkMk',
  'kMkTtTtTtTtTtkMk',
  'kMkTtTtTtTtTtkMk',
  'kMkTtTtTyyTtTkMk',
  'kMkTtTtTyyTtTkMk',
  'kMkTtTtTtTtTtkMk',
  'kMkHHHHHHHHHHkMk',
  'kMkTtTtTtTtTtkMk',
  'kMkTtTtTtTtTtkMk',
  'kMkTtTtTtTtTtkMk',
  'kkkkkkkkkkkkkkkk',
];

// Funken für Konfetti (4 x 4)
const FUNKE = ['.kk.', 'kyyk', 'kyyk', '.kk.'];

export const SPRITES = {
  held_unten_0: held(helden_kopf_vorne, helden_koerper_vorne, helden_beine[0]),
  held_unten_1: held(helden_kopf_vorne, helden_koerper_vorne, helden_beine[1]),
  held_unten_2: held(helden_kopf_vorne, helden_koerper_vorne, helden_beine[2]),
  held_oben_0: held(helden_kopf_hinten, helden_koerper_hinten, helden_beine[0]),
  held_oben_1: held(helden_kopf_hinten, helden_koerper_hinten, helden_beine[1]),
  held_oben_2: held(helden_kopf_hinten, helden_koerper_hinten, helden_beine[2]),
  held_seite_0: held(helden_seite, helden_seite_koerper, helden_seite_beine[0]),
  held_seite_1: held(helden_seite, helden_seite_koerper, helden_seite_beine[1]),
  held_seite_2: held(helden_seite, helden_seite_koerper, helden_seite_beine[2]),
  koenigin: KOENIGIN,
  bote: BOTE,
  essen: ESSEN,
  wasser: WASSER,
  buch: BUCH,
  frucht: FRUCHT,
  herz: HERZ,
  brunnen: BRUNNEN,
  marktstand: MARKTSTAND,
  buecherregal: BUECHERREGAL.map((z, i) => (i < BUECHERREGAL.length - 1 ? z.replace(/\./g, 'T') : z)),
  amboss: AMBOSS,
  esse: ESSE,
  fass: FASS,
  fackel: FACKEL,
  pilze: PILZE,
  obstbaum: OBSTBAUM,
  frucht_klein: FRUCHT_KLEIN,
  tanne: TANNE,
  tuer: TUER,
  funke: FUNKE,
};

// Farbvarianten der Dorf-Zwerge. Schlüssel = Platzhalter in der Vorlage.
const FARBEN = {
  rot: ['#f08a4b', '#d0502a', '#8e2f17'],
  braun: ['#b07a4a', '#7a4f2c', '#4f311b'],
  grau: ['#f0f0f0', '#bfc3c8', '#80858c'],
  schwarz: ['#5a5a66', '#2f2f3a', '#1a1a22'],
  blond: ['#fff0a0', '#e8c95a', '#a8862b'],
  gruen: ['#6cc46a', '#3f8a44', '#245a2a'],
  blau: ['#7aa6e0', '#3f6fb5', '#2b4c80'],
  lila: ['#b58ad8', '#7c52a6', '#4e3170'],
  orange: ['#f5b25a', '#d9822b', '#9a5616'],
  rosa: ['#f59ac0', '#e05a8a', '#9c3564'],
  stahl: ['#e8eef3', '#c3ccd4', '#6f7a86'],
  leder: ['#b07a4a', '#8a5a33', '#5b3a22'],
  gold: ['#fff0a0', '#f2c94c', '#b8862b'],
};

const VORLAGEN = { zwerg: VORLAGE_ZWERG_HELM, zwergin: VORLAGE_ZWERGIN, kind: VORLAGE_KIND, koenigin: KOENIGIN, bote: BOTE };

// Baut die Pixel-Daten einer Dorf-Figur: { vorlage, haar, kleid, kopf }
export function figurPixel({ vorlage = 'zwerg', haar = 'braun', kleid = 'gruen', kopf = 'stahl' }) {
  const h = FARBEN[haar], c = FARBEN[kleid], m = FARBEN[kopf];
  const extra = {
    1: h[0], 2: h[1], 3: h[2],
    4: c[1], 5: c[2],
    6: m[1], 7: m[2],
  };
  return { pixel: VORLAGEN[vorlage], extra };
}

export const FIGUR_FARBEN = Object.keys(FARBEN);
