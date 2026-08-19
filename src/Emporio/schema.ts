import { z } from "zod";

export const emporioSchema = z.object({
  /**
   * Con `false` la pieza se arma con marcadores en vez de las fotos, para
   * poder revisar ritmo y textos antes de tener el material en `public/fotos/`.
   */
  photosReady: z.boolean(),
  price: z.string(),
  shipping: z.string(),
  cta: z.string(),
  /** Dibuja las zonas de seguridad de Meta. Se apaga para exportar. */
  showSafeZones: z.boolean(),
});

export type EmporioProps = z.infer<typeof emporioSchema>;
