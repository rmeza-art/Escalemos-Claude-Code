import type { Metadata } from 'next';
import Link from 'next/link';

import { BarraAvance } from '@/components/BarraAvance';
import { EstadoEtiqueta } from '@/components/EstadoEtiqueta';
import { cargarResumen, tiempoRelativo } from '@/lib/panel';
import { NICHES, nicheLabel } from '@/lib/questions/types';
import { PROJECT_STATUSES } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Clientes · Generador de Brief' };

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string; nicho?: string }>;
}) {
  const filtros = await searchParams;
  const busqueda = (filtros.q ?? '').trim().toLowerCase();
  const { clientes } = await cargarResumen();

  const filtrados = clientes.filter(({ client, nombre }) => {
    if (filtros.estado && client.status !== filtros.estado) return false;
    if (filtros.nicho && (client.niche ?? '') !== filtros.nicho) return false;
    if (!busqueda) return true;
    return [nombre, client.company, client.contactName, client.email, client.phone]
      .join(' ')
      .toLowerCase()
      .includes(busqueda);
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Clientes</h1>
          <p className="mt-1 text-muted">
            {filtrados.length} de {clientes.length}{' '}
            {clientes.length === 1 ? 'proyecto' : 'proyectos'}
          </p>
        </div>
        <Link href="/admin/clientes/nuevo" className="btn btn-primario">
          Crear cliente
        </Link>
      </header>

      {/* Buscador y filtros: un GET simple, así el filtro queda en la URL. */}
      <form method="get" className="tarjeta flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-52 flex-1">
          <label htmlFor="q" className="mb-1 block text-sm font-medium text-ink">
            Buscar
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={filtros.q ?? ''}
            placeholder="Empresa, contacto o correo"
            className="campo"
          />
        </div>

        <div>
          <label htmlFor="estado" className="mb-1 block text-sm font-medium text-ink">
            Estado
          </label>
          <select id="estado" name="estado" defaultValue={filtros.estado ?? ''} className="campo">
            <option value="">Todos</option>
            {PROJECT_STATUSES.map((estado) => (
              <option key={estado.id} value={estado.id}>
                {estado.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="nicho" className="mb-1 block text-sm font-medium text-ink">
            Nicho
          </label>
          <select id="nicho" name="nicho" defaultValue={filtros.nicho ?? ''} className="campo">
            <option value="">Todos</option>
            {NICHES.map((niche) => (
              <option key={niche.id} value={niche.id}>
                {niche.label}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-secundario">
          Filtrar
        </button>
        {(filtros.q || filtros.estado || filtros.nicho) && (
          <Link href="/admin/clientes" className="btn btn-fantasma">
            Limpiar
          </Link>
        )}
      </form>

      {filtrados.length === 0 ? (
        <p className="tarjeta px-4 py-10 text-center text-muted">
          No hay proyectos que coincidan con estos filtros.
        </p>
      ) : (
        <>
          {/* Escritorio: tabla. */}
          <div className="tarjeta hidden overflow-x-auto md:block">
            <table className="w-full text-left">
              <thead className="border-b border-line text-sm text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Cliente</th>
                  <th scope="col" className="px-4 py-3 font-medium">Nicho</th>
                  <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                  <th scope="col" className="px-4 py-3 font-medium">Completado</th>
                  <th scope="col" className="px-4 py-3 font-medium">Última actividad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtrados.map(({ client, nombre, porcentaje, faltanObligatorias }) => (
                  <tr key={client.id} className="hover:bg-canvas">
                    <td className="px-4 py-3">
                      <Link href={`/admin/clientes/${client.id}`} className="font-medium text-ink hover:text-accent">
                        {nombre}
                      </Link>
                      <p className="text-sm text-muted">{client.contactName} · {client.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {client.niche ? nicheLabel(client.niche) : <span className="text-muted">Sin elegir</span>}
                    </td>
                    <td className="px-4 py-3">
                      <EstadoEtiqueta estado={client.status} />
                    </td>
                    <td className="px-4 py-3">
                      <BarraAvance porcentaje={porcentaje} />
                      {faltanObligatorias > 0 && (
                        <p className="mt-1 text-xs text-warn">
                          {faltanObligatorias} obligatorias pendientes
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">
                      {tiempoRelativo(client.lastActivityAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Móvil: tarjetas. */}
          <ul className="space-y-3 md:hidden">
            {filtrados.map(({ client, nombre, porcentaje, faltanObligatorias }) => (
              <li key={client.id} className="tarjeta p-4">
                <Link href={`/admin/clientes/${client.id}`} className="block">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-medium text-ink">{nombre}</span>
                    <EstadoEtiqueta estado={client.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {client.niche ? nicheLabel(client.niche) : 'Sin rubro'} ·{' '}
                    {tiempoRelativo(client.lastActivityAt)}
                  </p>
                  <div className="mt-3">
                    <BarraAvance porcentaje={porcentaje} />
                  </div>
                  {faltanObligatorias > 0 && (
                    <p className="mt-1 text-xs text-warn">
                      {faltanObligatorias} obligatorias pendientes
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
