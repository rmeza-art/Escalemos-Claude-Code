/**
 * Anuncio de la rutina, montado con cuatro clips de 10 s.
 *
 * Los clips vienen generados y la persona no se sostiene entre ellos: en
 * `01-lavando` la mujer del espejo no es la misma que aparece a los 7 s, y en
 * `03-masaje` el pelo se aclara hacia el final. Los tramos elegidos evitan
 * esos saltos, y por eso los rangos son los que son.
 */

export const FPS = 30;

export type Segment = {
  label: string;
  video: string;
  /** Segundo del clip en que entra. */
  fromInSeconds: number;
  /** Segundo en que sale. */
  toInSeconds: number;
  text: string | null;
  step: number | null;
  note: string | null;
};

export const segments: Segment[] = [
  {
    label: "Lavando bajo la ducha",
    video: "rutina-01-lavando.mp4",
    fromInSeconds: 7.4,
    toInSeconds: 9.8,
    text: "No es el shampoo. Es la rutina.",
    step: null,
    note: null,
  },
  {
    label: "Masaje en el cuero cabelludo",
    video: "rutina-03-masaje.mp4",
    fromInSeconds: 2.8,
    toInSeconds: 5,
    text: "Shampoo",
    step: 1,
    note: "Limpia",
  },
  {
    label: "Dosificando el acondicionador",
    video: "rutina-02-acondicionador.mp4",
    fromInSeconds: 2.8,
    toInSeconds: 5.2,
    text: "Acondicionador",
    step: 2,
    note: "Suaviza y desenreda",
  },
  {
    label: "Aplicando el fortalecedor",
    video: "rutina-04-spray.mp4",
    fromInSeconds: 2.8,
    toInSeconds: 5.2,
    text: "Fortalecedor en spray",
    step: 3,
    note: "Cuidado diario",
  },
  {
    label: "Los tres productos",
    video: "rutina-04-spray.mp4",
    fromInSeconds: 7.2,
    toInSeconds: 10,
    text: null,
    step: null,
    note: null,
  },
];

/** Último cuadro del bodegón, para sostener el cierre. */
export const LAST_FRAME = "rutina-ultimo-cuadro.jpg";
export const TAIL_SECONDS = 1.6;

/** Cuadros de fundido de audio en cada corte, para que no salte la base. */
export const AUDIO_FADE = 5;

export const segmentFrames = (segment: Segment) =>
  Math.round((segment.toInSeconds - segment.fromInSeconds) * FPS);

export const CLIPS_FRAMES = segments.reduce(
  (total, segment) => total + segmentFrames(segment),
  0,
);

export const TOTAL_FRAMES = CLIPS_FRAMES + Math.round(TAIL_SECONDS * FPS);

/** El cierre entra con el bodegón y sigue sobre el cuadro congelado. */
export const END_CARD_FROM =
  CLIPS_FRAMES - segmentFrames(segments[segments.length - 1]);
