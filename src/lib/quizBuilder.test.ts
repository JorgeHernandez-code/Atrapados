import { describe, expect, it } from 'vitest';
import { QUESTIONS } from '../data/questions';
import { buildQuiz, CLOSING_QUESTION_ID, isBalanced, QUIZ_LENGTH } from './quizBuilder';

describe('buildQuiz', () => {
  it('genera tests de la longitud esperada, sin preguntas repetidas', () => {
    for (let seed = 1; seed < 200; seed++) {
      const quiz = buildQuiz(seed);
      expect(quiz).toHaveLength(QUIZ_LENGTH);
      expect(new Set(quiz.map((q) => q.id)).size).toBe(QUIZ_LENGTH);
    }
  });

  it('la pregunta de la frase de la obra siempre cierra el test', () => {
    for (let seed = 1; seed < 100; seed++) expect(buildQuiz(seed).at(-1)!.id).toBe(CLOSING_QUESTION_ID);
  });

  it('misma semilla, mismo test (no cambia al recargar)', () => {
    expect(buildQuiz(12345)).toEqual(buildQuiz(12345));
  });

  it('semillas distintas producen tests distintos', () => {
    const signatures = new Set<string>();
    for (let seed = 1; seed <= 100; seed++) {
      signatures.add(buildQuiz(seed).map((q) => q.id + ':' + q.options.map((o) => o.id).join('')).join('|'));
    }
    expect(signatures.size).toBe(100);
  });

  it('cambia el orden de las opciones sin perder ninguna', () => {
    let reordered = 0;
    for (let seed = 1; seed < 50; seed++) {
      for (const q of buildQuiz(seed)) {
        const original = QUESTIONS.find((x) => x.id === q.id)!;
        expect([...q.options].map((o) => o.id).sort()).toEqual(original.options.map((o) => o.id).sort());
        if (q.options.map((o) => o.id).join('') !== original.options.map((o) => o.id).join('')) reordered++;
      }
    }
    expect(reordered).toBeGreaterThan(0);
  });

  it('todos los tests sorteados son equilibrados (cada personaje es opción principal al menos 2 veces)', () => {
    for (let seed = 1; seed <= 2000; seed++) expect(isBalanced(buildQuiz(seed)), `semilla ${seed}`).toBe(true);
  });

  it('todas las preguntas del banco aparecen en algún test', () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 300; seed++) buildQuiz(seed).forEach((q) => seen.add(q.id));
    expect(seen.size).toBe(QUESTIONS.length);
  });
});
