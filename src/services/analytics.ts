import type { CharacterId } from '../types/character';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Capa de eventos de analítica, independiente del proveedor.
 * - No registra datos personales (ni nombre, ni celular, ni respuestas individuales).
 * - El identificador de sesión es aleatorio, vive en sessionStorage y se pierde al cerrar la pestaña.
 * - Si VITE_ANALYTICS_ENABLED no es "true" o Supabase no está configurado, los eventos
 *   NO se guardan en ningún sitio (en desarrollo solo se imprimen en la consola).
 */

export type AnalyticsEvent =
  | 'landing_view'
  | 'quiz_start'
  | 'quiz_complete'
  | 'result_view'
  | 'quiz_restart'
  | 'share_click'
  | 'lead_submit';

export interface AnalyticsPayload {
  character?: CharacterId;
  /** Solo para share_click: native | whatsapp | copy | image */
  channel?: 'native' | 'whatsapp' | 'copy' | 'image';
}

export type AnalyticsProvider = (event: AnalyticsEvent, payload: AnalyticsPayload, sessionId: string) => void | Promise<void>;

const providers: AnalyticsProvider[] = [];

export const isAnalyticsPersisted = import.meta.env.VITE_ANALYTICS_ENABLED === 'true' && isSupabaseConfigured;

if (isAnalyticsPersisted) {
  providers.push(async (event, payload, sessionId) => {
    const supabase = await getSupabase();
    if (!supabase) return;
    await supabase.rpc('track_event', {
      p_event: event,
      p_character: payload.character ?? null,
      p_channel: payload.channel ?? null,
      p_session: sessionId,
    });
  });
}

if (import.meta.env.DEV && import.meta.env.MODE !== 'test') {
  providers.push((event, payload) => console.debug('[analytics]', event, payload));
}

/** Permite conectar otro proveedor (Plausible, Umami, GA4…) sin tocar los componentes. */
export function registerAnalyticsProvider(provider: AnalyticsProvider): void {
  providers.push(provider);
}

const SESSION_KEY = 'atrapados-session';
let memorySession: string | null = null;

function newId(): string {
  // randomUUID solo existe en contextos seguros (HTTPS); getRandomValues funciona también en HTTP.
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6]! & 0x0f) | 0x40;
  b[8] = (b[8]! & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = newId();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    memorySession ??= newId();
    return memorySession;
  }
}

const once = new Set<string>();

export function track(event: AnalyticsEvent, payload: AnalyticsPayload = {}, options: { oncePerSession?: boolean } = {}): void {
  if (options.oncePerSession) {
    const key = `${event}`;
    if (once.has(key)) return;
    once.add(key);
  }
  const sessionId = getSessionId();
  for (const p of providers) {
    try {
      void Promise.resolve(p(event, payload, sessionId)).catch(() => undefined);
    } catch {
      // La analítica nunca debe interrumpir la experiencia.
    }
  }
}
