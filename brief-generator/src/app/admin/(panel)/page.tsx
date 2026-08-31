import type { Metadata } from 'next';
import Link from 'next/link';

import { BarraAvance } from '@/components/BarraAvance';
import { EstadoEtiqueta } from '@/components/EstadoEtiqueta';
import { cargarResumen, tiempoRelativo } from '@/lib/panel';
import { nicheLabel } from '@/lib/questions/types';
import { PROJECT_STATUSES } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Panel · Generador de Brief' };

export default async function DashboardPage() {
  const { clientes } = await cargarResumen();

  const porEstado = PROJECT_STATUSES.map((estado) => ({
    ...estado,
    total: clientes.filter((c) => c.client.status === estado.id).length,
  }));

  const requierenAtencion = clientes
    .filter(
      (c) =>
        c.client.status === 'recibido' ||
        (c.client.status === 'incompleto' && c.porcentaje > 0) ||
        (c.client.status === 'enviado' &&
          Date.now() - new Date(c.client.lastActivityAt).getTime() > 3 * 86400000),
    )
    .slice(0, 6);

  const recientes = [...clientes]
    .sort((a, b) => b.client.lastActivityAt.localeCompare(a.client.lastActivityAt))
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Panel</h1>
          <p className="mt-1 text-muted">
            {clientes.length === 0
              ? 'Todavía no hay proyectos.'
              : `${clientes.length} ${clientes.length === 1 ? 'proyecto' : 'proyectos'} en total.`}
          </p>
        </div>
        <Link href="/admin/clientes/nuevo" className="btn btn-primario">
          Crear cliente
        </Link>
      </header>

      <section aria-labelledby="estados">
        <h2 id="estados" className="mb-3 text-sm font-semibold tracking-wide text-muted uppercase">
          Por estado
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {porEstado.map((estado) => (
            <Link
              key={estado.id}
              href={`/admin/clientes?estado=${estado.id}`}
              className="tarjeta p-4 transition-colors hover:border-accent"
            >
              <p className="text-3xl font-semibold text-ink tabular-nums">{estado.total}</p>
              <p className="mt-1 text-sm font-medium text-body">{estado.label}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="atencion" className="tarjeta">
          <h2 id="atencion" className="border-b border-line px-4 py-3 font-semibold text-ink">
            Requieren atención
          </h2>
          {requierenAtencion.length === 0 ? (
            <p className="px-4 py-6 text-muted">Nada pendiente por ahora.</p>
          ) : (
            <ul className="divide-y divide-line">
              {requierenAtencion.map(({ client, nombre, porcentaje }) => (
                <li key={client.id}>
                  <Link
                    href={`/admin/clientes/${client.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-canvas"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-ink">{nombre}</span>
                      <span className="text-sm text-muted">
                        {motivo(client.status, porcentaje)} · {tiempoRelativo(client.lastActivityAt)}
                      </span>
                    </span>
                    <EstadoEtiqueta estado={client.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="recientes" className="tarjeta">
          <h2 id="recientes" className="border-b border-line px-4 py-3 font-semibold text-ink">
            Actividad reciente
          </h2>
          {recientes.length === 0 ? (
            <p className="px-4 py-6 text-muted">Sin actividad.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recientes.map(({ client, nombre, porcentaje }) => (
                <li key={client.id}>
                  <Link
                    href={`/admin/clientes/${client.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-canvas"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-ink">{nombre}</span>
                      <span className="text-sm text-muted">
                        {client.niche ? nicheLabel(client.niche) : 'Sin rubro'} ·{' '}
                        {tiempoRelativo(client.lastActivityAt)}
                      </span>
                    </span>
                    <BarraAvance porcentaje={porcentaje} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function motivo(estado: string, porcentaje: number): string {
  if (estado === 'recibido') return 'Enviado, esperando revisión';
  if (estado === 'incompleto') return `Quedó a medias, ${porcentaje}% completado`;
  return 'Enlace enviado sin actividad';
}
