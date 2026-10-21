interface TornEdgeProps {
  /** Lado del bloque donde aparece el rasgado. */
  side?: 'top' | 'bottom';
  /** Clase de color de relleno (text-*), se usa como currentColor. */
  className?: string;
  /** Semilla para variar el dibujo de forma reproducible. */
  seed?: number;
  height?: number;
}

/** Genera una línea rasgada irregular pero estable (misma semilla, mismo dibujo). */
function tornPath(seed: number, height: number): string {
  let s = seed * 9301 + 49297;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const points: string[] = [];
  let x = 0;
  while (x < 100) {
    const y = height * (0.25 + rand() * 0.75);
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    x += 0.8 + rand() * 2.6;
  }
  points.push(`100,${(height * 0.6).toFixed(2)}`);
  return `M0,${height} L${points.join(' L')} L100,${height} Z`;
}

/** Borde de papel rasgado decorativo (inspirado en el flyer). */
export function TornEdge({ side = 'bottom', className = 'text-ink', seed = 1, height = 14 }: TornEdgeProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none block w-full ${className}`}
      style={{ height: `${height}px`, transform: side === 'top' ? 'none' : 'scaleY(-1)' }}
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
    >
      <path d={tornPath(seed, height)} fill="currentColor" />
    </svg>
  );
}
