/**
 * Tipografías del sistema: no se descargan fuentes en el render, así que el
 * resultado es idéntico en tu máquina y en CI, sin depender de la red.
 */
export const FONT_FAMILY =
  'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

/** Contorno + sombra para que el texto se lea sobre cualquier imagen. */
export const readableOnVideo = {
  WebkitTextStroke: "6px rgba(0, 0, 0, 0.85)",
  paintOrder: "stroke fill",
  textShadow: "0 8px 30px rgba(0, 0, 0, 0.45)",
} as const;

/**
 * Serif de libro para las piezas de tono editorial. Igual que la sans, sale
 * de lo instalado en el sistema: no se descargan fuentes en el render.
 */
export const FONT_SERIF =
  '"Bitstream Charter", Charter, Georgia, "Liberation Serif", "Times New Roman", serif';
