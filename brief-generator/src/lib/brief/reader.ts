import {
  asLines,
  formatAnswer,
  isAnswered,
  isVisible,
  questionsForNiche,
  STEPS,
} from '../questions/engine';
import type { Answers, AnswerValue, AttachmentRef, Question } from '../questions/types';
import { CATEGORIES } from '../questions/types';
import type { Client } from '../types';
import type { MissingItem } from './types';

/**
 * Acceso ordenado a las respuestas de un cliente.
 *
 * Toda la generación del brief pasa por acá: si un dato no está, el lector lo
 * devuelve vacío y lo anota como faltante. Ninguna sección del brief inventa
 * un valor cuando el cliente no lo respondió.
 */
export class AnswerReader {
  readonly visible: Question[];
  private readonly byId: Map<string, Question>;
  private readonly answers: Answers;

  constructor(questions: Question[], client: Client) {
    this.answers = client.answers ?? {};
    this.visible = questionsForNiche(questions, client.niche).filter((q) =>
      isVisible(q, this.answers),
    );
    this.byId = new Map(this.visible.map((q) => [q.id, q]));
  }

  question(id: string): Question | undefined {
    return this.byId.get(id);
  }

  raw(id: string): AnswerValue {
    return this.answers[id] ?? null;
  }

  has(id: string): boolean {
    return this.byId.has(id) && isAnswered(this.raw(id));
  }

  /** Respuesta ya formateada para leer. Vacío si no está respondida. */
  text(id: string): string {
    const question = this.byId.get(id);
    if (!question) return '';
    return formatAnswer(question, this.raw(id));
  }

  /** Un campo de texto largo partido en líneas. */
  lines(id: string): string[] {
    return this.has(id) ? asLines(this.raw(id)) : [];
  }

  number(id: string): number | null {
    if (!this.has(id)) return null;
    const value = this.raw(id);
    const n = typeof value === 'number' ? value : Number(String(value));
    return Number.isFinite(n) ? n : null;
  }

  bool(id: string): boolean | null {
    if (!this.has(id)) return null;
    return this.raw(id) === true;
  }

  /** El valor crudo de una selección, para comparar contra las opciones. */
  choice(id: string): string {
    if (!this.has(id)) return '';
    const value = this.raw(id);
    return Array.isArray(value) ? '' : String(value);
  }

  choices(id: string): string[] {
    if (!this.has(id)) return [];
    const value = this.raw(id);
    return Array.isArray(value) ? (value as string[]).map(String) : [String(value)];
  }

  attachments(id: string): AttachmentRef[] {
    const value = this.raw(id);
    if (!Array.isArray(value)) return [];
    return value.filter(
      (v): v is AttachmentRef => typeof v === 'object' && v !== null && 'filename' in v,
    );
  }

  /**
   * La primera respuesta disponible de una lista de preguntas. Sirve cuando la
   * misma información puede venir del catálogo general o del módulo del nicho.
   */
  first(...ids: string[]): string {
    for (const id of ids) {
      if (this.has(id)) return this.text(id);
    }
    return '';
  }

  firstLines(...ids: string[]): string[] {
    for (const id of ids) {
      if (this.has(id)) return this.lines(id);
    }
    return [];
  }

  /** El enunciado de la pregunta, para nombrar lo que falta. */
  label(id: string): string {
    return this.byId.get(id)?.text ?? id;
  }

  get answeredCount(): number {
    return this.visible.filter((q) => isAnswered(this.raw(q.id))).length;
  }

  /** Todo lo visible que quedó sin responder, ordenado por paso. */
  missing(reasons: Record<string, string> = {}): MissingItem[] {
    const stepOf = (categoryId: string) =>
      CATEGORIES.find((c) => c.id === categoryId)?.step ?? 99;

    return this.visible
      .filter((q) => !isAnswered(this.raw(q.id)))
      .map<MissingItem>((q) => {
        const step = stepOf(q.category);
        return {
          questionId: q.id,
          question: q.text,
          step,
          stepTitle: STEPS.find((s) => s.number === step)?.title ?? '',
          required: q.required,
          why: reasons[q.id],
        };
      })
      .sort((a, b) => Number(b.required) - Number(a.required) || a.step - b.step);
  }
}

/** Une frases en una lista legible: «a, b y c». */
export function joinEs(items: string[]): string {
  const clean = items.filter(Boolean);
  if (clean.length === 0) return '';
  if (clean.length === 1) return clean[0];
  return `${clean.slice(0, -1).join(', ')} y ${clean[clean.length - 1]}`;
}

export function formatCLP(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value);
}
