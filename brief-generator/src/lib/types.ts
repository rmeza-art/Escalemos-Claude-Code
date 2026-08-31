import type { Answers, NicheId } from './questions/types';

/** Estados por los que pasa un proyecto. El orden es el del flujo real. */
export const PROJECT_STATUSES = [
  { id: 'borrador', label: 'Borrador', description: 'Creado por la agencia, el cliente todavía no abre el enlace.' },
  { id: 'enviado', label: 'Enviado', description: 'El enlace se envió y el cliente aún no termina.' },
  { id: 'incompleto', label: 'Incompleto', description: 'El cliente avanzó pero dejó respuestas obligatorias en blanco.' },
  { id: 'recibido', label: 'Recibido', description: 'El cliente envió el formulario.' },
  { id: 'en_revision', label: 'En revisión', description: 'La agencia está revisando y completando el brief.' },
  { id: 'aprobado', label: 'Aprobado', description: 'Brief cerrado y aprobado internamente.' },
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number]['id'];

export function statusLabel(id: string): string {
  return PROJECT_STATUSES.find((s) => s.id === id)?.label ?? id;
}

/** Texto que la agencia escribe encima del brief generado. */
export interface BriefOverrides {
  /** sectionId → texto que reemplaza el cuerpo generado de esa sección. */
  sections: Record<string, string>;
  /** Nota interna de la agencia, se imprime al final del PDF. */
  agencyNotes: string;
}

export interface Client {
  id: string;
  /** Persona de contacto según la agencia. El paso 1 puede corregirlo. */
  contactName: string;
  company: string;
  email: string;
  phone: string;
  niche: NicheId | null;
  status: ProjectStatus;
  /** Token del enlace privado que se le manda al cliente. */
  token: string;
  /** Notas internas de la agencia; el cliente no las ve. */
  internalNotes: string;
  answers: Answers;
  briefOverrides: BriefOverrides;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  submittedAt: string | null;
}

export interface NewClientInput {
  contactName: string;
  company: string;
  email: string;
  phone?: string;
  niche?: NicheId | null;
  internalNotes?: string;
}

export const EMPTY_OVERRIDES: BriefOverrides = { sections: {}, agencyNotes: '' };

/** Nombre con el que se muestra el proyecto en el panel. */
export function clientDisplayName(client: Client): string {
  const fromForm = client.answers['con_empresa'];
  if (typeof fromForm === 'string' && fromForm.trim()) return fromForm.trim();
  return client.company || client.contactName || 'Cliente sin nombre';
}
