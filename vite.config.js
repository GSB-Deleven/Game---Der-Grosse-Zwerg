import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Zwei Build-Arten:
//  npm run build            -> Ordner dist/ für GitHub Pages
//  npm run build:artefakt   -> eine einzige HTML-Datei (dist-artefakt/index.html) zum Direkt-Spielen
export default defineConfig(({ mode }) => {
  if (mode === 'artefakt') {
    return {
      base: './',
      plugins: [viteSingleFile()],
      build: { outDir: 'dist-artefakt', chunkSizeWarningLimit: 5000 },
    };
  }
  return {
    base: '/Game---Der-Grosse-Zwerg/',
    build: { outDir: 'dist', chunkSizeWarningLimit: 5000 },
  };
});
