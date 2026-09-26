// Kleine Retro-Töne, im Code erzeugt (kein Download nötig).
let ctx = null;

export function tonStart() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

function note(frequenz, start, dauer, { typ = 'square', laut = 0.08 } = {}) {
  if (!ctx) return;
  const t = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = typ;
  osc.frequency.setValueAtTime(frequenz, t);
  g.gain.setValueAtTime(laut, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
  osc.connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dauer + 0.02);
}

const TOENE = {
  aufheben: () => { note(523, 0, 0.08); note(784, 0.07, 0.12); },
  herz: () => { [523, 659, 784, 1047].forEach((f, i) => note(f, i * 0.09, 0.18, { typ: 'triangle', laut: 0.12 })); },
  knopf: () => note(440, 0, 0.05),
  tuer: () => { note(196, 0, 0.12, { typ: 'triangle', laut: 0.15 }); note(147, 0.1, 0.18, { typ: 'triangle', laut: 0.15 }); },
  reden: () => note(660, 0, 0.04, { laut: 0.04 }),
  fanfare: () => {
    [[392, 0], [523, 0.15], [659, 0.3], [784, 0.45], [659, 0.65], [784, 0.8]].forEach(([f, s]) =>
      note(f, s, 0.22, { typ: 'square', laut: 0.07 }));
  },
  sieg: () => {
    [523, 587, 659, 698, 784, 880, 988, 1047].forEach((f, i) => note(f, i * 0.08, 0.2, { typ: 'triangle', laut: 0.1 }));
  },
};

export function spiele(name) {
  tonStart();
  TOENE[name]?.();
}
