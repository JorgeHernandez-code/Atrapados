import { useEffect, useRef } from 'react';
import type { Question } from '../types/question';

interface QuizQuestionProps {
  question: Question;
  number: number;
  selected: string | undefined;
  direction: 'forward' | 'back';
  onSelect: (optionId: string) => void;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export function QuizQuestion({ question, number, selected, direction, onSelect }: QuizQuestionProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Al cambiar de pregunta, el foco va al enunciado para lectores de pantalla y teclado.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [question.id]);

  const name = `pregunta-${question.id}`;
  const headingId = `${name}-titulo`;

  return (
    <div className={direction === 'forward' ? 'animate-slide-in' : 'animate-slide-back'}>
      <h2 id={headingId} ref={headingRef} tabIndex={-1} className="text-[clamp(1.6rem,5.6vw,2.6rem)] font-bold leading-[1.15] text-paper outline-none">
        <span className="sr-only">Pregunta {number}. </span>
        {question.text}
      </h2>
      {question.hint && <p className="mt-3 text-sm text-ash">{question.hint}</p>}

      <div role="radiogroup" aria-labelledby={headingId} className="mt-8 grid gap-3">
        {question.options.map((option, i) => {
          const id = `${name}-${option.id}`;
          const isSelected = selected === option.id;
          return (
            <div key={option.id} className="relative">
              <input
                type="radio"
                id={id}
                name={name}
                value={option.id}
                checked={isSelected}
                onChange={() => onSelect(option.id)}
                className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              <label
                htmlFor={id}
                className={`flex min-h-[3.75rem] items-start gap-4 border-2 px-4 py-3.5 text-left transition-all duration-200 peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-volt sm:px-5 sm:py-4 ${
                  isSelected
                    ? '-rotate-[0.6deg] border-volt bg-volt text-ink shadow-[5px_5px_0_0_#fff]'
                    : 'border-paper/20 bg-ink-2 text-paper hover:-translate-y-0.5 hover:border-paper/60'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`display mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center text-lg ${
                    isSelected ? 'bg-ink text-volt' : 'border border-paper/30 text-ash'
                  }`}
                >
                  {LETTERS[i]}
                </span>
                <span className="text-base font-medium leading-snug sm:text-lg">{option.text}</span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
