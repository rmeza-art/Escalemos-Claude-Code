import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_FAMILY, readableOnVideo } from "../../common/theme";
import { SAFE_ZONE_TOP } from "../../common/SafeZones";

/**
 * El gancho: la frase grande de los primeros segundos, que es lo que decide
 * si la persona sigue mirando o hace scroll.
 */
export const HookText: React.FC<{
  text: string;
  accentColor: string;
}> = ({ text, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  const entrance = spring({ frame, fps, config: { damping: 200 } });
  const translateY = interpolate(entrance, [0, 1], [-width * 0.08, 0]);

  // Se va con un fade en los últimos 8 frames de su propia secuencia.
  const opacity = interpolate(
    frame,
    [0, 6, durationInFrames - 8, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: height * (SAFE_ZONE_TOP + 0.03),
        paddingLeft: width * 0.07,
        paddingRight: width * 0.07,
        opacity,
      }}
    >
      <div
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: width * 0.105,
          lineHeight: 1.05,
          fontWeight: 900,
          letterSpacing: "-0.03em",
          textAlign: "center",
          textTransform: "uppercase",
          color: accentColor,
          transform: `translateY(${translateY}px)`,
          ...readableOnVideo,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
