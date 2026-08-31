/**
 * Motor de preguntas configurable.
 *
 * Todo el formulario del cliente se arma leyendo estas estructuras: no hay
 * pantallas con preguntas escritas a mano. Agregar un nicho o cambiar una
 * pregunta es tocar datos, no componentes.
 */

/** Tipos de respuesta soportados por el formulario. */
export const QUESTION_TYPES = [
  'texto_corto',
  'texto_largo',
  'seleccion_unica',
  'seleccion_multiple',
  'si_no',
  'numero',
  'url',
  'fecha',
  'archivo',
  'escala_prioridad',
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  texto_corto: 'Texto corto',
  texto_largo: 'Texto largo',
  seleccion_unica: 'Selección única',
  seleccion_multiple: 'Selección múltiple',
  si_no: 'Sí o no',
  numero: 'Número',
  url: 'URL',
  fecha: 'Fecha',
  archivo: 'Archivo',
  escala_prioridad: 'Escala de prioridad',
};

/** Nichos disponibles. `general` no se elige: agrupa las preguntas reutilizables. */
export const NICHES = [
  { id: 'odontologia', label: 'Odontología' },
  { id: 'centro_medico', label: 'Centro médico' },
  { id: 'ecommerce', label: 'Ecommerce' },
  { id: 'servicios_profesionales', label: 'Servicios profesionales' },
  { id: 'inmobiliaria', label: 'Inmobiliaria' },
  { id: 'belleza_estetica', label: 'Belleza y estética' },
  { id: 'otro', label: 'Otro' },
] as const;

export type NicheId = (typeof NICHES)[number]['id'];
/** El nicho tal como se guarda en una pregunta: uno concreto o el compartido. */
export type QuestionNiche = NicheId | 'general';

export function nicheLabel(id: string): string {
  if (id === 'general') return 'General (todos los nichos)';
  return NICHES.find((n) => n.id === id)?.label ?? id;
}

/**
 * Categorías. Cada una es un paso del formulario; el orden de este arreglo es
 * el orden de los pasos 3 a 11. Los pasos 1 (contacto), 2 (nicho) y 12
 * (revisión) tienen pantalla propia.
 */
export const CATEGORIES = [
  { id: 'contacto', label: 'Datos de contacto y empresa', step: 1 },
  { id: 'negocio', label: 'El negocio', step: 3 },
  { id: 'especifico', label: 'Preguntas de tu rubro', step: 4 },
  { id: 'servicios', label: 'Servicios y prioridades', step: 5 },
  { id: 'publico', label: 'Público objetivo y ubicación', step: 6 },
  { id: 'web', label: 'Página web, landing y formularios', step: 7 },
  { id: 'campanas', label: 'Campañas, anuncios y contenidos', step: 8 },
  { id: 'accesos', label: 'Cuentas y accesos digitales', step: 9 },
  { id: 'leads', label: 'Recepción y seguimiento de consultas', step: 10 },
  { id: 'archivos', label: 'Logos, fotos, videos y documentos', step: 11 },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export function categoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

/** Una opción de una pregunta de selección. */
export interface QuestionOption {
  value: string;
  label: string;
}

/**
 * Condición para mostrar una pregunta. Se evalúa contra la respuesta de otra
 * pregunta del mismo formulario. Si hay varias, deben cumplirse todas.
 */
export interface QuestionCondition {
  questionId: string;
  operator: 'igual' | 'distinto' | 'contiene' | 'respondida';
  value?: string;
}

export interface Question {
  /** Identificador estable. Es la llave con la que se guarda la respuesta. */
  id: string;
  niche: QuestionNiche;
  category: CategoryId;
  /** El enunciado que ve el cliente. */
  text: string;
  type: QuestionType;
  required: boolean;
  /** Sólo para selección única, múltiple y escala de prioridad. */
  options: QuestionOption[];
  /** Condiciones para mostrarla. Vacío = siempre visible. */
  conditions: QuestionCondition[];
  /** Texto de ayuda bajo la pregunta. */
  help?: string;
  /** Orden dentro de su categoría. */
  order: number;
  /** Texto gris dentro del campo. */
  placeholder?: string;
  /** Validación extra sobre texto corto. */
  format?: 'email' | 'telefono' | 'rut';
  /** Marca las preguntas del catálogo base: no se pueden borrar, sólo editar. */
  builtIn?: boolean;
}

/** Valor de una respuesta, según el tipo de pregunta. */
export type AnswerValue =
  | string
  | number
  | boolean
  | string[]
  | AttachmentRef[]
  | null;

export interface AttachmentRef {
  id: string;
  filename: string;
  size: number;
  mime: string;
  /** Ruta en Supabase Storage, o `demo://` en modo demo. */
  path: string;
  uploadedAt: string;
}

export type Answers = Record<string, AnswerValue>;
