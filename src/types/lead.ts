import type { CharacterId } from './character';

export interface LeadInput {
  name: string;
  /** Teléfono en formato E.164, p. ej. +573001234567 */
  phone: string;
  preferredCharacter: CharacterId | null;
  consentGiven: boolean;
  consentTextVersion: string;
  /** Campo trampa: debe llegar vacío. */
  honeypot: string;
  /** Milisegundos desde que se mostró el formulario. */
  elapsedMs: number;
}

export interface LeadRow {
  id: string;
  name: string;
  phone: string;
  preferred_character: CharacterId | null;
  consent_given: boolean;
  consent_text_version: string;
  consented_at: string;
  consent_revoked_at: string | null;
  created_at: string;
}

export type LeadSubmitResult =
  | { ok: true }
  | { ok: false; reason: 'not_configured' | 'validation' | 'rate_limited' | 'network' | 'server'; message: string };
