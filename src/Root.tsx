import "./index.css";
import { Composition } from "remotion";
import { Ad } from "./Ad/Ad";
import { captions } from "./Ad/captions";
import { calculateAdMetadata, FPS } from "./Ad/metadata";
import { adSchema } from "./Ad/schema";

/**
 * Cada <Composition> es una entrada del menú lateral de Remotion Studio.
 *
 * El tamaño y la duración los resuelve `calculateAdMetadata` leyendo el video
 * de entrada, así que los valores de acá abajo son solo el punto de partida
 * mientras el archivo todavía no se lee.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      // Para renderizar: npx remotion render Ad out/ad.mp4
      id="Ad"
      component={Ad}
      schema={adSchema}
      calculateMetadata={calculateAdMetadata}
      fps={FPS}
      width={1080}
      height={1920}
      durationInFrames={FPS * 10}
      defaultProps={{
        videoSrc: "video.mp4",
        format: "9:16" as const,
        trimStartInSeconds: 0,
        // A los 13,5 s entra en cuadro un pendón de otra marca (y el archivo
        // de WhatsApp cierra con ~0,4 s de negro): se corta antes de ambos.
        trimEndInSeconds: 13.2,
        hook: {
          text: "Abre y disfruta",
          durationInSeconds: 2.2,
        },
        captions,
        // La marca de agua y el cierre siguen disponibles como capas: para
        // activarlos basta con reemplazar estos `null` por sus objetos.
        watermark: null,
        outro: null,
        accentColor: "#8FD14F",
        showSafeZones: false,
      }}
    />
  );
};
