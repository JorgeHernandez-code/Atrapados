import { EVENT, SITE } from '../config/site';

export function PlaySection() {
  return (
    <section aria-labelledby="obra-title" className="relative overflow-hidden bg-ink py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <figure className="relative mx-auto w-full max-w-sm -rotate-2 md:max-w-none">
          <span aria-hidden="true" className="absolute -top-3 left-1/2 z-10 h-7 w-28 -translate-x-1/2 rotate-3 bg-paper/80" />
          <img
            src={SITE.flyer.srcSmall}
            srcSet={`${SITE.flyer.srcSmall} 640w, ${SITE.flyer.src} 1080w`}
            sizes="(min-width: 768px) 40vw, 90vw"
            width={1080}
            height={1350}
            loading="lazy"
            decoding="async"
            alt={SITE.flyer.alt}
            className="block h-auto w-full shadow-[12px_12px_0_0_#fff52b]"
          />
        </figure>

        <div>
          <p className="eyebrow text-volt">La obra</p>
          <h2 id="obra-title" className="display mt-3 text-[clamp(3rem,10vw,6.5rem)] text-paper">
            {SITE.playTitle}
          </h2>
          <p className="mt-5 text-2xl font-semibold leading-snug text-paper">{SITE.tagline}</p>
          <p className="mt-6 max-w-xl leading-relaxed text-ash">{SITE.academicNote}</p>

          <dl className="mt-10 grid gap-6 border-t border-paper/15 pt-8 sm:grid-cols-2">
            <div>
              <dt className="eyebrow text-ash">Fecha</dt>
              <dd className="mt-2 text-paper">
                <span className="display mr-2 text-5xl text-volt">{EVENT.dayLabel}</span>
                <span className="font-semibold">
                  {EVENT.monthLabel} · {EVENT.timeLabel}
                </span>
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-ash">Lugar</dt>
              <dd className="mt-2 font-semibold text-paper">
                {EVENT.venue}
                <br />
                <span className="font-normal text-ash">
                  {EVENT.city} · {EVENT.address}
                </span>
              </dd>
            </div>
          </dl>
          <p className="mt-8 text-sm text-ash">
            {SITE.credits} · {SITE.institution}
          </p>
        </div>
      </div>
    </section>
  );
}
