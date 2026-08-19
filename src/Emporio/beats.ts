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

const BODEGON_VERDE = "fotos/09-bodegon-verde.jpg";

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
    label: "Shampoo en la mano, frente al espejo",
    photo: "fotos/02-shampoo-en-mano.jpg",
    durationInSeconds: 2.6,
    from: { scale: 1.16, x: 0.02, y: 0 },
    to: { scale: 1.04, x: 0, y: 0 },
    text: "Pensé que era el shampoo.",
    step: null,
    note: null,
    focus: null,
    endCard: false,
  },
  {
    label: "Spray con el pelo mojado",
    photo: "fotos/03-spray-pelo-mojado.jpg",
    durationInSeconds: 3,
    from: { scale: 1.04, x: 0, y: 0.02 },
    to: { scale: 1.2, x: -0.02, y: -0.02 },
    text: "Pero el cuidado no termina en la ducha.",
    step: null,
    note: null,
    focus: null,
    endCard: false,
  },
  {
    label: "Los tres en el lavamanos",
    photo: "fotos/04-tres-en-lavamanos.jpg",
    durationInSeconds: 3.2,
    from: { scale: 1.2, x: 0, y: 0.03 },
    to: { scale: 1.04, x: 0, y: 0 },
    text: "Cambié un producto por una rutina de tres pasos.",
    step: null,
    note: null,
    focus: null,
    endCard: false,
  },
  // Cada paso tiene su propio gesto: dosificar, desenredar, rociar. La rutina
  // se ve, no se rotula.
  {
    label: "Dosificando el shampoo",
    photo: "fotos/05-dosificando-shampoo.jpg",
    durationInSeconds: 2.4,
    from: { scale: 1.05, x: 0, y: 0 },
    to: { scale: 1.16, x: 0.02, y: -0.01 },
    text: "Shampoo",
    step: 1,
    note: "Limpia",
    focus: null,
    endCard: false,
  },
  {
    label: "Desenredando con acondicionador",
    photo: "fotos/06-desenredando.jpg",
    durationInSeconds: 2.6,
    from: { scale: 1.05, x: 0, y: 0 },
    to: { scale: 1.17, x: -0.02, y: -0.01 },
    text: "Acondicionador",
    step: 2,
    note: "Suaviza y desenreda",
    focus: null,
    endCard: false,
  },
  {
    label: "Fortalecedor en spray",
    photo: "fotos/07-spray-bata.jpg",
    durationInSeconds: 2.8,
    from: { scale: 1.05, x: 0, y: 0 },
    to: { scale: 1.18, x: 0.01, y: -0.02 },
    text: "Fortalecedor en spray",
    step: 3,
    note: "Cuidado diario",
    focus: null,
    endCard: false,
  },
  {
    label: "Espejo, plano abierto",
    photo: "fotos/08-espejo-abierto.jpg",
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
    label: "Bodegón verde",
    photo: BODEGON_VERDE,
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
