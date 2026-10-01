# Technik

- **Phaser 3** (2D-Spiel-Bibliothek) + **Vite** (Entwicklungsserver und Build), alles in JavaScript.
- **Keine Bilddateien:** Alle Figuren, Gebäude, Böden, Gegenstände, Töne und die Musik werden im Code erzeugt.
- Gestaltet für 960 × 540, die Spielwelt wird 3-fach vergrössert gezeigt (16-Pixel-Kacheln).
- Schriften: «Pixelify Sans» für Texte, «Press Start 2P» für Zahlen, beide über `@fontsource` im Spiel eingebaut (kein Google Fonts, funktioniert offline).

## Ordner
| Pfad | Inhalt |
|---|---|
| `src/main.js` | Start, Szenen, Taste F (Vollbild) |
| `src/scenes/` | Titel, Spielstaende, Geschichte, Welt (das eigentliche Spiel), Oberflaeche (Herzen, Sprechfeld, Touch), Pause (Menü), Splash, Entscheidung, Flug, KapitelEnde, Abspann |
| `src/levels/` | Karten als Textraster, `legende.js` (Zeichen → Boden/Objekt), `index.js` (Karten + Kapitel) |
| `src/grafik/figuren-baukasten.js` | Figuren aus Teilen (farbiger Umriss, 5-Ton-Schattierung, Haarsträhnen, alle Laufphasen) |
| `src/grafik/figuren-liste.js` | Aussehen aller Figuren |
| `src/grafik/drache.js` | Glutherz (sitzend, fliegend, Augen) und das Pony |
| `src/grafik/welt-grafik.js` | Boden mit Übergängen, Bäume aus Blätter-Büscheln, Gebäude (Ziegel, Holz, Mauerwerk), Deko, Tiere, Licht |
| `src/grafik/knoepfe.js` | Touch-Steuerkreuz im Zwergen-Stil (Pixel für Pixel gemalt) |
| `src/systeme/` | Speichern (3 Plätze), Musik, Töne, Plappern/Text, Kapitelwechsel, Vollbild, Bildschirm-Anpassung (`bildschirm.js`) |
| `src/texte/de.js` | Allgemeine Texte, Bildergeschichten |
| `tests/durchlauf.mjs` | Automatischer Durchlauf (folgt dem Pfeil) |
| `scripts/pruefe-karten.mjs` | Prüft alle Karten auf Sackgassen |

## Wie eine Karte entsteht
1. `Welt.baueKarte()` liest das Textraster, bestimmt für jede Kachel den Boden und malt die ganze Karte in **ein** Bild
   (`maleBoden`, mit weichen Übergängen zwischen Gras, Weg, Wasser, Fels).
2. Objekte aus der Legende werden als Bilder gesetzt (Tiefe nach y-Position), feste Kacheln kommen in eine unsichtbare Kollisions-Ebene.
3. Figuren bekommen ihre Texturen aus dem Baukasten, Wünsche eine Sprechblase.
4. Dunkle Karten legen eine Dunkel-Ebene darüber, in die Lichtkreise gestanzt werden.

## Drehbücher (Ereignisse)
Zwischenszenen stehen als Liste von Schritten in den Level-Daten (`ereignisse`) oder beim Kapitel (`wennFertig`):
`sage`, `splash`, `warte`, `zeige`, `figurKommt`, `licht`, `heldLicht`, `fackel`, `augen`, `entscheidung`, `jubel`,
`musik`, `ton`, `wackeln`, `zustand`, `gib`, `kapitelEnde`, `kapitelWechsel`, `szene`. Siehe [[Neues Level bauen]].

## Spielstand
`localStorage`, Schlüssel `grosser-zwerg-plaetze-v2`: 3 Plätze mit Kapitel, erfüllten Wünschen, Herzen, Fortschritt von
Bauaufgaben, erlebten Ereignissen, Ort/Position, getragenem Gegenstand, Spielzeit.

## Bildschirm-Anpassung (`src/systeme/bildschirm.js`)
- Phaser-Skalierung **`EXPAND`**: 960 × 540 ist immer sichtbar, auf breiteren oder höheren Bildschirmen wird das Spielfeld grösser statt mit schwarzen Rändern.
- **`mittig(scene, breite)`** hält Menüs, Bildergeschichten, Flug und Abspann in der Mitte und verkleinert sie, wenn der Bildschirm zu schmal ist.
- **`beiGroesse(scene, fn)`** ruft `fn` bei jeder Grössenänderung auf (Welt-Kamera, Knöpfe der Oberfläche).
- **`sichererRand(scene)`** liest `env(safe-area-inset-*)` (iPhone-Notch, Statusleiste) in Spiel-Punkten.
- **Hochkant** (Handy schmaler als 600 Punkte, Einstellung «Hochkant spielen»): `passeFormAn()` stellt die Grundgrösse auf 540 × 960 um.

## Veröffentlichung und Updates
- Web-App-Manifest und Symbole in `public/`: «Zum Home-Bildschirm» startet im Vollbild.
- `main.js` vergleicht beim Start und beim Zurückkehren in die App das Skript der aktuellen Seite mit dem online und lädt bei einer neuen Version einmal neu.
- `vite.config.js` setzt `__VERSION__` (Build-Zeit), das Menü zeigt sie an.
- Beim ersten Speichern: `navigator.storage.persist()`, damit der Browser die Spielstände nicht von selbst löscht.
