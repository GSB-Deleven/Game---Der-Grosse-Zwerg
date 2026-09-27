// KAPITEL 4 – Der Gipfel: vor der Drachenhöhle
export default {
  name: 'Der Gipfel',
  musik: 'wald',
  leben: { schnee: true, dampf: [[13, 3], [15, 3]] },
  karte: [
    'MMMMMMMMMMMMMMMMMMMMMMMMMMMM',
    'MMMMMMMMMMMMMMMMMMMMMMMMMMMM',
    'MMMMMMMMMMMMMM1MMMMMMMMMMMMM',
    'M""""""""""""":""""""""""""M',
    'M""""""""""^"":""""""""""""M',
    'M""""^"""""""":""?"""""""""M',
    'M""""""""""""":"""""""^""""M',
    'M""""""""""""":""""""""""""M',
    'M""""""""""""":""""""""""""M',
    'M"""^""""""""":""""""""""""M',
    'M""""""""""""":"""""""""^""M',
    'M""""""""""""":""""""""""""M',
    'M"""""""^""""":""""""""""""M',
    'M""""""""""""":"""""^""""""M',
    'M""""""""""""":""""""""""""M',
    'M"""""""""""""@""""""""""""M',
    'M""""""""""""""""""""""""""M',
    'MMMMMMMMMMMMMMMMMMMMMMMMMMMM',
  ],
  ausgaenge: {
    1: { karte: 'hoehle', ziel: 1, aussehen: 'hoehleneingang' },
  },
  ereignisse: {
    beimBetreten: [
      { wackeln: 300 },
      { sage: ['held', 'Brrr, ist das kalt hier oben! Und es riecht nach Feuer … und ein bisschen nach Schwefel.'] },
      { sage: ['held', 'Da vorne ist die Höhle. Ich bin mutig. Ich gehe hinein!'] },
    ],
  },
  figuren: {},
};
