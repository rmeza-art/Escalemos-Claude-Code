import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  Sequence,
  staticFile,
} from "remotion";
import { SafeZones } from "../common/SafeZones";
import { EndCard } from "../Emporio/components/EndCard";
import { Line } from "../Emporio/components/Line";
import type { UgcProps } from "./schema";
import {
  captions,
  END_CARD_START_IN_SECONDS,
  FPS,
  TAIL_SECONDS,
  LAST_FRAME,
  TOTAL_FRAMES,
  VIDEO,
  VIDEO_SECONDS,
} from "./ugc";

const VIDEO_FRAMES = Math.round(VIDEO_SECONDS * FPS);

const fill = { width: "100%", height: "100%", objectFit: "cover" } as const;

export const UGC: React.FC<UgcProps> = ({
  price,
  shipping,
  cta,
  showSafeZones,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Sequence durationInFrames={VIDEO_FRAMES} name="Clip">
        <OffthreadVideo src={staticFile(VIDEO)} style={fill} />
      </Sequence>

      {/* El último cuadro se sostiene para que el cierre se alcance a leer. */}
      <Sequence
        from={VIDEO_FRAMES}
        durationInFrames={Math.round(TAIL_SECONDS * FPS)}
        name="Cuadro congelado"
      >
        <Img src={staticFile(LAST_FRAME)} style={fill} />
      </Sequence>

      {captions.map((caption) => {
        const from = Math.round(caption.startInSeconds * FPS);
        const durationInFrames = Math.max(
          1,
          Math.round((caption.endInSeconds - caption.startInSeconds) * FPS),
        );

        return (
          <Sequence
            key={caption.text}
            from={from}
            durationInFrames={durationInFrames}
            name={caption.text.slice(0, 24)}
          >
            <Line text={caption.text} step={null} note={caption.note} />
          </Sequence>
        );
      })}

      <Sequence
        from={Math.round(END_CARD_START_IN_SECONDS * FPS)}
        durationInFrames={
          TOTAL_FRAMES - Math.round(END_CARD_START_IN_SECONDS * FPS)
        }
        name="Cierre"
      >
        <EndCard price={price} shipping={shipping} cta={cta} />
      </Sequence>

      {showSafeZones ? <SafeZones /> : null}
    </AbsoluteFill>
  );
};
