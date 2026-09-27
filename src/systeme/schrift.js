// Gemeinsame Schrift-Stile
export const SCHRIFT = '"Pixelify Sans", "Trebuchet MS", sans-serif';

export function stil(groesse = 28, farbe = '#ffffff', extra = {}) {
  return {
    fontFamily: SCHRIFT,
    fontSize: `${groesse}px`,
    color: farbe,
    stroke: '#1b1420',
    strokeThickness: Math.max(3, Math.round(groesse / 6)),
    ...extra,
  };
}

// Zahlen (Herzen, Sterne): eigene Pixel-Schrift mit gut unterscheidbaren Ziffern
// (in Pixelify Sans sieht die 5 fast wie ein S aus)
export const ZAHLEN_SCHRIFT = '"Press Start 2P", "Pixelify Sans", monospace';

export function zahlStil(groesse = 28, farbe = '#ffffff') {
  return { ...stil(groesse, farbe), fontFamily: ZAHLEN_SCHRIFT };
}
