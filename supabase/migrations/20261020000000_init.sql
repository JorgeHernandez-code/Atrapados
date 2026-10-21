-- =====================================================================
-- ATRAPADOS — esquema inicial
-- Contactos autorizados (leads), métricas anónimas y panel administrativo.
--
-- Modelo de acceso:
--   anon (visitante)     → SOLO puede ejecutar submit_lead() y track_event().
--                          No puede leer, actualizar ni borrar ninguna tabla.
--   authenticated        → sin acceso a datos salvo que esté en public.admin_users.
--   administrador        → lee contactos y métricas, marca revocaciones y borra
--                          contactos (para atender solicitudes de supresión).
--   service_role         → clave secreta del servidor. NUNCA va en el frontend.
-- =====================================================================

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- Personajes (catálogo para validar el resultado guardado)
-- ---------------------------------------------------------------------
create table public.characters (
  id   text primary key check (id ~ '^[a-z]{2,20}$'),
  name text not null
);

insert into public.characters (id, name) values
  ('hipolita',  'Hipólita'),
  ('sasha',     'Sasha'),
  ('clarita',   'Clarita'),
  ('carvajal',  'Enfermero Carvajal'),
  ('minerva',   'Minerva'),
  ('yuli',      'Yuli'),
  ('marianita', 'Marianita'),
  ('candy',     'Candy'),
  ('pachito',   'Pachito'),
  ('jhoncito',  'Jhoncito'),
  ('merlina',   'Merlina'),
  ('felipe',    'Felipe'),
  ('doc',       'Doc'),
  ('piedad',    'Enfermera Piedad');

-- ---------------------------------------------------------------------
-- Administradores
-- ---------------------------------------------------------------------
create table public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------
-- Contactos autorizados
-- ---------------------------------------------------------------------
create table public.leads (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null check (char_length(name) between 2 and 60),
  phone                text not null check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  preferred_character  text references public.characters (id),
  consent_given        boolean not null check (consent_given),
  consent_text_version text not null check (char_length(consent_text_version) between 1 and 40),
  consented_at         timestamptz not null default now(),
  consent_revoked_at   timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint leads_phone_unique unique (phone)
);

create index leads_created_at_idx on public.leads (created_at desc);
create index leads_character_idx on public.leads (preferred_character);

comment on table public.leads is 'Contactos que autorizaron expresamente recibir información de ATRAPADOS (Ley 1581 de 2012).';
comment on column public.leads.consent_text_version is 'Versión del texto de autorización aceptado (src/config/site.ts → CONSENT.version).';
comment on column public.leads.consent_revoked_at is 'Fecha en que el titular revocó la autorización. Si no es null, NO se le debe contactar.';

-- ---------------------------------------------------------------------
-- Métricas anónimas (sin datos personales)
-- ---------------------------------------------------------------------
create table public.quiz_events (
  id           bigint generated always as identity primary key,
  event        text not null check (event in (
                 'landing_view', 'quiz_start', 'quiz_complete', 'result_view',
                 'quiz_restart', 'share_click', 'lead_submit')),
  character_id text references public.characters (id),
  channel      text check (channel in ('native', 'whatsapp', 'copy', 'image')),
  session_id   uuid not null,
  created_at   timestamptz not null default now()
);

create index quiz_events_event_idx on public.quiz_events (event, created_at);

comment on table public.quiz_events is 'Eventos anónimos de uso. session_id es aleatorio por pestaña y no se relaciona con leads.';

-- ---------------------------------------------------------------------
-- Límite de envíos (esquema privado, no expuesto por la API)
-- ---------------------------------------------------------------------
create table private.rate_limits (
  key    text not null,
  bucket timestamptz not null,
  hits   integer not null default 1,
  primary key (key, bucket)
);

-- Cuenta un intento y devuelve cuántos lleva la clave en la ventana actual.
-- La IP nunca se guarda en claro: solo su hash SHA-256.
create or replace function private.hit_rate_limit(p_scope text, p_window_seconds integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_headers json;
  v_ip      text;
  v_key     text;
  v_bucket  timestamptz;
  v_hits    integer;
begin
  begin
    v_headers := nullif(current_setting('request.headers', true), '')::json;
  exception when others then
    v_headers := null;
  end;
  v_ip := coalesce(
    nullif(btrim(split_part(v_headers ->> 'x-forwarded-for', ',', 1)), ''),
    nullif(btrim(v_headers ->> 'x-real-ip'), ''),
    'unknown');
  v_key := p_scope || ':' || encode(sha256(convert_to(v_ip, 'UTF8')), 'hex');
  v_bucket := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);

  insert into private.rate_limits as r (key, bucket, hits)
  values (v_key, v_bucket, 1)
  on conflict (key, bucket) do update set hits = r.hits + 1
  returning hits into v_hits;

  -- Limpieza ocasional de ventanas viejas.
  if random() < 0.02 then
    delete from private.rate_limits where bucket < now() - interval '1 day';
  end if;

  return v_hits;
