/**
 * Dos montajes sobre los mismos cuatro clips de 10 s.
 *
 * Cada clip trae CORTES INTERNOS, y los rangos de abajo caen todos dentro de
 * una sola toma. Las tomas útiles, medidas por detección de cortes:
 *
 *   01-lavando        0–2,25 espejo (otra persona) · 2,25–4,5 frasco en repisa
 *                     4,5–7 macro dosificando · 7–10 espuma bajo la ducha
 *   02-acondicionador 0–3 frasco en primer plano · 3–4,5 manos dosificando
 *                     4,5–10 desenredando el pelo
 *   03-masaje         0–4,25 masaje bajo la ducha · 4,25–7,25 macro del largo
 *                     7,25–10 spray (el pelo se aclara: no se usa)
 *   04-spray          0–2,5 · 2,5–4 spray · 4,25–6 spray otro ángulo
 *                     6–10 bodegón de los tres
 *
 * La primera toma de `01-lavando` y la última parte de `03-masaje` quedan
 * fuera: son otra persona.
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
 * Los rótulos viven en su propia pista, con tiempos absolutos de la pieza. Así
 * uno puede cruzar un corte —el paso 3 se cuenta con dos ángulos del mismo
 * gesto— sin volver a entrar en pantalla.
 */
export type LineSpec = {
  text: string;
  step: number | null;
  note: string | null;
  startInSeconds: number;
  endInSeconds: number;
};

export type Variant = {
  segments: Segment[];
  lines: LineSpec[];
  /** Cuadros que se solapan entre planos. 0 = corte seco. */
  overlap: number;
  /** Destello breve en cada corte. */
  flash: boolean;
  /** Cuánto se sostiene el último cuadro del bodegón. */
  tailInSeconds: number;
};

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

/**
 * Performance: planos cortos y desparejos, entrada fuerte y corte seco. Abre
 * con el macro de las manos, que es lo más detenible del material.
 */
export const performance: Variant = {
  overlap: 0,
  flash: true,
  tailInSeconds: 1.4,
  segments: [
    shot("Manos dosificando", ACONDICIONADOR, 3.2, 1.2, 1.14, 1.02),
    shot("Masaje bajo la ducha", MASAJE, 2.2, 1.6, 1.02, 1.14),
    shot("Espuma bajo la ducha", LAVANDO, 7.3, 1.6, 1.12, 1.02),
    shot("Desenredando", ACONDICIONADOR, 5, 1.8, 1.02, 1.13),
    shot("Aplicando el spray", SPRAY, 4.4, 1.5, 1.13, 1.02),
    shot("Los tres productos", SPRAY, 6.3, 2.8, 1.1, 1),
  ],
  lines: [
    { text: "No es el shampoo.", step: null, note: null, startInSeconds: 0.05, endInSeconds: 1.15 },
    { text: "Es la rutina.", step: null, note: null, startInSeconds: 1.25, endInSeconds: 2.75 },
    { text: "Shampoo", step: 1, note: null, startInSeconds: 2.85, endInSeconds: 4.35 },
    { text: "Acondicionador", step: 2, note: null, startInSeconds: 4.45, endInSeconds: 6.15 },
    { text: "Fortalecedor", step: 3, note: null, startInSeconds: 6.25, endInSeconds: 7.65 },
  ],
};

/**
 * Ritual: los mismos pasos con aire. Planos más largos, movimiento lento
 * dentro del cuadro y cruces suaves. El paso 3 se cuenta con dos ángulos
 * seguidos del mismo gesto, bajo un solo rótulo.
 */
export const ritual: Variant = {
  overlap: 6,
  flash: false,
  tailInSeconds: 2,
  segments: [
    shot("Espuma bajo la ducha", LAVANDO, 7.2, 2.6, 1.02, 1.08),
    shot("Masaje bajo la ducha", MASAJE, 1.4, 2.2, 1.08, 1.02),
    shot("Desenredando", ACONDICIONADOR, 5, 2.4, 1.02, 1.09),
    shot("Aplicando el spray", SPRAY, 2.65, 1.25, 1.09, 1.03),
    shot("El spray, otro ángulo", SPRAY, 4.4, 1.5, 1.03, 1.09),
    shot("Los tres productos", SPRAY, 6.3, 2.8, 1.08, 1),
  ],
  lines: [
    {
      text: "No es el shampoo. Es la rutina.",
      step: null,
      note: null,
      startInSeconds: 0.15,
      endInSeconds: 2.5,
    },
    { text: "Shampoo", step: 1, note: "Limpia", startInSeconds: 2.7, endInSeconds: 4.7 },
    {
      text: "Acondicionador",
      step: 2,
      note: "Suaviza y desenreda",
      startInSeconds: 4.9,
      endInSeconds: 7.1,
    },
    {
      text: "Fortalecedor en spray",
      step: 3,
      note: "Cuidado diario",
      startInSeconds: 7.3,
      endInSeconds: 9.85,
    },
  ],
};

/** Último cuadro del bodegón, para sostener el cierre. */
export const LAST_FRAME = "rutina-ultimo-cuadro.jpg";

/** Cuadros de fundido de audio en cada corte, para que no salte la base. */
export const AUDIO_FADE = 5;

export const segmentFrames = (segment: Segment) =>
  Math.round(segment.durationInSeconds * FPS);

export const clipsFrames = (variant: Variant) =>
  variant.segments.reduce((total, s) => total + segmentFrames(s), 0);

export const totalFrames = (variant: Variant) =>
  clipsFrames(variant) + Math.round(variant.tailInSeconds * FPS);

/** El cierre entra con el bodegón y sigue sobre el cuadro congelado. */
export const endCardFrom = (variant: Variant) =>
  clipsFrames(variant) -
  segmentFrames(variant.segments[variant.segments.length - 1]);
