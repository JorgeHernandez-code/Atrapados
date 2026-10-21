import { useId, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CONSENT } from '../config/site';
import { getCharacter } from '../data/characters';
import { COUNTRY_CODES, DEFAULT_COUNTRY, getCountry, normalizeName, normalizePhone, validateName, validatePhone } from '../lib/validation';
import { track } from '../services/analytics';
import { submitLead } from '../services/leads';
import type { CharacterId } from '../types/character';

interface LeadFormProps {
  characterId: CharacterId | null;
}

type Errors = Partial<Record<'name' | 'phone' | 'consent', string>>;
type Status = { kind: 'idle' | 'submitting' } | { kind: 'error'; message: string } | { kind: 'success'; firstName: string };

export function LeadForm({ characterId }: LeadFormProps) {
  const uid = useId();
  const ids = {
    name: `${uid}-name`,
    country: `${uid}-country`,
    phone: `${uid}-phone`,
    consent: `${uid}-consent`,
    hp: `${uid}-website`,
  };
  const mountedAt = useRef(Date.now());
  const [name, setName] = useState('');
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const statusRef = useRef<HTMLDivElement>(null);
  const characterName = characterId ? getCharacter(characterId).name : null;
  const selectedCountry = getCountry(country);

  const validate = (): Errors => {
    const e: Errors = {};
    const n = validateName(name);
    if (n) e.name = n;
    const p = validatePhone(phone, country);
    if (p) e.phone = p;
    if (!consent) e.consent = 'Para enviar tus datos debes marcar la autorización.';
    return e;
  };

  const onBlur = (field: keyof Errors) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validate()[field] }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status.kind === 'submitting') return;
    const v = validate();
    setErrors(v);
    setTouched({ name: true, phone: true, consent: true });
    if (Object.keys(v).length > 0) {
      const first = v.name ? ids.name : v.phone ? ids.phone : ids.consent;
      document.getElementById(first)?.focus();
      return;
    }
    const normalized = normalizePhone(phone, country);
    if (!normalized) return;

    setStatus({ kind: 'submitting' });
    const result = await submitLead({
      name,
      phone: normalized,
      preferredCharacter: characterId,
      consentGiven: consent,
      consentTextVersion: CONSENT.version,
      honeypot,
      elapsedMs: Date.now() - mountedAt.current,
    });
    if (result.ok) {
      track('lead_submit', characterId ? { character: characterId } : {});
      setStatus({ kind: 'success', firstName: normalizeName(name).split(' ')[0] ?? '' });
    } else {
      setStatus({ kind: 'error', message: result.message });
    }
    requestAnimationFrame(() => statusRef.current?.focus());
  };

  if (status.kind === 'success') {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="animate-rise bg-volt p-8 text-ink outline-none sm:p-10">
        <p className="display text-5xl sm:text-6xl">¡Gracias{status.firstName ? `, ${status.firstName}` : ''}!</p>
        <p className="mt-4 max-w-lg text-lg font-medium">
          Ya haces parte de la comunidad de ATRAPADOS. Te escribiremos solo para contarte sobre la obra, nuevas funciones y actividades relacionadas.
        </p>
        <p className="mt-4 text-sm">
          Puedes revocar tu autorización cuando quieras. Consulta cómo en la{' '}
          <Link to="/privacidad" className="font-bold underline">
            política de datos
          </Link>
          .
        </p>
      </div>
    );
  }

  const show = (f: keyof Errors) => (touched[f] ? errors[f] : undefined);

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6" aria-describedby={`${uid}-intro`}>
      <p id={`${uid}-intro`} className="sr-only">
        Formulario opcional. Tu resultado no depende de este registro.
      </p>

      <div>
        <label htmlFor={ids.name} className="mb-2 block text-sm font-semibold text-paper">
          Nombre <span className="text-ash">(obligatorio)</span>
        </label>
        <input
          id={ids.name}
          name="name"
          type="text"
          autoComplete="name"
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => onBlur('name')}
          aria-invalid={Boolean(show('name'))}
          aria-describedby={show('name') ? `${ids.name}-error` : undefined}
          className="field"
          placeholder="¿Cómo te llamas?"
        />
        {show('name') && (
          <p id={`${ids.name}-error`} className="mt-2 text-sm text-alert">
            {show('name')}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div>
          <label htmlFor={ids.country} className="mb-2 block text-sm font-semibold text-paper">
            País <span className="text-ash">(indicativo)</span>
          </label>
          <div className="relative">
            <select id={ids.country} name="country" value={country} onChange={(e) => setCountry(e.target.value)} className="field appearance-none pr-10">
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label} {c.dial ? `(+${c.dial})` : ''}
                </option>
              ))}
            </select>
            <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ash">
              ▾
            </span>
          </div>
        </div>
        <div>
          <label htmlFor={ids.phone} className="mb-2 block text-sm font-semibold text-paper">
            Número de celular <span className="text-ash">(obligatorio)</span>
          </label>
          <input
            id={ids.phone}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete={country === 'OTHER' ? 'tel' : 'tel-national'}
            maxLength={22}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => onBlur('phone')}
            aria-invalid={Boolean(show('phone'))}
            aria-describedby={`${ids.phone}-help${show('phone') ? ` ${ids.phone}-error` : ''}`}
            className="field"
            placeholder={selectedCountry.example}
          />
          <p id={`${ids.phone}-help`} className="mt-2 text-xs text-ash">
            {country === 'OTHER' ? 'Incluye el indicativo del país con +.' : `Sin el indicativo +${selectedCountry.dial}.`}
          </p>
          {show('phone') && (
            <p id={`${ids.phone}-error`} className="mt-1 text-sm text-alert">
              {show('phone')}
            </p>
          )}
        </div>
      </div>

      {/* Campo trampa para bots: invisible para las personas */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={ids.hp}>No completes este campo</label>
        <input id={ids.hp} name="website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>

      <div>
        <div className="flex items-start gap-3">
          <input
            id={ids.consent}
            name="consent"
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              if (e.target.checked) setErrors((prev) => ({ ...prev, consent: undefined }));
            }}
            aria-invalid={Boolean(show('consent'))}
            aria-describedby={show('consent') ? `${ids.consent}-error` : undefined}
            className="mt-1 h-6 w-6 shrink-0 cursor-pointer accent-[#fff52b]"
          />
          <label htmlFor={ids.consent} className="text-sm leading-relaxed text-paper/90">
            {CONSENT.text}{' '}
            <Link to="/privacidad" target="_blank" rel="noopener" className="font-semibold text-volt underline">
              Leer la política (se abre en otra pestaña)
            </Link>
          </label>
        </div>
        {show('consent') && (
          <p id={`${ids.consent}-error`} className="mt-2 pl-9 text-sm text-alert">
            {show('consent')}
          </p>
        )}
      </div>

      {characterName && (
        <p className="text-xs leading-relaxed text-ash">
          Junto con tu nombre y celular guardaremos el personaje que obtuviste ({characterName}). No guardamos tus respuestas individuales.
        </p>
      )}

      <div ref={statusRef} tabIndex={-1} aria-live="assertive" className="outline-none">
        {status.kind === 'error' && <p className="border-l-4 border-alert bg-alert/10 p-4 text-sm text-paper">{status.message}</p>}
      </div>

      <button type="submit" disabled={status.kind === 'submitting'} className="btn btn-primary w-full sm:w-auto sm:justify-self-start">
        {status.kind === 'submitting' ? 'Enviando…' : 'Quiero seguir conectado'}
      </button>
    </form>
  );
}
