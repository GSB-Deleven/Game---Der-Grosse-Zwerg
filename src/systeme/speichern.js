// Drei Speicherplätze wie bei alten Nintendo-Spielen.
// Alles liegt im Browser (localStorage) und bleibt auch nach dem Schliessen erhalten.
const SCHLUESSEL = 'grosser-zwerg-plaetze-v2';
const ALTER_SCHLUESSEL = 'grosser-zwerg-spielstand-v1';
export const ANZAHL_PLAETZE = 3;

// Bilder, die man für einen Spielstand wählen kann (Name -> Anzeige-Name)
export const PLATZ_BILDER = {
  held: 'Zwerg',
  zwergin: 'Zwergin',
  kind: 'Kind',
  herz: 'Herz',
  frucht: 'Apfel',
  buch: 'Buch',
};

export function leererSpielstand(name = 'Zwerg', bild = 'held') {
  return {
    name,
    bild,
    kapitel: 1,
    erfuellt: [],
    herzen: 0,
    introGesehen: false,
    geschichten: [],
    fortschritt: {},
    ereignisse: [],
    sterne: 0,
    fertig: false,
    meilensteine: [],
    orteBesucht: [],
    ort: null, // { karte, x, y }
    traegt: null,
    spielzeit: 0, // Sekunden
    gespeichertAm: null,
  };
}

function lies() {
  try {
    const roh = localStorage.getItem(SCHLUESSEL);
    if (roh) {
      const daten = JSON.parse(roh);
      if (Array.isArray(daten.plaetze)) {
        while (daten.plaetze.length < ANZAHL_PLAETZE) daten.plaetze.push(null);
        return daten;
      }
    }
    // Alten Spielstand (Version 1) in Platz 1 übernehmen
    const alt = localStorage.getItem(ALTER_SCHLUESSEL);
    if (alt) {
      const daten = { plaetze: [{ ...leererSpielstand(), ...JSON.parse(alt) }, null, null], einstellungen: {} };
      schreibe(daten);
      return daten;
    }
  } catch (e) { /* kein Speicher verfügbar – dann eben ohne */ }
  return { plaetze: Array(ANZAHL_PLAETZE).fill(null), einstellungen: {} };
}

function schreibe(daten) {
  try { localStorage.setItem(SCHLUESSEL, JSON.stringify(daten)); return true; } catch (e) { return false; }
}

export function allePlaetze() {
  return lies().plaetze;
}

export function ladePlatz(nummer) {
  const stand = lies().plaetze[nummer];
  return stand ? { ...leererSpielstand(), ...stand } : null;
}

export function speicherePlatz(nummer, stand) {
  const daten = lies();
  daten.plaetze[nummer] = { ...stand, gespeichertAm: Date.now() };
  return schreibe(daten);
}

export function loeschePlatz(nummer) {
  const daten = lies();
  daten.plaetze[nummer] = null;
  schreibe(daten);
}

// Einstellungen gelten für alle Plätze (Lautstärke usw.)
export function ladeEinstellungen() {
  return { musik: 0.6, stimmen: 1, ...(lies().einstellungen || {}) };
}

export function speichereEinstellungen(einstellungen) {
  const daten = lies();
  daten.einstellungen = einstellungen;
  schreibe(daten);
}

// Speichert den aktiven Spielstand aus der Spiel-Registry
export function sichere(registry) {
  const nummer = registry.get('platz');
  const stand = registry.get('stand');
  if (nummer === undefined || nummer === null || !stand) return false;
  return speicherePlatz(nummer, stand);
}

export function spielzeitText(sekunden = 0) {
  const min = Math.floor(sekunden / 60);
  if (min < 60) return `${min} Min.`;
  return `${Math.floor(min / 60)} Std. ${min % 60} Min.`;
}
