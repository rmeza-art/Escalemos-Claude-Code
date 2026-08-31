'use client';

import { useId } from 'react';

import type { AnswerValue, AttachmentRef, Question } from '@/lib/questions/types';
import { CampoArchivo } from './CampoArchivo';

/**
 * Un campo del formulario. Renderiza cualquiera de los tipos de respuesta del
 * motor de preguntas; el formulario no sabe nada de tipos.
 */

interface Props {
  question: Question;
  value: AnswerValue;
  error?: string;
  disabled?: boolean;
  onChange: (value: AnswerValue) => void;
  /** Sólo lo usan las preguntas de archivo. */
  token?: string;
}

export function CampoPregunta({ question, value, error, disabled, onChange, token }: Props) {
  const fieldId = useId();
  const helpId = `${fieldId}-ayuda`;
  const errorId = `${fieldId}-error`;
  const describedBy = [question.help ? helpId : '', error ? errorId : ''].filter(Boolean).join(' ');

  const esGrupo =
    question.type === 'seleccion_unica' ||
    question.type === 'seleccion_multiple' ||
    question.type === 'si_no' ||
    question.type === 'escala_prioridad';

  const etiqueta = (
    <>
      <span className="text-ink">{question.text}</span>
      {question.required ? (
        <span className="ml-1 text-danger" aria-hidden="true">
          *
        </span>
      ) : (
        <span className="ml-2 text-sm font-normal text-muted">(opcional)</span>
      )}
    </>
  );

  const ayuda = question.help ? (
    <p id={helpId} className="mt-1 text-sm text-muted">
      {question.help}
    </p>
  ) : null;

  const mensajeError = error ? (
    <p id={errorId} role="alert" className="mt-2 text-sm font-medium text-danger">
      {error}
    </p>
  ) : null;

  const contenido = (
    <Control
      question={question}
      value={value}
      error={error}
      disabled={disabled}
      onChange={onChange}
      fieldId={fieldId}
      describedBy={describedBy}
      token={token}
    />
  );

  if (esGrupo) {
    return (
      <fieldset className="border-0 p-0" aria-describedby={describedBy || undefined}>
        <legend className="mb-1 block text-base font-medium">{etiqueta}</legend>
        {ayuda}
        <div className="mt-3">{contenido}</div>
        {mensajeError}
      </fieldset>
    );
  }

  return (
    <div>
      <label htmlFor={fieldId} className="mb-1 block text-base font-medium">
        {etiqueta}
      </label>
      {ayuda}
      <div className="mt-2">{contenido}</div>
      {mensajeError}
    </div>
  );
}

interface ControlProps extends Props {
  fieldId: string;
  describedBy: string;
}

