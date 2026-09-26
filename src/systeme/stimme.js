// Vorlese-Stimme: nutzt die eingebaute Sprachausgabe des Browsers.
// Später kann man hier eigene Aufnahmen einbauen (z.B. auf Schweizerdeutsch).

let stimmen = [];
let deutscheStimme = null;
let aktiv = true;

function waehleStimme() {
  if (!('speechSynthesis' in window)) return;
  stimmen = window.speechSynthesis.getVoices();
  const de = stimmen.filter((s) => s.lang && s.lang.toLowerCase().startsWith('de'));
  deutscheStimme =
    de.find((s) => s.lang.toLowerCase() === 'de-ch') ||
    de.find((s) => /anna|petra|helena|katja|google/i.test(s.name)) ||
    de[0] || null;
}

if ('speechSynthesis' in window) {
  waehleStimme();
  window.speechSynthesis.onvoiceschanged = waehleStimme;
}

export function stimmeAn(an) { aktiv = an; if (!an) verstummen(); }
export function istStimmeAn() { return aktiv; }

export function verstummen() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

// Spricht einen Text. hoehe: 0.5 (tief) .. 2 (hoch), tempo: 0.5 .. 1.5
// Gibt ein Promise zurück, das erfüllt wird, wenn fertig gesprochen ist.
export function sprich(text, { hoehe = 1, tempo = 0.95 } = {}) {
  return new Promise((fertig) => {
    if (!aktiv || !('speechSynthesis' in window) || !text) {
      setTimeout(fertig, Math.min(6000, 600 + text.length * 55));
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = deutscheStimme ? deutscheStimme.lang : 'de-DE';
    if (deutscheStimme) u.voice = deutscheStimme;
    u.pitch = hoehe;
    u.rate = tempo;
    let erledigt = false;
    const ende = () => { if (!erledigt) { erledigt = true; fertig(); } };
    u.onend = ende;
    u.onerror = ende;
    // Sicherheitsnetz, falls der Browser "onend" vergisst
    setTimeout(ende, 1500 + text.length * 90);
    synth.speak(u);
  });
}
