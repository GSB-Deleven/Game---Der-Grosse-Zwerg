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
