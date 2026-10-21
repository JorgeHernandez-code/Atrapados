import { describe, expect, it } from 'vitest';
import { CHARACTERS, CHARACTER_IDS } from '../data/characters';
import { QUESTIONS } from '../data/questions';
import type { Answers, Question } from '../types/question';
import type { CharacterId } from '../types/character';
import { buildQuiz, QUIZ_LENGTH } from './quizBuilder';
import { seededRandom as rng } from './random';
import { computeResult, maxPossibleScores } from './scoring';

/** Respuestas que un "fan" de un personaje elegiría: la opción que más le favorece frente al resto. */
function answersFavoring(target: CharacterId, questions: Question[] = QUESTIONS): Answers {
  const answers: Answers = {};
  for (const q of questions) {
    let best = q.options[0]!;
    let bestValue = -Infinity;
    for (const o of q.options) {
      const own = o.affinity[target] ?? 0;
      const others = Object.entries(o.affinity)
        .filter(([id]) => id !== target)
        .reduce((s, [, v]) => s + (v ?? 0), 0);
      const value = own * 10 - others;
      if (value > bestValue) {
        bestValue = value;
        best = o;
      }
    }
    answers[q.id] = best.id;
  }
  if (computeResult(answers, questions).winner === target) return answers;
  // Búsqueda local: cambia respuestas mientras aumente la ventaja del personaje sobre el siguiente.
  const margin = (a: Answers) => {
    const r = computeResult(a, questions);
    const own = r.ranking.find((x) => x.id === target)!.relative;
    const rival = Math.max(...r.ranking.filter((x) => x.id !== target).map((x) => x.relative));
    return own - rival + (r.winner === target ? 1 : 0);
  };
  let current = margin(answers);
  for (let improved = true; improved; ) {
    improved = false;
    for (const q of questions) {
      for (const o of q.options) {
        const trial = { ...answers, [q.id]: o.id };
        const m = margin(trial);
        if (m > current + 1e-9) {
          answers[q.id] = o.id;
          current = m;
          improved = true;
        }
      }
    }
  }
  return answers;
}

describe('integridad de los datos', () => {
  it('tiene 14 personajes con ids únicos', () => {
    expect(CHARACTERS).toHaveLength(14);
    expect(new Set(CHARACTER_IDS).size).toBe(14);
  });

  it('cada test tiene entre 12 y 18 preguntas y el banco es mayor que un test', () => {
    expect(QUIZ_LENGTH).toBeGreaterThanOrEqual(12);
    expect(QUIZ_LENGTH).toBeLessThanOrEqual(18);
    expect(QUESTIONS.length).toBeGreaterThan(QUIZ_LENGTH);
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length);
  });

  it.each(QUESTIONS.map((q) => [q.id, q] as const))('%s: 3–5 opciones válidas y no todas al mismo personaje', (_id, q) => {
    expect(q.options.length).toBeGreaterThanOrEqual(3);
    expect(q.options.length).toBeLessThanOrEqual(5);
    expect(new Set(q.options.map((o) => o.id)).size).toBe(q.options.length);
    const primaries = new Set<string>();
    for (const o of q.options) {
      const entries = Object.entries(o.affinity);
      expect(entries.length).toBeGreaterThan(0);
      for (const [id, pts] of entries) {
        expect(CHARACTER_IDS).toContain(id);
        expect([1, 2]).toContain(pts);
      }
      expect(o.note.length).toBeGreaterThan(0);
      const top = entries.sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]![0];
      primaries.add(top);
    }
    expect(primaries.size).toBeGreaterThan(1);
  });

  it('cada personaje aparece en al menos 6 preguntas', () => {
    for (const id of CHARACTER_IDS) {
      const count = QUESTIONS.filter((q) => q.options.some((o) => o.affinity[id])).length;
      expect(count, id).toBeGreaterThanOrEqual(6);
    }
  });
});

