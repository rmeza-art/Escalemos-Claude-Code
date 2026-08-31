import {
  CATEGORIES,
  type Answers,
  type AnswerValue,
  type AttachmentRef,
  type CategoryId,
  type NicheId,
  type Question,
} from './types';

/** Un paso del formulario del cliente. */
export interface Step {
  /** 1 a 12. */
  number: number;
  title: string;
  /** Los pasos con preguntas del catálogo apuntan a su categoría. */
  category?: CategoryId;
  kind: 'preguntas' | 'nicho' | 'revision';
}

export const TOTAL_STEPS = 12;

export const STEPS: Step[] = (
  [
    { number: 1, title: 'Datos de contacto y empresa', category: 'contacto', kind: 'preguntas' },
    { number: 2, title: '¿A qué se dedica tu negocio?', kind: 'nicho' },
    ...CATEGORIES.filter((c) => c.step >= 3).map<Step>((c) => ({
      number: c.step,
      title: c.label,
      category: c.id,
      kind: 'preguntas',
    })),
    { number: 12, title: 'Revisión y envío', kind: 'revision' },
  ] as Step[]
).sort((a, b) => a.number - b.number);

export function getStep(n: number): Step | undefined {
  return STEPS.find((s) => s.number === n);
}

/** ¿Hay una respuesta de verdad, o el campo está vacío? */
export function isAnswered(value: AnswerValue): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !Number.isNaN(value);
  if (typeof value === 'boolean') return true;
  if (Array.isArray(value)) return value.length > 0;
  return false;
}

/** Evalúa una condición contra las respuestas actuales. */
function conditionHolds(
  condition: { questionId: string; operator: string; value?: string },
  answers: Answers,
): boolean {
  const actual = answers[condition.questionId];
  switch (condition.operator) {
    case 'respondida':
      return isAnswered(actual);
    case 'igual':
      if (typeof actual === 'boolean') return String(actual) === condition.value;
      return String(actual ?? '') === String(condition.value ?? '');
    case 'distinto':
      if (typeof actual === 'boolean') return String(actual) !== condition.value;
      return String(actual ?? '') !== String(condition.value ?? '');
    case 'contiene':
      if (Array.isArray(actual)) {
        return (actual as unknown[]).some((v) => String(v) === condition.value);
      }
      return String(actual ?? '').includes(String(condition.value ?? ''));
    default:
      return true;
  }
}

/** ¿Se muestra esta pregunta con las respuestas que hay hasta ahora? */
export function isVisible(question: Question, answers: Answers): boolean {
  return question.conditions.every((c) => conditionHolds(c, answers));
}

/**
 * Las preguntas que le tocan a un cliente: las generales más las de su nicho.
 * Si todavía no eligió nicho, sólo las generales.
 */
