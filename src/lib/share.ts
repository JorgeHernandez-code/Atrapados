import { siteUrl } from '../config/site';
import type { Character } from '../types/character';

/**
 * Enlace para compartir. Solo incluye el identificador del personaje (?r=),
 * nunca nombre, celular ni otros datos del participante.
 */
export function shareUrl(character: Character): string {
  // siteUrl() usa VITE_PUBLIC_SITE_URL o, si no existe, el origen actual del navegador.
  const url = new URL('/', siteUrl());
  url.searchParams.set('r', character.id);
  return url.toString();
}

export function shareMessage(character: Character): string {
  return `¡Descubrí mi personaje de ATRAPADOS!\nMi resultado fue: ${character.name}.\n¿Tú cuál serías? Haz el test:`;
}

/** URL de WhatsApp con el texto codificado de forma segura. */
export function whatsappUrl(character: Character): string {
  const text = `${shareMessage(character)} ${shareUrl(character)}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Continúa con el método alternativo.
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}