describe('computeResult', () => {
  it.each(CHARACTER_IDS)('puede devolver a %s con el banco completo', (id) => {
    const result = computeResult(answersFavoring(id));
    expect(result.winner).toBe(id);
    expect(result.contributions.length).toBeGreaterThan(0);
  });

  it('en 300 tests sorteados, los 14 personajes se pueden obtener en cada uno', () => {
    const random = rng(42);
    for (let i = 0; i < 300; i++) {
      const quiz = buildQuiz(Math.floor(random() * 2 ** 32));
      for (const id of CHARACTER_IDS) {
        expect(computeResult(answersFavoring(id, quiz), quiz).winner, `semilla ${i}, ${id}`).toBe(id);
      }
    }
  }, 120000);

  it('es determinista: mismas respuestas, mismo resultado', () => {
    const answers = answersFavoring('merlina');
    expect(computeResult(answers)).toEqual(computeResult({ ...answers }));
  });

  it('lanza error si no hay respuestas', () => {
    expect(() => computeResult({})).toThrow();
  });

  it('ignora respuestas a preguntas u opciones inexistentes', () => {
    const answers = { ...answersFavoring('doc'), 'no-existe': 'a', [QUESTIONS[0]!.id]: 'zzz' };
    const result = computeResult(answers);
    expect(result.answeredCount).toBe(QUESTIONS.length - 1);
  });

  it('el ranking incluye a todos los personajes y el ganador va primero', () => {
    const result = computeResult(answersFavoring('candy'));
    expect(result.ranking).toHaveLength(14);
    expect(result.ranking[0]!.id).toBe(result.winner);
    for (const r of result.ranking) {
      expect(r.relative).toBeGreaterThanOrEqual(0);
      expect(r.relative).toBeLessThanOrEqual(1);
    }
  });

  describe('empates', () => {
    const ids: CharacterId[] = ['yuli', 'piedad', 'merlina'];
    const q = (id: string, opts: Question['options']): Question => ({ id, text: id, options: opts, sourceRefs: [] });

    it('desempata por respuestas principales', () => {
      // yuli: 2 (una principal) ; piedad: 1+1 (ninguna principal) → misma afinidad relativa
      const qs = [
        q('q1', [
          { id: 'a', text: '', note: 'n', affinity: { yuli: 2, piedad: 1 } },
          { id: 'b', text: '', note: 'n', affinity: { merlina: 2 } },
        ]),
        q('q2', [
          { id: 'a', text: '', note: 'n', affinity: { piedad: 1 } },
          { id: 'b', text: '', note: 'n', affinity: { yuli: 2 } },
          { id: 'c', text: '', note: 'n', affinity: { merlina: 2, piedad: 1 } },
        ]),
      ];
      // máximos: yuli 4, piedad 2, merlina 4. Respuestas a,a: yuli 2/4, piedad 2/2 → piedad gana sin empate.
      expect(computeResult({ q1: 'a', q2: 'a' }, qs, ids).winner).toBe('piedad');
      // Respuestas a,c: yuli 2/4=.5, piedad 2/2=1, merlina 2/4=.5 → piedad.
      expect(computeResult({ q1: 'a', q2: 'c' }, qs, ids).tieBreak).toBe('none');
    });

    it('usa la regla de respuestas principales y luego la pregunta final', () => {
      const qs = [
        q('q1', [
          { id: 'a', text: '', note: 'n', affinity: { yuli: 2, piedad: 2 } },
          { id: 'b', text: '', note: 'n', affinity: { merlina: 2 } },
        ]),
        q('q2', [
          { id: 'a', text: '', note: 'n', affinity: { yuli: 2, piedad: 1 } },
          { id: 'b', text: '', note: 'n', affinity: { piedad: 2, merlina: 2 } },
        ]),
      ];
      // q1=a, q2=a: yuli 4/4, piedad 3/4 → yuli sin empate
      expect(computeResult({ q1: 'a', q2: 'a' }, qs, ids).winner).toBe('yuli');
      // q1=a, q2=b: yuli 2/4, piedad 4/4 → piedad
      const r = computeResult({ q1: 'a', q2: 'b' }, qs, ids);
      expect(r.winner).toBe('piedad');
    });

    it('resuelve un empate total con una selección reproducible y lo informa', () => {
      const qs = [
        q('q1', [
          { id: 'a', text: '', note: 'n', affinity: { yuli: 2, piedad: 2 } },
          { id: 'b', text: '', note: 'n', affinity: { merlina: 2 } },
        ]),
      ];
      const r1 = computeResult({ q1: 'a' }, qs, ids);
      const r2 = computeResult({ q1: 'a' }, qs, ids);
      expect(r1.tieBreak).toBe('seeded');
      expect(['yuli', 'piedad']).toContain(r1.winner);
      expect(r1.tiedWith).toHaveLength(1);
      expect(r1.tiedWith[0]).not.toBe(r1.winner);
      expect(r2.winner).toBe(r1.winner);
    });

    it('desempata por la pregunta final cuando las principales coinciden', () => {
      const qs = [
        q('q1', [
          { id: 'a', text: '', note: 'n', affinity: { yuli: 2 } },
          { id: 'b', text: '', note: 'n', affinity: { piedad: 2 } },
        ]),
        q('q2', [
          { id: 'a', text: '', note: 'n', affinity: { piedad: 2 } },
          { id: 'b', text: '', note: 'n', affinity: { yuli: 2, merlina: 1 } },
          { id: 'c', text: '', note: 'n', affinity: { merlina: 2 } },
        ]),
      ];
      // q1=a (yuli 2), q2=a (piedad 2): ambos 2/4, 1 principal cada uno; la final favorece a piedad.
      const r = computeResult({ q1: 'a', q2: 'a' }, qs, ids);
      expect(r.tieBreak).toBe('final-question');
      expect(r.winner).toBe('piedad');
      expect(r.tiedWith).toEqual(['yuli']);
    });
  });
});

describe('equilibrio (simulación de respuestas aleatorias)', () => {
  it('todos los personajes salen con una frecuencia razonable (tests sorteados)', () => {
    const random = rng(20261107);
    const runs = 20000;
    const counts = Object.fromEntries(CHARACTER_IDS.map((id) => [id, 0])) as Record<CharacterId, number>;
    let seeded = 0;
    for (let i = 0; i < runs; i++) {
      const quiz = buildQuiz(Math.floor(random() * 2 ** 32));
      const answers: Answers = {};
      for (const q of quiz) answers[q.id] = q.options[Math.floor(random() * q.options.length)]!.id;
      const r = computeResult(answers, quiz);
      counts[r.winner]++;
      if (r.tieBreak === 'seeded') seeded++;
    }
    const table = CHARACTER_IDS.map((id) => `${id.padEnd(10)} ${((counts[id] / runs) * 100).toFixed(1).padStart(5)} %`).join('\n');
    console.info(`\nDistribución en ${runs} tests aleatorios (uniforme = ${(100 / 14).toFixed(1)} %):\n${table}\nEmpates resueltos por sorteo: ${((seeded / runs) * 100).toFixed(2)} %`);
    console.info('Máximos por personaje:', maxPossibleScores());
    for (const id of CHARACTER_IDS) {
      expect(counts[id] / runs, id).toBeGreaterThan(0.03);
      expect(counts[id] / runs, id).toBeLessThan(0.14);
    }
  });
});
