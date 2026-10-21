import { useState } from 'react';
import { copyToClipboard, shareMessage, shareUrl, whatsappUrl } from '../lib/share';
import { track } from '../services/analytics';
import type { Character } from '../types/character';

interface ShareResultProps {
  character: Character;
}

type Status = { kind: 'idle' } | { kind: 'ok' | 'error'; message: string };

export function ShareResult({ character }: ShareResultProps) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [busyImage, setBusyImage] = useState(false);
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  const text = shareMessage(character);
  const url = shareUrl(character);

  const nativeShare = async () => {
    track('share_click', { character: character.id, channel: 'native' });
    try {
      await navigator.share({ title: 'ATRAPADOS · ¿Qué personaje eres?', text, url });
    } catch (e) {
      if ((e as DOMException)?.name !== 'AbortError') setStatus({ kind: 'error', message: 'No se pudo abrir el menú para compartir.' });
    }
  };

  const copy = async () => {
    track('share_click', { character: character.id, channel: 'copy' });
    const ok = await copyToClipboard(`${text} ${url}`);
    setStatus(ok ? { kind: 'ok', message: 'Texto copiado. Pégalo donde quieras.' } : { kind: 'error', message: 'No se pudo copiar. Mantén presionado el texto para copiarlo.' });
  };

  const image = async () => {
    track('share_click', { character: character.id, channel: 'image' });
    setBusyImage(true);
    try {
      const { createShareCard } = await import('../lib/shareCard');
      const blob = await createShareCard(character);
      const file = new File([blob], `atrapados-${character.id}.png`, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'ATRAPADOS', text: `${text} ${url}` });
          setStatus({ kind: 'idle' });
          return;
        } catch (e) {
          if ((e as DOMException)?.name === 'AbortError') return;
        }
      }
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(href), 4000);
      setStatus({ kind: 'ok', message: 'Tarjeta descargada. Compártela en tus historias.' });
    } catch {
      setStatus({ kind: 'error', message: 'No se pudo crear la tarjeta en este navegador.' });
    } finally {
      setBusyImage(false);
    }
  };

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {canNativeShare && (
          <button type="button" onClick={nativeShare} className="btn btn-primary sm:col-span-2">
            Compartir mi resultado
          </button>
        )}
        <a
          href={whatsappUrl(character)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('share_click', { character: character.id, channel: 'whatsapp' })}
          className={`btn ${canNativeShare ? 'btn-ghost' : 'btn-primary'}`}
        >
          WhatsApp
        </a>
        <button type="button" onClick={copy} className="btn btn-ghost">
          Copiar texto
        </button>
        <button type="button" onClick={image} disabled={busyImage} className="btn btn-ghost sm:col-span-2">
          {busyImage ? 'Creando tarjeta…' : 'Descargar tarjeta para redes'}
        </button>
      </div>
      <p role="status" aria-live="polite" className={`mt-3 min-h-5 text-sm ${status.kind === 'error' ? 'text-alert' : 'text-volt'}`}>
        {status.kind !== 'idle' ? status.message : ''}
      </p>
      <p className="text-xs text-ash">El mensaje solo incluye el nombre del personaje y el enlace al test. Ningún dato tuyo.</p>
    </div>
  );
}
