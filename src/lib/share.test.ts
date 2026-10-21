import { describe, expect, it } from 'vitest';
import { getCharacter } from '../data/characters';
import { leadsToCsv, csvCell } from './csv';
import { shareMessage, shareUrl, whatsappUrl } from './share';

describe('compartir', () => {
  const c = getCharacter('piedad');

  it('el mensaje incluye el personaje y la invitación', () => {
    expect(shareMessage(c)).toContain('¡Descubrí mi personaje de ATRAPADOS!');
    expect(shareMessage(c)).toContain('Mi resultado fue: Enfermera Piedad.');
    expect(shareMessage(c)).toContain('¿Tú cuál serías?');
  });

  it('el enlace solo lleva el id del personaje', () => {
    const url = new URL(shareUrl(c));
    expect([...url.searchParams.keys()]).toEqual(['r']);
    expect(url.searchParams.get('r')).toBe('piedad');
  });

  it('WhatsApp recibe el texto codificado', () => {
    const url = whatsappUrl(c);
    expect(url.startsWith('https://wa.me/?text=')).toBe(true);
    const text = decodeURIComponent(url.split('text=')[1]!);
    expect(text).toContain('Enfermera Piedad');
    expect(url).not.toMatch(/[\s¿¡]/); // todo codificado
  });
});

describe('CSV', () => {
  it('protege contra fórmulas y escapa comillas', () => {
    expect(csvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
    expect(csvCell('+573001234567')).toBe(`"'+573001234567"`);
    expect(csvCell('Ana')).toBe('"Ana"');
    expect(csvCell(null)).toBe('""');
  });

  it('genera encabezados y filas con BOM', () => {
    const csv = leadsToCsv([
      {
        id: '1',
        name: 'José Ñúñez',
        phone: '+573001234567',
        preferred_character: 'doc',
        consent_given: true,
        consent_text_version: 'v1',
        consented_at: '2026-11-07T17:00:00Z',
        consent_revoked_at: null,
        created_at: '2026-11-07T17:00:00Z',
      },
    ]);
    expect(csv.startsWith('﻿"nombre"')).toBe(true);
    expect(csv).toContain('"José Ñúñez"');
    expect(csv).toContain('"Doc"');
    expect(csv.trim().split('\r\n')).toHaveLength(2);
  });
});
