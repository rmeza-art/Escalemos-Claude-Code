import { AbsoluteFill, Img, Sequence, staticFile } from "remotion";
import { EndCard } from "../common/EndCard";
import { SafeZones } from "../common/SafeZones";
import { Hit } from "./Hit";
import { Shot } from "./Shot";
import type { AnuncioProps } from "./schema";
import {
  CLIPS_FRAMES,
  END_CARD_FROM,
  FPS,
  LAST_FRAME,
  lines,
  segmentFrames,
  segments,
  TOTAL_FRAMES,
} from "./anuncio";

const fill = { width: "100%", height: "100%", objectFit: "cover" } as const;

export const Anuncio: React.FC<AnuncioProps> = ({
  price,
  shipping,
  cta,
  items,
  showSafeZones,
}) => {
  let start = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {segments.map((segment, index) => {
        const durationInFrames = segmentFrames(segment);
        const from = start;
        start += durationInFrames;

        return (
          <Sequence
            key={`${segment.label}-${index}`}
            from={from}
            durationInFrames={durationInFrames}
            name={segment.label}
          >
            <Shot
              segment={segment}
              durationInFrames={durationInFrames}
              flash={index > 0}
              fadeIn={0}
            />
          </Sequence>
        );
      })}

      {/* El bodegón dura poco: se sostiene su último cuadro para el cierre. */}
      <Sequence
        from={CLIPS_FRAMES}
        durationInFrames={TOTAL_FRAMES - CLIPS_FRAMES}
        name="Cuadro congelado"
      >
        <Img src={staticFile(LAST_FRAME)} style={fill} />
      </Sequence>

      {/* Pista de texto aparte: cada paso cruza dos planos con un solo rótulo. */}
      {lines.map((line) => {
        const from = Math.round(line.startInSeconds * FPS);
        const durationInFrames = Math.max(
          1,
          Math.round((line.endInSeconds - line.startInSeconds) * FPS),
        );

        return (
          <Sequence
            key={`${line.text}-${line.startInSeconds}`}
            from={from}
            durationInFrames={durationInFrames}
            name={line.text.slice(0, 24)}
          >
            <Hit text={line.text} step={line.step} note={line.note} />
          </Sequence>
        );
      })}

      <Sequence
        from={END_CARD_FROM}
        durationInFrames={TOTAL_FRAMES - END_CARD_FROM}
        name="Cierre"
      >
        <EndCard price={price} shipping={shipping} cta={cta} items={items} />
      </Sequence>

      {showSafeZones ? <SafeZones /> : null}
    </AbsoluteFill>
  );
};
