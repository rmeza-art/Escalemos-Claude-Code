import type { Metadata } from 'next';
import Link from 'next/link';

import { demoMode } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Generador de Brief de Clientes',
  description:
    'Onboarding de clientes para agencias de marketing digital: preguntas por nicho y brief listo para trabajar.',
};

const PASOS = [
  {
    titulo: 'La agencia crea el cliente',
    texto: 'Se genera un enlace privado y se le manda al cliente por correo o WhatsApp.',
  },
  {
    titulo: 'El cliente responde a su ritmo',
    texto:
      'Doce pasos, una sección por pantalla, pensados para el celular. Se guarda solo: puede cerrar y seguir después.',
  },
  {
    titulo: 'Las preguntas se adaptan al rubro',
    texto:
      'Un cliente de odontología no responde lo mismo que un ecommerce. El paso 4 cambia según el nicho.',
  },
  {
    titulo: 'El brief se arma solo',
    texto:
      'Diez secciones, separando lo confirmado por el cliente de lo que falta, los supuestos y las tareas de cada lado.',
  },
];

const SECCIONES = [
  'Brief ejecutivo',
  'Resumen del negocio',
  'Servicios prioritarios',
  'Público objetivo',
  'Objetivos comerciales',
  'Checklist de accesos digitales',
  'Diagnóstico de información faltante',
  'Estructura para la landing',
  'Plan inicial de captación',
  'PDF descargable',
];

export default function Home() {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <span className="font-semibold text-ink">Generador de Brief</span>
          <Link href="/admin" className="btn btn-secundario">
            Entrar al panel
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
        <section className="max-w-2xl">
          <p className="text-sm font-semibold tracking-wide text-accent uppercase">
            Onboarding de clientes
          </p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
            El brief deja de ser una reunión de dos horas y una planilla que nadie vuelve a abrir.
          </h1>
          <p className="mt-4 text-lg">
            El cliente responde un formulario que se adapta a su rubro. Al terminar, la agencia
            tiene el brief armado, con lo que falta anotado y las tareas repartidas.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/admin" className="btn btn-primario">
              Entrar al panel
            </Link>
          </div>
        </section>

        <section aria-labelledby="como" className="mt-16">
          <h2 id="como" className="text-2xl font-semibold">
            Cómo funciona
          </h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2">
            {PASOS.map((paso, i) => (
              <li key={paso.titulo} className="tarjeta p-5">
                <span className="flex size-8 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent">
                  {i + 1}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{paso.titulo}</h3>
                <p className="mt-1">{paso.texto}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="entrega" className="mt-16">
          <h2 id="entrega" className="text-2xl font-semibold">
            Qué entrega el sistema
          </h2>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {SECCIONES.map((seccion, i) => (
              <li key={seccion} className="flex items-baseline gap-3 rounded-md border border-line bg-surface px-4 py-3">
                <span className="text-sm font-semibold text-muted tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-ink">{seccion}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 rounded-lg border-l-4 border-accent bg-accent-soft p-5">
          <h2 className="text-lg font-semibold">Una regla que no se rompe</h2>
          <p className="mt-2 max-w-3xl">
            El brief no inventa nada. No redacta servicios, beneficios, resultados, credenciales,
            promociones, precios ni convenios que el cliente no haya escrito. Lo que falta aparece
            como falta, y los supuestos quedan marcados para validarlos en la reunión.
          </p>
        </section>

        {demoMode && (
          <section className="mt-10 rounded-lg border border-line bg-surface p-5">
            <h2 className="font-semibold text-ink">Modo demostración</h2>
            <p className="mt-1">
              No hay Supabase configurado: los datos se guardan en un archivo local y vienen tres
              proyectos de prueba cargados. Revisa <code className="font-mono">.env.example</code>{' '}
              para conectar Supabase.
            </p>
          </section>
        )}
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto max-w-5xl px-5 py-6 text-sm text-muted">
          Generador de Brief de Clientes · Español de Chile
        </div>
      </footer>
    </div>
  );
}
