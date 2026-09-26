# Der Grosse Zwerg 🧔‍🦰🐉

Ein kleines Retro-Abenteuer (im Stil von Zelda und Secret of Mana) für Liv und ihren Bruder –
nach der Gute-Nacht-Geschichte vom Grossen Zwerg. Es gibt **keinen Kampf und kein «Game Over»**:
Der Grosse Zwerg löst alles mit Mut, Hilfsbereitschaft und einem grossen Herzen.

## Spielen
- **Tablet/Handy:** Steuerkreuz links, grosser Herz-Knopf «Helfen» rechts – oder einfach irgendwo
  hintippen, dann läuft der Zwerg selbst dorthin (und hilft, wenn man auf eine Figur tippt).
- **PC:** Pfeiltasten oder WASD zum Laufen, Leertaste zum Helfen.
- **Controller:** Steuerkreuz/Stick zum Laufen, A (oder jeder andere Knopf) zum Helfen.
- Wer etwas braucht, zeigt es mit einem **Bild über dem Kopf**. Ein **gelber Pfeil** zeigt immer, wohin es als Nächstes geht.
- Alles wird vorgelesen (Browser-Stimme). Der Spielstand wird automatisch gespeichert.

## Stand
| Kapitel | Inhalt | Stand |
|---|---|---|
| 1 | Die Zwergenfeste: Essen, Wasser, Äpfel und Bücher für die Dorf-Zwerge (Livs Wünsche) | ✅ spielbar |
| 2 | Der Ruf der Königin & die Reise (Seen, Täler, Wald, Berge) | geplant |
| 3 | Der höchste Berg & die Drachenhöhle – Freundschaft statt Kampf | geplant |
| 4 | Flug auf dem Drachen & Finale am Marktplatz | geplant |

## Für Eltern: Wie ändere ich etwas?
- **Texte der Dorf-Zwerge, Wünsche, Karte:** `src/levels/dorf.js` und `src/levels/bibliothek.js`
- **Neues Level bauen:** siehe [docs/NEUES-LEVEL.md](docs/NEUES-LEVEL.md)
- **Figuren umzeichnen:** `src/grafik/eigene-sprites.js` (jeder Buchstabe ist ein Pixel).
  Alle Figuren ansehen: `galerie.html` im Entwicklungsmodus öffnen.
- **Allgemeine Texte (Titel, Einleitung):** `src/texte/de.js`

## Technik
Phaser 3 + Vite, alles in JavaScript. Grafiken sind selbst gezeichnet (im Code), Töne werden im Code erzeugt.

```bash
npm install
npm run dev              # Entwicklungsserver: http://localhost:5173/Game---Der-Grosse-Zwerg/
npm run build            # Ordner dist/ für GitHub Pages
npm run build:artefakt   # eine einzige Datei: dist-artefakt/index.html (zum Teilen) und spiel.html (fürs Claude-Artefakt)
node tests/durchlauf.mjs # spielt Kapitel 1 automatisch durch (bei laufendem "npm run dev")
```

### Veröffentlichen mit GitHub Pages
Einmalig: Repository → Settings → Pages → Source: **GitHub Actions**. Danach wird bei jeder Änderung auf `main`
automatisch veröffentlicht unter `https://gsb-deleven.github.io/Game---Der-Grosse-Zwerg/`.
Auf dem Tablet: Seite öffnen → «Zum Home-Bildschirm» → startet wie eine App.

### Grafik-Pakete (optional, CC0 – frei verwendbar)
Wenn wir später schönere Kacheln wollen, passen diese Pakete zum D&D-Stil:
- 0x72 «16x16 DungeonTileset II» – https://0x72.itch.io/dungeontileset-ii
- Kenney «Tiny Dungeon» – https://kenney.nl/assets/tiny-dungeon
- Kenney «Tiny Town» – https://kenney.nl/assets/tiny-town

Herunterladen, entpacken und auf GitHub in den Ordner `public/assets/` hochladen («Add file → Upload files»).