function Control({
  question,
  value,
  error,
  disabled,
  onChange,
  fieldId,
  describedBy,
  token,
}: ControlProps) {
  const clase = `campo ${error ? 'campo-error' : ''}`;
  const comunes = {
    id: fieldId,
    disabled,
    'aria-describedby': describedBy || undefined,
    'aria-invalid': error ? (true as const) : undefined,
    className: clase,
  };

  switch (question.type) {
    case 'texto_largo':
      return (
        <textarea
          {...comunes}
          rows={5}
          value={typeof value === 'string' ? value : ''}
          placeholder={question.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'numero':
      return (
        <input
          {...comunes}
          type="text"
          inputMode="numeric"
          value={value === null || value === undefined ? '' : String(value)}
          placeholder={question.placeholder}
          onChange={(e) => {
            const limpio = e.target.value.replace(/[^\d]/g, '');
            onChange(limpio === '' ? null : Number(limpio));
          }}
        />
      );

    case 'url':
      return (
        <input
          {...comunes}
          type="url"
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          value={typeof value === 'string' ? value : ''}
          placeholder={question.placeholder ?? 'https://'}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'fecha':
      return (
        <input
          {...comunes}
          type="date"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'si_no':
      return (
        <div className="grid grid-cols-2 gap-2 sm:max-w-xs">
          {[
            { v: true, label: 'Sí' },
            { v: false, label: 'No' },
          ].map((opcion) => {
            const activo = value === opcion.v;
            return (
              <button
                key={String(opcion.v)}
                type="button"
                disabled={disabled}
                aria-pressed={activo}
                onClick={() => onChange(activo ? null : opcion.v)}
                className={`min-h-12 rounded-md border px-4 py-2.5 font-medium transition-colors ${
                  activo
                    ? 'border-accent bg-accent text-white'
                    : 'border-line-strong bg-surface text-ink hover:border-muted'
                }`}
              >
                {opcion.label}
              </button>
            );
          })}
        </div>
      );

    case 'seleccion_unica':
      return (
        <div className="space-y-2">
          {question.options.map((opcion) => {
            const activo = String(value ?? '') === opcion.value;
            return (
              <label
                key={opcion.value}
                className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-md border px-3.5 py-2.5 transition-colors ${
                  activo
                    ? 'border-accent bg-accent-soft'
                    : 'border-line-strong bg-surface hover:border-muted'
                } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                <input
                  type="radio"
                  name={fieldId}
                  className="size-4 accent-[var(--color-accent)]"
                  checked={activo}
                  disabled={disabled}
                  onChange={() => onChange(opcion.value)}
                />
                <span className={activo ? 'font-medium text-ink' : 'text-body'}>{opcion.label}</span>
              </label>
            );
          })}
        </div>
      );

    case 'seleccion_multiple': {
      const seleccionadas = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="space-y-2">
          {question.options.map((opcion) => {
            const activo = seleccionadas.includes(opcion.value);
            return (
              <label
                key={opcion.value}
                className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-md border px-3.5 py-2.5 transition-colors ${
                  activo
                    ? 'border-accent bg-accent-soft'
                    : 'border-line-strong bg-surface hover:border-muted'
                } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                <input
                  type="checkbox"
                  className="size-4 rounded accent-[var(--color-accent)]"
                  checked={activo}
                  disabled={disabled}
                  onChange={() =>
                    onChange(
                      activo
                        ? seleccionadas.filter((v) => v !== opcion.value)
                        : [...seleccionadas, opcion.value],
                    )
                  }
                />
                <span className={activo ? 'font-medium text-ink' : 'text-body'}>{opcion.label}</span>
              </label>
            );
          })}
        </div>
      );
    }

    case 'escala_prioridad':
      return (
        <div
          role="radiogroup"
          aria-describedby={describedBy || undefined}
          className="flex flex-col gap-2 sm:flex-row"
        >
          {question.options.map((opcion) => {
            const activo = String(value ?? '') === opcion.value;
            return (
              <button
                key={opcion.value}
                type="button"
                role="radio"
                aria-checked={activo}
                disabled={disabled}
                onClick={() => onChange(opcion.value)}
                className={`flex min-h-14 flex-1 flex-col items-center justify-center rounded-md border px-2 py-2 transition-colors ${
                  activo
                    ? 'border-accent bg-accent text-white'
                    : 'border-line-strong bg-surface text-body hover:border-muted'
                }`}
              >
                <span className="text-lg font-semibold">{opcion.value}</span>
                <span className="text-center text-xs leading-tight">{opcion.label}</span>
              </button>
            );
          })}
        </div>
      );

    case 'archivo':
      return (
        <CampoArchivo
          questionId={question.id}
          token={token ?? ''}
          value={Array.isArray(value) ? (value as AttachmentRef[]) : []}
          disabled={disabled}
          onChange={onChange}
        />
      );

    case 'texto_corto':
    default: {
      const tipo =
        question.format === 'email' ? 'email' : question.format === 'telefono' ? 'tel' : 'text';
      return (
        <input
          {...comunes}
          type={tipo}
          inputMode={question.format === 'telefono' ? 'tel' : undefined}
          autoComplete={
            question.format === 'email' ? 'email' : question.format === 'telefono' ? 'tel' : undefined
          }
          autoCapitalize={question.format === 'email' ? 'none' : undefined}
          value={typeof value === 'string' ? value : ''}
          placeholder={question.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }
  }
}
