import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getAdmin } from '@/lib/auth';
import { adminDemoEmail, adminDemoPassword, demoMode } from '@/lib/config';

import { FormularioIngreso } from './FormularioIngreso';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Ingreso · Panel de la agencia' };

export default async function LoginPage() {
  if (await getAdmin()) redirect('/admin');

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-12">
      <div className="tarjeta p-6 sm:p-8">
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">
          Panel de la agencia
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Generador de Brief</h1>
        <p className="mt-2 text-muted">Ingresa con tu cuenta para ver los proyectos.</p>

        <FormularioIngreso />

        {demoMode && (
          <div className="mt-6 rounded-md border border-line bg-canvas p-4 text-sm">
            <p className="font-semibold text-ink">Modo demostración</p>
            <p className="mt-1">
              No hay Supabase configurado, así que los datos viven en un archivo local. Puedes
              entrar con:
            </p>
            <p className="mt-2 font-mono text-xs break-all text-ink">
              {adminDemoEmail} · {adminDemoPassword}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
