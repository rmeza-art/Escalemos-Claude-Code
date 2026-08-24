/**
 * El anuncio: un gancho, los tres pasos de la rutina y el cierre con el pack.
 *
 * El material son cuatro clips de 10 s más el UGC de 8 s. Todos traen CORTES
 * INTERNOS, y cada rango de abajo cae dentro de una sola toma. Inventario,
 * medido por detección de cortes:
 *
 *   ugc-emporio       0–1,4 cepillo con pelo · 1,4–3,75 dosificando shampoo
 *                     3,75–5,9 spray · 5,9–6,6 resultado · 6,6–8 los tres
 *   01-lavando        0–2,25 espejo (otra persona) · 2,25–4,5 frasco en repisa
 *                     4,5–7 macro dosificando · 7–10 espuma bajo la ducha
 *   02-acondicionador 0–3 frasco en primer plano · 3–4,5 manos dosificando
 *                     4,5–10 desenredando el pelo
 *   03-masaje         0–4,25 shampoo en la mano y masaje · 4,25–7,25 macro
 *                     7,25–10 spray (el pelo se aclara: no se usa)
 *   04-spray          0–2,5 · 2,5–4 spray · 4,25–6 spray otro ángulo
 *                     6–10 bodegón de los tres
 *
 * Quedan fuera la primera toma de `01-lavando` y el final de `03-masaje`: son
 * otra persona. Los clips vienen generados y la identidad no se sostiene.
 */

export const FPS = 30;

export type Segment = {
  label: string;
  video: string;
  fromInSeconds: number;
  toInSeconds: number;
  durationInSeconds: number;
  /** Entrada al plano: la escala va de `scaleFrom` a `scaleTo`. */
  scaleFrom: number;
  scaleTo: number;
};

/**
 * Los rótulos viven en su propia pista, con tiempos absolutos. Cada paso se
 * cuenta con dos planos seguidos bajo un solo rótulo, así el texto se alcanza
 * a leer sin que la imagen se quede quieta.
 */
export type LineSpec = {
  text: string;
  step: number | null;
  note: string | null;
  startInSeconds: number;
  endInSeconds: number;
};

const UGC = "ugc-emporio.mp4";
const LAVANDO = "rutina-01-lavando.mp4";
const ACONDICIONADOR = "rutina-02-acondicionador.mp4";
const MASAJE = "rutina-03-masaje.mp4";
const SPRAY = "rutina-04-spray.mp4";

const shot = (
  label: string,
  video: string,
  fromInSeconds: number,
  durationInSeconds: number,
  scaleFrom: number,
  scaleTo: number,
): Segment => ({
  label,
  video,
  fromInSeconds,
  toInSeconds: fromInSeconds + durationInSeconds,
  durationInSeconds,
  scaleFrom,
  scaleTo,
});

export const segments: Segment[] = [
  shot("Cepillo con pelo", UGC, 0.15, 1.4, 1.12, 1.02),
  shot("Los tres en el lavamanos", UGC, 6.6, 1.35, 1.02, 1.12),
  shot("Espuma bajo la ducha", LAVANDO, 7.15, 2.8, 1.12, 1.02),
  shot("Shampoo en la mano", MASAJE, 1.7, 2.5, 1.02, 1.11),
  shot("Dosificando el acondicionador", ACONDICIONADOR, 3.15, 1.3, 1.13, 1.03),
  shot("Desenredando", ACONDICIONADOR, 4.85, 2.7, 1.03, 1.1),
  shot("Aplicando el fortalecedor", SPRAY, 2.65, 1.3, 1.12, 1.03),
  shot("El fortalecedor, otro ángulo", SPRAY, 4.35, 1.65, 1.03, 1.1),
  shot("Los tres productos", SPRAY, 6.25, 2.9, 1.1, 1),
];

export const lines: LineSpec[] = [
  {
    text: "No es el shampoo. Es la rutina.",
    step: null,
    note: null,
    startInSeconds: 0.15,
    endInSeconds: 2.65,
  },
  {
    text: "Shampoo",
    step: 1,
    note: "Estimula el cuero cabelludo",
    startInSeconds: 2.95,
    endInSeconds: 7.9,
  },
  {
    text: "Acondicionador",
    step: 2,
    note: "Suaviza y desenreda",
    startInSeconds: 8.25,
    endInSeconds: 12,
  },
  {
    text: "Fortalecedor",
    step: 3,
    note: "Engrosa la fibra capilar",
    startInSeconds: 12.3,
    endInSeconds: 14.9,
  },
];

/** Último cuadro del bodegón, para sostener el cierre. */
export const LAST_FRAME = "rutina-ultimo-cuadro.jpg";

/** Cuánto se sostiene ese cuadro después de que termina el último plano. */
export const TAIL_IN_SECONDS = 1.5;

/** Cuadros de fundido de audio en cada corte, para que no salte la base. */
export const AUDIO_FADE = 5;

export const segmentFrames = (segment: Segment) =>
  Math.round(segment.durationInSeconds * FPS);

export const CLIPS_FRAMES = segments.reduce(
  (total, segment) => total + segmentFrames(segment),
  0,
);

export const TOTAL_FRAMES = CLIPS_FRAMES + Math.round(TAIL_IN_SECONDS * FPS);

/** El cierre entra con el bodegón y sigue sobre el cuadro congelado. */
export const END_CARD_FROM =
  CLIPS_FRAMES - segmentFrames(segments[segments.length - 1]);
