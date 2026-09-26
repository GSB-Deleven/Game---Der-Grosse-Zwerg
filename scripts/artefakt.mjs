// Macht aus dem Einzeldatei-Build eine Seite fürs Claude-Artefakt:
// dort wird das <html>/<head>/<body>-Gerüst automatisch ergänzt, also nur den Inhalt behalten.
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('dist-artefakt/index.html', 'utf8');
const nimm = (re) => [...html.matchAll(re)].map((m) => m[0]).join('\n');
const titel = nimm(/<title>[\s\S]*?<\/title>/g);
const links = nimm(/<link[^>]*fonts\.(googleapis|gstatic)[^>]*>/g);
const stile = nimm(/<style[\s\S]*?<\/style>/g);
const skripte = nimm(/<script[\s\S]*?<\/script>/g);
const inhalt = `${titel}\n${links}\n${stile}\n<div id="spiel"></div>\n${skripte}\n`;
writeFileSync('dist-artefakt/spiel.html', inhalt);
console.log(`dist-artefakt/spiel.html geschrieben (${Math.round(inhalt.length / 1024)} KB)`);
