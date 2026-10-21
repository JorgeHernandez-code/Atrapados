import { describe, expect, it } from 'vitest';
import { normalizeName, normalizePhone, validateName, validatePhone } from './validation';

describe('validateName', () => {
  it.each(['Ana', 'José Ñúñez', "D'Angelo", 'María-José', 'Ma. Fernanda'])('acepta "%s"', (n) => {
    expect(validateName(n)).toBeNull();
  });

  it.each([
    ['', 'Escribe tu nombre.'],
    ['   ', 'Escribe tu nombre.'],
    ['A', 'al menos'],
    ['x'.repeat(61), 'máximo'],
    ['Ana123', 'Usa solo letras'],
    ['<script>', 'Usa solo letras'],
    ['=HYPERLINK("x")', 'Usa solo letras'],
    ['-Ana', 'Usa solo letras'],
  ])('rechaza "%s"', (n, msg) => {
    expect(validateName(n)).toContain(msg);
  });

  it('normaliza espacios', () => {
    expect(normalizeName('  Ana   María ')).toBe('Ana María');
  });
});

describe('normalizePhone', () => {
  it.each([
    ['3001234567', 'CO', '+573001234567'],
    ['300 123 4567', 'CO', '+573001234567'],
    ['300-123-4567', 'CO', '+573001234567'],
    ['+57 300 123 4567', 'CO', '+573001234567'],
    ['573001234567', 'CO', '+573001234567'],
    ['0057 3001234567', 'CO', '+573001234567'],
    ['912 345 678', 'PE', '+51912345678'],
    ['+44 7700 900123', 'OTHER', '+447700900123'],
  ])('%s (%s) → %s', (raw, cc, expected) => {
    expect(normalizePhone(raw, cc)).toBe(expected);
  });

  it.each([
    ['', 'CO'],
    ['123', 'CO'],
    ['6011234567', 'CO'], // fijo de Bogotá, no celular
    ['30012345678', 'CO'],
    ['+58 412 1234567', 'CO'], // indicativo distinto al país elegido
    ['abc', 'CO'],
    ['0123 4567', 'OTHER'],
    ['+12', 'OTHER'],
  ])('rechaza %s (%s)', (raw, cc) => {
    expect(normalizePhone(raw, cc)).toBeNull();
  });

  it('en "Otro país" interpreta los primeros dígitos como indicativo (límite conocido)', () => {
    // Sin el país no se puede saber si el número trae indicativo; se acepta cualquier E.164 válido.
    expect(normalizePhone('7700 900123', 'OTHER')).toBe('+7700900123');
  });
});

describe('validatePhone', () => {
  it('mensaje específico para Colombia', () => {
    expect(validatePhone('123', 'CO')).toContain('empiece por 3');
  });
  it('mensaje cuando está vacío', () => {
    expect(validatePhone('', 'CO')).toBe('Escribe tu número de celular.');
  });
  it('sin error para un número válido', () => {
    expect(validatePhone('3101234567', 'CO')).toBeNull();
  });
});
