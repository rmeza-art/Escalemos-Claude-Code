import "./index.css";
import { Composition } from "remotion";
import { Ad } from "./Ad/Ad";
import { captions } from "./Ad/captions";
import { calculateAdMetadata, FPS } from "./Ad/metadata";
import { adSchema } from "./Ad/schema";
import { FPS as EMPORIO_FPS, TOTAL_FRAMES } from "./Emporio/beats";
import { Emporio } from "./Emporio/Emporio";
import { emporioSchema } from "./Emporio/schema";
import { rutinaSchema } from "./Rutina/schema";
import { Rutina } from "./Rutina/Rutina";
import {
  FPS as RUTINA_FPS,
  TOTAL_FRAMES as RUTINA_TOTAL_FRAMES,
} from "./Rutina/rutina";
import { ugcSchema } from "./UGC/schema";
import { UGC } from "./UGC/UGC";
import { FPS as UGC_FPS, TOTAL_FRAMES as UGC_TOTAL_FRAMES } from "./UGC/ugc";

/**
 * Cada <Composition> es una entrada del menú lateral de Remotion Studio.
 *
 * El tamaño y la duración los resuelve `calculateAdMetadata` leyendo el video
 * de entrada, así que los valores de acá abajo son solo el punto de partida
 * mientras el archivo todavía no se lee.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
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

      {/*
        Reel de Emporio Orgánika: fotos fijas con movimiento de cámara. Todavía
        no hay voz en off, así que el texto en pantalla es el que narra y la
        duración de cada plano sale del tiempo de lectura, no de un audio.
      */}
      <Composition
        // Para renderizar: npx remotion render Emporio out/emporio.mp4
        id="Emporio"
        component={Emporio}
        schema={emporioSchema}
        fps={EMPORIO_FPS}
        width={1080}
        height={1920}
        durationInFrames={TOTAL_FRAMES}
        defaultProps={{
          photosReady: false,
          price: "$49.990",
          shipping: "Envío gratis",
          cta: "Comprar ahora",
          showSafeZones: false,
        }}
      />

      {/*
        Edición sobre el UGC ya grabado: el clip trae su propio audio y sus
        cortes, así que acá solo se le suman los textos y el cierre.
      */}
      <Composition
        // Para renderizar: npx remotion render UGC out/ugc.mp4
        id="UGC"
        component={UGC}
        schema={ugcSchema}
        fps={UGC_FPS}
        width={1080}
        height={1920}
        durationInFrames={UGC_TOTAL_FRAMES}
        defaultProps={{
          price: "$49.990",
          shipping: "Envío gratis",
          cta: "Comprar ahora",
          showSafeZones: false,
        }}
      />

      {/*
        Anuncio de la rutina, armado con cuatro clips generados de 10 s. Los
        tramos elegidos esquivan los saltos de identidad del material.
      */}
      <Composition
        // Para renderizar: npx remotion render Rutina out/rutina.mp4
        id="Rutina"
        component={Rutina}
        schema={rutinaSchema}
        fps={RUTINA_FPS}
        width={1080}
        height={1920}
        durationInFrames={RUTINA_TOTAL_FRAMES}
        defaultProps={{
          price: "$49.990",
          shipping: "Envío gratis",
          cta: "Comprar ahora",
          showSafeZones: false,
        }}
      />
    </>
  );
};
