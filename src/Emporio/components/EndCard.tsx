import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SAFE_ZONE_BOTTOM, SAFE_ZONE_TOP } from "../../common/SafeZones";
import { FONT_FAMILY, FONT_SERIF } from "../../common/theme";
import { EMPORIO } from "../theme";

/**
 * El cierre. Va sobre la foto y no dentro de un recuadro: el bodegón sigue
 * siendo la imagen, y encima aparecen la marca, el pack, el precio y el botón,
 * escalonados para que el ojo los lea en ese orden.
 */
export const EndCard: React.FC<{
  price: string;
  shipping: string;
  cta: string;
}> = ({ price, shipping, cta }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const at = (delay: number) =>
    spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: 20 });

  const brand = at(0);
  const title = at(6);
  const cost = at(12);
  const button = at(20);

  const lift = (value: number) => ({
    opacity: value,
    transform: `translateY(${interpolate(value, [0, 1], [width * 0.03, 0])}px)`,
  });

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(20, 22, 18, 0.82) 0%, rgba(20, 22, 18, 0.5) 40%, rgba(20, 22, 18, 0.1) 75%)",
          opacity: brand,
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingTop: height * SAFE_ZONE_TOP,
          paddingBottom: height * (SAFE_ZONE_BOTTOM + 0.02),
          paddingLeft: width * 0.09,
          paddingRight: width * 0.09,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: width * 0.026,
            letterSpacing: "0.42em",
            color: EMPORIO.sand,
            ...lift(brand),
          }}
        >
          EMPORIO ORGÁNIKA
        </div>

        <div
          style={{
            fontFamily: FONT_SERIF,
            fontSize: width * 0.072,
            lineHeight: 1.15,
            color: EMPORIO.paper,
            marginTop: width * 0.028,
            ...lift(title),
          }}
        >
          Pack Fortalecedor Capilar
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: width * 0.03,
            marginTop: width * 0.03,
            ...lift(cost),
          }}
        >
          <span
            style={{
              fontFamily: FONT_SERIF,
              fontSize: width * 0.062,
              color: EMPORIO.paper,
            }}
          >
            {price}
          </span>
          <span
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: width * 0.028,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: EMPORIO.sand,
            }}
          >
            {shipping}
          </span>
        </div>

        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: width * 0.032,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: EMPORIO.ink,
            backgroundColor: EMPORIO.bone,
            borderRadius: 9999,
            padding: `${width * 0.026}px ${width * 0.075}px`,
            marginTop: width * 0.05,
            ...lift(button),
          }}
        >
          {cta}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
