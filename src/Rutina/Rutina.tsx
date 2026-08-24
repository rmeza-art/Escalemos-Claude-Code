import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
} from "remotion";
import { SafeZones } from "../common/SafeZones";
import { EndCard } from "../Emporio/components/EndCard";
import { Line } from "../Emporio/components/Line";
import type { RutinaProps } from "./schema";
import type { Segment } from "./rutina";
import {
  AUDIO_FADE,
  CLIPS_FRAMES,
  END_CARD_FROM,
  FPS,
  LAST_FRAME,
  segmentFrames,
  segments,
  TAIL_SECONDS,
  TOTAL_FRAMES,
} from "./rutina";

const fill = { width: "100%", height: "100%", objectFit: "cover" } as const;

const Clip: React.FC<{ segment: Segment; durationInFrames: number }> = ({
  segment,
  durationInFrames,
}) => (
  <OffthreadVideo
    src={staticFile(segment.video)}
    trimBefore={Math.round(segment.fromInSeconds * FPS)}
    trimAfter={Math.round(segment.toInSeconds * FPS)}
    // Cada tramo trae su propio audio; sin estos fundidos el corte se oiría.
    volume={(frame) =>
      interpolate(
        frame,
        [0, AUDIO_FADE, durationInFrames - AUDIO_FADE, durationInFrames],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )
    }
    style={fill}
  />
);

export const Rutina: React.FC<RutinaProps> = ({
  price,
  shipping,
  cta,
  showSafeZones,
}) => {
  let start = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {segments.map((segment) => {
        const durationInFrames = segmentFrames(segment);
        const from = start;
        start += durationInFrames;

        return (
          <Sequence
            key={segment.label}
            from={from}
            durationInFrames={durationInFrames}
            name={segment.label}
          >
            <Clip segment={segment} durationInFrames={durationInFrames} />
            {segment.text === null ? null : (
              <Line
                text={segment.text}
                step={segment.step}
                note={segment.note}
              />
            )}
          </Sequence>
        );
      })}

      {/* El bodegón dura poco: se sostiene su último cuadro para el cierre. */}
      <Sequence
        from={CLIPS_FRAMES}
        durationInFrames={Math.round(TAIL_SECONDS * FPS)}
        name="Cuadro congelado"
      >
        <Img src={staticFile(LAST_FRAME)} style={fill} />
      </Sequence>

      <Sequence
        from={END_CARD_FROM}
        durationInFrames={TOTAL_FRAMES - END_CARD_FROM}
        name="Cierre"
      >
        <EndCard price={price} shipping={shipping} cta={cta} />
      </Sequence>

      {showSafeZones ? <SafeZones /> : null}
    </AbsoluteFill>
  );
};
