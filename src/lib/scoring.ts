import type { CharacterId } from '../types/character';
import type { Answers, Question } from '../types/question';
import { CHARACTER_IDS } from '../data/characters';
import { QUESTIONS } from '../data/questions';

export interface CharacterScore {
  id: CharacterId;
  /** Puntos obtenidos. */
  score: number;
  /** Máximo que el personaje puede obtener en este test. */
  max: number;
  /** score / max (0–1). Es una afinidad dentro del test, no una medición psicológica. */
  relative: number;
  /** Respuestas en las que el personaje recibió la puntuación principal (2). */
  primaryHits: number;
}

export interface Contribution {
  questionId: string;
  questionText: string;
  optionId: string;
  optionText: string;
  note: string;
  points: number;
}

export type TieBreak = 'none' | 'primary-hits' | 'final-question' | 'seeded';

export interface QuizResult {
  winner: CharacterId;
  ranking: CharacterScore[];
  /** Personajes que empataron con el ganador en afinidad relativa (sin incluirlo). */
  tiedWith: CharacterId[];
  /** Regla que resolvió el empate. */
  tieBreak: TieBreak;
  /** Respuestas que sumaron puntos al ganador, de mayor a menor aporte. */
  contributions: Contribution[];
  answeredCount: number;
}

const EPSILON = 1e-9;

/** Máximo alcanzable por personaje: en cada pregunta, la mayor puntuación que puede recibir. */
export function maxPossibleScores(
  questions: Question[] = QUESTIONS,
  characterIds: CharacterId[] = CHARACTER_IDS,
): Record<CharacterId, number> {
  const max = Object.fromEntries(characterIds.map((id) => [id, 0])) as Record<CharacterId, number>;
  for (const q of questions) {
    for (const id of characterIds) {
      let best = 0;
      for (const o of q.options) best = Math.max(best, o.affinity[id] ?? 0);
      max[id] += best;
    }
  }
  return max;
}

/** Hash FNV-1a de 32 bits: misma entrada, mismo número. */
function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function answersSeed(answers: Answers): string {
  return Object.keys(answers)
    .sort()
    .map((k) => `${k}=${answers[k]}`)
    .join('&');
}

/**
 * Calcula el resultado del test.
 * Las respuestas a preguntas u opciones inexistentes se ignoran.
 * Lanza un error si no hay ninguna respuesta válida.
 */
export function computeResult(
  answers: Answers,
  questions: Question[] = QUESTIONS,
  characterIds: CharacterId[] = CHARACTER_IDS,
): QuizResult {
  const max = maxPossibleScores(questions, characterIds);
  const score = Object.fromEntries(characterIds.map((id) => [id, 0])) as Record<CharacterId, number>;
  const primary = Object.fromEntries(characterIds.map((id) => [id, 0])) as Record<CharacterId, number>;
  const finalQ = Object.fromEntries(characterIds.map((id) => [id, 0])) as Record<CharacterId, number>;
  const lastQuestion = questions[questions.length - 1];
  let answeredCount = 0;

  for (const q of questions) {
    const option = q.options.find((o) => o.id === answers[q.id]);
    if (!option) continue;
    answeredCount++;
    for (const [id, pts] of Object.entries(option.affinity) as [CharacterId, number][]) {
      if (!(id in score)) continue;
      score[id] += pts;
      if (pts === 2) primary[id] += 1;
      if (q === lastQuestion) finalQ[id] += pts;
    }
  }

  if (answeredCount === 0) throw new Error('No hay respuestas para calcular el resultado.');

  const ranking: CharacterScore[] = characterIds
    .map((id) => ({
      id,
      score: score[id],
      max: max[id],
      relative: max[id] > 0 ? score[id] / max[id] : 0,
      primaryHits: primary[id],
    }))
    .sort((a, b) => b.relative - a.relative || b.score - a.score || characterIds.indexOf(a.id) - characterIds.indexOf(b.id));

  const top = ranking[0]!;
  let candidates = ranking.filter((r) => Math.abs(r.relative - top.relative) < EPSILON);
  const tiedAtTop = candidates.map((c) => c.id);
  let tieBreak: TieBreak = 'none';

  if (candidates.length > 1) {
    tieBreak = 'primary-hits';
    const bestPrimary = Math.max(...candidates.map((c) => c.primaryHits));
    candidates = candidates.filter((c) => c.primaryHits === bestPrimary);
  }
  if (candidates.length > 1) {
    tieBreak = 'final-question';
    const bestFinal = Math.max(...candidates.map((c) => finalQ[c.id]));
    candidates = candidates.filter((c) => finalQ[c.id] === bestFinal);
  }
  let winner = candidates[0]!.id;
  if (candidates.length > 1) {
    tieBreak = 'seeded';
    winner = candidates[hashString(answersSeed(answers)) % candidates.length]!.id;
  }

  // El ganador va primero en el ranking aunque el desempate lo haya elegido entre iguales.
  const ordered = [ranking.find((r) => r.id === winner)!, ...ranking.filter((r) => r.id !== winner)];

  const contributions: Contribution[] = [];
  for (const q of questions) {
    const option = q.options.find((o) => o.id === answers[q.id]);
    const points = option?.affinity[winner];
    if (option && points) {
      contributions.push({
        questionId: q.id,
        questionText: q.text,
        optionId: option.id,
        optionText: option.text,
        note: option.note,
        points,
      });
    }
  }
  contributions.sort((a, b) => b.points - a.points);

  return {
    winner,
    ranking: ordered,
    tiedWith: tiedAtTop.filter((id) => id !== winner),
    tieBreak,
    contributions,
    answeredCount,
  };
}

/** Porcentaje de afinidad para mostrar (entero 0–100). */
export function affinityPercent(s: CharacterScore): number {
  return Math.round(s.relative * 100);
}
