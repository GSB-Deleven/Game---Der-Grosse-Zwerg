// Speichert den Spielstand im Browser (bleibt auch nach dem Schliessen erhalten).
const SCHLUESSEL = 'grosser-zwerg-spielstand-v1';

export function leererSpielstand() {
  return { kapitel: 1, erfuellt: [], herzen: 0, introGesehen: false };
}

export function ladeSpielstand() {
  try {
    const roh = localStorage.getItem(SCHLUESSEL);
    if (roh) return { ...leererSpielstand(), ...JSON.parse(roh) };
  } catch (e) { /* kein Speicher verfügbar – dann eben ohne */ }
  return leererSpielstand();
}

export function speichereSpielstand(stand) {
  try { localStorage.setItem(SCHLUESSEL, JSON.stringify(stand)); } catch (e) { /* ignorieren */ }
}

export function loescheSpielstand() {
  try { localStorage.removeItem(SCHLUESSEL); } catch (e) { /* ignorieren */ }
}
