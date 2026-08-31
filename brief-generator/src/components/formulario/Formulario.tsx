'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { CampoPregunta } from '@/components/CampoPregunta';
import {
  computeProgress,
  getStep,
  questionsForStep,
  TOTAL_STEPS,
  validateStep,
  type StepErrors,
} from '@/lib/questions/engine';
import type { Answers, AnswerValue, NicheId, Question } from '@/lib/questions/types';

import { IndicadorProgreso } from './IndicadorProgreso';
import { PasoRevision } from './PasoRevision';
import { SelectorNicho } from './SelectorNicho';

type EstadoGuardado = 'inactivo' | 'guardando' | 'guardado' | 'error';

const AUTOGUARDADO_MS = 1200;

export function Formulario({
  token,
  questions,
  answersIniciales,
  nicheInicial,
  pasoInicial,
  empresa,
}: {
  token: string;
  questions: Question[];
  answersIniciales: Answers;
  nicheInicial: NicheId | null;
  pasoInicial: number;
  empresa: string;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>(answersIniciales);
  const [niche, setNiche] = useState<NicheId | null>(nicheInicial);
  const [paso, setPaso] = useState(pasoInicial);
  const [errores, setErrores] = useState<StepErrors>({});
  const [estado, setEstado] = useState<EstadoGuardado>('inactivo');
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  /** Lo que todavía no se ha mandado al servidor. */
  const pendientes = useRef<Record<string, AnswerValue>>({});
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contenido = useRef<HTMLDivElement>(null);

  const step = getStep(paso);
  const progreso = useMemo(
    () => computeProgress(questions, niche, answers),
    [questions, niche, answers],
  );
  const preguntasDelPaso = useMemo(
    () => (step ? questionsForStep(questions, niche, step, answers) : []),
    [questions, niche, step, answers],
  );

  const pasosCompletos = useMemo(() => {
    const pendientesSet = new Set(progreso.incompleteSteps);
    const completos = new Set<number>();
    for (let n = 1; n <= TOTAL_STEPS; n++) {
      if (n < paso && !pendientesSet.has(n)) completos.add(n);
    }
    return completos;
  }, [progreso.incompleteSteps, paso]);

  // ── Guardado ──────────────────────────────────────────────

  const guardar = useCallback(
    async (nicheParaGuardar: NicheId | null) => {
      const carga = pendientes.current;
      pendientes.current = {};
      if (Object.keys(carga).length === 0 && nicheParaGuardar === nicheInicial) return;

      setEstado('guardando');
      try {
        const respuesta = await fetch(`/api/formulario/${token}/guardar`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ respuestas: carga, nicho: nicheParaGuardar }),
        });
        if (!respuesta.ok) throw new Error('guardado fallido');
        setEstado('guardado');
      } catch {
        // Se devuelven los cambios a la cola para reintentar en el próximo guardado.
        pendientes.current = { ...carga, ...pendientes.current };
        setEstado('error');
      }
    },
    [token, nicheInicial],
  );

  const programarGuardado = useCallback(
    (nicheActual: NicheId | null) => {
      if (temporizador.current) clearTimeout(temporizador.current);
      temporizador.current = setTimeout(() => void guardar(nicheActual), AUTOGUARDADO_MS);
    },
    [guardar],
  );

  const responder = useCallback(
    (question: Question, valor: AnswerValue) => {
      setAnswers((previas) => ({ ...previas, [question.id]: valor }));
      pendientes.current[question.id] = valor;
      setErrores((previos) => {
        if (!previos[question.id]) return previos;
        const copia = { ...previos };
        delete copia[question.id];
        return copia;
      });
      programarGuardado(niche);
    },
    [niche, programarGuardado],
  );

  const elegirNicho = useCallback(
    (nuevo: NicheId) => {
      setNiche(nuevo);
      programarGuardado(nuevo);
    },
    [programarGuardado],
  );

  // Guardar antes de que se vaya la pestaña.
  useEffect(() => {
    function alSalir() {
      if (Object.keys(pendientes.current).length === 0) return;
      navigator.sendBeacon?.(
        `/api/formulario/${token}/guardar`,
        new Blob([JSON.stringify({ respuestas: pendientes.current, nicho: niche })], {
          type: 'application/json',
        }),
      );
    }
    window.addEventListener('pagehide', alSalir);
    return () => window.removeEventListener('pagehide', alSalir);
  }, [token, niche]);

  // ── Navegación ────────────────────────────────────────────

  const irA = useCallback(
    async (destino: number) => {
      if (temporizador.current) clearTimeout(temporizador.current);
      await guardar(niche);
      const objetivo = Math.min(Math.max(destino, 1), TOTAL_STEPS);
      setPaso(objetivo);
      setErrores({});
      setErrorEnvio(null);
      window.history.replaceState(null, '', `?paso=${objetivo}`);
      contenido.current?.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [guardar, niche],
  );

  async function continuar() {
    if (step?.kind === 'nicho') {
      if (!niche) {
        setErrorEnvio('Elige el rubro para continuar.');
        return;
      }
      await irA(paso + 1);
      return;
    }

    const problemas = validateStep(preguntasDelPaso, answers);
    if (Object.keys(problemas).length > 0) {
      setErrores(problemas);
      setErrorEnvio(
        `Revisa ${Object.keys(problemas).length === 1 ? 'la pregunta marcada' : 'las preguntas marcadas'} antes de seguir.`,
      );
      // Lleva el foco al primer campo con problema.
      const primero = preguntasDelPaso.find((q) => problemas[q.id]);
      if (primero) {
        document
          .querySelector(`[data-pregunta="${primero.id}"]`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    await irA(paso + 1);
  }

  async function enviar() {
    setEnviando(true);
    setErrorEnvio(null);
    if (temporizador.current) clearTimeout(temporizador.current);
    await guardar(niche);

    try {
      const respuesta = await fetch(`/api/formulario/${token}/enviar`, { method: 'POST' });
      const datos = (await respuesta.json()) as { error?: string; pasos?: number[] };
      if (!respuesta.ok) {
        setErrorEnvio(
          datos.error ??
            'No se pudo enviar el formulario. Revisa tu conexión e inténtalo de nuevo.',
        );
        setEnviando(false);
        return;
      }
      router.push(`/f/${token}/gracias`);
    } catch {
      setErrorEnvio('No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.');
      setEnviando(false);
    }
  }

  // ── Render ────────────────────────────────────────────────

  const esRevision = step?.kind === 'revision';
  const faltanObligatorias = progreso.missingRequired.length;

  return (
    <div className="min-h-dvh bg-canvas pb-32">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="truncate text-sm font-semibold text-ink">{empresa}</p>
            <EstadoGuardadoTexto estado={estado} />
          </div>
          <IndicadorProgreso
            paso={paso}
            porcentaje={progreso.percent}
            pasosCompletos={pasosCompletos}
            onIr={(n) => void irA(n)}
          />
        </div>
      </header>

      <main
        ref={contenido}
        tabIndex={-1}
        className="mx-auto max-w-3xl px-4 py-6 outline-none sm:px-6 sm:py-8"
      >
        <h1 className="text-2xl font-semibold sm:text-3xl">{step?.title}</h1>
        <p className="mt-2 text-muted">{descripcionPaso(paso)}</p>

        <div className="mt-6 space-y-7">
          {step?.kind === 'nicho' && <SelectorNicho valor={niche} onChange={elegirNicho} />}

          {step?.kind === 'preguntas' &&
            (preguntasDelPaso.length === 0 ? (
              <p className="rounded-lg border border-line bg-surface p-4 text-muted">
                {niche === null
                  ? 'Elige primero el rubro de tu negocio en el paso 2.'
                  : 'No hay preguntas en esta sección para tu rubro. Puedes continuar.'}
              </p>
            ) : (
              preguntasDelPaso.map((question) => (
                <div key={question.id} data-pregunta={question.id}>
                  <CampoPregunta
                    question={question}
                    value={answers[question.id] ?? null}
                    error={errores[question.id]}
                    token={token}
                    onChange={(valor) => responder(question, valor)}
                  />
                </div>
              ))
            ))}

          {esRevision && (
            <PasoRevision
              questions={questions}
              niche={niche}
              answers={answers}
              onIr={(n) => void irA(n)}
            />
          )}
        </div>

        {errorEnvio && (
          <p
            role="alert"
            className="mt-6 rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-danger"
          >
            {errorEnvio}
          </p>
        )}
      </main>

      {/* Navegación fija: en el celular queda siempre a mano. */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            className="btn btn-secundario"
            disabled={paso === 1}
            onClick={() => void irA(paso - 1)}
          >
            Atrás
          </button>

          {esRevision ? (
            <button
              type="button"
              className="btn btn-primario flex-1"
              disabled={enviando || faltanObligatorias > 0 || niche === null}
              onClick={() => void enviar()}
            >
              {enviando ? 'Enviando…' : 'Enviar formulario'}
            </button>
          ) : (
            <button type="button" className="btn btn-primario flex-1" onClick={() => void continuar()}>
              Continuar
            </button>
          )}
        </div>

        {esRevision && faltanObligatorias > 0 && (
          <p className="border-t border-line bg-warn-soft px-4 py-2 text-center text-sm text-warn">
            Faltan {faltanObligatorias} respuestas obligatorias. Están marcadas más arriba.
          </p>
        )}
      </nav>
    </div>
  );
}

function EstadoGuardadoTexto({ estado }: { estado: EstadoGuardado }) {
  const texto =
    estado === 'guardando'
      ? 'Guardando…'
      : estado === 'guardado'
        ? 'Guardado'
        : estado === 'error'
          ? 'No se pudo guardar'
          : 'Se guarda solo';

  return (
    <p
      aria-live="polite"
      className={`shrink-0 text-xs font-medium ${
        estado === 'error' ? 'text-danger' : estado === 'guardado' ? 'text-good' : 'text-muted'
      }`}
    >
      {texto}
    </p>
  );
}

function descripcionPaso(paso: number): string {
  const textos: Record<number, string> = {
    1: 'Para saber con quién hablamos y cómo ubicarte.',
    2: 'Según lo que elijas, cambian las preguntas del paso 4.',
    3: 'Lo básico de tu negocio, en tus palabras.',
    4: 'Preguntas hechas para tu rubro.',
    5: 'Qué vendes y qué te urge vender ahora.',
    6: 'A quién le hablamos y dónde está.',
    7: 'Qué hay hoy en internet y en qué estado está.',
    8: 'Qué se ha hecho antes y con qué material contamos.',
    9: 'Qué cuentas existen y quién puede dar los accesos.',
    10: 'Qué pasa cuando alguien te escribe.',
    11: 'Sube lo que tengas. Si falta algo, no te preocupes: se anota como pendiente.',
    12: 'Revisa tus respuestas y envía.',
  };
  return textos[paso] ?? '';
}
