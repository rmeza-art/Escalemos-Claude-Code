import type { Caption } from "./schema";

/**
 * Subtítulos del anuncio. Los tiempos son en milisegundos y relativos al
 * montaje final (después del recorte).
 *
 * El último cierra justo en el corte, para que la pieza termine sobre una
 * frase completa y no a media lectura.
 */
export const captions: Caption[] = [
  { text: "Sin preservantes y sin gluten", startMs: 2300, endMs: 5000 },
  { text: "Lo abres y ya está", startMs: 5200, endMs: 7900 },
  { text: "Rinde para toda la tabla", startMs: 8100, endMs: 10500 },
  { text: "Para juntarse sin cocinar", startMs: 10700, endMs: 13200 },
];
