'use client';

import {
  formatAnswer,
  isAnswered,
  questionsForNiche,
  isVisible,
  STEPS,
} from '@/lib/questions/engine';
import { CATEGORIES, type Answers, type NicheId, type Question } from '@/lib/questions/types';
import { nicheLabel } from '@/lib/questions/types';

/** Paso 12: todo lo respondido, agrupado por sección, antes de enviar. */
export function PasoRevision({
  questions,
  niche,
  answers,
  onIr,
}: {
  questions: Question[];
  niche: NicheId | null;
  answers: Answers;
  onIr: (paso: number) => void;
}) {
  const visibles = questionsForNiche(questions, niche).filter((q) => isVisible(q, answers));

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-line bg-accent-soft p-4">
        <h3 className="text-base font-semibold text-ink">Antes de enviar</h3>
        <p className="mt-1 text-sm">
          Revisa que todo esté como quieres. Puedes volver a cualquier sección tocando «Editar».
          Después de enviar, si necesitas cambiar algo, escríbele a la agencia.
        </p>
      </div>

      <dl className="rounded-lg border border-line bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div>
            <dt className="text-sm text-muted">Rubro</dt>
            <dd className="font-medium text-ink">
              {niche ? nicheLabel(niche) : 'Sin elegir'}
            </dd>
          </div>
          <button type="button" className="btn btn-fantasma px-3 py-1.5" onClick={() => onIr(2)}>
            Editar
          </button>
        </div>
      </dl>

      {CATEGORIES.map((categoria) => {
        const preguntas = visibles.filter((q) => q.category === categoria.id);
        if (preguntas.length === 0) return null;
        const paso = STEPS.find((s) => s.number === categoria.step);
        const sinResponder = preguntas.filter((q) => !isAnswered(answers[q.id] ?? null));

        return (
          <section key={categoria.id} className="rounded-lg border border-line bg-surface">
            <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <h3 className="text-base font-semibold text-ink">
                {categoria.step}. {paso?.title ?? categoria.label}
              </h3>
              <button
                type="button"
                className="btn btn-fantasma shrink-0 px-3 py-1.5"
                onClick={() => onIr(categoria.step)}
              >
                Editar
              </button>
            </header>

            <dl className="divide-y divide-line">
              {preguntas.map((question) => {
                const respondida = isAnswered(answers[question.id] ?? null);
                return (
                  <div key={question.id} className="px-4 py-3 sm:flex sm:gap-4">
                    <dt className="text-sm text-muted sm:w-2/5 sm:shrink-0">{question.text}</dt>
                    <dd className="mt-1 sm:mt-0 sm:flex-1">
                      {respondida ? (
                        <span className="whitespace-pre-line text-ink">
                          {formatAnswer(question, answers[question.id] ?? null)}
                        </span>
                      ) : (
                        <span
                          className={`text-sm ${question.required ? 'font-medium text-warn' : 'text-muted'}`}
                        >
                          {question.required ? 'Falta responder (obligatoria)' : 'Sin responder'}
                        </span>
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>

            {sinResponder.some((q) => q.required) && (
              <p className="border-t border-line bg-warn-soft px-4 py-2 text-sm text-warn">
                Esta sección tiene respuestas obligatorias pendientes.
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}
