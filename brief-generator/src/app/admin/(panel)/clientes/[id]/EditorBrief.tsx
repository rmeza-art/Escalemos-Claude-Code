'use client';

import { useState, useTransition } from 'react';

import type { Brief } from '@/lib/brief/types';

import { guardarBrief, type AccionResultado } from '../../../acciones';

/**
 * Editor del brief: la agencia puede reescribir el cuerpo de una sección y
 * dejar notas internas. Lo que no se toca sigue generándose desde las
 * respuestas del cliente.
 */
export function EditorBrief({
  clientId,
  brief,
  seccionesIniciales,
  notasIniciales,
}: {
  clientId: string;
  brief: Brief;
  seccionesIniciales: Record<string, string>;
  notasIniciales: string;
}) {
  const [secciones, setSecciones] = useState<Record<string, string>>(seccionesIniciales);
  const [notas, setNotas] = useState(notasIniciales);
  const [resultado, setResultado] = useState<AccionResultado | null>(null);
  const [guardando, iniciarGuardado] = useTransition();

  function guardar() {
    iniciarGuardado(async () => {
      const limpias = Object.fromEntries(
        Object.entries(secciones).filter(([, texto]) => texto.trim().length > 0),
      );
      setResultado(await guardarBrief(clientId, JSON.stringify(limpias), notas));
    });
  }

  return (
    <div className="space-y-5">
      <p className="rounded-md border-l-4 border-accent bg-accent-soft px-4 py-3 text-sm">
        Si escribes texto en una sección, reemplaza lo generado automáticamente y queda marcada como
        editada. Deja el campo vacío para volver al texto generado desde las respuestas.
      </p>

      {brief.sections.map((section) => (
        <section key={section.id} className="tarjeta p-4">
          <label htmlFor={`sec-${section.id}`} className="block font-semibold text-ink">
            {section.number}. {section.title}
          </label>
          <p className="mt-0.5 text-sm text-muted">
            {secciones[section.id]?.trim()
              ? 'Editada por la agencia.'
              : 'Se genera desde las respuestas.'}
          </p>
          <textarea
            id={`sec-${section.id}`}
            rows={4}
            className="campo mt-2"
            placeholder="Dejar vacío para usar el texto generado"
            value={secciones[section.id] ?? ''}
            onChange={(e) => {
              setSecciones((previas) => ({ ...previas, [section.id]: e.target.value }));
              setResultado(null);
            }}
          />
        </section>
      ))}

      <section className="tarjeta p-4">
        <label htmlFor="notas-agencia" className="block font-semibold text-ink">
          Notas internas de la agencia
        </label>
        <p className="mt-0.5 text-sm text-muted">
          Se imprimen al final del PDF. El cliente no las ve en el formulario.
        </p>
        <textarea
          id="notas-agencia"
          rows={5}
          className="campo mt-2"
          value={notas}
          onChange={(e) => {
            setNotas(e.target.value);
            setResultado(null);
          }}
        />
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-primario" disabled={guardando} onClick={guardar}>
          {guardando ? 'Guardando…' : 'Guardar brief'}
        </button>
        {resultado && (
          <p
            role="status"
            className={`text-sm font-medium ${resultado.ok ? 'text-good' : 'text-danger'}`}
          >
            {resultado.mensaje}
          </p>
        )}
      </div>
    </div>
  );
}
