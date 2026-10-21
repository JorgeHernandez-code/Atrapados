import { getCharacter, isCharacterId } from '../data/characters';
import type { LeadRow } from '../types/lead';

/**
 * Celda CSV segura: comillas escapadas y protección contra inyección de fórmulas
 * (=, +, -, @, tab, retorno) en hojas de cálculo. Los teléfonos E.164 empiezan por "+",
 * así que también se protegen y se abren como texto.
 */
export function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

const HEADERS = ['nombre', 'celular', 'personaje', 'consentimiento', 'version_texto', 'fecha_autorizacion', 'revocado_el', 'fecha_registro'];

export function leadsToCsv(rows: LeadRow[]): string {
  const lines = [HEADERS.map(csvCell).join(',')];
  for (const r of rows) {
    lines.push(
      [
        r.name,
        r.phone,
        isCharacterId(r.preferred_character) ? getCharacter(r.preferred_character).name : '',
        r.consent_given ? 'sí' : 'no',
        r.consent_text_version,
        r.consented_at,
        r.consent_revoked_at ?? '',
        r.created_at,
      ]
        .map(csvCell)
        .join(','),
    );
  }
  // BOM para que Excel reconozca UTF-8 (tildes y ñ).
  return `﻿${lines.join('\r\n')}\r\n`;
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 4000);
}
