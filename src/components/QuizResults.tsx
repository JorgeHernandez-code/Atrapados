import { useEffect, useRef } from 'react';
import { getCharacter } from '../data/characters';
import { EVENT, SITE } from '../config/site';
import { affinityPercent, type QuizResult } from '../lib/scoring';
import { track } from '../services/analytics';
import { CharacterCard } from './CharacterCard';
import { ShareResult } from './ShareResult';

interface QuizResultsProps {
  result: QuizResult;
  onRestart: () => void;
}

export function QuizResults({ result, onRestart }: QuizResultsProps) {
  const character = getCharacter(result.winner);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const winnerScore = result.ranking[0]!;
  const others = result.ranking.slice(1, 4).filter((r) => r.score > 0);
  const tied = result.tiedWith.map((id) => getCharacter(id).name);
  const reasons = result.contributions.slice(0, 4);

  useEffect(() => {
    track('result_view', { character: result.winner });
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [result.winner]);

  return (
    <section aria-labelledby="result-title" className="relative overflow-hidden bg-ink pb-24 pt-10 sm:pt-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="flex items-center justify-between">
          <p className="display text-xl text-paper">{SITE.playTitle}</p>
          <button type="button" onClick={onRestart} className="eyebrow text-ash hover:text-paper">
            Repetir test
          </button>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
          <div className="animate-rise">
            <h2 id="result-title" ref={headingRef} tabIndex={-1} className="outline-none">
              <span className="eyebrow block text-volt">Tu personaje es…</span>
              <span className="sr-only">{character.name}</span>
            </h2>
            <div className="mt-6 -rotate-1">
              <CharacterCard character={character} />
            </div>
          </div>

          <div className="animate-rise [animation-delay:.15s]">
            <p className="text-2xl font-semibold leading-snug text-paper sm:text-3xl">
              Tu resultado sugiere una afinidad con <span className="bg-volt px-1.5 text-ink">{character.name}</span>.
            </p>
            <p className="mt-3 text-lg text-ash">Tu manera de reaccionar tiene algo en común con este personaje.</p>

            <p className="mt-8 text-lg leading-relaxed text-paper/90">{character.description}</p>

            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Rasgos del personaje">
              {character.traits.map((t) => (
                <li key={t} className="border border-paper/30 px-3 py-1.5 text-sm font-semibold text-paper">
                  {t}
                </li>
              ))}
            </ul>

            <figure className="mt-10 border-l-4 border-volt pl-5">
              <blockquote className="display text-[clamp(1.8rem,6vw,2.8rem)] leading-[1.05] text-paper">“{character.quote}”</blockquote>
              <figcaption className="mt-3 text-xs text-ash">Frase creada para esta experiencia. No es un diálogo de la obra.</figcaption>
            </figure>

            {/* Indicador de afinidad */}
            <div className="mt-12">
              <h3 className="eyebrow text-ash">Afinidad en este test</h3>
              <AffinityBar label={character.name} value={affinityPercent(winnerScore)} highlight />
              {others.length > 0 && (
                <>
                  <p className="mt-6 text-sm text-ash">En este test, también te pareces a:</p>
                  {others.map((r) => (
                    <AffinityBar key={r.id} label={getCharacter(r.id).name} value={affinityPercent(r)} />
                  ))}
                </>
              )}
              <p className="mt-4 text-xs leading-relaxed text-ash">
                El porcentaje indica qué parte de las respuestas asociadas a cada personaje elegiste. No es una probabilidad ni una medición psicológica.
              </p>
              {tied.length > 0 && (
                <p className="mt-4 border border-volt/50 p-3 text-sm text-paper">
                  {result.tieBreak === 'seeded'
                    ? `Tu resultado quedó compartido con ${tied.join(' y ')}. Para elegir uno se usó un sorteo reproducible a partir de tus respuestas: no es una conclusión sobre ti.`
                    : `Empataste con ${tied.join(' y ')}. Se desempató por ${result.tieBreak === 'primary-hits' ? 'las respuestas que más se parecen a cada personaje' : 'tu respuesta a la última pregunta'}.`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Explicación */}
        {reasons.length > 0 && (
          <div className="mt-20">
            <h3 className="display text-[clamp(2.4rem,8vw,4.5rem)] text-paper">
              ¿Por qué <span className="text-volt">{character.name}</span>?
            </h3>
            <p className="mt-3 max-w-2xl text-ash">Estas respuestas fueron las que más te acercaron a este personaje:</p>
            <ol className="mt-8 grid gap-px bg-paper/10 md:grid-cols-2">
              {reasons.map((r) => (
                <li key={r.questionId} className="bg-ink-2 p-6">
                  <p className="eyebrow text-volt">{r.note}</p>
                  <p className="mt-3 text-sm text-ash">{r.questionText}</p>
                  <p className="mt-2 font-semibold text-paper">“{r.optionText}”</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        <p className="mt-10 max-w-2xl text-sm leading-relaxed text-ash">
          Este resultado es un juego inspirado en la obra: no define tu personalidad ni es un diagnóstico. Todas las personas tenemos algo de varios personajes.
        </p>

        {/* Compartir */}
        <div className="mt-16 grid gap-10 border-t border-paper/15 pt-12 md:grid-cols-2">
          <div>
            <h3 className="display text-5xl text-paper">Compártelo</h3>
            <p className="mt-3 text-ash">Reta a tus amigos: ¿a quién se parecen ellos?</p>
            <div className="mt-6">
              <ShareResult character={character} />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-8 bg-volt p-7 text-ink sm:p-9">
            <div>
              <p className="eyebrow">Recomienda la obra</p>
              <p className="display mt-3 text-5xl">{SITE.playTitle}</p>
              <p className="mt-3 font-semibold">{SITE.tagline}</p>
              <p className="mt-4 text-sm">
                {EVENT.dayLabel} de {EVENT.monthLabel.toLowerCase()} · {EVENT.timeLabel}
                <br />
                {EVENT.venue}, {EVENT.city}
              </p>
            </div>
            <button type="button" onClick={onRestart} className="btn self-start border-2 border-ink text-ink hover:bg-ink hover:text-volt">
              Repetir el test
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function AffinityBar({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="mt-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className={highlight ? 'text-lg font-bold text-paper' : 'text-sm font-medium text-paper/80'}>{label}</span>
        <span className={highlight ? 'display text-3xl text-volt' : 'text-sm text-ash'}>{value} %</span>
      </div>
      <div className={`mt-1.5 bg-paper/10 ${highlight ? 'h-3' : 'h-1.5'}`} aria-hidden="true">
        <div className={`h-full origin-left animate-[grow_1s_cubic-bezier(.2,.7,.2,1)_both] ${highlight ? 'bg-volt' : 'bg-ash'}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
