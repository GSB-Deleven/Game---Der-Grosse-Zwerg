// Kleine Chiptune-Melodien, im Code erzeugt. Noten: "C5:1" = C in Oktave 5, 1 Schlag lang. "-" = Pause.
import { tonStart } from './ton.js';

const NOTEN = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, H: 11, B: 10 };
function frequenz(n) {
  const m = n.match(/^([A-H]#?)(\d)$/);
  if (!m) return 0;
  return 440 * Math.pow(2, (NOTEN[m[1]] + (Number(m[2]) + 1) * 12 - 69) / 12);
}
function lies(folge) {
  return folge.trim().split(/\s+/).map((t) => { const [n, l] = t.split(':'); return { f: n === '-' ? 0 : frequenz(n), l: Number(l || 1) }; });
}

const LIEDER = {
  dorf: {
    tempo: 132,
    stimmen: [
      { typ: 'square', laut: 0.045, noten: lies(`
        E5:1 G5:1 A5:2 G5:1 E5:1 D5:2  C5:1 D5:1 E5:1 G5:1 E5:2 -:2
        E5:1 G5:1 A5:2 C6:1 A5:1 G5:2  E5:1 D5:1 C5:1 D5:1 C5:2 -:2
        A5:1 A5:1 G5:1 E5:1 G5:2 E5:2  D5:1 E5:1 G5:1 E5:1 D5:2 -:2
        C5:1 E5:1 G5:1 A5:1 G5:1 E5:1 D5:2  C5:4 -:4`) },
      { typ: 'triangle', laut: 0.12, noten: lies(`
        C3:2 G3:2 C3:2 G3:2  A2:2 E3:2 A2:2 E3:2  F2:2 C3:2 F2:2 C3:2  G2:2 D3:2 G2:2 D3:2
        C3:2 G3:2 C3:2 G3:2  A2:2 E3:2 A2:2 E3:2  F2:2 C3:2 G2:2 D3:2  C3:2 G2:2 C3:4`) },
    ],
  },
  bibliothek: {
    tempo: 88,
    stimmen: [
      { typ: 'triangle', laut: 0.07, noten: lies(`
        A4:2 C5:1 E5:1 D5:2 C5:2  H4:2 D5:1 G5:1 E5:4
        A4:2 C5:1 E5:1 F5:2 E5:1 D5:1  C5:2 H4:2 A4:4`) },
      { typ: 'sine', laut: 0.12, noten: lies(`
        A2:4 A2:4 G2:4 E2:4 F2:4 D2:4 E2:4 A2:4`) },
    ],
  },
  schloss: {
    tempo: 110,
    stimmen: [
      { typ: 'square', laut: 0.04, noten: lies(`
        G4:2 C5:1 D5:1 E5:2 G5:2  F5:1 E5:1 D5:1 C5:1 D5:4
        E5:2 F5:1 G5:1 A5:2 G5:2  F5:1 E5:1 D5:2 C5:4`) },
      { typ: 'triangle', laut: 0.12, noten: lies(`
        C3:4 G2:4 F2:4 G2:4 C3:4 F2:4 G2:4 C3:4`) },
    ],
  },
  reise: {
    tempo: 140,
    stimmen: [
      { typ: 'square', laut: 0.042, noten: lies(`
        D5:1 F5:1 A5:2 G5:1 F5:1 E5:2  D5:1 E5:1 F5:1 A5:1 G5:4
        A5:1 C6:1 A5:2 G5:1 F5:1 E5:2  D5:1 C5:1 E5:1 F5:1 D5:4`) },
      { typ: 'triangle', laut: 0.12, noten: lies(`
        D3:2 A2:2 D3:2 A2:2  C3:2 G2:2 C3:2 G2:2  A2:2 E3:2 A2:2 E3:2  D3:2 A2:2 D3:4`) },
    ],
  },
  wald: {
    tempo: 80,
    stimmen: [
      { typ: 'sine', laut: 0.07, noten: lies(`
        E5:2 -:1 G5:1 F#5:2 E5:2  H4:3 -:1 D5:4
        C5:2 -:1 E5:1 D5:2 C5:2  H4:6 -:2`) },
      { typ: 'triangle', laut: 0.1, noten: lies(`E2:8 D2:8 C2:8 H1:8`) },
    ],
  },
  hoehle: {
    tempo: 64,
    stimmen: [
      { typ: 'sine', laut: 0.07, noten: lies(`A4:3 C5:1 H4:4 G4:3 A4:1 E4:4 F4:3 A4:1 G4:4 E4:8`) },
      { typ: 'triangle', laut: 0.11, noten: lies(`A1:8 G1:8 F1:8 E1:8`) },
    ],
  },
  flug: {
    tempo: 150,
    stimmen: [
      { typ: 'square', laut: 0.04, noten: lies(`
        C5:1 E5:1 G5:1 C6:1 H5:2 G5:2  A5:1 G5:1 F5:1 E5:1 D5:4
        E5:1 G5:1 C6:1 E6:1 D6:2 C6:2  H5:1 C6:1 D6:1 H5:1 C6:4`) },
      { typ: 'triangle', laut: 0.12, noten: lies(`
        C3:2 G3:2 C3:2 G3:2  F2:2 C3:2 G2:2 D3:2  C3:2 G3:2 A2:2 E3:2  F2:2 G2:2 C3:4`) },
    ],
  },
  fest: {
    tempo: 150,
    stimmen: [
      { typ: 'square', laut: 0.045, noten: lies(`
        G5:1 G5:1 A5:1 G5:1 C6:2 H5:2  G5:1 G5:1 A5:1 G5:1 D6:2 C6:2
        G5:1 G5:1 G6:2 E6:2 C6:1 H5:1 A5:2  F6:1 F6:1 E6:2 C6:2 D6:2 C6:4`) },
      { typ: 'triangle', laut: 0.12, noten: lies(`
        C3:2 G3:2 C3:2 G3:2  G2:2 D3:2 C3:2 G3:2  C3:2 E3:2 F2:2 A2:2  G2:2 G2:2 C3:4`) },
    ],
  },
  titel: {
    tempo: 100,
    stimmen: [
      { typ: 'square', laut: 0.04, noten: lies(`
        C5:1 E5:1 G5:1 C6:3 H5:1 A5:1 G5:2 E5:2 -:2
        F5:1 A5:1 C6:1 D6:3 C6:1 H5:1 C6:6 -:2`) },
      { typ: 'triangle', laut: 0.12, noten: lies(`
        C3:4 E3:4 F3:4 G3:4 F3:4 G3:4 C3:8`) },
    ],
  },
};

let aktuell = null;
let zeitgeber = null;
let haupt = null;
let lautstaerke = 0.6;
let geduckt = 1;

function stelleLaut() {
  if (haupt) haupt.gain.value = lautstaerke * geduckt;
}

export function setzeMusikLautstaerke(v) { lautstaerke = v; stelleLaut(); }
export function ducken(an) { geduckt = an ? 0.35 : 1; stelleLaut(); }

export function spieleMusik(name) {
  if (aktuell === name) return;
  stoppeMusik();
  const lied = LIEDER[name];
  const ctx = tonStart();
  if (!lied || !ctx) return;
  aktuell = name;
  haupt = ctx.createGain();
  stelleLaut();
  haupt.connect(ctx.destination);
  const schlag = 60 / lied.tempo / 2;
  const zeiger = lied.stimmen.map(() => ({ i: 0, t: ctx.currentTime + 0.1 }));
  const plane = () => {
    const bis = ctx.currentTime + 0.4;
    lied.stimmen.forEach((st, k) => {
      const z = zeiger[k];
      while (z.t < bis) {
        const n = st.noten[z.i % st.noten.length];
        const dauer = n.l * schlag;
        if (n.f) {
          const osc = ctx.createOscillator(), g = ctx.createGain();
          osc.type = st.typ; osc.frequency.value = n.f;
          g.gain.setValueAtTime(0.0001, z.t);
          g.gain.exponentialRampToValueAtTime(st.laut, z.t + 0.015);
          g.gain.exponentialRampToValueAtTime(0.0001, z.t + dauer * 0.95);
          osc.connect(g).connect(haupt);
          osc.start(z.t); osc.stop(z.t + dauer);
        }
        z.t += dauer; z.i++;
      }
    });
  };
  plane();
  zeitgeber = setInterval(plane, 150);
}

export function stoppeMusik() {
  if (zeitgeber) clearInterval(zeitgeber);
  zeitgeber = null;
  if (haupt) { const h = haupt; h.gain.value = 0; setTimeout(() => h.disconnect(), 500); }
  haupt = null;
  aktuell = null;
}
