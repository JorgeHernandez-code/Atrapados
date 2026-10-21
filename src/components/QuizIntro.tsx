interface QuizIntroProps {
  totalQuestions: number;
  onStart: () => void;
}

const STEPS = [
  { title: 'Situaciones cotidianas', text: 'Responderás preguntas sobre cómo actúas en momentos del día a día.' },
  { title: 'Sin respuestas correctas', text: 'No hay respuestas buenas ni malas. Nadie te va a juzgar.' },
  { title: 'Elige lo que más se parezca a ti', text: 'Si dudas, quédate con tu primer impulso. Puedes volver atrás y cambiar.' },
  { title: 'Descubre tu afinidad', text: 'Al final verás con qué personaje de ATRAPADOS tienes más en común.' },
];

export function QuizIntro({ totalQuestions, onStart }: QuizIntroProps) {
  return (
    <section aria-labelledby="intro-title" className="bg-ink-2 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 id="intro-title" className="display text-[clamp(3rem,10vw,6rem)] text-paper">
            Cómo <span className="text-volt">funciona</span>
          </h2>
          <p className="max-w-sm text-ash">
            {totalQuestions} preguntas · entre 2 y 4 minutos. Cada test es distinto: las preguntas se sortean cada vez. Todos estamos atrapados en algo: descubre qué personaje refleja tu manera de pensar, sentir y actuar.
          </p>
        </div>

        <ol className="mt-12 grid gap-px bg-paper/10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="group bg-ink-2 p-6 transition-colors hover:bg-ink-3 sm:p-8">
              <span aria-hidden="true" className="display block text-7xl text-volt transition-transform group-hover:-translate-y-1">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-5 text-lg font-bold text-paper">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ash">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <button type="button" onClick={onStart} className="btn btn-primary w-full sm:w-auto">
            Empezar el test <span aria-hidden="true">→</span>
          </button>
          <p className="text-sm text-ash">No necesitas registrarte para ver tu resultado.</p>
        </div>
      </div>
    </section>
  );
}
