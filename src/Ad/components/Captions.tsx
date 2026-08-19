import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Caption } from "../schema";
import { SAFE_ZONE_BOTTOM } from "../../common/SafeZones";
import { FONT_FAMILY, readableOnVideo } from "../../common/theme";

const CaptionLine: React.FC<{ text: string; accentColor: string }> = ({
  text,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Un pop corto al entrar: llama la atención sin marear.
  const entrance = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 8 });
  const scale = interpolate(entrance, [0, 1], [0.86, 1]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        // En px sobre la altura: un padding en % se calcularía sobre el ancho
        // y dejaría el texto dentro de la banda inferior de Meta.
        paddingBottom: height * (SAFE_ZONE_BOTTOM + 0.02),
        paddingLeft: width * 0.08,
        paddingRight: width * 0.08,
      }}
    >
      <div
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: width * 0.072,
          lineHeight: 1.15,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          textAlign: "center",
          textTransform: "uppercase",
          color: "white",
          transform: `scale(${scale})`,
          borderBottom: `${Math.round(width * 0.008)}px solid ${accentColor}`,
          paddingBottom: width * 0.012,
          ...readableOnVideo,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

export const Captions: React.FC<{
  captions: Caption[];
  accentColor: string;
}> = ({ captions, accentColor }) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {captions.map((caption, index) => {
        const from = Math.round((caption.startMs / 1000) * fps);
        const durationInFrames = Math.max(
          1,
          Math.round(((caption.endMs - caption.startMs) / 1000) * fps),
        );

        return (
          <Sequence
            // Los subtítulos son una lista estática: el índice es estable.
            key={`${caption.startMs}-${index}`}
            from={from}
            durationInFrames={durationInFrames}
            name={caption.text.slice(0, 24)}
          >
            <CaptionLine text={caption.text} accentColor={accentColor} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
