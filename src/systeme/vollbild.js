// Vollbild ein/aus (Taste F oder im Menü). In eingebetteten Seiten kann der Browser das verbieten.
export function vollbildUmschalten(spiel) {
  try {
    if (spiel.scale.isFullscreen) spiel.scale.stopFullscreen();
    else spiel.scale.startFullscreen();
  } catch (e) { /* Vollbild nicht erlaubt – dann eben nicht */ }
}

export function istVollbild(scene) {
  return !!scene.scale.isFullscreen;
}
