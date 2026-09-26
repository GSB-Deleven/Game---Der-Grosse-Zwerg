import Phaser from 'phaser';
import { Boot } from './scenes/Boot.js';
import { Titel } from './scenes/Titel.js';
import { Geschichte } from './scenes/Geschichte.js';
import { Welt } from './scenes/Welt.js';
import { Oberflaeche } from './scenes/Oberflaeche.js';
import { KapitelEnde } from './scenes/KapitelEnde.js';
import { Spielstaende } from './scenes/Spielstaende.js';
import { Pause } from './scenes/Pause.js';
import { Splash } from './scenes/Splash.js';

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
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { debug: false } },
  input: { gamepad: controllerErlaubt, activePointers: 3 },
  scene: [Boot, Titel, Spielstaende, Geschichte, Welt, Oberflaeche, Pause, Splash, KapitelEnde],
});

// Für automatische Tests und zum Ausprobieren in der Browser-Konsole
window.spiel = spiel;
