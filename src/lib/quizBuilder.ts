import { CHARACTER_IDS } from '../data/characters';
import { QUESTIONS } from '../data/questions';
import type { CharacterId } from '../types/character';
import type { Question } from '../types/question';
import { seededRandom, shuffle } from './random';

/**
 * Cada test es distinto: se sortean preguntas del banco y se mezclan sus opciones.
 * - Preguntas por test: QUIZ_LENGTH (la última siempre es la frase de la obra).
 * - El sorteo es equilibrado: cada personaje debe ser la opción principal en al menos
 *   MIN_PRIMARY preguntas, para que todos tengan oportunidades reales de salir.
 * - Con la misma semilla se obtiene el mismo test (al recargar la página no cambia).
 */
export const QUIZ_LENGTH = 15;
export const CLOSING_QUESTION_ID = 'q16-silencio';
const MIN_PRIMARY = 2;
const MAX_ATTEMPTS = 500;

function primaryCounts(questions: Question[]): Record<CharacterId, number> {
  const counts = Object.fromEntries(CHARACTER_IDS.map((id) => [id, 0])) as Record<CharacterId, number>;
  for (const q of questions) {
    const primaries = new Set<CharacterId>();
    for (const o of q.options) {
      for (const [id, pts] of Object.entries(o.affinity) as [CharacterId, number][]) if (pts === 2) primaries.add(id);
    }
    for (const id of primaries) counts[id]++;
  }
  return counts;
}

export function isBalanced(questions: Question[]): boolean {
  const counts = primaryCounts(questions);
  return CHARACTER_IDS.every((id) => counts[id] >= MIN_PRIMARY);
}

export function buildQuiz(seed: number, pool: Question[] = QUESTIONS, length = QUIZ_LENGTH): Question[] {
  const random = seededRandom(seed);
  const closing = pool.find((q) => q.id === CLOSING_QUESTION_ID);
  const rest = pool.filter((q) => q !== closing);
  const take = Math.min(length - (closing ? 1 : 0), rest.length);

  let chosen: Question[] = [];
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    chosen = shuffle(rest, random).slice(0, take);
    if (isBalanced(closing ? [...chosen, closing] : chosen)) break;
  }

  const ordered = closing ? [...chosen, closing] : chosen;
  // Las opciones también cambian de orden; sus identificadores no cambian.
  return ordered.map((q) => ({ ...q, options: shuffle(q.options, random) }));
}
