// @vitest-environment node
/**
 * Prueba la migración real contra Postgres (PGlite, Postgres compilado a WebAssembly).
 * Reproduce lo esencial de Supabase: roles anon/authenticated, auth.users, auth.uid()
 * y los privilegios amplios que Supabase concede por defecto en el esquema public.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, describe, expect, it } from 'vitest';

const ADMIN_ID = '11111111-1111-4111-8111-111111111111';
const USER_ID = '22222222-2222-4222-8222-222222222222';
const SESSION = '33333333-3333-4333-8333-333333333333';

const SUPABASE_STUB = `
  create role anon nologin;
  create role authenticated nologin;
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
  grant usage on schema public to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;
  alter default privileges in schema public grant all on functions to anon, authenticated;
  alter default privileges in schema public grant all on sequences to anon, authenticated;
`;

let db: PGlite;

async function as(role: 'anon' | 'authenticated', sub: string | null, sql: string, params: unknown[] = []) {
  await db.exec('reset role');
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [sub ?? '']);
  await db.exec(`set role ${role}`);
  try {
    return await db.query(sql, params);
  } finally {
    await db.exec('reset role');
  }
}

const anon = (sql: string, params: unknown[] = []) => as('anon', null, sql, params);
const admin = (sql: string, params: unknown[] = []) => as('authenticated', ADMIN_ID, sql, params);
const user = (sql: string, params: unknown[] = []) => as('authenticated', USER_ID, sql, params);

async function setIp(ip: string) {
  await db.query(`select set_config('request.headers', $1, false)`, [JSON.stringify({ 'x-forwarded-for': `${ip}, 10.0.0.1` })]);
}

const SUBMIT = `select public.submit_lead($1, $2, $3, $4, $5, $6, $7)`;
const lead = (o: Partial<{ name: string; phone: string; character: string | null; consent: boolean | null; version: string; elapsed: number | null; honeypot: string }> = {}) => [
  o.name ?? 'Ana María',
  o.phone ?? '+573001234567',
  o.character === undefined ? 'merlina' : o.character,
  o.consent === undefined ? true : o.consent,
  o.version ?? 'v1-2026-10-20',
  o.elapsed === undefined ? 8000 : o.elapsed,
  o.honeypot ?? '',
];

beforeAll(async () => {
  db = new PGlite();
  await db.exec(SUPABASE_STUB);
  const dir = join(__dirname, '..', 'migrations');
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
    await db.exec(readFileSync(join(dir, file), 'utf8'));
  }
  await db.query(`insert into auth.users (id, email) values ($1, 'admin@example.test'), ($2, 'user@example.test')`, [ADMIN_ID, USER_ID]);
  await db.query(`insert into public.admin_users (user_id) values ($1)`, [ADMIN_ID]);
  await setIp('203.0.113.10');
}, 60000);

describe('visitante anónimo', () => {
  it('puede registrar un contacto con consentimiento', async () => {
    await anon(SUBMIT, lead());
    const r = await db.query<{ name: string; consent_given: boolean }>(`select name, consent_given from public.leads where phone = '+573001234567'`);
    expect(r.rows).toEqual([{ name: 'Ana María', consent_given: true }]);
  });

  it('acepta nombres con tildes y ñ', async () => {
    await anon(SUBMIT, lead({ name: 'José Ñúñez', phone: '+573009998877' }));
    const r = await db.query(`select 1 from public.leads where name = 'José Ñúñez'`);
    expect(r.rows).toHaveLength(1);
  });

  it.each([
    ['sin consentimiento', lead({ consent: false, phone: '+573001110000' }), 'consent_required'],
    ['consentimiento nulo', lead({ consent: null, phone: '+573001110001' }), 'consent_required'],
    ['nombre inválido', lead({ name: '<script>', phone: '+573001110002' }), 'invalid_name'],
    ['nombre de 1 letra', lead({ name: 'A', phone: '+573001110003' }), 'invalid_name'],
    ['celular colombiano fijo', lead({ phone: '+576011234567' }), 'invalid_phone'],
    ['celular sin +', lead({ phone: '573001234567' }), 'invalid_phone'],
    ['personaje inexistente', lead({ character: 'hacker', phone: '+573001110004' }), 'invalid_character'],
    ['campo trampa lleno', lead({ honeypot: 'http://spam', phone: '+573001110005' }), 'invalid_request'],
    ['envío demasiado rápido', lead({ elapsed: 300, phone: '+573001110006' }), 'invalid_request'],
  ])('rechaza: %s', async (_label, params, message) => {
    await expect(anon(SUBMIT, params)).rejects.toThrow(message);
  });

  it('no guarda nada cuando el envío es rechazado', async () => {
    const r = await db.query(`select count(*)::int n from public.leads where phone like '+57300111%'`);
    expect(r.rows[0]).toEqual({ n: 0 });
  });

  it('no duplica un número ya registrado ni sobrescribe el nombre', async () => {
    await anon(SUBMIT, lead({ name: 'Otra Persona', character: 'yuli' }));
    const r = await db.query<{ name: string; preferred_character: string }>(`select name, preferred_character from public.leads where phone = '+573001234567'`);
    expect(r.rows).toEqual([{ name: 'Ana María', preferred_character: 'yuli' }]);
  });

  it.each([
    ['leer contactos', `select * from public.leads`],
    ['contar contactos', `select count(*) from public.leads`],
    ['insertar directamente', `insert into public.leads (name, phone, consent_given, consent_text_version) values ('X Y', '+573001112233', true, 'v')`],
    ['actualizar', `update public.leads set name = 'Hack'`],
    ['borrar', `delete from public.leads`],
    ['leer eventos', `select * from public.quiz_events`],
    ['insertar eventos directamente', `insert into public.quiz_events (event, session_id) values ('landing_view', '${SESSION}')`],
    ['leer administradores', `select * from public.admin_users`],
    ['hacerse administrador', `insert into public.admin_users (user_id) values ('${USER_ID}')`],
    ['ver estadísticas', `select public.admin_stats()`],
    ['leer el límite de envíos', `select * from private.rate_limits`],
  ])('NO puede %s', async (_label, sql) => {
    await expect(anon(sql)).rejects.toThrow(/permission denied/);
  });

  it('puede registrar eventos anónimos válidos e ignora los inválidos', async () => {
    await anon(`select public.track_event('landing_view', null, null, $1)`, [SESSION]);
    await anon(`select public.track_event('quiz_complete', 'doc', null, $1)`, [SESSION]);
    await anon(`select public.track_event('share_click', null, 'whatsapp', $1)`, [SESSION]);
    await anon(`select public.track_event('evento_raro', null, null, $1)`, [SESSION]);
    await anon(`select public.track_event('quiz_complete', 'hacker', 'fax', $1)`, [SESSION]);
    const r = await db.query(`select event, character_id, channel from public.quiz_events order by id`);
    expect(r.rows).toEqual([
      { event: 'landing_view', character_id: null, channel: null },
      { event: 'quiz_complete', character_id: 'doc', channel: null },
      { event: 'share_click', character_id: null, channel: 'whatsapp' },
      { event: 'quiz_complete', character_id: null, channel: null },
    ]);
  });

  it('guarda la IP solo como hash', async () => {
    const r = await db.query<{ key: string }>(`select key from private.rate_limits`);
    expect(r.rows.length).toBeGreaterThan(0);
    for (const row of r.rows) {
      expect(row.key).not.toContain('203.0.113.10');
      expect(row.key).toMatch(/^(lead|event):[0-9a-f]{64}$/);
    }
  });
});

describe('usuario autenticado que NO es administrador', () => {
  it('no ve contactos (RLS devuelve 0 filas)', async () => {
    const r = await user(`select * from public.leads`);
    expect(r.rows).toHaveLength(0);
  });

  it('no puede modificar ni borrar contactos', async () => {
    await user(`update public.leads set consent_revoked_at = now()`);
    await user(`delete from public.leads`);
    const r = await db.query(`select count(*)::int n from public.leads where consent_revoked_at is null`);
    expect(r.rows[0]).toEqual({ n: 2 });
  });

  it('no puede cambiar el nombre aunque fuera administrador (privilegio por columna)', async () => {
    await expect(user(`update public.leads set name = 'X Y'`)).rejects.toThrow(/permission denied/);
  });

  it('no puede ver estadísticas', async () => {
    await expect(user(`select public.admin_stats()`)).rejects.toThrow('forbidden');
  });

  it('no puede hacerse administrador', async () => {
    await expect(user(`insert into public.admin_users (user_id) values ('${USER_ID}')`)).rejects.toThrow(/permission denied/);
  });

  it('is_admin() devuelve false', async () => {
    const r = await user(`select public.is_admin() as v`);
    expect(r.rows[0]).toEqual({ v: false });
  });
});

describe('administrador', () => {
  it('ve los contactos', async () => {
    const r = await admin(`select name from public.leads order by name`);
    expect(r.rows).toEqual([{ name: 'Ana María' }, { name: 'José Ñúñez' }]);
  });

  it('obtiene estadísticas agregadas', async () => {
    const r = await admin<unknown>(`select public.admin_stats() as s`);
    const s = (r.rows[0] as { s: Record<string, unknown> }).s;
    expect(s.leads_total).toBe(2);
    expect(s.landing_sessions).toBe(1);
    expect(s.quiz_completed).toBe(2);
    expect((s.results_by_character as Record<string, number>).doc).toBe(1);
    expect(Object.keys(s.results_by_character as object)).toHaveLength(14);
    expect(s.share_by_channel).toEqual({ whatsapp: 1 });
  });

  it('puede marcar una revocación de consentimiento', async () => {
    await admin(`update public.leads set consent_revoked_at = now() where name = 'José Ñúñez'`);
    const r = await db.query(`select count(*)::int n from public.leads where consent_revoked_at is not null`);
    expect(r.rows[0]).toEqual({ n: 1 });
  });

  it('una nueva autorización del mismo número reactiva el consentimiento', async () => {
    await anon(SUBMIT, lead({ name: 'José Ñúñez', phone: '+573009998877' }));
    const r = await db.query(`select consent_revoked_at from public.leads where phone = '+573009998877'`);
    expect(r.rows[0]).toEqual({ consent_revoked_at: null });
  });

  it('puede borrar un contacto (solicitud de supresión)', async () => {
    await admin(`delete from public.leads where phone = '+573009998877'`);
    const r = await db.query(`select count(*)::int n from public.leads`);
    expect(r.rows[0]).toEqual({ n: 1 });
  });

  it('no puede insertar contactos saltándose submit_lead', async () => {
    await expect(admin(`insert into public.leads (name, phone, consent_given, consent_text_version) values ('X Y', '+573001112233', true, 'v')`)).rejects.toThrow(/permission denied/);
  });
});

describe('límite de envíos', () => {
  it('bloquea más de 60 registros en 10 minutos desde la misma conexión', async () => {
    await setIp('198.51.100.77');
    for (let i = 0; i < 60; i++) {
      await anon(SUBMIT, lead({ phone: `+57310${String(i).padStart(7, '0')}`, character: null }));
    }
    await expect(anon(SUBMIT, lead({ phone: '+573209999999' }))).rejects.toThrow('rate_limited');
    // Otra conexión no se ve afectada.
    await setIp('198.51.100.78');
    await anon(SUBMIT, lead({ phone: '+573209999999' }));
  }, 60000);
});
