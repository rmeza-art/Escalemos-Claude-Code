import { AbsoluteFill, useVideoConfig } from "remotion";
import { FONT_FAMILY } from "../theme";

/**
 * Se muestra cuando `videoSrc` es `null` o el archivo no se pudo leer, para
 * que Remotion Studio siga abriendo aunque todavía no exista el video.
 */
export const MissingVideo: React.FC<{ expectedPath: string | null }> = ({
  expectedPath,
}) => {
  const { width } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0B0B0F",
        justifyContent: "center",
        alignItems: "center",
        padding: "10%",
        gap: width * 0.03,
        fontFamily: FONT_FAMILY,
        color: "white",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: width * 0.055, fontWeight: 800 }}>
        Falta el video
      </div>
      <div style={{ fontSize: width * 0.028, lineHeight: 1.5, opacity: 0.75 }}>
        Copia tu archivo dentro de <strong>public/</strong> y apunta la prop{" "}
        <strong>videoSrc</strong> a él.
      </div>
      <div
        style={{
          fontSize: width * 0.026,
          fontFamily: "monospace",
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          borderRadius: width * 0.012,
          padding: `${width * 0.018}px ${width * 0.03}px`,
        }}
      >
        public/{expectedPath === null ? "video.mp4" : expectedPath}
      </div>
    </AbsoluteFill>
  );
};
