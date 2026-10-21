import { SITE, siteUrl } from '../config/site';
import type { Character } from '../types/character';

const W = 1080;
const H = 1350;
const INK = '#080808';
const VOLT = '#FFF52B';
const PAPER = '#FFFFFF';
const ASH = '#B8B8B8';

function fitFont(ctx: CanvasRenderingContext2D, text: string, family: string, maxWidth: number, maxSize: number, minSize = 40): number {
  let size = maxSize;
  do {
    ctx.font = `${size}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 4;
  } while (size > minSize);
  return minSize;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

/** Línea rasgada vertical (como el flyer). */
function tornStrip(ctx: CanvasRenderingContext2D, x: number, width: number, height: number, jitter = 34) {
  let seed = 11;
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  ctx.beginPath();
  ctx.moveTo(x, 0);
  for (let y = 0; y <= height; y += 26) ctx.lineTo(x + rand() * jitter - jitter / 2, y);
  for (let y = height; y >= 0; y -= 26) ctx.lineTo(x + width + rand() * jitter - jitter / 2, y);
  ctx.closePath();
  ctx.fill();
}

function grain(ctx: CanvasRenderingContext2D) {
  let seed = 5;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  ctx.save();
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = rand() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)';
    ctx.fillRect(rand() * W, rand() * H, 2, 2);
  }
  ctx.restore();
}

/** Dibuja la tarjeta del resultado (1080×1350) y la devuelve como PNG. */
export async function createShareCard(character: Character): Promise<Blob> {
  try {
    await Promise.all([document.fonts.load('120px Anton'), document.fonts.load('600 40px Poppins'), document.fonts.load('400 40px Poppins')]);
  } catch {
    // Si las fuentes no cargan se usan las alternativas del sistema.
  }

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas no disponible');

  const display = "Anton, Impact, 'Arial Narrow', sans-serif";
  const sans = "Poppins, system-ui, sans-serif";

  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = VOLT;
  tornStrip(ctx, W - 250, 150, H);
  ctx.fillStyle = INK;
  tornStrip(ctx, W - 178, 6, H, 8);

  const pad = 84;
  const maxText = W - pad - 300;

  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = ASH;
  ctx.font = `600 30px ${sans}`;
  ctx.fillText('MI PERSONAJE EN', pad, 150);

  ctx.fillStyle = PAPER;
  ctx.font = `130px ${display}`;
  ctx.fillText(SITE.playTitle, pad, 280);

  // Nombre sobre una etiqueta amarilla
  const name = character.name.toUpperCase();
  const size = fitFont(ctx, name, display, maxText - 60, 200, 64);
  ctx.font = `${size}px ${display}`;
  const nameWidth = ctx.measureText(name).width;
  ctx.save();
  ctx.translate(pad - 20, 540);
  ctx.rotate(-0.03);
  ctx.fillStyle = PAPER;
  ctx.fillRect(10, -size * 0.92 + 10, nameWidth + 40, size * 1.08);
  ctx.fillStyle = VOLT;
  ctx.fillRect(0, -size * 0.92, nameWidth + 40, size * 1.08);
  ctx.fillStyle = INK;
  ctx.fillText(name, 20, 0);
  ctx.restore();

  ctx.fillStyle = VOLT;
  ctx.font = `600 40px ${sans}`;
  ctx.fillText(character.archetype, pad, 650);

  ctx.fillStyle = PAPER;
  ctx.font = `400 30px ${sans}`;
  ctx.fillText(character.traits.slice(0, 3).join('  ·  '), pad, 710, maxText);

  ctx.fillStyle = PAPER;
  ctx.font = `600 46px ${sans}`;
  const lines = wrap(ctx, `“${character.quote}”`, maxText);
  lines.slice(0, 4).forEach((l, i) => ctx.fillText(l, pad, 860 + i * 62));

  ctx.fillStyle = ASH;
  ctx.font = `400 24px ${sans}`;
  ctx.fillText('Frase creada para el test, no es un diálogo de la obra.', pad, 860 + Math.min(lines.length, 4) * 62 + 18);

  ctx.fillStyle = PAPER;
  ctx.fillRect(pad, H - 230, 80, 6);
  ctx.font = `600 38px ${sans}`;
  ctx.fillText('¿Tú cuál serías?', pad, H - 160);
  ctx.fillStyle = VOLT;
  ctx.font = `400 32px ${sans}`;
  const host = (siteUrl() || '').replace(/^https?:\/\//, '');
  ctx.fillText(host ? `Haz el test en ${host}` : 'Haz el test', pad, H - 110, maxText);

  grain(ctx);

  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo crear la imagen'))), 'image/png');
  });
}
