import { zColor } from "@remotion/zod-types";
import { z } from "zod";

/**
 * Un subtítulo. Los tiempos son en milisegundos y son relativos al MONTAJE
 * final (después del recorte), no al archivo original.
 */
export const captionSchema = z.object({
  text: z.string(),
  startMs: z.number().min(0),
  endMs: z.number().min(0),
});

export const adSchema = z.object({
  /**
   * Ruta del video dentro de la carpeta `public/`. Ej: "video.mp4".
   * Si el archivo no existe, la composición muestra un cartel de ayuda
   * en vez de romperse.
   */
  videoSrc: z.string().nullable(),
  /** Formato de salida. "original" conserva el tamaño del video de entrada. */
  format: z.enum(["original", "9:16", "1:1", "16:9"]),
  /** Segundo del video original en el que arranca el montaje. */
  trimStartInSeconds: z.number().min(0),
  /** Segundo en el que corta. `null` = hasta el final del archivo. */
  trimEndInSeconds: z.number().min(0).nullable(),
  /** Gancho: el texto grande de los primeros segundos. */
  hook: z
    .object({
      text: z.string(),
      durationInSeconds: z.number().min(0.1),
    })
    .nullable(),
  captions: z.array(captionSchema),
  watermark: z
    .object({
      text: z.string(),
      /** Ruta de un logo dentro de `public/`. `null` = solo texto. */
      logoSrc: z.string().nullable(),
    })
    .nullable(),
  outro: z
    .object({
      headline: z.string(),
      cta: z.string(),
      backgroundColor: zColor(),
      durationInSeconds: z.number().min(0.1),
    })
    .nullable(),
  /** Color de marca. Se usa en el gancho, los subtítulos y el botón del cierre. */
  accentColor: zColor(),
  /**
   * Dibuja encima las zonas de seguridad de Meta para revisar que ningún
   * texto quede bajo el copy o los botones del feed. Se apaga para exportar.
   */
  showSafeZones: z.boolean(),
});

export type Caption = z.infer<typeof captionSchema>;
export type AdProps = z.infer<typeof adSchema>;
