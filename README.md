# Editor de video con Remotion

Proyecto de [Remotion](https://remotion.dev) para montar anuncios en video por
código: se toma un clip de origen y se le agregan encima gancho, subtítulos,
marca de agua y una tarjeta de cierre. Al ser código, sacar diez variantes de
un mismo anuncio es cambiar props, no volver a editar a mano.

## Empezar

```bash
npm install
npm run dev      # abre Remotion Studio
```

En el Studio se edita cada prop desde el panel derecho y se ve el resultado al
instante.

## Renderizar

```bash
npx remotion render Ad out/ad.mp4
```

## Cómo está armado

El video de origen vive en `public/` y se referencia con `staticFile()`.

```
src/Ad/
  Ad.tsx          la composición: apila clip + capas
  schema.ts       props validadas con zod (lo que se ve en el Studio)
  metadata.ts     lee el video y calcula duración y tamaño de salida
  captions.ts     los subtítulos y sus tiempos
  theme.ts        tipografía y contorno para leer sobre imagen
  components/     gancho, subtítulos, marca de agua, cierre
```

`metadata.ts` abre el archivo con [Mediabunny](https://mediabunny.dev) y deriva
la duración: no hay que escribir `durationInFrames` a mano cada vez que cambia
el clip o el recorte. Si el archivo no existe o no se puede leer, la
composición muestra un cartel de ayuda en vez de romperse, para que el Studio
igual abra.

## Props

| Prop | Para qué sirve |
| --- | --- |
| `videoSrc` | Ruta dentro de `public/`. `null` muestra el cartel de ayuda. |
| `format` | `original`, `9:16`, `1:1` o `16:9`. Define el tamaño de salida. |
| `trimStartInSeconds` / `trimEndInSeconds` | Recorte del clip. `null` = hasta el final. |
| `hook` | La frase grande de los primeros segundos. `null` la saca. |
| `captions` | Lista de `{ text, startMs, endMs }`, en tiempos del montaje final. |
| `watermark` | Texto y logo opcional arriba a la derecha. |
| `outro` | Tarjeta de cierre con titular, botón y color de fondo. |
| `accentColor` | Color de marca del gancho, el subrayado y el botón. |

Todo lo que sea `null` simplemente no se dibuja: sirve para probar el mismo
clip con y sin cada capa.

## Variantes

Para renderizar el mismo clip con otro gancho u otro formato, sin tocar el
código:

```bash
npx remotion render Ad out/ad-cuadrado.mp4 --props='{"format":"1:1"}'
```

Las props que se pasan se mezclan con las de `src/Root.tsx`.

## Subtítulos

Los tiempos de `captions.ts` están escritos a mano mirando la imagen. Para
ajustarlos con precisión conviene moverse cuadro a cuadro en el Studio. Si más
adelante se quiere transcribir el audio automáticamente, Remotion tiene
[`@remotion/install-whisper-cpp`](https://www.remotion.dev/docs/install-whisper-cpp),
que corre local pero necesita descargar el modelo la primera vez.

## Fuentes

Se usa la tipografía del sistema a propósito: no se descarga nada al
renderizar, así el resultado es igual en cualquier máquina y en CI.
