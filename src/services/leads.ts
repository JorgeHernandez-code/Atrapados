import { getSupabase } from '../lib/supabase';
import { E164_PATTERN, MIN_FILL_MS, normalizeName, validateName } from '../lib/validation';
import type { LeadInput, LeadSubmitResult } from '../types/lead';

const MESSAGES = {
  not_configured:
    'El registro de contactos no está disponible en este momento. Tu resultado no se ve afectado. Inténtalo más tarde.',
  consent: 'Para registrarte necesitamos tu autorización expresa.',
  invalid: 'Revisa tu nombre y tu número de celular.',
  too_fast: 'Revisa tus datos y vuelve a intentarlo en unos segundos.',
  rate_limited: 'Recibimos demasiados intentos desde esta conexión. Espera unos minutos y vuelve a intentarlo.',
  network: 'No pudimos conectarnos. Revisa tu conexión a internet y vuelve a intentarlo.',
  server: 'No pudimos guardar tus datos por un problema técnico. Vuelve a intentarlo más tarde.',
} as const;

/**
 * Envía un contacto autorizado a la base de datos (función public.submit_lead).
 * Nunca envía nada si no hay consentimiento. Nunca simula un registro exitoso.
 */
export async function submitLead(input: LeadInput): Promise<LeadSubmitResult> {
  if (input.consentGiven !== true) return { ok: false, reason: 'validation', message: MESSAGES.consent };

  const name = normalizeName(input.name);
  if (validateName(name) || !E164_PATTERN.test(input.phone)) {
    return { ok: false, reason: 'validation', message: MESSAGES.invalid };
  }
  if (input.honeypot || input.elapsedMs < MIN_FILL_MS) {
    return { ok: false, reason: 'validation', message: MESSAGES.too_fast };
  }

  const supabase = await getSupabase();
  if (!supabase) return { ok: false, reason: 'not_configured', message: MESSAGES.not_configured };

  try {
    const { error } = await supabase.rpc('submit_lead', {
      p_name: name,
      p_phone: input.phone,
      p_character: input.preferredCharacter,
      p_consent: true,
      p_consent_version: input.consentTextVersion,
      p_elapsed_ms: Math.round(input.elapsedMs),
      p_honeypot: input.honeypot,
    });
    if (!error) return { ok: true };

    const msg = `${error.message ?? ''} ${error.details ?? ''}`;
    if (msg.includes('rate_limited')) return { ok: false, reason: 'rate_limited', message: MESSAGES.rate_limited };
    if (/invalid_|consent_required/.test(msg)) return { ok: false, reason: 'validation', message: MESSAGES.invalid };
    if (/fetch|network|Failed to/i.test(msg)) return { ok: false, reason: 'network', message: MESSAGES.network };
    return { ok: false, reason: 'server', message: MESSAGES.server };
  } catch {
    return { ok: false, reason: 'network', message: MESSAGES.network };
  }
}
