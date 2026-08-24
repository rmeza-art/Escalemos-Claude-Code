# Anuncio Emporio Orgánika — Meta 9:16

Anuncio de 19,4 s para el Pack Fortalecedor Capilar, montado con
[Remotion](https://remotion.dev): el video se define por código, así que
cambiar un texto, un precio o una duración es editar un archivo y volver a
renderizar.

```bash
npm install
npm run dev                      # abre Remotion Studio
npx remotion render Anuncio out/anuncio.mp4
```

## Cómo está armado

`src/Anuncio/anuncio.ts` es el guion: la lista de planos y la de rótulos. Casi
todo lo que se quiera cambiar está ahí.

- **Video y texto van en pistas separadas.** Cada paso de la rutina se cuenta
  con dos planos seguidos bajo un solo rótulo, de modo que el texto se alcanza
  a leer sin que la imagen se quede quieta.
- **Sin voz en off:** el texto en pantalla es el que narra y la pieza funciona
  en mudo, que es como se ve la mayoría de los anuncios en el feed.
- **Cada plano se mueve.** La escala va de `scaleFrom` a `scaleTo` durante todo
  el corte.
- **El audio de cada tramo se conserva** con fundidos de cinco cuadros en los
  cortes: los clips comparten una misma base sonora y sin eso el empalme se
  oiría.

## Zonas de seguridad

Meta reserva el 14% superior para el nombre de la cuenta y el 35% inferior para
el copy, los botones y el CTA. Todo el texto queda fuera de esas bandas. Para
comprobarlo, `showSafeZones: true` las dibuja encima; se apaga para exportar.

Ojo con los márgenes en porcentaje: en CSS el `padding` en % se resuelve contra
el **ancho** del contenedor, no contra el alto. En un 9:16 eso da poco más de la
mitad del margen buscado. Por eso acá se calculan sobre la altura real.

## El material

Cuatro clips de 10 s más un UGC de 8 s, en `public/`. Todos traen cortes
internos —hasta cinco tomas en diez segundos—, y el inventario de tomas está
escrito arriba de `anuncio.ts`. **Cada rango del guion cae dentro de una sola
toma**; conviene no moverlos sin mirar ese inventario.

Dos tramos quedan descartados a propósito: la primera toma de `01-lavando` y el
final de `03-masaje`. Los clips vienen generados y la identidad de la persona no
se sostiene entre ellos.

## Tipografías

Salen de lo instalado en el sistema: no se descargan fuentes al renderizar. Eso
mantiene el render reproducible, pero significa que el resultado depende de qué
fuentes tenga la máquina. Para fijar la tipografía de la marca hay que dejar el
`.ttf` en `public/` y cargarlo con `@font-face`.
