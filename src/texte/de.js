// Alle allgemeinen Texte an einem Ort. Die Sätze der Dorf-Zwerge stehen in den Level-Dateien.
export const TEXTE = {
  titel: 'Der Grosse Zwerg',
  untertitel: 'Ein Abenteuer über Mut, Freundschaft und ein grosses Herz',
  spielen: 'Spielen',
  neu: 'Neu anfangen',
  neuFrage: 'Wirklich von vorne beginnen?',
  ja: 'Ja',
  nein: 'Nein',
  titelSprechen: 'Der Grosse Zwerg!',

  intro: [
    'Es war einmal ein Zwerg. Er war viel, viel grösser als alle anderen Zwerge im Dorf.',
    'Manche Zwerge lachten über ihn: Du bist doch gar kein Zwerg, du bist viel zu gross!',
    'Aber der Grosse Zwerg liess sich nicht beirren. Er hatte ein riesengrosses Herz und half allen, wo er nur konnte.',
    'Hilf dem Grossen Zwerg! Wer etwas braucht, zeigt es dir mit einem Bild über dem Kopf.',
  ],

  kapitel2: [
    'Der Grosse Zwerg packte seinen Rucksack und machte sich auf den Weg zum Schloss der Königin.',
    'Das Schloss hatte hohe Türme und bunte Fahnen. Die Königin wartete schon auf ihn.',
  ],
  kapitel3: [
    'Der Grosse Zwerg packte seine sieben Sachen und machte sich auf die grosse Reise.',
    'Er überquerte Seen, durchquerte tiefe Täler, lief durch dunkle Wälder und kletterte über hohe Berge.',
  ],
  kapitel4: [
    'Endlich erreichte der Grosse Zwerg den höchsten Berg.',
    'Ganz oben war eine dunkle Höhle. Es roch nach Feuer und ein bisschen nach Schwefel. Er zündete eine Fackel an und ging hinein.',
  ],

  kapitelGeschafft: (n) => `Kapitel ${n} geschafft!`,
  weiter: 'Weiter',
  zurueck: 'Zum Titelbild',
};

// Was der Grosse Zwerg sagt, wenn er etwas holt
export const GEGENSTAENDE = {
  essen: { holen: 'Ein Korb voll Essen!' },
  wasser: { holen: 'Ein schwerer Kessel Wasser. Hau ruck!' },
  buch: { holen: 'Ein grosses Buch von ganz oben!' },
  frucht: { holen: 'Ein schöner Apfel von ganz oben!' },
  stein: { holen: 'Ein schwerer Stein. Kein Problem für mich!' },
  brett: { holen: 'Ein langes Brett. Das trage ich!' },
  seil: { holen: 'Ein langes, starkes Seil!' },
  beeren: { holen: 'Leckere Beeren!' },
  heu: { holen: 'Ein Arm voll Heu!' },
  fackel: { holen: 'Eine Fackel. Jetzt wird es hell!' },
  pilze: { holen: 'Leuchtende Höhlenpilze!' },
};
