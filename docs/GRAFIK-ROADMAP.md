# Grafik: vom 80er- zum 90er-Look

**Ziel:** Mehr Details und Tiefe, etwa wie späte SNES- oder GBA-Spiele (Vorbild *Secret of Mana*).
Alles bleibt **im Code gemalt**, die Kachelgrösse (16 px) und alle Bildgrössen bleiben gleich.
Kollision, Fusspunkte, Obst-Plätze und die Kleiderkiste funktionieren deshalb unverändert.

Vorschau ohne Spiel: `npm run dev`, dann
`galerie.html?nur=zwerge` (alle Figuren), `galerie.html?nur=welt` (Boden-Probe, Gebäude, Deko) oder `?nur=drache`.

## Stand (Oktober 2026): erledigt

### 1. Mal-Grundlage (`src/grafik/figuren-baukasten.js`)
- **5 statt 3 Farbtöne:** `rampe5()` leitet aus jeder Rampe `[dunkel, mittel, hell]` einen kühlen
  Tiefschatten und ein warmes Glanzlicht ab. `stufe(rampe, 0..4)` holt einen Ton.
- **Kugel-Licht:** runde Teile (`ellipse`) werden wie eine Kugel beleuchtet, mit Reflexlicht unten rechts.
- **Farbige Umrisse:** dunkel, aber in der Farbe des Teils getönt (typisch GBA), statt fast schwarz.
- **`straehnen()`:** färbt Haare und Bärte als fliessende Strähnen um.

### 2. Figuren
- Grosser Zwerg (alle Ansichten und Posen): Bart in Strähnen, geflochtene Zöpfe mit Goldring, Helm mit
  Mittelgrat und Glanz, Nieten, Hörner mit Ringen, Schulterstücke, Armschienen, Gürtelschnalle, Tasche,
  Stiefel mit Sohle und Fellstulpe, Rucksack mit Riemen. Kleiderfarben laufen weiter über `HELD_FARBEN`.
- Dorf-Zwerge: Bärte in Strähnen, Zöpfe, Stiefel, Falten, Gürtelschnallen, Glanz auf Helm, Kapuzensaum.

### 3. Welt (`src/grafik/welt-grafik.js`)
- **Bäume:** `krone()` baut Kronen aus vielen einzeln beleuchteten Blätter-Büscheln, `stamm()` malt Rinde,
  Wurzeln und Astgabel, `tannenEtage()` gezackte Tannen-Äste mit Nadel-Furchen. Auch Büsche, Beeren, Rosen.
- **Gebäude:** Pinsel `ziegel()` (Dachziegel), `bretter()` (Holz mit Maserung, auch runde Baumstämme)
  und `mauerwerk()` (Steine mit Lichtkante und Moos) an Häusern, Stall, Turm, Schloss, Tor, Tür, Kiste.
- **Boden:** Gras mit 6 Tönen, Büscheln, Klee und Blümchen; Kopfsteinpflaster mit Licht und Schatten pro Stein
  und Halmen am Wegrand; Wasser wird zur Mitte tiefer und hat Schaum am Ufer; dazu Acker, Holzboden mit
  Nägeln, Steinplatten mit Fase und Rissen, Sand-Rippel, weicher Schnee, Höhlenpflaster, Mauern mit Moos.
- **Atmosphäre** (`src/scenes/Welt.js`, `Welt.STIMMUNG`): Leuchtsporen im Wald, Glimmen in der Höhle,
  Lichtstaub und Blätter auf Wiesen, Funken am Drachenhort. Die Anzahl richtet sich nach der Kartengrösse.
  Von Hand wählen: `leben: { stimmung: 'blaetter' }` oder eine Liste.

## Entscheidungen
- **Kein fertiges Bild als Sprite-Blatt** (der frühere «Weg B»). Das hätte gegen den Grundsatz
  «alle Grafik im Code» verstossen, die Kleiderkiste gebrochen und nicht zum Pixel-Stil gepasst.
- Ladezeit: Die Texturen werden beim Start und pro Karte gemalt. Gemessen mit 4-fach gedrosselter CPU
  braucht der Start etwa 8 % länger als vorher. Farbtabellen werden nicht pro Pixel neu angelegt.

## Ideen für später
- Wasserlilien und Schilf am See, Blumenbüschel als Deko-Objekt.
- Schatten von Bäumen und Häusern auf den Boden (weiche Ellipse wie unter den Figuren).
- Füürio und Pony mit `straehnen()`/Schuppen-Muster nachziehen.
