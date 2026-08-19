import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { FONT_FAMILY } from "../../common/theme";

export const Watermark: React.FC<{
  text: string;
  logoSrc: string | null;
}> = ({ text, logoSrc }) => {
  const { width } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "flex-end",
        padding: width * 0.05,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: width * 0.015,
          opacity: 0.9,
        }}
      >
        {logoSrc === null ? null : (
          <Img
            src={staticFile(logoSrc)}
            style={{ height: width * 0.055, width: "auto" }}
          />
        )}
        <span
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: width * 0.03,
            fontWeight: 700,
            color: "white",
            textShadow: "0 2px 12px rgba(0, 0, 0, 0.6)",
          }}
        >
          {text}
        </span>
      </div>
    </AbsoluteFill>
  );
};