end;
$$;

-- ---------------------------------------------------------------------
-- RPC pública: registrar un contacto autorizado
-- ---------------------------------------------------------------------
-- Límite por conexión (IP). Ojo: el público de una función puede compartir la misma
-- red Wi-Fi (misma IP pública), por eso el límite es generoso.
create or replace function public.submit_lead(
  p_name            text,
  p_phone           text,
  p_character       text,
  p_consent         boolean,
  p_consent_version text,
  p_elapsed_ms      integer default null,
  p_honeypot        text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
begin
  -- Antispam: campo trampa vacío y un tiempo mínimo de llenado.
  if coalesce(p_honeypot, '') <> '' or p_elapsed_ms is null or p_elapsed_ms < 2500 then
    raise exception 'invalid_request' using errcode = '22023';
  end if;

  if p_consent is distinct from true then
    raise exception 'consent_required' using errcode = '22023';
  end if;

  if p_consent_version is null or char_length(p_consent_version) not between 1 and 40 then
    raise exception 'invalid_consent_version' using errcode = '22023';
  end if;

  v_name := btrim(regexp_replace(normalize(coalesce(p_name, ''), NFC), '\s+', ' ', 'g'));
  if char_length(v_name) not between 2 and 60
     or v_name !~ '^[A-Za-zÀ-ÖØ-öø-ÿĀ-ž][A-Za-zÀ-ÖØ-öø-ÿĀ-ž .''-]*$' then
    raise exception 'invalid_name' using errcode = '22023';
  end if;

  if p_phone is null
     or p_phone !~ '^\+[1-9][0-9]{7,14}$'
     or (p_phone like '+57%' and p_phone !~ '^\+573[0-9]{9}$') then
    raise exception 'invalid_phone' using errcode = '22023';
  end if;

  if p_character is not null and not exists (select 1 from public.characters where id = p_character) then
    raise exception 'invalid_character' using errcode = '22023';
  end if;

  if private.hit_rate_limit('lead', 600) > 60 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  -- Si el número ya existe no se duplica ni se sobrescribe el nombre: solo se renueva
  -- la autorización (nueva fecha y versión del texto). La respuesta es la misma en ambos
  -- casos para no revelar qué números están registrados.
  insert into public.leads as l (name, phone, preferred_character, consent_given, consent_text_version, consented_at)
  values (v_name, p_phone, p_character, true, p_consent_version, now())
  on conflict (phone) do update set
    consent_given        = true,
    consent_text_version = excluded.consent_text_version,
    consented_at         = now(),
    consent_revoked_at   = null,
    preferred_character  = coalesce(excluded.preferred_character, l.preferred_character),
    updated_at           = now();
end;
$$;

-- ---------------------------------------------------------------------
-- RPC pública: registrar un evento anónimo
-- ---------------------------------------------------------------------
create or replace function public.track_event(
  p_event     text,
  p_character text default null,
  p_channel   text default null,
  p_session   uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_session is null then
    return;
  end if;
  if p_event not in ('landing_view', 'quiz_start', 'quiz_complete', 'result_view', 'quiz_restart', 'share_click', 'lead_submit') then
    return;
  end if;
  if p_character is not null and not exists (select 1 from public.characters where id = p_character) then
    p_character := null;
  end if;
  if p_channel is not null and p_channel not in ('native', 'whatsapp', 'copy', 'image') then
    p_channel := null;
  end if;
  -- Exceso de eventos desde la misma conexión: se descartan en silencio.
  if private.hit_rate_limit('event', 600) > 1500 then
    return;
  end if;
  insert into public.quiz_events (event, character_id, channel, session_id)
  values (p_event, p_character, p_channel, p_session);
end;
$$;

-- ---------------------------------------------------------------------
-- RPC de administración: estadísticas agregadas
-- ---------------------------------------------------------------------
create or replace function public.admin_stats(p_from timestamptz default null, p_to timestamptz default null)
returns json
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_from timestamptz := coalesce(p_from, '-infinity'::timestamptz);
  v_to   timestamptz := coalesce(p_to, 'infinity'::timestamptz);
  v_result json;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  with ev as (
    select * from public.quiz_events where created_at >= v_from and created_at < v_to
  ), ld as (
    select * from public.leads where created_at >= v_from and created_at < v_to
  )
  select json_build_object(
    'landing_sessions',        (select count(distinct session_id) from ev where event = 'landing_view'),
    'quiz_start_sessions',     (select count(distinct session_id) from ev where event = 'quiz_start'),
    'quiz_completed',          (select count(*) from ev where event = 'quiz_complete'),
    'quiz_completed_sessions', (select count(distinct session_id) from ev where event = 'quiz_complete'),
    'result_views',            (select count(*) from ev where event = 'result_view'),
    'restarts',                (select count(*) from ev where event = 'quiz_restart'),
    'share_clicks',            (select count(*) from ev where event = 'share_click'),
    'share_by_channel',        (select coalesce(json_object_agg(channel, n), '{}'::json)
                                  from (select channel, count(*) n from ev where event = 'share_click' and channel is not null group by channel) s),
    'lead_submit_events',      (select count(*) from ev where event = 'lead_submit'),
    'leads_total',             (select count(*) from ld),
    'leads_active',            (select count(*) from ld where consent_revoked_at is null),
    'results_by_character',    (select json_object_agg(c.id, coalesce(x.n, 0))
                                  from public.characters c
                                  left join (select character_id, count(*) n from ev where event = 'quiz_complete' group by character_id) x
                                    on x.character_id = c.id),
    'leads_by_character',      (select json_object_agg(c.id, coalesce(x.n, 0))
                                  from public.characters c
                                  left join (select preferred_character, count(*) n from ld group by preferred_character) x
                                    on x.preferred_character = c.id),
    'first_event_at',          (select min(created_at) from ev),
    'last_event_at',           (select max(created_at) from ev)
  ) into v_result;

  return v_result;
end;
$$;

-- updated_at automático
create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger leads_touch_updated_at
before update on public.leads
for each row execute function private.touch_updated_at();

-- =====================================================================
-- Seguridad: RLS y privilegios
-- Supabase concede por defecto privilegios amplios a anon y authenticated sobre
-- el esquema public. Se revocan explícitamente y se conceden solo los necesarios.
-- =====================================================================

alter table public.characters  enable row level security;
alter table public.admin_users enable row level security;
alter table public.leads       enable row level security;
alter table public.quiz_events enable row level security;
alter table private.rate_limits enable row level security;

revoke all on public.characters, public.admin_users, public.leads, public.quiz_events from anon, authenticated;
revoke all on private.rate_limits from public, anon, authenticated;

-- Catálogo de personajes: lectura para administradores.
grant select on public.characters to authenticated;
create policy characters_admin_read on public.characters
  for select to authenticated using (public.is_admin());

-- admin_users: cada usuario puede comprobar si él mismo es administrador.
-- Nadie puede insertarse a sí mismo: los administradores se agregan desde el SQL Editor.
grant select on public.admin_users to authenticated;
create policy admin_users_self_read on public.admin_users
  for select to authenticated using (user_id = auth.uid());

-- leads: solo administradores. Sin política de INSERT (solo vía submit_lead).
grant select, delete on public.leads to authenticated;
grant update (consent_revoked_at) on public.leads to authenticated;

create policy leads_admin_select on public.leads
  for select to authenticated using (public.is_admin());
create policy leads_admin_update on public.leads
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy leads_admin_delete on public.leads
  for delete to authenticated using (public.is_admin());

-- quiz_events: lectura solo para administradores. Sin INSERT directo (solo vía track_event).
grant select on public.quiz_events to authenticated;
create policy quiz_events_admin_select on public.quiz_events
  for select to authenticated using (public.is_admin());

-- Funciones: Postgres concede EXECUTE a PUBLIC por defecto. Se revoca y se concede explícitamente.
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.submit_lead(text, text, text, boolean, text, integer, text) from public;
revoke execute on function public.track_event(text, text, text, uuid) from public;
revoke execute on function public.admin_stats(timestamptz, timestamptz) from public, anon;
revoke execute on function private.hit_rate_limit(text, integer) from public, anon, authenticated;
revoke execute on function private.touch_updated_at() from public, anon, authenticated;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.submit_lead(text, text, text, boolean, text, integer, text) to anon, authenticated;
grant execute on function public.track_event(text, text, text, uuid) to anon, authenticated;
grant execute on function public.admin_stats(timestamptz, timestamptz) to authenticated;
