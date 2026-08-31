import { z } from 'zod';

import { isAnswered } from './questions/engine';
import { NICHES, type AnswerValue, type Answers, type Question } from './questions/types';

/**
 * Todo lo que llega del navegador pasa por acá antes de tocar la base.
 * No se guarda una respuesta cuya pregunta no exista, ni un valor que no
 * corresponda al tipo de esa pregunta.
 */

const attachmentSchema = z.object({
  id: z.string().min(1).max(80),
  filename: z.string().min(1).max(255),
  size: z.number().int().nonnegative(),
  mime: z.string().max(120),
  path: z.string().min(1).max(400),
  uploadedAt: z.string().max(40),
});

export const guardarSchema = z.object({
  respuestas: z.record(z.string(), z.unknown()),
  nicho: z
    .enum(NICHES.map((n) => n.id) as [string, ...string[]])
    .nullable()
    .optional(),
});

/** Ajusta un valor al tipo de su pregunta. Devuelve null si no sirve. */
function coerce(question: Question, raw: unknown): AnswerValue {
  if (raw === null || raw === undefined) return null;

  switch (question.type) {
    case 'si_no':
      return typeof raw === 'boolean' ? raw : null;

    case 'numero': {
      const n = typeof raw === 'number' ? raw : Number(String(raw).replace(/[^\d.-]/g, ''));
      return Number.isFinite(n) ? n : null;
    }

    case 'seleccion_multiple': {
      if (!Array.isArray(raw)) return null;
      const validas = new Set(question.options.map((o) => o.value));
      const filtradas = raw.map(String).filter((v) => validas.has(v));
      return filtradas.length > 0 ? filtradas : null;
    }

    case 'seleccion_unica':
    case 'escala_prioridad': {
      const valor = String(raw);
      return question.options.some((o) => o.value === valor) ? valor : null;
    }

    case 'archivo': {
      if (!Array.isArray(raw)) return null;
      const parsed = raw
        .map((item) => attachmentSchema.safeParse(item))
        .filter((r) => r.success)
        .map((r) => r.data);
      return parsed.length > 0 ? parsed : null;
    }

    case 'texto_largo':
      return typeof raw === 'string' ? raw.slice(0, 5000) : null;

    case 'fecha': {
      const texto = String(raw).slice(0, 40);
      return Number.isNaN(Date.parse(texto)) ? null : texto;
    }

    default:
      return typeof raw === 'string' || typeof raw === 'number' ? String(raw).slice(0, 300) : null;
  }
}

/**
 * Fusiona lo que llegó con lo que ya estaba guardado. Sólo se tocan las
 * preguntas que vinieron en la petición: así guardar un paso no borra otro.
 */
export function mergeAnswers(
  questions: Question[],
  previas: Answers,
  entrantes: Record<string, unknown>,
): Answers {
  const porId = new Map(questions.map((q) => [q.id, q]));
  const resultado: Answers = { ...previas };

  for (const [id, raw] of Object.entries(entrantes)) {
    const question = porId.get(id);
    if (!question) continue;
    const valor = coerce(question, raw);
    if (valor === null || !isAnswered(valor)) delete resultado[id];
    else resultado[id] = valor;
  }

  return resultado;
}

export const nuevoClienteSchema = z.object({
  contactName: z.string().trim().min(2, 'Escribe el nombre del contacto.').max(120),
  company: z.string().trim().min(2, 'Escribe el nombre de la empresa.').max(160),
  email: z.email('Revisa el correo.').max(160),
  phone: z.string().trim().max(40).optional().default(''),
  niche: z
    .enum(NICHES.map((n) => n.id) as [string, ...string[]])
    .nullable()
    .optional(),
  internalNotes: z.string().trim().max(2000).optional().default(''),
});

export const preguntaSchema = z.object({
  id: z
    .string()
    .trim()
    .regex(/^[a-z][a-z0-9_]{2,59}$/, 'El identificador usa minúsculas, números y guion bajo.'),
  niche: z.string().trim().min(2).max(40),
  category: z.string().trim().min(2).max(40),
  text: z.string().trim().min(3, 'Escribe el enunciado.').max(400),
  type: z.string().trim().min(2).max(40),
  required: z.boolean(),
  options: z
    .array(z.object({ value: z.string().min(1).max(60), label: z.string().min(1).max(160) }))
    .max(40),
  conditions: z
    .array(
      z.object({
        questionId: z.string().min(1).max(60),
        operator: z.enum(['igual', 'distinto', 'contiene', 'respondida']),
        value: z.string().max(120).optional(),
      }),
    )
    .max(5),
  help: z.string().trim().max(400).optional(),
  placeholder: z.string().trim().max(160).optional(),
  order: z.number().int().min(0).max(10000),
});
