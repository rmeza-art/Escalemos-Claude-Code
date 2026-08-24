import {
  AbsoluteFill,
  Easing,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
} from "remotion";
import type { Segment } from "./anuncio";
import { AUDIO_FADE, FPS } from "./anuncio";

/**
 * Un tramo de clip con entrada al plano. La escala se mueve durante todo el
 * corte: sin eso el cuadro queda muerto, que era el problema del primer
 * montaje.
 */
export const Shot: React.FC<{
  segment: Segment;
  durationInFrames: number;
  /** Destello breve al entrar, para marcar el corte. */
  flash: boolean;
  /** Cuadros de fundido de entrada. 0 = corte seco. */
  fadeIn: number;
}> = ({ segment, durationInFrames, flash, fadeIn }) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame,
    [0, Math.max(durationInFrames - 1, 1)],
    [0, 1],
    {
      easing: Easing.out(Easing.ease),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const scale = interpolate(
    progress,
    [0, 1],
    [segment.scaleFrom, segment.scaleTo],
  );

  const opacity =
    fadeIn === 0
      ? 1
      : interpolate(frame, [0, fadeIn], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  const glare = flash
    ? interpolate(frame, [0, 3], [0.35, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <OffthreadVideo
          src={staticFile(segment.video)}
          trimBefore={Math.round(segment.fromInSeconds * FPS)}
          trimAfter={Math.round(segment.toInSeconds * FPS)}
          // Cada tramo trae su propio audio; sin fundidos el corte se oiría.
          volume={(f) =>
            interpolate(
              f,
              [0, AUDIO_FADE, durationInFrames - AUDIO_FADE, durationInFrames],
              [0, 1, 1, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            )
          }
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>

      {glare === 0 ? null : (
        <AbsoluteFill
          style={{
            backgroundColor: "white",
            opacity: glare,
            mixBlendMode: "screen",
          }}
        />
      )}
    </AbsoluteFill>
  );
};
