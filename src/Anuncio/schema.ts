import { z } from "zod";

export const anuncioSchema = z.object({
  price: z.string(),
  shipping: z.string(),
  cta: z.string(),
  /** Qué trae el pack, una línea por producto. */
  items: z.array(z.string()),
  /** Dibuja las zonas de seguridad de Meta. Se apaga para exportar. */
  showSafeZones: z.boolean(),
});

export type AnuncioProps = z.infer<typeof anuncioSchema>;
