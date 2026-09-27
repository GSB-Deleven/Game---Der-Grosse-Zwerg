import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Zwei Build-Arten:
//  npm run build            -> Ordner dist/ für GitHub Pages
//  npm run build:artefakt   -> eine einzige HTML-Datei (dist-artefakt/index.html) zum Direkt-Spielen
// Versions-Stempel (Datum und Uhrzeit des Builds, Schweizer Zeit) – wird im Menü angezeigt
const VERSION = new Date().toLocaleString('de-CH', { timeZone: 'Europe/Zurich', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const define = { __VERSION__: JSON.stringify(VERSION) };

export default defineConfig(({ mode }) => {
  if (mode === 'artefakt') {
    return {
      base: './',
      define,
      plugins: [viteSingleFile()],
      build: { outDir: 'dist-artefakt', chunkSizeWarningLimit: 5000 },
    };
  }
  return {
    base: '/Game-Der_Grosse_Zwerg/',
    define,
    build: { outDir: 'dist', chunkSizeWarningLimit: 5000 },
  };
});