export function questionsForNiche(all: Question[], niche: NicheId | null): Question[] {
  return all
    .filter((q) => q.niche === 'general' || (niche !== null && q.niche === niche))
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

/** Preguntas visibles de un paso, en orden. */
export function questionsForStep(
  all: Question[],
  niche: NicheId | null,
  step: Step,
  answers: Answers,
): Question[] {
  if (!step.category) return [];
  return questionsForNiche(all, niche)
    .filter((q) => q.category === step.category)
    .filter((q) => isVisible(q, answers));
}

// ── Validación ──────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const URL_RE = /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i;
/** Teléfono chileno o internacional, tolerante con espacios, guiones y paréntesis. */
const TEL_RE = /^\+?[\d\s()-]{8,20}$/;

/** Valida el RUT chileno con su dígito verificador. */
export function isValidRut(input: string): boolean {
  const clean = input.replace(/[.\s]/g, '').toUpperCase();
  const match = /^(\d{7,8})-?([\dK])$/.exec(clean);
  if (!match) return false;
  const [, body, dv] = match;
  let sum = 0;
  let factor = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const rest = 11 - (sum % 11);
  const expected = rest === 11 ? '0' : rest === 10 ? 'K' : String(rest);
  return expected === dv;
}

/** Devuelve el mensaje de error, o null si la respuesta está bien. */
export function validateAnswer(question: Question, value: AnswerValue): string | null {
  const answered = isAnswered(value);

  if (question.required && !answered) return 'Esta pregunta es obligatoria.';
  if (!answered) return null;

  switch (question.type) {
    case 'numero': {
      const n = typeof value === 'number' ? value : Number(String(value).replace(/[.\s]/g, ''));
      if (Number.isNaN(n)) return 'Escribe sólo números.';
      if (n < 0) return 'El número no puede ser negativo.';
      return null;
    }
    case 'url':
      if (!URL_RE.test(String(value).trim())) {
        return 'Escribe una dirección completa, partiendo por https://';
      }
      return null;
    case 'fecha':
      if (Number.isNaN(Date.parse(String(value)))) return 'Fecha no válida.';
      return null;
    case 'seleccion_unica':
    case 'escala_prioridad':
      if (!question.options.some((o) => o.value === String(value))) {
        return 'Elige una de las opciones.';
      }
      return null;
    case 'seleccion_multiple': {
      const values = Array.isArray(value) ? (value as string[]) : [];
      const valid = new Set(question.options.map((o) => o.value));
      if (values.some((v) => !valid.has(v))) return 'Hay una opción que ya no existe.';
      return null;
    }
    case 'texto_corto':
      if (question.format === 'email' && !EMAIL_RE.test(String(value).trim())) {
        return 'Revisa el correo: parece incompleto.';
      }
      if (question.format === 'telefono' && !TEL_RE.test(String(value).trim())) {
        return 'Escribe un teléfono válido, por ejemplo +56 9 1234 5678.';
      }
      if (question.format === 'rut' && !isValidRut(String(value))) {
        return 'El RUT no es válido. Revisa el dígito verificador.';
      }
      if (String(value).length > 300) return 'Máximo 300 caracteres.';
      return null;
    case 'texto_largo':
      if (String(value).length > 5000) return 'Máximo 5.000 caracteres.';
      return null;
    default:
      return null;
  }
}

export type StepErrors = Record<string, string>;

/** Valida un paso completo. Devuelve sólo las preguntas con problema. */
export function validateStep(questions: Question[], answers: Answers): StepErrors {
  const errors: StepErrors = {};
  for (const question of questions) {
    const error = validateAnswer(question, answers[question.id] ?? null);
    if (error) errors[question.id] = error;
  }
  return errors;
}

// ── Progreso ────────────────────────────────────────────────

export interface Progress {
  /** 0 a 100, sobre las preguntas visibles. */
  percent: number;
  answered: number;
  total: number;
  /** Obligatorias visibles sin responder. */
  missingRequired: Question[];
  /** Pasos que todavía tienen algo pendiente. */
  incompleteSteps: number[];
}

export function computeProgress(
  all: Question[],
  niche: NicheId | null,
  answers: Answers,
): Progress {
  const visible = questionsForNiche(all, niche).filter((q) => isVisible(q, answers));
  const answered = visible.filter((q) => isAnswered(answers[q.id] ?? null));
  const missingRequired = visible.filter(
    (q) => q.required && !isAnswered(answers[q.id] ?? null),
  );

  const incompleteSteps = STEPS.filter((step) => {
    if (step.kind === 'nicho') return niche === null;
    if (step.kind === 'revision') return false;
    return visible.some(
      (q) => q.category === step.category && q.required && !isAnswered(answers[q.id] ?? null),
    );
  }).map((s) => s.number);

  return {
    percent: visible.length === 0 ? 0 : Math.round((answered.length / visible.length) * 100),
    answered: answered.length,
    total: visible.length,
    missingRequired,
    incompleteSteps,
  };
}

// ── Presentación de respuestas ──────────────────────────────

/** Convierte una respuesta cruda en texto legible para el brief y el panel. */
export function formatAnswer(question: Question, value: AnswerValue): string {
  if (!isAnswered(value)) return '';
  switch (question.type) {
    case 'si_no':
      return value === true ? 'Sí' : 'No';
    case 'seleccion_unica':
    case 'escala_prioridad': {
      const option = question.options.find((o) => o.value === String(value));
      return option ? option.label : String(value);
    }
    case 'seleccion_multiple': {
      const values = value as string[];
      return values
        .map((v) => question.options.find((o) => o.value === v)?.label ?? v)
        .join(', ');
    }
    case 'numero':
      return new Intl.NumberFormat('es-CL').format(Number(value));
    case 'fecha':
      return new Intl.DateTimeFormat('es-CL', { dateStyle: 'long' }).format(
        new Date(String(value)),
      );
    case 'archivo': {
      const files = value as AttachmentRef[];
      return files.map((f) => f.filename).join(', ');
    }
    default:
      return String(value);
  }
}

/** Las líneas de un campo de texto largo, sin vacías. Sirve para listas. */
export function asLines(value: AnswerValue): string[] {
  if (typeof value !== 'string') return [];
  return value
    .split('\n')
    .map((l) => l.replace(/^[-*•\s]+/, '').trim())
    .filter(Boolean);
}
