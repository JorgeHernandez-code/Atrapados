import type { SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

/** true cuando existen la URL y la clave pública. No garantiza que el backend responda. */
export const isSupabaseConfigured = Boolean(url && anonKey);

let clientPromise: Promise<SupabaseClient> | null = null;

/**
 * Cliente de Supabase con la clave pública (anon/publishable).
 * La librería se descarga solo cuando se necesita, para que la portada cargue rápido en móviles.
 * Devuelve null si faltan las variables de entorno: el test sigue funcionando sin backend
 * y los formularios muestran un error claro.
 */
export async function getSupabase(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return null;
  clientPromise ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: 'atrapados-admin-auth' },
    }),
  );
  return clientPromise;
}
