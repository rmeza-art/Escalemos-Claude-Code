import { z } from "zod";

export const rutinaSchema = z.object({
  price: z.string(),
  shipping: z.string(),
  cta: z.string(),
  /** Dibuja las zonas de seguridad de Meta. Se apaga para exportar. */
  showSafeZones: z.boolean(),
});

export type RutinaProps = z.infer<typeof rutinaSchema>;
