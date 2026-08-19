import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { Focus } from "../beats";

/** Cuadros que tarda el foco en llegar desde donde estaba. */
const TRAVEL = 14;

/**
 * Oscurece la foto salvo un claro alrededor de un punto. Va dentro del mismo
 * contenedor que la imagen, así que el claro queda pegado al frasco aunque el
 * encuadre se mueva.
 */
export const Spotlight: React.FC<{
  focus: Focus;
  /** Dónde estaba el foco en el plano anterior. `null` = recién aparece. */
  previous: Focus | null;
}> = ({ focus, previous }) => {
  const frame = useCurrentFrame();
  const travel = interpolate(frame, [0, TRAVEL], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const origin = previous === null ? focus : previous;
  const x = interpolate(travel, [0, 1], [origin.x, focus.x]);
  const y = interpolate(travel, [0, 1], [origin.y, focus.y]);
  const radius = interpolate(travel, [0, 1], [origin.radius, focus.radius]);

  // Si no venía de otro plano, en vez de viajar el foco entra atenuándose.
  const strength = previous === null ? travel * 0.62 : 0.62;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(20, 22, 18, 0) ${radius * 100}%, rgba(20, 22, 18, ${strength}) ${(radius + 0.34) * 100}%)`,
      }}
    />
  );
};
