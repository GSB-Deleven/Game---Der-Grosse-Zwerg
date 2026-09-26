# So baust du ein neues Level

Ein Level ist eine ganz normale Textdatei in `src/levels/`. Die Karte wird mit Buchstaben «gemalt» –
jeder Buchstabe ist ein Feld (16 × 16 Pixel). Am besten kopierst du `bibliothek.js` und änderst sie.

## 1. Karte malen
```js
karte: [
  'MMMMMMMMMMMM',
  'M....a.....M',
  'M..B....F..M',
  'M....@.....M',
  'MMMMM1MMMMMM',
],
```
Alle Zeilen müssen **gleich lang** sein.

| Zeichen | Bedeutung | Zeichen | Bedeutung |
|---|---|---|---|
| `.` | Gras | `M` | Fels / Berg |
| `,` | Blumenwiese | `W` | Steinmauer |
| `:` | Pflasterweg | `R` | Mauer mit Rune |
| `_` | Acker | `~` | Wasser |
| `#` | Steinboden | `=` | Brücke |
| `\|` | roter Teppich | `-` | Holzboden |
| `T` | Tanne | `F` | Obstbaum (gibt **Äpfel**) |
| `B` | Brunnen (gibt **Wasser**) | `S+` | Marktstand, 2 Felder (gibt **Essen**) |
| `Q` | Bücherregal (gibt **Bücher**) | `H++` / `+++` | Zwergenhaus, 3 × 2 Felder |
| `*` | Busch | `^` | Felsbrocken |
| `J` | Zaun | `!` | Laterne (leuchtet) |
| `L` | Feuerschale (brennt) | `E` / `A` | Schmiede-Esse / Amboss |
| `K` / `$` | Fass / Kiste | `%` / `&` | Holzstapel / Heuballen |
| `?` | Wegweiser | `Y` | Ahnen-Statue |
| `V+` | Mineneingang, 2 Felder | `P` | Pilze |
| `@` | Hier startet der Grosse Zwerg | `a`–`z` / `1`–`9` | Figur / Tür (siehe unten) |

Grosse Dinge (Haus, Marktstand, Mine) stehen mit ihrem Buchstaben oben links, die restlichen Felder bekommen ein `+`.
Neue Zeichen kannst du in `src/levels/legende.js` erfinden.

## 2. Figuren beschreiben
Jeder Kleinbuchstabe auf der Karte bekommt einen Eintrag:
```js
figuren: {
  a: {
    name: 'Onkel Gimli',
    aussehen: 'gimli',               // Name aus src/grafik/figuren-liste.js
    stimme: { hoehe: 0.7 },          // Tonhöhe beim Plappern: 0.5 = tief, 2 = hoch
    wunsch: 'wasser',                // essen, wasser, buch oder frucht
    neckt: 'Hoho, du Riese!',        // (freiwillig) wird nur beim ersten Mal gesagt
    sagt: 'Holst du mir bitte Wasser?',
    danke: 'Danke, mein Freund!',
    danach: 'Du bist ein echter Held.',
  },
},
```
Das **Aussehen** steht in `src/grafik/figuren-liste.js`, z. B.
```js
gimli: { typ: 'zwerg', haar: 'rot', bart: 'gabel', kleid: 'gruen', kopf: 'hoernerhelm', kopfFarbe: 'stahl', umhang: 'blau' },
```
- **typ:** `zwerg`, `zwergin`, `kind`, `koenigin`, `bote`
- **bart:** `lang`, `gabel`, `zoepfe`, `kurz`, `keiner`
- **kopf:** `nasenhelm`, `hoernerhelm`, `federhelm`, `kapuze`, `stirnband`, `krone`, `glatze`
- **Farben** (haar, kleid, kopfFarbe, schuerze, umhang): `rot`, `braun`, `kastanie`, `grau`, `weiss`, `schwarz`, `blond`, `stahl`, `gold`, `kupfer`, `blau`, `gruen`, `moos`, `lila`, `weinrot`, `orange`, `rosa`, `leder`, `beige`
- Alle Figuren ansehen: `galerie.html` im Entwicklungsmodus öffnen.
- Ohne `wunsch` redet die Figur einfach nur.

## 3. Türen verbinden
```js
ausgaenge: {
  1: { karte: 'dorf', ziel: 1 },   // Tür 1 führt ins Dorf, dort zur Tür 1
},
```
Auf der anderen Karte braucht es dann auch eine Tür mit der passenden Nummer.

## 4. Level anmelden
In `src/levels/index.js` die Datei importieren, bei `KARTEN` eintragen und beim Kapitel unter `karten` hinzufügen.
Ein Kapitel ist geschafft, wenn **alle Wünsche** auf allen seinen Karten erfüllt sind.

## 5. Tiere, Musik, coole Momente
```js
musik: 'dorf',                                   // dorf, bibliothek, titel (src/systeme/musik.js)
leben: { falter: 6, voegel: true, wolken: true, huehner: [[10, 5], [12, 6]] },
```
Coole Momente mit grosser Einblendung (Splash) stehen beim Kapitel in `src/levels/index.js` unter `meilensteine`.

## 6. Ausprobieren
`npm run dev` starten und im Browser öffnen. Tipp: Einen neuen Spielstand anlegen (oder einen löschen),
damit alle Wünsche wieder offen sind. `node tests/durchlauf.mjs` spielt Kapitel 1 automatisch durch.
