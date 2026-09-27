// KAPITEL 2 – Der Thronsaal: Königin Brunhild bittet um Hilfe
export default {
  name: 'Der Thronsaal',
  musik: 'schloss',
  hintergrund: '#1b1420',
  karte: [
    'WWWWWWWWWWWWWWWWWWWWWW',
    'WWWGWRWWGWWWWGWWRWGWWW',
    'W#$#######Ü+#######$#W',
    'W#######L#||#L#######W',
    'W###I#####k|#####I###W',
    'W######r##||##s######W',
    'W#########||#########W',
    'W###I#####||#####I###W',
    'W#########||#########W',
    'W#########||#########W',
    'W###I#####||#####I###W',
    'W#K#######||#######K#W',
    'W#########||#########W',
    'WWWWWWWWWW1WWWWWWWWWWW',
  ],
  ausgaenge: {
    1: { karte: 'burghof', ziel: 1 },
  },
  figuren: {
    k: {
      name: 'Königin Brunhild',
      aussehen: 'koenigin',
      stimme: { hoehe: 1.05 },
      wunsch: 'reden',
      gespraech: [
        { sage: ['k', 'Willkommen, Grosser Zwerg! Wie gut, dass du gekommen bist.'] },
        { sage: ['k', 'Auf dem höchsten Berg wohnt ein Drache. Alle im Zwergenland haben Angst vor ihm.'] },
        { sage: ['r', 'Viele Helden sind hinaufgestiegen – und alle sind ängstlich zurückgekommen.'] },
        { sage: ['k', 'Willst du zum Drachen gehen und schauen, was wir tun können?'] },
        { sage: ['held', 'Ja, meine Königin! Ich bin gross, ich bin stark, und ich habe keine Angst.'] },
        { sage: ['k', 'Dann nimm dieses Versprechen mit: Du bist der mutigste Zwerg im ganzen Reich.'] },
      ],
      danach: 'Pass gut auf dich auf, Grosser Zwerg!',
    },
    r: {
      name: 'Berater Grimwald',
      aussehen: 'berater',
      stimme: { hoehe: 0.65 },
      sagt: 'Die Königin hat schon auf dich gewartet.',
    },
    s: {
      name: 'Beraterin Ylva',
      aussehen: 'beraterin',
      stimme: { hoehe: 1.1 },
      sagt: 'Ein Drache! Ob er wohl wirklich so gefährlich ist?',
    },
  },
};
