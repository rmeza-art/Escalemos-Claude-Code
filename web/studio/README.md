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
| `<canvas id="scene">` con el `h1` en `sr-only` | Canvas de apertura; el titular se queda en HTML, legible y seleccionable |
| `about__word` × N | El párrafo del estudio se enciende palabra por palabra con el scroll |
| `work__title-line > span` | Revelado por líneas con máscara |
| `data-entered="false"` | Igual, por `IntersectionObserver` |
| `about__sticky`, `contact__sticky` | Secciones pegadas con progreso propio |
| `contact__curtain` | Cortina que descubre el cierre |
| `work-project__browser-bar` con puntos y dominio | Cada tienda dentro de un navegador falso |
| `--den` / `--cloud` / `--kiwi` | Cada proyecto con su color, extraído de su propia captura |

## Las decisiones propias

**El canvas muestra el servicio.** No es una animación decorativa: pasa las
cuatro tiendas de antes a después, con la misma barra naranja del comparador. Y
responde al puntero — al mover el mouse sobre la apertura, el barrido sigue al
cursor. La apertura demuestra lo que se vende en vez de describirlo.

**El navegador falso es honesto.** Lo que se muestra son sitios web; enmarcarlos
en un navegador con su dominio es decir la verdad sobre qué se está viendo, no un
adorno.

**El titular no vive dentro del canvas.** NexStudio esconde su `h1` en `sr-only`
y lo dibuja en WebGL. Acá el titular es HTML: se lee, se selecciona, lo toma un
buscador, y se ve aunque el canvas falle.

**Todo se apaga con `prefers-reduced-motion`.** Sin cursor, sin cortina, sin
bucle de canvas — un solo cuadro fijo — y todos los revelados en su estado final.

## Pendientes

Los mismos: el criterio de Molitos y el número de WhatsApp. Lleva `noindex`
mientras sea una alternativa a comparar.
