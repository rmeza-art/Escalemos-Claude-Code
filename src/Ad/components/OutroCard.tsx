import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT_FAMILY } from "../../common/theme";

/** La tarjeta de cierre con el llamado a la acción. */
export const OutroCard: React.FC<{
  headline: string;
  cta: string;
  backgroundColor: string;
  accentColor: string;
}> = ({ headline, cta, backgroundColor, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const headlineIn = spring({ frame, fps, config: { damping: 200 } });
  const ctaIn = spring({ frame: frame - 8, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        justifyContent: "center",
        alignItems: "center",
        padding: "10%",
        gap: width * 0.05,
      }}
    >
      <div
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: width * 0.09,
          lineHeight: 1.08,
          fontWeight: 900,
          letterSpacing: "-0.03em",
          textAlign: "center",
          color: "white",
          opacity: headlineIn,
          transform: `translateY(${interpolate(headlineIn, [0, 1], [24, 0])}px)`,
        }}
      >
        {headline}
      </div>
      <div
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: width * 0.042,
          fontWeight: 800,
          letterSpacing: "0.01em",
          color: "#0B0B0F",
          backgroundColor: accentColor,
          borderRadius: 9999,
          padding: `${width * 0.025}px ${width * 0.06}px`,
          opacity: ctaIn,
          transform: `scale(${interpolate(ctaIn, [0, 1], [0.9, 1])})`,
        }}
      >
        {cta}
      </div>
    </AbsoluteFill>
  );
};
