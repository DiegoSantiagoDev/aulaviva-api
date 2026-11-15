/**
 * EmblemaPerdido — bússola original usada na
 * página 404 ("caminho não encontrado") e na busca sem resultado da biblioteca.
 *
 * Movimento padrão dos emblemas:
 *  - o traço se desenha sozinho (.draw-path / .in-view, 2,2 s)
 *  - o anel externo gira devagar (.anim-rotate-slow, 60 s)
 *  - o ponto central "respira" (.anim-breathe, 5 s)
 */
interface EmblemaPerdidoProps {
  className?: string;
  inView?: boolean;
}

const OURO = 'var(--av-ouro, #c9a227)';

export default function EmblemaPerdido({ className, inView = true }: EmblemaPerdidoProps) {
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

      {/* Bússola desenhada traço a traço */}
      <g className={inView ? 'draw-path in-view' : 'draw-path'}>
        <circle cx="60" cy="60" r="36" />
        <path d="M60 18 V26 M60 94 V102 M18 60 H26 M94 60 H102" />
        <g transform="rotate(38 60 60)">
          <path d="M60 32 L68 60 L60 88 L52 60 Z" />
          <path d="M52 60 H68" />
        </g>
      </g>

      {/* Ponto central */}
      <circle
        cx="60"
        cy="60"
        r="3.2"
        fill={OURO}
        stroke="none"
        className="anim-breathe"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      />
    </svg>
  );
}
