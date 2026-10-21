import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { LeadForm } from '../components/LeadForm';
import { PlaySection } from '../components/PlaySection';
import { Quiz } from '../components/Quiz';
import { QuizIntro } from '../components/QuizIntro';
import { QuizResults } from '../components/QuizResults';
import { getCharacter, isCharacterId } from '../data/characters';
import { useQuiz } from '../hooks/useQuiz';
import { track } from '../services/analytics';

export function HomePage() {
  const quiz = useQuiz();
  const [params] = useSearchParams();
  const shared = params.get('r');
  const sharedName = isCharacterId(shared) ? getCharacter(shared).name : null;

  useEffect(() => {
    track('landing_view', {}, { oncePerSession: true });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [quiz.phase]);

  useEffect(() => {
    document.title =
      quiz.phase === 'result' && quiz.result
        ? `Mi personaje: ${getCharacter(quiz.result.winner).name} · ATRAPADOS`
        : 'ATRAPADOS · ¿Qué personaje eres?';
  }, [quiz.phase, quiz.result]);

  if (quiz.phase === 'quiz') {
    return (
      <main>
        <Quiz
          question={quiz.current}
          index={quiz.index}
          total={quiz.total}
          answeredCount={Object.keys(quiz.answers).length}
          selected={quiz.selected}
          direction={quiz.direction}
          isLast={quiz.isLast}
          onSelect={quiz.select}
          onNext={quiz.next}
          onBack={quiz.back}
          onRestart={quiz.restart}
          onExit={quiz.exit}
        />
      </main>
    );
  }

  if (quiz.phase === 'result' && quiz.result) {
    return (
      <div className="flex min-h-svh flex-col">
        <main>
          <QuizResults result={quiz.result} onRestart={quiz.restart} />
          <section aria-labelledby="lead-title" className="bg-ink-2 py-20 sm:py-24">
            <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
              <div>
                <p className="eyebrow text-volt">Opcional</p>
                <h2 id="lead-title" className="display mt-3 text-[clamp(2.4rem,8vw,4.2rem)] leading-[0.98] text-paper">
                  ¿Quieres seguir conectado con ATRAPADOS?
                </h2>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-ash">
                  Déjanos tus datos si quieres recibir información sobre nuevas funciones, actividades y próximos proyectos teatrales.
                </p>
                <p className="mt-4 max-w-md text-sm text-ash">Solo te pedimos nombre y celular. Nada de correos, documentos ni direcciones.</p>
              </div>
              <LeadForm characterId={quiz.result.winner} />
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col">
      <Header onStart={quiz.start} />
      <main>
        <Hero onStart={quiz.start} sharedCharacterName={sharedName} />
        <QuizIntro totalQuestions={quiz.total} onStart={quiz.start} />
        <PlaySection />
      </main>
      <Footer />
    </div>
  );
}
