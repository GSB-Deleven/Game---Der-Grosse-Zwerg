# Der Grosse Zwerg – Übergabe für Claude

Kinderspiel (Phaser 3 + Vite) nach Davids Gute-Nacht-Geschichte, für Liv (5) und ihren Bruder (3).
Online: https://gsb-deleven.github.io/Game-Der_Grosse_Zwerg/ · Artefakt: https://claude.ai/artifact/7xCpQAoHUWttCtGYtPqEUU

## Grundsätze (nicht verhandelbar)
- Kein Kampf, keine Gewalt, kein Game Over, man kann nichts verlieren. Freundschaft statt Kampf.
- D&D-/Tolkien-Zwerge (Hörnerhelme, Bärte), keine Gartenzwerge. SNES-Pixel-Look, alle Grafik wird im Code gemalt.
- Alles auf Deutsch, **Schweizer Schreibweise (kein ß)**, kindgerecht. Kinder können nicht lesen:
  Bilder in Sprechblasen, gelber Pfeil zeigt den Weg, alles wird vorgelesen («Plappern»).
- Muss auf iPhone/iPad (hochkant einhändig und quer), Tastatur und Controller gut spielbar sein.

## Arbeitsweise
- Entwicklungs-Branch `claude/grosser-zwerg-game-plan-uicvh9`; jede Änderung zusätzlich auf main: `git push origin HEAD:main`
  (main → GitHub Pages via `.github/workflows/deploy.yml`; `docs/wiki/` → GitHub-Wiki via `wiki.yml`).
- Keine Pull Requests, ausser David fragt. Keine Modellnamen in Commits.
- GitHub-Tools (MCP): owner `GSB-Deleven`, repo `Game---Der-Grosse-Zwerg` (leitet auf Game-Der_Grosse_Zwerg um).
- Nach Code-Änderungen: `npm run pruefen` (Karten), `npm run build`, Testlauf (unten), dann Artefakt:
  `npm run build:artefakt` und `dist-artefakt/spiel.html` auf die Artefakt-URL oben neu veröffentlichen.
- Doku mitpflegen: README.md, `docs/NEUES-LEVEL.md` (Level-/Missions-Anleitung), `docs/wiki/*.md`.
- `@claude` in Issues läuft über `.github/workflows/claude.yml` (Secret CLAUDE_CODE_OAUTH_TOKEN; Details im Wiki
  «Mitarbeit-und-Planung»). Es gibt keine geplanten Routinen mehr (gelöscht, um Tokens zu sparen).

## Testen
- `npx vite preview --port 4173 --strictPort` (nach `npm run build`), dann
  `SPIEL_URL=http://localhost:4173/Game-Der_Grosse_Zwerg/ node tests/durchlauf.mjs`
  → Löser spielt wie ein Kind (folgt dem Pfeil) durch Kapitel 1–5, Abspann und alle Missionen (~12 Min.).
  `KAPITEL=6` = nur Missionen. Bildschirmfotos in `test-bilder/`. Hänger-Erkennung nach 90 s mit Foto `fehler.png`.
- Im Browser: `?kapitel=N` springt in ein Kapitel, `?schnell` verkürzt Wartezeiten.
- Bekannt: Einmal hing der Löser im dunklen Wald (Kapitel 3), danach nicht mehr reproduzierbar.

## Aufbau (wichtigste Dateien)
- `src/levels/*.js` – Karten als Zeichen-Raster, Figuren mit Wünschen, Ereignis-Drehbücher; `legende.js` = Zeichen.
- `src/levels/index.js` – KARTEN und KAPITEL 1–6. `src/levels/missionen.js` – Missionen, Ausbaustufen (HAUS), KLEIDER.
- `src/scenes/Welt.js` – Kern: Laufen, Helfen, Wünsche, Bauaufgaben, Hühner, Versteckis, Wegweiser, Missionen.
- `src/scenes/` weitere: Flug (Drachenflug, auch Post-Mission), Missionen (Missionsbrett), Pause (Menü), Abspann …
- `src/grafik/` – Figuren-Baukasten, Held (Kleider-Farben austauschbar), Welt-Objekte, Drache.
- `src/texte/de.js` – Geschichten, Gegenstände, WEGWEISER-Sprüche.

## Stand (01.10.2026)
- Kapitel 1–5 fertig: Zwergenfeste → Königin → Reise → Drache Glutherz → Flug & Fest (Ehrengarde).
- Aufgaben-Vielfalt: Hühner einfangen (Oma Runa), Versteckis (Nella), Farben sortieren (Gärtnerin, Burghof),
  Bauaufgaben (Trittsteine, Brücke, Strickleiter), Wegweiser mit Running Gag (Erebor, Auenland … immer wieder Mordor).
- Kapitel 6 «Die Ehrengarde» (endlos): Zuhause mit Glutherz, Missionsbrett, Kleiderkiste.
  Missionen: «Der Staudamm» (Belohnung Holzhütte), «Post mit Glutherz» (Garde-Rüstung). Steinhaus ist gezeichnet,
  wartet auf die nächste Mission.
- Menü schliesst bei Klick daneben; Drachenflug zeigt Steuer-Anleitung (Wischen / Pfeiltasten).
- Grafik-Upgrade auf 90er-Look (Okt. 2026): 5-Ton-Schattierung, farbige Umrisse, detaillierter Held und
  Dorf-Zwerge, Bäume aus Blätter-Büscheln, neuer Boden, Ziegel/Holz/Mauerwerk, Atmosphäre-Partikel.
  Details und Ideen: `docs/GRAFIK-ROADMAP.md`. Vorschau: `galerie.html?nur=zwerge` bzw. `?nur=welt`.

## Offene Ideen
- Issue #20: weitere Missionen (Mühle nach Sturm reparieren, Troll mit Zahnweh, Nebel im Wald/Laternen,
  Geburtstagskuchen der Königin, Winterfest), Zubehör für Glutherz (Sattel, Halstuch), Steinhaus-Belohnung.
- Issue #11: echte Stimmen statt Plappern.
- Issue-Vorlage «Neue Mission» (`.github/ISSUE_TEMPLATE/mission.yml`).
