import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { SafeZones } from "../common/SafeZones";
import type { Beat, Focus } from "./beats";
import { beatFrames, beats } from "./beats";
import { EndCard } from "./components/EndCard";
import { Line } from "./components/Line";
import { Shot } from "./components/Shot";
import { Spotlight } from "./components/Spotlight";
import type { EmporioProps } from "./schema";
import { EMPORIO } from "./theme";

/**
 * Cuadros que se solapan al cambiar de foto. Es un corte suave, no un fundido
 * largo: lo justo para que no golpee, sin que lleguen a verse las dos
 * imágenes superpuestas.
 */
const OVERLAP = 6;

const BeatLayer: React.FC<{
  beat: Beat;
  previousFocus: Focus | null;
  fades: boolean;
  photosReady: boolean;
  price: string;
  shipping: string;
  cta: string;
}> = ({ beat, previousFocus, fades, photosReady, price, shipping, cta }) => {
  const frame = useCurrentFrame();
  const opacity = fades
    ? interpolate(frame, [0, OVERLAP], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  return (
    <AbsoluteFill style={{ opacity }}>
      <Shot
        photo={beat.photo}
        label={beat.label}
        photosReady={photosReady}
        from={beat.from}
        to={beat.to}
      >
        {beat.focus === null ? null : (
          <Spotlight focus={beat.focus} previous={previousFocus} />
        )}
      </Shot>

      {beat.endCard ? (
        <EndCard price={price} shipping={shipping} cta={cta} />
      ) : null}

      {beat.text === null ? null : (
        <Line text={beat.text} step={beat.step} note={beat.note} />
      )}
    </AbsoluteFill>
  );
};

export const Emporio: React.FC<EmporioProps> = ({
  photosReady,
  price,
  shipping,
  cta,
  showSafeZones,
}) => {
  let start = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: EMPORIO.ink }}>
      {beats.map((beat, index) => {
        const previous = index === 0 ? null : beats[index - 1];
        // Solo se solapa cuando cambia la foto. Entre los tres pasos la imagen
        // es la misma y el movimiento continúa, así que el corte es invisible.
        const fades = previous !== null && previous.photo !== beat.photo;

        const from = start - (fades ? OVERLAP : 0);
        const durationInFrames = beatFrames(beat) + (fades ? OVERLAP : 0);
        start += beatFrames(beat);

        return (
          <Sequence
            key={beat.label}
            from={from}
            durationInFrames={durationInFrames}
            name={beat.label}
          >
            <BeatLayer
              beat={beat}
              previousFocus={previous === null ? null : previous.focus}
              fades={fades}
              photosReady={photosReady}
              price={price}
              shipping={shipping}
              cta={cta}
            />
          </Sequence>
        );
      })}

      {showSafeZones ? <SafeZones /> : null}
    </AbsoluteFill>
  );
};
