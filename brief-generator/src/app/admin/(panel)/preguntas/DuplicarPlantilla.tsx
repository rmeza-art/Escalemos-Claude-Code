'use client';

import { useActionState, useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';

import { duplicarPlantilla, restaurarCatalogo, type AccionResultado } from '../../acciones';

/** Copia las preguntas de un nicho a otro para partir de algo ya armado. */
export function DuplicarPlantilla({ nichos }: { nichos: { id: string; label: string }[] }) {
  const [estado, accion] = useActionState<AccionResultado | null, FormData>(
    duplicarPlantilla,
    null,
  );
  const [restauracion, setRestauracion] = useState<AccionResultado | null>(null);
  const [restaurando, iniciar] = useTransition();

  return (
    <section className="tarjeta p-5">
      <h2 className="text-lg font-semibold">Plantillas</h2>
      <p className="mt-1 max-w-2xl text-muted">
        Copia las preguntas de un nicho a otro. Los identificadores se renombran con el prefijo del
        nicho de destino y las que ya existan no se tocan.
      </p>

      <form action={accion} className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="desde" className="mb-1 block text-sm font-medium text-ink">
            Copiar desde
          </label>
          <select id="desde" name="desde" className="campo" defaultValue="odontologia">
            {nichos.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="hacia" className="mb-1 block text-sm font-medium text-ink">
            Hacia
          </label>
          <select id="hacia" name="hacia" className="campo" defaultValue="otro">
            {nichos.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </div>
        <BotonDuplicar />
      </form>

      {estado?.mensaje && (
        <p
          role="status"
          className={`mt-3 text-sm font-medium ${estado.ok ? 'text-good' : 'text-danger'}`}
        >
          {estado.mensaje}
        </p>
      )}

      <hr className="my-5 border-line" />

      <h3 className="font-semibold text-ink">Restaurar el catálogo base</h3>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Repone las preguntas que vienen con el sistema, tal como estaban. Las preguntas creadas por
        la agencia no se tocan.
      </p>
      <button
        type="button"
        className="btn btn-secundario mt-3"
        disabled={restaurando}
        onClick={() => {
          if (!confirm('¿Restaurar el catálogo base? Se pierden los cambios hechos sobre esas preguntas.')) return;
          iniciar(async () => setRestauracion(await restaurarCatalogo()));
        }}
      >
        {restaurando ? 'Restaurando…' : 'Restaurar catálogo base'}
      </button>
      {restauracion?.mensaje && (
        <p role="status" className="mt-2 text-sm font-medium text-good">
          {restauracion.mensaje}
        </p>
      )}
    </section>
  );
}

function BotonDuplicar() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-secundario" disabled={pending}>
      {pending ? 'Copiando…' : 'Copiar plantilla'}
    </button>
  );
}
