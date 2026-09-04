# Escalemos Ecommerce — sitio

Implementación del diseño `Escalemos Ecommerce v2.dc.html`, exportado desde
Claude Design (proyecto *Análisis de estilo ViV Management*) como handoff bundle.

## Qué es

Sitio estático, sin build. HTML + CSS + JavaScript sin dependencias. Se abre
directo en el navegador y se publica en cualquier hosting estático (Netlify,
Vercel, Cloudflare Pages, GitHub Pages) subiendo esta carpeta tal cual.

```
web/
├── index.html          versión 1 — el diseño de Claude Design
├── assets/
│   ├── css/styles.css
│   ├── js/app.js
│   └── img/            los siete pantallazos de los casos + la tarjeta OG
├── viv/                versión 2 — con el sistema visual de vivmgmt.com
│   ├── index.html
│   ├── README.md
│   └── assets/
└── studio/             versión 3 — la de viv/ más la capa de experiencia
    ├── index.html      de nexstudio.tech, en un solo scroll
    ├── README.md
    └── assets/
```

Son **tres versiones del mismo contenido**, para comparar. `viv/` y `studio/`
reusan las imágenes de `assets/img/`; lo demás es propio de cada una. Ver el
README de cada carpeta.

| | Estructura | Identidad | Movimiento |
|---|---|---|---|
| `index.html` | 9 pantallas por hash | Oscura, Archivo sola | Entrada por pantalla |
| `viv/` | 9 pantallas por hash | Papel, serif + grotesca, grilla visible | Revelados y hover |
| `studio/` | **Una página, un scroll** | La de `viv/` | Carga, cursor, canvas, secciones pegadas, cortina |

Se eligió estático porque el repo es un proyecto Remotion (video), no una app
web: agregar React o un bundler aquí solo sumaría build sin ganar nada. El
diseño son nueve pantallas y dos comportamientos; esto es todo lo que necesita.

### Verlo local

```bash
cd web && python3 -m http.server 8000   # http://localhost:8000
```

O abrir `web/index.html` directo — también funciona con `file://`.

## Cómo funciona

**Router por hash.** Una página, nueve pantallas. `app.js` muestra una y
esconde el resto según `location.hash`, igual que el prototipo:

| Hash | Pantalla |
|---|---|
| `#inicio` | Inicio (por defecto) |
| `#trabajo` | El trabajo |
| `#molitos` `#organika` `#black-rabbit` `#barra-zero` | Casos |
| `#precio` `#sobre` `#contacto` | Precio, Sobre, Contacto |

Dentro de un caso, el nav mantiene **Trabajo** subrayado — igual que el
`navTrabajo` del original.

**Comparadores antes/después.** Cada uno es un `<input type="range">`
transparente sobre las dos imágenes. Su valor escribe la variable `--p` en el
contenedor, y de ahí salen los dos `clip-path`, la línea y el tirador. Funciona
con mouse, touch y teclado (flechas), y lleva `aria-label`.

## Antes de publicar: el dominio

El `<head>` lleva `canonical`, Open Graph, Twitter Card y JSON-LD
(`ProfessionalService`, con la oferta de $650.000 CLP). Todo eso escribe el
dominio completo: **`https://escalemos.cl/`**, en siete lugares de
`index.html`.

Si el sitio queda en otro dominio o en un subdirectorio, hay que reemplazarlo
en los siete. Un `canonical` apuntando a otra parte saca la página del índice
de Google.

La tarjeta que se ve al pegar el link es `assets/img/og.jpg` (1200×630). Se
generó desde el propio sitio; para rehacerla, basta un pantallazo de 1200×630
con el mismo tratamiento tipográfico.

## Pendientes de contenido

Vienen así desde el diseño. Hay que reemplazarlos antes de publicar:

- **Criterio de Molitos** — `index.html`, pantalla `data-screen="mol"`: dice
  `[Pendiente: el criterio de Molitos lo define Ricardo.]`.
- **WhatsApp** — pantalla `data-screen="contacto"`: el número
  `wa.me/56900000000` es un marcador de posición.

## Diferencias con el prototipo

Tres, todas marcadas con comentario en el código:

1. **Grilla de fichas bajo 560px.** El diseño usa dos columnas fijas; en móvil
   angosto las imágenes quedan ilegibles. Hay un media query que baja a una
   columna — se borra en una línea si prefieres las dos siempre.
2. **`prefers-reduced-motion`.** Se desactivan las animaciones de entrada para
   quien lo tenga configurado.
3. **`<title>` por pantalla, `aria-current` y `loading="lazy"`.** El prototipo
   no los tenía porque vive dentro del lienzo de Claude Design.

El acento naranja es la variable `--ac` en `styles.css`: cambiarla ahí lo
cambia en todo el sitio, igual que el prop `acento` del prototipo.

## Fuente

Archivo variable (ejes `wdth` 62–125 y `wght` 100–900, con itálica), desde
Google Fonts. Si en algún momento se quiere sin dependencia externa, se
descarga el `woff2` a `assets/fonts/` y se reemplaza el `<link>` por un
`@font-face`.
