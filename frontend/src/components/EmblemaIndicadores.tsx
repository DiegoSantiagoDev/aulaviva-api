/**
 * EmblemaIndicadores — barras e linha de tendência, original.
 * Usado ao lado da nota sobre indicadores agregados
 * na área do professor.
 *
 * Movimento padrão dos emblemas:
 *  - o traço se desenha sozinho (.draw-path / .in-view, 2,2 s)
 *  - o anel externo gira devagar (.anim-rotate-slow, 60 s)
 *  - o ponto de destaque "respira" (.anim-breathe, 5 s)
 */
interface EmblemaIndicadoresProps {
  className?: string;
  inView?: boolean;
}

const OURO = 'var(--av-ouro)';

export default function EmblemaIndicadores({ className, inView = true }: EmblemaIndicadoresProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* Anel externo tracejado, gira em torno do próprio centro */}
      <circle
        cx="60"
        cy="60"
        r="54"
        stroke={OURO}
        strokeWidth={0.8}
        strokeDasharray="2 5"
        opacity={inView ? 0.7 : 0}
        className="anim-rotate-slow"
        style={{
          transformBox: 'fill-box',
          transformOrigin: 'center',
          transition: 'opacity 1.5s ease 1s',
        }}
      />

      {/* Eixos, barras e linha de tendência, desenhados traço a traço */}
      <g className={inView ? 'draw-path in-view' : 'draw-path'}>
        <path d="M28 30 V90 H94" />
        <rect x="38" y="68" width="12" height="22" rx="2" />
        <rect x="58" y="54" width="12" height="36" rx="2" />
        <rect x="78" y="42" width="12" height="48" rx="2" />
        <path d="M36 58 L56 44 L72 48 L92 30" />
      </g>

      {/* Ponto de luz */}
      <circle
        cx="92"
        cy="30"
        r="3.2"
        fill={OURO}
        stroke="none"
        className="anim-breathe"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      />
    </svg>
  );
}
