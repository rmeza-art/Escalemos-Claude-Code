export type BriefBlock =
  | { kind: 'parrafo'; text: string }
  | { kind: 'lista'; items: string[] }
  | { kind: 'datos'; items: { term: string; value: string }[] }
  | { kind: 'checklist'; items: ChecklistItem[] }
  | { kind: 'bloques_landing'; items: LandingBlock[] }
  | { kind: 'fases'; items: PlanPhase[] }
  | { kind: 'aviso'; tone: 'falta' | 'supuesto' | 'nota'; text: string };

export type AccessState = 'disponible' | 'existe_sin_acceso' | 'no_existe' | 'sin_dato';

export interface ChecklistItem {
  label: string;
  state: AccessState;
  /** Qué hay que hacer con esto. */
  action?: string;
}

export interface LandingBlock {
  title: string;
  /** Qué va en esta sección, según lo que respondió el cliente. */
  content: string[];
  /** Lo que falta para poder escribirla. */
  missing: string[];
}

export interface PlanPhase {
  title: string;
  timeframe: string;
  items: string[];
}

export interface BriefSection {
  id: string;
  number: number;
  title: string;
  blocks: BriefBlock[];
}

export interface MissingItem {
  questionId: string;
  question: string;
  step: number;
  stepTitle: string;
  required: boolean;
  /** Por qué importa. */
  why?: string;
}

export interface Brief {
  generatedAt: string;
  clientName: string;
  company: string;
  nicheLabel: string;
  status: string;
  /** Porcentaje de preguntas visibles respondidas. */
  coverage: number;
  answeredCount: number;
  visibleCount: number;
  sections: BriefSection[];
  missing: MissingItem[];
  assumptions: string[];
  clientActions: string[];
  agencyActions: string[];
  agencyNotes: string;
}
