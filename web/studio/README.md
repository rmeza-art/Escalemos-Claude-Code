# Versión con recorrido

Tercera versión. Mantiene la identidad de la versión ViV (blanco, negro puro,
EB Garamond + Archivo) y le suma la capa de experiencia leída del código de
[nexstudio.tech](https://nexstudio.tech).

Comparte las imágenes con las otras dos (`../assets/img/`).

## El cambio de fondo

Las dos versiones anteriores son un router por hash: nueve pantallas separadas,
sin recorrido. Esta es **una sola página y un solo scroll**. Los casos dejaron de
ser rutas y entraron al relato; el nav pasó a ser anclas con marcado por
intersección.

Ese era el problema real: no faltaba movimiento, faltaba continuidad.

## Qué se tomó de NexStudio

| En su código | Acá |
|---|---|
| `site-loader` con contador `000` y barra en `scaleX` | Igual, gatillado por la precarga real de las siete imágenes |
| `fluid-cursor` con `data-interactive` / `data-pressed` | Cursor propio; crece sobre enlaces y sobre los comparadores, donde dice «arrastra» |
| `<canvas id="scene">` con el `h1` en `sr-only` | No se tomó: la apertura es sólo tipografía y el titular es HTML |
| `about__word` × N | El párrafo del estudio se enciende palabra por palabra con el scroll |
| `work__title-line > span` | Revelado por líneas con máscara |
| `data-entered="false"` | Igual, por `IntersectionObserver` |
| `about__sticky`, `contact__sticky` | Secciones pegadas con progreso propio |
| `contact__curtain` | Cortina que descubre el cierre |
| `work-project__browser-bar` con puntos y dominio | Cada tienda dentro de un navegador falso |
| `--den` / `--cloud` / `--kiwi` | Cada proyecto con su color, extraído de su propia captura |

## Las decisiones propias

**La apertura es una palabra que escala.** Archivo es una fuente variable con
eje de ancho (`wdth` 62–125), un eje que casi nadie anima. Acá es toda la
animación, y significa algo: la palabra «Escalemos» escalándose a sí misma.

En cada cuadro se recalcula el cuerpo para que el ancho del texto siga siendo
exactamente el de la caja. La palabra cambia de proporción — de condensada y
alta a extendida y baja — **sin despegarse nunca de los dos bordes**. Los anchos
se miden una vez por valor entero del eje y se guardan; el ancho intermedio se
interpola entre los dos vecinos, porque redondear dejaba la palabra hasta 9 px
fuera del borde. El bucle sólo escribe dos propiedades.

El eje sigue al cursor de lado a lado, y cuando nadie toca respira sola entre 95
y 105. El indicador de abajo muestra el valor del eje en vivo.

**Cada fuente se mueve por el eje que tiene.** Archivo por el de ancho: el
wordmark, los títulos de proyecto al pasar el cursor, el nav. EB Garamond no
tiene eje de ancho, así que el párrafo del estudio se mueve por el de peso —
400 → 560 a medida que cada palabra se enciende.

**El navegador falso es honesto.** Lo que se muestra son sitios web; enmarcarlos
en un navegador con su dominio es decir la verdad sobre qué se está viendo, no un
adorno.

**El titular es HTML.** NexStudio esconde su `h1` en `sr-only` y lo dibuja en
WebGL. Acá se lee, se selecciona y lo toma un buscador. Las letras que se revelan
una a una llevan `aria-hidden` y el texto completo queda en `aria-label`, así un
lector de pantalla lee la frase y no letra por letra.

**Todo se apaga con `prefers-reduced-motion`.** Sin cursor, sin cortina, sin
bucle de canvas — un solo cuadro fijo — y todos los revelados en su estado final.

## Pendientes

Los mismos: el criterio de Molitos y el número de WhatsApp. Lleva `noindex`
mientras sea una alternativa a comparar.
