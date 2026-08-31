'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';

import {
  CATEGORIES,
  NICHES,
  QUESTION_TYPES,
  QUESTION_TYPE_LABELS,
  type Question,
} from '@/lib/questions/types';

import { guardarPregunta, type AccionResultado } from '../../acciones';

const CON_OPCIONES = new Set(['seleccion_unica', 'seleccion_multiple', 'escala_prioridad']);

/** Alta y edición de preguntas, incluidas las de nichos nuevos. */
export function EditorPregunta({
  question,
  nichoPorDefecto,
  preguntasDisponibles,
}: {
  question?: Question;
  nichoPorDefecto: string;
  preguntasDisponibles: { id: string; text: string }[];
}) {
  const [estado, accion] = useActionState<AccionResultado | null, FormData>(guardarPregunta, null);
  const [tipo, setTipo] = useState(question?.type ?? 'texto_corto');
  const [conCondicion, setConCondicion] = useState((question?.conditions.length ?? 0) > 0);
  const condicion = question?.conditions[0];

  return (
    <form action={accion} className="tarjeta space-y-5 p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">
          {question ? `Editar «${question.text.slice(0, 50)}»` : 'Nueva pregunta'}
        </h2>
        <Link href={`/admin/preguntas?nicho=${nichoPorDefecto}`} className="btn btn-fantasma">
          Cerrar
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="id" className="mb-1 block font-medium text-ink">
            Identificador
          </label>
          <input
            id="id"
            name="id"
            required
            readOnly={Boolean(question)}
            defaultValue={question?.id ?? ''}
            placeholder="odo_nueva_pregunta"
            className="campo font-mono"
            pattern="[a-z][a-z0-9_]{2,59}"
          />
          <p className="mt-1 text-sm text-muted">
            Minúsculas, números y guion bajo. No se puede cambiar después.
          </p>
        </div>

        <div>
          <label htmlFor="order" className="mb-1 block font-medium text-ink">
            Orden
          </label>
          <input
            id="order"
            name="order"
            type="number"
            min={0}
            defaultValue={question?.order ?? 100}
            className="campo"
          />
        </div>

        <div>
          <label htmlFor="niche" className="mb-1 block font-medium text-ink">
            Nicho
          </label>
          <select
            id="niche"
            name="niche"
            defaultValue={question?.niche ?? nichoPorDefecto}
            className="campo"
          >
            <option value="general">General (todos los nichos)</option>
            {NICHES.map((niche) => (
              <option key={niche.id} value={niche.id}>
                {niche.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="category" className="mb-1 block font-medium text-ink">
            Categoría (paso)
          </label>
          <select
            id="category"
            name="category"
            defaultValue={question?.category ?? 'especifico'}
            className="campo"
          >
            {CATEGORIES.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                Paso {categoria.step} · {categoria.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="text" className="mb-1 block font-medium text-ink">
          Enunciado
        </label>
        <textarea id="text" name="text" required rows={2} defaultValue={question?.text} className="campo" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="type" className="mb-1 block font-medium text-ink">
            Tipo de respuesta
          </label>
          <select
            id="type"
            name="type"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as Question['type'])}
            className="campo"
          >
            {QUESTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {QUESTION_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <label className="flex min-h-11 cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              name="required"
              defaultChecked={question?.required}
              className="size-4 accent-[var(--color-accent)]"
            />
            <span className="font-medium text-ink">Obligatoria</span>
          </label>
        </div>
      </div>

      {CON_OPCIONES.has(tipo) && (
        <div>
          <label htmlFor="options" className="mb-1 block font-medium text-ink">
            Opciones
          </label>
          <textarea
            id="options"
            name="options"
            rows={5}
            className="campo font-mono text-sm"
            defaultValue={question?.options.map((o) => `${o.label}|${o.value}`).join('\n')}
            placeholder={'Etiqueta visible|valor_guardado\nOtra opción|otra'}
          />
          <p className="mt-1 text-sm text-muted">
            Una por línea. El valor después de la barra es opcional: si falta, se genera desde la
            etiqueta.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="help" className="mb-1 block font-medium text-ink">
            Texto de ayuda
          </label>
          <textarea id="help" name="help" rows={2} defaultValue={question?.help} className="campo" />
        </div>
        <div>
          <label htmlFor="placeholder" className="mb-1 block font-medium text-ink">
            Texto de ejemplo dentro del campo
          </label>
          <input
            id="placeholder"
            name="placeholder"
            defaultValue={question?.placeholder}
            className="campo"
          />
        </div>
      </div>

      <fieldset className="rounded-md border border-line p-4">
        <legend className="px-1 font-medium text-ink">Mostrar sólo si…</legend>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={conCondicion}
            onChange={(e) => setConCondicion(e.target.checked)}
            className="size-4 accent-[var(--color-accent)]"
          />
          <span>Esta pregunta depende de otra respuesta</span>
        </label>

        {conCondicion && (
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="condQuestion" className="mb-1 block text-sm font-medium text-ink">
                Pregunta
              </label>
              <select
                id="condQuestion"
                name="condQuestion"
                defaultValue={condicion?.questionId ?? ''}
                className="campo"
              >
                <option value="">—</option>
                {preguntasDisponibles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.text.slice(0, 60)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="condOperator" className="mb-1 block text-sm font-medium text-ink">
                Condición
              </label>
              <select
                id="condOperator"
                name="condOperator"
                defaultValue={condicion?.operator ?? 'igual'}
                className="campo"
              >
                <option value="igual">es igual a</option>
                <option value="distinto">es distinta de</option>
                <option value="contiene">contiene</option>
                <option value="respondida">está respondida</option>
              </select>
            </div>
            <div>
              <label htmlFor="condValue" className="mb-1 block text-sm font-medium text-ink">
                Valor
              </label>
              <input
                id="condValue"
                name="condValue"
                defaultValue={condicion?.value ?? ''}
                placeholder="true"
                className="campo"
              />
            </div>
          </div>
        )}
      </fieldset>

      {estado?.mensaje && (
        <p
          role="status"
          className={`text-sm font-medium ${estado.ok ? 'text-good' : 'text-danger'}`}
        >
          {estado.mensaje}
        </p>
      )}

      <BotonGuardar nueva={!question} />
    </form>
  );
}

function BotonGuardar({ nueva }: { nueva: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primario" disabled={pending}>
      {pending ? 'Guardando…' : nueva ? 'Crear pregunta' : 'Guardar cambios'}
    </button>
  );
}
