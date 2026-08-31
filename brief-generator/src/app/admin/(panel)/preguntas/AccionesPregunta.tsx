'use client';

import { useState, useTransition } from 'react';

import { eliminarPregunta } from '../../acciones';

/** Borrado de una pregunta propia. Las del catálogo base no se borran. */
export function AccionesPregunta({ id, builtIn }: { id: string; builtIn: boolean }) {
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [ocupado, iniciar] = useTransition();

  if (builtIn) {
    return (
      <span className="px-2 py-1 text-sm text-muted" title="Las preguntas del catálogo base no se borran">
        Base
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        disabled={ocupado}
        className="rounded px-2 py-1 text-sm text-danger hover:bg-danger/5"
        onClick={() => {
          if (!confirm('¿Eliminar esta pregunta? Las respuestas ya guardadas dejan de mostrarse.')) return;
          iniciar(async () => {
            const salida = await eliminarPregunta(id);
            if (!salida.ok) setMensaje(salida.mensaje ?? 'No se pudo eliminar.');
          });
        }}
      >
        Eliminar
      </button>
      {mensaje && (
        <span role="alert" className="text-sm text-danger">
          {mensaje}
        </span>
      )}
    </>
  );
}
