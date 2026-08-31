'use client';

import { useState, useTransition } from 'react';

import { PROJECT_STATUSES, type Client, type ProjectStatus } from '@/lib/types';

import {
  cambiarEstado,
  eliminarCliente,
  guardarNotasInternas,
  marcarComoEnviado,
  reabrirFormulario,
  regenerarEnlace,
  type AccionResultado,
} from '../../../acciones';

/** Estado del proyecto, enlace del cliente, notas internas y borrado. */
export function PanelAjustes({ client, enlace }: { client: Client; enlace: string }) {
  const [estado, setEstado] = useState<ProjectStatus>(client.status);
  const [notas, setNotas] = useState(client.internalNotes);
  const [mensaje, setMensaje] = useState<AccionResultado | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [ocupado, iniciar] = useTransition();

  function ejecutar(accion: () => Promise<AccionResultado>) {
    iniciar(async () => setMensaje(await accion()));
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(enlace);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setMensaje({ ok: false, mensaje: 'No se pudo copiar. Selecciona el enlace y cópialo a mano.' });
    }
  }

  return (
    <div className="space-y-5">
      <section className="tarjeta p-5">
        <h3 className="font-semibold text-ink">Estado del proyecto</h3>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label htmlFor="estado-proyecto" className="sr-only">
            Estado del proyecto
          </label>
          <select
            id="estado-proyecto"
            className="campo sm:w-64"
            value={estado}
            disabled={ocupado}
            onChange={(e) => {
              const nuevo = e.target.value as ProjectStatus;
              setEstado(nuevo);
              ejecutar(() => cambiarEstado(client.id, nuevo));
            }}
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <p className="text-sm text-muted">
            {PROJECT_STATUSES.find((s) => s.id === estado)?.description}
          </p>
        </div>
      </section>

      <section className="tarjeta p-5">
        <h3 className="font-semibold text-ink">Enlace del cliente</h3>
        <p className="mt-1 text-sm text-muted">
          Este enlace da acceso al formulario sin clave. Compártelo sólo con el cliente.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            readOnly
            value={enlace}
            aria-label="Enlace del formulario"
            className="campo min-w-0 flex-1 font-mono text-sm"
            onFocus={(e) => e.currentTarget.select()}
          />
          <button type="button" className="btn btn-secundario" onClick={() => void copiar()}>
            {copiado ? 'Copiado' : 'Copiar'}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {client.status === 'borrador' && (
            <button
              type="button"
              className="btn btn-secundario"
              disabled={ocupado}
              onClick={() => ejecutar(() => marcarComoEnviado(client.id))}
            >
              Marcar como enviado
            </button>
          )}
          <button
            type="button"
            className="btn btn-secundario"
            disabled={ocupado}
            onClick={() => ejecutar(() => regenerarEnlace(client.id))}
          >
            Generar enlace nuevo
          </button>
          {client.submittedAt && (
            <button
              type="button"
              className="btn btn-secundario"
              disabled={ocupado}
              onClick={() => ejecutar(() => reabrirFormulario(client.id))}
            >
              Reabrir formulario
            </button>
          )}
        </div>
      </section>

      <section className="tarjeta p-5">
        <label htmlFor="notas-internas" className="block font-semibold text-ink">
          Notas internas
        </label>
        <p className="mt-1 text-sm text-muted">El cliente no las ve.</p>
        <textarea
          id="notas-internas"
          rows={5}
          className="campo mt-2"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-secundario mt-3"
          disabled={ocupado}
          onClick={() => ejecutar(() => guardarNotasInternas(client.id, notas))}
        >
          Guardar notas
        </button>
      </section>

      {mensaje && (
        <p
          role="status"
          className={`text-sm font-medium ${mensaje.ok ? 'text-good' : 'text-danger'}`}
        >
          {mensaje.mensaje}
        </p>
      )}

      <section className="tarjeta border-danger/30 p-5">
        <h3 className="font-semibold text-danger">Eliminar proyecto</h3>
        <p className="mt-1 text-sm">
          Se borran las respuestas y los archivos adjuntos. No se puede deshacer.
        </p>
        <form
          className="mt-3"
          action={async () => {
            await eliminarCliente(client.id);
          }}
          onSubmit={(e) => {
            if (!confirm(`¿Eliminar el proyecto de ${client.company}? No se puede deshacer.`)) {
              e.preventDefault();
            }
          }}
        >
          <button type="submit" className="btn btn-peligro">
            Eliminar proyecto
          </button>
        </form>
      </section>
    </div>
  );
}
