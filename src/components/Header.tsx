import { Link } from 'react-router-dom';
import { SITE } from '../config/site';

interface HeaderProps {
  onStart?: () => void;
}

export function Header({ onStart }: HeaderProps) {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-volt focus:px-4 focus:py-2 focus:text-ink">
        Saltar al contenido
      </a>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
        <Link to="/" className="display text-2xl tracking-wide text-paper" aria-label={`${SITE.playTitle}, inicio`}>
          {SITE.playTitle}
        </Link>
        {onStart && (
          <button type="button" onClick={onStart} className="eyebrow bg-ink px-3 py-2 text-volt ring-2 ring-volt transition hover:bg-volt hover:text-ink">
            Hacer el test
          </button>
        )}
      </div>
    </header>
  );
}
