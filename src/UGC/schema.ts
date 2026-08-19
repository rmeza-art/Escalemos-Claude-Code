import { z } from "zod";

export const ugcSchema = z.object({
  price: z.string(),
  shipping: z.string(),
  cta: z.string(),
  /** Dibuja las zonas de seguridad de Meta. Se apaga para exportar. */
  showSafeZones: z.boolean(),
});

export type UgcProps = z.infer<typeof ugcSchema>;
