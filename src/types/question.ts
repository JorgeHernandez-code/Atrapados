import type { CharacterId } from './character';

/** Afinidad que suma una opción: 2 = principal, 1 = secundaria. */
export type Affinity = Partial<Record<CharacterId, 1 | 2>>;

export interface QuestionOption {
  /** Identificador único dentro de la pregunta (a, b, c...). */
  id: string;
  text: string;
  affinity: Affinity;
  /** Tendencia que representa la opción; se usa para explicar el resultado. */
  note: string;
}

export interface Question {
  id: string;
  text: string;
  /** Texto de apoyo opcional bajo la pregunta. */
  hint?: string;
  options: QuestionOption[];
  /** Preguntas originales del documento en las que se basa (p. ej. "piedad-1"). */
  sourceRefs: string[];
}

/** questionId -> optionId */
export type Answers = Record<string, string>;
