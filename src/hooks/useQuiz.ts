import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildQuiz } from '../lib/quizBuilder';
import { newSeed } from '../lib/random';
import { computeResult, type QuizResult } from '../lib/scoring';
import { track } from '../services/analytics';
import type { Answers } from '../types/question';

export type QuizPhase = 'landing' | 'quiz' | 'result';

interface QuizState {
  phase: QuizPhase;
  /** Semilla del sorteo de preguntas: define qué preguntas salen y en qué orden. */
  seed: number;
  index: number;
  answers: Answers;
  direction: 'forward' | 'back';
}

const STORAGE_KEY = 'atrapados-quiz-v2';
const fresh = (phase: QuizPhase = 'landing'): QuizState => ({ phase, seed: newSeed(), index: 0, answers: {}, direction: 'forward' });

/** Restaura el progreso de la pestaña (si existe y es compatible con las preguntas actuales). */
function load(): QuizState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return fresh();
    const saved = JSON.parse(raw) as Partial<QuizState>;
    if (typeof saved.seed !== 'number') return fresh();
    const seed = saved.seed >>> 0;
    const questions = buildQuiz(seed);
    const answers: Answers = {};
    for (const q of questions) {
      const a = saved.answers?.[q.id];
      if (a && q.options.some((o) => o.id === a)) answers[q.id] = a;
    }
    const phase = saved.phase === 'quiz' || saved.phase === 'result' ? saved.phase : 'landing';
    if (phase === 'result' && Object.keys(answers).length !== questions.length) return fresh();
    const index = Math.min(Math.max(Number(saved.index) || 0, 0), questions.length - 1);
    return { phase, seed, index, answers, direction: 'forward' };
  } catch {
    return fresh();
  }
}

function save(state: QuizState) {
  try {
    if (state.phase === 'landing' && Object.keys(state.answers).length === 0) sessionStorage.removeItem(STORAGE_KEY);
    else sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ phase: state.phase, seed: state.seed, index: state.index, answers: state.answers }));
  } catch {
    // Sin almacenamiento disponible: el test funciona igual, solo no se recupera al recargar.
  }
}

export function useQuiz() {
  const [state, setState] = useState<QuizState>(load);
  const questions = useMemo(() => buildQuiz(state.seed), [state.seed]);

  useEffect(() => save(state), [state]);

  const current = questions[state.index]!;
  const selected = state.answers[current.id];
  const isLast = state.index === questions.length - 1;

  const result: QuizResult | null = useMemo(
    () => (state.phase === 'result' ? computeResult(state.answers, questions) : null),
    [state.phase, state.answers, questions],
  );

  const start = useCallback(() => {
    track('quiz_start');
    setState((s) => ({ ...s, phase: 'quiz', direction: 'forward' }));
  }, []);

  const select = useCallback((questionId: string, optionId: string) => {
    setState((s) => ({ ...s, answers: { ...s.answers, [questionId]: optionId } }));
  }, []);

  const next = useCallback(() => {
    const s = state;
    const q = questions[s.index]!;
    if (!s.answers[q.id]) return; // Nunca avanza sin respuesta.
    if (s.index < questions.length - 1) {
      setState({ ...s, index: s.index + 1, direction: 'forward' });
      return;
    }
    const firstMissing = questions.findIndex((qq) => !s.answers[qq.id]);
    if (firstMissing !== -1) {
      setState({ ...s, index: firstMissing, direction: 'back' });
      return;
    }
    track('quiz_complete', { character: computeResult(s.answers, questions).winner });
    setState({ ...s, phase: 'result' });
  }, [state, questions]);

  const back = useCallback(() => {
    setState((s) => (s.index > 0 ? { ...s, index: s.index - 1, direction: 'back' } : s));
  }, []);

  const restart = useCallback(() => {
    track('quiz_restart');
    setState(fresh('quiz')); // Nuevo sorteo: otras preguntas, otro orden.
  }, []);

  const exit = useCallback(() => {
    setState((s) => ({ ...s, phase: 'landing' }));
  }, []);

  return {
    phase: state.phase,
    index: state.index,
    total: questions.length,
    direction: state.direction,
    answers: state.answers,
    current,
    selected,
    isLast,
    result,
    start,
    select,
    next,
    back,
    restart,
    exit,
  };
}
