import { AbsoluteFill, useVideoConfig } from "remotion";
import { FONT_FAMILY } from "./theme";

/**
 * Guías de las zonas de seguridad de Meta para 9:16.
 *
 * Meta reserva la franja superior para el nombre de la cuenta y la inferior
 * para el copy, los botones y el CTA. Todo lo que caiga dentro de esas bandas
 * puede quedar tapado en el feed, aunque en el archivo se vea perfecto.
 */
export const SAFE_ZONE_TOP = 0.14;
export const SAFE_ZONE_BOTTOM = 0.35;

const Band: React.FC<{
  edge: "top" | "bottom";
  fraction: number;
  label: string;
}> = ({ edge, fraction, label }) => {
  const { width } = useVideoConfig();
  const border = `${Math.max(2, Math.round(width * 0.004))}px dashed rgba(255, 64, 64, 0.9)`;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        [edge]: 0,
        height: `${fraction * 100}%`,
        backgroundColor: "rgba(255, 0, 0, 0.18)",
        [edge === "top" ? "borderBottom" : "borderTop"]: border,
        display: "flex",
        alignItems: edge === "top" ? "flex-end" : "flex-start",
        justifyContent: "center",
        padding: width * 0.02,
        fontFamily: FONT_FAMILY,
        fontSize: width * 0.026,
        fontWeight: 700,
        color: "white",
        textShadow: "0 2px 8px rgba(0, 0, 0, 0.8)",
      }}
    >
      {label}
    </div>
  );
};

export const SafeZones: React.FC = () => {
  return (
    <AbsoluteFill>
      <Band edge="top" fraction={SAFE_ZONE_TOP} label="14% · cuenta" />
      <Band
        edge="bottom"
        fraction={SAFE_ZONE_BOTTOM}
        label="35% · copy, botones y CTA"
      />
    </AbsoluteFill>
  );
};
