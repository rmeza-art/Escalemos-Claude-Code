import { AbsoluteFill, Img, Sequence, staticFile } from "remotion";
import { SafeZones } from "../common/SafeZones";
import { EndCard } from "../Emporio/components/EndCard";
import { Line } from "../Emporio/components/Line";
import { Hit } from "./components/Hit";
import { Shot } from "./components/Shot";
import type { RutinaProps } from "./schema";
import type { Variant } from "./rutina";
import {
  clipsFrames,
  endCardFrom,
  FPS,
  LAST_FRAME,
  performance,
  ritual,
  segmentFrames,
  totalFrames,
} from "./rutina";

const fill = { width: "100%", height: "100%", objectFit: "cover" } as const;

export const Rutina: React.FC<RutinaProps> = ({
  variant: name,
  price,
  shipping,
  cta,
  showSafeZones,
}) => {
  const variant: Variant = name === "performance" ? performance : ritual;
  const clips = clipsFrames(variant);
  const total = totalFrames(variant);
  const endFrom = endCardFrom(variant);

  let start = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {variant.segments.map((segment, index) => {
        const frames = segmentFrames(segment);
        // Los planos que se cruzan entran un poco antes y duran otro tanto,
        // para solaparse con el anterior sin correr el resto del montaje.
        const overlaps = index > 0 ? variant.overlap : 0;
        const from = start - overlaps;
        const durationInFrames = frames + overlaps;
        start += frames;

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
              flash={variant.flash && index > 0}
              fadeIn={overlaps}
            />
          </Sequence>
        );
      })}

      {/* El bodegón dura poco: se sostiene su último cuadro para el cierre. */}
      <Sequence
        from={clips}
        durationInFrames={total - clips}
        name="Cuadro congelado"
      >
        <Img src={staticFile(LAST_FRAME)} style={fill} />
      </Sequence>

      {/* Pista de texto aparte: un rótulo puede cruzar un corte. */}
      {variant.lines.map((line) => {
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
            {name === "performance" ? (
              <Hit text={line.text} step={line.step} />
            ) : (
              <Line text={line.text} step={line.step} note={line.note} />
            )}
          </Sequence>
        );
      })}

      <Sequence from={endFrom} durationInFrames={total - endFrom} name="Cierre">
        <EndCard price={price} shipping={shipping} cta={cta} />
      </Sequence>

      {showSafeZones ? <SafeZones /> : null}
    </AbsoluteFill>
  );
};

export { FPS };
