import { AbsoluteFill, useVideoConfig } from "remotion";
import { SAFE_ZONE_TOP } from "../../common/SafeZones";
import { FONT_FAMILY, FONT_SERIF } from "../../common/theme";
import { EMPORIO } from "../theme";

/**
 * Ocupa el lugar de una foto que todavía no está en `public/`, para poder
 * revisar ritmo y textos antes de tener el material definitivo.
 */
export const PhotoPlaceholder: React.FC<{
  label: string;
  photo: string;
}> = ({ label, photo }) => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: EMPORIO.bone,
        // Arriba, para no pisar el texto narrador que va abajo.
        justifyContent: "flex-start",
        alignItems: "center",
        gap: width * 0.025,
        paddingTop: height * (SAFE_ZONE_TOP + 0.05),
        paddingLeft: width * 0.12,
        paddingRight: width * 0.12,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: width * 0.022,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: EMPORIO.sand,
        }}
      >
        Falta la foto
      </div>
      <div
        style={{
          fontFamily: FONT_SERIF,
          fontSize: width * 0.058,
          lineHeight: 1.2,
          color: EMPORIO.ink,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: width * 0.024,
          color: EMPORIO.olive,
          opacity: 0.75,
        }}
      >
        public/{photo}
      </div>
    </AbsoluteFill>
  );
};
