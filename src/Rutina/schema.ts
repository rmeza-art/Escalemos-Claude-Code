import { z } from "zod";

export const rutinaSchema = z.object({
  /**
   * `performance` corta corto, entra fuerte al plano y grita el texto.
   * `ritual` respira, cruza los planos y mantiene el tono de la marca.
   */
  variant: z.enum(["performance", "ritual"]),
  price: z.string(),
  shipping: z.string(),
  cta: z.string(),
  /** Dibuja las zonas de seguridad de Meta. Se apaga para exportar. */
  showSafeZones: z.boolean(),
});

export type RutinaProps = z.infer<typeof rutinaSchema>;
