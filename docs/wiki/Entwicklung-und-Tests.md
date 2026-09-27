# Entwicklung und Tests

```bash
npm install
npm run dev              # http://localhost:5173/Game-Der_Grosse_Zwerg/
npm run pruefen          # alle Karten auf Sackgassen prüfen
npm run build            # dist/ für GitHub Pages
npm run build:artefakt   # eine einzige HTML-Datei (dist-artefakt/)
node tests/durchlauf.mjs # ganzes Spiel automatisch durchspielen (bei laufendem Server)
KAPITEL=3 node tests/durchlauf.mjs   # nur ab Kapitel 3
```

## Abkürzungen im Browser
- `?kapitel=4` – startet direkt in Kapitel 4 (Speicherplatz 3, Name «Test»)
- `?schnell` – verkürzt Wartezeiten beim Sprechen (für Tests)

## Der Durchlauf-Test
`tests/durchlauf.mjs` spielt wie ein Kind: Er fragt das Spiel, wohin der **gelbe Pfeil** zeigt, und tippt dorthin –
Wünsche, Bauaufgaben, Türen, Auslöser. Splash-Screens, Entscheidungen, Geschichten und den Flug klickt er weg.
Unterwegs lädt er einmal neu und prüft, ob der Spielstand am gleichen Ort weitergeht. Er macht Bildschirmfotos
jeder Karte (`test-bilder/`). Wenn der Pfeil irgendwo nicht weiterführt, meldet der Test einen «Hänger».

## Veröffentlichen
- **GitHub Pages:** Workflow `.github/workflows/deploy.yml` baut bei jedem Push auf `main` (Settings → Pages → Source: GitHub Actions).
- **Wiki:** Die Seiten liegen in `docs/wiki/` und werden per Workflow `wiki.yml` ins Wiki übertragen.
- **Claude-Artefakt:** `npm run build:artefakt` erzeugt `dist-artefakt/spiel.html`.
