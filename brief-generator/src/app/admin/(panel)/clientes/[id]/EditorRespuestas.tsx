'use client';

import { useState, useTransition } from 'react';

import { CampoPregunta } from '@/components/CampoPregunta';
import {
  formatAnswer,
  isAnswered,
  isVisible,
  questionsForNiche,
  STEPS,
} from '@/lib/questions/engine';
import { CATEGORIES, type Answers, type AnswerValue, type NicheId, type Question } from '@/lib/questions/types';

import { guardarRespuestasAdmin, type AccionResultado } from '../../../acciones';

/** Vista y edición de las respuestas del cliente, agrupadas por paso. */
export function EditorRespuestas({
  clientId,
  questions,
  niche,
  answersIniciales,
}: {
  clientId: string;
  questions: Question[];
  niche: NicheId | null;
  answersIniciales: Answers;
}) {
  const [answers, setAnswers] = useState<Answers>(answersIniciales);
  const [editando, setEditando] = useState<string | null>(null);
  const [cambios, setCambios] = useState<Record<string, AnswerValue>>({});
  const [resultado, setResultado] = useState<AccionResultado | null>(null);
  const [guardando, iniciarGuardado] = useTransition();

  const visibles = questionsForNiche(questions, niche).filter((q) => isVisible(q, answers));
  const hayCambios = Object.keys(cambios).length > 0;

  function editar(question: Question, valor: AnswerValue) {
    setAnswers((previas) => ({ ...previas, [question.id]: valor }));
    setCambios((previos) => ({ ...previos, [question.id]: valor }));
    setResultado(null);
  }

  function guardar() {
    iniciarGuardado(async () => {
      const salida = await guardarRespuestasAdmin(clientId, JSON.stringify(cambios));
      setResultado(salida);
      if (salida.ok) {
        setCambios({});
        setEditando(null);
      }
    });
  }

  return (
    <div className="space-y-5">
      {niche === null && (
        <p className="rounded-md border border-warn/40 bg-warn-soft px-4 py-3 text-warn">
          El cliente todavía no elige su rubro, así que sólo se ven las preguntas generales.
        </p>
      )}

      {CATEGORIES.map((categoria) => {
        const preguntas = visibles.filter((q) => q.category === categoria.id);
        if (preguntas.length === 0) return null;
        const paso = STEPS.find((s) => s.number === categoria.step);

        return (
          <section key={categoria.id} className="tarjeta">
            <h3 className="border-b border-line px-4 py-3 font-semibold text-ink">
              {categoria.step}. {paso?.title ?? categoria.label}
            </h3>
            <dl className="divide-y divide-line">
              {preguntas.map((question) => {
                const respondida = isAnswered(answers[question.id] ?? null);
                const enEdicion = editando === question.id;

                return (
                  <div key={question.id} className="px-4 py-3">
                    <div className="sm:flex sm:gap-4">
                      <dt className="text-sm text-muted sm:w-2/5 sm:shrink-0">
                        {question.text}
                        {question.required && <span className="ml-1 text-danger">*</span>}
                      </dt>
                      <dd className="mt-1 sm:mt-0 sm:flex-1">
                        {enEdicion ? (
                          <CampoPregunta
                            question={question}
                            value={answers[question.id] ?? null}
                            onChange={(valor) => editar(question, valor)}
                          />
                        ) : (
                          <div className="flex items-start justify-between gap-3">
                            <span
                              className={
                                respondida
                                  ? 'whitespace-pre-line text-ink'
                                  : question.required
                                    ? 'text-sm font-medium text-warn'
                                    : 'text-sm text-muted'
                              }
                            >
                              {respondida
                                ? formatAnswer(question, answers[question.id] ?? null)
                                : question.required
                                  ? 'Falta responder (obligatoria)'
                                  : 'Sin responder'}
                            </span>
                            {question.type !== 'archivo' && (
                              <button
                                type="button"
                                className="shrink-0 rounded px-2 py-1 text-sm text-accent hover:bg-accent-soft"
                                onClick={() => setEditando(question.id)}
                              >
                                Editar
                              </button>
                            )}
                          </div>
                        )}
                      </dd>
                    </div>
                    {enEdicion && (
                      <button
                        type="button"
                        className="mt-2 text-sm text-muted hover:text-ink"
                        onClick={() => setEditando(null)}
                      >
                        Listo
                      </button>
                    )}
                  </div>
                );
              })}
            </dl>
          </section>
        );
      })}

      {/* Barra de guardado: aparece sólo si hay algo por guardar. */}
      {(hayCambios || resultado) && (
        <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 shadow-lg">
          {resultado && (
            <p
              role="status"
              className={`text-sm font-medium ${resultado.ok ? 'text-good' : 'text-danger'}`}
            >
              {resultado.mensaje}
            </p>
          )}
          {hayCambios && (
            <>
              <p className="text-sm text-muted">
                {Object.keys(cambios).length}{' '}
                {Object.keys(cambios).length === 1 ? 'cambio sin guardar' : 'cambios sin guardar'}
              </p>
              <button
                type="button"
                className="btn btn-primario ml-auto"
                disabled={guardando}
                onClick={guardar}
              >
                {guardando ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
