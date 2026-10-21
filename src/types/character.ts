export type CharacterId =
  | 'hipolita'
  | 'sasha'
  | 'clarita'
  | 'carvajal'
  | 'minerva'
  | 'yuli'
  | 'marianita'
  | 'candy'
  | 'pachito'
  | 'jhoncito'
  | 'merlina'
  | 'felipe'
  | 'doc'
  | 'piedad';

/** Estilo de la tarjeta tipográfica del personaje. */
export type CharacterTone = 'yellow' | 'ink' | 'paper';

export interface Character {
  id: CharacterId;
  /** Nombre visible en la interfaz. */
  name: string;
  /** Nombre completo cuando el documento lo menciona. */
  fullName?: string;
  /** Intérprete según el documento del equipo. No se muestra salvo que se active SHOW_ACTOR_NAMES. */
  actor?: string;
  /** true solo cuando el equipo haya confirmado el nombre del intérprete. */
  actorConfirmed: boolean;
  /** Arquetipo creado para el test. */
  archetype: string;
  /** Rasgos tal como aparecen en el documento (referencia interna, no se muestran). */
  originalTraits: string[];
  /** Rasgos redactados para el público. */
  traits: string[];
  /** Descripción del resultado. */
  description: string;
  /** Frase creada para esta experiencia (no es un diálogo de la obra). */
  quote: string;
  tone: CharacterTone;
  /** Identificador de un retrato oficial en /public/characters/<id>.jpg, cuando exista. */
  imageId?: string;
  /** Notas para el equipo (inconsistencias, pendientes). */
  notes?: string;
}
