import { EVENT, SITE } from '../config/site';
import { TornEdge } from './TornEdge';

interface HeroProps {
  onStart: () => void;
  /** Personaje que obtuvo quien compartió el enlace (parámetro ?r=), solo informativo. */
  sharedCharacterName?: string | null;
}

export function Hero({ onStart, sharedCharacterName }: HeroProps) {
  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-svh flex-col overflow-hidden bg-ink">
      {/* Rasgado amarillo vertical, como en el flyer */}
      <svg
        aria-hidden="true"
        className="animate-tear absolute right-[-6vw] top-0 -z-10 h-[30%] w-[34vw] text-volt sm:right-[7%] sm:h-[62%] sm:w-[min(24vw,300px)]"
        viewBox="0 0 100 300"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M4 0 H96 L91 18 L97 34 L88 52 L93 70 L84 92 L90 108 L78 130 L84 150 L71 172 L76 192 L64 214 L67 236 L57 256 L59 276 L51 300 L46 280 L40 262 L43 240 L33 220 L37 198 L25 178 L30 156 L19 136 L24 116 L13 96 L18 76 L8 56 L13 38 L3 20 Z"
        />
        <path fill="#080808" opacity=".9" d="M48 0 L52 0 L55 40 L49 80 L56 120 L50 165 L53 210 L50 300 L47 210 L44 165 L50 120 L43 80 L49 40 Z" />
      </svg>
      <div aria-hidden="true" className="absolute inset-0 -z-20 bg-[radial-gradient(70%_50%_at_50%_30%,rgba(255,245,43,.10),transparent_70%)]" />

      <div id="contenido" className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-4 pb-16 pt-28 sm:px-8 sm:pb-20">
        <p className="eyebrow mb-6 max-w-[15rem] text-ash sm:max-w-md">{SITE.credits}</p>

        {sharedCharacterName && (
          <p className="animate-rise mb-6 inline-block max-w-md self-start border-l-4 border-volt bg-ink-2/90 px-4 py-3 text-sm text-paper">
            A quien te envió este enlace le salió <strong className="text-volt">{sharedCharacterName}</strong>. ¿Y a ti?
          </p>
        )}

        <h1 id="hero-title" className="animate-rise">
          <span className="display block text-[clamp(4.4rem,21vw,13rem)] text-paper [text-shadow:0_6px_30px_rgba(0,0,0,.6)]">
            {SITE.playTitle}
          </span>
          <span className="mt-3 inline-block -rotate-2 bg-volt px-3 py-2 text-ink shadow-[6px_6px_0_0_#080808] sm:px-5">
            <span className="display block text-[clamp(1.9rem,8vw,4.2rem)]">¿Qué personaje eres?</span>
          </span>
        </h1>

        <p className="animate-rise mt-8 max-w-xl text-lg leading-relaxed text-paper/90 [animation-delay:.12s] sm:text-xl">
          “Las decisiones que tomamos, lo que ocultamos y nuestra manera de reaccionar dicen más de nosotros de lo que imaginamos”.
        </p>

        <div className="animate-rise mt-9 flex flex-col items-start gap-4 [animation-delay:.2s] sm:flex-row sm:items-center sm:gap-7">
          <button type="button" onClick={onStart} className="btn btn-primary w-full text-base sm:w-auto">
            Descubrir mi personaje
            <span aria-hidden="true">→</span>
          </button>
          <p className="text-sm font-medium text-ash">Un test teatral. Un resultado inesperado.</p>
        </div>

        <p className="mt-8 max-w-lg text-xs leading-relaxed text-ash">
          Esta actividad es recreativa y no constituye una evaluación psicológica ni un diagnóstico.
        </p>

        <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-paper/15 pt-5 text-sm">
          <div className="flex items-baseline gap-2">
            <dt className="sr-only">Fecha</dt>
            <dd className="display text-3xl text-volt">{EVENT.dayLabel}</dd>
            <dd className="eyebrow text-paper">
              {EVENT.monthLabel} · {EVENT.timeLabel}
            </dd>
          </div>
          <div>
            <dt className="sr-only">Lugar</dt>
            <dd className="font-semibold text-paper">
              {EVENT.venue}, {EVENT.city}
            </dd>
            <dd className="text-ash">{EVENT.address}</dd>
          </div>
        </dl>
      </div>
      <TornEdge className="text-ink-2" seed={3} />
    </section>
  );
}
