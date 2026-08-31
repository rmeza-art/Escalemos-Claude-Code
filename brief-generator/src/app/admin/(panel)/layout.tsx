import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getAdmin } from '@/lib/auth';
import { demoMode } from '@/lib/config';

import { cerrarSesion } from '../acciones';

export const dynamic = 'force-dynamic';

const NAV = [
  { href: '/admin', label: 'Panel' },
  { href: '/admin/clientes', label: 'Clientes' },
  { href: '/admin/preguntas', label: 'Preguntas' },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const sesion = await getAdmin();
  if (!sesion) redirect('/admin/login');

  return (
    <div className="min-h-dvh">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
          <Link href="/admin" className="font-semibold text-ink">
            Generador de Brief
          </Link>

          <nav aria-label="Secciones del panel" className="flex gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded px-3 py-1.5 text-sm font-medium text-body hover:bg-accent-soft hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {demoMode && (
              <span className="etiqueta bg-info-soft text-info" title="Los datos viven en un archivo local">
                Demo
              </span>
            )}
            <span className="hidden text-sm text-muted sm:inline">{sesion.email}</span>
            <form action={cerrarSesion}>
              <button type="submit" className="rounded px-2 py-1 text-sm text-body hover:bg-canvas">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
