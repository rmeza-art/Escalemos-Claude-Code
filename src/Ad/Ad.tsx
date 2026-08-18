import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import { Captions } from "./components/Captions";
import { HookText } from "./components/HookText";
import { MissingVideo } from "./components/MissingVideo";
import { OutroCard } from "./components/OutroCard";
import { SafeZones } from "./components/SafeZones";
import { Watermark } from "./components/Watermark";
import type { AdProps } from "./schema";

export const Ad: React.FC<AdProps> = ({
  videoSrc,
  trimStartInSeconds,
  trimEndInSeconds,
  hook,
  captions,
  watermark,
  outro,
  accentColor,
  showSafeZones,
}) => {
  const { fps, durationInFrames } = useVideoConfig();

  // La duración total ya viene calculada en `calculateAdMetadata`, así que el
  // clip es todo lo que no ocupa el cierre.
  const outroFrames =
    outro === null ? 0 : Math.round(outro.durationInSeconds * fps);
  const clipFrames = Math.max(durationInFrames - outroFrames, 1);

  const hookFrames =
    hook === null
      ? 0
      : Math.min(Math.round(hook.durationInSeconds * fps), clipFrames);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Sequence durationInFrames={clipFrames} name="Clip">
        {videoSrc === null ? (
          <MissingVideo expectedPath={null} />
        ) : (
          <OffthreadVideo
            src={staticFile(videoSrc)}
            trimBefore={Math.round(trimStartInSeconds * fps)}
            trimAfter={
              trimEndInSeconds === null
                ? undefined
                : Math.round(trimEndInSeconds * fps)
            }
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}

        <Captions captions={captions} accentColor={accentColor} />

        {watermark === null ? null : (
          <Watermark text={watermark.text} logoSrc={watermark.logoSrc} />
        )}

        {hook === null || hookFrames === 0 ? null : (
          <Sequence durationInFrames={hookFrames} name="Gancho">
            <HookText text={hook.text} accentColor={accentColor} />
          </Sequence>
        )}
      </Sequence>

      {outro === null || outroFrames === 0 ? null : (
        <Sequence from={clipFrames} durationInFrames={outroFrames} name="Cierre">
          <OutroCard
            headline={outro.headline}
            cta={outro.cta}
            backgroundColor={outro.backgroundColor}
            accentColor={accentColor}
          />
        </Sequence>
      )}

      {showSafeZones ? <SafeZones /> : null}
    </AbsoluteFill>
  );
};
