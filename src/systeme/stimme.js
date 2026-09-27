// Sprechen: Der Text erscheint in der Sprechblase, dazu ein kurzes "Plappern"
// in der Tonhöhe der Figur (wie bei alten Nintendo-Spielen). Keine Computerstimme.
import { blip } from './ton.js';

let lauf = null;
let tempoFaktor = 1;
export const ZEICHEN_MS = 32; // so schnell erscheinen die Buchstaben
export function setzeTextTempo(f) { tempoFaktor = f || 1; }
export function zeichenMs() { return ZEICHEN_MS * tempoFaktor; }

export function verstummen() {
  if (lauf) { clearInterval(lauf); lauf = null; }
}

// Wie lange ein Text zum Lesen/Vorlesen braucht
// ?schnell in der Adresse (nur für automatische Tests) verkürzt die Wartezeiten
const SCHNELL = typeof location !== 'undefined' && new URLSearchParams(location.search).has('schnell');
export function sprechDauer(text) {
  const d = (text.length * ZEICHEN_MS + 1400 + Math.min(2500, text.length * 25)) * tempoFaktor;
  return SCHNELL ? d / 6 : d;
}

export function sprich(text, { hoehe = 1 } = {}) {
  verstummen();
  let i = 0;
  lauf = setInterval(() => {
    i += 3;
    if (i >= text.length) { verstummen(); return; }
    if (text[i] !== ' ') blip(hoehe);
  }, ZEICHEN_MS * 3 * tempoFaktor);
  return new Promise((fertig) => setTimeout(fertig, sprechDauer(text)));
}
