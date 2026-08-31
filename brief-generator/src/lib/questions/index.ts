import { GENERAL_QUESTIONS } from './catalog-general';
import { ODONTOLOGIA_QUESTIONS } from './catalog-odontologia';
import { NICHE_QUESTIONS } from './catalog-nichos';
import type { Question } from './types';

/**
 * Catálogo base. Es la semilla con la que se llena la tabla `questions` la
 * primera vez; a partir de ahí la fuente de verdad es la base de datos y el
 * administrador puede editar, agregar o desactivar preguntas.
 */
export const DEFAULT_QUESTIONS: Question[] = [
  ...GENERAL_QUESTIONS,
  ...ODONTOLOGIA_QUESTIONS,
  ...NICHE_QUESTIONS,
];

export * from './types';
export * from './engine';
export { q, opts, slug } from './catalog-general';
