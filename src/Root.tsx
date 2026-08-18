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
        trimEndInSeconds: null,
        hook: {
          text: "Guacamole listo en 10 segundos",
          durationInSeconds: 2.2,
        },
        captions,
        watermark: {
          text: "Palta Molita",
          logoSrc: null,
        },
        outro: {
          headline: "Palta Molita",
          cta: "Pídelo ahora",
          backgroundColor: "#0B0B0F",
          durationInSeconds: 2.5,
        },
        accentColor: "#8FD14F",
      }}
    />
  );
};
