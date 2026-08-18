import { ALL_FORMATS, Input, UrlSource } from "mediabunny";
import type { CalculateMetadataFunction } from "remotion";
import { staticFile } from "remotion";
import type { AdProps } from "./schema";

export const FPS = 30;

/** Cuánto dura el cartel de ayuda cuando todavía no hay video. */
const PLACEHOLDER_SECONDS = 5;

const DIMENSIONS_BY_FORMAT = {
  "9:16": { width: 1080, height: 1920 },
  "1:1": { width: 1080, height: 1080 },
  "16:9": { width: 1920, height: 1080 },
};

type VideoMetadata = {
  durationInSeconds: number;
  width: number;
  height: number;
};

/** H.264 exige lados pares. */
const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);

const readVideoMetadata = async (src: string): Promise<VideoMetadata> => {
  const input = new Input({ formats: ALL_FORMATS, source: new UrlSource(src) });
  const track = await input.getPrimaryVideoTrack();
  if (track === null) {
    throw new Error(`El archivo ${src} no tiene pista de video.`);
  }

  return {
    durationInSeconds: await input.computeDuration(),
    width: track.displayWidth,
    height: track.displayHeight,
  };
};

const resolveDimensions = (
  format: AdProps["format"],
  video: VideoMetadata | null,
) => {
  if (format !== "original") {
    return DIMENSIONS_BY_FORMAT[format];
  }

  if (video === null) {
    return DIMENSIONS_BY_FORMAT["9:16"];
  }

  return { width: even(video.width), height: even(video.height) };
};

/**
 * Lee el video de entrada para que la composición dure exactamente lo que
 * dura el montaje. Así no hay que escribir la duración a mano cada vez que se
 * cambia el clip o el recorte.
 */
export const calculateAdMetadata: CalculateMetadataFunction<AdProps> = async ({
  props,
}) => {
  const outroSeconds = props.outro === null ? 0 : props.outro.durationInSeconds;

  const video =
    props.videoSrc === null
      ? null
      : await readVideoMetadata(staticFile(props.videoSrc)).catch(() => null);

  // Sin archivo legible mostramos el cartel de ayuda en vez de fallar.
  if (video === null) {
    return {
      fps: FPS,
      ...resolveDimensions(props.format, null),
      durationInFrames: Math.round((PLACEHOLDER_SECONDS + outroSeconds) * FPS),
      props: { ...props, videoSrc: null },
    };
  }

  const clipEnd =
    props.trimEndInSeconds === null
      ? video.durationInSeconds
      : Math.min(props.trimEndInSeconds, video.durationInSeconds);
  const clipSeconds = Math.max(clipEnd - props.trimStartInSeconds, 0);

  return {
    fps: FPS,
    ...resolveDimensions(props.format, video),
    durationInFrames: Math.max(
      1,
      Math.round((clipSeconds + outroSeconds) * FPS),
    ),
  };
};
