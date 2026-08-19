import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SAFE_ZONE_BOTTOM } from "../../common/SafeZones";
import { FONT_FAMILY, FONT_SERIF } from "../../common/theme";
import { EMPORIO } from "../theme";

/**
 * El texto que narra. Sin voz en off, es lo único que cuenta la historia, así
 * que se lee primero: entra desde abajo, se apoya en un degradado en vez de
 * una caja, y termina por encima de la franja que Meta reserva para el copy.
 */
export const Line: React.FC<{
  text: string;
  step: number | null;
  note: string | null;
}> = ({ text, step, note }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  const entrance = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 18 });
  const exit = interpolate(
    frame,
    [durationInFrames - 9, durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const opacity = entrance * exit;
  const rise = interpolate(entrance, [0, 1], [width * 0.035, 0]);

  return (
    <AbsoluteFill>
      {/* Degradado de apoyo: da contraste sin encajonar el texto. */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(20, 22, 18, 0.72) 0%, rgba(20, 22, 18, 0.28) 26%, rgba(20, 22, 18, 0) 52%)",
          opacity: entrance,
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: height * (SAFE_ZONE_BOTTOM + 0.02),
          paddingLeft: width * 0.1,
          paddingRight: width * 0.1,
          textAlign: "center",
          opacity,
          transform: `translateY(${rise}px)`,
        }}
      >
        <div>
          {step === null ? null : (
            <div
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: width * 0.026,
                letterSpacing: "0.4em",
                color: EMPORIO.sand,
                marginBottom: width * 0.022,
              }}
            >
              PASO {step}
            </div>
          )}

          <div
            style={{
              fontFamily: FONT_SERIF,
              fontSize: width * (step === null ? 0.062 : 0.078),
              lineHeight: 1.22,
              color: EMPORIO.paper,
              textShadow: "0 4px 24px rgba(0, 0, 0, 0.5)",
            }}
          >
            {text}
          </div>

          {note === null ? null : (
            <div
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: width * 0.03,
                letterSpacing: "0.06em",
                color: EMPORIO.paper,
                opacity: 0.82,
                marginTop: width * 0.018,
              }}
            >
              {note}
            </div>
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
