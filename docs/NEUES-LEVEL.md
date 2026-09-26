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
| `.` | Gras | `M` | Fels (Wand) |
| `,` | Gras mit Blumen | `W` | Steinmauer |
| `:` | Pflasterweg | `R` | Mauer mit Rune |
| `_` | Acker | `~` | Wasser |
| `#` | Steinboden | `=` | Brücke |
| `\|` | roter Teppich | `-` | Holzboden |
| `T` | Tanne | `F` | Obstbaum (gibt **Äpfel**) |
| `B` | Brunnen (gibt **Wasser**) | `S+` | Marktstand, 2 Felder breit (gibt **Essen**) |
| `Q` | Bücherregal (gibt **Bücher**) | `K` | Fass |
| `L` | Feuerschale | `A` / `E` | Amboss / Schmiede-Esse |
| `P` | Pilze | `@` | Hier startet der Grosse Zwerg |
| `a`–`z` | eine Figur (siehe unten) | `1`–`9` | Tür / Ausgang (siehe unten) |

Neue Zeichen kannst du in `src/levels/legende.js` erfinden.

## 2. Figuren beschreiben
Jeder Kleinbuchstabe auf der Karte bekommt einen Eintrag:
```js
figuren: {
  a: {
    name: 'Onkel Gimli',
    aussehen: { vorlage: 'zwerg', haar: 'rot', kleid: 'gruen', kopf: 'stahl' },
    stimme: { hoehe: 0.7 },          // 0.5 = tief, 2 = hoch
    wunsch: 'wasser',                // essen, wasser, buch oder frucht
    neckt: 'Hoho, du Riese!',        // (freiwillig) wird nur beim ersten Mal gesagt
    sagt: 'Holst du mir bitte Wasser?',
    danke: 'Danke, mein Freund!',
    danach: 'Du bist ein echter Held.',
  },
},
```
- **vorlage:** `zwerg` (mit Helm), `zwergin` (mit Zöpfen), `kind`, `koenigin`, `bote`
- **Farben** für haar/kleid/kopf: `rot`, `braun`, `grau`, `schwarz`, `blond`, `gruen`, `blau`, `lila`, `orange`, `rosa`, `stahl`, `leder`, `gold`
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

## 5. Ausprobieren
`npm run dev` starten und im Browser öffnen. Tipp: Auf dem Titelbild unten rechts «Neu anfangen» drücken,
damit alle Wünsche wieder offen sind.
