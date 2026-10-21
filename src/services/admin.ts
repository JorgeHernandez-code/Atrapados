import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from '../lib/supabase';
import type { CharacterId } from '../types/character';
import type { LeadRow } from '../types/lead';

/**
 * Operaciones del panel. Todas usan la sesión del administrador: la base de datos
 * (RLS + is_admin()) decide qué puede ver. Sin sesión de administrador, no hay datos.
 */

export interface AdminStats {
  landing_sessions: number;
  quiz_start_sessions: number;
  quiz_completed: number;
  quiz_completed_sessions: number;
  result_views: number;
  restarts: number;
  share_clicks: number;
  share_by_channel: Record<string, number>;
  lead_submit_events: number;
  leads_total: number;
  leads_active: number;
  results_by_character: Record<CharacterId, number>;
  leads_by_character: Record<CharacterId, number>;
  first_event_at: string | null;
  last_event_at: string | null;
}

export interface LeadFilters {
  search: string;
  character: CharacterId | '';
  consent: 'all' | 'active' | 'revoked';
}

export const PAGE_SIZE = 25;
const COLUMNS = 'id,name,phone,preferred_character,consent_given,consent_text_version,consented_at,consent_revoked_at,created_at';

async function client(): Promise<SupabaseClient> {
  const supabase = await getSupabase();
  if (!supabase) throw new Error('Supabase no está configurado.');
  return supabase;
}

export async function getSession(): Promise<Session | null> {
  const supabase = await getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthChange(cb: (session: Session | null) => void): () => void {
  let unsubscribe: (() => void) | null = null;
  let cancelled = false;
  void getSupabase().then((supabase) => {
    if (!supabase || cancelled) return;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session));
    unsubscribe = () => data.subscription.unsubscribe();
  });
  return () => {
    cancelled = true;
    unsubscribe?.();
  };
}

export async function signIn(email: string, password: string): Promise<string | null> {
  const { error } = await (await client()).auth.signInWithPassword({ email: email.trim(), password });
  if (!error) return null;
  if (/invalid/i.test(error.message)) return 'Correo o contraseña incorrectos.';
  if (/rate|too many/i.test(error.message)) return 'Demasiados intentos. Espera unos minutos.';
  return 'No se pudo iniciar sesión. Inténtalo de nuevo.';
}

export async function signOut(): Promise<void> {
  await (await getSupabase())?.auth.signOut();
}

export async function checkIsAdmin(): Promise<boolean> {
  const { data, error } = await (await client()).rpc('is_admin');
  if (error) throw new Error('No se pudo verificar los permisos.');
  return data === true;
}

export async function fetchStats(): Promise<AdminStats> {
  const { data, error } = await (await client()).rpc('admin_stats');
  if (error) throw new Error(error.code === '42501' ? 'Sin permisos para ver estadísticas.' : 'No se pudieron cargar las estadísticas.');
  return data as AdminStats;
}

/** Escapa los comodines de LIKE para que la búsqueda sea literal. */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (m) => `\\${m}`);
}

/** Consulta de contactos con filtros, ordenada del más reciente al más antiguo. */
function leadsQuery(supabase: SupabaseClient, f: LeadFilters, withCount: boolean) {
  let q = supabase.from('leads').select(COLUMNS, withCount ? { count: 'exact' } : undefined);
  const term = f.search.trim();
  if (term) q = q.ilike('name', `%${escapeLike(term)}%`);
  if (f.character) q = q.eq('preferred_character', f.character);
  if (f.consent === 'active') q = q.is('consent_revoked_at', null);
  if (f.consent === 'revoked') q = q.not('consent_revoked_at', 'is', null);
  return q.order('created_at', { ascending: false });
}

export async function fetchLeads(filters: LeadFilters, page: number): Promise<{ rows: LeadRow[]; total: number }> {
  const from = page * PAGE_SIZE;
  const { data, error, count } = await leadsQuery(await client(), filters, true).range(from, from + PAGE_SIZE - 1);
  if (error) throw new Error('No se pudieron cargar los contactos.');
  return { rows: (data ?? []) as LeadRow[], total: count ?? 0 };
}

/** Todos los contactos que coinciden con el filtro (para exportar), en bloques de 1000. */
export async function fetchAllLeads(filters: LeadFilters): Promise<LeadRow[]> {
  const rows: LeadRow[] = [];
  const supabase = await client();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await leadsQuery(supabase, filters, false).range(from, from + 999);
    if (error) throw new Error('No se pudieron exportar los contactos.');
    rows.push(...((data ?? []) as LeadRow[]));
    if (!data || data.length < 1000) break;
  }
  return rows;
}

export async function revokeConsent(id: string): Promise<void> {
  const { error } = await (await client()).from('leads').update({ consent_revoked_at: new Date().toISOString() }).eq('id', id);
  if (error) throw new Error('No se pudo registrar la revocación.');
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await (await client()).from('leads').delete().eq('id', id);
  if (error) throw new Error('No se pudo eliminar el contacto.');
}
