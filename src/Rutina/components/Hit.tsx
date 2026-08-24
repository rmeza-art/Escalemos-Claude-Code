import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SAFE_ZONE_BOTTOM } from "../../common/SafeZones";
import { FONT_FAMILY } from "../../common/theme";
import { EMPORIO } from "../../Emporio/theme";

/**
 * Texto de la versión de performance: entra de golpe en tres cuadros, en
 * mayúsculas y con peso, porque en un feed frío la elegancia no se lee.
 */
export const Hit: React.FC<{
  text: string;
  step: number | null;
}> = ({ text, step }) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const snap = interpolate(frame, [0, 3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const out = interpolate(
    frame,
    [durationInFrames - 3, durationInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const scale = interpolate(snap, [0, 1], [1.16, 1]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: height * (SAFE_ZONE_BOTTOM + 0.02),
        paddingLeft: width * 0.07,
        paddingRight: width * 0.07,
        opacity: snap * out,
        transform: `scale(${scale})`,
      }}
    >
      <div style={{ textAlign: "center" }}>
        {step === null ? null : (
          <div
            style={{
              display: "inline-block",
              fontFamily: FONT_FAMILY,
              fontSize: width * 0.032,
              fontWeight: 800,
              letterSpacing: "0.18em",
              color: EMPORIO.ink,
              backgroundColor: EMPORIO.bone,
              padding: `${width * 0.012}px ${width * 0.035}px`,
              borderRadius: 9999,
              marginBottom: width * 0.025,
            }}
          >
            PASO {step}
          </div>
        )}

        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: width * 0.088,
            lineHeight: 1.08,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            color: EMPORIO.paper,
            WebkitTextStroke: `${Math.round(width * 0.006)}px rgba(20, 22, 18, 0.8)`,
            paintOrder: "stroke fill",
            textShadow: "0 6px 26px rgba(0, 0, 0, 0.5)",
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
