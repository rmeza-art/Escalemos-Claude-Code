import type { Caption } from "./schema";

/**
 * Subtítulos del anuncio. Los tiempos son en milisegundos y relativos al
 * montaje final (después del recorte).
 *
 * Están escritos a mano a partir de lo que se ve en pantalla; conviene
 * ajustarlos contra el audio real en Remotion Studio, donde se puede mover
 * el cursor cuadro a cuadro.
 */
export const captions: Caption[] = [
  { text: "Sin preservantes y sin gluten", startMs: 2400, endMs: 5400 },
  { text: "Lo abres y ya está", startMs: 5600, endMs: 8600 },
  { text: "Rinde para toda la tabla", startMs: 8800, endMs: 11800 },
  { text: "Para juntarse sin cocinar", startMs: 12000, endMs: 15000 },
  { text: "Guacamole de verdad", startMs: 15200, endMs: 17300 },
];
