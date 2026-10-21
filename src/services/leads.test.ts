import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LeadInput } from '../types/lead';

const rpc = vi.fn();
let configured = true;
vi.mock('../lib/supabase', () => ({
  getSupabase: async () => (configured ? { rpc } : null),
  isSupabaseConfigured: true,
}));

const { submitLead } = await import('./leads');

const valid: LeadInput = {
  name: 'Ana María',
  phone: '+573001234567',
  preferredCharacter: 'doc',
  consentGiven: true,
  consentTextVersion: 'v1',
  honeypot: '',
  elapsedMs: 6000,
};

beforeEach(() => {
  rpc.mockReset();
  configured = true;
});

describe('submitLead', () => {
  it('no llama al backend sin consentimiento', async () => {
    const r = await submitLead({ ...valid, consentGiven: false });
    expect(r.ok).toBe(false);
    expect(rpc).not.toHaveBeenCalled();
  });

  it.each([
    ['nombre inválido', { name: '1' }],
    ['celular sin normalizar', { phone: '3001234567' }],
    ['campo trampa', { honeypot: 'x' }],
    ['demasiado rápido', { elapsedMs: 100 }],
  ])('no llama al backend con %s', async (_l, patch) => {
    const r = await submitLead({ ...valid, ...patch });
    expect(r).toMatchObject({ ok: false, reason: 'validation' });
    expect(rpc).not.toHaveBeenCalled();
  });

  it('informa cuando la base de datos no está configurada', async () => {
    configured = false;
    const r = await submitLead(valid);
    expect(r).toMatchObject({ ok: false, reason: 'not_configured' });
  });

  it('llama a submit_lead con los parámetros esperados', async () => {
    rpc.mockResolvedValue({ error: null });
    const r = await submitLead(valid);
    expect(r).toEqual({ ok: true });
    expect(rpc).toHaveBeenCalledWith('submit_lead', {
      p_name: 'Ana María',
      p_phone: '+573001234567',
      p_character: 'doc',
      p_consent: true,
      p_consent_version: 'v1',
      p_elapsed_ms: 6000,
      p_honeypot: '',
    });
  });

  it.each([
    [{ message: 'rate_limited' }, 'rate_limited'],
    [{ message: 'invalid_phone' }, 'validation'],
    [{ message: 'TypeError: Failed to fetch' }, 'network'],
    [{ message: 'relation "leads" does not exist' }, 'server'],
  ])('traduce el error %o a %s', async (error, reason) => {
    rpc.mockResolvedValue({ error });
    const r = await submitLead(valid);
    expect(r).toMatchObject({ ok: false, reason });
  });

  it('gestiona una excepción de red', async () => {
    rpc.mockRejectedValue(new TypeError('Failed to fetch'));
    const r = await submitLead(valid);
    expect(r).toMatchObject({ ok: false, reason: 'network' });
  });
});
