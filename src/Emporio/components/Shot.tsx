import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Frame } from "../beats";
import { PhotoPlaceholder } from "./PhotoPlaceholder";

/**
 * Una foto con movimiento de cámara. El encuadre se interpola de `from` a `to`
 * a lo largo del plano, con entrada y salida suaves para que nunca se note el
 * arranque ni la detención.
 */
export const Shot: React.FC<{
  photo: string;
  label: string;
  photosReady: boolean;
  from: Frame;
  to: Frame;
  children?: React.ReactNode;
}> = ({ photo, label, photosReady, from, to, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = interpolate(
    frame,
    [0, Math.max(durationInFrames - 1, 1)],
    [0, 1],
    {
      easing: Easing.inOut(Easing.ease),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const scale = interpolate(progress, [0, 1], [from.scale, to.scale]);
  const x = interpolate(progress, [0, 1], [from.x, to.x]);
  const y = interpolate(progress, [0, 1], [from.y, to.y]);

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale}) translate(${x * 100}%, ${y * 100}%)`,
      }}
    >
      {photosReady ? (
        <Img
          src={staticFile(photo)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <PhotoPlaceholder label={label} photo={photo} />
      )}
      {children}
    </AbsoluteFill>
  );
};
