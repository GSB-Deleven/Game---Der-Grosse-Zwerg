// Kleine Retro-Töne, im Code erzeugt (kein Download nötig).
let ctx = null;
let lautTon = 1;

export function tonStart() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function audioKontext() { return ctx; }
export function setzeTonLautstaerke(v) { lautTon = v; }

export function note(frequenz, start, dauer, { typ = 'square', laut = 0.08, ziel = null, gleiten = 0 } = {}) {
  if (!ctx || lautTon <= 0) return;
  const t = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = typ;
  osc.frequency.setValueAtTime(frequenz, t);
  if (gleiten) osc.frequency.exponentialRampToValueAtTime(frequenz * gleiten, t + dauer);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(laut * lautTon, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
  osc.connect(g).connect(ziel || ctx.destination);
  osc.start(t);
  osc.stop(t + dauer + 0.02);
}

function rauschen(start, dauer, laut = 0.05, filter = 2000) {
  if (!ctx || lautTon <= 0) return;
  const t = ctx.currentTime + start;
  const puffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dauer), ctx.sampleRate);
  const d = puffer.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const q = ctx.createBufferSource(); q.buffer = puffer;
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = filter;
  const g = ctx.createGain();
  g.gain.setValueAtTime(laut * lautTon, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
  q.connect(f).connect(g).connect(ctx.destination);
  q.start(t);
}

const TOENE = {
  aufheben: () => { note(523, 0, 0.08); note(784, 0.07, 0.14); note(1047, 0.14, 0.12, { typ: 'triangle' }); },
  herz: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => note(f, i * 0.08, 0.2, { typ: 'triangle', laut: 0.12 })); },
  knopf: () => note(660, 0, 0.05, { typ: 'triangle', laut: 0.1 }),
  tuer: () => { note(196, 0, 0.12, { typ: 'triangle', laut: 0.15 }); note(147, 0.1, 0.18, { typ: 'triangle', laut: 0.15 }); rauschen(0, 0.2, 0.03, 500); },
  schritt: () => rauschen(0, 0.04, 0.025, 900),
  kling: () => { note(1760, 0, 0.25, { typ: 'triangle', laut: 0.05 }); note(2637, 0, 0.18, { typ: 'sine', laut: 0.03 }); rauschen(0, 0.05, 0.03, 4000); },
  gack: () => { note(700, 0, 0.07, { gleiten: 1.4, laut: 0.05 }); note(900, 0.09, 0.09, { gleiten: 0.7, laut: 0.05 }); },
  strecken: () => note(392, 0, 0.18, { typ: 'triangle', gleiten: 2, laut: 0.08 }),
  fanfare: () => {
    [[392, 0], [523, 0.15], [659, 0.3], [784, 0.45], [659, 0.65], [784, 0.8]].forEach(([f, s]) => note(f, s, 0.22, { laut: 0.07 }));
  },
  sieg: () => { [523, 587, 659, 698, 784, 880, 988, 1047].forEach((f, i) => note(f, i * 0.08, 0.2, { typ: 'triangle', laut: 0.1 })); },
  wind: () => { rauschen(0, 1.2, 0.08, 600); rauschen(0.2, 1.0, 0.05, 1200); },
  grollen: () => { note(55, 0, 1.4, { typ: 'sawtooth', laut: 0.09, gleiten: 0.8 }); note(62, 0.1, 1.2, { typ: 'triangle', laut: 0.12, gleiten: 0.85 }); rauschen(0, 1.2, 0.04, 200); },
  zauber: () => { [784, 988, 1175, 1568, 1976].forEach((f, i) => note(f, i * 0.06, 0.3, { typ: 'sine', laut: 0.06 })); },
  stern: () => { note(1319, 0, 0.1, { typ: 'triangle', laut: 0.08 }); note(1976, 0.06, 0.16, { typ: 'triangle', laut: 0.07 }); },
  splash: () => {
    [[523, 0], [659, 0.1], [784, 0.2], [1047, 0.32]].forEach(([f, s]) => note(f, s, 0.35, { typ: 'square', laut: 0.06 }));
    [[262, 0], [330, 0.1], [392, 0.2], [523, 0.32]].forEach(([f, s]) => note(f, s, 0.4, { typ: 'triangle', laut: 0.1 }));
    rauschen(0.32, 0.4, 0.02, 6000);
  },
};

export function spiele(name) {
  tonStart();
  TOENE[name]?.();
}

// "Plappern": ein kurzer Laut pro Silbe, Tonhöhe je nach Figur
export function blip(hoehe = 1) {
  if (!ctx) return;
  const f = 220 * hoehe * (0.9 + Math.random() * 0.25);
  note(f, 0, 0.055, { typ: 'square', laut: 0.035, gleiten: 1.08 });
}
