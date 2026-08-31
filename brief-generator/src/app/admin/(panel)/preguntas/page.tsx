import type { Metadata } from 'next';
import Link from 'next/link';

import { CATEGORIES, NICHES, nicheLabel, categoryLabel, QUESTION_TYPE_LABELS } from '@/lib/questions/types';
import { store } from '@/lib/store';

import { DuplicarPlantilla } from './DuplicarPlantilla';
import { EditorPregunta } from './EditorPregunta';
import { AccionesPregunta } from './AccionesPregunta';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Preguntas · Generador de Brief' };

export default async function PreguntasPage({
  searchParams,
}: {
  searchParams: Promise<{ nicho?: string; editar?: string; nueva?: string }>;
}) {
  const filtros = await searchParams;
  const questions = await store.listQuestions();

  const nichoActivo = filtros.nicho ?? 'general';
  const delNicho = questions
    .filter((q) => q.niche === nichoActivo)
    .sort((a, b) => a.category.localeCompare(b.category) || a.order - b.order);

  const enEdicion = filtros.editar ? questions.find((q) => q.id === filtros.editar) : undefined;
  const creando = filtros.nueva === '1';

  const nichos = [{ id: 'general', label: 'General' }, ...NICHES];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Preguntas</h1>
          <p className="mt-1 max-w-2xl text-muted">
            Las preguntas «General» se le hacen a todos los nichos. Las de un nicho aparecen en el
            paso 4 sólo para los clientes de ese rubro.
          </p>
        </div>
        <Link href={`/admin/preguntas?nicho=${nichoActivo}&nueva=1`} className="btn btn-primario">
          Crear pregunta
        </Link>
      </header>

      <nav aria-label="Nichos" className="flex flex-wrap gap-1.5">
        {nichos.map((niche) => {
          const activo = niche.id === nichoActivo;
          const total = questions.filter((q) => q.niche === niche.id).length;
          return (
            <Link
              key={niche.id}
              href={`/admin/preguntas?nicho=${niche.id}`}
              aria-current={activo ? 'page' : undefined}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                activo
                  ? 'border-accent bg-accent text-white'
                  : 'border-line-strong bg-surface text-body hover:border-muted'
              }`}
            >
              {niche.label}
              <span className={`ml-2 tabular-nums ${activo ? 'text-white/70' : 'text-muted'}`}>
                {total}
              </span>
            </Link>
          );
        })}
      </nav>

      {(creando || enEdicion) && (
        <EditorPregunta
          key={enEdicion?.id ?? 'nueva'}
          question={enEdicion}
          nichoPorDefecto={nichoActivo}
          preguntasDisponibles={questions
            .filter((q) => q.niche === 'general' || q.niche === nichoActivo)
            .map((q) => ({ id: q.id, text: q.text }))}
        />
      )}

      {delNicho.length === 0 ? (
        <div className="tarjeta p-8 text-center">
          <p className="text-muted">
            Este nicho todavía no tiene preguntas propias. Puedes crearlas una por una o copiar la
            plantilla de otro nicho.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {CATEGORIES.filter((c) => delNicho.some((q) => q.category === c.id)).map((categoria) => (
            <section key={categoria.id} className="tarjeta">
              <h2 className="border-b border-line px-4 py-3 font-semibold text-ink">
                Paso {categoria.step} · {categoryLabel(categoria.id)}
              </h2>
              <ul className="divide-y divide-line">
                {delNicho
                  .filter((q) => q.category === categoria.id)
                  .map((question) => (
                    <li key={question.id} className="px-4 py-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-ink">
                            {question.text}
                            {question.required && (
                              <span className="ml-1 text-danger" title="Obligatoria">
                                *
                              </span>
                            )}
                          </p>
                          <p className="mt-0.5 text-sm text-muted">
                            <code className="font-mono">{question.id}</code> ·{' '}
                            {QUESTION_TYPE_LABELS[question.type]} · orden {question.order}
                            {question.options.length > 0 && ` · ${question.options.length} opciones`}
                            {question.builtIn && ' · catálogo base'}
                          </p>
                          {question.conditions.length > 0 && (
                            <p className="mt-1 text-sm text-info">
                              Se muestra si «{question.conditions[0].questionId}»{' '}
                              {question.conditions[0].operator}{' '}
                              {question.conditions[0].value ?? ''}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Link
                            href={`/admin/preguntas?nicho=${nichoActivo}&editar=${question.id}`}
                            className="rounded px-2 py-1 text-sm text-accent hover:bg-accent-soft"
                          >
                            Editar
                          </Link>
                          <AccionesPregunta id={question.id} builtIn={Boolean(question.builtIn)} />
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <DuplicarPlantilla nichos={nichos.map((n) => ({ id: n.id, label: nicheLabel(n.id) }))} />
    </div>
  );
}
