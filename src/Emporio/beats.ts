/**
 * Guion de la pieza, plano por plano.
 *
 * La voz en off todavía no existe, así que el texto en pantalla es el que
 * narra: son las frases del guion condensadas para leerse, no para oírse.
 * Cuando llegue la voz, se vuelve a las frases largas y se recalzan los
 * tiempos contra el audio.
 *
 * Las fotos van en `public/fotos/`. Los focos y encuadres están en
 * fracciones del cuadro, así que no dependen del tamaño del archivo.
 */

export type Frame = {
  /** 1 = la foto llena el cuadro. Más de 1 entra en la imagen. */
  scale: number;
  /** Desplazamiento en fracciones del cuadro desde el centro. */
  x: number;
  y: number;
};

export type Focus = {
  /** Posición del foco en fracciones de la foto, con 0,0 arriba a la izquierda. */
  x: number;
  y: number;
  /** Radio del claro, en fracciones del ancho. */
  radius: number;
};

export type Beat = {
  /** Nombre de la toma. Se muestra en el marcador mientras falte la foto. */
  label: string;
  /** Archivo dentro de `public/`. */
  photo: string;
  durationInSeconds: number;
  from: Frame;
  to: Frame;
  /** Texto narrador. `null` en el cierre, que trae su propia tarjeta. */
  text: string | null;
  /** Número del paso, para los tres del medio. */
  step: number | null;
  /** Bajada bajo el paso. */
  note: string | null;
  /** Oscurece la foto salvo un claro, para señalar un frasco. */
  focus: Focus | null;
  /** Dibuja la tarjeta de precio y llamado a la acción. */
  endCard: boolean;
};

const BODEGON_VERDE = "fotos/04-bodegon-verde.jpg";

export const beats: Beat[] = [
  {
    label: "Cepillo con pelo",
    photo: "fotos/01-cepillo.jpg",
    durationInSeconds: 3,
    from: { scale: 1.06, x: 0, y: 0 },
    to: { scale: 1.24, x: -0.02, y: 0.03 },
    text: "¿Más cabello en el cepillo?",
    step: null,
    note: null,
    focus: null,
    endCard: false,
  },
  {
    label: "Mechón frente al espejo",
    photo: "fotos/03-mechon.jpg",
    durationInSeconds: 2.6,
    from: { scale: 1.18, x: 0.02, y: 0 },
    to: { scale: 1.05, x: 0, y: 0 },
    text: "Pensé que era el shampoo.",
    step: null,
    note: null,
    focus: null,
    endCard: false,
  },
  {
    label: "Aplicando el spray",
    photo: "fotos/06-spray.jpg",
    durationInSeconds: 3,
    from: { scale: 1.05, x: 0, y: 0.02 },
    to: { scale: 1.2, x: -0.03, y: -0.02 },
    text: "Pero el cuidado no termina en la ducha.",
    step: null,
    note: null,
    focus: null,
    endCard: false,
  },
  {
    label: "Los tres productos",
    photo: BODEGON_VERDE,
    durationInSeconds: 3.2,
    from: { scale: 1.22, x: 0, y: 0.02 },
    to: { scale: 1.04, x: 0, y: 0 },
    text: "Cambié un producto por una rutina de tres pasos.",
    step: null,
    note: null,
    focus: null,
    endCard: false,
  },
  // Los tres pasos se quedan en la misma foto y el foco se corre de frasco en
  // frasco: la rutina se cuenta con la imagen, no con un rótulo.
  {
    label: "Foco en el shampoo",
    photo: BODEGON_VERDE,
    durationInSeconds: 2.4,
    from: { scale: 1.04, x: 0, y: 0 },
    to: { scale: 1.1, x: 0.02, y: 0 },
    text: "Shampoo",
    step: 1,
    note: "Limpia",
    focus: { x: 0.3, y: 0.62, radius: 0.3 },
    endCard: false,
  },
  {
    label: "Foco en el acondicionador",
    photo: BODEGON_VERDE,
    durationInSeconds: 2.6,
    from: { scale: 1.1, x: 0.02, y: 0 },
    to: { scale: 1.1, x: -0.01, y: 0 },
    text: "Acondicionador",
    step: 2,
    note: "Suaviza y desenreda",
    focus: { x: 0.55, y: 0.62, radius: 0.3 },
    endCard: false,
  },
  {
    label: "Foco en el fortalecedor",
    photo: BODEGON_VERDE,
    durationInSeconds: 2.8,
    from: { scale: 1.1, x: -0.01, y: 0 },
    to: { scale: 1.16, x: -0.04, y: 0 },
    text: "Fortalecedor en spray",
    step: 3,
    note: "Cuidado diario",
    focus: { x: 0.75, y: 0.6, radius: 0.26 },
    endCard: false,
  },
  {
    label: "Espejo, plano abierto",
    photo: "fotos/02-espejo-abierto.jpg",
    durationInSeconds: 2.4,
    from: { scale: 1.16, x: 0, y: 0 },
    to: { scale: 1.03, x: 0, y: 0 },
    text: "Ahora no improviso.",
    step: null,
    note: null,
    focus: null,
    endCard: false,
  },
  {
    label: "Bodegón claro",
    photo: "fotos/05-bodegon-claro.jpg",
    durationInSeconds: 4,
    from: { scale: 1.14, x: 0, y: 0 },
    to: { scale: 1.02, x: 0, y: 0 },
    text: null,
    step: null,
    note: null,
    focus: null,
    endCard: true,
  },
];

export const FPS = 30;

export const beatFrames = (beat: Beat) =>
  Math.round(beat.durationInSeconds * FPS);

export const TOTAL_FRAMES = beats.reduce(
  (total, beat) => total + beatFrames(beat),
  0,
);
