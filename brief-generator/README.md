# Generador de Brief de Clientes

Onboarding de clientes para una agencia de marketing digital. El cliente
responde un formulario que cambia según su rubro; al terminar, la agencia
tiene el brief armado, con lo que falta anotado y las tareas repartidas.

```bash
npm install
cp .env.example .env.local
npm run dev            # http://localhost:3000
```

Sin credenciales de Supabase la app arranca en **modo demo**: los datos van a
`.data/demo.json`, hay tres proyectos de prueba cargados y se entra al panel
con `admin@agencia.cl` / `demo1234`.

## Cómo está armado

**El formulario no está escrito a mano.** Las preguntas son datos
(`src/lib/questions/`) y el formulario las renderiza. Cada pregunta lleva id,
nicho, categoría, enunciado, tipo, si es obligatoria, opciones, condiciones
para mostrarla, ayuda y orden. Agregar un nicho es agregar datos, no
pantallas.

- `catalog-general.ts` — lo que se le pregunta a todos: negocio, servicios,
  público, web, campañas, accesos, leads, archivos.
- `catalog-odontologia.ts` — el paso 4 de odontología. Sólo lo propio del
  rubro: lo que ya pregunta el catálogo general (web actual, cuentas de Meta y
  Google, píxel, material disponible, objetivo a tres meses) no se repite.
- `catalog-nichos.ts` — los otros seis nichos.

El catálogo del código es la **semilla**. Al primer arranque se copia a la
tabla `questions` y desde ahí la fuente de verdad es la base: el panel deja
editar preguntas, crear las de un nicho nuevo y duplicar la plantilla de un
nicho en otro.

**Dos almacenamientos detrás de una interfaz.** `src/lib/store/types.ts` es el
contrato; hay una implementación sobre Supabase y otra sobre un archivo local
para el modo demo. El resto de la app no sabe cuál está corriendo.

**El brief se genera, no se redacta.** `src/lib/brief/generate.ts` arma las
diez secciones leyendo las respuestas. La regla que atraviesa el archivo: no
se inventa nada. No se escriben servicios, beneficios, resultados,
credenciales, promociones, precios ni convenios que el cliente no haya puesto,
y no se proyectan resultados de campaña. Lo que falta sale como falta, y lo
que se dedujo sale como supuesto por validar.

El PDF (`src/lib/brief/pdf.tsx`) se arma en el servidor con las tipografías
base del formato, así que el render no depende de descargar fuentes ni de la
máquina donde corra.

## Los doce pasos

1. Contacto y empresa · 2. Nicho · 3. El negocio · 4. Preguntas del rubro ·
5. Servicios y prioridades · 6. Público y ubicación · 7. Web y landings ·
8. Campañas y contenidos · 9. Cuentas y accesos · 10. Recepción de consultas ·
11. Archivos · 12. Revisión y envío.

Se guarda solo mientras se responde, y el guardado también se dispara al
cambiar de paso y al cerrar la pestaña. El cliente entra por un enlace con
token, sin clave.

## Estados del proyecto

`borrador` → `enviado` → `incompleto` → `recibido` → `en_revision` →
`aprobado`. El paso a `incompleto` y a `recibido` lo hace el sistema; el resto
lo mueve la agencia.

## Conectar Supabase

1. Ejecutar `supabase/schema.sql` completo en el editor SQL del proyecto. Es
   idempotente y crea las tablas, las políticas, los triggers y el bucket.
2. Llenar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y
   `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`.
3. Crear el usuario de la agencia en Authentication → Users.

Las dos tablas quedan con RLS y sin políticas para `anon`: el formulario del
cliente no habla directo con la base, va contra las rutas de la app, que
validan el token y usan la clave de servicio. Así el token del enlace nunca
sirve para leer la tabla completa desde el navegador. Los adjuntos van a un
bucket privado y se sirven sólo con sesión de administrador.

## Resguardos

- No se piden datos clínicos, diagnósticos ni información identificable de
  pacientes. En los nichos de salud el brief lo deja escrito como resguardo.
- Los accesos a plataformas se piden por invitación, nunca escribiendo
  contraseñas en el formulario.
- Las imágenes de tratamientos sin consentimiento firmado quedan marcadas como
  no publicables.

## Comandos

```bash
npm run dev         # desarrollo
npm run build       # build de producción
npm start           # servir el build
npm run typecheck   # tsc --noEmit
```
