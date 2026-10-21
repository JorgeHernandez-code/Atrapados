import { Link } from 'react-router-dom';
import { CONTACT, SITE } from '../config/site';
import { TornEdge } from './TornEdge';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-auto bg-paper text-ink">
      <TornEdge side="top" className="absolute -top-[13px] left-0 text-paper" seed={7} />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="display text-6xl sm:text-7xl">{SITE.playTitle}</p>
          <p className="mt-3 max-w-sm text-lg font-semibold leading-snug">{SITE.tagline}</p>
          <p className="mt-6 text-sm text-ink/70">
            {SITE.credits}
            <br />
            {SITE.institution}
          </p>
        </div>

        <div>
          <h2 className="eyebrow mb-4 text-ink/60">Contacto</h2>
          {CONTACT.email || CONTACT.phone ? (
            <ul className="space-y-2 text-sm font-medium">
              {CONTACT.email && (
                <li>
                  <a className="underline hover:bg-volt" href={`mailto:${CONTACT.email}`}>
                    {CONTACT.email}
                  </a>
                </li>
              )}
              {CONTACT.phone && <li>{CONTACT.phone}</li>}
            </ul>
          ) : (
            <p className="text-sm text-ink/60">Datos de contacto próximamente.</p>
          )}
          {CONTACT.social.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-3">
              {CONTACT.social.map((s) => (
                <li key={s.url}>
                  <a className="eyebrow border-2 border-ink px-3 py-2 hover:bg-ink hover:text-paper" href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="eyebrow mb-4 text-ink/60">Información</h2>
          <ul className="space-y-2 text-sm font-medium">
            <li>
              <Link className="underline hover:bg-volt" to="/privacidad">
                Política de tratamiento de datos
              </Link>
            </li>
          </ul>
          <p className="mt-5 text-xs leading-relaxed text-ink/60">
            El test es una actividad recreativa inspirada en los personajes de la obra. No constituye una evaluación psicológica ni un diagnóstico.
          </p>
        </div>
      </div>
      <div className="border-t border-ink/15">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-ink/60 sm:px-8">
          © {year} {SITE.playTitle} · Experiencia digital creada para acompañar la obra.
        </p>
      </div>
    </footer>
  );
}
