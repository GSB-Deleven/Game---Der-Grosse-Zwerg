import Phaser from 'phaser';
import { Boot } from './scenes/Boot.js';
import { vollbildUmschalten } from './systeme/vollbild.js';
import { Titel } from './scenes/Titel.js';
import { Geschichte } from './scenes/Geschichte.js';
import { Welt } from './scenes/Welt.js';
import { Oberflaeche } from './scenes/Oberflaeche.js';
import { KapitelEnde } from './scenes/KapitelEnde.js';
import { Spielstaende } from './scenes/Spielstaende.js';
import { Pause } from './scenes/Pause.js';
import { Splash } from './scenes/Splash.js';
import { Entscheidung } from './scenes/Entscheidung.js';
import { Flug } from './scenes/Flug.js';
import { Abspann } from './scenes/Abspann.js';

// Das Spiel rechnet mit 960 x 540 Punkten. Die Spielwelt wird 3-fach vergrössert
// gezeigt (so sieht man 20 x 11 Kacheln) – der typische Retro-Look.
export const BREITE = 960;
export const HOEHE = 540;

// Controller nur einschalten, wenn der Browser das erlaubt (in eingebetteten Seiten manchmal gesperrt)
let controllerErlaubt = false;
try { controllerErlaubt = !!(navigator.getGamepads && (navigator.getGamepads(), true)); } catch (e) { controllerErlaubt = false; }

const spiel = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'spiel',
  width: BREITE,
  height: HOEHE,
  backgroundColor: '#1b1420',
  pixelArt: true,
  roundPixels: true,
  // EXPAND: füllt jeden Bildschirm aus, 960 x 540 bleibt immer sichtbar (siehe systeme/bildschirm.js)
  scale: { mode: Phaser.Scale.EXPAND, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { debug: false } },
  input: { gamepad: controllerErlaubt, activePointers: 3 },
  scene: [Boot, Titel, Spielstaende, Geschichte, Welt, Oberflaeche, Pause, Splash, Entscheidung, Flug, Abspann, KapitelEnde],
});

// Taste F: Vollbild – überall im Spiel (ausser beim Namen eintippen)
window.addEventListener('keydown', (e) => {
  if ((e.key === 'f' || e.key === 'F') && !(e.target instanceof HTMLInputElement)) vollbildUmschalten(spiel);
});

// Für automatische Tests und zum Ausprobieren in der Browser-Konsole
window.spiel = spiel;
