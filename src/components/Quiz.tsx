import { useState, type FormEvent } from 'react';
import type { Question } from '../types/question';
import { QuizProgress } from './QuizProgress';
import { QuizQuestion } from './QuizQuestion';

interface QuizProps {
  question: Question;
  index: number;
  total: number;
  answeredCount: number;
  selected: string | undefined;
  direction: 'forward' | 'back';
  isLast: boolean;
  onSelect: (questionId: string, optionId: string) => void;
  onNext: () => void;
  onBack: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export function Quiz(props: QuizProps) {
  const { question, index, total, answeredCount, selected, direction, isLast } = props;
  const [confirmRestart, setConfirmRestart] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (selected) props.onNext();
  };

  return (
    <section aria-label="Test: ¿Qué personaje de ATRAPADOS eres?" className="relative flex min-h-svh flex-col bg-ink">
      <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-full w-2 bg-volt sm:w-3" />

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-8 pt-5 sm:px-8 sm:pt-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <button type="button" onClick={props.onExit} className="display text-xl text-paper hover:text-volt" aria-label="Salir del test y volver al inicio">
            ATRAPADOS
          </button>
          {confirmRestart ? (
            <div className="flex items-center gap-3 text-sm" role="group" aria-label="Confirmar reinicio">
              <span className="text-ash">¿Borrar respuestas?</span>
              <button
                type="button"
                className="font-bold text-volt underline"
                onClick={() => {
                  setConfirmRestart(false);
                  props.onRestart();
                }}
              >
                Sí, reiniciar
              </button>
              <button type="button" className="text-paper underline" onClick={() => setConfirmRestart(false)}>
                No
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmRestart(true)} className="eyebrow text-ash hover:text-paper" disabled={answeredCount === 0}>
              Reiniciar
            </button>
          )}
        </div>

        <QuizProgress index={index} total={total} answeredCount={answeredCount} />

        <form onSubmit={submit} className="mt-10 flex flex-1 flex-col sm:mt-14" noValidate>
          <QuizQuestion
            key={question.id}
            question={question}
            number={index + 1}
            selected={selected}
            direction={direction}
            onSelect={(optionId) => props.onSelect(question.id, optionId)}
          />

          <div className="sticky bottom-0 -mx-4 mt-auto flex items-center justify-between gap-3 bg-gradient-to-t from-ink via-ink to-ink/0 px-4 pb-2 pt-8 sm:static sm:mx-0 sm:bg-none sm:px-0">
            <button type="button" onClick={props.onBack} disabled={index === 0} className="btn btn-ghost px-4 sm:px-6">
              <span aria-hidden="true">←</span> Anterior
            </button>
            <button type="submit" disabled={!selected} className="btn btn-primary flex-1 sm:flex-none" aria-describedby={!selected ? 'hint-select' : undefined}>
              {isLast ? 'Ver mi resultado' : 'Continuar'} <span aria-hidden="true">→</span>
            </button>
          </div>
          <p id="hint-select" className={`mt-3 text-center text-xs text-ash sm:text-right ${selected ? 'invisible' : ''}`}>
            Elige una opción para continuar.
          </p>
        </form>
      </div>
    </section>
  );
}
