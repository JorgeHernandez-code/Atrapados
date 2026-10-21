import type { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CHARACTERS, getCharacter, isCharacterId } from '../data/characters';
import { downloadCsv, leadsToCsv } from '../lib/csv';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  PAGE_SIZE,
  checkIsAdmin,
  deleteLead,
  fetchAllLeads,
  fetchLeads,
  fetchStats,
  getSession,
  onAuthChange,
  revokeConsent,
  signIn,
  signOut,
  type AdminStats,
  type LeadFilters,
} from '../services/admin';
import { isAnalyticsPersisted } from '../services/analytics';
import type { LeadRow } from '../types/lead';

type AuthState = 'loading' | 'signed_out' | 'checking' | 'forbidden' | 'admin' | 'error';

/**
 * Panel administrativo. La protección real está en la base de datos (RLS + is_admin()):
 * este componente solo muestra lo que el servidor permite a la sesión actual.
 */
export function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [auth, setAuth] = useState<AuthState>('loading');

  useEffect(() => {
    document.title = 'Panel · ATRAPADOS';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    getSession().then((s) => {
      if (!active) return;
      setSession(s);
      setReady(true);
    });
    const off = onAuthChange((s) => setSession(s));
    return () => {
      active = false;
      off();
    };
  }, []);

  // Cada vez que cambia la sesión se pregunta al servidor si es administradora.
  const userId = session?.user.id ?? null;
  useEffect(() => {
    if (!ready) return;
    if (!userId) {
      setAuth('signed_out');
      return;
    }
    let active = true;
    setAuth('checking');
    checkIsAdmin()
      .then((ok) => active && setAuth(ok ? 'admin' : 'forbidden'))
      .catch(() => active && setAuth('error'));
    return () => {
      active = false;
    };
  }, [ready, userId]);

  return (
    <div className="min-h-svh bg-ink">
      <header className="border-b border-paper/15">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
          <Link to="/" className="display text-2xl text-paper">
            ATRAPADOS <span className="text-volt">· Panel</span>
          </Link>
          {session && (
            <button type="button" onClick={() => signOut()} className="eyebrow text-ash hover:text-paper">
              Cerrar sesión
            </button>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
        {!isSupabaseConfigured ? (
          <Notice title="Supabase no está configurado">
            Faltan <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code>. Sin backend no hay datos que mostrar ni forma segura de autenticarse. Consulta{' '}
            <code>docs/CONFIGURACION.md</code>.
          </Notice>
        ) : auth === 'loading' || auth === 'checking' ? (
          <p role="status" className="text-ash">
            Verificando acceso…
          </p>
        ) : auth === 'signed_out' ? (
          <LoginForm />
        ) : auth === 'forbidden' ? (
          <Notice title="Sin permisos">
            Tu cuenta inició sesión, pero no está autorizada como administradora. Pide a quien administra el proyecto que la agregue a <code>admin_users</code>.
          </Notice>
        ) : auth === 'error' ? (
          <Notice title="No se pudo verificar el acceso">Revisa tu conexión y que la migración de la base de datos esté aplicada.</Notice>
        ) : (
          <Dashboard />
        )}
      </main>
    </div>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div role="alert" className="max-w-xl border-l-4 border-volt bg-ink-2 p-6">
      <h1 className="display text-3xl text-paper">{title}</h1>
      <p className="mt-3 leading-relaxed text-ash">{children}</p>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Escribe tu correo y tu contraseña.');
      return;
    }
    setBusy(true);
    setError(await signIn(email, password));
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="mx-auto mt-10 grid max-w-sm gap-5" noValidate>
      <h1 className="display text-5xl text-paper">Acceso del equipo</h1>
      <p className="text-sm text-ash">Solo para personas autorizadas. Las cuentas se crean desde Supabase.</p>
      <div>
        <label htmlFor="admin-email" className="mb-2 block text-sm font-semibold text-paper">
          Correo
        </label>
        <input id="admin-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
      </div>
      <div>
        <label htmlFor="admin-password" className="mb-2 block text-sm font-semibold text-paper">
          Contraseña
        </label>
        <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="field" />
      </div>
      <div aria-live="assertive">{error && <p className="text-sm text-alert">{error}</p>}</div>
      <button type="submit" disabled={busy} className="btn btn-primary">
        {busy ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}

const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)} %` : '—');

function Dashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch((e: Error) => setStatsError(e.message));
  }, []);

  return (
    <div className="grid gap-14">
      <section aria-labelledby="stats-title">
        <h1 id="stats-title" className="display text-5xl text-paper">
          Resumen
        </h1>
        {!isAnalyticsPersisted && (
          <p className="mt-3 max-w-2xl text-sm text-volt">
            Las métricas de uso están desactivadas en esta versión (VITE_ANALYTICS_ENABLED ≠ true): visitas, inicios y resultados no se están registrando. Los contactos sí se
            cuentan desde la base de datos.
          </p>
        )}
        {statsError && <p className="mt-4 text-alert">{statsError}</p>}
        {!stats && !statsError && <p className="mt-4 text-ash">Cargando estadísticas…</p>}
        {stats && (
          <>
            <dl className="mt-6 grid grid-cols-2 gap-px bg-paper/10 md:grid-cols-3 lg:grid-cols-6">
              <Stat label="Visitas (sesiones)" value={stats.landing_sessions} />
              <Stat label="Iniciaron el test" value={stats.quiz_start_sessions} />
              <Stat label="Completaron el test" value={stats.quiz_completed} hint={`${pct(stats.quiz_completed_sessions, stats.quiz_start_sessions)} de quienes iniciaron`} />
              <Stat label="Clics en compartir" value={stats.share_clicks} />
              <Stat label="Formularios enviados" value={stats.leads_total} hint={`${pct(stats.leads_total, stats.quiz_completed_sessions)} de quienes completaron`} />
              <Stat label="Contactos activos" value={stats.leads_active} hint="Sin revocación" />
            </dl>
            <CharacterBars counts={stats.results_by_character} />
          </>
        )}
      </section>
      <LeadsTable />
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="bg-ink-2 p-5">
      <dt className="text-xs font-semibold uppercase tracking-wider text-ash">{label}</dt>
      <dd className="display mt-3 text-5xl text-paper">{value.toLocaleString('es-CO')}</dd>
      {hint && <dd className="mt-2 text-xs text-ash">{hint}</dd>}
    </div>
  );
}

function CharacterBars({ counts }: { counts: Record<string, number> }) {
  const rows = CHARACTERS.map((c) => ({ id: c.id, name: c.name, n: counts[c.id] ?? 0 })).sort((a, b) => b.n - a.n || a.name.localeCompare(b.name));
  const max = Math.max(1, ...rows.map((r) => r.n));
  const total = rows.reduce((s, r) => s + r.n, 0);
  return (
    <figure className="mt-10">
      <figcaption className="text-lg font-bold text-paper">
        Resultados por personaje <span className="text-sm font-normal text-ash">· {total.toLocaleString('es-CO')} tests completados</span>
      </figcaption>
      <ul className="mt-5 grid gap-2">
        {rows.map((r) => (
          <li key={r.id} className="group grid grid-cols-[9.5rem_1fr_3.5rem] items-center gap-3 text-sm" title={`${r.name}: ${r.n} (${pct(r.n, total)})`}>
            <span className="truncate text-paper">{r.name}</span>
            <span className="h-4 bg-paper/5" aria-hidden="true">
              <span className="block h-full rounded-r-[4px] bg-volt transition-opacity group-hover:opacity-80" style={{ width: `${(r.n / max) * 100}%` }} />
            </span>
            <span className="text-right tabular-nums text-ash">
              {r.n}
              <span className="sr-only"> resultados, {pct(r.n, total)}</span>
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

const EMPTY_FILTERS: LeadFilters = { search: '', character: '', consent: 'all' };

function LeadsTable() {
  const [filters, setFilters] = useState<LeadFilters>(EMPTY_FILTERS);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Búsqueda con espera breve para no consultar en cada tecla.
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => (f.search === search ? f : { ...f, search }));
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchLeads(filters, page)
      .then(({ rows, total }) => {
        setRows(rows);
        setTotal(total);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filters, page]);

  useEffect(load, [load]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const all = await fetchAllLeads(filters);
      downloadCsv(`atrapados-contactos-${new Date().toISOString().slice(0, 10)}.csv`, leadsToCsv(all));
      setMessage(`${all.length} contactos exportados. Guarda el archivo en un lugar seguro y bórralo cuando ya no lo necesites.`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setExporting(false);
    }
  };

  const act = async (row: LeadRow, action: 'revoke' | 'delete') => {
    const question =
      action === 'revoke'
        ? `¿Registrar que ${row.name} revocó su autorización? No se le debe volver a contactar.`
        : `¿Eliminar definitivamente a ${row.name}? Esta acción no se puede deshacer.`;
    if (!window.confirm(question)) return;
    try {
      if (action === 'revoke') await revokeConsent(row.id);
      else await deleteLead(row.id);
      setMessage(action === 'revoke' ? 'Revocación registrada.' : 'Contacto eliminado.');
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const fmt = (iso: string) => new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <section aria-labelledby="leads-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="leads-title" className="display text-5xl text-paper">
          Contactos <span className="text-ash">({total.toLocaleString('es-CO')})</span>
        </h2>
        <button type="button" onClick={exportCsv} disabled={exporting || total === 0} className="btn btn-primary">
          {exporting ? 'Exportando…' : 'Exportar CSV'}
        </button>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <label htmlFor="f-search" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ash">
            Buscar por nombre
          </label>
          <input id="f-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} className="field" />
        </div>
        <div>
          <label htmlFor="f-char" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ash">
            Personaje
          </label>
          <select
            id="f-char"
            value={filters.character}
            onChange={(e) => {
              setFilters((f) => ({ ...f, character: isCharacterId(e.target.value) ? e.target.value : '' }));
              setPage(0);
            }}
            className="field"
          >
            <option value="">Todos</option>
            {CHARACTERS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-consent" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ash">
            Consentimiento
          </label>
          <select
            id="f-consent"
            value={filters.consent}
            onChange={(e) => {
              setFilters((f) => ({ ...f, consent: e.target.value as LeadFilters['consent'] }));
              setPage(0);
            }}
            className="field"
          >
            <option value="all">Todos</option>
            <option value="active">Vigente</option>
            <option value="revoked">Revocado</option>
          </select>
        </div>
      </div>

      <div aria-live="polite" className="mt-4 min-h-6 text-sm">
        {error && <p className="text-alert">{error}</p>}
        {!error && message && <p className="text-volt">{message}</p>}
      </div>

      <div className="mt-2 overflow-x-auto border border-paper/15">
        <table className="w-full min-w-[760px] text-left text-sm">
          <caption className="sr-only">Contactos autorizados</caption>
          <thead className="bg-ink-2 text-xs uppercase tracking-wider text-ash">
            <tr>
              <th scope="col" className="px-4 py-3">Nombre</th>
              <th scope="col" className="px-4 py-3">Celular</th>
              <th scope="col" className="px-4 py-3">Personaje</th>
              <th scope="col" className="px-4 py-3">Registro</th>
              <th scope="col" className="px-4 py-3">Consentimiento</th>
              <th scope="col" className="px-4 py-3"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-ash">Cargando…</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-ash">No hay contactos con estos filtros.</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t border-paper/10 align-top">
                  <td className="px-4 py-3 font-semibold text-paper">{r.name}</td>
                  <td className="px-4 py-3 tabular-nums text-paper">{r.phone}</td>
                  <td className="px-4 py-3 text-paper/85">{isCharacterId(r.preferred_character) ? getCharacter(r.preferred_character).name : '—'}</td>
                  <td className="px-4 py-3 text-ash">{fmt(r.created_at)}</td>
                  <td className="px-4 py-3">
                    {r.consent_revoked_at ? (
                      <span className="text-alert">✕ Revocado {fmt(r.consent_revoked_at)}</span>
                    ) : (
                      <span className="text-paper">
                        ✓ Vigente <span className="block text-xs text-ash">{fmt(r.consented_at)} · {r.consent_text_version}</span>
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {!r.consent_revoked_at && (
                      <button type="button" onClick={() => act(r, 'revoke')} className="mr-3 text-xs font-semibold text-ash underline hover:text-paper">
                        Revocar
                      </button>
                    )}
                    <button type="button" onClick={() => act(r, 'delete')} className="text-xs font-semibold text-alert underline">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <nav aria-label="Paginación" className="mt-4 flex items-center justify-between text-sm text-ash">
        <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="btn btn-ghost min-h-0 px-4 py-2 text-xs">
          ← Anterior
        </button>
        <span>
          Página {page + 1} de {pages}
        </span>
        <button type="button" disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)} className="btn btn-ghost min-h-0 px-4 py-2 text-xs">
          Siguiente →
        </button>
      </nav>
    </section>
  );
}
