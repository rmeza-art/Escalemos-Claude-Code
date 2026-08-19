/**
 * Edición sobre el UGC de Emporio Orgánika.
 *
 * El clip dura 8 s y trae su propio audio. Los cortes internos están en
 * 1,4 s (cepillo → shampoo), 3,75 s (shampoo → spray), 5,9 s (spray →
 * resultado) y 6,6 s (resultado → bodegón); los textos se apoyan en esos
 * cortes para no quedar a caballo entre dos planos.
 */

export const FPS = 30;

export const VIDEO = "ugc-emporio.mp4";

/**
 * El último cuadro del clip, extraído a un archivo aparte. Sostener el video
 * detenido daba el plano equivocado, y una imagen no deja lugar a dudas sobre
 * qué se está viendo.
 */
export const LAST_FRAME = "ugc-ultimo-cuadro.jpg";
export const VIDEO_SECONDS = 8;

/**
 * El bodegón dura solo 1,4 s, muy poco para leer precio y botón. Se congela
 * el último cuadro para darle aire al cierre sin alargar el clip.
 */
export const TAIL_SECONDS = 3;

export type Caption = {
  text: string;
  note: string | null;
  startInSeconds: number;
  endInSeconds: number;
};

export const captions: Caption[] = [
  {
    text: "¿Más cabello en el cepillo?",
    note: null,
    startInSeconds: 0.25,
    endInSeconds: 1.3,
  },
  {
    text: "Cambié a una rutina completa",
    note: null,
    startInSeconds: 1.55,
    endInSeconds: 3.55,
  },
  {
    text: "Fortalecedor capilar en spray",
    note: "Cuidado diario",
    startInSeconds: 3.9,
    endInSeconds: 5.75,
  },
];

/** El cierre entra con el bodegón y sigue sobre el cuadro congelado. */
export const END_CARD_START_IN_SECONDS = 6.7;

export const TOTAL_FRAMES = Math.round((VIDEO_SECONDS + TAIL_SECONDS) * FPS);
