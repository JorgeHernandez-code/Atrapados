interface QuizProgressProps {
  index: number;
  total: number;
  answeredCount: number;
}

export function QuizProgress({ index, total, answeredCount }: QuizProgressProps) {
  const current = index + 1;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="eyebrow text-ash">
          Pregunta{' '}
          <span className="display ml-1 text-2xl tracking-normal text-volt">{String(current).padStart(2, '0')}</span>
          <span className="text-ash"> / {String(total).padStart(2, '0')}</span>
        </p>
        <p className="text-xs text-ash" aria-hidden="true">
          {Math.round((answeredCount / total) * 100)} %
        </p>
      </div>
      <div
        role="progressbar"
        aria-label="Progreso del test"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={answeredCount}
        aria-valuetext={`${answeredCount} de ${total} preguntas respondidas`}
        className="mt-3 flex gap-1"
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 origin-left transition-all duration-300 ${
              i === index ? 'scale-y-[2] bg-paper' : i < answeredCount || i < index ? 'bg-volt' : 'bg-paper/15'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
