/**
 * Validación del formulario de contacto.
 * Las mismas reglas se aplican en la base de datos (función public.submit_lead),
 * así que un envío que se salte el navegador también es rechazado.
 */

export interface CountryCode {
  code: string; // ISO 3166-1 alfa-2
  label: string;
  dial: string; // sin "+"
  /** Longitud del número nacional (sin indicativo). */
  minDigits: number;
  maxDigits: number;
  /** Patrón opcional del número nacional. */
  pattern?: RegExp;
  example: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: 'CO', label: 'Colombia', dial: '57', minDigits: 10, maxDigits: 10, pattern: /^3\d{9}$/, example: '300 123 4567' },
  { code: 'VE', label: 'Venezuela', dial: '58', minDigits: 10, maxDigits: 10, example: '412 123 4567' },
  { code: 'EC', label: 'Ecuador', dial: '593', minDigits: 9, maxDigits: 9, example: '99 123 4567' },
  { code: 'PE', label: 'Perú', dial: '51', minDigits: 9, maxDigits: 9, example: '912 345 678' },
  { code: 'MX', label: 'México', dial: '52', minDigits: 10, maxDigits: 10, example: '55 1234 5678' },
  { code: 'US', label: 'Estados Unidos', dial: '1', minDigits: 10, maxDigits: 10, example: '201 555 0123' },
  { code: 'ES', label: 'España', dial: '34', minDigits: 9, maxDigits: 9, example: '612 345 678' },
  { code: 'OTHER', label: 'Otro país', dial: '', minDigits: 8, maxDigits: 15, example: '+44 7700 900123' },
];

export const DEFAULT_COUNTRY = 'CO';

export const NAME_MIN = 2;
export const NAME_MAX = 60;

/**
 * Letras latinas (incluidas tildes, diéresis y ñ), espacios, apóstrofo, punto y guion.
 * Es el mismo rango que valida la base de datos (submit_lead), independiente del locale del servidor.
 */
const NAME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿĀ-ž][A-Za-zÀ-ÖØ-öø-ÿĀ-ž .'-]*$/;

export function normalizeName(raw: string): string {
  return raw.normalize('NFC').replace(/\s+/g, ' ').trim();
}

export function validateName(raw: string): string | null {
  const name = normalizeName(raw);
  if (!name) return 'Escribe tu nombre.';
  if (name.length < NAME_MIN) return `El nombre debe tener al menos ${NAME_MIN} letras.`;
  if (name.length > NAME_MAX) return `El nombre puede tener máximo ${NAME_MAX} caracteres.`;
  if (!NAME_PATTERN.test(name)) return 'Usa solo letras, espacios y los signos . \' -';
  return null;
}

export function getCountry(code: string): CountryCode {
  return COUNTRY_CODES.find((c) => c.code === code) ?? COUNTRY_CODES[0]!;
}

/**
 * Convierte lo que escribió la persona a formato E.164 (+573001234567).
 * Devuelve null si no es válido.
 */
export function normalizePhone(raw: string, countryCode: string): string | null {
  const country = getCountry(countryCode);
  const trimmed = raw.trim();
  let digits = trimmed.replace(/\D/g, '');
  if (!digits) return null;

  if (country.code === 'OTHER') {
    // Debe incluir el indicativo internacional.
    if (trimmed.startsWith('00')) digits = digits.slice(2);
    if (!/^[1-9]\d{7,14}$/.test(digits)) return null;
    return `+${digits}`;
  }

  // Si la persona escribió el indicativo, se quita.
  if (trimmed.startsWith('+') || trimmed.startsWith('00')) {
    if (trimmed.startsWith('00')) digits = digits.slice(2);
    if (!digits.startsWith(country.dial)) return null;
    digits = digits.slice(country.dial.length);
  } else if (digits.length > country.maxDigits && digits.startsWith(country.dial)) {
    digits = digits.slice(country.dial.length);
  }

  if (digits.length < country.minDigits || digits.length > country.maxDigits) return null;
  if (country.pattern && !country.pattern.test(digits)) return null;
  return `+${country.dial}${digits}`;
}

export function validatePhone(raw: string, countryCode: string): string | null {
  if (!raw.trim()) return 'Escribe tu número de celular.';
  if (normalizePhone(raw, countryCode)) return null;
  const country = getCountry(countryCode);
  if (country.code === 'CO') return 'Escribe un celular colombiano de 10 dígitos que empiece por 3. Ejemplo: 300 123 4567.';
  if (country.code === 'OTHER') return 'Incluye el indicativo del país. Ejemplo: +44 7700 900123.';
  return `Revisa el número. Ejemplo para ${country.label}: ${country.example}.`;
}

/** Mismo patrón que aplica la base de datos. */
export const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

/** Tiempo mínimo (ms) que debe estar visible el formulario antes de enviarlo (antispam). */
export const MIN_FILL_MS = 2500;
