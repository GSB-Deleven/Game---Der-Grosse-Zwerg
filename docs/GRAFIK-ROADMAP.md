# Grafik-Roadmap: "Secret of Mana" HD-2D Magie

**Ziel:** Das Spiel für Liv (5) und ihren Bruder (3) atmosphärisch und visuell aufwerten, inspiriert vom SNES-Klassiker *Secret of Mana*.

---

## 1. Übersicht & Architektur

- **Branch:** `grafik-effekte-test` (alle Experimente finden hier statt, `main` bleibt stabil).
- **Referenz-Bilder:**
  - `docs/referenzen/secret-of-mana-stil.png`: Ziel-Ästhetik (üppige Baumkronen, Wasserlilien, Lichtakzente, lebendige Natur).
  - `docs/referenzen/zwerg-spritesheet.png`: Ziel-Detailgrad für den Zwerg (markanter Bart, Hörnerhelm, Gürtel, Muskeln, Hammer).

---

## 2. Die drei Säulen

### Säule 1: Partikelsystem & Atmosphäre (STATUS: ✅ Erster Wurf fertig)
- **Dateien:** `src/grafik/welt-grafik.js`, `src/scenes/Welt.js`
- **Was umgesetzt ist:**
  - Texturen: `partikel_glanz` (weicher Leuchtpunkt, additiv), `blatt0`/`blatt1` (fallende Blätter mit Drehung), `partikel_staub` (feiner Lichtstaub).
  - Presets in `Welt.STIMMUNG`:
    - `waldsporen`: Grün/goldene Leuchtsporen im dunklen Wald (über der Dunkelheitsschicht).
    - `blaetter`: Herabsegelnde Blätter auf windigen Karten.
    - `lichtstaub`: Sonnenstaub im Dorf und auf Wiesen.
    - `hoehlenglimm`: Mystisches Leuchten in Höhlen.
    - `schneeflocken`: Schneetreiben im Gebirge.

### Säule 2: Bäume & Natur-Details (STATUS: 🟡 Als Nächstes)
- **Dateien:** `src/grafik/welt-grafik.js` (`laubbaum`, `obstbaum`, `tanne`), `src/levels/legende.js`
- **Geplante Schritte:**
  - **Foliage Clumps (Blätter-Cluster):** Statt glatter Ovale wolkenartige Büschel mit individuellem Glanzlicht (oben-links) und Schattentiefe (unten).
  - **Organischer Stamm:** Rindenmaserung, Astgabeln, sichtbare Wurzeln im Boden.
  - **Farbpalette:** 5–6 Grüntöne statt bisher 3 für spürbare Farbtiefe.
  - **Deko-Objekte:** Wasserlilien auf dem See (`src/levels/see.js`), detaillierte Blumenbüschel.

### Säule 3: Figuren & Zwerg-Animationen (STATUS: 🟡 Entscheidung: Weg B - Spritesheets)
- **Entscheidung:** Echte handgezeichnete Spritesheets (Weg B) statt rein prozeduraler Ellipsen.
- **Referenz:** `docs/referenzen/zwerg-spritesheet.png`
- **Geplante Schritte:**
  - Zwergen-Spritesheet in passende Frames slicen (Idle, Laufen, Jubeln, Strecken, ggf. Tragen).
  - In `src/grafik/figur-texturen.js` / `src/scenes/Boot.js` einbinden.
  - Phaser-Animationen anstelle der bisherigen Laufphasen registrieren.
  - Fallback/Kompatibilität mit Kleiderkiste und Missionen wahren.

---

## 3. Nahtlose Übergabe (Antigravity ↔ Claude)

- Jedes Mal, wenn gewechselt wird:
  1. `git status` und `git diff` prüfen.
  2. `npm run pruefen` (Karten-Integrität) und `npm run build` ausführen.
  3. Fortschritt in `CLAUDE.md` und dieser Datei aktualisieren.
  4. Änderungen auf `grafik-effekte-test` committen und pushen:
     `git add . && git commit -m "..." && git push origin grafik-effekte-test`
