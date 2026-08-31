import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { store } from '@/lib/store';
import { clientDisplayName } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Formulario enviado',
  robots: { index: false, follow: false },
};

export default async function GraciasPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const client = await store.getClientByToken(token);
  if (!client) notFound();

  const enviado = Boolean(client.submittedAt);

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-5 py-12">
      <div className="tarjeta p-6 sm:p-8">
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">
          {enviado ? 'Formulario recibido' : 'Formulario en curso'}
        </p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
          {enviado ? '¡Listo! Ya tenemos tus respuestas.' : 'Todavía no lo has enviado.'}
        </h1>

        {enviado ? (
          <>
            <p className="mt-4">
              Gracias, {client.contactName.split(' ')[0]}. Con esto armamos el brief de{' '}
              <strong className="text-ink">{clientDisplayName(client)}</strong> y te escribimos para
              agendar la reunión de arranque.
            </p>
            <div className="mt-6 rounded-lg border border-line bg-canvas p-4">
              <h2 className="text-base font-semibold text-ink">Qué sigue</h2>
              <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm">
                <li>Revisamos tus respuestas y anotamos lo que falte.</li>
                <li>Te enviamos el brief con los supuestos que necesitamos confirmar.</li>
                <li>Coordinamos la entrega de los accesos a las plataformas.</li>
              </ol>
            </div>
            <p className="mt-6 text-sm text-muted">
              Si necesitas corregir algo, respóndele al correo con el que recibiste este enlace.
            </p>
          </>
        ) : (
          <>
            <p className="mt-4">
              Tus respuestas quedaron guardadas. Puedes seguir cuando quieras desde el mismo enlace.
            </p>
            <a href={`/f/${token}`} className="btn btn-primario mt-6">
              Continuar el formulario
            </a>
          </>
        )}
      </div>
    </main>
  );
}
