// Sprechen: Der Text erscheint in der Sprechblase, dazu ein kurzes "Plappern"
// in der Tonhöhe der Figur (wie bei alten Nintendo-Spielen). Keine Computerstimme.
import { blip } from './ton.js';

let lauf = null;
export const ZEICHEN_MS = 32; // so schnell erscheinen die Buchstaben

export function verstummen() {
  if (lauf) { clearInterval(lauf); lauf = null; }
}

// Wie lange ein Text zum Lesen/Vorlesen braucht
export function sprechDauer(text) {
  return text.length * ZEICHEN_MS + 1400 + Math.min(2500, text.length * 25);
}

export function sprich(text, { hoehe = 1 } = {}) {
  verstummen();
  let i = 0;
  lauf = setInterval(() => {
    i += 3;
    if (i >= text.length) { verstummen(); return; }
    if (text[i] !== ' ') blip(hoehe);
  }, ZEICHEN_MS * 3);
  return new Promise((fertig) => setTimeout(fertig, sprechDauer(text)));
}
