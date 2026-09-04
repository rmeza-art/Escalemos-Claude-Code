# Versión ViV

Segunda versión del sitio, diseñada tomando el sistema visual de
[vivmgmt.com](https://vivmgmt.com) — la agencia de representación de fotógrafos
que se usó como referente. Vive junto a `../index.html` para poder comparar las
dos, no la reemplaza.

Comparte las imágenes con la versión original (`../assets/img/`).

## Qué se tomó del referente

| ViV MGMT | Acá |
|---|---|
| Garamond Narrow + Helvetica Now | EB Garamond + Archivo |
| Fondo blanco, negro puro | Igual |
| Grilla de 12 columnas dibujada | Igual |
| Footer oscuro que se revela bajo el contenido | Igual |
| Logotipo abriéndose con `clipPath` | El wordmark se abre desde el centro |
| Marco pintado con el color dominante de la foto | Los siete colores extraídos de los pantallazos |
| Créditos en formato `A × B` | Igual |
| Miniatura al pasar el cursor sobre el roster | Sobre la lista de trabajo del footer |
| La frase de cuatro líneas en itálicas, en el footer | Igual — en la otra versión está en el hero |

## Las tres decisiones propias

**1. La voz va en serif, la información en grotesca.** Es la regla que ordena
toda la tipografía. Los títulos de caso, "El criterio detrás", las straplines y
el párrafo del precio van en EB Garamond porque son opinión. Los datos, las
etiquetas, la lista de entregables y el precio mismo van en Archivo. ViV usa dos
familias para separar display de interfaz; acá separan lo que opina de lo que
informa.

**2. La grilla se dibuja, pero sólo sobre el papel.** El overlay va en
`mix-blend-mode: multiply`: sobre el blanco deja la línea, sobre una fotografía
oscura desaparece solo. Se ve la estructura de la composición y no se ensucia la
imagen. Para un estudio que vende estructura, que la grilla sea visible es el
argumento, no un adorno.

**3. La lista de entregables está numerada de verdad.** `01` a `07` es el orden
en que ocurre el proyecto, de la investigación a la entrega. Si fuera un conjunto
sin secuencia iría con viñetas.

## Diferencias de fondo con el referente

ViV no publica precio: es una agencia de talento, te obliga a escribirle. Acá el
precio tiene pantalla propia y la cifra se muestra. Y el comparador antes/después
no existe en ViV ni podría: ellos muestran obra terminada, no la diferencia.

## Pendientes

Los mismos que la otra versión: el criterio de Molitos y el número de WhatsApp.
Esta versión lleva `noindex` mientras sea una alternativa a comparar — hay que
sacarlo si termina siendo la elegida, y agregarle los metadatos de compartir que
sí tiene `../index.html`.
