# Plan: «Der Grosse Zwerg» – Überarbeitung 2: Stimmen, SNES-Look, Spielstände

## Kontext
Kapitel 1 ist spielbar (Branch `claude/grosser-zwerg-game-plan-uicvh9`, Artefakt https://claude.ai/artifact/7xCpQAoHUWttCtGYtPqEUU). Feedback nach dem ersten Test:
1. Die Browser-Computerstimme klingt «grausig» – jede Figur soll eine **eigene, natürliche Stimme** bekommen.
2. Die Bewegung des Grossen Zwergs sieht **lächerlich** aus; das Ganze wirkt **lieblos und detailarm**.
3. **Spielstände**: wahlweise von vorne anfangen oder den aktuellen Stand speichern.

Deine Entscheide: KI-Stimmen vorab erzeugt · SNES-Stil (Secret of Mana) mit grösseren, detaillierten Figuren · 3 Speicherplätze.
Grundsätze bleiben: D&D-Zwerge, kein Kampf, kein Game Over, alles vorgelesen, Artefakt wird nach jeder Etappe unter derselben Adresse aktualisiert.

---

## 1. Natürliche Stimmen für jede Figur
**Technik:** Offline-Sprach-KI **Piper** (neuronale Stimmen, deutlich natürlicher als die Browser-Stimme) über `sherpa-onnx` (pip). Die deutschen Piper-Stimmen sind über GitHub-Releases erreichbar (geprüft: `k2-fsa/sherpa-onnx` → `tts-models`). Die Sätze werden **einmalig vorab** zu MP3-Dateien erzeugt und ins Spiel gepackt – kein Internet, keine Kosten, im Spiel keine Roboterstimme mehr.

**Besetzung** (Basisstimme + Tonhöhe/Tempo per Nachbearbeitung, damit jede Figur unverwechselbar klingt):
| Figur | Basisstimme | Charakter |
|---|---|---|
| Erzähler | thorsten (high) | ruhig, warm, Gute-Nacht-Ton |
| Grosser Zwerg | thorsten_emotional | tiefer, gutmütig, etwas langsamer |
| Mama Hilde | kerstin | warm, freundlich |
| Oma Runa | eva_k | etwas tiefer, langsam |
| Kinder (Tilda, Bruno, Nella, Pip) | ramona / kerstin / eva_k | höher (+3–5 Halbtöne), schneller, je Kind verschieden |
| Schmied Balin | karlsson | sehr tief, kräftig |
| Händler, Bauer, Bibliothekar | pavoque / mls-Sprecher / thorsten | je eigene Tiefe & Tempo |
| Bote | thorsten_emotional «surprised» | aufgeregt, feierlich |
| Später: Königin, Drache | kerstin tiefer / thorsten stark tiefer + Hall | – |

Vor dem Einbau erzeuge ich eine **Hörprobe** (ein Satz pro Figur) als kleines Artefakt, damit du die Besetzung prüfen kannst.

**Umsetzung**
- `scripts/saetze-exportieren.mjs`: sammelt alle Sätze aus `src/levels/*.js`, `src/texte/de.js` und den Zwischenszenen → `stimmen/saetze.json` (Figur/Stimme + Text).
- `tools/stimmen/erzeuge.py` + `tools/stimmen/besetzung.json`: erzeugt pro Satz `src/stimmen/<hash>.mp3` (Hash aus Stimme+Text → nur Neues/Geändertes wird neu erzeugt), Tonhöhe via librosa, MP3 via lameenc. Befehl: `npm run stimmen`.
- Neues Modul `src/systeme/stimme.js` ersetzt die Browser-Sprachausgabe: spielt die MP3 zur Figur ab (Phaser Sound), gibt ein Promise bis zum Ende zurück; die sprechende Figur bewegt sich dabei («redet»). Fehlt eine Datei (z.B. neuer Satz ohne `npm run stimmen`), fällt es auf die Browser-Stimme zurück.
- Einbindung über `import.meta.glob('../stimmen/*.mp3')` → im Pages-Build normale Dateien, im Artefakt-Build automatisch eingebettet (geschätzt ~1–2 MB).
- `docs/NEUES-LEVEL.md` bekommt einen Abschnitt «Stimmen erzeugen».

## 2. SNES-Look & lebendige Bewegung
**Figuren – Baukasten statt Einzelbilder:** Neuer Sprite-Baukasten `src/grafik/figuren-baukasten.js`, der Figuren aus Teilen zusammensetzt (Beine, Rumpf, Arme, Kopf, Bart, Helm/Haare, Rucksack, Kleidung) und daraus **alle Richtungen und Animationsphasen** berechnet – mit automatischem Umriss und Schattierung (Licht von links oben), wie bei SNES-Sprites.
- **Grosser Zwerg** ca. 24 × 44 px (statt 16 × 32): Hörnerhelm mit Nieten, geflochtener roter Bart mit Goldringen, Kettenhemd-Kragen, Gürtel, Rucksack mit Seil und Laterne, Stiefel.
- Animationen: 4 Richtungen × **6-Phasen-Laufzyklus** (Armschwung, Körperwippen, schwingender Bart), Stehen mit Atmen und Blinzeln, **Tragen** (Arme hoch, Gegenstand über dem Kopf), **Strecken** (holt Äpfel/Bücher von ganz oben), Freudensprung.
- Dorf-Zwerge ca. 20 × 28 px mit vielen Varianten (Bartformen: lang, Gabelbart, Zöpfe, kurz; Helme, Kapuzen, Glatze; Schürzen, Umhänge); Kinder ca. 16 × 22 px. Figuren blinzeln, drehen den Kopf zum Grossen Zwerg, «reden» beim Sprechen, freuen sich sichtbar.
- **Bewegungsgefühl:** sanftes Beschleunigen/Abbremsen, 8 Richtungen mit passender Blickrichtung, Animationstempo an die Geschwindigkeit gekoppelt, kleine Staubwölkchen beim Losgehen, leise Schritte.

**Welt – detailreich und lebendig:**
- Kachel-Übergänge (Gras↔Weg, Gras↔Wasser mit Ufer, Felskanten mit Ober- und Vorderseite) statt harter Kanten.
- Zwergengebäude als richtige Bauten: Steinhäuser mit Schieferdach und Kamin, grosses Tor der Bergfestung mit Ahnen-Statuen und Bannern, Schmiede mit Funken und Rauch, Mineneingang mit Loren, Markt mit mehreren Ständen und Waren.
- Deko-Schicht: Blumen, Grasbüschel, Steine, Büsche, Zäune, Wegweiser, Laternen, Heuballen, Holzstapel, Fässer, Kisten.
- Leben: Rauch aus Kaminen, flackernde Fackeln mit Lichtschein, glitzerndes Wasser, Schmetterlinge, Vögel, Hühner/Ziegen, ziehende Wolkenschatten, Zwerge mit kleinen Tätigkeiten (Schmied hämmert, Bauer hackt).
- **Musik:** kleine Chiptune-Melodien pro Ort (Dorf, Bibliothek, Titel), im Code erzeugt; leiser, wenn jemand spricht.
- Die Dorfkarte wird dafür neu gestaltet (gleiche Aufgaben, schönere Anordnung); Legende und `NEUES-LEVEL.md` werden um die neuen Zeichen ergänzt.

## 3. Splash-Screens bei coolen Momenten
Kurze, bildschirmfüllende Einblendungen (2–4 Sekunden, antippen überspringt), mit grossem Bild, Fanfare und gesprochenem Satz – nicht bei jeder Kleinigkeit, sondern ab und zu:
- **Neuer Ort** betreten (erstes Mal): Ortsname als Banner wie bei Zelda, z.B. «Die Runen-Bibliothek».
- **Meilensteine**: erstes Herz («Du hast einem Zwerg geholfen!»), alle Äpfel verteilt, alle Bücher gebracht, 5 und 9 Herzen – mit Zwerg in Siegerpose, Herzregen und Konfetti.
- **Die frechen Kinder werden Freunde**: Einblendung «Freundschaft!» mit Kind und Grossem Zwerg.
- **Story-Momente**: Bote der Königin kommt, Kapitel geschafft; später: Drache taucht auf, Drache wird Freund, Abflug, Ehrenmitglied der Garde.
- Umsetzung als eigene Szene `src/scenes/Splash.js`, die über der Welt liegt und die Welt pausiert; Auslöser in den Level-Daten (`meilensteine`) festgelegt, damit neue Level eigene Splashes bekommen können.

## 4. Drei Speicherplätze
- Neuer Bildschirm **«Spielstand wählen»** nach dem Titel: 3 Plätze, jeder mit wählbarem Bild (z.B. Zwerg, Drache, Blume) und Name (für Eltern eintippbar), zeigt Kapitel, Herzen und Spielzeit. Leerer Platz → «Neues Spiel». Pro Platz «Löschen» mit Bestätigung im Spiel.
- **Pause-Menü** im Spiel: Weiterspielen · **Speichern** («Gespeichert!») · Lautstärke Musik/Stimmen · Zum Titel.
- Automatisches Speichern bei jedem Herz und Kartenwechsel; gespeichert werden auch Ort, Position und was der Zwerg trägt → man macht genau dort weiter.
- `src/systeme/speichern.js` wird auf Plätze umgebaut; der bisherige Spielstand wird automatisch in Platz 1 übernommen.

---

## Reihenfolge
1. Speicherplätze + Pause-Menü (schnell spürbar) → Artefakt aktualisieren
2. Stimmen: Hörprobe → deine Freigabe → alle Sätze erzeugen und einbauen → Artefakt
3. Figuren-Baukasten + Bewegung → Artefakt
4. Welt, Gebäude, Leben, Musik → Artefakt
5. Splash-Screens (nutzen die neuen Figuren und Stimmen) → Artefakt
Danach wie geplant weiter mit Kapitel 2 (Königin & Reise), dann Berg/Höhle/Drache, Flug, Finale.

## Wichtige Dateien
- Neu: `src/grafik/figuren-baukasten.js`, `src/grafik/welt-kacheln.js`, `src/scenes/Spielstaende.js`, `src/scenes/Pause.js`, `src/scenes/Splash.js`, `src/systeme/musik.js`, `scripts/saetze-exportieren.mjs`, `tools/stimmen/erzeuge.py`, `tools/stimmen/besetzung.json`, `src/stimmen/*.mp3`
- Umbau: `src/scenes/Welt.js` (Bewegung, Animationen, Deko, Stimmen), `src/systeme/stimme.js`, `src/systeme/speichern.js`, `src/grafik/texturen.js`, `src/levels/dorf.js`, `src/levels/legende.js`, `src/scenes/Titel.js`, `src/scenes/Oberflaeche.js`

## Überprüfung
- `tests/durchlauf.mjs` erweitern: Spielstand wählen, Kapitel 1 durchspielen, speichern, neu laden → gleicher Ort/Herzen; Platz löschen.
- Prüfen, dass zu **jedem** Satz eine MP3 existiert (Skript meldet fehlende).
- Bildschirmfotos jeder Szene + ein kurzes Video/GIF der Laufanimation prüfen.
- Pages- und Artefakt-Build; Durchlauf-Test gegen die Artefakt-Datei; Artefakt neu veröffentlichen.
