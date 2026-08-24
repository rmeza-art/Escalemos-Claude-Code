import "./index.css";
import { Composition } from "remotion";
import { Anuncio } from "./Anuncio/Anuncio";
import { anuncioSchema } from "./Anuncio/schema";
import { FPS, TOTAL_FRAMES } from "./Anuncio/anuncio";

/**
 * Anuncio de Emporio Orgánika para Meta, en 9:16.
 *
 * Sin voz en off: el texto en pantalla es el que narra, así que la pieza
 * funciona en mudo. El tamaño y la duración salen del montaje, no se escriben
 * a mano.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      // Para renderizar: npx remotion render Anuncio out/anuncio.mp4
      id="Anuncio"
      component={Anuncio}
      schema={anuncioSchema}
      fps={FPS}
      width={1080}
      height={1920}
      durationInFrames={TOTAL_FRAMES}
      defaultProps={{
        price: "$49.990",
        shipping: "Envío gratis",
        cta: "Comprar ahora",
        items: [
          "Shampoo fortalecedor · 500 ml",
          "Acondicionador · 500 ml",
          "Fortalecedor capilar en spray · 100 ml",
        ],
        showSafeZones: false,
      }}
    />
  );
};
