'use client';

import { STEPS, TOTAL_STEPS } from '@/lib/questions/engine';

/** Barra de progreso y ubicación dentro de los doce pasos. */
export function IndicadorProgreso({
  paso,
  porcentaje,
  pasosCompletos,
  onIr,
}: {
  paso: number;
  porcentaje: number;
  pasosCompletos: Set<number>;
  onIr: (paso: number) => void;
}) {
  const actual = STEPS.find((s) => s.number === paso);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-muted">
          Paso {paso} de {TOTAL_STEPS}
        </p>
        <p className="text-sm text-muted">
          <span className="font-semibold text-accent">{porcentaje}%</span> completado
        </p>
      </div>

      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuenow={porcentaje}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Avance del formulario"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300"
          style={{ width: `${porcentaje}%` }}
        />
      </div>

      {/* Pasos como puntos: en móvil sólo se ven, en escritorio se puede saltar. */}
      <ol className="mt-3 flex flex-wrap gap-1.5">
        {STEPS.map((step) => {
          const esActual = step.number === paso;
          const completo = pasosCompletos.has(step.number);
          return (
            <li key={step.number}>
              <button
                type="button"
                onClick={() => onIr(step.number)}
                aria-current={esActual ? 'step' : undefined}
                title={`Paso ${step.number}: ${step.title}`}
                className={`flex size-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                  esActual
                    ? 'border-accent bg-accent text-white'
                    : completo
                      ? 'border-good/40 bg-good-soft text-good'
                      : 'border-line-strong bg-surface text-muted hover:border-muted'
                }`}
              >
                <span className="sr-only">
                  Ir al paso {step.number}: {step.title}
                </span>
                <span aria-hidden="true">{completo && !esActual ? '✓' : step.number}</span>
              </button>
            </li>
          );
        })}
      </ol>

      {actual && <p className="sr-only">Sección actual: {actual.title}</p>}
    </div>
  );
}
